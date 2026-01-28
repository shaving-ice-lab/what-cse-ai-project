"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Skeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@what-cse/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@what-cse/ui";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { registrationDataApi } from "@/services/registration-data-api";
import type {
  RegistrationTrend,
  ProvinceRegistrationStats,
  ExamTypeRegistrationStats,
} from "@/types/registration-data";

const chartConfig: ChartConfig = {
  total_apply: {
    label: "总报名",
    color: "hsl(var(--chart-1))",
  },
  daily_increment: {
    label: "日增量",
    color: "hsl(var(--chart-2))",
  },
  avg_competition: {
    label: "平均竞争比",
    color: "hsl(var(--chart-3))",
  },
  total_applicants: {
    label: "报名人数",
    color: "hsl(var(--chart-1))",
  },
  position_count: {
    label: "职位数",
    color: "hsl(var(--chart-2))",
  },
};

export function RegistrationCharts() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<RegistrationTrend[]>([]);
  const [provinceStats, setProvinceStats] = useState<ProvinceRegistrationStats[]>([]);
  const [examTypeStats, setExamTypeStats] = useState<ExamTypeRegistrationStats[]>([]);
  const [trendDays, setTrendDays] = useState("30");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trendsRes, provinceRes, examTypeRes] = await Promise.all([
        registrationDataApi.getTrends(parseInt(trendDays)),
        registrationDataApi.getStatsByProvince(),
        registrationDataApi.getStatsByExamType(),
      ]);
      
      setTrends(trendsRes.trends || []);
      setProvinceStats(provinceRes.stats || []);
      setExamTypeStats(examTypeRes.stats || []);
    } catch (err) {
      console.error("Failed to fetch chart data:", err);
    } finally {
      setLoading(false);
    }
  }, [trendDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "万";
    }
    return num.toLocaleString();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 报名趋势图 */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>报名趋势</CardTitle>
            <CardDescription>每日报名人数变化</CardDescription>
          </div>
          <Select value={trendDays} onValueChange={setTrendDays}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="选择时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">近7天</SelectItem>
              <SelectItem value="14">近14天</SelectItem>
              <SelectItem value="30">近30天</SelectItem>
              <SelectItem value="60">近60天</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : trends.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorApply" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => {
                          if (name === "total_apply") {
                            return [formatNumber(value as number), "总报名"];
                          }
                          return [value, name];
                        }}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="total_apply"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorApply)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无趋势数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* 省份分布图 */}
      <Card>
        <CardHeader>
          <CardTitle>省份报名分布</CardTitle>
          <CardDescription>各省报名人数排行</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : provinceStats.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={provinceStats.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="province"
                    tick={{ fontSize: 12 }}
                    width={50}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [formatNumber(value as number), "报名人数"]}
                      />
                    }
                  />
                  <Bar
                    dataKey="total_applicants"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无省份数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* 考试类型分布图 */}
      <Card>
        <CardHeader>
          <CardTitle>考试类型分布</CardTitle>
          <CardDescription>各类考试报名人数</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : examTypeStats.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examTypeStats.slice(0, 10)}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    tickFormatter={formatNumber}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="exam_type"
                    tick={{ fontSize: 12 }}
                    width={70}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => [formatNumber(value as number), "报名人数"]}
                      />
                    }
                  />
                  <Bar
                    dataKey="total_applicants"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              暂无考试类型数据
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
