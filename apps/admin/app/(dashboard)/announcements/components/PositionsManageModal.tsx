"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Search,
  X,
  Loader2,
  Trash2,
  Plus,
  Link2,
  Link2Off,
  Building2,
  Users,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Badge,
  Checkbox,
  Skeleton,
  ScrollArea,
} from "@what-cse/ui";
import { announcementApi } from "@/services/announcement-api";
import { positionApi } from "@/services/position-api";
import type { PositionBrief } from "@/types/position";

interface PositionsManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: number;
  announcementTitle: string;
  onSuccess?: () => void;
}

interface LinkedPosition {
  id: number;
  position_name: string;
  department_name?: string;
  recruit_count: number;
  education?: string;
}

export function PositionsManageModal({
  open,
  onOpenChange,
  announcementId,
  announcementTitle,
  onSuccess,
}: PositionsManageModalProps) {
  // 已关联的职位
  const [linkedPositions, setLinkedPositions] = useState<LinkedPosition[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(false);
  
  // 搜索添加职位
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PositionBrief[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // 操作状态
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 当前 Tab
  const [activeTab, setActiveTab] = useState<"linked" | "search">("linked");

  // 加载已关联职位
  const fetchLinkedPositions = useCallback(async () => {
    if (!announcementId) return;
    
    try {
      setLinkedLoading(true);
      setError(null);
      const data = await announcementApi.getAnnouncementPositions(announcementId);
      setLinkedPositions(data.positions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取关联职位失败");
    } finally {
      setLinkedLoading(false);
    }
  }, [announcementId]);

  // 搜索职位
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      const data = await positionApi.getPositions({
        keyword: searchTerm,
        page_size: 20,
      });
      // 过滤掉已关联的职位
      const linkedIds = new Set(linkedPositions.map((p) => p.id));
      setSearchResults((data.positions || []).filter((p) => !linkedIds.has(p.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索职位失败");
    } finally {
      setSearchLoading(false);
    }
  }, [searchTerm, linkedPositions]);

  // 关联选中的职位
  const handleLinkPositions = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setLinking(true);
      setError(null);
      await announcementApi.linkPositions(announcementId, selectedIds);
      setSelectedIds([]);
      setSearchTerm("");
      setSearchResults([]);
      await fetchLinkedPositions();
      setActiveTab("linked");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "关联职位失败");
    } finally {
      setLinking(false);
    }
  };

  // 取消关联职位
  const handleUnlinkPosition = async (positionId: number) => {
    try {
      setUnlinking(true);
      setError(null);
      await announcementApi.unlinkPositions(announcementId, [positionId]);
      await fetchLinkedPositions();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "取消关联失败");
    } finally {
      setUnlinking(false);
    }
  };

  // 批量取消关联
  const handleBatchUnlink = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要取消关联选中的 ${selectedIds.length} 个职位吗？`)) return;
    
    try {
      setUnlinking(true);
      setError(null);
      await announcementApi.unlinkPositions(announcementId, selectedIds);
      setSelectedIds([]);
      await fetchLinkedPositions();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "批量取消关联失败");
    } finally {
      setUnlinking(false);
    }
  };

  // 切换选择
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 初始化加载
  useEffect(() => {
    if (open && announcementId) {
      fetchLinkedPositions();
      setSelectedIds([]);
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
      setActiveTab("linked");
    }
  }, [open, announcementId, fetchLinkedPositions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            关联职位管理
          </DialogTitle>
          <DialogDescription className="line-clamp-1">
            {announcementTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Tab 切换 */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            variant={activeTab === "linked" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("linked")}
          >
            <Link2 className="h-4 w-4 mr-1" />
            已关联 ({linkedPositions.length})
          </Button>
          <Button
            variant={activeTab === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("search")}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加职位
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* 已关联职位列表 */}
        {activeTab === "linked" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 批量操作 */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between py-2 px-1 bg-muted/50 rounded-lg mb-2">
                <span className="text-sm text-muted-foreground">
                  已选 {selectedIds.length} 项
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchUnlink}
                  disabled={unlinking}
                >
                  <Link2Off className="h-4 w-4 mr-1" />
                  批量取消关联
                </Button>
              </div>
            )}
            
            <ScrollArea className="flex-1">
              {linkedLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : linkedPositions.length > 0 ? (
                <div className="space-y-2">
                  {linkedPositions.map((position) => (
                    <div
                      key={position.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.includes(position.id)}
                        onCheckedChange={() => toggleSelect(position.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{position.position_name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          {position.department_name && (
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              {position.department_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {position.recruit_count}人
                          </span>
                          {position.education && (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {position.education}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={`/positions/${position.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleUnlinkPosition(position.id)}
                          disabled={unlinking}
                        >
                          <Link2Off className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mb-4 opacity-30" />
                  <p>暂无关联职位</p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveTab("search")}
                    className="mt-2"
                  >
                    点击添加职位
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* 搜索添加职位 */}
        {activeTab === "search" && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* 搜索框 */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索职位名称、单位..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={searchLoading}>
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "搜索"
                )}
              </Button>
            </div>

            {/* 选中操作 */}
            {selectedIds.length > 0 && (
              <div className="flex items-center justify-between py-2 px-3 bg-primary/10 rounded-lg mb-2">
                <span className="text-sm">
                  已选 {selectedIds.length} 个职位
                </span>
                <Button
                  size="sm"
                  onClick={handleLinkPositions}
                  disabled={linking}
                >
                  {linking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-1" />
                  )}
                  关联选中
                </Button>
              </div>
            )}

            {/* 搜索结果 */}
            <ScrollArea className="flex-1">
              {searchLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((position) => (
                    <div
                      key={position.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedIds.includes(position.id)
                          ? "bg-primary/5 border-primary/30"
                          : "hover:bg-muted/30"
                      }`}
                      onClick={() => toggleSelect(position.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(position.id)}
                        onCheckedChange={() => toggleSelect(position.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{position.position_name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                          {position.department_name && (
                            <span className="flex items-center gap-1 truncate">
                              <Building2 className="h-3 w-3 flex-shrink-0" />
                              {position.department_name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {position.recruit_count}人
                          </span>
                          {position.exam_type && (
                            <Badge variant="outline" className="text-xs">
                              {position.exam_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-30" />
                  <p>未找到匹配的职位</p>
                  <p className="text-sm mt-1">尝试使用其他关键词搜索</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mb-4 opacity-30" />
                  <p>输入关键词搜索职位</p>
                  <p className="text-sm mt-1">可以搜索职位名称、招录单位等</p>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
