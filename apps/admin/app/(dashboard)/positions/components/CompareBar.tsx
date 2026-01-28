"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Scale,
  X,
  ChevronUp,
  ChevronDown,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  Button,
  Badge,
  ScrollArea,
} from "@what-cse/ui";
import type { PositionBrief } from "@/types/position";

interface CompareBarProps {
  positions: PositionBrief[];
  maxCount?: number;
  onRemove: (id: number) => void;
  onClear: () => void;
}

export function CompareBar({
  positions,
  maxCount = 5,
  onRemove,
  onClear,
}: CompareBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [newItemId, setNewItemId] = useState<number | null>(null);
  const prevPositionsRef = useRef<number[]>([]);

  // 入场动画
  useEffect(() => {
    if (positions.length > 0 && !isVisible) {
      setIsVisible(true);
    } else if (positions.length === 0 && isVisible) {
      setIsVisible(false);
    }
  }, [positions.length, isVisible]);

  // 检测新添加的项目
  useEffect(() => {
    const currentIds = positions.map(p => p.id);
    const prevIds = prevPositionsRef.current;
    
    // 找到新添加的项目
    const newIds = currentIds.filter(id => !prevIds.includes(id));
    if (newIds.length > 0) {
      setNewItemId(newIds[0]);
      setTimeout(() => setNewItemId(null), 500); // 动画结束后清除
    }
    
    prevPositionsRef.current = currentIds;
  }, [positions]);

  // 处理移除动画
  const handleRemove = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemove(id);
      setRemovingId(null);
    }, 200);
  };

  if (positions.length === 0 && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      {/* 折叠状态 */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg transition-transform hover:scale-105">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-medium">职位对比</span>
            <Badge 
              variant="secondary" 
              className="ml-2 transition-all duration-200"
              style={{ transform: newItemId ? 'scale(1.1)' : 'scale(1)' }}
            >
              {positions.length}/{maxCount}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="transition-all hover:scale-105"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空
          </Button>
          <Button
            variant="default"
            size="sm"
            asChild
            onClick={(e) => e.stopPropagation()}
            className="transition-all hover:scale-105"
          >
            <Link href={`/positions/compare?ids=${positions.map((p) => p.id).join(",")}`}>
              开始对比
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 transition-transform duration-200"
            style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 展开状态 - 带动画 */}
      <div
        className={`border-t bg-muted/30 overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? "max-h-[150px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ScrollArea className="h-[120px]">
          <div className="flex gap-3 p-4">
            {positions.map((position, index) => (
              <div
                key={position.id}
                className={`relative flex-shrink-0 w-[200px] p-3 bg-background rounded-lg border shadow-sm transition-all duration-300 ${
                  removingId === position.id
                    ? "opacity-0 scale-95 -translate-y-2"
                    : newItemId === position.id
                    ? "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2"
                    : "opacity-100 scale-100"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <button
                  className="absolute -top-2 -right-2 p-1 bg-background border rounded-full shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:scale-110"
                  onClick={() => handleRemove(position.id)}
                >
                  <X className="h-3 w-3" />
                </button>
                <Link
                  href={`/positions/${position.id}`}
                  className="block"
                >
                  <h4 className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
                    {position.position_name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {position.department_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {position.recruit_count}人
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {position.province}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
            {positions.length < maxCount && (
              <div className="flex-shrink-0 w-[200px] p-3 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground transition-all hover:border-primary/50 hover:text-primary/70">
                <span className="text-sm">还可添加 {maxCount - positions.length} 个</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default CompareBar;
