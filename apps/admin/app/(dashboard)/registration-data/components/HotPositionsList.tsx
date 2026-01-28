"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Users, Award } from "lucide-react";
import { Badge, Button } from "@what-cse/ui";
import type { PositionHotRank } from "@/types/registration-data";

interface HotPositionsListProps {
  positions: PositionHotRank[];
  type: "apply" | "ratio";
  showAll?: boolean;
}

export function HotPositionsList({ positions, type, showAll = false }: HotPositionsListProps) {
  const displayList = showAll ? positions : positions.slice(0, 10);

  if (displayList.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无数据
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayList.map((position, index) => (
        <div
          key={position.position_id}
          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          {/* 排名 */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                index < 3
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>

            {/* 职位信息 */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/positions/${position.position_id}`}
                className="font-medium hover:text-primary truncate block"
                title={position.position_name}
              >
                {position.position_name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="truncate" title={position.department_name}>
                  {position.department_name}
                </span>
                {position.province && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {position.province}
                      {position.city && `·${position.city}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="flex items-center gap-4 ml-4">
            {type === "apply" ? (
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-blue-600">
                  <Users className="h-4 w-4" />
                  {position.apply_count.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">报名人数</div>
              </div>
            ) : (
              <div className="text-right">
                <div className="flex items-center gap-1 text-lg font-bold text-red-600">
                  <Award className="h-4 w-4" />
                  {position.competition_ratio.toFixed(0)}:1
                </div>
                <div className="text-xs text-muted-foreground">竞争比</div>
              </div>
            )}

            <Badge
              variant="secondary"
              className="bg-green-50 text-green-700 whitespace-nowrap"
            >
              招{position.recruit_count}人
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
