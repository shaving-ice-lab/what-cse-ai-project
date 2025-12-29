import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload } from "lucide-react";
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

export default function AdminAnnouncementCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    examType: "",
    announcementType: "",
    province: "",
    city: "",
    sourceUrl: "",
    sourceName: "",
    publishDate: "",
    content: "",
    attachmentUrls: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title) {
      toast.error("请输入公告标题");
      return;
    }
    if (!form.examType) {
      toast.error("请选择考试类型");
      return;
    }
    if (!form.content) {
      toast.error("请输入公告内容");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("公告创建成功");
      navigate("/admin/announcements");
    } catch {
      toast.error("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/announcements" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">添加公告</h1>
          <p className="text-gray-500 mt-1">创建新的招考公告</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">基本信息</h3>
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
                placeholder="请输入公告标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                考试类型 <span className="text-red-500">*</span>
              </label>
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
                placeholder="请输入省份"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">城市</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="请输入城市"
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
                placeholder="例如：国家公务员局"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">原始链接</label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="https://"
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
            placeholder="请输入公告正文内容..."
          />
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">附件</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">点击或拖拽文件到此处上传</p>
            <p className="text-xs text-gray-400">支持 PDF、Excel、Word 格式，单个文件不超过 50MB</p>
            <input type="file" className="hidden" multiple />
            <button type="button" className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50">
              选择文件
            </button>
          </div>
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
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </div>
  );
}
