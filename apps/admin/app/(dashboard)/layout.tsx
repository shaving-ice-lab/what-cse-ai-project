"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Database,
  Bug,
  BookOpen,
  MapPin,
  GraduationCap,
  Shield,
  ScrollText,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "仪表盘", exact: true },
  { path: "/users", icon: Users, label: "用户管理" },
  { path: "/positions", icon: Briefcase, label: "职位管理" },
  { path: "/announcements", icon: FileText, label: "公告管理" },
  { path: "/crawlers", icon: Bug, label: "爬虫管理" },
  { path: "/list-pages", icon: ScrollText, label: "列表页管理" },
  { path: "/dictionary/majors", icon: GraduationCap, label: "专业字典" },
  { path: "/dictionary/regions", icon: MapPin, label: "地区字典" },
  { path: "/settings", icon: Settings, label: "系统设置" },
  { path: "/logs", icon: Database, label: "系统日志" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path) && (path !== "/" || pathname === "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <span className="text-xl font-bold">公考智选 Admin</span>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-800">管理后台</h1>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100">
                <span className="text-sm text-gray-700">{admin?.username || "管理员"}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  <span>设置</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
