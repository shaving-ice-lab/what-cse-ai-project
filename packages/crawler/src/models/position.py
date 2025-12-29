from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Position(BaseModel):
    """职位数据模型"""
    id: Optional[int] = None
    exam_type: str = Field(..., description="考试类型: guokao/shengkao")
    year: int = Field(..., description="招录年份")
    
    # 基本信息
    position_code: str = Field(..., description="职位代码")
    position_name: str = Field(..., description="职位名称")
    department: str = Field(..., description="招录单位")
    institution: Optional[str] = Field(None, description="用人单位")
    
    # 地区信息
    province: str = Field(..., description="省份")
    city: Optional[str] = Field(None, description="城市")
    district: Optional[str] = Field(None, description="区县")
    
    # 招录条件
    education: str = Field(..., description="学历要求")
    degree: Optional[str] = Field(None, description="学位要求")
    major: Optional[str] = Field(None, description="专业要求")
    political: Optional[str] = Field(None, description="政治面貌")
    work_years: Optional[str] = Field(None, description="工作年限")
    grassroots_years: Optional[str] = Field(None, description="基层工作年限")
    
    # 招录人数
    recruit_count: int = Field(1, description="招录人数")
    exam_ratio: Optional[str] = Field(None, description="开考比例")
    
    # 其他信息
    remark: Optional[str] = Field(None, description="备注")
    source_url: Optional[str] = Field(None, description="来源URL")
    
    # 时间戳
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class Announcement(BaseModel):
    """公告数据模型"""
    id: Optional[int] = None
    exam_type: str = Field(..., description="考试类型")
    year: int = Field(..., description="年份")
    
    title: str = Field(..., description="公告标题")
    content: Optional[str] = Field(None, description="公告内容")
    publish_date: Optional[datetime] = Field(None, description="发布日期")
    source: str = Field(..., description="来源")
    source_url: str = Field(..., description="来源URL")
    
    # 报名信息
    register_start: Optional[datetime] = Field(None, description="报名开始时间")
    register_end: Optional[datetime] = Field(None, description="报名结束时间")
    exam_date: Optional[datetime] = Field(None, description="考试时间")
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
