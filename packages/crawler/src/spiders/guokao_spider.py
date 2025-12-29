from typing import Generator, Dict
from loguru import logger
from datetime import datetime

from src.spiders.base import BaseSpider
from src.utils.parser import HtmlParser
from src.models.position import Position, Announcement


class GuokaoSpider(BaseSpider):
    """国考职位爬虫"""
    
    name = 'guokao'
    start_urls = ['http://www.scs.gov.cn/ywzx/index.html']
    
    def parse(self, parser: HtmlParser) -> Generator[Dict, None, None]:
        """解析公告列表页"""
        links = parser.find_all('a', class_='news-link')
        
        for link in links:
            title = parser.get_text(link)
            href = link.get('href', '')
            
            if '招考' in title or '公告' in title:
                yield {
                    'type': 'announcement',
                    'title': title,
                    'url': href,
                }
    
    def parse_announcement(self, parser: HtmlParser, url: str) -> Announcement:
        """解析公告详情"""
        title = parser.css_first('h1::text') or ''
        content = parser.css_first('.content::text') or ''
        date_str = parser.css_first('.publish-date::text') or ''
        
        return Announcement(
            exam_type='guokao',
            year=datetime.now().year,
            title=title,
            content=content,
            source='国家公务员局',
            source_url=url,
        )
    
    def parse_positions(self, excel_path: str) -> Generator[Position, None, None]:
        """解析职位表Excel"""
        import pandas as pd
        
        try:
            df = pd.read_excel(excel_path, header=1)
            
            for _, row in df.iterrows():
                yield Position(
                    exam_type='guokao',
                    year=datetime.now().year,
                    position_code=str(row.get('职位代码', '')),
                    position_name=str(row.get('职位名称', '')),
                    department=str(row.get('招录机关', '')),
                    institution=str(row.get('用人司局', '')),
                    province=str(row.get('工作地点', '')).split('省')[0] if '省' in str(row.get('工作地点', '')) else '',
                    education=str(row.get('学历', '')),
                    degree=str(row.get('学位', '')),
                    major=str(row.get('专业', '')),
                    political=str(row.get('政治面貌', '')),
                    work_years=str(row.get('基层工作最低年限', '')),
                    recruit_count=int(row.get('招考人数', 1)),
                    remark=str(row.get('备注', '')),
                )
        except Exception as e:
            logger.error(f"Error parsing excel: {e}")
    
    def process_item(self, item: Dict):
        """处理数据项"""
        super().process_item(item)
        
        if item.get('type') == 'announcement':
            logger.info(f"Found announcement: {item.get('title')}")
