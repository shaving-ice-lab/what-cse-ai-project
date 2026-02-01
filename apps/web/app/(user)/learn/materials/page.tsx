"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Palette,
  Quote,
  Briefcase,
  FileText,
  Flame,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Filter,
  X,
  Copy,
  Check,
  Heart,
  ChevronDown,
  Sparkles,
  Star,
  Shuffle,
  LayoutGrid,
  List,
  Eye,
  Target,
  Award,
  ArrowUp,
  Menu,
  Share2,
  SortAsc,
  Clock,
  TrendingUp,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Zap,
  History,
  Twitter,
  Send,
  Link2,
  Focus,
  Moon,
  Sun,
  GalleryVerticalEnd,
  RefreshCw,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button, Badge } from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import { toast } from "@what-cse/ui";
import { useAuthStore } from "@/stores/authStore";
import {
  useMaterials,
  useMaterialCategories,
  useMaterialStats,
  useMaterialCollect,
  useThemeTopics,
  useFeaturedMaterials,
  useRandomMaterials,
} from "@/hooks/useMaterial";
import {
  MaterialType,
  MaterialBrief,
  materialTypeNames,
  materialTypeColors,
} from "@/services/api/material";

// 类型图标映射
const typeIcons: Record<MaterialType, React.ReactNode> = {
  quote: <Quote className="h-4 w-4" />,
  case: <Briefcase className="h-4 w-4" />,
  sentence: <FileText className="h-4 w-4" />,
  hot_topic: <Flame className="h-4 w-4" />,
  interview: <MessageSquare className="h-4 w-4" />,
  knowledge: <BookOpen className="h-4 w-4" />,
  formula: <Lightbulb className="h-4 w-4" />,
  mnemonic: <Lightbulb className="h-4 w-4" />,
  template: <FileText className="h-4 w-4" />,
  vocabulary: <BookOpen className="h-4 w-4" />,
};

// 大图标映射
const typeLargeIcons: Record<MaterialType, React.ReactNode> = {
  quote: <Quote className="h-5 w-5" />,
  case: <Briefcase className="h-5 w-5" />,
  sentence: <FileText className="h-5 w-5" />,
  hot_topic: <Flame className="h-5 w-5" />,
  interview: <MessageSquare className="h-5 w-5" />,
  knowledge: <BookOpen className="h-5 w-5" />,
  formula: <Lightbulb className="h-5 w-5" />,
  mnemonic: <Lightbulb className="h-5 w-5" />,
  template: <FileText className="h-5 w-5" />,
  vocabulary: <BookOpen className="h-5 w-5" />,
};

// 排序选项
const sortOptions = [
  { value: "newest", label: "最新发布", icon: Clock },
  { value: "popular", label: "最多浏览", icon: TrendingUp },
  { value: "collected", label: "最多收藏", icon: Heart },
];

// 阅读时间估算
function estimateReadTime(content: string): number {
  const wordsPerMinute = 300; // 中文阅读速度
  return Math.max(1, Math.ceil(content.length / wordsPerMinute));
}

// 本地存储键
const RECENT_VIEWED_KEY = "materials_recent_viewed";
const MAX_RECENT_ITEMS = 10;

// 获取最近浏览
function getRecentViewed(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_VIEWED_KEY) || "[]");
  } catch {
    return [];
  }
}

// 保存最近浏览
function saveRecentViewed(id: number) {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentViewed().filter((i) => i !== id);
    recent.unshift(id);
    localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_ITEMS)));
  } catch {}
}

// 骨架屏卡片
function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-stone-200 overflow-hidden",
        compact && "rounded-xl"
      )}
    >
      <div
        className={cn(
          "bg-gradient-to-r from-stone-200 to-stone-100 animate-shimmer",
          compact ? "h-10" : "h-12"
        )}
      />
      <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <div className={cn("bg-stone-200 rounded w-3/4 animate-pulse", compact ? "h-4" : "h-5")} />
        <div className="space-y-2">
          <div
            className="h-4 bg-stone-100 rounded w-full animate-pulse"
            style={{ animationDelay: "100ms" }}
          />
          <div
            className="h-4 bg-stone-100 rounded w-full animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          {!compact && (
            <div
              className="h-4 bg-stone-100 rounded w-2/3 animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          )}
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-14 bg-stone-100 rounded-full animate-pulse" />
          <div
            className="h-5 w-14 bg-stone-100 rounded-full animate-pulse"
            style={{ animationDelay: "100ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// 分享弹窗
function SharePopover({ material, onClose }: { material: MaterialBrief; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const shareText = material.author
    ? `${material.content}\n——${material.author}${material.source ? `《${material.source}》` : ""}`
    : material.content;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
    setCopied(true);
    toast.success("已复制分享内容");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareText.slice(0, 200) + "...");
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const handleShareWeibo = () => {
    const text = encodeURIComponent(shareText.slice(0, 140));
    window.open(`https://service.weibo.com/share/share.php?title=${text}`, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl border border-stone-200 shadow-xl p-3 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200">
        <p className="text-xs font-medium text-stone-500 mb-2 px-1">分享到</p>
        <div className="space-y-1">
          <button
            onClick={handleShareTwitter}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Twitter className="w-4 h-4 text-blue-400" />
            Twitter
          </button>
          <button
            onClick={handleShareWeibo}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Send className="w-4 h-4 text-red-500" />
            微博
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Link2 className="w-4 h-4 text-stone-400" />
            )}
            {copied ? "已复制" : "复制链接"}
          </button>
        </div>
      </div>
    </>
  );
}

// 沉浸阅读模式
function FocusModeView({
  material,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isCollected,
  onCollect,
}: {
  material: MaterialBrief | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isCollected: boolean;
  onCollect: (id: number) => void;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "+" || e.key === "=") setFontSize((s) => Math.min(28, s + 2));
      if (e.key === "-") setFontSize((s) => Math.max(14, s - 2));
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, hasPrev, hasNext]);

  if (!isOpen || !material) return null;

  const colors = materialTypeColors[material.type];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-colors duration-500",
        darkMode ? "bg-stone-900" : "bg-amber-50/95"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 transition-colors",
          darkMode ? "bg-stone-900/80" : "bg-white/80 border-b border-stone-200"
        )}
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={cn(
              "p-2 rounded-lg transition-colors",
              darkMode ? "hover:bg-stone-800 text-stone-400" : "hover:bg-stone-100 text-stone-500"
            )}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              colors.bg,
              colors.text
            )}
          >
            {typeIcons[material.type]}
            {materialTypeNames[material.type]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            className={cn(
              "p-2 rounded-lg transition-colors text-sm font-bold",
              darkMode ? "hover:bg-stone-800 text-stone-400" : "hover:bg-stone-100 text-stone-500"
            )}
          >
            A-
          </button>
          <span
            className={cn(
              "text-sm w-8 text-center",
              darkMode ? "text-stone-400" : "text-stone-500"
            )}
          >
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize((s) => Math.min(28, s + 2))}
            className={cn(
              "p-2 rounded-lg transition-colors text-sm font-bold",
              darkMode ? "hover:bg-stone-800 text-stone-400" : "hover:bg-stone-100 text-stone-500"
            )}
          >
            A+
          </button>
          <div className="w-px h-6 bg-stone-300 mx-2" />
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              darkMode ? "hover:bg-stone-800 text-amber-400" : "hover:bg-stone-100 text-stone-500"
            )}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-full pt-20 pb-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <h1
            className={cn(
              "text-2xl font-bold mb-8 transition-colors",
              darkMode ? "text-white" : "text-stone-800"
            )}
            style={{ fontSize: fontSize + 6 }}
          >
            {material.title}
          </h1>

          <div
            className={cn(
              "relative pl-6 border-l-4 transition-colors",
              darkMode ? "border-amber-500/50" : "border-amber-400"
            )}
          >
            <Quote
              className={cn(
                "absolute -left-4 -top-2 w-8 h-8 transition-colors",
                darkMode ? "text-amber-500/30 bg-stone-900" : "text-amber-300 bg-amber-50"
              )}
            />
            <p
              className={cn(
                "leading-loose whitespace-pre-wrap transition-colors",
                darkMode ? "text-stone-300" : "text-stone-700"
              )}
              style={{ fontSize }}
            >
              {material.content}
            </p>
          </div>

          {(material.author || material.source) && (
            <div
              className={cn(
                "mt-10 flex items-center gap-3 transition-colors",
                darkMode ? "text-stone-500" : "text-stone-400"
              )}
            >
              <span className="w-12 h-px bg-current opacity-30" />
              <p style={{ fontSize: fontSize - 2 }}>
                <span className={cn("font-medium", darkMode ? "text-stone-400" : "text-stone-600")}>
                  {material.author}
                </span>
                {material.source && <span className="ml-2">《{material.source}》</span>}
              </p>
            </div>
          )}

          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {material.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-colors",
                    darkMode
                      ? "bg-stone-800 text-stone-400"
                      : "bg-white text-stone-600 border border-stone-200"
                  )}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div
            className={cn(
              "flex items-center gap-6 mt-10 pt-6 border-t text-sm transition-colors",
              darkMode ? "border-stone-800 text-stone-500" : "border-stone-200 text-stone-400"
            )}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />约 {estimateReadTime(material.content)} 分钟
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {material.view_count} 浏览
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              {material.collect_count} 收藏
            </span>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div
        className={cn(
          "absolute bottom-0 inset-x-0 flex items-center justify-between px-6 py-4 transition-colors",
          darkMode ? "bg-stone-900/80" : "bg-white/80 border-t border-stone-200"
        )}
        style={{ backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            hasPrev
              ? darkMode
                ? "text-stone-300 hover:bg-stone-800"
                : "text-stone-600 hover:bg-stone-100"
              : "text-stone-300 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          上一条
        </button>

        <button
          onClick={() => onCollect(material.id)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
            isCollected
              ? "bg-red-500 text-white"
              : darkMode
                ? "bg-stone-800 text-stone-300 hover:bg-red-500 hover:text-white"
                : "bg-stone-100 text-stone-600 hover:bg-red-500 hover:text-white"
          )}
        >
          <Heart className={cn("w-4 h-4", isCollected && "fill-current")} />
          {isCollected ? "已收藏" : "收藏"}
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
            hasNext
              ? darkMode
                ? "text-stone-300 hover:bg-stone-800"
                : "text-stone-600 hover:bg-stone-100"
              : "text-stone-300 cursor-not-allowed"
          )}
        >
          下一条
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 详情弹窗组件
function MaterialDetailModal({
  material,
  isOpen,
  onClose,
  isCollected,
  onCollect,
  onCopy,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onEnterFocusMode,
}: {
  material: MaterialBrief | null;
  isOpen: boolean;
  onClose: () => void;
  isCollected: boolean;
  onCollect: (id: number) => void;
  onCopy: (content: string) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onEnterFocusMode: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if ((e.metaKey || e.ctrlKey) && e.key === "c" && material) handleCopy();
      if (e.key === "f" && material) onEnterFocusMode();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasPrev, hasNext, material]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCopy = () => {
    if (!material) return;
    const textToCopy = material.author
      ? `${material.content}\n——${material.author}${material.source ? `《${material.source}》` : ""}`
      : material.content;
    navigator.clipboard.writeText(textToCopy);
    onCopy(textToCopy);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !material) return null;

  const colors = materialTypeColors[material.type] || materialTypeColors.quote;
  const readTime = estimateReadTime(material.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className={cn("relative px-6 py-4 bg-gradient-to-r", colors.gradient)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                {typeLargeIcons[material.type]}
              </div>
              <div>
                <span className="text-white/80 text-sm">{materialTypeNames[material.type]}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {material.is_hot && (
                    <Badge className="bg-white/20 text-white text-[10px] px-1.5">
                      <Flame className="h-3 w-3 mr-0.5" /> 热门
                    </Badge>
                  )}
                  {material.is_featured && (
                    <Badge className="bg-white/20 text-white text-[10px] px-1.5">
                      <Star className="h-3 w-3 mr-0.5 fill-current" /> 精选
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEnterFocusMode}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="沉浸阅读 (F)"
              >
                <Focus className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[55vh]">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-stone-800 flex-1">{material.title}</h2>
            <span className="flex items-center gap-1 text-xs text-stone-400 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />约 {readTime} 分钟
            </span>
          </div>

          <div className="relative pl-5 border-l-4 border-amber-300 py-2">
            <Quote className="absolute -left-3 -top-1 w-6 h-6 text-amber-300 bg-white" />
            <p className="text-stone-700 leading-relaxed text-lg whitespace-pre-wrap">
              {material.content}
            </p>
          </div>

          {(material.author || material.source) && (
            <div className="mt-6 flex items-center gap-3 text-stone-500">
              <span className="w-12 h-px bg-stone-300" />
              <p className="text-base">
                <span className="font-medium text-stone-700">{material.author}</span>
                {material.source && (
                  <span className="ml-2 text-stone-400">《{material.source}》</span>
                )}
              </p>
            </div>
          )}

          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {material.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm bg-stone-100 text-stone-600 rounded-full hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-stone-100 text-sm text-stone-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> {material.view_count} 次浏览
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" /> {material.collect_count} 次收藏
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  hasPrev
                    ? "text-stone-600 hover:bg-stone-100"
                    : "text-stone-300 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                上一条
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  hasNext
                    ? "text-stone-600 hover:bg-stone-100"
                    : "text-stone-300 cursor-not-allowed"
                )}
              >
                下一条
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowShare(!showShare)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  分享
                </button>
                {showShare && (
                  <SharePopover material={material} onClose={() => setShowShare(false)} />
                )}
              </div>
              <button
                onClick={() => onCollect(material.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  isCollected
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600"
                )}
              >
                <Heart className={cn("w-4 h-4", isCollected && "fill-current")} />
                {isCollected ? "已收藏" : "收藏"}
              </button>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  copied
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-500 text-white hover:bg-amber-600"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-stone-100 text-[10px] text-stone-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200 rounded">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-stone-200 rounded">→</kbd>
              切换
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200 rounded">F</kbd>
              沉浸模式
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-stone-200 rounded">ESC</kbd>
              关闭
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 每日金句横幅
function DailyQuoteBanner({
  material,
  onView,
}: {
  material: MaterialBrief | null;
  onView: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const quotes = useMemo(() => (material ? [material] : []), [material]);

  if (!material) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-5 lg:p-6 mb-6 lg:mb-8 group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      <Quote className="absolute top-4 left-4 w-16 h-16 text-white/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-200 animate-pulse" />
          <span className="text-white/90 text-sm font-medium">每日金句</span>
          <span className="flex items-center gap-1 text-white/60 text-xs ml-auto">
            <Clock className="w-3 h-3" />约 {estimateReadTime(material.content)} 分钟
          </span>
        </div>
        <p className="text-white text-lg lg:text-xl font-medium leading-relaxed line-clamp-2 mb-3">
          「{material.content.slice(0, 80)}
          {material.content.length > 80 ? "..." : ""}」
        </p>
        {material.author && <p className="text-white/80 text-sm mb-4">—— {material.author}</p>}
        <button
          onClick={onView}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm font-medium transition-all hover:translate-x-1"
        >
          查看详情
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 快速类型筛选条
function QuickTypeFilter({
  types,
  selectedType,
  onSelect,
}: {
  types: { type: MaterialType; count: number }[];
  selectedType: MaterialType | null;
  onSelect: (type: MaterialType | null) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative mb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            !selectedType
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
              : "bg-white border border-stone-200 text-stone-600 hover:border-amber-300"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          全部
        </button>
        {types.map(({ type, count }) => {
          const colors = materialTypeColors[type];
          return (
            <button
              key={type}
              onClick={() => onSelect(selectedType === type ? null : type)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                selectedType === type
                  ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                  : "bg-white border border-stone-200 text-stone-600 hover:border-amber-300"
              )}
            >
              {typeIcons[type]}
              {materialTypeNames[type]}
              <span
                className={cn(
                  "text-xs",
                  selectedType === type ? "text-white/80" : "text-stone-400"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 最近浏览区块
function RecentViewedSection({
  recentIds,
  materials,
  onView,
}: {
  recentIds: number[];
  materials: MaterialBrief[];
  onView: (material: MaterialBrief) => void;
}) {
  const recentMaterials = useMemo(() => {
    return recentIds
      .slice(0, 5)
      .map((id) => materials.find((m) => m.id === id))
      .filter(Boolean) as MaterialBrief[];
  }, [recentIds, materials]);

  if (recentMaterials.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-4 h-4 text-stone-400" />
        <span className="text-sm font-medium text-stone-600">最近浏览</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {recentMaterials.map((material) => {
          const colors = materialTypeColors[material.type];
          return (
            <button
              key={material.id}
              onClick={() => onView(material)}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all max-w-48"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  colors.bg
                )}
              >
                <span className={colors.text}>{typeIcons[material.type]}</span>
              </div>
              <span className="text-sm text-stone-700 truncate">{material.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 素材卡片组件
function MaterialCard({
  material,
  isCollected,
  onCollect,
  onCopy,
  onViewDetail,
  variant = "default",
  compact = false,
  index = 0,
}: {
  material: MaterialBrief;
  isCollected: boolean;
  onCollect: (id: number) => void;
  onCopy: (content: string) => void;
  onViewDetail: () => void;
  variant?: "default" | "featured";
  compact?: boolean;
  index?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const colors = materialTypeColors[material.type] || materialTypeColors.quote;

  // Intersection Observer for animation
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = material.author
      ? `${material.content}\n——${material.author}${material.source ? `《${material.source}》` : ""}`
      : material.content;
    navigator.clipboard.writeText(textToCopy);
    onCopy(textToCopy);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCollect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCollect(material.id);
  };

  if (variant === "featured") {
    return (
      <div
        ref={cardRef}
        className={cn(
          "group relative bg-white rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-xl transition-all duration-500 overflow-hidden transform cursor-pointer",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
        style={{ transitionDelay: `${index * 100}ms` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onViewDetail}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br transition-opacity duration-500",
            colors.gradient
          )}
        />
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent" />

        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-2.5 py-1 shadow-lg shadow-amber-500/25">
            <Star className="h-3 w-3 mr-1 fill-current" />
            推荐
          </Badge>
        </div>

        <div className="relative p-6">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4 transition-transform duration-300",
              colors.bg,
              colors.text,
              isHovered && "scale-105"
            )}
          >
            {typeIcons[material.type]}
            {materialTypeNames[material.type]}
          </div>

          <h3 className="font-bold text-xl text-stone-800 mb-4 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">
            {material.title}
          </h3>

          <div className="relative pl-4 border-l-4 border-amber-300">
            <p
              className={cn(
                "text-stone-600 leading-relaxed italic",
                expanded ? "" : "line-clamp-4"
              )}
            >
              {material.content}
            </p>
          </div>

          {material.content.length > 200 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="mt-3 text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1 font-medium"
            >
              {expanded ? "收起内容" : "展开全文"}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  expanded && "rotate-180"
                )}
              />
            </button>
          )}

          {(material.author || material.source) && (
            <p className="mt-4 text-sm text-stone-500 flex items-center gap-2">
              <span className="w-8 h-px bg-stone-300" />
              <span className="font-medium">{material.author}</span>
              {material.source && <span className="text-stone-400">《{material.source}》</span>}
            </p>
          )}

          {material.tags && material.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {material.tags.slice(0, 5).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs bg-stone-100 text-stone-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-5 text-sm text-stone-400">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {material.view_count}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                {material.collect_count}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {estimateReadTime(material.content)}分钟
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCollect}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 transform active:scale-95",
                  isCollected
                    ? "bg-red-50 text-red-500"
                    : "bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5", isCollected && "fill-current")} />
              </button>
              <button
                onClick={handleCopy}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-200 transform active:scale-95",
                  copied
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600"
                )}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default/Compact Card
  return (
    <div
      ref={cardRef}
      className={cn(
        "group bg-white border border-stone-200 hover:border-amber-300 transition-all duration-300 overflow-hidden transform cursor-pointer",
        "hover:shadow-lg hover:shadow-amber-100/50",
        compact ? "rounded-xl" : "rounded-2xl",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
      style={{ transitionDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetail}
    >
      <div
        className={cn(
          "bg-gradient-to-r relative overflow-hidden",
          colors.gradient,
          compact ? "px-3 py-2" : "px-4 py-2.5"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-white/90">{typeIcons[material.type]}</span>
            <span className={cn("font-medium text-white", compact ? "text-xs" : "text-sm")}>
              {materialTypeNames[material.type]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {material.is_hot && (
              <span
                className={cn(
                  "flex items-center gap-0.5 bg-white/25 backdrop-blur-sm rounded-full text-white font-medium",
                  compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
                )}
              >
                <Flame className="h-3 w-3" />
                {!compact && "热门"}
              </span>
            )}
            {material.is_featured && (
              <span
                className={cn(
                  "flex items-center gap-0.5 bg-white/25 backdrop-blur-sm rounded-full text-white font-medium",
                  compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
                )}
              >
                <Star className="h-3 w-3 fill-current" />
                {!compact && "精选"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={compact ? "p-3" : "p-4"}>
        <h3
          className={cn(
            "font-semibold text-stone-800 line-clamp-1 group-hover:text-amber-700 transition-colors",
            compact ? "text-sm mb-1.5" : "mb-2"
          )}
        >
          {material.title}
        </h3>
        <p
          className={cn(
            "text-stone-600 leading-relaxed",
            compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
          )}
        >
          {material.content}
        </p>

        {(material.author || material.source) && (
          <p className={cn("text-stone-500 mt-2", compact ? "text-[10px]" : "text-xs")}>
            —— {material.author}
            {material.source && <span className="text-stone-400 ml-1">《{material.source}》</span>}
          </p>
        )}

        {!compact && material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {material.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] bg-stone-100 text-stone-500 rounded-full"
              >
                {tag}
              </span>
            ))}
            {material.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] bg-stone-100 text-stone-400 rounded-full">
                +{material.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-between border-t border-stone-100",
            compact ? "mt-3 pt-2" : "mt-4 pt-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 text-stone-400",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            <span className="flex items-center gap-1">
              <Eye className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              {material.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              {material.collect_count}
            </span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 transition-opacity duration-200",
              isHovered ? "opacity-100" : "lg:opacity-0"
            )}
          >
            <button
              onClick={handleCollect}
              className={cn(
                "rounded-lg transition-all duration-200 transform active:scale-90",
                compact ? "p-1.5" : "p-2",
                isCollected
                  ? "bg-red-50 text-red-500"
                  : "bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500"
              )}
            >
              <Heart
                className={cn(isCollected && "fill-current", compact ? "h-3.5 w-3.5" : "h-4 w-4")}
              />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                "rounded-lg transition-all duration-200 transform active:scale-90",
                compact ? "p-1.5" : "p-2",
                copied
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-stone-100 text-stone-400 hover:bg-emerald-50 hover:text-emerald-600"
              )}
            >
              {copied ? (
                <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              ) : (
                <Copy className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 类型统计卡片
function TypeStatCard({
  type,
  count,
  isSelected,
  onClick,
}: {
  type: MaterialType;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = materialTypeColors[type];
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 w-full text-left group/card",
        isSelected
          ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
          : "bg-white border border-stone-200 hover:border-amber-300 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110",
          isSelected ? "bg-white/20" : colors.bg
        )}
      >
        <span className={isSelected ? "text-white" : colors.text}>{typeLargeIcons[type]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            isSelected ? "text-white" : "text-stone-700"
          )}
        >
          {materialTypeNames[type]}
        </p>
        <p className={cn("text-xs", isSelected ? "text-white/80" : "text-stone-400")}>{count} 条</p>
      </div>
    </button>
  );
}

// 回到顶部按钮
function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40 p-3 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:bg-amber-600 hover:scale-110",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

// 移动端侧边栏
function MobileSidebar({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-white z-10">
          <h3 className="font-semibold text-stone-800">筛选</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}

// 滚动进度条
function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setProgress((winScroll / height) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200/50">
      <div
        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function MaterialsPage() {
  const { isAuthenticated } = useAuthStore();
  const { loading, materials, total, page, pageSize, setPage, fetchMaterials, searchMaterials } =
    useMaterials();
  const { categories, fetchCategoryTree, flattenCategories } = useMaterialCategories();
  const { stats, fetchStats } = useMaterialStats();
  const { topics, fetchThemeTopics } = useThemeTopics();
  const { collectedIds, toggleCollect, setCollectedIds } = useMaterialCollect();
  const { featuredMaterials, fetchFeaturedMaterials } = useFeaturedMaterials();
  const { materials: randomMaterials, fetchRandomMaterials } = useRandomMaterials();

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<MaterialType | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyHot, setShowOnlyHot] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [compactMode, setCompactMode] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [recentViewedIds, setRecentViewedIds] = useState<number[]>([]);

  // Detail Modal & Focus Mode
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialBrief | null>(null);
  const [selectedMaterialIndex, setSelectedMaterialIndex] = useState(-1);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load recent viewed
  useEffect(() => {
    setRecentViewedIds(getRecentViewed());
  }, []);

  // Initial load
  useEffect(() => {
    fetchMaterials();
    fetchCategoryTree();
    fetchStats();
    fetchThemeTopics();
    fetchFeaturedMaterials(3);
  }, []);

  // Filter changes
  useEffect(() => {
    const params: Record<string, unknown> = {};
    if (selectedType) params.type = selectedType;
    if (selectedCategoryId) params.category_id = selectedCategoryId;
    if (selectedTopic) params.theme_topics = [selectedTopic];
    if (showOnlyHot) params.is_hot = true;
    if (showOnlyFeatured) params.is_featured = true;
    if (sortBy === "popular") params.sort_by = "view_count";
    if (sortBy === "collected") params.sort_by = "collect_count";

    if (searchQuery) {
      searchMaterials(searchQuery, params);
    } else {
      fetchMaterials(params);
    }
  }, [
    selectedType,
    selectedCategoryId,
    selectedTopic,
    showOnlyHot,
    showOnlyFeatured,
    sortBy,
    page,
  ]);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => handleSearch(), 500);
  };

  const handleSearch = useCallback(() => {
    setPage(1);
    const params: Record<string, unknown> = {};
    if (selectedType) params.type = selectedType;
    if (selectedCategoryId) params.category_id = selectedCategoryId;
    if (selectedTopic) params.theme_topics = [selectedTopic];
    if (showOnlyHot) params.is_hot = true;
    if (showOnlyFeatured) params.is_featured = true;

    if (searchQuery) {
      searchMaterials(searchQuery, params);
    } else {
      fetchMaterials(params);
    }
  }, [searchQuery, selectedType, selectedCategoryId, selectedTopic, showOnlyHot, showOnlyFeatured]);

  const clearFilters = () => {
    setSelectedType(null);
    setSelectedCategoryId(null);
    setSelectedTopic(null);
    setSearchQuery("");
    setShowOnlyHot(false);
    setShowOnlyFeatured(false);
    setSortBy("newest");
    setPage(1);
    fetchMaterials();
  };

  const handleTypeSelect = (type: MaterialType | null) => {
    setSelectedType(type);
    setPage(1);
    setMobileSidebarOpen(false);
  };

  const handleCopy = () => {};

  const handleCollect = async (id: number) => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      window.location.href = "/login";
      return;
    }
    await toggleCollect(id);
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    await fetchRandomMaterials(undefined, 6);
    setTimeout(() => setIsShuffling(false), 300);
  };

  const openDetailModal = (material: MaterialBrief, index: number) => {
    setSelectedMaterial(material);
    setSelectedMaterialIndex(index);
    setDetailModalOpen(true);
    saveRecentViewed(material.id);
    setRecentViewedIds(getRecentViewed());
  };

  const navigateDetail = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? selectedMaterialIndex - 1 : selectedMaterialIndex + 1;
    if (newIndex >= 0 && newIndex < materials.length) {
      setSelectedMaterial(materials[newIndex]);
      setSelectedMaterialIndex(newIndex);
      saveRecentViewed(materials[newIndex].id);
      setRecentViewedIds(getRecentViewed());
    }
  };

  const enterFocusMode = () => {
    setDetailModalOpen(false);
    setFocusModeOpen(true);
  };

  useEffect(() => {
    const ids = new Set(materials.filter((m) => m.is_collected).map((m) => m.id));
    setCollectedIds(ids);
  }, [materials]);

  const flatCategories = flattenCategories(categories);
  const hasFilters =
    selectedType ||
    selectedCategoryId ||
    selectedTopic ||
    searchQuery ||
    showOnlyHot ||
    showOnlyFeatured;
  const totalPages = Math.ceil(total / pageSize);
  const typeStats = stats?.type_stats || [];
  const dailyQuote = featuredMaterials[0] || null;

  // Sidebar Content
  const SidebarContent = () => (
    <>
      <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 text-amber-500" />
        素材分类
      </h3>

      <button
        onClick={() => handleTypeSelect(null)}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 w-full text-left mb-2 group/all",
          !selectedType
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
            : "bg-stone-50 hover:bg-stone-100"
        )}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/all:scale-110",
            !selectedType ? "bg-white/20" : "bg-amber-100"
          )}
        >
          <LayoutGrid className={cn("w-5 h-5", !selectedType ? "text-white" : "text-amber-600")} />
        </div>
        <div className="flex-1">
          <p className={cn("text-sm font-medium", !selectedType ? "text-white" : "text-stone-700")}>
            全部素材
          </p>
          <p className={cn("text-xs", !selectedType ? "text-white/80" : "text-stone-400")}>
            {stats?.published_count || 0} 条
          </p>
        </div>
      </button>

      <div className="space-y-2">
        {typeStats.map((item) => (
          <TypeStatCard
            key={item.type}
            type={item.type}
            count={item.count}
            isSelected={selectedType === item.type}
            onClick={() => handleTypeSelect(selectedType === item.type ? null : item.type)}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100">
        <h4 className="text-xs font-medium text-stone-500 mb-3">快捷筛选</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowOnlyHot(!showOnlyHot);
              setMobileSidebarOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              showOnlyHot
                ? "bg-red-500 text-white shadow-lg"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            )}
          >
            <Flame className="w-4 h-4" />
            只看热门
          </button>
          <button
            onClick={() => {
              setShowOnlyFeatured(!showOnlyFeatured);
              setMobileSidebarOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 w-full p-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              showOnlyFeatured
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            )}
          >
            <Star className="w-4 h-4" />
            只看精选
          </button>
        </div>
      </div>

      {topics.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-100">
          <h4 className="text-xs font-medium text-stone-500 mb-3">热点主题</h4>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 8).map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(selectedTopic === topic ? null : topic);
                  setMobileSidebarOpen(false);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                  selectedTopic === topic
                    ? "bg-blue-500 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      <ScrollProgressBar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-amber-50/50 to-white border-b border-stone-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-200/20 to-rose-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="container relative mx-auto px-4 lg:px-6 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
                <Palette className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800">素材库</h1>
                <p className="text-sm lg:text-base text-stone-500 mt-0.5">
                  申论写作与面试答题的秘密武器
                </p>
              </div>
            </div>

            {stats && (
              <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                {[
                  { icon: Sparkles, value: stats.published_count, label: "总素材", color: "amber" },
                  { icon: Flame, value: stats.hot_count, label: "热门", color: "red" },
                  { icon: Star, value: stats.featured_count, label: "精选", color: "emerald" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-white rounded-xl border border-stone-200 shadow-sm flex-shrink-0"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center",
                        `bg-${stat.color}-100`
                      )}
                    >
                      <stat.icon
                        className={cn("w-3.5 h-3.5 lg:w-4 lg:h-4", `text-${stat.color}-600`)}
                      />
                    </div>
                    <div>
                      <p className="text-base lg:text-lg font-bold text-stone-800">{stat.value}</p>
                      <p className="text-[10px] lg:text-xs text-stone-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {/* Daily Quote Banner */}
        {dailyQuote && !hasFilters && (
          <DailyQuoteBanner material={dailyQuote} onView={() => openDetailModal(dailyQuote, 0)} />
        )}

        {/* Recent Viewed */}
        <RecentViewedSection
          recentIds={recentViewedIds}
          materials={[...materials, ...featuredMaterials]}
          onView={(m) =>
            openDetailModal(
              m,
              materials.findIndex((x) => x.id === m.id)
            )
          }
        />

        {/* Featured Section */}
        {featuredMaterials.length > 0 && !hasFilters && (
          <section className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-base lg:text-lg font-bold text-stone-800">
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                </div>
                精选推荐
              </h2>
              <button
                onClick={handleShuffle}
                disabled={isShuffling}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all",
                  isShuffling && "opacity-50"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isShuffling && "animate-spin")} />
                换一批
              </button>
            </div>
            <div
              className={cn(
                "grid md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-300",
                isShuffling && "opacity-50"
              )}
            >
              {(randomMaterials.length > 0 ? randomMaterials.slice(0, 3) : featuredMaterials).map(
                (material, idx) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    isCollected={collectedIds.has(material.id)}
                    onCollect={handleCollect}
                    onCopy={handleCopy}
                    onViewDetail={() => openDetailModal(material, idx)}
                    variant="featured"
                    index={idx}
                  />
                )
              )}
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-stone-200 p-4 sticky top-20">
              <SidebarContent />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)}>
            <SidebarContent />
          </MobileSidebar>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Quick Type Filter */}
            {typeStats.length > 0 && (
              <QuickTypeFilter
                types={typeStats}
                selectedType={selectedType}
                onSelect={handleTypeSelect}
              />
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-3 lg:p-4 mb-4 lg:mb-6">
              <div className="flex gap-2 lg:gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <Search className="absolute left-3 lg:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="搜索名言、案例、作者..."
                    className="w-full pl-9 lg:pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center gap-2 px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50"
                    >
                      <SortAsc className="w-4 h-4" />
                      <span className="hidden md:inline">
                        {sortOptions.find((o) => o.value === sortBy)?.label}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showSortDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowSortDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl border border-stone-200 shadow-lg py-1 min-w-36">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value);
                                setShowSortDropdown(false);
                              }}
                              className={cn(
                                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-stone-50",
                                sortBy === option.value && "text-amber-600 bg-amber-50"
                              )}
                            >
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "gap-2",
                      showFilters && "bg-amber-50 border-amber-300 text-amber-700"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden md:inline">筛选</span>
                  </Button>
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    <Search className="w-4 h-4 md:mr-1.5" />
                    <span className="hidden md:inline">搜索</span>
                  </Button>
                </div>
              </div>

              {hasFilters && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 overflow-x-auto pb-1">
                  <span className="text-xs text-stone-500 flex-shrink-0">已选:</span>
                  <div className="flex gap-2 flex-shrink-0">
                    {selectedType && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                        {materialTypeNames[selectedType]}
                        <button onClick={() => setSelectedType(null)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {showOnlyHot && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                        热门
                        <button onClick={() => setShowOnlyHot(false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {showOnlyFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">
                        精选
                        <button onClick={() => setShowOnlyFeatured(false)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedTopic && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {selectedTopic}
                        <button onClick={() => setSelectedTopic(null)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-stone-500 hover:text-stone-700 ml-auto flex-shrink-0"
                  >
                    清除全部
                  </button>
                </div>
              )}

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-stone-100 space-y-4">
                  {topics.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">
                        热点主题
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {topics.slice(0, 12).map((topic) => (
                          <button
                            key={topic}
                            onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                            className={cn(
                              "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                              selectedTopic === topic
                                ? "bg-blue-500 text-white"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            )}
                          >
                            <Flame className="w-3 h-3" />
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {flatCategories.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">分类</label>
                      <div className="flex flex-wrap gap-2">
                        {flatCategories.slice(0, 8).map(({ category }) => (
                          <button
                            key={category.id}
                            onClick={() =>
                              setSelectedCategoryId(
                                selectedCategoryId === category.id ? null : category.id
                              )
                            }
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                              selectedCategoryId === category.id
                                ? "bg-violet-500 text-white"
                                : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                            )}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stone-500">
                共 <span className="font-semibold text-stone-700">{total}</span> 条素材
                {hasFilters && <span className="text-amber-600 ml-1">(已筛选)</span>}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    compactMode
                      ? "bg-violet-100 text-violet-600"
                      : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                  )}
                  title={compactMode ? "舒适视图" : "紧凑视图"}
                >
                  {compactMode ? (
                    <Maximize2 className="w-4 h-4" />
                  ) : (
                    <Minimize2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "grid"
                      ? "bg-amber-100 text-amber-600"
                      : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    viewMode === "list"
                      ? "bg-amber-100 text-amber-600"
                      : "text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Materials Grid */}
            {loading ? (
              <div
                className={cn(
                  "gap-4",
                  viewMode === "grid"
                    ? compactMode
                      ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                      : "grid md:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                )}
              >
                {Array.from({ length: compactMode ? 8 : 6 }).map((_, i) => (
                  <SkeletonCard key={i} compact={compactMode} />
                ))}
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-16 lg:py-20 bg-white rounded-2xl border border-stone-200">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center">
                  <Palette className="w-10 h-10 text-stone-300" />
                </div>
                <h3 className="text-lg font-semibold text-stone-700 mb-2">暂无素材</h3>
                <p className="text-stone-500 mb-6 max-w-sm mx-auto px-4">
                  {hasFilters
                    ? "没有符合筛选条件的素材，试试调整筛选条件"
                    : "素材库正在建设中，敬请期待"}
                </p>
                {hasFilters && (
                  <Button onClick={clearFilters} variant="outline" className="gap-2">
                    <X className="w-4 h-4" />
                    清除筛选条件
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "gap-4",
                    viewMode === "grid"
                      ? compactMode
                        ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        : "grid md:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col"
                  )}
                >
                  {materials.map((material, idx) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      isCollected={collectedIds.has(material.id)}
                      onCollect={handleCollect}
                      onCopy={handleCopy}
                      onViewDetail={() => openDetailModal(material, idx)}
                      compact={compactMode}
                      index={idx}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 lg:mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      上一页
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = page - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                              page === pageNum
                                ? "bg-amber-500 text-white shadow-lg"
                                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                    >
                      下一页
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      <MaterialDetailModal
        material={selectedMaterial}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        isCollected={selectedMaterial ? collectedIds.has(selectedMaterial.id) : false}
        onCollect={handleCollect}
        onCopy={handleCopy}
        onPrev={() => navigateDetail("prev")}
        onNext={() => navigateDetail("next")}
        hasPrev={selectedMaterialIndex > 0}
        hasNext={selectedMaterialIndex < materials.length - 1}
        onEnterFocusMode={enterFocusMode}
      />

      {/* Focus Mode */}
      <FocusModeView
        material={selectedMaterial}
        isOpen={focusModeOpen}
        onClose={() => setFocusModeOpen(false)}
        onPrev={() => navigateDetail("prev")}
        onNext={() => navigateDetail("next")}
        hasPrev={selectedMaterialIndex > 0}
        hasNext={selectedMaterialIndex < materials.length - 1}
        isCollected={selectedMaterial ? collectedIds.has(selectedMaterial.id) : false}
        onCollect={handleCollect}
      />

      <BackToTopButton />
    </div>
  );
}
