#!/bin/bash
# Redis初始化脚本

REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
REDIS_PASSWORD=${REDIS_PASSWORD:-}

echo "=== Redis初始化脚本 ==="
echo "Host: $REDIS_HOST:$REDIS_PORT"

# 检查Redis连接
if [ -n "$REDIS_PASSWORD" ]; then
    redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
else
    redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
fi

if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to Redis"
    exit 1
fi

echo "Redis connection successful!"

# 设置键过期策略提示
echo "
Redis配置建议:
1. 设置maxmemory-policy: allkeys-lru
2. 启用持久化: appendonly yes
3. 设置合理的maxmemory

常用键前缀:
- user:session:* - 用户会话
- position:list:* - 职位列表缓存
- position:detail:* - 职位详情缓存
- major:dict - 专业词典缓存
- region:dict - 地区词典缓存
- rate:limit:* - 限流计数
"

echo "=== Redis初始化完成 ==="
