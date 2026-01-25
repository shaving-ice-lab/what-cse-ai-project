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
  Check,
  X,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
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
} from "@what-cse/ui";
import { llmConfigApi, LLMConfig, LLMProvider, CreateLLMConfigRequest, UpdateLLMConfigRequest } from "@/services/api";

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
  const [testResult, setTestResult] = useState<{ configId: number; success: boolean; message: string } | null>(null);

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
      return <Badge variant="secondary">已禁用</Badge>;
    }
    if (config.last_test_status === 1) {
      return <Badge variant="default" className="bg-green-500">正常</Badge>;
    }
    if (config.last_test_status === 0) {
      return <Badge variant="destructive">异常</Badge>;
    }
    return <Badge variant="outline">未测试</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">LLM 配置管理</h1>
          <p className="text-muted-foreground">管理大语言模型服务商配置，支持 OpenAI、Azure、Anthropic 等多种服务商</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadConfigs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            添加配置
          </Button>
        </div>
      </div>

      {/* 配置卡片列表 */}
      {configs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">暂无 LLM 配置</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              点击上方按钮添加你的第一个 LLM 服务商配置
            </p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              添加配置
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {configs.map((config) => (
            <Card key={config.id} className={config.is_default ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    {config.is_default && (
                      <Badge variant="default" className="ml-2">
                        <Star className="mr-1 h-3 w-3" />
                        默认
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(config)}
                </div>
                <CardDescription>
                  {getProviderInfo(config.provider)?.name || config.provider} / {config.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">API 地址</span>
                    <span className="truncate max-w-[180px] font-mono text-xs" title={config.api_url}>
                      {config.api_url}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">API Key</span>
                    <span className="font-mono text-xs">{config.api_key_masked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">最大 Tokens</span>
                    <span>{config.max_tokens}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">温度</span>
                    <span>{config.temperature}</span>
                  </div>
                </div>

                {config.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{config.description}</p>
                )}

                {/* 测试结果 */}
                {testResult && testResult.configId === config.id && (
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      testResult.success
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span className="line-clamp-2">{testResult.message}</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTest(config)}
                      disabled={testing === config.id || !config.is_enabled}
                    >
                      {testing === config.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(config)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {!config.is_default && config.is_enabled && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(config)}>
                      <Star className="mr-1 h-3 w-3" />
                      设为默认
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "编辑 LLM 配置" : "添加 LLM 配置"}</DialogTitle>
            <DialogDescription>
              配置大语言模型服务商信息，用于系统中的 AI 功能
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* 基本信息 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">配置名称 *</Label>
                <Input
                  id="name"
                  placeholder="例如：OpenAI GPT-4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">服务商 *</Label>
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

            {/* 模型和API */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="model">模型名称 *</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData({ ...formData, model: value })}
                >
                  <SelectTrigger id="model">
                    <SelectValue placeholder="选择或输入模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {(getProviderInfo(formData.provider)?.models || []).map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="或直接输入模型名称"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_url">API 地址 *</Label>
                <Input
                  id="api_url"
                  placeholder="https://api.openai.com/v1/chat/completions"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                />
              </div>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api_key">
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
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0"
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
                    onClick={() => copyToClipboard(formData.api_key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 组织ID（可选）*/}
            <div className="space-y-2">
              <Label htmlFor="organization_id">组织 ID（可选）</Label>
              <Input
                id="organization_id"
                placeholder="org-..."
                value={formData.organization_id}
                onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">部分服务商（如 OpenAI）可能需要组织 ID</p>
            </div>

            {/* 参数配置 */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="max_tokens">最大 Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="128000"
                  value={formData.max_tokens}
                  onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) || 4096 })}
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
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0.7 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">超时（秒）</Label>
                <Input
                  id="timeout"
                  type="number"
                  min="1"
                  max="300"
                  value={formData.timeout}
                  onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 60 })}
                />
              </div>
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Textarea
                id="description"
                placeholder="配置说明..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* 开关选项 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_enabled"
                    checked={formData.is_enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                  />
                  <Label htmlFor="is_enabled">启用配置</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                  />
                  <Label htmlFor="is_default">设为默认</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingConfig ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除配置 <strong>{deletingConfig?.name}</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
