import { useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronRight, ChevronDown, MapPin } from "lucide-react";
import { toast } from "@/components/ui/toaster";

interface Region {
  id: number;
  code: string;
  name: string;
  level: number;
  parentId: number | null;
  children?: Region[];
  expanded?: boolean;
}

const MOCK_REGIONS: Region[] = [
  {
    id: 1,
    code: "110000",
    name: "北京市",
    level: 1,
    parentId: null,
    expanded: true,
    children: [
      {
        id: 11,
        code: "110100",
        name: "北京市",
        level: 2,
        parentId: 1,
        children: [
          { id: 111, code: "110101", name: "东城区", level: 3, parentId: 11 },
          { id: 112, code: "110102", name: "西城区", level: 3, parentId: 11 },
          { id: 113, code: "110105", name: "朝阳区", level: 3, parentId: 11 },
          { id: 114, code: "110106", name: "丰台区", level: 3, parentId: 11 },
          { id: 115, code: "110108", name: "海淀区", level: 3, parentId: 11 },
        ],
      },
    ],
  },
  {
    id: 2,
    code: "310000",
    name: "上海市",
    level: 1,
    parentId: null,
    expanded: false,
    children: [{ id: 21, code: "310100", name: "上海市", level: 2, parentId: 2 }],
  },
  {
    id: 3,
    code: "440000",
    name: "广东省",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      { id: 31, code: "440100", name: "广州市", level: 2, parentId: 3 },
      { id: 32, code: "440300", name: "深圳市", level: 2, parentId: 3 },
      { id: 33, code: "440400", name: "珠海市", level: 2, parentId: 3 },
    ],
  },
  {
    id: 4,
    code: "320000",
    name: "江苏省",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      { id: 41, code: "320100", name: "南京市", level: 2, parentId: 4 },
      { id: 42, code: "320200", name: "无锡市", level: 2, parentId: 4 },
      { id: 43, code: "320500", name: "苏州市", level: 2, parentId: 4 },
    ],
  },
  {
    id: 5,
    code: "330000",
    name: "浙江省",
    level: 1,
    parentId: null,
    expanded: false,
    children: [
      { id: 51, code: "330100", name: "杭州市", level: 2, parentId: 5 },
      { id: 52, code: "330200", name: "宁波市", level: 2, parentId: 5 },
    ],
  },
];

export default function AdminDictionaryRegions() {
  const [regions, setRegions] = useState<Region[]>(MOCK_REGIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Region | null>(null);

  const toggleExpand = (id: number) => {
    const updateExpanded = (items: Region[]): Region[] => {
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
    setRegions(updateExpanded(regions));
  };

  const handleDelete = (name: string) => {
    if (!confirm(`确定要删除"${name}"吗？`)) return;
    toast.success("已删除");
  };

  const renderRegionTree = (items: Region[], depth = 0) => {
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
              <MapPin
                className={`w-4 h-4 ${item.level === 1 ? "text-red-500" : item.level === 2 ? "text-blue-500" : "text-gray-400"}`}
              />
              <span className="text-gray-400 text-sm">{item.code}</span>
              <span
                className={`font-medium ${item.level === 1 ? "text-gray-800" : item.level === 2 ? "text-gray-700" : "text-gray-600"}`}
              >
                {item.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  item.level === 1
                    ? "bg-red-100 text-red-600"
                    : item.level === 2
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.level === 1 ? "省/直辖市" : item.level === 2 ? "市" : "区/县"}
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
                onClick={() => handleDelete(item.name)}
                className="p-1.5 hover:bg-red-100 rounded text-red-500"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && renderRegionTree(item.children!, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">地区词典</h1>
          <p className="text-gray-500 mt-1">管理省市区行政区划数据</p>
        </div>
        <button
          onClick={() => {
            setSelectedParent(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          添加省/直辖市
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索地区..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="text-sm text-gray-500">共 {regions.length} 个省/直辖市</div>
        </div>

        <div className="divide-y max-h-[600px] overflow-y-auto">{renderRegionTree(regions)}</div>
      </div>

      {/* 添加弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedParent ? `添加"${selectedParent.name}"下级地区` : "添加省/直辖市"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">行政区划代码</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：110000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="例如：北京市"
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
