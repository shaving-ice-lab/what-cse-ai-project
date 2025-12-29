"""Celery任务模块"""

from .celery_app import celery_app
from .spider_tasks import (
    task_list_discovery,
    task_list_monitor,
    task_crawl_announcement,
    task_parse_positions,
)

__all__ = [
    "celery_app",
    "task_list_discovery",
    "task_list_monitor",
    "task_crawl_announcement",
    "task_parse_positions",
]
