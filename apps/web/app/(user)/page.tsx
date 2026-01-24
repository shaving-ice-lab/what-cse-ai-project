"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search, MapPin, GraduationCap, Building2, ArrowRight, Target, TrendingUp, Users,
  FileText, ChevronRight, Sparkles, Clock, Star, Calendar, Award, Bookmark,
  MessageCircle, ChevronDown, Quote, Globe, CheckCircle2, Heart, BookOpen, Flame,
  Zap, BarChart3, Bell, Shield, Eye, ThumbsUp, AlertCircle, Briefcase, Timer,
  Activity, TrendingDown, Layers, Filter, Download, Smartphone, RefreshCw,
  DollarSign, School, UserCheck, BadgeCheck, Info,
} from "lucide-react";

// 动画数字组件
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000, steps = 60, increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-display font-bold">{count.toLocaleString()}{suffix}</span>;
}

// 滚动公告组件
function ScrollingNotice({ items }: { items: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex((i) => (i + 1) % items.length), 3000);
    return () => clearInterval(timer);
  }, [items.length]);
  return (
    <div className="overflow-hidden h-6">
      <div className="transition-transform duration-500" style={{ transform: `translateY(-${currentIndex * 24}px)` }}>
        {items.map((item, i) => <div key={i} className="h-6 text-sm text-stone-600 truncate">{item}</div>)}
      </div>
    </div>
  );
}

// 快捷入口
const quickFilters = [
  { href: "/positions?exam_type=国考", icon: Building2, title: "国考", count: "3,920", color: "text-blue-600", bg: "bg-blue-50" },
  { href: "/positions?exam_type=省考", icon: MapPin, title: "省考", count: "12,450", color: "text-emerald-600", bg: "bg-emerald-50" },
  { href: "/positions?exam_type=事业单位", icon: GraduationCap, title: "事业编", count: "8,320", color: "text-violet-600", bg: "bg-violet-50" },
  { href: "/match", icon: Target, title: "智能匹配", count: "AI推荐", color: "text-amber-600", bg: "bg-amber-50" },
  { href: "/positions?requirement=应届生", icon: School, title: "应届生", count: "6,840", color: "text-pink-600", bg: "bg-pink-50" },
  { href: "/positions?requirement=三不限", icon: UserCheck, title: "三不限", count: "2,160", color: "text-cyan-600", bg: "bg-cyan-50" },
];

// 今日实时数据
const todayStats = [
  { label: "今日新增职位", value: 286, change: "+12%", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "今日报名人数", value: 15420, change: "+8.5%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "今日活跃用户", value: 8960, change: "+15%", icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "今日新增公告", value: 24, change: "+3", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
];

// 热门搜索词
const hotSearches = [
  { word: "国税局", trend: "+28%" },
  { word: "海关", trend: "+15%" },
  { word: "不限专业", trend: "+32%" },
  { word: "计算机", trend: "+18%" },
  { word: "应届生", trend: "+22%" },
];

// 实时报名动态
const liveUpdates = [
  "北京考生报名了【国家税务总局-科员】",
  "上海考生报名了【上海海关-监管处科员】",
  "广东考生报名了【广东省发改委-综合岗】",
  "江苏考生报名了【南京市财政局-预算科员】",
];

// 热门专业
const hotMajors = [
  { name: "不限专业", count: 3200, pct: 13, trend: "+20%" },
  { name: "计算机类", count: 2860, pct: 12, trend: "+18%" },
  { name: "经济学类", count: 2340, pct: 10, trend: "+12%" },
  { name: "法学类", count: 1980, pct: 8, trend: "+15%" },
  { name: "管理学类", count: 1760, pct: 7, trend: "+9%" },
  { name: "中文类", count: 1520, pct: 6, trend: "+11%" },
];

// 学历分布
const educationDist = [
  { level: "本科", count: 18650, pct: 76, color: "bg-blue-500" },
  { level: "硕士", count: 4280, pct: 17, color: "bg-violet-500" },
  { level: "大专", count: 1420, pct: 6, color: "bg-emerald-500" },
  { level: "博士", count: 340, pct: 1, color: "bg-amber-500" },
];

// 最新公告
const latestAnnouncements = [
  { id: 1, title: "2024年度中央机关及其直属机构考试录用公务员公告", type: "国考", date: "10-15", hot: true, views: 125600 },
  { id: 2, title: "关于2024年国考报名时间延长的通知", type: "通知", date: "10-20", hot: false, views: 89200 },
  { id: 3, title: "2024年北京市公务员考试公告发布", type: "省考", date: "11-01", hot: true, views: 76800 },
  { id: 4, title: "2024年广东省公务员考试公告", type: "省考", date: "11-05", hot: true, views: 68500 },
  { id: 5, title: "国家公务员考试报名确认及缴费通知", type: "通知", date: "11-08", hot: false, views: 45200 },
];

// 统计数据
const stats = [
  { value: 24690, suffix: "+", label: "职位数据", icon: Briefcase },
  { value: 128000, suffix: "+", label: "注册用户", icon: Users },
  { value: 95, suffix: "%", label: "匹配准确率", icon: Target },
  { value: 860, suffix: "+", label: "数据来源", icon: Globe },
];

// 热门职位
const hotPositions = [
  { id: 1, name: "国家税务总局科员", dept: "国家税务总局北京市税务局", loc: "北京", num: 5, edu: "本科", type: "国考", ratio: "1:86", score: 92, apps: 430 },
  { id: 2, name: "海关监管处主任科员", dept: "中华人民共和国上海海关", loc: "上海", num: 3, edu: "硕士", type: "国考", ratio: "1:45", score: 88, apps: 135 },
  { id: 3, name: "外交部翻译处科员", dept: "中华人民共和国外交部", loc: "北京", num: 2, edu: "本科", type: "国考", ratio: "1:120", score: 85, apps: 240 },
  { id: 4, name: "广东省发改委综合岗", dept: "广东省发展和改革委员会", loc: "广州", num: 4, edu: "本科", type: "省考", ratio: "1:68", score: 90, apps: 272 },
  { id: 5, name: "浙江省财政厅科员", dept: "浙江省财政厅预算处", loc: "杭州", num: 2, edu: "本科", type: "省考", ratio: "1:52", score: 87, apps: 104 },
  { id: 6, name: "深圳市市场监管局", dept: "深圳市市场监督管理局", loc: "深圳", num: 6, edu: "本科", type: "省考", ratio: "1:78", score: 89, apps: 468 },
];

// 热门地区
const hotRegions = [
  { name: "广东", num: 3240, trend: "+15%", color: "bg-emerald-500" },
  { name: "北京", num: 2860, trend: "+12%", color: "bg-red-500" },
  { name: "江苏", num: 2680, trend: "+10%", color: "bg-blue-500" },
  { name: "山东", num: 2450, trend: "+11%", color: "bg-violet-500" },
  { name: "浙江", num: 2180, trend: "+9%", color: "bg-amber-500" },
  { name: "河南", num: 1950, trend: "+13%", color: "bg-pink-500" },
  { name: "上海", num: 1920, trend: "+8%", color: "bg-cyan-500" },
  { name: "四川", num: 1680, trend: "+7%", color: "bg-indigo-500" },
  { name: "湖北", num: 1560, trend: "+14%", color: "bg-teal-500" },
  { name: "福建", num: 1420, trend: "+6%", color: "bg-orange-500" },
  { name: "湖南", num: 1380, trend: "+8%", color: "bg-lime-500" },
  { name: "安徽", num: 1290, trend: "+10%", color: "bg-rose-500" },
];

// 竞争排行
const competitionRank = {
  high: [
    { pos: "国家统计局综合处", ratio: "1:2680", apps: 2680 },
    { pos: "商务部国际司科员", ratio: "1:1850", apps: 1850 },
    { pos: "发改委政策研究室", ratio: "1:1560", apps: 1560 },
  ],
  low: [
    { pos: "西藏自治区气象局", ratio: "1:3", apps: 3 },
    { pos: "新疆生产建设兵团", ratio: "1:5", apps: 5 },
    { pos: "青海省地震局", ratio: "1:8", apps: 8 },
  ],
};

// 热门部门
const hotDepts = [
  { name: "国家税务总局", positions: 1280, apps: 89600, avg: "1:70" },
  { name: "海关总署", positions: 680, apps: 42800, avg: "1:63" },
  { name: "铁路公安", positions: 520, apps: 28600, avg: "1:55" },
  { name: "银保监会", positions: 380, apps: 32400, avg: "1:85" },
];

// 备考时间线
const timeline = [
  { date: "10月14日", title: "公告发布", status: "done" },
  { date: "10月15-24日", title: "网上报名", status: "active" },
  { date: "10月25日", title: "资格审查截止", status: "next" },
  { date: "11月1-7日", title: "报名确认缴费", status: "" },
  { date: "11月18日起", title: "准考证打印", status: "" },
  { date: "12月1日", title: "笔试考试", status: "" },
];

// 考试类型
const examTypes = [
  { type: "国家公务员考试", short: "国考", icon: Building2, bg: "bg-blue-50", color: "text-blue-600", num: 3920, desc: "中央机关及直属机构", time: "10月报名 12月笔试" },
  { type: "地方公务员考试", short: "省考", icon: MapPin, bg: "bg-emerald-50", color: "text-emerald-600", num: 12450, desc: "省市县乡四级机关", time: "3-4月联考为主" },
  { type: "事业单位招聘", short: "事业编", icon: GraduationCap, bg: "bg-violet-50", color: "text-violet-600", num: 8320, desc: "教育医疗科研单位", time: "全年滚动招录" },
];

// 备考攻略
const guides = [
  { id: 1, title: "2024国考行测备考全攻略：五大模块详解", cat: "行测", views: 28600, time: "15min" },
  { id: 2, title: "申论写作高分技巧：从60到80分的蜕变", cat: "申论", views: 22400, time: "20min" },
  { id: 3, title: "面试结构化答题：六大题型模板汇总", cat: "面试", views: 18900, time: "18min" },
  { id: 4, title: "数量关系秒杀技巧：30秒解题法", cat: "行测", views: 15600, time: "12min" },
];

// 薪资对比
const salaryData = [
  { level: "中央部委", base: "5500-7500", total: "15-25万/年", housing: "有" },
  { level: "省级机关", base: "5000-7000", total: "12-20万/年", housing: "部分" },
  { level: "市级机关", base: "4500-6500", total: "10-18万/年", housing: "部分" },
  { level: "县级机关", base: "4000-5500", total: "8-14万/年", housing: "少" },
];

// 用户评价
const testimonials = [
  { id: 1, name: "张同学", avatar: "Z", title: "2024国考上岸·税务局", content: "智能匹配帮我精准定位岗位，从海选变精选，省去大量时间！", rating: 5, type: "国考" },
  { id: 2, name: "李女士", avatar: "L", title: "2024省考上岸·市监局", content: "公告聚合太实用了，再也不怕错过任何重要信息。", rating: 5, type: "省考" },
  { id: 3, name: "王先生", avatar: "W", title: "2024事业编上岸", content: "竞争分析帮我避开热门岗位，最终成功上岸！", rating: 5, type: "事业编" },
];

// FAQ
const faqs = [
  { q: "公考智选免费吗？", a: "核心功能完全免费，包括职位筛选、公告查看等。高级会员可解锁更多智能分析功能。" },
  { q: "智能匹配准确率如何保证？", a: "AI算法基于海量数据训练，结合学历、专业、经验等多维度匹配，准确率达95%以上。" },
  { q: "职位数据多久更新一次？", a: "爬虫系统24小时监控各大招考网站，重要公告发布后10分钟内完成同步更新。" },
  { q: "如何获取考试提醒？", a: "收藏职位或公告后，系统会在报名、缴费、准考证打印等重要节点自动推送提醒。" },
];

// 平台特色
const features = [
  { icon: Search, title: "智能筛选", desc: "20+维度精准筛选" },
  { icon: Target, title: "AI匹配", desc: "智能推荐最适合职位" },
  { icon: TrendingUp, title: "竞争分析", desc: "实时报名数据统计" },
  { icon: FileText, title: "公告聚合", desc: "全网招考公告汇总" },
  { icon: Bell, title: "智能提醒", desc: "关键节点自动推送" },
  { icon: BarChart3, title: "数据分析", desc: "历年数据对比分析" },
];

// 数据来源
const partners = ["国家公务员局", "各省人事考试网", "人民网", "新华网", "中国政府网"];

// FAQ组件
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-800/50">
        <span className="text-sm font-medium text-stone-100">{q}</span>
        <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-4 pb-4 text-sm text-stone-400 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="pb-20 lg:pb-0 bg-stone-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-amber-50/30 to-white">
        <div className="absolute top-10 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl" />
        
        <div className="container relative mx-auto px-4 lg:px-6 pt-10 pb-12">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-sm font-medium text-amber-700">
                <Sparkles className="w-4 h-4" /> 2024国考报名进行中
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-sm font-medium text-red-600">
                <Timer className="w-4 h-4" /> 截止还剩 3天12时
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 实时更新
              </span>
              <div className="w-64 hidden md:block"><ScrollingNotice items={liveUpdates} /></div>
            </div>
          </div>

          {/* Title + Search */}
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
              找到你的<span className="text-gradient-amber">理想公职</span>
            </h1>
            <p className="text-base md:text-lg text-stone-600 mb-6">
              覆盖全国 24,690+ 职位 · 智能匹配精准定位 · 128,000+ 考生的选择
            </p>
            
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-stone-200 p-2 mb-5">
              <Search className="absolute left-5 w-5 h-5 text-stone-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="搜索职位、部门、专业、地区..." 
                className="flex-1 pl-12 pr-4 py-3 bg-transparent text-base outline-none" 
              />
              <Link href={`/positions?q=${encodeURIComponent(searchQuery)}`} className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-base font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all">
                搜索职位
              </Link>
            </div>

            {/* Hot Searches */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-stone-500">热门搜索:</span>
              {hotSearches.map((item, i) => (
                <Link key={item.word} href={`/positions?q=${item.word}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white rounded-lg border border-stone-200 hover:border-amber-300 hover:text-amber-700 transition-colors">
                  {i < 3 && <Flame className="w-4 h-4 text-orange-500" />}
                  {item.word}
                  <span className="text-emerald-600 text-xs">{item.trend}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-w-3xl mx-auto">
            {quickFilters.map((f) => (
              <Link key={f.href} href={f.href} className="group flex flex-col items-center p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <span className="text-sm font-medium text-stone-800">{f.title}</span>
                <span className="text-sm text-stone-500">{f.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="container mx-auto px-4 lg:px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span className="text-base font-medium text-stone-800">今日实时数据</span>
              <span className="text-sm text-stone-400">更新于 10:25</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <RefreshCw className="w-4 h-4" /> 自动刷新
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {todayStats.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 ${s.bg} rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
                <div>
                  <p className="text-2xl font-display font-bold text-stone-900">{s.value.toLocaleString()}</p>
                  <p className="text-sm text-stone-600">{s.label} <span className="text-emerald-600 font-medium">{s.change}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="container mx-auto px-4 lg:px-6 py-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl text-amber-400 font-display font-bold mb-1">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-stone-400 flex items-center justify-center gap-2">
                  <s.icon className="w-4 h-4" />{s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column: Announcements + Majors */}
      <section className="container mx-auto px-4 lg:px-6 pb-8">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Announcements */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <FileText className="w-5 h-5 text-amber-600" />最新公告
              </h2>
              <Link href="/announcements" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                查看更多 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {latestAnnouncements.map((a) => (
                <Link key={a.id} href={`/announcements/${a.id}`} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-stone-50 transition-colors">
                  <span className="w-14 h-14 bg-stone-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-stone-800">{a.date.split("-")[1]}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${a.type === "国考" ? "bg-blue-100 text-blue-700" : a.type === "省考" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{a.type}</span>
                      {a.hot && <Star className="w-4 h-4 text-orange-500 fill-orange-500" />}
                    </div>
                    <p className="text-base text-stone-700 group-hover:text-amber-700 truncate">{a.title}</p>
                  </div>
                  <span className="text-sm text-stone-400 flex items-center gap-1 flex-shrink-0">
                    <Eye className="w-4 h-4" />{(a.views/10000).toFixed(1)}万
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Hot Majors + Education */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hot Majors */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                  <Layers className="w-5 h-5 text-violet-600" />热门专业
                </h2>
                <Link href="/positions" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  筛选 <Filter className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {hotMajors.map((m, i) => (
                  <Link key={m.name} href={`/positions?major=${m.name}`} className="group flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center font-bold ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>{i + 1}</span>
                    <span className="flex-1 text-sm text-stone-700 group-hover:text-amber-700">{m.name}</span>
                    <span className="text-sm font-medium text-stone-800">{m.count}</span>
                    <span className="text-sm text-emerald-600">{m.trend}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Education Distribution */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-5">
                <GraduationCap className="w-5 h-5 text-blue-600" />学历分布
              </h2>
              <div className="space-y-4">
                {educationDist.map((e) => (
                  <div key={e.level} className="flex items-center gap-3">
                    <span className="w-10 text-sm text-stone-600">{e.level}</span>
                    <div className="flex-1 h-5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${e.color} rounded-full flex items-center justify-end pr-2`} style={{ width: `${e.pct}%` }}>
                        {e.pct > 10 && <span className="text-xs text-white font-medium">{e.pct}%</span>}
                      </div>
                    </div>
                    <span className="text-sm text-stone-500 w-14 text-right">{e.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Positions */}
      <section className="container mx-auto px-4 lg:px-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-stone-800">
            <Flame className="w-6 h-6 text-orange-500" />热门职位
            <span className="text-sm font-normal text-stone-500 bg-stone-100 px-2 py-1 rounded-lg">实时更新</span>
          </h2>
          <Link href="/positions" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotPositions.map((p) => (
            <Link key={p.id} href={`/positions/${p.id}`} className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all overflow-hidden">
              <div className={`h-1 ${p.score >= 90 ? "bg-emerald-500" : p.score >= 85 ? "bg-amber-500" : "bg-orange-500"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-lg ${p.type === "国考" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>{p.type}</span>
                      <h3 className="text-base font-semibold text-stone-800 group-hover:text-amber-600 truncate">{p.name}</h3>
                    </div>
                    <p className="text-sm text-stone-500 truncate">{p.dept}</p>
                  </div>
                  <span className={`text-xl font-display font-bold ${p.score >= 90 ? "text-emerald-600" : p.score >= 85 ? "text-amber-600" : "text-orange-600"}`}>{p.score}%</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-sm bg-stone-100 rounded-lg text-stone-600">{p.loc}</span>
                  <span className="px-2 py-1 text-sm bg-stone-100 rounded-lg text-stone-600">{p.edu}</span>
                  <span className="px-2 py-1 text-sm bg-stone-100 rounded-lg text-stone-600">招{p.num}人</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-stone-100 pt-3">
                  <span className="text-stone-500">竞争比 <span className="font-semibold text-amber-600">{p.ratio}</span></span>
                  <span className="text-stone-500">已报名 <span className="font-semibold text-stone-700">{p.apps}人</span></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Competition + Timeline + Departments */}
      <section className="container mx-auto px-4 lg:px-6 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Competition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-stone-800 mb-4">
                <TrendingUp className="w-5 h-5 text-red-500" />竞争最激烈
              </h3>
              <div className="space-y-3">
                {competitionRank.high.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.pos}</p>
                      <p className="text-sm text-stone-500">{item.apps}人报名</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{item.ratio}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5">
              <h3 className="flex items-center gap-2 text-base font-bold text-stone-800 mb-4">
                <TrendingDown className="w-5 h-5 text-emerald-500" />竞争最小
              </h3>
              <div className="space-y-3">
                {competitionRank.low.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">{item.pos}</p>
                      <p className="text-sm text-stone-500">{item.apps}人报名</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{item.ratio}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-stone-800 mb-4">
              <Calendar className="w-5 h-5 text-amber-600" />2024国考时间线
            </h3>
            <div className="relative">
              <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-stone-200" />
              <div className="space-y-2">
                {timeline.map((t, i) => (
                  <div key={i} className={`relative flex items-center gap-4 p-3 pl-8 rounded-xl ${t.status === "active" ? "bg-amber-50" : t.status === "done" ? "bg-emerald-50/50" : ""}`}>
                    <div className={`absolute left-1 w-4 h-4 rounded-full border-2 ${t.status === "done" ? "bg-emerald-500 border-emerald-500" : t.status === "active" ? "bg-amber-500 border-amber-500 animate-pulse" : t.status === "next" ? "bg-white border-amber-400" : "bg-white border-stone-300"}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${t.status === "active" ? "text-amber-700" : t.status === "done" ? "text-emerald-700" : "text-stone-600"}`}>{t.title}</p>
                      <p className="text-sm text-stone-500">{t.date}</p>
                    </div>
                    {t.status === "active" && <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">进行中</span>}
                    {t.status === "done" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hot Departments */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-stone-800 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />热门招录部门
            </h3>
            <div className="space-y-3">
              {hotDepts.map((d, i) => (
                <Link key={d.name} href={`/positions?dept=${d.name}`} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50">
                  <span className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center ${i < 3 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 group-hover:text-amber-700">{d.name}</p>
                    <p className="text-sm text-stone-500">{d.positions}个岗位 · {(d.apps/10000).toFixed(1)}万人报名</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{d.avg}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hot Regions */}
      <section className="bg-gradient-to-br from-stone-100/50 to-amber-50/30 border-y border-stone-200">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-stone-800">
              <Globe className="w-6 h-6 text-blue-600" />热门地区招录
            </h2>
            <Link href="/positions" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
              全部地区 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {hotRegions.map((r) => (
              <Link key={r.name} href={`/positions?region=${r.name}`} className="group bg-white rounded-xl p-4 border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span className="text-base font-bold text-stone-800">{r.name}</span>
                </div>
                <p className="text-2xl font-display font-bold text-stone-900">{r.num.toLocaleString()}</p>
                <p className="text-sm text-emerald-600">{r.trend}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Types + Salary + Guides */}
      <section className="container mx-auto px-4 lg:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Exam Types */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-5">
              <BookOpen className="w-5 h-5 text-amber-600" />考试类型
            </h2>
            <div className="space-y-4">
              {examTypes.map((e) => (
                <Link key={e.short} href={`/positions?exam_type=${e.short}`} className="group flex items-center gap-4 bg-white rounded-2xl border border-stone-200 p-5 hover:border-amber-300 hover:shadow-md transition-all">
                  <div className={`w-14 h-14 rounded-xl ${e.bg} flex items-center justify-center flex-shrink-0`}>
                    <e.icon className={`w-7 h-7 ${e.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-semibold text-stone-800 group-hover:text-amber-700">{e.type}</span>
                      <span className={`px-2 py-0.5 text-sm rounded-lg ${e.bg} ${e.color}`}>{e.short}</span>
                    </div>
                    <p className="text-sm text-stone-500">{e.desc} · {e.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-display font-bold text-amber-600">{e.num.toLocaleString()}</p>
                    <p className="text-sm text-stone-400">在招职位</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-5">
              <DollarSign className="w-5 h-5 text-emerald-600" />薪资待遇参考
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="grid grid-cols-4 gap-px bg-stone-200 text-sm font-medium text-stone-600">
                <div className="bg-stone-50 p-3">级别</div>
                <div className="bg-stone-50 p-3">基本工资</div>
                <div className="bg-stone-50 p-3">年总收入</div>
                <div className="bg-stone-50 p-3">住房</div>
              </div>
              {salaryData.map((s) => (
                <div key={s.level} className="grid grid-cols-4 gap-px bg-stone-100 text-sm">
                  <div className="bg-white p-3 font-medium text-stone-800">{s.level}</div>
                  <div className="bg-white p-3 text-stone-600">{s.base}</div>
                  <div className="bg-white p-3 text-amber-600 font-semibold">{s.total}</div>
                  <div className="bg-white p-3 text-stone-600">{s.housing}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-stone-400 mt-3 flex items-center gap-1">
              <Info className="w-4 h-4" />数据仅供参考，实际以当地政策为准
            </p>
          </div>

          {/* Guides */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
                <Zap className="w-5 h-5 text-yellow-500" />备考攻略
              </h2>
              <Link href="#" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
                更多 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {guides.map((g) => (
                <Link key={g.id} href="#" className="group flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-md transition-all">
                  <span className={`px-2 py-1 text-sm font-medium rounded-lg ${g.cat === "行测" ? "bg-blue-100 text-blue-700" : g.cat === "申论" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>{g.cat}</span>
                  <h3 className="flex-1 text-sm text-stone-700 group-hover:text-amber-700 truncate">{g.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-stone-400 flex-shrink-0">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{g.time}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{(g.views/10000).toFixed(1)}万</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-stone-200">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-stone-800 mb-2">为什么选择公考智选</h2>
            <p className="text-base text-stone-500">一站式公务员考试信息服务平台</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group text-center p-5 rounded-2xl hover:bg-amber-50 transition-colors">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center group-hover:from-amber-200 group-hover:to-amber-100 transition-colors">
                  <f.icon className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-base font-semibold text-stone-800 mb-1">{f.title}</h3>
                <p className="text-sm text-stone-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 lg:px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-stone-800">
            <Heart className="w-5 h-5 text-red-500" />用户心声
          </h2>
          <p className="text-base text-stone-500 mt-1">听听已上岸的小伙伴怎么说</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="relative bg-white rounded-2xl border border-stone-200 p-6">
              <Quote className="absolute top-5 right-5 w-8 h-8 text-amber-100" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-base text-stone-600 mb-5 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-semibold ${t.type === "国考" ? "bg-blue-500" : t.type === "省考" ? "bg-emerald-500" : "bg-violet-500"}`}>{t.avatar}</div>
                <div>
                  <p className="text-base font-semibold text-stone-800">{t.name}</p>
                  <p className="text-sm text-stone-500">{t.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + Partners */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* FAQ */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <MessageCircle className="w-5 h-5 text-amber-400" />常见问题
              </h2>
              <div className="space-y-3">{faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}</div>
            </div>

            {/* Partners + Download */}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
                <Shield className="w-5 h-5 text-amber-400" />数据来源
              </h2>
              <div className="flex flex-wrap gap-3 mb-8">
                {partners.map((p) => <span key={p} className="px-4 py-2 bg-stone-800 rounded-xl text-sm text-stone-300 border border-stone-700">{p}</span>)}
              </div>
              
              <div className="bg-amber-500/10 rounded-2xl p-6 border border-amber-500/30">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white mb-1">下载公考智选APP</h3>
                    <p className="text-sm text-stone-400">随时随地查看职位，接收重要通知提醒</p>
                  </div>
                  <button className="px-5 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />下载
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
                  <BadgeCheck className="w-5 h-5 text-amber-400" />联系我们
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-stone-400">
                  <p>客服邮箱：support@gkzx.com</p>
                  <p>工作时间：9:00 - 21:00</p>
                  <p>官方微信：公考智选（gkzx2024）</p>
                  <p>意见反馈：feedback@gkzx.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 lg:px-6 py-10">
        <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-5 left-5 w-24 h-24 border-2 border-white rounded-full" />
            <div className="absolute bottom-5 right-5 w-16 h-16 border-2 border-white rounded-full" />
          </div>
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-white mb-4">开始您的公考之旅</h2>
            <p className="text-base text-amber-100 mb-6 max-w-lg mx-auto">注册账号完善个人信息，立即获取个性化的职位推荐</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="px-8 py-3 bg-white text-amber-600 text-base font-semibold rounded-xl hover:bg-amber-50 transition-colors shadow-lg">
                免费注册
              </Link>
              <Link href="/match" className="px-8 py-3 bg-amber-600 text-white text-base font-semibold rounded-xl border-2 border-white/30 hover:bg-amber-700 transition-colors flex items-center gap-2">
                <Target className="w-5 h-5" />立即匹配
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
