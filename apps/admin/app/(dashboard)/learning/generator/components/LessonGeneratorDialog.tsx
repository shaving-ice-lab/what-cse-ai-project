"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Switch,
} from "@what-cse/ui";
import { Loader2, Wand2, BookOpen, FolderTree } from "lucide-react";
import {
  aiContentApi,
  getSubjectLabel,
} from "@/services/ai-content-api";
import { toast } from "sonner";

interface LessonGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "chapter" | "course" | "category";
  targetId: number;
  targetName?: string;
  onSuccess?: () => void;
}

const SUBJECTS = [
  { value: "xingce", label: "行测" },
  { value: "shenlun", label: "申论" },
  { value: "mianshi", label: "面试" },
  { value: "gongji", label: "公基" },
];

export function LessonGeneratorDialog({
  open,
  onOpenChange,
  type,
  targetId,
  targetName,
  onSuccess,
}: LessonGeneratorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState<string>("");
  const [autoApprove, setAutoApprove] = useState(false);

  const getTitle = () => {
    switch (type) {
      case "chapter":
        return "生成章节教学内容";
      case "course":
        return "为课程批量生成教学内容";
      case "category":
        return "为分类批量生成教学内容";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "chapter":
        return `将为「${targetName || `章节 #${targetId}`}」生成完整的图文教学内容，包括课程导入、概念讲解、方法技巧、例题演示和总结归纳。`;
      case "course":
        return `将为「${targetName || `课程 #${targetId}`}」的所有章节批量生成教学内容。`;
      case "category":
        return `将为「${targetName || `分类 #${targetId}`}」下的所有课程批量生成教学内容，可能需要较长时间。`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case "chapter":
        return <Wand2 className="h-5 w-5" />;
      case "course":
        return <BookOpen className="h-5 w-5" />;
      case "category":
        return <FolderTree className="h-5 w-5" />;
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      switch (type) {
        case "chapter":
          await aiContentApi.generateChapterLesson({
            chapter_id: targetId,
            subject: subject || undefined,
            auto_approve: autoApprove,
          });
          toast.success("章节教学内容生成成功！");
          break;

        case "course":
          const courseResult = await aiContentApi.generateCourseLessons({
            course_id: targetId,
            subject: subject || undefined,
            auto_approve: autoApprove,
          });
          toast.success(
            `课程教学内容生成任务已创建！任务ID: ${courseResult.task.id}`
          );
          break;

        case "category":
          const categoryResult = await aiContentApi.generateCategoryLessons({
            category_id: targetId,
            subject: subject || undefined,
            auto_approve: autoApprove,
          });
          toast.success(
            `分类教学内容生成任务已创建！共 ${categoryResult.task_count} 个任务`
          );
          break;
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 科目选择 */}
          <div className="space-y-2">
            <Label htmlFor="subject">科目（可选）</Label>
            <Select value={subject || "auto"} onValueChange={(v) => setSubject(v === "auto" ? "" : v)}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="选择科目以获得更精准的内容" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">自动识别</SelectItem>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              选择科目可以生成更加针对性的教学内容
            </p>
          </div>

          {/* 自动审核 */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-approve">自动审核通过</Label>
              <p className="text-xs text-muted-foreground">
                生成的内容将自动标记为已审核通过
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
          </div>

          {/* 提示信息 */}
          {type !== "chapter" && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">注意：</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>批量生成将创建后台任务，可在"AI任务"页面查看进度</li>
                <li>生成过程可能需要一些时间，请耐心等待</li>
                <li>已存在的教学内容将被跳过</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {type === "chapter" ? "生成内容" : "创建任务"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LessonGeneratorDialog;
