import { useState, useCallback, useEffect } from "react";
import { toast } from "@what-cse/ui";
import {
  materialApi,
  MaterialBrief,
  MaterialCategory,
  MaterialStats,
  MaterialQueryParams,
  MaterialType,
  LearningMaterial,
} from "@/services/api/material";

/**
 * 素材列表 Hook
 */
export function useMaterials() {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchMaterials = useCallback(
    async (params?: MaterialQueryParams) => {
      setLoading(true);
      try {
        const result = await materialApi.getMaterials({
          page,
          page_size: pageSize,
          ...params,
        });
        setMaterials(result.materials || []);
        setTotal(result.total || 0);
        return result;
      } catch (error) {
        console.error("Failed to fetch materials:", error);
        toast.error("获取素材列表失败");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  const searchMaterials = useCallback(
    async (keyword: string, params?: MaterialQueryParams) => {
      setLoading(true);
      try {
        const result = await materialApi.searchMaterials(keyword, {
          page,
          page_size: pageSize,
          ...params,
        });
        setMaterials(result.materials || []);
        setTotal(result.total || 0);
        return result;
      } catch (error) {
        console.error("Failed to search materials:", error);
        toast.error("搜索素材失败");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  return {
    loading,
    materials,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchMaterials,
    searchMaterials,
  };
}

/**
 * 素材详情 Hook
 */
export function useMaterialDetail() {
  const [loading, setLoading] = useState(false);
  const [material, setMaterial] = useState<LearningMaterial | null>(null);

  const fetchMaterial = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const result = await materialApi.getMaterial(id);
      setMaterial(result);
      return result;
    } catch (error) {
      console.error("Failed to fetch material:", error);
      toast.error("获取素材详情失败");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    material,
    fetchMaterial,
  };
}

/**
 * 热门/精选素材 Hook
 */
export function useFeaturedMaterials() {
  const [loading, setLoading] = useState(false);
  const [hotMaterials, setHotMaterials] = useState<MaterialBrief[]>([]);
  const [featuredMaterials, setFeaturedMaterials] = useState<MaterialBrief[]>([]);

  const fetchHotMaterials = useCallback(async (limit?: number) => {
    try {
      const result = await materialApi.getHotMaterials(limit);
      setHotMaterials(result || []);
      return result;
    } catch (error) {
      console.error("Failed to fetch hot materials:", error);
      return [];
    }
  }, []);

  const fetchFeaturedMaterials = useCallback(async (limit?: number) => {
    try {
      const result = await materialApi.getFeaturedMaterials(limit);
      setFeaturedMaterials(result || []);
      return result;
    } catch (error) {
      console.error("Failed to fetch featured materials:", error);
      return [];
    }
  }, []);

  const fetchAll = useCallback(
    async (limit?: number) => {
      setLoading(true);
      try {
        await Promise.all([fetchHotMaterials(limit), fetchFeaturedMaterials(limit)]);
      } finally {
        setLoading(false);
      }
    },
    [fetchHotMaterials, fetchFeaturedMaterials]
  );

  return {
    loading,
    hotMaterials,
    featuredMaterials,
    fetchHotMaterials,
    fetchFeaturedMaterials,
    fetchAll,
  };
}

/**
 * 随机素材 Hook
 */
export function useRandomMaterials() {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialBrief[]>([]);

  const fetchRandomMaterials = useCallback(async (type?: MaterialType, count?: number) => {
    setLoading(true);
    try {
      const result = await materialApi.getRandomMaterials(type, count);
      setMaterials(result || []);
      return result;
    } catch (error) {
      console.error("Failed to fetch random materials:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    materials,
    fetchRandomMaterials,
  };
}

/**
 * 素材分类 Hook
 */
export function useMaterialCategories() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<MaterialCategory[]>([]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await materialApi.getCategories();
      setCategories(result.categories || []);
      return result.categories || [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryTree = useCallback(async () => {
    setLoading(true);
    try {
      const result = await materialApi.getCategoryTree();
      setCategoryTree(result.categories || []);
      return result.categories || [];
    } catch (error) {
      console.error("Failed to fetch category tree:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 扁平化分类（用于下拉选择）
  const flattenCategories = useCallback(
    (cats: MaterialCategory[], level = 0): { category: MaterialCategory; level: number }[] => {
      let result: { category: MaterialCategory; level: number }[] = [];
      for (const cat of cats) {
        result.push({ category: cat, level });
        if (cat.children && cat.children.length > 0) {
          result = result.concat(flattenCategories(cat.children, level + 1));
        }
      }
      return result;
    },
    []
  );

  return {
    loading,
    categories,
    categoryTree,
    fetchCategories,
    fetchCategoryTree,
    flattenCategories,
  };
}

/**
 * 素材统计 Hook
 */
export function useMaterialStats() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<MaterialStats | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const result = await materialApi.getMaterialStats();
      setStats(result);
      return result;
    } catch (error) {
      console.error("Failed to fetch material stats:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    stats,
    fetchStats,
  };
}

/**
 * 素材收藏 Hook
 */
export function useMaterialCollect() {
  const [loading, setLoading] = useState(false);
  const [collectedIds, setCollectedIds] = useState<Set<number>>(new Set());

  const collectMaterial = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await materialApi.collectMaterial(id);
      setCollectedIds((prev) => new Set([...prev, id]));
      toast.success("收藏成功");
      return true;
    } catch (error) {
      console.error("Failed to collect material:", error);
      toast.error("收藏失败");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uncollectMaterial = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await materialApi.uncollectMaterial(id);
      setCollectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("已取消收藏");
      return true;
    } catch (error) {
      console.error("Failed to uncollect material:", error);
      toast.error("取消收藏失败");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCollect = useCallback(
    async (id: number) => {
      if (collectedIds.has(id)) {
        return uncollectMaterial(id);
      } else {
        return collectMaterial(id);
      }
    },
    [collectedIds, collectMaterial, uncollectMaterial]
  );

  const isCollected = useCallback(
    (id: number) => {
      return collectedIds.has(id);
    },
    [collectedIds]
  );

  return {
    loading,
    collectedIds,
    collectMaterial,
    uncollectMaterial,
    toggleCollect,
    isCollected,
    setCollectedIds,
  };
}

/**
 * 我的素材收藏列表 Hook
 */
export function useMyMaterialCollects() {
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const fetchMyCollects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await materialApi.getMyCollects(page, pageSize);
      setMaterials(result.materials || []);
      setTotal(result.total || 0);
      return result;
    } catch (error) {
      console.error("Failed to fetch my collects:", error);
      toast.error("获取收藏列表失败");
      return null;
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  return {
    loading,
    materials,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
    fetchMyCollects,
  };
}

/**
 * 热点主题 Hook
 */
export function useThemeTopics() {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);

  const fetchThemeTopics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await materialApi.getThemeTopics();
      setTopics(result || []);
      return result;
    } catch (error) {
      console.error("Failed to fetch theme topics:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    topics,
    fetchThemeTopics,
  };
}
