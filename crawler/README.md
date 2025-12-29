# 公考职位智能筛选系统 - 爬虫模块

公考数据采集系统，用于从各类官方网站采集公务员招录公告和职位信息。

## 功能特性

- **数据采集**
  - 列表页发现与监控
  - 公告详情抓取
  - 附件下载（PDF/Excel/Word）
  - 增量更新与URL去重

- **文档解析**
  - HTML表格解析
  - PDF解析（支持扫描件OCR）
  - Excel解析（多Sheet支持）
  - Word文档解析

- **AI预处理**
  - 职位信息智能提取
  - 数据标准化
  - 质量校验
  - 置信度评估

- **任务调度**
  - Celery异步任务
  - 定时爬取
  - 任务监控

- **管理界面**
  - PyQt6 GUI管理端
  - FastAPI HTTP接口

## 目录结构

```
crawler/
├── src/
│   ├── spiders/           # 爬虫引擎
│   │   ├── base.py        # 基础爬虫类
│   │   ├── list_discovery_spider.py
│   │   ├── list_monitor_spider.py
│   │   ├── announcement_spider.py
│   │   └── position_spider.py
│   │
│   ├── parsers/           # 文档解析器
│   │   ├── html_parser.py
│   │   ├── pdf_parser.py
│   │   ├── excel_parser.py
│   │   ├── word_parser.py
│   │   └── ocr_parser.py
│   │
│   ├── processors/        # AI预处理
│   │   ├── ai_extractor.py
│   │   ├── normalizer.py
│   │   └── validator.py
│   │
│   ├── database/          # 数据库
│   │   ├── models.py
│   │   ├── session.py
│   │   └── repository.py
│   │
│   ├── pipelines/         # 数据Pipeline
│   │   ├── data_pipeline.py
│   │   └── dedup_pipeline.py
│   │
│   ├── tasks/             # Celery任务
│   │   ├── celery_app.py
│   │   └── spider_tasks.py
│   │
│   ├── gui/               # GUI界面
│   │   └── main_window.py
│   │
│   ├── api/               # HTTP API
│   │   └── app.py
│   │
│   └── config.py          # 配置管理
│
├── configs/
│   ├── settings.yaml      # 主配置文件
│   └── spiders/
│       └── sources.yaml   # 数据源配置
│
├── requirements.txt       # Python依赖
├── Dockerfile
└── README.md
```

## 安装

### 1. 安装Python依赖

```bash
cd crawler
pip install -r requirements.txt
```

### 2. 安装PaddleOCR（可选）

```bash
pip install paddlepaddle paddleocr
```

### 3. 配置环境变量

复制配置模板并修改：

```bash
cp configs/settings.yaml.example configs/settings.yaml
```

主要配置项：

- MySQL数据库连接
- Redis连接
- AI API密钥（OpenAI/Anthropic）

## 使用方法

### 启动Celery Worker

```bash
celery -A src.tasks.celery_app worker --loglevel=info -Q spider,ai
```

### 启动定时任务

```bash
celery -A src.tasks.celery_app beat --loglevel=info
```

### 启动API服务

```bash
python -m src.api.app
# 或
uvicorn src.api.app:app --host 0.0.0.0 --port 8001
```

### 启动GUI管理界面

```bash
python -c "from src.gui import run_gui; run_gui()"
```

### 手动触发爬虫

```python
from src.tasks import task_list_monitor

# 触发列表页监控
task_list_monitor.delay()

# 触发指定列表页
task_list_monitor.delay([1, 2, 3])
```

## API接口

### 触发爬虫

```
POST /api/v1/crawlers/trigger
{
    "spider_type": "list_monitor",
    "params": {"list_page_ids": [1, 2, 3]}
}
```

### 查询任务状态

```
GET /api/v1/crawlers/status/{task_id}
```

### 添加列表页

```
POST /api/v1/list-pages
{
    "url": "https://example.com/list",
    "source_name": "示例网站",
    "crawl_frequency": "daily"
}
```

### 获取统计

```
GET /api/v1/stats/overview
```

## 配置说明

### 爬虫配置

```yaml
spider:
  concurrent_requests: 16 # 并发请求数
  download_delay: 1.0 # 请求延迟（秒）
  retry_times: 3 # 重试次数
  download_timeout: 30 # 超时时间
```

### AI配置

```yaml
ai:
  provider: openai # openai/anthropic/zhipu
  openai:
    api_key: ${OPENAI_API_KEY}
    model: gpt-4o-mini
  confidence_threshold: 85 # 置信度阈值
```

### 定时任务配置

```yaml
schedule:
  list_monitor:
    national_exam: "0 */2 * * *" # 国考：每2小时
    provincial_exam: "0 */6 * * *" # 省考：每6小时
    public_institution: "0 8 * * *" # 事业单位：每天8点
```

## 开发

### 运行测试

```bash
pytest tests/ -v
```

### 代码格式化

```bash
black src/
isort src/
```

## License

MIT
