"""
提示词模板模块
"""

from .course import get_course_prompt
from .question import get_question_prompt
from .material import get_material_prompt
from .category import (
    CATEGORY_SYSTEM_PROMPT,
    build_category_prompt,
    build_batch_category_prompt,
    DEFAULT_DESCRIPTIONS,
)

__all__ = [
    "get_course_prompt",
    "get_question_prompt",
    "get_material_prompt",
    "CATEGORY_SYSTEM_PROMPT",
    "build_category_prompt",
    "build_batch_category_prompt",
    "DEFAULT_DESCRIPTIONS",
]
