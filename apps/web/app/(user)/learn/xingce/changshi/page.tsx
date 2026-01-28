"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Clock,
  Target,
  Play,
  Star,
  FileText,
  CheckCircle2,
  Lightbulb,
  TrendingUp,
  Zap,
  Video,
  BookMarked,
  ArrowRight,
  Brain,
  Scale,
  Landmark,
  Globe,
  Microscope,
  History,
  BookText,
  Newspaper,
  Coins,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 常识判断知识点结构
const knowledgeTree = [
  {
    id: "zhengzhi-changshi",
    name: "政治常识",
    icon: "🏛️",
    description: "党政理论、时政热点",
    questionCount: 4,
    weight: 20,
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
    textColor: "text-red-600",
    children: [
      {
        id: "shizheng-redian",
        name: "时政热点",
        description: "年度重要会议、政策文件",
        keyPoints: ["党的重要会议", "政府工作报告", "重大政策"],
        difficulty: 3,
        tips: "关注两会、党代会、重要讲话",
      },
      {
        id: "zhongte-lilun",
        name: "中国特色社会主义理论体系",
        description: "毛泽东思想、邓小平理论等",
        keyPoints: ["毛泽东思想", "邓小平理论", "三个代表", "科学发展观"],
        difficulty: 3,
        tips: "把握各理论的核心内容和时代背景",
      },
      {
        id: "xjp-sixiang",
        name: "习近平新时代中国特色社会主义思想",
        description: "新时代治国理政的指导思想",
        keyPoints: ["两个确立", "两个维护", "四个自信", "五位一体"],
        difficulty: 4,
        tips: "重点掌握核心要义和实践要求",
      },
      {
        id: "dang-jianshe",
        name: "党的建设",
        description: "党的组织、纪律、作风建设",
        keyPoints: ["党章", "从严治党", "反腐败"],
        difficulty: 3,
        tips: "了解党的基本路线和组织原则",
      },
    ],
  },
  {
    id: "falv-changshi",
    name: "法律常识",
    icon: "⚖️",
    description: "宪法、民法、刑法、行政法等",
    questionCount: 4,
    weight: 20,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    children: [
      {
        id: "xianfa",
        name: "宪法",
        description: "国家根本大法",
        keyPoints: ["国家机构", "公民权利义务", "宪法修正案"],
        difficulty: 3,
        tips: "重点掌握国家机构设置和公民基本权利",
      },
      {
        id: "minfadian",
        name: "民法典",
        description: "民事法律关系",
        keyPoints: ["民事主体", "物权", "合同", "婚姻家庭"],
        difficulty: 4,
        tips: "关注新民法典的重要变化",
      },
      {
        id: "xingfa",
        name: "刑法",
        description: "犯罪与刑罚",
        keyPoints: ["犯罪构成", "刑罚种类", "常见罪名"],
        difficulty: 4,
        tips: "掌握常见罪名的构成要件",
      },
      {
        id: "xingzhengfa",
        name: "行政法",
        description: "行政行为与救济",
        keyPoints: ["行政行为", "行政复议", "行政诉讼"],
        difficulty: 3,
        tips: "理解行政行为的种类和救济途径",
      },
    ],
  },
  {
    id: "jingji-changshi",
    name: "经济常识",
    icon: "💰",
    description: "宏观经济、微观经济、国际经济",
    questionCount: 3,
    weight: 15,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    children: [
      {
        id: "hongguan-jingji",
        name: "宏观经济",
        description: "国民经济运行",
        keyPoints: ["GDP", "通货膨胀", "财政政策", "货币政策"],
        difficulty: 3,
        tips: "理解宏观调控的手段和目标",
      },
      {
        id: "weiguan-jingji",
        name: "微观经济",
        description: "市场经济基础",
        keyPoints: ["供求关系", "市场类型", "价格机制"],
        difficulty: 3,
        tips: "掌握供求曲线和市场均衡",
      },
      {
        id: "guoji-jingji",
        name: "国际经济",
        description: "国际贸易与金融",
        keyPoints: ["国际贸易", "汇率", "国际组织"],
        difficulty: 3,
        tips: "了解WTO、IMF等国际组织",
      },
    ],
  },
  {
    id: "lishi-changshi",
    name: "历史常识",
    icon: "📜",
    description: "中国史、世界史、党史",
    questionCount: 3,
    weight: 15,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
    children: [
      {
        id: "zhongguo-gudaishi",
        name: "中国古代史",
        description: "朝代更替、文化成就",
        keyPoints: ["朝代顺序", "重要事件", "文化成就"],
        difficulty: 3,
        tips: "掌握朝代顺序和标志性事件",
      },
      {
        id: "zhongguo-jinxiandaishi",
        name: "中国近现代史",
        description: "鸦片战争至新中国成立",
        keyPoints: ["列强侵华", "救亡运动", "新民主主义革命"],
        difficulty: 3,
        tips: "理解历史发展的脉络和规律",
      },
      {
        id: "shijie-shi",
        name: "世界史",
        description: "世界历史重要事件",
        keyPoints: ["文艺复兴", "工业革命", "两次世界大战"],
        difficulty: 3,
        tips: "了解世界历史的重要转折点",
      },
      {
        id: "dang-shi",
        name: "党史",
        description: "中国共产党历史",
        keyPoints: ["重要会议", "重要人物", "重要事件"],
        difficulty: 4,
        tips: "熟记党的重大历史事件和会议",
      },
    ],
  },
  {
    id: "dili-changshi",
    name: "地理常识",
    icon: "🌍",
    description: "自然地理、人文地理、中国地理",
    questionCount: 3,
    weight: 15,
    color: "from-cyan-500 to-sky-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-600",
    children: [
      {
        id: "ziran-dili",
        name: "自然地理",
        description: "地球运动、气候、地形",
        keyPoints: ["地球运动", "气候类型", "地形地貌"],
        difficulty: 3,
        tips: "理解地理现象的成因",
      },
      {
        id: "renwen-dili",
        name: "人文地理",
        description: "人口、城市、经济地理",
        keyPoints: ["人口分布", "城市发展", "农业工业"],
        difficulty: 2,
        tips: "关注人地关系",
      },
      {
        id: "zhongguo-dili",
        name: "中国地理",
        description: "中国地理概况",
        keyPoints: ["行政区划", "重要山川", "资源分布"],
        difficulty: 3,
        tips: "熟记省会城市和地理特征",
      },
    ],
  },
  {
    id: "keji-changshi",
    name: "科技常识",
    icon: "🔬",
    description: "物理、化学、生物、信息技术",
    questionCount: 3,
    weight: 15,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
    children: [
      {
        id: "wuli",
        name: "物理",
        description: "物理学基础",
        keyPoints: ["力学", "光学", "电学", "热学"],
        difficulty: 3,
        tips: "理解基本物理现象和原理",
      },
      {
        id: "huaxue",
        name: "化学",
        description: "化学基础知识",
        keyPoints: ["元素周期表", "化学反应", "生活化学"],
        difficulty: 3,
        tips: "关注生活中的化学现象",
      },
      {
        id: "shengwu",
        name: "生物",
        description: "生命科学基础",
        keyPoints: ["细胞", "遗传", "生态", "人体健康"],
        difficulty: 2,
        tips: "了解生命现象的本质",
      },
      {
        id: "xinxi-jishu",
        name: "信息技术",
        description: "计算机与互联网",
        keyPoints: ["计算机", "互联网", "人工智能"],
        difficulty: 3,
        tips: "关注前沿技术发展",
      },
      {
        id: "qianyan-keji",
        name: "前沿科技",
        description: "最新科技成就",
        keyPoints: ["航天", "新能源", "生物技术"],
        difficulty: 3,
        tips: "关注国家重大科技突破",
      },
    ],
  },
  {
    id: "wenxue-changshi",
    name: "文学常识",
    icon: "📖",
    description: "古代文学、现代文学、文化常识",
    questionCount: 0,
    weight: 0,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    children: [
      {
        id: "gudai-wenxue",
        name: "古代文学",
        description: "诗词曲赋、古典名著",
        keyPoints: ["诗词曲赋", "四大名著", "诸子百家"],
        difficulty: 2,
        tips: "熟记名家名作",
      },
      {
        id: "xiandai-wenxue",
        name: "现代文学",
        description: "近现代文学作品",
        keyPoints: ["鲁迅", "茅盾", "巴金"],
        difficulty: 2,
        tips: "了解代表作家和作品",
      },
      {
        id: "wenhua-changshi",
        name: "文化常识",
        description: "传统文化知识",
        keyPoints: ["节日习俗", "礼仪文化", "传统艺术"],
        difficulty: 2,
        tips: "关注中华传统文化",
      },
    ],
  },
];

// 高频考点
const hotTopics = [
  { title: "时政热点", desc: "两会、党代会、重要讲话", icon: Newspaper, color: "bg-red-50 text-red-600" },
  { title: "民法典", desc: "婚姻家庭、继承、合同", icon: Scale, color: "bg-blue-50 text-blue-600" },
  { title: "航天科技", desc: "空间站、探月、火星探测", icon: Microscope, color: "bg-purple-50 text-purple-600" },
  { title: "党史学习", desc: "重要会议、历史人物", icon: History, color: "bg-amber-50 text-amber-600" },
  { title: "生态文明", desc: "双碳目标、环保法规", icon: Globe, color: "bg-emerald-50 text-emerald-600" },
  { title: "经济政策", desc: "乡村振兴、共同富裕", icon: Coins, color: "bg-teal-50 text-teal-600" },
];

// 学习技巧
const learningTips = [
  {
    title: "日积月累",
    description: "常识靠积累，每天学习一点，持之以恒",
    icon: BookMarked,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "关注时政",
    description: "每日浏览新闻，关注重大会议和政策",
    icon: Newspaper,
    color: "text-red-600 bg-red-50",
  },
  {
    title: "联想记忆",
    description: "将知识点串联成体系，形成知识网络",
    icon: Brain,
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "真题练习",
    description: "通过真题了解考点分布和命题规律",
    icon: Target,
    color: "text-amber-600 bg-amber-50",
  },
];

// 知识点卡片组件
function KnowledgeCard({
  knowledge,
}: {
  knowledge: typeof knowledgeTree[0];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = knowledge.children && knowledge.children.length > 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200/50 overflow-hidden">
      {/* 顶部渐变装饰 */}
      <div className={`h-1.5 bg-gradient-to-r ${knowledge.color}`} />
      
      {/* 主知识点 */}
      <div
        className={`p-4 ${hasChildren ? "cursor-pointer hover:bg-stone-50" : ""} transition-colors`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          {hasChildren && (
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-stone-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-stone-500" />
              )}
            </div>
          )}
          <div className="text-2xl">{knowledge.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-800">{knowledge.name}</h3>
              {knowledge.questionCount > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${knowledge.bgColor} ${knowledge.textColor}`}>
                  {knowledge.questionCount}题
                </span>
              )}
              {knowledge.weight > 0 && (
                <span className="px-2 py-0.5 text-xs bg-amber-50 text-amber-600 rounded-full">
                  占比{knowledge.weight}%
                </span>
              )}
            </div>
            <p className="text-sm text-stone-500 mt-1">{knowledge.description}</p>
          </div>
          <Link
            href={`/learn/xingce/changshi/${knowledge.id}`}
            className={`px-4 py-2 bg-gradient-to-r ${knowledge.color} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
            onClick={(e) => e.stopPropagation()}
          >
            开始学习
          </Link>
        </div>
      </div>

      {/* 子知识点 */}
      {hasChildren && expanded && (
        <div className="border-t border-stone-100">
          {knowledge.children!.map((child, idx) => (
            <div
              key={child.id}
              className={`p-4 pl-16 ${
                idx !== knowledge.children!.length - 1 ? "border-b border-stone-100" : ""
              } hover:bg-stone-50 transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-stone-700">{child.name}</h4>
                    {/* 难度 */}
                    <div className="flex gap-0.5 ml-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-1.5 h-1.5 rounded-full ${
                            level <= child.difficulty
                              ? "bg-amber-400"
                              : "bg-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 mb-2">{child.description}</p>
                  {/* 关键考点 */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {child.keyPoints.map((point, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-xs rounded ${knowledge.bgColor} ${knowledge.textColor}`}
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                  {/* 技巧提示 */}
                  <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-amber-700">{child.tips}</span>
                  </div>
                </div>
                <Link
                  href={`/learn/xingce/changshi/${knowledge.id}/${child.id}`}
                  className={`px-3 py-1.5 border ${knowledge.textColor} text-sm font-medium rounded-lg hover:opacity-80 transition-opacity flex-shrink-0`}
                  style={{ borderColor: knowledge.textColor.replace('text-', '') }}
                >
                  学习
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChangshiLearningPage() {
  const { isAuthenticated } = useAuthStore();

  // 计算总题数
  const totalQuestions = knowledgeTree.reduce((sum, k) => sum + k.questionCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-2 mb-4">
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href="/learn/xingce"
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              行测
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-sm">常识判断</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">📚</span>
                <div>
                  <h1 className="text-3xl font-bold">常识判断</h1>
                  <p className="text-white/80">考查综合知识与日常积累，涉及政治、法律、经济、历史等</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <FileText className="w-4 h-4" />
                  <span>{totalQuestions}题</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>~10分钟</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Star className="w-4 h-4" />
                  <span>占比15%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <Target className="w-4 h-4" />
                  <span>难度 ★★★☆☆</span>
                </div>
              </div>
            </div>

            {/* 进度卡片 */}
            {isAuthenticated && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 lg:w-64">
                <h3 className="text-sm text-white/80 mb-3">学习进度</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>知识点掌握</span>
                      <span>0/25</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-white rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>做题正确率</span>
                      <span>0%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full">
                      <div className="h-full w-0 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 备考提示 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">备考建议</h3>
              <p className="text-sm text-amber-700">
                常识判断考查范围广、知识点多，建议：1) 每天花15分钟浏览新闻和时政；2) 重点关注法律、政治、科技等高频考点；3) 利用碎片时间积累，考前做真题熟悉考点分布。
              </p>
            </div>
          </div>
        </div>

        {/* 学习技巧 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            学习技巧
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {learningTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-stone-200/50 p-4 hover:shadow-card transition-shadow"
              >
                <div className={`w-10 h-10 rounded-lg ${tip.color} flex items-center justify-center mb-3`}>
                  <tip.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-stone-800 mb-1">{tip.title}</h3>
                <p className="text-sm text-stone-500">{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 高频考点 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            高频考点
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {hotTopics.map((topic, idx) => (
              <div
                key={idx}
                className={`rounded-xl p-4 ${topic.color} hover:shadow-card transition-shadow cursor-pointer`}
              >
                <topic.icon className="w-6 h-6 mb-2" />
                <h3 className="font-medium text-sm mb-1">{topic.title}</h3>
                <p className="text-xs opacity-80">{topic.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 知识点导航 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-rose-500" />
            知识点导航
          </h2>
          <div className="space-y-4">
            {knowledgeTree.map((knowledge) => (
              <KnowledgeCard key={knowledge.id} knowledge={knowledge} />
            ))}
          </div>
        </section>

        {/* 学习资源 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            学习资源
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* 视频讲解 */}
            <Link
              href="/learn/xingce/changshi/videos"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Video className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-purple-600 transition-colors">
                    视频讲解
                  </h3>
                  <p className="text-sm text-stone-500">分类知识点精讲</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">共 30 个视频</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

            {/* 时政热点 */}
            <Link
              href="/learn/xingce/changshi/news"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-red-600 transition-colors">
                    时政热点
                  </h3>
                  <p className="text-sm text-stone-500">每日更新</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">每日10条时政</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-red-500 transition-colors" />
              </div>
            </Link>

            {/* 知识卡片 */}
            <Link
              href="/learn/xingce/changshi/cards"
              className="group bg-white rounded-xl border border-stone-200/50 p-5 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <BookText className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                    知识卡片
                  </h3>
                  <p className="text-sm text-stone-500">碎片化学习</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">500+ 知识点卡片</span>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* 专项练习入口 */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">开始常识判断专项练习</h3>
                <p className="text-white/80">
                  政治、法律、经济、历史、地理、科技、文学七大模块，全面覆盖
                </p>
              </div>
              <Link
                href="/learn/practice?subject=xingce&module=changshi"
                className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                开始练习
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
