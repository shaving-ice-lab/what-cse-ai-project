import * as React from "react";
import {
  FileText,
  Users,
  PenTool,
  Award,
  UserCheck,
  MessageSquare,
  Stethoscope,
  Shield,
  CheckCircle,
  Clock,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type StageStatus = "completed" | "current" | "upcoming" | "skipped";

export interface TimelineStage {
  id: string;
  name: string;
  status: StageStatus;
  date?: string;
  description?: string;
  announcementId?: string;
  announcementTitle?: string;
}

export interface PositionTimelineProps {
  stages: TimelineStage[];
  className?: string;
  orientation?: "vertical" | "horizontal";
  onStageClick?: (stage: TimelineStage) => void;
}

const stageIcons: Record<string, React.ElementType> = {
  recruitment: FileText,
  registration: Users,
  written_exam: PenTool,
  score_release: Award,
  qualification_review: UserCheck,
  interview: MessageSquare,
  medical_exam: Stethoscope,
  political_review: Shield,
  final_result: CheckCircle,
};

const defaultStages = [
  { id: "recruitment", name: "招录公告" },
  { id: "registration", name: "报名统计" },
  { id: "written_exam", name: "笔试" },
  { id: "score_release", name: "成绩发布" },
  { id: "qualification_review", name: "资格复审" },
  { id: "interview", name: "面试" },
  { id: "medical_exam", name: "体检" },
  { id: "political_review", name: "政审" },
  { id: "final_result", name: "录用公示" },
];

const statusConfig: Record<StageStatus, { color: string; bgColor: string; borderColor: string }> = {
  completed: {
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-500",
  },
  current: {
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-500",
  },
  upcoming: {
    color: "text-gray-400",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
  },
  skipped: {
    color: "text-gray-300",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

export function PositionTimeline({
  stages,
  className,
  orientation = "horizontal",
  onStageClick,
}: PositionTimelineProps) {
  const renderStatusIcon = (status: StageStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "current":
        return <Clock className="h-4 w-4 animate-pulse" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  if (orientation === "vertical") {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-6">
          {stages.map((stage, index) => {
            const config = statusConfig[stage.status];
            const Icon = stageIcons[stage.id] || Circle;

            return (
              <div
                key={stage.id}
                className={cn(
                  "relative flex items-start gap-4 cursor-pointer transition-opacity hover:opacity-80",
                  stage.status === "skipped" && "opacity-50"
                )}
                onClick={() => onStageClick?.(stage)}
              >
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2",
                    config.bgColor,
                    config.borderColor
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", config.color)}>{stage.name}</span>
                    {stage.status === "current" && (
                      <Badge variant="secondary" className="text-xs">
                        当前阶段
                      </Badge>
                    )}
                  </div>
                  {stage.date && (
                    <p className="text-sm text-muted-foreground mt-0.5">{stage.date}</p>
                  )}
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                  )}
                  {stage.announcementTitle && (
                    <p className="text-sm text-blue-600 hover:underline mt-1 cursor-pointer">
                      📄 {stage.announcementTitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200" />
        {stages.map((stage, index) => {
          const config = statusConfig[stage.status];
          const Icon = stageIcons[stage.id] || Circle;
          const isFirst = index === 0;
          const isLast = index === stages.length - 1;

          return (
            <div
              key={stage.id}
              className={cn(
                "relative flex flex-col items-center cursor-pointer transition-opacity hover:opacity-80",
                stage.status === "skipped" && "opacity-50",
                isFirst && "items-start",
                isLast && "items-end"
              )}
              onClick={() => onStageClick?.(stage)}
            >
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div
                className={cn("mt-2 text-center", isFirst && "text-left", isLast && "text-right")}
              >
                <p className={cn("text-xs font-medium", config.color)}>{stage.name}</p>
                {stage.date && <p className="text-xs text-muted-foreground">{stage.date}</p>}
              </div>
              {stage.status === "current" && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  当前
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SimplePositionTimeline({
  currentStage,
  className,
}: {
  currentStage: string;
  className?: string;
}) {
  const stages = defaultStages.map((stage, index) => {
    const currentIndex = defaultStages.findIndex((s) => s.id === currentStage);
    let status: StageStatus = "upcoming";
    if (index < currentIndex) {
      status = "completed";
    } else if (index === currentIndex) {
      status = "current";
    }
    return { ...stage, status };
  });

  return <PositionTimeline stages={stages} className={className} />;
}

export { defaultStages };
export default PositionTimeline;
