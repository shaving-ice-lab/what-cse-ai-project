"""数据标准化器

将提取的原始数据标准化为统一格式
"""

import re
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from loguru import logger


class DataNormalizer:
    """数据标准化器

    功能：
    - 学历标准化映射
    - 专业标准化
    - 地区标准化
    - 年龄计算
    - 日期格式统一
    """

    # 学历标准化映射
    EDUCATION_MAPPING = {
        # 大专
        "大专": "大专",
        "专科": "大专",
        "高职": "大专",
        "高职高专": "大专",
        # 本科
        "本科": "本科",
        "大学本科": "本科",
        "全日制本科": "本科",
        "普通本科": "本科",
        "学士": "本科",
        # 硕士
        "硕士": "硕士",
        "硕士研究生": "硕士",
        "全日制硕士": "硕士",
        "研究生": "硕士",
        # 博士
        "博士": "博士",
        "博士研究生": "博士",
    }

    # 政治面貌映射
    POLITICAL_STATUS_MAPPING = {
        "中共党员": "党员",
        "党员": "党员",
        "共产党员": "党员",
        "预备党员": "预备党员",
        "中共预备党员": "预备党员",
        "共青团员": "团员",
        "团员": "团员",
        "群众": "群众",
        "无党派": "群众",
        "不限": "不限",
        "无要求": "不限",
    }

    # 性别映射
    GENDER_MAPPING = {
        "男": "男",
        "男性": "男",
        "限男": "男",
        "限男性": "男",
        "女": "女",
        "女性": "女",
        "限女": "女",
        "限女性": "女",
        "不限": "不限",
        "无要求": "不限",
    }

    def __init__(
        self, major_dict: Optional[Dict] = None, region_dict: Optional[Dict] = None
    ):
        """
        Args:
            major_dict: 专业词典
            region_dict: 地区词典
        """
        self.major_dict = major_dict or {}
        self.region_dict = region_dict or {}

    def normalize_position(self, position: Dict[str, Any]) -> Dict[str, Any]:
        """标准化单个职位数据

        Args:
            position: 原始职位数据

        Returns:
            标准化后的职位数据
        """
        normalized = {}

        # 基本信息
        normalized["position_name"] = self._clean_string(position.get("position_name"))
        normalized["department_name"] = self._clean_string(
            position.get("department_name")
        )
        normalized["department_code"] = self._clean_string(
            position.get("department_code")
        )
        normalized["position_code"] = self._clean_string(position.get("position_code"))

        # 招录人数
        normalized["recruit_count"] = self._normalize_number(
            position.get("recruit_count")
        )

        # 工作地点
        work_location = position.get("work_location", "")
        normalized["work_location"] = self._clean_string(work_location)
        location_info = self._normalize_region(work_location)
        normalized["work_location_province"] = location_info.get("province")
        normalized["work_location_city"] = location_info.get("city")
        normalized["work_location_district"] = location_info.get("district")

        # 学历要求
        normalized["education_min"] = self._normalize_education(
            position.get("education_min") or position.get("education")
        )
        normalized["degree_required"] = self._normalize_boolean(
            position.get("degree_required"), "是", "否", "不限"
        )

        # 专业要求
        major_specific = position.get("major_specific") or position.get("major")
        normalized["major_specific"] = self._normalize_majors(major_specific)
        normalized["major_unlimited"] = self._normalize_boolean(
            position.get("major_unlimited") or self._is_major_unlimited(major_specific)
        )

        # 政治面貌
        normalized["political_status"] = self._normalize_political_status(
            position.get("political_status")
        )

        # 年龄要求
        age_info = self._normalize_age(position)
        normalized["age_min"] = age_info.get("min")
        normalized["age_max"] = age_info.get("max")

        # 工作经验
        normalized["work_exp_years_min"] = self._normalize_number(
            position.get("work_exp_years_min") or position.get("work_exp")
        )
        normalized["grassroots_exp_years"] = self._normalize_number(
            position.get("grassroots_exp_years")
        )

        # 户籍要求
        normalized["hukou_required"] = self._normalize_boolean(
            position.get("hukou_required")
        )
        hukou_provinces = position.get("hukou_provinces")
        if isinstance(hukou_provinces, str):
            hukou_provinces = [
                p.strip() for p in hukou_provinces.split(",") if p.strip()
            ]
        normalized["hukou_provinces"] = hukou_provinces or []

        # 性别要求
        normalized["gender_required"] = self._normalize_gender(
            position.get("gender_required") or position.get("gender")
        )

        # 应届生
        normalized["fresh_graduate_only"] = self._normalize_boolean(
            position.get("fresh_graduate_only")
        )

        # 其他
        normalized["other_requirements"] = self._clean_string(
            position.get("other_requirements")
        )
        normalized["notes"] = self._clean_string(position.get("notes"))

        return normalized

    def normalize_exam_info(self, exam_info: Dict[str, Any]) -> Dict[str, Any]:
        """标准化考试信息"""
        normalized = {}

        normalized["exam_type"] = self._normalize_exam_type(exam_info.get("exam_type"))
        normalized["registration_start"] = self._normalize_date(
            exam_info.get("registration_start")
        )
        normalized["registration_end"] = self._normalize_date(
            exam_info.get("registration_end")
        )
        normalized["exam_date_written"] = self._normalize_date(
            exam_info.get("exam_date_written")
        )

        return normalized

    def _clean_string(self, value: Any) -> Optional[str]:
        """清洗字符串"""
        if value is None:
            return None

        value = str(value).strip()
        value = re.sub(r"\s+", " ", value)

        return value if value else None

    def _normalize_number(self, value: Any) -> Optional[int]:
        """标准化数值"""
        if value is None:
            return None

        if isinstance(value, (int, float)):
            return int(value)

        # 提取数字
        match = re.search(r"(\d+)", str(value))
        if match:
            return int(match.group(1))

        return None

    def _normalize_education(self, value: Any) -> Optional[str]:
        """标准化学历"""
        if value is None:
            return None

        value_str = str(value).strip()

        # 直接匹配
        if value_str in self.EDUCATION_MAPPING:
            return self.EDUCATION_MAPPING[value_str]

        # 模糊匹配
        for key, standard in self.EDUCATION_MAPPING.items():
            if key in value_str:
                return standard

        return value_str

    def _normalize_political_status(self, value: Any) -> str:
        """标准化政治面貌"""
        if value is None:
            return "不限"

        value_str = str(value).strip()

        if value_str in self.POLITICAL_STATUS_MAPPING:
            return self.POLITICAL_STATUS_MAPPING[value_str]

        for key, standard in self.POLITICAL_STATUS_MAPPING.items():
            if key in value_str:
                return standard

        return "不限"

    def _normalize_gender(self, value: Any) -> str:
        """标准化性别"""
        if value is None:
            return "不限"

        value_str = str(value).strip()

        if value_str in self.GENDER_MAPPING:
            return self.GENDER_MAPPING[value_str]

        for key, standard in self.GENDER_MAPPING.items():
            if key in value_str:
                return standard

        return "不限"

    def _normalize_boolean(
        self,
        value: Any,
        true_text: str = "是",
        false_text: str = "否",
        null_text: str = "不限",
    ) -> Optional[bool]:
        """标准化布尔值"""
        if value is None:
            return None

        if isinstance(value, bool):
            return value

        value_str = str(value).strip().lower()

        if value_str in ["true", "1", "yes", "是", true_text]:
            return True
        if value_str in ["false", "0", "no", "否", false_text]:
            return False

        return None

    def _normalize_age(self, position: Dict[str, Any]) -> Dict[str, Optional[int]]:
        """标准化年龄要求"""
        result = {"min": None, "max": None}

        # 直接字段
        if position.get("age_max"):
            result["max"] = self._normalize_number(position["age_max"])
        if position.get("age_min"):
            result["min"] = self._normalize_number(position["age_min"])

        # 从年龄描述提取
        age_text = position.get("age_requirement") or position.get("age")
        if age_text and isinstance(age_text, str):
            # 匹配 "35周岁以下" 或 "18-35岁"
            match = re.search(r"(\d+)\s*[-至到]\s*(\d+)", age_text)
            if match:
                result["min"] = int(match.group(1))
                result["max"] = int(match.group(2))
            else:
                match = re.search(r"(\d+)\s*(?:周)?岁以下", age_text)
                if match:
                    result["max"] = int(match.group(1))

        return result

    def _normalize_date(self, value: Any) -> Optional[str]:
        """标准化日期格式为 YYYY-MM-DD"""
        if value is None:
            return None

        value_str = str(value).strip()

        # 已经是标准格式
        if re.match(r"^\d{4}-\d{2}-\d{2}$", value_str):
            return value_str

        # 替换中文日期格式
        value_str = value_str.replace("年", "-").replace("月", "-").replace("日", "")
        value_str = value_str.replace("/", "-")

        # 提取日期部分
        match = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", value_str)
        if match:
            year = match.group(1)
            month = match.group(2).zfill(2)
            day = match.group(3).zfill(2)
            return f"{year}-{month}-{day}"

        return None

    def _normalize_majors(self, value: Any) -> List[str]:
        """标准化专业列表"""
        if value is None:
            return []

        if isinstance(value, list):
            return [self._clean_string(m) for m in value if m]

        value_str = str(value).strip()

        # 分割专业
        separators = r"[,，、;；/]"
        majors = re.split(separators, value_str)

        return [m.strip() for m in majors if m.strip()]

    def _is_major_unlimited(self, value: Any) -> bool:
        """判断是否专业不限"""
        if value is None:
            return False

        value_str = str(value).strip().lower()

        unlimited_keywords = ["不限", "无要求", "所有专业", "任意专业"]
        return any(kw in value_str for kw in unlimited_keywords)

    def _normalize_region(self, value: str) -> Dict[str, Optional[str]]:
        """标准化地区信息"""
        result = {"province": None, "city": None, "district": None}

        if not value:
            return result

        # 简单解析（实际应用中应使用地区词典）
        # 省级
        province_pattern = r"(北京|天津|上海|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|台湾|内蒙古|广西|西藏|宁夏|新疆|香港|澳门)"
        match = re.search(province_pattern, value)
        if match:
            result["province"] = match.group(1)

        # 市级
        city_pattern = r"(.+?市)"
        match = re.search(city_pattern, value)
        if match:
            result["city"] = match.group(1)

        # 区县
        district_pattern = r"(.+?[区县])"
        match = re.search(district_pattern, value)
        if match:
            result["district"] = match.group(1)

        return result

    def _normalize_exam_type(self, value: Any) -> str:
        """标准化考试类型"""
        if value is None:
            return "other"

        value_str = str(value).strip().lower()

        type_mapping = {
            "国考": "national_exam",
            "国家公务员": "national_exam",
            "省考": "provincial_exam",
            "省级公务员": "provincial_exam",
            "事业单位": "public_institution",
            "事业编": "public_institution",
            "选调生": "selected_students",
            "选调": "selected_students",
        }

        for key, standard in type_mapping.items():
            if key in value_str:
                return standard

        return "other"
