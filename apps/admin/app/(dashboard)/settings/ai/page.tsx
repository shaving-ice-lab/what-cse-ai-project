"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Key,
  Gauge,
  Zap,
  DollarSign,
  Activity,
  Settings2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Calendar,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Skeleton,
  Separator,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@what-cse/ui";
import {
  aiContentApi,
  AIGenerationConfig,
  UpdateAIConfigRequest,
} from "@/services/ai-content-api";
import { toast } from "sonner";

// ============================================
// Usage Stats Card
// ============================================

interface UsageStatsData {
  daily_usage: { date: string; tokens: number; cost: number }[];
  monthly_usage: { month: string; tokens: number; cost: number }[];
  total_tokens: number;
  total_cost: number;
}

function UsageStatsCard({
  stats,
  loading,
}: {
  stats: UsageStatsData | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  const dailyData = stats?.daily_usage?.slice(-14) || [];
  const maxTokens = Math.max(...dailyData.map((d) => d.tokens), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          使用趋势
        </CardTitle>
        <CardDescription>近 14 天 Token 使用量</CardDescription>
      </CardHeader>
      <CardContent>
        {dailyData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>暂无使用数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-1 h-32">
              {dailyData.map((item, index) => {
                const height = (item.tokens / maxTokens) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${item.date}: ${item.tokens.toLocaleString()} tokens`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">总 Token</p>
                <p className="text-lg font-semibold">
                  {stats?.total_tokens?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">总费用</p>
                <p className="text-lg font-semibold">
                  ¥{stats?.total_cost?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Feature Toggle Card
// ============================================

interface FeatureToggleCardProps {
  features: AIGenerationConfig["features"];
  onChange: (features: Partial<AIGenerationConfig["features"]>) => void;
  disabled?: boolean;
}

function FeatureToggleCard({
  features,
  onChange,
  disabled,
}: FeatureToggleCardProps) {
  const featureList = [
    {
      key: "question_analysis",
      label: "题目解析",
      description: "自动生成题目的深度解析和解题思路",
    },
    {
      key: "knowledge_summary",
      label: "知识点总结",
      description: "自动生成知识点的学习总结",
    },
    {
      key: "similar_questions",
      label: "相似题目",
      description: "基于题目生成举一反三的练习题",
    },
    {
      key: "learning_path",
      label: "学习路径",
      description: "根据用户情况生成个性化学习路径",
    },
    {
      key: "weakness_analysis",
      label: "薄弱点分析",
      description: "分析用户学习数据找出薄弱环节",
    },
    {
      key: "ability_report",
      label: "能力报告",
      description: "生成用户能力分析报告",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          功能开关
        </CardTitle>
        <CardDescription>控制各类 AI 生成功能的启用状态</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {featureList.map((feature) => (
          <div
            key={feature.key}
            className="flex items-center justify-between py-2"
          >
            <div className="space-y-0.5">
              <Label htmlFor={feature.key} className="cursor-pointer">
                {feature.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
            <Switch
              id={feature.key}
              checked={features?.[feature.key as keyof typeof features] ?? true}
              onCheckedChange={(checked) =>
                onChange({ [feature.key]: checked })
              }
              disabled={disabled}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AIConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AIGenerationConfig | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStatsData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateAIConfigRequest>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, usageRes] = await Promise.all([
        aiContentApi.getConfig(),
        aiContentApi.getUsageStats(),
      ]);
      setConfig(configRes);
      setUsageStats(usageRes);
      setFormData({
        model_name: configRes.model_name,
        max_tokens: configRes.max_tokens,
        temperature: configRes.temperature,
        daily_limit: configRes.daily_limit,
        is_enabled: configRes.is_enabled,
        features: configRes.features,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载配置失败");
      // Mock data for development
      setConfig({
        model_name: "gpt-4-turbo",
        api_key_masked: "sk-****...****",
        max_tokens: 4096,
        temperature: 0.7,
        daily_limit: 100000,
        daily_used: 0,
        cost_per_1k_tokens: 0.1,
        total_cost_today: 0,
        is_enabled: true,
        features: {
          question_analysis: true,
          knowledge_summary: true,
          similar_questions: true,
          learning_path: true,
          weakness_analysis: true,
          ability_report: true,
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update form data
  const updateFormData = (updates: Partial<UpdateAIConfigRequest>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Save config
  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = { ...formData };
      if (newApiKey) {
        dataToSave.api_key = newApiKey;
      }
      await aiContentApi.updateConfig(dataToSave);
      toast.success("配置已保存");
      setHasChanges(false);
      setNewApiKey("");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // Reset daily limit
  const handleResetDailyLimit = async () => {
    try {
      await aiContentApi.resetDailyLimit();
      toast.success("每日限额已重置");
      setConfirmResetOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "重置失败");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const usagePercent =
    config && config.daily_limit > 0
      ? (config.daily_used / config.daily_limit) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            AI 服务配置
          </h1>
          <p className="text-muted-foreground">配置 AI 内容生成服务参数</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存配置
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 状态概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              服务状态
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {config?.is_enabled ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-green-600">运行中</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-lg font-semibold text-amber-600">已暂停</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日用量
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  {config?.daily_used?.toLocaleString() || 0}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {config?.daily_limit?.toLocaleString() || 0}
                </span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日费用
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{config?.total_cost_today?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              单价 ¥{config?.cost_per_1k_tokens || 0}/千 tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              当前模型
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">
              {config?.model_name || "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Max tokens: {config?.max_tokens || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 配置表单 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 模型配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-500" />
              模型配置
            </CardTitle>
            <CardDescription>配置 AI 模型参数</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model_name">模型名称</Label>
              <Input
                id="model_name"
                value={formData.model_name || ""}
                onChange={(e) => updateFormData({ model_name: e.target.value })}
                placeholder="例如：gpt-4-turbo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">
                API Key {config?.api_key_masked && `(当前: ${config.api_key_masked})`}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api_key"
                    type={showApiKey ? "text" : "password"}
                    value={newApiKey}
                    onChange={(e) => {
                      setNewApiKey(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="输入新的 API Key（留空则不修改）"
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_tokens">最大 Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="128000"
                  value={formData.max_tokens || ""}
                  onChange={(e) =>
                    updateFormData({ max_tokens: parseInt(e.target.value) || 4096 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">温度 (0-2)</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature || ""}
                  onChange={(e) =>
                    updateFormData({ temperature: parseFloat(e.target.value) || 0.7 })
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_enabled">启用 AI 服务</Label>
                <p className="text-xs text-muted-foreground">
                  关闭后将暂停所有 AI 内容生成
                </p>
              </div>
              <Switch
                id="is_enabled"
                checked={formData.is_enabled ?? true}
                onCheckedChange={(checked) => updateFormData({ is_enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 成本控制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              成本控制
            </CardTitle>
            <CardDescription>设置每日调用限制和预算告警</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily_limit">每日 Token 限制</Label>
              <Input
                id="daily_limit"
                type="number"
                min="0"
                value={formData.daily_limit || ""}
                onChange={(e) =>
                  updateFormData({ daily_limit: parseInt(e.target.value) || 100000 })
                }
              />
              <p className="text-xs text-muted-foreground">
                设为 0 表示不限制
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium">今日使用情况</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>已使用 Token</span>
                  <span className="font-medium">
                    {config?.daily_used?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>剩余额度</span>
                  <span className="font-medium">
                    {((config?.daily_limit || 0) - (config?.daily_used || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>使用比例</span>
                  <span className="font-medium">{usagePercent.toFixed(1)}%</span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setConfirmResetOpen(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重置每日限额
            </Button>
          </CardContent>
        </Card>

        {/* 功能开关 */}
        <FeatureToggleCard
          features={formData.features || config?.features || {
            question_analysis: true,
            knowledge_summary: true,
            similar_questions: true,
            learning_path: true,
            weakness_analysis: true,
            ability_report: true,
          }}
          onChange={(updates) =>
            updateFormData({
              features: { ...formData.features, ...updates },
            })
          }
        />

        {/* 使用统计 */}
        <UsageStatsCard stats={usageStats} loading={loading} />
      </div>

      {/* 重置确认对话框 */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认重置</DialogTitle>
            <DialogDescription>
              确定要重置每日限额吗？这将把今日已使用的 Token 数量清零。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmResetOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleResetDailyLimit}>确认重置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
