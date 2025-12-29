"""职位表爬虫

识别并提取职位表数据
"""

from typing import Any, Dict, Generator, List, Optional

from bs4 import BeautifulSoup
from loguru import logger

from .base import BaseSpider
from ..parsers import HTMLParser, PDFParser, ExcelParser, WordParser


class PositionSpider(BaseSpider):
    """职位表爬虫

    功能：
    1. 识别职位表类型（HTML表格/附件）
    2. 提取职位表数据
    3. 调用相应解析器
    """

    name = "position"

    def __init__(
        self,
        announcements: Optional[List[Dict[str, Any]]] = None,
    ):
        """
        Args:
            announcements: 公告数据列表（包含附件信息）
        """
        super().__init__()
        self.announcements = announcements or []

        # 初始化解析器
        self.html_parser = HTMLParser()
        self.pdf_parser = PDFParser()
        self.excel_parser = ExcelParser()
        self.word_parser = WordParser()

    def start_requests(self) -> Generator[Dict[str, Any], None, None]:
        """生成初始请求"""
        for announcement in self.announcements:
            # 检查是否有职位表附件
            attachments = announcement.get("attachments", [])
            position_attachments = self._find_position_attachments(attachments)

            if position_attachments:
                # 有职位表附件，直接解析
                for att in position_attachments:
                    yield {
                        "url": att.get("local_path") or att.get("url"),
                        "callback": self.parse_attachment,
                        "meta": {
                            "announcement": announcement,
                            "attachment": att,
                        },
                    }
            else:
                # 尝试从HTML提取
                yield {
                    "url": announcement.get("url"),
                    "callback": self.parse_html_table,
                    "meta": {"announcement": announcement},
                }

    def parse(self, response, **kwargs) -> Generator[Dict[str, Any], None, None]:
        """默认解析方法"""
        yield from self.parse_html_table(response, **kwargs)

    def parse_html_table(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析HTML表格"""
        announcement = kwargs.get("announcement", {})

        soup = BeautifulSoup(response.text, "lxml")

        # 查找职位表格
        tables = soup.find_all("table")

        for idx, table in enumerate(tables):
            # 检查是否为职位表
            if self._is_position_table(table):
                try:
                    positions = self.html_parser.parse_table(table)

                    for pos in positions:
                        pos["source_url"] = announcement.get("url")
                        pos["announcement_id"] = announcement.get("id")
                        pos["parse_source"] = "html_table"
                        yield pos

                    logger.info(f"从HTML表格提取 {len(positions)} 个职位")

                except Exception as e:
                    logger.error(f"HTML表格解析失败: {e}")

    def parse_attachment(
        self, response, **kwargs
    ) -> Generator[Dict[str, Any], None, None]:
        """解析附件"""
        announcement = kwargs.get("announcement", {})
        attachment = kwargs.get("attachment", {})

        file_path = attachment.get("local_path")
        file_type = attachment.get("type", "")

        if not file_path:
            logger.warning("附件本地路径为空")
            return

        try:
            positions = []

            if file_type == "excel" or file_path.endswith((".xlsx", ".xls")):
                positions = self.excel_parser.parse(file_path)
            elif file_type == "pdf" or file_path.endswith(".pdf"):
                positions = self.pdf_parser.parse(file_path)
            elif file_type == "word" or file_path.endswith((".doc", ".docx")):
                positions = self.word_parser.parse(file_path)
            else:
                logger.warning(f"不支持的附件类型: {file_type}")
                return

            for pos in positions:
                pos["source_url"] = announcement.get("url")
                pos["announcement_id"] = announcement.get("id")
                pos["attachment_url"] = attachment.get("url")
                pos["parse_source"] = file_type
                yield pos

            logger.info(f"从{file_type}附件提取 {len(positions)} 个职位")

        except Exception as e:
            logger.error(f"附件解析失败: {file_path} -> {e}")

    def _find_position_attachments(
        self, attachments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """查找职位表附件"""
        position_keywords = ["职位表", "岗位表", "招录计划", "招考职位", "职位信息"]

        result = []
        for att in attachments:
            name = att.get("name", "").lower()

            # 关键词匹配
            if any(kw in name for kw in position_keywords):
                result.append(att)
                continue

            # Excel文件优先
            if att.get("type") == "excel":
                result.append(att)

        return result

    def _is_position_table(self, table) -> bool:
        """判断是否为职位表"""
        # 获取表头
        headers = []
        header_row = table.find("tr")
        if header_row:
            headers = [
                th.get_text(strip=True).lower()
                for th in header_row.find_all(["th", "td"])
            ]

        # 职位表特征关键词
        position_keywords = [
            "职位",
            "岗位",
            "部门",
            "机关",
            "招录",
            "人数",
            "学历",
            "专业",
            "条件",
        ]

        # 计算匹配度
        match_count = sum(
            1 for kw in position_keywords if any(kw in h for h in headers)
        )

        return match_count >= 3
