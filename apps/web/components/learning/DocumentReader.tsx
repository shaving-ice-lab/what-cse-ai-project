"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  List,
  FileText,
  Highlighter,
  StickyNote,
  Bookmark,
  BookOpen,
  Minimize2,
  Maximize2,
  RotateCcw,
  Download,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

// 文档大纲项
interface OutlineItem {
  id: string;
  title: string;
  level: number;
  page?: number;
  children?: OutlineItem[];
}

// 高亮标注
interface Highlight {
  id: string;
  text: string;
  color: string;
  pageIndex?: number;
  position?: { x: number; y: number; width: number; height: number };
  note?: string;
  createdAt: Date;
}

// 阅读书签
interface ReadingBookmark {
  id: string;
  pageIndex: number;
  title?: string;
  createdAt: Date;
}

interface DocumentReaderProps {
  type: "pdf" | "markdown" | "html";
  content: string; // PDF URL 或 Markdown/HTML 内容
  title?: string;
  outline?: OutlineItem[];
  initialPage?: number;
  totalPages?: number;
  highlights?: Highlight[];
  bookmarks?: ReadingBookmark[];
  readingProgress?: number;
  onPageChange?: (page: number) => void;
  onProgressUpdate?: (progress: number) => void;
  onHighlightAdd?: (highlight: Omit<Highlight, "id" | "createdAt">) => void;
  onHighlightRemove?: (id: string) => void;
  onBookmarkAdd?: (bookmark: Omit<ReadingBookmark, "id" | "createdAt">) => void;
  onNoteAdd?: (note: { highlightId: string; content: string }) => void;
  className?: string;
}

// 高亮颜色
const HIGHLIGHT_COLORS = [
  { name: "黄色", value: "#fef08a" },
  { name: "绿色", value: "#bbf7d0" },
  { name: "蓝色", value: "#bfdbfe" },
  { name: "粉色", value: "#fbcfe8" },
  { name: "紫色", value: "#e9d5ff" },
];

export function DocumentReader({
  type,
  content,
  title,
  outline = [],
  initialPage = 1,
  totalPages = 1,
  highlights = [],
  bookmarks = [],
  readingProgress = 0,
  onPageChange,
  onProgressUpdate,
  onHighlightAdd,
  onHighlightRemove,
  onBookmarkAdd,
  onNoteAdd,
  className,
}: DocumentReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 状态
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [scale, setScale] = useState(1);
  const [showOutline, setShowOutline] = useState(true);
  const [showHighlightPanel, setShowHighlightPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [selectedText, setSelectedText] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(null);

  // 页面切换
  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(totalPages, page));
      setCurrentPage(newPage);
      onPageChange?.(newPage);

      // 更新进度
      const progress = (newPage / totalPages) * 100;
      onProgressUpdate?.(progress);
    },
    [totalPages, onPageChange, onProgressUpdate]
  );

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(2, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.5, prev - 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 文本选择高亮
  const handleTextSelection = useCallback(() => {
    if (!isHighlightMode) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (text) {
      setSelectedText(text);
      setShowColorPicker(true);
    }
  }, [isHighlightMode]);

  // 添加高亮
  const handleAddHighlight = useCallback(() => {
    if (!selectedText) return;

    onHighlightAdd?.({
      text: selectedText,
      color: selectedColor,
      pageIndex: currentPage,
    });

    setSelectedText("");
    setShowColorPicker(false);
    window.getSelection()?.removeAllRanges();
  }, [selectedText, selectedColor, currentPage, onHighlightAdd]);

  // 添加书签
  const handleAddBookmark = useCallback(() => {
    onBookmarkAdd?.({
      pageIndex: currentPage,
      title: `第 ${currentPage} 页`,
    });
  }, [currentPage, onBookmarkAdd]);

  // 添加笔记
  const handleAddNote = useCallback(() => {
    if (!editingHighlightId || !noteInput.trim()) return;

    onNoteAdd?.({
      highlightId: editingHighlightId,
      content: noteInput.trim(),
    });

    setNoteInput("");
    setEditingHighlightId(null);
  }, [editingHighlightId, noteInput, onNoteAdd]);

  // 跳转到大纲项
  const goToOutlineItem = useCallback(
    (item: OutlineItem) => {
      if (item.page) {
        goToPage(item.page);
      }
    },
    [goToPage]
  );

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          goToPage(currentPage - 1);
          break;
        case "ArrowRight":
          goToPage(currentPage + 1);
          break;
        case "+":
        case "=":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case "-":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case "0":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomReset();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, goToPage, handleZoomIn, handleZoomOut, handleZoomReset]);

  // 监听文本选择
  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  // 渲染大纲树
  const renderOutlineTree = (items: OutlineItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <button
          onClick={() => goToOutlineItem(item)}
          className={cn(
            "w-full text-left py-2 px-3 text-sm hover:bg-stone-100 rounded-lg transition-colors",
            item.page === currentPage && "bg-amber-50 text-amber-700"
          )}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <span className="line-clamp-1">{item.title}</span>
          {item.page && (
            <span className="text-xs text-stone-400 ml-2">P.{item.page}</span>
          )}
        </button>
        {item.children && renderOutlineTree(item.children, level + 1)}
      </div>
    ));
  };

  // 渲染 Markdown/HTML 内容
  const renderContent = () => {
    if (type === "pdf") {
      return (
        <iframe
          src={`${content}#page=${currentPage}`}
          className="w-full h-full border-0"
          style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        />
      );
    }

    return (
      <div
        className="prose prose-stone max-w-none p-8"
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
        dangerouslySetInnerHTML={{
          __html: type === "html" ? content : content,
        }}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex bg-stone-50 rounded-xl overflow-hidden border border-stone-200",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* 左侧大纲 */}
      {showOutline && (outline.length > 0 || bookmarks.length > 0 || highlights.length > 0) && (
        <div className="w-64 border-r border-stone-200 bg-white flex flex-col flex-shrink-0">
          {/* 标签页 */}
          <div className="flex border-b border-stone-200">
            <button
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                !showHighlightPanel
                  ? "text-amber-600 border-b-2 border-amber-500"
                  : "text-stone-500 hover:text-stone-700"
              )}
              onClick={() => setShowHighlightPanel(false)}
            >
              <List className="w-4 h-4 inline mr-1.5" />
              大纲
            </button>
            <button
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors",
                showHighlightPanel
                  ? "text-amber-600 border-b-2 border-amber-500"
                  : "text-stone-500 hover:text-stone-700"
              )}
              onClick={() => setShowHighlightPanel(true)}
            >
              <Highlighter className="w-4 h-4 inline mr-1.5" />
              标注
            </button>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto p-2">
            {!showHighlightPanel ? (
              <>
                {/* 大纲 */}
                {outline.length > 0 && (
                  <div className="mb-4">
                    <h4 className="px-3 py-2 text-xs font-semibold text-stone-400 uppercase">
                      目录
                    </h4>
                    {renderOutlineTree(outline)}
                  </div>
                )}

                {/* 书签 */}
                {bookmarks.length > 0 && (
                  <div>
                    <h4 className="px-3 py-2 text-xs font-semibold text-stone-400 uppercase">
                      书签
                    </h4>
                    {bookmarks.map((bookmark) => (
                      <button
                        key={bookmark.id}
                        onClick={() => goToPage(bookmark.pageIndex)}
                        className={cn(
                          "w-full text-left py-2 px-3 text-sm hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2",
                          bookmark.pageIndex === currentPage && "bg-amber-50 text-amber-700"
                        )}
                      >
                        <Bookmark className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="flex-1 truncate">
                          {bookmark.title || `第 ${bookmark.pageIndex} 页`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 高亮列表 */}
                {highlights.length > 0 ? (
                  <div className="space-y-2">
                    {highlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="p-3 bg-stone-50 rounded-lg group"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: highlight.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-700 line-clamp-2">
                              {highlight.text}
                            </p>
                            {highlight.note && (
                              <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                                📝 {highlight.note}
                              </p>
                            )}
                            <p className="text-xs text-stone-400 mt-1">
                              {highlight.pageIndex && `第 ${highlight.pageIndex} 页`}
                            </p>
                          </div>
                          <button
                            onClick={() => onHighlightRemove?.(highlight.id)}
                            className="p-1 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {/* 添加笔记 */}
                        {editingHighlightId === highlight.id ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="添加笔记..."
                              className="flex-1 px-2 py-1 text-xs border rounded"
                              autoFocus
                            />
                            <button
                              onClick={handleAddNote}
                              className="px-2 py-1 text-xs bg-amber-500 text-white rounded hover:bg-amber-600"
                            >
                              保存
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingHighlightId(highlight.id)}
                            className="mt-2 text-xs text-amber-600 hover:text-amber-700"
                          >
                            <StickyNote className="w-3 h-3 inline mr-1" />
                            添加笔记
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-stone-400">
                    <Highlighter className="w-8 h-8 mb-2" />
                    <p className="text-sm">暂无标注</p>
                    <p className="text-xs mt-1">开启高亮模式后选中文字</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            {/* 大纲开关 */}
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showOutline
                  ? "bg-amber-100 text-amber-600"
                  : "hover:bg-stone-100 text-stone-500"
              )}
              title="显示/隐藏大纲"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* 高亮模式 */}
            {onHighlightAdd && (
              <button
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isHighlightMode
                    ? "bg-amber-100 text-amber-600"
                    : "hover:bg-stone-100 text-stone-500"
                )}
                title="高亮模式"
              >
                <Highlighter className="w-5 h-5" />
              </button>
            )}

            {/* 添加书签 */}
            {onBookmarkAdd && (
              <button
                onClick={handleAddBookmark}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
                title="添加书签"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 标题 */}
          {title && (
            <h3 className="text-sm font-medium text-stone-700 truncate px-4">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-2">
            {/* 缩放控制 */}
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-white text-stone-600 transition-colors"
                title="缩小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-stone-600 min-w-[48px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-white text-stone-600 transition-colors"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1.5 rounded hover:bg-white text-stone-600 transition-colors"
                title="重置缩放"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 文档内容 */}
        <div
          ref={contentRef}
          className="flex-1 overflow-auto bg-stone-100"
        >
          <div className="min-h-full flex justify-center p-4">
            <div className="bg-white shadow-lg max-w-4xl w-full">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* 底部页码控制 */}
        {type === "pdf" && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-3 border-t border-stone-200 bg-white">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                min={1}
                max={totalPages}
              />
              <span className="text-sm text-stone-500">/ {totalPages}</span>
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 进度条 */}
            <div className="w-32 h-1.5 bg-stone-200 rounded-full overflow-hidden ml-4">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 颜色选择器浮窗 */}
      {showColorPicker && selectedText && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-4 z-50 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-stone-800">添加高亮</h4>
            <button
              onClick={() => {
                setShowColorPicker(false);
                setSelectedText("");
              }}
              className="p-1 hover:bg-stone-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-stone-600 mb-3 line-clamp-2 bg-stone-50 p-2 rounded">
            "{selectedText}"
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-stone-500">选择颜色：</span>
            <div className="flex gap-1">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    selectedColor === color.value
                      ? "border-stone-800 scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleAddHighlight}
            className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            添加高亮
          </button>
        </div>
      )}
    </div>
  );
}

export default DocumentReader;
