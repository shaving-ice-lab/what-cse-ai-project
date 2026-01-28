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
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  ArrowUpDown,
  PanelRightClose,
  PanelRightOpen,
  Scale,
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
  Skeleton,
  Sheet,
  SheetContent,
  SheetTrigger,
  Checkbox,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@what-cse/ui";
import { PositionStatsCards } from "./components/PositionStatsCards";
import { PositionFilters } from "./components/PositionFilters";
import { PositionDetailPanel } from "./components/PositionDetailPanel";
import { CompareBar } from "./components/CompareBar";
import { positionApi } from "@/services/position-api";
import type { PositionBrief, PositionQueryParams, PositionListResponse } from "@/types/position";
import { PositionStatus, PositionStatusNames, PositionStatusColors } from "@/types/position";

export default function AdminPositionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [positions, setPositions] = useState<PositionBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  
  // 详情预览面板状态
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  
  // 对比列表状态
  const [compareList, setCompareList] = useState<PositionBrief[]>([]);
  const MAX_COMPARE_COUNT = 5;

  // 筛选条件
  const [filters, setFilters] = useState<PositionQueryParams>({
    page: Number(searchParams.get("page")) || 1,
    page_size: Number(searchParams.get("page_size")) || 20,
    keyword: searchParams.get("keyword") || undefined,
    province: searchParams.get("province") || undefined,
    city: searchParams.get("city") || undefined,
    education: searchParams.get("education") || undefined,
    exam_type: searchParams.get("exam_type") || undefined,
    department_level: searchParams.get("department_level") || undefined,
    status: searchParams.get("status") ? Number(searchParams.get("status")) : undefined,
    sort_by: (searchParams.get("sort_by") as PositionQueryParams["sort_by"]) || "created_at",
    sort_order: (searchParams.get("sort_order") as PositionQueryParams["sort_order"]) || "desc",
  });

  // 加载数据
  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await positionApi.getPositions(filters);
      setPositions(data.positions || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取职位列表失败");
      setPositions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // 更新 URL 参数
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // 处理搜索
  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, keyword: searchTerm || undefined, page: 1 }));
  };

  // 处理筛选条件变更
  const handleFiltersChange = (newFilters: PositionQueryParams) => {
    setFilters(newFilters);
  };

  // 处理快捷筛选
  const handleQuickFilter = (quickFilter: Partial<PositionQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...quickFilter, page: 1 }));
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      page_size: 20,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  // 处理排序
  const handleSortChange = (sortBy: PositionQueryParams["sort_by"]) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // 处理删除
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个职位吗？")) return;
    try {
      await positionApi.deletePosition(id);
      fetchPositions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 处理状态更新
  const handleStatusChange = async (id: number, status: number) => {
    try {
      await positionApi.updatePositionStatus(id, status);
      fetchPositions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新状态失败");
    }
  };

  // 处理选中职位（预览详情）
  const handleSelectPosition = (id: number) => {
    setSelectedPositionId(id);
    setIsDetailPanelOpen(true);
  };

  // 关闭详情面板
  const handleCloseDetailPanel = () => {
    setSelectedPositionId(null);
    setIsDetailPanelOpen(false);
  };

  // 切换详情面板显示
  const toggleDetailPanel = () => {
    setIsDetailPanelOpen(!isDetailPanelOpen);
  };

  // 添加到对比列表
  const handleAddToCompare = (position: PositionBrief) => {
    if (compareList.length >= MAX_COMPARE_COUNT) {
      alert(`最多只能对比 ${MAX_COMPARE_COUNT} 个职位`);
      return;
    }
    if (compareList.some((p) => p.id === position.id)) {
      return;
    }
    setCompareList((prev) => [...prev, position]);
  };

  // 添加到对比列表（通过ID）
  const handleAddToCompareById = (id: number) => {
    const position = positions.find((p) => p.id === id);
    if (position) {
      handleAddToCompare(position);
    }
  };

  // 从对比列表移除
  const handleRemoveFromCompare = (id: number) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  // 清空对比列表
  const handleClearCompare = () => {
    setCompareList([]);
  };

  // 切换对比选择
  const handleToggleCompare = (position: PositionBrief) => {
    if (compareList.some((p) => p.id === position.id)) {
      handleRemoveFromCompare(position.id);
    } else {
      handleAddToCompare(position);
    }
  };

  // 判断是否在对比列表中
  const isInCompareList = (id: number) => {
    return compareList.some((p) => p.id === id);
  };

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN");
  };

  // 计算截止天数
  const getDaysUntilDeadline = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const now = new Date();
    const endDate = new Date(endDateStr);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 状态徽章
  const getStatusBadge = (status: number) => {
    const name = PositionStatusNames[status as PositionStatus] || "未知";
    const colorClass = PositionStatusColors[status as PositionStatus] || "bg-gray-100 text-gray-700";
    return (
      <Badge variant="secondary" className={colorClass}>
        {name}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">职位管理</h1>
          <p className="text-muted-foreground">管理所有职位信息，支持多维度筛选和批量操作</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPositions} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button variant="outline" asChild>
            <Link href="/positions/pending">
              <Clock className="mr-2 h-4 w-4" />
              待审核
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <PositionStatsCards onFilterChange={handleQuickFilter} />

      {/* 主内容区 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧筛选面板 - 桌面端 */}
        <aside className="hidden lg:block w-72 shrink-0">
          <PositionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            totalCount={total}
            loading={loading}
          />
        </aside>

        {/* 中间列表区 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 搜索和操作栏 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {/* 移动端筛选按钮 */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="lg:hidden">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0">
                      <div className="p-4">
                        <PositionFilters
                          filters={filters}
                          onFiltersChange={handleFiltersChange}
                          onReset={handleResetFilters}
                          totalCount={total}
                          loading={loading}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* 搜索框 */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索职位名称、单位..."
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
                      <SelectItem value="0">待审核</SelectItem>
                      <SelectItem value="2">已下线</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 排序 */}
                  <Select
                    value={filters.sort_by || "created_at"}
                    onValueChange={(v) => handleSortChange(v as PositionQueryParams["sort_by"])}
                  >
                    <SelectTrigger className="w-[130px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="排序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">创建时间</SelectItem>
                      <SelectItem value="recruit_count">招录人数</SelectItem>
                      <SelectItem value="registration_end">报名截止</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hidden xl:flex"
                          onClick={toggleDetailPanel}
                        >
                          {isDetailPanelOpen ? (
                            <PanelRightClose className="h-4 w-4" />
                          ) : (
                            <PanelRightOpen className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isDetailPanelOpen ? "关闭详情面板" : "打开详情面板"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {/* 表格 */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center">
                                <Scale className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>加入对比</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead>职位名称</TableHead>
                      <TableHead className="hidden md:table-cell">招录单位</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          招录
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">地点</TableHead>
                      <TableHead className="hidden lg:table-cell">学历</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="hidden xl:table-cell">报名截止</TableHead>
                      <TableHead className="hidden xl:table-cell">考试时间</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      // 加载状态
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : positions.length > 0 ? (
                      positions.map((position) => {
                        const daysLeft = getDaysUntilDeadline(position.registration_end);
                        const isSelected = selectedPositionId === position.id;
                        const isComparing = isInCompareList(position.id);
                        return (
                          <TableRow
                            key={position.id}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-muted/50" : "hover:bg-muted/30"
                            }`}
                            onClick={() => handleSelectPosition(position.id)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isComparing}
                                onCheckedChange={() => handleToggleCompare(position)}
                                disabled={!isComparing && compareList.length >= MAX_COMPARE_COUNT}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{position.position_name}</div>
                                <div className="text-sm text-muted-foreground md:hidden">
                                  {position.department_name?.slice(0, 15)}...
                                </div>
                                <div className="flex gap-1 mt-1">
                                  {position.is_unlimited_major && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      不限专业
                                    </Badge>
                                  )}
                                  {position.is_for_fresh_graduate && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      应届可报
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell max-w-[200px]">
                              <span className="truncate block" title={position.department_name}>
                                {position.department_name}
                              </span>
                              {position.department_level && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {position.department_level}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-lg">{position.recruit_count}</span>
                              <span className="text-muted-foreground text-xs ml-1">人</span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {position.province}
                                {position.city && `·${position.city}`}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                {position.education || "-"}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(position.status)}</TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {position.registration_end ? (
                                <div>
                                  <div className="text-sm">{formatDate(position.registration_end)}</div>
                                  {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
                                    <Badge
                                      variant="secondary"
                                      className={`text-xs ${
                                        daysLeft <= 3
                                          ? "bg-red-100 text-red-700"
                                          : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {daysLeft === 0 ? "今日截止" : `${daysLeft}天后截止`}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {position.exam_date ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  {formatDate(position.exam_date)}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">待定</span>
                              )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
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
                                      查看详情
                                    </Link>
                                  </DropdownMenuItem>
                                  {position.status === PositionStatus.Pending && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(position.id, PositionStatus.Published)}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      审核通过
                                    </DropdownMenuItem>
                                  )}
                                  {position.status === PositionStatus.Published && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(position.id, PositionStatus.Offline)}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      下线
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(position.id)}
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
                        <TableCell colSpan={10} className="h-24 text-center">
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
        </div>

        {/* 右侧详情预览面板 - 桌面端 */}
        {isDetailPanelOpen && (
          <aside className="hidden xl:block w-[400px] shrink-0">
            <Card className="h-[calc(100vh-280px)] sticky top-4">
              <PositionDetailPanel
                positionId={selectedPositionId}
                onClose={handleCloseDetailPanel}
                onAddToCompare={handleAddToCompareById}
                compareIds={compareList.map((p) => p.id)}
              />
            </Card>
          </aside>
        )}
      </div>

      {/* 底部对比栏 */}
      <CompareBar
        positions={compareList}
        maxCount={MAX_COMPARE_COUNT}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
      />

      {/* 为底部对比栏留出空间 */}
      {compareList.length > 0 && <div className="h-16" />}
    </div>
  );
}
