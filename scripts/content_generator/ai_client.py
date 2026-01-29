"""
AI API 客户端模块
"""

import json
import time
import asyncio
from typing import Optional, Dict, Any, AsyncGenerator, Generator
from dataclasses import dataclass
from openai import OpenAI, AsyncOpenAI
from loguru import logger
from .config import get_config, APIConfig


@dataclass
class GenerationResult:
    """生成结果"""
    success: bool
    content: Optional[str] = None
    parsed_json: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    usage: Optional[Dict[str, int]] = None
    duration: float = 0
    model_used: Optional[str] = None  # 使用的模型


class AIClient:
    """AI API 客户端"""
    
    def __init__(self, api_config: Optional[APIConfig] = None):
        """
        初始化客户端
        
        Args:
            api_config: API 配置，如果为 None 则从全局配置读取
        """
        self.config = api_config or get_config().api
        
        # 同步客户端
        self._client: Optional[OpenAI] = None
        # 异步客户端
        self._async_client: Optional[AsyncOpenAI] = None
    
    @property
    def client(self) -> OpenAI:
        """获取同步客户端"""
        if self._client is None:
            self._client = OpenAI(
                api_key=self.config.api_key,
                base_url=self.config.base_url,
            )
        return self._client
    
    @property
    def async_client(self) -> AsyncOpenAI:
        """获取异步客户端"""
        if self._async_client is None:
            self._async_client = AsyncOpenAI(
                api_key=self.config.api_key,
                base_url=self.config.base_url,
            )
        return self._async_client
    
    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = True,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None,
    ) -> GenerationResult:
        """
        同步生成内容
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            json_mode: 是否启用 JSON 模式
            temperature: 温度参数
            max_tokens: 最大 token 数
            model: 指定模型（可选，默认使用多模型轮换）
            
        Returns:
            生成结果
        """
        start_time = time.time()
        
        # 获取要使用的模型
        current_model = model or self.config.get_next_model()
        tried_models = set()
        
        for attempt in range(self.config.max_retries):
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
                
                kwargs: Dict[str, Any] = {
                    "model": current_model,
                    "messages": messages,
                    "temperature": temperature or self.config.temperature,
                    "max_tokens": max_tokens or self.config.max_tokens,
                }
                
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                
                logger.info(f"使用模型: {current_model}")
                response = self.client.chat.completions.create(**kwargs)
                
                content = response.choices[0].message.content or ""
                duration = time.time() - start_time
                finish_reason = response.choices[0].finish_reason
                
                # 检查是否因为长度限制被截断
                if finish_reason == "length":
                    logger.error(f"响应被截断！finish_reason={finish_reason}，输出 token 数已达上限")
                    logger.error("建议：增加 MAX_TOKENS 配置或简化生成内容")
                    return GenerationResult(
                        success=False,
                        content=content,
                        error=f"响应被截断：输出 token 已达上限 (completion_tokens: {response.usage.completion_tokens if response.usage else 'unknown'})，请增加 MAX_TOKENS",
                        usage={
                            "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                            "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                            "total_tokens": response.usage.total_tokens if response.usage else 0,
                        },
                        duration=duration,
                        model_used=current_model,
                    )
                
                # 解析 JSON
                parsed_json = None
                json_error = None
                if json_mode and content:
                    try:
                        # 清理可能的 markdown 代码块包装
                        clean_content = content.strip()
                        if clean_content.startswith("```json"):
                            clean_content = clean_content[7:]
                        elif clean_content.startswith("```"):
                            clean_content = clean_content[3:]
                        if clean_content.endswith("```"):
                            clean_content = clean_content[:-3]
                        clean_content = clean_content.strip()
                        
                        parsed_json = json.loads(clean_content)
                    except json.JSONDecodeError as e:
                        json_error = str(e)
                        logger.warning(f"JSON 解析失败: {e}")
                        # 尝试定位错误位置附近的内容
                        error_pos = e.pos if hasattr(e, 'pos') else 0
                        start = max(0, error_pos - 100)
                        end = min(len(clean_content), error_pos + 100)
                        logger.warning(f"错误位置附近内容: ...{clean_content[start:end]}...")
                
                # 如果是 JSON 模式但解析失败，返回失败
                if json_mode and parsed_json is None:
                    return GenerationResult(
                        success=False,
                        content=content,
                        error=f"JSON 解析失败: {json_error or '内容为空'}",
                        usage={
                            "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                            "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                            "total_tokens": response.usage.total_tokens if response.usage else 0,
                        },
                        duration=duration,
                        model_used=current_model,
                    )
                
                return GenerationResult(
                    success=True,
                    content=content,
                    parsed_json=parsed_json,
                    usage={
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0,
                    },
                    duration=duration,
                    model_used=current_model,
                )
                
            except Exception as e:
                logger.error(f"模型 {current_model} 生成失败 (尝试 {attempt + 1}/{self.config.max_retries}): {e}")
                tried_models.add(current_model)
                
                # 尝试切换到备用模型
                if self.config.model_strategy == "primary_fallback":
                    fallback = self.config.get_fallback_model(current_model)
                    if fallback and fallback not in tried_models:
                        logger.info(f"切换到备用模型: {fallback}")
                        current_model = fallback
                        continue
                
                if attempt < self.config.max_retries - 1:
                    time.sleep(self.config.retry_delay)
                else:
                    return GenerationResult(
                        success=False,
                        error=str(e),
                        duration=time.time() - start_time,
                        model_used=current_model,
                    )
        
        return GenerationResult(success=False, error="未知错误")
    
    async def generate_async(
        self,
        system_prompt: str,
        user_prompt: str,
        json_mode: bool = True,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        model: Optional[str] = None,
    ) -> GenerationResult:
        """
        异步生成内容
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            json_mode: 是否启用 JSON 模式
            temperature: 温度参数
            max_tokens: 最大 token 数
            model: 指定模型（可选，默认使用多模型轮换）
            
        Returns:
            生成结果
        """
        start_time = time.time()
        
        # 获取要使用的模型
        current_model = model or self.config.get_next_model()
        tried_models = set()
        
        for attempt in range(self.config.max_retries):
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
                
                kwargs: Dict[str, Any] = {
                    "model": current_model,
                    "messages": messages,
                    "temperature": temperature or self.config.temperature,
                    "max_tokens": max_tokens or self.config.max_tokens,
                }
                
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}
                
                logger.info(f"使用模型: {current_model}")
                response = await self.async_client.chat.completions.create(**kwargs)
                
                content = response.choices[0].message.content or ""
                duration = time.time() - start_time
                finish_reason = response.choices[0].finish_reason
                
                # 检查是否因为长度限制被截断
                if finish_reason == "length":
                    logger.error(f"响应被截断！finish_reason={finish_reason}，输出 token 数已达上限")
                    logger.error("建议：增加 MAX_TOKENS 配置或简化生成内容")
                    return GenerationResult(
                        success=False,
                        content=content,
                        error=f"响应被截断：输出 token 已达上限 (completion_tokens: {response.usage.completion_tokens if response.usage else 'unknown'})，请增加 MAX_TOKENS",
                        usage={
                            "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                            "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                            "total_tokens": response.usage.total_tokens if response.usage else 0,
                        },
                        duration=duration,
                        model_used=current_model,
                    )
                
                # 解析 JSON
                parsed_json = None
                json_error = None
                if json_mode and content:
                    try:
                        # 清理可能的 markdown 代码块包装
                        clean_content = content.strip()
                        if clean_content.startswith("```json"):
                            clean_content = clean_content[7:]
                        elif clean_content.startswith("```"):
                            clean_content = clean_content[3:]
                        if clean_content.endswith("```"):
                            clean_content = clean_content[:-3]
                        clean_content = clean_content.strip()
                        
                        parsed_json = json.loads(clean_content)
                    except json.JSONDecodeError as e:
                        json_error = str(e)
                        logger.warning(f"JSON 解析失败: {e}")
                        # 尝试定位错误位置附近的内容
                        error_pos = e.pos if hasattr(e, 'pos') else 0
                        start = max(0, error_pos - 100)
                        end = min(len(clean_content), error_pos + 100)
                        logger.warning(f"错误位置附近内容: ...{clean_content[start:end]}...")
                
                # 如果是 JSON 模式但解析失败，返回失败
                if json_mode and parsed_json is None:
                    return GenerationResult(
                        success=False,
                        content=content,
                        error=f"JSON 解析失败: {json_error or '内容为空'}",
                        usage={
                            "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                            "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                            "total_tokens": response.usage.total_tokens if response.usage else 0,
                        },
                        duration=duration,
                        model_used=current_model,
                    )
                
                return GenerationResult(
                    success=True,
                    content=content,
                    parsed_json=parsed_json,
                    usage={
                        "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                        "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                        "total_tokens": response.usage.total_tokens if response.usage else 0,
                    },
                    duration=duration,
                    model_used=current_model,
                )
                
            except Exception as e:
                logger.error(f"模型 {current_model} 生成失败 (尝试 {attempt + 1}/{self.config.max_retries}): {e}")
                tried_models.add(current_model)
                
                # 尝试切换到备用模型
                if self.config.model_strategy == "primary_fallback":
                    fallback = self.config.get_fallback_model(current_model)
                    if fallback and fallback not in tried_models:
                        logger.info(f"切换到备用模型: {fallback}")
                        current_model = fallback
                        continue
                
                if attempt < self.config.max_retries - 1:
                    await asyncio.sleep(self.config.retry_delay)
                else:
                    return GenerationResult(
                        success=False,
                        error=str(e),
                        duration=time.time() - start_time,
                        model_used=current_model,
                    )
        
        return GenerationResult(success=False, error="未知错误")
    
    def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Generator[str, None, None]:
        """
        流式生成内容
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            temperature: 温度参数
            max_tokens: 最大 token 数
            
        Yields:
            内容片段
        """
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
            
            response = self.client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                temperature=temperature or self.config.temperature,
                max_tokens=max_tokens or self.config.max_tokens,
                stream=True,
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"流式生成失败: {e}")
            raise
    
    async def generate_stream_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """
        异步流式生成内容
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            temperature: 温度参数
            max_tokens: 最大 token 数
            
        Yields:
            内容片段
        """
        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
            
            response = await self.async_client.chat.completions.create(
                model=self.config.model,
                messages=messages,
                temperature=temperature or self.config.temperature,
                max_tokens=max_tokens or self.config.max_tokens,
                stream=True,
            )
            
            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"异步流式生成失败: {e}")
            raise
