"use client";

import { useState } from "react";
import { 
  Calculator, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { toolsApi, ScoreEstimateRequest, ScoreEstimateResponse } from "@/services/api";

interface QuestionAnswer {
  questionNumber: number;
  answer: string;
}

export default function ScoreEstimatePage() {
  const [examType, setExamType] = useState("国考");
  const [examYear, setExamYear] = useState(new Date().getFullYear());
  const [examSubject, setExamSubject] = useState("行测");
  const [inputMode, setInputMode] = useState<"count" | "answers">("count");
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(135);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreEstimateResponse | null>(null);
  const [error, setError] = useState("");

  const examTypes = ["国考", "省考", "事业单位"];
  const years = [2026, 2025, 2024, 2023, 2022];
  const subjects = ["行测", "申论"];

  // 行测默认题目数量配置
  const questionCounts: Record<string, number> = {
    "国考-行测": 135,
    "省考-行测": 120,
    "事业单位-行测": 100,
    "国考-申论": 5,
    "省考-申论": 4,
    "事业单位-申论": 3,
  };

  const handleExamTypeChange = (type: string) => {
    setExamType(type);
    const key = `${type}-${examSubject}`;
    setTotalCount(questionCounts[key] || 100);
    setCorrectCount(0);
    setResult(null);
  };

  const handleSubjectChange = (subject: string) => {
    setExamSubject(subject);
    const key = `${examType}-${subject}`;
    setTotalCount(questionCounts[key] || 100);
    setCorrectCount(0);
    setResult(null);
  };

  const handleCalculate = async () => {
    if (correctCount > totalCount) {
      setError("答对题数不能超过总题数");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const request: ScoreEstimateRequest = {
        exam_type: examType,
        exam_year: examYear,
        exam_subject: examSubject,
        correct_count: correctCount,
        total_count: totalCount,
      };

      const response = await toolsApi.estimate.calculate(request);
      setResult(response);
    } catch (err) {
      console.error("Failed to calculate:", err);
      setError("估分失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCorrectCount(0);
    setResult(null);
    setError("");
  };

  const getScoreLevel = (score: number) => {
    if (score >= 70) return { label: "优秀", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (score >= 60) return { label: "良好", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 50) return { label: "中等", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "需加强", color: "text-red-600", bg: "bg-red-50" };
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex items-center gap-2 text-emerald-200 text-sm mb-2">
            <a href="/tools" className="hover:text-white">考试工具箱</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">估分工具</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">在线估分</h1>
              <p className="text-emerald-100 mt-1">快速估算考试分数</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <h2 className="text-lg font-bold text-stone-800 mb-6">填写信息</h2>

              {/* Exam Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">考试类型</label>
                <div className="flex flex-wrap gap-2">
                  {examTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleExamTypeChange(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        examType === type
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">考试年份</label>
                <div className="flex flex-wrap gap-2">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => setExamYear(year)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        examYear === year
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {year}年
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">考试科目</label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleSubjectChange(subject)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        examSubject === subject
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode */}
              <div className="p-4 bg-stone-50 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-4 h-4 text-stone-400" />
                  <span className="text-sm text-stone-600">
                    {examSubject === "行测" ? "请输入答对的题目数量" : "请输入预估的申论分数"}
                  </span>
                </div>

                {examSubject === "行测" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">总题数</label>
                      <input
                        type="number"
                        value={totalCount}
                        onChange={(e) => setTotalCount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-center text-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">答对题数</label>
                      <input
                        type="number"
                        value={correctCount}
                        onChange={(e) => setCorrectCount(Number(e.target.value))}
                        max={totalCount}
                        min={0}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-center text-xl font-semibold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">题目数量</label>
                      <input
                        type="number"
                        value={totalCount}
                        onChange={(e) => setTotalCount(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-center text-xl font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">预估得分</label>
                      <input
                        type="number"
                        value={correctCount}
                        onChange={(e) => setCorrectCount(Number(e.target.value))}
                        max={100}
                        min={0}
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-center text-xl font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl mb-6 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Calculator className="w-5 h-5" />
                  )}
                  开始估分
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 text-stone-600 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* Right: Result */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-stone-800 mb-6">估分结果</h2>

              {result ? (
                <div className="space-y-6">
                  {/* Score Display */}
                  <div className="text-center py-8 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                    <p className="text-sm text-stone-500 mb-2">预估分数</p>
                    <p className="text-5xl font-bold text-emerald-600 mb-2">
                      {result.estimated_score.toFixed(1)}
                    </p>
                    <p className="text-sm text-stone-500">满分 100 分</p>
                  </div>

                  {/* Accuracy */}
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-stone-600">正确率</span>
                      <span className="text-lg font-semibold text-stone-800">
                        {result.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, result.accuracy)}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-600">考试类型</span>
                      <span className="text-sm font-medium text-stone-800">{result.exam_type}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-600">考试年份</span>
                      <span className="text-sm font-medium text-stone-800">{result.exam_year}年</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-600">考试科目</span>
                      <span className="text-sm font-medium text-stone-800">{result.exam_subject || "行测"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-600">答对/总题数</span>
                      <span className="text-sm font-medium text-stone-800">
                        {result.correct_count} / {result.total_count}
                      </span>
                    </div>
                  </div>

                  {/* Level Badge */}
                  {(() => {
                    const level = getScoreLevel(result.estimated_score);
                    return (
                      <div className={`flex items-center justify-center gap-2 p-4 ${level.bg} rounded-xl`}>
                        {result.estimated_score >= 60 ? (
                          <CheckCircle2 className={`w-5 h-5 ${level.color}`} />
                        ) : (
                          <TrendingUp className={`w-5 h-5 ${level.color}`} />
                        )}
                        <span className={`text-sm font-medium ${level.color}`}>
                          成绩等级：{level.label}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Tips */}
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-700">
                      <strong>温馨提示：</strong>此估分仅供参考，实际分数以官方公布为准。
                      行测估分基于等权计算，实际可能存在差异。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-500">填写信息后点击"开始估分"</p>
                  <p className="text-sm text-stone-400 mt-1">查看预估分数结果</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
