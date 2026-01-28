"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Brain,
  FileText,
  Sparkles,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Target,
  BarChart3,
  Clock,
  Play,
  Filter,
  RefreshCw,
  Loader2,
  TrendingUp,
  CheckCircle,
  Circle,
  FolderTree,
} from "lucide-react";
import {
  practiceApi,
  getQuestionTypeName,
  getDifficultyLabel,
  getDifficultyColor,
  CategoryProgressStat,
} from "@/services/api/practice";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@what-cse/ui";

// 科目配置
const subjectConfig: Record<string, {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
  gradient: string;
  description: string;
  categories: {
    key: string;
    name: string;
    description: string;
    questionCount?: number;
    children?: { key: string; name: string; questionCount?: number }[];
  }[];
}> = {
  xingce: {
    name: "行测",
    icon: Brain,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    gradient: "from-blue-500 to-indigo-600",
    description: "行政职业能力测验，考查言语理解、判断推理、数量关系等综合能力",
    categories: [
      {
        key: "yanyu",
        name: "言语理解与表达",
        description: "阅读理解、逻辑填空、语句表达",
        questionCount: 3500,
        children: [
          { key: "yuepian", name: "片段阅读", questionCount: 1200 },
          { key: "luojitiankong", name: "逻辑填空", questionCount: 1500 },
          { key: "yujuxuli", name: "语句排序", questionCount: 400 },
          { key: "yujutiankong", name: "语句填空", questionCount: 400 },
        ],
      },
      {
        key: "panduan",
        name: "判断推理",
        description: "图形推理、定义判断、类比推理、逻辑判断",
        questionCount: 4000,
        children: [
          { key: "tuxing", name: "图形推理", questionCount: 800 },
          { key: "dingyi", name: "定义判断", questionCount: 800 },
          { key: "leibi", name: "类比推理", questionCount: 800 },
          { key: "luoji", name: "逻辑判断", questionCount: 1600 },
        ],
      },
      {
        key: "shuliang",
        name: "数量关系",
        description: "数字推理、数学运算",
        questionCount: 2500,
        children: [
          { key: "shuzituili", name: "数字推理", questionCount: 500 },
          { key: "shuxueyunsuan", name: "数学运算", questionCount: 2000 },
        ],
      },
      {
        key: "ziliao",
        name: "资料分析",
        description: "文字材料、表格材料、图形材料、综合材料",
        questionCount: 3000,
        children: [
          { key: "wenzi", name: "文字材料", questionCount: 800 },
          { key: "biaoge", name: "表格材料", questionCount: 800 },
          { key: "tuxingcl", name: "图形材料", questionCount: 600 },
          { key: "zonghezl", name: "综合材料", questionCount: 800 },
        ],
      },
      {
        key: "changshi",
        name: "常识判断",
        description: "政治、法律、经济、科技、历史、地理等",
        questionCount: 2000,
        children: [
          { key: "zhengzhi", name: "政治", questionCount: 400 },
          { key: "falv", name: "法律", questionCount: 400 },
          { key: "jingji", name: "经济", questionCount: 300 },
          { key: "keji", name: "科技", questionCount: 300 },
          { key: "lishi", name: "历史", questionCount: 300 },
          { key: "dili", name: "地理", questionCount: 300 },
        ],
      },
    ],
  },
  shenlun: {
    name: "申论",
    icon: FileText,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    gradient: "from-emerald-500 to-teal-600",
    description: "申论写作，考查阅读理解、综合分析、提出对策、贯彻执行、文章写作等能力",
    categories: [
      {
        key: "guina",
        name: "归纳概括",
        description: "概括主要内容、主要问题、原因、措施等",
        questionCount: 800,
      },
      {
        key: "duice",
        name: "提出对策",
        description: "针对问题提出解决对策",
        questionCount: 500,
      },
      {
        key: "fenxi",
        name: "综合分析",
        description: "词句理解、观点分析、对比分析等",
        questionCount: 600,
      },
      {
        key: "guanche",
        name: "贯彻执行",
        description: "讲话稿、倡议书、汇报材料等公文写作",
        questionCount: 700,
      },
      {
        key: "xiezuo",
        name: "申发论述",
        description: "大作文写作",
        questionCount: 400,
      },
    ],
  },
  mianshi: {
    name: "面试",
    icon: Sparkles,
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    gradient: "from-violet-500 to-purple-600",
    description: "结构化面试、无领导小组讨论等，考查综合分析、组织协调、人际关系等能力",
    categories: [
      {
        key: "zonghefenxi",
        name: "综合分析",
        description: "社会现象、名言警句、政策理解等",
        questionCount: 500,
      },
      {
        key: "jihua",
        name: "计划组织",
        description: "活动策划、调研、宣传等",
        questionCount: 400,
      },
      {
        key: "renji",
        name: "人际关系",
        description: "处理与领导、同事、群众的关系",
        questionCount: 400,
      },
      {
        key: "yingji",
        name: "应急应变",
        description: "突发情况处理",
        questionCount: 300,
      },
      {
        key: "ziwo",
        name: "自我认知",
        description: "自我介绍、岗位匹配等",
        questionCount: 200,
      },
      {
        key: "wulingdao",
        name: "无领导小组",
        description: "群体讨论题目",
        questionCount: 200,
      },
    ],
  },
  gongji: {
    name: "公基",
    icon: BookOpen,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    gradient: "from-amber-500 to-orange-600",
    description: "公共基础知识，涵盖政治、法律、经济、公文、管理等多领域知识",
    categories: [
      {
        key: "zhengzhi",
        name: "政治",
        description: "马克思主义、毛泽东思想、习近平新时代中国特色社会主义思想、时事政治等",
        questionCount: 2000,
      },
      {
        key: "falv",
        name: "法律",
        description: "宪法、民法、刑法、行政法、经济法等",
        questionCount: 2500,
      },
      {
        key: "jingji",
        name: "经济",
        description: "宏观经济、微观经济、国际经济等",
        questionCount: 1000,
      },
      {
        key: "gongwen",
        name: "公文",
        description: "公文写作、公文处理规范等",
        questionCount: 800,
      },
      {
        key: "guanli",
        name: "管理",
        description: "管理学基础、公共管理等",
        questionCount: 600,
      },
      {
        key: "keji",
        name: "科技人文",
        description: "科技常识、人文历史、地理等",
        questionCount: 1100,
      },
    ],
  },
};

// 难度选项
const difficultyOptions = [
  { value: "all", label: "全部难度" },
  { value: "1", label: "入门" },
  { value: "2", label: "简单" },
  { value: "3", label: "中等" },
  { value: "4", label: "困难" },
  { value: "5", label: "极难" },
];

// 来源选项
const sourceOptions = [
  { value: "all", label: "全部来源" },
  { value: "real_exam", label: "真题" },
  { value: "mock", label: "模拟题" },
  { value: "original", label: "原创题" },
];

// 年份选项
const yearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [{ value: "all", label: "全部年份" }];
  for (let i = currentYear; i >= currentYear - 10; i--) {
    years.push({ value: String(i), label: `${i}年` });
  }
  return years;
};

// 做题模式选项
const modeOptions = [
  { value: "practice", label: "练习模式", desc: "边做边看答案" },
  { value: "timed", label: "计时模式", desc: "限时作答" },
];

// 题量选项
const countOptions = [
  { value: "10", label: "10道" },
  { value: "20", label: "20道" },
  { value: "30", label: "30道" },
  { value: "50", label: "50道" },
  { value: "100", label: "100道" },
];

// 地区筛选选项
const regionOptions = [
  { value: "all", label: "全部地区" },
  { value: "national", label: "国家级" },
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangdong", label: "广东" },
  { value: "jiangsu", label: "江苏" },
  { value: "zhejiang", label: "浙江" },
  { value: "shandong", label: "山东" },
  { value: "sichuan", label: "四川" },
  { value: "hubei", label: "湖北" },
  { value: "hunan", label: "湖南" },
  { value: "henan", label: "河南" },
  { value: "hebei", label: "河北" },
  { value: "other", label: "其他地区" },
];

// 进度条组件
function ProgressBar({ done, total, correctRate }: { done: number; total: number; correctRate?: number }) {
  const percentage = total > 0 ? (done / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-stone-500 whitespace-nowrap">
        {done}/{total}
        {correctRate !== undefined && correctRate > 0 && (
          <span className="text-emerald-600 ml-1">({correctRate.toFixed(0)}%)</span>
        )}
      </span>
    </div>
  );
}

// 知识点卡片组件
function CategoryCard({
  category,
  subject,
  isExpanded,
  onToggle,
  progress,
  childProgress,
}: {
  category: typeof subjectConfig.xingce.categories[0];
  subject: string;
  isExpanded: boolean;
  onToggle: () => void;
  progress?: { done: number; total: number; correctRate?: number };
  childProgress?: Map<string, { done: number; total: number; correctRate?: number }>;
}) {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 shadow-card overflow-hidden">
      <div
        className={`flex items-center gap-4 p-4 ${hasChildren ? "cursor-pointer hover:bg-stone-50" : ""}`}
        onClick={hasChildren ? onToggle : undefined}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-800">{category.name}</h3>
            {category.questionCount && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-lg">
                {category.questionCount.toLocaleString()}题
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1">{category.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 进度统计 */}
          {progress && progress.total > 0 && (
            <ProgressBar done={progress.done} total={progress.total} correctRate={progress.correctRate} />
          )}
          
          {!hasChildren && (
            <Link
              href={`/practice/do?subject=${subject}&category=${category.key}`}
              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-4 h-4" />
              开始练习
            </Link>
          )}
          {hasChildren && (
            <ChevronDown
              className={`w-5 h-5 text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </div>

      {/* 子分类 */}
      {hasChildren && isExpanded && (
        <div className="border-t border-stone-100 bg-stone-50/50">
          {category.children!.map((child) => {
            const childProg = childProgress?.get(child.key);
            return (
              <div
                key={child.key}
                className="flex items-center justify-between px-6 py-3 border-b border-stone-100 last:border-b-0 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Circle className="w-2 h-2 text-stone-400" />
                  <span className="text-stone-700">{child.name}</span>
                  {child.questionCount && (
                    <span className="text-xs text-stone-400">
                      {child.questionCount.toLocaleString()}题
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* 子分类进度 */}
                  {childProg && childProg.total > 0 && (
                    <ProgressBar done={childProg.done} total={childProg.total} correctRate={childProg.correctRate} />
                  )}
                  <Link
                    href={`/practice/do?subject=${subject}&category=${child.key}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    练习
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SubjectPracticePage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  const { isAuthenticated } = useAuthStore();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [sourceYear, setSourceYear] = useState("all");
  const [sourceRegion, setSourceRegion] = useState("all");
  const [practiceMode, setPracticeMode] = useState("practice");
  const [questionCount, setQuestionCount] = useState("20");
  const [loading, setLoading] = useState(false);
  
  // 练习进度统计
  const [categoryProgress, setCategoryProgress] = useState<Map<string, { done: number; total: number; correctRate?: number }>>(new Map());
  const [totalDone, setTotalDone] = useState(0);
  const [totalCorrectRate, setTotalCorrectRate] = useState(0);

  const config = subjectConfig[subject];
  
  // 获取进度统计
  useEffect(() => {
    const fetchProgress = async () => {
      if (!isAuthenticated) return;
      
      try {
        const res = await practiceApi.getCategoryProgress(subject);
        if (res.data?.progress) {
          const progressMap = new Map<string, { done: number; total: number; correctRate?: number }>();
          let totalDoneCount = 0;
          let totalQuestionCount = 0;
          let totalCorrectCount = 0;
          
          res.data.progress.forEach((stat: CategoryProgressStat) => {
            // Map category_id to category_key based on config
            // For now, we'll use category_name to match
            const categoryName = stat.category_name;
            
            // Find matching category by name
            config?.categories.forEach(cat => {
              if (cat.name === categoryName || cat.key === categoryName.toLowerCase()) {
                progressMap.set(cat.key, {
                  done: stat.done_count,
                  total: stat.total_questions,
                  correctRate: stat.correct_rate,
                });
              }
              // Check children
              cat.children?.forEach(child => {
                if (child.name === categoryName || child.key === categoryName.toLowerCase()) {
                  progressMap.set(child.key, {
                    done: stat.done_count,
                    total: stat.total_questions,
                    correctRate: stat.correct_rate,
                  });
                }
              });
            });
            
            totalDoneCount += stat.done_count;
            totalQuestionCount += stat.total_questions;
            totalCorrectCount += stat.correct_count;
          });
          
          setCategoryProgress(progressMap);
          setTotalDone(totalDoneCount);
          if (totalDoneCount > 0) {
            setTotalCorrectRate(totalCorrectCount / totalDoneCount * 100);
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    };
    
    fetchProgress();
  }, [isAuthenticated, subject, config]);

  const toggleCategory = (key: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCategories(newExpanded);
  };

  // 全部展开/收起
  const expandAll = () => {
    const allKeys = config?.categories.map((c) => c.key) || [];
    setExpandedCategories(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // 计算总题数
  const totalQuestions = config?.categories.reduce(
    (sum, cat) => sum + (cat.questionCount || 0),
    0
  ) || 0;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Target className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">科目不存在</h3>
          <p className="text-stone-500 mb-4">请返回题库首页</p>
          <Link
            href="/practice"
            className="px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            返回题库
          </Link>
        </div>
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 顶部信息 */}
        <div className="bg-gradient-to-r ${config.gradient} rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{config.name}题库</h1>
                <p className="text-white/80 text-sm mt-1">{config.description}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalQuestions.toLocaleString()}+</div>
                <div className="text-xs text-white/70">总题数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{config.categories.length}</div>
                <div className="text-xs text-white/70">知识点</div>
              </div>
              {isAuthenticated && totalDone > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalDone}</div>
                    <div className="text-xs text-white/70">已练习</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalCorrectRate.toFixed(0)}%</div>
                    <div className="text-xs text-white/70">正确率</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 快速练习入口 */}
        <div className="bg-white rounded-xl border border-stone-200/50 shadow-card p-5 mb-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            快速练习
          </h2>
          
          {/* 筛选选项 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div>
              <label className="block text-xs text-stone-500 mb-1">难度</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">来源</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">年份</label>
              <select
                value={sourceYear}
                onChange={(e) => setSourceYear(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {yearOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">地区</label>
              <select
                value={sourceRegion}
                onChange={(e) => setSourceRegion(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {regionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">题量</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {countOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 mb-1">模式</label>
              <select
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-500"
              >
                {modeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 模式说明 */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone-500">
              {practiceMode === "practice" ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  练习模式：答完立即显示解析
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  计时模式：限时{questionCount === "10" ? "15" : questionCount === "20" ? "30" : questionCount === "30" ? "45" : questionCount === "50" ? "75" : "150"}分钟完成
                </span>
              )}
            </div>
            <Link
              href={`/practice/do?subject=${subject}&count=${questionCount}&mode=${practiceMode}${difficulty !== "all" ? `&difficulty=${difficulty}` : ""}${sourceType !== "all" ? `&source=${sourceType}` : ""}${sourceYear !== "all" ? `&year=${sourceYear}` : ""}${sourceRegion !== "all" ? `&region=${sourceRegion}` : ""}`}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors shadow-amber-md"
            >
              <Play className="w-5 h-5" />
              开始练习
            </Link>
          </div>
        </div>

        {/* 知识点分类 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-500" />
            知识点分类
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              全部展开
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={collapseAll}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              全部收起
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {config.categories.map((category) => {
            const progress = categoryProgress.get(category.key);
            const childProgressMap = new Map<string, { done: number; total: number; correctRate?: number }>();
            category.children?.forEach(child => {
              const childProg = categoryProgress.get(child.key);
              if (childProg) {
                childProgressMap.set(child.key, childProg);
              }
            });
            
            return (
              <CategoryCard
                key={category.key}
                category={category}
                subject={subject}
                isExpanded={expandedCategories.has(category.key)}
                onToggle={() => toggleCategory(category.key)}
                progress={progress}
                childProgress={childProgressMap}
              />
            );
          })}
        </div>

        {/* 学习建议 */}
        <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200/50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-medium text-stone-800 mb-1">{config.name}备考建议</h4>
              <ul className="text-sm text-stone-600 space-y-1">
                {subject === "xingce" && (
                  <>
                    <li>• 言语理解重在积累词汇和培养语感，每天坚持阅读</li>
                    <li>• 数量关系掌握基本公式和常见题型的解题技巧</li>
                    <li>• 判断推理多做图形推理和逻辑判断，培养推理能力</li>
                  </>
                )}
                {subject === "shenlun" && (
                  <>
                    <li>• 注重材料阅读能力的培养，学会快速提取要点</li>
                    <li>• 多练习归纳概括题，这是申论的基础</li>
                    <li>• 大作文要积累热点素材和规范表达</li>
                  </>
                )}
                {subject === "mianshi" && (
                  <>
                    <li>• 综合分析题要建立答题框架，做到条理清晰</li>
                    <li>• 多进行模拟面试练习，克服紧张情绪</li>
                    <li>• 关注时政热点，积累答题素材</li>
                  </>
                )}
                {subject === "gongji" && (
                  <>
                    <li>• 法律和政治是重点，需要系统学习</li>
                    <li>• 公文写作要掌握规范格式</li>
                    <li>• 科技人文内容广泛，注重日常积累</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
