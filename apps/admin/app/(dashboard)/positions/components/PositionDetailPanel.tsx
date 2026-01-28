"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  User,
  Flag,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Scale,
} from "lucide-react";
import {
  Button,
  Badge,
  Skeleton,
  ScrollArea,
  Separator,
} from "@what-cse/ui";
import { positionApi } from "@/services/position-api";
import type { PositionDetail } from "@/types/position";
import { PositionStatus, PositionStatusNames, PositionStatusColors } from "@/types/position";

interface PositionDetailPanelProps {
  positionId: number | null;
  onClose: () => void;
  onAddToCompare?: (id: number) => void;
  compareIds?: number[];
}

export function PositionDetailPanel({
  positionId,
  onClose,
  onAddToCompare,
  compareIds = [],
}: PositionDetailPanelProps) {
  const [position, setPosition] = useState<PositionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) {
      setPosition(null);
      return;
    }

    const fetchPosition = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await positionApi.getPosition(positionId);
        setPosition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "获取详情失败");
      } finally {
        setLoading(false);
      }
    };

    fetchPosition();
  }, [positionId]);

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

  if (!positionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p>选择职位查看详情</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Skeleton className="h-4 w-64" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (error || !position) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-muted-foreground">{error || "职位不存在"}</p>
        <Button variant="outline" className="mt-4" onClick={onClose}>
          关闭
        </Button>
      </div>
    );
  }

  const daysLeft = getDaysUntilDeadline(position.registration_end);
  const isInCompare = compareIds.includes(position.id);

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2">{position.position_name}</h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {position.department_name}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          {getStatusBadge(position.status)}
          {position.department_level && (
            <Badge variant="outline">{position.department_level}</Badge>
          )}
        </div>
      </div>

      {/* 内容 */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* 核心信息卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-700">{position.recruit_count || 1}</div>
              <div className="text-xs text-blue-600">招录人数</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <MapPin className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-green-700 line-clamp-1">
                {position.province}
              </div>
              <div className="text-xs text-green-600">{position.city || "全省"}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <GraduationCap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-purple-700">
                {position.education || "不限"}
              </div>
              <div className="text-xs text-purple-600">学历要求</div>
            </div>
          </div>

          {/* 快捷标签 */}
          <div className="flex flex-wrap gap-2">
            {position.is_unlimited_major && (
              <Badge className="bg-green-100 text-green-700 border-green-200">不限专业</Badge>
            )}
            {position.is_for_fresh_graduate && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">应届可报</Badge>
            )}
            {position.exam_type && (
              <Badge variant="outline">{position.exam_type}</Badge>
            )}
          </div>

          <Separator />

          {/* 招录条件 */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              招录条件
            </h4>
            <div className="space-y-2 text-sm">
              <InfoItem
                icon={<GraduationCap className="h-4 w-4" />}
                label="学历要求"
                value={position.education || "不限"}
              />
              <InfoItem
                icon={<GraduationCap className="h-4 w-4" />}
                label="学位要求"
                value={position.degree || "不限"}
              />
              <InfoItem
                icon={<FileText className="h-4 w-4" />}
                label="专业要求"
                value={position.major_requirement || "不限"}
                multiline
              />
              <InfoItem
                icon={<Flag className="h-4 w-4" />}
                label="政治面貌"
                value={position.political_status || "不限"}
              />
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="年龄要求"
                value={position.age || "不限"}
              />
              <InfoItem
                icon={<Briefcase className="h-4 w-4" />}
                label="工作经验"
                value={position.work_experience || "不限"}
              />
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="性别要求"
                value={position.gender || "不限"}
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="户籍要求"
                value={position.household_requirement || "不限"}
              />
            </div>
          </div>

          {position.other_conditions && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">其他条件</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {position.other_conditions}
                </p>
              </div>
            </>
          )}

          <Separator />

          {/* 时间信息 */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              时间信息
            </h4>
            <div className="space-y-2 text-sm">
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="报名开始"
                value={formatDate(position.registration_start)}
              />
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <span className="text-muted-foreground">报名截止</span>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(position.registration_end)}</span>
                    {daysLeft !== null && daysLeft >= 0 && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          daysLeft <= 3
                            ? "bg-red-100 text-red-700"
                            : daysLeft <= 7
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {daysLeft === 0 ? "今日截止" : `还剩${daysLeft}天`}
                      </Badge>
                    )}
                    {daysLeft !== null && daysLeft < 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                        已截止
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="笔试时间"
                value={formatDate(position.exam_date)}
              />
              {position.interview_date && (
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="面试时间"
                  value={position.interview_date}
                />
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* 底部操作 */}
      <div className="p-4 border-t shrink-0 flex items-center gap-2">
        {onAddToCompare && (
          <Button
            variant={isInCompare ? "secondary" : "outline"}
            className="flex-1"
            onClick={() => onAddToCompare(position.id)}
            disabled={isInCompare}
          >
            <Scale className="h-4 w-4 mr-2" />
            {isInCompare ? "已加入对比" : "加入对比"}
          </Button>
        )}
        <Button asChild className="flex-1">
          <Link href={`/positions/${position.id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            查看详情
          </Link>
        </Button>
      </div>
    </div>
  );
}

// 信息项组件
function InfoItem({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={`flex ${multiline ? "flex-col" : "items-center"} gap-2`}>
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        {icon}
        <span>{label}</span>
      </div>
      <span className={multiline ? "pl-6" : ""}>{value}</span>
    </div>
  );
}

export default PositionDetailPanel;
