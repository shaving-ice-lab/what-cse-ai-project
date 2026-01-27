"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Play,
  Loader2,
  Bot,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Settings2,
  Key,
  Globe,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Power,
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
  Textarea,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  llmConfigApi,
  LLMConfig,
  LLMProvider,
  CreateLLMConfigRequest,
  UpdateLLMConfigRequest,
} from "@/services/api";

interface ConfigFormData {
  name: string;
  provider: string;
  model: string;
  api_url: string;
  api_key: string;
  organization_id: string;
  max_tokens: number;
  temperature: number;
  timeout: number;
  is_default: boolean;
  is_enabled: boolean;
  description: string;
}

const defaultFormData: ConfigFormData = {
  name: "",
  provider: "openai",
  model: "",
  api_url: "",
  api_key: "",
  organization_id: "",
  max_tokens: 4096,
  temperature: 0.7,
  timeout: 60,
  is_default: false,
  is_enabled: true,
  description: "",
};

export default function LLMConfigPage() {
  const [configs, setConfigs] = useState<LLMConfig[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LLMConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<LLMConfig | null>(null);
  const [formData, setFormData] = useState<ConfigFormData>(defaultFormData);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    configId: number;
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await llmConfigApi.getConfigs();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error("Failed to load configs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProviders = useCallback(async () => {
    try {
      const data = await llmConfigApi.getProviders();
      setProviders(data.providers || []);
    } catch (error) {
      console.error("Failed to load providers:", error);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
    loadProviders();
  }, [loadConfigs, loadProviders]);

  const handleProviderChange = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    setFormData({
      ...formData,
      provider: providerId,
      api_url: provider?.api_url || "",
      model: provider?.models?.[0] || "",
    });
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setFormData(defaultFormData);
    setShowApiKey(false);
    setActiveTab("basic");
    setShowDialog(true);
  };

  const handleEdit = (config: LLMConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      provider: config.provider,
      model: config.model,
      api_url: config.api_url,
      api_key: "", // Don't fill API key for security
      organization_id: config.organization_id || "",
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      timeout: config.timeout,
      is_default: config.is_default,
      is_enabled: config.is_enabled,
      description: config.description || "",
    });
    setShowApiKey(false);
    setActiveTab("basic");
    setShowDialog(true);
  };

  const handleDelete = (config: LLMConfig) => {
    setDeletingConfig(config);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingConfig) return;
    try {
      await llmConfigApi.deleteConfig(deletingConfig.id);
      await loadConfigs();
      setShowDeleteDialog(false);
      setDeletingConfig(null);
    } catch (error) {
      console.error("Failed to delete config:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (editingConfig) {
        // Update
        const updateData: UpdateLLMConfigRequest = {
          name: formData.name,
          provider: formData.provider,
          model: formData.model,
          api_url: formData.api_url,
          organization_id: formData.organization_id,
          max_tokens: formData.max_tokens,
          temperature: formData.temperature,
          timeout: formData.timeout,
          is_default: formData.is_default,
          is_enabled: formData.is_enabled,
          description: formData.description,
        };
        // Only include API key if provided
        if (formData.api_key) {
          updateData.api_key = formData.api_key;
        }
        await llmConfigApi.updateConfig(editingConfig.id, updateData);
      } else {
        // Create
        const createData: CreateLLMConfigRequest = {
          name: formData.name,
          provider: formData.provider,
          model: formData.model,
          api_url: formData.api_url,
          api_key: formData.api_key,
          organization_id: formData.organization_id,
          max_tokens: formData.max_tokens,
          temperature: formData.temperature,
          timeout: formData.timeout,
          is_default: formData.is_default,
          is_enabled: formData.is_enabled,
          description: formData.description,
        };
        await llmConfigApi.createConfig(createData);
      }
      await loadConfigs();
      setShowDialog(false);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (config: LLMConfig) => {
    try {
      setTesting(config.id);
      setTestResult(null);
      const result = await llmConfigApi.testConfig(config.id);
      setTestResult({
        configId: config.id,
        success: true,
        message: result.response || "测试成功",
      });
      await loadConfigs(); // Refresh to get updated test status
    } catch (error) {
      setTestResult({
        configId: config.id,
        success: false,
        message: error instanceof Error ? error.message : "测试失败",
      });
    } finally {
      setTesting(null);
    }
  };

  const handleSetDefault = async (config: LLMConfig) => {
    try {
      await llmConfigApi.setDefault(config.id);
      await loadConfigs();
    } catch (error) {
      console.error("Failed to set default:", error);
    }
  };

  const getProviderInfo = (providerId: string) => {
    return providers.find((p) => p.id === providerId);
  };

  const getStatusBadge = (config: LLMConfig) => {
    if (!config.is_enabled) {
      return (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Power className="h-3 w-3" />
          已禁用
        </Badge>
      );
    }
    if (config.last_test_status === 1) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-xs border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
        >
          <CheckCircle2 className="h-3 w-3" />
          正常
        </Badge>
      );
    }
    if (config.last_test_status === 0) {
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <AlertCircle className="h-3 w-3" />
          异常
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-xs">
        <CircleDot className="h-3 w-3" />
        未测试
      </Badge>
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LLM 配置管理</h1>
          <p className="text-sm text-muted-foreground">管理大语言模型服务商配置</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadConfigs}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            刷新
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            添加配置
          </Button>
        </div>
      </div>

      {/* 配置卡片列表 */}
      {configs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">暂无 LLM 配置</h3>
            <p className="mt-1 text-sm text-muted-foreground">添加你的第一个 LLM 服务商配置</p>
            <Button size="sm" className="mt-4" onClick={handleCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              添加配置
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <Card
              key={config.id}
              className={`relative transition-shadow hover:shadow-md ${
                config.is_default ? "ring-1 ring-primary" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base truncate" title={config.name}>
                        {config.name}
                      </CardTitle>
                      {config.is_default && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <Star className="mr-1 h-3 w-3" />
                          默认
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs mt-0.5">
                      {getProviderInfo(config.provider)?.name || config.provider} · {config.model}
                    </CardDescription>
                  </div>
                  {getStatusBadge(config)}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* 配置详情 */}
                <div className="text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>API 地址</span>
                    <span className="truncate max-w-[150px] font-mono" title={config.api_url}>
                      {config.api_url}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Key</span>
                    <span className="font-mono">{config.api_key_masked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>最大 Tokens / 温度</span>
                    <span>
                      {config.max_tokens} / {config.temperature}
                    </span>
                  </div>
                </div>

                {/* 描述 */}
                {config.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{config.description}</p>
                )}

                {/* 测试结果 */}
                {testResult && testResult.configId === config.id && (
                  <div
                    className={`rounded-md p-2 text-xs ${
                      testResult.success
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      {testResult.success ? (
                        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      )}
                      <span className="line-clamp-2">{testResult.message}</span>
                    </div>
                  </div>
                )}

                <Separator />

                {/* 操作按钮 */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleTest(config)}
                    disabled={testing === config.id || !config.is_enabled}
                  >
                    {testing === config.id ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        测试中
                      </>
                    ) : (
                      <>
                        <Play className="mr-1.5 h-3 w-3" />
                        测试连接
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
                    {!config.is_default && config.is_enabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetDefault(config)}
                        title="设为默认"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(config)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "编辑 LLM 配置" : "添加 LLM 配置"}</DialogTitle>
            <DialogDescription>配置大语言模型服务商信息</DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="text-xs">
                基本信息
              </TabsTrigger>
              <TabsTrigger value="api" className="text-xs">
                API 配置
              </TabsTrigger>
              <TabsTrigger value="params" className="text-xs">
                参数设置
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">
                      配置名称 *
                    </Label>
                    <Input
                      id="name"
                      placeholder="例如：OpenAI GPT-4"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="provider" className="text-sm">
                      服务商 *
                    </Label>
                    <Select value={formData.provider} onValueChange={handleProviderChange}>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="选择服务商" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="model" className="text-sm">
                    模型名称 *
                  </Label>
                  <Input
                    id="model"
                    placeholder="例如：gpt-4-turbo"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                  {getProviderInfo(formData.provider)?.models && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {getProviderInfo(formData.provider)
                        ?.models?.slice(0, 4)
                        .map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setFormData({ ...formData, model })}
                            className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-muted/80 transition-colors"
                          >
                            {model}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm">
                    描述（可选）
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="配置说明..."
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4 mt-0">
                <div className="space-y-1.5">
                  <Label htmlFor="api_url" className="text-sm">
                    API 地址 *
                  </Label>
                  <Input
                    id="api_url"
                    placeholder="https://api.openai.com/v1/chat/completions"
                    value={formData.api_url}
                    onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="api_key" className="text-sm">
                    API Key {editingConfig ? "(留空则不修改)" : "*"}
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="api_key"
                        type={showApiKey ? "text" : "password"}
                        placeholder={editingConfig ? "留空则保持原密钥" : "sk-..."}
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        className="pr-9 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {formData.api_key && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => copyToClipboard(formData.api_key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="organization_id" className="text-sm">
                    组织 ID（可选）
                  </Label>
                  <Input
                    id="organization_id"
                    placeholder="org-..."
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>

              <TabsContent value="params" className="space-y-4 mt-0">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="max_tokens" className="text-sm">
                      最大 Tokens
                    </Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      min="1"
                      max="128000"
                      value={formData.max_tokens}
                      onChange={(e) =>
                        setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 4096 })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="temperature" className="text-sm">
                      温度 (0-2)
                    </Label>
                    <Input
                      id="temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0.7 })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="timeout" className="text-sm">
                      超时（秒）
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      min="1"
                      max="300"
                      value={formData.timeout}
                      onChange={(e) =>
                        setFormData({ ...formData, timeout: parseInt(e.target.value) || 60 })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_enabled" className="text-sm cursor-pointer">
                      启用配置
                    </Label>
                    <Switch
                      id="is_enabled"
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_enabled: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_default" className="text-sm cursor-pointer">
                      设为默认
                    </Label>
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_default: checked })
                      }
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingConfig ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除配置 <strong>"{deletingConfig?.name}"</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
