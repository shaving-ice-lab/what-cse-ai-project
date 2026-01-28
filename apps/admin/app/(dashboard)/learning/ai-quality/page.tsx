"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  FileText,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ScrollArea,
  Progress,
} from "@what-cse/ui";
import {
  aiContentApi,
  AIQualityStats,
  AIGeneratedContent,
  getContentTypeLabel,
  getQualityScoreLabel,
  getQualityScoreColor,
  getContentStatusLabel,
} from "@/services/ai-content-api";
import { toast } from "sonner";

// ============================================
// Stats Cards Component
// ============================================

function OverviewCards({
  stats,
  loading,
}: {
  stats: AIQualityStats | null;
  loading: boolean;
}) {
  const cards = [
    {
      title: "总内容数",
      value: stats?.total_contents || 0,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "待审核",
      value: stats?.pending_count || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      title: "平均质量分",
      value: stats?.average_quality_score?.toFixed(2) || "0",
      icon: Star,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "审核通过率",
      value: `${(stats?.approval_rate || 0).toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================
// Quality Distribution Card
// ============================================

function QualityDistributionCard({
  stats,
  loading,
}: {
  stats: AIQualityStats | null;
  loading: boolean;
}) {
  const distribution = stats?.quality_score_distribution || {
    excellent: 0,
    good: 0,
    average: 0,
    poor: 0,
  };

  const total =
    distribution.excellent +
    distribution.good +
    distribution.average +
    distribution.poor;

  const getPercentage = (value: number) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  const items = [
    {
      label: "优秀",
      subLabel: "≥ 4.0",
      value: distribution.excellent,
      percentage: getPercentage(distribution.excellent),
      color: "bg-green-500",
      textColor: "text-green-600",
    },
    {
      label: "良好",
      subLabel: "≥ 3.0",
      value: distribution.good,
      percentage: getPercentage(distribution.good),
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      label: "一般",
      subLabel: "≥ 2.0",
      value: distribution.average,
      percentage: getPercentage(distribution.average),
      color: "bg-amber-500",
      textColor: "text-amber-600",
    },
    {
      label: "较差",
      subLabel: "< 2.0",
      value: distribution.poor,
      percentage: getPercentage(distribution.poor),
      color: "bg-red-500",
      textColor: "text-red-600",
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-500" />
          质量分布
        </CardTitle>
        <CardDescription>AI 生成内容质量评分分布</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({item.subLabel})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={item.textColor}>{item.value}</span>
                <span className="text-muted-foreground text-xs">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
            <Progress value={item.percentage} className={`h-2 ${item.color}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================
// Content Type Distribution Card
// ============================================

function ContentTypeDistributionCard({
  stats,
  loading,
}: {
  stats: AIQualityStats | null;
  loading: boolean;
}) {
  const distribution = stats?.content_type_distribution || {};
  const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-500" />
          内容类型分布
        </CardTitle>
        <CardDescription>按内容类型统计生成数量</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          <div className="space-y-3">
            {entries.map(([type, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {getContentTypeLabel(type as any)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{count}</span>
                      <span className="text-muted-foreground text-xs">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              );
            })}
            {entries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                暂无数据
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================
// Common Issues Card
// ============================================

function CommonIssuesCard({
  stats,
  loading,
}: {
  stats: AIQualityStats | null;
  loading: boolean;
}) {
  const issues = stats?.common_issues || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          常见问题
        </CardTitle>
        <CardDescription>AI 生成内容的常见质量问题</CardDescription>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>暂无常见问题</p>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">{issue.issue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{issue.count} 次</Badge>
                  <span className="text-xs text-muted-foreground">
                    ({issue.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Generation Trend Card
// ============================================

function GenerationTrendCard({
  stats,
  loading,
}: {
  stats: AIQualityStats | null;
  loading: boolean;
}) {
  const trend = stats?.daily_generation_trend || [];
  const maxCount = Math.max(...trend.map((t) => t.count), 1);

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          生成趋势
        </CardTitle>
        <CardDescription>近期 AI 内容生成数量趋势</CardDescription>
      </CardHeader>
      <CardContent>
        {trend.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无趋势数据</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-1 h-40">
            {trend.slice(-14).map((item, index) => {
              const height = (item.count / maxCount) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${item.date}: ${item.count} 条`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Low Quality Contents Table
// ============================================

function LowQualityContentsTable({
  contents,
  loading,
}: {
  contents: AIGeneratedContent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          低质量内容
        </CardTitle>
        <CardDescription>质量评分较低的内容，建议优化或重新生成</CardDescription>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>暂无低质量内容</p>
          </div>
        ) : (
          <ScrollArea className="h-60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>质量分</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-mono text-xs">
                      #{content.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getContentTypeLabel(content.content_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {content.title || content.content.summary || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${getQualityScoreColor(
                          content.quality_score
                        )}`}
                      >
                        {content.quality_score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getContentStatusLabel(content.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// High Quality Contents Table
// ============================================

function HighQualityContentsTable({
  contents,
  loading,
}: {
  contents: AIGeneratedContent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          高质量内容
        </CardTitle>
        <CardDescription>质量评分较高的优秀内容</CardDescription>
      </CardHeader>
      <CardContent>
        {contents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无高质量内容</p>
          </div>
        ) : (
          <ScrollArea className="h-60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>质量分</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell className="font-mono text-xs">
                      #{content.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getContentTypeLabel(content.content_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {content.title || content.content.summary || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${getQualityScoreColor(
                          content.quality_score
                        )}`}
                      >
                        {content.quality_score.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getContentStatusLabel(content.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AIQualityDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AIQualityStats | null>(null);
  const [lowQualityContents, setLowQualityContents] = useState<AIGeneratedContent[]>([]);
  const [highQualityContents, setHighQualityContents] = useState<AIGeneratedContent[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, lowQualityRes, highQualityRes] = await Promise.all([
        aiContentApi.getQualityStats(),
        aiContentApi.getLowQualityContents(2.0, 10),
        aiContentApi.getHighQualityContents(4.0, 10),
      ]);

      setStats(statsRes);
      setLowQualityContents(lowQualityRes || []);
      setHighQualityContents(highQualityRes || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
      // Set mock data for development
      setStats({
        total_contents: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        average_quality_score: 0,
        content_type_distribution: {},
        quality_score_distribution: {
          excellent: 0,
          good: 0,
          average: 0,
          poor: 0,
        },
        daily_generation_trend: [],
        approval_rate: 0,
        common_issues: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            AI 内容质量分析
          </h1>
          <p className="text-muted-foreground">
            分析 AI 生成内容的质量分布和常见问题
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 概览卡片 */}
      <OverviewCards stats={stats} loading={loading} />

      {/* 质量分布和内容类型 */}
      <div className="grid gap-6 md:grid-cols-2">
        <QualityDistributionCard stats={stats} loading={loading} />
        <ContentTypeDistributionCard stats={stats} loading={loading} />
      </div>

      {/* 生成趋势和常见问题 */}
      <div className="grid gap-6 md:grid-cols-3">
        <GenerationTrendCard stats={stats} loading={loading} />
        <CommonIssuesCard stats={stats} loading={loading} />
      </div>

      {/* 高质量和低质量内容 */}
      <div className="grid gap-6 md:grid-cols-2">
        <HighQualityContentsTable
          contents={highQualityContents}
          loading={loading}
        />
        <LowQualityContentsTable
          contents={lowQualityContents}
          loading={loading}
        />
      </div>
    </div>
  );
}
