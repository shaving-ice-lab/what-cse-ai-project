"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileJson,
  Download,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  FileQuestion,
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
  CreateQuestionRequest,
  QuestionType,
  QuestionSourceType,
  getQuestionTypeName,
  getDifficultyLabel,
} from "@/services/question-api";
import { CourseCategory } from "@/services/course-api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CourseCategory[];
  onSuccess: () => void;
}

interface ParsedQuestion {
  id: number; // 临时 ID，用于显示
  category_name?: string;
  category_id?: number;
  question_type: QuestionType;
  difficulty: number;
  source_type: QuestionSourceType;
  source_year?: number;
  source_region?: string;
  source_exam?: string;
  content: string;
  options?: { key: string; content: string }[];
  answer: string;
  analysis?: string;
  tips?: string;
  tags?: string[];
  is_vip?: boolean;
  // 验证状态
  isValid: boolean;
  errors: string[];
}

// 题型映射
const questionTypeMap: Record<string, QuestionType> = {
  单选题: "single_choice",
  多选题: "multi_choice",
  判断题: "judge",
  填空题: "fill_blank",
  简答题: "essay",
  材料题: "material",
  single_choice: "single_choice",
  multi_choice: "multi_choice",
  judge: "judge",
  fill_blank: "fill_blank",
  essay: "essay",
  material: "material",
};

// 来源类型映射
const sourceTypeMap: Record<string, QuestionSourceType> = {
  真题: "real_exam",
  模拟题: "mock",
  原创题: "original",
  real_exam: "real_exam",
  mock: "mock",
  original: "original",
};

export function ImportDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: ImportDialogProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 扁平化分类用于选择
  const flattenCategories = (
    cats: CourseCategory[],
    level = 0
  ): { id: number; name: string; level: number; code: string }[] => {
    const result: { id: number; name: string; level: number; code: string }[] = [];
    for (const cat of cats) {
      result.push({ id: cat.id, name: cat.name, level, code: cat.code || "" });
      if (cat.children) {
        result.push(...flattenCategories(cat.children, level + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // 根据分类名称查找分类 ID
  const findCategoryId = (name: string): number | undefined => {
    const found = flatCategories.find(
      (cat) => cat.name === name || cat.code === name
    );
    return found?.id;
  };

  // 解析选项字符串（支持多种格式）
  const parseOptions = (optionStr: string): { key: string; content: string }[] => {
    if (!optionStr) return [];
    
    // 尝试解析 JSON 格式
    try {
      const parsed = JSON.parse(optionStr);
      if (Array.isArray(parsed)) {
        return parsed.map((opt, idx) => ({
          key: typeof opt === "object" ? opt.key : String.fromCharCode(65 + idx),
          content: typeof opt === "object" ? opt.content : opt,
        }));
      }
    } catch {
      // 不是 JSON 格式
    }

    // 尝试解析 "A.xxx|B.xxx" 或 "A、xxx|B、xxx" 格式
    const options: { key: string; content: string }[] = [];
    const parts = optionStr.split(/[|｜;；\n]/);
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // 匹配 "A.xxx" 或 "A、xxx" 或 "A:xxx" 格式
      const match = trimmed.match(/^([A-Za-z])[\.\、\:\：\s](.+)$/);
      if (match) {
        options.push({ key: match[1].toUpperCase(), content: match[2].trim() });
      } else if (options.length < 6) {
        // 如果没有标识符，自动分配
        options.push({
          key: String.fromCharCode(65 + options.length),
          content: trimmed,
        });
      }
    }
    
    return options;
  };

  // 解析标签字符串
  const parseTags = (tagStr: string): string[] => {
    if (!tagStr) return [];
    try {
      const parsed = JSON.parse(tagStr);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // 不是 JSON 格式
    }
    return tagStr.split(/[,，、;；|｜]/).map((t) => t.trim()).filter(Boolean);
  };

  // 验证题目
  const validateQuestion = (q: ParsedQuestion): ParsedQuestion => {
    const errors: string[] = [];
    
    if (!q.content || q.content.trim().length < 5) {
      errors.push("题目内容过短");
    }
    
    if (!q.answer || q.answer.trim().length === 0) {
      errors.push("缺少正确答案");
    }
    
    if (!q.category_id && !q.category_name) {
      if (defaultCategoryId) {
        q.category_id = defaultCategoryId;
      } else {
        errors.push("缺少分类");
      }
    } else if (q.category_name && !q.category_id) {
      const catId = findCategoryId(q.category_name);
      if (catId) {
        q.category_id = catId;
      } else {
        errors.push(`未找到分类：${q.category_name}`);
      }
    }
    
    const choiceTypes: QuestionType[] = ["single_choice", "multi_choice", "judge"];
    if (choiceTypes.includes(q.question_type)) {
      if (!q.options || q.options.length < 2) {
        errors.push("选择题至少需要2个选项");
      }
    }
    
    return {
      ...q,
      category_id: q.category_id || defaultCategoryId,
      isValid: errors.length === 0,
      errors,
    };
  };

  // 解析 Excel 文件
  const parseExcel = (data: ArrayBuffer): ParsedQuestion[] => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    
    return rows.map((row, index) => {
      const q: ParsedQuestion = {
        id: index + 1,
        category_name: row["分类"] || row["category"] || row["category_name"],
        question_type: questionTypeMap[row["题型"] || row["type"] || row["question_type"]] || "single_choice",
        difficulty: parseInt(row["难度"] || row["difficulty"]) || 3,
        source_type: sourceTypeMap[row["来源类型"] || row["source_type"]] || "mock",
        source_year: parseInt(row["年份"] || row["source_year"]) || undefined,
        source_region: row["地区"] || row["source_region"],
        source_exam: row["考试名称"] || row["source_exam"],
        content: row["题目内容"] || row["content"] || "",
        options: parseOptions(row["选项"] || row["options"] || ""),
        answer: String(row["答案"] || row["answer"] || ""),
        analysis: row["解析"] || row["analysis"],
        tips: row["技巧"] || row["tips"],
        tags: parseTags(row["标签"] || row["tags"] || ""),
        is_vip: row["VIP"] === true || row["VIP"] === "是" || row["is_vip"] === true,
        isValid: false,
        errors: [],
      };
      
      return validateQuestion(q);
    });
  };

  // 解析 JSON 文件
  const parseJSON = (data: string): ParsedQuestion[] => {
    try {
      const parsed = JSON.parse(data);
      const questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
      
      return questions.map((row: any, index: number) => {
        const q: ParsedQuestion = {
          id: index + 1,
          category_name: row.category_name || row.category,
          category_id: row.category_id,
          question_type: questionTypeMap[row.question_type || row.type] || "single_choice",
          difficulty: parseInt(row.difficulty) || 3,
          source_type: sourceTypeMap[row.source_type] || "mock",
          source_year: parseInt(row.source_year) || undefined,
          source_region: row.source_region,
          source_exam: row.source_exam,
          content: row.content || "",
          options: Array.isArray(row.options) ? row.options : parseOptions(row.options || ""),
          answer: String(row.answer || ""),
          analysis: row.analysis,
          tips: row.tips,
          tags: Array.isArray(row.tags) ? row.tags : parseTags(row.tags || ""),
          is_vip: row.is_vip || false,
          isValid: false,
          errors: [],
        };
        
        return validateQuestion(q);
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
        
        let questions: ParsedQuestion[] = [];
        
        if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
          questions = parseExcel(result as ArrayBuffer);
        } else if (fileName.endsWith(".json")) {
          questions = parseJSON(result as string);
        } else {
          toast.error("不支持的文件格式，请上传 Excel 或 JSON 文件");
          return;
        }
        
        if (questions.length === 0) {
          toast.error("未解析到任何题目数据");
          return;
        }
        
        setParsedQuestions(questions);
        setStep("preview");
        toast.success(`成功解析 ${questions.length} 道题目`);
      };
      
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
      
      // 清除 input 值，允许重复上传同一文件
      event.target.value = "";
    },
    [defaultCategoryId]
  );

  // 重新验证所有题目
  const revalidateQuestions = useCallback(() => {
    setParsedQuestions((prev) =>
      prev.map((q) => validateQuestion({ ...q, category_id: q.category_id || defaultCategoryId }))
    );
  }, [defaultCategoryId, flatCategories]);

  // 执行导入
  const handleImport = async () => {
    const validQuestions = parsedQuestions.filter((q) => q.isValid);
    if (validQuestions.length === 0) {
      toast.error("没有有效的题目可导入");
      return;
    }
    
    setImporting(true);
    
    try {
      const questionsToCreate: CreateQuestionRequest[] = validQuestions.map((q) => ({
        category_id: q.category_id!,
        question_type: q.question_type,
        difficulty: q.difficulty,
        source_type: q.source_type,
        source_year: q.source_year,
        source_region: q.source_region,
        source_exam: q.source_exam,
        content: q.content,
        options: q.options,
        answer: q.answer,
        analysis: q.analysis,
        tips: q.tips,
        tags: q.tags,
        is_vip: q.is_vip,
        status: 0, // 默认草稿状态
      }));
      
      await questionApi.batchCreateQuestions(questionsToCreate);
      
      setImportResult({
        success: validQuestions.length,
        failed: parsedQuestions.length - validQuestions.length,
        errors: parsedQuestions
          .filter((q) => !q.isValid)
          .map((q) => `#${q.id}: ${q.errors.join(", ")}`),
      });
      setStep("result");
      toast.success(`成功导入 ${validQuestions.length} 道题目`);
      onSuccess();
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
          分类: "xc_yanyu_luoji",
          题型: "单选题",
          难度: 3,
          来源类型: "真题",
          年份: 2024,
          地区: "国考",
          考试名称: "2024年国家公务员考试",
          题目内容: "在这句话中，____处应填入的词语是...",
          选项: "A.选项A|B.选项B|C.选项C|D.选项D",
          答案: "A",
          解析: "这道题考查的是...",
          技巧: "解题时注意...",
          标签: "高频,逻辑填空",
          VIP: "否",
        },
      ];
      
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "题目导入模板");
      XLSX.writeFile(wb, "题目导入模板.xlsx");
    } else {
      const templateData = {
        questions: [
          {
            category_name: "xc_yanyu_luoji",
            question_type: "single_choice",
            difficulty: 3,
            source_type: "real_exam",
            source_year: 2024,
            source_region: "国考",
            source_exam: "2024年国家公务员考试",
            content: "在这句话中，____处应填入的词语是...",
            options: [
              { key: "A", content: "选项A" },
              { key: "B", content: "选项B" },
              { key: "C", content: "选项C" },
              { key: "D", content: "选项D" },
            ],
            answer: "A",
            analysis: "这道题考查的是...",
            tips: "解题时注意...",
            tags: ["高频", "逻辑填空"],
            is_vip: false,
          },
        ],
      };
      
      const blob = new Blob([JSON.stringify(templateData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "题目导入模板.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 重置状态
  const handleReset = () => {
    setStep("upload");
    setParsedQuestions([]);
    setImportResult(null);
  };

  const validCount = parsedQuestions.filter((q) => q.isValid).length;
  const invalidCount = parsedQuestions.filter((q) => !q.isValid).length;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            批量导入题目
          </DialogTitle>
          <DialogDescription className="text-xs">
            支持 Excel (.xlsx) 和 JSON 格式导入
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "upload" && (
            <div className="space-y-4 py-3">
              {/* 默认分类选择 */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">默认分类（可选）</Label>
                <Select
                  value={defaultCategoryId ? defaultCategoryId.toString() : ""}
                  onValueChange={(v) => setDefaultCategoryId(Number(v))}
                >
                  <SelectTrigger className="w-full h-9 text-sm">
                    <SelectValue placeholder="选择默认分类（文件中未指定分类时使用）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">不设置默认分类</SelectItem>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {"　".repeat(cat.level)}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                  Excel 模板
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
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
                  <div>• 分类：分类名称或编码（如 xc_yanyu_luoji）</div>
                  <div>• 题型：单选题/多选题/判断题/填空题/简答题</div>
                  <div>• 难度：1-5（1最简单，5最难）</div>
                  <div>• 来源类型：真题/模拟题/原创题</div>
                  <div>• 选项：格式 A.内容|B.内容|C.内容|D.内容</div>
                  <div>• 标签：用逗号分隔多个标签</div>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4 py-4">
              {/* 统计信息 */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-blue-500" />
                  <span>共 {parsedQuestions.length} 道题目</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>有效 {validCount} 道</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>无效 {invalidCount} 道</span>
                  </div>
                )}
                <div className="ml-auto">
                  <Button variant="outline" size="sm" onClick={revalidateQuestions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    重新验证
                  </Button>
                </div>
              </div>

              {/* 题目列表 */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">全部 ({parsedQuestions.length})</TabsTrigger>
                  <TabsTrigger value="valid">有效 ({validCount})</TabsTrigger>
                  <TabsTrigger value="invalid">无效 ({invalidCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <QuestionPreviewTable questions={parsedQuestions} />
                </TabsContent>
                <TabsContent value="valid" className="mt-4">
                  <QuestionPreviewTable
                    questions={parsedQuestions.filter((q) => q.isValid)}
                  />
                </TabsContent>
                <TabsContent value="invalid" className="mt-4">
                  <QuestionPreviewTable
                    questions={parsedQuestions.filter((q) => !q.isValid)}
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
                  成功导入 <span className="text-green-600 font-medium">{importResult.success}</span> 道题目
                  {importResult.failed > 0 && (
                    <>
                      ，<span className="text-red-600 font-medium">{importResult.failed}</span> 道失败
                    </>
                  )}
                </p>
              </div>
              {importResult.errors.length > 0 && (
                <div className="text-left bg-red-50 rounded-lg p-4">
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
                    导入 {validCount} 道题目
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

// 题目预览表格组件
function QuestionPreviewTable({ questions }: { questions: ParsedQuestion[] }) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无题目
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="w-[80px]">状态</TableHead>
            <TableHead className="min-w-[200px]">题目内容</TableHead>
            <TableHead>题型</TableHead>
            <TableHead>难度</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>答案</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((q) => (
            <TableRow key={q.id} className={!q.isValid ? "bg-red-50" : ""}>
              <TableCell className="font-mono text-xs">{q.id}</TableCell>
              <TableCell>
                {q.isValid ? (
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
                <div className="max-w-[300px]">
                  <p className="text-sm truncate">{q.content}</p>
                  {!q.isValid && q.errors.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      {q.errors.join(", ")}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {getQuestionTypeName(q.question_type)}
                </Badge>
              </TableCell>
              <TableCell>{getDifficultyLabel(q.difficulty)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {q.category_name || (q.category_id ? `ID:${q.category_id}` : "-")}
              </TableCell>
              <TableCell className="font-mono">{q.answer}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
