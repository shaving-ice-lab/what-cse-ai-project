"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/positions", label: "职位查询", icon: Briefcase },
  { href: "/match", label: "智能匹配", icon: Target },
  { href: "/announcements", label: "公告资讯", icon: FileText },
];

const userMenuItems = [
  { href: "/profile", label: "个人中心", icon: User },
  { href: "/favorites", label: "我的收藏", icon: Heart },
  { href: "/preferences", label: "报考偏好", icon: Settings },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
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
              {navItems.map((item) => (
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
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button className="p-2.5 rounded-xl hover:bg-stone-100 transition-colors text-stone-600 hover:text-stone-900">
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
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-warm-lg border border-stone-200/50 py-2 z-20 animate-scale-in">
                          <div className="px-4 py-3 border-b border-stone-100">
                            <p className="text-sm font-semibold text-stone-800">
                              {user?.nickname || "用户"}
                            </p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {user?.email || user?.phone || "未设置联系方式"}
                            </p>
                          </div>
                          <div className="py-2">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                          <div className="border-t border-stone-100 pt-2">
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/50 bg-white/95 backdrop-blur-lg animate-fade-in">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-amber-700 bg-amber-50"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-stone-200 z-50">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 ${
                isActive(item.href) ? "text-amber-600" : "text-stone-500"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
