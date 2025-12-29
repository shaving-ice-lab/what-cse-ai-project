from abc import ABC, abstractmethod
from typing import List, Dict, Any, Generator
from loguru import logger
import time

from src.utils.http_client import HttpClient
from src.utils.parser import HtmlParser
from src.utils.storage import DatabaseStorage


class BaseSpider(ABC):
    """爬虫基类"""
    
    name: str = 'base'
    start_urls: List[str] = []
    
    def __init__(self):
        self.client = HttpClient()
        self.storage = DatabaseStorage()
        self.results: List[Dict] = []
    
    @abstractmethod
    def parse(self, response: Any) -> Generator[Dict, None, None]:
        """解析响应，子类必须实现"""
        pass
    
    def start_requests(self) -> Generator[str, None, None]:
        """生成起始请求"""
        for url in self.start_urls:
            yield url
    
    def fetch(self, url: str) -> HtmlParser:
        """获取并解析页面"""
        response = self.client.get(url)
        return HtmlParser(response.text)
    
    def run(self):
        """运行爬虫"""
        logger.info(f"Starting spider: {self.name}")
        
        for url in self.start_requests():
            try:
                logger.info(f"Fetching: {url}")
                parser = self.fetch(url)
                
                for item in self.parse(parser):
                    self.results.append(item)
                    self.process_item(item)
                
                time.sleep(1)  # 请求间隔
                
            except Exception as e:
                logger.error(f"Error fetching {url}: {e}")
        
        self.on_finish()
        logger.info(f"Spider {self.name} finished. Total items: {len(self.results)}")
    
    def process_item(self, item: Dict):
        """处理单个数据项"""
        logger.debug(f"Processing item: {item.get('position_name', item.get('title', 'unknown'))}")
    
    def on_finish(self):
        """爬虫结束时的处理"""
        pass
    
    def close(self):
        """关闭资源"""
        self.client.close()
