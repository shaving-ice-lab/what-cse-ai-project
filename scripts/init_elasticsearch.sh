#!/bin/bash
# Elasticsearch初始化脚本

ES_HOST=${ES_HOST:-localhost}
ES_PORT=${ES_PORT:-9200}
ES_INDEX=${ES_INDEX:-positions}

echo "=== Elasticsearch初始化脚本 ==="
echo "Host: $ES_HOST:$ES_PORT"
echo "Index: $ES_INDEX"

# 检查ES连接
curl -s -o /dev/null -w "%{http_code}" "http://$ES_HOST:$ES_PORT" | grep -q "200"
if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to Elasticsearch"
    exit 1
fi

echo "Elasticsearch connection successful!"

# 删除旧索引(如果存在)
echo "Deleting old index if exists..."
curl -X DELETE "http://$ES_HOST:$ES_PORT/$ES_INDEX" 2>/dev/null

# 创建索引和映射
echo "Creating index with mapping..."
curl -X PUT "http://$ES_HOST:$ES_PORT/$ES_INDEX" -H 'Content-Type: application/json' -d '
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "analysis": {
      "analyzer": {
        "ik_smart_analyzer": {
          "type": "custom",
          "tokenizer": "ik_smart"
        },
        "ik_max_analyzer": {
          "type": "custom",
          "tokenizer": "ik_max_word"
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "position_id": { "type": "keyword" },
      "position_name": { 
        "type": "text", 
        "analyzer": "ik_max_analyzer", 
        "search_analyzer": "ik_smart_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "department_name": { 
        "type": "text", 
        "analyzer": "ik_max_analyzer", 
        "search_analyzer": "ik_smart_analyzer"
      },
      "department_code": { "type": "keyword" },
      "department_level": { "type": "keyword" },
      "work_location_province": { "type": "keyword" },
      "work_location_city": { "type": "keyword" },
      "work_location_district": { "type": "keyword" },
      "recruit_count": { "type": "integer" },
      "exam_type": { "type": "keyword" },
      "education_min": { "type": "keyword" },
      "major_category": { "type": "keyword" },
      "major_specific": { 
        "type": "text", 
        "analyzer": "ik_smart_analyzer"
      },
      "major_unlimited": { "type": "boolean" },
      "political_status": { "type": "keyword" },
      "work_exp_years_min": { "type": "integer" },
      "age_min": { "type": "integer" },
      "age_max": { "type": "integer" },
      "hukou_required": { "type": "boolean" },
      "applicant_count": { "type": "integer" },
      "competition_ratio": { "type": "float" },
      "status": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  }
}
'

echo ""
echo "Verifying index creation..."
curl -s "http://$ES_HOST:$ES_PORT/$ES_INDEX" | head -100

echo ""
echo "=== Elasticsearch初始化完成 ==="
echo "
注意事项:
1. 确保已安装IK分词插件: elasticsearch-plugin install analysis-ik
2. 生产环境建议设置replicas为1或更多
3. 根据数据量调整shards数量
"
