"""HTML表格解析器"""

import re
from typing import Any, Dict, List, Optional, Union

from bs4 import BeautifulSoup, Tag
from loguru import logger


class HTMLParser:
    """HTML表格解析器

    功能：
    - 表格识别与提取
    - 表头映射
    - 合并单元格处理
    - 嵌套表格处理
    """

    # 标准字段映射
    FIELD_MAPPING = {
        # 职位信息
        "招录机关": "department_name",
        "部门名称": "department_name",
        "用人单位": "department_name",
        "职位名称": "position_name",
        "岗位名称": "position_name",
        "职位代码": "position_code",
        "岗位代码": "position_code",
        "招录人数": "recruit_count",
        "招考人数": "recruit_count",
        "录用计划": "recruit_count",
        # 学历要求
        "学历": "education_min",
        "学历要求": "education_min",
        "最低学历": "education_min",
        "学位": "degree_required",
        "学位要求": "degree_required",
        # 专业要求
        "专业": "major_specific",
        "专业要求": "major_specific",
        "所学专业": "major_specific",
        "专业类别": "major_category",
        # 其他要求
        "政治面貌": "political_status",
        "年龄": "age_requirement",
        "年龄要求": "age_requirement",
        "工作经历": "work_exp_requirement",
        "基层工作经历": "grassroots_exp_years",
        "户籍": "hukou_requirement",
        "户籍要求": "hukou_requirement",
        "性别": "gender_required",
        "性别要求": "gender_required",
        # 地点信息
        "工作地点": "work_location",
        "工作地区": "work_location",
        # 其他
        "备注": "notes",
        "其他条件": "other_requirements",
        "考试类别": "exam_category",
    }

    def __init__(self):
        pass

    def parse_table(
        self,
        table: Union[Tag, str],
        skip_header: bool = True,
    ) -> List[Dict[str, Any]]:
        """解析HTML表格

        Args:
            table: BeautifulSoup Tag对象或HTML字符串
            skip_header: 是否跳过表头行

        Returns:
            解析后的数据列表
        """
        if isinstance(table, str):
            soup = BeautifulSoup(table, "lxml")
            table = soup.find("table")

        if not table:
            return []

        # 处理合并单元格
        table_data = self._expand_merged_cells(table)

        if not table_data:
            return []

        # 识别表头
        headers = self._identify_headers(table_data)

        if not headers:
            logger.warning("未能识别表头")
            return []

        # 映射字段名
        mapped_headers = self._map_headers(headers)

        # 解析数据行
        results = []
        start_row = 1 if skip_header else 0

        for row_idx in range(start_row, len(table_data)):
            row_data = table_data[row_idx]

            if not any(cell.strip() for cell in row_data):
                continue  # 跳过空行

            item = {}
            for col_idx, value in enumerate(row_data):
                if col_idx < len(mapped_headers):
                    field_name = mapped_headers[col_idx]
                    if field_name:
                        item[field_name] = self._clean_value(value)

            if item:
                results.append(item)

        logger.info(f"HTML表格解析完成: {len(results)} 条记录")
        return results

    def _expand_merged_cells(self, table: Tag) -> List[List[str]]:
        """展开合并单元格"""
        rows = table.find_all("tr")
        if not rows:
            return []

        # 计算最大列数
        max_cols = 0
        for row in rows:
            col_count = 0
            for cell in row.find_all(["td", "th"]):
                colspan = int(cell.get("colspan", 1))
                col_count += colspan
            max_cols = max(max_cols, col_count)

        # 初始化结果矩阵
        result = [["" for _ in range(max_cols)] for _ in range(len(rows))]

        # 记录被rowspan占用的单元格
        occupied = [[False for _ in range(max_cols)] for _ in range(len(rows))]

        for row_idx, row in enumerate(rows):
            col_idx = 0
            cells = row.find_all(["td", "th"])
            cell_idx = 0

            while col_idx < max_cols and cell_idx < len(cells):
                # 跳过被rowspan占用的单元格
                while col_idx < max_cols and occupied[row_idx][col_idx]:
                    col_idx += 1

                if col_idx >= max_cols:
                    break

                cell = cells[cell_idx]
                text = cell.get_text(strip=True)

                rowspan = int(cell.get("rowspan", 1))
                colspan = int(cell.get("colspan", 1))

                # 填充单元格
                for r in range(rowspan):
                    for c in range(colspan):
                        target_row = row_idx + r
                        target_col = col_idx + c

                        if target_row < len(result) and target_col < max_cols:
                            result[target_row][target_col] = text
                            if r > 0 or c > 0:
                                occupied[target_row][target_col] = True

                col_idx += colspan
                cell_idx += 1

        return result

    def _identify_headers(self, table_data: List[List[str]]) -> List[str]:
        """识别表头"""
        if not table_data:
            return []

        # 尝试第一行作为表头
        first_row = table_data[0]

        # 检查是否包含常见表头关键词
        header_keywords = list(self.FIELD_MAPPING.keys())

        match_count = sum(
            1 for cell in first_row if any(kw in cell for kw in header_keywords)
        )

        if match_count >= 2:
            return first_row

        # 尝试第二行（可能有标题行）
        if len(table_data) > 1:
            second_row = table_data[1]
            match_count = sum(
                1 for cell in second_row if any(kw in cell for kw in header_keywords)
            )
            if match_count >= 2:
                return second_row

        return first_row

    def _map_headers(self, headers: List[str]) -> List[Optional[str]]:
        """将表头映射到标准字段名"""
        mapped = []

        for header in headers:
            header_clean = header.strip()

            # 精确匹配
            if header_clean in self.FIELD_MAPPING:
                mapped.append(self.FIELD_MAPPING[header_clean])
                continue

            # 模糊匹配
            matched = False
            for key, value in self.FIELD_MAPPING.items():
                if key in header_clean or header_clean in key:
                    mapped.append(value)
                    matched = True
                    break

            if not matched:
                # 保留原始字段名（转为下划线格式）
                field_name = re.sub(r"\s+", "_", header_clean.lower())
                mapped.append(field_name if field_name else None)

        return mapped

    def _clean_value(self, value: str) -> str:
        """清洗数据值"""
        if not value:
            return ""

        # 去除多余空白
        value = re.sub(r"\s+", " ", value.strip())

        # 去除特殊字符
        value = value.replace("\n", " ").replace("\r", "")

        return value

    def extract_tables(self, html: str) -> List[Tag]:
        """从HTML中提取所有表格"""
        soup = BeautifulSoup(html, "lxml")
        return soup.find_all("table")

    def find_position_table(self, html: str) -> Optional[Tag]:
        """查找职位表格"""
        tables = self.extract_tables(html)

        for table in tables:
            # 检查是否为职位表
            first_row = table.find("tr")
            if first_row:
                headers = [
                    cell.get_text(strip=True)
                    for cell in first_row.find_all(["th", "td"])
                ]

                # 职位表特征
                position_keywords = ["职位", "岗位", "部门", "学历", "专业", "人数"]
                match_count = sum(
                    1 for h in headers if any(kw in h for kw in position_keywords)
                )

                if match_count >= 3:
                    return table

        return None
