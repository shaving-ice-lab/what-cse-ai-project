"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Download,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  FileStack,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@what-cse/ui";
import {
  questionApi,
  CreatePaperRequest,
  PaperType,
  PaperQuestion,
  getPaperTypeName,
} from "@/services/question-api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface PaperImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedPaper {
  id: number; // 临时 ID
  title: string;
  paper_type: PaperType;
  exam_type?: string;
  subject?: string;
  year?: number;
  region?: string;
  total_score: number;
  time_limit: number;
  questions: PaperQuestion[];
  question_ids_str?: string; // 原始的题目ID字符串
  is_free: boolean;
  description?: string;
  // 验证状态
  isValid: boolean;
  errors: string[];
}

// 试卷类型映射
const paperTypeMap: Record<string, PaperType> = {
  真题卷: "real_exam",
  模拟卷: "mock",
  每日练习: "daily",
  自定义: "custom",
  real_exam: "real_exam",
  mock: "mock",
  daily: "daily",
  custom: "custom",
};

// 考试类型映射
const examTypeMap: Record<string, string> = {
  国考: "guokao",
  省考: "shengkao",
  事业单位: "shiyedanwei",
  选调: "xuandiao",
  军队文职: "junduiwenzhi",
};

// 科目映射
const subjectMap: Record<string, string> = {
  行测: "xingce",
  申论: "shenlun",
  面试: "mianshi",
  公基: "gongji",
};

export function PaperImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: PaperImportDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [parsedPapers, setParsedPapers] = useState<ParsedPaper[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 解析题目ID字符串
  const parseQuestionIds = (str: string): PaperQuestion[] => {
    if (!str) return [];
    
    // 支持多种格式：
    // 1. "1,2,3,4,5" - 逗号分隔，每题默认1分
    // 2. "1:5,2:5,3:5" - ID:分数格式
    // 3. JSON数组 [{"question_id":1,"score":5},...]
    
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          question_id: typeof item === "object" ? item.question_id : item,
          score: typeof item === "object" ? (item.score || 1) : 1,
          order: idx + 1,
        }));
      }
    } catch {
      // 不是 JSON 格式
    }
    
    // 尝试解析 "1:5,2:5" 或 "1,2,3" 格式
    const parts = str.split(/[,，;；\s]+/).filter(Boolean);
    return parts.map((part, idx) => {
      const match = part.match(/^(\d+)(?::(\d+))?$/);
      if (match) {
        return {
          question_id: parseInt(match[1]),
          score: match[2] ? parseInt(match[2]) : 1,
          order: idx + 1,
        };
      }
      return {
        question_id: parseInt(part) || 0,
        score: 1,
        order: idx + 1,
      };
    }).filter(q => q.question_id > 0);
  };

  // 验证试卷
  const validatePaper = (p: ParsedPaper): ParsedPaper => {
    const errors: string[] = [];
    
    if (!p.title || p.title.trim().length < 2) {
      errors.push("试卷标题过短");
    }
    
    if (p.total_score <= 0) {
      errors.push("总分必须大于0");
    }
    
    if (p.time_limit <= 0) {
      errors.push("时间限制必须大于0");
    }
    
    // 题目是可选的，但如果有题目ID字符串但解析失败，应该报错
    if (p.question_ids_str && p.questions.length === 0) {
      errors.push("题目ID格式错误");
    }
    
    return {
      ...p,
      isValid: errors.length === 0,
      errors,
    };
  };

  // 解析 Excel 文件
  const parseExcel = (data: ArrayBuffer): ParsedPaper[] => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    
    return rows.map((row, index) => {
      const questionIdsStr = row["题目ID"] || row["question_ids"] || "";
      const p: ParsedPaper = {
        id: index + 1,
        title: row["试卷标题"] || row["title"] || "",
        paper_type: paperTypeMap[row["试卷类型"] || row["paper_type"]] || "mock",
        exam_type: examTypeMap[row["考试类型"] || row["exam_type"]] || row["exam_type"],
        subject: subjectMap[row["科目"] || row["subject"]] || row["subject"],
        year: parseInt(row["年份"] || row["year"]) || undefined,
        region: row["地区"] || row["region"],
        total_score: parseInt(row["总分"] || row["total_score"]) || 100,
        time_limit: parseInt(row["时间限制"] || row["time_limit"]) || 120,
        questions: parseQuestionIds(questionIdsStr),
        question_ids_str: questionIdsStr,
        is_free: row["免费"] === true || row["免费"] === "是" || row["is_free"] === true,
        description: row["描述"] || row["description"],
        isValid: false,
        errors: [],
      };
      
      return validatePaper(p);
    });
  };

  // 解析 JSON 文件
  const parseJSON = (data: string): ParsedPaper[] => {
    try {
      const parsed = JSON.parse(data);
      const papers = Array.isArray(parsed) ? parsed : parsed.papers || [];
      
      return papers.map((row: any, index: number) => {
        const questionIdsStr = typeof row.questions === "string" ? row.questions : "";
        const p: ParsedPaper = {
          id: index + 1,
          title: row.title || "",
          paper_type: paperTypeMap[row.paper_type] || "mock",
          exam_type: examTypeMap[row.exam_type] || row.exam_type,
          subject: subjectMap[row.subject] || row.subject,
          year: parseInt(row.year) || undefined,
          region: row.region,
          total_score: parseInt(row.total_score) || 100,
          time_limit: parseInt(row.time_limit) || 120,
          questions: Array.isArray(row.questions) 
            ? row.questions.map((q: any, idx: number) => ({
                question_id: q.question_id || q,
                score: q.score || 1,
                order: idx + 1,
              }))
            : parseQuestionIds(questionIdsStr),
          question_ids_str: questionIdsStr,
          is_free: row.is_free || false,
          description: row.description,
          isValid: false,
          errors: [],
        };
        
        return validatePaper(p);
      });
    } catch (e) {
      toast.error("JSON 格式错误");
      return [];
    }
  };

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const fileName = file.name.toLowerCase();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (!result) return;
        
        let papers: ParsedPaper[] = [];
        
        if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          papers = parseExcel(result as ArrayBuffer);
        } else if (fileName.endsWith(".json")) {
          papers = parseJSON(result as string);
        } else {
          toast.error("不支持的文件格式，请上传 Excel 或 JSON 文件");
          return;
        }
        
        if (papers.length === 0) {
          toast.error("未解析到任何试卷数据");
          return;
        }
        
        setParsedPapers(papers);
        setStep("preview");
        toast.success(`成功解析 ${papers.length} 套试卷`);
      };
      
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
      
      event.target.value = "";
    },
    []
  );

  // 执行导入
  const handleImport = async () => {
    const validPapers = parsedPapers.filter((p) => p.isValid);
    if (validPapers.length === 0) {
      toast.error("没有有效的试卷可导入");
      return;
    }
    
    setImporting(true);
    let successCount = 0;
    const errors: string[] = [];
    
    try {
      for (const p of validPapers) {
        try {
          const paperData: CreatePaperRequest = {
            title: p.title,
            paper_type: p.paper_type,
            exam_type: p.exam_type,
            subject: p.subject,
            year: p.year,
            region: p.region,
            total_score: p.total_score,
            time_limit: p.time_limit,
            questions: p.questions,
            is_free: p.is_free,
            description: p.description,
            status: 0, // 默认草稿
          };
          await questionApi.createPaper(paperData);
          successCount++;
        } catch (error: any) {
          errors.push(`#${p.id} "${p.title}": ${error.message || "创建失败"}`);
        }
      }
      
      setImportResult({
        success: successCount,
        failed: validPapers.length - successCount + parsedPapers.filter(p => !p.isValid).length,
        errors: [
          ...parsedPapers.filter(p => !p.isValid).map(p => `#${p.id}: ${p.errors.join(", ")}`),
          ...errors,
        ],
      });
      setStep("result");
      
      if (successCount > 0) {
        toast.success(`成功导入 ${successCount} 套试卷`);
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || "导入失败");
    } finally {
      setImporting(false);
    }
  };

  // 下载模板
  const downloadTemplate = (format: "excel" | "json") => {
    if (format === "excel") {
      const templateData = [
        {
          试卷标题: "2024年国家公务员考试行测真题（地市级）",
          试卷类型: "真题卷",
          考试类型: "国考",
          科目: "行测",
          年份: 2024,
          地区: "全国",
          总分: 100,
          时间限制: 120,
          题目ID: "1:2,2:2,3:2,4:2,5:2",
          免费: "否",
          描述: "2024年国考行测真题地市级卷",
        },
      ];
      
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "试卷导入模板");
      XLSX.writeFile(wb, "试卷导入模板.xlsx");
    } else {
      const templateData = {
        papers: [
          {
            title: "2024年国家公务员考试行测真题（地市级）",
            paper_type: "real_exam",
            exam_type: "guokao",
            subject: "xingce",
            year: 2024,
            region: "全国",
            total_score: 100,
            time_limit: 120,
            questions: [
              { question_id: 1, score: 2 },
              { question_id: 2, score: 2 },
              { question_id: 3, score: 2 },
            ],
            is_free: false,
            description: "2024年国考行测真题地市级卷",
          },
        ],
      };
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "试卷导入模板.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 重置状态
  const handleReset = () => {
    setStep("upload");
    setParsedPapers([]);
    setImportResult(null);
  };

  const validCount = parsedPapers.filter((p) => p.isValid).length;
  const invalidCount = parsedPapers.filter((p) => !p.isValid).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            批量导入试卷
          </DialogTitle>
          <DialogDescription className="text-xs">
            支持 Excel (.xlsx) 和 JSON 格式导入
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "upload" && (
            <div className="space-y-4 py-3">
              {/* 上传区域 */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  点击或拖拽文件到此处上传
                </p>
                <p className="text-xs text-muted-foreground">
                  支持 .xlsx、.xls、.json 格式
                </p>
              </div>

              {/* 模板下载 */}
              <div className="flex items-center justify-center gap-3">
                <span className="text-xs text-muted-foreground">下载导入模板：</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => downloadTemplate("excel")}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel 模板
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate("json")}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON 模板
                </Button>
              </div>

              {/* 字段说明 */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">字段说明</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• 试卷类型：真题卷/模拟卷/每日练习/自定义</div>
                  <div>• 考试类型：国考/省考/事业单位/选调/军队文职</div>
                  <div>• 科目：行测/申论/面试/公基</div>
                  <div>• 题目ID：格式 1:分数,2:分数 或 1,2,3</div>
                  <div>• 总分：试卷满分（默认100）</div>
                  <div>• 时间限制：考试时长（分钟，默认120）</div>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4 py-4">
              {/* 统计信息 */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileStack className="h-5 w-5 text-purple-500" />
                  <span>共 {parsedPapers.length} 套试卷</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>有效 {validCount} 套</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>无效 {invalidCount} 套</span>
                  </div>
                )}
              </div>

              {/* 试卷列表 */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">全部 ({parsedPapers.length})</TabsTrigger>
                  <TabsTrigger value="valid">有效 ({validCount})</TabsTrigger>
                  <TabsTrigger value="invalid">无效 ({invalidCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <PaperPreviewTable papers={parsedPapers} />
                </TabsContent>
                <TabsContent value="valid" className="mt-4">
                  <PaperPreviewTable
                    papers={parsedPapers.filter((p) => p.isValid)}
                  />
                </TabsContent>
                <TabsContent value="invalid" className="mt-4">
                  <PaperPreviewTable
                    papers={parsedPapers.filter((p) => !p.isValid)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {step === "result" && importResult && (
            <div className="space-y-6 py-8 text-center">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">导入完成</h3>
                <p className="text-muted-foreground">
                  成功导入 <span className="text-green-600 font-medium">{importResult.success}</span> 套试卷
                  {importResult.failed > 0 && (
                    <>
                      ，<span className="text-red-600 font-medium">{importResult.failed}</span> 套失败
                    </>
                  )}
                </p>
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-left bg-red-50 rounded-lg p-4 max-h-[200px] overflow-auto">
                  <h4 className="font-medium text-red-700 mb-2">失败原因：</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {importResult.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>... 还有 {importResult.errors.length - 10} 条错误</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          )}
          {step === "preview" && (
            <>
              <Button variant="outline" onClick={handleReset}>
                重新选择
              </Button>
              <Button onClick={handleImport} disabled={importing || validCount === 0}>
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : (
                  <>
                    导入 {validCount} 套试卷
                  </>
                )}
              </Button>
            </>
          )}
          {step === "result" && (
            <Button onClick={() => onOpenChange(false)}>完成</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 试卷预览表格组件
function PaperPreviewTable({ papers }: { papers: ParsedPaper[] }) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无试卷
      </div>
    );
  }

  return (
    <ScrollArea className="h-[350px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[80px]">状态</TableHead>
            <TableHead className="min-w-[200px]">试卷标题</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>科目</TableHead>
            <TableHead>题目数</TableHead>
            <TableHead>总分</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {papers.map((p) => (
            <TableRow key={p.id} className={!p.isValid ? "bg-red-50" : ""}>
              <TableCell className="font-mono text-xs">{p.id}</TableCell>
              <TableCell>
                {p.isValid ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    有效
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    无效
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[250px]">
                  <p className="text-sm truncate">{p.title}</p>
                  {!p.isValid && p.errors.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      {p.errors.join(", ")}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {getPaperTypeName(p.paper_type)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {p.subject || "-"}
              </TableCell>
              <TableCell className="text-sm">
                {p.questions.length} 题
              </TableCell>
              <TableCell className="text-sm">
                {p.total_score} 分
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
