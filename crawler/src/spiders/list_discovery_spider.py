"""列表页发现爬虫

从聚合平台发现新的列表页来源
"""

import re
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from loguru import logger

from .base import BaseSpider


class ListDiscoverySpider(BaseSpider):
    """列表页发现爬虫

    功能：
    1. 从聚合平台抓取文章URL
    2. 分析URL结构，推断列表页
    3. 通过页面元素（面包屑、返回链接）发现列表页
    4. 新列表页入库
    """

    name = "list_discovery"

    # URL模式分析规则
    URL_PATTERNS = [
        # 文章ID在路径末尾
        (r"^(https?://[^/]+/.*?/)\d+\.html?$", r"\1"),
        # 文章ID作为参数
        (r"^(https?://[^/]+/.*?)\?.*id=\d+.*$", r"\1"),
        # 日期+ID模式
        (r"^(https?://[^/]+/.*?/)\d{6,8}/.*$", r"\1"),
        # t_开头的文章ID
        (r"^(https?://[^/]+/.*?/)t\d+_\d+\.s?html?$", r"\1"),
    ]

    def __init__(self, aggregator_urls: Optional[List[str]] = None):
        super().__init__()
        self.aggregator_urls = aggregator_urls or []
        self.discovered_lists: Dict[str, Dict] = {}

    def start_requests(self) -> Generator[Dict[str, Any], None, None]:
        """生成初始请求"""
        for url in self.aggregator_urls:
            yield {
                "url": url,
                "callback": self.parse_aggregator,
                "meta": {"source": url},
            }

    def parse(self, response, **kwargs) -> Generator[Dict[str, Any], None, None]:
        """默认解析方法"""
        yield from self.parse_aggregator(response, **kwargs)

    def parse_aggregator(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析聚合平台页面，提取文章链接"""
        soup = BeautifulSoup(response.text, "lxml")
        source = kwargs.get("source", response.url)

        # 提取所有链接
        links = soup.find_all("a", href=True)

        for link in links:
            href = link.get("href", "")
            text = link.get_text(strip=True)

            # 过滤无效链接
            if not href or href.startswith("#") or href.startswith("javascript:"):
                continue

            # 转为绝对URL
            full_url = urljoin(response.url, href)

            # 检查是否为公告类文章链接
            if self._is_announcement_link(full_url, text):
                # 分析URL推断列表页
                list_url = self._infer_list_url(full_url)

                if list_url and list_url not in self.discovered_lists:
                    self.discovered_lists[list_url] = {
                        "url": list_url,
                        "source_domain": urlparse(list_url).netloc,
                        "discovery_from": source,
                        "discovery_method": "url_pattern",
                        "sample_article": full_url,
                    }

                    # 返回请求，进一步分析列表页
                    yield {
                        "_type": "request",
                        "url": full_url,
                        "callback": self.parse_article_page,
                        "meta": {
                            "article_url": full_url,
                            "inferred_list": list_url,
                        },
                    }

        # 返回发现的列表页
        for list_data in self.discovered_lists.values():
            yield list_data

    def parse_article_page(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析文章页面，尝试提取列表页链接"""
        soup = BeautifulSoup(response.text, "lxml")
        article_url = kwargs.get("article_url", response.url)
        inferred_list = kwargs.get("inferred_list")

        discovered = []

        # 方法1: 面包屑导航
        breadcrumb_selectors = [
            ".breadcrumb a",
            ".crumb a",
            ".position a",
            ".nav-path a",
            '[class*="bread"] a',
        ]

        for selector in breadcrumb_selectors:
            crumbs = soup.select(selector)
            if crumbs and len(crumbs) >= 2:
                # 通常倒数第二个是列表页
                list_link = crumbs[-2].get("href")
                if list_link:
                    list_url = urljoin(response.url, list_link)
                    discovered.append(
                        {
                            "url": list_url,
                            "method": "breadcrumb",
                        }
                    )
                    break

        # 方法2: 返回列表按钮
        back_patterns = ["返回列表", "返回", "更多", "查看更多"]
        for pattern in back_patterns:
            back_link = soup.find("a", string=re.compile(pattern))
            if back_link and back_link.get("href"):
                list_url = urljoin(response.url, back_link["href"])
                discovered.append(
                    {
                        "url": list_url,
                        "method": "back_link",
                    }
                )
                break

        # 方法3: 同栏目链接
        category_selectors = [
            ".category a",
            ".column a",
            '[class*="catalog"] a',
        ]

        for selector in category_selectors:
            cat_link = soup.select_one(selector)
            if cat_link and cat_link.get("href"):
                list_url = urljoin(response.url, cat_link["href"])
                discovered.append(
                    {
                        "url": list_url,
                        "method": "category",
                    }
                )
                break

        # 更新发现的列表页
        for item in discovered:
            list_url = item["url"]
            if list_url not in self.discovered_lists:
                self.discovered_lists[list_url] = {
                    "url": list_url,
                    "source_domain": urlparse(list_url).netloc,
                    "discovery_from": article_url,
                    "discovery_method": item["method"],
                    "sample_article": article_url,
                }
            elif (
                self.discovered_lists[list_url].get("discovery_method") == "url_pattern"
            ):
                # 更新为更可靠的发现方式
                self.discovered_lists[list_url]["discovery_method"] = item["method"]

        # 如果没有发现，使用推断的列表页
        if not discovered and inferred_list:
            yield {
                "url": inferred_list,
                "source_domain": urlparse(inferred_list).netloc,
                "discovery_from": article_url,
                "discovery_method": "url_pattern",
                "sample_article": article_url,
                "verified": False,
            }

    def _is_announcement_link(self, url: str, text: str) -> bool:
        """判断是否为公告类链接"""
        # 关键词匹配
        keywords = [
            "公告",
            "招录",
            "招考",
            "招聘",
            "报名",
            "考试",
            "公务员",
            "事业单位",
            "选调",
            "遴选",
        ]

        # URL关键词
        url_keywords = [
            "notice",
            "news",
            "article",
            "info",
            "detail",
            "gonggao",
            "xinxi",
            "zhaokao",
            "zhaopin",
        ]

        # 检查文本
        if any(kw in text for kw in keywords):
            return True

        # 检查URL
        url_lower = url.lower()
        if any(kw in url_lower for kw in url_keywords):
            return True

        return False

    def _infer_list_url(self, article_url: str) -> Optional[str]:
        """从文章URL推断列表页URL"""
        for pattern, replacement in self.URL_PATTERNS:
            match = re.match(pattern, article_url)
            if match:
                list_url = re.sub(pattern, replacement, article_url)
                # 验证URL格式
                if self._is_valid_list_url(list_url):
                    return list_url

        # 尝试直接取父路径
        parsed = urlparse(article_url)
        path_parts = parsed.path.rstrip("/").rsplit("/", 1)
        if len(path_parts) > 1:
            parent_path = path_parts[0] + "/"
            list_url = f"{parsed.scheme}://{parsed.netloc}{parent_path}"
            return list_url

        return None

    def _is_valid_list_url(self, url: str) -> bool:
        """验证列表页URL是否有效"""
        # 排除文件类URL
        file_extensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip"]
        if any(url.lower().endswith(ext) for ext in file_extensions):
            return False

        # 排除过短的路径
        parsed = urlparse(url)
        if len(parsed.path) < 3:
            return False

        return True

    def get_discovered_lists(self) -> List[Dict[str, Any]]:
        """获取所有发现的列表页"""
        return list(self.discovered_lists.values())
