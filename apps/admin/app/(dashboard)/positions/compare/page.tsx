"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  Download,
  Share2,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Check,
  Trophy,
  Target,
  Clock,
  Users,
  GraduationCap,
  MapPin,
  Building2,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Link2,
  Copy,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ScrollArea,
} from "@what-cse/ui";
import { positionApi, type CompareResponse, type CompareDimension, type DimensionValue } from "@/services/position-api";

export default function PositionComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").map(Number).filter(Boolean) : [];

  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 加载对比数据
  useEffect(() => {
    const fetchCompareData = async () => {
      if (ids.length < 2) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await positionApi.comparePositions(ids);
        setCompareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载对比数据失败");
      } finally {
        setLoading(false);
      }
    };

    fetchCompareData();
  }, [idsParam]);

  // 处理导出
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      const result = await positionApi.exportCompareReport(ids, format);
      // TODO: 实际下载文件
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : "导出失败");
    }
  };

  // 处理分享
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/positions/compare?ids=${ids.join(",")}`;
    
    // 尝试使用 Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: "职位对比",
          text: `查看${items?.length || ids.length}个职位的对比分析`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // 用户取消分享或不支持，继续使用复制链接
        if ((err as Error).name === "AbortError") return;
      }
    }
    
    // 回退到复制链接
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // 如果剪贴板 API 也不可用，使用传统方法
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 移除职位
  const handleRemovePosition = (positionId: number) => {
    const newIds = ids.filter((id) => id !== positionId);
    if (newIds.length < 2) {
      router.push("/positions");
      return;
    }
    router.replace(`/positions/compare?ids=${newIds.join(",")}`);
  };

  // 如果职位数量不足
  if (ids.length < 2) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Scale className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">请选择至少2个职位进行对比</h2>
        <p className="text-muted-foreground mb-6">返回职位列表添加更多职位到对比</p>
        <Button asChild>
          <Link href="/positions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回职位列表
          </Link>
        </Button>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 错误状态
  if (error || !compareData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">加载失败</h2>
        <p className="text-muted-foreground mb-6">{error || "无法加载对比数据"}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
          <Button asChild>
            <Link href="/positions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回职位列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { items, recommendation, summary, dimensions } = compareData;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/positions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              职位对比
            </h1>
            <p className="text-muted-foreground">共对比 {items.length} 个职位</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-2 h-4 w-4" />
                      分享
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? "链接已复制到剪贴板" : "分享对比结果"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
            <Download className="mr-2 h-4 w-4" />
            导出 Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            导出 PDF
          </Button>
        </div>
      </div>

      {/* 对比总结 */}
      {summary && (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              智能对比分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 总体概览 */}
            <div>
              <p className="text-sm text-muted-foreground">{summary.overview}</p>
            </div>

            {/* 重点对比项 */}
            {summary.highlights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-500" />
                  重点差异
                </h4>
                <ul className="space-y-1">
                  {summary.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 选择建议 */}
            {summary.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  选择建议
                </h4>
                <ul className="space-y-1">
                  {summary.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 推荐结果 */}
      {recommendation && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recommendation.most_recruit && (
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">招录人数最多</span>
                </div>
                <p className="font-semibold line-clamp-1">{recommendation.most_recruit.position_name}</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{recommendation.most_recruit.value}</p>
              </CardContent>
            </Card>
          )}

          {recommendation.lowest_requirement && (
            <Card className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">条件最宽松</span>
                </div>
                <p className="font-semibold line-clamp-1">{recommendation.lowest_requirement.position_name}</p>
                <p className="text-sm text-green-600 mt-1">{recommendation.lowest_requirement.reason}</p>
              </CardContent>
            </Card>
          )}

          {recommendation.best_for_fresh_grad && (
            <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">适合应届生</span>
                </div>
                <p className="font-semibold line-clamp-1">{recommendation.best_for_fresh_grad.position_name}</p>
                <p className="text-sm text-purple-600 mt-1">{recommendation.best_for_fresh_grad.reason}</p>
              </CardContent>
            </Card>
          )}

          {recommendation.soonest_deadline && (
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">即将截止</span>
                </div>
                <p className="font-semibold line-clamp-1">{recommendation.soonest_deadline.position_name}</p>
                <p className="text-lg font-bold text-amber-700 mt-1">{recommendation.soonest_deadline.value}</p>
              </CardContent>
            </Card>
          )}

          {recommendation.lowest_competition && (
            <Card className="bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-600">竞争最小</span>
                </div>
                <p className="font-semibold line-clamp-1">{recommendation.lowest_competition.position_name}</p>
                <p className="text-lg font-bold text-teal-700 mt-1">{recommendation.lowest_competition.value}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 对比表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">详细对比</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[160px] font-semibold sticky left-0 bg-muted/50 z-10">
                      对比项
                    </TableHead>
                    {items.map((item) => (
                      <TableHead key={item.position.id} className="min-w-[220px]">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/positions/${item.position.id}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-2"
                            >
                              {item.position.position_name}
                            </Link>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => handleRemovePosition(item.position.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>移除此职位</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                            {item.position.department_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
                            <MapPin className="h-3 w-3" />
                            {item.position.province}
                            {item.position.city && `·${item.position.city}`}
                          </div>
                          {item.is_registering && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              正在报名
                            </Badge>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dimensions.map((dim, idx) => (
                    <TableRow
                      key={dim.key}
                      className={`${dim.has_diff ? "bg-amber-50/50 dark:bg-amber-950/20" : ""} ${
                        idx % 2 === 0 ? "" : "bg-muted/30"
                      }`}
                    >
                      <TableCell className="font-medium sticky left-0 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          {dim.label}
                          {dim.has_diff && (
                            <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                              差异
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {dim.values.map((val) => (
                        <TableCell key={val.position_id}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`${
                                val.display === "不限" || val.display === "不限专业"
                                  ? "text-green-600 font-medium"
                                  : ""
                              }`}
                            >
                              {val.display}
                            </span>
                            {val.is_best && (
                              <Badge className="bg-green-500 text-white text-xs">
                                最优
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* 特殊标签行 */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium sticky left-0 bg-muted/50 z-10">
                      特殊标签
                    </TableCell>
                    {items.map((item) => (
                      <TableCell key={item.position.id}>
                        <div className="flex flex-wrap gap-1">
                          {item.position.is_unlimited_major && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              不限专业
                            </Badge>
                          )}
                          {item.position.is_for_fresh_graduate && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              应届可报
                            </Badge>
                          )}
                          {!item.position.is_unlimited_major && !item.position.is_for_fresh_graduate && (
                            <span className="text-muted-foreground text-sm">无</span>
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* 操作行 */}
                  <TableRow>
                    <TableCell className="font-medium sticky left-0 bg-background z-10">
                      操作
                    </TableCell>
                    {items.map((item) => (
                      <TableCell key={item.position.id}>
                        <div className="flex items-center gap-2">
                          <Button variant="default" size="sm" asChild>
                            <Link href={`/positions/${item.position.id}`}>
                              <ExternalLink className="mr-1 h-3 w-3" />
                              查看详情
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 添加更多职位提示 */}
      {items.length < 5 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Plus className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">添加更多职位</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  您还可以添加 {5 - items.length} 个职位进行对比。
                  <Button variant="link" asChild className="p-0 h-auto ml-1 text-blue-600">
                    <Link href="/positions">返回职位列表选择更多</Link>
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
