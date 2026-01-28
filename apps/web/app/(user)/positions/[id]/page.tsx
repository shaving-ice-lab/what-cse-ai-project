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
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { usePositionDetail, useAddFavorite, useRemoveFavorite, usePositionHistory } from "@/hooks/usePosition";
import { usePositionMatchDetail, getMatchScoreColor, getMatchScoreLabel, getStarLevelText } from "@/hooks/useMatch";
import { useAuthStore } from "@/stores/authStore";
import type { Position, PositionDetail, PositionHistoryItem, YearlyTrendItem } from "@/services/api/position";
import type { MatchCondition } from "@/services/api/match";

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
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !position) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertCircle className="w-16 h-16 text-stone-300 mb-4" />
          <h2 className="text-xl font-semibold text-stone-700 mb-2">职位不存在</h2>
          <p className="text-stone-500 mb-6">该职位可能已被删除或链接无效</p>
          <Link
            href="/positions"
            className="px-6 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            返回职位列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 pb-24 lg:pb-8">
      {/* Back Button */}
      <Link
        href="/positions"
        className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>返回列表</span>
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Position Header Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
            <div className="p-6 lg:p-8">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-2xl lg:text-3xl font-serif font-bold text-stone-800">
                      {position.position_name}
                    </h1>
                    {position.exam_type && (
                      <span className="px-3 py-1 text-sm font-medium rounded-lg bg-blue-100 text-blue-700">
                        {position.exam_type}
                      </span>
                    )}
                    {position.is_unlimited_major && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        不限专业
                      </span>
                    )}
                    {position.is_for_fresh_graduate && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        应届可报
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-2 text-lg text-stone-600">
                    <Building2 className="w-5 h-5 text-stone-400 flex-shrink-0" />
                    <span>{position.department_name}</span>
                    {position.department_level && (
                      <span className="text-sm text-stone-400">({position.department_level})</span>
                    )}
                  </p>
                  {position.position_code && (
                    <p className="text-sm text-stone-400 mt-1">职位代码：{position.position_code}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFavorited
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                    title={isFavorited ? "取消收藏" : "收藏职位"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={handleToggleCompare}
                    className={`p-3 rounded-xl border transition-colors ${
                      isInCompare
                        ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                    title={isInCompare ? "移除对比" : "加入对比"}
                  >
                    <Scale className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors relative"
                    title="分享职位"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-1">
                    <Users className="w-4 h-4" />
                    招录人数
                  </p>
                  <p className="text-2xl font-bold text-stone-800">{position.recruit_count}<span className="text-base font-normal">人</span></p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    报名人数
                  </p>
                  <p className="text-2xl font-bold text-stone-800">
                    {position.applicant_count ?? "-"}<span className="text-base font-normal">人</span>
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-1">
                    <Award className="w-4 h-4" />
                    竞争比
                  </p>
                  <p className={`text-2xl font-bold ${competitionRatio && competitionRatio > 100 ? "text-red-500" : "text-amber-600"}`}>
                    {competitionRatio ? `${competitionRatio}:1` : "-"}
                  </p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <p className="text-sm text-stone-500 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4" />
                    工作地点
                  </p>
                  <p className="text-lg font-semibold text-stone-800 truncate" title={position.work_location || `${position.province || ""}${position.city || ""}`}>
                    {position.work_location || `${position.province || ""}${position.city || ""}` || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              基本信息
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">职位名称</span>
                <span className="font-medium text-stone-800">{position.position_name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">招录单位</span>
                <span className="font-medium text-stone-800 text-right max-w-[200px] truncate" title={position.department_name}>
                  {position.department_name}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">招录人数</span>
                <span className="font-medium text-stone-800">{position.recruit_count}人</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">工作地点</span>
                <span className="font-medium text-stone-800">
                  {position.work_location || `${position.province || ""}${position.city || ""}${position.district || ""}` || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">报名时间</span>
                <span className="font-medium text-stone-800">
                  {position.registration_start ? formatDate(position.registration_start) : "待定"}
                  {position.registration_end ? ` ~ ${formatDate(position.registration_end)}` : ""}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-500">考试时间</span>
                <span className="font-medium text-stone-800">{formatDate(position.exam_date)}</span>
              </div>
              {position.interview_date && (
                <div className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="text-stone-500">面试时间</span>
                  <span className="font-medium text-stone-800">{formatDate(position.interview_date)}</span>
                </div>
              )}
              {position.exam_category && (
                <div className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="text-stone-500">考试类别</span>
                  <span className="font-medium text-stone-800">{position.exam_category}</span>
                </div>
              )}
              {position.service_period && (
                <div className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="text-stone-500">服务期限</span>
                  <span className="font-medium text-stone-800">{position.service_period}</span>
                </div>
              )}
              {position.salary_range && (
                <div className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="text-stone-500">薪资范围</span>
                  <span className="font-medium text-emerald-600">{position.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Requirements Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-500" />
              报考条件
            </h2>
            <div className="space-y-3">
              {requirements.map((req, index) => (
                <div
                  key={index}
                  className={`flex items-start justify-between p-4 rounded-xl border ${
                    req.highlight === "positive"
                      ? "bg-emerald-50/50 border-emerald-200"
                      : "bg-stone-50 border-stone-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      req.highlight === "positive" ? "bg-emerald-100 text-emerald-600" : "bg-stone-200 text-stone-500"
                    }`}>
                      {req.icon}
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{req.name}</p>
                      <p className="font-medium text-stone-800 mt-0.5">{req.value}</p>
                    </div>
                  </div>
                  {req.highlight === "positive" && (
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                      优势
                    </span>
                  )}
                </div>
              ))}
              
              {/* 其他条件 */}
              {position.other_conditions && (
                <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700 font-medium mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    其他条件
                  </p>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap">{position.other_conditions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Match Analysis Card - Only for logged in users */}
          {isAuthenticated && (
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                匹配分析
              </h2>
              
              {matchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                  <span className="ml-2 text-stone-500">分析匹配度...</span>
                </div>
              ) : matchData ? (
                <div className="space-y-6">
                  {/* Overall Match Score */}
                  <div className={`p-5 rounded-xl bg-gradient-to-r ${
                    matchData.match_score >= 90 ? "from-emerald-50 to-emerald-100 border border-emerald-200" :
                    matchData.match_score >= 70 ? "from-amber-50 to-amber-100 border border-amber-200" :
                    matchData.match_score >= 50 ? "from-orange-50 to-orange-100 border border-orange-200" :
                    "from-stone-50 to-stone-100 border border-stone-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-stone-600 mb-1">整体匹配度</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-3xl font-bold ${
                            matchData.match_score >= 90 ? "text-emerald-600" :
                            matchData.match_score >= 70 ? "text-amber-600" :
                            matchData.match_score >= 50 ? "text-orange-600" :
                            "text-stone-600"
                          }`}>
                            {matchData.match_score.toFixed(0)}
                          </span>
                          <span className="text-lg text-stone-500">分</span>
                          <span className={`px-2 py-0.5 text-sm font-medium rounded-lg ${
                            matchData.match_score >= 90 ? "bg-emerald-100 text-emerald-700" :
                            matchData.match_score >= 70 ? "bg-amber-100 text-amber-700" :
                            matchData.match_score >= 50 ? "bg-orange-100 text-orange-700" :
                            "bg-stone-100 text-stone-700"
                          }`}>
                            {matchData.match_level || getMatchScoreLabel(matchData.match_score)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl text-amber-500">{getStarLevelText(matchData.star_level)}</p>
                        <p className={`text-sm font-medium ${matchData.is_eligible ? "text-emerald-600" : "text-red-500"}`}>
                          {matchData.is_eligible ? "✓ 符合报考条件" : "✗ 可能不符合条件"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Match Details by Dimension */}
                  {matchData.match_details && matchData.match_details.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-stone-600 mb-3">各维度匹配详情</h3>
                      <div className="space-y-2">
                        {matchData.match_details.map((detail: MatchCondition, index: number) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-xl border ${
                              detail.is_match
                                ? "bg-emerald-50/50 border-emerald-200"
                                : detail.is_hard_match
                                  ? "bg-red-50/50 border-red-200"
                                  : "bg-amber-50/50 border-amber-200"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                detail.is_match ? "bg-emerald-100" : detail.is_hard_match ? "bg-red-100" : "bg-amber-100"
                              }`}>
                                {detail.is_match ? (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <X className={`w-4 h-4 ${detail.is_hard_match ? "text-red-600" : "text-amber-600"}`} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-stone-800">{detail.condition}</p>
                                <p className="text-xs text-stone-500">
                                  你的条件: <span className="font-medium">{detail.user_value || "未填写"}</span>
                                  {detail.required && ` · 要求: ${detail.required}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-sm font-bold ${
                                detail.is_match ? "text-emerald-600" : detail.is_hard_match ? "text-red-600" : "text-amber-600"
                              }`}>
                                {detail.score}/{detail.max_score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmatch Reasons */}
                  {matchData.unmatch_reasons && matchData.unmatch_reasons.length > 0 && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        不符合项提示
                      </p>
                      <ul className="space-y-1">
                        {matchData.unmatch_reasons.map((reason: string, index: number) => (
                          <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {matchData.suggestions && matchData.suggestions.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        报考建议
                      </p>
                      <ul className="space-y-1">
                        {matchData.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                            <span className="mt-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 mb-2">完善个人画像后可查看匹配分析</p>
                  <Link
                    href="/preferences"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
                  >
                    完善个人画像
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Not logged in hint for match analysis */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800 mb-1">查看匹配分析</h3>
                  <p className="text-sm text-stone-600 mb-3">
                    登录并完善个人画像后，可查看该职位与您条件的详细匹配分析
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-medium"
                  >
                    登录查看
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Remark */}
          {position.remark && (
            <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-500" />
                备注说明
              </h2>
              <p className="text-stone-600 whitespace-pre-wrap leading-relaxed">{position.remark}</p>
            </div>
          )}

          {/* 历年数据卡片 */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-500" />
              历年数据
            </h2>
            
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                <span className="ml-2 text-stone-500">加载历年数据...</span>
              </div>
            ) : historyData && historyData.histories && historyData.histories.length > 0 ? (
              <div className="space-y-6">
                {/* 趋势图表 */}
                {historyData.yearly_trend && historyData.yearly_trend.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-stone-600 mb-3">招录趋势</h3>
                    <div className="flex items-end justify-between gap-2 h-32 px-2">
                      {historyData.yearly_trend.slice(-5).map((item: YearlyTrendItem, index: number) => {
                        const maxRatio = Math.max(...historyData.yearly_trend.slice(-5).map((t: YearlyTrendItem) => t.competition_ratio || 1));
                        const height = maxRatio > 0 ? (item.competition_ratio / maxRatio) * 100 : 20;
                        return (
                          <div key={item.year} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex flex-col items-center">
                              <span className="text-xs text-stone-500 mb-1">{item.competition_ratio.toFixed(0)}:1</span>
                              <div 
                                className="w-full max-w-12 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-300"
                                style={{ height: `${Math.max(height, 10)}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-600 font-medium">{item.year}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-stone-400 text-center mt-2">竞争比趋势（近5年）</p>
                  </div>
                )}

                {/* 历年数据表格 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-200">
                        <th className="text-left py-2 px-2 font-medium text-stone-600">年份</th>
                        <th className="text-center py-2 px-2 font-medium text-stone-600">招录</th>
                        <th className="text-center py-2 px-2 font-medium text-stone-600">报名</th>
                        <th className="text-center py-2 px-2 font-medium text-stone-600">竞争比</th>
                        <th className="text-center py-2 px-2 font-medium text-stone-600">进面分</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.histories.slice(0, 5).map((h: PositionHistoryItem) => (
                        <tr key={h.id} className="border-b border-stone-100 hover:bg-stone-50">
                          <td className="py-2 px-2 font-medium text-stone-800">{h.year}年</td>
                          <td className="py-2 px-2 text-center text-stone-700">{h.recruit_count}人</td>
                          <td className="py-2 px-2 text-center text-stone-700">{h.applicant_count || '-'}</td>
                          <td className="py-2 px-2 text-center">
                            {h.competition_ratio > 0 ? (
                              <span className={`font-medium ${
                                h.competition_ratio > 100 ? 'text-red-600' : 
                                h.competition_ratio > 50 ? 'text-amber-600' : 'text-emerald-600'
                              }`}>
                                {h.competition_ratio.toFixed(0)}:1
                              </span>
                            ) : '-'}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {h.interview_score > 0 ? (
                              <span className="font-medium text-blue-600">{h.interview_score.toFixed(1)}</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分数线预测 */}
                {historyData.prediction && historyData.prediction.predicted_score > 0 && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700 font-medium flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4" />
                          分数线预测
                        </p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          {historyData.prediction.predicted_score.toFixed(1)} 分
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">预测置信度</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {(historyData.prediction.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">{historyData.prediction.basis}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">暂无历年数据</p>
                <p className="text-sm text-stone-400 mt-1">该职位暂未收录历年招录数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Registration Status Card */}
          {registrationStatus && (
            <div className={`rounded-2xl border p-5 ${
              registrationStatus.status === "ended" ? "bg-red-50 border-red-200" :
              registrationStatus.status === "urgent" ? "bg-amber-50 border-amber-200" :
              registrationStatus.status === "upcoming" ? "bg-blue-50 border-blue-200" :
              "bg-emerald-50 border-emerald-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                  registrationStatus.status === "ended" ? "bg-red-100" :
                  registrationStatus.status === "urgent" ? "bg-amber-100" :
                  registrationStatus.status === "upcoming" ? "bg-blue-100" :
                  "bg-emerald-100"
                }`}>
                  <Clock className={`w-6 h-6 ${
                    registrationStatus.status === "ended" ? "text-red-600" :
                    registrationStatus.status === "urgent" ? "text-amber-600" :
                    registrationStatus.status === "upcoming" ? "text-blue-600" :
                    "text-emerald-600"
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-stone-600">报名状态</p>
                  <p className={`text-lg font-bold ${registrationStatus.color}`}>
                    {registrationStatus.text}
                  </p>
                </div>
              </div>
              {position.registration_end && registrationStatus.status !== "ended" && (
                <p className="text-sm text-stone-500 mt-3">
                  截止时间：{formatDate(position.registration_end)}
                </p>
              )}
            </div>
          )}

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              时间节点
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${
                  registrationStatus?.status === "ended" || registrationStatus?.status === "active" || registrationStatus?.status === "urgent"
                    ? "bg-emerald-500" : "bg-stone-300"
                }`} />
                <div>
                  <p className="font-medium text-stone-800">报名开始</p>
                  <p className="text-sm text-stone-500">{formatDate(position.registration_start)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 mt-1.5 rounded-full flex-shrink-0 ${
                  registrationStatus?.status === "ended" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                }`} />
                <div>
                  <p className="font-medium text-stone-800">报名截止</p>
                  <p className="text-sm text-stone-500">{formatDate(position.registration_end)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 mt-1.5 rounded-full flex-shrink-0 bg-stone-300" />
                <div>
                  <p className="font-medium text-stone-800">笔试时间</p>
                  <p className="text-sm text-stone-500">{formatDate(position.exam_date)}</p>
                </div>
              </div>
              {position.interview_date && (
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 mt-1.5 rounded-full flex-shrink-0 bg-stone-300" />
                  <div>
                    <p className="font-medium text-stone-800">面试时间</p>
                    <p className="text-sm text-stone-500">{formatDate(position.interview_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card p-6">
            <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              快捷操作
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleToggleFavorite}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                  isFavorited
                    ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "取消收藏" : "收藏职位"}
              </button>
              <button
                onClick={handleToggleCompare}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                  isInCompare
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Scale className="w-5 h-5" />
                {isInCompare ? "移除对比" : "加入对比"}
              </button>
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100 transition-colors"
              >
                {copySuccess ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                {copySuccess ? "链接已复制" : "分享职位"}
              </button>
              {position.source_url && (
                <a
                  href={position.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  查看原公告
                </a>
              )}
            </div>
          </div>

          {/* Compare Bar (if items in compare) */}
          {compareList.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-emerald-700">
                  已选 {compareList.length}/{MAX_COMPARE_COUNT} 个职位
                </span>
                <button
                  onClick={() => {
                    setCompareList([]);
                    saveCompareList([]);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-800"
                >
                  清空
                </button>
              </div>
              <Link
                href={`/positions/compare?ids=${compareList.join(",")}`}
                className="block w-full py-2.5 text-center bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              >
                开始对比
              </Link>
            </div>
          )}

          {/* Related Announcement Link */}
          {position.announcement_id && (
            <Link
              href={`/announcements/${position.announcement_id}`}
              className="block bg-white rounded-2xl border border-stone-200/50 shadow-card p-5 hover:border-amber-200 hover:shadow-card-hover transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
                    查看相关公告
                  </p>
                  <p className="text-sm text-stone-500">了解更多职位详情</p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>
          )}

          {/* Mobile Fixed Bottom Bar */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-stone-200 flex gap-3">
            <button
              onClick={handleToggleFavorite}
              className={`p-4 rounded-xl border ${
                isFavorited
                  ? "bg-red-50 border-red-200 text-red-500"
                  : "border-stone-200 text-stone-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleToggleCompare}
              className={`p-4 rounded-xl border ${
                isInCompare
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "border-stone-200 text-stone-500"
              }`}
            >
              <Scale className="w-5 h-5" />
            </button>
            {position.source_url ? (
              <a
                href={position.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl text-center hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
              >
                查看原公告
              </a>
            ) : (
              <button
                onClick={handleShare}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md"
              >
                {copySuccess ? "链接已复制" : "分享职位"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
