"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  MapPin,
  MoreHorizontal,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@what-cse/ui";

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
  {
    id: 4,
    code: "44",
    name: "广东省",
    expanded: false,
    children: [
      { id: 41, code: "4401", name: "广州市" },
      { id: 42, code: "4402", name: "深圳市" },
    ],
  },
];

export default function RegionsDictionaryPage() {
  const [regions, setRegions] = useState<Region[]>(mockRegions);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRegion = (id: number) => {
    setRegions(
      regions.map((reg) => (reg.id === id ? { ...reg, expanded: !reg.expanded } : reg))
    );
  };

  const totalChildren = regions.reduce(
    (sum, reg) => sum + (reg.children?.length || 0),
    0
  );

  const filteredRegions = regions.filter((reg) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      reg.name.toLowerCase().includes(searchLower) ||
      reg.code.includes(searchTerm) ||
      reg.children?.some(
        (c) =>
          c.name.toLowerCase().includes(searchLower) || c.code.includes(searchTerm)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">地区字典</h1>
          <p className="text-muted-foreground">管理省市区行政区划</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加地区
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">省级区域</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">市级区域</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChildren}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均下辖数</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalChildren / regions.length).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 地区列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>行政区划</CardTitle>
              <CardDescription>点击省份展开查看下级区域</CardDescription>
            </div>
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索地区..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredRegions.map((region) => (
              <Collapsible
                key={region.id}
                open={region.expanded}
                onOpenChange={() => toggleRegion(region.id)}
              >
                <div className="rounded-lg border">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {region.children && region.children.length > 0 ? (
                          region.expanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )
                        ) : (
                          <div className="w-4" />
                        )}
                        <MapPin className="h-4 w-4 text-primary" />
                        <Badge variant="outline" className="font-mono">
                          {region.code}
                        </Badge>
                        <span className="font-medium">{region.name}</span>
                        {region.children && (
                          <Badge variant="secondary" className="ml-2">
                            {region.children.length}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Plus className="mr-2 h-4 w-4" />
                            添加下级
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑地区
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除地区
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CollapsibleTrigger>
                  {region.children && region.children.length > 0 && (
                    <CollapsibleContent>
                      <div className="border-t bg-muted/30">
                        {region.children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between px-4 py-2.5 pl-14 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs">
                                {child.code}
                              </Badge>
                              <span className="text-sm">{child.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  )}
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
