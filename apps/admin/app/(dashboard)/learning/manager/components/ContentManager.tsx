"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useToolbar } from "./ToolbarContext";
import { 
  knowledgeContentApi, 
  courseApi,
  type KnowledgeContentStats,
  type FlashCard,
  type MindMap,
  type KnowledgeDetail,
  type FlashCardType,
  type MindMapType,
  type KnowledgeDetailContentType,
  type FlashCardListParams,
  type MindMapListParams,
  type KnowledgeDetailListParams,
  type CreateFlashCardRequest,
  type CreateMindMapRequest,
  type CreateKnowledgeDetailRequest,
  getFlashCardTypeLabel,
  getMindMapTypeLabel,
  getDetailContentTypeLabel,
} from "@/services/course-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@what-cse/ui/card";
import { Button } from "@what-cse/ui/button";
import { Input } from "@what-cse/ui/input";
import { Badge } from "@what-cse/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@what-cse/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@what-cse/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@what-cse/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@what-cse/ui/tabs";
import { Textarea } from "@what-cse/ui/textarea";
import { Label } from "@what-cse/ui/label";
import { 
  BookOpen, 
  Brain, 
  Plus, 
  Search, 
  Eye,
  Star,
  Trash2,
  Edit,
  Download,
  RefreshCw,
  Sparkles,
  FileText,
  Map,
  Upload,
  FileJson,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function ContentManager() {
  const { setToolbarContent } = useToolbar();
  const [activeTab, setActiveTab] = useState("details");
  const [stats, setStats] = useState<KnowledgeContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Knowledge details state
  const [details, setDetails] = useState<KnowledgeDetail[]>([]);
  const [detailsTotal, setDetailsTotal] = useState(0);
  const [detailsPage, setDetailsPage] = useState(1);
  const [detailsParams, setDetailsParams] = useState<KnowledgeDetailListParams>({
    page: 1,
    page_size: 10,
  });
  
  // Flash cards state
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [flashCardTotal, setFlashCardTotal] = useState(0);
  const [flashCardPage, setFlashCardPage] = useState(1);
  const [flashCardParams, setFlashCardParams] = useState<FlashCardListParams>({
    page: 1,
    page_size: 10,
  });
  
  // Mind maps state
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [mindMapTotal, setMindMapTotal] = useState(0);
  const [mindMapPage, setMindMapPage] = useState(1);
  const [mindMapParams, setMindMapParams] = useState<MindMapListParams>({
    page: 1,
    page_size: 10,
  });

  // Dialog state
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showFlashCardDialog, setShowFlashCardDialog] = useState(false);
  const [showMindMapDialog, setShowMindMapDialog] = useState(false);
  const [editingDetail, setEditingDetail] = useState<KnowledgeDetail | null>(null);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [editingMap, setEditingMap] = useState<MindMap | null>(null);

  // Form state
  const [detailForm, setDetailForm] = useState({
    content_type: "definition" as KnowledgeDetailContentType,
    knowledge_point_id: 0,
    title: "",
    content: "",
    sort_order: 0,
  });
  
  const [cardForm, setCardForm] = useState({
    card_type: "idiom" as FlashCardType,
    title: "",
    front_content: "",
    back_content: "",
    example: "",
    mnemonic: "",
    difficulty: 3,
    importance: 3,
  });

  const [mapForm, setMapForm] = useState({
    map_type: "knowledge" as MindMapType,
    title: "",
    description: "",
    map_data: '{"root":{"id":"root","text":"根节点","expanded":true}}',
    is_public: true,
  });

  // Batch import state
  const [showBatchImportDialog, setShowBatchImportDialog] = useState(false);
  const [importType, setImportType] = useState<"flash-cards" | "mind-maps">("flash-cards");
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed data state
  const [seeding, setSeeding] = useState(false);

  // Sample data templates
  const sampleFlashCards: CreateFlashCardRequest[] = [
    {
      card_type: "idiom",
      title: "南辕北辙",
      front_content: "南辕北辙",
      back_content: "【释义】想往南而车子却向北行。比喻行动和目的正好相反。\n【出处】《战国策·魏策四》\n【近义词】背道而驰、适得其反",
      example: "他想提高效率，却整天加班熬夜，真是南辕北辙。",
      mnemonic: "辕是车前驾牲畜的横木，辙是车轮压出的痕迹。想去南方，车却往北走。",
      difficulty: 2,
      importance: 4,
    },
    {
      card_type: "idiom",
      title: "刻舟求剑",
      front_content: "刻舟求剑",
      back_content: "【释义】比喻不懂事物已发展变化而仍静止地看问题。\n【出处】《吕氏春秋·察今》\n【近义词】守株待兔、墨守成规",
      example: "用老方法解决新问题，无异于刻舟求剑。",
      mnemonic: "在船上刻记号找落水的剑，船走了，剑还在原处。",
      difficulty: 2,
      importance: 4,
    },
    {
      card_type: "formula",
      title: "等差数列求和公式",
      front_content: "等差数列求和公式是什么？",
      back_content: "Sn = n(a₁ + aₙ)/2 = na₁ + n(n-1)d/2\n\n其中：\n- n：项数\n- a₁：首项\n- aₙ：末项\n- d：公差",
      example: "求1+2+3+...+100 = 100×(1+100)/2 = 5050",
      mnemonic: "首尾相加乘项数除以2",
      difficulty: 3,
      importance: 5,
    },
    {
      card_type: "law",
      title: "正当防卫的条件",
      front_content: "正当防卫需要满足哪些条件？",
      back_content: "1. 存在不法侵害（起因条件）\n2. 不法侵害正在进行（时间条件）\n3. 具有防卫意识（主观条件）\n4. 针对不法侵害人本人（对象条件）\n5. 没有明显超过必要限度（限度条件）",
      example: "甲持刀抢劫乙，乙夺刀将甲刺伤，属于正当防卫。",
      mnemonic: "起时主对限",
      difficulty: 3,
      importance: 5,
    },
  ];

  const sampleMindMaps: CreateMindMapRequest[] = [
    {
      map_type: "subject",
      title: "言语理解知识体系",
      description: "言语理解与表达模块的完整知识体系图",
      map_data: JSON.stringify({
        root: {
          id: "root",
          text: "言语理解与表达",
          expanded: true,
          children: [
            {
              id: "1",
              text: "逻辑填空",
              expanded: true,
              children: [
                { id: "1-1", text: "实词辨析" },
                { id: "1-2", text: "虚词辨析" },
                { id: "1-3", text: "成语辨析" },
                { id: "1-4", text: "语境分析" },
              ],
            },
            {
              id: "2",
              text: "片段阅读",
              expanded: true,
              children: [
                { id: "2-1", text: "主旨概括" },
                { id: "2-2", text: "意图判断" },
                { id: "2-3", text: "细节判断" },
                { id: "2-4", text: "标题选择" },
              ],
            },
            {
              id: "3",
              text: "语句表达",
              expanded: true,
              children: [
                { id: "3-1", text: "语句排序" },
                { id: "3-2", text: "语句填空" },
                { id: "3-3", text: "语句衔接" },
              ],
            },
          ],
        },
      }),
      is_public: true,
    },
  ];

  // Load stats
  useEffect(() => {
    loadStats();
  }, []);

  // Load knowledge details when tab changes or params change
  useEffect(() => {
    if (activeTab === "details") {
      loadDetails();
    }
  }, [activeTab, detailsParams]);

  // Load flash cards when tab changes or params change
  useEffect(() => {
    if (activeTab === "flash-cards") {
      loadFlashCards();
    }
  }, [activeTab, flashCardParams]);

  // Load mind maps when tab changes or params change
  useEffect(() => {
    if (activeTab === "mind-maps") {
      loadMindMaps();
    }
  }, [activeTab, mindMapParams]);

  const loadStats = async () => {
    try {
      const data = await knowledgeContentApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await knowledgeContentApi.getDetails(detailsParams);
      setDetails(data.details || []);
      setDetailsTotal(data.total);
      setDetailsPage(data.page);
    } catch (error) {
      console.error("Failed to load details:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFlashCards = async () => {
    try {
      setLoading(true);
      const data = await knowledgeContentApi.getFlashCards(flashCardParams);
      setFlashCards(data.flash_cards || []);
      setFlashCardTotal(data.total);
      setFlashCardPage(data.page);
    } catch (error) {
      console.error("Failed to load flash cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMindMaps = async () => {
    try {
      setLoading(true);
      const data = await knowledgeContentApi.getMindMaps(mindMapParams);
      setMindMaps(data.mind_maps || []);
      setMindMapTotal(data.total);
      setMindMapPage(data.page);
    } catch (error) {
      console.error("Failed to load mind maps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDetail = async () => {
    try {
      if (editingDetail) {
        await knowledgeContentApi.updateDetail(editingDetail.id, {
          title: detailForm.title,
          content: detailForm.content,
          sort_order: detailForm.sort_order,
        });
        toast.success("更新成功");
      } else {
        await knowledgeContentApi.createDetail(detailForm);
        toast.success("创建成功");
      }
      setShowDetailDialog(false);
      setEditingDetail(null);
      resetDetailForm();
      loadDetails();
      loadStats();
    } catch (error: any) {
      toast.error("保存失败: " + (error.message || "未知错误"));
    }
  };

  const handleDeleteDetail = async (id: number) => {
    if (!confirm("确定要删除这条详情吗？")) return;
    try {
      await knowledgeContentApi.deleteDetail(id);
      toast.success("删除成功");
      loadDetails();
      loadStats();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  const handleEditDetail = (detail: KnowledgeDetail) => {
    setEditingDetail(detail);
    setDetailForm({
      content_type: detail.content_type,
      knowledge_point_id: detail.knowledge_point_id,
      title: detail.title || "",
      content: detail.content,
      sort_order: detail.sort_order,
    });
    setShowDetailDialog(true);
  };

  const resetDetailForm = () => {
    setDetailForm({
      content_type: "definition",
      knowledge_point_id: 0,
      title: "",
      content: "",
      sort_order: 0,
    });
  };

  const handleCreateCard = async () => {
    try {
      if (editingCard) {
        await knowledgeContentApi.updateFlashCard(editingCard.id, cardForm);
        toast.success("更新成功");
      } else {
        await knowledgeContentApi.createFlashCard(cardForm);
        toast.success("创建成功");
      }
      setShowFlashCardDialog(false);
      setEditingCard(null);
      resetCardForm();
      loadFlashCards();
      loadStats();
    } catch (error: any) {
      toast.error("保存失败: " + (error.message || "未知错误"));
    }
  };

  const handleCreateMap = async () => {
    try {
      if (editingMap) {
        await knowledgeContentApi.updateMindMap(editingMap.id, mapForm);
      } else {
        await knowledgeContentApi.createMindMap(mapForm);
      }
      setShowMindMapDialog(false);
      setEditingMap(null);
      resetMapForm();
      loadMindMaps();
      loadStats();
    } catch (error) {
      console.error("Failed to save mind map:", error);
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm("确定要删除这张卡片吗？")) return;
    try {
      await knowledgeContentApi.deleteFlashCard(id);
      loadFlashCards();
      loadStats();
    } catch (error) {
      console.error("Failed to delete flash card:", error);
    }
  };

  const handleDeleteMap = async (id: number) => {
    if (!confirm("确定要删除这个思维导图吗？")) return;
    try {
      await knowledgeContentApi.deleteMindMap(id);
      loadMindMaps();
      loadStats();
    } catch (error) {
      console.error("Failed to delete mind map:", error);
    }
  };

  const handleEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setCardForm({
      card_type: card.card_type,
      title: card.title,
      front_content: card.front_content,
      back_content: card.back_content,
      example: card.example || "",
      mnemonic: card.mnemonic || "",
      difficulty: card.difficulty,
      importance: card.importance,
    });
    setShowFlashCardDialog(true);
  };

  const handleEditMap = (map: MindMap) => {
    setEditingMap(map);
    setMapForm({
      map_type: map.map_type,
      title: map.title,
      description: map.description || "",
      map_data: map.map_data,
      is_public: map.is_public,
    });
    setShowMindMapDialog(true);
  };

  const resetCardForm = () => {
    setCardForm({
      card_type: "idiom",
      title: "",
      front_content: "",
      back_content: "",
      example: "",
      mnemonic: "",
      difficulty: 3,
      importance: 3,
    });
  };

  const resetMapForm = () => {
    setMapForm({
      map_type: "knowledge",
      title: "",
      description: "",
      map_data: '{"root":{"id":"root","text":"根节点","expanded":true}}',
      is_public: true,
    });
  };

  // Batch import handlers
  const handleOpenBatchImport = (type: "flash-cards" | "mind-maps") => {
    setImportType(type);
    setImportData("");
    setImportResult(null);
    setShowBatchImportDialog(true);
  };

  const handleLoadSampleData = () => {
    if (importType === "flash-cards") {
      setImportData(JSON.stringify(sampleFlashCards, null, 2));
    } else {
      setImportData(JSON.stringify(sampleMindMaps, null, 2));
    }
    toast.success("已加载示例数据");
  };

  const handleCopyTemplate = () => {
    const template = importType === "flash-cards" 
      ? JSON.stringify(sampleFlashCards.slice(0, 1), null, 2)
      : JSON.stringify(sampleMindMaps.slice(0, 1), null, 2);
    navigator.clipboard.writeText(template);
    toast.success("模板已复制到剪贴板");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      toast.success(`已加载文件: ${file.name}`);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBatchImport = async () => {
    if (!importData.trim()) {
      toast.error("请输入或上传数据");
      return;
    }

    try {
      setImporting(true);
      setImportResult(null);
      
      const data = JSON.parse(importData);
      const items = Array.isArray(data) ? data : [data];
      
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      if (importType === "flash-cards") {
        // Batch create flash cards
        try {
          await knowledgeContentApi.batchCreateFlashCards(items);
          success = items.length;
          toast.success(`成功导入 ${success} 张卡片`);
        } catch (error: any) {
          // Fall back to individual creation
          for (let i = 0; i < items.length; i++) {
            try {
              await knowledgeContentApi.createFlashCard(items[i]);
              success++;
            } catch (err: any) {
              failed++;
              errors.push(`第 ${i + 1} 项: ${err.message || "创建失败"}`);
            }
          }
        }
        loadFlashCards();
      } else {
        // Create mind maps one by one
        for (let i = 0; i < items.length; i++) {
          try {
            await knowledgeContentApi.createMindMap(items[i]);
            success++;
          } catch (err: any) {
            failed++;
            errors.push(`第 ${i + 1} 项: ${err.message || "创建失败"}`);
          }
        }
        loadMindMaps();
      }

      setImportResult({ success, failed, errors });
      loadStats();

      if (failed === 0) {
        toast.success(`成功导入 ${success} 条数据`);
      } else {
        toast.warning(`导入完成: ${success} 成功, ${failed} 失败`);
      }
    } catch (error: any) {
      toast.error(`JSON 解析失败: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const detailContentTypes: KnowledgeDetailContentType[] = [
    "definition", "key_points", "question_types", "solving_method", 
    "examples", "error_prone", "related"
  ];

  // Seed data handlers
  const handleSeedAll = async () => {
    if (!confirm("确定要生成示例数据吗？这将添加速记卡片和思维导图示例数据。")) return;
    
    try {
      setSeeding(true);
      const result = await knowledgeContentApi.seedAll();
      toast.success(`生成完成：速记卡片 ${result.flash_cards_created} 张，思维导图 ${result.mind_maps_created} 个`);
      
      // 刷新数据
      loadStats();
      if (activeTab === "flash-cards") loadFlashCards();
      if (activeTab === "mind-maps") loadMindMaps();
    } catch (error: any) {
      toast.error("生成失败: " + (error.message || "未知错误"));
    } finally {
      setSeeding(false);
    }
  };

  const flashCardTypes: FlashCardType[] = [
    "idiom", "word", "formula", "logic", "figure", "law", "history", 
    "geography", "tech", "writing", "interview", "document", "data", "other"
  ];

  const mindMapTypes: MindMapType[] = [
    "knowledge", "course", "subject", "chapter", "custom"
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    if (activeTab === "details") await loadDetails();
    if (activeTab === "flash-cards") await loadFlashCards();
    if (activeTab === "mind-maps") await loadMindMaps();
    setIsRefreshing(false);
  };

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <Button size="sm" variant="ghost" onClick={handleSeedAll} disabled={seeding} className="h-8 px-3 text-xs">
          {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
          {seeding ? "生成中" : "示例"}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </>
    );
    return () => setToolbarContent(null);
  }, [setToolbarContent, seeding, isRefreshing]);

  return (
    <div className="h-full flex flex-col">
      {/* Mini Stats Bar */}
      {stats && (
        <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-border/30 bg-muted/20 overflow-x-auto">
          {[
            { label: "详情", value: stats.total_details, active: stats.active_details, icon: FileText },
            { label: "卡片", value: stats.total_flash_cards, active: stats.active_flash_cards, icon: BookOpen },
            { label: "导图", value: stats.total_mind_maps, active: stats.active_mind_maps, icon: Map },
            { label: "浏览", value: stats.total_view_count, icon: Eye },
            { label: "收藏", value: stats.total_collect_count, icon: Star },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
              <item.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
              {item.active !== undefined && (
                <span className="text-muted-foreground/60">/{item.active}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="flex-shrink-0 w-fit mb-3">
            <TabsTrigger value="details" className="text-xs px-3 py-1.5 gap-1">
              <FileText className="h-3.5 w-3.5" />
              详情
            </TabsTrigger>
            <TabsTrigger value="flash-cards" className="text-xs px-3 py-1.5 gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              卡片
            </TabsTrigger>
            <TabsTrigger value="mind-maps" className="text-xs px-3 py-1.5 gap-1">
              <Brain className="h-3.5 w-3.5" />
              导图
            </TabsTrigger>
          </TabsList>

        {/* Knowledge Details Tab */}
        <TabsContent value="details" className="flex-1 flex flex-col overflow-hidden mt-0">
          <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
            {/* Filter Bar */}
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
              <Select 
                value={detailsParams.content_type || "all"} 
                onValueChange={(v) => setDetailsParams(prev => ({ ...prev, content_type: v === "all" ? undefined : v as KnowledgeDetailContentType, page: 1 }))}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue placeholder="内容类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {detailContentTypes.map(type => (
                    <SelectItem key={type} value={type}>{getDetailContentTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="知识点ID"
                className="w-[100px] h-8 text-xs"
                value={detailsParams.knowledge_point_id || ""}
                onChange={(e) => setDetailsParams(prev => ({ ...prev, knowledge_point_id: e.target.value ? Number(e.target.value) : undefined, page: 1 }))}
              />
              <div className="flex-1" />
              <Button size="sm" onClick={() => { resetDetailForm(); setEditingDetail(null); setShowDetailDialog(true); }}
                className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                新建
              </Button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[60px] py-2 text-xs">ID</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">知识点ID</TableHead>
                    <TableHead className="w-[100px] py-2 text-xs">类型</TableHead>
                    <TableHead className="py-2 text-xs">标题</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">浏览</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">点赞</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map(detail => (
                    <TableRow key={detail.id} className="hover:bg-muted/50">
                      <TableCell className="py-2 text-xs font-mono text-muted-foreground">{detail.id}</TableCell>
                      <TableCell className="py-2 text-xs font-mono text-muted-foreground">{detail.knowledge_point_id}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs">{getDetailContentTypeLabel(detail.content_type)}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-sm max-w-[200px] truncate">{detail.title || "-"}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{detail.view_count}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{detail.like_count}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={detail.is_active ? "default" : "secondary"} className="text-xs">
                          {detail.is_active ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditDetail(detail)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteDetail(detail.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {details.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-12 text-sm">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

            </div>

            {/* Pagination */}
            {detailsTotal > (detailsParams.page_size || 10) && (
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t bg-muted/10">
                <span className="text-xs text-muted-foreground">共 {detailsTotal} 条</span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={detailsPage <= 1}
                    onClick={() => setDetailsParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>
                    上一页
                  </Button>
                  <span className="text-xs px-2">{detailsPage} / {Math.ceil(detailsTotal / (detailsParams.page_size || 10))}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={detailsPage * (detailsParams.page_size || 10) >= detailsTotal}
                    onClick={() => setDetailsParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Flash Cards Tab */}
        <TabsContent value="flash-cards" className="flex-1 flex flex-col overflow-hidden mt-0">
          <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
            {/* Filter Bar */}
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
              <Select 
                value={flashCardParams.card_type || "all"} 
                onValueChange={(v) => setFlashCardParams(prev => ({ ...prev, card_type: v === "all" ? undefined : v as FlashCardType, page: 1 }))}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="卡片类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {flashCardTypes.map(type => (
                    <SelectItem key={type} value={type}>{getFlashCardTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索卡片..."
                  className="h-8 pl-8 pr-3 text-xs bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
                  value={flashCardParams.keyword || ""}
                  onChange={(e) => setFlashCardParams(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
                />
              </div>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => handleOpenBatchImport("flash-cards")} className="h-8 px-2 text-xs">
                <Upload className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={() => { resetCardForm(); setEditingCard(null); setShowFlashCardDialog(true); }}
                className="h-8 px-3 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                新建
              </Button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 text-xs">标题</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">类型</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">难度</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">重要度</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">浏览</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashCards.map(card => (
                    <TableRow key={card.id} className="hover:bg-muted/50">
                      <TableCell className="py-2 text-sm">{card.title}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs">{getFlashCardTypeLabel(card.card_type)}</Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: card.difficulty }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={card.importance >= 4 ? "destructive" : card.importance >= 3 ? "default" : "secondary"} className="text-xs">
                          {card.importance}星
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{card.view_count}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={card.is_active ? "default" : "secondary"} className="text-xs">
                          {card.is_active ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCard(card)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteCard(card.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </div>

            {/* Pagination */}
            {flashCardTotal > (flashCardParams.page_size || 10) && (
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t bg-muted/10">
                <span className="text-xs text-muted-foreground">共 {flashCardTotal} 条</span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={flashCardPage <= 1}
                    onClick={() => setFlashCardParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>
                    上一页
                  </Button>
                  <span className="text-xs px-2">{flashCardPage} / {Math.ceil(flashCardTotal / (flashCardParams.page_size || 10))}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={flashCardPage * (flashCardParams.page_size || 10) >= flashCardTotal}
                    onClick={() => setFlashCardParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Mind Maps Tab */}
        <TabsContent value="mind-maps" className="flex-1 flex flex-col overflow-hidden mt-0">
          <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
            {/* Filter Bar */}
            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b bg-muted/20">
              <Select 
                value={mindMapParams.map_type || "all"} 
                onValueChange={(v) => setMindMapParams(prev => ({ ...prev, map_type: v === "all" ? undefined : v as MindMapType, page: 1 }))}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="导图类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {mindMapTypes.map(type => (
                    <SelectItem key={type} value={type}>{getMindMapTypeLabel(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="搜索导图..."
                  className="h-8 pl-8 pr-3 text-xs bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
                  value={mindMapParams.keyword || ""}
                  onChange={(e) => setMindMapParams(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
                />
              </div>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={() => handleOpenBatchImport("mind-maps")} className="h-8 px-2 text-xs">
                <Upload className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" onClick={() => { resetMapForm(); setEditingMap(null); setShowMindMapDialog(true); }}
                className="h-8 px-3 text-xs bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                新建
              </Button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-2 text-xs">标题</TableHead>
                    <TableHead className="w-[90px] py-2 text-xs">类型</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">浏览</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">收藏</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">下载</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">公开</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mindMaps.map(map => (
                    <TableRow key={map.id} className="hover:bg-muted/50">
                      <TableCell className="py-2 text-sm">{map.title}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="text-xs">{getMindMapTypeLabel(map.map_type)}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{map.view_count}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{map.collect_count}</TableCell>
                      <TableCell className="py-2 text-sm text-muted-foreground">{map.download_count}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={map.is_public ? "default" : "secondary"} className="text-xs">
                          {map.is_public ? "公开" : "私有"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={map.is_active ? "default" : "secondary"} className="text-xs">
                          {map.is_active ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditMap(map)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteMap(map.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            </div>

            {/* Pagination */}
            {mindMapTotal > (mindMapParams.page_size || 10) && (
              <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t bg-muted/10">
                <span className="text-xs text-muted-foreground">共 {mindMapTotal} 条</span>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={mindMapPage <= 1}
                    onClick={() => setMindMapParams(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}>
                    上一页
                  </Button>
                  <span className="text-xs px-2">{mindMapPage} / {Math.ceil(mindMapTotal / (mindMapParams.page_size || 10))}</span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={mindMapPage * (mindMapParams.page_size || 10) >= mindMapTotal}
                    onClick={() => setMindMapParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}>
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      {/* Knowledge Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">{editingDetail ? "编辑详情" : "新建知识点详情"}</DialogTitle>
            <DialogDescription className="text-xs">
              创建或编辑知识点的详情内容
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">内容类型</Label>
                <Select 
                  value={detailForm.content_type} 
                  onValueChange={(v) => setDetailForm(prev => ({ ...prev, content_type: v as KnowledgeDetailContentType }))}
                  disabled={!!editingDetail}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {detailContentTypes.map(type => (
                      <SelectItem key={type} value={type}>{getDetailContentTypeLabel(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">知识点ID</Label>
                <Input 
                  type="number"
                  value={detailForm.knowledge_point_id || ""} 
                  onChange={(e) => setDetailForm(prev => ({ ...prev, knowledge_point_id: Number(e.target.value) }))}
                  placeholder="输入关联的知识点ID"
                  disabled={!!editingDetail}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">标题（可选）</Label>
              <Input 
                value={detailForm.title} 
                onChange={(e) => setDetailForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入标题"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">内容</Label>
              <Textarea 
                value={detailForm.content} 
                onChange={(e) => setDetailForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="输入详情内容（支持 Markdown 格式）"
                rows={8}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">排序</Label>
              <Input 
                type="number"
                value={detailForm.sort_order} 
                onChange={(e) => setDetailForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                placeholder="排序值（越小越靠前）"
                className="h-9 text-sm w-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowDetailDialog(false)}>取消</Button>
            <Button size="sm" onClick={handleCreateDetail}>{editingDetail ? "保存" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flash Card Dialog */}
      <Dialog open={showFlashCardDialog} onOpenChange={setShowFlashCardDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">{editingCard ? "编辑卡片" : "新建速记卡片"}</DialogTitle>
            <DialogDescription className="text-xs">
              创建或编辑速记卡片，帮助用户快速记忆知识点
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">卡片类型</Label>
                <Select 
                  value={cardForm.card_type} 
                  onValueChange={(v) => setCardForm(prev => ({ ...prev, card_type: v as FlashCardType }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flashCardTypes.map(type => (
                      <SelectItem key={type} value={type}>{getFlashCardTypeLabel(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">标题</Label>
                <Input 
                  value={cardForm.title} 
                  onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入卡片标题"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">正面内容（问题/词汇）</Label>
              <Textarea 
                value={cardForm.front_content} 
                onChange={(e) => setCardForm(prev => ({ ...prev, front_content: e.target.value }))}
                placeholder="输入正面内容"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">背面内容（答案/解释）</Label>
              <Textarea 
                value={cardForm.back_content} 
                onChange={(e) => setCardForm(prev => ({ ...prev, back_content: e.target.value }))}
                placeholder="输入背面内容"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">示例（可选）</Label>
              <Textarea 
                value={cardForm.example} 
                onChange={(e) => setCardForm(prev => ({ ...prev, example: e.target.value }))}
                placeholder="输入示例或例句"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">记忆技巧/口诀（可选）</Label>
              <Input 
                value={cardForm.mnemonic} 
                onChange={(e) => setCardForm(prev => ({ ...prev, mnemonic: e.target.value }))}
                placeholder="输入记忆技巧或口诀"
                className="h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">难度 (1-5)</Label>
                <Select 
                  value={String(cardForm.difficulty)} 
                  onValueChange={(v) => setCardForm(prev => ({ ...prev, difficulty: Number(v) }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}星</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">重要度 (1-5)</Label>
                <Select 
                  value={String(cardForm.importance)} 
                  onValueChange={(v) => setCardForm(prev => ({ ...prev, importance: Number(v) }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}星</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowFlashCardDialog(false)}>取消</Button>
            <Button size="sm" onClick={handleCreateCard}>{editingCard ? "保存" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mind Map Dialog */}
      <Dialog open={showMindMapDialog} onOpenChange={setShowMindMapDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">{editingMap ? "编辑导图" : "新建思维导图"}</DialogTitle>
            <DialogDescription className="text-xs">
              创建或编辑思维导图，可视化展示知识体系
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">导图类型</Label>
                <Select 
                  value={mapForm.map_type} 
                  onValueChange={(v) => setMapForm(prev => ({ ...prev, map_type: v as MindMapType }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mindMapTypes.map(type => (
                      <SelectItem key={type} value={type}>{getMindMapTypeLabel(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">标题</Label>
                <Input 
                  value={mapForm.title} 
                  onChange={(e) => setMapForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入导图标题"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">描述（可选）</Label>
              <Textarea 
                value={mapForm.description} 
                onChange={(e) => setMapForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入导图描述"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">导图数据 (JSON)</Label>
              <Textarea 
                value={mapForm.map_data} 
                onChange={(e) => setMapForm(prev => ({ ...prev, map_data: e.target.value }))}
                placeholder="输入导图JSON数据"
                rows={5}
                className="font-mono text-xs resize-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="is_public"
                checked={mapForm.is_public} 
                onChange={(e) => setMapForm(prev => ({ ...prev, is_public: e.target.checked }))}
                className="h-4 w-4 rounded border-muted-foreground/30"
              />
              <Label htmlFor="is_public" className="text-sm">公开导图</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowMindMapDialog(false)}>取消</Button>
            <Button size="sm" onClick={handleCreateMap}>{editingMap ? "保存" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={showBatchImportDialog} onOpenChange={setShowBatchImportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                批量导入{importType === "flash-cards" ? "速记卡片" : "思维导图"}
              </div>
            </DialogTitle>
            <DialogDescription>
              通过 JSON 格式批量导入数据，支持复制粘贴或上传文件
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleLoadSampleData}>
                <Sparkles className="h-4 w-4 mr-2" />
                加载示例数据
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyTemplate}>
                <Copy className="h-4 w-4 mr-2" />
                复制模板
              </Button>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FileJson className="h-4 w-4 mr-2" />
                  上传 JSON 文件
                </Button>
              </div>
            </div>

            {/* Data format hint */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">数据格式说明：</p>
              {importType === "flash-cards" ? (
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <code className="text-xs bg-muted px-1 rounded">card_type</code>: 类型 (idiom/word/formula/logic/figure/law/history/geography/tech/writing/interview/document/data/other)</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">title</code>: 标题（必填）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">front_content</code>: 正面内容（必填）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">back_content</code>: 背面内容（必填）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">example</code>: 示例（可选）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">mnemonic</code>: 记忆技巧（可选）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">difficulty</code>: 难度 1-5（可选，默认3）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">importance</code>: 重要度 1-5（可选，默认3）</li>
                </ul>
              ) : (
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <code className="text-xs bg-muted px-1 rounded">map_type</code>: 类型 (knowledge/course/subject/chapter/custom)</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">title</code>: 标题（必填）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">description</code>: 描述（可选）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">map_data</code>: JSON 格式的导图数据（必填）</li>
                  <li>• <code className="text-xs bg-muted px-1 rounded">is_public</code>: 是否公开（可选，默认 true）</li>
                </ul>
              )}
            </div>

            {/* JSON input */}
            <div className="space-y-2">
              <Label>JSON 数据</Label>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={`请输入 JSON 数组格式的${importType === "flash-cards" ? "卡片" : "导图"}数据...`}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            {/* Import result */}
            {importResult && (
              <div className={`rounded-lg p-4 ${importResult.failed > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {importResult.failed > 0 ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-medium">
                    导入完成：成功 {importResult.success} 条，失败 {importResult.failed} 条
                  </span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 text-sm text-amber-700">
                    <p className="font-medium">错误详情：</p>
                    <ul className="list-disc pl-5 mt-1">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>...还有 {importResult.errors.length - 5} 条错误</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchImportDialog(false)}>
              关闭
            </Button>
            <Button onClick={handleBatchImport} disabled={importing || !importData.trim()}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  开始导入
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
