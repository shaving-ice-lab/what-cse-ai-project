"""
提示词模板模块
"""

from .course import get_course_prompt
from .question import get_question_prompt
from .material import get_material_prompt

__all__ = ["get_course_prompt", "get_question_prompt", "get_material_prompt"]
