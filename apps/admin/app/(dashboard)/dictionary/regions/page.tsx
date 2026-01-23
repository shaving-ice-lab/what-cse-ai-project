"use client";

import { useState } from "react";
import { Search, Plus, Edit, Trash2, ChevronRight, ChevronDown, MapPin } from "lucide-react";

interface Region {
  id: number;
  code: string;
  name: string;
  expanded?: boolean;
  children?: { id: number; code: string; name: string }[];
}

const mockRegions: Region[] = [
  {
    id: 1,
    code: "11",
    name: "北京市",
    expanded: true,
    children: [
      { id: 11, code: "1101", name: "东城区" },
      { id: 12, code: "1102", name: "西城区" },
      { id: 13, code: "1103", name: "朝阳区" },
      { id: 14, code: "1104", name: "海淀区" },
    ],
  },
  {
    id: 2,
    code: "31",
    name: "上海市",
    expanded: false,
    children: [
      { id: 21, code: "3101", name: "黄浦区" },
      { id: 22, code: "3102", name: "徐汇区" },
    ],
  },
  {
    id: 3,
    code: "33",
    name: "浙江省",
    expanded: false,
    children: [
      { id: 31, code: "3301", name: "杭州市" },
      { id: 32, code: "3302", name: "宁波市" },
    ],
  },
];

export default function RegionsDictionaryPage() {
  const [regions, setRegions] = useState<Region[]>(mockRegions);

  const toggleRegion = (id: number) => {
    setRegions(regions.map((reg) => (reg.id === id ? { ...reg, expanded: !reg.expanded } : reg)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">地区字典</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>添加地区</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索地区..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="divide-y">
          {regions.map((region) => (
            <div key={region.id}>
              <div
                onClick={() => toggleRegion(region.id)}
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {region.children && region.children.length > 0 ? (
                    region.expanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-mono text-gray-500">{region.code}</span>
                  <span className="font-medium text-gray-800">{region.name}</span>
                  {region.children && (
                    <span className="text-sm text-gray-400">({region.children.length})</span>
                  )}
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
              {region.expanded && region.children && (
                <div className="bg-gray-50 border-t">
                  {region.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between px-6 py-3 pl-14 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-gray-500">{child.code}</span>
                        <span className="text-gray-700">{child.name}</span>
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
