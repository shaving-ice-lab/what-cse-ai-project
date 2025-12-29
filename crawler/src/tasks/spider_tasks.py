"""爬虫任务定义"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from celery import shared_task
from loguru import logger

from ..spiders import (
    ListDiscoverySpider,
    ListMonitorSpider,
    AnnouncementSpider,
    PositionSpider,
)
from ..pipelines import DataPipeline, DedupPipeline
from ..database import (
    CrawlTaskRepository,
    ListPageRepository,
    AnnouncementRepository,
)


@shared_task(bind=True, name="src.tasks.spider_tasks.task_list_discovery")
def task_list_discovery(self, aggregator_urls: List[str]) -> Dict[str, Any]:
    """列表页发现任务

    从聚合平台发现新的列表页
    """
    task_id = self.request.id or str(uuid.uuid4())
    task_repo = CrawlTaskRepository()

    # 记录任务
    task_repo.create(
        {
            "task_id": task_id,
            "task_type": "list_discovery",
            "task_name": "列表页发现",
            "task_params": {"urls": aggregator_urls},
            "status": "running",
            "started_at": datetime.now(),
        }
    )

    try:
        spider = ListDiscoverySpider(aggregator_urls)
        results = spider.run()
        spider.close()

        # 处理发现的列表页
        pipeline = DataPipeline()
        saved_count = 0

        for list_data in results:
            if pipeline.process_list_page(list_data):
                saved_count += 1

        result = {
            "discovered": len(results),
            "saved": saved_count,
        }

        task_repo.update_status(task_id, "completed", progress=100, result=result)
        logger.info(f"列表页发现任务完成: {result}")

        return result

    except Exception as e:
        logger.error(f"列表页发现任务失败: {e}")
        task_repo.update_status(task_id, "failed", error=str(e))
        raise


@shared_task(bind=True, name="src.tasks.spider_tasks.task_list_monitor")
def task_list_monitor(
    self, list_page_ids: Optional[List[int]] = None
) -> Dict[str, Any]:
    """列表页监控任务

    爬取指定列表页，发现新文章
    """
    task_id = self.request.id or str(uuid.uuid4())
    task_repo = CrawlTaskRepository()
    list_page_repo = ListPageRepository()

    # 获取要监控的列表页
    if list_page_ids:
        list_pages = [list_page_repo.get_by_id(id) for id in list_page_ids]
        list_pages = [lp for lp in list_pages if lp]
    else:
        list_pages = list_page_repo.get_active()

    if not list_pages:
        return {"message": "没有需要监控的列表页"}

    # 记录任务
    task_repo.create(
        {
            "task_id": task_id,
            "task_type": "list_monitor",
            "task_name": f"列表页监控 ({len(list_pages)}个)",
            "task_params": {"list_page_ids": [lp.id for lp in list_pages]},
            "status": "running",
            "started_at": datetime.now(),
        }
    )

    try:
        # 获取已爬取URL
        dedup = DedupPipeline()

        list_page_data = [
            {
                "id": lp.id,
                "url": lp.url,
                "source_name": lp.source_name,
                "article_selector": lp.article_selector,
                "pagination_pattern": lp.pagination_pattern,
                "category": lp.category,
                "status": lp.status,
            }
            for lp in list_pages
        ]

        spider = ListMonitorSpider(
            list_pages=list_page_data,
            crawled_urls=set(),
        )

        results = spider.run()
        spider.close()

        # 过滤新文章
        new_articles = dedup.filter_new_urls([r["url"] for r in results])
        new_results = [r for r in results if r["url"] in new_articles]

        # 标记已爬取
        for article in new_results:
            dedup.mark_url_crawled(article["url"])

        # 触发公告爬取任务
        for article in new_results[:50]:  # 限制数量
            task_crawl_announcement.delay(article)

        result = {
            "total_found": len(results),
            "new_articles": len(new_results),
            "triggered_crawls": min(len(new_results), 50),
        }

        task_repo.update_status(task_id, "completed", progress=100, result=result)
        logger.info(f"列表页监控任务完成: {result}")

        return result

    except Exception as e:
        logger.error(f"列表页监控任务失败: {e}")
        task_repo.update_status(task_id, "failed", error=str(e))
        raise


@shared_task(bind=True, name="src.tasks.spider_tasks.task_list_monitor_scheduled")
def task_list_monitor_scheduled(self, frequency: str = "daily") -> Dict[str, Any]:
    """定时列表页监控任务"""
    list_page_repo = ListPageRepository()

    # 根据频率获取列表页
    frequency_map = {
        "high": "hourly",
        "medium": "daily",
        "low": "weekly",
    }

    crawl_freq = frequency_map.get(frequency, frequency)
    list_pages = list_page_repo.get_by_frequency(crawl_freq)

    if not list_pages:
        return {"message": f"没有{frequency}优先级的列表页"}

    # 调用监控任务
    return task_list_monitor.delay([lp.id for lp in list_pages])


@shared_task(bind=True, name="src.tasks.spider_tasks.task_crawl_announcement")
def task_crawl_announcement(self, article_data: Dict[str, Any]) -> Dict[str, Any]:
    """公告爬取任务

    爬取单个公告页面
    """
    task_id = self.request.id or str(uuid.uuid4())

    try:
        spider = AnnouncementSpider([article_data])
        results = spider.run()
        spider.close()

        if not results:
            return {"status": "no_data"}

        # 入库
        pipeline = DataPipeline()
        announcement_id = None

        for announcement_data in results:
            announcement_id = pipeline.process_announcement(announcement_data)

            if announcement_id:
                # 触发职位提取任务
                task_parse_positions.delay(announcement_id)

        return {
            "status": "success",
            "announcement_id": announcement_id,
        }

    except Exception as e:
        logger.error(f"公告爬取失败: {e}")
        return {"status": "failed", "error": str(e)}


@shared_task(bind=True, name="src.tasks.spider_tasks.task_parse_positions")
def task_parse_positions(self, announcement_id: int) -> Dict[str, Any]:
    """职位解析任务

    从公告中提取职位信息
    """
    task_id = self.request.id or str(uuid.uuid4())
    announcement_repo = AnnouncementRepository()

    try:
        announcement = announcement_repo.get_by_id(announcement_id)
        if not announcement:
            return {"status": "not_found"}

        pipeline = DataPipeline()

        # 提取职位
        count = pipeline.process_positions_from_announcement(
            announcement_id=announcement_id,
            content=announcement.content or "",
            attachments=announcement.attachments or [],
        )

        return {
            "status": "success",
            "positions_count": count,
        }

    except Exception as e:
        logger.error(f"职位解析失败: {e}")
        return {"status": "failed", "error": str(e)}


@shared_task(name="src.tasks.spider_tasks.task_manual_trigger")
def task_manual_trigger(spider_type: str, params: Dict[str, Any]) -> str:
    """手动触发爬虫任务"""
    if spider_type == "list_discovery":
        task = task_list_discovery.delay(params.get("urls", []))
    elif spider_type == "list_monitor":
        task = task_list_monitor.delay(params.get("list_page_ids"))
    elif spider_type == "announcement":
        task = task_crawl_announcement.delay(params)
    elif spider_type == "positions":
        task = task_parse_positions.delay(params.get("announcement_id"))
    else:
        raise ValueError(f"未知的爬虫类型: {spider_type}")

    return task.id
