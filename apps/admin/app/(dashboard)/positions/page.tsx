"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@what-cse/ui";

interface Position {
  id: number;
  name: string;
  department: string;
  location: string;
  exam_type: string;
  status: string;
  created_at: string;
}

const mockPositions: Position[] = [
  {
    id: 1,
    name: "科员（一）",
    department: "国家税务总局北京市税务局",
    location: "北京",
    exam_type: "国考",
    status: "published",
    created_at: "2024-10-15",
  },
  {
    id: 2,
    name: "综合管理岗",
    department: "海关总署广州海关",
    location: "广州",
    exam_type: "国考",
    status: "published",
    created_at: "2024-10-18",
  },
  {
    id: 3,
    name: "信息技术岗",
    department: "财政部驻北京专员办",
    location: "北京",
    exam_type: "国考",
    status: "pending",
    created_at: "2024-10-20",
  },
  {
    id: 4,
    name: "法律事务岗",
    department: "司法部",
    location: "北京",
    exam_type: "国考",
    status: "published",
    created_at: "2024-10-22",
  },
  {
    id: 5,
    name: "会计岗",
    department: "审计署",
    location: "上海",
    exam_type: "国考",
    status: "draft",
    created_at: "2024-10-25",
  },
];

export default function AdminPositionsPage() {
  const [positions] = useState<Position[]>(mockPositions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [examTypeFilter, setExamTypeFilter] = useState("all");

  const filteredPositions = positions.filter((position) => {
    const matchesSearch =
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || position.status === statusFilter;
    const matchesExamType = examTypeFilter === "all" || position.exam_type === examTypeFilter;
    return matchesSearch && matchesStatus && matchesExamType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge>已发布</Badge>;
      case "pending":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
            待审核
          </Badge>
        );
      case "draft":
        return <Badge variant="outline">草稿</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">职位管理</h1>
          <p className="text-muted-foreground">管理所有职位信息</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/positions/pending">
              <Clock className="mr-2 h-4 w-4" />
              待审核
              <Badge variant="secondary" className="ml-2">
                3
              </Badge>
            </Link>
          </Button>
        </div>
      </div>

      {/* 筛选和操作栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索职位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="published">已发布</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="考试类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="国考">国考</SelectItem>
                  <SelectItem value="省考">省考</SelectItem>
                  <SelectItem value="事业编">事业编</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>职位名称</TableHead>
                  <TableHead className="hidden md:table-cell">部门</TableHead>
                  <TableHead>地点</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden lg:table-cell">创建时间</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPositions.length > 0 ? (
                  filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div className="font-medium">{position.name}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                          {position.department.slice(0, 20)}...
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px]">
                        <span className="truncate block" title={position.department}>
                          {position.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{position.exam_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(position.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {position.created_at}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">操作</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/positions/${position.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                查看
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      没有找到匹配的职位
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium">{filteredPositions.length}</span> 条记录
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
