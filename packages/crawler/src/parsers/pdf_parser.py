"""PDF解析器"""

import os
import re
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None


class PDFParser:
    """PDF文件解析器

    功能：
    - 使用pdfplumber提取文本和表格
    - 表格识别与提取
    - 多列布局处理
    - 判断是否为扫描件
    - 调用OCR识别
    """

    # 标准字段映射
    FIELD_MAPPING = {
        "招录机关": "department_name",
        "部门名称": "department_name",
        "职位名称": "position_name",
        "岗位名称": "position_name",
        "职位代码": "position_code",
        "招录人数": "recruit_count",
        "学历": "education_min",
        "专业": "major_specific",
        "政治面貌": "political_status",
        "年龄": "age_requirement",
        "工作经历": "work_exp_requirement",
        "户籍": "hukou_requirement",
        "性别": "gender_required",
        "工作地点": "work_location",
        "备注": "notes",
    }

    def __init__(self, ocr_parser=None):
        """
        Args:
            ocr_parser: OCR解析器实例（用于扫描件识别）
        """
        self.ocr_parser = ocr_parser

        if pdfplumber is None:
            logger.warning("pdfplumber未安装，部分功能将不可用")

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """解析PDF文件

        Args:
            file_path: 文件路径

        Returns:
            解析后的数据列表
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")

        # 检查是否为扫描件
        if self._is_scanned_pdf(file_path):
            logger.info("检测到扫描件PDF，使用OCR识别")
            return self._parse_with_ocr(file_path)

        # 使用pdfplumber解析
        return self._parse_with_pdfplumber(file_path)

    def _parse_with_pdfplumber(self, file_path: str) -> List[Dict[str, Any]]:
        """使用pdfplumber解析PDF"""
        if pdfplumber is None:
            raise ImportError("需要安装pdfplumber库")

        all_results = []

        with pdfplumber.open(file_path) as pdf:
            logger.info(f"PDF文件共 {len(pdf.pages)} 页")

            for page_num, page in enumerate(pdf.pages, 1):
                # 提取表格
                tables = page.extract_tables()

                for table_idx, table in enumerate(tables):
                    if self._is_position_table(table):
                        results = self._parse_table(table)
                        logger.info(
                            f"第{page_num}页表格{table_idx+1}: {len(results)}条记录"
                        )
                        all_results.extend(results)

        return all_results

    def _parse_with_ocr(self, file_path: str) -> List[Dict[str, Any]]:
        """使用OCR解析PDF"""
        if self.ocr_parser is None:
            logger.error("OCR解析器未配置")
            return []

        # 将PDF转换为图片
        images = self._pdf_to_images(file_path)

        all_results = []
        for img_path in images:
            # OCR识别
            ocr_result = self.ocr_parser.parse_image(img_path)

            # 尝试从OCR结果提取表格
            if ocr_result.get("tables"):
                for table in ocr_result["tables"]:
                    if self._is_position_table(table):
                        results = self._parse_table(table)
                        all_results.extend(results)

        return all_results

    def _is_scanned_pdf(self, file_path: str) -> bool:
        """判断是否为扫描件PDF"""
        if pdfplumber is None:
            return False

        try:
            with pdfplumber.open(file_path) as pdf:
                if len(pdf.pages) == 0:
                    return False

                # 检查前几页
                for page in pdf.pages[:3]:
                    text = page.extract_text() or ""

                    # 如果提取到足够的文本，则不是扫描件
                    if len(text.strip()) > 100:
                        return False

                    # 检查是否有图片
                    if page.images:
                        # 有图片但没有文本，可能是扫描件
                        if len(text.strip()) < 50:
                            return True

                return False

        except Exception as e:
            logger.error(f"检测扫描件失败: {e}")
            return False

    def _pdf_to_images(self, file_path: str) -> List[str]:
        """将PDF转换为图片"""
        try:
            from pdf2image import convert_from_path

            output_dir = os.path.dirname(file_path)
            base_name = os.path.splitext(os.path.basename(file_path))[0]

            images = convert_from_path(file_path)

            image_paths = []
            for i, image in enumerate(images):
                img_path = os.path.join(output_dir, f"{base_name}_page_{i+1}.png")
                image.save(img_path, "PNG")
                image_paths.append(img_path)

            return image_paths

        except ImportError:
            logger.error("需要安装pdf2image库")
            return []
        except Exception as e:
            logger.error(f"PDF转图片失败: {e}")
            return []

    def _is_position_table(self, table: List[List]) -> bool:
        """判断是否为职位表"""
        if not table or len(table) < 2:
            return False

        # 检查表头行
        header_row = table[0]
        if not header_row:
            return False

        header_text = " ".join(str(cell or "") for cell in header_row)

        position_keywords = ["职位", "岗位", "部门", "学历", "专业", "人数"]
        match_count = sum(1 for kw in position_keywords if kw in header_text)

        return match_count >= 3

    def _parse_table(self, table: List[List]) -> List[Dict[str, Any]]:
        """解析表格数据"""
        if not table or len(table) < 2:
            return []

        # 获取表头
        headers = [str(cell or "").strip() for cell in table[0]]

        # 映射字段名
        mapped_headers = self._map_headers(headers)

        # 解析数据行
        results = []

        for row in table[1:]:
            if not row or not any(cell for cell in row):
                continue

            item = {}
            for col_idx, cell in enumerate(row):
                if col_idx < len(mapped_headers):
                    field_name = mapped_headers[col_idx]
                    if field_name and cell:
                        item[field_name] = str(cell).strip()

            if item:
                results.append(item)

        return results

    def _map_headers(self, headers: List[str]) -> List[Optional[str]]:
        """映射表头到标准字段名"""
        mapped = []

        for header in headers:
            if not header:
                mapped.append(None)
                continue

            # 精确匹配
            if header in self.FIELD_MAPPING:
                mapped.append(self.FIELD_MAPPING[header])
                continue

            # 模糊匹配
            matched = False
            for key, value in self.FIELD_MAPPING.items():
                if key in header or header in key:
                    mapped.append(value)
                    matched = True
                    break

            if not matched:
                field_name = re.sub(r"\s+", "_", header.lower())
                mapped.append(field_name)

        return mapped

    def extract_text(self, file_path: str) -> str:
        """提取PDF全部文本"""
        if pdfplumber is None:
            raise ImportError("需要安装pdfplumber库")

        text_parts = []

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    text_parts.append(text)

        return "\n\n".join(text_parts)

    def get_page_count(self, file_path: str) -> int:
        """获取PDF页数"""
        if pdfplumber:
            with pdfplumber.open(file_path) as pdf:
                return len(pdf.pages)
        elif PdfReader:
            reader = PdfReader(file_path)
            return len(reader.pages)
        else:
            raise ImportError("需要安装pdfplumber或PyPDF2库")
