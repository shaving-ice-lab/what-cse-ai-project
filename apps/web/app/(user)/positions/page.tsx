"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Filter, Heart, ChevronDown } from "lucide-react";

export default function PositionListPage() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索职位名称、部门名称..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
            <span>筛选</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select className="px-4 py-2 border rounded-lg">
                <option value="">考试类型</option>
                <option value="国考">国考</option>
                <option value="省考">省考</option>
                <option value="事业单位">事业单位</option>
              </select>
              <select className="px-4 py-2 border rounded-lg">
                <option value="">工作地点</option>
                <option value="北京">北京</option>
                <option value="上海">上海</option>
                <option value="广东">广东</option>
              </select>
              <select className="px-4 py-2 border rounded-lg">
                <option value="">学历要求</option>
                <option value="大专">大专及以上</option>
                <option value="本科">本科及以上</option>
                <option value="硕士">硕士及以上</option>
              </select>
              <select className="px-4 py-2 border rounded-lg">
                <option value="">专业要求</option>
                <option value="unlimited">不限专业</option>
                <option value="limited">限定专业</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">重置</button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                应用筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          共找到 <span className="font-semibold text-gray-800">1,234</span> 个职位
        </p>
        <select className="px-4 py-2 border rounded-lg">
          <option value="newest">最新发布</option>
          <option value="competition">竞争比低</option>
          <option value="recruit">招录人数多</option>
        </select>
      </div>

      {/* Position List */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Link
            key={i}
            href={`/positions/${i}`}
            className="block bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">科员（一）</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">国考</span>
                </div>
                <p className="text-gray-600 mb-3">国家税务总局北京市税务局</p>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded">本科及以上</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">会计学、财务管理</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">北京</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">招录3人</span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Heart className="w-5 h-5 text-gray-400" />
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">竞争比</p>
                  <p className="text-lg font-semibold text-orange-500">120:1</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">上一页</button>
        <button className="px-4 py-2 bg-primary text-white rounded-lg">1</button>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
        <span className="px-4 py-2">...</span>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">10</button>
        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">下一页</button>
      </div>
    </div>
  );
}
