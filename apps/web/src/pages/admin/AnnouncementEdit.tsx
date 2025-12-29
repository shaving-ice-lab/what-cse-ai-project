import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toaster";

const EXAM_TYPES = ["国考", "省考", "事业单位", "选调生"];
const ANNOUNCEMENT_TYPES = [
  "招录公告",
  "报名统计",
  "笔试公告",
  "成绩公告",
  "面试公告",
  "体检公告",
  "拟录用公示",
];

interface Announcement {
  id: number;
  title: string;
  examType: string;
  announcementType: string;
  province: string;
  city: string;
  sourceUrl: string;
  sourceName: string;
  publishDate: string;
  content: string;
  status: number;
}

const MOCK_ANNOUNCEMENT: Announcement = {
  id: 1,
  title: "2024年国家公务员考试公告",
  examType: "国考",
  announcementType: "招录公告",
  province: "",
  city: "",
  sourceUrl: "https://www.scs.gov.cn/...",
  sourceName: "国家公务员局",
  publishDate: "2024-10-15",
  content:
    "根据公务员法和《公务员录用规定》等法律法规，国家公务员局将组织实施中央机关及其直属机构2024年度考试录用一级主任科员及以下和其他相当职级层次公务员工作，现将有关事项公告如下...",
  status: 1,
};

export default function AdminAnnouncementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Announcement>({ ...MOCK_ANNOUNCEMENT, id: Number(id) || 1 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title) {
      toast.error("请输入公告标题");
      return;
    }
    if (!form.content) {
      toast.error("请输入公告内容");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("保存成功");
      navigate("/admin/announcements");
    } catch {
      toast.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这条公告吗？此操作不可恢复。")) {
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("公告已删除");
      navigate("/admin/announcements");
    } catch {
      toast.error("删除失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/announcements" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">编辑公告</h1>
            <p className="text-gray-500 mt-1">公告ID: {id}</p>
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          删除公告
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">基本信息</h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                form.status === 1 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
              }`}
            >
              {form.status === 1 ? "已发布" : "未发布"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                公告标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
              <select
                value={form.examType}
                onChange={(e) => setForm((prev) => ({ ...prev, examType: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择</option>
                {EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">公告类型</label>
              <select
                value={form.announcementType}
                onChange={(e) => setForm((prev) => ({ ...prev, announcementType: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">请选择</option>
                {ANNOUNCEMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">省份</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">发布日期</label>
              <input
                type="date"
                value={form.publishDate}
                onChange={(e) => setForm((prev) => ({ ...prev, publishDate: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">来源信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">来源网站</label>
              <input
                type="text"
                value={form.sourceName}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceName: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原始链接</label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            公告内容 <span className="text-red-500">*</span>
          </h3>
          <textarea
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            rows={15}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/admin/announcements" className="px-6 py-2 border rounded-lg hover:bg-gray-50">
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "保存中..." : "保存修改"}
          </button>
        </div>
      </form>
    </div>
  );
}
