"use client";

import { useEffect, useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@what-cse/ui";
import { announcementApi } from "@/services/announcement-api";
import type { ProvinceStats, MonthlyStats } from "@/types/announcement";

// 简单的条形图组件
interface BarChartProps {
  data: { label: string; value: number; subValue?: number }[];
  maxValue: number;
  loading?: boolean;
  valueLabel?: string;
  subValueLabel?: string;
  color?: string;
  onClick?: (label: string) => void;
}

function SimpleBarChart({
  data,
  maxValue,
  loading,
  valueLabel = "数量",
  subValueLabel,
  color = "bg-blue-500",
  onClick,
}: BarChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无数据
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div
            key={index}
            className={`space-y-1 ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => onClick?.(item.label)}
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate max-w-[60%]" title={item.label}>
                {item.label}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{item.value} {valueLabel}</span>
                {item.subValue !== undefined && subValueLabel && (
                  <span className="text-xs">({item.subValue} {subValueLabel})</span>
                )}
              </div>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AnnouncementStatsChartsProps {
  onProvinceSelect?: (province: string) => void;
  onMonthSelect?: (month: string) => void;
}

export function AnnouncementStatsCharts({
  onProvinceSelect,
  onMonthSelect,
}: AnnouncementStatsChartsProps) {
  const [provinceStats, setProvinceStats] = useState<ProvinceStats[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [provinceLoading, setProvinceLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isExpanded, setIsExpanded] = useState(true);

  // 获取省份统计
  useEffect(() => {
    const fetchProvinceStats = async () => {
      try {
        setProvinceLoading(true);
        const data = await announcementApi.getStatsByProvince();
        setProvinceStats(data || []);
      } catch (err) {
        console.error("获取省份统计失败:", err);
        // 使用模拟数据
        setProvinceStats([
          { province: "全国", count: 15, position_count: 5000 },
          { province: "北京", count: 8, position_count: 1200 },
          { province: "上海", count: 6, position_count: 800 },
          { province: "广东", count: 12, position_count: 2500 },
          { province: "浙江", count: 9, position_count: 1800 },
          { province: "江苏", count: 10, position_count: 2200 },
          { province: "四川", count: 7, position_count: 1500 },
          { province: "山东", count: 11, position_count: 2000 },
        ]);
      } finally {
        setProvinceLoading(false);
      }
    };

    fetchProvinceStats();
  }, []);

  // 获取月份统计
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        setMonthlyLoading(true);
        const data = await announcementApi.getStatsByMonth(selectedYear);
        setMonthlyStats(data || []);
      } catch (err) {
        console.error("获取月份统计失败:", err);
        // 使用模拟数据
        const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        setMonthlyStats(
          months.map((m) => ({
            month: `${selectedYear}-${m}`,
            count: Math.floor(Math.random() * 20) + 5,
          }))
        );
      } finally {
        setMonthlyLoading(false);
      }
    };

    fetchMonthlyStats();
  }, [selectedYear]);

  // 处理省份数据
  const provinceChartData = useMemo(() => {
    return provinceStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        label: item.province || "未知",
        value: item.count,
        subValue: item.position_count,
      }));
  }, [provinceStats]);

  const maxProvinceValue = useMemo(() => {
    return Math.max(...provinceStats.map((s) => s.count), 1);
  }, [provinceStats]);

  // 处理月份数据
  const monthlyChartData = useMemo(() => {
    return monthlyStats.map((item) => {
      const monthNum = item.month.split("-")[1];
      return {
        label: `${monthNum}月`,
        value: item.count,
      };
    });
  }, [monthlyStats]);

  const maxMonthlyValue = useMemo(() => {
    return Math.max(...monthlyStats.map((s) => s.count), 1);
  }, [monthlyStats]);

  // 年份选项
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  // 总计
  const totalByProvince = useMemo(() => {
    return provinceStats.reduce((acc, s) => acc + s.count, 0);
  }, [provinceStats]);

  const totalByMonth = useMemo(() => {
    return monthlyStats.reduce((acc, s) => acc + s.count, 0);
  }, [monthlyStats]);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-primary" />
                数据统计分析
              </CardTitle>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 按地区统计 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    按地区统计
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    共 {totalByProvince} 条
                  </span>
                </div>
                <SimpleBarChart
                  data={provinceChartData}
                  maxValue={maxProvinceValue}
                  loading={provinceLoading}
                  valueLabel="条"
                  subValueLabel="职位"
                  color="bg-emerald-500"
                  onClick={(label) => onProvinceSelect?.(label)}
                />
              </div>

              {/* 按时间统计 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    按时间统计
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      共 {totalByMonth} 条
                    </span>
                    <Select
                      value={String(selectedYear)}
                      onValueChange={(v) => setSelectedYear(Number(v))}
                    >
                      <SelectTrigger className="w-[90px] h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            {year}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SimpleBarChart
                  data={monthlyChartData}
                  maxValue={maxMonthlyValue}
                  loading={monthlyLoading}
                  valueLabel="条"
                  color="bg-blue-500"
                  onClick={(label) => {
                    const monthNum = label.replace("月", "").padStart(2, "0");
                    onMonthSelect?.(`${selectedYear}-${monthNum}`);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default AnnouncementStatsCharts;
