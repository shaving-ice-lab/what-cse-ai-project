"""列表页监控爬虫

定时爬取已入库的列表页，发现新文章
"""

import hashlib
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional

from bs4 import BeautifulSoup
from loguru import logger

from .base import BaseSpider


class ListMonitorSpider(BaseSpider):
    """列表页监控爬虫

    功能：
    1. 定时爬取已入库的列表页
    2. 解析文章链接
    3. 增量更新（URL去重）
    4. 分页处理
    """

    name = "list_monitor"

    def __init__(
        self,
        list_pages: Optional[List[Dict[str, Any]]] = None,
        crawled_urls: Optional[set] = None,
    ):
        """
        Args:
            list_pages: 要监控的列表页配置列表
            crawled_urls: 已爬取的URL集合（用于去重）
        """
        super().__init__()
        self.list_pages = list_pages or []
        self.crawled_urls = crawled_urls or set()
        self.new_articles: List[Dict[str, Any]] = []

    def start_requests(self) -> Generator[Dict[str, Any], None, None]:
        """生成初始请求"""
        for list_page in self.list_pages:
            if list_page.get("status") != "active":
                continue

            yield {
                "url": list_page["url"],
                "callback": self.parse_list_page,
                "meta": {
                    "list_page": list_page,
                    "page_num": 1,
                },
            }

    def parse(self, response, **kwargs) -> Generator[Dict[str, Any], None, None]:
        """默认解析方法"""
        yield from self.parse_list_page(response, **kwargs)

    def parse_list_page(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析列表页"""
        list_page = kwargs.get("list_page", {})
        page_num = kwargs.get("page_num", 1)

        soup = BeautifulSoup(response.text, "lxml")

        # 获取文章选择器
        selector = list_page.get("article_selector", "a")

        # 提取文章链接
        articles = self._extract_articles(soup, selector, response.url, list_page)

        new_count = 0
        for article in articles:
            url = article["url"]

            # URL去重
            url_hash = self._hash_url(url)
            if url_hash in self.crawled_urls:
                continue

            self.crawled_urls.add(url_hash)
            self.new_articles.append(article)
            new_count += 1

            yield article

        logger.info(
            f"列表页 {list_page.get('name', response.url)} 第{page_num}页: "
            f"发现 {len(articles)} 篇文章, 新增 {new_count} 篇"
        )

        # 处理分页
        if new_count > 0:  # 有新文章才继续翻页
            next_url = self._get_next_page_url(soup, response.url, list_page, page_num)

            if next_url:
                yield {
                    "_type": "request",
                    "url": next_url,
                    "callback": self.parse_list_page,
                    "meta": {
                        "list_page": list_page,
                        "page_num": page_num + 1,
                    },
                }

    def _extract_articles(
        self,
        soup: BeautifulSoup,
        selector: str,
        base_url: str,
        list_page: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """提取文章信息"""
        articles = []

        # 常用的文章列表选择器
        selectors_to_try = (
            [
                selector,
                ".list-item a",
                ".article-list a",
                ".news-list a",
                "ul.list li a",
                ".content-list a",
                "table.list a",
            ]
            if selector == "a"
            else [selector]
        )

        for sel in selectors_to_try:
            try:
                elements = soup.select(sel)
                if elements:
                    for elem in elements:
                        href = elem.get("href")
                        if (
                            not href
                            or href.startswith("#")
                            or href.startswith("javascript:")
                        ):
                            continue

                        # 构建完整URL
                        full_url = self.urljoin(base_url, href)

                        # 提取标题
                        title = elem.get_text(strip=True)
                        if not title:
                            title = elem.get("title", "")

                        # 尝试提取日期
                        date = self._extract_date(elem)

                        articles.append(
                            {
                                "url": full_url,
                                "title": title,
                                "publish_date": date,
                                "source_list_id": list_page.get("id"),
                                "source_name": list_page.get("source_name"),
                                "category": list_page.get("category"),
                                "discovered_at": datetime.now().isoformat(),
                            }
                        )

                    if articles:
                        break
            except Exception as e:
                logger.debug(f"选择器 {sel} 解析失败: {e}")
                continue

        return articles

    def _extract_date(self, element) -> Optional[str]:
        """从元素中提取日期"""
        import re

        # 查找日期文本
        date_patterns = [
            r"(\d{4}[-/]\d{1,2}[-/]\d{1,2})",
            r"(\d{4}年\d{1,2}月\d{1,2}日)",
        ]

        # 检查元素及其兄弟元素
        text_to_search = element.get_text()
        parent = element.parent
        if parent:
            text_to_search += parent.get_text()

        for pattern in date_patterns:
            match = re.search(pattern, text_to_search)
            if match:
                return match.group(1)

        return None

    def _get_next_page_url(
        self,
        soup: BeautifulSoup,
        current_url: str,
        list_page: Dict[str, Any],
        current_page: int,
    ) -> Optional[str]:
        """获取下一页URL"""
        # 方法1: 使用配置的分页模式
        pagination_pattern = list_page.get("pagination_pattern")
        if pagination_pattern:
            next_page = current_page + 1
            if "{n}" in pagination_pattern:
                next_url = pagination_pattern.replace("{n}", str(next_page))
                return self.urljoin(current_url, next_url)

        # 方法2: 查找"下一页"链接
        next_selectors = [
            "a.next",
            ".pagination .next a",
            'a[class*="next"]',
            ".page-next a",
        ]

        for sel in next_selectors:
            next_link = soup.select_one(sel)
            if next_link and next_link.get("href"):
                return self.urljoin(current_url, next_link["href"])

        # 方法3: 查找包含"下一页"文字的链接
        next_texts = ["下一页", "下页", "»", ">", "Next"]
        for text in next_texts:
            next_link = soup.find("a", string=lambda s: s and text in s)
            if next_link and next_link.get("href"):
                return self.urljoin(current_url, next_link["href"])

        return None

    @staticmethod
    def _hash_url(url: str) -> str:
        """计算URL哈希"""
        return hashlib.md5(url.encode()).hexdigest()

    def get_new_articles(self) -> List[Dict[str, Any]]:
        """获取新发现的文章"""
        return self.new_articles
