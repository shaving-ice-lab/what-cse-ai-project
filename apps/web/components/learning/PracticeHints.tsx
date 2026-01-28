"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Brain,
  Calculator,
  BookOpen,
  Target,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

// 提示类型
export type HintType = "step" | "keyInfo" | "thinking" | "formula" | "method";

// 解题提示
export interface PracticeHint {
  id: string;
  type: HintType;
  level: number; // 提示级别 1-3，级别越高越接近答案
  title: string;
  content: string;
  isRevealed?: boolean;
}

// 知识点速查
export interface QuickReference {
  id: number;
  name: string;
  content: string;
  formula?: string;
  tips?: string[];
}

// 方法技巧卡
export interface MethodCard {
  id: string;
  title: string;
  steps: string[];
  applicability: string;
  example?: string;
}

// 组件Props
interface PracticeHintsProps {
  questionId: number;
  hints?: PracticeHint[];
  quickReferences?: QuickReference[];
  methodCards?: MethodCard[];
  isEnabled?: boolean;
  onToggleEnabled?: (enabled: boolean) => void;
  onHintReveal?: (hintId: string) => void;
  onKnowledgeClick?: (knowledgeId: number) => void;
  className?: string;
}

// 提示类型配置
const HINT_TYPE_CONFIG: Record<
  HintType,
  { icon: typeof Lightbulb; color: string; bgColor: string; label: string }
> = {
  step: {
    icon: ArrowRight,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "第一步提示",
  },
  keyInfo: {
    icon: Target,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "关键信息",
  },
  thinking: {
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    label: "思路引导",
  },
  formula: {
    icon: Calculator,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "公式提示",
  },
  method: {
    icon: Lightbulb,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "方法提示",
  },
};

// 单个提示卡片
function HintCard({
  hint,
  onReveal,
}: {
  hint: PracticeHint;
  onReveal?: () => void;
}) {
  const config = HINT_TYPE_CONFIG[hint.type];
  const Icon = config.icon;

  // 根据级别显示不同警告
  const levelWarning = {
    1: "基础提示",
    2: "进阶提示",
    3: "关键提示（接近答案）",
  };

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        hint.isRevealed
          ? "border-stone-200 bg-white"
          : "border-dashed border-stone-300 bg-stone-50"
      )}
    >
      {/* 头部 */}
      <div
        className={cn(
          "flex items-center justify-between p-3",
          hint.isRevealed ? config.bgColor : "bg-stone-100"
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center",
              hint.isRevealed ? "bg-white/80" : "bg-white"
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                hint.isRevealed ? config.color : "text-stone-400"
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                "text-sm font-medium",
                hint.isRevealed ? config.color : "text-stone-500"
              )}
            >
              {config.label}
            </span>
            <span className="text-xs text-stone-400 ml-2">
              Lv.{hint.level} - {levelWarning[hint.level as 1 | 2 | 3]}
            </span>
          </div>
        </div>
        {!hint.isRevealed && (
          <button
            onClick={onReveal}
            className="flex items-center gap-1 px-3 py-1 bg-white text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            查看提示
          </button>
        )}
      </div>

      {/* 内容 */}
      {hint.isRevealed ? (
        <div className="p-3">
          <h4 className="font-medium text-stone-700 mb-1">{hint.title}</h4>
          <p className="text-sm text-stone-600">{hint.content}</p>
        </div>
      ) : (
        <div className="p-3 flex items-center justify-center">
          <p className="text-sm text-stone-400 flex items-center gap-2">
            <EyeOff className="w-4 h-4" />
            点击上方按钮查看提示
          </p>
        </div>
      )}
    </div>
  );
}

// 知识点速查卡片
function QuickReferenceCard({
  reference,
  onClick,
}: {
  reference: QuickReference;
  onClick?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-stone-700">{reference.name}</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-stone-400" />
        )}
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* 内容 */}
          <p className="text-sm text-stone-600">{reference.content}</p>

          {/* 公式 */}
          {reference.formula && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-1">公式：</p>
              <p className="text-blue-800 font-mono">{reference.formula}</p>
            </div>
          )}

          {/* 技巧 */}
          {reference.tips && reference.tips.length > 0 && (
            <div>
              <p className="text-sm font-medium text-stone-600 mb-1">要点：</p>
              <ul className="space-y-1">
                {reference.tips.map((tip, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-stone-600 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 查看详情 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            查看完整知识点
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// 方法技巧卡片
function MethodTechCard({ method }: { method: MethodCard }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-purple-700">{method.title}</span>
        </div>
        {expanded ? (
          <Minimize2 className="w-4 h-4 text-purple-400" />
        ) : (
          <Maximize2 className="w-4 h-4 text-purple-400" />
        )}
      </button>

      {expanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* 步骤 */}
          <div>
            <p className="text-sm font-medium text-purple-600 mb-2">解题步骤：</p>
            <ol className="space-y-1">
              {method.steps.map((step, idx) => (
                <li
                  key={idx}
                  className="text-sm text-stone-600 flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* 适用场景 */}
          <div className="p-2 bg-white/50 rounded-lg">
            <p className="text-xs text-stone-500">
              <span className="font-medium">适用场景：</span>
              {method.applicability}
            </p>
          </div>

          {/* 示例 */}
          {method.example && (
            <div className="p-2 bg-white rounded-lg border border-purple-100">
              <p className="text-xs text-stone-500 mb-1">示例：</p>
              <p className="text-sm text-stone-600">{method.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PracticeHints({
  questionId,
  hints,
  quickReferences,
  methodCards,
  isEnabled = true,
  onToggleEnabled,
  onHintReveal,
  onKnowledgeClick,
  className,
}: PracticeHintsProps) {
  const [activeTab, setActiveTab] = useState<"hints" | "knowledge" | "methods">(
    "hints"
  );
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  // 模拟数据
  const mockHints: PracticeHint[] = hints || [
    {
      id: "1",
      type: "keyInfo",
      level: 1,
      title: "关键信息标注",
      content: "注意题目中「相向而行」说明两人运动方向相反，应使用速度之和。",
      isRevealed: revealedHints.has("1"),
    },
    {
      id: "2",
      type: "step",
      level: 1,
      title: "第一步：判断问题类型",
      content: "先判断是「相遇问题」还是「追及问题」，这决定了使用速度和还是速度差。",
      isRevealed: revealedHints.has("2"),
    },
    {
      id: "3",
      type: "thinking",
      level: 2,
      title: "解题思路引导",
      content:
        "设相遇时间为t，根据「两人走过的路程之和=总路程」列方程。",
      isRevealed: revealedHints.has("3"),
    },
    {
      id: "4",
      type: "formula",
      level: 3,
      title: "关键公式",
      content: "相遇时间 = 总路程 ÷ (甲速度 + 乙速度)",
      isRevealed: revealedHints.has("4"),
    },
  ];

  const mockReferences: QuickReference[] = quickReferences || [
    {
      id: 1,
      name: "行程问题基本公式",
      content: "路程、速度、时间三者之间的基本关系。",
      formula: "路程 = 速度 × 时间",
      tips: [
        "单位要统一（km/h配km，m/s配m）",
        "注意时间的换算（小时、分钟、秒）",
      ],
    },
    {
      id: 2,
      name: "相遇问题",
      content: "两物体相向运动，从出发到相遇的问题。",
      formula: "相遇时间 = 总路程 ÷ 速度和",
      tips: ["确认是否同时出发", "速度和 = 甲速 + 乙速"],
    },
  ];

  const mockMethods: MethodCard[] = methodCards || [
    {
      id: "1",
      title: "速度和法",
      steps: [
        "判断两者相向运动",
        "计算速度之和",
        "用总路程除以速度和得到相遇时间",
      ],
      applicability: "同时出发的相遇问题",
      example: "甲乙相距100km，甲速60km/h，乙速40km/h，相遇时间=100÷(60+40)=1h",
    },
    {
      id: "2",
      title: "比例法",
      steps: [
        "确定速度比",
        "由速度比推出时间比或路程比",
        "根据已知量求解未知量",
      ],
      applicability: "已知速度比的行程问题",
    },
  ];

  // 处理显示提示
  const handleReveal = useCallback(
    (hintId: string) => {
      setRevealedHints((prev) => new Set(prev).add(hintId));
      onHintReveal?.(hintId);
    },
    [onHintReveal]
  );

  // 按级别分组提示
  const groupedHints = mockHints.reduce((acc, hint) => {
    if (!acc[hint.level]) acc[hint.level] = [];
    acc[hint.level].push(hint);
    return acc;
  }, {} as Record<number, PracticeHint[]>);

  if (!isEnabled) {
    return (
      <div className={cn("p-4 bg-stone-50 rounded-xl border border-stone-200 text-center", className)}>
        <HelpCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm text-stone-500 mb-3">解题提示已关闭</p>
        <button
          onClick={() => onToggleEnabled?.(true)}
          className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
        >
          开启提示
        </button>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-xl border border-stone-200", className)}>
      {/* 头部 */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">AI 解题助手</h3>
            <p className="text-xs text-stone-500">渐进式提示，自主解题</p>
          </div>
        </div>
        <button
          onClick={() => onToggleEnabled?.(false)}
          className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1"
        >
          <EyeOff className="w-3.5 h-3.5" />
          关闭提示
        </button>
      </div>

      {/* 标签页 */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab("hints")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "hints"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          解题引导
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "knowledge"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          知识速查
        </button>
        <button
          onClick={() => setActiveTab("methods")}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === "methods"
              ? "text-amber-600 border-b-2 border-amber-500"
              : "text-stone-500 hover:text-stone-700"
          )}
        >
          方法技巧
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === "hints" && (
          <div className="space-y-4">
            {/* 使用说明 */}
            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
              <p className="font-medium mb-1">渐进式提示</p>
              <p className="text-xs">
                建议按顺序查看提示，先尝试基础提示，实在想不出再看高级提示。
              </p>
            </div>

            {/* 按级别展示提示 */}
            {[1, 2, 3].map(
              (level) =>
                groupedHints[level] && (
                  <div key={level}>
                    <h4 className="text-sm font-medium text-stone-500 mb-2">
                      Level {level} 提示
                    </h4>
                    <div className="space-y-2">
                      {groupedHints[level].map((hint) => (
                        <HintCard
                          key={hint.id}
                          hint={{
                            ...hint,
                            isRevealed: revealedHints.has(hint.id),
                          }}
                          onReveal={() => handleReveal(hint.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {activeTab === "knowledge" && (
          <div className="space-y-3">
            {mockReferences.map((ref) => (
              <QuickReferenceCard
                key={ref.id}
                reference={ref}
                onClick={() => onKnowledgeClick?.(ref.id)}
              />
            ))}
          </div>
        )}

        {activeTab === "methods" && (
          <div className="space-y-3">
            {mockMethods.map((method) => (
              <MethodTechCard key={method.id} method={method} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PracticeHints;
