"""数据处理Pipeline

处理爬取的数据并入库
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from loguru import logger

from ..database import (
    AnnouncementRepository,
    PositionRepository,
    ListPageRepository,
    session_scope,
)
from ..processors import AIExtractor, DataNormalizer, DataValidator


class DataPipeline:
    """数据处理Pipeline

    功能：
    - 公告数据入库
    - 职位数据提取和入库
    - AI预处理
    - 数据标准化
    - 数据校验
    - 关联关系建立
    """

    def __init__(self):
        self.announcement_repo = AnnouncementRepository()
        self.position_repo = PositionRepository()
        self.list_page_repo = ListPageRepository()

        self.ai_extractor = AIExtractor()
        self.normalizer = DataNormalizer()
        self.validator = DataValidator()

    def process_announcement(self, data: Dict[str, Any]) -> Optional[int]:
        """处理单个公告数据

        Args:
            data: 公告数据

        Returns:
            创建的公告ID，失败返回None
        """
        try:
            url = data.get("url")
            if not url:
                logger.error("公告URL为空")
                return None

            # 检查是否已存在
            if self.announcement_repo.exists(url):
                logger.debug(f"公告已存在: {url}")
                return None

            # 检查内容哈希（去重）
            content_hash = data.get("content_hash")
            if content_hash and self.announcement_repo.get_by_content_hash(
                content_hash
            ):
                logger.debug(f"公告内容重复: {url}")
                return None

            # 创建公告记录
            announcement_data = {
                "url": url,
                "title": data.get("title", ""),
                "content": data.get("content"),
                "content_html": data.get("content_html"),
                "content_hash": content_hash,
                "announcement_type": data.get("announcement_type"),
                "publish_date": self._parse_date(data.get("publish_date")),
                "source_name": data.get("source_name"),
                "source_list_id": data.get("source_list_id"),
                "category": data.get("category"),
                "attachments": data.get("attachments", []),
                "crawled_at": datetime.now(),
                "status": "pending",
            }

            announcement = self.announcement_repo.create(announcement_data)
            logger.info(f"公告入库成功: {announcement.id} - {announcement.title[:50]}")

            return announcement.id

        except Exception as e:
            logger.error(f"公告处理失败: {e}")
            return None

    def process_positions_from_announcement(
        self, announcement_id: int, content: str, attachments: List[Dict] = None
    ) -> int:
        """从公告中提取并处理职位数据

        Args:
            announcement_id: 公告ID
            content: 公告内容
            attachments: 附件列表

        Returns:
            成功处理的职位数量
        """
        try:
            # 使用AI提取职位信息
            extraction_result = self.ai_extractor.extract_positions(content)

            positions = extraction_result.get("positions", [])
            exam_info = extraction_result.get("exam_info", {})
            overall_confidence = extraction_result.get("confidence", 0)

            if not positions:
                logger.info(f"公告 {announcement_id} 未提取到职位信息")
                return 0

            # 标准化考试信息
            normalized_exam = self.normalizer.normalize_exam_info(exam_info)

            processed_count = 0

            for pos in positions:
                try:
                    # 标准化职位数据
                    normalized_pos = self.normalizer.normalize_position(pos)

                    # 添加公告关联和考试信息
                    normalized_pos["announcement_id"] = announcement_id
                    normalized_pos["exam_type"] = normalized_exam.get("exam_type")
                    normalized_pos["source_url"] = ""  # 从公告获取

                    # 校验数据
                    is_valid, messages, confidence = self.validator.validate_position(
                        normalized_pos
                    )
                    normalized_pos["parse_confidence"] = confidence
                    normalized_pos["status"] = "pending" if not is_valid else "parsed"

                    # 检查是否已存在
                    code = normalized_pos.get("position_code")
                    if code and self.position_repo.exists_by_code(code):
                        logger.debug(f"职位已存在: {code}")
                        continue

                    # 入库
                    self.position_repo.create(normalized_pos)
                    processed_count += 1

                except Exception as e:
                    logger.error(f"职位处理失败: {e}")
                    continue

            # 更新公告状态
            self.announcement_repo.update(
                announcement_id,
                {
                    "parsed_at": datetime.now(),
                    "parse_confidence": overall_confidence,
                    "status": "parsed",
                },
            )

            logger.info(
                f"公告 {announcement_id} 处理完成: {processed_count}/{len(positions)} 个职位"
            )
            return processed_count

        except Exception as e:
            logger.error(f"职位提取失败: {e}")
            return 0

    def process_positions_batch(self, positions: List[Dict[str, Any]]) -> int:
        """批量处理职位数据（来自Excel/PDF解析）

        Args:
            positions: 职位数据列表

        Returns:
            成功处理的数量
        """
        processed = 0

        for pos in positions:
            try:
                # 标准化
                normalized = self.normalizer.normalize_position(pos)

                # 校验
                is_valid, messages, confidence = self.validator.validate_position(
                    normalized
                )
                normalized["parse_confidence"] = confidence
                normalized["status"] = "pending" if not is_valid else "parsed"

                # 检查重复
                code = normalized.get("position_code")
                if code and self.position_repo.exists_by_code(code):
                    continue

                # 入库
                self.position_repo.create(normalized)
                processed += 1

            except Exception as e:
                logger.error(f"职位批量处理失败: {e}")
                continue

        logger.info(f"批量处理完成: {processed}/{len(positions)}")
        return processed

    def process_list_page(self, data: Dict[str, Any]) -> Optional[int]:
        """处理列表页数据

        Args:
            data: 列表页数据

        Returns:
            创建的列表页ID
        """
        try:
            url = data.get("url")
            if not url:
                return None

            # 检查是否已存在
            if self.list_page_repo.exists(url):
                logger.debug(f"列表页已存在: {url}")
                return None

            list_page = self.list_page_repo.create(
                {
                    "url": url,
                    "source_domain": data.get("source_domain"),
                    "source_name": data.get("source_name"),
                    "category": data.get("category"),
                    "discovery_method": data.get("discovery_method"),
                    "discovery_from": data.get("discovery_from"),
                    "sample_article": data.get("sample_article"),
                    "article_selector": data.get("article_selector"),
                    "pagination_pattern": data.get("pagination_pattern"),
                    "crawl_frequency": data.get("crawl_frequency", "daily"),
                    "status": "active",
                    "verified": data.get("verified", False),
                }
            )

            logger.info(f"列表页入库成功: {list_page.id} - {url}")
            return list_page.id

        except Exception as e:
            logger.error(f"列表页处理失败: {e}")
            return None

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """解析日期字符串"""
        if not date_str:
            return None

        try:
            if isinstance(date_str, datetime):
                return date_str

            # 尝试多种格式
            formats = [
                "%Y-%m-%d",
                "%Y/%m/%d",
                "%Y年%m月%d日",
            ]

            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue

            return None

        except Exception:
            return None
