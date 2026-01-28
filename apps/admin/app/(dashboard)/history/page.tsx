"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Trophy,
  BarChart3,
  XCircle,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import { historyApi } from "@/services/history-api";
import type {
  PositionHistoryBrief,
  HistoryQueryParams,
  HistoryStats,
  YearStats,
  ProvinceHistoryStats,
  ExamTypeHistoryStats,
  HistoryFilterOptions,
  YearlyTrendItem,
} from "@/types/history";

export default function AdminHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [histories, setHistories] = useState<PositionHistoryBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  
  // 统计数据
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [yearStats, setYearStats] = useState<YearStats[]>([]);
  const [provinceStats, setProvinceStats] = useState<ProvinceHistoryStats[]>([]);
  const [examTypeStats, setExamTypeStats] = useState<ExamTypeHistoryStats[]>([]);
  const [filterOptions, setFilterOptions] = useState<HistoryFilterOptions | null>(null);
  const [trends, setTrends] = useState<YearlyTrendItem[]>([]);

  // 筛选条件
  const [filters, setFilters] = useState<HistoryQueryParams>({
    page: Number(searchParams.get("page")) || 1,
    page_size: Number(searchParams.get("page_size")) || 20,
    position_name: searchParams.get("position_name") || undefined,
    department_name: searchParams.get("department_name") || undefined,
    province: searchParams.get("province") || undefined,
    exam_type: searchParams.get("exam_type") || undefined,
    year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
    sort_by: (searchParams.get("sort_by") as HistoryQueryParams["sort_by"]) || "year",
    sort_order: (searchParams.get("sort_order") as HistoryQueryParams["sort_order"]) || "desc",
  });

  // 加载数据
  const fetchHistories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await historyApi.getHistories(filters);
      setHistories(data.histories || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取历年数据失败");
      setHistories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 加载统计数据
  const fetchStats = async () => {
    try {
      const [statsData, yearData, provinceData, examTypeData, optionsData, trendsData] = await Promise.all([
        historyApi.getHistoryStats(),
        historyApi.getStatsByYear(),
        historyApi.getStatsByProvince(),
        historyApi.getStatsByExamType(),
        historyApi.getFilterOptions(),
        historyApi.getYearlyTrends(),
      ]);
      setStats(statsData);
      setYearStats(yearData.stats || []);
      setProvinceStats(provinceData.stats || []);
      setExamTypeStats(examTypeData.stats || []);
      setFilterOptions(optionsData);
      setTrends(trendsData.trends || []);
    } catch (err) {
      console.error("加载统计数据失败:", err);
    }
  };

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  useEffect(() => {
    fetchStats();
  }, []);

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
    setFilters((prev) => ({
      ...prev,
      position_name: searchTerm || undefined,
      page: 1,
    }));
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      page: 1,
      page_size: 20,
      sort_by: "year",
      sort_order: "desc",
    });
  };

  // 处理排序
  const handleSortChange = (sortBy: HistoryQueryParams["sort_by"]) => {
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
    if (!confirm("确定要删除这条历年数据吗？")) return;
    try {
      await historyApi.deleteHistory(id);
      fetchHistories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 格式化数字
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return "-";
    return num.toLocaleString();
  };

  // 格式化竞争比
  const formatRatio = (ratio: number | undefined) => {
    if (ratio === undefined || ratio === null || ratio === 0) return "-";
    return `${ratio.toFixed(1)}:1`;
  };

  // 格式化分数
  const formatScore = (score: number | undefined) => {
    if (score === undefined || score === null || score === 0) return "-";
    return score.toFixed(1);
  };

  const totalPages = Math.ceil(total / (filters.page_size || 20));
  const currentPage = filters.page || 1;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">历年数据管理</h1>
          <p className="text-muted-foreground">管理历年招录数据、查看趋势分析和分数线预测</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { fetchHistories(); fetchStats(); }} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            导入数据
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增记录
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总记录数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.total_records)}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.min_year && stats?.max_year ? `${stats.min_year} - ${stats.max_year}年数据` : "-"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均招录人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avg_recruit_count?.toFixed(1) || "-"}</div>
            <p className="text-xs text-muted-foreground">人/职位</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均竞争比</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRatio(stats?.avg_competition)}</div>
            <p className="text-xs text-muted-foreground">报名人数/招录人数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均进面分数</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatScore(stats?.avg_interview_score)}</div>
            <p className="text-xs text-muted-foreground">
              笔试: {formatScore(stats?.avg_written_score)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: 列表 / 趋势分析 / 统计报表 */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">数据列表</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="stats">统计报表</TabsTrigger>
        </TabsList>

        {/* 数据列表 */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {/* 搜索和筛选 */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {/* 搜索框 */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="搜索职位名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch}>搜索</Button>

                  {/* 年份筛选 */}
                  <Select
                    value={String(filters.year ?? "all")}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        year: v === "all" ? undefined : Number(v),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="年份" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部年份</SelectItem>
                      {filterOptions?.years?.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}年
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 省份筛选 */}
                  <Select
                    value={filters.province ?? "all"}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        province: v === "all" ? undefined : v,
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <MapPin className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="省份" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部省份</SelectItem>
                      {filterOptions?.provinces?.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 考试类型筛选 */}
                  <Select
                    value={filters.exam_type ?? "all"}
                    onValueChange={(v) =>
                      setFilters((prev) => ({
                        ...prev,
                        exam_type: v === "all" ? undefined : v,
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="考试类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      {filterOptions?.exam_types?.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 排序 */}
                  <Select
                    value={filters.sort_by || "year"}
                    onValueChange={(v) => handleSortChange(v as HistoryQueryParams["sort_by"])}
                  >
                    <SelectTrigger className="w-[130px]">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="排序" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year">年份</SelectItem>
                      <SelectItem value="recruit_count">招录人数</SelectItem>
                      <SelectItem value="competition_ratio">竞争比</SelectItem>
                      <SelectItem value="interview_score">进面分数</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" onClick={handleResetFilters}>
                    重置
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
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
                      <TableHead>年份</TableHead>
                      <TableHead>职位名称</TableHead>
                      <TableHead className="hidden md:table-cell">招录单位</TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          招录
                        </div>
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">报名</TableHead>
                      <TableHead>竞争比</TableHead>
                      <TableHead className="hidden xl:table-cell">进面分数</TableHead>
                      <TableHead className="hidden lg:table-cell">地区</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : histories.length > 0 ? (
                      histories.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell>
                            <Badge variant="outline">{history.year}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{history.position_name}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {history.department_name?.slice(0, 15)}...
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px]">
                            <span className="truncate block" title={history.department_name}>
                              {history.department_name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{formatNumber(history.recruit_count)}</span>
                            <span className="text-muted-foreground text-xs ml-1">人</span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {formatNumber(history.apply_count)}
                          </TableCell>
                          <TableCell>
                            {history.competition_ratio > 0 ? (
                              <Badge
                                variant="secondary"
                                className={
                                  history.competition_ratio > 100
                                    ? "bg-red-100 text-red-700"
                                    : history.competition_ratio > 50
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }
                              >
                                {formatRatio(history.competition_ratio)}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {formatScore(history.interview_score)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {history.province || "-"}
                            </div>
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
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(history.id)}
                                >
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
                        <TableCell colSpan={9} className="h-24 text-center">
                          没有找到匹配的历年数据
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
        </TabsContent>

        {/* 趋势分析 */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">招录人数趋势</CardTitle>
                <CardDescription>历年招录人数变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.length > 0 ? (
                    trends.map((item) => (
                      <div key={item.year} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.year}年</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-blue-500 rounded"
                            style={{ width: `${Math.min((item.recruit_count / Math.max(...trends.map(t => t.recruit_count))) * 200, 200)}px` }}
                          />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {formatNumber(item.recruit_count)}人
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无趋势数据</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">竞争比趋势</CardTitle>
                <CardDescription>历年平均竞争比变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.length > 0 ? (
                    trends.map((item) => (
                      <div key={item.year} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.year}年</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-amber-500 rounded"
                            style={{ width: `${Math.min((item.competition_ratio / Math.max(...trends.map(t => t.competition_ratio || 1))) * 200, 200)}px` }}
                          />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {formatRatio(item.competition_ratio)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无趋势数据</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">进面分数线趋势</CardTitle>
                <CardDescription>历年平均进面分数变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.length > 0 ? (
                    trends.map((item) => (
                      <div key={item.year} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.year}年</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-green-500 rounded"
                            style={{ width: `${item.avg_interview_score ? Math.min((item.avg_interview_score / 200) * 200, 200) : 0}px` }}
                          />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {formatScore(item.avg_interview_score)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无趋势数据</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">报名人数趋势</CardTitle>
                <CardDescription>历年报名人数变化</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trends.length > 0 ? (
                    trends.map((item) => (
                      <div key={item.year} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.year}年</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 bg-purple-500 rounded"
                            style={{ width: `${Math.min((item.apply_count / Math.max(...trends.map(t => t.apply_count || 1))) * 200, 200)}px` }}
                          />
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {formatNumber(item.apply_count)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无趋势数据</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 统计报表 */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* 按年份统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按年份统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {yearStats.length > 0 ? (
                    yearStats.map((item) => (
                      <div key={item.year} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span className="font-medium">{item.year}年</span>
                        <div className="text-right">
                          <span className="text-sm">{formatNumber(item.count)} 条</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            招 {formatNumber(item.recruit_count)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无数据</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 按省份统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按省份统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {provinceStats.length > 0 ? (
                    provinceStats.slice(0, 15).map((item) => (
                      <div key={item.province} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span className="font-medium">{item.province}</span>
                        <div className="text-right">
                          <span className="text-sm">{formatNumber(item.total_records)} 条</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            比 {formatRatio(item.avg_competition)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无数据</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 按考试类型统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按考试类型统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {examTypeStats.length > 0 ? (
                    examTypeStats.map((item) => (
                      <div key={item.exam_type} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span className="font-medium">{item.exam_type}</span>
                        <div className="text-right">
                          <span className="text-sm">{formatNumber(item.total_records)} 条</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            比 {formatRatio(item.avg_competition)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">暂无数据</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
