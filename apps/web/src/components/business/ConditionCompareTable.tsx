import * as React from "react";
import { Check, X, AlertCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type MatchStatus = "match" | "mismatch" | "partial" | "unknown";

export interface ConditionItem {
  label: string;
  userValue: string | null;
  positionRequirement: string;
  status: MatchStatus;
  note?: string;
}

export interface ConditionCompareTableProps {
  conditions: ConditionItem[];
  title?: string;
  className?: string;
  showHeader?: boolean;
}

const statusConfig: Record<MatchStatus, { icon: React.ElementType; color: string; label: string }> =
  {
    match: {
      icon: Check,
      color: "text-green-600 bg-green-50",
      label: "符合",
    },
    mismatch: {
      icon: X,
      color: "text-red-600 bg-red-50",
      label: "不符合",
    },
    partial: {
      icon: AlertCircle,
      color: "text-yellow-600 bg-yellow-50",
      label: "部分符合",
    },
    unknown: {
      icon: Minus,
      color: "text-gray-500 bg-gray-50",
      label: "待确认",
    },
  };

export function ConditionCompareTable({
  conditions,
  title = "报考条件对比",
  className,
  showHeader = true,
}: ConditionCompareTableProps) {
  const matchCount = conditions.filter((c) => c.status === "match").length;
  const mismatchCount = conditions.filter((c) => c.status === "mismatch").length;
  const partialCount = conditions.filter((c) => c.status === "partial").length;

  const renderStatusIcon = (status: MatchStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <div
        className={cn("inline-flex items-center justify-center w-6 h-6 rounded-full", config.color)}
      >
        <Icon className="h-4 w-4" />
      </div>
    );
  };

  const renderStatusBadge = (status: MatchStatus) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={cn("font-normal", config.color)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              符合 {matchCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              部分符合 {partialCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              不符合 {mismatchCount}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">条件项</TableHead>
              <TableHead>岗位要求</TableHead>
              <TableHead>我的条件</TableHead>
              <TableHead className="w-[100px] text-center">匹配状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions.map((condition, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{condition.label}</TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {condition.positionRequirement || "不限"}
                  </span>
                </TableCell>
                <TableCell>
                  {condition.userValue ? (
                    <span>{condition.userValue}</span>
                  ) : (
                    <span className="text-muted-foreground">未填写</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    {renderStatusIcon(condition.status)}
                    {condition.note && (
                      <span className="text-xs text-muted-foreground text-center">
                        {condition.note}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {mismatchCount > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            <strong>注意：</strong>
            您有 {mismatchCount} 项条件不符合该职位要求，建议谨慎报考。
          </p>
        </div>
      )}
    </div>
  );
}

export function MultiPositionCompareTable({
  positions,
  conditions,
  className,
}: {
  positions: { id: string; name: string }[];
  conditions: {
    label: string;
    values: Record<string, string>;
  }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold">职位对比</h3>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] sticky left-0 bg-background">条件项</TableHead>
              {positions.map((position) => (
                <TableHead key={position.id} className="min-w-[150px]">
                  {position.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {conditions.map((condition, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium sticky left-0 bg-background">
                  {condition.label}
                </TableCell>
                {positions.map((position) => (
                  <TableCell key={position.id}>{condition.values[position.id] || "-"}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ConditionCompareTable;
