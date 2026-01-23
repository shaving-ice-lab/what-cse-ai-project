"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronRight, ChevronDown } from "lucide-react";

interface MajorCategory {
  id: number;
  code: string;
  name: string;
  expanded?: boolean;
  majors: { id: number; code: string; name: string }[];
}

const mockCategories: MajorCategory[] = [
  {
    id: 1,
    code: "08",
    name: "工学",
    expanded: true,
    majors: [
      { id: 1, code: "0801", name: "计算机科学与技术" },
      { id: 2, code: "0802", name: "软件工程" },
      { id: 3, code: "0803", name: "电子信息工程" },
    ],
  },
  {
    id: 2,
    code: "12",
    name: "管理学",
    expanded: false,
    majors: [
      { id: 4, code: "1201", name: "管理科学与工程" },
      { id: 5, code: "1202", name: "工商管理" },
    ],
  },
  {
    id: 3,
    code: "02",
    name: "经济学",
    expanded: false,
    majors: [
      { id: 6, code: "0201", name: "经济学" },
      { id: 7, code: "0202", name: "金融学" },
    ],
  },
];

export default function MajorsDictionaryPage() {
  const [categories, setCategories] = useState<MajorCategory[]>(mockCategories);

  const toggleCategory = (id: number) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, expanded: !cat.expanded } : cat))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">专业字典</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>添加专业</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索专业..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="divide-y">
          {categories.map((category) => (
            <div key={category.id}>
              <div
                onClick={() => toggleCategory(category.id)}
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {category.expanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="font-mono text-gray-500">{category.code}</span>
                  <span className="font-medium text-gray-800">{category.name}</span>
                  <span className="text-sm text-gray-400">({category.majors.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              {category.expanded && (
                <div className="bg-gray-50 border-t">
                  {category.majors.map((major) => (
                    <div
                      key={major.id}
                      className="flex items-center justify-between px-6 py-3 pl-14 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-gray-500">{major.code}</span>
                        <span className="text-gray-700">{major.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
