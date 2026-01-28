"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  RefreshCw,
  Eye,
  Flame,
  Snowflake,
  BarChart3,
  MapPin,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@what-cse/ui";
import { OverviewStatsCards } from "./components/OverviewStatsCards";
import { HotPositionsList } from "./components/HotPositionsList";
import { ColdPositionsList } from "./components/ColdPositionsList";
import { RegistrationCharts } from "./components/RegistrationCharts";
import { registrationDataApi } from "@/services/registration-data-api";
import type {
  RegistrationDataOverviewResponse,
  ProvinceRegistrationStats,
  ExamTypeRegistrationStats,
} from "@/types/registration-data";

export default function RegistrationDataPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<RegistrationDataOverviewResponse | null>(null);
  const [provinceStats, setProvinceStats] = useState<ProvinceRegistrationStats[]>([]);
  const [examTypeStats, setExamTypeStats] = useState<ExamTypeRegistrationStats[]>([]);
  const [collecting, setCollecting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // 加载数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [overview, province, examType] = await Promise.all([
        registrationDataApi.getOverview(),
        registrationDataApi.getStatsByProvince(),
        registrationDataApi.getStatsByExamType(),
      ]);
      
      setOverviewData(overview);
      setProvinceStats(province.stats || []);
      setExamTypeStats(examType.stats || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 手动采集数据
  const handleCollect = async () => {
    try {
      setCollecting(true);
      await registrationDataApi.collectSnapshot();
      alert("数据采集成功！");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "数据采集失败");
    } finally {
      setCollecting(false);
    }
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">报名大数据</h1>
          <p className="text-muted-foreground">
            实时报名数据统计和分析，洞察职位热度与竞争态势
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button variant="default" onClick={handleCollect} disabled={collecting}>
            <Download className={`mr-2 h-4 w-4 ${collecting ? "animate-spin" : ""}`} />
            采集数据
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* 总览统计卡片 */}
      <OverviewStatsCards data={overviewData?.overview || null} loading={loading} />

      {/* 主内容区 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">总览</span>
          </TabsTrigger>
          <TabsTrigger value="hot" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">热门岗位</span>
          </TabsTrigger>
          <TabsTrigger value="cold" className="flex items-center gap-2">
            <Snowflake className="h-4 w-4" />
            <span className="hidden sm:inline">冷门岗位</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">分布统计</span>
          </TabsTrigger>
        </TabsList>

        {/* 总览 Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 报名人数TOP10 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  报名人数 TOP10
                </CardTitle>
                <CardDescription>按报名人数排序的热门职位</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <HotPositionsList
                    positions={overviewData?.top_by_apply_count || []}
                    type="apply"
                  />
                )}
              </CardContent>
            </Card>

            {/* 竞争比TOP10 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                  竞争比 TOP10
                </CardTitle>
                <CardDescription>按竞争比排序的高竞争职位</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <HotPositionsList
                    positions={overviewData?.top_by_competition_ratio || []}
                    type="ratio"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* 图表区 */}
          <RegistrationCharts />
        </TabsContent>

        {/* 热门岗位 Tab */}
        <TabsContent value="hot" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  报名人数排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HotPositionsList
                  positions={overviewData?.top_by_apply_count || []}
                  type="apply"
                  showAll
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  竞争比排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HotPositionsList
                  positions={overviewData?.top_by_competition_ratio || []}
                  type="ratio"
                  showAll
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 冷门岗位 Tab */}
        <TabsContent value="cold" className="space-y-6">
          <ColdPositionsList />
        </TabsContent>

        {/* 分布统计 Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 按省份统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  各省份报名统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>省份</TableHead>
                          <TableHead className="text-right">职位数</TableHead>
                          <TableHead className="text-right">招录数</TableHead>
                          <TableHead className="text-right">报名数</TableHead>
                          <TableHead className="text-right">平均竞争比</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {provinceStats.slice(0, 15).map((stat) => (
                          <TableRow key={stat.province}>
                            <TableCell className="font-medium">{stat.province}</TableCell>
                            <TableCell className="text-right">{stat.position_count}</TableCell>
                            <TableCell className="text-right">{formatNumber(stat.total_recruit)}</TableCell>
                            <TableCell className="text-right">{formatNumber(stat.total_applicants)}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="secondary"
                                className={
                                  stat.avg_competition > 100
                                    ? "bg-red-100 text-red-700"
                                    : stat.avg_competition > 50
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }
                              >
                                {stat.avg_competition.toFixed(1)}:1
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 按考试类型统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  各考试类型报名统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>考试类型</TableHead>
                          <TableHead className="text-right">职位数</TableHead>
                          <TableHead className="text-right">招录数</TableHead>
                          <TableHead className="text-right">报名数</TableHead>
                          <TableHead className="text-right">平均竞争比</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examTypeStats.slice(0, 15).map((stat) => (
                          <TableRow key={stat.exam_type}>
                            <TableCell className="font-medium">{stat.exam_type}</TableCell>
                            <TableCell className="text-right">{stat.position_count}</TableCell>
                            <TableCell className="text-right">{formatNumber(stat.total_recruit)}</TableCell>
                            <TableCell className="text-right">{formatNumber(stat.total_applicants)}</TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="secondary"
                                className={
                                  stat.avg_competition > 100
                                    ? "bg-red-100 text-red-700"
                                    : stat.avg_competition > 50
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-700"
                                }
                              >
                                {stat.avg_competition.toFixed(1)}:1
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
