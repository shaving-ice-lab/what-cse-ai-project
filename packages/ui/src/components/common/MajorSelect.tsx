"use client";

import * as React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface MajorData {
  code: string;
  name: string;
  category?: string;
  synonyms?: string[];
}

export interface MajorCategory {
  code: string;
  name: string;
  majors: MajorData[];
}

export interface MajorSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  data?: MajorCategory[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxSelect?: number;
  required?: boolean;
  error?: string;
  className?: string;
}

const defaultMajorData: MajorCategory[] = [
  {
    code: "01",
    name: "哲学",
    majors: [
      { code: "0101", name: "哲学" },
      { code: "0102", name: "逻辑学" },
      { code: "0103", name: "宗教学" },
    ],
  },
  {
    code: "02",
    name: "经济学",
    majors: [
      { code: "0201", name: "经济学" },
      { code: "0202", name: "国际经济与贸易" },
      { code: "0203", name: "财政学" },
      { code: "0204", name: "金融学" },
      { code: "0205", name: "保险学" },
      { code: "0206", name: "投资学" },
    ],
  },
  {
    code: "03",
    name: "法学",
    majors: [
      { code: "0301", name: "法学" },
      { code: "0302", name: "政治学与行政学" },
      { code: "0303", name: "社会学" },
      { code: "0304", name: "社会工作" },
      { code: "0305", name: "思想政治教育" },
    ],
  },
  {
    code: "08",
    name: "工学",
    majors: [
      { code: "0801", name: "机械工程" },
      { code: "0802", name: "材料科学与工程" },
      { code: "0803", name: "电气工程及其自动化" },
      { code: "0804", name: "电子信息工程" },
      { code: "0805", name: "计算机科学与技术", synonyms: ["计算机", "CS"] },
      { code: "0806", name: "软件工程" },
      { code: "0807", name: "网络工程" },
      { code: "0808", name: "信息安全" },
      { code: "0809", name: "土木工程" },
      { code: "0810", name: "建筑学" },
    ],
  },
  {
    code: "12",
    name: "管理学",
    majors: [
      { code: "1201", name: "管理科学" },
      { code: "1202", name: "信息管理与信息系统" },
      { code: "1203", name: "工商管理" },
      { code: "1204", name: "会计学" },
      { code: "1205", name: "财务管理" },
      { code: "1206", name: "人力资源管理" },
      { code: "1207", name: "行政管理" },
      { code: "1208", name: "公共事业管理" },
    ],
  },
];

export function MajorSelect({
  value = [],
  onChange,
  data = defaultMajorData,
  label,
  placeholder = "选择专业",
  disabled = false,
  multiple = true,
  maxSelect,
  required = false,
  error,
  className,
}: MajorSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);

  const allMajors = React.useMemo(() => {
    return data.flatMap((category) =>
      category.majors.map((major) => ({
        ...major,
        categoryName: category.name,
      }))
    );
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;

    const searchLower = searchValue.toLowerCase();
    return data
      .map((category) => ({
        ...category,
        majors: category.majors.filter(
          (major) =>
            major.name.toLowerCase().includes(searchLower) ||
            major.code.includes(searchValue) ||
            major.synonyms?.some((s) => s.toLowerCase().includes(searchLower))
        ),
      }))
      .filter((category) => category.majors.length > 0);
  }, [data, searchValue]);

  const selectedMajors = React.useMemo(() => {
    return value.map((code) => allMajors.find((m) => m.code === code)).filter(Boolean);
  }, [value, allMajors]);

  const handleSelect = (majorCode: string) => {
    if (!multiple) {
      onChange?.([majorCode]);
      setOpen(false);
      return;
    }

    if (value.includes(majorCode)) {
      onChange?.(value.filter((code) => code !== majorCode));
    } else {
      if (maxSelect && value.length >= maxSelect) return;
      onChange?.([...value, majorCode]);
    }
  };

  const handleRemove = (majorCode: string) => {
    onChange?.(value.filter((code) => code !== majorCode));
  };

  const toggleCategory = (categoryCode: string) => {
    if (expandedCategories.includes(categoryCode)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== categoryCode));
    } else {
      setExpandedCategories([...expandedCategories, categoryCode]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal h-auto min-h-10",
              error && "border-red-500"
            )}
          >
            <div className="flex flex-wrap gap-1">
              {selectedMajors.length > 0 ? (
                selectedMajors.map((major) => (
                  <Badge
                    key={major!.code}
                    variant="secondary"
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(major!.code);
                    }}
                  >
                    {major!.name}
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索专业..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">未找到匹配的专业</div>
            ) : (
              filteredData.map((category) => (
                <div key={category.code} className="mb-2">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium hover:bg-accent rounded"
                    onClick={() => toggleCategory(category.code)}
                  >
                    {category.name}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        expandedCategories.includes(category.code) && "rotate-180"
                      )}
                    />
                  </button>
                  {(expandedCategories.includes(category.code) || searchValue) && (
                    <div className="ml-2 mt-1 space-y-0.5">
                      {category.majors.map((major) => (
                        <button
                          key={major.code}
                          type="button"
                          className={cn(
                            "w-full flex items-center px-2 py-1.5 text-sm rounded hover:bg-accent",
                            value.includes(major.code) && "bg-primary/10 text-primary"
                          )}
                          onClick={() => handleSelect(major.code)}
                        >
                          <span className="flex-1 text-left">{major.name}</span>
                          {value.includes(major.code) && <span className="text-primary">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {maxSelect && (
            <div className="p-2 border-t text-xs text-muted-foreground">
              已选 {value.length}/{maxSelect}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default MajorSelect;
