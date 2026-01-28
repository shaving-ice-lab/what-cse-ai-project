import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matchApi, MatchParams, MatchWeights } from "@/services/api/match";

// =====================================================
// 查询 Hooks
// =====================================================

/**
 * 获取匹配结果列表
 */
export function useMatchResults(params: MatchParams = {}) {
  const { page = 1, page_size = 20, ...rest } = params;

  return useQuery({
    queryKey: ["match-results", page, page_size, rest],
    queryFn: () => matchApi.getMatches({ page, page_size, ...rest }),
    staleTime: 5 * 60 * 1000, // 5 分钟内不重新请求
  });
}

/**
 * 获取匹配预览（快速）
 */
export function useMatchPreview(limit = 5) {
  return useQuery({
    queryKey: ["match-preview", limit],
    queryFn: () => matchApi.getPreview(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取单个职位的匹配详情
 */
export function usePositionMatchDetail(positionId: number, enabled = true) {
  return useQuery({
    queryKey: ["position-match-detail", positionId],
    queryFn: () => matchApi.getPositionMatchDetail(positionId),
    enabled: enabled && positionId > 0,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取匹配维度统计
 */
export function useMatchStats() {
  return useQuery({
    queryKey: ["match-stats"],
    queryFn: () => matchApi.getStats(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取匹配报告
 */
export function useMatchReport() {
  return useQuery({
    queryKey: ["match-report"],
    queryFn: () => matchApi.getReport(),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * 获取当前权重配置
 */
export function useMatchWeights() {
  return useQuery({
    queryKey: ["match-weights"],
    queryFn: () => matchApi.getWeights(),
    staleTime: 30 * 60 * 1000,
  });
}

// =====================================================
// 修改 Hooks
// =====================================================

/**
 * 更新权重配置
 */
export function useUpdateMatchWeights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weights: MatchWeights) => matchApi.updateWeights(weights),
    onSuccess: () => {
      // 使相关缓存失效
      queryClient.invalidateQueries({ queryKey: ["match-weights"] });
      queryClient.invalidateQueries({ queryKey: ["match-results"] });
      queryClient.invalidateQueries({ queryKey: ["match-preview"] });
      queryClient.invalidateQueries({ queryKey: ["match-stats"] });
      queryClient.invalidateQueries({ queryKey: ["match-report"] });
    },
  });
}

/**
 * 执行智能匹配
 */
export function usePerformMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MatchParams) => matchApi.postMatch(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-results"] });
      queryClient.invalidateQueries({ queryKey: ["match-preview"] });
    },
  });
}

// =====================================================
// 辅助函数
// =====================================================

/**
 * 根据匹配分数获取颜色
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 90) return "emerald";
  if (score >= 70) return "amber";
  if (score >= 50) return "orange";
  return "stone";
}

/**
 * 根据匹配分数获取标签
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配度低";
}

/**
 * 根据星级获取显示文本
 */
export function getStarLevelText(stars: number): string {
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}
