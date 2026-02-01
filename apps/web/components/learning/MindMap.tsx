"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Search,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Move,
  Focus,
  X,
} from "lucide-react";

// 节点数据
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  color?: string;
  icon?: string;
  note?: string;
  link?: string;
  collapsed?: boolean;
}

// 节点位置
interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MindMapProps {
  data: MindMapNode;
  title?: string;
  onNodeClick?: (node: MindMapNode) => void;
  onExport?: (format: "png" | "svg") => void;
  className?: string;
}

// 节点颜色
const NODE_COLORS = [
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
];

// 获取层级颜色
function getNodeColor(level: number, customColor?: string): string {
  if (customColor) return customColor;
  return NODE_COLORS[level % NODE_COLORS.length];
}

// 单个节点组件
interface MindMapNodeComponentProps {
  node: MindMapNode;
  level: number;
  isRoot?: boolean;
  parentPosition?: { x: number; y: number };
  searchQuery?: string;
  highlightedNodeId?: string | null;
  collapsedNodes: Set<string>;
  onToggleCollapse: (nodeId: string) => void;
  onNodeClick?: (node: MindMapNode) => void;
  onNodePositionUpdate?: (nodeId: string, position: NodePosition) => void;
}

function MindMapNodeComponent({
  node,
  level,
  isRoot = false,
  parentPosition,
  searchQuery,
  highlightedNodeId,
  collapsedNodes,
  onToggleCollapse,
  onNodeClick,
  onNodePositionUpdate,
}: MindMapNodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsedNodes.has(node.id);
  const isHighlighted = highlightedNodeId === node.id;
  const isSearchMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

  const color = getNodeColor(level, node.color);

  // 更新节点位置
  useEffect(() => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      onNodePositionUpdate?.(node.id, {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [node.id, onNodePositionUpdate]);

  // 根节点样式
  if (isRoot) {
    return (
      <div className="flex items-center">
        <div
          ref={nodeRef}
          className={cn(
            "relative flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg cursor-pointer transition-all",
            isHighlighted && "ring-4 ring-amber-300",
            isSearchMatch && "ring-2 ring-yellow-400"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onNodeClick?.(node)}
        >
          {node.icon && <span className="text-xl">{node.icon}</span>}
          <span className="text-lg">{node.label}</span>
          {node.note && (
            <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">📝</span>
          )}
        </div>

        {hasChildren && (
          <div className="flex flex-col gap-2 ml-8">
            {!isCollapsed &&
              node.children?.map((child) => (
                <MindMapNodeComponent
                  key={child.id}
                  node={child}
                  level={level + 1}
                  parentPosition={parentPosition}
                  searchQuery={searchQuery}
                  highlightedNodeId={highlightedNodeId}
                  collapsedNodes={collapsedNodes}
                  onToggleCollapse={onToggleCollapse}
                  onNodeClick={onNodeClick}
                  onNodePositionUpdate={onNodePositionUpdate}
                />
              ))}
          </div>
        )}
      </div>
    );
  }

  // 子节点样式
  return (
    <div className="flex items-start">
      {/* 连接线 */}
      <div className="flex items-center">
        <div className="w-6 h-0.5" style={{ backgroundColor: color }} />
      </div>

      <div className="flex flex-col">
        <div
          ref={nodeRef}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
            isHighlighted && "ring-4 ring-amber-300 shadow-lg",
            isSearchMatch && "ring-2 ring-yellow-400 bg-yellow-50"
          )}
          style={{
            borderColor: color,
            backgroundColor: `${color}10`,
          }}
          onClick={() => onNodeClick?.(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(node.id);
              }}
              className="p-0.5 rounded hover:bg-white/50 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" style={{ color }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color }} />
              )}
            </button>
          )}
          {node.icon && <span>{node.icon}</span>}
          <span className="font-medium" style={{ color: level <= 2 ? color : "#44403c" }}>
            {node.label}
          </span>
          {node.note && (
            <span className="text-xs" title={node.note}>
              📝
            </span>
          )}
          {node.link && (
            <a
              href={node.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              🔗
            </a>
          )}
        </div>

        {/* 子节点 */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col gap-1.5 ml-4 mt-1.5">
            {node.children?.map((child) => (
              <MindMapNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
                parentPosition={parentPosition}
                searchQuery={searchQuery}
                highlightedNodeId={highlightedNodeId}
                collapsedNodes={collapsedNodes}
                onToggleCollapse={onToggleCollapse}
                onNodeClick={onNodeClick}
                onNodePositionUpdate={onNodePositionUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MindMap({ data, title, onNodeClick, onExport, className }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 状态
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<MindMapNode[]>([]);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(new Map());

  // 搜索节点
  const searchNodes = useCallback((node: MindMapNode, query: string): MindMapNode[] => {
    const results: MindMapNode[] = [];

    if (node.label.toLowerCase().includes(query.toLowerCase())) {
      results.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        results.push(...searchNodes(child, query));
      }
    }

    return results;
  }, []);

  // 执行搜索
  useEffect(() => {
    if (searchQuery) {
      const results = searchNodes(data, searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        setHighlightedNodeId(results[0].id);
        // 展开所有父节点以显示搜索结果
        // 这里简化处理，清除所有折叠状态
        setCollapsedNodes(new Set());
      }
    } else {
      setSearchResults([]);
      setHighlightedNodeId(null);
    }
  }, [searchQuery, data, searchNodes]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(2, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(0.3, prev - 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 拖拽控制
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale((prev) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.max(0.3, Math.min(2, prev + delta));
      });
    }
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

  // 折叠/展开节点
  const handleToggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // 全部展开/折叠
  const collectAllNodeIds = useCallback((node: MindMapNode): string[] => {
    const ids: string[] = [node.id];
    if (node.children) {
      for (const child of node.children) {
        ids.push(...collectAllNodeIds(child));
      }
    }
    return ids;
  }, []);

  const expandAll = useCallback(() => {
    setCollapsedNodes(new Set());
  }, []);

  const collapseAll = useCallback(() => {
    const allIds = collectAllNodeIds(data);
    setCollapsedNodes(new Set(allIds));
  }, [data, collectAllNodeIds]);

  // 更新节点位置
  const handleNodePositionUpdate = useCallback((nodeId: string, position: NodePosition) => {
    setNodePositions((prev) => {
      const next = new Map(prev);
      next.set(nodeId, position);
      return next;
    });
  }, []);

  // 定位到节点
  const focusNode = useCallback((nodeId: string) => {
    setHighlightedNodeId(nodeId);
    // 简化处理：重置位置
    setPosition({ x: 0, y: 0 });
    setScale(1);
  }, []);

  // 导出图片
  const handleExport = useCallback(
    async (format: "png" | "svg") => {
      if (onExport) {
        onExport(format);
        return;
      }

      // 默认导出逻辑
      const content = contentRef.current;
      if (!content) return;

      try {
        // 使用 html2canvas 库（如果可用）
        // 这里提供基础的 SVG 导出
        if (format === "svg") {
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          svg.innerHTML = `<text x="10" y="30">${data.label}</text>`;

          const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${title || "mindmap"}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error("导出失败:", err);
      }
    },
    [data.label, title, onExport]
  );

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "f":
            e.preventDefault();
            setShowSearch(true);
            break;
          case "=":
          case "+":
            e.preventDefault();
            handleZoomIn();
            break;
          case "-":
            e.preventDefault();
            handleZoomOut();
            break;
          case "0":
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }

      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-stone-50 rounded-xl overflow-hidden border border-stone-200",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* 工具栏 */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* 标题 */}
          {title && (
            <h3 className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm font-medium text-stone-700">
              {title}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 搜索 */}
          {showSearch ? (
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-1.5">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索节点..."
                className="w-40 text-sm border-none outline-none bg-transparent"
                autoFocus
              />
              {searchResults.length > 0 && (
                <span className="text-xs text-stone-500">{searchResults.length} 个结果</span>
              )}
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="p-0.5 hover:bg-stone-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 bg-white rounded-lg shadow-sm hover:bg-stone-50 transition-colors"
              title="搜索 (Ctrl+F)"
            >
              <Search className="w-4 h-4 text-stone-600" />
            </button>
          )}

          {/* 展开/折叠 */}
          <div className="flex items-center bg-white rounded-lg shadow-sm">
            <button
              onClick={expandAll}
              className="px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50 rounded-l-lg transition-colors"
              title="全部展开"
            >
              展开
            </button>
            <div className="w-px h-4 bg-stone-200" />
            <button
              onClick={collapseAll}
              className="px-2 py-1.5 text-xs text-stone-600 hover:bg-stone-50 rounded-r-lg transition-colors"
              title="全部折叠"
            >
              折叠
            </button>
          </div>

          {/* 缩放 */}
          <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-stone-100 rounded transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4 text-stone-600" />
            </button>
            <span className="text-xs text-stone-600 min-w-[48px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-stone-100 rounded transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4 text-stone-600" />
            </button>
            <button
              onClick={handleZoomReset}
              className="p-1.5 hover:bg-stone-100 rounded transition-colors"
              title="重置"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
            </button>
          </div>

          {/* 导出 */}
          <button
            onClick={() => handleExport("png")}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-stone-50 transition-colors"
            title="导出图片"
          >
            <Download className="w-4 h-4 text-stone-600" />
          </button>

          {/* 全屏 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-stone-50 transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-stone-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-stone-600" />
            )}
          </button>
        </div>
      </div>

      {/* 拖拽提示 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-stone-400 z-10">
        <Move className="w-3 h-3" />
        <span>拖拽移动 | 滚轮缩放</span>
      </div>

      {/* 搜索结果列表 */}
      {showSearch && searchResults.length > 0 && (
        <div className="absolute top-16 right-4 w-64 bg-white rounded-lg shadow-lg p-2 z-20 max-h-60 overflow-y-auto">
          <p className="text-xs text-stone-500 px-2 py-1">搜索结果</p>
          {searchResults.map((node) => (
            <button
              key={node.id}
              onClick={() => focusNode(node.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors",
                highlightedNodeId === node.id && "bg-amber-50 text-amber-700"
              )}
            >
              {node.icon && <span className="mr-2">{node.icon}</span>}
              {node.label}
            </button>
          ))}
        </div>
      )}

      {/* 思维导图内容 */}
      <div
        className={cn(
          "w-full h-full min-h-[400px] overflow-hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          ref={contentRef}
          className="inline-block p-12 pt-20"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <MindMapNodeComponent
            node={data}
            level={0}
            isRoot
            searchQuery={searchQuery}
            highlightedNodeId={highlightedNodeId}
            collapsedNodes={collapsedNodes}
            onToggleCollapse={handleToggleCollapse}
            onNodeClick={onNodeClick}
            onNodePositionUpdate={handleNodePositionUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export default MindMap;
