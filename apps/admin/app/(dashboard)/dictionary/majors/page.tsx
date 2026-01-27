"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  MoreHorizontal,
  BookOpen,
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
  {
    id: 4,
    code: "03",
    name: "法学",
    expanded: false,
    majors: [
      { id: 8, code: "0301", name: "法学" },
      { id: 9, code: "0302", name: "政治学" },
    ],
  },
];

export default function MajorsDictionaryPage() {
  const [categories, setCategories] = useState<MajorCategory[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleCategory = (id: number) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, expanded: !cat.expanded } : cat))
    );
  };

  const totalMajors = categories.reduce((sum, cat) => sum + cat.majors.length, 0);

  const filteredCategories = categories.filter((cat) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      cat.name.toLowerCase().includes(searchLower) ||
      cat.code.includes(searchTerm) ||
      cat.majors.some(
        (m) => m.name.toLowerCase().includes(searchLower) || m.code.includes(searchTerm)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">专业字典</h1>
          <p className="text-muted-foreground">管理专业分类和专业列表</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加专业
        </Button>
      </div>

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">专业门类</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">专业总数</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMajors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均专业数</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalMajors / categories.length).toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 专业列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>专业分类</CardTitle>
              <CardDescription>点击分类展开查看具体专业</CardDescription>
            </div>
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索专业..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <Collapsible
                key={category.id}
                open={category.expanded}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <div className="rounded-lg border">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {category.expanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge variant="outline" className="font-mono">
                          {category.code}
                        </Badge>
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {category.majors.length}
                        </Badge>
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
                            添加专业
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑分类
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除分类
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30">
                      {category.majors.map((major) => (
                        <div
                          key={major.id}
                          className="flex items-center justify-between px-4 py-2.5 pl-12 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {major.code}
                            </Badge>
                            <span className="text-sm">{major.name}</span>
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
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
