import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  GraduationCap,
} from "lucide-react";

interface UserCondition {
  label: string;
  value: string;
  status: "matched" | "partial" | "limited";
}

const USER_CONDITIONS: UserCondition[] = [
  { label: "学历", value: "本科", status: "matched" },
  { label: "专业", value: "计算机科学与技术", status: "matched" },
  { label: "政治面貌", value: "中共党员", status: "matched" },
  { label: "工作经验", value: "应届生", status: "partial" },
  { label: "年龄", value: "24岁", status: "matched" },
  { label: "户籍", value: "北京市", status: "limited" },
];

const MATCH_STATS = {
  totalPositions: 3842,
  matchedPositions: 256,
  highMatchPositions: 45,
  partialMatchPositions: 211,
};

const CATEGORY_STATS = [
  { category: "国考", total: 120, matched: 28, percentage: 23 },
  { category: "省考", total: 2500, matched: 156, percentage: 6 },
  { category: "事业单位", total: 1000, matched: 62, percentage: 6 },
  { category: "选调生", total: 222, matched: 10, percentage: 5 },
];

const REGION_STATS = [
  { region: "北京市", count: 45, trend: "up" },
  { region: "广东省", count: 38, trend: "up" },
  { region: "江苏省", count: 32, trend: "stable" },
  { region: "浙江省", count: 28, trend: "down" },
  { region: "上海市", count: 25, trend: "stable" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "matched":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "partial":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "limited":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "matched":
      return "完全符合";
    case "partial":
      return "部分符合";
    case "limited":
      return "受限";
    default:
      return "";
  }
};

export default function MatchReportPage() {
  const matchRate = ((MATCH_STATS.matchedPositions / MATCH_STATS.totalPositions) * 100).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6" />
        <h1 className="text-2xl font-bold">匹配报告</h1>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">可报考岗位</div>
          <div className="text-2xl font-bold text-primary mt-1">{MATCH_STATS.matchedPositions}</div>
          <div className="text-xs text-gray-400 mt-1">共{MATCH_STATS.totalPositions}个岗位</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">匹配度</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{matchRate}%</div>
          <div className="text-xs text-gray-400 mt-1">高于平均水平</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">高度匹配</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {MATCH_STATS.highMatchPositions}
          </div>
          <div className="text-xs text-gray-400 mt-1">匹配度≥90%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">竞争优势</div>
          <div className="text-2xl font-bold text-orange-500 mt-1">中等</div>
          <div className="text-xs text-gray-400 mt-1">综合评估</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 个人条件概览 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            个人条件概览
          </h2>
          <div className="space-y-3">
            {USER_CONDITIONS.map((condition, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-gray-600">{condition.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{condition.value}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(condition.status)}
                    <span
                      className={`text-xs ${
                        condition.status === "matched"
                          ? "text-green-500"
                          : condition.status === "partial"
                            ? "text-yellow-500"
                            : "text-red-500"
                      }`}
                    >
                      {getStatusText(condition.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>建议：</strong>
              您的户籍条件限制了部分岗位，建议关注不限户籍的岗位或考虑迁移户籍。
            </p>
          </div>
        </section>

        {/* 按考试类型统计 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            按考试类型统计
          </h2>
          <div className="space-y-4">
            {CATEGORY_STATS.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{stat.category}</span>
                  <span className="font-medium">
                    {stat.matched}/{stat.total} 个
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 地区分布 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            可报考岗位地区分布
          </h2>
          <div className="space-y-3">
            {REGION_STATS.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <span className="text-gray-600">{stat.region}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stat.count}个</span>
                  {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                  {stat.trend === "down" && (
                    <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 竞争优势分析 */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            竞争优势分析
          </h2>
          <div className="space-y-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-700 mb-1">优势条件</div>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• 中共党员身份：可报考部分限党员岗位</li>
                <li>• 计算机专业：热门需求专业，岗位选择多</li>
                <li>• 年龄优势：符合大部分岗位年龄要求</li>
              </ul>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-medium text-yellow-700 mb-1">提升建议</div>
              <ul className="text-sm text-yellow-600 space-y-1">
                <li>• 建议考取相关资格证书增加竞争力</li>
                <li>• 可关注招录人数较多的岗位降低竞争压力</li>
                <li>• 适当扩大地域选择范围</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 行动建议 */}
      <section className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">行动建议</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-medium">重点关注</div>
            <p className="text-sm text-gray-500 mt-1">
              优先查看{MATCH_STATS.highMatchPositions}个高匹配度岗位
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">📅</div>
            <div className="font-medium">时间规划</div>
            <p className="text-sm text-gray-500 mt-1">国考报名即将开始，建议提前准备</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-3xl mb-2">📚</div>
            <div className="font-medium">备考建议</div>
            <p className="text-sm text-gray-500 mt-1">根据目标岗位制定针对性复习计划</p>
          </div>
        </div>
      </section>
    </div>
  );
}
