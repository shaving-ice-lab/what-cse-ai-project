"""
数据库客户端模块 - 通过后端API直接导入内容到数据库
"""

import httpx
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from loguru import logger
from .config import get_config


@dataclass
class ImportResult:
    """导入结果"""
    success: bool
    message: str = ""
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class DBClient:
    """数据库客户端 - 通过后端API导入内容"""
    
    def __init__(self, api_base_url: Optional[str] = None):
        """
        初始化客户端
        
        Args:
            api_base_url: API基础URL，如果为None则从配置读取
        """
        config = get_config()
        self.api_base_url = api_base_url or config.api.backend_url
        self._client: Optional[httpx.Client] = None
    
    @property
    def client(self) -> httpx.Client:
        """获取HTTP客户端"""
        if self._client is None:
            self._client = httpx.Client(
                base_url=self.api_base_url,
                timeout=60.0,  # 导入可能需要较长时间
            )
        return self._client
    
    def check_connection(self) -> bool:
        """检查后端服务连接"""
        try:
            response = self.client.get("/health")
            return response.status_code == 200
        except Exception as e:
            logger.error(f"后端服务连接失败: {e}")
            return False
    
    def import_course_lesson(
        self,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ImportResult:
        """
        导入课程内容到数据库
        
        Args:
            content: 课程内容（符合v4.0格式）
            metadata: 元数据（行号、章节等）
            
        Returns:
            导入结果
        """
        try:
            # 添加元数据
            if metadata:
                content["_metadata"] = metadata
            
            response = self.client.post(
                "/api/v1/internal/content/import/course-lesson",
                json=content,
            )
            
            result = response.json()
            
            if response.status_code == 200 and result.get("code") == 0:
                return ImportResult(
                    success=True,
                    message=result.get("message", "导入成功"),
                    data=result.get("data"),
                )
            else:
                return ImportResult(
                    success=False,
                    error=result.get("message", f"HTTP {response.status_code}"),
                )
                
        except Exception as e:
            logger.error(f"导入课程失败: {e}")
            return ImportResult(success=False, error=str(e))
    
    def import_questions(
        self,
        batch_info: Dict[str, Any],
        questions: List[Dict[str, Any]],
    ) -> ImportResult:
        """
        导入题目到数据库
        
        Args:
            batch_info: 批次信息（分类、题型等）
            questions: 题目列表
            
        Returns:
            导入结果
        """
        try:
            # 转换题目格式
            converted_questions = []
            for q in questions:
                # 转换选项格式
                options = []
                for i, opt in enumerate(q.get("options", [])):
                    key = chr(ord('A') + i)
                    content = opt
                    # 解析 "A. xxx" 格式
                    if len(opt) > 2 and opt[1] == '.':
                        key = opt[0]
                        content = opt[3:].strip()
                    options.append({"key": key, "content": content})
                
                converted_questions.append({
                    "content": q.get("content", ""),
                    "options": options,
                    "answer": q.get("answer", ""),
                    "analysis": q.get("analysis", ""),
                    "difficulty": q.get("difficulty", 3),
                    "question_type": q.get("question_type", "single_choice"),
                    "source_type": "original",
                    "tags": q.get("knowledge_points", []),
                })
            
            request_data = {
                "category_name": batch_info.get("category", ""),
                "sub_category_name": batch_info.get("topic", ""),
                "questions": converted_questions,
            }
            
            response = self.client.post(
                "/api/v1/internal/content/import/questions",
                json=request_data,
            )
            
            result = response.json()
            
            if response.status_code == 200 and result.get("code") == 0:
                return ImportResult(
                    success=True,
                    message=result.get("message", "导入成功"),
                    data=result.get("data"),
                )
            else:
                return ImportResult(
                    success=False,
                    error=result.get("message", f"HTTP {response.status_code}"),
                )
                
        except Exception as e:
            logger.error(f"导入题目失败: {e}")
            return ImportResult(success=False, error=str(e))
    
    def import_materials(
        self,
        batch_info: Dict[str, Any],
        materials: List[Dict[str, Any]],
    ) -> ImportResult:
        """
        导入素材到数据库
        
        Args:
            batch_info: 批次信息（分类、类型等）
            materials: 素材列表
            
        Returns:
            导入结果
        """
        try:
            # 转换素材格式
            converted_materials = []
            for m in materials:
                # 构建完整内容
                content_parts = []
                
                # 核心金句
                if m.get("quote"):
                    content_parts.append(f"【核心金句】\n{m['quote']}")
                
                # 背景解读
                if m.get("content"):
                    content_parts.append(f"【背景解读】\n{m['content']}")
                
                # 使用场景
                if m.get("usage_scenarios"):
                    scenarios_text = "\n".join([
                        f"• {s['scenario']}：{s['example']}"
                        for s in m["usage_scenarios"]
                    ])
                    content_parts.append(f"【使用场景】\n{scenarios_text}")
                
                # 范文片段
                if m.get("writing_segments"):
                    segments_text = "\n".join([
                        f"【{s['type']}】\n{s['content']}"
                        for s in m["writing_segments"]
                    ])
                    content_parts.append(f"【范文片段】\n{segments_text}")
                
                # 拓展延伸
                if m.get("extension"):
                    ext = m["extension"]
                    ext_parts = []
                    if ext.get("related_quotes"):
                        ext_parts.append(f"相关金句：{'; '.join(ext['related_quotes'])}")
                    if ext.get("reading_suggestions"):
                        ext_parts.append(f"阅读建议：{ext['reading_suggestions']}")
                    if ext.get("exam_tips"):
                        ext_parts.append(f"备考提醒：{ext['exam_tips']}")
                    if ext_parts:
                        content_parts.append(f"【拓展延伸】\n" + "\n".join(ext_parts))
                
                full_content = "\n\n".join(content_parts)
                
                converted_materials.append({
                    "title": m.get("title", ""),
                    "content": full_content,
                    "source": m.get("source", ""),
                    "type": m.get("material_type", batch_info.get("category", "quote")),
                    "sub_type": batch_info.get("topic", ""),
                    "theme_topics": m.get("sub_themes", []),
                    "tags": m.get("tags", []),
                    "subject": "shenlun",  # 素材主要用于申论
                })
            
            request_data = {
                "category_name": batch_info.get("category", ""),
                "type": batch_info.get("category", "quote"),
                "items": converted_materials,
            }
            
            response = self.client.post(
                "/api/v1/internal/content/import/materials",
                json=request_data,
            )
            
            result = response.json()
            
            if response.status_code == 200 and result.get("code") == 0:
                return ImportResult(
                    success=True,
                    message=result.get("message", "导入成功"),
                    data=result.get("data"),
                )
            else:
                return ImportResult(
                    success=False,
                    error=result.get("message", f"HTTP {response.status_code}"),
                )
                
        except Exception as e:
            logger.error(f"导入素材失败: {e}")
            return ImportResult(success=False, error=str(e))
    
    def close(self):
        """关闭客户端"""
        if self._client:
            self._client.close()
            self._client = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
