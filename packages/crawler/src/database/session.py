"""数据库会话管理"""

from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from loguru import logger

from ..config import config
from .models import Base

_engine = None
_SessionLocal = None


def get_database_url() -> str:
    """获取数据库连接URL"""
    mysql_config = config.database.get("mysql", {})

    host = mysql_config.get("host", "localhost")
    port = mysql_config.get("port", 3306)
    user = mysql_config.get("user", "root")
    password = mysql_config.get("password", "")
    database = mysql_config.get("database", "cse_crawler")
    charset = mysql_config.get("charset", "utf8mb4")

    return (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset={charset}"
    )


def init_db() -> None:
    """初始化数据库"""
    global _engine, _SessionLocal

    database_url = get_database_url()

    mysql_config = config.database.get("mysql", {})
    pool_size = mysql_config.get("pool_size", 10)
    max_overflow = mysql_config.get("max_overflow", 20)

    _engine = create_engine(
        database_url,
        pool_size=pool_size,
        max_overflow=max_overflow,
        pool_pre_ping=True,
        echo=False,
    )

    _SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=_engine,
    )

    # 创建表
    Base.metadata.create_all(bind=_engine)

    logger.info("数据库初始化完成")


def get_engine():
    """获取数据库引擎"""
    global _engine
    if _engine is None:
        init_db()
    return _engine


def get_session() -> Session:
    """获取数据库会话"""
    global _SessionLocal
    if _SessionLocal is None:
        init_db()
    return _SessionLocal()


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    """会话上下文管理器"""
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"数据库操作失败: {e}")
        raise
    finally:
        session.close()
