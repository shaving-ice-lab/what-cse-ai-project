"""AI信息提取器

使用LLM从公告文本中提取结构化职位信息
"""

import json
import re
from typing import Any, Dict, List, Optional

from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from ..config import config


class AIExtractor:
    """AI信息提取器

    功能：
    - LLM API封装（支持OpenAI/Anthropic/智谱）
    - Prompt模板管理
    - 结构化输出解析
    - Token用量控制
    - 批量处理
    """

    # 职位信息提取Prompt模板
    POSITION_EXTRACTION_PROMPT = """你是公务员考试职位信息提取专家。请从以下公告内容中提取职位信息，并以JSON格式输出。

## 要求：
1. 严格按照字段定义提取信息
2. 无法确定的字段填null，不要猜测
3. 为每个主要字段提供confidence分数(0-100)
4. 识别出的不确定信息放入warnings数组

## 输出字段定义：
```json
{
  "positions": [
    {
      "position_name": "职位名称",
      "department_name": "招录机关名称",
      "department_code": "招录机关代码",
      "position_code": "职位代码",
      "recruit_count": 招录人数(数字),
      "work_location": "工作地点",
      "education_min": "最低学历要求(大专/本科/硕士/博士)",
      "degree_required": "是否要求学位(是/否/不限)",
      "major_specific": ["具体专业要求"],
      "major_unlimited": 是否专业不限(true/false),
      "political_status": "政治面貌要求(党员/团员/不限)",
      "age_max": 最大年龄(数字),
      "age_min": 最小年龄(数字),
      "work_exp_years_min": 最低工作年限(数字),
      "grassroots_exp_years": 基层工作经验年限(数字),
      "hukou_required": 是否限户籍(true/false),
      "hukou_provinces": ["限制的省份"],
      "gender_required": "性别要求(男/女/不限)",
      "fresh_graduate_only": 是否仅限应届生(true/false),
      "other_requirements": "其他条件",
      "notes": "备注"
    }
  ],
  "exam_info": {
    "exam_type": "考试类型(国考/省考/事业单位/选调生)",
    "registration_start": "报名开始日期(YYYY-MM-DD)",
    "registration_end": "报名截止日期(YYYY-MM-DD)",
    "exam_date_written": "笔试日期(YYYY-MM-DD)"
  },
  "confidence": 整体置信度(0-100),
  "warnings": ["提取过程中的警告信息"]
}
```

## 公告内容：
{content}

请提取并输出JSON："""

    # 公告类型识别Prompt
    ANNOUNCEMENT_TYPE_PROMPT = """请判断以下公告的类型，并以JSON格式输出。

公告类型包括：
- recruitment: 招录公告/招考公告
- registration_stats: 报名人数统计
- written_exam: 笔试公告/准考证公告
- score_release: 成绩公告
- qualification_review: 资格复审公告
- interview: 面试公告
- physical_exam: 体检公告
- political_review: 政审公告
- publicity: 拟录用公示
- supplement: 递补/调剂公告
- other: 其他

公告标题：{title}
公告内容（前500字）：{content}

请输出JSON格式：
{{"type": "类型代码", "confidence": 置信度0-100}}"""

    def __init__(self):
        self.ai_config = config.ai
        self.provider = self.ai_config.get("provider", "openai")
        self.client = None

        self._init_client()

    def _init_client(self):
        """初始化AI客户端"""
        if self.provider == "openai":
            try:
                from openai import OpenAI

                self.client = OpenAI(
                    api_key=self.ai_config.get("openai", {}).get("api_key"),
                    base_url=self.ai_config.get("openai", {}).get("api_base"),
                )
                logger.info("OpenAI客户端初始化成功")
            except Exception as e:
                logger.error(f"OpenAI客户端初始化失败: {e}")

        elif self.provider == "anthropic":
            try:
                from anthropic import Anthropic

                self.client = Anthropic(
                    api_key=self.ai_config.get("anthropic", {}).get("api_key"),
                )
                logger.info("Anthropic客户端初始化成功")
            except Exception as e:
                logger.error(f"Anthropic客户端初始化失败: {e}")

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def _call_llm(self, prompt: str, max_tokens: int = 4096) -> str:
        """调用LLM API"""
        if self.provider == "openai":
            return self._call_openai(prompt, max_tokens)
        elif self.provider == "anthropic":
            return self._call_anthropic(prompt, max_tokens)
        else:
            raise ValueError(f"不支持的AI提供商: {self.provider}")

    def _call_openai(self, prompt: str, max_tokens: int) -> str:
        """调用OpenAI API"""
        model = self.ai_config.get("openai", {}).get("model", "gpt-4o-mini")
        temperature = self.ai_config.get("openai", {}).get("temperature", 0.1)

        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "你是公务员考试数据处理专家，擅长从公告中提取结构化信息。",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )

        return response.choices[0].message.content

    def _call_anthropic(self, prompt: str, max_tokens: int) -> str:
        """调用Anthropic API"""
        model = self.ai_config.get("anthropic", {}).get(
            "model", "claude-3-haiku-20240307"
        )

        response = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text

    def extract_positions(self, content: str) -> Dict[str, Any]:
        """从公告内容提取职位信息

        Args:
            content: 公告文本内容

        Returns:
            提取结果
        """
        # 截断过长内容
        max_input_tokens = self.ai_config.get("max_input_tokens", 8000)
        if len(content) > max_input_tokens * 2:
            content = content[: max_input_tokens * 2]
            logger.warning("内容过长，已截断")

        prompt = self.POSITION_EXTRACTION_PROMPT.format(content=content)

        try:
            response = self._call_llm(prompt)
            result = self._parse_json_response(response)

            logger.info(
                f"提取完成: {len(result.get('positions', []))} 个职位, "
                f"置信度: {result.get('confidence', 0)}"
            )

            return result

        except Exception as e:
            logger.error(f"职位信息提取失败: {e}")
            return {
                "positions": [],
                "confidence": 0,
                "warnings": [str(e)],
                "error": True,
            }

    def identify_announcement_type(self, title: str, content: str) -> Dict[str, Any]:
        """识别公告类型

        Args:
            title: 公告标题
            content: 公告内容

        Returns:
            类型识别结果
        """
        # 只取前500字
        content_preview = content[:500] if len(content) > 500 else content

        prompt = self.ANNOUNCEMENT_TYPE_PROMPT.format(
            title=title, content=content_preview
        )

        try:
            response = self._call_llm(prompt, max_tokens=256)
            result = self._parse_json_response(response)

            return result

        except Exception as e:
            logger.error(f"公告类型识别失败: {e}")
            return {"type": "other", "confidence": 0}

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """解析JSON响应"""
        # 尝试提取JSON部分
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", response)
        if json_match:
            json_str = json_match.group(1)
        else:
            # 尝试直接解析
            json_str = response

        # 清理并解析
        json_str = json_str.strip()

        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # 尝试修复常见问题
            json_str = re.sub(r",\s*}", "}", json_str)
            json_str = re.sub(r",\s*]", "]", json_str)
            return json.loads(json_str)

    def batch_extract(
        self, contents: List[str], batch_size: int = 5
    ) -> List[Dict[str, Any]]:
        """批量提取职位信息

        Args:
            contents: 公告内容列表
            batch_size: 批量大小

        Returns:
            提取结果列表
        """
        results = []

        for i, content in enumerate(contents):
            logger.info(f"处理 {i+1}/{len(contents)}")
            result = self.extract_positions(content)
            results.append(result)

        return results
