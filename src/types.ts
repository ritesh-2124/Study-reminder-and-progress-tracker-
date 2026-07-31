export type Priority = 'high' | 'medium' | 'low';
export type Status = 'not-started' | 'in-progress' | 'reviewing' | 'completed';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topicTitle?: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  status: Status;
  estimatedHours: number;
  completedHours: number;
  targetDate: string; // ISO date format string YYYY-MM-DD
  notes?: string;
  resourceUrl?: string;
  flashcards?: Flashcard[];
  lastStudiedAt?: string;
  createdAt: string;
  updatedAt: string;
  source?: 'chatgpt' | 'manual' | 'template';
}

export interface ReminderConfig {
  email: string;
  enabled: boolean;
  scheduledTime: string; // e.g. "08:00"
  timezone: string;
  includeAIDigest: boolean;
  maxTopicsPerEmail: number;
  selectedPriorities: Priority[];
  frequency: 'daily' | 'weekdays' | 'custom';
}

export interface ReminderLog {
  id: string;
  sentAt: string;
  recipientEmail: string;
  subject: string;
  topicsIncludedCount: number;
  status: 'success' | 'failed';
  errorDetails?: string;
  previewHtml?: string;
}

export interface StudyStats {
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  highPriorityPending: number;
  mediumPriorityPending: number;
  lowPriorityPending: number;
  completionRatePercentage: number;
  totalHoursNeeded: number;
  totalHoursCompleted: number;
  currentStreakDays: number;
  lastStudyDate?: string;
  categoryBreakdown: { category: string; total: number; completed: number }[];
  recentAssessmentAvg?: number;
}

export interface AIDigestResult {
  headline: string;
  dailyFocusAdvice: string;
  suggestedActionItems: string[];
  motivationalQuote: string;
  topTopicsToStudyToday: { id: string; title: string; priority: Priority; reason: string }[];
}

export interface AssessmentResult {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  topicsCovered: string[];
  feedback: string;
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface WeeklyDashboardReport {
  weekRange: string;
  overallGrade: string;
  dailyAssessmentAvg: number;
  weeklyAssessmentScore: number;
  topicsMasteredCount: number;
  strongTopics: string[];
  weakTopics: string[];
  aiExecutiveSummary: string;
  actionPlanForNextWeek: string[];
}

