"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Palette,
  FileQuestion,
  Activity,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Badge,
} from "@what-cse/ui";
import { cn } from "@what-cse/ui";
import {
  contentGeneratorApi,
  ContentTask,
  ContentStats,
} from "@/services/content-generator-api";

// Import tab components
import { TeachingContentTab } from "./components/TeachingContentTab";
import { MaterialTab } from "./components/MaterialTab";
import { QuestionTab } from "./components/QuestionTab";
import { TaskHistoryPanel } from "./components/TaskHistoryPanel";

// Tab configuration
const tabs = [
  { value: "content", label: "教学内容", icon: BookOpen, description: "AI 生成章节教学内容" },
  { value: "material", label: "素材", icon: Palette, description: "AI 生成学习素材" },
  { value: "question", label: "题库", icon: FileQuestion, description: "AI 生成题目" },
  { value: "history", label: "任务历史", icon: Activity, description: "查看生成任务记录" },
] as const;

type TabValue = typeof tabs[number]["value"];

export default function AIGenerationCenterPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("content");
  const [stats, setStats] = useState<ContentStats | undefined>();
  const [tasks, setTasks] = useState<ContentTask[]>([]);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        contentGeneratorApi.getStats().catch(() => ({
          total_categories: 0,
          total_courses: 0,
          total_chapters: 0,
          total_knowledge_points: 0,
        })),
        contentGeneratorApi.getTasks({ page, page_size: 15 }).catch(() => ({ tasks: [], total: 0 })),
      ]);
      setStats(statsRes as ContentStats);
      setTasks((tasksRes as { tasks: ContentTask[]; total: number }).tasks ?? []);
      setTasksTotal((tasksRes as { tasks: ContentTask[]; total: number }).total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-refresh when tasks are processing
  useEffect(() => {
    const hasProcessing = tasks.some(
      (t) => t.status === "processing" || t.status === "generating" || t.status === "pending"
    );
    if (!hasProcessing) return;
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI 内容生成中心</h1>
              <p className="text-sm text-muted-foreground">
                统一管理所有 AI 生成功能
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-normal">
                {stats?.total_categories ?? 0} 分类
              </Badge>
              <Badge variant="outline" className="font-normal">
                {stats?.total_courses ?? 0} 课程
              </Badge>
              <Badge variant="outline" className="font-normal">
                {stats?.total_chapters ?? 0} 章节
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTasks}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              刷新
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {/* Tab Navigation */}
        <div className="flex-shrink-0 border-b bg-muted/30">
          <TabsList className="h-11 w-full justify-start bg-transparent px-6 gap-0 rounded-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "relative h-10 px-4 text-sm font-medium rounded-none transition-colors border-b-2 border-transparent",
                    "focus-visible:outline-none focus-visible:ring-0",
                    "data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4 mr-2", isActive && "text-primary")} />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Tabs */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="content" className="h-full m-0 data-[state=inactive]:hidden">
              <TeachingContentTab onTaskCreated={fetchTasks} />
            </TabsContent>

            <TabsContent value="material" className="h-full m-0 data-[state=inactive]:hidden">
              <MaterialTab onTaskCreated={fetchTasks} />
            </TabsContent>

            <TabsContent value="question" className="h-full m-0 data-[state=inactive]:hidden">
              <QuestionTab onTaskCreated={fetchTasks} />
            </TabsContent>

            <TabsContent value="history" className="h-full m-0 data-[state=inactive]:hidden">
              <TaskHistoryPanel
                tasks={tasks}
                tasksTotal={tasksTotal}
                loading={loading}
                page={page}
                onPageChange={setPage}
                onRefresh={fetchTasks}
              />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
