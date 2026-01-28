# MCP Content Generator v2.1

公考内容生成器 MCP 服务，支持读取任意 Markdown 任务文件作为任务来源，完成后自动标记。

## 核心特性

- **灵活的任务来源**：支持通过环境变量或动态设置指定任务文件
- **自动标记完成**：生成内容后自动将对应任务从 `- [ ]` 改为 `- [x]`
- **支持层级解析**：解析 Markdown 文档的章节、小节、父任务等层级结构

## 工作原理

1. 读取配置的任务文件（默认 `docs/content-creation-todolist.md`）
2. 解析 `- [ ]` 格式的任务
3. 调用 `get_current_task` 获取第一个未完成任务
4. 生成内容后调用 `save_*` 方法保存并自动标记完成
5. 在原文档中将 `- [ ]` 更新为 `- [x]`

## 安装

```bash
cd apps/mcp-content-generator
pnpm install
pnpm build
```

## 配置文件路径

### 方式一：环境变量（启动时指定）

在 `.cursor/mcp.json` 中配置：

```json
{
  "mcpServers": {
    "content-generator": {
      "command": "node",
      "args": ["apps/mcp-content-generator/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "${workspaceFolder}",
        "TODOLIST_FILE": "docs/fenbi-development-todolist.md",
        "OUTPUT_DIR": "scripts/generated"
      }
    }
  }
}
```

支持的环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PROJECT_ROOT` | 项目根目录 | 自动检测 |
| `TODOLIST_FILE` | 任务文件路径（相对或绝对） | `docs/content-creation-todolist.md` |
| `OUTPUT_DIR` | 生成内容输出目录 | `scripts/generated` |

### 方式二：动态设置（运行时切换）

使用 `set_todolist_file` 工具动态切换任务文件：

```json
// 调用 set_todolist_file
{
  "file_path": "docs/fenbi-development-todolist.md"
}

// 或使用绝对路径
{
  "file_path": "C:/Projects/my-todolist.md"
}
```

### 方式三：查看当前配置

使用 `get_config` 工具查看当前配置：

```json
// 返回示例
{
  "success": true,
  "config": {
    "project_root": "C:/Users/.../what-cse-ai-project",
    "todolist_file": "docs/content-creation-todolist.md",
    "todolist_full_path": "C:/Users/.../docs/content-creation-todolist.md",
    "output_dir": "scripts/generated",
    "output_full_path": "C:/Users/.../scripts/generated"
  }
}

## 可用工具

| 工具名 | 说明 |
|--------|------|
| `get_config` | 获取当前配置信息（任务文件路径等） |
| `set_todolist_file` | 动态切换任务文件路径 |
| `get_current_task` | 获取第一个未完成的任务 |
| `mark_task_complete` | 手动标记指定行号的任务为完成 |
| `save_course_content` | 保存课程内容并可选自动标记完成 |
| `save_question_batch` | 保存题目批次并可选自动标记完成 |
| `save_material_batch` | 保存素材批次并可选自动标记完成 |
| `get_progress_status` | 获取所有任务的完成进度统计 |
| `list_pending_tasks` | 列出未完成的任务（支持数量限制和章节过滤） |
| `import_to_database` | 导入已生成内容到数据库 |

## 使用示例

### 1. 获取当前任务

```json
// 调用 get_current_task
// 返回示例：
{
  "success": true,
  "task": {
    "line_number": 85,
    "title": "**第1-4课：实词辨析基础方法**",
    "section": "§1 行测课程内容",
    "subsection": "实词辨析精讲（20课时）",
    "parent": null,
    "subject": "xingce",
    "type": "course"
  },
  "prompt_hint": "请生成课程内容：**第1-4课：实词辨析基础方法**"
}
```

### 2. 保存内容并标记完成

```json
// 调用 save_course_content
{
  "task_line_number": 85,  // 提供这个参数会自动标记完成
  "content": {
    "chapter_title": "实词辨析基础方法",
    "subject": "xingce",
    "knowledge_point": "言语理解-逻辑填空-实词辨析",
    "lesson_content": { ... },
    "lesson_sections": [ ... ],
    "practice_problems": [ ... ]
  }
}

// 返回：
{
  "success": true,
  "message": "课程内容已保存: 实词辨析基础方法-1706449200000.json",
  "filepath": "...",
  "task_marked_complete": 85  // 已自动标记完成
}
```

### 3. 查看进度

```json
// 调用 get_progress_status
// 返回示例：
{
  "success": true,
  "progress": {
    "total": 580,
    "completed": 10,
    "pending": 570,
    "percent": 2,
    "by_section": {
      "§1 行测课程内容": { "total": 280, "completed": 5, "pending": 275 },
      "§2 申论课程内容": { "total": 120, "completed": 0, "pending": 120 }
    }
  },
  "source_file": "docs/content-creation-todolist.md"
}
```

### 4. 列出待完成任务

```json
// 调用 list_pending_tasks
{
  "limit": 5,
  "section_filter": "言语理解"  // 可选：按章节过滤
}
```

## Cursor 集成

在 `.cursor/mcp.json` 中配置：

```json
{
  "mcpServers": {
    "content-generator": {
      "command": "node",
      "args": ["apps/mcp-content-generator/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "${workspaceFolder}",
        "TODOLIST_FILE": "docs/content-creation-todolist.md"
      }
    }
  }
}
```

切换到其他任务文件：

```json
{
  "env": {
    "TODOLIST_FILE": "docs/fenbi-development-todolist.md"
  }
}
```

## 触发词（Cursor 规则）

在 `.cursor/rules/content-generator.mdc` 中配置的触发词：

| 触发词 | 操作 |
|--------|------|
| `公考:开始生成` | 调用 `get_current_task` 获取任务并开始生成 |
| `公考:继续` | 继续生成下一个任务 |
| `公考:查看进度` | 调用 `get_progress_status` |
| `公考:列出任务` | 调用 `list_pending_tasks` |

## 文档格式要求

`content-creation-todolist.md` 中的任务格式：

```markdown
## §1 行测课程内容

### 1.1 言语理解与表达课程

#### 逻辑填空课程（45课时）

##### 实词辨析精讲（20课时）
- [ ] **第1-4课：实词辨析基础方法**    <- 父任务
  - [ ] 语素分析法：拆分词语分析语素含义差异  <- 子任务
  - [ ] 语境推断法：根据上下文判断词语意思
  - [x] 感情色彩法：褒义、贬义、中性词辨析   <- 已完成
```

- `- [ ]` 表示待完成
- `- [x]` 表示已完成
- 使用缩进表示任务层级
- `**文字**` 表示父级任务

## 生成文件位置

- 课程：`scripts/generated/courses/`
- 题目：`scripts/generated/questions/`
- 素材：`scripts/generated/materials/`
