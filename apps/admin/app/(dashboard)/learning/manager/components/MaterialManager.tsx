'use client'

import { useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { useToolbar } from './ToolbarContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@what-cse/ui'
import { Button } from '@what-cse/ui'
import { Input } from '@what-cse/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@what-cse/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@what-cse/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@what-cse/ui'
import { Badge } from '@what-cse/ui'
import { Checkbox } from '@what-cse/ui'
import { Label } from '@what-cse/ui'
import { Textarea } from '@what-cse/ui'
import { Skeleton } from '@what-cse/ui'
import { Switch } from '@what-cse/ui'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@what-cse/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@what-cse/ui'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Star,
  Flame,
  FileText,
  Quote,
  Briefcase,
  MessageSquare,
  BookOpen,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  Check,
  X,
  Upload,
  Download,
  Copy,
  FolderTree,
  Database,
} from 'lucide-react'
import materialApi, {
  MaterialBrief,
  MaterialCategory,
  MaterialStats,
  MaterialType,
  MaterialSubType,
  MaterialStatus,
  MaterialQueryParams,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  CreateMaterialCategoryRequest,
  BatchImportMaterialItem,
  BatchImportResult,
  LearningMaterial,
  AIGenerateMaterialRequest,
  AIGenerateMaterialResult,
  AIGeneratedMaterial,
  PresetDataInfo,
  PrefillMaterialsResult,
  materialTypeNames,
  materialSubTypeNames,
  materialStatusNames,
  materialTypeSubTypes,
} from '@/services/material-api'

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
}

// 状态颜色映射
const statusColors: Record<MaterialStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
}

// 热点主题列表
const hotTopicThemes = [
  '乡村振兴', '生态文明', '科技创新', '社会治理', '民生保障',
  '文化建设', '依法治国', '共同富裕', '数字经济', '绿色发展',
  '高质量发展', '新质生产力', '教育公平', '医疗健康', '养老服务',
  '就业创业', '粮食安全', '能源安全', '国家安全', '对外开放',
]

export default function MaterialManager() {
  const { setToolbarContent } = useToolbar()
  
  // 状态
  const [materials, setMaterials] = useState<MaterialBrief[]>([])
  const [categories, setCategories] = useState<MaterialCategory[]>([])
  const [stats, setStats] = useState<MaterialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  
  // 筛选状态
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedType, setSelectedType] = useState<MaterialType | ''>('')
  const [selectedSubType, setSelectedSubType] = useState<MaterialSubType | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<MaterialStatus | ''>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  
  // 选中状态
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [categoryManageOpen, setCategoryManageOpen] = useState(false)
  const [currentMaterial, setCurrentMaterial] = useState<MaterialBrief | null>(null)
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null)
  
  // 批量导入状态
  const [importText, setImportText] = useState('')
  const [importCategoryId, setImportCategoryId] = useState<number>(0)
  const [importType, setImportType] = useState<MaterialType>('quote')
  const [importResult, setImportResult] = useState<BatchImportResult | null>(null)
  const [importing, setImporting] = useState(false)
  
  // AI 生成状态
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiType, setAiType] = useState<MaterialType>('quote')
  const [aiTheme, setAiTheme] = useState('')
  const [aiCount, setAiCount] = useState(5)
  const [aiCategoryId, setAiCategoryId] = useState<number>(0)
  const [aiAutoPublish, setAiAutoPublish] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiResult, setAiResult] = useState<AIGenerateMaterialResult | null>(null)
  
  // 预填充状态
  const [prefillDialogOpen, setPrefillDialogOpen] = useState(false)
  const [presetInfo, setPresetInfo] = useState<PresetDataInfo | null>(null)
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [prefillCategoryId, setPrefillCategoryId] = useState<number>(0)
  const [prefillAutoPublish, setPrefillAutoPublish] = useState(false)
  const [prefilling, setPrefilling] = useState(false)
  const [prefillResult, setPrefillResult] = useState<PrefillMaterialsResult | null>(null)
  
  // 表单状态
  const [formData, setFormData] = useState<CreateMaterialRequest>({
    category_id: 0,
    type: 'quote',
    sub_type: undefined,
    title: '',
    content: '',
    source: '',
    author: '',
    year: undefined,
    tags: [],
    keywords: [],
    theme_topics: [],
    subject: '',
    analysis: '',
    usage: '',
    example: '',
    translation: '',
    background: '',
    significance: '',
    is_free: true,
    vip_only: false,
    is_hot: false,
    is_featured: false,
    status: 'draft',
    sort_order: 0,
  })
  
  // 分类表单状态
  const [categoryFormData, setCategoryFormData] = useState<CreateMaterialCategoryRequest>({
    parent_id: undefined,
    name: '',
    code: '',
    material_type: 'quote',
    subject: '',
    icon: '',
    color: '#6366f1',
    description: '',
    sort_order: 0,
  })

  // 加载素材列表
  const loadMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const params: MaterialQueryParams = {
        page,
        page_size: pageSize,
      }
      if (searchKeyword) params.keyword = searchKeyword
      if (selectedType) params.type = selectedType
      if (selectedSubType) params.sub_type = selectedSubType
      if (selectedStatus) params.status = selectedStatus
      if (selectedCategoryId) params.category_id = selectedCategoryId

      const response = await materialApi.getMaterials(params)
      setMaterials(response.materials || [])
      setTotal(response.total)
    } catch (error) {
      console.error('加载素材失败:', error)
      toast.error('加载素材失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchKeyword, selectedType, selectedSubType, selectedStatus, selectedCategoryId])

  // 加载分类
  const loadCategories = useCallback(async () => {
    try {
      const response = await materialApi.getCategoryTree()
      setCategories(response || [])
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }, [])

  // 加载统计
  const loadStats = useCallback(async () => {
    try {
      const response = await materialApi.getMaterialStats()
      setStats(response)
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    loadMaterials()
    loadCategories()
    loadStats()
  }, [loadMaterials, loadCategories, loadStats])

  // 搜索
  const handleSearch = () => {
    setPage(1)
    loadMaterials()
  }

  // 创建素材
  const handleCreateMaterial = async () => {
    if (!formData.title || !formData.content || !formData.category_id) {
      toast.error('请填写必填项')
      return
    }
    try {
      await materialApi.createMaterial(formData)
      toast.success('创建成功')
      setCreateDialogOpen(false)
      resetForm()
      loadMaterials()
      loadStats()
    } catch (error) {
      console.error('创建失败:', error)
      toast.error('创建失败')
    }
  }

  // 更新素材
  const handleUpdateMaterial = async () => {
    if (!currentMaterial) return
    try {
      const updateData: UpdateMaterialRequest = {
        ...formData,
      }
      await materialApi.updateMaterial(currentMaterial.id, updateData)
      toast.success('更新成功')
      setEditDialogOpen(false)
      setCurrentMaterial(null)
      resetForm()
      loadMaterials()
    } catch (error) {
      console.error('更新失败:', error)
      toast.error('更新失败')
    }
  }

  // 删除素材
  const handleDeleteMaterial = async () => {
    if (!currentMaterial) return
    try {
      await materialApi.deleteMaterial(currentMaterial.id)
      toast.success('删除成功')
      setDeleteDialogOpen(false)
      setCurrentMaterial(null)
      loadMaterials()
      loadStats()
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('请选择要删除的素材')
      return
    }
    try {
      await materialApi.batchDeleteMaterials(selectedIds)
      toast.success(`成功删除 ${selectedIds.length} 条素材`)
      setSelectedIds([])
      loadMaterials()
      loadStats()
    } catch (error) {
      console.error('批量删除失败:', error)
      toast.error('批量删除失败')
    }
  }

  // 批量发布
  const handleBatchPublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('请选择要发布的素材')
      return
    }
    try {
      await materialApi.batchUpdateStatus(selectedIds, 'published')
      toast.success(`成功发布 ${selectedIds.length} 条素材`)
      setSelectedIds([])
      loadMaterials()
      loadStats()
    } catch (error) {
      console.error('批量发布失败:', error)
      toast.error('批量发布失败')
    }
  }

  // 批量设置热门
  const handleBatchSetHot = async (isHot: boolean) => {
    if (selectedIds.length === 0) {
      toast.error('请选择素材')
      return
    }
    try {
      await materialApi.batchSetHot(selectedIds, isHot)
      toast.success(`操作成功`)
      setSelectedIds([])
      loadMaterials()
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 批量设置精选
  const handleBatchSetFeatured = async (isFeatured: boolean) => {
    if (selectedIds.length === 0) {
      toast.error('请选择素材')
      return
    }
    try {
      await materialApi.batchSetFeatured(selectedIds, isFeatured)
      toast.success(`操作成功`)
      setSelectedIds([])
      loadMaterials()
    } catch (error) {
      console.error('操作失败:', error)
      toast.error('操作失败')
    }
  }

  // 创建分类
  const handleCreateCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.code) {
      toast.error('请填写必填项')
      return
    }
    try {
      await materialApi.createCategory(categoryFormData)
      toast.success('创建分类成功')
      setCategoryDialogOpen(false)
      resetCategoryForm()
      loadCategories()
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    }
  }

  // 预览素材
  const handlePreviewMaterial = async (material: MaterialBrief) => {
    try {
      const detail = await materialApi.getMaterial(material.id)
      setPreviewMaterial(detail)
      setPreviewDialogOpen(true)
    } catch (error) {
      console.error('加载详情失败:', error)
      toast.error('加载详情失败')
    }
  }

  // 解析导入文本
  const parseImportText = (text: string): BatchImportMaterialItem[] => {
    const lines = text.split('\n').filter((line) => line.trim())
    const items: BatchImportMaterialItem[] = []
    
    for (const line of lines) {
      // 支持多种分隔符：制表符、|、,
      const parts = line.split(/[\t|]/).map((p) => p.trim())
      if (parts.length >= 2) {
        items.push({
          title: parts[0],
          content: parts[1],
          source: parts[2] || '',
          author: parts[3] || '',
          tags: parts[4] || '',
          analysis: parts[5] || '',
        })
      } else if (parts.length === 1 && parts[0]) {
        // 单行作为标题和内容
        items.push({
          title: parts[0].substring(0, 50),
          content: parts[0],
        })
      }
    }
    return items
  }

  // 批量导入
  const handleBatchImport = async () => {
    if (!importText.trim()) {
      toast.error('请输入导入内容')
      return
    }
    
    const items = parseImportText(importText)
    if (items.length === 0) {
      toast.error('未解析到有效数据')
      return
    }
    
    if (items.length > 500) {
      toast.error('单次最多导入500条')
      return
    }

    setImporting(true)
    try {
      const result = await materialApi.batchImportMaterials({
        category_id: importCategoryId || undefined,
        type: importType,
        items,
      })
      setImportResult(result)
      if (result.success > 0) {
        toast.success(`成功导入 ${result.success} 条素材`)
        loadMaterials()
        loadStats()
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} 条导入失败`)
      }
    } catch (error) {
      console.error('导入失败:', error)
      toast.error('导入失败')
    } finally {
      setImporting(false)
    }
  }

  // 重置导入表单
  const resetImportForm = () => {
    setImportText('')
    setImportCategoryId(0)
    setImportType('quote')
    setImportResult(null)
  }

  // AI 生成素材
  const handleAIGenerate = async () => {
    if (!aiType) {
      toast.error('请选择素材类型')
      return
    }

    setAiGenerating(true)
    setAiResult(null)
    try {
      const result = await materialApi.aiGenerateMaterials({
        type: aiType,
        theme: aiTheme || undefined,
        count: aiCount,
        category_id: aiCategoryId || undefined,
        auto_publish: aiAutoPublish,
      })
      setAiResult(result)
      if (result.saved > 0) {
        toast.success(`成功生成并保存 ${result.saved} 条素材`)
        loadMaterials()
        loadStats()
      } else if (result.generated > 0) {
        toast.success(`成功生成 ${result.generated} 条素材`)
      }
    } catch (error) {
      console.error('AI 生成失败:', error)
      toast.error('AI 生成失败')
    } finally {
      setAiGenerating(false)
    }
  }

  // 重置 AI 生成表单
  const resetAIForm = () => {
    setAiType('quote')
    setAiTheme('')
    setAiCount(5)
    setAiCategoryId(0)
    setAiAutoPublish(false)
    setAiResult(null)
  }

  // 加载预置数据信息
  const loadPresetInfo = async () => {
    try {
      const info = await materialApi.getPresetDataInfo()
      setPresetInfo(info)
    } catch (error) {
      console.error('加载预置数据信息失败:', error)
    }
  }

  // 预填充素材
  const handlePrefill = async () => {
    if (selectedPresets.length === 0) {
      toast.error('请选择要填充的数据分类')
      return
    }

    setPrefilling(true)
    setPrefillResult(null)
    try {
      const result = await materialApi.prefillMaterials({
        category_codes: selectedPresets,
        target_category_id: prefillCategoryId || undefined,
        auto_publish: prefillAutoPublish,
      })
      setPrefillResult(result)
      if (result.success > 0) {
        toast.success(`成功填充 ${result.success} 条素材`)
        loadMaterials()
        loadStats()
      }
    } catch (error) {
      console.error('预填充失败:', error)
      toast.error('预填充失败')
    } finally {
      setPrefilling(false)
    }
  }

  // 重置预填充表单
  const resetPrefillForm = () => {
    setSelectedPresets([])
    setPrefillCategoryId(0)
    setPrefillAutoPublish(false)
    setPrefillResult(null)
  }

  // 打开预填充对话框
  const openPrefillDialog = async () => {
    resetPrefillForm()
    await loadPresetInfo()
    setPrefillDialogOpen(true)
  }

  // 生成示例文本
  const getImportExample = () => {
    return `标题\t内容\t来源\t作者\t标签\t解析
绿水青山就是金山银山\t绿水青山就是金山银山，阐明了经济发展和生态环境保护的关系...\t习近平总书记讲话\t习近平\t生态文明,绿色发展\t这句话深刻揭示了...
人民对美好生活的向往\t人民对美好生活的向往，就是我们的奋斗目标...\t十八大报告\t习近平\t民生,党建\t体现了以人民为中心的发展思想`
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      category_id: 0,
      type: 'quote',
      sub_type: undefined,
      title: '',
      content: '',
      source: '',
      author: '',
      year: undefined,
      tags: [],
      keywords: [],
      theme_topics: [],
      subject: '',
      analysis: '',
      usage: '',
      example: '',
      translation: '',
      background: '',
      significance: '',
      is_free: true,
      vip_only: false,
      is_hot: false,
      is_featured: false,
      status: 'draft',
      sort_order: 0,
    })
  }

  // 重置分类表单
  const resetCategoryForm = () => {
    setCategoryFormData({
      parent_id: undefined,
      name: '',
      code: '',
      material_type: 'quote',
      subject: '',
      icon: '',
      color: '#6366f1',
      description: '',
      sort_order: 0,
    })
  }

  // 打开编辑对话框
  const openEditDialog = (material: MaterialBrief) => {
    setCurrentMaterial(material)
    setFormData({
      category_id: material.category_id,
      type: material.type,
      sub_type: material.sub_type,
      title: material.title,
      content: material.content,
      source: material.source || '',
      author: material.author || '',
      year: material.year,
      tags: material.tags || [],
      keywords: [],
      theme_topics: material.theme_topics || [],
      subject: material.subject || '',
      analysis: '',
      usage: '',
      example: '',
      translation: '',
      background: '',
      significance: '',
      is_free: material.is_free,
      vip_only: material.vip_only,
      is_hot: material.is_hot,
      is_featured: material.is_featured,
      status: material.status,
      sort_order: 0,
    })
    setEditDialogOpen(true)
  }

  // 选择全部
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(materials.map((m) => m.id))
    } else {
      setSelectedIds([])
    }
  }

  // 选择单个
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id))
    }
  }

  // 截断内容
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  // 获取分类选项（扁平化）
  const flattenCategories = (
    cats: MaterialCategory[],
    level: number = 0
  ): { id: number; name: string; level: number }[] => {
    const result: { id: number; name: string; level: number }[] = []
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level })
      if (cat.children && cat.children.length > 0) {
        result.push(...flattenCategories(cat.children, level + 1))
      }
    }
    return result
  }

  const flatCategories = flattenCategories(categories)

  // Register toolbar content
  useLayoutEffect(() => {
    setToolbarContent(
      <>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索素材..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="h-8 w-40 pl-8 pr-3 text-sm bg-muted/40 border-transparent focus:border-border focus:bg-background transition-colors"
          />
        </div>
        <Button size="sm" variant="ghost" onClick={() => setCategoryManageOpen(true)} className="h-8 w-8 p-0">
          <FolderTree className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { resetAIForm(); setAiDialogOpen(true); }} className="h-8 w-8 p-0">
          <Lightbulb className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => loadMaterials()} disabled={loading} className="h-8 w-8 p-0">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}
          className="h-8 px-3 text-xs bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          新建
        </Button>
      </>
    )
    return () => setToolbarContent(null)
  }, [setToolbarContent, searchKeyword, loading])

  return (
    <div className="h-full flex flex-col">
      {/* Mini Stats Bar */}
      {stats && (
        <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 border-b border-border/30 bg-muted/20 overflow-x-auto">
          {[
            { label: "全部", value: stats.total_count, icon: FileText },
            { label: "名言", value: stats.quote_count, icon: Quote },
            { label: "案例", value: stats.case_count, icon: Briefcase },
            { label: "热点", value: stats.hot_topic_count, icon: Flame },
            { label: "热门", value: stats.hot_count, icon: Star },
            { label: "今日", value: stats.today_new_count, icon: Plus },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs">
              <item.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4">
        <Card className="flex-1 flex flex-col shadow-sm border-border/50 rounded-xl overflow-hidden">
          {/* Filter Bar */}
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-muted/20">
            <Select value={selectedType || "all"} onValueChange={(v) => { setSelectedType(v === "all" ? "" : v as MaterialType); setSelectedSubType(''); setPage(1); }}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(materialTypeNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && materialTypeSubTypes[selectedType]?.length > 0 && (
              <Select value={selectedSubType || "all"} onValueChange={(v) => { setSelectedSubType(v === "all" ? "" : v as MaterialSubType); setPage(1); }}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue placeholder="子类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {materialTypeSubTypes[selectedType].map((subType) => (
                    <SelectItem key={subType} value={subType}>{materialSubTypeNames[subType]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedStatus || "all"} onValueChange={(v) => { setSelectedStatus(v === "all" ? "" : v as MaterialStatus); setPage(1); }}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(materialStatusNames).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSearch}>
              <Search className="mr-1 h-3.5 w-3.5" />搜索
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setSearchKeyword(''); setSelectedType(''); setSelectedSubType(''); setSelectedStatus(''); setSelectedCategoryId(null); setPage(1); }}>
              重置
            </Button>
          </div>

          {/* Batch Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 border-b bg-blue-50 dark:bg-blue-950/30">
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">已选 {selectedIds.length} 项</span>
              <div className="flex-1" />
              <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600" onClick={handleBatchPublish}>发布</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleBatchSetHot(true)}>热门</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleBatchSetFeatured(true)}>精选</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-600" onClick={handleBatchDelete}>删除</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedIds([])}>取消</Button>
            </div>
          )}

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b border-transparent">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-32 flex-1" />
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                ))}
              </div>
            ) : materials.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm">暂无素材数据</p>
                <p className="text-xs mt-1 opacity-70">点击"新建"添加素材</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 py-2">
                      <Checkbox checked={selectedIds.length === materials.length && materials.length > 0} onCheckedChange={handleSelectAll} />
                    </TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">类型</TableHead>
                    <TableHead className="py-2 text-xs">标题</TableHead>
                    <TableHead className="w-[220px] py-2 text-xs">内容预览</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">来源</TableHead>
                    <TableHead className="w-[70px] py-2 text-xs">状态</TableHead>
                    <TableHead className="w-[80px] py-2 text-xs">标记</TableHead>
                    <TableHead className="w-[60px] py-2 text-xs">操作</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id} className="hover:bg-muted/50">
                    <TableCell className="py-2">
                      <Checkbox
                        checked={selectedIds.includes(material.id)}
                        onCheckedChange={(checked) =>
                          handleSelectOne(material.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        {typeIcons[material.type]}
                        <span className="text-xs text-muted-foreground">
                          {materialTypeNames[material.type]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-sm">{material.title}</div>
                      {material.author && (
                        <div className="text-xs text-muted-foreground">
                          {material.author}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {truncateContent(material.content)}
                      </p>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs text-muted-foreground">
                        {material.source || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={`text-xs ${statusColors[material.status]}`}>
                        {materialStatusNames[material.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {material.is_hot && (
                          <Flame className="h-3.5 w-3.5 text-orange-500" />
                        )}
                        {material.is_featured && (
                          <Star className="h-3.5 w-3.5 text-yellow-500" />
                        )}
                        {material.vip_only && (
                          <Badge variant="secondary" className="text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewMaterial(material)}
                            className="text-sm"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(material)}
                            className="text-sm"
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(material.content)
                              toast.success('已复制内容')
                            }}
                            className="text-sm"
                          >
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            复制内容
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-sm text-destructive"
                            onClick={() => {
                              setCurrentMaterial(material)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {total > pageSize && (
            <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-t bg-muted/10">
              <span className="text-xs text-muted-foreground">共 {total} 条</span>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</Button>
                <span className="text-xs px-2">{page} / {Math.ceil(total / pageSize)}</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage(page + 1)}>下一页</Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 创建素材对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">新建素材</DialogTitle>
            <DialogDescription className="text-xs">创建新的学习素材</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">素材类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      type: v as MaterialType,
                      sub_type: undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialTypeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {materialTypeSubTypes[formData.type]?.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">子类型</Label>
                  <Select
                    value={formData.sub_type || ''}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        sub_type: v as MaterialSubType,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="选择子类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypeSubTypes[formData.type].map((subType) => (
                        <SelectItem key={subType} value={subType}>
                          {materialSubTypeNames[subType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">分类 *</Label>
                <Select
                  value={formData.category_id?.toString() || ''}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category_id: parseInt(v) })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as MaterialStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialStatusNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">标题 *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="输入素材标题"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">内容 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="输入素材内容"
                rows={5}
                className="text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">来源</Label>
                <Input
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="出处"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">作者</Label>
                <Input
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="作者/人物"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">年份</Label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="年份"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">解读/分析</Label>
              <Textarea
                value={formData.analysis}
                onChange={(e) =>
                  setFormData({ ...formData, analysis: e.target.value })
                }
                placeholder="素材的解读或分析"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">使用场景</Label>
              <Textarea
                value={formData.usage}
                onChange={(e) =>
                  setFormData({ ...formData, usage: e.target.value })
                }
                placeholder="适用的场景或主题"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_hot}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_hot: checked })
                  }
                />
                <Label className="text-sm">热门素材</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label className="text-sm">精选素材</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.vip_only}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, vip_only: checked })
                  }
                />
                <Label className="text-sm">VIP 专属</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateDialogOpen(false)
                resetForm()
              }}
            >
              取消
            </Button>
            <Button size="sm" onClick={handleCreateMaterial}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑素材对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">编辑素材</DialogTitle>
            <DialogDescription className="text-xs">修改素材信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">素材类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      type: v as MaterialType,
                      sub_type: undefined,
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialTypeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {materialTypeSubTypes[formData.type]?.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">子类型</Label>
                  <Select
                    value={formData.sub_type || ''}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        sub_type: v as MaterialSubType,
                      })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="选择子类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypeSubTypes[formData.type].map((subType) => (
                        <SelectItem key={subType} value={subType}>
                          {materialSubTypeNames[subType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">分类 *</Label>
                <Select
                  value={formData.category_id?.toString() || ''}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category_id: parseInt(v) })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">状态</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v as MaterialStatus })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialStatusNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">标题 *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="输入素材标题"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">内容 *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="输入素材内容"
                rows={5}
                className="text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">来源</Label>
                <Input
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  placeholder="出处"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">作者</Label>
                <Input
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="作者/人物"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">年份</Label>
                <Input
                  type="number"
                  value={formData.year || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="年份"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">解读/分析</Label>
              <Textarea
                value={formData.analysis}
                onChange={(e) =>
                  setFormData({ ...formData, analysis: e.target.value })
                }
                placeholder="素材的解读或分析"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">使用场景</Label>
              <Textarea
                value={formData.usage}
                onChange={(e) =>
                  setFormData({ ...formData, usage: e.target.value })
                }
                placeholder="适用的场景或主题"
                rows={2}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex items-center gap-6 pt-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_hot}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_hot: checked })
                  }
                />
                <Label className="text-sm">热门素材</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked })
                  }
                />
                <Label className="text-sm">精选素材</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.vip_only}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, vip_only: checked })
                  }
                />
                <Label className="text-sm">VIP 专属</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditDialogOpen(false)
                setCurrentMaterial(null)
                resetForm()
              }}
            >
              取消
            </Button>
            <Button size="sm" onClick={handleUpdateMaterial}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除素材 "{currentMaterial?.title}" 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setCurrentMaterial(null)
              }}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建分类对话框 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建分类</DialogTitle>
            <DialogDescription>创建新的素材分类</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>分类名称 *</Label>
              <Input
                value={categoryFormData.name}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    name: e.target.value,
                  })
                }
                placeholder="输入分类名称"
              />
            </div>
            <div className="space-y-2">
              <Label>分类编码 *</Label>
              <Input
                value={categoryFormData.code}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    code: e.target.value,
                  })
                }
                placeholder="唯一标识，如 quote_xi"
              />
            </div>
            <div className="space-y-2">
              <Label>素材类型 *</Label>
              <Select
                value={categoryFormData.material_type}
                onValueChange={(v) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    material_type: v as MaterialType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(materialTypeNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>父分类</Label>
              <Select
                value={categoryFormData.parent_id?.toString() || 'none'}
                onValueChange={(v) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    parent_id: v && v !== 'none' ? parseInt(v) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择父分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {'  '.repeat(cat.level) + cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>科目</Label>
              <Select
                value={categoryFormData.subject || 'none'}
                onValueChange={(v) =>
                  setCategoryFormData({ ...categoryFormData, subject: v === 'none' ? '' : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择科目（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">无</SelectItem>
                  <SelectItem value="申论">申论</SelectItem>
                  <SelectItem value="面试">面试</SelectItem>
                  <SelectItem value="常识">常识</SelectItem>
                  <SelectItem value="行测">行测</SelectItem>
                  <SelectItem value="公基">公基</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    description: e.target.value,
                  })
                }
                placeholder="分类描述"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCategoryDialogOpen(false)
                resetCategoryForm()
              }}
            >
              取消
            </Button>
            <Button onClick={handleCreateCategory}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>批量导入素材</DialogTitle>
            <DialogDescription>
              支持批量导入素材，每行一条，使用制表符或 | 分隔字段
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>默认素材类型</Label>
                <Select
                  value={importType}
                  onValueChange={(v) => setImportType(v as MaterialType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialTypeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>默认分类</Label>
                <Select
                  value={importCategoryId ? importCategoryId.toString() : 'none'}
                  onValueChange={(v) => setImportCategoryId(v && v !== 'none' ? parseInt(v) : 0)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不指定</SelectItem>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>导入数据</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportText(getImportExample())}
                >
                  <Download className="mr-2 h-4 w-4" />
                  加载示例
                </Button>
              </div>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`格式：标题 [Tab] 内容 [Tab] 来源 [Tab] 作者 [Tab] 标签 [Tab] 解析
每行一条素材，字段用 Tab 或 | 分隔
必填字段：标题、内容
可选字段：来源、作者、标签（逗号分隔）、解析`}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                已输入 {importText.split('\n').filter((l) => l.trim()).length} 行
              </p>
            </div>
            {importResult && (
              <Card className={importResult.failed > 0 ? 'border-orange-200' : 'border-green-200'}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">总计：</span>
                      <span className="font-medium">{importResult.total}</span>
                    </div>
                    <div>
                      <span className="text-sm text-green-600">成功：</span>
                      <span className="font-medium text-green-600">{importResult.success}</span>
                    </div>
                    <div>
                      <span className="text-sm text-red-600">失败：</span>
                      <span className="font-medium text-red-600">{importResult.failed}</span>
                    </div>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      {importResult.errors.slice(0, 5).map((err, i) => (
                        <div key={i}>{err}</div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div>... 还有 {importResult.errors.length - 5} 条错误</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false)
                resetImportForm()
              }}
            >
              关闭
            </Button>
            <Button onClick={handleBatchImport} disabled={importing}>
              {importing ? '导入中...' : '开始导入'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 素材预览对话框 */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>素材详情</DialogTitle>
          </DialogHeader>
          {previewMaterial && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {typeIcons[previewMaterial.type]}
                <Badge>{materialTypeNames[previewMaterial.type]}</Badge>
                {previewMaterial.sub_type && (
                  <Badge variant="outline">
                    {materialSubTypeNames[previewMaterial.sub_type]}
                  </Badge>
                )}
                <Badge className={statusColors[previewMaterial.status]}>
                  {materialStatusNames[previewMaterial.status]}
                </Badge>
                {previewMaterial.is_hot && (
                  <Badge className="bg-orange-100 text-orange-800">
                    <Flame className="h-3 w-3 mr-1" />
                    热门
                  </Badge>
                )}
                {previewMaterial.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    精选
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{previewMaterial.title}</h3>
                {(previewMaterial.author || previewMaterial.source) && (
                  <p className="text-sm text-muted-foreground">
                    {previewMaterial.author && `作者: ${previewMaterial.author}`}
                    {previewMaterial.author && previewMaterial.source && ' | '}
                    {previewMaterial.source && `来源: ${previewMaterial.source}`}
                    {previewMaterial.year && ` (${previewMaterial.year})`}
                  </p>
                )}
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">内容</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{previewMaterial.content}</p>
                </CardContent>
              </Card>
              {previewMaterial.analysis && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">解读/分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{previewMaterial.analysis}</p>
                  </CardContent>
                </Card>
              )}
              {previewMaterial.usage && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">使用场景</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{previewMaterial.usage}</p>
                  </CardContent>
                </Card>
              )}
              {previewMaterial.example && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">示例</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{previewMaterial.example}</p>
                  </CardContent>
                </Card>
              )}
              {previewMaterial.tags && previewMaterial.tags.length > 0 && (
                <div>
                  <Label className="text-sm">标签</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewMaterial.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {previewMaterial.theme_topics && previewMaterial.theme_topics.length > 0 && (
                <div>
                  <Label className="text-sm">主题</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewMaterial.theme_topics.map((topic, i) => (
                      <Badge key={i} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>浏览 {previewMaterial.view_count}</span>
                <span>收藏 {previewMaterial.collect_count}</span>
                <span>使用 {previewMaterial.use_count}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(previewMaterial?.content || '')
                toast.success('已复制内容')
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制内容
            </Button>
            <Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分类管理对话框 */}
      <Dialog open={categoryManageOpen} onOpenChange={setCategoryManageOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>分类管理</DialogTitle>
            <DialogDescription>管理素材分类结构</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              size="sm"
              onClick={() => {
                setCategoryManageOpen(false)
                setCategoryDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              新建分类
            </Button>
            <div className="border rounded-lg">
              {categories.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  暂无分类
                </div>
              ) : (
                <div className="divide-y">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{cat.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {materialTypeNames[cat.material_type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({cat.material_count} 条)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async () => {
                              if (confirm('确定删除此分类？')) {
                                try {
                                  await materialApi.deleteCategory(cat.id)
                                  toast.success('删除成功')
                                  loadCategories()
                                } catch (error) {
                                  toast.error('删除失败')
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {cat.children && cat.children.length > 0 && (
                        <div className="ml-6 border-l">
                          {cat.children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-2 pl-4 hover:bg-muted/50"
                            >
                              <div className="flex items-center gap-2">
                                <span>{child.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({child.material_count} 条)
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={async () => {
                                  if (confirm('确定删除此分类？')) {
                                    try {
                                      await materialApi.deleteCategory(child.id)
                                      toast.success('删除成功')
                                      loadCategories()
                                    } catch (error) {
                                      toast.error('删除失败')
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCategoryManageOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI 生成素材对话框 */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI 智能生成素材
            </DialogTitle>
            <DialogDescription>
              使用 AI 快速生成学习素材，支持名言警句、案例、优美语句等多种类型
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>素材类型 *</Label>
                <Select
                  value={aiType}
                  onValueChange={(v) => setAiType(v as MaterialType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialTypeNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>生成主题</Label>
                <Select
                  value={aiTheme || 'all'}
                  onValueChange={(v) => setAiTheme(v === 'all' ? '' : v)}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>生成数量</Label>
                <Select
                  value={aiCount.toString()}
                  onValueChange={(v) => setAiCount(parseInt(v))}
                >
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
              <div className="space-y-2">
                <Label>保存到分类</Label>
                <Select
                  value={aiCategoryId ? aiCategoryId.toString() : 'none'}
                  onValueChange={(v) => setAiCategoryId(v && v !== 'none' ? parseInt(v) : 0)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="仅预览不保存" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">仅预览不保存</SelectItem>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {'  '.repeat(cat.level) + cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {aiCategoryId > 0 && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={aiAutoPublish}
                  onCheckedChange={setAiAutoPublish}
                />
                <Label>自动发布（保存后直接发布）</Label>
              </div>
            )}
            {aiResult && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    生成结果
                  </CardTitle>
                  <CardDescription>
                    生成 {aiResult.generated} 条
                    {aiResult.saved > 0 && `，已保存 ${aiResult.saved} 条`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                  {aiResult.materials.map((m, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(m.content)
                            toast.success('已复制内容')
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {m.content}
                      </p>
                      {m.source && (
                        <p className="text-xs text-muted-foreground">
                          来源: {m.source}
                          {m.author && ` | 作者: ${m.author}`}
                        </p>
                      )}
                      {m.tags && m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.tags.map((tag, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAiDialogOpen(false)
                resetAIForm()
              }}
            >
              关闭
            </Button>
            <Button onClick={handleAIGenerate} disabled={aiGenerating}>
              {aiGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  开始生成
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 内容预填充对话框 */}
      <Dialog open={prefillDialogOpen} onOpenChange={setPrefillDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              素材内容预填充
            </DialogTitle>
            <DialogDescription>
              快速填充预置的素材内容，包括名言警句、典型案例、热点专题等高质量素材
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {presetInfo && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>预置数据总量</span>
                  <span className="font-medium">{presetInfo.total_materials} 条素材</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>选择要填充的数据分类</Label>
              <div className="grid gap-2">
                {presetInfo?.categories.map((cat) => (
                  <div
                    key={cat.code}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPresets.includes(cat.code)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedPresets((prev) =>
                        prev.includes(cat.code)
                          ? prev.filter((c) => c !== cat.code)
                          : [...prev, cat.code]
                      )
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox checked={selectedPresets.includes(cat.code)} />
                      <div>
                        <div className="font-medium">{cat.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {cat.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">{cat.count} 条</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>已选择: {selectedPresets.length} 个分类</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPresets(presetInfo?.categories.map(c => c.code) || [])}
                >
                  全选
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPresets([])}
                >
                  清空
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>保存到分类（可选）</Label>
              <Select
                value={prefillCategoryId ? prefillCategoryId.toString() : 'auto'}
                onValueChange={(v) => setPrefillCategoryId(v && v !== 'auto' ? parseInt(v) : 0)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="自动按类型分配到对应分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动按类型分配</SelectItem>
                  {flatCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {'  '.repeat(cat.level) + cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={prefillAutoPublish}
                onCheckedChange={setPrefillAutoPublish}
              />
              <Label>自动发布（填充后直接发布素材）</Label>
            </div>
            {prefillResult && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    填充完成
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <div className="space-y-1">
                    <div>总计: {prefillResult.total} 条</div>
                    <div className="text-green-600">成功: {prefillResult.success} 条</div>
                    {prefillResult.failed > 0 && (
                      <div className="text-red-600">失败: {prefillResult.failed} 条</div>
                    )}
                    {prefillResult.errors && prefillResult.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-500">
                        {prefillResult.errors.slice(0, 5).map((e, i) => (
                          <div key={i}>{e}</div>
                        ))}
                        {prefillResult.errors.length > 5 && (
                          <div>...还有 {prefillResult.errors.length - 5} 个错误</div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPrefillDialogOpen(false)
                resetPrefillForm()
              }}
            >
              关闭
            </Button>
            <Button onClick={handlePrefill} disabled={prefilling || selectedPresets.length === 0}>
              {prefilling ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  填充中...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  开始填充
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
