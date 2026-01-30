"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Brain,
  FileText,
  Palette,
  FileQuestion,
  FileStack,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@what-cse/ui";
import { Skeleton } from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import { ToolbarProvider, useToolbar } from "./components/ToolbarContext";

// Lazy load components for better performance
const CategoryManager = lazy(() => import("./components/CategoryManager"));
const KnowledgePointManager = lazy(() => import("./components/KnowledgePointManager"));
const ContentManager = lazy(() => import("./components/ContentManager"));
const MaterialManager = lazy(() => import("./components/MaterialManager"));
const QuestionManager = lazy(() => import("./components/QuestionManager"));
const PaperManager = lazy(() => import("./components/PaperManager"));

// Tab configuration
const tabs = [
  { value: "categories", label: "分类", icon: LayoutGrid },
  { value: "knowledge-points", label: "知识点", icon: Brain },
  { value: "content", label: "内容", icon: FileText },
  { value: "materials", label: "素材", icon: Palette },
  { value: "questions", label: "题库", icon: FileQuestion },
  { value: "papers", label: "试卷", icon: FileStack },
] as const;

type TabValue = typeof tabs[number]["value"];

// Loading skeleton for lazy loaded components
function TabLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col p-4">
      <Skeleton className="h-full rounded-xl" />
    </div>
  );
}

// Toolbar display component
function ToolbarDisplay() {
  const { toolbarContent } = useToolbar();
  return <>{toolbarContent}</>;
}

export default function UnifiedLearningManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get initial tab from URL or default to "categories"
  const initialTab = (searchParams.get("tab") as TabValue) || "categories";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Sync URL with active tab
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", activeTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, searchParams, router]);

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") as TabValue;
    if (tab && tabs.some(t => t.value === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  return (
    <ToolbarProvider>
      <div className="h-full flex flex-col overflow-hidden bg-background">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Tab Navigation Bar with integrated toolbar */}
          <div className="flex-shrink-0 h-11 flex items-center border-b bg-background">
            {/* Left: Tabs */}
            <TabsList className="h-full bg-transparent rounded-none p-0 gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "relative h-full flex items-center gap-1.5 px-3 text-sm font-medium rounded-none transition-colors",
                      "focus-visible:outline-none focus-visible:bg-muted/50",
                      "data-[state=active]:shadow-none",
                      isActive 
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1.5 right-1.5 h-0.5 bg-primary rounded-full" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Right: Toolbar from active tab */}
            <div className="flex-1 flex items-center justify-end gap-2 px-3">
              <ToolbarDisplay />
            </div>
          </div>

          {/* Tab Content - No page scroll, only internal scroll */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="categories" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <CategoryManager />
              </Suspense>
            </TabsContent>

            <TabsContent value="knowledge-points" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <KnowledgePointManager />
              </Suspense>
            </TabsContent>

            <TabsContent value="content" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <ContentManager />
              </Suspense>
            </TabsContent>

            <TabsContent value="materials" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <MaterialManager />
              </Suspense>
            </TabsContent>

            <TabsContent value="questions" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <QuestionManager />
              </Suspense>
            </TabsContent>

            <TabsContent value="papers" className="mt-0 h-full">
              <Suspense fallback={<TabLoadingSkeleton />}>
                <PaperManager />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </ToolbarProvider>
  );
}
