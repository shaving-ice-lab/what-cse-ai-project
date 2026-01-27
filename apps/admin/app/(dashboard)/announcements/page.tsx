"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
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

interface Announcement {
  id: number;
  title: string;
  type: string;
  status: string;
  publish_date: string;
  created_at: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "2025年国家公务员考试公告",
    type: "国考",
    status: "published",
    publish_date: "2024-10-15",
    created_at: "2024-10-15",
  },
  {
    id: 2,
    title: "2025年北京市公务员考试公告",
    type: "省考",
    status: "published",
    publish_date: "2024-11-01",
    created_at: "2024-11-01",
  },
  {
    id: 3,
    title: "2025年浙江省公务员考试公告",
    type: "省考",
    status: "draft",
    publish_date: "",
    created_at: "2024-11-20",
  },
  {
    id: 4,
    title: "2025年广东省公务员考试公告",
    type: "省考",
    status: "published",
    publish_date: "2024-11-25",
    created_at: "2024-11-22",
  },
  {
    id: 5,
    title: "2025年山东省公务员考试公告",
    type: "省考",
    status: "draft",
    publish_date: "",
    created_at: "2024-11-28",
  },
];

export default function AnnouncementsPage() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge>已发布</Badge>;
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
          <h1 className="text-2xl font-bold tracking-tight">公告管理</h1>
          <p className="text-muted-foreground">管理考试公告和招录信息</p>
        </div>
        <Button asChild>
          <Link href="/announcements/create">
            <Plus className="mr-2 h-4 w-4" />
            发布公告
          </Link>
        </Button>
      </div>

      {/* 筛选和数据表格 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索公告..."
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
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="国考">国考</SelectItem>
                  <SelectItem value="省考">省考</SelectItem>
                  <SelectItem value="事业编">事业编</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden md:table-cell">发布日期</TableHead>
                  <TableHead className="hidden lg:table-cell">创建时间</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium max-w-[300px] truncate" title={item.title}>
                          {item.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.publish_date ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {item.publish_date}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {item.created_at}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              预览
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      没有找到匹配的公告
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between px-2 py-4">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium">{filteredAnnouncements.length}</span> 条记录
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
