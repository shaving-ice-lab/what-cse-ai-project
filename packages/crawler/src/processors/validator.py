"""数据校验器

校验提取和标准化后的数据
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger


class DataValidator:
    """数据校验器

    功能：
    - 必填字段检查
    - 字段类型校验
    - 枚举值范围校验
    - 逻辑一致性校验
    - AI置信度评估
    """

    # 必填字段
    REQUIRED_FIELDS = [
        "position_name",
        "department_name",
        "recruit_count",
    ]

    # 字段类型定义
    FIELD_TYPES = {
        "position_name": str,
        "department_name": str,
        "department_code": str,
        "position_code": str,
        "recruit_count": int,
        "work_location": str,
        "education_min": str,
        "major_specific": list,
        "major_unlimited": bool,
        "political_status": str,
        "age_min": int,
        "age_max": int,
        "work_exp_years_min": int,
        "grassroots_exp_years": int,
        "hukou_required": bool,
        "hukou_provinces": list,
        "gender_required": str,
        "fresh_graduate_only": bool,
    }

    # 枚举值定义
    ENUM_VALUES = {
        "education_min": ["大专", "本科", "硕士", "博士"],
        "political_status": ["党员", "预备党员", "团员", "群众", "不限"],
        "gender_required": ["男", "女", "不限"],
    }

    # 数值范围
    VALUE_RANGES = {
        "recruit_count": (1, 1000),
        "age_min": (18, 35),
        "age_max": (25, 60),
        "work_exp_years_min": (0, 30),
        "grassroots_exp_years": (0, 10),
    }

    def __init__(self, confidence_threshold: int = 85):
        """
        Args:
            confidence_threshold: 置信度阈值，低于此值需人工复核
        """
        self.confidence_threshold = confidence_threshold

    def validate_position(
        self, position: Dict[str, Any]
    ) -> Tuple[bool, List[str], int]:
        """校验单个职位数据

        Args:
            position: 职位数据

        Returns:
            (是否有效, 错误列表, 置信度分数)
        """
        errors = []
        warnings = []
        confidence_deductions = 0

        # 1. 必填字段检查
        for field in self.REQUIRED_FIELDS:
            if not position.get(field):
                errors.append(f"缺少必填字段: {field}")
                confidence_deductions += 20

        # 2. 字段类型检查
        for field, expected_type in self.FIELD_TYPES.items():
            value = position.get(field)
            if value is not None and not isinstance(value, expected_type):
                # 尝试类型转换
                try:
                    if expected_type == int:
                        position[field] = int(value)
                    elif expected_type == bool:
                        position[field] = bool(value)
                    elif expected_type == list and isinstance(value, str):
                        position[field] = [value]
                except (ValueError, TypeError):
                    warnings.append(
                        f"字段类型不匹配: {field} 应为 {expected_type.__name__}"
                    )
                    confidence_deductions += 5

        # 3. 枚举值检查
        for field, valid_values in self.ENUM_VALUES.items():
            value = position.get(field)
            if value is not None and value not in valid_values:
                warnings.append(
                    f"字段值不在有效范围内: {field}={value}, 有效值={valid_values}"
                )
                confidence_deductions += 5

        # 4. 数值范围检查
        for field, (min_val, max_val) in self.VALUE_RANGES.items():
            value = position.get(field)
            if value is not None:
                if isinstance(value, (int, float)):
                    if value < min_val or value > max_val:
                        warnings.append(
                            f"字段值超出合理范围: {field}={value}, 范围=[{min_val}, {max_val}]"
                        )
                        confidence_deductions += 10

        # 5. 逻辑一致性检查
        logic_errors = self._check_logic_consistency(position)
        errors.extend(logic_errors)
        confidence_deductions += len(logic_errors) * 15

        # 计算置信度
        confidence = max(0, 100 - confidence_deductions)

        # 判断是否有效
        is_valid = len(errors) == 0 and confidence >= self.confidence_threshold

        all_messages = errors + warnings

        return is_valid, all_messages, confidence

    def _check_logic_consistency(self, position: Dict[str, Any]) -> List[str]:
        """检查逻辑一致性"""
        errors = []

        # 年龄范围检查
        age_min = position.get("age_min")
        age_max = position.get("age_max")
        if age_min is not None and age_max is not None:
            if age_min >= age_max:
                errors.append(f"年龄范围无效: min={age_min} >= max={age_max}")

        # 学历与学位检查
        education = position.get("education_min")
        degree = position.get("degree_required")
        if education == "大专" and degree == True:
            errors.append("大专学历通常不要求学位")

        # 应届生与工作经验检查
        fresh_only = position.get("fresh_graduate_only")
        work_exp = position.get("work_exp_years_min")
        if fresh_only and work_exp and work_exp > 0:
            errors.append("应届生岗位不应要求工作经验")

        return errors

    def validate_batch(
        self, positions: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], Dict[str, Any]]:
        """批量校验职位数据

        Args:
            positions: 职位数据列表

        Returns:
            (有效数据列表, 需复核数据列表, 统计信息)
        """
        valid_positions = []
        review_positions = []

        stats = {
            "total": len(positions),
            "valid": 0,
            "needs_review": 0,
            "invalid": 0,
            "avg_confidence": 0,
        }

        total_confidence = 0

        for position in positions:
            is_valid, messages, confidence = self.validate_position(position)

            position["_validation"] = {
                "is_valid": is_valid,
                "messages": messages,
                "confidence": confidence,
            }

            total_confidence += confidence

            if is_valid:
                valid_positions.append(position)
                stats["valid"] += 1
            elif confidence >= 60:  # 60-85之间需要复核
                review_positions.append(position)
                stats["needs_review"] += 1
            else:
                stats["invalid"] += 1
                logger.warning(
                    f"数据无效: {position.get('position_name')} - {messages}"
                )

        if positions:
            stats["avg_confidence"] = total_confidence / len(positions)

        logger.info(
            f"批量校验完成: 有效={stats['valid']}, "
            f"需复核={stats['needs_review']}, "
            f"无效={stats['invalid']}, "
            f"平均置信度={stats['avg_confidence']:.1f}"
        )

        return valid_positions, review_positions, stats

    def validate_exam_info(self, exam_info: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """校验考试信息"""
        errors = []

        # 日期校验
        start_date = exam_info.get("registration_start")
        end_date = exam_info.get("registration_end")
        exam_date = exam_info.get("exam_date_written")

        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, "%Y-%m-%d")
                end = datetime.strptime(end_date, "%Y-%m-%d")
                if start >= end:
                    errors.append("报名开始日期应早于结束日期")
            except ValueError as e:
                errors.append(f"日期格式错误: {e}")

        if end_date and exam_date:
            try:
                end = datetime.strptime(end_date, "%Y-%m-%d")
                exam = datetime.strptime(exam_date, "%Y-%m-%d")
                if end >= exam:
                    errors.append("报名截止日期应早于笔试日期")
            except ValueError as e:
                errors.append(f"日期格式错误: {e}")

        return len(errors) == 0, errors

    def needs_manual_review(self, position: Dict[str, Any]) -> bool:
        """判断是否需要人工复核"""
        validation = position.get("_validation", {})
        confidence = validation.get("confidence", 0)

        return confidence < self.confidence_threshold
