from  .base import Base,Column,String,Integer,DateTime,Text,DATA_STATUS
class ArticleBase(Base):
    from_attributes = True
    __tablename__ = 'articles'
    id = Column(String(255), primary_key=True)
    mp_id = Column(String(255))
    title = Column(String(1000))
    pic_url = Column(String(500))
    url=Column(String(500))
    description=Column(Text)
    status = Column(Integer,default=1)
    publish_time = Column(Integer,index=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)  
    is_export = Column(Integer)
    is_read = Column(Integer, default=0)
class Article(ArticleBase):
    content = Column(Text)
    
    def to_dict(self):
        """将Article对象转换为字典"""
        return {
            'id': self.id,
            'mp_id': self.mp_id,
            'title': self.title,
            'pic_url': self.pic_url,
            'url': self.url,
            'description': self.description,
            'content': self.content,
            'status': self.status,
            'publish_time': self.publish_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_export': self.is_export,
            'is_read': self.is_read
        }
