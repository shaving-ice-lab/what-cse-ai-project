"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  BookOpen,
  FileQuestion,
  Layers,
  FileText,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from "@what-cse/ui";
import {
  contentGeneratorApi,
  ContentStats,
  getSubjectLabel,
} from "@/services/content-generator-api";
import { toast } from "sonner";

// ============================================
// Types
// ============================================

interface CourseCoverage {
  category: string;
  count: number;
  total_duration: number;
}

interface QuestionCoverage {
  category: string;
  count: number;
  by_difficulty: { [key: string]: number };
}

interface KnowledgeCoverage {
  category: string;
  total: number;
  with_content: number;
}

interface MaterialCoverage {
  type: string;
  count: number;
}

interface QuestionQuality {
  total: number;
  with_analysis: number;
  avg_correct_rate: number;
  avg_discrimination: number;
  difficulty_distribution: { [key: string]: number };
}

interface CourseQuality {
  total: number;
  avg_rating: number;
  avg_completion_rate: number;
  by_status: { [key: string]: number };
}

// ============================================
// Stats Card Component
// ============================================

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
  color?: string;
  bgColor?: string;
}

function StatsCard({ title, value, icon: Icon, description, trend, color = "text-blue-500", bgColor = "bg-blue-50" }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${
            trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-600" : "text-muted-foreground"
          }`}>
            {trend.direction === "up" ? <TrendingUp className="h-3 w-3" /> : trend.direction === "down" ? <TrendingDown className="h-3 w-3" /> : null}
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Coverage Progress Component
// ============================================

interface CoverageProgressProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

function CoverageProgress({ label, current, total, color = "bg-blue-500" }: CoverageProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{current}/{total}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</div>
    </div>
  );
}

// ============================================
// Distribution Bar Component
// ============================================

interface DistributionBarProps {
  data: { label: string; value: number; color: string }[];
  total: number;
}

function DistributionBar({ data, total }: DistributionBarProps) {
  return (
    <div className="space-y-3">
      <div className="h-4 flex rounded-full overflow-hidden">
        {data.map((item, index) => (
          <div
            key={index}
            className={`${item.color} transition-all`}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: ${item.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span>{item.label}: {item.value} ({((item.value / total) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Coverage Statistics Panel
// ============================================

interface CoverageStatsPanelProps {
  loading: boolean;
  subject: string;
}

function CoverageStatsPanel({ loading, subject }: CoverageStatsPanelProps) {
  const [courseCoverage, setCourseCoverage] = useState<CourseCoverage[]>([]);
  const [questionCoverage, setQuestionCoverage] = useState<QuestionCoverage[]>([]);
  const [knowledgeCoverage, setKnowledgeCoverage] = useState<KnowledgeCoverage[]>([]);

  useEffect(() => {
    // Mock data for demonstration
    setCourseCoverage([
      { category: "言语理解", count: 12, total_duration: 540 },
      { category: "数量关系", count: 8, total_duration: 360 },
      { category: "判断推理", count: 15, total_duration: 675 },
      { category: "资料分析", count: 10, total_duration: 450 },
      { category: "常识判断", count: 6, total_duration: 270 },
    ]);

    setQuestionCoverage([
      { category: "言语理解", count: 500, by_difficulty: { 入门: 50, 简单: 150, 中等: 200, 困难: 80, 极难: 20 } },
      { category: "数量关系", count: 400, by_difficulty: { 入门: 30, 简单: 100, 中等: 180, 困难: 70, 极难: 20 } },
      { category: "判断推理", count: 600, by_difficulty: { 入门: 60, 简单: 180, 中等: 240, 困难: 90, 极难: 30 } },
      { category: "资料分析", count: 350, by_difficulty: { 入门: 35, 简单: 100, 中等: 140, 困难: 55, 极难: 20 } },
      { category: "常识判断", count: 300, by_difficulty: { 入门: 60, 简单: 90, 中等: 100, 困难: 40, 极难: 10 } },
    ]);

    setKnowledgeCoverage([
      { category: "言语理解", total: 45, with_content: 38 },
      { category: "数量关系", total: 32, with_content: 25 },
      { category: "判断推理", total: 56, with_content: 48 },
      { category: "资料分析", total: 28, with_content: 22 },
      { category: "常识判断", total: 65, with_content: 40 },
    ]);
  }, [subject]);

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalCourses = courseCoverage.reduce((sum, c) => sum + c.count, 0);
  const totalDuration = courseCoverage.reduce((sum, c) => sum + c.total_duration, 0);
  const totalQuestions = questionCoverage.reduce((sum, q) => sum + q.count, 0);
  const totalKnowledgePoints = knowledgeCoverage.reduce((sum, k) => sum + k.total, 0);
  const coveredKnowledgePoints = knowledgeCoverage.reduce((sum, k) => sum + k.with_content, 0);

  return (
    <div className="space-y-6">
      {/* 总览统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="课程总数"
          value={totalCourses}
          icon={BookOpen}
          description={`总时长 ${Math.round(totalDuration / 60)} 小时`}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
        <StatsCard
          title="题目总数"
          value={totalQuestions.toLocaleString()}
          icon={FileQuestion}
          description="包含真题和模拟题"
          color="text-green-500"
          bgColor="bg-green-50"
        />
        <StatsCard
          title="知识点覆盖"
          value={`${((coveredKnowledgePoints / totalKnowledgePoints) * 100).toFixed(1)}%`}
          icon={Layers}
          description={`${coveredKnowledgePoints}/${totalKnowledgePoints} 知识点`}
          color="text-purple-500"
          bgColor="bg-purple-50"
        />
        <StatsCard
          title="平均课程数"
          value={(totalCourses / courseCoverage.length).toFixed(1)}
          icon={Target}
          description="每个分类平均课程"
          color="text-amber-500"
          bgColor="bg-amber-50"
        />
      </div>

      {/* 课程覆盖统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            课程覆盖统计
          </CardTitle>
          <CardDescription>各科目分类的课程数量和时长统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">课程数量分布</h4>
              {courseCoverage.map((item) => (
                <div key={item.category} className="flex items-center gap-4">
                  <span className="w-20 text-sm truncate">{item.category}</span>
                  <Progress value={(item.count / Math.max(...courseCoverage.map(c => c.count))) * 100} className="flex-1" />
                  <span className="w-12 text-sm text-muted-foreground text-right">{item.count} 门</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">课程时长分布</h4>
              {courseCoverage.map((item) => (
                <div key={item.category} className="flex items-center gap-4">
                  <span className="w-20 text-sm truncate">{item.category}</span>
                  <Progress value={(item.total_duration / Math.max(...courseCoverage.map(c => c.total_duration))) * 100} className="flex-1" />
                  <span className="w-16 text-sm text-muted-foreground text-right">{item.total_duration} 分钟</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 题库覆盖统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-green-500" />
            题库覆盖统计
          </CardTitle>
          <CardDescription>各科目分类的题目数量和难度分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {questionCoverage.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">{item.count} 道题</span>
                </div>
                <DistributionBar
                  data={[
                    { label: "入门", value: item.by_difficulty["入门"] || 0, color: "bg-green-400" },
                    { label: "简单", value: item.by_difficulty["简单"] || 0, color: "bg-blue-400" },
                    { label: "中等", value: item.by_difficulty["中等"] || 0, color: "bg-amber-400" },
                    { label: "困难", value: item.by_difficulty["困难"] || 0, color: "bg-orange-400" },
                    { label: "极难", value: item.by_difficulty["极难"] || 0, color: "bg-red-400" },
                  ]}
                  total={item.count}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 知识点覆盖统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            知识点覆盖统计
          </CardTitle>
          <CardDescription>各科目知识点的内容覆盖情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {knowledgeCoverage.map((item) => (
              <CoverageProgress
                key={item.category}
                label={item.category}
                current={item.with_content}
                total={item.total}
                color={item.with_content / item.total > 0.8 ? "bg-green-500" : item.with_content / item.total > 0.5 ? "bg-amber-500" : "bg-red-500"}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Quality Statistics Panel
// ============================================

interface QualityStatsPanelProps {
  loading: boolean;
}

function QualityStatsPanel({ loading }: QualityStatsPanelProps) {
  const [questionQuality, setQuestionQuality] = useState<QuestionQuality | null>(null);
  const [courseQuality, setCourseQuality] = useState<CourseQuality | null>(null);

  useEffect(() => {
    // Mock data for demonstration
    setQuestionQuality({
      total: 2150,
      with_analysis: 1890,
      avg_correct_rate: 62.5,
      avg_discrimination: 0.35,
      difficulty_distribution: {
        "1": 235,
        "2": 520,
        "3": 860,
        "4": 420,
        "5": 115,
      },
    });

    setCourseQuality({
      total: 51,
      avg_rating: 4.6,
      avg_completion_rate: 68.5,
      by_status: {
        published: 42,
        draft: 6,
        archived: 3,
      },
    });
  }, []);

  if (loading || !questionQuality || !courseQuality) {
    return (
      <div className="grid gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-24" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const analysisRate = (questionQuality.with_analysis / questionQuality.total) * 100;

  return (
    <div className="space-y-6">
      {/* 题目质量统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-blue-500" />
            题目质量指标
          </CardTitle>
          <CardDescription>题目的正确率、区分度和解析覆盖情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{questionQuality.total.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">题目总数</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{questionQuality.avg_correct_rate}%</div>
              <div className="text-sm text-muted-foreground mt-1">平均正确率</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">{questionQuality.avg_discrimination}</div>
              <div className="text-sm text-muted-foreground mt-1">平均区分度</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-amber-600">{analysisRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground mt-1">解析覆盖率</div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">难度分布</h4>
              <DistributionBar
                data={[
                  { label: "入门", value: questionQuality.difficulty_distribution["1"] || 0, color: "bg-green-400" },
                  { label: "简单", value: questionQuality.difficulty_distribution["2"] || 0, color: "bg-blue-400" },
                  { label: "中等", value: questionQuality.difficulty_distribution["3"] || 0, color: "bg-amber-400" },
                  { label: "困难", value: questionQuality.difficulty_distribution["4"] || 0, color: "bg-orange-400" },
                  { label: "极难", value: questionQuality.difficulty_distribution["5"] || 0, color: "bg-red-400" },
                ]}
                total={questionQuality.total}
              />
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">解析情况</h4>
              <div className="flex gap-4">
                <div className="flex-1 p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">有解析</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{questionQuality.with_analysis}</div>
                </div>
                <div className="flex-1 p-4 border rounded-lg bg-amber-50">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">无解析</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{questionQuality.total - questionQuality.with_analysis}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 课程质量统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            课程质量指标
          </CardTitle>
          <CardDescription>课程的评分、完课率和发布状态统计</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">{courseQuality.total}</div>
              <div className="text-sm text-muted-foreground mt-1">课程总数</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-3xl font-bold text-amber-600">{courseQuality.avg_rating}</div>
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <div className="text-sm text-muted-foreground mt-1">平均评分</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">{courseQuality.avg_completion_rate}%</div>
              <div className="text-sm text-muted-foreground mt-1">平均完课率</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">
                {((courseQuality.by_status.published / courseQuality.total) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">发布率</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">课程状态分布</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">已发布</span>
                </div>
                <div className="text-2xl font-bold mt-2">{courseQuality.by_status.published}</div>
              </div>
              <div className="p-4 border rounded-lg bg-amber-50">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">草稿</span>
                </div>
                <div className="text-2xl font-bold mt-2">{courseQuality.by_status.draft}</div>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">已归档</span>
                </div>
                <div className="text-2xl font-bold mt-2">{courseQuality.by_status.archived}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内容健康度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-500" />
            内容健康度评估
          </CardTitle>
          <CardDescription>综合评估内容质量的健康程度</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>解析完整度</span>
                <span className={analysisRate >= 80 ? "text-green-600" : analysisRate >= 60 ? "text-amber-600" : "text-red-600"}>
                  {analysisRate >= 80 ? "优秀" : analysisRate >= 60 ? "良好" : "需改进"}
                </span>
              </div>
              <Progress value={analysisRate} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>难度均衡度</span>
                <span className="text-green-600">优秀</span>
              </div>
              <Progress value={85} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>知识点覆盖</span>
                <span className="text-amber-600">良好</span>
              </div>
              <Progress value={72} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function ContentStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("coverage");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            内容数据统计
          </h1>
          <p className="text-muted-foreground">
            查看课程、题库、知识点的覆盖度和质量统计
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择科目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部科目</SelectItem>
              <SelectItem value="xingce">行测</SelectItem>
              <SelectItem value="shenlun">申论</SelectItem>
              <SelectItem value="mianshi">面试</SelectItem>
              <SelectItem value="gongji">公基</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="coverage">覆盖度统计</TabsTrigger>
          <TabsTrigger value="quality">质量统计</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="mt-6">
          <CoverageStatsPanel loading={loading} subject={selectedSubject} />
        </TabsContent>

        <TabsContent value="quality" className="mt-6">
          <QualityStatsPanel loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
