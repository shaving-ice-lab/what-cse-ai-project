"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  FileText,
  Shirt,
  User,
  MessageSquare,
  Heart,
  Smile,
  Eye,
  Hand,
  Volume2,
  Brain,
  Shield,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";

// 着装规范
const dressCode = {
  male: {
    title: "男士着装",
    icon: "👔",
    items: [
      { category: "西装", tips: ["深色为主（黑、深蓝、深灰）", "合身剪裁", "扣子要系好", "无明显褶皱"] },
      { category: "衬衫", tips: ["白色或浅色", "领口袖口整洁", "塞进裤子里", "袖口露出1-2cm"] },
      { category: "领带", tips: ["颜色与西装搭配", "图案简洁", "长度到皮带扣", "结打端正"] },
      { category: "裤子", tips: ["深色西裤", "裤长适中", "熨烫平整", "无明显折痕"] },
      { category: "皮鞋", tips: ["黑色为主", "擦拭干净", "鞋跟不宜太高", "袜子深色"] },
    ],
    avoid: ["花哨的领带", "运动鞋", "牛仔裤", "浅色袜子", "过多配饰"],
  },
  female: {
    title: "女士着装",
    icon: "👗",
    items: [
      { category: "套装", tips: ["深色或中性色", "款式简洁大方", "长度过膝", "合身得体"] },
      { category: "衬衫", tips: ["白色或浅色", "领口不宜过低", "袖口整洁", "简洁款式"] },
      { category: "裙子", tips: ["及膝或过膝", "不宜太紧", "坐下不走光", "颜色素雅"] },
      { category: "鞋子", tips: ["黑色中低跟皮鞋", "高度3-5cm", "款式简洁", "穿肉色丝袜"] },
      { category: "妆容", tips: ["淡妆为主", "不宜浓艳", "发型整洁", "指甲干净"] },
    ],
    avoid: ["超短裙", "高跟过高", "浓妆艳抹", "过多首饰", "香水过浓"],
  },
};

// 仪态举止
const etiquette = [
  {
    id: "posture",
    name: "站姿坐姿",
    icon: User,
    color: "bg-blue-100",
    textColor: "text-blue-600",
    items: [
      { title: "站姿", tips: ["抬头挺胸", "双脚与肩同宽", "双手自然下垂或轻握", "不要抖腿晃动"] },
      { title: "坐姿", tips: ["坐椅子三分之二", "背部挺直", "双脚平放", "双手放腿上或桌上"] },
      { title: "走姿", tips: ["步伐稳健", "目视前方", "不要低头", "速度适中"] },
    ],
  },
  {
    id: "eye-contact",
    name: "眼神交流",
    icon: Eye,
    color: "bg-emerald-100",
    textColor: "text-emerald-600",
    items: [
      { title: "与考官交流", tips: ["自然对视", "不要躲闪", "适时移开", "眼神真诚"] },
      { title: "注意事项", tips: ["不要直盯", "不要四处看", "面带微笑", "关注主考官"] },
    ],
  },
  {
    id: "gestures",
    name: "手势运用",
    icon: Hand,
    color: "bg-amber-100",
    textColor: "text-amber-600",
    items: [
      { title: "适当手势", tips: ["配合表达", "幅度适中", "自然流畅", "不要过多"] },
      { title: "避免动作", tips: ["不要摸头发", "不要抖腿", "不要玩笔", "不要交叉抱臂"] },
    ],
  },
];

// 语言表达
const speaking = [
  {
    title: "语速语调",
    icon: Volume2,
    tips: [
      "语速适中，不要太快或太慢",
      "声音洪亮，确保考官能听清",
      "抑扬顿挫，避免平铺直叙",
      "重点内容可适当放慢强调",
    ],
  },
  {
    title: "逻辑清晰",
    icon: Brain,
    tips: [
      "观点先行，先说结论",
      "分点论述，一二三四",
      "前后呼应，首尾连贯",
      "过渡自然，层次分明",
    ],
  },
  {
    title: "措辞得当",
    icon: MessageSquare,
    tips: [
      "用词准确，不说错话",
      "语言规范，少用口语",
      "简洁明了，不要啰嗦",
      "积极正面，展现阳光",
    ],
  },
];

// 心理调适
const psychology = [
  {
    phase: "考前准备",
    icon: Clock,
    tips: [
      "提前熟悉考场路线",
      "准备好相关材料",
      "保证充足睡眠",
      "适当运动放松",
      "积极自我暗示",
    ],
  },
  {
    phase: "紧张缓解",
    icon: Heart,
    tips: [
      "深呼吸调整心态",
      "转移注意力",
      "积极自我暗示",
      "想象成功场景",
      "适当喝水",
    ],
  },
  {
    phase: "自信培养",
    icon: Shield,
    tips: [
      "充分准备，胸有成竹",
      "相信自己的能力",
      "把面试当作交流",
      "接受不完美",
      "关注过程而非结果",
    ],
  },
];

// 面试流程
const interviewProcess = [
  { step: "候考", desc: "按时到达，安静等候" },
  { step: "入场", desc: "敲门进入，礼貌问好" },
  { step: "就座", desc: "等待示意，端正坐好" },
  { step: "答题", desc: "认真倾听，从容作答" },
  { step: "退场", desc: "起身致谢，礼貌离开" },
];

export default function LiyiPage() {
  const [expandedSection, setExpandedSection] = useState<string>("male");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative container mx-auto px-4 py-10 max-w-7xl">
          <Link
            href="/learn/mianshi"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回面试学习
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">面试礼仪与技巧</h1>
              <p className="text-white/80 mt-1">打造专业、自信的面试形象</p>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            面试礼仪是面试成功的基础。良好的着装、得体的举止、流利的表达，
            都能给考官留下良好的第一印象，为面试加分。
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Shirt className="w-5 h-5" />
              <span>着装规范</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <User className="w-5 h-5" />
              <span>仪态举止</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <MessageSquare className="w-5 h-5" />
              <span>语言表达</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Heart className="w-5 h-5" />
              <span>心理调适</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Interview Process */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">面试流程</h2>
              <p className="text-sm text-stone-500">了解面试的基本流程</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
            {interviewProcess.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-semibold text-stone-800">{item.step}</p>
                    <p className="text-xs text-stone-500">{item.desc}</p>
                  </div>
                </div>
                {idx < interviewProcess.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-stone-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Dress Code */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Shirt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">着装规范</h2>
              <p className="text-sm text-stone-500">穿出专业、得体的形象</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Male Dress Code */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                <span className="text-3xl">{dressCode.male.icon}</span>
                <h3 className="text-lg font-bold text-stone-800">{dressCode.male.title}</h3>
              </div>
              <div className="p-6 space-y-4">
                {dressCode.male.items.map((item, idx) => (
                  <div key={idx}>
                    <h4 className="font-medium text-stone-700 mb-2">{item.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tips.map((tip, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-red-500 mb-2">❌ 避免</p>
                  <div className="flex flex-wrap gap-2">
                    {dressCode.male.avoid.map((item, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Female Dress Code */}
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
              <div className="p-6 border-b border-stone-100 flex items-center gap-3">
                <span className="text-3xl">{dressCode.female.icon}</span>
                <h3 className="text-lg font-bold text-stone-800">{dressCode.female.title}</h3>
              </div>
              <div className="p-6 space-y-4">
                {dressCode.female.items.map((item, idx) => (
                  <div key={idx}>
                    <h4 className="font-medium text-stone-700 mb-2">{item.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tips.map((tip, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-pink-50 text-pink-600 rounded-lg">
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-stone-100">
                  <p className="text-xs text-red-500 mb-2">❌ 避免</p>
                  <div className="flex flex-wrap gap-2">
                    {dressCode.female.avoid.map((item, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Etiquette */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">仪态举止</h2>
              <p className="text-sm text-stone-500">展现得体的举止和形象</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {etiquette.map((item) => (
              <div key={item.id} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.textColor}`} />
                </div>
                <h3 className="font-bold text-stone-800 mb-4">{item.name}</h3>
                <div className="space-y-4">
                  {item.items.map((subItem, idx) => (
                    <div key={idx}>
                      <h4 className="font-medium text-stone-700 mb-2">{subItem.title}</h4>
                      <ul className="space-y-1">
                        {subItem.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Speaking */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">语言表达</h2>
              <p className="text-sm text-stone-500">流利、清晰、有逻辑地表达</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {speaking.map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-stone-800 mb-4">{item.title}</h3>
                <ul className="space-y-2">
                  {item.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Psychology */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-rose-500" />
              <h2 className="text-xl font-bold text-stone-800">心理调适</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {psychology.map((item, idx) => (
                <div key={idx} className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-rose-600" />
                    </div>
                    <h3 className="font-semibold text-stone-800">{item.phase}</h3>
                  </div>
                  <ul className="space-y-2">
                    {item.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="flex justify-between items-center p-6 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Link
            href="/learn/mianshi/wulingdao"
            className="flex items-center gap-2 text-stone-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>上一章：无领导小组讨论</span>
          </Link>
          <Link
            href="/learn/mianshi"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
          >
            <span>返回面试学习首页</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
