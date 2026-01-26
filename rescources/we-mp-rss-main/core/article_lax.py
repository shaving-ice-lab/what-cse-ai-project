import threading
from core import lax, thread
from core.models import Article,Feed,DATA_STATUS
from core.db import DB
from core.cache import data_cache
import json
class ArticleInfo():
    #没有内容的文章数量
    no_content_count:int=0
    #有内容的文章数量
    has_content_count:int=0
    #所有文章数量
    all_count:int=0
    #不正常的文章数量
    wrong_count:int=0
    #公众号总数
    mp_all_count:int=0
def laxArticle():
    info=ArticleInfo()
    session=DB.get_session()
    #获取没有内容的文章数量 - 只查询content字段
    info.no_content_count=session.query(Article).filter(Article.content == None).count()
    #所有文章数量 - 只查询id字段
    info.all_count=session.query(Article.id).count()
    #有内容的文章数量
    info.has_content_count=info.all_count-info.no_content_count

    #获取删除的文章 - 只查询status字段
    info.wrong_count=session.query(Article).filter(Article.status !=DATA_STATUS.ACTIVE ).count()

    #公众号总数 - 只查询id字段
    info.mp_all_count=session.query(Feed.id).distinct().count()
    # session.close()
    return info.__dict__
    pass
ARTICLE_INFO={}
lock = threading.Lock()
def refresh_article_info():
    def lax_article():
        global ARTICLE_INFO
        with lock:
            ARTICLE_INFO=laxArticle()
            # 存储到缓存中，缓存30分钟
            data_cache.set("article_info", ARTICLE_INFO)
            print(ARTICLE_INFO)
    threading.Thread(target=lax_article).start()

def get_article_info():
    """从缓存获取文章信息，如果缓存不存在则返回全局变量"""
    # 先尝试从缓存获取
    cached_info = data_cache.get("article_info", ttl=1800)  # 30分钟TTL
    ARTICLE_INFO=cached_info
    if cached_info is not None:
        return cached_info
    else:
        refresh_article_info()
    
    # 如果缓存不存在，返回全局变量
    return ARTICLE_INFO

