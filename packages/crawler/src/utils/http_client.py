import httpx
from fake_useragent import UserAgent
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from typing import Optional, Dict, Any


class HttpClient:
    """HTTP客户端封装"""
    
    def __init__(self, timeout: int = 30, use_proxy: bool = False):
        self.timeout = timeout
        self.use_proxy = use_proxy
        self.ua = UserAgent()
        self._client: Optional[httpx.Client] = None
    
    @property
    def client(self) -> httpx.Client:
        if self._client is None:
            self._client = httpx.Client(
                timeout=self.timeout,
                follow_redirects=True,
            )
        return self._client
    
    def _get_headers(self) -> Dict[str, str]:
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def get(self, url: str, params: Optional[Dict] = None, **kwargs) -> httpx.Response:
        """发送GET请求"""
        headers = self._get_headers()
        headers.update(kwargs.pop('headers', {}))
        
        logger.debug(f"GET {url}")
        response = self.client.get(url, params=params, headers=headers, **kwargs)
        response.raise_for_status()
        return response
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def post(self, url: str, data: Optional[Dict] = None, json: Optional[Dict] = None, **kwargs) -> httpx.Response:
        """发送POST请求"""
        headers = self._get_headers()
        headers.update(kwargs.pop('headers', {}))
        
        logger.debug(f"POST {url}")
        response = self.client.post(url, data=data, json=json, headers=headers, **kwargs)
        response.raise_for_status()
        return response
    
    def close(self):
        """关闭客户端"""
        if self._client:
            self._client.close()
            self._client = None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
