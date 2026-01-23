"""数据库模型定义"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    Index,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Announcement(Base):
    """公告表"""

    __tablename__ = "crawler_announcements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(500), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text)
    content_html = Column(Text)
    content_hash = Column(String(32), index=True)

    # 公告信息
    announcement_type = Column(
        String(50), index=True
    )  # recruitment, registration_stats, etc.
    publish_date = Column(DateTime, index=True)
    source_name = Column(String(100))
    source_list_id = Column(Integer, ForeignKey("crawler_list_pages.id"))
    category = Column(String(50))

    # 附件
    attachments = Column(JSON)  # [{url, name, type, local_path}]

    # 考试信息
    exam_type = Column(String(50))  # national_exam, provincial_exam, etc.
    registration_start = Column(DateTime)
    registration_end = Column(DateTime)
    exam_date_written = Column(DateTime)

    # 元数据
    crawled_at = Column(DateTime, default=datetime.now)
    parsed_at = Column(DateTime)
    status = Column(
        String(20), default="pending"
    )  # pending, parsed, reviewed, published
    parse_confidence = Column(Integer)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 关联
    positions = relationship("Position", back_populates="announcement")
    source_list = relationship("ListPage", back_populates="announcements")

    __table_args__ = (
        Index("ix_announcement_type_date", "announcement_type", "publish_date"),
    )


class Position(Base):
    """职位表"""

    __tablename__ = "crawler_positions"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 基本信息
    position_name = Column(String(200), nullable=False)
    department_name = Column(String(200))
    department_code = Column(String(50), index=True)
    position_code = Column(String(50), unique=True, index=True)
    recruit_count = Column(Integer)

    # 工作地点
    work_location = Column(String(200))
    work_location_province = Column(String(50), index=True)
    work_location_city = Column(String(50))
    work_location_district = Column(String(50))

    # 学历要求
    education_min = Column(String(20))
    education_max = Column(String(20))
    degree_required = Column(Boolean)

    # 专业要求
    major_category = Column(JSON)
    major_specific = Column(JSON)
    major_unlimited = Column(Boolean)

    # 其他要求
    political_status = Column(String(20))
    age_min = Column(Integer)
    age_max = Column(Integer)
    work_exp_years_min = Column(Integer)
    grassroots_exp_years = Column(Integer)
    hukou_required = Column(Boolean)
    hukou_provinces = Column(JSON)
    gender_required = Column(String(10))
    fresh_graduate_only = Column(Boolean)

    # 其他信息
    other_requirements = Column(Text)
    notes = Column(Text)

    # 来源
    source_url = Column(String(500))
    announcement_id = Column(Integer, ForeignKey("crawler_announcements.id"))
    attachment_url = Column(String(500))
    parse_source = Column(String(20))  # html_table, excel, pdf, word

    # 元数据
    exam_type = Column(String(50), index=True)
    parse_confidence = Column(Integer)
    status = Column(String(20), default="pending")  # pending, reviewed, published
    manual_reviewed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 关联
    announcement = relationship("Announcement", back_populates="positions")

    __table_args__ = (
        Index("ix_position_location", "work_location_province", "work_location_city"),
        Index("ix_position_education", "education_min"),
    )


class ListPage(Base):
    """监控列表页表"""

    __tablename__ = "crawler_list_pages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(500), unique=True, nullable=False, index=True)

    # 来源信息
    source_domain = Column(String(200))
    source_name = Column(String(100))
    category = Column(String(50))  # national_exam, provincial_exam, etc.
    province_code = Column(String(10))

    # 发现信息
    discovery_method = Column(String(50))  # url_pattern, breadcrumb, back_link
    discovery_from = Column(String(500))
    sample_article = Column(String(500))

    # 爬取配置
    article_selector = Column(String(200))
    pagination_pattern = Column(String(200))
    crawl_frequency = Column(String(20), default="daily")  # hourly, daily, weekly
    priority = Column(Integer, default=5)

    # 状态
    status = Column(String(20), default="active")  # active, inactive, error
    last_crawl_time = Column(DateTime)
    last_crawl_status = Column(String(20))
    article_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)

    # 验证
    verified = Column(Boolean, default=False)
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 关联
    announcements = relationship("Announcement", back_populates="source_list")


class CrawlTask(Base):
    """爬虫任务表"""

    __tablename__ = "crawler_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(100), unique=True, index=True)  # Celery task ID

    # 任务信息
    task_type = Column(
        String(50)
    )  # list_discovery, list_monitor, announcement, position
    task_name = Column(String(200))
    task_params = Column(JSON)

    # 状态
    status = Column(
        String(20), default="pending"
    )  # pending, running, completed, failed
    progress = Column(Float, default=0)
    result = Column(JSON)
    error_message = Column(Text)

    # 时间
    created_at = Column(DateTime, default=datetime.now)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # 统计
    items_scraped = Column(Integer, default=0)
    items_saved = Column(Integer, default=0)
