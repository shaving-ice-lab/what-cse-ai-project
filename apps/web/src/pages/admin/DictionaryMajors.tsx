import { useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface MajorCategory {
  id: number;
  code: string;
  name: string;
  level: number;
  parentId: number | null;
  children?: MajorCategory[];
  expanded?: boolean;
}

const MOCK_MAJORS: MajorCategory[] = [
  {
    id: 1,
    code: "01",
    name: "哲学",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      {
        id: 11,
        code: "0101",
        name: "哲学类",
        level: 2,
        parentId: 1,
        children: [
          { id: 111, code: "010101", name: "哲学", level: 3, parentId: 11 },
          { id: 112, code: "010102", name: "逻辑学", level: 3, parentId: 11 },
          { id: 113, code: "010103", name: "宗教学", level: 3, parentId: 11 },
        ],
      },
    ],
  },
  {
    id: 2,
    code: "02",
    name: "经济学",
    level: 1,
    parentId: null,
    expanded: true,
    children: [
      {
        id: 21,
        code: "0201",
        name: "经济学类",
        level: 2,
        parentId: 2,
        children: [
          { id: 211, code: "020101", name: "经济学", level: 3, parentId: 21 },
          { id: 212, code: "020102", name: "经济统计学", level: 3, parentId: 21 },
        ],
      },
      {
        id: 22,
        code: "0202",
        name: "财政学类",
        level: 2,
        parentId: 2,
        children: [
          { id: 221, code: "020201", name: "财政学", level: 3, parentId: 22 },
          { id: 222, code: "020202", name: "税收学", level: 3, parentId: 22 },
        ],
      },
      {
        id: 23,
        code: "0203",
        name: "金融学类",
        level: 2,
        parentId: 2,
        children: [
          { id: 231, code: "020301", name: "金融学", level: 3, parentId: 23 },
          { id: 232, code: "020302", name: "金融工程", level: 3, parentId: 23 },
          { id: 233, code: "020303", name: "保险学", level: 3, parentId: 23 },
        ],
      },
    ],
  },
  {
    id: 3,
    code: "03",
    name: "法学",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      { id: 31, code: "0301", name: "法学类", level: 2, parentId: 3 },
      { id: 32, code: "0302", name: "政治学类", level: 2, parentId: 3 },
      { id: 33, code: "0303", name: "社会学类", level: 2, parentId: 3 },
    ],
  },
  {
    id: 4,
    code: "08",
    name: "工学",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      {
        id: 41,
        code: "0809",
        name: "计算机类",
        level: 2,
        parentId: 4,
        children: [
          { id: 411, code: "080901", name: "计算机科学与技术", level: 3, parentId: 41 },
          { id: 412, code: "080902", name: "软件工程", level: 3, parentId: 41 },
          { id: 413, code: "080903", name: "网络工程", level: 3, parentId: 41 },
        ],
      },
    ],
  },
  {
    id: 5,
    code: "12",
    name: "管理学",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      { id: 51, code: "1201", name: "管理科学与工程类", level: 2, parentId: 5 },
      { id: 52, code: "1202", name: "工商管理类", level: 2, parentId: 5 },
      { id: 53, code: "1204", name: "公共管理类", level: 2, parentId: 5 },
    ],
  },
];

export default function AdminDictionaryMajors() {
  const [majors, setMajors] = useState<MajorCategory[]>(MOCK_MAJORS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<MajorCategory | null>(null);

  const toggleExpand = (id: number) => {
    const updateExpanded = (items: MajorCategory[]): MajorCategory[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: updateExpanded(item.children) };
        }
        return item;
      });
    };
    setMajors(updateExpanded(majors));
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`确定要删除"${name}"吗？`)) return;
    toast.success("已删除");
  };

  const renderMajorTree = (items: MajorCategory[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = item.expanded;

      return (
        <div key={item.id}>
          <div
            className={`flex items-center justify-between py-2 px-4 hover:bg-gray-50 ${depth > 0 ? "border-l-2 border-gray-200" : ""}`}
            style={{ paddingLeft: `${depth * 24 + 16}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <span className="text-gray-400 text-sm">{item.code}</span>
              <span
                className={`font-medium ${item.level === 1 ? "text-gray-800" : item.level === 2 ? "text-gray-700" : "text-gray-600"}`}
              >
                {item.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  item.level === 1
                    ? "bg-blue-100 text-blue-600"
                    : item.level === 2
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.level === 1 ? "学科门类" : item.level === 2 ? "专业类" : "专业"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedParent(item);
                  setShowAddModal(true);
                }}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                title="添加子项"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="编辑">
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id, item.name)}
                className="p-1.5 hover:bg-red-100 rounded text-red-500"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderMajorTree(item.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">专业词典</h1>
          <p className="text-gray-500 mt-1">管理专业分类数据</p>
        </div>
        <button
          onClick={() => {
            setSelectedParent(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          添加学科门类
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索专业..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">共 {majors.length} 个学科门类</div>
        </div>

        <div className="divide-y">{renderMajorTree(majors)}</div>
      </div>

      {/* 添加弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedParent ? `添加"${selectedParent.name}"子项` : "添加学科门类"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代码</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：哲学"
                />
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
                onClick={() => {
                  setShowAddModal(false);
                  toast.success("添加成功");
                }}
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
