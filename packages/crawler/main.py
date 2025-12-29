import argparse
from loguru import logger
import sys

from src.spiders.guokao_spider import GuokaoSpider
from src.spiders.shengkao_spider import ShengkaoSpider
from config.settings import LOG_CONFIG


def setup_logger():
    """配置日志"""
    logger.remove()
    logger.add(
        sys.stdout,
        format=LOG_CONFIG['format'],
        level=LOG_CONFIG['level'],
    )
    logger.add(
        'logs/crawler_{time:YYYY-MM-DD}.log',
        format=LOG_CONFIG['format'],
        level=LOG_CONFIG['level'],
        rotation=LOG_CONFIG['rotation'],
        retention=LOG_CONFIG['retention'],
    )


def main():
    parser = argparse.ArgumentParser(description='公考职位爬虫')
    parser.add_argument('--spider', '-s', type=str, choices=['guokao', 'shengkao', 'all'],
                        default='all', help='选择爬虫')
    parser.add_argument('--province', '-p', type=str, help='指定省份（省考专用）')
    parser.add_argument('--debug', action='store_true', help='调试模式')
    
    args = parser.parse_args()
    
    if args.debug:
        LOG_CONFIG['level'] = 'DEBUG'
    
    setup_logger()
    logger.info("公考职位爬虫启动")
    
    spiders = []
    
    if args.spider in ['guokao', 'all']:
        spiders.append(GuokaoSpider())
    
    if args.spider in ['shengkao', 'all']:
        spiders.append(ShengkaoSpider(province=args.province))
    
    for spider in spiders:
        try:
            spider.run()
        except Exception as e:
            logger.error(f"Spider {spider.name} error: {e}")
        finally:
            spider.close()
    
    logger.info("爬虫任务完成")


if __name__ == '__main__':
    main()
