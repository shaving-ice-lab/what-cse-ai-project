import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface PendingPosition {
  id: number;
  positionId: string;
  positionName: string;
  departmentName: string;
  examType: string;
  recruitCount: number;
  parseConfidence: number;
  createdAt: string;
}

const MOCK_PENDING: PendingPosition[] = [
  {
    id: 1,
    positionId: "GK2024-002-0001",
    positionName: "财务管理岗",
    departmentName: "财政部机关",
    examType: "国考",
    recruitCount: 1,
    parseConfidence: 92,
    createdAt: "2024-11-15 10:30",
  },
  {
    id: 2,
    positionId: "GK2024-002-0002",
    positionName: "信息技术岗",
    departmentName: "工信部机关",
    examType: "国考",
    recruitCount: 2,
    parseConfidence: 78,
    createdAt: "2024-11-15 11:20",
  },
  {
    id: 3,
    positionId: "SK2024-BJ-0001",
    positionName: "综合执法岗",
    departmentName: "北京市城管局",
    examType: "省考",
    recruitCount: 5,
    parseConfidence: 65,
    createdAt: "2024-11-15 14:00",
  },
  {
    id: 4,
    positionId: "SK2024-GD-0001",
    positionName: "基层服务岗",
    departmentName: "广州市民政局",
    examType: "省考",
    recruitCount: 3,
    parseConfidence: 88,
    createdAt: "2024-11-15 15:30",
  },
];

export default function AdminPendingPositions() {
  const [positions, setPositions] = useState<PendingPosition[]>(MOCK_PENDING);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<number | null>(null);

  const filteredPositions = positions.filter(
    (p) =>
      p.positionName.includes(searchTerm) ||
      p.departmentName.includes(searchTerm) ||
      p.positionId.includes(searchTerm)
  );

  const handleApprove = async (id: number) => {
    setLoading(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions((prev) => prev.filter((p) => p.id !== id));
      toast.success("已审核通过");
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setLoading(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPositions((prev) => prev.filter((p) => p.id !== id));
      toast.success("已拒绝");
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(null);
    }
  };

  const handleBatchApprove = async () => {
    const highConfidence = positions.filter((p) => p.parseConfidence >= 85);
    if (highConfidence.length === 0) {
      toast.error("没有高置信度的待审核职位");
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPositions((prev) => prev.filter((p) => p.parseConfidence < 85));
      toast.success(`已批量通过${highConfidence.length}个高置信度职位`);
    } catch {
      toast.error("操作失败");
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">待审核职位</h1>
          <p className="text-gray-500 mt-1">共 {positions.length} 个职位待审核</p>
        </div>
        <button
          onClick={handleBatchApprove}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          批量通过高置信度职位
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索职位..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {filteredPositions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>没有待审核的职位</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  职位信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  考试类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  招录人数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  置信度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  提交时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{position.positionName}</p>
                    <p className="text-sm text-gray-500">{position.departmentName}</p>
                    <p className="text-xs text-gray-400">{position.positionId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                      {position.examType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{position.recruitCount}人</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className={`w-4 h-4 ${position.parseConfidence >= 85 ? "text-green-500" : position.parseConfidence >= 70 ? "text-yellow-500" : "text-red-500"}`}
                      />
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(position.parseConfidence)}`}
                      >
                        {position.parseConfidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{position.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/positions/${position.id}`}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="查看详情"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => handleApprove(position.id)}
                        disabled={loading === position.id}
                        className="p-2 hover:bg-green-100 rounded text-green-600"
                        title="通过"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(position.id)}
                        disabled={loading === position.id}
                        className="p-2 hover:bg-red-100 rounded text-red-600"
                        title="拒绝"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 置信度说明 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">AI解析置信度说明</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            <span className="inline-block w-16">≥90%</span> - 高置信度，可批量通过
          </p>
          <p>
            <span className="inline-block w-16">70-89%</span> - 中等置信度，建议人工核查
          </p>
          <p>
            <span className="inline-block w-16">&lt;70%</span> - 低置信度，需仔细审核
          </p>
        </div>
      </div>
    </div>
  );
}
