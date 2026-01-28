"use client";

import Link from "next/link";
import {
  MapPin,
  Users,
  GraduationCap,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Trash2,
  MoreHorizontal,
  Building2,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@what-cse/ui";
import type { PositionBrief } from "@/types/position";
import { PositionStatus, PositionStatusNames, PositionStatusColors } from "@/types/position";

interface PositionCardProps {
  position: PositionBrief;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDelete?: () => void;
  onStatusChange?: (status: number) => void;
}

export function PositionCard({
  position,
  selected = false,
  onSelect,
  onDelete,
  onStatusChange,
}: PositionCardProps) {
  // 格式化日期
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
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

  const daysLeft = getDaysUntilDeadline(position.registration_end);

  return (
    <Card className={`transition-all hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {onSelect && (
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="mt-1"
              />
            )}
            <div className="flex-1 min-w-0">
              <Link
                href={`/positions/${position.id}`}
                className="font-semibold text-lg hover:text-primary line-clamp-1"
              >
                {position.position_name}
              </Link>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{position.department_name}</span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/positions/${position.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  查看详情
                </Link>
              </DropdownMenuItem>
              {onStatusChange && position.status === PositionStatus.Pending && (
                <DropdownMenuItem onClick={() => onStatusChange(PositionStatus.Published)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  审核通过
                </DropdownMenuItem>
              )}
              {onStatusChange && position.status === PositionStatus.Published && (
                <DropdownMenuItem onClick={() => onStatusChange(PositionStatus.Offline)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  下线
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* 核心信息 */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-lg font-bold">{position.recruit_count}</span>
            <span className="text-xs text-muted-foreground">人</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {position.province}
              {position.city && `·${position.city}`}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>{position.education || "不限"}</span>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {position.is_unlimited_major && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              不限专业
            </Badge>
          )}
          {position.is_for_fresh_graduate && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              应届可报
            </Badge>
          )}
          {position.department_level && (
            <Badge variant="outline">{position.department_level}</Badge>
          )}
          {position.exam_type && (
            <Badge variant="outline">{position.exam_type}</Badge>
          )}
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {getStatusBadge(position.status)}
          </div>
          {position.registration_end && (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">截止 {formatDate(position.registration_end)}</span>
              {daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    daysLeft <= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {daysLeft === 0 ? "今日" : `${daysLeft}天`}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PositionCard;
