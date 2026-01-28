"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Search, X, Clock, TrendingUp, Trash2 } from "lucide-react";
import { useDebounceFn } from "ahooks";

// 本地存储键
const SEARCH_HISTORY_KEY = "position_search_history";
const MAX_HISTORY_ITEMS = 10;

// 热门搜索词（可以通过 API 获取，这里先用静态数据）
const DEFAULT_HOT_SEARCHES = [
  "不限专业",
  "应届生",
  "计算机",
  "财务",
  "法学",
  "公务员",
  "事业单位",
  "选调生",
  "北京",
  "上海",
];

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  // 新增属性
  showHistory?: boolean;
  showHotSearch?: boolean;
  showSuggestions?: boolean;
  hotSearches?: string[];
  suggestions?: string[];
  onSuggestionsFetch?: (keyword: string) => void;
  storageKey?: string;
}

// 从本地存储获取搜索历史
function getSearchHistory(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 保存搜索历史到本地存储
function saveSearchHistory(key: string, history: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
  } catch {
    // Ignore storage errors
  }
}

export default function SearchInput({
  placeholder = "搜索职位、单位、专业...",
  value: propValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className = "",
  showHistory = true,
  showHotSearch = true,
  showSuggestions = true,
  hotSearches = DEFAULT_HOT_SEARCHES,
  suggestions = [],
  onSuggestionsFetch,
  storageKey = SEARCH_HISTORY_KEY,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(propValue || "");
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const value = propValue !== undefined ? propValue : localValue;

  // 初始化搜索历史
  useEffect(() => {
    setSearchHistory(getSearchHistory(storageKey));
  }, [storageKey]);

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { run: debouncedSearch } = useDebounceFn(
    (val: string) => {
      if (showSuggestions && onSuggestionsFetch && val.trim()) {
        onSuggestionsFetch(val);
      }
    },
    { wait: debounceMs }
  );

  // 添加到搜索历史
  const addToHistory = useCallback(
    (keyword: string) => {
      if (!keyword.trim() || !showHistory) return;
      
      const trimmed = keyword.trim();
      const newHistory = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      setSearchHistory(newHistory);
      saveSearchHistory(storageKey, newHistory);
    },
    [searchHistory, showHistory, storageKey]
  );

  // 清除搜索历史
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory(storageKey, []);
  }, [storageKey]);

  // 删除单条历史
  const removeFromHistory = useCallback(
    (keyword: string) => {
      const newHistory = searchHistory.filter((h) => h !== keyword);
      setSearchHistory(newHistory);
      saveSearchHistory(storageKey, newHistory);
    },
    [searchHistory, storageKey]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange?.(newValue);
      debouncedSearch(newValue);
    },
    [onChange, debouncedSearch]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange?.("");
    onSearch?.("");
    inputRef.current?.focus();
  }, [onChange, onSearch]);

  const handleSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (trimmed) {
        setLocalValue(trimmed);
        onChange?.(trimmed);
        onSearch?.(trimmed);
        addToHistory(trimmed);
      }
      setIsFocused(false);
    },
    [onChange, onSearch, addToHistory]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(value);
      } else if (e.key === "Escape") {
        setIsFocused(false);
      }
    },
    [handleSearch, value]
  );

  // 是否显示下拉框
  const showDropdown = useMemo(() => {
    if (!isFocused) return false;
    
    // 如果有输入内容且有建议，显示建议
    if (value.trim() && suggestions.length > 0) return true;
    
    // 如果没有输入内容，显示历史或热门
    if (!value.trim() && (searchHistory.length > 0 || hotSearches.length > 0)) return true;
    
    return false;
  }, [isFocused, value, suggestions, searchHistory, hotSearches]);

  // 过滤后的热门搜索（排除已搜索的）
  const filteredHotSearches = useMemo(() => {
    if (!showHotSearch) return [];
    return hotSearches.filter((h) => !searchHistory.includes(h)).slice(0, 8);
  }, [hotSearches, searchHistory, showHotSearch]);

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-stone-400" />
          </button>
        )}
      </div>

      {/* 下拉框 */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in"
        >
          {/* 搜索建议（有输入时显示） */}
          {value.trim() && suggestions.length > 0 && showSuggestions && (
            <div className="p-2">
              <div className="text-xs text-stone-500 px-2 mb-1">搜索建议</div>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span
                    dangerouslySetInnerHTML={{
                      __html: suggestion.replace(
                        new RegExp(`(${value})`, "gi"),
                        '<span class="text-amber-600 font-medium">$1</span>'
                      ),
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* 搜索历史（无输入时显示） */}
          {!value.trim() && showHistory && searchHistory.length > 0 && (
            <div className="p-2 border-b border-stone-100">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  搜索历史
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory();
                  }}
                  className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  清除
                </button>
              </div>
              <div className="flex flex-wrap gap-2 px-2 py-1">
                {searchHistory.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="group relative inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-stone-600 cursor-pointer transition-colors"
                    onClick={() => handleSearch(keyword)}
                  >
                    <Clock className="w-3 h-3 text-stone-400" />
                    {keyword}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(keyword);
                      }}
                      className="ml-1 p-0.5 hover:bg-stone-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 热门搜索（无输入时显示） */}
          {!value.trim() && showHotSearch && filteredHotSearches.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-stone-500 px-2 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                热门搜索
              </div>
              <div className="flex flex-wrap gap-2 px-2 py-1">
                {filteredHotSearches.map((keyword, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(keyword)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      idx < 3
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {idx < 3 && <TrendingUp className="w-3 h-3 inline mr-1" />}
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 无内容提示 */}
          {!value.trim() && searchHistory.length === 0 && filteredHotSearches.length === 0 && (
            <div className="p-4 text-center text-sm text-stone-500">
              暂无搜索历史
            </div>
          )}
        </div>
      )}
    </div>
  );
}
