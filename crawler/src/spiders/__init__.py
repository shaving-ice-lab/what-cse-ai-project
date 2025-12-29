"""爬虫模块"""

from .base import BaseSpider
from .list_discovery_spider import ListDiscoverySpider
from .list_monitor_spider import ListMonitorSpider
from .announcement_spider import AnnouncementSpider
from .position_spider import PositionSpider

__all__ = [
    "BaseSpider",
    "ListDiscoverySpider",
    "ListMonitorSpider",
    "AnnouncementSpider",
    "PositionSpider",
]
