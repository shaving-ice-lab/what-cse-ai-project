"""Celery应用配置"""

from celery import Celery
from celery.schedules import crontab

from ..config import config

# 创建Celery应用
celery_config = config.celery

celery_app = Celery(
    "cse_crawler",
    broker=celery_config.get("broker_url", "redis://localhost:6379/1"),
    backend=celery_config.get("result_backend", "redis://localhost:6379/2"),
    include=["src.tasks.spider_tasks"],
)

# 配置
celery_app.conf.update(
    task_serializer=celery_config.get("task_serializer", "json"),
    result_serializer=celery_config.get("result_serializer", "json"),
    accept_content=celery_config.get("accept_content", ["json"]),
    timezone=celery_config.get("timezone", "Asia/Shanghai"),
    enable_utc=celery_config.get("enable_utc", False),
    task_track_started=True,
    task_time_limit=3600,  # 1小时超时
    worker_prefetch_multiplier=1,
    worker_concurrency=4,
)

# 任务路由
celery_app.conf.task_routes = {
    "src.tasks.spider_tasks.task_list_discovery": {"queue": "spider"},
    "src.tasks.spider_tasks.task_list_monitor": {"queue": "spider"},
    "src.tasks.spider_tasks.task_crawl_announcement": {"queue": "spider"},
    "src.tasks.spider_tasks.task_parse_positions": {"queue": "ai"},
}

# 定时任务
celery_app.conf.beat_schedule = {
    # 每2小时运行列表页监控（高优先级）
    "monitor-high-priority-lists": {
        "task": "src.tasks.spider_tasks.task_list_monitor_scheduled",
        "schedule": crontab(minute=0, hour="*/2"),
        "args": ("high",),
    },
    # 每6小时运行列表页监控（中优先级）
    "monitor-medium-priority-lists": {
        "task": "src.tasks.spider_tasks.task_list_monitor_scheduled",
        "schedule": crontab(minute=0, hour="*/6"),
        "args": ("medium",),
    },
    # 每天运行列表页监控（低优先级）
    "monitor-low-priority-lists": {
        "task": "src.tasks.spider_tasks.task_list_monitor_scheduled",
        "schedule": crontab(minute=0, hour=8),
        "args": ("low",),
    },
}
