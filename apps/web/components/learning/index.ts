// 学习组件库
// 用于公考学习内容展示的可复用组件

// 视频播放组件
export { VideoPlayer } from "./VideoPlayer";
export type { default as VideoPlayerProps } from "./VideoPlayer";

// 文档阅读组件
export { DocumentReader } from "./DocumentReader";
export type { default as DocumentReaderProps } from "./DocumentReader";

// 思维导图组件
export { MindMap } from "./MindMap";
export type { MindMapNode } from "./MindMap";

// 知识点卡片组件
export {
  KnowledgeCard,
  KnowledgeCardDeck,
} from "./KnowledgeCard";
export type {
  KnowledgePointData,
  MasteryLevel,
} from "./KnowledgeCard";

// 公式展示组件
export {
  FormulaDisplay,
  FormulaList,
} from "./FormulaDisplay";
export type {
  FormulaData,
  FormulaCategory,
} from "./FormulaDisplay";

// 题型讲解组件
export { QuestionTypeGuide } from "./QuestionTypeGuide";
export type {
  QuestionTypeData,
  SolutionStep,
  ExampleQuestion,
  CommonMistake,
  RelatedKnowledge,
} from "./QuestionTypeGuide";

// 学习进度组件
export {
  LearningProgress,
  ProgressRing,
  ProgressBar,
  KnowledgeTree,
  LearningDuration,
} from "./LearningProgress";
export type {
  KnowledgeNode,
  KnowledgeStatus,
  LearningStats,
  LearningCalendarData,
} from "./LearningProgress";

// 素材展示组件
export {
  MaterialCard,
  MaterialCarousel,
  MaterialLibrary,
} from "./MaterialDisplay";
export type {
  MaterialData,
  MaterialType,
  MaterialCategory,
} from "./MaterialDisplay";

// AI 内容展示组件
export { CoursePreview } from "./CoursePreview";
export { ChapterPractice } from "./ChapterPractice";
export { CourseReview } from "./CourseReview";

// AI 学习增强组件
export { LearningSidebar } from "./LearningSidebar";
export type { KnowledgePoint, NoteTemplate } from "./LearningSidebar";
export { VideoTimeline } from "./VideoTimeline";
export type { VideoTimePoint, TimePointType } from "./VideoTimeline";
export { KeyPointsCard } from "./KeyPointsCard";
export type { KeyPoint, KeyPointType, FlashCard } from "./KeyPointsCard";

// AI 做题学习组件
export { QuestionAnalysis } from "./QuestionAnalysis";
export type {
  QuestionAnalysisData,
  SolutionStep as QASolutionStep,
  OptionAnalysis,
  RelatedKnowledge as QARelatedKnowledge,
  SolutionTip,
} from "./QuestionAnalysis";
export { WrongQuestionAnalysis } from "./WrongQuestionAnalysis";
export type {
  ErrorType,
  ErrorAnalysis,
  RecommendedResource,
  SimilarQuestion,
  ErrorStatistics,
  WrongQuestionData,
} from "./WrongQuestionAnalysis";
export { PracticeHints } from "./PracticeHints";
export type {
  HintType,
  PracticeHint,
  QuickReference,
  MethodCard,
} from "./PracticeHints";

// AI 做题学习展示组件 (§26.3)
export { QuestionAnalysis } from "./QuestionAnalysis";
export type { AIAnalysisData } from "./QuestionAnalysis";
export { WrongQuestionAnalysis } from "./WrongQuestionAnalysis";
export type { AIErrorAnalysisData, ErrorType, ErrorHistoryItem } from "./WrongQuestionAnalysis";
export { PracticeHints } from "./PracticeHints";
export type { AIPracticeHintsData, HintLevel } from "./PracticeHints";
