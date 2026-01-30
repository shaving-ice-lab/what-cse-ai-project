"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Share2,
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  MapPin,
  Users,
  GraduationCap,
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  FileText,
  ChevronRight,
  ExternalLink,
  Scale,
  Loader2,
  Copy,
  CheckCircle,
  Zap,
  Sparkles,
  User,
  Briefcase,
  Home,
  Shield,
  Info,
  BarChart2,
  TrendingDown,
  Target,
  ArrowUpRight,
  Flame,
  Star,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { usePositionDetail, useAddFavorite, useRemoveFavorite, usePositionHistory } from "@/hooks/usePosition";
import { usePositionMatchDetail, getMatchScoreColor, getMatchScoreLabel, getStarLevelText } from "@/hooks/useMatch";
import { useAuthStore } from "@/stores/authStore";
import type { Position, PositionDetail, PositionHistoryItem, YearlyTrendItem } from "@/services/api/position";
import type { MatchCondition } from "@/services/api/match";

// 悬浮粒子动画
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber-400/30 animate-float"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 30}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

// 本地存储键
const COMPARE_STORAGE_KEY = "position_compare_list";
const MAX_COMPARE_COUNT = 5;

// 获取匹配分数颜色
function getScoreColor(score: number) {
  if (score >= 90) return "from-emerald-500 to-emerald-600";
  if (score >= 70) return "from-amber-500 to-amber-600";
  if (score >= 50) return "from-orange-500 to-orange-600";
  return "from-stone-400 to-stone-500";
}

// 获取匹配分数文本
function getScoreLabel(score: number) {
  if (score >= 90) return "完美匹配";
  if (score >= 70) return "高度匹配";
  if (score >= 50) return "部分匹配";
  return "匹配较低";
}

// 计算报名状态
function getRegistrationStatus(start?: string, end?: string) {
  if (!start && !end) return { status: "unknown", text: "时间未知", color: "text-stone-500" };
  
  const now = new Date();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (endDate && now > endDate) {
    return { status: "ended", text: "已截止", color: "text-red-500" };
  }
  if (startDate && now < startDate) {
    const days = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { status: "upcoming", text: `${days}天后开始`, color: "text-blue-500" };
  }
  if (endDate) {
    const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 3) {
      return { status: "urgent", text: `剩余${days}天`, color: "text-red-500" };
    }
    return { status: "active", text: `剩余${days}天`, color: "text-emerald-500" };
  }
  return { status: "active", text: "报名中", color: "text-emerald-500" };
}

// 格式化日期
function formatDate(dateStr?: string) {
  if (!dateStr) return "待定";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
}

// 构建报考条件列表
function buildRequirements(position: Position) {
  const requirements: { name: string; value: string; icon: React.ReactNode; highlight?: string }[] = [];

  // 学历要求
  if (position.education) {
    const degreeText = position.degree ? `/${position.degree}` : "";
    requirements.push({
      name: "学历学位",
      value: `${position.education}${degreeText}`,
      icon: <GraduationCap className="w-4 h-4" />,
    });
  }

  // 专业要求
  if (position.major_requirement || position.is_unlimited_major) {
    const majorValue = position.is_unlimited_major ? "不限专业" : position.major_requirement || "请参考公告";
    requirements.push({
      name: "专业要求",
      value: majorValue,
      icon: <FileText className="w-4 h-4" />,
      highlight: position.is_unlimited_major ? "positive" : undefined,
    });
  }

  // 年龄要求
  if (position.age || (position.age_min && position.age_max)) {
    const ageValue = position.age || `${position.age_min}-${position.age_max}周岁`;
    requirements.push({
      name: "年龄要求",
      value: ageValue,
      icon: <User className="w-4 h-4" />,
    });
  }

  // 政治面貌
  if (position.political_status) {
    requirements.push({
      name: "政治面貌",
      value: position.political_status,
      icon: <Shield className="w-4 h-4" />,
    });
  }

  // 工作经验
  if (position.work_experience) {
    const isNoExp = position.work_experience === "不限" || position.work_experience.includes("无");
    requirements.push({
      name: "工作经验",
      value: position.work_experience,
      icon: <Briefcase className="w-4 h-4" />,
      highlight: isNoExp ? "positive" : undefined,
    });
  }

  // 户籍要求
  if (position.household_requirement) {
    const isNoLimit = position.household_requirement === "不限" || position.household_requirement.includes("无");
    requirements.push({
      name: "户籍要求",
      value: position.household_requirement,
      icon: <Home className="w-4 h-4" />,
      highlight: isNoLimit ? "positive" : undefined,
    });
  }

  // 性别要求
  if (position.gender && position.gender !== "不限") {
    requirements.push({
      name: "性别要求",
      value: position.gender,
      icon: <User className="w-4 h-4" />,
    });
  }

  return requirements;
}

// 对比列表管理
function getCompareList(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompareList(list: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export default function PositionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const positionId = Number(params.id);
  
  // 获取登录状态
  const { isAuthenticated, user } = useAuthStore();
  
  // 获取职位详情
  const { data: position, isLoading, error } = usePositionDetail(positionId);
  
  // 获取历年数据
  const { data: historyData, isLoading: historyLoading } = usePositionHistory(positionId);
  
  // 获取匹配详情（仅登录用户）
  const { data: matchData, isLoading: matchLoading } = usePositionMatchDetail(positionId, isAuthenticated);
  
  // 收藏状态
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // 对比列表
  const [compareList, setCompareList] = useState<number[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 初始化状态
  useEffect(() => {
    if (position) {
      setIsFavorited(position.is_favorite || false);
    }
    setCompareList(getCompareList());
  }, [position]);

  // 切换收藏
  const handleToggleFavorite = useCallback(async () => {
    if (!position) return;
    
    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync(position.id);
        setIsFavorited(false);
      } else {
        await addFavoriteMutation.mutateAsync(position.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  }, [position, isFavorited, addFavoriteMutation, removeFavoriteMutation]);

  // 切换对比
  const handleToggleCompare = useCallback(() => {
    if (!position) return;
    
    const newList = compareList.includes(position.id)
      ? compareList.filter(id => id !== position.id)
      : [...compareList, position.id].slice(0, MAX_COMPARE_COUNT);
    
    setCompareList(newList);
    saveCompareList(newList);
  }, [position, compareList]);

  // 分享职位
  const handleShare = useCallback(async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: position?.position_name || "职位详情",
          text: `${position?.department_name} - ${position?.position_name}`,
          url,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  }, [position]);

  // 计算竞争比
  const competitionRatio = useMemo(() => {
    if (!position || !position.applicant_count || position.recruit_count === 0) return null;
    return Math.round(position.applicant_count / position.recruit_count);
  }, [position]);

  // 报名状态
  const registrationStatus = useMemo(() => {
    if (!position) return null;
    return getRegistrationStatus(position.registration_start, position.registration_end);
  }, [position]);

  // 报考条件
  const requirements = useMemo(() => {
    if (!position) return [];
    return buildRequirements(position);
  }, [position]);

  // 是否在对比列表中
  const isInCompare = position ? compareList.includes(position.id) : false;

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
              <div className="absolute -inset-2 bg-amber-400/20 rounded-3xl blur-xl animate-pulse" />
            </div>
            <p className="mt-4 text-stone-500 animate-pulse">加载职位信息中...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !position) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-stone-400" />
              </div>
              <div className="absolute -inset-2 bg-stone-200/50 rounded-3xl blur-xl" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">职位不存在</h2>
            <p className="text-stone-500 mb-6 max-w-md">该职位可能已被删除或链接无效，请返回职位列表重新查找</p>
            <Link
              href="/positions"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              返回职位列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0 bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-200/40 via-amber-100/20 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-radial from-orange-200/30 via-orange-100/10 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        <FloatingParticles />

        <div className="container relative mx-auto px-4 lg:px-6 pt-6 pb-10">
          {/* Back Button */}
          <Link
            href="/positions"
            className="group inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 mb-6 transition-colors bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-stone-200/50 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">返回列表</span>
          </Link>

          {/* Position Header Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-stone-200/50 overflow-hidden">
            {/* 顶部渐变条 */}
            <div className={`h-2 ${
              matchData && matchData.match_score >= 90 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
              matchData && matchData.match_score >= 70 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
              "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400"
            }`} />
            
            <div className="p-6 lg:p-8">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {position.exam_type && (
                      <span className={`px-3 py-1.5 text-sm font-semibold rounded-xl shadow-sm ${
                        position.exam_type === "国考" 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                          : position.exam_type === "省考"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
                          : "bg-gradient-to-r from-violet-500 to-violet-600 text-white"
                      }`}>
                        {position.exam_type}
                      </span>
                    )}
                    {position.is_unlimited_major && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200">
                        <Zap className="w-4 h-4" />
                        不限专业
                      </span>
                    )}
                    {position.is_for_fresh_graduate && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200">
                        <Sparkles className="w-4 h-4" />
                        应届可报
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-900 mb-3 leading-tight">
                    {position.position_name}
                  </h1>
                  <p className="flex items-center gap-2 text-lg text-stone-600">
                    <div className="p-1.5 bg-stone-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-stone-500" />
                    </div>
                    <span className="font-medium">{position.department_name}</span>
                    {position.department_level && (
                      <span className="text-sm text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {position.department_level}
                      </span>
                    )}
                  </p>
                  {position.position_code && (
                    <p className="text-sm text-stone-400 mt-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      职位代码：<span className="font-mono">{position.position_code}</span>
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                    className={`group p-3.5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      isFavorited
                        ? "bg-red-50 border-red-200 text-red-500 shadow-red-100 hover:shadow-red-200"
                        : "bg-white border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500 hover:shadow-amber-100"
                    }`}
                    title={isFavorited ? "取消收藏" : "收藏职位"}
                  >
                    <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isFavorited ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleToggleCompare}
                    className={`group p-3.5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                      isInCompare
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-emerald-100 hover:shadow-emerald-200"
                        : "bg-white border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500 hover:shadow-amber-100"
                    }`}
                    title={isInCompare ? "移除对比" : "加入对比"}
                  >
                    <Scale className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="group p-3.5 rounded-2xl border-2 bg-white border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-100"
                    title="分享职位"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Stats - 全新设计 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium">招录人数</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-stone-900 tabular-nums">
                    {position.recruit_count}<span className="text-lg font-normal text-stone-500 ml-1">人</span>
                  </p>
                </div>
                <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-emerald-600 font-medium">报名人数</span>
                  </div>
                  <p className="text-3xl font-display font-bold text-stone-900 tabular-nums">
                    {position.applicant_count ?? "-"}<span className="text-lg font-normal text-stone-500 ml-1">人</span>
                  </p>
                </div>
                <div className={`group relative p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                  competitionRatio && competitionRatio > 100 
                    ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-100 hover:shadow-red-100/50" 
                    : "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100 hover:shadow-amber-100/50"
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      competitionRatio && competitionRatio > 100 ? "bg-red-100" : "bg-amber-100"
                    }`}>
                      <Flame className={`w-5 h-5 ${competitionRatio && competitionRatio > 100 ? "text-red-600" : "text-amber-600"}`} />
                    </div>
                    <span className={`text-sm font-medium ${competitionRatio && competitionRatio > 100 ? "text-red-600" : "text-amber-600"}`}>
                      竞争比
                    </span>
                  </div>
                  <p className={`text-3xl font-display font-bold tabular-nums ${
                    competitionRatio && competitionRatio > 100 ? "text-red-600" : "text-amber-600"
                  }`}>
                    {competitionRatio ? `${competitionRatio}:1` : "-"}
                  </p>
                </div>
                <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-100 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="text-sm text-violet-600 font-medium">工作地点</span>
                  </div>
                  <p className="text-xl font-semibold text-stone-900 truncate" title={position.work_location || `${position.province || ""}${position.city || ""}`}>
                    {position.work_location || `${position.province || ""}${position.city || ""}` || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-6 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">

          {/* Basic Info Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 p-6 lg:p-8 overflow-hidden relative">
            {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h2 className="relative text-lg font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              基本信息
            </h2>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">职位名称</span>
                <span className="font-semibold text-stone-800">{position.position_name}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">招录单位</span>
                <span className="font-semibold text-stone-800 text-right max-w-[180px] truncate" title={position.department_name}>
                  {position.department_name}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">招录人数</span>
                <span className="font-semibold text-stone-800">{position.recruit_count}人</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">工作地点</span>
                <span className="font-semibold text-stone-800">
                  {position.work_location || `${position.province || ""}${position.city || ""}${position.district || ""}` || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">报名时间</span>
                <span className="font-semibold text-stone-800 text-right text-sm">
                  {position.registration_start ? formatDate(position.registration_start) : "待定"}
                  {position.registration_end ? ` ~ ${formatDate(position.registration_end)}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                <span className="text-stone-500 text-sm">考试时间</span>
                <span className="font-semibold text-stone-800">{formatDate(position.exam_date)}</span>
              </div>
              {position.interview_date && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                  <span className="text-stone-500 text-sm">面试时间</span>
                  <span className="font-semibold text-stone-800">{formatDate(position.interview_date)}</span>
                </div>
              )}
              {position.exam_category && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                  <span className="text-stone-500 text-sm">考试类别</span>
                  <span className="font-semibold text-stone-800">{position.exam_category}</span>
                </div>
              )}
              {position.service_period && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 transition-colors">
                  <span className="text-stone-500 text-sm">服务期限</span>
                  <span className="font-semibold text-stone-800">{position.service_period}</span>
                </div>
              )}
              {position.salary_range && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-100">
                  <span className="text-emerald-600 text-sm font-medium">薪资范围</span>
                  <span className="font-bold text-emerald-600">{position.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 p-6 lg:p-8 overflow-hidden relative">
            {/* 装饰背景 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-100/30 to-purple-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h2 className="relative text-lg font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-violet-600" />
              </div>
              报考条件
            </h2>
            <div className="relative space-y-3">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className={`group/item flex items-start justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                    req.highlight === "positive"
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-emerald-200 hover:shadow-emerald-100"
                      : "bg-stone-50/80 border-stone-200/50 hover:bg-stone-100/80 hover:shadow-stone-100"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl transition-transform group-hover/item:scale-110 ${
                      req.highlight === "positive" 
                        ? "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm" 
                        : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500"
                    }`}>
                      {req.icon}
                    </div>
                    <div>
                      <p className={`text-sm mb-0.5 ${req.highlight === "positive" ? "text-emerald-600" : "text-stone-500"}`}>
                        {req.name}
                      </p>
                      <p className="font-semibold text-stone-800">{req.value}</p>
                    </div>
                  </div>
                  {req.highlight === "positive" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg shadow-sm">
                      <Star className="w-3 h-3" />
                      优势
                    </span>
                  )}
                </div>
              ))}
              
              {/* 其他条件 */}
              {position.other_conditions && (
                <div className="mt-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700 font-semibold mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <Info className="w-4 h-4" />
                    </div>
                    其他条件
                  </p>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{position.other_conditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Analysis Card - Only for logged in users */}
          {isAuthenticated && (
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 p-6 lg:p-8 overflow-hidden relative">
              {/* 装饰背景 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-100/40 to-orange-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <h2 className="relative text-lg font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                匹配分析
                <span className="ml-auto px-3 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                  AI 分析
                </span>
              </h2>
              
              {matchLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
                    </div>
                    <div className="absolute -inset-2 bg-amber-400/20 rounded-3xl blur-xl animate-pulse" />
                  </div>
                  <span className="mt-4 text-stone-500">智能分析匹配度...</span>
                </div>
              ) : matchData ? (
                <div className="relative space-y-6">
                  {/* Overall Match Score - 全新设计 */}
                  <div className={`relative p-6 rounded-2xl overflow-hidden ${
                    matchData.match_score >= 90 ? "bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50" :
                    matchData.match_score >= 70 ? "bg-gradient-to-br from-amber-50 via-amber-100/50 to-orange-50" :
                    matchData.match_score >= 50 ? "bg-gradient-to-br from-orange-50 via-orange-100/50 to-red-50" :
                    "bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-100"
                  }`}>
                    {/* 装饰圆环 */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 ${
                      matchData.match_score >= 90 ? "bg-emerald-300" :
                      matchData.match_score >= 70 ? "bg-amber-300" :
                      matchData.match_score >= 50 ? "bg-orange-300" :
                      "bg-stone-300"
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 mb-2">整体匹配度</p>
                        <div className="flex items-baseline gap-3">
                          <span className={`text-5xl font-display font-bold tabular-nums ${
                            matchData.match_score >= 90 ? "text-emerald-600" :
                            matchData.match_score >= 70 ? "text-amber-600" :
                            matchData.match_score >= 50 ? "text-orange-600" :
                            "text-stone-600"
                          }`}>
                            {matchData.match_score.toFixed(0)}
                          </span>
                          <span className="text-xl text-stone-400 font-medium">分</span>
                          <span className={`px-3 py-1 text-sm font-bold rounded-xl shadow-sm ${
                            matchData.match_score >= 90 ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white" :
                            matchData.match_score >= 70 ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white" :
                            matchData.match_score >= 50 ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white" :
                            "bg-gradient-to-r from-stone-400 to-stone-500 text-white"
                          }`}>
                            {matchData.match_level || getMatchScoreLabel(matchData.match_score)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl mb-1">{getStarLevelText(matchData.star_level)}</p>
                        <p className={`text-sm font-bold flex items-center gap-1.5 justify-end ${matchData.is_eligible ? "text-emerald-600" : "text-red-500"}`}>
                          {matchData.is_eligible ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              符合报考条件
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4" />
                              可能不符合条件
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match Details by Dimension */}
                  {matchData.match_details && matchData.match_details.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" />
                        各维度匹配详情
                      </h3>
                      <div className="space-y-3">
                        {matchData.match_details.map((detail: MatchCondition, index: number) => (
                          <div
                            key={index}
                            className={`group/detail flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                              detail.is_match
                                ? "bg-gradient-to-r from-emerald-50 to-emerald-100/30 border-emerald-200 hover:shadow-emerald-100"
                                : detail.is_hard_match
                                  ? "bg-gradient-to-r from-red-50 to-red-100/30 border-red-200 hover:shadow-red-100"
                                  : "bg-gradient-to-r from-amber-50 to-amber-100/30 border-amber-200 hover:shadow-amber-100"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover/detail:scale-110 ${
                                detail.is_match 
                                  ? "bg-gradient-to-br from-emerald-100 to-emerald-200" 
                                  : detail.is_hard_match 
                                    ? "bg-gradient-to-br from-red-100 to-red-200" 
                                    : "bg-gradient-to-br from-amber-100 to-amber-200"
                              }`}>
                                {detail.is_match ? (
                                  <Check className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <X className={`w-5 h-5 ${detail.is_hard_match ? "text-red-600" : "text-amber-600"}`} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-stone-800">{detail.condition}</p>
                                <p className="text-xs text-stone-500 mt-0.5">
                                  你的条件: <span className="font-semibold text-stone-700">{detail.user_value || "未填写"}</span>
                                  {detail.required && (
                                    <span className="ml-2 text-stone-400">· 要求: {detail.required}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className={`text-lg font-bold tabular-nums ${
                              detail.is_match ? "text-emerald-600" : detail.is_hard_match ? "text-red-600" : "text-amber-600"
                            }`}>
                              {detail.score}/{detail.max_score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmatch Reasons */}
                  {matchData.unmatch_reasons && matchData.unmatch_reasons.length > 0 && (
                    <div className="p-5 bg-gradient-to-r from-red-50 to-red-100/30 rounded-xl border border-red-200">
                      <p className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                        <div className="p-1.5 bg-red-100 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        不符合项提示
                      </p>
                      <ul className="space-y-2">
                        {matchData.unmatch_reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {matchData.suggestions && matchData.suggestions.length > 0 && (
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl border border-blue-200">
                      <p className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Info className="w-4 h-4" />
                        </div>
                        报考建议
                      </p>
                      <ul className="space-y-2">
                        {matchData.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start gap-2 bg-white/50 p-2 rounded-lg">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-stone-400" />
                    </div>
                    <div className="absolute -inset-2 bg-stone-200/50 rounded-3xl blur-xl" />
                  </div>
                  <p className="text-stone-600 font-medium mb-2">完善个人画像后可查看匹配分析</p>
                  <p className="text-sm text-stone-400 mb-4">AI 将为您分析该职位与您条件的匹配程度</p>
                  <Link
                    href="/preferences"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 text-sm font-semibold"
                  >
                    完善个人画像
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Not logged in hint for match analysis */}
          {!isAuthenticated && (
            <div className="relative bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/30 rounded-2xl border border-amber-200/50 p-6 overflow-hidden">
              {/* 装饰元素 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <div className="relative flex items-start gap-4">
                <div className="p-3.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-lg shadow-amber-200/30">
                  <Sparkles className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-serif font-bold text-stone-800 text-lg">AI 匹配分析</h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                      智能
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                    登录并完善个人画像后，AI 将为您分析该职位与您条件的详细匹配程度，包括学历、专业、年龄等多维度分析
                  </p>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 text-sm font-semibold"
                  >
                    登录查看分析
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Remark */}
          {position.remark && (
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 p-6 lg:p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-indigo-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              
              <h2 className="relative text-lg font-serif font-bold text-stone-800 mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                备注说明
              </h2>
              <div className="relative p-4 bg-stone-50/80 rounded-xl">
                <p className="text-stone-600 whitespace-pre-wrap leading-relaxed">{position.remark}</p>
              </div>
            </div>
          )}

          {/* 历年数据卡片 */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 hover:shadow-2xl hover:shadow-stone-200/40 transition-all duration-300 p-6 lg:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/30 to-teal-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h2 className="relative text-lg font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center shadow-sm">
                <BarChart2 className="w-5 h-5 text-cyan-600" />
              </div>
              历年数据
              <span className="ml-auto text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">
                数据支持
              </span>
            </h2>
            
            {historyLoading ? (
              <div className="relative flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center">
                    <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
                  </div>
                  <div className="absolute -inset-2 bg-cyan-400/20 rounded-3xl blur-xl animate-pulse" />
                </div>
                <span className="mt-4 text-stone-500">加载历年数据...</span>
              </div>
            ) : historyData && historyData.histories && historyData.histories.length > 0 ? (
              <div className="relative space-y-6">
                {/* 趋势图表 */}
                {historyData.yearly_trend && historyData.yearly_trend.length > 0 && (
                  <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-xl">
                    <h3 className="text-sm font-semibold text-stone-600 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                      招录趋势
                    </h3>
                    <div className="flex items-end justify-between gap-3 h-36 px-2">
                      {historyData.yearly_trend.slice(-5).map((item: YearlyTrendItem, index: number) => {
                        const maxRatio = Math.max(...historyData.yearly_trend.slice(-5).map((t: YearlyTrendItem) => t.competition_ratio || 1));
                        const height = maxRatio > 0 ? (item.competition_ratio / maxRatio) * 100 : 20;
                        return (
                          <div key={item.year} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center">
                              <span className="text-xs font-semibold text-amber-600 mb-1">{item.competition_ratio.toFixed(0)}:1</span>
                              <div 
                                className="w-full max-w-14 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-xl transition-all duration-500 hover:from-amber-600 hover:to-amber-500 shadow-sm"
                                style={{ height: `${Math.max(height, 15)}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-600 font-semibold bg-white px-2 py-0.5 rounded-lg shadow-sm">{item.year}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-400 text-center mt-3">竞争比趋势（近5年）</p>
                  </div>
                )}

                {/* 历年数据表格 */}
                <div className="overflow-x-auto rounded-xl border border-stone-200/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-stone-100 to-stone-50">
                        <th className="text-left py-3 px-4 font-semibold text-stone-600">年份</th>
                        <th className="text-center py-3 px-4 font-semibold text-stone-600">招录</th>
                        <th className="text-center py-3 px-4 font-semibold text-stone-600">报名</th>
                        <th className="text-center py-3 px-4 font-semibold text-stone-600">竞争比</th>
                        <th className="text-center py-3 px-4 font-semibold text-stone-600">进面分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.histories.slice(0, 5).map((h: PositionHistoryItem, index: number) => (
                        <tr key={h.id} className={`border-t border-stone-100 hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'}`}>
                          <td className="py-3 px-4 font-semibold text-stone-800">{h.year}年</td>
                          <td className="py-3 px-4 text-center text-stone-700">{h.recruit_count}人</td>
                          <td className="py-3 px-4 text-center text-stone-700">{h.applicant_count || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            {h.competition_ratio > 0 ? (
                              <span className={`inline-flex px-2 py-0.5 rounded-lg font-semibold ${
                                h.competition_ratio > 100 ? 'bg-red-100 text-red-600' : 
                                h.competition_ratio > 50 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {h.competition_ratio.toFixed(0)}:1
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {h.interview_score > 0 ? (
                              <span className="font-semibold text-blue-600">{h.interview_score.toFixed(1)}</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分数线预测 */}
                {historyData.prediction && historyData.prediction.predicted_score > 0 && (
                  <div className="p-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-100/30 rounded-xl border border-blue-200/50 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
                    <div className="relative flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-semibold flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          分数线预测
                        </p>
                        <p className="text-4xl font-display font-bold text-blue-600 tabular-nums">
                          {historyData.prediction.predicted_score.toFixed(1)} <span className="text-xl font-normal text-blue-400">分</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500 mb-1">预测置信度</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                              style={{ width: `${historyData.prediction.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {(historyData.prediction.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-blue-200/50">{historyData.prediction.basis}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative text-center py-12">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                    <BarChart2 className="w-8 h-8 text-stone-400" />
                  </div>
                  <div className="absolute -inset-2 bg-stone-200/50 rounded-3xl blur-xl" />
                </div>
                <p className="text-stone-600 font-medium">暂无历年数据</p>
                <p className="text-sm text-stone-400 mt-1">该职位暂未收录历年招录数据</p>
              </div>
            )}
          </div>
          </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Registration Status Card - 全新设计 */}
          {registrationStatus && (
            <div className={`relative rounded-2xl border-2 p-6 overflow-hidden transition-all duration-300 hover:shadow-lg ${
              registrationStatus.status === "ended" 
                ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200 hover:shadow-red-100" 
                : registrationStatus.status === "urgent" 
                  ? "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 hover:shadow-amber-100" 
                  : registrationStatus.status === "upcoming" 
                    ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-blue-100" 
                    : "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 hover:shadow-emerald-100"
            }`}>
              {/* 装饰 */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-50 ${
                registrationStatus.status === "ended" ? "bg-red-200" :
                registrationStatus.status === "urgent" ? "bg-amber-200" :
                registrationStatus.status === "upcoming" ? "bg-blue-200" :
                "bg-emerald-200"
              }`} />
              
              <div className="relative flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl shadow-lg ${
                  registrationStatus.status === "ended" 
                    ? "bg-gradient-to-br from-red-400 to-red-500 shadow-red-200" 
                    : registrationStatus.status === "urgent" 
                      ? "bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200" 
                      : registrationStatus.status === "upcoming" 
                        ? "bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-200" 
                        : "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-200"
                }`}>
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">报名状态</p>
                  <p className={`text-xl font-bold ${registrationStatus.color}`}>
                    {registrationStatus.text}
                  </p>
                </div>
              </div>
              {position.registration_end && registrationStatus.status !== "ended" && (
                <p className="relative text-sm text-stone-500 mt-4 pt-4 border-t border-dashed border-stone-200">
                  截止时间：<span className="font-semibold text-stone-700">{formatDate(position.registration_end)}</span>
                </p>
              )}
            </div>
          )}

          {/* Timeline Card - 全新设计 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h3 className="relative text-lg font-serif font-bold text-stone-800 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              时间节点
            </h3>
            <div className="relative space-y-0">
              {/* 连接线 */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-200 via-amber-200 to-stone-200" />
              
              <div className="relative flex items-start gap-4 pb-6">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  registrationStatus?.status === "ended" || registrationStatus?.status === "active" || registrationStatus?.status === "urgent"
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-500" : "bg-stone-200"
                }`}>
                  <Check className={`w-4 h-4 ${
                    registrationStatus?.status === "ended" || registrationStatus?.status === "active" || registrationStatus?.status === "urgent"
                      ? "text-white" : "text-stone-400"
                  }`} />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-stone-800">报名开始</p>
                  <p className="text-sm text-stone-500 mt-0.5">{formatDate(position.registration_start)}</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 pb-6">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  registrationStatus?.status === "ended" 
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-500" 
                    : "bg-gradient-to-br from-amber-400 to-amber-500 animate-pulse"
                }`}>
                  {registrationStatus?.status === "ended" ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Clock className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-stone-800">报名截止</p>
                  <p className="text-sm text-stone-500 mt-0.5">{formatDate(position.registration_end)}</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4 pb-6">
                <div className="relative z-10 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shadow-md">
                  <FileText className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-semibold text-stone-800">笔试时间</p>
                  <p className="text-sm text-stone-500 mt-0.5">{formatDate(position.exam_date)}</p>
                </div>
              </div>
              
              {position.interview_date && (
                <div className="relative flex items-start gap-4">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-semibold text-stone-800">面试时间</p>
                    <p className="text-sm text-stone-500 mt-0.5">{formatDate(position.interview_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card - 全新设计 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-100/30 to-purple-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <h3 className="relative text-lg font-serif font-bold text-stone-800 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              快捷操作
            </h3>
            <div className="relative space-y-3">
              <button
                onClick={handleToggleFavorite}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                className={`group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isFavorited
                    ? "bg-gradient-to-r from-red-50 to-red-100/50 text-red-600 border-2 border-red-200 hover:shadow-red-100"
                    : "bg-stone-50 text-stone-700 border-2 border-stone-200 hover:border-amber-300 hover:shadow-amber-100"
                }`}
              >
                <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "取消收藏" : "收藏职位"}
              </button>
              <button
                onClick={handleToggleCompare}
                className={`group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  isInCompare
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-600 border-2 border-emerald-200 hover:shadow-emerald-100"
                    : "bg-stone-50 text-stone-700 border-2 border-stone-200 hover:border-amber-300 hover:shadow-amber-100"
                }`}
              >
                <Scale className="w-5 h-5 transition-transform group-hover:scale-110" />
                {isInCompare ? "移除对比" : "加入对比"}
              </button>
              <button
                onClick={handleShare}
                className="group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold bg-stone-50 text-stone-700 border-2 border-stone-200 hover:border-amber-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-100"
              >
                {copySuccess ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Share2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                )}
                {copySuccess ? "链接已复制" : "分享职位"}
              </button>
              {position.source_url && (
                <a
                  href={position.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
                >
                  <ExternalLink className="w-5 h-5 transition-transform group-hover:scale-110" />
                  查看原公告
                </a>
              )}
            </div>
          </div>

          {/* Compare Bar (if items in compare) - 全新设计 */}
          {compareList.length > 0 && (
            <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border-2 border-emerald-200 p-5 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-200/30 rounded-full blur-2xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    已选 <span className="text-lg">{compareList.length}</span>/{MAX_COMPARE_COUNT} 个职位
                  </span>
                  <button
                    onClick={() => {
                      setCompareList([]);
                      saveCompareList([]);
                    }}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-white px-2 py-1 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    清空
                  </button>
                </div>
                <Link
                  href={`/positions/compare?ids=${compareList.join(",")}`}
                  className="group flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                >
                  开始对比
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* Related Announcement Link - 全新设计 */}
          {position.announcement_id && (
            <Link
              href={`/announcements/${position.announcement_id}`}
              className="group block bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-stone-200/30 p-5 hover:shadow-2xl hover:shadow-amber-100/30 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              
              <div className="relative flex items-center gap-4">
                <div className="p-3.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-200/30">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-stone-800 group-hover:text-amber-700 transition-colors">
                    查看相关公告
                  </p>
                  <p className="text-sm text-stone-500">了解更多职位详情</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Mobile Fixed Bottom Bar - 全新设计 */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-stone-200/50 flex gap-3 shadow-2xl shadow-stone-900/10">
            <button
              onClick={handleToggleFavorite}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                isFavorited
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleToggleCompare}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                isInCompare
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "border-stone-200 text-stone-400 hover:border-amber-300 hover:text-amber-500"
              }`}
            >
              <Scale className="w-5 h-5" />
            </button>
            {position.source_url ? (
              <a
                href={position.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl text-center hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30"
              >
                <ExternalLink className="w-5 h-5" />
                查看原公告
              </a>
            ) : (
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-xl shadow-amber-500/30"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    链接已复制
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    分享职位
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
