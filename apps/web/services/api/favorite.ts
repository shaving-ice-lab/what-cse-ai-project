import request from "../request";
import { PositionBrief } from "./position";

// 收藏类型
export type FavoriteType = "position" | "announcement";

// 收藏项响应
export interface FavoriteResponse {
  id: number;
  favorite_type: FavoriteType;
  target_id: string;
  note?: string;
  folder_id?: number;
  created_at: string;
  position?: PositionBrief;
  announcement?: {
    id: number;
    title: string;
    exam_type?: string;
    province?: string;
    publish_date?: string;
  };
}

// 收藏列表响应
export interface FavoriteListResponse {
  favorites: FavoriteResponse[];
  total: number;
  page: number;
  page_size: number;
  stats?: Record<string, number>;
}

// 收藏夹
export interface FavoriteFolder {
  id: number;
  name: string;
  description?: string;
  color: string;
  sort_order: number;
  created_at: string;
}

// 收藏查询参数
export interface FavoriteQueryParams {
  favorite_type?: FavoriteType;
  folder_id?: number;
  page?: number;
  page_size?: number;
}

// 添加收藏请求
export interface AddFavoriteRequest {
  favorite_type: FavoriteType;
  target_id: string;
  note?: string;
  folder_id?: number;
}

export const favoriteApi = {
  // 获取收藏列表
  list: (params?: FavoriteQueryParams): Promise<FavoriteListResponse> =>
    request.get("/favorites", { params }),

  // 添加收藏
  add: (data: AddFavoriteRequest): Promise<void> =>
    request.post("/favorites", data),

  // 移除收藏 (by type and id)
  remove: (favoriteType: FavoriteType, targetId: string): Promise<void> =>
    request.delete(`/favorites/${favoriteType}/${targetId}`),

  // 批量移除收藏
  batchRemove: (ids: number[]): Promise<void> =>
    request.post("/favorites/batch-remove", { ids }),

  // 批量检查收藏状态
  checkFavorites: (
    favoriteType: FavoriteType,
    targetIds: string[]
  ): Promise<{ favorites: Record<string, boolean> }> =>
    request.get("/favorites/check", {
      params: { favorite_type: favoriteType, target_ids: targetIds.join(",") },
    }),

  // 导出收藏
  export: (favoriteType?: FavoriteType): Promise<{
    favorites: FavoriteResponse[];
    export_at: string;
  }> =>
    request.get("/favorites/export", {
      params: favoriteType ? { favorite_type: favoriteType } : {},
    }),

  // 获取收藏统计
  getStats: (): Promise<{ stats: Record<string, number> }> =>
    request.get("/favorites/stats"),

  // 更新收藏备注
  updateNote: (favoriteId: number, note: string): Promise<void> =>
    request.put(`/favorites/${favoriteId}/note`, { note }),

  // 移动收藏到文件夹
  moveToFolder: (favoriteId: number, folderId: number | null): Promise<void> =>
    request.put(`/favorites/${favoriteId}/move`, { folder_id: folderId }),

  // 收藏夹操作
  folders: {
    // 获取所有收藏夹
    list: (): Promise<{ folders: FavoriteFolder[] }> =>
      request.get("/favorites/folders"),

    // 创建收藏夹
    create: (data: {
      name: string;
      description?: string;
      color?: string;
    }): Promise<FavoriteFolder> => request.post("/favorites/folders", data),

    // 更新收藏夹
    update: (
      folderId: number,
      data: { name?: string; description?: string; color?: string }
    ): Promise<void> => request.put(`/favorites/folders/${folderId}`, data),

    // 删除收藏夹
    delete: (folderId: number): Promise<void> =>
      request.delete(`/favorites/folders/${folderId}`),
  },
};
