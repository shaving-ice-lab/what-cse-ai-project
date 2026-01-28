"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Brain,
  FileText,
  Target,
  Star,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Network,
  ListChecks,
  Quote,
  Zap,
  Eye,
  Copy,
  Share2,
  Heart,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import { toast } from "@what-cse/ui";
import { cn } from "@/lib/utils";
import { MindMap, MindMapNode } from "@/components/learning/MindMap";
import {
  getKnowledgeSummary,
  getKnowledgeMindmap,
  getKnowledgeAIContent,
  AIGeneratedContent,
  AIContent,
  MindmapData,
  ExampleQuestion,
} from "@/services/api/ai-content";

// 模拟知识点基础数据（实际应从API获取）
interface KnowledgePointInfo {
  id: number;
  name: string;
  subject: string;
  category: string;
  difficulty: number;
  description?: string;
  relatedPoints?: { id: number; name: string }[];
}

// 页面状态
type TabType = "summary" | "mindmap" | "examples";

export default function KnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const knowledgeId = Number(params.id);

  // 状态
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // 知识点基础信息（模拟数据，实际应从API获取）
  const [knowledgeInfo, setKnowledgeInfo] = useState<KnowledgePointInfo | null>(null);

  // AI 生成内容
  const [summaryContent, setSummaryContent] = useState<AIGeneratedContent | null>(null);
  const [mindmapContent, setMindmapContent] = useState<AIGeneratedContent | null>(null);
  const [examplesContent, setExamplesContent] = useState<AIGeneratedContent | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    summary: true,
    mindmap: true,
    examples: true,
  });

  // 加载知识点信息
  useEffect(() => {
    // 模拟加载知识点基础信息
    const mockInfo: KnowledgePointInfo = {
      id: knowledgeId,
      name: "增长率计算",
      subject: "资料分析",
      category: "资料分析 > 增长问题",
      difficulty: 3,
      description: "增长率是资料分析的核心考点之一，掌握基期值、现期值和增长率之间的关系是解题关键。",
      relatedPoints: [
        { id: 101, name: "比重计算" },
        { id: 102, name: "平均数计算" },
        { id: 103, name: "倍数计算" },
      ],
    };
    setKnowledgeInfo(mockInfo);
    setIsLoading(false);
  }, [knowledgeId]);

  // 加载 AI 总结内容
  useEffect(() => {
    const loadSummary = async () => {
      try {
        // 使用模拟数据（实际应调用 API）
        const mockSummary: AIGeneratedContent = {
          id: 1,
          content_type: "knowledge_summary",
          related_type: "knowledge_point",
          related_id: knowledgeId,
          title: "增长率计算知识点总结",
          content: {
            definition: "增长率是指某一指标在一定时期内的增长幅度与基期值的比率，反映事物发展变化的相对程度。",
            summary: "增长率计算是资料分析必考题型，需掌握基本公式、特殊技巧和估算方法。",
            key_points: [
              "增长率 = (现期值 - 基期值) / 基期值 × 100%",
              "基期值 = 现期值 / (1 + 增长率)",
              "现期值 = 基期值 × (1 + 增长率)",
              "增长量 = 现期值 - 基期值 = 基期值 × 增长率",
              "年均增长率计算：末期值 = 初期值 × (1 + r)^n",
            ],
            mnemonics: "口诀：现基增，三量关联；除一加，求基必会；乘一加，求现无忧。",
            tips: [
              "遇到百分点变化，注意是增长率之差，不是比值",
              "年均增长率估算：r ≈ (n次方根-1)，可用特殊值表",
              "负增长时，基期值比现期值大",
              "同比增长看去年同期，环比增长看上一期",
            ],
            common_types: [
              "直接计算类：给定两期数据求增长率",
              "逆向计算类：给定增长率求基期值",
              "比较类：多个增长率的比较排序",
              "综合应用类：结合比重、倍数的复合题",
            ],
            memory_methods: [
              "联想记忆：把增长率想象成'速度'，基期值是'起点'，现期值是'终点'",
              "公式变形：三个量知二求一，灵活变形",
              "特殊值法：记住常见分数对应的百分数（1/8=12.5%，1/6≈16.7%等）",
            ],
          },
          quality_score: 4.5,
          status: "approved",
          version: 1,
          generated_at: new Date().toISOString(),
        };
        setSummaryContent(mockSummary);
      } catch (error) {
        console.error("加载知识点总结失败:", error);
        toast.error("加载内容失败，请重试");
      } finally {
        setLoadingStates(prev => ({ ...prev, summary: false }));
      }
    };

    loadSummary();
  }, [knowledgeId]);

  // 加载思维导图
  useEffect(() => {
    const loadMindmap = async () => {
      try {
        // 模拟思维导图数据
        const mockMindmap: AIGeneratedContent = {
          id: 2,
          content_type: "knowledge_mindmap",
          related_type: "knowledge_point",
          related_id: knowledgeId,
          title: "增长率计算思维导图",
          content: {
            mindmap_data: {
              root: {
                id: "root",
                label: "增长率计算",
                color: "#f59e0b",
                children: [
                  {
                    id: "1",
                    label: "基本概念",
                    color: "#10b981",
                    children: [
                      { id: "1-1", label: "基期值" },
                      { id: "1-2", label: "现期值" },
                      { id: "1-3", label: "增长量" },
                      { id: "1-4", label: "增长率" },
                    ],
                  },
                  {
                    id: "2",
                    label: "核心公式",
                    color: "#3b82f6",
                    children: [
                      { id: "2-1", label: "增长率 = 增长量/基期值" },
                      { id: "2-2", label: "基期值 = 现期值/(1+r)" },
                      { id: "2-3", label: "现期值 = 基期值×(1+r)" },
                    ],
                  },
                  {
                    id: "3",
                    label: "题型分类",
                    color: "#8b5cf6",
                    children: [
                      { id: "3-1", label: "直接计算型" },
                      { id: "3-2", label: "逆向计算型" },
                      { id: "3-3", label: "比较排序型" },
                      { id: "3-4", label: "年均增长型" },
                    ],
                  },
                  {
                    id: "4",
                    label: "解题技巧",
                    color: "#ef4444",
                    children: [
                      { id: "4-1", label: "特殊值速算" },
                      { id: "4-2", label: "截位直除" },
                      { id: "4-3", label: "分数比较" },
                    ],
                  },
                ],
              },
            },
          },
          quality_score: 4.2,
          status: "approved",
          version: 1,
          generated_at: new Date().toISOString(),
        };
        setMindmapContent(mockMindmap);
      } catch (error) {
        console.error("加载思维导图失败:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, mindmap: false }));
      }
    };

    loadMindmap();
  }, [knowledgeId]);

  // 加载例题
  useEffect(() => {
    const loadExamples = async () => {
      try {
        // 模拟例题数据
        const mockExamples: AIGeneratedContent = {
          id: 3,
          content_type: "knowledge_examples",
          related_type: "knowledge_point",
          related_id: knowledgeId,
          title: "增长率计算经典例题",
          content: {
            summary: "精选3道典型例题，涵盖常见题型和解题方法",
            examples: [
              {
                question: "【例题1】2023年某市GDP为5000亿元，比上年增长8%。则2022年该市GDP约为多少亿元？",
                options: ["A. 4600亿元", "B. 4630亿元", "C. 4800亿元", "D. 5400亿元"],
                answer: "B",
                analysis: "【解析】\n这是典型的逆向计算题，已知现期值和增长率，求基期值。\n\n解题步骤：\n1. 根据公式：基期值 = 现期值 ÷ (1 + 增长率)\n2. 代入数据：基期值 = 5000 ÷ (1 + 8%) = 5000 ÷ 1.08\n3. 计算结果：≈ 4629.6 ≈ 4630亿元\n\n【技巧提示】\n÷1.08 可用截位直除法，5000÷1.08 ≈ 500÷0.108 ≈ 4630",
              },
              {
                question: "【例题2】某商品原价200元，先降价20%后又涨价20%，则现价是多少元？",
                options: ["A. 192元", "B. 200元", "C. 208元", "D. 180元"],
                answer: "A",
                analysis: "【解析】\n这是连续变化问题，注意每次变化的基数不同。\n\n解题步骤：\n1. 第一次降价后：200 × (1-20%) = 200 × 0.8 = 160元\n2. 第二次涨价后：160 × (1+20%) = 160 × 1.2 = 192元\n\n【易错警示】\n不能直接认为先降后涨会回到原价！因为两次变化的基数不同。\n实际上：(1-20%)(1+20%) = 0.8 × 1.2 = 0.96，相当于总共下降了4%。",
              },
              {
                question: "【例题3】2022年某企业营收同比增长15%，2023年同比增长20%，则两年共增长了多少？",
                options: ["A. 35%", "B. 38%", "C. 40%", "D. 32%"],
                answer: "B",
                analysis: "【解析】\n这是复合增长率问题，不能直接相加。\n\n解题步骤：\n1. 设2021年营收为1（基准）\n2. 2022年营收 = 1 × (1+15%) = 1.15\n3. 2023年营收 = 1.15 × (1+20%) = 1.15 × 1.2 = 1.38\n4. 两年总增长率 = 1.38 - 1 = 38%\n\n【公式总结】\n两年复合增长率 = (1+r₁)(1+r₂) - 1 = r₁ + r₂ + r₁×r₂\n= 15% + 20% + 15%×20% = 35% + 3% = 38%",
              },
            ],
            key_points: [
              "典型题型覆盖",
              "详细解题步骤",
              "解题模板总结",
              "易错点提醒",
            ],
            tips: [
              "先理解题意，明确已知条件和所求",
              "套用对应公式，注意单位换算",
              "验算答案，排除明显错误选项",
            ],
          },
          quality_score: 4.8,
          status: "approved",
          version: 1,
          generated_at: new Date().toISOString(),
        };
        setExamplesContent(mockExamples);
      } catch (error) {
        console.error("加载例题失败:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, examples: false }));
      }
    };

    loadExamples();
  }, [knowledgeId]);

  // 复制内容
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  }, []);

  // 切换收藏
  const handleToggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
    toast.success(isFavorited ? "已取消收藏" : "已收藏");
  }, [isFavorited]);

  // 转换思维导图数据
  const mindmapData = mindmapContent?.content?.mindmap_data?.root;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!knowledgeInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p>知识点不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-stone-600" />
              </button>
              <div>
                <p className="text-sm text-stone-500">{knowledgeInfo.category}</p>
                <h1 className="text-xl font-bold text-stone-800">{knowledgeInfo.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isFavorited ? "text-red-500 bg-red-50" : "text-stone-400 hover:bg-stone-100"
                )}
              >
                <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
              </button>
              <button className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 知识点概览卡片 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{knowledgeInfo.name}</h2>
                <p className="text-amber-100">{knowledgeInfo.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= knowledgeInfo.difficulty
                      ? "fill-amber-200 text-amber-200"
                      : "text-amber-200/40"
                  )}
                />
              ))}
            </div>
          </div>
          {knowledgeInfo.description && (
            <p className="text-amber-100 mb-4">{knowledgeInfo.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-amber-100">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>AI 智能解析</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>1.2k 次学习</span>
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex items-center gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
          {[
            { id: "summary" as TabType, label: "AI 总结", icon: Lightbulb },
            { id: "mindmap" as TabType, label: "思维导图", icon: Network },
            { id: "examples" as TabType, label: "例题精选", icon: GraduationCap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-amber-500 text-white"
                  : "text-stone-600 hover:bg-stone-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI 总结内容 */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {loadingStates.summary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : summaryContent ? (
              <>
                {/* 概念定义 */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    概念定义
                  </h3>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-stone-700 leading-relaxed">
                      {summaryContent.content.definition}
                    </p>
                  </div>
                </section>

                {/* 核心公式/要点 */}
                <section className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                      <Target className="w-5 h-5 text-blue-500" />
                      核心要点
                    </h3>
                    <button
                      onClick={() => handleCopy(summaryContent.content.key_points?.join("\n") || "")}
                      className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                  <div className="space-y-3">
                    {summaryContent.content.key_points?.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-stone-700 font-mono text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 记忆口诀 */}
                {summaryContent.content.mnemonics && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                      <Quote className="w-5 h-5 text-purple-500" />
                      记忆口诀
                    </h3>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-purple-700 font-medium text-lg text-center">
                        {summaryContent.content.mnemonics}
                      </p>
                    </div>
                  </section>
                )}

                {/* 解题技巧 */}
                {summaryContent.content.tips && summaryContent.content.tips.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                      <Zap className="w-5 h-5 text-amber-500" />
                      解题技巧
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {summaryContent.content.tips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl"
                        >
                          <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-stone-600 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 常见题型 */}
                {summaryContent.content.common_types && summaryContent.content.common_types.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                      <ListChecks className="w-5 h-5 text-emerald-500" />
                      常见题型
                    </h3>
                    <div className="space-y-2">
                      {summaryContent.content.common_types.map((type, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span className="text-stone-700">{type}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-stone-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>暂无 AI 总结内容</p>
              </div>
            )}
          </div>
        )}

        {/* 思维导图 */}
        {activeTab === "mindmap" && (
          <div className="space-y-6">
            {loadingStates.mindmap ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : mindmapData ? (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <MindMap
                  data={mindmapData as MindMapNode}
                  title={`${knowledgeInfo.name} 知识结构图`}
                  className="min-h-[500px]"
                  onNodeClick={(node) => {
                    toast.info(`点击了: ${node.label}`);
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-stone-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>暂无思维导图</p>
              </div>
            )}
          </div>
        )}

        {/* 例题精选 */}
        {activeTab === "examples" && (
          <div className="space-y-6">
            {loadingStates.examples ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : examplesContent?.content?.examples ? (
              <>
                {/* 例题概述 */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="w-6 h-6" />
                    <h3 className="text-lg font-bold">经典例题精选</h3>
                  </div>
                  <p className="text-emerald-100">{examplesContent.content.summary}</p>
                </div>

                {/* 例题列表 */}
                {examplesContent.content.examples.map((example, index) => (
                  <ExampleCard
                    key={index}
                    example={example}
                    index={index}
                    onCopy={handleCopy}
                  />
                ))}

                {/* 解题建议 */}
                {examplesContent.content.tips && examplesContent.content.tips.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      解题建议
                    </h3>
                    <ul className="space-y-2">
                      {examplesContent.content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-stone-600">
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-stone-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>暂无例题内容</p>
              </div>
            )}
          </div>
        )}

        {/* 关联知识点 */}
        {knowledgeInfo.relatedPoints && knowledgeInfo.relatedPoints.length > 0 && (
          <section className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
              <Network className="w-5 h-5 text-blue-500" />
              关联知识点
            </h3>
            <div className="flex flex-wrap gap-3">
              {knowledgeInfo.relatedPoints.map((point) => (
                <Link
                  key={point.id}
                  href={`/learn/knowledge/${point.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-blue-50 rounded-lg text-stone-600 hover:text-blue-600 transition-colors"
                >
                  {point.name}
                  <ExternalLink className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// 例题卡片组件
function ExampleCard({
  example,
  index,
  onCopy,
}: {
  example: ExampleQuestion;
  index: number;
  onCopy: (text: string) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const isCorrect = selectedOption === example.answer;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 题目 */}
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-start justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
            <FileText className="w-4 h-4" />
            例题 {index + 1}
          </span>
          <button
            onClick={() => onCopy(example.question)}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <p className="text-stone-800 leading-relaxed whitespace-pre-line">{example.question}</p>
      </div>

      {/* 选项 */}
      {example.options && (
        <div className="p-6 border-b border-stone-100 space-y-3">
          {example.options.map((option, optIndex) => {
            const optionLetter = option.charAt(0);
            const isSelected = selectedOption === optionLetter;
            const isAnswer = optionLetter === example.answer;
            const showResult = showAnswer || selectedOption;

            return (
              <button
                key={optIndex}
                onClick={() => {
                  if (!showAnswer) {
                    setSelectedOption(optionLetter);
                  }
                }}
                disabled={showAnswer}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  showResult && isAnswer
                    ? "border-emerald-500 bg-emerald-50"
                    : showResult && isSelected && !isAnswer
                    ? "border-red-500 bg-red-50"
                    : isSelected
                    ? "border-amber-500 bg-amber-50"
                    : "border-stone-200 hover:border-stone-300"
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-stone-700",
                      showResult && isAnswer && "text-emerald-700 font-medium",
                      showResult && isSelected && !isAnswer && "text-red-700"
                    )}
                  >
                    {option}
                  </span>
                  {showResult && isAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  {showResult && isSelected && !isAnswer && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 答案与解析 */}
      <div className="p-6">
        {!showAnswer && selectedOption && (
          <div
            className={cn(
              "mb-4 p-4 rounded-xl",
              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {isCorrect ? "✅ 回答正确！" : `❌ 回答错误，正确答案是 ${example.answer}`}
          </div>
        )}

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium transition-colors mb-4"
        >
          <Eye className="w-4 h-4" />
          {showAnswer ? "收起解析" : "查看解析"}
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              showAnswer && "rotate-90"
            )}
          />
        </button>

        {showAnswer && (
          <div className="p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-500">答案：{example.answer}</span>
              <button
                onClick={() => onCopy(example.analysis)}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="text-stone-700 whitespace-pre-line leading-relaxed">
              {example.analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
