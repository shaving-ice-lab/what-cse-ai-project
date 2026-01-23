"""公告详情爬虫

抓取公告页面内容和附件
"""

import hashlib
import os
import re
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from loguru import logger

from .base import BaseSpider


class AnnouncementSpider(BaseSpider):
    """公告详情爬虫

    功能：
    1. 抓取公告页面内容
    2. 提取标题、发布时间、正文
    3. 下载附件（PDF/Excel/Word）
    4. 保存原始HTML
    """

    name = "announcement"

    # 附件扩展名
    ATTACHMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".rar"]

    def __init__(
        self,
        article_urls: Optional[List[Dict[str, Any]]] = None,
        download_dir: str = "data/downloads",
    ):
        """
        Args:
            article_urls: 要抓取的文章URL列表
            download_dir: 附件下载目录
        """
        super().__init__()
        self.article_urls = article_urls or []
        self.download_dir = download_dir

        # 创建下载目录
        os.makedirs(download_dir, exist_ok=True)

    def start_requests(self) -> Generator[Dict[str, Any], None, None]:
        """生成初始请求"""
        for article in self.article_urls:
            url = article.get("url") if isinstance(article, dict) else article
            yield {
                "url": url,
                "callback": self.parse_announcement,
                "meta": article if isinstance(article, dict) else {"url": url},
            }

    def parse(self, response, **kwargs) -> Generator[Dict[str, Any], None, None]:
        """默认解析方法"""
        yield from self.parse_announcement(response, **kwargs)

    def parse_announcement(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析公告页面"""
        soup = BeautifulSoup(response.text, "lxml")
        url = response.url

        # 提取基本信息
        title = self._extract_title(soup)
        publish_date = self._extract_publish_date(soup)
        content = self._extract_content(soup)

        # 识别公告类型
        announcement_type = self._identify_type(title, content)

        # 提取附件
        attachments = self._extract_attachments(soup, url)

        # 下载附件
        downloaded_attachments = []
        for att in attachments:
            try:
                local_path = self._download_attachment(att["url"], att["name"])
                att["local_path"] = local_path
                downloaded_attachments.append(att)
            except Exception as e:
                logger.error(f"附件下载失败: {att['url']} -> {e}")
                att["download_error"] = str(e)
                downloaded_attachments.append(att)

        # 构建结果
        result = {
            "url": url,
            "title": title,
            "publish_date": publish_date,
            "content": content,
            "content_html": str(soup),
            "announcement_type": announcement_type,
            "attachments": downloaded_attachments,
            "source_name": kwargs.get("source_name"),
            "source_list_id": kwargs.get("source_list_id"),
            "category": kwargs.get("category"),
            "crawled_at": datetime.now().isoformat(),
            "content_hash": self._hash_content(content),
        }

        logger.info(f"公告抓取完成: {title[:50]}...")
        yield result

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """提取标题"""
        # 常用标题选择器
        title_selectors = [
            "h1.title",
            ".article-title",
            ".content-title",
            ".news-title",
            "h1",
            ".main-title",
            "title",
        ]

        for selector in title_selectors:
            elem = soup.select_one(selector)
            if elem:
                title = elem.get_text(strip=True)
                if title and len(title) > 5:
                    # 清理标题
                    title = re.sub(r"\s+", " ", title)
                    return title

        return ""

    def _extract_publish_date(self, soup: BeautifulSoup) -> Optional[str]:
        """提取发布日期"""
        # 日期选择器
        date_selectors = [
            ".publish-time",
            ".article-time",
            ".time",
            ".date",
            ".info-time",
            '[class*="time"]',
            '[class*="date"]',
        ]

        date_patterns = [
            r"(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)",
            r"发布[时日]?期[：:]\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)",
        ]

        # 从选择器提取
        for selector in date_selectors:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text()
                for pattern in date_patterns:
                    match = re.search(pattern, text)
                    if match:
                        return self._normalize_date(match.group(1))

        # 从整个页面搜索
        page_text = soup.get_text()
        for pattern in date_patterns:
            match = re.search(pattern, page_text[:2000])  # 只搜索前2000字符
            if match:
                return self._normalize_date(match.group(1))

        return None

    def _normalize_date(self, date_str: str) -> str:
        """标准化日期格式"""
        # 统一为 YYYY-MM-DD 格式
        date_str = date_str.replace("年", "-").replace("月", "-").replace("日", "")
        date_str = date_str.replace("/", "-")

        parts = date_str.split("-")
        if len(parts) == 3:
            year = parts[0]
            month = parts[1].zfill(2)
            day = parts[2].zfill(2)
            return f"{year}-{month}-{day}"

        return date_str

    def _extract_content(self, soup: BeautifulSoup) -> str:
        """提取正文内容"""
        # 内容选择器
        content_selectors = [
            ".article-content",
            ".content",
            ".main-content",
            ".news-content",
            ".detail-content",
            "#content",
            ".TRS_Editor",
            ".zoom",
        ]

        for selector in content_selectors:
            elem = soup.select_one(selector)
            if elem:
                # 移除脚本和样式
                for tag in elem.find_all(
                    ["script", "style", "nav", "header", "footer"]
                ):
                    tag.decompose()

                content = elem.get_text(separator="\n", strip=True)
                if len(content) > 100:  # 内容足够长
                    return content

        # 尝试提取body内容
        body = soup.find("body")
        if body:
            for tag in body.find_all(
                ["script", "style", "nav", "header", "footer", "aside"]
            ):
                tag.decompose()
            return body.get_text(separator="\n", strip=True)

        return ""

    def _identify_type(self, title: str, content: str) -> str:
        """识别公告类型"""
        text = (title + content).lower()

        type_keywords = {
            "recruitment": ["招录公告", "招考公告", "招聘公告", "职位表"],
            "registration_stats": ["报名人数", "报名统计", "缴费人数", "竞争比"],
            "written_exam": ["笔试公告", "准考证", "考试时间", "笔试安排"],
            "score_release": ["成绩公告", "笔试成绩", "成绩查询", "合格分数线"],
            "qualification_review": ["资格复审", "资格审查", "复审公告"],
            "interview": ["面试公告", "面试名单", "面试安排", "面试时间"],
            "physical_exam": ["体检公告", "体检名单", "体检时间"],
            "political_review": ["政审", "考察公告", "考察通知"],
            "publicity": ["拟录用", "录用公示", "公示名单"],
            "supplement": ["递补", "补录", "调剂"],
        }

        for type_key, keywords in type_keywords.items():
            if any(kw in text for kw in keywords):
                return type_key

        return "other"

    def _extract_attachments(
        self, soup: BeautifulSoup, base_url: str
    ) -> List[Dict[str, str]]:
        """提取附件链接"""
        attachments = []

        # 查找所有链接
        for link in soup.find_all("a", href=True):
            href = link.get("href", "")
            text = link.get_text(strip=True)

            # 检查是否为附件
            is_attachment = False

            # 通过扩展名判断
            href_lower = href.lower()
            for ext in self.ATTACHMENT_EXTENSIONS:
                if ext in href_lower:
                    is_attachment = True
                    break

            # 通过链接文字判断
            if not is_attachment:
                attachment_keywords = ["附件", "下载", "职位表", "报名表"]
                if any(kw in text for kw in attachment_keywords):
                    is_attachment = True

            if is_attachment:
                full_url = urljoin(base_url, href)
                name = text or self._get_filename_from_url(full_url)

                attachments.append(
                    {
                        "url": full_url,
                        "name": name,
                        "type": self._get_file_type(full_url),
                    }
                )

        return attachments

    def _download_attachment(self, url: str, name: str) -> str:
        """下载附件"""
        # 生成文件名
        ext = self._get_file_extension(url)
        safe_name = re.sub(r'[<>:"/\\|?*]', "_", name)[:50]
        filename = f"{safe_name}_{hashlib.md5(url.encode()).hexdigest()[:8]}{ext}"

        save_path = os.path.join(self.download_dir, filename)

        # 下载文件
        return self.download_file(url, save_path)

    @staticmethod
    def _get_filename_from_url(url: str) -> str:
        """从URL获取文件名"""
        parsed = urlparse(url)
        path = parsed.path
        return os.path.basename(path) or "attachment"

    @staticmethod
    def _get_file_type(url: str) -> str:
        """获取文件类型"""
        url_lower = url.lower()
        if ".pdf" in url_lower:
            return "pdf"
        elif ".doc" in url_lower:
            return "word"
        elif ".xls" in url_lower:
            return "excel"
        elif ".zip" in url_lower or ".rar" in url_lower:
            return "archive"
        return "unknown"

    @staticmethod
    def _get_file_extension(url: str) -> str:
        """获取文件扩展名"""
        url_lower = url.lower()
        for ext in [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".zip", ".rar"]:
            if ext in url_lower:
                return ext
        return ""

    @staticmethod
    def _hash_content(content: str) -> str:
        """计算内容哈希"""
        return hashlib.md5(content.encode()).hexdigest()
