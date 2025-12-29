import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface Position {
  id: number;
  positionId: string;
  positionName: string;
  departmentCode: string;
  departmentName: string;
  departmentLevel: string;
  workLocationProvince: string;
  workLocationCity: string;
  recruitCount: number;
  examType: string;
  educationMin: string;
  degreeRequired: string;
  majorCategory: string[];
  majorUnlimited: boolean;
  politicalStatus: string;
  workExpYearsMin: number;
  ageMin: number;
  ageMax: number;
  genderRequired: string;
  hukouRequired: boolean;
  registrationStart: string;
  registrationEnd: string;
  examDateWritten: string;
  applicantCount: number;
  competitionRatio: number;
  parseConfidence: number;
  status: number;
}

const MOCK_POSITION: Position = {
  id: 1,
  positionId: "GK2024-001-0001",
  positionName: "综合管理岗",
  departmentCode: "001",
  departmentName: "国家税务总局北京市税务局",
  departmentLevel: "省级",
  workLocationProvince: "北京市",
  workLocationCity: "北京市",
  recruitCount: 2,
  examType: "国考",
  educationMin: "本科",
  degreeRequired: "是",
  majorCategory: ["管理学", "经济学"],
  majorUnlimited: false,
  politicalStatus: "中共党员",
  workExpYearsMin: 0,
  ageMin: 18,
  ageMax: 35,
  genderRequired: "不限",
  hukouRequired: false,
  registrationStart: "2024-10-15",
  registrationEnd: "2024-10-24",
  examDateWritten: "2024-12-01",
  applicantCount: 358,
  competitionRatio: 179,
  parseConfidence: 95,
  status: 1,
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "待审核", color: "bg-yellow-100 text-yellow-600" },
  1: { label: "已发布", color: "bg-green-100 text-green-600" },
  2: { label: "已下线", color: "bg-gray-100 text-gray-600" },
};

export default function AdminPositionDetail() {
  const { id: positionId } = useParams();
  const [position, setPosition] = useState<Position>({
    ...MOCK_POSITION,
    positionId: positionId || MOCK_POSITION.positionId,
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("保存成功");
      setIsEditing(false);
    } catch {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPosition((prev) => ({ ...prev, status: 1 }));
      toast.success("已审核通过");
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPosition((prev) => ({ ...prev, status: 2 }));
      toast.success("已拒绝");
    } catch {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/positions" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">职位详情</h1>
            <p className="text-gray-500 mt-1">职位代码: {position.positionId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {position.status === 0 && (
            <>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                审核通过
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <XCircle className="w-4 h-4" />
                拒绝
              </button>
            </>
          )}
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              编辑
            </button>
          )}
        </div>
      </div>

      {/* 状态和置信度 */}
      <div className="flex items-center gap-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_MAP[position.status].color}`}
        >
          {STATUS_MAP[position.status].label}
        </span>
        <div className="flex items-center gap-2">
          <AlertCircle
            className={`w-4 h-4 ${position.parseConfidence >= 90 ? "text-green-500" : position.parseConfidence >= 70 ? "text-yellow-500" : "text-red-500"}`}
          />
          <span className="text-sm text-gray-500">AI解析置信度: {position.parseConfidence}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">职位名称</label>
              {isEditing ? (
                <input
                  type="text"
                  value={position.positionName}
                  onChange={(e) =>
                    setPosition((prev) => ({ ...prev, positionName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="font-medium">{position.positionName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">招录机关</label>
              {isEditing ? (
                <input
                  type="text"
                  value={position.departmentName}
                  onChange={(e) =>
                    setPosition((prev) => ({ ...prev, departmentName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              ) : (
                <p className="font-medium">{position.departmentName}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">机关级别</label>
                <p className="font-medium">{position.departmentLevel}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">考试类型</label>
                <p className="font-medium">{position.examType}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">工作地点</label>
                <p className="font-medium">
                  {position.workLocationProvince} {position.workLocationCity}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">招录人数</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={position.recruitCount}
                    onChange={(e) =>
                      setPosition((prev) => ({ ...prev, recruitCount: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="font-medium">{position.recruitCount}人</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 报考条件 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">报考条件</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">最低学历</label>
                <p className="font-medium">{position.educationMin}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">学位要求</label>
                <p className="font-medium">{position.degreeRequired}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">专业要求</label>
              <p className="font-medium">
                {position.majorUnlimited ? "不限专业" : position.majorCategory.join("、")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">政治面貌</label>
                <p className="font-medium">{position.politicalStatus}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">工作经验</label>
                <p className="font-medium">
                  {position.workExpYearsMin > 0 ? `${position.workExpYearsMin}年以上` : "无要求"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">年龄要求</label>
                <p className="font-medium">
                  {position.ageMin}-{position.ageMax}岁
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">性别要求</label>
                <p className="font-medium">{position.genderRequired}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">户籍要求</label>
              <p className="font-medium">{position.hukouRequired ? "有户籍限制" : "不限户籍"}</p>
            </div>
          </div>
        </div>

        {/* 考试信息 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">考试信息</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">报名开始</label>
                <p className="font-medium">{position.registrationStart}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">报名截止</label>
                <p className="font-medium">{position.registrationEnd}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">笔试日期</label>
              <p className="font-medium">{position.examDateWritten}</p>
            </div>
          </div>
        </div>

        {/* 竞争数据 */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">竞争数据</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">报名人数</label>
                <p className="text-2xl font-bold text-primary">{position.applicantCount}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">竞争比</label>
                <p className="text-2xl font-bold text-orange-500">{position.competitionRatio}:1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
