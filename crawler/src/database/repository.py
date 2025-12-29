"""数据访问仓库"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, or_, desc
from sqlalchemy.orm import Session
from loguru import logger

from .models import Announcement, Position, ListPage, CrawlTask
from .session import session_scope


class BaseRepository:
    """基础仓库类"""

    model = None

    def __init__(self, session: Optional[Session] = None):
        self._session = session

    @property
    def session(self) -> Session:
        if self._session:
            return self._session
        from .session import get_session

        return get_session()

    def get_by_id(self, id: int) -> Optional[Any]:
        return self.session.query(self.model).filter(self.model.id == id).first()

    def get_all(self, limit: int = 100, offset: int = 0) -> List[Any]:
        return self.session.query(self.model).limit(limit).offset(offset).all()

    def create(self, data: Dict[str, Any]) -> Any:
        instance = self.model(**data)
        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        return instance

    def update(self, id: int, data: Dict[str, Any]) -> Optional[Any]:
        instance = self.get_by_id(id)
        if instance:
            for key, value in data.items():
                setattr(instance, key, value)
            self.session.commit()
            self.session.refresh(instance)
        return instance

    def delete(self, id: int) -> bool:
        instance = self.get_by_id(id)
        if instance:
            self.session.delete(instance)
            self.session.commit()
            return True
        return False


class AnnouncementRepository(BaseRepository):
    """公告仓库"""

    model = Announcement

    def get_by_url(self, url: str) -> Optional[Announcement]:
        return self.session.query(Announcement).filter(Announcement.url == url).first()

    def get_by_content_hash(self, hash: str) -> Optional[Announcement]:
        return (
            self.session.query(Announcement)
            .filter(Announcement.content_hash == hash)
            .first()
        )

    def exists(self, url: str) -> bool:
        return self.get_by_url(url) is not None

    def get_by_type(
        self, announcement_type: str, limit: int = 100, offset: int = 0
    ) -> List[Announcement]:
        return (
            self.session.query(Announcement)
            .filter(Announcement.announcement_type == announcement_type)
            .order_by(desc(Announcement.publish_date))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def get_pending(self, limit: int = 100) -> List[Announcement]:
        return (
            self.session.query(Announcement)
            .filter(Announcement.status == "pending")
            .order_by(Announcement.created_at)
            .limit(limit)
            .all()
        )

    def get_by_date_range(
        self, start_date: datetime, end_date: datetime, limit: int = 100
    ) -> List[Announcement]:
        return (
            self.session.query(Announcement)
            .filter(
                and_(
                    Announcement.publish_date >= start_date,
                    Announcement.publish_date <= end_date,
                )
            )
            .order_by(desc(Announcement.publish_date))
            .limit(limit)
            .all()
        )

    def update_status(self, id: int, status: str) -> Optional[Announcement]:
        return self.update(id, {"status": status})

    def count_by_status(self, status: str) -> int:
        return (
            self.session.query(Announcement)
            .filter(Announcement.status == status)
            .count()
        )


class PositionRepository(BaseRepository):
    """职位仓库"""

    model = Position

    def get_by_position_code(self, code: str) -> Optional[Position]:
        return (
            self.session.query(Position).filter(Position.position_code == code).first()
        )

    def exists_by_code(self, code: str) -> bool:
        return self.get_by_position_code(code) is not None

    def get_by_announcement(self, announcement_id: int) -> List[Position]:
        return (
            self.session.query(Position)
            .filter(Position.announcement_id == announcement_id)
            .all()
        )

    def get_pending_review(self, limit: int = 100) -> List[Position]:
        return (
            self.session.query(Position)
            .filter(and_(Position.status == "pending", Position.parse_confidence < 85))
            .order_by(Position.parse_confidence)
            .limit(limit)
            .all()
        )

    def search(
        self,
        province: Optional[str] = None,
        education: Optional[str] = None,
        exam_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Position]:
        query = self.session.query(Position)

        if province:
            query = query.filter(Position.work_location_province == province)
        if education:
            query = query.filter(Position.education_min == education)
        if exam_type:
            query = query.filter(Position.exam_type == exam_type)

        return query.limit(limit).offset(offset).all()

    def bulk_create(self, positions: List[Dict[str, Any]]) -> int:
        created = 0
        for pos_data in positions:
            try:
                # 检查是否已存在
                code = pos_data.get("position_code")
                if code and self.exists_by_code(code):
                    continue

                position = Position(**pos_data)
                self.session.add(position)
                created += 1
            except Exception as e:
                logger.error(f"创建职位失败: {e}")

        self.session.commit()
        return created

    def count_by_status(self, status: str) -> int:
        return self.session.query(Position).filter(Position.status == status).count()


class ListPageRepository(BaseRepository):
    """列表页仓库"""

    model = ListPage

    def get_by_url(self, url: str) -> Optional[ListPage]:
        return self.session.query(ListPage).filter(ListPage.url == url).first()

    def exists(self, url: str) -> bool:
        return self.get_by_url(url) is not None

    def get_active(self) -> List[ListPage]:
        return (
            self.session.query(ListPage)
            .filter(ListPage.status == "active")
            .order_by(ListPage.priority)
            .all()
        )

    def get_by_frequency(self, frequency: str) -> List[ListPage]:
        return (
            self.session.query(ListPage)
            .filter(
                and_(ListPage.status == "active", ListPage.crawl_frequency == frequency)
            )
            .all()
        )

    def update_crawl_status(
        self, id: int, status: str, article_count: int = 0
    ) -> Optional[ListPage]:
        return self.update(
            id,
            {
                "last_crawl_time": datetime.now(),
                "last_crawl_status": status,
                "article_count": (
                    ListPage.article_count + article_count
                    if status == "success"
                    else ListPage.article_count
                ),
                "error_count": (
                    ListPage.error_count + 1
                    if status == "error"
                    else ListPage.error_count
                ),
            },
        )

    def increment_article_count(self, id: int, count: int) -> None:
        list_page = self.get_by_id(id)
        if list_page:
            list_page.article_count += count
            list_page.last_crawl_time = datetime.now()
            list_page.last_crawl_status = "success"
            self.session.commit()


class CrawlTaskRepository(BaseRepository):
    """爬虫任务仓库"""

    model = CrawlTask

    def get_by_task_id(self, task_id: str) -> Optional[CrawlTask]:
        return (
            self.session.query(CrawlTask).filter(CrawlTask.task_id == task_id).first()
        )

    def get_running(self) -> List[CrawlTask]:
        return self.session.query(CrawlTask).filter(CrawlTask.status == "running").all()

    def get_recent(self, limit: int = 50) -> List[CrawlTask]:
        return (
            self.session.query(CrawlTask)
            .order_by(desc(CrawlTask.created_at))
            .limit(limit)
            .all()
        )

    def update_status(
        self,
        task_id: str,
        status: str,
        progress: float = None,
        result: Dict = None,
        error: str = None,
    ) -> Optional[CrawlTask]:
        task = self.get_by_task_id(task_id)
        if task:
            task.status = status
            if progress is not None:
                task.progress = progress
            if result is not None:
                task.result = result
            if error is not None:
                task.error_message = error

            if status == "running" and not task.started_at:
                task.started_at = datetime.now()
            elif status in ["completed", "failed"]:
                task.completed_at = datetime.now()

            self.session.commit()
            self.session.refresh(task)
        return task
