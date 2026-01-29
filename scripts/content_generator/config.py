"""
配置管理模块
"""

import os
import random
from pathlib import Path
from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from dotenv import load_dotenv


class APIConfig(BaseModel):
    """AI API 配置"""
    api_key: str = Field(default="", description="API 密钥")
    base_url: str = Field(default="https://api.openai.com/v1", description="API 基础 URL")
    model: str = Field(default="gpt-4o", description="默认模型名称")
    # 多模型支持
    models: List[str] = Field(default_factory=list, description="多模型列表")
    model_strategy: Literal["round_robin", "random", "primary_fallback"] = Field(
        default="round_robin", description="模型选择策略"
    )
    _model_index: int = 0  # 轮换索引
    
    max_tokens: int = Field(default=65536, description="最大 token 数（生成长内容需要更高值）")
    temperature: float = Field(default=0.7, description="温度参数")
    max_retries: int = Field(default=3, description="最大重试次数")
    retry_delay: int = Field(default=5, description="重试延迟(秒)")
    # 后端服务配置
    backend_url: str = Field(default="http://localhost:8080", description="后端服务 URL")
    
    class Config:
        underscore_attrs_are_private = True
    
    def get_next_model(self) -> str:
        """
        获取下一个要使用的模型
        
        Returns:
            模型名称
        """
        # 如果没有配置多模型，使用默认模型
        if not self.models:
            return self.model
        
        if self.model_strategy == "round_robin":
            # 轮换策略
            model = self.models[self._model_index % len(self.models)]
            self._model_index += 1
            return model
        elif self.model_strategy == "random":
            # 随机策略
            return random.choice(self.models)
        else:
            # primary_fallback: 默认使用第一个，失败时使用其他
            return self.models[0]
    
    def get_fallback_model(self, failed_model: str) -> Optional[str]:
        """
        获取备用模型（当主模型失败时）
        
        Args:
            failed_model: 失败的模型名称
            
        Returns:
            备用模型名称，如果没有则返回 None
        """
        if not self.models or len(self.models) < 2:
            return None
        
        available = [m for m in self.models if m != failed_model]
        return random.choice(available) if available else None
    
    @property
    def model_count(self) -> int:
        """获取模型数量"""
        return len(self.models) if self.models else 1
    
    @property
    def model_list_str(self) -> str:
        """获取模型列表字符串"""
        if self.models:
            return ", ".join(self.models)
        return self.model


class PathConfig(BaseModel):
    """路径配置"""
    project_root: Path = Field(default=Path("../.."), description="项目根目录")
    todolist_file: str = Field(default="docs/content-creation-todolist.md", description="任务文件")
    output_dir: str = Field(default="scripts/generated", description="输出目录")
    
    @property
    def todolist_path(self) -> Path:
        """获取任务文件完整路径"""
        return self.project_root / self.todolist_file
    
    @property
    def output_path(self) -> Path:
        """获取输出目录完整路径"""
        return self.project_root / self.output_dir
    
    @property
    def courses_dir(self) -> Path:
        """课程输出目录"""
        return self.output_path / "courses"
    
    @property
    def questions_dir(self) -> Path:
        """题目输出目录"""
        return self.output_path / "questions"
    
    @property
    def materials_dir(self) -> Path:
        """素材输出目录"""
        return self.output_path / "materials"


class GenerationConfig(BaseModel):
    """生成配置"""
    concurrent_tasks: int = Field(default=1, description="并发任务数")
    batch_size: int = Field(default=5, description="批量获取任务数")
    continuous_mode: bool = Field(default=False, description="持续生成模式")
    auto_mark_complete: bool = Field(default=True, description="自动标记任务完成")


class Config(BaseModel):
    """全局配置"""
    api: APIConfig = Field(default_factory=APIConfig)
    paths: PathConfig = Field(default_factory=PathConfig)
    generation: GenerationConfig = Field(default_factory=GenerationConfig)
    
    @classmethod
    def load(cls, env_file: Optional[str] = None) -> "Config":
        """从环境变量加载配置"""
        # 加载 .env 文件
        if env_file:
            load_dotenv(env_file)
        else:
            # 尝试从多个位置加载
            script_dir = Path(__file__).parent
            for env_path in [
                script_dir / ".env",
                script_dir.parent.parent / ".env",
            ]:
                if env_path.exists():
                    load_dotenv(env_path)
                    break
        
        # 解析项目根目录
        project_root_str = os.getenv("PROJECT_ROOT", "../..")
        if Path(project_root_str).is_absolute():
            project_root = Path(project_root_str)
        else:
            project_root = (Path(__file__).parent / project_root_str).resolve()
        
        # 解析多模型配置
        model_names_str = os.getenv("MODEL_NAMES", "")
        models = [m.strip() for m in model_names_str.split(",") if m.strip()] if model_names_str else []
        model_strategy = os.getenv("MODEL_STRATEGY", "round_robin")
        if model_strategy not in ["round_robin", "random", "primary_fallback"]:
            model_strategy = "round_robin"
        
        return cls(
            api=APIConfig(
                api_key=os.getenv("OPENAI_API_KEY", ""),
                base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
                model=os.getenv("MODEL_NAME", "gpt-4o"),
                models=models,
                model_strategy=model_strategy,
                max_tokens=int(os.getenv("MAX_TOKENS", "16000")),
                temperature=float(os.getenv("TEMPERATURE", "0.7")),
                max_retries=int(os.getenv("MAX_RETRIES", "3")),
                retry_delay=int(os.getenv("RETRY_DELAY", "5")),
                backend_url=os.getenv("BACKEND_URL", "http://localhost:8080"),
            ),
            paths=PathConfig(
                project_root=project_root,
                todolist_file=os.getenv("TODOLIST_FILE", "docs/content-creation-todolist.md"),
                output_dir=os.getenv("OUTPUT_DIR", "scripts/generated"),
            ),
            generation=GenerationConfig(
                concurrent_tasks=int(os.getenv("CONCURRENT_TASKS", "1")),
                batch_size=int(os.getenv("BATCH_SIZE", "5")),
            ),
        )
    
    def validate_api_key(self) -> bool:
        """验证 API 密钥是否已配置"""
        return bool(self.api.api_key and self.api.api_key != "sk-xxxxxxxxxxxxxxxxxxxxx")
    
    def ensure_output_dirs(self) -> None:
        """确保输出目录存在"""
        self.paths.courses_dir.mkdir(parents=True, exist_ok=True)
        self.paths.questions_dir.mkdir(parents=True, exist_ok=True)
        self.paths.materials_dir.mkdir(parents=True, exist_ok=True)


# 全局配置实例
_config: Optional[Config] = None


def get_config() -> Config:
    """获取全局配置"""
    global _config
    if _config is None:
        _config = Config.load()
    return _config


def reload_config(env_file: Optional[str] = None) -> Config:
    """重新加载配置"""
    global _config
    _config = Config.load(env_file)
    return _config
