import os
from dotenv import load_dotenv

load_dotenv()

# 数据库配置
DATABASE_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'cse_crawler'),
    'charset': 'utf8mb4',
}

# Redis配置
REDIS_CONFIG = {
    'host': os.getenv('REDIS_HOST', 'localhost'),
    'port': int(os.getenv('REDIS_PORT', 6379)),
    'db': int(os.getenv('REDIS_DB', 0)),
    'password': os.getenv('REDIS_PASSWORD', None),
}

# 爬虫配置
CRAWLER_CONFIG = {
    'concurrent_requests': 5,
    'download_delay': 1.0,
    'retry_times': 3,
    'timeout': 30,
    'user_agent_rotate': True,
}

# 目标网站配置
TARGET_SITES = {
    'guokao': {
        'name': '国家公务员局',
        'base_url': 'http://www.scs.gov.cn',
        'announcement_url': '/ywzx/index.html',
        'position_url': '/kl/index.html',
    },
    'shengkao': {
        'name': '各省人事考试网',
        'sites': [
            {'name': '北京', 'url': 'http://www.bjrbj.gov.cn'},
            {'name': '上海', 'url': 'http://www.spta.gov.cn'},
            {'name': '广东', 'url': 'http://www.gdhrss.gov.cn'},
        ]
    }
}

# 日志配置
LOG_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'format': '{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}',
    'rotation': '10 MB',
    'retention': '7 days',
}
