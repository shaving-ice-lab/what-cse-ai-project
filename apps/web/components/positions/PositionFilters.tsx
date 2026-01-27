"use client";

import { useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Bookmark,
  SlidersHorizontal,
  MapPin,
  GraduationCap,
  BookOpen,
  User,
  Briefcase,
  Calendar,
  Users,
  Trophy,
  Building2,
} from "lucide-react";
import { provinces } from "@/utils/region";
import { majorCategories } from "@/utils/major";

export interface FilterValues {
  examType: string[];
  province: string[];
  city: string[];
  departmentLevel: string[];
  educationMin: string[];
  majorCategory: string[];
  politicalStatus: string[];
  workExpYearsMin: string[];
  ageRange: [number, number];
  recruitCountMin: number | null;
  competitionRatioMax: number | null;
  genderRequired: string[];
}

interface PositionFiltersProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset: () => void;
  onSave?: () => void;
  resultCount?: number;
}

const examTypeOptions = [
  { value: "国考", label: "国考", icon: "🏛️" },
  { value: "省考", label: "省考", icon: "🏢" },
  { value: "事业单位", label: "事业单位", icon: "🏫" },
  { value: "选调生", label: "选调生", icon: "🎓" },
];

const departmentLevelOptions = [
  { value: "中央", label: "中央", desc: "部委级" },
  { value: "省级", label: "省级", desc: "厅局级" },
  { value: "市级", label: "市级", desc: "处科级" },
  { value: "县级", label: "县级", desc: "科级" },
  { value: "乡镇", label: "乡镇", desc: "基层" },
];

const educationOptions = [
  { value: "不限", label: "不限学历" },
  { value: "大专及以上", label: "大专及以上" },
  { value: "本科及以上", label: "本科及以上" },
  { value: "硕士及以上", label: "硕士及以上" },
  { value: "博士", label: "博士" },
];

const politicalStatusOptions = [
  { value: "不限", label: "不限" },
  { value: "中共党员", label: "中共党员" },
  { value: "共青团员", label: "共青团员" },
  { value: "群众", label: "群众" },
];

const workExpOptions = [
  { value: "0", label: "应届生/不限" },
  { value: "1", label: "1年及以上" },
  { value: "2", label: "2年及以上" },
  { value: "3", label: "3年及以上" },
  { value: "5", label: "5年及以上" },
];

const genderOptions = [
  { value: "不限", label: "不限" },
  { value: "男", label: "限男性" },
  { value: "女", label: "限女性" },
];

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hasValue?: boolean;
}

function FilterSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
  hasValue,
}: FilterSectionProps) {
  return (
    <div className="border-b border-stone-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3.5 px-4 hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-stone-400">{icon}</span>
          <span className="font-medium text-stone-700">{title}</span>
          {hasValue && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-ring" />}
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      {expanded && <div className="px-4 pb-4 animate-fade-in">{children}</div>}
    </div>
  );
}

interface MultiSelectProps {
  options: { value: string; label: string; desc?: string; icon?: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: number;
}

function MultiSelect({ options, values, onChange, columns = 4 }: MultiSelectProps) {
  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div
      className={`grid gap-2 grid-cols-${columns}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleValue(option.value)}
          className={`relative px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            values.includes(option.value)
              ? "bg-amber-500 text-white shadow-amber-md ring-2 ring-amber-500/30"
              : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/50"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            {option.icon && <span>{option.icon}</span>}
            <span>{option.label}</span>
          </div>
          {option.desc && (
            <span
              className={`text-xs mt-0.5 block ${
                values.includes(option.value) ? "text-amber-100" : "text-stone-400"
              }`}
            >
              {option.desc}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  suffix?: string;
}

function RangeSlider({ min, max, value, onChange, step = 1, suffix = "" }: RangeSliderProps) {
  const percentage = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-semibold text-amber-600">
          {value[0]}
          {suffix}
        </span>
        <span className="text-stone-400">-</span>
        <span className="font-display font-semibold text-amber-600">
          {value[1]}
          {suffix}
        </span>
      </div>
      <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="absolute h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
          className="flex-1 accent-amber-500"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
          className="flex-1 accent-amber-500"
        />
      </div>
    </div>
  );
}

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  suffix?: string;
}

function NumberInput({ value, onChange, placeholder, suffix }: NumberInputProps) {
  return (
    <div className="relative">
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 pr-12 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

export default function PositionFilters({
  values,
  onChange,
  onReset,
  onSave,
  resultCount,
}: PositionFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["examType", "region"]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  }, []);

  const updateFilter = useCallback(
    <K extends keyof FilterValues>(key: K, value: FilterValues[K]) => {
      onChange({ ...values, [key]: value });
    },
    [values, onChange]
  );

  const hasAnyFilter = () => {
    return (
      values.examType.length > 0 ||
      values.province.length > 0 ||
      values.city.length > 0 ||
      values.departmentLevel.length > 0 ||
      values.educationMin.length > 0 ||
      values.majorCategory.length > 0 ||
      values.politicalStatus.length > 0 ||
      values.workExpYearsMin.length > 0 ||
      values.ageRange[0] !== 18 ||
      values.ageRange[1] !== 35 ||
      values.recruitCountMin !== null ||
      values.competitionRatioMax !== null ||
      values.genderRequired.length > 0
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/50 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-amber-md">
            <SlidersHorizontal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-800">高级筛选</h3>
            <p className="text-xs text-stone-500">精准定位您的目标职位</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>保存</span>
            </button>
          )}
          {hasAnyFilter() && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
        {/* 考试类型 */}
        <FilterSection
          title="考试类型"
          icon={<Trophy className="w-4 h-4" />}
          expanded={expandedSections.includes("examType")}
          onToggle={() => toggleSection("examType")}
          hasValue={values.examType.length > 0}
        >
          <MultiSelect
            options={examTypeOptions}
            values={values.examType}
            onChange={(v) => updateFilter("examType", v)}
            columns={4}
          />
        </FilterSection>

        {/* 地区筛选 */}
        <FilterSection
          title="工作地区"
          icon={<MapPin className="w-4 h-4" />}
          expanded={expandedSections.includes("region")}
          onToggle={() => toggleSection("region")}
          hasValue={values.province.length > 0}
        >
          <div className="space-y-3">
            <div className="text-xs text-stone-500 mb-2">选择省份（可多选）</div>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {provinces.map((province) => (
                <button
                  key={province.code}
                  onClick={() =>
                    updateFilter(
                      "province",
                      values.province.includes(province.name)
                        ? values.province.filter((p) => p !== province.name)
                        : [...values.province, province.name]
                    )
                  }
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    values.province.includes(province.name)
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/50"
                  }`}
                >
                  {province.name.replace(/省|市|自治区|壮族|维吾尔|回族/g, "")}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* 部门层级 */}
        <FilterSection
          title="部门层级"
          icon={<Building2 className="w-4 h-4" />}
          expanded={expandedSections.includes("departmentLevel")}
          onToggle={() => toggleSection("departmentLevel")}
          hasValue={values.departmentLevel.length > 0}
        >
          <MultiSelect
            options={departmentLevelOptions}
            values={values.departmentLevel}
            onChange={(v) => updateFilter("departmentLevel", v)}
            columns={5}
          />
        </FilterSection>

        {/* 学历要求 */}
        <FilterSection
          title="学历要求"
          icon={<GraduationCap className="w-4 h-4" />}
          expanded={expandedSections.includes("education")}
          onToggle={() => toggleSection("education")}
          hasValue={values.educationMin.length > 0}
        >
          <MultiSelect
            options={educationOptions}
            values={values.educationMin}
            onChange={(v) => updateFilter("educationMin", v)}
            columns={5}
          />
        </FilterSection>

        {/* 专业类别 */}
        <FilterSection
          title="专业类别"
          icon={<BookOpen className="w-4 h-4" />}
          expanded={expandedSections.includes("major")}
          onToggle={() => toggleSection("major")}
          hasValue={values.majorCategory.length > 0}
        >
          <div className="grid grid-cols-4 gap-2">
            {majorCategories.map((category) => (
              <button
                key={category.code}
                onClick={() =>
                  updateFilter(
                    "majorCategory",
                    values.majorCategory.includes(category.name)
                      ? values.majorCategory.filter((m) => m !== category.name)
                      : [...values.majorCategory, category.name]
                  )
                }
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  values.majorCategory.includes(category.name)
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* 政治面貌 */}
        <FilterSection
          title="政治面貌"
          icon={<User className="w-4 h-4" />}
          expanded={expandedSections.includes("political")}
          onToggle={() => toggleSection("political")}
          hasValue={values.politicalStatus.length > 0}
        >
          <MultiSelect
            options={politicalStatusOptions}
            values={values.politicalStatus}
            onChange={(v) => updateFilter("politicalStatus", v)}
            columns={4}
          />
        </FilterSection>

        {/* 工作经验 */}
        <FilterSection
          title="工作经验"
          icon={<Briefcase className="w-4 h-4" />}
          expanded={expandedSections.includes("workExp")}
          onToggle={() => toggleSection("workExp")}
          hasValue={values.workExpYearsMin.length > 0}
        >
          <MultiSelect
            options={workExpOptions}
            values={values.workExpYearsMin}
            onChange={(v) => updateFilter("workExpYearsMin", v)}
            columns={5}
          />
        </FilterSection>

        {/* 年龄范围 */}
        <FilterSection
          title="年龄范围"
          icon={<Calendar className="w-4 h-4" />}
          expanded={expandedSections.includes("age")}
          onToggle={() => toggleSection("age")}
          hasValue={values.ageRange[0] !== 18 || values.ageRange[1] !== 35}
        >
          <RangeSlider
            min={18}
            max={50}
            value={values.ageRange}
            onChange={(v) => updateFilter("ageRange", v)}
            suffix="岁"
          />
        </FilterSection>

        {/* 其他条件 */}
        <FilterSection
          title="其他条件"
          icon={<Users className="w-4 h-4" />}
          expanded={expandedSections.includes("other")}
          onToggle={() => toggleSection("other")}
          hasValue={
            values.recruitCountMin !== null ||
            values.competitionRatioMax !== null ||
            values.genderRequired.length > 0
          }
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-stone-600 mb-2 block">招录人数（最少）</label>
              <NumberInput
                value={values.recruitCountMin}
                onChange={(v) => updateFilter("recruitCountMin", v)}
                placeholder="不限"
                suffix="人"
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 mb-2 block">竞争比（最大）</label>
              <NumberInput
                value={values.competitionRatioMax}
                onChange={(v) => updateFilter("competitionRatioMax", v)}
                placeholder="不限"
                suffix=":1"
              />
            </div>
            <div>
              <label className="text-sm text-stone-600 mb-2 block">性别要求</label>
              <MultiSelect
                options={genderOptions}
                values={values.genderRequired}
                onChange={(v) => updateFilter("genderRequired", v)}
                columns={3}
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      {resultCount !== undefined && (
        <div className="px-5 py-4 border-t border-stone-100 bg-gradient-to-r from-amber-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">
              共找到{" "}
              <span className="font-display font-bold text-amber-600 text-lg">{resultCount}</span>{" "}
              个职位
            </span>
            <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-amber-md btn-shine">
              应用筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
