"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Checkbox,
} from "@what-cse/ui";
import { PositionCard } from "./PositionCard";
import type { PositionBrief, PositionQueryParams } from "@/types/position";
import { PositionStatus, PositionStatusNames, PositionStatusColors } from "@/types/position";

type ViewMode = "table" | "card";
type SortField = "created_at" | "recruit_count" | "registration_end";

interface PositionListProps {
  positions: PositionBrief[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  selectedIds: number[];
  onPageChange: (page: number) => void;
  onSortChange: (field: SortField) => void;
  onSelectChange: (ids: number[]) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: number) => void;
  onBatchDelete?: () => void;
  onBatchStatusChange?: (status: number) => void;
}

export function PositionList({
  positions,
  total,
  loading,
  error,
  page,
  pageSize,
  sortBy = "created_at",
  sortOrder = "desc",
  selectedIds,
  onPageChange,
  onSortChange,
  onSelectChange,
  onDelete,
  onStatusChange,
  onBatchDelete,
  onBatchStatusChange,
}: PositionListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const totalPages = Math.ceil(total / pageSize);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange(positions.map((p) => p.id));
    } else {
      onSelectChange([]);
    }
  };

  // 单个选择
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectChange([...selectedIds, id]);
    } else {
      onSelectChange(selectedIds.filter((i) => i !== id));
    }
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

  const isAllSelected = positions.length > 0 && selectedIds.length === positions.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < positions.length;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* 列表头部 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium text-foreground">{total}</span> 条结果
            </p>

            {/* 批量操作 */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  已选 {selectedIds.length} 项
                </span>
                {onBatchStatusChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBatchStatusChange(PositionStatus.Published)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    批量发布
                  </Button>
                )}
                {onBatchDelete && (
                  <Button variant="destructive" size="sm" onClick={onBatchDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    批量删除
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 排序 */}
            <Select
              value={sortBy}
              onValueChange={(v) => onSortChange(v as SortField)}
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

            {/* 视图切换 */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "card" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("card")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* 表格视图 */}
        {viewMode === "table" && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      // @ts-ignore - indeterminate is valid but not typed
                      indeterminate={isSomeSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>职位名称</TableHead>
                  <TableHead className="hidden md:table-cell">招录单位</TableHead>
                  <TableHead className="w-[80px]">招录</TableHead>
                  <TableHead className="hidden lg:table-cell">地点</TableHead>
                  <TableHead className="hidden lg:table-cell">学历</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="hidden xl:table-cell">报名截止</TableHead>
                  <TableHead className="w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
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
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : positions.length > 0 ? (
                  positions.map((position) => {
                    const daysLeft = getDaysUntilDeadline(position.registration_end);
                    return (
                      <TableRow key={position.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(position.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(position.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/positions/${position.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {position.position_name}
                            </Link>
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
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-lg">{position.recruit_count}</span>
                          <span className="text-muted-foreground text-xs ml-1">人</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {position.province}
                          {position.city && `·${position.city}`}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {position.education || "-"}
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
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
                                  onClick={() => onStatusChange(position.id, PositionStatus.Published)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  审核通过
                                </DropdownMenuItem>
                              )}
                              {position.status === PositionStatus.Published && (
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(position.id, PositionStatus.Offline)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  下线
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete(position.id)}
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
                    <TableCell colSpan={9} className="h-24 text-center">
                      没有找到匹配的职位
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 卡片视图 */}
        {viewMode === "card" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))
            ) : positions.length > 0 ? (
              positions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  selected={selectedIds.includes(position.id)}
                  onSelect={(checked) => handleSelectOne(position.id, checked)}
                  onDelete={() => onDelete(position.id)}
                  onStatusChange={(status) => onStatusChange(position.id, status)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                没有找到匹配的职位
              </div>
            )}
          </div>
        )}

        {/* 分页 */}
        <div className="flex items-center justify-between px-2 py-4 mt-4">
          <p className="text-sm text-muted-foreground">
            第 {page}/{totalPages || 1} 页
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages || loading}
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PositionList;
