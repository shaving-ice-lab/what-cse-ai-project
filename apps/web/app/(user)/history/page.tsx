"use client";

import { useState } from "react";
import Link from "next/link";
import { History, MapPin, Users, Trash2, ExternalLink } from "lucide-react";

interface ViewHistory {
  id: number;
  position_name: string;
  department_name: string;
  work_location: string;
  recruit_count: number;
  viewed_at: string;
}

const mockHistory: ViewHistory[] = [
  {
    id: 1,
    position_name: "综合管理岗",
    department_name: "国家税务总局北京市税务局",
    work_location: "北京市",
    recruit_count: 3,
    viewed_at: "2024-11-01 15:30",
  },
  {
    id: 2,
    position_name: "信息技术岗",
    department_name: "海关总署广州海关",
    work_location: "广州市",
    recruit_count: 2,
    viewed_at: "2024-11-01 14:20",
  },
  {
    id: 3,
    position_name: "法律事务岗",
    department_name: "最高人民法院",
    work_location: "北京市",
    recruit_count: 1,
    viewed_at: "2024-10-31 10:15",
  },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<ViewHistory[]>(mockHistory);

  const clearAll = () => {
    if (confirm("确定要清空所有浏览记录吗？")) {
      setHistory([]);
    }
  };

  const removeItem = (id: number) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">浏览历史</h1>
          <p className="text-gray-500 mt-1">最近浏览的 {history.length} 个职位</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空记录</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    href={`/positions/${item.id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors"
                  >
                    {item.position_name}
                  </Link>
                  <p className="text-gray-600 mt-1">{item.department_name}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{item.work_location}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>招{item.recruit_count}人</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/positions/${item.id}`}
                    className="flex items-center text-primary text-sm hover:underline"
                  >
                    查看详情
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除记录"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                浏览于 {item.viewed_at}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <History className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">暂无浏览记录</p>
          <Link
            href="/positions"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            去浏览职位
          </Link>
        </div>
      )}
    </div>
  );
}
