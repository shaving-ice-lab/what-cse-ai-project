import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  announcementApi,
  type AnnouncementQueryParams,
  type AnnouncementBrief,
  type AnnouncementDetail,
  type AnnouncementListResponse,
  type AnnouncementStats,
  type FilterOptions,
  type ExamTypeStats,
  type ProvinceStats,
  type AnnouncementPosition,
} from "@/services/api/announcement";

// 获取公告列表
export function useAnnouncements(params?: AnnouncementQueryParams) {
  return useQuery<AnnouncementListResponse>({
    queryKey: ["announcements", params],
    queryFn: () => announcementApi.getAnnouncements(params),
    staleTime: 30000, // 30秒内不重新获取
  });
}

// 获取公告详情
export function useAnnouncementDetail(id: number) {
  return useQuery<AnnouncementDetail>({
    queryKey: ["announcement", id],
    queryFn: () => announcementApi.getDetail(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

// 获取统计数据
export function useAnnouncementStats() {
  return useQuery<AnnouncementStats>({
    queryKey: ["announcementStats"],
    queryFn: () => announcementApi.getStats(),
    staleTime: 60000,
  });
}

// 获取筛选选项
export function useAnnouncementFilterOptions() {
  return useQuery<FilterOptions>({
    queryKey: ["announcementFilterOptions"],
    queryFn: () => announcementApi.getFilterOptions(),
    staleTime: 300000, // 5分钟
  });
}

// 获取按考试类型统计
export function useExamTypeStats() {
  return useQuery<ExamTypeStats[]>({
    queryKey: ["announcementExamTypeStats"],
    queryFn: () => announcementApi.getStatsByExamType(),
    staleTime: 60000,
  });
}

// 获取按省份统计
export function useProvinceStats() {
  return useQuery<ProvinceStats[]>({
    queryKey: ["announcementProvinceStats"],
    queryFn: () => announcementApi.getStatsByProvince(),
    staleTime: 60000,
  });
}

// 获取热门公告
export function useHotAnnouncements(limit?: number) {
  return useQuery<AnnouncementBrief[]>({
    queryKey: ["hotAnnouncements", limit],
    queryFn: () => announcementApi.getHotAnnouncements(limit),
    staleTime: 60000,
  });
}

// 获取最新公告
export function useLatestAnnouncements(limit?: number) {
  return useQuery<AnnouncementBrief[]>({
    queryKey: ["latestAnnouncements", limit],
    queryFn: () => announcementApi.getLatest(limit),
    staleTime: 30000,
  });
}

// 获取正在报名的公告
export function useRegisteringAnnouncements(limit?: number) {
  return useQuery<AnnouncementBrief[]>({
    queryKey: ["registeringAnnouncements", limit],
    queryFn: () => announcementApi.getRegisteringAnnouncements(limit),
    staleTime: 30000,
  });
}

// 搜索公告
export function useSearchAnnouncements(keyword: string, params?: AnnouncementQueryParams) {
  return useQuery<AnnouncementListResponse>({
    queryKey: ["searchAnnouncements", keyword, params],
    queryFn: () => announcementApi.search(keyword, params),
    enabled: !!keyword,
    staleTime: 30000,
  });
}

// 获取公告关联职位
export function useAnnouncementPositions(id: number, params?: { page?: number; page_size?: number }) {
  return useQuery<{ positions: AnnouncementPosition[]; total: number }>({
    queryKey: ["announcementPositions", id, params],
    queryFn: () => announcementApi.getPositions(id, params),
    enabled: !!id,
    staleTime: 60000,
  });
}

// 获取收藏列表
export function useFavoriteAnnouncements(params?: { page?: number; page_size?: number }) {
  return useQuery<{ announcements: AnnouncementBrief[]; total: number }>({
    queryKey: ["favoriteAnnouncements", params],
    queryFn: () => announcementApi.getFavorites(params),
    staleTime: 30000,
  });
}

// 添加收藏
export function useAddAnnouncementFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => announcementApi.addFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteAnnouncements"] });
    },
  });
}

// 移除收藏
export function useRemoveAnnouncementFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => announcementApi.removeFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoriteAnnouncements"] });
    },
  });
}

export default {
  useAnnouncements,
  useAnnouncementDetail,
  useAnnouncementStats,
  useAnnouncementFilterOptions,
  useExamTypeStats,
  useProvinceStats,
  useHotAnnouncements,
  useLatestAnnouncements,
  useRegisteringAnnouncements,
  useSearchAnnouncements,
  useAnnouncementPositions,
  useFavoriteAnnouncements,
  useAddAnnouncementFavorite,
  useRemoveAnnouncementFavorite,
};
