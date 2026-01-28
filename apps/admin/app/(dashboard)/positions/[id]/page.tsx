"use client";

import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Badge as BadgeIcon,
  RefreshCw,
  User,
  Flag,
  Briefcase,
  FileText,
  Newspaper,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@what-cse/ui";
import { positionApi } from "@/services/position-api";
import type { PositionDetail, PositionBrief } from "@/types/position";
import { PositionStatus, PositionStatusNames, PositionStatusColors } from "@/types/position";

export default function PositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [position, setPosition] = useState<PositionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [similarPositions, setSimilarPositions] = useState<PositionBrief[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // 获取职位详情
  const fetchPosition = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await positionApi.getPosition(Number(id));
      setPosition(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取职位详情失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 获取相似职位
  const fetchSimilarPositions = useCallback(async () => {
    try {
      setLoadingSimilar(true);
      const data = await positionApi.getSimilarPositions(Number(id), 5);
      setSimilarPositions(data.positions || []);
    } catch (err) {
      console.error("获取相似职位失败:", err);
    } finally {
      setLoadingSimilar(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPosition();
      fetchSimilarPositions();
    }
  }, [id, fetchPosition, fetchSimilarPositions]);

  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 格式化日期时间
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  // 处理状态变更
  const handleStatusChange = async (newStatus: number) => {
    try {
      setActionLoading(true);
      await positionApi.updatePositionStatus(Number(id), newStatus);
      setPosition((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      alert(err instanceof Error ? err.message : "更新状态失败");
    } finally {
      setActionLoading(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await positionApi.deletePosition(Number(id));
      router.push("/positions");
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold">{error || "职位不存在"}</h2>
        <Button variant="outline" asChild>
          <Link href="/positions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(position.registration_end);

  return (
    <div className="space-y-6">
      {/* 顶部导航和操作 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/positions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{position.position_name}</h1>
              {getStatusBadge(position.status)}
            </div>
            <p className="text-muted-foreground">{position.department_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {position.status === PositionStatus.Pending && (
            <Button
              variant="default"
              onClick={() => handleStatusChange(PositionStatus.Published)}
              disabled={actionLoading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              审核通过
            </Button>
          )}
          {position.status === PositionStatus.Published && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange(PositionStatus.Offline)}
              disabled={actionLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              下线
            </Button>
          )}
          {position.source_url && (
            <Button variant="outline" asChild>
              <a href={position.source_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                原文链接
              </a>
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={actionLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      {/* 核心信息卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">招录人数</p>
                <p className="text-2xl font-bold">{position.recruit_count || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">工作地点</p>
                <p className="text-lg font-semibold">
                  {position.province}
                  {position.city && ` · ${position.city}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">学历要求</p>
                <p className="text-lg font-semibold">{position.education || "不限"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  daysLeft !== null && daysLeft <= 3
                    ? "bg-red-100"
                    : daysLeft !== null && daysLeft <= 7
                    ? "bg-amber-100"
                    : "bg-gray-100"
                }`}
              >
                <Clock
                  className={`h-5 w-5 ${
                    daysLeft !== null && daysLeft <= 3
                      ? "text-red-600"
                      : daysLeft !== null && daysLeft <= 7
                      ? "text-amber-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">报名截止</p>
                {position.registration_end ? (
                  <div>
                    <p className="text-lg font-semibold">{formatDate(position.registration_end)}</p>
                    {daysLeft !== null && (
                      <p
                        className={`text-xs ${
                          daysLeft <= 0
                            ? "text-red-600"
                            : daysLeft <= 3
                            ? "text-red-500"
                            : daysLeft <= 7
                            ? "text-amber-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        {daysLeft <= 0 ? "已截止" : `还剩 ${daysLeft} 天`}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg font-semibold">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详情标签页 */}
      <Tabs defaultValue="requirements" className="w-full">
        <TabsList>
          <TabsTrigger value="requirements">招录条件</TabsTrigger>
          <TabsTrigger value="time">时间信息</TabsTrigger>
          <TabsTrigger value="other">其他信息</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>招录条件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 快捷标签 */}
              <div className="flex flex-wrap gap-2">
                {position.is_unlimited_major && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">不限专业</Badge>
                )}
                {position.is_for_fresh_graduate && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">应届可报</Badge>
                )}
                {position.department_level && (
                  <Badge variant="outline">{position.department_level}</Badge>
                )}
                {position.exam_type && (
                  <Badge variant="outline">{position.exam_type}</Badge>
                )}
              </div>

              <Separator />

              {/* 条件列表 */}
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow
                  icon={<GraduationCap className="h-4 w-4" />}
                  label="学历要求"
                  value={position.education || "不限"}
                />
                <InfoRow
                  icon={<BadgeIcon className="h-4 w-4" />}
                  label="学位要求"
                  value={position.degree || "不限"}
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="专业要求"
                  value={position.major_requirement || "不限"}
                  fullWidth
                />
                <InfoRow
                  icon={<Flag className="h-4 w-4" />}
                  label="政治面貌"
                  value={position.political_status || "不限"}
                />
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="年龄要求"
                  value={position.age || "不限"}
                />
                <InfoRow
                  icon={<User className="h-4 w-4" />}
                  label="性别要求"
                  value={position.gender || "不限"}
                />
                <InfoRow
                  icon={<Briefcase className="h-4 w-4" />}
                  label="工作经验"
                  value={position.work_experience || "不限"}
                />
                <InfoRow
                  icon={<MapPin className="h-4 w-4" />}
                  label="户籍要求"
                  value={position.household_requirement || "不限"}
                />
              </div>

              {position.other_conditions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">其他条件</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {position.other_conditions}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>时间信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="报名开始"
                  value={formatDateTime(position.registration_start)}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="报名截止"
                  value={formatDateTime(position.registration_end)}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="笔试时间"
                  value={formatDate(position.exam_date)}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="面试时间"
                  value={position.interview_date || "-"}
                />
                {position.service_period && (
                  <InfoRow
                    icon={<Clock className="h-4 w-4" />}
                    label="服务期限"
                    value={position.service_period}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>其他信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="招录单位"
                  value={position.department_name}
                  fullWidth
                />
                <InfoRow
                  icon={<Building2 className="h-4 w-4" />}
                  label="单位层级"
                  value={position.department_level || "-"}
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="职位代码"
                  value={position.position_code || "-"}
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="考试类型"
                  value={position.exam_type || "-"}
                />
                <InfoRow
                  icon={<FileText className="h-4 w-4" />}
                  label="考试分类"
                  value={position.exam_category || "-"}
                />
                {position.remark && (
                  <>
                    <div className="md:col-span-2">
                      <h4 className="font-medium mb-2">备注</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {position.remark}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid gap-4 md:grid-cols-2">
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="创建时间"
                  value={formatDateTime(position.created_at)}
                />
                <InfoRow
                  icon={<RefreshCw className="h-4 w-4" />}
                  label="更新时间"
                  value={formatDateTime(position.updated_at)}
                />
                {position.parsed_at && (
                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="解析时间"
                    value={formatDateTime(position.parsed_at)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 关联公告和相似职位 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 关联公告 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              关联公告
            </CardTitle>
          </CardHeader>
          <CardContent>
            {position.announcements && position.announcements.length > 0 ? (
              <div className="space-y-3">
                {position.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/announcements/${announcement.id}`}
                        className="font-medium hover:text-primary line-clamp-2"
                      >
                        {announcement.title}
                      </Link>
                      {announcement.publish_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          发布时间：{formatDate(announcement.publish_date)}
                        </p>
                      )}
                    </div>
                    {announcement.source_url && (
                      <Button variant="ghost" size="sm" asChild className="shrink-0 ml-2">
                        <a
                          href={announcement.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Newspaper className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>暂无关联公告</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 相似职位推荐 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              相似职位推荐
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSimilar ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : similarPositions.length > 0 ? (
              <div className="space-y-3">
                {similarPositions.map((pos) => (
                  <Link
                    key={pos.id}
                    href={`/positions/${pos.id}`}
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium line-clamp-1">{pos.position_name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {pos.department_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            招{pos.recruit_count}人
                          </Badge>
                          {pos.province && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {pos.province}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {pos.is_unlimited_major && (
                          <Badge className="bg-green-100 text-green-700 text-xs">不限专业</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>暂无相似职位</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除职位 "{position.position_name}" 吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 信息行组件
function InfoRow({
  icon,
  label,
  value,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${fullWidth ? "md:col-span-2" : ""}`}>
      <div className="p-2 bg-muted rounded-lg shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
