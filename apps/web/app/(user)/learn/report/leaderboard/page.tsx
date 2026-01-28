"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Zap,
  Flame,
  Medal,
  Crown,
  ChevronRight,
  Loader2,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useLeaderboard, formatStudyTime } from "@/hooks/useLearningStats";
import { useAuthStore } from "@/stores/authStore";
import { LeaderboardEntry } from "@/services/api/learning";

// 排行榜类型
type LeaderboardTab = "daily" | "weekly" | "consecutive";
type MetricTab = "study_time" | "question_count";

// 排名徽章
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
        <Crown className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center shadow-md">
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
      <span className="text-sm font-semibold text-stone-600">{rank}</span>
    </div>
  );
}

// 排行榜项
function LeaderboardItem({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
        isMe
          ? "bg-amber-50 border border-amber-200"
          : entry.rank <= 3
          ? "bg-gradient-to-r from-amber-50/50 to-transparent"
          : "hover:bg-stone-50"
      }`}
    >
      <RankBadge rank={entry.rank} />
      
      <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
        {entry.avatar ? (
          <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-5 h-5 text-stone-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${isMe ? "text-amber-700" : "text-stone-700"}`}>
            {entry.username || `用户${entry.user_id}`}
          </span>
          {isMe && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">我</span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className={`font-semibold ${isMe ? "text-amber-700" : "text-stone-800"}`}>
          {entry.value_unit === "分钟"
            ? formatStudyTime(entry.value)
            : `${entry.value}${entry.value_unit}`}
        </div>
        {entry.change !== 0 && (
          <div className={`flex items-center justify-end gap-1 text-xs ${
            entry.change > 0 ? "text-green-600" : entry.change < 0 ? "text-red-600" : "text-stone-400"
          }`}>
            {entry.change > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : entry.change < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(entry.change)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 按钮
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? "bg-amber-500 text-white"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

export default function LeaderboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    loading,
    dailyLeaderboard,
    weeklyLeaderboard,
    consecutiveLeaderboard,
    fetchDailyLeaderboard,
    fetchWeeklyLeaderboard,
    fetchConsecutiveLeaderboard,
  } = useLeaderboard();

  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>("daily");
  const [metricTab, setMetricTab] = useState<MetricTab>("study_time");

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      switch (leaderboardTab) {
        case "daily":
          await fetchDailyLeaderboard(metricTab);
          break;
        case "weekly":
          await fetchWeeklyLeaderboard(metricTab);
          break;
        case "consecutive":
          await fetchConsecutiveLeaderboard();
          break;
      }
    };
    loadData();
  }, [leaderboardTab, metricTab, fetchDailyLeaderboard, fetchWeeklyLeaderboard, fetchConsecutiveLeaderboard]);

  // 获取当前排行榜数据
  const getCurrentLeaderboard = () => {
    switch (leaderboardTab) {
      case "daily":
        return dailyLeaderboard;
      case "weekly":
        return weeklyLeaderboard;
      case "consecutive":
        return consecutiveLeaderboard;
      default:
        return null;
    }
  };

  const currentLeaderboard = getCurrentLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
              <Link href="/learn" className="hover:text-amber-600">学习中心</Link>
              <span>/</span>
              <span>排行榜</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              学习排行榜
            </h1>
          </div>
          <Link
            href="/learn/report/daily"
            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            我的报告 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 时间范围选择 */}
        <div className="flex gap-2 mb-6">
          <TabButton
            active={leaderboardTab === "daily"}
            onClick={() => setLeaderboardTab("daily")}
            icon={Clock}
            label="今日"
          />
          <TabButton
            active={leaderboardTab === "weekly"}
            onClick={() => setLeaderboardTab("weekly")}
            icon={Clock}
            label="本周"
          />
          <TabButton
            active={leaderboardTab === "consecutive"}
            onClick={() => setLeaderboardTab("consecutive")}
            icon={Flame}
            label="连续打卡"
          />
        </div>

        {/* 指标选择（仅日/周榜显示） */}
        {leaderboardTab !== "consecutive" && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMetricTab("study_time")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                metricTab === "study_time"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              学习时长
            </button>
            <button
              onClick={() => setMetricTab("question_count")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                metricTab === "question_count"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <Zap className="w-4 h-4" />
              做题数量
            </button>
          </div>
        )}

        {/* 我的排名 */}
        {isAuthenticated && currentLeaderboard?.my_rank && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border border-amber-200">
            <div className="text-sm text-amber-700 mb-2">我的排名</div>
            <LeaderboardItem entry={currentLeaderboard.my_rank} isMe={true} />
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="bg-white rounded-2xl border border-stone-200/50 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : currentLeaderboard?.entries && currentLeaderboard.entries.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {currentLeaderboard.entries.slice(0, 50).map((entry, idx) => (
                <LeaderboardItem
                  key={idx}
                  entry={entry}
                  isMe={user?.id === entry.user_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-stone-300" />
              <h2 className="text-xl font-semibold text-stone-700 mb-2">暂无排行数据</h2>
              <p className="text-stone-500 mb-6">快去学习，争取上榜吧！</p>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-colors"
              >
                开始学习
              </Link>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {currentLeaderboard && currentLeaderboard.total_users > 0 && (
          <div className="mt-4 text-center text-sm text-stone-400">
            共 {currentLeaderboard.total_users} 位用户参与
          </div>
        )}

        {/* 快捷导航 */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link
            href="/learn/report/ability"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">能力分析</div>
              <div className="text-xs text-stone-400">查看综合能力评估</div>
            </div>
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-200/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="font-medium text-stone-700 group-hover:text-amber-600 transition-colors">继续学习</div>
              <div className="text-xs text-stone-400">提升排名！</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
