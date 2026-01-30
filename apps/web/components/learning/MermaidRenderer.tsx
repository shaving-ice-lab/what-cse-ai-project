"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { Loader2, AlertCircle, Maximize2, X, Download } from "lucide-react";

interface MermaidRendererProps {
  /** Mermaid diagram code (mindmap, flowchart, etc.) */
  code: string;
  /** Optional title for the diagram */
  title?: string;
  /** Custom class name */
  className?: string;
  /** Allow fullscreen view */
  allowFullscreen?: boolean;
  /** Allow download as SVG */
  allowDownload?: boolean;
}

/**
 * MermaidRenderer - 使用 Mermaid.js 渲染图表
 * 支持思维导图 (mindmap)、流程图 (flowchart) 等多种图表类型
 */
export function MermaidRenderer({
  code,
  title,
  className = "",
  allowFullscreen = true,
  allowDownload = true,
}: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const uniqueId = useId().replace(/:/g, "-");

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!code?.trim()) {
        setError("No diagram code provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          mindmap: {
            padding: 20,
            useMaxWidth: true,
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
          themeVariables: {
            // Mind map colors
            primaryColor: "#6366f1",
            primaryTextColor: "#1f2937",
            primaryBorderColor: "#4f46e5",
            lineColor: "#9ca3af",
            secondaryColor: "#f3f4f6",
            tertiaryColor: "#fef3c7",
            // Background
            background: "#ffffff",
            mainBkg: "#f8fafc",
            secondBkg: "#f1f5f9",
            // Font
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "14px",
          },
        });

        // Generate unique ID for the diagram
        const diagramId = `mermaid-${uniqueId}`;

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, code.trim());

        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to render diagram"
          );
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, uniqueId]);

  // Handle download as SVG
  const handleDownload = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "mindmap"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center p-8 bg-stone-50 rounded-xl border border-stone-200 ${className}`}
      >
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-2" />
        <span className="text-stone-500">加载思维导图...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-200 ${className}`}
      >
        <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
        <p className="text-red-600 text-sm mb-2">思维导图渲染失败</p>
        <p className="text-red-400 text-xs">{error}</p>
        {/* Show raw code in development */}
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 p-2 bg-red-100 rounded text-xs overflow-auto max-w-full">
            {code}
          </pre>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Main container */}
      <div
        className={`relative bg-white rounded-xl border border-stone-200 overflow-hidden ${className}`}
      >
        {/* Header with title and actions */}
        {(title || allowFullscreen || allowDownload) && (
          <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200">
            {title && (
              <h4 className="font-medium text-stone-700 text-sm">{title}</h4>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {allowDownload && svgContent && (
                <button
                  onClick={handleDownload}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"
                  title="下载 SVG"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {allowFullscreen && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors"
                  title="全屏查看"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Diagram container */}
        <div
          ref={containerRef}
          className="p-4 overflow-auto max-h-[600px] [&_svg]:mx-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-[95vw] max-h-[95vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-stone-200 rounded-t-2xl">
              <h3 className="font-semibold text-stone-800">
                {title || "思维导图"}
              </h3>
              <div className="flex items-center gap-2">
                {allowDownload && svgContent && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                )}
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal content */}
            <div
              className="p-8 [&_svg]:mx-auto"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MermaidRenderer;
