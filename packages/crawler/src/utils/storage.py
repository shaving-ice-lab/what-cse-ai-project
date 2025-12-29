import pymysql
from pymysql.cursors import DictCursor
from typing import List, Dict, Any, Optional
from loguru import logger
from contextlib import contextmanager

from config.settings import DATABASE_CONFIG


class DatabaseStorage:
    """数据库存储"""
    
    def __init__(self, config: Dict = None):
        self.config = config or DATABASE_CONFIG
        self._connection = None
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接"""
        connection = pymysql.connect(**self.config, cursorclass=DictCursor)
        try:
            yield connection
        finally:
            connection.close()
    
    def execute(self, sql: str, params: tuple = None) -> int:
        """执行SQL"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                affected = cursor.execute(sql, params)
                conn.commit()
                return affected
    
    def query(self, sql: str, params: tuple = None) -> List[Dict]:
        """查询数据"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchall()
    
    def query_one(self, sql: str, params: tuple = None) -> Optional[Dict]:
        """查询单条数据"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(sql, params)
                return cursor.fetchone()
    
    def insert(self, table: str, data: Dict) -> int:
        """插入数据"""
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        return self.execute(sql, tuple(data.values()))
    
    def batch_insert(self, table: str, data_list: List[Dict]) -> int:
        """批量插入数据"""
        if not data_list:
            return 0
        
        columns = ', '.join(data_list[0].keys())
        placeholders = ', '.join(['%s'] * len(data_list[0]))
        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                affected = cursor.executemany(sql, [tuple(d.values()) for d in data_list])
                conn.commit()
                return affected
    
    def upsert(self, table: str, data: Dict, unique_keys: List[str]) -> int:
        """插入或更新数据"""
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        updates = ', '.join([f"{k}=VALUES({k})" for k in data.keys() if k not in unique_keys])
        
        sql = f"""
            INSERT INTO {table} ({columns}) VALUES ({placeholders})
            ON DUPLICATE KEY UPDATE {updates}
        """
        return self.execute(sql, tuple(data.values()))
