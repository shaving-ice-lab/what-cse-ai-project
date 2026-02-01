// 交互式课堂组件导出

// 步骤式学习版（推荐使用）
export { StepBasedRenderer } from "./StepBasedRenderer";

// 简洁版
export { SimpleClassroomRenderer } from "./SimpleClassroomRenderer";

// 完整交互版（备用）
export { ClassroomProvider, useClassroom } from "./ClassroomContext";
export type { Section, SectionType, LearningProgress } from "./ClassroomContext";

export { ClassroomSidebar } from "./ClassroomSidebar";
export { ClassroomToolbar } from "./ClassroomToolbar";
export {
  ClassroomSlideViewer,
  SectionHeader,
  ContentCard,
  StepReveal,
} from "./ClassroomSlideViewer";
export {
  FlipCard,
  ConceptCardGrid,
  ProgressiveReveal,
  FormulaCard,
  MistakeCard,
} from "./InteractiveCards";
export { InteractiveQuiz, QuickCheck } from "./InteractiveQuiz";
export { InteractiveContentRenderer } from "./InteractiveContentRenderer";
