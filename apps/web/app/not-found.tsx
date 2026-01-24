"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        {/* 404 Display */}
        <div className="relative mb-8">
          <h1 className="text-[150px] font-display font-bold text-stone-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber-lg animate-float">
              <Search className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-3">
          页面未找到
        </h2>
        <p className="text-stone-500 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被移除。
          <br />
          请检查网址是否正确，或返回首页继续浏览。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md hover:shadow-amber-lg"
          >
            <Home className="w-5 h-5" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回上一页
          </button>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-sm text-stone-500 mb-4">您可能想访问：</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/positions", label: "职位查询" },
              { href: "/match", label: "智能匹配" },
              { href: "/announcements", label: "公告中心" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-stone-600 bg-white border border-stone-200 rounded-lg hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
