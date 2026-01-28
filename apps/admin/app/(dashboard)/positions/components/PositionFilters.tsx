"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Bookmark,
  Trash2,
  Check,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@what-cse/ui";
import { positionApi } from "@/services/position-api";
import type { FilterOptions, PositionQueryParams } from "@/types/position";
import {
  EducationOptions,
  DegreeOptions,
  ExamTypeOptions,
  ExamCategoryOptions,
  DepartmentLevelOptions,
  PoliticalStatusOptions,
} from "@/types/position";

// 保存的筛选条件类型
interface SavedFilter {
  id: string;
  name: string;
  filters: Partial<PositionQueryParams>;
  createdAt: string;
}

// localStorage key
const SAVED_FILTERS_KEY = "position_saved_filters";

// 从 localStorage 加载保存的筛选条件
const loadSavedFilters = (): SavedFilter[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(SAVED_FILTERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// 保存筛选条件到 localStorage
const persistSavedFilters = (filters: SavedFilter[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
};

interface PositionFiltersProps {
  filters: PositionQueryParams;
  onFiltersChange: (filters: PositionQueryParams) => void;
  onReset: () => void;
  totalCount?: number;
  loading?: boolean;
}

export function PositionFilters({
  filters,
  onFiltersChange,
  onReset,
  totalCount,
  loading: externalLoading,
}: PositionFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // 区县选项状态
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  // 专业关键词搜索状态
  const [majorKeyword, setMajorKeyword] = useState("");
  
  // 保存筛选条件相关状态
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  // 加载保存的筛选条件
  useEffect(() => {
    setSavedFilters(loadSavedFilters());
  }, []);

  // 保存当前筛选条件
  const handleSaveFilter = useCallback(() => {
    if (!newFilterName.trim()) return;
    
    // 提取有效的筛选条件
    const filterToSave: Partial<PositionQueryParams> = {};
    if (filters.province) filterToSave.province = filters.province;
    if (filters.city) filterToSave.city = filters.city;
    if (filters.district) filterToSave.district = filters.district;
    if (filters.education) filterToSave.education = filters.education;
    if (filters.degree) filterToSave.degree = filters.degree;
    if (filters.exam_type) filterToSave.exam_type = filters.exam_type;
    if (filters.exam_category) filterToSave.exam_category = filters.exam_category;
    if (filters.major_category) filterToSave.major_category = filters.major_category;
    if (filters.major_keyword) filterToSave.major_keyword = filters.major_keyword;
    if (filters.department_level) filterToSave.department_level = filters.department_level;
    if (filters.political_status) filterToSave.political_status = filters.political_status;
    if (filters.reg_status) filterToSave.reg_status = filters.reg_status;
    if (filters.unlimited_major) filterToSave.unlimited_major = filters.unlimited_major;
    if (filters.fresh_graduate) filterToSave.fresh_graduate = filters.fresh_graduate;
    if (filters.no_experience) filterToSave.no_experience = filters.no_experience;
    if (filters.updated_today) filterToSave.updated_today = filters.updated_today;
    if (filters.expiring_days) filterToSave.expiring_days = filters.expiring_days;
    if (filters.min_recruit && filters.min_recruit > 1) filterToSave.min_recruit = filters.min_recruit;

    const newSavedFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name: newFilterName.trim(),
      filters: filterToSave,
      createdAt: new Date().toISOString(),
    };

    const updatedFilters = [...savedFilters, newSavedFilter];
    setSavedFilters(updatedFilters);
    persistSavedFilters(updatedFilters);
    
    setNewFilterName("");
    setSaveDialogOpen(false);
  }, [newFilterName, filters, savedFilters]);

  // 应用保存的筛选条件
  const handleApplySavedFilter = useCallback((savedFilter: SavedFilter) => {
    onFiltersChange({ ...filters, ...savedFilter.filters, page: 1 });
  }, [filters, onFiltersChange]);

  // 删除保存的筛选条件
  const handleDeleteSavedFilter = useCallback((id: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updatedFilters);
    persistSavedFilters(updatedFilters);
  }, [savedFilters]);

  // 获取筛选条件描述
  const getFilterDescription = (filter: SavedFilter) => {
    const parts: string[] = [];
    const f = filter.filters;
    if (f.province) parts.push(f.province);
    if (f.city) parts.push(f.city);
    if (f.district) parts.push(f.district);
    if (f.exam_type) parts.push(f.exam_type);
    if (f.exam_category) parts.push(f.exam_category);
    if (f.education) parts.push(f.education);
    if (f.major_category) parts.push(f.major_category);
    if (f.major_keyword) parts.push(`专业:${f.major_keyword}`);
    if (f.unlimited_major) parts.push("不限专业");
    if (f.fresh_graduate) parts.push("应届可报");
    return parts.slice(0, 3).join("、") + (parts.length > 3 ? "..." : "") || "全部";
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const data = await positionApi.getFilterOptions();
        setFilterOptions(data);
      } catch (err) {
        console.error("获取筛选选项失败:", err);
        // 使用默认选项
        setFilterOptions({
          provinces: [],
          exam_types: ExamTypeOptions,
          exam_categories: ExamCategoryOptions,
          major_categories: [],
          department_levels: DepartmentLevelOptions,
          educations: EducationOptions,
          political_status: PoliticalStatusOptions,
          genders: ["不限", "男", "女"],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // 获取区县数据
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!filters.city) {
        setDistricts([]);
        return;
      }
      
      try {
        setLoadingDistricts(true);
        const data = await positionApi.getDistricts(filters.province, filters.city);
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("获取区县选项失败:", err);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [filters.province, filters.city]);

  const updateFilter = (key: keyof PositionQueryParams, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.province) count++;
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.education) count++;
    if (filters.degree) count++;
    if (filters.exam_type) count++;
    if (filters.exam_category) count++;
    if (filters.major_category) count++;
    if (filters.major_keyword) count++;
    if (filters.department_level) count++;
    if (filters.political_status) count++;
    if (filters.unlimited_major) count++;
    if (filters.fresh_graduate) count++;
    if (filters.no_experience) count++;
    if (filters.reg_status) count++;
    if (filters.expiring_days) count++;
    if (filters.updated_today) count++;
    if (filters.min_recruit && filters.min_recruit > 1) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  // 获取活跃筛选标签
  const getActiveFilterTags = () => {
    const tags: { key: keyof PositionQueryParams; label: string; value: string }[] = [];
    
    if (filters.province) {
      tags.push({ key: "province", label: "省份", value: filters.province });
    }
    if (filters.city) {
      tags.push({ key: "city", label: "城市", value: filters.city });
    }
    if (filters.district) {
      tags.push({ key: "district", label: "区县", value: filters.district });
    }
    if (filters.exam_type) {
      tags.push({ key: "exam_type", label: "考试类型", value: filters.exam_type });
    }
    if (filters.exam_category) {
      tags.push({ key: "exam_category", label: "考试分类", value: filters.exam_category });
    }
    if (filters.education) {
      tags.push({ key: "education", label: "学历", value: filters.education });
    }
    if (filters.degree) {
      tags.push({ key: "degree", label: "学位", value: filters.degree });
    }
    if (filters.major_category) {
      tags.push({ key: "major_category", label: "专业大类", value: filters.major_category });
    }
    if (filters.major_keyword) {
      tags.push({ key: "major_keyword", label: "专业", value: filters.major_keyword });
    }
    if (filters.department_level) {
      tags.push({ key: "department_level", label: "单位层级", value: filters.department_level });
    }
    if (filters.political_status) {
      tags.push({ key: "political_status", label: "政治面貌", value: filters.political_status });
    }
    if (filters.reg_status) {
      const statusMap = { registering: "报名中", upcoming: "即将开始", ended: "已结束" };
      tags.push({ key: "reg_status", label: "报名状态", value: statusMap[filters.reg_status] || filters.reg_status });
    }
    if (filters.unlimited_major) {
      tags.push({ key: "unlimited_major", label: "", value: "不限专业" });
    }
    if (filters.fresh_graduate) {
      tags.push({ key: "fresh_graduate", label: "", value: "应届可报" });
    }
    if (filters.no_experience) {
      tags.push({ key: "no_experience", label: "", value: "无经验要求" });
    }
    if (filters.updated_today) {
      tags.push({ key: "updated_today", label: "", value: "今日更新" });
    }
    if (filters.expiring_days) {
      tags.push({ key: "expiring_days", label: "", value: `${filters.expiring_days}天内截止` });
    }
    if (filters.min_recruit && filters.min_recruit > 1) {
      tags.push({ key: "min_recruit", label: "招录人数", value: `≥${filters.min_recruit}人` });
    }
    
    return tags;
  };

  const activeFilterTags = getActiveFilterTags();

  // 移除单个筛选条件
  const removeFilter = (key: keyof PositionQueryParams) => {
    updateFilter(key, undefined);
  };

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">筛选条件</CardTitle>
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeCount}
                </Badge>
              )}
              {/* 筛选结果统计 */}
              {totalCount !== undefined && (
                <span className="text-sm text-muted-foreground ml-2">
                  {externalLoading ? (
                    <span className="animate-pulse">查询中...</span>
                  ) : (
                    <>共 <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> 条</>
                  )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* 保存的筛选条件下拉 */}
              {savedFilters.length > 0 && (
                <DropdownMenu>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-4 w-4" />
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                              {savedFilters.length}
                            </Badge>
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>已保存的筛选条件</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>已保存的筛选条件</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {savedFilters.map((savedFilter) => (
                      <DropdownMenuItem
                        key={savedFilter.id}
                        className="flex items-center justify-between group cursor-pointer"
                        onClick={() => handleApplySavedFilter(savedFilter)}
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="font-medium truncate">{savedFilter.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {getFilterDescription(savedFilter)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedFilter(savedFilter.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* 保存当前筛选 */}
              {activeCount > 0 && (
                <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Save className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>保存当前筛选条件</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>保存筛选条件</DialogTitle>
                      <DialogDescription>
                        为当前筛选条件命名，方便下次快速使用
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        placeholder="请输入名称，如：北京市应届生岗位"
                        value={newFilterName}
                        onChange={(e) => setNewFilterName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveFilter();
                          }
                        }}
                      />
                      <div className="mt-3 p-3 bg-muted/50 rounded-md">
                        <div className="text-xs text-muted-foreground mb-2">当前筛选条件：</div>
                        <div className="flex flex-wrap gap-1">
                          {activeFilterTags.map((tag) => (
                            <Badge key={tag.key} variant="secondary" className="text-xs">
                              {tag.label ? `${tag.label}: ${tag.value}` : tag.value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleSaveFilter} disabled={!newFilterName.trim()}>
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  重置
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        {/* 活跃筛选标签 */}
        {activeFilterTags.length > 0 && (
          <div className="px-6 pb-3">
            <div className="flex flex-wrap gap-2">
              {activeFilterTags.map((tag) => (
                <Badge
                  key={tag.key}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-xs">
                    {tag.label ? `${tag.label}: ${tag.value}` : tag.value}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFilter(tag.key);
                    }}
                    className="ml-1 p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* 地域筛选 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">地域</Label>
              {/* 快捷选择按钮 */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Button
                  variant={!filters.province ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => {
                    onFiltersChange({ ...filters, province: undefined, city: undefined, page: 1 });
                  }}
                >
                  全国
                </Button>
                {["北京", "上海", "广东", "江苏", "浙江", "山东"].map((prov) => (
                  <Button
                    key={prov}
                    variant={filters.province === prov ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => {
                      onFiltersChange({ ...filters, province: prov, city: undefined, page: 1 });
                    }}
                  >
                    {prov}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={filters.province || "all"}
                  onValueChange={(v) => {
                    onFiltersChange({ 
                      ...filters, 
                      province: v === "all" ? undefined : v, 
                      city: undefined, 
                      district: undefined,
                      page: 1 
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="省份" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部省份</SelectItem>
                    {(filterOptions?.provinces || []).map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.city || "all"}
                  onValueChange={(v) => {
                    onFiltersChange({ 
                      ...filters, 
                      city: v === "all" ? undefined : v, 
                      district: undefined,
                      page: 1 
                    });
                  }}
                  disabled={!filters.province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="城市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部城市</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.district || "all"}
                  onValueChange={(v) => updateFilter("district", v === "all" ? undefined : v)}
                  disabled={!filters.city || loadingDistricts}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingDistricts ? "加载中..." : "区县"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部区县</SelectItem>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 考试类型 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">考试类型</Label>
              <Select
                value={filters.exam_type || "all"}
                onValueChange={(v) => updateFilter("exam_type", v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {(filterOptions?.exam_types || ExamTypeOptions).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 考试分类 (A/B/C类) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">考试分类</Label>
              <Select
                value={filters.exam_category || "all"}
                onValueChange={(v) => updateFilter("exam_category", v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {(filterOptions?.exam_categories || ExamCategoryOptions).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 学历要求 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">学历要求</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filters.education || "all"}
                  onValueChange={(v) => updateFilter("education", v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="学历" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部学历</SelectItem>
                    {(filterOptions?.educations || EducationOptions).map((edu) => (
                      <SelectItem key={edu} value={edu}>
                        {edu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.degree || "all"}
                  onValueChange={(v) => updateFilter("degree", v === "all" ? undefined : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="学位" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部学位</SelectItem>
                    {DegreeOptions.map((deg) => (
                      <SelectItem key={deg} value={deg}>
                        {deg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 专业要求 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">专业要求</Label>
              <Select
                value={filters.major_category || "all"}
                onValueChange={(v) => updateFilter("major_category", v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="专业大类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部专业大类</SelectItem>
                  {(filterOptions?.major_categories || []).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  placeholder="搜索专业关键词，如：计算机、法学、会计..."
                  value={majorKeyword}
                  onChange={(e) => setMajorKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && majorKeyword.trim()) {
                      updateFilter("major_keyword", majorKeyword.trim());
                    }
                  }}
                  onBlur={() => {
                    if (majorKeyword.trim() && majorKeyword.trim() !== filters.major_keyword) {
                      updateFilter("major_keyword", majorKeyword.trim());
                    }
                  }}
                  className="pr-16"
                />
                {majorKeyword && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                    onClick={() => {
                      if (majorKeyword.trim()) {
                        updateFilter("major_keyword", majorKeyword.trim());
                      }
                    }}
                  >
                    搜索
                  </Button>
                )}
              </div>
              {filters.major_keyword && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>当前搜索：</span>
                  <Badge variant="secondary" className="text-xs">
                    {filters.major_keyword}
                    <button
                      onClick={() => {
                        setMajorKeyword("");
                        updateFilter("major_keyword", undefined);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              )}
            </div>

            {/* 单位层级 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">单位层级</Label>
              <Select
                value={filters.department_level || "all"}
                onValueChange={(v) => updateFilter("department_level", v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部层级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部层级</SelectItem>
                  {(filterOptions?.department_levels || DepartmentLevelOptions).map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 政治面貌 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">政治面貌</Label>
              <Select
                value={filters.political_status || "all"}
                onValueChange={(v) => updateFilter("political_status", v === "all" ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="不限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  {(filterOptions?.political_status || PoliticalStatusOptions).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 报名状态 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">报名状态</Label>
              <Select
                value={filters.reg_status || "all"}
                onValueChange={(v) => updateFilter("reg_status", v === "all" ? undefined : v as "registering" | "upcoming" | "ended")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="registering">报名中</SelectItem>
                  <SelectItem value="upcoming">即将开始</SelectItem>
                  <SelectItem value="ended">已结束</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 快捷筛选 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">快捷筛选</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unlimited_major"
                    checked={filters.unlimited_major || false}
                    onCheckedChange={(checked) =>
                      updateFilter("unlimited_major", checked || undefined)
                    }
                  />
                  <Label htmlFor="unlimited_major" className="text-sm cursor-pointer">
                    不限专业
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fresh_graduate"
                    checked={filters.fresh_graduate || false}
                    onCheckedChange={(checked) =>
                      updateFilter("fresh_graduate", checked || undefined)
                    }
                  />
                  <Label htmlFor="fresh_graduate" className="text-sm cursor-pointer">
                    应届可报
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="no_experience"
                    checked={filters.no_experience || false}
                    onCheckedChange={(checked) =>
                      updateFilter("no_experience", checked || undefined)
                    }
                  />
                  <Label htmlFor="no_experience" className="text-sm cursor-pointer">
                    无经验要求
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="updated_today"
                    checked={filters.updated_today || false}
                    onCheckedChange={(checked) =>
                      updateFilter("updated_today", checked || undefined)
                    }
                  />
                  <Label htmlFor="updated_today" className="text-sm cursor-pointer">
                    今日更新
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="expiring_soon"
                    checked={filters.expiring_days === 7}
                    onCheckedChange={(checked) =>
                      updateFilter("expiring_days", checked ? 7 : undefined)
                    }
                  />
                  <Label htmlFor="expiring_soon" className="text-sm cursor-pointer">
                    7天内截止
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="registering"
                    checked={filters.reg_status === "registering"}
                    onCheckedChange={(checked) =>
                      updateFilter("reg_status", checked ? "registering" : undefined)
                    }
                  />
                  <Label htmlFor="registering" className="text-sm cursor-pointer">
                    报名中
                  </Label>
                </div>
              </div>
            </div>

            {/* 最低招录人数 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">最低招录人数</Label>
              <Select
                value={String(filters.min_recruit || 0)}
                onValueChange={(v) => updateFilter("min_recruit", v === "0" ? undefined : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="不限" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">不限</SelectItem>
                  <SelectItem value="2">2人以上</SelectItem>
                  <SelectItem value="3">3人以上</SelectItem>
                  <SelectItem value="5">5人以上</SelectItem>
                  <SelectItem value="10">10人以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default PositionFilters;
