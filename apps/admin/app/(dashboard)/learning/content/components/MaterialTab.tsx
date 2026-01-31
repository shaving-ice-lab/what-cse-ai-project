"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Palette,
  Loader2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Quote,
  Briefcase,
  FileText,
  Flame,
  MessageSquare,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Switch,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import materialApi, {
  MaterialType,
  MaterialCategory,
  AIGenerateMaterialRequest,
  AIGenerateMaterialResult,
  AIGeneratedMaterial,
  materialTypeNames,
} from "@/services/material-api";
import { toast } from "sonner";

interface MaterialTabProps {
  onTaskCreated?: () => void;
}

// 类型图标映射
const typeIcons: Record<MaterialType, React.ReactNode> = {
  quote: <Quote className="h-4 w-4" />,
  case: <Briefcase className="h-4 w-4" />,
  sentence: <FileText className="h-4 w-4" />,
  hot_topic: <Flame className="h-4 w-4" />,
  interview: <MessageSquare className="h-4 w-4" />,
  knowledge: <BookOpen className="h-4 w-4" />,
  formula: <Lightbulb className="h-4 w-4" />,
  mnemonic: <Lightbulb className="h-4 w-4" />,
  template: <FileText className="h-4 w-4" />,
  vocabulary: <BookOpen className="h-4 w-4" />,
};

// 热点主题列表
const hotTopicThemes = [
  "乡村振兴", "生态文明", "科技创新", "社会治理", "民生保障",
  "文化建设", "依法治国", "共同富裕", "数字经济", "绿色发展",
  "高质量发展", "新质生产力", "教育公平", "医疗健康", "养老服务",
  "就业创业", "粮食安全", "能源安全", "国家安全", "对外开放",
];

export function MaterialTab({ onTaskCreated }: MaterialTabProps) {
  // States
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // AI Generation states
  const [aiType, setAiType] = useState<MaterialType>("quote");
  const [aiTheme, setAiTheme] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiCategoryId, setAiCategoryId] = useState<number>(0);
  const [aiAutoPublish, setAiAutoPublish] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIGenerateMaterialResult | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const result = await materialApi.getCategories();
      // API returns MaterialCategory[] directly
      setCategories(result || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Flatten categories
  const flattenCategories = (cats: MaterialCategory[], level = 0): { category: MaterialCategory; level: number }[] => {
    let result: { category: MaterialCategory; level: number }[] = [];
    for (const cat of cats) {
      result.push({ category: cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // AI Generate handler
  const handleAIGenerate = async () => {
    if (!aiType) {
      toast.error("请选择素材类型");
      return;
    }

    setAiGenerating(true);
    setAiResult(null);
    try {
      const result = await materialApi.aiGenerateMaterials({
        type: aiType,
        theme: aiTheme || undefined,
        count: aiCount,
        category_id: aiCategoryId || undefined,
        auto_publish: aiAutoPublish,
      });
      setAiResult(result);
      if (result.saved > 0) {
        toast.success(`成功生成并保存 ${result.saved} 条素材`);
        onTaskCreated?.();
      } else if (result.generated > 0) {
        toast.success(`成功生成 ${result.generated} 条素材`);
      }
    } catch (error) {
      console.error("AI 生成失败:", error);
      toast.error("AI 生成失败");
    } finally {
      setAiGenerating(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setAiType("quote");
    setAiTheme("");
    setAiCount(5);
    setAiCategoryId(0);
    setAiAutoPublish(false);
    setAiResult(null);
  };

  // Copy to clipboard
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success("已复制内容");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex gap-4 p-4">
      {/* Left Panel - Controls */}
      <div className="w-[360px] flex-shrink-0 flex flex-col gap-4">
        {/* Generation Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-500" />
              AI 生成素材
            </CardTitle>
            <CardDescription className="text-xs">
              使用 AI 快速生成学习素材
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type */}
            <div className="space-y-2">
              <Label className="text-xs">素材类型 *</Label>
              <Select value={aiType} onValueChange={(v) => setAiType(v as MaterialType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materialTypeNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {typeIcons[key as MaterialType]}
                        {name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label className="text-xs">生成主题</Label>
              <Select
                value={aiTheme || "all"}
                onValueChange={(v) => setAiTheme(v === "all" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择主题（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限主题</SelectItem>
                  {hotTopicThemes.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-2">
              <Label className="text-xs">生成数量</Label>
              <Select value={aiCount.toString()} onValueChange={(v) => setAiCount(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 10, 15, 20].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} 条
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs">保存到分类</Label>
              <Select
                value={aiCategoryId ? aiCategoryId.toString() : "none"}
                onValueChange={(v) => setAiCategoryId(v && v !== "none" ? parseInt(v) : 0)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="仅预览不保存" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">仅预览不保存</SelectItem>
                  {flatCategories.map(({ category, level }) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {"  ".repeat(level) + category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Publish */}
            {aiCategoryId > 0 && (
              <div className="flex items-center justify-between">
                <Label className="text-xs">自动发布</Label>
                <Switch checked={aiAutoPublish} onCheckedChange={setAiAutoPublish} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Button
              className="w-full"
              onClick={handleAIGenerate}
              disabled={aiGenerating}
            >
              {aiGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              开始生成
            </Button>

            {aiResult && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetForm}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新生成
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">提示</p>
          <p>支持生成名言警句、案例、优美语句、热点话题等多种素材类型，可用于申论写作和面试答题。</p>
        </div>
      </div>

      {/* Right Panel - Results */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-pink-500" />
            生成结果
            {aiResult && (
              <Badge variant="secondary" className="ml-2">
                生成 {aiResult.generated} 条
                {aiResult.saved > 0 && `，已保存 ${aiResult.saved} 条`}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {!aiResult || aiResult.materials.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Palette className="h-12 w-12 opacity-20" />
              <p className="text-sm">暂无生成结果</p>
              <p className="text-xs">配置参数后点击「开始生成」</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {aiResult.materials.map((m, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{m.title}</span>
                          {m.tags && m.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {m.tags.slice(0, 3).map((tag, j) => (
                                <Badge key={j} variant="secondary" className="text-[10px] h-5">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {m.content}
                        </p>
                        {(m.source || m.author) && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {m.source && `来源: ${m.source}`}
                            {m.source && m.author && " | "}
                            {m.author && `作者: ${m.author}`}
                          </p>
                        )}
                        {m.analysis && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-blue-700 dark:text-blue-300">
                            {m.analysis}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => handleCopy(m.content, i)}
                      >
                        {copiedIndex === i ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
