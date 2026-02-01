/**
 * 学习内容数据迁移脚本
 * 将硬编码的前端数据导入到 learning_contents 数据库表
 *
 * 使用方式: npx ts-node scripts/import-learning-content.ts
 */

import * as fs from "fs";
import * as path from "path";

// API 配置
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:9000";

// 学习内容类型
type LearningContentType =
  | "tips" // 学习技巧
  | "formulas" // 公式/口诀
  | "guides" // 学习指南
  | "hot_topics" // 热点话题
  | "patterns" // 图形规律
  | "methods" // 学习方法
  | "strategies" // 答题策略
  | "quick_facts"; // 速记知识点

// 学习内容请求结构
interface LearningContentRequest {
  content_type: LearningContentType;
  subject: string;
  module?: string;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  content_json?: any;
  content_text?: string;
  sort_order?: number;
}

// 行测学习技巧数据 (来自 xingce/page.tsx)
const xingceLearningTips: LearningContentRequest[] = [
  {
    content_type: "tips",
    subject: "xingce",
    title: "科学规划时间",
    subtitle: "合理分配每个模块的答题时间，确保全面完成",
    icon: "Timer",
    color: "text-amber-600 bg-amber-50",
    sort_order: 1,
  },
  {
    content_type: "tips",
    subject: "xingce",
    title: "先易后难",
    subtitle: "优先完成擅长的题目，难题最后攻克",
    icon: "TrendingUp",
    color: "text-emerald-600 bg-emerald-50",
    sort_order: 2,
  },
  {
    content_type: "tips",
    subject: "xingce",
    title: "把握涂卡节奏",
    subtitle: "每完成一个模块就涂卡，避免最后手忙脚乱",
    icon: "CheckCircle2",
    color: "text-sky-600 bg-sky-50",
    sort_order: 3,
  },
  {
    content_type: "tips",
    subject: "xingce",
    title: "保持心态稳定",
    subtitle: "遇到难题不要慌，果断跳过继续答题",
    icon: "Brain",
    color: "text-violet-600 bg-violet-50",
    sort_order: 4,
  },
];

// 言语理解学习方法 (来自 yanyu/page.tsx)
const yanyuLearningMethods: LearningContentRequest[] = [
  {
    content_type: "methods",
    subject: "xingce",
    module: "yanyu",
    title: "词汇积累法",
    subtitle: "每天积累10个高频实词和5个成语",
    icon: "BookMarked",
    color: "text-blue-600 bg-blue-50",
    sort_order: 1,
  },
  {
    content_type: "methods",
    subject: "xingce",
    module: "yanyu",
    title: "结构分析法",
    subtitle: "学会快速分析文段结构找主旨",
    icon: "Target",
    color: "text-emerald-600 bg-emerald-50",
    sort_order: 2,
  },
  {
    content_type: "methods",
    subject: "xingce",
    module: "yanyu",
    title: "选项排除法",
    subtitle: "通过排除明显错误选项提高正确率",
    icon: "CheckCircle2",
    color: "text-amber-600 bg-amber-50",
    sort_order: 3,
  },
  {
    content_type: "methods",
    subject: "xingce",
    module: "yanyu",
    title: "真题精练法",
    subtitle: "反复练习历年真题掌握命题规律",
    icon: "PenTool",
    color: "text-purple-600 bg-purple-50",
    sort_order: 4,
  },
];

// 数量关系学习技巧 (来自 shuliang/page.tsx)
const shuliangLearningTips: LearningContentRequest[] = [
  {
    content_type: "strategies",
    subject: "xingce",
    module: "shuliang",
    title: "优先放弃原则",
    subtitle: "数量关系耗时长，考试时可以优先做其他模块，剩余时间再攻克",
    icon: "Clock",
    color: "text-blue-600 bg-blue-50",
    sort_order: 1,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "shuliang",
    title: "秒杀技巧",
    subtitle: "整除特性、尾数法、代入排除法可快速得出答案",
    icon: "Zap",
    color: "text-amber-600 bg-amber-50",
    sort_order: 2,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "shuliang",
    title: "熟记公式",
    subtitle: "常用公式要烂熟于心，考场上节省思考时间",
    icon: "BookMarked",
    color: "text-emerald-600 bg-emerald-50",
    sort_order: 3,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "shuliang",
    title: "题型专练",
    subtitle: "针对高频题型重点突破，提高投入产出比",
    icon: "Target",
    color: "text-purple-600 bg-purple-50",
    sort_order: 4,
  },
];

// 判断推理学习技巧 (来自 panduan/page.tsx)
const panduanLearningTips: LearningContentRequest[] = [
  {
    content_type: "strategies",
    subject: "xingce",
    module: "panduan",
    title: "图形推理四步法",
    subtitle: "看整体→找规律→验规律→选答案",
    icon: "Shapes",
    color: "text-blue-600 bg-blue-50",
    sort_order: 1,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "panduan",
    title: "定义判断关键词法",
    subtitle: "圈出主体、客体、方式、目的等关键信息",
    icon: "Target",
    color: "text-emerald-600 bg-emerald-50",
    sort_order: 2,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "panduan",
    title: "类比推理造句法",
    subtitle: "用相同句式造句，验证关系是否一致",
    icon: "GitBranch",
    color: "text-amber-600 bg-amber-50",
    sort_order: 3,
  },
  {
    content_type: "strategies",
    subject: "xingce",
    module: "panduan",
    title: "逻辑判断翻译法",
    subtitle: "将文字翻译成逻辑符号再推理",
    icon: "Brain",
    color: "text-purple-600 bg-purple-50",
    sort_order: 4,
  },
];

// 数量关系公式 (来自 shuliang/page.tsx)
const shuliangFormulas: LearningContentRequest[] = [
  {
    content_type: "formulas",
    subject: "xingce",
    module: "shuliang",
    title: "行程公式",
    content_json: {
      formulas: ["路程=速度×时间", "相遇时间=路程÷速度和", "追及时间=路程差÷速度差"],
    },
    color: "from-blue-500 to-indigo-500",
    sort_order: 1,
  },
  {
    content_type: "formulas",
    subject: "xingce",
    module: "shuliang",
    title: "工程公式",
    content_json: {
      formulas: ["工作量=效率×时间", "合作效率=各效率之和", "设总量为最小公倍数"],
    },
    color: "from-emerald-500 to-teal-500",
    sort_order: 2,
  },
  {
    content_type: "formulas",
    subject: "xingce",
    module: "shuliang",
    title: "利润公式",
    content_json: {
      formulas: ["利润=售价-成本", "利润率=利润÷成本", "售价=成本×(1+利润率)"],
    },
    color: "from-amber-500 to-orange-500",
    sort_order: 3,
  },
  {
    content_type: "formulas",
    subject: "xingce",
    module: "shuliang",
    title: "排列组合",
    content_json: {
      formulas: ["A(n,m)=n!/(n-m)!", "C(n,m)=n!/[m!(n-m)!]", "隔板法：C(n-1,m-1)"],
    },
    color: "from-purple-500 to-violet-500",
    sort_order: 4,
  },
];

// 图形推理规律 (来自 panduan/page.tsx)
const panduanPatterns: LearningContentRequest[] = [
  {
    content_type: "patterns",
    subject: "xingce",
    module: "panduan",
    title: "位置规律",
    content_json: {
      patterns: ["平移（方向、步数）", "旋转（角度、中心）", "翻转（轴对称、点对称）"],
      icon: "RotateCcw",
    },
    color: "bg-blue-50 text-blue-600 border-blue-200",
    sort_order: 1,
  },
  {
    content_type: "patterns",
    subject: "xingce",
    module: "panduan",
    title: "样式规律",
    content_json: {
      patterns: ["叠加（相加、相减、异或）", "遍历（元素不重不漏）", "对称（轴对称、中心对称）"],
      icon: "Diamond",
    },
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    sort_order: 2,
  },
  {
    content_type: "patterns",
    subject: "xingce",
    module: "panduan",
    title: "数量规律",
    content_json: {
      patterns: ["点数量", "线数量（直线、曲线）", "面数量", "角数量", "素数量"],
      icon: "Sigma",
    },
    color: "bg-amber-50 text-amber-600 border-amber-200",
    sort_order: 3,
  },
  {
    content_type: "patterns",
    subject: "xingce",
    module: "panduan",
    title: "属性规律",
    content_json: {
      patterns: ["封闭与开放", "曲直性", "对称性", "连通性"],
      icon: "Circle",
    },
    color: "bg-purple-50 text-purple-600 border-purple-200",
    sort_order: 4,
  },
];

// 逻辑推理公式 (来自 panduan/page.tsx)
const logicFormulas: LearningContentRequest[] = [
  {
    content_type: "formulas",
    subject: "xingce",
    module: "panduan",
    title: "翻译推理",
    content_json: {
      formulas: ["如果A那么B → A→B", "只有A才B → B→A", "A或B → ¬A→B", "逆否命题：A→B 等价于 ¬B→¬A"],
    },
    sort_order: 5,
  },
  {
    content_type: "formulas",
    subject: "xingce",
    module: "panduan",
    title: "矛盾关系",
    content_json: {
      formulas: [
        "所有S都是P ↔ 有些S不是P",
        "所有S都不是P ↔ 有些S是P",
        "A且B ↔ ¬A或¬B",
        "A或B ↔ ¬A且¬B",
      ],
    },
    sort_order: 6,
  },
];

// 所有要导入的数据
const allLearningContent: LearningContentRequest[] = [
  ...xingceLearningTips,
  ...yanyuLearningMethods,
  ...shuliangLearningTips,
  ...panduanLearningTips,
  ...shuliangFormulas,
  ...panduanPatterns,
  ...logicFormulas,
];

// 批量导入函数
async function batchImport(contents: LearningContentRequest[]): Promise<void> {
  console.log(`\n📦 准备导入 ${contents.length} 条学习内容...\n`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/learning-content/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 如果需要认证，添加 token
        // 'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API 请求失败: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log("✅ 导入成功:", result);
  } catch (error) {
    console.error("❌ 导入失败:", error);
    throw error;
  }
}

// 按类型统计
function printStatistics(contents: LearningContentRequest[]): void {
  const stats: Record<string, number> = {};
  const subjectStats: Record<string, number> = {};

  for (const content of contents) {
    stats[content.content_type] = (stats[content.content_type] || 0) + 1;
    subjectStats[content.subject] = (subjectStats[content.subject] || 0) + 1;
  }

  console.log("\n📊 内容统计:");
  console.log("按类型:");
  for (const [type, count] of Object.entries(stats)) {
    console.log(`  - ${type}: ${count} 条`);
  }
  console.log("按科目:");
  for (const [subject, count] of Object.entries(subjectStats)) {
    console.log(`  - ${subject}: ${count} 条`);
  }
}

// 导出 JSON 文件（用于手动导入或备份）
function exportToJson(contents: LearningContentRequest[], filename: string): void {
  const outputPath = path.join(__dirname, "generated", filename);
  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify({ contents }, null, 2));
  console.log(`\n💾 已导出到: ${outputPath}`);
}

// 主函数
async function main(): Promise<void> {
  console.log("🚀 学习内容数据迁移工具");
  console.log("========================\n");

  // 打印统计信息
  printStatistics(allLearningContent);

  // 导出 JSON 备份
  exportToJson(allLearningContent, "learning-content-backup.json");

  // 询问是否导入
  const args = process.argv.slice(2);
  if (args.includes("--import")) {
    await batchImport(allLearningContent);
  } else {
    console.log("\n💡 提示: 添加 --import 参数可直接导入到数据库");
    console.log("   例如: npx ts-node scripts/import-learning-content.ts --import\n");
  }
}

// 运行
main().catch(console.error);
