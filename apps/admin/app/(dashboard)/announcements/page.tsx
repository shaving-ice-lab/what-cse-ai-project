"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  FileText,
  Briefcase,
  Clock,
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
  Tabs,
  TabsList,
  TabsTrigger,
  Skeleton,
  Checkbox,
} from "@what-cse/ui";
import { AnnouncementStatsCards } from "./components/AnnouncementStatsCards";
import { AnnouncementStatsCharts } from "./components/AnnouncementStatsCharts";
import { PositionsManageModal } from "./components/PositionsManageModal";
import { announcementApi } from "@/services/announcement-api";
import type { AnnouncementBrief, AnnouncementQueryParams } from "@/types/announcement";
import {
  AnnouncementStatus,
  AnnouncementStatusNames,
  AnnouncementStatusColors,
  AnnouncementTabs,
  ExamTypeOptions,
} from "@/types/announcement";

export default function AnnouncementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [announcements, setAnnouncements] = useState<AnnouncementBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");

  // 职位管理弹窗状态
  const [positionsModalOpen, setPositionsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // 筛选条件
  const [filters, setFilters] = useState<AnnouncementQueryParams>({
    page: Number(searchParams.get("page")) || 1,
    page_size: Number(searchParams.get("page_size")) || 20,
    keyword: searchParams.get("keyword") || undefined,
    exam_type: searchParams.get("exam_type") || undefined,
    province: searchParams.get("province") || undefined,
    status: searchParams.get("status") ? Number(searchParams.get("status")) : undefined,
    reg_status: (searchParams.get("reg_status") as AnnouncementQueryParams["reg_status"]) || undefined,
    sort_by: (searchParams.get("sort_by") as AnnouncementQueryParams["sort_by"]) || "created_at",
    sort_order: (searchParams.get("sort_order") as AnnouncementQueryParams["sort_order"]) || "desc",
  });

  // 获取当前 Tab 对应的考试类型
  const getExamTypeFromTab = (tab: string): string | undefined => {
    const tabConfig = AnnouncementTabs.find((t) => t.key === tab);
    return tabConfig?.exam_type;
  };

  // 加载数据
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 根据 Tab 设置 exam_type 筛选
      const tabExamType = getExamTypeFromTab(activeTab);
      const queryParams = {
        ...filters,
        exam_type: tabExamType || filters.exam_type,
      };

      // 如果是"其他" Tab，需要排除主要类型
      if (activeTab === "other") {
        // 这里简化处理，实际应该在后端支持排除筛选
        queryParams.exam_type = undefined;
      }

      const data = await announcementApi.getAnnouncements(queryParams);
      setAnnouncements(data.announcements || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取公告列表失败");
      // 使用模拟数据
      setAnnouncements([
        {
          id: 1,
          title: "2025年国家公务员考试公告",
          exam_type: "公务员",
          province: "全国",
          status: 1,
          publish_date: "2024-10-15",
          registration_start: "2024-10-15",
          registration_end: "2024-10-24",
          position_count: 3962,
          recruit_count: 39561,
          created_at: "2024-10-15",
        },
        {
          id: 2,
          title: "2025年北京市公务员考试公告",
          exam_type: "公务员",
          province: "北京",
          status: 1,
          publish_date: "2024-11-01",
          registration_start: "2024-11-01",
          registration_end: "2024-11-10",
          position_count: 1205,
          recruit_count: 4865,
          created_at: "2024-11-01",
        },
        {
          id: 3,
          title: "2025年浙江省事业单位招聘公告",
          exam_type: "事业单位",
          province: "浙江",
          status: 0,
          position_count: 856,
          recruit_count: 2341,
          created_at: "2024-11-20",
        },
        {
          id: 4,
          title: "2025年广东省教师招聘公告",
          exam_type: "教师招聘",
          province: "广东",
          status: 1,
          publish_date: "2024-11-25",
          registration_start: "2024-11-25",
          registration_end: "2024-12-10",
          position_count: 1532,
          recruit_count: 3200,
          created_at: "2024-11-22",
        },
        {
          id: 5,
          title: "2025年山东省医疗卫生招聘公告",
          exam_type: "医疗卫生",
          province: "山东",
          status: 1,
          publish_date: "2024-11-28",
          registration_start: "2024-11-28",
          registration_end: "2024-12-15",
          position_count: 689,
          recruit_count: 1520,
          created_at: "2024-11-28",
        },
      ]);
      setTotal(5);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, activeTab, router]);

  // 处理搜索
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: searchTerm || undefined, page: 1 }));
  };

  // 处理 Tab 切换
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, page: 1 }));
    setSelectedIds([]);
  };

  // 处理快捷筛选
  const handleQuickFilter = (quickFilter: Partial<AnnouncementQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...quickFilter, page: 1 }));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // 处理状态变更
  const handleStatusChange = async (id: number, newStatus: number) => {
    try {
      await announcementApi.updateAnnouncementStatus(id, newStatus);
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新状态失败");
    }
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个公告吗？")) return;
    try {
      await announcementApi.deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条公告吗？`)) return;
    try {
      await announcementApi.batchDelete(selectedIds);
      setSelectedIds([]);
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "批量删除失败");
    }
  };

  // 处理批量状态更新
  const handleBatchStatusChange = async (status: number) => {
    if (selectedIds.length === 0) return;
    try {
      await announcementApi.batchUpdateStatus(selectedIds, status);
      setSelectedIds([]);
      fetchAnnouncements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "批量更新状态失败");
    }
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(announcements.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 单选
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  // 打开职位管理弹窗
  const handleOpenPositionsModal = (announcement: { id: number; title: string }) => {
    setSelectedAnnouncement(announcement);
    setPositionsModalOpen(true);
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN");
  };

  // 计算报名状态
  const getRegStatus = (item: AnnouncementBrief) => {
    if (!item.registration_start || !item.registration_end) return null;
    const now = new Date();
    const start = new Date(item.registration_start);
    const end = new Date(item.registration_end);
    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "registering";
  };

  // 状态徽章
  const getStatusBadge = (status: number) => {
    const name = AnnouncementStatusNames[status as AnnouncementStatus] || "未知";
    const colorClass = AnnouncementStatusColors[status as AnnouncementStatus] || "bg-gray-100 text-gray-700";
    return (
      <Badge variant="secondary" className={colorClass}>
        {name}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));
  const currentPage = filters.page || 1;
  const isAllSelected = announcements.length > 0 && selectedIds.length === announcements.length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">公告管理</h1>
          <p className="text-muted-foreground">管理考试公告和招录信息，支持分类筛选和批量操作</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchAnnouncements} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button asChild>
            <Link href="/announcements/create">
              <Plus className="mr-2 h-4 w-4" />
              发布公告
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <AnnouncementStatsCards onFilterChange={handleQuickFilter} />

      {/* 统计图表 */}
      <AnnouncementStatsCharts
        onProvinceSelect={(province) => {
          setFilters((prev) => ({ ...prev, province, page: 1 }));
        }}
        onMonthSelect={(month) => {
          // 设置时间范围筛选
          const startDate = `${month}-01`;
          const endDate = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]), 0)
            .toISOString()
            .split("T")[0];
          setFilters((prev) => ({
            ...prev,
            start_date: startDate,
            end_date: endDate,
            page: 1,
          }));
        }}
      />

      {/* Tab 分类 */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-6">
          {AnnouncementTabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 筛选和数据表格 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {/* 搜索框 */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索公告标题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>搜索</Button>

              {/* 状态筛选 */}
              <Select
                value={String(filters.status ?? "all")}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: v === "all" ? undefined : Number(v),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="1">已发布</SelectItem>
                  <SelectItem value="0">草稿</SelectItem>
                  <SelectItem value="2">已下线</SelectItem>
                </SelectContent>
              </Select>

              {/* 报名状态筛选 */}
              <Select
                value={filters.reg_status || "all"}
                onValueChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    reg_status: v === "all" ? undefined : (v as AnnouncementQueryParams["reg_status"]),
                    page: 1,
                  }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="报名状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="registering">报名中</SelectItem>
                  <SelectItem value="upcoming">即将开始</SelectItem>
                  <SelectItem value="ended">已结束</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 批量操作 */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  已选 {selectedIds.length} 项
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchStatusChange(AnnouncementStatus.Published)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  批量发布
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  批量删除
                </Button>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-4 bg-amber-50 text-amber-700 rounded-lg flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {error}（显示模拟数据）
            </div>
          )}

          {/* 表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead className="hidden md:table-cell">类型</TableHead>
                  <TableHead className="hidden lg:table-cell">地区</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden xl:table-cell">职位/招录</TableHead>
                  <TableHead className="hidden lg:table-cell">报名时间</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : announcements.length > 0 ? (
                  announcements.map((item) => {
                    const regStatus = getRegStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectOne(item.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <Link
                              href={`/announcements/${item.id}`}
                              className="font-medium hover:text-primary line-clamp-2"
                            >
                              {item.title}
                            </Link>
                            {item.source_url && (
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                原文链接
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline">{item.exam_type || "-"}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.province || "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                              {item.position_count || 0}
                            </span>
                            <span className="flex items-center gap-1 text-blue-600">
                              <FileText className="h-3.5 w-3.5" />
                              {item.recruit_count || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.registration_start && item.registration_end ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(item.registration_start)} ~ {formatDate(item.registration_end)}
                              </div>
                              {regStatus === "registering" && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  报名中
                                </Badge>
                              )}
                              {regStatus === "upcoming" && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 mt-1">
                                  即将开始
                                </Badge>
                              )}
                              {regStatus === "ended" && (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500 mt-1">
                                  已结束
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
                                <Link href={`/announcements/${item.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看详情
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/announcements/${item.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenPositionsModal({ id: item.id, title: item.title })}
                              >
                                <Briefcase className="mr-2 h-4 w-4" />
                                管理关联职位
                              </DropdownMenuItem>
                              {item.status === AnnouncementStatus.Draft && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(item.id, AnnouncementStatus.Published)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  发布
                                </DropdownMenuItem>
                              )}
                              {item.status === AnnouncementStatus.Published && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange(item.id, AnnouncementStatus.Offline)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  下线
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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
              共 <span className="font-medium">{total}</span> 条记录
              {totalPages > 1 && (
                <span className="ml-2">
                  第 {currentPage}/{totalPages} 页
                </span>
              )}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 职位管理弹窗 */}
      {selectedAnnouncement && (
        <PositionsManageModal
          open={positionsModalOpen}
          onOpenChange={setPositionsModalOpen}
          announcementId={selectedAnnouncement.id}
          announcementTitle={selectedAnnouncement.title}
          onSuccess={fetchAnnouncements}
        />
      )}
    </div>
  );
}
