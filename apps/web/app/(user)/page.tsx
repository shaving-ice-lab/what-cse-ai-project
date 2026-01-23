"use client";

import Link from "next/link";
import { Search, MapPin, GraduationCap, Building2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white">
        <h1 className="text-4xl font-bold mb-4">公考职位智能筛选系统</h1>
        <p className="text-xl text-blue-100 mb-8">快速找到适合你的公务员职位</p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex bg-white rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="搜索职位名称、部门..."
              className="flex-1 px-6 py-4 text-gray-800 outline-none"
            />
            <button className="px-6 bg-primary hover:bg-primary/90 flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>搜索</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">快速筛选</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/positions?exam_type=国考"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">国家公务员</p>
              <p className="text-sm text-gray-500">国考职位</p>
            </div>
          </Link>
          <Link
            href="/positions?exam_type=省考"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">地方公务员</p>
              <p className="text-sm text-gray-500">省考职位</p>
            </div>
          </Link>
          <Link
            href="/positions?exam_type=事业单位"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">事业单位</p>
              <p className="text-sm text-gray-500">事业编职位</p>
            </div>
          </Link>
          <Link
            href="/match"
            className="flex items-center space-x-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="p-3 bg-orange-100 rounded-lg">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">智能匹配</p>
              <p className="text-sm text-gray-500">找到最适合的职位</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Latest Announcements */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">最新公告</h2>
          <Link href="/announcements" className="flex items-center text-primary hover:underline">
            查看更多 <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">2024年国家公务员考试公告</h3>
                  <p className="text-sm text-gray-500">报名时间：2024年10月15日-10月24日</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                  招录公告
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white rounded-2xl">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">平台特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">智能筛选</h3>
            <p className="text-gray-500">多维度筛选，快速定位目标职位</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">精准匹配</h3>
            <p className="text-gray-500">根据个人条件，推荐最适合的职位</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">数据全面</h3>
            <p className="text-gray-500">覆盖国考、省考、事业单位等</p>
          </div>
        </div>
      </section>
    </div>
  );
}
