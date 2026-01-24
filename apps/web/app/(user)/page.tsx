"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  GraduationCap,
  Building2,
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  FileText,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
} from "lucide-react";

// 动画数字组件
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-display font-bold">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// 快捷筛选卡片数据
const quickFilters = [
  {
    href: "/positions?exam_type=国考",
    icon: Building2,
    title: "国家公务员",
    subtitle: "中央机关及直属机构",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    href: "/positions?exam_type=省考",
    icon: MapPin,
    title: "地方公务员",
    subtitle: "各省市公务员招录",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    href: "/positions?exam_type=事业单位",
    icon: GraduationCap,
    title: "事业单位",
    subtitle: "事业编制招聘",
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    href: "/match",
    icon: Target,
    title: "智能匹配",
    subtitle: "AI精准推荐职位",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

// 最新公告数据
const latestAnnouncements = [
  {
    id: 1,
    title: "2024年度中央机关及其直属机构考试录用公务员公告",
    type: "招考公告",
    date: "2024-10-15",
    isHot: true,
  },
  {
    id: 2,
    title: "关于2024年国考报名时间延长的通知",
    type: "报名通知",
    date: "2024-10-20",
    isHot: false,
  },
  {
    id: 3,
    title: "2024年北京市公务员考试公告发布",
    type: "招考公告",
    date: "2024-11-01",
    isHot: true,
  },
];

// 平台特色数据
const features = [
  {
    icon: Search,
    title: "多维筛选",
    description: "支持学历、专业、地区等20+维度精准筛选",
  },
  {
    icon: Target,
    title: "智能匹配",
    description: "AI分析您的条件，推荐最适合的职位",
  },
  {
    icon: TrendingUp,
    title: "竞争分析",
    description: "实时更新报名人数，掌握竞争态势",
  },
  {
    icon: FileText,
    title: "公告聚合",
    description: "汇集各类考试公告，不错过任何机会",
  },
];

// 统计数据
const stats = [
  { value: 15000, suffix: "+", label: "职位数据" },
  { value: 80000, suffix: "+", label: "注册用户" },
  { value: 95, suffix: "%", label: "匹配准确率" },
  { value: 500, suffix: "+", label: "合作机构" },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/50 to-stone-50" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-amber-100/40 rounded-full blur-2xl animate-float animation-delay-500" />

        <div className="container relative mx-auto px-4 lg:px-6 pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 border border-amber-200/50 mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                2024年国考报名进行中
              </span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-stone-900 mb-6 animate-fade-in animation-delay-100">
              找到你的
              <span className="text-gradient-amber">理想公职</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto animate-fade-in animation-delay-200">
              智能匹配，精准定位。帮助每一位考生快速找到最适合的公务员岗位。
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto animate-fade-in animation-delay-300">
              <div className="relative flex items-center bg-white rounded-2xl shadow-warm-lg border border-stone-200/50 p-2">
                <Search className="absolute left-5 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索职位名称、部门、地区..."
                  className="flex-1 pl-12 pr-4 py-4 bg-transparent text-stone-800 placeholder-stone-400 outline-none text-lg"
                />
                <Link
                  href={`/positions?q=${encodeURIComponent(searchQuery)}`}
                  className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg btn-shine"
                >
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">搜索职位</span>
                </Link>
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="text-sm text-stone-500">热门搜索:</span>
                {["国税局", "海关", "计算机类", "不限专业"].map((tag) => (
                  <Link
                    key={tag}
                    href={`/positions?q=${tag}`}
                    className="px-3 py-1.5 text-sm text-stone-600 bg-white/80 hover:bg-white rounded-lg border border-stone-200/50 hover:border-amber-300 hover:text-amber-700 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters Section */}
      <section className="container mx-auto px-4 lg:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickFilters.map((filter, index) => (
            <Link
              key={filter.href}
              href={filter.href}
              className="group relative bg-white rounded-2xl p-5 border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${filter.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <filter.icon className={`w-6 h-6 ${filter.textColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-1">{filter.title}</h3>
              <p className="text-sm text-stone-500">{filter.subtitle}</p>
              <ChevronRight className="absolute top-5 right-5 w-5 h-5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl lg:text-4xl text-amber-400 mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-stone-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="container mx-auto px-4 lg:px-6 pb-16 lg:pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800">
              最新公告
            </h2>
            <p className="text-stone-500 mt-1">及时获取最新招考信息</p>
          </div>
          <Link
            href="/announcements"
            className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            查看全部
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4">
          {latestAnnouncements.map((announcement, index) => (
            <Link
              key={announcement.id}
              href={`/announcements/${announcement.id}`}
              className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Date Badge */}
              <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-xs text-stone-500">
                  {announcement.date.split("-")[1]}月
                </span>
                <span className="text-xl font-bold text-stone-800">
                  {announcement.date.split("-")[2]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-amber-100 text-amber-700">
                    {announcement.type}
                  </span>
                  {announcement.isHot && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-600">
                      <Star className="w-3 h-3" />
                      热门
                    </span>
                  )}
                </div>
                <h3 className="text-stone-800 font-medium group-hover:text-amber-700 transition-colors line-clamp-1">
                  {announcement.title}
                </h3>
                <p className="flex items-center gap-1 text-sm text-stone-500 mt-1 sm:hidden">
                  <Clock className="w-3.5 h-3.5" />
                  {announcement.date}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-y border-stone-100">
        <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 mb-3">
              为什么选择公考智选
            </h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              我们致力于为每一位公考人提供最专业、最智能的职位筛选服务
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group text-center p-6 rounded-2xl hover:bg-amber-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                  <feature.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 lg:p-12 text-center overflow-hidden">
          {/* Decorative */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white rounded-full" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">
              开始您的公考之旅
            </h2>
            <p className="text-amber-100 mb-8 max-w-xl mx-auto">
              注册账号，完善个人信息，立即获取个性化的职位推荐
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
              >
                免费注册
              </Link>
              <Link
                href="/match"
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-600 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <Target className="w-5 h-5" />
                  立即匹配
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
