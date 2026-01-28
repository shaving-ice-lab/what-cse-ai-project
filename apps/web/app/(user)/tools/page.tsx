"use client";

import Link from "next/link";
import { 
  MapPin, 
  Calculator, 
  Trophy, 
  ArrowRight,
  Building2,
  Target,
  Clock,
  Users,
  Sparkles
} from "lucide-react";

const tools = [
  {
    id: "exam-locations",
    title: "考点查询",
    description: "查询全国各地考点信息，包括地址、交通路线、周边设施等",
    icon: MapPin,
    href: "/tools/exam-locations",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    features: ["考点地址", "地图导航", "周边酒店", "交通路线"],
  },
  {
    id: "score-estimate",
    title: "估分工具",
    description: "输入答案，快速估算行测、申论等考试科目分数",
    icon: Calculator,
    href: "/tools/score-estimate",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    features: ["行测估分", "申论估分", "答案对照", "分数预测"],
  },
  {
    id: "score-share",
    title: "成绩晒分",
    description: "分享考试成绩，查看分数排行榜，了解竞争形势",
    icon: Trophy,
    href: "/tools/score-share",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    features: ["成绩排行", "分数统计", "进面数据", "竞争分析"],
  },
];

const stats = [
  { label: "考点数据", value: "3,000+", icon: Building2 },
  { label: "估分次数", value: "50,000+", icon: Target },
  { label: "晒分记录", value: "20,000+", icon: Trophy },
  { label: "活跃用户", value: "100,000+", icon: Users },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-blue-50/30" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-blue-200/20 rounded-full blur-2xl" />
        
        <div className="container relative mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 text-sm font-medium text-amber-700 mb-6">
              <Sparkles className="w-4 h-4" />
              考试工具箱
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
              备考必备<span className="text-gradient-amber">工具集</span>
            </h1>
            <p className="text-base md:text-lg text-stone-600">
              考点查询、在线估分、成绩晒分，一站式备考辅助工具
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {stats.map((stat) => (
              <div 
                key={stat.label}
                className="flex flex-col items-center p-4 bg-white/80 backdrop-blur rounded-xl border border-stone-200"
              >
                <stat.icon className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-2xl font-bold text-stone-900">{stat.value}</span>
                <span className="text-sm text-stone-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 lg:px-6 pb-12">
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link 
              key={tool.id}
              href={tool.href}
              className="group relative bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Top gradient bar */}
              <div className={`h-1.5 ${tool.bgColor}`} />
              
              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`w-7 h-7 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-stone-800 mb-1 group-hover:text-amber-700 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tool.features.map((feature) => (
                    <span 
                      key={feature}
                      className={`px-3 py-1 text-sm rounded-lg ${tool.bgColor} ${tool.color}`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                  <span className="text-sm text-stone-500">立即使用</span>
                  <div className={`w-8 h-8 rounded-lg ${tool.bgColor} flex items-center justify-center group-hover:translate-x-1 transition-transform`}>
                    <ArrowRight className={`w-4 h-4 ${tool.color}`} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="container mx-auto px-4 lg:px-6 pb-12">
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">温馨提示</span>
          </div>
          <p className="text-stone-300 text-sm max-w-2xl mx-auto">
            考前务必确认考点地址和交通路线，提前规划出行时间。
            估分仅供参考，实际分数以官方公布为准。
            晒分数据来自用户自愿提交，统计结果仅供参考。
          </p>
        </div>
      </section>
    </div>
  );
}
