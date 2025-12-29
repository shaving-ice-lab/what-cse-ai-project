from bs4 import BeautifulSoup
from parsel import Selector
from typing import List, Optional, Dict, Any
import re
from loguru import logger


class HtmlParser:
    """HTML解析器"""
    
    def __init__(self, html: str, parser: str = 'lxml'):
        self.html = html
        self.soup = BeautifulSoup(html, parser)
        self.selector = Selector(text=html)
    
    def css(self, query: str) -> List[Any]:
        """CSS选择器查询"""
        return self.selector.css(query).getall()
    
    def css_first(self, query: str) -> Optional[str]:
        """CSS选择器查询第一个"""
        return self.selector.css(query).get()
    
    def xpath(self, query: str) -> List[Any]:
        """XPath查询"""
        return self.selector.xpath(query).getall()
    
    def xpath_first(self, query: str) -> Optional[str]:
        """XPath查询第一个"""
        return self.selector.xpath(query).get()
    
    def find(self, tag: str, **kwargs) -> Optional[Any]:
        """查找单个元素"""
        return self.soup.find(tag, **kwargs)
    
    def find_all(self, tag: str, **kwargs) -> List[Any]:
        """查找所有元素"""
        return self.soup.find_all(tag, **kwargs)
    
    def get_text(self, element: Any, strip: bool = True) -> str:
        """获取元素文本"""
        if element is None:
            return ''
        text = element.get_text()
        return text.strip() if strip else text
    
    def extract_links(self, base_url: str = '') -> List[Dict[str, str]]:
        """提取所有链接"""
        links = []
        for a in self.soup.find_all('a', href=True):
            href = a['href']
            if base_url and not href.startswith('http'):
                href = base_url.rstrip('/') + '/' + href.lstrip('/')
            links.append({
                'url': href,
                'text': self.get_text(a),
            })
        return links
    
    def extract_table(self, table_selector: str = 'table') -> List[List[str]]:
        """提取表格数据"""
        table = self.soup.select_one(table_selector)
        if not table:
            return []
        
        rows = []
        for tr in table.find_all('tr'):
            cells = []
            for td in tr.find_all(['td', 'th']):
                cells.append(self.get_text(td))
            if cells:
                rows.append(cells)
        return rows
    
    @staticmethod
    def clean_text(text: str) -> str:
        """清理文本"""
        if not text:
            return ''
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text
