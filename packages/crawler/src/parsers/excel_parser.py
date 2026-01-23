"""Excel解析器"""

import re
from typing import Any, Dict, List, Optional

import pandas as pd
from loguru import logger


class ExcelParser:
    """Excel文件解析器

    功能：
    - 使用pandas读取Excel文件
    - 多Sheet处理
    - 表头识别
    - 合并单元格处理
    - 数据类型转换
    """

    # 标准字段映射（同HTML解析器）
    FIELD_MAPPING = {
        "招录机关": "department_name",
        "部门名称": "department_name",
        "用人单位": "department_name",
        "职位名称": "position_name",
        "岗位名称": "position_name",
        "职位代码": "position_code",
        "岗位代码": "position_code",
        "招录人数": "recruit_count",
        "招考人数": "recruit_count",
        "学历": "education_min",
        "学历要求": "education_min",
        "专业": "major_specific",
        "专业要求": "major_specific",
        "政治面貌": "political_status",
        "年龄": "age_requirement",
        "工作经历": "work_exp_requirement",
        "基层工作经历": "grassroots_exp_years",
        "户籍": "hukou_requirement",
        "性别": "gender_required",
        "工作地点": "work_location",
        "备注": "notes",
        "其他条件": "other_requirements",
    }

    def __init__(self):
        pass

    def parse(
        self,
        file_path: str,
        sheet_name: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """解析Excel文件

        Args:
            file_path: 文件路径
            sheet_name: 指定工作表名称，None表示自动识别

        Returns:
            解析后的数据列表
        """
        try:
            # 读取所有工作表
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names

            logger.info(f"Excel文件包含 {len(sheet_names)} 个工作表: {sheet_names}")

            all_results = []

            for name in sheet_names:
                if sheet_name and name != sheet_name:
                    continue

                df = pd.read_excel(file_path, sheet_name=name, header=None)

                # 检查是否为职位表
                if not self._is_position_sheet(df):
                    logger.debug(f"工作表 '{name}' 不是职位表，跳过")
                    continue

                # 解析工作表
                results = self._parse_sheet(df)

                if results:
                    logger.info(f"工作表 '{name}' 解析出 {len(results)} 条记录")
                    all_results.extend(results)

            return all_results

        except Exception as e:
            logger.error(f"Excel文件解析失败: {file_path} -> {e}")
            raise

    def _is_position_sheet(self, df: pd.DataFrame) -> bool:
        """判断是否为职位表工作表"""
        if df.empty:
            return False

        # 检查前几行是否包含职位表特征
        position_keywords = ["职位", "岗位", "部门", "学历", "专业", "人数", "招录"]

        for row_idx in range(min(5, len(df))):
            row_text = " ".join(str(v) for v in df.iloc[row_idx].values if pd.notna(v))
            match_count = sum(1 for kw in position_keywords if kw in row_text)
            if match_count >= 3:
                return True

        return False

    def _parse_sheet(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """解析工作表"""
        # 查找表头行
        header_row = self._find_header_row(df)

        if header_row is None:
            logger.warning("未能找到表头行")
            return []

        # 获取表头
        headers = df.iloc[header_row].values.tolist()

        # 映射字段名
        mapped_headers = self._map_headers(headers)

        # 解析数据行
        results = []

        for row_idx in range(header_row + 1, len(df)):
            row = df.iloc[row_idx]

            # 跳过空行
            if row.isna().all():
                continue

            item = {}
            for col_idx, value in enumerate(row.values):
                if col_idx < len(mapped_headers):
                    field_name = mapped_headers[col_idx]
                    if field_name and pd.notna(value):
                        item[field_name] = self._convert_value(value)

            if item:
                results.append(item)

        return results

    def _find_header_row(self, df: pd.DataFrame) -> Optional[int]:
        """查找表头行"""
        header_keywords = list(self.FIELD_MAPPING.keys())

        for row_idx in range(min(10, len(df))):
            row = df.iloc[row_idx]
            row_values = [str(v) if pd.notna(v) else "" for v in row.values]

            match_count = sum(
                1 for cell in row_values if any(kw in cell for kw in header_keywords)
            )

            if match_count >= 3:
                return row_idx

        return None

    def _map_headers(self, headers: List) -> List[Optional[str]]:
        """映射表头到标准字段名"""
        mapped = []

        for header in headers:
            header_str = str(header).strip() if pd.notna(header) else ""

            if not header_str:
                mapped.append(None)
                continue

            # 精确匹配
            if header_str in self.FIELD_MAPPING:
                mapped.append(self.FIELD_MAPPING[header_str])
                continue

            # 模糊匹配
            matched = False
            for key, value in self.FIELD_MAPPING.items():
                if key in header_str or header_str in key:
                    mapped.append(value)
                    matched = True
                    break

            if not matched:
                field_name = re.sub(r"\s+", "_", header_str.lower())
                mapped.append(field_name)

        return mapped

    def _convert_value(self, value: Any) -> Any:
        """转换数据值"""
        if pd.isna(value):
            return None

        # 数值类型
        if isinstance(value, (int, float)):
            if value == int(value):
                return int(value)
            return value

        # 字符串类型
        value_str = str(value).strip()

        # 清洗字符串
        value_str = re.sub(r"\s+", " ", value_str)

        return value_str

    def get_sheet_names(self, file_path: str) -> List[str]:
        """获取所有工作表名称"""
        excel_file = pd.ExcelFile(file_path)
        return excel_file.sheet_names

    def preview(self, file_path: str, rows: int = 10) -> Dict[str, pd.DataFrame]:
        """预览Excel文件内容"""
        excel_file = pd.ExcelFile(file_path)
        preview_data = {}

        for sheet_name in excel_file.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=rows)
            preview_data[sheet_name] = df

        return preview_data
