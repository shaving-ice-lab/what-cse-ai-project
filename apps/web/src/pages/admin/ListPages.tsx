import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface ListPage {
  id: number;
  url: string;
  sourceName: string;
  category: string;
  crawlFrequency: string;
  lastCrawlTime: string;
  articleCount: number;
  status: "active" | "inactive" | "error";
}

const MOCK_LIST_PAGES: ListPage[] = [
  {
    id: 1,
    url: "https://www.scs.gov.cn/gwyks/",
    sourceName: "国家公务员局",
    category: "国考",
    crawlFrequency: "每2小时",
    lastCrawlTime: "2024-11-15 14:00",
    articleCount: 156,
    status: "active",
  },
  {
    id: 2,
    url: "https://rsj.beijing.gov.cn/bm/gwyzl/",
    sourceName: "北京人社局",
    category: "省考",
    crawlFrequency: "每6小时",
    lastCrawlTime: "2024-11-15 10:00",
    articleCount: 89,
    status: "active",
  },
  {
    id: 3,
    url: "https://www.gdhrss.gov.cn/gwyksgk/",
    sourceName: "广东人社厅",
    category: "省考",
    crawlFrequency: "每6小时",
    lastCrawlTime: "2024-11-15 08:00",
    articleCount: 234,
    status: "active",
  },
  {
    id: 4,
    url: "https://www.jsrsks.com.cn/",
    sourceName: "江苏人事考试网",
    category: "省考",
    crawlFrequency: "每日",
    lastCrawlTime: "2024-11-14 20:00",
    articleCount: 178,
    status: "inactive",
  },
  {
    id: 5,
    url: "https://www.shsydw.com/",
    sourceName: "上海事业单位",
    category: "事业单位",
    crawlFrequency: "每日",
    lastCrawlTime: "2024-11-15 06:00",
    articleCount: 67,
    status: "error",
  },
];

const STATUS_CONFIG = {
  active: { label: "正常", color: "bg-green-100 text-green-600", icon: CheckCircle },
  inactive: { label: "已停用", color: "bg-gray-100 text-gray-600", icon: XCircle },
  error: { label: "异常", color: "bg-red-100 text-red-600", icon: AlertCircle },
};

export default function AdminListPages() {
  const [listPages, setListPages] = useState<ListPage[]>(MOCK_LIST_PAGES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPage, setNewPage] = useState({
    url: "",
    sourceName: "",
    category: "",
    crawlFrequency: "每日",
  });

  const filteredPages = listPages.filter(
    (p) =>
      p.sourceName.includes(searchTerm) ||
      p.url.includes(searchTerm) ||
      p.category.includes(searchTerm)
  );

  const handleAdd = () => {
    if (!newPage.url || !newPage.sourceName) {
      toast.error("请填写完整信息");
      return;
    }
    const newId = Math.max(...listPages.map((p) => p.id)) + 1;
    setListPages((prev) => [
      ...prev,
      {
        id: newId,
        ...newPage,
        lastCrawlTime: "-",
        articleCount: 0,
        status: "active" as const,
      },
    ]);
    setShowAddModal(false);
    setNewPage({ url: "", sourceName: "", category: "", crawlFrequency: "每日" });
    toast.success("列表页添加成功");
  };

  const handleDelete = (id: number) => {
    if (!confirm("确定要删除这个列表页吗？")) return;
    setListPages((prev) => prev.filter((p) => p.id !== id));
    toast.success("已删除");
  };

  const handleToggleStatus = (id: number) => {
    setListPages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: p.status === "active" ? ("inactive" as const) : ("active" as const),
          };
        }
        return p;
      })
    );
    toast.success("状态已更新");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">监控列表页管理</h1>
          <p className="text-gray-500 mt-1">管理需要监控的公告列表页</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          添加列表页
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索列表页..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                来源
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                频率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                上次爬取
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                文章数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPages.map((page) => {
              const statusConfig = STATUS_CONFIG[page.status];
              return (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{page.sourceName}</p>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      {page.url.substring(0, 40)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                      {page.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{page.crawlFrequency}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{page.lastCrawlTime}</td>
                  <td className="px-6 py-4 text-sm font-medium">{page.articleCount}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(page.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}
                    >
                      <statusConfig.icon className="w-3 h-3" />
                      {statusConfig.label}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded text-gray-500" title="编辑">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-500"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="p-4 border-t text-sm text-gray-500">共 {filteredPages.length} 个列表页</div>
      </div>

      {/* 添加列表页弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">添加监控列表页</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">列表页URL</label>
                <input
                  type="url"
                  value={newPage.url}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">来源名称</label>
                <input
                  type="text"
                  value={newPage.sourceName}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, sourceName: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：国家公务员局"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <select
                  value={newPage.category}
                  onChange={(e) => setNewPage((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">请选择</option>
                  <option value="国考">国考</option>
                  <option value="省考">省考</option>
                  <option value="事业单位">事业单位</option>
                  <option value="选调生">选调生</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">爬取频率</label>
                <select
                  value={newPage.crawlFrequency}
                  onChange={(e) =>
                    setNewPage((prev) => ({ ...prev, crawlFrequency: e.target.value }))
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="每2小时">每2小时</option>
                  <option value="每6小时">每6小时</option>
                  <option value="每日">每日</option>
                  <option value="每周">每周</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
