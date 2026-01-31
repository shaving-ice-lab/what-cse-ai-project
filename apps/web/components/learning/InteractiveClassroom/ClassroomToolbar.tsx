"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelLeft,
  StickyNote,
  Bookmark,
  BookmarkCheck,
  Settings,
  ChevronDown,
  Type,
  Moon,
  Sun,
  Share2,
  Download,
  HelpCircle,
  X,
  Keyboard,
} from "lucide-react";
import { useClassroom } from "./ClassroomContext";
import { cn } from "@/lib/utils";

// =====================================================
// 工具栏组件
// =====================================================

interface ClassroomToolbarProps {
  onShare?: () => void;
  onDownload?: () => void;
}

export function ClassroomToolbar({
  onShare,
  onDownload,
}: ClassroomToolbarProps) {
  const {
    currentSection,
    progress,
    isFullscreen,
    isSidebarOpen,
    showNotes,
    fontSize,
    toggleFullscreen,
    toggleSidebar,
    toggleNotes,
    toggleBookmark,
    setFontSize,
  } = useClassroom();

  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const isBookmarked = currentSection
    ? progress.bookmarks.includes(currentSection.id)
    : false;

  const fontSizeLabels = {
    small: "小",
    medium: "中",
    large: "大",
  };

  return (
    <div className="flex items-center gap-2">
      {/* 侧边栏切换 */}
      <ToolbarButton
        onClick={toggleSidebar}
        tooltip={isSidebarOpen ? "收起大纲" : "展开大纲"}
        active={isSidebarOpen}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="w-4.5 h-4.5" />
        ) : (
          <PanelLeft className="w-4.5 h-4.5" />
        )}
      </ToolbarButton>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-stone-200 mx-1" />

      {/* 笔记 */}
      <ToolbarButton
        onClick={toggleNotes}
        tooltip="笔记"
        active={showNotes}
      >
        <StickyNote className="w-4.5 h-4.5" />
      </ToolbarButton>

      {/* 书签 */}
      <ToolbarButton
        onClick={() => currentSection && toggleBookmark(currentSection.id)}
        tooltip={isBookmarked ? "取消书签" : "添加书签"}
        active={isBookmarked}
        disabled={!currentSection}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-4.5 h-4.5" />
        ) : (
          <Bookmark className="w-4.5 h-4.5" />
        )}
      </ToolbarButton>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-stone-200 mx-1" />

      {/* 设置菜单 */}
      <div className="relative">
        <ToolbarButton
          onClick={() => setShowSettings(!showSettings)}
          tooltip="设置"
          active={showSettings}
        >
          <Settings className="w-4.5 h-4.5" />
        </ToolbarButton>

        <AnimatePresence>
          {showSettings && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowSettings(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-stone-100">
                  <h4 className="text-sm font-semibold text-stone-800">显示设置</h4>
                </div>

                {/* 字体大小 */}
                <div className="p-3 border-b border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-stone-600 flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      字体大小
                    </span>
                    <span className="text-xs text-stone-400">
                      {fontSizeLabels[fontSize]}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(["small", "medium", "large"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                          fontSize === size
                            ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
                            : "bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200"
                        )}
                      >
                        {fontSizeLabels[size]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 其他操作 */}
                <div className="p-2">
                  {onShare && (
                    <button
                      onClick={() => {
                        onShare();
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      分享课程
                    </button>
                  )}
                  {onDownload && (
                    <button
                      onClick={() => {
                        onDownload();
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下载笔记
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowShortcuts(true);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    <Keyboard className="w-4 h-4" />
                    快捷键
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 全屏 */}
      <ToolbarButton
        onClick={toggleFullscreen}
        tooltip={isFullscreen ? "退出全屏" : "全屏模式"}
      >
        {isFullscreen ? (
          <Minimize className="w-4.5 h-4.5" />
        ) : (
          <Maximize className="w-4.5 h-4.5" />
        )}
      </ToolbarButton>

      {/* 快捷键帮助弹窗 */}
      <AnimatePresence>
        {showShortcuts && (
          <ShortcutsModal onClose={() => setShowShortcuts(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// 工具按钮组件
// =====================================================

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  tooltip?: string;
  active?: boolean;
  disabled?: boolean;
}

function ToolbarButton({
  children,
  onClick,
  tooltip,
  active,
  disabled,
}: ToolbarButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-2.5 rounded-xl transition-all group",
        active
          ? "bg-amber-100 text-amber-700"
          : disabled
          ? "text-stone-300 cursor-not-allowed"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
      )}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {children}

      {/* Tooltip */}
      {tooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-stone-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-800" />
        </div>
      )}
    </motion.button>
  );
}

// =====================================================
// 快捷键帮助弹窗
// =====================================================

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { keys: ["←", "→"], description: "切换上/下一章节" },
    { keys: ["Ctrl", "S"], description: "收起/展开侧边栏" },
    { keys: ["Ctrl", "F"], description: "切换全屏模式" },
    { keys: ["Space"], description: "标记当前章节完成" },
    { keys: ["B"], description: "添加/移除书签" },
    { keys: ["N"], description: "打开/关闭笔记" },
    { keys: ["Esc"], description: "关闭弹窗/退出全屏" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-amber-500" />
              键盘快捷键
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {shortcuts.map((shortcut, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg"
              >
                <span className="text-sm text-stone-600">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIdx) => (
                    <React.Fragment key={keyIdx}>
                      <kbd className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono text-stone-700 shadow-sm">
                        {key}
                      </kbd>
                      {keyIdx < shortcut.keys.length - 1 && (
                        <span className="text-stone-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-stone-200 bg-stone-50">
            <p className="text-xs text-stone-500 text-center">
              按 <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-xs">Esc</kbd> 关闭此窗口
            </p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default ClassroomToolbar;
