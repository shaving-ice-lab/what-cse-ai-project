import { useState } from "react";
import { toast } from "@/components/ui/toaster";

const PROVINCES = [
  { code: "110000", name: "北京市" },
  { code: "120000", name: "天津市" },
  { code: "310000", name: "上海市" },
  { code: "320000", name: "江苏省" },
  { code: "330000", name: "浙江省" },
  { code: "440000", name: "广东省" },
  { code: "510000", name: "四川省" },
];

const EXAM_TYPES = [
  { value: "国考", label: "国家公务员考试" },
  { value: "省考", label: "省级公务员考试" },
  { value: "事业单位", label: "事业单位招聘" },
  { value: "选调生", label: "选调生考试" },
];

const DEPARTMENT_TYPES = [
  { value: "tax", label: "税务系统" },
  { value: "customs", label: "海关系统" },
  { value: "police", label: "公安系统" },
  { value: "court", label: "法院系统" },
  { value: "procuratorate", label: "检察院系统" },
  { value: "finance", label: "财政系统" },
  { value: "other", label: "其他部门" },
];

export default function PreferencesPage() {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredProvinces: [] as string[],
    preferredCities: [] as string[],
    examTypes: [] as string[],
    departmentTypes: [] as string[],
    acceptRemoteArea: false,
    acceptGrassroots: false,
    minRecruitCount: 1,
    matchStrategy: "balanced" as "strict" | "balanced" | "loose",
  });

  const handleProvinceToggle = (code: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferredProvinces: prev.preferredProvinces.includes(code)
        ? prev.preferredProvinces.filter((p) => p !== code)
        : [...prev.preferredProvinces, code],
    }));
  };

  const handleExamTypeToggle = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      examTypes: prev.examTypes.includes(value)
        ? prev.examTypes.filter((t) => t !== value)
        : [...prev.examTypes, value],
    }));
  };

  const handleDepartmentToggle = (value: string) => {
    setPreferences((prev) => ({
      ...prev,
      departmentTypes: prev.departmentTypes.includes(value)
        ? prev.departmentTypes.filter((d) => d !== value)
        : [...prev.departmentTypes, value],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Call API to save preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("偏好设置已保存");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">偏好设置</h1>

      <div className="space-y-8">
        {/* 地域偏好 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">地域偏好</h2>
          <p className="text-sm text-gray-500 mb-4">选择您期望的工作地区（可多选）</p>
          <div className="flex flex-wrap gap-2">
            {PROVINCES.map((province) => (
              <button
                key={province.code}
                onClick={() => handleProvinceToggle(province.code)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  preferences.preferredProvinces.includes(province.code)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {province.name}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.acceptRemoteArea}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, acceptRemoteArea: e.target.checked }))
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">接受艰苦边远地区岗位（可享受加分政策）</span>
            </label>
          </div>
        </section>

        {/* 考试类型 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">考试类型偏好</h2>
          <div className="flex flex-wrap gap-2">
            {EXAM_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleExamTypeToggle(type.value)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  preferences.examTypes.includes(type.value)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* 部门类型 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">部门偏好</h2>
          <p className="text-sm text-gray-500 mb-4">选择您感兴趣的部门类型</p>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_TYPES.map((dept) => (
              <button
                key={dept.value}
                onClick={() => handleDepartmentToggle(dept.value)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  preferences.departmentTypes.includes(dept.value)
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.acceptGrassroots}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, acceptGrassroots: e.target.checked }))
                }
                className="rounded border-gray-300"
              />
              <span className="text-sm">接受基层岗位</span>
            </label>
          </div>
        </section>

        {/* 筛选策略 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">匹配策略</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="strategy"
                value="strict"
                checked={preferences.matchStrategy === "strict"}
                onChange={() => setPreferences((prev) => ({ ...prev, matchStrategy: "strict" }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">严格匹配</div>
                <div className="text-sm text-gray-500">只显示完全符合条件的岗位</div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="strategy"
                value="balanced"
                checked={preferences.matchStrategy === "balanced"}
                onChange={() => setPreferences((prev) => ({ ...prev, matchStrategy: "balanced" }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">智能推荐</div>
                <div className="text-sm text-gray-500">综合考虑匹配度和竞争比，推荐最优岗位</div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="strategy"
                value="loose"
                checked={preferences.matchStrategy === "loose"}
                onChange={() => setPreferences((prev) => ({ ...prev, matchStrategy: "loose" }))}
                className="mt-1"
              />
              <div>
                <div className="font-medium">宽松匹配</div>
                <div className="text-sm text-gray-500">显示更多可能符合条件的岗位</div>
              </div>
            </label>
          </div>
        </section>

        {/* 其他设置 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">其他设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最低招录人数</label>
              <select
                value={preferences.minRecruitCount}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, minRecruitCount: Number(e.target.value) }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={1}>不限</option>
                <option value={2}>2人及以上</option>
                <option value={3}>3人及以上</option>
                <option value={5}>5人及以上</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">招录人数越多，竞争可能相对较小</p>
            </div>
          </div>
        </section>

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "保存中..." : "保存设置"}
          </button>
        </div>
      </div>
    </div>
  );
}
