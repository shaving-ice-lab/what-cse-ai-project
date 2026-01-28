import { useState, useCallback } from "react";
import {
  favoriteApi,
  FavoriteType,
  FavoriteQueryParams,
  FavoriteListResponse,
  AddFavoriteRequest,
  FavoriteFolder,
} from "@/services/api/favorite";
import { toast } from "@what-cse/ui";

export function useFavorites() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FavoriteListResponse | null>(null);

  const fetchFavorites = useCallback(async (params?: FavoriteQueryParams) => {
    setLoading(true);
    try {
      const result = await favoriteApi.list(params);
      setData(result);
      return result;
    } catch (error) {
      toast.error("获取收藏列表失败");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (req: AddFavoriteRequest) => {
    try {
      await favoriteApi.add(req);
      toast.success("已添加到收藏");
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "收藏失败";
      if (message.includes("Already")) {
        toast.info("该项目已在收藏中");
      } else {
        toast.error(message);
      }
      return false;
    }
  }, []);

  const removeFavorite = useCallback(
    async (favoriteType: FavoriteType, targetId: string) => {
      try {
        await favoriteApi.remove(favoriteType, targetId);
        toast.success("已取消收藏");
        return true;
      } catch (error) {
        toast.error("取消收藏失败");
        return false;
      }
    },
    []
  );

  const batchRemove = useCallback(async (ids: number[]) => {
    try {
      await favoriteApi.batchRemove(ids);
      toast.success(`已取消 ${ids.length} 个收藏`);
      return true;
    } catch (error) {
      toast.error("批量取消收藏失败");
      return false;
    }
  }, []);

  const checkFavorites = useCallback(
    async (favoriteType: FavoriteType, targetIds: string[]) => {
      try {
        const result = await favoriteApi.checkFavorites(favoriteType, targetIds);
        return result.favorites;
      } catch (error) {
        return {};
      }
    },
    []
  );

  const exportFavorites = useCallback(async (favoriteType?: FavoriteType) => {
    try {
      const result = await favoriteApi.export(favoriteType);
      // 触发下载
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `favorites_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("导出成功");
      return result;
    } catch (error) {
      toast.error("导出失败");
      throw error;
    }
  }, []);

  return {
    loading,
    data,
    favorites: data?.favorites || [],
    total: data?.total || 0,
    stats: data?.stats || {},
    fetchFavorites,
    addFavorite,
    removeFavorite,
    batchRemove,
    checkFavorites,
    exportFavorites,
  };
}

export function useFavoriteFolders() {
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await favoriteApi.folders.list();
      setFolders(result.folders);
      return result.folders;
    } catch (error) {
      toast.error("获取收藏夹失败");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(
    async (name: string, description?: string, color?: string) => {
      try {
        const folder = await favoriteApi.folders.create({
          name,
          description,
          color,
        });
        setFolders((prev) => [...prev, folder]);
        toast.success("收藏夹创建成功");
        return folder;
      } catch (error) {
        toast.error("创建收藏夹失败");
        throw error;
      }
    },
    []
  );

  const updateFolder = useCallback(
    async (
      folderId: number,
      data: { name?: string; description?: string; color?: string }
    ) => {
      try {
        await favoriteApi.folders.update(folderId, data);
        setFolders((prev) =>
          prev.map((f) => (f.id === folderId ? { ...f, ...data } : f))
        );
        toast.success("收藏夹更新成功");
        return true;
      } catch (error) {
        toast.error("更新收藏夹失败");
        return false;
      }
    },
    []
  );

  const deleteFolder = useCallback(async (folderId: number) => {
    try {
      await favoriteApi.folders.delete(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      toast.success("收藏夹已删除");
      return true;
    } catch (error) {
      toast.error("删除收藏夹失败");
      return false;
    }
  }, []);

  return {
    loading,
    folders,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}
