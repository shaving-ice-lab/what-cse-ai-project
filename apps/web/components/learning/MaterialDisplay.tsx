"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  Heart,
  MessageCircle,
  BookmarkPlus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Quote,
  User,
  FileText,
  Sparkles,
  Tag,
  ExternalLink,
} from "lucide-react";

// 素材类型
export type MaterialType = "quote" | "case" | "sentence" | "example";

// 素材分类
export interface MaterialCategory {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

// 素材数据
export interface MaterialData {
  id: string;
  type: MaterialType;
  content: string;
  author?: string;
  source?: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  usageScenarios?: string[]; // 适用场景
  analysis?: string; // 使用分析/解读
  relatedMaterials?: string[];
  createdAt?: Date;
  isFeatured?: boolean;
}

interface MaterialCardProps {
  material: MaterialData;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onCopy?: (content: string) => void;
  onTagClick?: (tag: string) => void;
  onRelatedClick?: (id: string) => void;
  className?: string;
}

// 素材类型配置
const materialTypeConfig = {
  quote: {
    label: "名言警句",
    icon: Quote,
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
  },
  case: {
    label: "案例故事",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
  },
  sentence: {
    label: "优美语句",
    icon: Sparkles,
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
  },
  example: {
    label: "经典范例",
    icon: BookmarkPlus,
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
  },
};

// 单个素材卡片
export function MaterialCard({
  material,
  isFavorited = false,
  onFavoriteToggle,
  onCopy,
  onTagClick,
  onRelatedClick,
  className,
}: MaterialCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const config = materialTypeConfig[material.type];
  const TypeIcon = config.icon;

  // 复制内容
  const handleCopy = useCallback(async () => {
    try {
      const textToCopy = material.author
        ? `${material.content}\n——${material.author}${material.source ? `《${material.source}》` : ""}`
        : material.content;

      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  }, [material, onCopy]);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-md",
        config.borderColor,
        className
      )}
    >
      {/* 顶部标签 */}
      <div
        className={cn(
          "px-4 py-2 bg-gradient-to-r flex items-center justify-between",
          config.bgGradient
        )}
      >
        <div className="flex items-center gap-2">
          <TypeIcon className="w-4 h-4 text-stone-600" />
          <span className="text-sm font-medium text-stone-700">
            {config.label}
          </span>
          {material.isFeatured && (
            <span className="px-1.5 py-0.5 bg-amber-400 text-white text-xs rounded font-medium">
              精选
            </span>
          )}
        </div>
        <span className="text-xs text-stone-500">{material.category}</span>
      </div>

      {/* 主要内容 */}
      <div className="p-5">
        {/* 引用符号 */}
        {material.type === "quote" && (
          <Quote className="w-8 h-8 text-stone-200 mb-2" />
        )}

        {/* 内容 */}
        <div className="relative">
          <p
            className={cn(
              "text-stone-700 leading-relaxed",
              material.type === "quote"
                ? "text-lg font-medium italic"
                : "text-base"
            )}
          >
            {material.content}
          </p>
        </div>

        {/* 作者/来源 */}
        {(material.author || material.source) && (
          <div className="mt-4 flex items-center gap-2 text-sm text-stone-500">
            <User className="w-4 h-4" />
            {material.author && <span>{material.author}</span>}
            {material.source && (
              <span className="text-stone-400">《{material.source}》</span>
            )}
          </div>
        )}

        {/* 标签 */}
        {material.tags && material.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {material.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs text-stone-600 transition-colors"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* 展开详情 */}
        {(material.usageScenarios || material.analysis) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-sm text-amber-600 hover:text-amber-700 transition-colors"
          >
            {expanded ? "收起详情" : "查看使用技巧"}
          </button>
        )}

        {/* 展开的详情内容 */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-stone-100 space-y-4">
            {/* 适用场景 */}
            {material.usageScenarios && material.usageScenarios.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">
                  适用场景
                </h4>
                <div className="flex flex-wrap gap-2">
                  {material.usageScenarios.map((scenario, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                    >
                      {scenario}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 使用分析 */}
            {material.analysis && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">
                  使用技巧
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {material.analysis}
                </p>
              </div>
            )}

            {/* 相关素材 */}
            {material.relatedMaterials && material.relatedMaterials.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">
                  相关素材
                </h4>
                <div className="flex flex-wrap gap-2">
                  {material.relatedMaterials.map((id) => (
                    <button
                      key={id}
                      onClick={() => onRelatedClick?.(id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-xs text-stone-600 transition-colors"
                    >
                      {id}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* 复制 */}
          <button
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-lg transition-colors",
              copied
                ? "bg-emerald-50 text-emerald-600"
                : "hover:bg-stone-100 text-stone-500"
            )}
            title="复制"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* 收藏 */}
          <button
            onClick={() => onFavoriteToggle?.(material.id)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isFavorited
                ? "bg-red-50 text-red-500"
                : "hover:bg-stone-100 text-stone-500"
            )}
            title={isFavorited ? "取消收藏" : "收藏"}
          >
            <Heart
              className={cn("w-4 h-4", isFavorited && "fill-current")}
            />
          </button>

          {/* 分享 */}
          <button
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            title="分享"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {copied && (
          <span className="text-xs text-emerald-600">已复制到剪贴板</span>
        )}
      </div>
    </div>
  );
}

// 素材轮播组件
interface MaterialCarouselProps {
  materials: MaterialData[];
  favoritedIds?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

export function MaterialCarousel({
  materials,
  favoritedIds = new Set(),
  onFavoriteToggle,
  onCopy,
  className,
}: MaterialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? materials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === materials.length - 1 ? 0 : prev + 1));
  };

  if (materials.length === 0) return null;

  const currentMaterial = materials[currentIndex];

  return (
    <div className={cn("relative", className)}>
      {/* 导航按钮 - 左 */}
      <button
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-stone-600" />
      </button>

      {/* 卡片 */}
      <MaterialCard
        material={currentMaterial}
        isFavorited={favoritedIds.has(currentMaterial.id)}
        onFavoriteToggle={onFavoriteToggle}
        onCopy={onCopy}
      />

      {/* 导航按钮 - 右 */}
      <button
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-stone-600" />
      </button>

      {/* 指示器 */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {materials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "w-6 bg-amber-500"
                : "bg-stone-300 hover:bg-stone-400"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// 素材列表/库组件
interface MaterialLibraryProps {
  materials: MaterialData[];
  categories: MaterialCategory[];
  favoritedIds?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  onCopy?: (content: string) => void;
  onTagClick?: (tag: string) => void;
  className?: string;
}

export function MaterialLibrary({
  materials,
  categories,
  favoritedIds = new Set(),
  onFavoriteToggle,
  onCopy,
  onTagClick,
  className,
}: MaterialLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    materials.forEach((m) => m.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [materials]);

  // 过滤素材
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesContent = material.content.toLowerCase().includes(query);
        const matchesAuthor = material.author?.toLowerCase().includes(query);
        const matchesTags = material.tags?.some((t) =>
          t.toLowerCase().includes(query)
        );
        if (!matchesContent && !matchesAuthor && !matchesTags) return false;
      }

      // 类型过滤
      if (selectedType && material.type !== selectedType) return false;

      // 分类过滤
      if (selectedCategory && material.category !== selectedCategory) return false;

      // 标签过滤
      if (selectedTag && !material.tags?.includes(selectedTag)) return false;

      // 收藏过滤
      if (showFavoritesOnly && !favoritedIds.has(material.id)) return false;

      return true;
    });
  }, [
    materials,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedTag,
    showFavoritesOnly,
    favoritedIds,
  ]);

  // 清除所有筛选
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType(null);
    setSelectedCategory(null);
    setSelectedTag(null);
    setShowFavoritesOnly(false);
  };

  const hasFilters =
    searchQuery ||
    selectedType ||
    selectedCategory ||
    selectedTag ||
    showFavoritesOnly;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 搜索和筛选 */}
      <div className="space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索素材内容、作者、标签..."
            className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded"
            >
              <X className="w-3 h-3 text-stone-400" />
            </button>
          )}
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 类型筛选 */}
          <div className="flex items-center gap-1">
            {(Object.keys(materialTypeConfig) as MaterialType[]).map((type) => {
              const config = materialTypeConfig[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() =>
                    setSelectedType(selectedType === type ? null : type)
                  }
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    selectedType === type
                      ? `bg-gradient-to-r ${config.gradient} text-white`
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* 收藏筛选 */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors",
              showFavoritesOnly
                ? "bg-red-50 border-red-200 text-red-600"
                : "border-stone-200 text-stone-600 hover:bg-stone-50"
            )}
          >
            <Heart
              className={cn("w-3.5 h-3.5", showFavoritesOnly && "fill-current")}
            />
            收藏
          </button>

          {/* 清除筛选 */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>

        {/* 热门标签 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-stone-500 py-1">热门标签:</span>
            {allTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-2 py-1 rounded text-xs transition-colors",
                  selectedTag === tag
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 统计 */}
      <div className="text-sm text-stone-500">
        共 {filteredMaterials.length} 条素材
        {hasFilters && " (已筛选)"}
      </div>

      {/* 素材列表 */}
      {filteredMaterials.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              isFavorited={favoritedIds.has(material.id)}
              onFavoriteToggle={onFavoriteToggle}
              onCopy={onCopy}
              onTagClick={(tag) => setSelectedTag(tag)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">没有找到匹配的素材</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-sm text-amber-600 hover:text-amber-700"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MaterialCard;
