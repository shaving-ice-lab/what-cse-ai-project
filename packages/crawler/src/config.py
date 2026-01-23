"""配置加载模块"""

import os
import re
from pathlib import Path
from typing import Any, Dict, Optional

import yaml
from loguru import logger


class Config:
    """配置管理类"""

    _instance: Optional["Config"] = None
    _config: Dict[str, Any] = {}

    def __new__(cls) -> "Config":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._config:
            self.load_config()

    def load_config(self, config_path: Optional[str] = None) -> None:
        """加载配置文件"""
        if config_path is None:
            config_path = os.environ.get(
                "CSE_CRAWLER_CONFIG",
                str(Path(__file__).parent.parent / "configs" / "settings.yaml"),
            )

        try:
            with open(config_path, "r", encoding="utf-8") as f:
                raw_config = f.read()

            # 替换环境变量 ${VAR:default}
            def replace_env_var(match):
                var_expr = match.group(1)
                if ":" in var_expr:
                    var_name, default = var_expr.split(":", 1)
                else:
                    var_name, default = var_expr, ""
                return os.environ.get(var_name, default)

            processed_config = re.sub(r"\$\{([^}]+)\}", replace_env_var, raw_config)
            self._config = yaml.safe_load(processed_config)
            logger.info(f"配置文件加载成功: {config_path}")

        except FileNotFoundError:
            logger.warning(f"配置文件不存在: {config_path}, 使用默认配置")
            self._config = self._get_default_config()
        except Exception as e:
            logger.error(f"配置文件加载失败: {e}")
            self._config = self._get_default_config()

    def _get_default_config(self) -> Dict[str, Any]:
        """获取默认配置"""
        return {
            "database": {
                "mysql": {
                    "host": "localhost",
                    "port": 3306,
                    "user": "root",
                    "password": "",
                    "database": "cse_crawler",
                    "charset": "utf8mb4",
                },
                "redis": {
                    "host": "localhost",
                    "port": 6379,
                    "db": 0,
                },
            },
            "spider": {
                "concurrent_requests": 16,
                "download_delay": 1.0,
                "retry_times": 3,
            },
            "ai": {
                "provider": "openai",
                "confidence_threshold": 85,
            },
            "logging": {
                "level": "INFO",
            },
        }

    def get(self, key: str, default: Any = None) -> Any:
        """获取配置项，支持点号分隔的路径"""
        keys = key.split(".")
        value = self._config

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default
            if value is None:
                return default

        return value

    def set(self, key: str, value: Any) -> None:
        """设置配置项"""
        keys = key.split(".")
        config = self._config

        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value

    @property
    def database(self) -> Dict[str, Any]:
        return self._config.get("database", {})

    @property
    def spider(self) -> Dict[str, Any]:
        return self._config.get("spider", {})

    @property
    def ai(self) -> Dict[str, Any]:
        return self._config.get("ai", {})

    @property
    def proxy(self) -> Dict[str, Any]:
        return self._config.get("proxy", {})

    @property
    def celery(self) -> Dict[str, Any]:
        return self._config.get("celery", {})

    @property
    def logging(self) -> Dict[str, Any]:
        return self._config.get("logging", {})


# 全局配置实例
config = Config()
