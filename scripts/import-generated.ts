/**
 * 内容导入脚本 v2.0 - 将 MCP 生成的 JSON 文件导入到数据库
 *
 * 用法：
 *   npx ts-node scripts/import-generated.ts              # 导入所有未导入的文件
 *   npx ts-node scripts/import-generated.ts --file <path>  # 导入指定文件
 *   npx ts-node scripts/import-generated.ts --dry-run    # 预览模式（不实际导入）
 *
 * 支持的内容类型：
 *   - courses/   课程教学内容
 *   - questions/ 题目内容
 *   - materials/ 素材内容
 */

import * as fs from "fs";
import * as path from "path";

// 配置
const apiToken = process.env.API_TOKEN || "";
const CONFIG = {
  // 根据是否有 token 选择 API 基础路径
  // 有 token：使用管理员接口（需认证）
  // 无 token：使用内部接口（开发环境无需认证）
  apiBaseUrl:
    process.env.API_BASE_URL ||
    (apiToken ? "http://localhost:9000/api/v1" : "http://localhost:9000/api/v1/internal"),
  apiToken,
  generatedDir: path.join(__dirname, "generated"),
  importedFile: path.join(__dirname, "generated/.imported.json"),
};

// 类型定义
interface ImportResult {
  file: string;
  type: "course" | "question" | "material";
  success: boolean;
  count: number;
  error?: string;
}

interface ImportedRecord {
  files: string[];
  last_updated: string;
}

// 题目选项转换（字符串数组 -> QuestionOption 数组）
interface QuestionOption {
  key: string;
  content: string;
}

function convertOptions(options: string[]): QuestionOption[] {
  return options.map((opt) => {
    // 匹配格式 "A. xxx" 或 "A、xxx" 或 "A xxx"
    const match = opt.match(/^([A-Z])[.、\s]\s*(.+)$/);
    if (match) {
      return { key: match[1], content: match[2] };
    }
    // 如果没有匹配到，尝试按索引分配
    const index = options.indexOf(opt);
    const key = String.fromCharCode(65 + index); // A, B, C, D...
    return { key, content: opt };
  });
}

// API 请求封装
async function apiRequest(endpoint: string, method: string, body?: any): Promise<any> {
  const url = `${CONFIG.apiBaseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (CONFIG.apiToken) {
    headers["Authorization"] = `Bearer ${CONFIG.apiToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${responseData.message || responseText}`);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}

// =====================================================
// 课程内容导入
// =====================================================

async function importCourse(
  data: any,
  dryRun: boolean
): Promise<{ success: boolean; count: number; error?: string }> {
  const metadata = data._metadata;
  const lessonOrder = metadata?.lesson_order || 0;
  const section = metadata?.section || "";

  console.log(`   📚 导入课程：${data.chapter_title}`);
  if (lessonOrder > 0) {
    console.log(`      📍 顺序: ${lessonOrder}, 章节: ${section}`);
  }

  if (dryRun) {
    console.log("   [DRY RUN] 跳过实际导入");
    return { success: true, count: 1 };
  }

  try {
    // 调用课程内容导入 API
    // 端点路径根据 apiBaseUrl 自动适配（内部接口或管理员接口）
    const endpoint = CONFIG.apiToken
      ? "/admin/content/import/course-lesson"
      : "/content/import/course-lesson";

    // 发送完整数据，包括元数据
    const result = await apiRequest(endpoint, "POST", {
      // 元数据
      _metadata: data._metadata,
      // 课程内容
      chapter_title: data.chapter_title,
      subject: data.subject,
      knowledge_point: data.knowledge_point,
      lesson_content: data.lesson_content,
      lesson_sections: data.lesson_sections,
      practice_problems: data.practice_problems,
    });

    return { success: true, count: 1 };
  } catch (error) {
    return { success: false, count: 0, error: String(error) };
  }
}

// =====================================================
// 题目内容导入
// =====================================================

async function importQuestions(
  data: any,
  dryRun: boolean
): Promise<{ success: boolean; count: number; error?: string }> {
  const questions = data.questions || [];
  const batchInfo = data.batch_info || {};
  console.log(`   📝 导入题目：${questions.length} 道`);

  if (dryRun) {
    console.log("   [DRY RUN] 跳过实际导入");
    return { success: true, count: questions.length };
  }

  try {
    // 转换题目格式以适配后端 API
    const formattedQuestions = questions.map((q: any, index: number) => ({
      content: q.content,
      // 转换 options 格式：["A. xxx"] -> [{key: "A", content: "xxx"}]
      options: Array.isArray(q.options) ? convertOptions(q.options) : [],
      answer: q.answer,
      analysis: q.analysis,
      difficulty: q.difficulty || 3,
      question_type: q.question_type || "single_choice",
      // 分类信息
      source_type: "original",
      source: q.source || `AI生成-${batchInfo.category || "未分类"}`,
      tags: q.knowledge_points || [],
      // 注意：category_id 需要在后端根据 category 名称查找
      category_name: batchInfo.category,
      sub_category_name: batchInfo.topic,
    }));

    // 调用批量创建题目 API
    const endpoint = CONFIG.apiToken
      ? "/admin/content/import/questions"
      : "/content/import/questions";
    const result = await apiRequest(endpoint, "POST", {
      questions: formattedQuestions,
      category_name: batchInfo.category,
      sub_category_name: batchInfo.topic,
    });

    return {
      success: true,
      count: result.data?.count || questions.length,
    };
  } catch (error) {
    return { success: false, count: 0, error: String(error) };
  }
}

// =====================================================
// 素材内容导入
// =====================================================

async function importMaterials(
  data: any,
  dryRun: boolean
): Promise<{ success: boolean; count: number; error?: string }> {
  const materials = data.materials || [];
  const batchInfo = data.batch_info || {};
  console.log(`   📑 导入素材：${materials.length} 条`);

  if (dryRun) {
    console.log("   [DRY RUN] 跳过实际导入");
    return { success: true, count: materials.length };
  }

  try {
    // 转换素材格式以适配后端 API
    // 注意：后端期望 tags 和 theme_topics 是逗号分隔的字符串
    const formattedMaterials = materials.map((m: any) => ({
      title: m.title,
      content: m.content,
      source: m.source,
      type: m.material_type || "quote",
      sub_type: m.sub_type || "",
      // 后端期望逗号分隔的字符串
      theme_topics: Array.isArray(m.theme) ? m.theme.join(",") : m.theme ? String(m.theme) : "",
      usage: m.usage_scenario || "",
      // 后端期望逗号分隔的字符串
      tags: Array.isArray(m.tags) ? m.tags.join(",") : m.tags || "",
      subject: batchInfo.category?.includes("面试") ? "面试" : "申论",
    }));

    // 调用素材批量导入 API
    const endpoint = CONFIG.apiToken
      ? "/admin/content/import/materials"
      : "/content/import/materials";
    const result = await apiRequest(endpoint, "POST", {
      type: detectMaterialType(batchInfo.category),
      items: formattedMaterials,
    });

    return {
      success: true,
      count: result.data?.success_count || materials.length,
    };
  } catch (error) {
    return { success: false, count: 0, error: String(error) };
  }
}

// 根据分类名称推断素材类型
function detectMaterialType(categoryName: string): string {
  if (!categoryName) return "quote";
  if (categoryName.includes("名言") || categoryName.includes("警句")) return "quote";
  if (categoryName.includes("案例")) return "case";
  if (categoryName.includes("热点")) return "hot_topic";
  if (categoryName.includes("面试") || categoryName.includes("金句")) return "interview";
  return "quote";
}

// =====================================================
// 文件处理
// =====================================================

// 判断文件类型
function detectFileType(filePath: string, content: any): "course" | "question" | "material" {
  const dir = path.dirname(filePath);
  if (dir.includes("courses") || content.lesson_content) {
    return "course";
  }
  if (dir.includes("questions") || content.questions) {
    return "question";
  }
  if (dir.includes("materials") || content.materials) {
    return "material";
  }
  return "course"; // 默认
}

// 读取已导入记录
function loadImportedRecord(): ImportedRecord {
  if (fs.existsSync(CONFIG.importedFile)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG.importedFile, "utf-8"));
    } catch {
      return { files: [], last_updated: "" };
    }
  }
  return { files: [], last_updated: "" };
}

// 保存已导入记录
function saveImportedRecord(record: ImportedRecord): void {
  record.last_updated = new Date().toISOString();
  fs.writeFileSync(CONFIG.importedFile, JSON.stringify(record, null, 2));
}

// 扫描待导入文件
function scanPendingFiles(): string[] {
  const imported = loadImportedRecord();
  const importedSet = new Set(imported.files);
  const pendingFiles: string[] = [];

  const dirs = ["courses", "questions", "materials"];
  for (const dir of dirs) {
    const dirPath = path.join(CONFIG.generatedDir, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const fullPath = path.join(dirPath, file);
      const relativePath = path.relative(CONFIG.generatedDir, fullPath);

      if (!importedSet.has(relativePath)) {
        pendingFiles.push(fullPath);
      }
    }
  }

  return pendingFiles;
}

// 导入单个文件
async function importFile(filePath: string, dryRun: boolean): Promise<ImportResult> {
  const relativePath = path.relative(CONFIG.generatedDir, filePath);
  console.log(`\n📄 处理文件：${relativePath}`);

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const fileType = detectFileType(filePath, content);

    let result: { success: boolean; count: number; error?: string };

    switch (fileType) {
      case "course":
        result = await importCourse(content, dryRun);
        break;
      case "question":
        result = await importQuestions(content, dryRun);
        break;
      case "material":
        result = await importMaterials(content, dryRun);
        break;
    }

    return {
      file: relativePath,
      type: fileType,
      ...result,
    };
  } catch (error) {
    return {
      file: relativePath,
      type: "course",
      success: false,
      count: 0,
      error: String(error),
    };
  }
}

// =====================================================
// 主函数
// =====================================================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run") || args.includes("-d");
  const fileIndex = args.findIndex((a) => a === "--file" || a === "-f");
  const specificFile = fileIndex >= 0 ? args[fileIndex + 1] : null;

  console.log("");
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║                    内容导入工具 v2.0                             ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");

  if (dryRun) {
    console.log("⚠️  预览模式：不会实际导入数据");
  }

  console.log(`📡 API 地址：${CONFIG.apiBaseUrl}`);

  if (!CONFIG.apiToken) {
    console.log("⚠️  提示：未设置 API_TOKEN 环境变量，可能无法访问需要认证的接口");
  }

  let filesToImport: string[];

  if (specificFile) {
    // 导入指定文件
    const fullPath = path.isAbsolute(specificFile)
      ? specificFile
      : path.join(process.cwd(), specificFile);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 文件不存在：${specificFile}`);
      return;
    }
    filesToImport = [fullPath];
  } else {
    // 扫描待导入文件
    filesToImport = scanPendingFiles();
  }

  if (filesToImport.length === 0) {
    console.log("\n✅ 没有待导入的文件");
    return;
  }

  console.log(`\n📋 找到 ${filesToImport.length} 个待导入文件`);

  const results: ImportResult[] = [];
  const importedRecord = loadImportedRecord();

  for (const file of filesToImport) {
    const result = await importFile(file, dryRun);
    results.push(result);

    if (result.success) {
      console.log(`   ✅ 成功导入 ${result.count} 条记录`);

      // 更新已导入记录
      if (!dryRun) {
        importedRecord.files.push(result.file);
      }
    } else {
      console.log(`   ❌ 导入失败：${result.error}`);
    }
  }

  // 保存已导入记录
  if (!dryRun && results.some((r) => r.success)) {
    saveImportedRecord(importedRecord);
  }

  // 汇总报告
  console.log("\n" + "═".repeat(70));
  console.log("📊 导入汇总");
  console.log("─".repeat(70));

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);
  const totalCount = successful.reduce((sum, r) => sum + r.count, 0);

  console.log(`   成功文件：${successful.length} 个`);
  console.log(`   失败文件：${failed.length} 个`);
  console.log(`   导入记录：${totalCount} 条`);

  if (failed.length > 0) {
    console.log("\n❌ 失败详情：");
    for (const r of failed) {
      console.log(`   - ${r.file}: ${r.error}`);
    }
  }

  console.log("");
}

// 运行
main().catch(console.error);
