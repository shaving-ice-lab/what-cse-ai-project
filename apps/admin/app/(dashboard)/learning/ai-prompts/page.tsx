"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileCode,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Play,
  History,
  RotateCcw,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Code,
  Variable,
  Save,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
  Label,
  Skeleton,
  Textarea,
  Switch,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
} from "@what-cse/ui";
import {
  aiContentApi,
  PromptTemplate,
  PromptVariable,
  PromptTemplateVersion,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
  getPromptCategoryLabel,
} from "@/services/ai-content-api";
import { toast } from "sonner";

// ============================================
// Template Form Dialog
// ============================================

interface TemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
  onSubmit: (data: CreatePromptTemplateRequest | UpdatePromptTemplateRequest, id?: number) => void;
}

function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
}: TemplateFormDialogProps) {
  const [formData, setFormData] = useState<CreatePromptTemplateRequest>({
    name: "",
    code: "",
    category: "question",
    content: "",
    variables: [],
    description: "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [variableText, setVariableText] = useState("");

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        code: template.code,
        category: template.category,
        content: template.content,
        variables: template.variables || [],
        description: template.description || "",
      });
      setVariableText(
        (template.variables || [])
          .map((v) => `${v.name}: ${v.description}`)
          .join("\n")
      );
    } else {
      setFormData({
        name: "",
        code: "",
        category: "question",
        content: "",
        variables: [],
        description: "",
      });
      setVariableText("");
    }
  }, [template, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.content) {
      toast.error("请填写必填项");
      return;
    }

    // Parse variables from text
    const variables: PromptVariable[] = variableText
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [name, ...descParts] = line.split(":");
        return {
          name: name.trim(),
          description: descParts.join(":").trim(),
          type: "string" as const,
          required: true,
        };
      });

    const data = {
      ...formData,
      variables,
    };

    onSubmit(data, template?.id);
    onOpenChange(false);
  };

  const categories = [
    { value: "question", label: "题目类" },
    { value: "knowledge", label: "知识点类" },
    { value: "course", label: "课程类" },
    { value: "personal", label: "个性化类" },
    { value: "report", label: "报告类" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {template ? "编辑 Prompt 模板" : "新建 Prompt 模板"}
          </DialogTitle>
          <DialogDescription>
            {template ? "修改现有的 Prompt 模板" : "创建新的 Prompt 模板"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="content">Prompt 内容</TabsTrigger>
            <TabsTrigger value="variables">变量定义</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="basic" className="space-y-4 mt-0 px-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>模板名称 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="例如：题目深度解析"
                  />
                </div>
                <div className="space-y-2">
                  <Label>模板代码 *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                      })
                    }
                    placeholder="例如：question_analysis"
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>所属分类 *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>描述说明</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="简要描述该模板的用途..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4 mt-0 px-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Prompt 模板内容 *</Label>
                  <span className="text-xs text-muted-foreground">
                    使用 {"{{变量名}}"} 表示变量
                  </span>
                </div>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={`你是一位资深的公考培训专家。请根据以下题目信息生成深度解析。

## 题目信息
题目内容：{{question_content}}
正确答案：{{answer}}
题目类型：{{question_type}}

## 输出要求
请按以下格式输出：
1. 题目考点
2. 解题思路
3. 详细解析
4. 解题技巧
5. 易错提醒`}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4 mt-0 px-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>变量定义</Label>
                  <span className="text-xs text-muted-foreground">
                    每行一个变量，格式：变量名: 描述
                  </span>
                </div>
                <Textarea
                  value={variableText}
                  onChange={(e) => setVariableText(e.target.value)}
                  placeholder={`question_content: 题目内容
answer: 正确答案
question_type: 题目类型
options: 选项列表`}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-2">变量预览</h4>
                <div className="space-y-2">
                  {variableText
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line, i) => {
                      const [name, ...descParts] = line.split(":");
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <code className="bg-muted px-2 py-0.5 rounded">
                            {`{{${name.trim()}}}`}
                          </code>
                          <span className="text-muted-foreground">
                            {descParts.join(":").trim() || "无描述"}
                          </span>
                        </div>
                      );
                    })}
                  {!variableText.trim() && (
                    <p className="text-sm text-muted-foreground">
                      暂未定义变量
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            {template ? "保存修改" : "创建模板"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Test Template Dialog
// ============================================

interface TestTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
}

function TestTemplateDialog({
  open,
  onOpenChange,
  template,
}: TestTemplateDialogProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>("");
  const [testing, setTesting] = useState(false);
  const [stats, setStats] = useState<{ tokens_used: number; time_ms: number } | null>(null);

  useEffect(() => {
    if (template?.variables) {
      const initialVars: Record<string, string> = {};
      template.variables.forEach((v) => {
        initialVars[v.name] = v.default_value || "";
      });
      setVariables(initialVars);
    }
    setResult("");
    setStats(null);
  }, [template, open]);

  const handleTest = async () => {
    if (!template) return;
    setTesting(true);
    setResult("");
    setStats(null);

    try {
      const res = await aiContentApi.testPromptTemplate({
        template_id: template.id,
        content: template.content,
        variables,
      });
      setResult(res.result);
      setStats({ tokens_used: res.tokens_used, time_ms: res.time_ms });
    } catch (error: any) {
      toast.error(error.message || "测试失败");
      setResult("测试失败：" + (error.message || "未知错误"));
    } finally {
      setTesting(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            测试 Prompt 模板
          </DialogTitle>
          <DialogDescription>{template.name}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* 变量输入 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">变量输入</h4>
            <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {(template.variables || []).map((v) => (
                <div key={v.name} className="space-y-1">
                  <Label className="text-xs">
                    {v.name}
                    {v.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    value={variables[v.name] || ""}
                    onChange={(e) =>
                      setVariables({ ...variables, [v.name]: e.target.value })
                    }
                    placeholder={v.description}
                    className="text-sm"
                  />
                </div>
              ))}
              {(template.variables || []).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">
                  该模板没有定义变量
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* 测试结果 */}
          <div className="flex-1 space-y-2 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">测试结果</h4>
              {stats && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Token: {stats.tokens_used}</span>
                  <span>耗时: {stats.time_ms}ms</span>
                </div>
              )}
            </div>
            <ScrollArea className="flex-1 border rounded-lg p-3 bg-muted/30">
              {testing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">正在生成...</span>
                </div>
              ) : result ? (
                <pre className="text-sm whitespace-pre-wrap">{result}</pre>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  点击"开始测试"查看生成结果
                </p>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button onClick={handleTest} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                测试中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始测试
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Version History Dialog
// ============================================

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PromptTemplate | null;
  onRollback: (templateId: number, versionId: number) => void;
}

function VersionHistoryDialog({
  open,
  onOpenChange,
  template,
  onRollback,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<PromptTemplateVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && template) {
      fetchVersions();
    }
  }, [open, template]);

  const fetchVersions = async () => {
    if (!template) return;
    setLoading(true);
    try {
      const res = await aiContentApi.getPromptTemplateVersions(template.id);
      setVersions(res || []);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
      setVersions([]);
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            版本历史
          </DialogTitle>
          <DialogDescription>{template.name}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>暂无版本历史</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(version.created_at).toLocaleString()}
                      </span>
                    </div>
                    {version.version !== template.version && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("确定要回滚到此版本吗？")) {
                            onRollback(template.id, version.id);
                            onOpenChange(false);
                          }
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        回滚
                      </Button>
                    )}
                  </div>
                  {version.change_note && (
                    <p className="text-sm text-muted-foreground">
                      {version.change_note}
                    </p>
                  )}
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {version.content.slice(0, 200)}
                    {version.content.length > 200 && "..."}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function AIPromptsPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testingTemplate, setTestingTemplate] = useState<PromptTemplate | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyTemplate, setHistoryTemplate] = useState<PromptTemplate | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const category = categoryFilter !== "all" ? categoryFilter : undefined;
      const res = await aiContentApi.getPromptTemplates(category);
      setTemplates(res.templates || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("加载数据失败");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Create/Update template
  const handleSubmit = async (
    data: CreatePromptTemplateRequest | UpdatePromptTemplateRequest,
    id?: number
  ) => {
    try {
      if (id) {
        await aiContentApi.updatePromptTemplate(id, data as UpdatePromptTemplateRequest);
        toast.success("模板已更新");
      } else {
        await aiContentApi.createPromptTemplate(data as CreatePromptTemplateRequest);
        toast.success("模板已创建");
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "操作失败");
    }
  };

  // Delete template
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除该模板吗？删除后不可恢复。")) return;
    try {
      await aiContentApi.deletePromptTemplate(id);
      toast.success("模板已删除");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "删除失败");
    }
  };

  // Rollback template
  const handleRollback = async (templateId: number, versionId: number) => {
    try {
      await aiContentApi.rollbackPromptTemplate(templateId, versionId);
      toast.success("模板已回滚");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "回滚失败");
    }
  };

  const categories = [
    { value: "question", label: "题目类" },
    { value: "knowledge", label: "知识点类" },
    { value: "course", label: "课程类" },
    { value: "personal", label: "个性化类" },
    { value: "report", label: "报告类" },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileCode className="h-6 w-6 text-orange-500" />
            Prompt 模板管理
          </h1>
          <p className="text-muted-foreground">管理 AI 内容生成的 Prompt 模板</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingTemplate(null);
              setFormDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            新建模板
          </Button>
        </div>
      </div>

      {/* 模板列表 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>模板列表</CardTitle>
              <CardDescription>共 {templates.length} 个 Prompt 模板</CardDescription>
            </div>

            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无 Prompt 模板</p>
              <p className="text-sm">点击"新建模板"开始创建</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="min-w-[200px]">模板名称</TableHead>
                    <TableHead>代码</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-[80px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{template.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {template.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPromptCategoryLabel(template.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">v{template.version}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{template.usage_count}</span>
                      </TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            启用
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            禁用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingTemplate(template);
                                setFormDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setTestingTemplate(template);
                                setTestDialogOpen(true);
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              测试
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setHistoryTemplate(template);
                                setHistoryDialogOpen(true);
                              }}
                            >
                              <History className="mr-2 h-4 w-4" />
                              版本历史
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(template.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新建/编辑模板对话框 */}
      <TemplateFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
      />

      {/* 测试模板对话框 */}
      <TestTemplateDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        template={testingTemplate}
      />

      {/* 版本历史对话框 */}
      <VersionHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        template={historyTemplate}
        onRollback={handleRollback}
      />
    </div>
  );
}
