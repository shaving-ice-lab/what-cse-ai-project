"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Building2,
  GraduationCap,
  Trash2,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface HistoryItem {
  id: number;
  position_name: string;
  department_name: string;
  work_location: string;
  education_requirement: string;
  exam_type: string;
  viewed_at: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: 1,
    position_name: "综合管理岗",
    department_name: "国家税务总局北京市税务局",
    work_location: "北京市",
    education_requirement: "本科及以上",
    exam_type: "国考",
    viewed_at: "2024-11-20 14:30",
  },
  {
    id: 2,
    position_name: "信息技术岗",
    department_name: "海关总署广州海关",
    work_location: "广州市",
    education_requirement: "本科及以上",
    exam_type: "国考",
    viewed_at: "2024-11-20 14:15",
  },
  {
    id: 3,
    position_name: "法律事务岗",
    department_name: "最高人民法院",
    work_location: "北京市",
    education_requirement: "硕士研究生及以上",
    exam_type: "国考",
    viewed_at: "2024-11-19 16:45",
  },
  {
    id: 4,
    position_name: "执法岗",
    department_name: "广东省市场监督管理局",
    work_location: "深圳市",
    education_requirement: "本科及以上",
    exam_type: "省考",
    viewed_at: "2024-11-19 10:20",
  },
  {
    id: 5,
    position_name: "财务管理岗",
    department_name: "财政部驻北京专员办",
    work_location: "北京市",
    education_requirement: "本科及以上",
    exam_type: "国考",
    viewed_at: "2024-11-18 09:30",
  },
];

// Group history by date
function groupByDate(items: HistoryItem[]) {
  const groups: { [key: string]: HistoryItem[] } = {};
  items.forEach((item) => {
    const date = item.viewed_at.split(" ")[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  return groups;
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateStr === today.toISOString().split("T")[0]) {
    return "今天";
  } else if (dateStr === yesterday.toISOString().split("T")[0]) {
    return "昨天";
  } else {
    return dateStr;
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);

  const handleClearAll = () => {
    if (confirm("确定要清空所有浏览历史吗？")) {
      setHistory([]);
    }
  };

  const handleRemove = (id: number) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const groupedHistory = groupByDate(history);
  const dates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800 flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            浏览历史
          </h1>
          <p className="text-stone-500 mt-1">共 {history.length} 条浏览记录</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空历史
          </button>
        )}
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">
                    {formatDateLabel(date)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Items for this date */}
              <div className="space-y-3">
                {groupedHistory[date].map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl border border-stone-200/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="p-4 lg:p-5">
                      <div className="flex items-center gap-4">
                        {/* Time */}
                        <div className="hidden sm:block text-center w-16 flex-shrink-0">
                          <span className="text-lg font-display font-bold text-stone-800">
                            {item.viewed_at.split(" ")[1]}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-12 bg-stone-200" />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/positions/${item.id}`}
                              className="font-semibold text-stone-800 hover:text-amber-600 transition-colors truncate"
                            >
                              {item.position_name}
                            </Link>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-md flex-shrink-0 ${
                                item.exam_type === "国考"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {item.exam_type}
                            </span>
                          </div>
                          <p className="flex items-center gap-1.5 text-sm text-stone-600">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            <span className="truncate">{item.department_name}</span>
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.work_location}
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {item.education_requirement}
                            </span>
                            <span className="sm:hidden flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.viewed_at.split(" ")[1]}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/positions/${item.id}`}
                            className="p-2 text-stone-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200/50 shadow-card">
          <Clock className="w-16 h-16 mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500 mb-2">暂无浏览记录</p>
          <Link
            href="/positions"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
          >
            去浏览职位
          </Link>
        </div>
      )}
    </div>
  );
}
