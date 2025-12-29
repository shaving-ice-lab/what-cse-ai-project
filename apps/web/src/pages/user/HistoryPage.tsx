import { useState } from "react";
import { Link } from "react-router-dom";
import { History, Trash2, Clock, MapPin, Users } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface ViewRecord {
  id: string;
  positionId: string;
  positionName: string;
  departmentName: string;
  location: string;
  recruitCount: number;
  viewTime: string;
  viewDate: string;
}

const MOCK_HISTORY: ViewRecord[] = [
  {
    id: "1",
    positionId: "1",
    positionName: "综合管理岗",
    departmentName: "国家税务总局北京市税务局",
    location: "北京市",
    recruitCount: 2,
    viewTime: "14:30",
    viewDate: "今天",
  },
  {
    id: "2",
    positionId: "2",
    positionName: "信息技术岗",
    departmentName: "国家税务总局广东省税务局",
    location: "广州市",
    recruitCount: 3,
    viewTime: "10:15",
    viewDate: "今天",
  },
  {
    id: "3",
    positionId: "3",
    positionName: "法律事务岗",
    departmentName: "司法部机关",
    location: "北京市",
    recruitCount: 1,
    viewTime: "18:45",
    viewDate: "昨天",
  },
  {
    id: "4",
    positionId: "4",
    positionName: "行政执法岗",
    departmentName: "广州市市场监督管理局",
    location: "广州市",
    recruitCount: 5,
    viewTime: "09:20",
    viewDate: "昨天",
  },
  {
    id: "5",
    positionId: "5",
    positionName: "财务管理岗",
    departmentName: "南京市财政局",
    location: "南京市",
    recruitCount: 2,
    viewTime: "16:00",
    viewDate: "3天前",
  },
];

export default function HistoryPage() {
  const [history, setHistory] = useState<ViewRecord[]>(MOCK_HISTORY);

  const groupedHistory = history.reduce(
    (acc, record) => {
      if (!acc[record.viewDate]) {
        acc[record.viewDate] = [];
      }
      acc[record.viewDate].push(record);
      return acc;
    },
    {} as Record<string, ViewRecord[]>
  );

  const handleDelete = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    toast.success("已删除该记录");
  };

  const handleClearAll = () => {
    setHistory([]);
    toast.success("已清空浏览历史");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6" />
          <h1 className="text-2xl font-bold">浏览历史</h1>
        </div>
        <button
          onClick={handleClearAll}
          disabled={history.length === 0}
          className="px-3 py-1.5 text-sm text-red-500 hover:text-red-600 disabled:opacity-50"
        >
          清空全部
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>暂无浏览记录</p>
          <Link to="/positions" className="text-primary hover:underline mt-2 inline-block">
            去看看职位
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, records]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {date}
              </h2>
              <div className="space-y-3">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <Link to={`/positions/${record.positionId}`} className="flex-1">
                        <h3 className="font-medium text-gray-900 hover:text-primary">
                          {record.positionName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{record.departmentName}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {record.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />招{record.recruitCount}人
                          </span>
                          <span>{record.viewTime}</span>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
