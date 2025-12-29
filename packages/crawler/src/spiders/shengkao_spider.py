from typing import Generator, Dict, List
from loguru import logger
from datetime import datetime

from src.spiders.base import BaseSpider
from src.utils.parser import HtmlParser
from src.models.position import Position, Announcement
from config.settings import TARGET_SITES


class ShengkaoSpider(BaseSpider):
    """省考职位爬虫"""
    
    name = 'shengkao'
    
    def __init__(self, province: str = None):
        super().__init__()
        self.province = province
        self.start_urls = self._get_start_urls()
    
    def _get_start_urls(self) -> List[str]:
        """获取起始URL列表"""
        sites = TARGET_SITES.get('shengkao', {}).get('sites', [])
        
        if self.province:
            sites = [s for s in sites if s['name'] == self.province]
        
        return [s['url'] for s in sites]
    
    def parse(self, parser: HtmlParser) -> Generator[Dict, None, None]:
        """解析公告列表页"""
        links = parser.extract_links()
        
        for link in links:
            title = link.get('text', '')
            url = link.get('url', '')
            
            if any(kw in title for kw in ['招录', '公务员', '公告', '职位']):
                yield {
                    'type': 'announcement',
                    'title': title,
                    'url': url,
                    'province': self.province,
                }
    
    def parse_positions(self, parser: HtmlParser, province: str) -> Generator[Position, None, None]:
        """解析职位表"""
        table_data = parser.extract_table('table.position-table')
        
        if len(table_data) < 2:
            return
        
        headers = table_data[0]
        
        for row in table_data[1:]:
            if len(row) != len(headers):
                continue
            
            row_dict = dict(zip(headers, row))
            
            yield Position(
                exam_type='shengkao',
                year=datetime.now().year,
                position_code=row_dict.get('职位代码', ''),
                position_name=row_dict.get('职位名称', ''),
                department=row_dict.get('招录单位', ''),
                province=province,
                city=row_dict.get('工作地点', ''),
                education=row_dict.get('学历要求', ''),
                major=row_dict.get('专业要求', ''),
                political=row_dict.get('政治面貌', ''),
                recruit_count=int(row_dict.get('招录人数', 1)),
                remark=row_dict.get('备注', ''),
            )
    
    def process_item(self, item: Dict):
        """处理数据项"""
        super().process_item(item)
        
        if item.get('type') == 'announcement':
            logger.info(f"[{item.get('province')}] Found: {item.get('title')}")
