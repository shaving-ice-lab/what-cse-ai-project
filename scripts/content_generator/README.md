# 公考内容生成器 (Python API 版)

使用 AI API 直接生成公考学习内容，替代 MCP 方式，速度更快、更灵活。

## 功能特性

- ✅ 从 `todolist.md` 自动读取任务
- ✅ 支持 OpenAI、Azure OpenAI、DeepSeek、Moonshot 等兼容 API
- ✅ 自动生成课程、题目、素材内容
- ✅ **直接导入数据库**（默认，无需先生成文件再导入）
- ✅ 可选保存到 JSON 文件
- ✅ 自动标记任务完成
- ✅ 持续生成模式
- ✅ 丰富的命令行界面

## 快速开始

### 1. 安装依赖

```bash
cd scripts/content_generator
pip install -r requirements.txt
```

### 2. 配置 API

```bash
# 复制配置文件
cp .env.example .env

# 编辑 .env 文件，填入你的 API 密钥
```

**支持的 API 服务：**

| 服务 | Base URL | 模型示例 |
|------|----------|----------|
| OpenAI | https://api.openai.com/v1 | gpt-4o, gpt-4-turbo |
| Azure OpenAI | https://your-resource.openai.azure.com | gpt-4 |
| DeepSeek | https://api.deepseek.com | deepseek-chat |
| Moonshot | https://api.moonshot.cn/v1 | moonshot-v1-128k |

### 3. 启动后端服务

```bash
# 在另一个终端启动后端服务
cd apps/server && go run main.go
```

### 4. 测试连接

```bash
python -m content_generator test-api
```

### 5. 开始生成（直接导入数据库）

```bash
# 查看进度
python -m content_generator progress

# 生成单个任务（直接导入数据库）
python -m content_generator generate

# 持续生成模式（推荐，直接导入数据库）
python -m content_generator run -m 10

# 如果只想保存到文件，使用 --file 参数
python -m content_generator generate --file
python -m content_generator run -m 10 --file

# 同时保存到数据库和文件
python -m content_generator generate --both
```

## 命令说明

### 查看配置

```bash
python -m content_generator config
```

### 查看进度

```bash
python -m content_generator progress
```

### 列出任务

```bash
# 列出待处理任务
python -m content_generator list

# 显示更多
python -m content_generator list -n 20

# 按章节过滤
python -m content_generator list -s "言语理解"

# 显示已完成任务
python -m content_generator list -c
```

### 列出章节

```bash
python -m content_generator sections
```

### 生成单个任务

```bash
# 自动选择下一个待处理任务（直接导入数据库）
python -m content_generator generate

# 指定行号
python -m content_generator generate -l 87

# 保存到文件而不是数据库
python -m content_generator generate --file
python -m content_generator generate -f

# 同时保存到数据库和文件
python -m content_generator generate --both
python -m content_generator generate -b

# 不自动标记完成
python -m content_generator generate --no-mark
```

### 持续生成模式

```bash
# 默认生成5个（直接导入数据库）
python -m content_generator run

# 生成10个
python -m content_generator run -m 10

# 只生成特定章节
python -m content_generator run -s "言语理解" -m 5

# 保存到文件而不是数据库
python -m content_generator run -m 10 --file

# 同时保存到数据库和文件
python -m content_generator run -m 10 --both

# 不自动标记完成
python -m content_generator run --no-mark
```

### 手动标记完成

```bash
python -m content_generator mark 87
```

### 切换任务文件

```bash
python -m content_generator set-file docs/fenbi-development-todolist.md
```

## 配置说明

编辑 `.env` 文件：

```bash
# AI API 配置
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o

# 后端服务配置（用于直接导入数据库）
BACKEND_URL=http://localhost:8080

# 生成配置
MAX_TOKENS=16000
TEMPERATURE=0.7
MAX_RETRIES=3
RETRY_DELAY=5

# 路径配置
PROJECT_ROOT=../..
TODOLIST_FILE=docs/content-creation-todolist.md
OUTPUT_DIR=scripts/generated

# 并发配置
CONCURRENT_TASKS=1
BATCH_SIZE=5
```

## 输出目录

生成的内容保存在 `scripts/generated/` 目录：

```
scripts/generated/
├── courses/      # 课程内容
├── questions/    # 题目内容
└── materials/    # 素材内容
```

## 与 MCP 版本对比

| 特性 | MCP 版本 | Python API 版本 |
|------|----------|-----------------|
| 生成速度 | 较慢（需要通过 MCP 协议） | 快（直接调用 API） |
| 依赖 | 需要 MCP 服务器 | 独立运行 |
| 配置 | 在 Cursor 中配置 | .env 文件 |
| 使用方式 | Cursor 对话 | 命令行 |
| 批量生成 | 需要手动触发 | 支持持续模式 |
| 灵活性 | 受 MCP 限制 | 完全可控 |

## 常见问题

### Q: API 连接失败？

1. 检查 API 密钥是否正确
2. 检查 Base URL 是否正确
3. 检查网络连接
4. 运行 `python -m content_generator test-api` 测试

### Q: 生成内容不完整？

1. 增加 `MAX_TOKENS` 值
2. 检查模型是否支持长文本
3. 考虑使用 128k 上下文的模型

### Q: 如何只生成特定类型的内容？

使用章节过滤：

```bash
# 只生成言语理解课程
python -m content_generator run -s "言语理解"

# 只生成题库
python -m content_generator run -s "题库"
```

## 开发说明

### 项目结构

```
content_generator/
├── __init__.py          # 包初始化
├── __main__.py          # 模块入口
├── main.py              # 主入口
├── cli.py               # 命令行界面
├── config.py            # 配置管理
├── task_parser.py       # 任务解析
├── ai_client.py         # AI API 客户端
├── content_generator.py # 内容生成器
├── prompts/             # 提示词模板
│   ├── __init__.py
│   ├── course.py        # 课程提示词
│   ├── question.py      # 题目提示词
│   └── material.py      # 素材提示词
├── requirements.txt     # 依赖
├── .env.example         # 配置示例
└── README.md            # 说明文档
```

### 扩展提示词

如需修改生成内容的格式或质量要求，编辑 `prompts/` 目录下的文件。
