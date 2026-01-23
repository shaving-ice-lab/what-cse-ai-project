"use client";

import Link from "next/link";
import { ArrowLeft, Download, Share2 } from "lucide-react";

export default function MatchReportPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/match" className="inline-flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回匹配结果
        </Link>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>下载报告</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Share2 className="w-4 h-4" />
            <span>分享</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">匹配报告</h1>
        <p className="text-gray-500">详细的职位匹配分析报告</p>

        <div className="mt-8 text-center py-12 text-gray-500">
          <p>报告生成中...</p>
        </div>
      </div>
    </div>
  );
}
