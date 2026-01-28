"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  Heart,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Calculator,
  BookOpen,
  Lightbulb,
  Search,
  X,
  Filter,
} from "lucide-react";

// 公式数据
export interface FormulaData {
  id: string;
  name: string;
  latex: string;
  description?: string;
  category: string;
  subcategory?: string;
  variables?: { symbol: string; meaning: string }[];
  example?: {
    question: string;
    solution: string;
    answer: string;
  };
  tips?: string[];
  relatedFormulas?: string[];
  difficulty?: 1 | 2 | 3 | 4 | 5;
}

// 公式分类
export interface FormulaCategory {
  id: string;
  name: string;
  icon?: string;
  count?: number;
}

interface FormulaDisplayProps {
  formula: FormulaData;
  isFavorited?: boolean;
  expanded?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onCopy?: (latex: string) => void;
  onRelatedClick?: (id: string) => void;
  className?: string;
}

// 简单的 LaTeX 渲染函数（用于基本公式）
// 在实际项目中建议使用 KaTeX 或 MathJax
function renderLatex(latex: string): string {
  // 基础转换 - 实际项目中应该使用 KaTeX
  let result = latex
    // 分数
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="frac"><span class="num">$1</span><span class="denom">$2</span></span>')
    // 上标
    .replace(/\^(\{[^}]+\}|\d)/g, (_, exp) => `<sup>${exp.replace(/[{}]/g, '')}</sup>`)
    // 下标
    .replace(/_(\{[^}]+\}|\d)/g, (_, sub) => `<sub>${sub.replace(/[{}]/g, '')}</sub>`)
    // 根号
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '<sup>$1</sup>√($2)')
    // 希腊字母
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\theta/g, 'θ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\Pi/g, 'Π')
    .replace(/\\Omega/g, 'Ω')
    // 运算符
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\pm/g, '±')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\approx/g, '≈')
    .replace(/\\infty/g, '∞')
    .replace(/\\sum/g, 'Σ')
    .replace(/\\prod/g, 'Π')
    .replace(/\\int/g, '∫')
    // 括号
    .replace(/\\left\(/g, '(')
    .replace(/\\right\)/g, ')')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    // 其他
    .replace(/\\cdot/g, '·')
    .replace(/\\ldots/g, '...')
    .replace(/\\/g, '');

  return result;
}

// 难度指示器
function DifficultyIndicator({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 h-4 rounded-sm",
            i <= level ? "bg-amber-400" : "bg-stone-200"
          )}
        />
      ))}
    </div>
  );
}

export function FormulaDisplay({
  formula,
  isFavorited = false,
  expanded: initialExpanded = false,
  onFavoriteToggle,
  onCopy,
  onRelatedClick,
  className,
}: FormulaDisplayProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [copied, setCopied] = useState(false);

  // 复制公式
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formula.latex);
      setCopied(true);
      onCopy?.(formula.latex);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  }, [formula.latex, onCopy]);

  // 渲染的 LaTeX
  const renderedLatex = useMemo(() => renderLatex(formula.latex), [formula.latex]);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-stone-200 overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* 主要内容 */}
      <div className="p-4">
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* 分类标签 */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                {formula.category}
              </span>
              {formula.subcategory && (
                <span className="text-xs text-stone-400">
                  / {formula.subcategory}
                </span>
              )}
              {formula.difficulty && (
                <DifficultyIndicator level={formula.difficulty} />
              )}
            </div>
            {/* 名称 */}
            <h3 className="font-semibold text-stone-800">{formula.name}</h3>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className={cn(
                "p-2 rounded-lg transition-colors",
                copied
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-stone-100 text-stone-500"
              )}
              title="复制公式"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onFavoriteToggle?.(formula.id)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isFavorited
                  ? "bg-red-50 text-red-500"
                  : "hover:bg-stone-100 text-stone-500"
              )}
              title={isFavorited ? "取消收藏" : "收藏"}
            >
              <Heart
                className={cn("w-4 h-4", isFavorited && "fill-current")}
              />
            </button>
          </div>
        </div>

        {/* 公式展示 */}
        <div className="relative p-4 bg-gradient-to-br from-stone-50 to-amber-50/30 rounded-lg border border-stone-100">
          <div
            className="text-xl text-center font-math text-stone-800 select-all"
            dangerouslySetInnerHTML={{ __html: renderedLatex }}
          />
          {/* LaTeX 原文（hover 显示） */}
          <div className="absolute bottom-1 right-1 text-[10px] text-stone-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            {formula.latex}
          </div>
        </div>

        {/* 描述 */}
        {formula.description && (
          <p className="mt-3 text-sm text-stone-600">{formula.description}</p>
        )}

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              收起详情
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              展开详情
            </>
          )}
        </button>
      </div>

      {/* 展开的详细内容 */}
      {expanded && (
        <div className="border-t border-stone-100 p-4 bg-stone-50/50 space-y-4">
          {/* 变量说明 */}
          {formula.variables && formula.variables.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                变量说明
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {formula.variables.map((v, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg"
                  >
                    <span className="font-mono font-bold text-amber-600">
                      {v.symbol}
                    </span>
                    <span className="text-sm text-stone-600">{v.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 应用示例 */}
          {formula.example && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                <Calculator className="w-4 h-4 text-emerald-500" />
                应用示例
              </h4>
              <div className="bg-white rounded-lg p-3 space-y-2">
                <div>
                  <span className="text-xs text-stone-500">题目：</span>
                  <p className="text-sm text-stone-700">{formula.example.question}</p>
                </div>
                <div>
                  <span className="text-xs text-stone-500">解答：</span>
                  <p className="text-sm text-stone-600">{formula.example.solution}</p>
                </div>
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-xs text-stone-500">答案：</span>
                  <span className="ml-2 font-medium text-emerald-600">
                    {formula.example.answer}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 记忆技巧 */}
          {formula.tips && formula.tips.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                记忆技巧
              </h4>
              <ul className="space-y-1">
                {formula.tips.map((tip, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-stone-600"
                  >
                    <span className="text-amber-500 mt-0.5">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 相关公式 */}
          {formula.relatedFormulas && formula.relatedFormulas.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-2">
                <BookOpen className="w-4 h-4 text-violet-500" />
                相关公式
              </h4>
              <div className="flex flex-wrap gap-2">
                {formula.relatedFormulas.map((id) => (
                  <button
                    key={id}
                    onClick={() => onRelatedClick?.(id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    {id}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 公式列表组件
interface FormulaListProps {
  formulas: FormulaData[];
  categories: FormulaCategory[];
  favoritedIds?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  onFormulaClick?: (formula: FormulaData) => void;
  className?: string;
}

export function FormulaList({
  formulas,
  categories,
  favoritedIds = new Set(),
  onFavoriteToggle,
  onFormulaClick,
  className,
}: FormulaListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // 过滤公式
  const filteredFormulas = useMemo(() => {
    return formulas.filter((formula) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = formula.name.toLowerCase().includes(query);
        const matchesDescription = formula.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) return false;
      }

      // 分类过滤
      if (selectedCategory && formula.category !== selectedCategory) {
        return false;
      }

      // 收藏过滤
      if (showFavoritesOnly && !favoritedIds.has(formula.id)) {
        return false;
      }

      return true;
    });
  }, [formulas, searchQuery, selectedCategory, showFavoritesOnly, favoritedIds]);

  // 按分类分组
  const groupedFormulas = useMemo(() => {
    const groups = new Map<string, FormulaData[]>();

    filteredFormulas.forEach((formula) => {
      const category = formula.category;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(formula);
    });

    return groups;
  }, [filteredFormulas]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜索框 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索公式..."
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded"
            >
              <X className="w-3 h-3 text-stone-400" />
            </button>
          )}
        </div>

        {/* 分类筛选 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name} {cat.count ? `(${cat.count})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 只看收藏 */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
            showFavoritesOnly
              ? "bg-red-50 border-red-200 text-red-600"
              : "border-stone-200 text-stone-600 hover:bg-stone-50"
          )}
        >
          <Heart
            className={cn("w-4 h-4", showFavoritesOnly && "fill-current")}
          />
          <span className="text-sm">收藏</span>
        </button>
      </div>

      {/* 统计信息 */}
      <div className="text-sm text-stone-500">
        共 {filteredFormulas.length} 个公式
        {searchQuery && ` (搜索 "${searchQuery}")`}
      </div>

      {/* 公式列表 */}
      {filteredFormulas.length > 0 ? (
        <div className="space-y-6">
          {Array.from(groupedFormulas.entries()).map(([category, formulas]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded" />
                {category}
                <span className="text-stone-400 font-normal">
                  ({formulas.length})
                </span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {formulas.map((formula) => (
                  <FormulaDisplay
                    key={formula.id}
                    formula={formula}
                    isFavorited={favoritedIds.has(formula.id)}
                    onFavoriteToggle={onFavoriteToggle}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-stone-500">
          <Calculator className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p>没有找到匹配的公式</p>
        </div>
      )}
    </div>
  );
}

export default FormulaDisplay;
