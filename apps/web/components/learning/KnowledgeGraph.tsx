"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Filter,
  Target,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Search,
  X,
  Eye,
} from "lucide-react";

// =====================================================
// 类型定义
// =====================================================

// 知识点掌握度
export type MasteryStatus = "mastered" | "learning" | "weak" | "unknown";

// 知识点节点
export interface KnowledgeNode {
  id: string;
  label: string;
  subject?: string;
  category?: string;
  mastery?: MasteryStatus;
  masteryLevel?: number; // 0-100
  questionCount?: number;
  correctRate?: number;
  x?: number;
  y?: number;
}

// 知识点关联
export interface KnowledgeEdge {
  source: string;
  target: string;
  strength?: "strong" | "medium" | "weak";
  type?: "prerequisite" | "related" | "extension";
}

// 推荐学习路径
export interface LearningPath {
  id: string;
  name: string;
  nodes: string[];
  description?: string;
  estimatedTime?: number;
}

// 图谱配置
interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  recommendedPath?: LearningPath;
  onNodeClick?: (node: KnowledgeNode) => void;
  onPathNodeClick?: (nodeId: string) => void;
  showLegend?: boolean;
  className?: string;
}

// =====================================================
// 常量配置
// =====================================================

// 掌握度配置
const MASTERY_CONFIG: Record<MasteryStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  mastered: {
    label: "已掌握",
    color: "#10b981",
    bgColor: "#d1fae5",
    borderColor: "#6ee7b7",
    icon: CheckCircle2,
  },
  learning: {
    label: "学习中",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    borderColor: "#fcd34d",
    icon: Clock,
  },
  weak: {
    label: "薄弱点",
    color: "#ef4444",
    bgColor: "#fee2e2",
    borderColor: "#fca5a5",
    icon: AlertCircle,
  },
  unknown: {
    label: "未学习",
    color: "#9ca3af",
    bgColor: "#f3f4f6",
    borderColor: "#d1d5db",
    icon: Eye,
  },
};

// 关联强度配置
const EDGE_CONFIG: Record<string, { width: number; dasharray?: string; opacity: number }> = {
  strong: { width: 3, opacity: 0.8 },
  medium: { width: 2, opacity: 0.6 },
  weak: { width: 1, dasharray: "4,4", opacity: 0.4 },
};

// =====================================================
// 主组件
// =====================================================

export function KnowledgeGraph({
  nodes,
  edges,
  recommendedPath,
  onNodeClick,
  onPathNodeClick,
  showLegend = true,
  className,
}: KnowledgeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 状态
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filter, setFilter] = useState<MasteryStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showPathPanel, setShowPathPanel] = useState(!!recommendedPath);

  // 计算节点位置（简单力导向布局模拟）
  const positionedNodes = useMemo(() => {
    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // 如果节点已有位置，直接使用
    if (nodes.some(n => n.x !== undefined && n.y !== undefined)) {
      return nodes;
    }

    // 按科目分组
    const subjects = new Map<string, KnowledgeNode[]>();
    nodes.forEach(node => {
      const subject = node.subject || "default";
      if (!subjects.has(subject)) {
        subjects.set(subject, []);
      }
      subjects.get(subject)!.push(node);
    });

    // 为每个科目分配扇形区域
    const result: KnowledgeNode[] = [];
    const subjectCount = subjects.size;
    let subjectIndex = 0;

    subjects.forEach((subjectNodes, subject) => {
      const angleStart = (2 * Math.PI * subjectIndex) / subjectCount;
      const angleRange = (2 * Math.PI) / subjectCount;
      
      subjectNodes.forEach((node, nodeIndex) => {
        const radius = 150 + (nodeIndex % 3) * 80;
        const angle = angleStart + (angleRange * (nodeIndex + 0.5)) / subjectNodes.length;
        
        result.push({
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      });

      subjectIndex++;
    });

    return result;
  }, [nodes]);

  // 过滤节点
  const filteredNodes = useMemo(() => {
    let filtered = positionedNodes;

    // 按掌握度过滤
    if (filter !== "all") {
      filtered = filtered.filter(n => n.mastery === filter);
    }

    // 按搜索词过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.label.toLowerCase().includes(query) ||
        n.subject?.toLowerCase().includes(query) ||
        n.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [positionedNodes, filter, searchQuery]);

  // 过滤边
  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
  }, [edges, filteredNodes]);

  // 推荐路径上的节点
  const pathNodeIds = useMemo(() => {
    return new Set(recommendedPath?.nodes || []);
  }, [recommendedPath]);

  // 获取节点位置映射
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    positionedNodes.forEach(node => {
      if (node.x !== undefined && node.y !== undefined) {
        map.set(node.id, { x: node.x, y: node.y });
      }
    });
    return map;
  }, [positionedNodes]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(2, prev + 0.2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(0.3, prev - 0.2));
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // 拖拽控制
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale(prev => {
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

  // 节点点击
  const handleNodeClick = useCallback((node: KnowledgeNode) => {
    setSelectedNode(node.id);
    onNodeClick?.(node);
  }, [onNodeClick]);

  // 渲染边
  const renderEdge = useCallback((edge: KnowledgeEdge) => {
    const sourcePos = nodePositions.get(edge.source);
    const targetPos = nodePositions.get(edge.target);
    if (!sourcePos || !targetPos) return null;

    const config = EDGE_CONFIG[edge.strength || "medium"];
    const isOnPath = pathNodeIds.has(edge.source) && pathNodeIds.has(edge.target);
    const isHighlighted = 
      hoveredNode === edge.source || 
      hoveredNode === edge.target ||
      selectedNode === edge.source ||
      selectedNode === edge.target;

    return (
      <line
        key={`${edge.source}-${edge.target}`}
        x1={sourcePos.x}
        y1={sourcePos.y}
        x2={targetPos.x}
        y2={targetPos.y}
        stroke={isOnPath ? "#f59e0b" : "#94a3b8"}
        strokeWidth={isOnPath ? config.width + 1 : config.width}
        strokeDasharray={config.dasharray}
        opacity={isHighlighted ? 1 : config.opacity}
        className="transition-all duration-200"
      />
    );
  }, [nodePositions, pathNodeIds, hoveredNode, selectedNode]);

  // 渲染节点
  const renderNode = useCallback((node: KnowledgeNode) => {
    if (node.x === undefined || node.y === undefined) return null;

    const mastery = node.mastery || "unknown";
    const config = MASTERY_CONFIG[mastery];
    const Icon = config.icon;
    const isOnPath = pathNodeIds.has(node.id);
    const isHovered = hoveredNode === node.id;
    const isSelected = selectedNode === node.id;
    const isSearchMatch = searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());

    const nodeSize = isOnPath ? 60 : 50;
    const radius = nodeSize / 2;

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        className="cursor-pointer"
        onClick={() => handleNodeClick(node)}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        {/* 选中/悬停外圈 */}
        {(isHovered || isSelected || isOnPath) && (
          <circle
            r={radius + 8}
            fill="none"
            stroke={isOnPath ? "#f59e0b" : config.color}
            strokeWidth={2}
            strokeDasharray={isOnPath ? "" : "4,4"}
            opacity={0.6}
            className="animate-pulse"
          />
        )}

        {/* 搜索匹配高亮 */}
        {isSearchMatch && (
          <circle
            r={radius + 12}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={3}
            opacity={0.8}
          />
        )}

        {/* 节点主体 */}
        <circle
          r={radius}
          fill={config.bgColor}
          stroke={config.borderColor}
          strokeWidth={2}
          className="transition-all duration-200"
        />

        {/* 掌握度进度圈 */}
        {node.masteryLevel !== undefined && node.masteryLevel > 0 && (
          <circle
            r={radius - 3}
            fill="none"
            stroke={config.color}
            strokeWidth={3}
            strokeDasharray={`${(2 * Math.PI * (radius - 3) * node.masteryLevel) / 100} ${2 * Math.PI * (radius - 3)}`}
            strokeLinecap="round"
            transform="rotate(-90)"
            opacity={0.6}
          />
        )}

        {/* 节点标签 */}
        <text
          y={4}
          textAnchor="middle"
          className="text-xs font-medium fill-stone-700 pointer-events-none"
        >
          {node.label.length > 6 ? node.label.slice(0, 6) + "..." : node.label}
        </text>

        {/* 路径标记 */}
        {isOnPath && (
          <g transform={`translate(${radius - 8}, ${-radius + 8})`}>
            <circle r={10} fill="#f59e0b" />
            <text
              textAnchor="middle"
              y={4}
              className="text-[10px] font-bold fill-white"
            >
              {(recommendedPath?.nodes.indexOf(node.id) ?? -1) + 1}
            </text>
          </g>
        )}

        {/* 掌握度图标 */}
        <g transform={`translate(${-radius + 8}, ${radius - 8})`}>
          <circle r={8} fill={config.color} />
        </g>
      </g>
    );
  }, [pathNodeIds, hoveredNode, selectedNode, searchQuery, handleNodeClick, recommendedPath]);

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
          <h3 className="px-3 py-1.5 bg-white rounded-lg shadow-sm text-sm font-medium text-stone-700">
            知识图谱
          </h3>

          {/* 过滤器 */}
          <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2 py-1 text-xs rounded transition-colors",
                filter === "all" ? "bg-stone-100 text-stone-700" : "text-stone-500 hover:bg-stone-50"
              )}
            >
              全部
            </button>
            {(Object.keys(MASTERY_CONFIG) as MasteryStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors flex items-center gap-1",
                  filter === status ? "bg-stone-100 text-stone-700" : "text-stone-500 hover:bg-stone-50"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: MASTERY_CONFIG[status].color }}
                />
                {MASTERY_CONFIG[status].label}
              </button>
            ))}
          </div>
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
                placeholder="搜索知识点..."
                className="w-40 text-sm border-none outline-none bg-transparent"
                autoFocus
              />
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
              title="搜索"
            >
              <Search className="w-4 h-4 text-stone-600" />
            </button>
          )}

          {/* 缩放控制 */}
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

      {/* 图例 */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 z-10">
          <p className="text-xs font-medium text-stone-600 mb-2">图例</p>
          <div className="space-y-1.5">
            {(Object.keys(MASTERY_CONFIG) as MasteryStatus[]).map(status => {
              const config = MASTERY_CONFIG[status];
              return (
                <div key={status} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border"
                    style={{
                      backgroundColor: config.bgColor,
                      borderColor: config.borderColor,
                    }}
                  />
                  <span className="text-xs text-stone-600">{config.label}</span>
                </div>
              );
            })}
            <div className="pt-1.5 mt-1.5 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-amber-500 rounded" />
                <span className="text-xs text-stone-600">推荐路径</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 推荐学习路径面板 */}
      {recommendedPath && showPathPanel && (
        <div className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-stone-800">AI 推荐学习路径</h4>
            </div>
            <button
              onClick={() => setShowPathPanel(false)}
              className="p-1 hover:bg-stone-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>
          
          <p className="text-xs text-stone-500 mb-3">{recommendedPath.description}</p>
          
          <div className="space-y-2">
            {recommendedPath.nodes.map((nodeId, index) => {
              const node = positionedNodes.find(n => n.id === nodeId);
              if (!node) return null;
              
              const mastery = node.mastery || "unknown";
              const config = MASTERY_CONFIG[mastery];
              
              return (
                <button
                  key={nodeId}
                  onClick={() => onPathNodeClick?.(nodeId)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors text-left"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate">{node.label}</p>
                    <p className="text-xs" style={{ color: config.color }}>{config.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              );
            })}
          </div>

          {recommendedPath.estimatedTime && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
              <Clock className="w-4 h-4" />
              <span>预计学习时间: {recommendedPath.estimatedTime} 分钟</span>
            </div>
          )}
        </div>
      )}

      {/* 路径开关按钮 */}
      {recommendedPath && !showPathPanel && (
        <button
          onClick={() => setShowPathPanel(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-amber-500 text-white rounded-lg shadow-lg hover:bg-amber-600 transition-colors z-10"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">学习路径</span>
        </button>
      )}

      {/* 图谱画布 */}
      <div
        className={cn(
          "w-full h-full min-h-[500px] overflow-hidden",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="pt-16"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* 渲染边 */}
          <g className="edges">
            {filteredEdges.map(edge => renderEdge(edge))}
          </g>

          {/* 推荐路径连线 */}
          {recommendedPath && (
            <g className="path-edges">
              {recommendedPath.nodes.slice(0, -1).map((nodeId, index) => {
                const nextNodeId = recommendedPath.nodes[index + 1];
                const sourcePos = nodePositions.get(nodeId);
                const targetPos = nodePositions.get(nextNodeId);
                if (!sourcePos || !targetPos) return null;

                return (
                  <line
                    key={`path-${nodeId}-${nextNodeId}`}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke="#f59e0b"
                    strokeWidth={4}
                    markerEnd="url(#arrowhead)"
                    className="animate-pulse"
                  />
                );
              })}
            </g>
          )}

          {/* 箭头标记定义 */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
            </marker>
          </defs>

          {/* 渲染节点 */}
          <g className="nodes">
            {filteredNodes.map(node => renderNode(node))}
          </g>
        </svg>
      </div>

      {/* 节点详情悬浮卡 */}
      {hoveredNode && (
        <NodeTooltip
          node={positionedNodes.find(n => n.id === hoveredNode)!}
          isOnPath={pathNodeIds.has(hoveredNode)}
        />
      )}
    </div>
  );
}

// 节点悬浮提示
function NodeTooltip({
  node,
  isOnPath,
}: {
  node: KnowledgeNode;
  isOnPath: boolean;
}) {
  const mastery = node.mastery || "unknown";
  const config = MASTERY_CONFIG[mastery];

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 z-20 min-w-[200px]">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: config.bgColor }}
        >
          <config.icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-stone-800">{node.label}</h4>
          {node.category && (
            <p className="text-xs text-stone-500">{node.category}</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-500">掌握度</span>
          <span style={{ color: config.color }}>{config.label}</span>
        </div>
        {node.masteryLevel !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">掌握程度</span>
            <span className="text-stone-700">{node.masteryLevel}%</span>
          </div>
        )}
        {node.correctRate !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">正确率</span>
            <span className="text-stone-700">{node.correctRate}%</span>
          </div>
        )}
        {node.questionCount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">练习题数</span>
            <span className="text-stone-700">{node.questionCount} 题</span>
          </div>
        )}
      </div>

      {isOnPath && (
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-amber-600">
          <Sparkles className="w-4 h-4" />
          <span>在推荐学习路径中</span>
        </div>
      )}
    </div>
  );
}

export default KnowledgeGraph;
