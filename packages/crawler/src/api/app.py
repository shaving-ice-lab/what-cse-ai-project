"""FastAPI应用"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger

from ..config import config
from ..database import (
    AnnouncementRepository,
    PositionRepository,
    ListPageRepository,
    CrawlTaskRepository,
    init_db,
)
from ..tasks import (
    task_list_discovery,
    task_list_monitor,
    task_crawl_announcement,
    task_parse_positions,
)


# Pydantic模型
class ListPageCreate(BaseModel):
    url: str
    source_name: Optional[str] = None
    category: Optional[str] = None
    article_selector: Optional[str] = None
    pagination_pattern: Optional[str] = None
    crawl_frequency: str = "daily"


class TriggerSpiderRequest(BaseModel):
    spider_type: str
    params: Dict[str, Any] = {}


class ApiResponse(BaseModel):
    success: bool
    data: Any = None
    message: str = ""


# 创建应用
def create_app() -> FastAPI:
    """创建FastAPI应用"""

    app = FastAPI(
        title="公考数据采集系统API",
        description="爬虫管理和数据查询API",
        version="1.0.0",
    )

    # CORS配置
    api_config = config.get("api", {})
    app.add_middleware(
        CORSMiddleware,
        allow_origins=api_config.get("cors_origins", ["*"]),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # 初始化数据库
    @app.on_event("startup")
    async def startup():
        init_db()
        logger.info("API服务启动")

    return app


app = create_app()


# API Key验证
async def verify_api_key(x_api_key: str = Header(None)):
    """验证API Key"""
    api_key = config.get("api.api_key")
    if api_key and x_api_key != api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return True


# 健康检查
@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


# 爬虫任务接口
@app.post("/api/v1/crawlers/trigger", response_model=ApiResponse)
async def trigger_spider(
    request: TriggerSpiderRequest, _: bool = Depends(verify_api_key)
):
    """手动触发爬虫任务"""
    try:
        spider_type = request.spider_type
        params = request.params

        if spider_type == "list_discovery":
            urls = params.get("urls", [])
            if not urls:
                raise HTTPException(400, "urls参数不能为空")
            task = task_list_discovery.delay(urls)

        elif spider_type == "list_monitor":
            list_page_ids = params.get("list_page_ids")
            task = task_list_monitor.delay(list_page_ids)

        elif spider_type == "announcement":
            article_data = params.get("article")
            if not article_data:
                raise HTTPException(400, "article参数不能为空")
            task = task_crawl_announcement.delay(article_data)

        elif spider_type == "positions":
            announcement_id = params.get("announcement_id")
            if not announcement_id:
                raise HTTPException(400, "announcement_id参数不能为空")
            task = task_parse_positions.delay(announcement_id)

        else:
            raise HTTPException(400, f"未知的爬虫类型: {spider_type}")

        return ApiResponse(
            success=True, data={"task_id": task.id}, message="任务已提交"
        )

    except Exception as e:
        logger.error(f"触发爬虫失败: {e}")
        raise HTTPException(500, str(e))


@app.get("/api/v1/crawlers/status/{task_id}", response_model=ApiResponse)
async def get_task_status(task_id: str, _: bool = Depends(verify_api_key)):
    """查询任务状态"""
    repo = CrawlTaskRepository()
    task = repo.get_by_task_id(task_id)

    if not task:
        raise HTTPException(404, "任务不存在")

    return ApiResponse(
        success=True,
        data={
            "task_id": task.task_id,
            "type": task.task_type,
            "status": task.status,
            "progress": task.progress,
            "result": task.result,
            "error": task.error_message,
            "created_at": task.created_at.isoformat() if task.created_at else None,
            "started_at": task.started_at.isoformat() if task.started_at else None,
            "completed_at": (
                task.completed_at.isoformat() if task.completed_at else None
            ),
        },
    )


@app.get("/api/v1/crawlers/tasks", response_model=ApiResponse)
async def list_tasks(
    limit: int = Query(50, ge=1, le=100), _: bool = Depends(verify_api_key)
):
    """获取任务列表"""
    repo = CrawlTaskRepository()
    tasks = repo.get_recent(limit)

    return ApiResponse(
        success=True,
        data=[
            {
                "task_id": t.task_id,
                "type": t.task_type,
                "name": t.task_name,
                "status": t.status,
                "progress": t.progress,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in tasks
        ],
    )


# 列表页管理接口
@app.get("/api/v1/list-pages", response_model=ApiResponse)
async def list_pages(
    status: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: bool = Depends(verify_api_key),
):
    """获取列表页列表"""
    repo = ListPageRepository()

    if status:
        pages = [p for p in repo.get_all(limit, offset) if p.status == status]
    else:
        pages = repo.get_all(limit, offset)

    return ApiResponse(
        success=True,
        data=[
            {
                "id": p.id,
                "url": p.url,
                "source_name": p.source_name,
                "category": p.category,
                "crawl_frequency": p.crawl_frequency,
                "status": p.status,
                "article_count": p.article_count,
                "last_crawl_time": (
                    p.last_crawl_time.isoformat() if p.last_crawl_time else None
                ),
            }
            for p in pages
        ],
    )


@app.post("/api/v1/list-pages", response_model=ApiResponse)
async def create_list_page(data: ListPageCreate, _: bool = Depends(verify_api_key)):
    """添加列表页"""
    repo = ListPageRepository()

    if repo.exists(data.url):
        raise HTTPException(400, "列表页已存在")

    page = repo.create(data.dict())

    return ApiResponse(success=True, data={"id": page.id}, message="列表页添加成功")


@app.put("/api/v1/list-pages/{page_id}/status", response_model=ApiResponse)
async def update_list_page_status(
    page_id: int, status: str = Query(...), _: bool = Depends(verify_api_key)
):
    """更新列表页状态"""
    repo = ListPageRepository()
    page = repo.update(page_id, {"status": status})

    if not page:
        raise HTTPException(404, "列表页不存在")

    return ApiResponse(success=True, message="状态更新成功")


# 统计接口
@app.get("/api/v1/stats/overview", response_model=ApiResponse)
async def get_stats_overview(_: bool = Depends(verify_api_key)):
    """获取概览统计"""
    announcement_repo = AnnouncementRepository()
    position_repo = PositionRepository()
    list_page_repo = ListPageRepository()
    task_repo = CrawlTaskRepository()

    return ApiResponse(
        success=True,
        data={
            "announcements": {
                "total": len(announcement_repo.get_all(10000)),
                "pending": announcement_repo.count_by_status("pending"),
                "parsed": announcement_repo.count_by_status("parsed"),
            },
            "positions": {
                "total": len(position_repo.get_all(100000)),
                "pending": position_repo.count_by_status("pending"),
                "published": position_repo.count_by_status("published"),
            },
            "list_pages": {
                "total": len(list_page_repo.get_all(1000)),
                "active": len(list_page_repo.get_active()),
            },
            "tasks": {
                "running": len(task_repo.get_running()),
            },
        },
    )


# 公告接口
@app.get("/api/v1/announcements", response_model=ApiResponse)
async def list_announcements(
    announcement_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: bool = Depends(verify_api_key),
):
    """获取公告列表"""
    repo = AnnouncementRepository()

    if announcement_type:
        announcements = repo.get_by_type(announcement_type, limit, offset)
    else:
        announcements = repo.get_all(limit, offset)

    return ApiResponse(
        success=True,
        data=[
            {
                "id": a.id,
                "title": a.title,
                "url": a.url,
                "announcement_type": a.announcement_type,
                "publish_date": a.publish_date.isoformat() if a.publish_date else None,
                "source_name": a.source_name,
                "status": a.status,
                "parse_confidence": a.parse_confidence,
            }
            for a in announcements
        ],
    )


# 职位接口
@app.get("/api/v1/positions", response_model=ApiResponse)
async def list_positions(
    province: Optional[str] = None,
    education: Optional[str] = None,
    exam_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: bool = Depends(verify_api_key),
):
    """获取职位列表"""
    repo = PositionRepository()
    positions = repo.search(province, education, exam_type, limit, offset)

    return ApiResponse(
        success=True,
        data=[
            {
                "id": p.id,
                "position_name": p.position_name,
                "department_name": p.department_name,
                "position_code": p.position_code,
                "recruit_count": p.recruit_count,
                "work_location": p.work_location,
                "education_min": p.education_min,
                "parse_confidence": p.parse_confidence,
                "status": p.status,
            }
            for p in positions
        ],
    )


@app.get("/api/v1/positions/pending-review", response_model=ApiResponse)
async def get_pending_review_positions(
    limit: int = Query(50, ge=1, le=100), _: bool = Depends(verify_api_key)
):
    """获取待审核职位"""
    repo = PositionRepository()
    positions = repo.get_pending_review(limit)

    return ApiResponse(
        success=True,
        data=[
            {
                "id": p.id,
                "position_name": p.position_name,
                "department_name": p.department_name,
                "parse_confidence": p.parse_confidence,
                "status": p.status,
            }
            for p in positions
        ],
    )


def run_api():
    """运行API服务"""
    import uvicorn

    api_config = config.get("api", {})
    host = api_config.get("host", "0.0.0.0")
    port = api_config.get("port", 8001)
    debug = api_config.get("debug", False)

    uvicorn.run(app, host=host, port=port, reload=debug)


if __name__ == "__main__":
    run_api()
