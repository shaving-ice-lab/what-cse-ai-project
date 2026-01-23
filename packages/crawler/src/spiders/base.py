"""基础爬虫类"""

import random
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urljoin, urlparse

import requests
from fake_useragent import UserAgent
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import config


class BaseSpider(ABC):
    """基础爬虫类

    提供通用的爬虫功能：
    - 请求管理（头部、Cookie、代理）
    - 频率控制
    - 重试机制
    - 日志记录
    """

    name: str = "base"
    allowed_domains: List[str] = []
    start_urls: List[str] = []

    def __init__(self):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.spider_config = config.spider
        self.proxy_config = config.proxy

        # 请求计数
        self._request_count = 0
        self._last_request_time = 0

        # 初始化
        self._setup_session()
        logger.info(f"爬虫 {self.name} 初始化完成")

    def _setup_session(self) -> None:
        """配置Session"""
        self.session.headers.update(
            {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "Connection": "keep-alive",
            }
        )

    def get_user_agent(self) -> str:
        """获取User-Agent"""
        ua_type = self.spider_config.get("user_agent_type", "random")
        if ua_type == "fixed":
            return self.spider_config.get("fixed_user_agent", self.ua.random)
        return self.ua.random

    def get_proxy(self) -> Optional[Dict[str, str]]:
        """获取代理"""
        if not self.proxy_config.get("enabled", False):
            return None

        custom_proxies = self.proxy_config.get("custom_proxies", [])
        if custom_proxies:
            proxy = random.choice(custom_proxies)
            return {"http": proxy, "https": proxy}

        return None

    def _wait_for_rate_limit(self) -> None:
        """频率控制"""
        delay = self.spider_config.get("download_delay", 1.0)

        if self.spider_config.get("randomize_download_delay", True):
            delay = delay * (0.5 + random.random())

        elapsed = time.time() - self._last_request_time
        if elapsed < delay:
            time.sleep(delay - elapsed)

        self._last_request_time = time.time()

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def fetch(
        self,
        url: str,
        method: str = "GET",
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        cookies: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None,
        allow_redirects: bool = True,
    ) -> requests.Response:
        """发起HTTP请求

        Args:
            url: 请求URL
            method: HTTP方法
            headers: 请求头
            params: URL参数
            data: 表单数据
            json: JSON数据
            cookies: Cookie
            timeout: 超时时间
            allow_redirects: 是否允许重定向

        Returns:
            Response对象
        """
        self._wait_for_rate_limit()

        # 合并请求头
        request_headers = {"User-Agent": self.get_user_agent()}
        if headers:
            request_headers.update(headers)

        # 超时设置
        if timeout is None:
            timeout = self.spider_config.get("download_timeout", 30)

        # 代理
        proxies = self.get_proxy()

        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=request_headers,
                params=params,
                data=data,
                json=json,
                cookies=cookies,
                timeout=timeout,
                proxies=proxies,
                allow_redirects=allow_redirects,
            )

            self._request_count += 1
            logger.debug(f"请求成功: {method} {url} -> {response.status_code}")

            # 检查响应状态
            response.raise_for_status()
            return response

        except requests.exceptions.RequestException as e:
            logger.error(f"请求失败: {method} {url} -> {e}")
            raise

    def fetch_html(self, url: str, **kwargs) -> str:
        """获取HTML内容"""
        response = self.fetch(url, **kwargs)
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text

    def fetch_json(self, url: str, **kwargs) -> Dict[str, Any]:
        """获取JSON内容"""
        response = self.fetch(url, **kwargs)
        return response.json()

    def download_file(
        self, url: str, save_path: str, chunk_size: int = 8192, **kwargs
    ) -> str:
        """下载文件

        Args:
            url: 文件URL
            save_path: 保存路径
            chunk_size: 分块大小

        Returns:
            保存路径
        """
        response = self.fetch(url, **kwargs)

        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)

        logger.info(f"文件下载完成: {url} -> {save_path}")
        return save_path

    @staticmethod
    def urljoin(base: str, url: str) -> str:
        """URL拼接"""
        return urljoin(base, url)

    @staticmethod
    def get_domain(url: str) -> str:
        """获取域名"""
        parsed = urlparse(url)
        return parsed.netloc

    def is_allowed(self, url: str) -> bool:
        """检查URL是否允许爬取"""
        if not self.allowed_domains:
            return True
        domain = self.get_domain(url)
        return any(d in domain for d in self.allowed_domains)

    @abstractmethod
    def start_requests(self) -> Generator[Dict[str, Any], None, None]:
        """生成初始请求"""
        pass

    @abstractmethod
    def parse(
        self, response: requests.Response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析响应"""
        pass

    def run(self) -> List[Dict[str, Any]]:
        """运行爬虫"""
        results = []

        logger.info(f"爬虫 {self.name} 开始运行")

        try:
            for request in self.start_requests():
                url = request.get("url")
                callback = request.get("callback", self.parse)
                meta = request.get("meta", {})

                if not self.is_allowed(url):
                    logger.warning(f"URL不在允许列表中: {url}")
                    continue

                try:
                    response = self.fetch(url, **request.get("request_kwargs", {}))

                    for item in callback(response, **meta):
                        if isinstance(item, dict):
                            if item.get("_type") == "request":
                                # 新的请求
                                new_url = item.get("url")
                                new_callback = item.get("callback", self.parse)
                                new_meta = item.get("meta", {})

                                if self.is_allowed(new_url):
                                    new_response = self.fetch(
                                        new_url, **item.get("request_kwargs", {})
                                    )
                                    for sub_item in new_callback(
                                        new_response, **new_meta
                                    ):
                                        if sub_item.get("_type") != "request":
                                            results.append(sub_item)
                            else:
                                results.append(item)

                except Exception as e:
                    logger.error(f"处理URL失败: {url} -> {e}")
                    continue

            logger.info(f"爬虫 {self.name} 运行完成, 共获取 {len(results)} 条数据")

        except Exception as e:
            logger.error(f"爬虫 {self.name} 运行出错: {e}")
            raise

        return results

    def close(self) -> None:
        """关闭爬虫"""
        self.session.close()
        logger.info(f"爬虫 {self.name} 已关闭, 总请求数: {self._request_count}")
