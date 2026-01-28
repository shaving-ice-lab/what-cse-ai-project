#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// 配置
const CONFIG = {
  projectRoot: process.env.PROJECT_ROOT || path.resolve(__dirname, "../../.."),
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8080/api/v1",
  apiToken: process.env.API_TOKEN || "",
  // 支持通过环境变量指定 todolist 文件路径
  // TODOLIST_FILE 可以是绝对路径或相对于 PROJECT_ROOT 的路径
  todolistFile:
    process.env.TODOLIST_FILE || "docs/content-creation-todolist.md",
  // 支持通过环境变量指定输出目录
  outputDir: process.env.OUTPUT_DIR || "scripts/generated",
  // 持续生成模式配置
  continuousMode: false,
  maxContinuousTasks: 10, // 单次最多连续生成的任务数
};

// 文件路径
const getTodolistPath = () => {
  const todolistFile = CONFIG.todolistFile;
  // 如果是绝对路径，直接返回
  if (path.isAbsolute(todolistFile)) {
    return todolistFile;
  }
  // 否则相对于项目根目录
  return path.join(CONFIG.projectRoot, todolistFile);
};

const getGeneratedDir = () => {
  const outputDir = CONFIG.outputDir;
  if (path.isAbsolute(outputDir)) {
    return outputDir;
  }
  return path.join(CONFIG.projectRoot, outputDir);
};

// 类型定义
interface Task {
  lineNumber: number;
  indent: number;
  title: string;
  completed: boolean;
  parent?: string;
  section?: string;
  subsection?: string;
}

interface ParsedTodolist {
  content: string;
  lines: string[];
  tasks: Task[];
}

// 解析 Markdown 任务列表
function parseTodolist(): ParsedTodolist {
  const todolistPath = getTodolistPath();
  if (!fs.existsSync(todolistPath)) {
    throw new Error(`Todolist file not found: ${todolistPath}`);
  }

  const content = fs.readFileSync(todolistPath, "utf-8");
  const lines = content.split("\n");
  const tasks: Task[] = [];

  let currentSection = "";
  let currentSubsection = "";
  let lastParentTask = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测章节标题 (## 或 ###)
    if (line.startsWith("## ") || line.startsWith("### ")) {
      currentSection = line.replace(/^#+\s*/, "").trim();
      currentSubsection = "";
      continue;
    }

    // 检测小节标题 (#### 或 #####)
    if (line.startsWith("#### ") || line.startsWith("##### ")) {
      currentSubsection = line.replace(/^#+\s*/, "").trim();
      continue;
    }

    // 检测任务项 - [ ] 或 - [x] 或 - [X]
    const taskMatch = line.match(/^(\s*)- \[([ xX])\]\s*(.+)$/);
    if (taskMatch) {
      const [, indentStr, status, title] = taskMatch;
      const indent = indentStr.length;
      const completed = status.toLowerCase() === "x";

      // 判断是否是父级任务（包含 **）
      const isParentTask = title.includes("**");
      if (isParentTask) {
        lastParentTask = title.replace(/\*\*/g, "").trim();
      }

      tasks.push({
        lineNumber: i,
        indent,
        title: title.trim(),
        completed,
        parent: indent > 0 ? lastParentTask : undefined,
        section: currentSection,
        subsection: currentSubsection,
      });
    }
  }

  return { content, lines, tasks };
}

// 获取下一个未完成的任务
function getNextPendingTask(): Task | null {
  const { tasks } = parseTodolist();
  return tasks.find((task) => !task.completed) || null;
}

// 获取多个未完成任务
function getNextPendingTasks(count: number): Task[] {
  const { tasks } = parseTodolist();
  return tasks.filter((task) => !task.completed).slice(0, count);
}

// 生成进度消息
function formatProgressMessage(
  current: number,
  total: number,
  taskTitle: string,
  status: "starting" | "generating" | "saving" | "completed" | "error"
): string {
  const progressBar = generateProgressBar(current, total);
  const statusEmoji = {
    starting: "🚀",
    generating: "⏳",
    saving: "💾",
    completed: "✅",
    error: "❌",
  };
  return `${statusEmoji[status]} [${current}/${total}] ${progressBar} ${taskTitle}`;
}

function generateProgressBar(current: number, total: number): string {
  const width = 20;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}]`;
}

// 计算内容字数统计
interface WordCountStats {
  totalChars: number; // 总字符数
  chineseChars: number; // 中文字符数
  englishWords: number; // 英文单词数
  numbers: number; // 数字个数
  formatted: string; // 格式化显示
}

function countWords(obj: any): WordCountStats {
  const text = JSON.stringify(obj);
  
  // 中文字符（包括中文标点）
  const chineseChars = (text.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || []).length;
  
  // 英文单词
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  
  // 数字
  const numbers = (text.match(/\d+/g) || []).length;
  
  // 总字符数（不含JSON格式符号）
  const cleanText = text.replace(/[{}\[\]":,]/g, "");
  const totalChars = cleanText.length;
  
  const formatted = `📝 ${chineseChars} 中文字 | ${englishWords} 英文词 | ${totalChars} 总字符`;
  
  return {
    totalChars,
    chineseChars,
    englishWords,
    numbers,
    formatted,
  };
}

// 生成详细的进度显示
function formatDetailedProgress(
  stats: ReturnType<typeof getTaskStats>,
  taskTitle: string,
  wordStats?: WordCountStats
): string {
  const progressBar = generateProgressBar(stats.completed, stats.total);
  const percent = Math.round((stats.completed / stats.total) * 100);
  
  let display = `\n╔══════════════════════════════════════════════════════════════╗\n`;
  display += `║  📊 生成进度: ${progressBar} ${stats.completed}/${stats.total} (${percent}%)\n`;
  display += `║  📋 当前任务: ${taskTitle.substring(0, 40)}${taskTitle.length > 40 ? "..." : ""}\n`;
  
  if (wordStats) {
    display += `║  ${wordStats.formatted}\n`;
  }
  
  display += `║  ⏳ 待处理: ${stats.pending} 个任务\n`;
  display += `╚══════════════════════════════════════════════════════════════╝`;
  
  return display;
}

// 标记任务为完成
function markTaskComplete(lineNumber: number): boolean {
  const todolistPath = getTodolistPath();
  const content = fs.readFileSync(todolistPath, "utf-8");
  const lines = content.split("\n");

  if (lineNumber < 0 || lineNumber >= lines.length) {
    return false;
  }

  const line = lines[lineNumber];
  // 将 - [ ] 替换为 - [x]
  if (line.includes("- [ ]")) {
    lines[lineNumber] = line.replace("- [ ]", "- [x]");
    fs.writeFileSync(todolistPath, lines.join("\n"));
    return true;
  }

  return false;
}

// 获取任务统计
function getTaskStats() {
  const { tasks } = parseTodolist();

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    bySection: {} as Record<
      string,
      { total: number; completed: number; pending: number }
    >,
  };

  for (const task of tasks) {
    const section = task.section || "未分类";
    if (!stats.bySection[section]) {
      stats.bySection[section] = { total: 0, completed: 0, pending: 0 };
    }
    stats.bySection[section].total++;
    if (task.completed) {
      stats.bySection[section].completed++;
    } else {
      stats.bySection[section].pending++;
    }
  }

  return stats;
}

// 科目映射
const SUBJECT_MAP: Record<string, string> = {
  言语理解: "xingce",
  数量关系: "xingce",
  判断推理: "xingce",
  资料分析: "xingce",
  常识判断: "xingce",
  申论: "shenlun",
  面试: "mianshi",
  公基: "gongji",
  公共基础知识: "gongji",
};

// 根据任务标题推断科目
function inferSubject(task: Task): string {
  const section = task.section || "";
  const subsection = task.subsection || "";
  const title = task.title;

  for (const [key, value] of Object.entries(SUBJECT_MAP)) {
    if (
      section.includes(key) ||
      subsection.includes(key) ||
      title.includes(key)
    ) {
      return value;
    }
  }
  return "xingce";
}

// 根据任务标题推断类型
function inferTaskType(
  task: Task
): "course" | "question" | "material" | "exam" {
  const section = task.section || "";
  const subsection = task.subsection || "";

  if (section.includes("课程") || subsection.includes("课程")) {
    return "course";
  }
  if (section.includes("题库") || subsection.includes("题库")) {
    return "question";
  }
  if (section.includes("素材") || subsection.includes("素材")) {
    return "material";
  }
  if (section.includes("试卷") || subsection.includes("试卷")) {
    return "exam";
  }

  return "course";
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: "content-generator",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_config",
        description: "获取当前 MCP 服务的配置信息，包括正在读取的任务文件路径",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "set_todolist_file",
        description:
          "动态设置要读取的任务文件路径（支持绝对路径或相对于项目根目录的路径）",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description:
                "任务文件路径，如 'docs/content-creation-todolist.md' 或绝对路径",
            },
          },
          required: ["file_path"],
        },
      },
      {
        name: "get_current_task",
        description:
          "从配置的任务文件获取当前需要生成的内容任务信息，返回第一个未完成的任务",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "mark_task_complete",
        description:
          "将指定任务标记为已完成（在 todolist 中将 - [ ] 改为 - [x]）",
        inputSchema: {
          type: "object",
          properties: {
            line_number: {
              type: "number",
              description: "任务所在的行号（从0开始）",
            },
          },
          required: ["line_number"],
        },
      },
      {
        name: "save_course_content",
        description:
          "保存生成的课程教学内容到文件系统。需要提供完整的课程 JSON 数据",
        inputSchema: {
          type: "object",
          properties: {
            task_line_number: {
              type: "number",
              description: "对应任务的行号，保存后自动标记完成",
            },
            content: {
              type: "object",
              description: "课程内容 JSON 对象",
              properties: {
                chapter_title: { type: "string" },
                subject: { type: "string" },
                knowledge_point: { type: "string" },
                lesson_content: { type: "object" },
                lesson_sections: { type: "array" },
                practice_problems: { type: "array" },
              },
              required: [
                "chapter_title",
                "subject",
                "knowledge_point",
                "lesson_content",
                "lesson_sections",
                "practice_problems",
              ],
            },
          },
          required: ["content"],
        },
      },
      {
        name: "save_question_batch",
        description: "保存生成的题目批次到文件系统",
        inputSchema: {
          type: "object",
          properties: {
            task_line_number: {
              type: "number",
              description: "对应任务的行号，保存后自动标记完成",
            },
            batch_info: {
              type: "object",
              properties: {
                category: { type: "string" },
                topic: { type: "string" },
                batch_number: { type: "number" },
                count: { type: "number" },
              },
              required: ["category", "topic", "batch_number", "count"],
            },
            questions: {
              type: "array",
              description: "题目数组",
            },
          },
          required: ["batch_info", "questions"],
        },
      },
      {
        name: "save_material_batch",
        description: "保存生成的素材批次到文件系统",
        inputSchema: {
          type: "object",
          properties: {
            task_line_number: {
              type: "number",
              description: "对应任务的行号，保存后自动标记完成",
            },
            batch_info: {
              type: "object",
              properties: {
                category: { type: "string" },
                topic: { type: "string" },
                batch_number: { type: "number" },
                count: { type: "number" },
              },
              required: ["category", "topic", "batch_number", "count"],
            },
            materials: {
              type: "array",
              description: "素材数组",
            },
          },
          required: ["batch_info", "materials"],
        },
      },
      {
        name: "get_progress_status",
        description:
          "获取 content-creation-todolist.md 中所有任务的完成进度统计",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "list_pending_tasks",
        description: "列出所有未完成的任务（可指定数量限制）",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "返回的最大任务数量，默认10",
              default: 10,
            },
            section_filter: {
              type: "string",
              description: "可选，按章节名称过滤",
            },
          },
          required: [],
        },
      },
      {
        name: "import_to_database",
        description: "将已生成的内容文件导入到数据库（需要后端服务运行）",
        inputSchema: {
          type: "object",
          properties: {
            dry_run: {
              type: "boolean",
              description: "是否为预览模式（不实际导入）",
              default: false,
            },
          },
          required: [],
        },
      },
      {
        name: "get_batch_tasks",
        description:
          "获取多个待处理任务，用于批量/持续生成模式。返回任务列表和总进度信息",
        inputSchema: {
          type: "object",
          properties: {
            count: {
              type: "number",
              description: "要获取的任务数量，默认5个，最多20个",
              default: 5,
            },
            section_filter: {
              type: "string",
              description: "可选，按章节名称过滤",
            },
          },
          required: [],
        },
      },
      {
        name: "set_continuous_mode",
        description:
          "设置持续生成模式。开启后，save 操作会自动返回下一个任务，便于连续生成",
        inputSchema: {
          type: "object",
          properties: {
            enabled: {
              type: "boolean",
              description: "是否启用持续生成模式",
            },
            max_tasks: {
              type: "number",
              description: "单次最多连续生成的任务数，默认10",
              default: 10,
            },
          },
          required: ["enabled"],
        },
      },
      {
        name: "get_generation_status",
        description:
          "获取当前生成状态，包括持续模式配置、已完成任务数、剩余任务等信息",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "report_generation_progress",
        description:
          "报告当前内容生成的实时进度，用于在生成过程中刷新显示字数和进度。每次调用会返回格式化的进度显示",
        inputSchema: {
          type: "object",
          properties: {
            task_title: {
              type: "string",
              description: "当前正在生成的任务标题",
            },
            current_content: {
              type: "string",
              description: "当前已生成的内容文本（用于计算字数）",
            },
            status: {
              type: "string",
              enum: ["starting", "generating", "saving", "completed"],
              description: "当前生成状态",
              default: "generating",
            },
          },
          required: ["task_title"],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_config": {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  config: {
                    project_root: CONFIG.projectRoot,
                    todolist_file: CONFIG.todolistFile,
                    todolist_full_path: getTodolistPath(),
                    output_dir: CONFIG.outputDir,
                    output_full_path: getGeneratedDir(),
                    api_base_url: CONFIG.apiBaseUrl,
                  },
                  hint: "使用 set_todolist_file 可以动态更改任务文件",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "set_todolist_file": {
        const filePath = args?.file_path as string;
        if (!filePath) {
          throw new Error("Missing file_path parameter");
        }

        // 检查文件是否存在
        const fullPath = path.isAbsolute(filePath)
          ? filePath
          : path.join(CONFIG.projectRoot, filePath);

        if (!fs.existsSync(fullPath)) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    error: `文件不存在: ${fullPath}`,
                    hint: "请检查文件路径是否正确",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // 更新配置
        CONFIG.todolistFile = filePath;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `任务文件已切换`,
                  new_file: filePath,
                  full_path: fullPath,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_current_task": {
        const task = getNextPendingTask();

        if (!task) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "🎉 所有任务已完成！",
                    completed: true,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const subject = inferSubject(task);
        const taskType = inferTaskType(task);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  task: {
                    line_number: task.lineNumber,
                    title: task.title,
                    section: task.section,
                    subsection: task.subsection,
                    parent: task.parent,
                    subject,
                    type: taskType,
                  },
                  prompt_hint:
                    taskType === "course"
                      ? `请生成课程内容：${task.title}`
                      : taskType === "question"
                        ? `请生成题目：${task.title}`
                        : `请生成素材：${task.title}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "mark_task_complete": {
        const lineNumber = args?.line_number as number;
        if (typeof lineNumber !== "number") {
          throw new Error("Missing or invalid line_number parameter");
        }

        const success = markTaskComplete(lineNumber);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success,
                  message: success
                    ? `任务已标记为完成（行 ${lineNumber + 1}）`
                    : `无法标记任务完成（行 ${lineNumber + 1}）`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "save_course_content": {
        const content = args?.content as any;
        const taskLineNumber = args?.task_line_number as number | undefined;

        if (!content) {
          throw new Error("Missing content parameter");
        }

        // 计算字数统计
        const wordStats = countWords(content);

        // 获取任务元数据（用于确定课程顺序和层级）
        let taskMetadata: {
          line_number?: number;
          lesson_order?: number;
          section?: string;
          subsection?: string;
          parent_title?: string;
          is_sub_lesson?: boolean;
        } = {};

        if (typeof taskLineNumber === "number") {
          const { tasks } = parseTodolist();
          const task = tasks.find(t => t.lineNumber === taskLineNumber);
          if (task) {
            // 计算课程全局顺序（在所有课程任务中的位置）
            const courseTasks = tasks.filter(t => 
              t.section?.includes("课程") || t.subsection?.includes("课时")
            );
            const lessonOrder = courseTasks.findIndex(t => t.lineNumber === taskLineNumber) + 1;
            
            taskMetadata = {
              line_number: task.lineNumber,
              lesson_order: lessonOrder > 0 ? lessonOrder : undefined,
              section: task.section,
              subsection: task.subsection,
              parent_title: task.parent,
              is_sub_lesson: task.indent > 0 && !!task.parent,
            };
          }
        }

        // 合并内容和元数据
        const contentWithMetadata = {
          // 元数据放在最前面，便于查看
          _metadata: {
            generated_at: new Date().toISOString(),
            ...taskMetadata,
          },
          // 原有内容
          ...content,
        };

        // 生成文件名（包含章节信息和顺序编号）
        const orderPrefix = taskMetadata.lesson_order 
          ? String(taskMetadata.lesson_order).padStart(3, '0') 
          : '000';
        
        // 提取章节简称（如 "1.1 言语理解与表达课程" -> "1.1-言语理解"）
        const sectionShort = taskMetadata.section
          ? taskMetadata.section
              .replace(/课程$/, '')
              .replace(/与表达$/, '')
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]+/g, '-')
              .substring(0, 15)
          : '';
        
        // 提取小节简称（如 "实词辨析精讲（20课时）" -> "实词辨析"）
        const subsectionShort = taskMetadata.subsection
          ? taskMetadata.subsection
              .replace(/[（(].+[）)]/, '')
              .replace(/精讲|专题|课程/, '')
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
              .substring(0, 10)
          : '';
        
        // 课程标题简称
        const titleShort = (content.chapter_title || "untitled")
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]/g, "-")
          .replace(/-+/g, '-')
          .substring(0, 30);
        
        const timestamp = Date.now();
        
        // 组合文件名: 顺序-章节-小节-标题-时间戳
        const filenameParts = [orderPrefix, sectionShort, subsectionShort, titleShort]
          .filter(part => part && part !== '-')
          .join('-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const filename = `${filenameParts}-${timestamp}.json`;
        const filepath = path.join(getGeneratedDir(), "courses", filename);

        // 确保目录存在
        fs.mkdirSync(path.dirname(filepath), { recursive: true });

        // 保存文件（包含元数据）
        fs.writeFileSync(filepath, JSON.stringify(contentWithMetadata, null, 2));

        // 如果提供了任务行号，标记任务完成
        if (typeof taskLineNumber === "number") {
          markTaskComplete(taskLineNumber);
        }

        // 获取进度信息
        const stats = getTaskStats();
        const progressInfo = {
          completed: stats.completed,
          pending: stats.pending,
          total: stats.total,
          percent: Math.round((stats.completed / stats.total) * 100),
        };

        // 如果开启了持续模式，自动返回下一个任务
        let nextTask = null;
        let continueHint = null;
        if (CONFIG.continuousMode) {
          const next = getNextPendingTask();
          if (next) {
            const subject = inferSubject(next);
            const taskType = inferTaskType(next);
            nextTask = {
              line_number: next.lineNumber,
              title: next.title,
              section: next.section,
              subsection: next.subsection,
              parent: next.parent,
              subject,
              type: taskType,
            };
            continueHint = `请继续生成: ${next.title}`;
          } else {
            continueHint = "🎉 所有任务已完成！";
          }
        }

        const streamProgress = formatProgressMessage(
          stats.completed,
          stats.total,
          content.chapter_title,
          "completed"
        );

        // 详细进度显示
        const detailedProgress = formatDetailedProgress(stats, content.chapter_title, wordStats);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `课程内容已保存: ${filename}`,
                  filepath,
                  task_marked_complete:
                    typeof taskLineNumber === "number" ? taskLineNumber : null,
                  word_count: {
                    chinese_chars: wordStats.chineseChars,
                    english_words: wordStats.englishWords,
                    total_chars: wordStats.totalChars,
                    display: wordStats.formatted,
                  },
                  stream_progress: streamProgress,
                  detailed_progress: detailedProgress,
                  progress: progressInfo,
                  continuous_mode: CONFIG.continuousMode,
                  next_task: nextTask,
                  continue_hint: continueHint,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "save_question_batch": {
        const batchInfo = args?.batch_info as any;
        const questions = args?.questions as any[];
        const taskLineNumber = args?.task_line_number as number | undefined;

        if (!batchInfo || !questions) {
          throw new Error("Missing batch_info or questions parameter");
        }

        // 计算字数统计
        const wordStats = countWords({ batch_info: batchInfo, questions });

        // 获取任务元数据
        let taskMetadata: {
          line_number?: number;
          task_order?: number;
          section?: string;
          subsection?: string;
          parent_title?: string;
        } = {};

        if (typeof taskLineNumber === "number") {
          const { tasks } = parseTodolist();
          const task = tasks.find(t => t.lineNumber === taskLineNumber);
          if (task) {
            const questionTasks = tasks.filter(t => 
              t.section?.includes("题库") || t.subsection?.includes("题")
            );
            const taskOrder = questionTasks.findIndex(t => t.lineNumber === taskLineNumber) + 1;
            
            taskMetadata = {
              line_number: task.lineNumber,
              task_order: taskOrder > 0 ? taskOrder : undefined,
              section: task.section,
              subsection: task.subsection,
              parent_title: task.parent,
            };
          }
        }

        // 合并内容和元数据
        const contentWithMetadata = {
          _metadata: {
            generated_at: new Date().toISOString(),
            ...taskMetadata,
          },
          batch_info: batchInfo,
          questions,
        };

        // 生成文件名（包含章节信息和顺序编号）
        const orderPrefix = taskMetadata.task_order 
          ? String(taskMetadata.task_order).padStart(3, '0') 
          : '000';
        
        // 提取章节简称
        const sectionShort = taskMetadata.section
          ? taskMetadata.section
              .replace(/题库[（(].+[）)]?/, '')
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]+/g, '-')
              .substring(0, 15)
          : '';
        
        const safeCategory = (batchInfo.category || '')
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
          .substring(0, 15);
        const safeTopic = (batchInfo.topic || '')
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
          .substring(0, 20);
        
        // 组合文件名: 顺序-章节-类别-主题-批次
        const filenameParts = [orderPrefix, sectionShort, safeCategory, safeTopic]
          .filter(part => part && part !== '-')
          .join('-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const filename = `${filenameParts}-batch${batchInfo.batch_number}.json`;
        const filepath = path.join(getGeneratedDir(), "questions", filename);

        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, JSON.stringify(contentWithMetadata, null, 2));

        if (typeof taskLineNumber === "number") {
          markTaskComplete(taskLineNumber);
        }

        // 获取进度信息
        const stats = getTaskStats();
        const progressInfo = {
          completed: stats.completed,
          pending: stats.pending,
          total: stats.total,
          percent: Math.round((stats.completed / stats.total) * 100),
        };

        // 如果开启了持续模式，自动返回下一个任务
        let nextTask = null;
        let continueHint = null;
        if (CONFIG.continuousMode) {
          const next = getNextPendingTask();
          if (next) {
            const subject = inferSubject(next);
            const taskType = inferTaskType(next);
            nextTask = {
              line_number: next.lineNumber,
              title: next.title,
              section: next.section,
              subsection: next.subsection,
              parent: next.parent,
              subject,
              type: taskType,
            };
            continueHint = `请继续生成: ${next.title}`;
          } else {
            continueHint = "🎉 所有任务已完成！";
          }
        }

        const taskTitle = `${batchInfo.category}-${batchInfo.topic}`;
        const streamProgress = formatProgressMessage(
          stats.completed,
          stats.total,
          taskTitle,
          "completed"
        );

        // 详细进度显示
        const detailedProgress = formatDetailedProgress(stats, taskTitle, wordStats);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `题目批次已保存: ${filename} (${questions.length}题)`,
                  filepath,
                  task_marked_complete:
                    typeof taskLineNumber === "number" ? taskLineNumber : null,
                  word_count: {
                    chinese_chars: wordStats.chineseChars,
                    english_words: wordStats.englishWords,
                    total_chars: wordStats.totalChars,
                    display: wordStats.formatted,
                  },
                  stream_progress: streamProgress,
                  detailed_progress: detailedProgress,
                  progress: progressInfo,
                  continuous_mode: CONFIG.continuousMode,
                  next_task: nextTask,
                  continue_hint: continueHint,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "save_material_batch": {
        const batchInfo = args?.batch_info as any;
        const materials = args?.materials as any[];
        const taskLineNumber = args?.task_line_number as number | undefined;

        if (!batchInfo || !materials) {
          throw new Error("Missing batch_info or materials parameter");
        }

        // 计算字数统计
        const wordStats = countWords({ batch_info: batchInfo, materials });

        // 获取任务元数据
        let taskMetadata: {
          line_number?: number;
          task_order?: number;
          section?: string;
          subsection?: string;
          parent_title?: string;
        } = {};

        if (typeof taskLineNumber === "number") {
          const { tasks } = parseTodolist();
          const task = tasks.find(t => t.lineNumber === taskLineNumber);
          if (task) {
            const materialTasks = tasks.filter(t => 
              t.section?.includes("素材") || t.subsection?.includes("素材")
            );
            const taskOrder = materialTasks.findIndex(t => t.lineNumber === taskLineNumber) + 1;
            
            taskMetadata = {
              line_number: task.lineNumber,
              task_order: taskOrder > 0 ? taskOrder : undefined,
              section: task.section,
              subsection: task.subsection,
              parent_title: task.parent,
            };
          }
        }

        // 合并内容和元数据
        const contentWithMetadata = {
          _metadata: {
            generated_at: new Date().toISOString(),
            ...taskMetadata,
          },
          batch_info: batchInfo,
          materials,
        };

        // 生成文件名（包含章节信息和顺序编号）
        const orderPrefix = taskMetadata.task_order 
          ? String(taskMetadata.task_order).padStart(3, '0') 
          : '000';
        
        // 提取章节简称
        const sectionShort = taskMetadata.section
          ? taskMetadata.section
              .replace(/素材[（(].+[）)]?/, '')
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5.]+/g, '-')
              .substring(0, 15)
          : '';
        
        const safeCategory = (batchInfo.category || '')
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
          .substring(0, 15);
        const safeTopic = (batchInfo.topic || '')
          .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-')
          .substring(0, 20);
        
        // 组合文件名: 顺序-章节-类别-主题-批次
        const filenameParts = [orderPrefix, sectionShort, safeCategory, safeTopic]
          .filter(part => part && part !== '-')
          .join('-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const filename = `${filenameParts}-batch${batchInfo.batch_number}.json`;
        const filepath = path.join(getGeneratedDir(), "materials", filename);

        fs.mkdirSync(path.dirname(filepath), { recursive: true });
        fs.writeFileSync(filepath, JSON.stringify(contentWithMetadata, null, 2));

        if (typeof taskLineNumber === "number") {
          markTaskComplete(taskLineNumber);
        }

        // 获取进度信息
        const stats = getTaskStats();
        const progressInfo = {
          completed: stats.completed,
          pending: stats.pending,
          total: stats.total,
          percent: Math.round((stats.completed / stats.total) * 100),
        };

        // 如果开启了持续模式，自动返回下一个任务
        let nextTask = null;
        let continueHint = null;
        if (CONFIG.continuousMode) {
          const next = getNextPendingTask();
          if (next) {
            const subject = inferSubject(next);
            const taskType = inferTaskType(next);
            nextTask = {
              line_number: next.lineNumber,
              title: next.title,
              section: next.section,
              subsection: next.subsection,
              parent: next.parent,
              subject,
              type: taskType,
            };
            continueHint = `请继续生成: ${next.title}`;
          } else {
            continueHint = "🎉 所有任务已完成！";
          }
        }

        const taskTitle = `${batchInfo.category}-${batchInfo.topic}`;
        const streamProgress = formatProgressMessage(
          stats.completed,
          stats.total,
          taskTitle,
          "completed"
        );

        // 详细进度显示
        const detailedProgress = formatDetailedProgress(stats, taskTitle, wordStats);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `素材批次已保存: ${filename} (${materials.length}条)`,
                  filepath,
                  task_marked_complete:
                    typeof taskLineNumber === "number" ? taskLineNumber : null,
                  word_count: {
                    chinese_chars: wordStats.chineseChars,
                    english_words: wordStats.englishWords,
                    total_chars: wordStats.totalChars,
                    display: wordStats.formatted,
                  },
                  stream_progress: streamProgress,
                  detailed_progress: detailedProgress,
                  progress: progressInfo,
                  continuous_mode: CONFIG.continuousMode,
                  next_task: nextTask,
                  continue_hint: continueHint,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_progress_status": {
        const stats = getTaskStats();
        const percent =
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  progress: {
                    total: stats.total,
                    completed: stats.completed,
                    pending: stats.pending,
                    percent,
                    by_section: stats.bySection,
                  },
                  source_file: getTodolistPath(),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_pending_tasks": {
        const limit = (args?.limit as number) || 10;
        const sectionFilter = args?.section_filter as string | undefined;

        const { tasks } = parseTodolist();
        let pendingTasks = tasks.filter((t) => !t.completed);

        if (sectionFilter) {
          pendingTasks = pendingTasks.filter(
            (t) => t.section?.includes(sectionFilter) || false
          );
        }

        const limitedTasks = pendingTasks.slice(0, limit).map((t) => ({
          line_number: t.lineNumber,
          title: t.title,
          section: t.section,
          subsection: t.subsection,
          parent: t.parent,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  total_pending: pendingTasks.length,
                  showing: limitedTasks.length,
                  tasks: limitedTasks,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "import_to_database": {
        const dryRun = args?.dry_run ?? false;
        const generatedDir = getGeneratedDir();

        const pendingFiles: string[] = [];

        // 扫描生成的文件
        for (const subdir of ["courses", "questions", "materials"]) {
          const dir = path.join(generatedDir, subdir);
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
            pendingFiles.push(...files.map((f) => `${subdir}/${f}`));
          }
        }

        if (pendingFiles.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "没有待导入的文件",
                    pending_count: 0,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        if (dryRun) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    message: "预览模式 - 以下文件待导入",
                    dry_run: true,
                    pending_files: pendingFiles,
                    pending_count: pendingFiles.length,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: `准备导入 ${pendingFiles.length} 个文件，请确保后端服务已启动`,
                  pending_files: pendingFiles,
                  api_base: CONFIG.apiBaseUrl,
                  hint: "运行 'pnpm dev:server' 启动后端服务后再导入",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_batch_tasks": {
        const count = Math.min((args?.count as number) || 5, 20);
        const sectionFilter = args?.section_filter as string | undefined;

        const { tasks } = parseTodolist();
        let pendingTasks = tasks.filter((t) => !t.completed);

        if (sectionFilter) {
          pendingTasks = pendingTasks.filter(
            (t) => t.section?.includes(sectionFilter) || false
          );
        }

        const batchTasks = pendingTasks.slice(0, count).map((t) => {
          const subject = inferSubject(t);
          const taskType = inferTaskType(t);
          return {
            line_number: t.lineNumber,
            title: t.title,
            section: t.section,
            subsection: t.subsection,
            parent: t.parent,
            subject,
            type: taskType,
          };
        });

        const stats = getTaskStats();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  batch_count: batchTasks.length,
                  total_pending: pendingTasks.length,
                  tasks: batchTasks,
                  progress: {
                    total: stats.total,
                    completed: stats.completed,
                    pending: stats.pending,
                    percent: Math.round((stats.completed / stats.total) * 100),
                  },
                  stream_hint: `📋 获取了 ${batchTasks.length} 个任务，总进度: ${stats.completed}/${stats.total} (${Math.round((stats.completed / stats.total) * 100)}%)`,
                  continuous_mode_hint:
                    "建议使用 set_continuous_mode 开启持续生成模式，保存时会自动返回下一个任务",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "set_continuous_mode": {
        const enabled = args?.enabled as boolean;
        const maxTasks = (args?.max_tasks as number) || 10;

        if (typeof enabled !== "boolean") {
          throw new Error("Missing enabled parameter");
        }

        CONFIG.continuousMode = enabled;
        CONFIG.maxContinuousTasks = maxTasks;

        const stats = getTaskStats();
        const nextTask = enabled ? getNextPendingTask() : null;

        let response: any = {
          success: true,
          continuous_mode: enabled,
          max_tasks: maxTasks,
          message: enabled
            ? `✅ 持续生成模式已开启，最多连续生成 ${maxTasks} 个任务`
            : "⏸️ 持续生成模式已关闭",
          progress: {
            total: stats.total,
            completed: stats.completed,
            pending: stats.pending,
          },
        };

        if (enabled && nextTask) {
          const subject = inferSubject(nextTask);
          const taskType = inferTaskType(nextTask);
          response.first_task = {
            line_number: nextTask.lineNumber,
            title: nextTask.title,
            section: nextTask.section,
            subsection: nextTask.subsection,
            parent: nextTask.parent,
            subject,
            type: taskType,
          };
          response.start_hint = `🚀 开始生成: ${nextTask.title}`;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      }

      case "get_generation_status": {
        const stats = getTaskStats();
        const nextTask = getNextPendingTask();

        let nextTaskInfo = null;
        if (nextTask) {
          const subject = inferSubject(nextTask);
          const taskType = inferTaskType(nextTask);
          nextTaskInfo = {
            line_number: nextTask.lineNumber,
            title: nextTask.title,
            section: nextTask.section,
            subsection: nextTask.subsection,
            subject,
            type: taskType,
          };
        }

        const progressBar = generateProgressBar(stats.completed, stats.total);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  status: {
                    continuous_mode: CONFIG.continuousMode,
                    max_continuous_tasks: CONFIG.maxContinuousTasks,
                  },
                  progress: {
                    total: stats.total,
                    completed: stats.completed,
                    pending: stats.pending,
                    percent: Math.round((stats.completed / stats.total) * 100),
                    progress_bar: progressBar,
                  },
                  next_task: nextTaskInfo,
                  source_file: getTodolistPath(),
                  stream_display: `📊 进度: ${progressBar} ${stats.completed}/${stats.total} (${Math.round((stats.completed / stats.total) * 100)}%) | 持续模式: ${CONFIG.continuousMode ? "开启" : "关闭"}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "report_generation_progress": {
        const taskTitle = args?.task_title as string;
        const currentContent = args?.current_content as string | undefined;
        const status = (args?.status as string) || "generating";

        if (!taskTitle) {
          throw new Error("Missing task_title parameter");
        }

        const stats = getTaskStats();
        const progressBar = generateProgressBar(stats.completed, stats.total);
        const percent = Math.round((stats.completed / stats.total) * 100);

        // 计算当前内容的字数
        let wordStats: WordCountStats | undefined;
        if (currentContent) {
          wordStats = countWords(currentContent);
        }

        const statusEmoji: Record<string, string> = {
          starting: "🚀",
          generating: "⏳",
          saving: "💾",
          completed: "✅",
        };

        const statusText: Record<string, string> = {
          starting: "开始生成",
          generating: "生成中",
          saving: "保存中",
          completed: "已完成",
        };

        // 构建实时进度显示
        let liveDisplay = `\n╔══════════════════════════════════════════════════════════════╗\n`;
        liveDisplay += `║  ${statusEmoji[status] || "⏳"} 状态: ${statusText[status] || status}\n`;
        liveDisplay += `║  📊 总进度: ${progressBar} ${stats.completed}/${stats.total} (${percent}%)\n`;
        liveDisplay += `║  📋 当前任务: ${taskTitle.substring(0, 40)}${taskTitle.length > 40 ? "..." : ""}\n`;
        
        if (wordStats) {
          liveDisplay += `║  📝 已生成: ${wordStats.chineseChars} 中文字 | ${wordStats.englishWords} 英文词 | ${wordStats.totalChars} 总字符\n`;
        }
        
        liveDisplay += `║  ⏳ 待处理: ${stats.pending} 个任务\n`;
        liveDisplay += `╚══════════════════════════════════════════════════════════════╝`;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  status,
                  task_title: taskTitle,
                  word_count: wordStats
                    ? {
                        chinese_chars: wordStats.chineseChars,
                        english_words: wordStats.englishWords,
                        total_chars: wordStats.totalChars,
                        display: wordStats.formatted,
                      }
                    : null,
                  progress: {
                    total: stats.total,
                    completed: stats.completed,
                    pending: stats.pending,
                    percent,
                    progress_bar: progressBar,
                  },
                  live_display: liveDisplay,
                  stream_line: `${statusEmoji[status] || "⏳"} [${stats.completed}/${stats.total}] ${progressBar} ${taskTitle}${wordStats ? ` | ${wordStats.formatted}` : ""}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: error instanceof Error ? error.message : String(error),
            },
            null,
            2
          ),
        },
      ],
    };
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Content Generator MCP Server v2.0 running on stdio");
  console.error(`Reading tasks from: ${getTodolistPath()}`);
}

main().catch(console.error);
