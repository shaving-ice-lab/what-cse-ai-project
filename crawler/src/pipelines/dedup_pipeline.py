"""去重Pipeline

基于Redis的URL去重
"""

import hashlib
from typing import List, Optional, Set

from loguru import logger

try:
    import redis
except ImportError:
    redis = None

from ..config import config


class DedupPipeline:
    """去重Pipeline

    功能：
    - URL去重
    - 内容哈希去重
    - Redis集合存储
    """

    CRAWLED_URLS_KEY = "cse:crawler:crawled_urls"
    CONTENT_HASHES_KEY = "cse:crawler:content_hashes"

    def __init__(self):
        self.redis_client = None
        self._local_cache: Set[str] = set()

        self._init_redis()

    def _init_redis(self):
        """初始化Redis连接"""
        if redis is None:
            logger.warning("Redis未安装，使用本地缓存")
            return

        redis_config = config.database.get("redis", {})

        try:
            self.redis_client = redis.Redis(
                host=redis_config.get("host", "localhost"),
                port=redis_config.get("port", 6379),
                password=redis_config.get("password") or None,
                db=redis_config.get("db", 0),
                decode_responses=redis_config.get("decode_responses", True),
            )
            # 测试连接
            self.redis_client.ping()
            logger.info("Redis连接成功")
        except Exception as e:
            logger.warning(f"Redis连接失败，使用本地缓存: {e}")
            self.redis_client = None

    def is_url_crawled(self, url: str) -> bool:
        """检查URL是否已爬取"""
        url_hash = self._hash(url)

        if self.redis_client:
            return self.redis_client.sismember(self.CRAWLED_URLS_KEY, url_hash)

        return url_hash in self._local_cache

    def mark_url_crawled(self, url: str) -> None:
        """标记URL已爬取"""
        url_hash = self._hash(url)

        if self.redis_client:
            self.redis_client.sadd(self.CRAWLED_URLS_KEY, url_hash)
        else:
            self._local_cache.add(url_hash)

    def is_content_duplicate(self, content: str) -> bool:
        """检查内容是否重复"""
        content_hash = self._hash(content)

        if self.redis_client:
            return self.redis_client.sismember(self.CONTENT_HASHES_KEY, content_hash)

        return content_hash in self._local_cache

    def mark_content_hash(self, content: str) -> str:
        """标记内容哈希，返回哈希值"""
        content_hash = self._hash(content)

        if self.redis_client:
            self.redis_client.sadd(self.CONTENT_HASHES_KEY, content_hash)
        else:
            self._local_cache.add(content_hash)

        return content_hash

    def filter_new_urls(self, urls: List[str]) -> List[str]:
        """过滤出未爬取的URL"""
        if self.redis_client:
            # 批量检查
            pipe = self.redis_client.pipeline()
            for url in urls:
                pipe.sismember(self.CRAWLED_URLS_KEY, self._hash(url))
            results = pipe.execute()

            return [url for url, exists in zip(urls, results) if not exists]

        return [url for url in urls if self._hash(url) not in self._local_cache]

    def get_crawled_count(self) -> int:
        """获取已爬取URL数量"""
        if self.redis_client:
            return self.redis_client.scard(self.CRAWLED_URLS_KEY)
        return len(self._local_cache)

    def clear_cache(self) -> None:
        """清空缓存"""
        if self.redis_client:
            self.redis_client.delete(self.CRAWLED_URLS_KEY)
            self.redis_client.delete(self.CONTENT_HASHES_KEY)
        self._local_cache.clear()
        logger.info("去重缓存已清空")

    @staticmethod
    def _hash(value: str) -> str:
        """计算MD5哈希"""
        return hashlib.md5(value.encode()).hexdigest()
