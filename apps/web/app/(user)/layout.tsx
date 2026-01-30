"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  Home,
  Briefcase,
  Target,
  FileText,
  Heart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Wrench,
  Crown,
  BookOpen,
  GraduationCap,
  PenTool,
  MessageSquare,
  ClipboardList,
  Brain,
  FileCheck,
  Mic,
  Scale,
  TrendingUp,
  BarChart3,
  History,
  BookMarked,
  Route,
  AlertCircle,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

// 导航项类型定义
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
  description?: string;
}

// 主导航配置 - 精简为5个主项
const navItems: NavItem[] = [
  { href: "/", label: "首页", icon: Home },
  {
    href: "/positions",
    label: "职位",
    icon: Briefcase,
    children: [
      { href: "/positions", label: "职位查询", icon: Search, description: "搜索全国公务员职位" },
      { href: "/match", label: "智能匹配", icon: Target, description: "AI智能推荐适合职位" },
      { href: "/positions/compare", label: "职位对比", icon: Scale, description: "多维度对比分析" },
      { href: "/subscriptions", label: "订阅管理", icon: Bell, description: "管理职位订阅通知" },
    ],
  },
  {
    href: "/learn",
    label: "备考",
    icon: GraduationCap,
    children: [
      // 学习模块
      { href: "/learn", label: "学习总览", icon: BookOpen, description: "查看学习进度与计划" },
      { href: "/learn/xingce", label: "行测", icon: Brain, description: "行政职业能力测验" },
      { href: "/learn/shenlun", label: "申论", icon: PenTool, description: "申论写作与分析" },
      { href: "/learn/mianshi", label: "面试", icon: Mic, description: "结构化面试训练" },
      { href: "/learn/gongji", label: "公基", icon: FileText, description: "公共基础知识" },
      // 分隔 - 练习模块
      { href: "/practice", label: "刷题练习", icon: ClipboardList, description: "快速练习与专项训练" },
      { href: "/practice/papers", label: "真题试卷", icon: FileCheck, description: "历年真题模拟考" },
      { href: "/learn/mistakes", label: "错题本", icon: AlertCircle, description: "错题回顾与分析" },
    ],
  },
  {
    href: "/announcements",
    label: "资讯",
    icon: FileText,
    children: [
      { href: "/announcements", label: "考试公告", icon: FileText, description: "最新招考公告" },
      { href: "/learn/report/leaderboard", label: "排行榜", icon: TrendingUp, description: "学习成绩排名" },
    ],
  },
  {
    href: "/tools",
    label: "更多",
    icon: Wrench,
    children: [
      { href: "/tools", label: "工具箱", icon: Wrench, description: "实用备考工具" },
      { href: "/learn/path", label: "学习路径", icon: Route, description: "个性化学习计划" },
      { href: "/learn/notes", label: "我的笔记", icon: StickyNote, description: "学习笔记管理" },
      { href: "/learn/report/weekly", label: "学习报告", icon: BarChart3, description: "数据分析统计" },
    ],
  },
];

// 移动端底部导航配置
const mobileNavItems: NavItem[] = [
  { href: "/", label: "首页", icon: Home },
  { href: "/learn", label: "学习", icon: GraduationCap },
  { href: "/practice", label: "刷题", icon: ClipboardList },
  { href: "/positions", label: "职位", icon: Briefcase },
  { href: "/profile", label: "我的", icon: User },
];

// 用户菜单配置
const userMenuItems: NavItem[] = [
  { href: "/profile", label: "个人中心", icon: User },
  { href: "/vip", label: "VIP会员", icon: Crown },
  { href: "/favorites", label: "我的收藏", icon: Heart },
  { href: "/history", label: "浏览历史", icon: History },
  { href: "/learn/favorites", label: "课程收藏", icon: BookMarked },
  { href: "/preferences", label: "报考偏好", icon: Settings },
];

// 下拉菜单组件 - 接收父组件的状态管理
function NavDropdown({
  item,
  isActive,
  isOpen,
  onOpen,
  onClose,
}: {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        onClick={onOpen}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
          isActive
            ? "text-amber-700 bg-amber-50"
            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
        }`}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 pt-2 z-50">
          {/* 透明桥接区域，防止鼠标移动时菜单消失 */}
          <div className="w-64 bg-white rounded-2xl shadow-warm-lg border border-stone-200/50 py-2 animate-scale-in">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className="flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <child.icon className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
                  {child.label}
                </p>
                {child.description && (
                  <p className="text-xs text-stone-500 mt-0.5 truncate">{child.description}</p>
                )}
              </div>
            </Link>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 移动端菜单项组件
function MobileNavItem({
  item,
  isActive,
  onClose,
  level = 0,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  onClose: () => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "text-amber-700 bg-amber-50"
              : "text-stone-600 hover:bg-stone-100"
          }`}
          style={{ paddingLeft: `${16 + level * 12}px` }}
        >
          <span className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {item.label}
          </span>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </button>
        {expanded && (
          <div className="mt-1 space-y-1 animate-fade-in">
            {item.children?.map((child) => (
              <MobileNavItem
                key={child.href}
                item={child}
                isActive={isActive}
                onClose={onClose}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        isActive(item.href)
          ? "text-amber-700 bg-amber-50"
          : "text-stone-600 hover:bg-stone-100"
      }`}
      style={{ paddingLeft: `${16 + level * 12}px` }}
    >
      <item.icon className="w-5 h-5" />
      {item.label}
    </Link>
  );
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 确保客户端挂载后再显示认证状态
  useEffect(() => {
    setMounted(true);
  }, []);

  // 在 hydration 完成且客户端挂载后，才显示认证状态
  const showAuthenticated = mounted && _hasHydrated && isAuthenticated;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 关闭移动菜单时锁定/解锁body滚动
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // 检查导航项或其子项是否激活
  const isNavActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header with Glass Effect */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-stone-200/50 shadow-warm-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber-md group-hover:shadow-amber-lg transition-shadow">
                <span className="text-white font-bold text-lg">智</span>
              </div>
              <span className="text-xl font-serif font-bold text-stone-800 hidden sm:block">
                公考智选
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) =>
                item.children ? (
                  <NavDropdown
                    key={item.href}
                    item={item}
                    isActive={isNavActive(item)}
                    isOpen={openDropdown === item.href}
                    onOpen={() => setOpenDropdown(item.href)}
                    onClose={() => setOpenDropdown(null)}
                  />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "text-amber-700 bg-amber-50"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-500 rounded-full" />
                    )}
                  </Link>
                )
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Bar - Desktop */}
              <div className="hidden md:flex items-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-200/40 via-orange-200/40 to-amber-200/40 rounded-2xl blur-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center bg-stone-100/80 hover:bg-white focus-within:bg-white border border-stone-200/50 hover:border-stone-300 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-2xl transition-all duration-300 overflow-hidden">
                    <Search className="w-4 h-4 text-stone-400 ml-3.5 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="搜索职位、课程、知识点..."
                      className="w-40 lg:w-52 xl:w-64 py-2.5 pl-2.5 pr-3 bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none transition-all duration-300 focus:w-52 lg:focus:w-64 xl:focus:w-80"
                    />
                    <div className="hidden lg:flex items-center gap-1 px-2 py-1 mr-2 bg-stone-200/60 rounded-lg text-[10px] text-stone-400 font-medium tracking-wide">
                      <kbd className="font-sans">⌘</kbd>
                      <kbd className="font-sans">K</kbd>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Search Button - Mobile */}
              <button className="md:hidden p-2.5 rounded-xl hover:bg-stone-100 active:bg-stone-200 transition-colors text-stone-600 hover:text-stone-900">
                <Search className="w-5 h-5" />
              </button>

              {showAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative p-2.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full animate-pulse-ring" />
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-stone-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ring-2 ring-amber-500/20">
                        <User className="w-4 h-4 text-amber-700" />
                      </div>
                      <span className="hidden md:block text-sm font-medium text-stone-700">
                        {user?.nickname || "用户"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-stone-400 transition-transform ${
                          userMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-warm-lg border border-stone-200/50 py-2 z-20 animate-scale-in">
                          <div className="px-4 py-3 border-b border-stone-100">
                            <p className="text-sm font-semibold text-stone-800">
                              {user?.nickname || "用户"}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {user?.email || user?.phone || "未设置联系方式"}
                            </p>
                          </div>
                          {/* VIP Banner */}
                          <Link
                            href="/vip"
                            onClick={() => setUserMenuOpen(false)}
                            className="mx-3 mt-3 mb-2 flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-amber-800">VIP会员</p>
                              <p className="text-xs text-amber-600">解锁全部高级功能</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-400" />
                          </Link>
                          <div className="py-1">
                            {userMenuItems.filter(item => item.href !== "/vip").map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                              >
                                <item.icon className="w-4 h-4 text-stone-400" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <div className="border-t border-stone-100 pt-2 mt-1">
                            <Link
                              href="/security"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-stone-400" />
                              账号安全
                            </Link>
                            <button
                              onClick={() => {
                                logout();
                                setUserMenuOpen(false);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              退出登录
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-amber-md hover:shadow-amber-lg transition-all btn-shine"
                  >
                    注册
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full Screen Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl animate-slide-in-left">
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">智</span>
                  </div>
                  <span className="text-lg font-serif font-bold text-stone-800">公考智选</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5 text-stone-500" />
                </button>
              </div>

              {/* User Info (if logged in) */}
              {showAuthenticated && (
                <div className="p-4 border-b border-stone-100">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center ring-2 ring-amber-500/20">
                      <User className="w-6 h-6 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-stone-800">{user?.nickname || "用户"}</p>
                      <p className="text-xs text-stone-500">点击查看个人中心</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400" />
                  </Link>
                  {/* VIP Banner */}
                  <Link
                    href="/vip"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-3 flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200/50"
                  >
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="flex-1 text-sm font-medium text-amber-800">开通VIP会员</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </Link>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    onClose={() => setMobileMenuOpen(false)}
                  />
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-stone-100">
                {showAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center text-sm font-medium text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                    >
                      登录
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all"
                    >
                      注册
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-300">
        {/* Main Footer */}
        <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">智</span>
                </div>
                <span className="text-xl font-serif font-bold text-white">公考智选</span>
              </Link>
              <p className="text-sm text-stone-400 leading-relaxed">
                智能匹配公务员职位，帮助每一位考生找到最适合自己的岗位。
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">快速链接</h3>
              <ul className="space-y-3 text-sm">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-stone-400 hover:text-amber-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Center */}
            <div>
              <h3 className="text-white font-semibold mb-4">帮助中心</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                    使用指南
                  </a>
                </li>
                <li>
                  <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                    常见问题
                  </a>
                </li>
                <li>
                  <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                    意见反馈
                  </a>
                </li>
                <li>
                  <a href="#" className="text-stone-400 hover:text-amber-400 transition-colors">
                    联系我们
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">关注我们</h3>
              <p className="text-sm text-stone-400 mb-3">微信公众号</p>
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                <span className="text-stone-400 text-xs">二维码</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800">
          <div className="container mx-auto px-4 lg:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-500">
              <p>© 2024 公考智选. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-stone-300 transition-colors">
                  用户协议
                </a>
                <a href="#" className="hover:text-stone-300 transition-colors">
                  隐私政策
                </a>
                <a href="#" className="hover:text-stone-300 transition-colors">
                  网站地图
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 z-40 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          {mobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive(item.href)
                  ? "text-amber-600"
                  : "text-stone-400 active:text-stone-600"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive(item.href) ? "bg-amber-50" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
