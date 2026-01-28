import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  positionApi,
  type PositionQueryParams,
  type PositionStats,
  type FilterOptions,
  type PositionBrief,
} from "@/services/api/position";

// 获取职位列表（增强版）
export function usePositions(params?: PositionQueryParams) {
  return useQuery({
    queryKey: ["positions", params],
    queryFn: () => positionApi.getPositions(params),
  });
}

// 兼容旧版列表 API
export function usePositionList(params: PositionQueryParams) {
  return useQuery({
    queryKey: ["positions", params],
    queryFn: () => positionApi.list(params),
  });
}

// 获取职位详情
export function usePositionDetail(id: number) {
  return useQuery({
    queryKey: ["position", id],
    queryFn: () => positionApi.detail(id),
    enabled: !!id,
  });
}

// 获取职位统计
export function usePositionStats() {
  return useQuery({
    queryKey: ["position-stats"],
    queryFn: () => positionApi.getStats(),
    staleTime: 60 * 1000, // 1分钟内不重新请求
  });
}

// 获取筛选选项
export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: () => positionApi.getFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });
}

// 获取热门职位
export function useHotPositions(limit = 10) {
  return useQuery({
    queryKey: ["hot-positions", limit],
    queryFn: () => positionApi.getHotPositions(limit),
    staleTime: 5 * 60 * 1000,
  });
}

// 获取即将截止职位
export function useExpiringPositions(days = 7, limit = 10) {
  return useQuery({
    queryKey: ["expiring-positions", days, limit],
    queryFn: () => positionApi.getExpiringPositions(days, limit),
    staleTime: 5 * 60 * 1000,
  });
}

// 获取最新职位
export function useLatestPositions(limit = 10) {
  return useQuery({
    queryKey: ["latest-positions", limit],
    queryFn: () => positionApi.getLatestPositions(limit),
    staleTime: 60 * 1000,
  });
}

// 获取趋势数据
export function usePositionTrends(days = 30) {
  return useQuery({
    queryKey: ["position-trends", days],
    queryFn: () => positionApi.getTrends(days),
    staleTime: 5 * 60 * 1000,
  });
}

// 搜索职位
export function useSearchPositions(keyword: string, params?: Omit<PositionQueryParams, "keyword">) {
  return useQuery({
    queryKey: ["search-positions", keyword, params],
    queryFn: () => positionApi.search(keyword, params),
    enabled: keyword.length > 0,
  });
}

// 收藏列表
export function useFavorites(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: ["favorites", page, pageSize],
    queryFn: () => positionApi.getFavorites(page, pageSize),
  });
}

// 添加收藏
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: number) => positionApi.addFavorite(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["position"] });
    },
  });
}

// 移除收藏
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (positionId: number) => positionApi.removeFavorite(positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["position"] });
    },
  });
}

// 职位对比（基础版）
export function useComparePositions(ids: number[]) {
  return useQuery({
    queryKey: ["compare", ids],
    queryFn: () => positionApi.compare(ids),
    enabled: ids.length >= 2,
  });
}

// 职位对比（增强版 - 含 AI 分析）
export function useComparePositionsEnhanced(ids: number[]) {
  return useQuery({
    queryKey: ["compare-enhanced", ids],
    queryFn: () => positionApi.compareEnhanced(ids),
    enabled: ids.length >= 2,
  });
}

// 职位历年数据
export function usePositionHistory(positionId: number) {
  return useQuery({
    queryKey: ["position-history", positionId],
    queryFn: () => positionApi.getPositionHistory(positionId),
    enabled: !!positionId,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });
}
