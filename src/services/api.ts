import { StudyTopic, ReminderConfig, ReminderLog, StudyStats, AIDigestResult, QuizQuestion, Flashcard, AssessmentResult, WeeklyDashboardReport } from '../types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errBody.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const API = {
  // Topics
  getTopics: async (): Promise<StudyTopic[]> => fetchJSON<StudyTopic[]>('/api/topics'),

  createTopic: async (topic: Partial<StudyTopic>): Promise<StudyTopic> =>
    fetchJSON<StudyTopic>('/api/topics', {
      method: 'POST',
      body: JSON.stringify(topic),
    }),

  updateTopic: async (id: string, updates: Partial<StudyTopic>): Promise<StudyTopic> =>
    fetchJSON<StudyTopic>(`/api/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteTopic: async (id: string): Promise<{ success: boolean }> =>
    fetchJSON<{ success: boolean }>(`/api/topics/${id}`, {
      method: 'DELETE',
    }),

  loadDefaultTemplate: async (templateType: string): Promise<StudyTopic[]> =>
    fetchJSON<StudyTopic[]>('/api/topics/load-template', {
      method: 'POST',
      body: JSON.stringify({ templateType }),
    }),

  // ChatGPT Material Importer
  importChatGPTMaterial: async (textContent: string, category?: string): Promise<{ importedCount: number; topics: StudyTopic[] }> =>
    fetchJSON<{ importedCount: number; topics: StudyTopic[] }>('/api/chatgpt/import', {
      method: 'POST',
      body: JSON.stringify({ textContent, category }),
    }),

  // Assessments & Drills
  getDailyAssessment: async (): Promise<{ title: string; questions: QuizQuestion[] }> =>
    fetchJSON<{ title: string; questions: QuizQuestion[] }>('/api/assessments/daily', { method: 'POST' }),

  getWeeklyAssessment: async (): Promise<{ title: string; questions: QuizQuestion[] }> =>
    fetchJSON<{ title: string; questions: QuizQuestion[] }>('/api/assessments/weekly', { method: 'POST' }),

  saveAssessmentResult: async (resultData: Partial<AssessmentResult>): Promise<{ success: boolean; result: AssessmentResult; streak: number }> =>
    fetchJSON<{ success: boolean; result: AssessmentResult; streak: number }>('/api/assessments/result', {
      method: 'POST',
      body: JSON.stringify(resultData),
    }),

  getAssessmentHistory: async (): Promise<AssessmentResult[]> => fetchJSON<AssessmentResult[]>('/api/assessments/history'),

  getWeeklyDashboardReport: async (): Promise<WeeklyDashboardReport> => fetchJSON<WeeklyDashboardReport>('/api/assessments/weekly-report'),

  // Stats
  getStats: async (): Promise<StudyStats> => fetchJSON<StudyStats>('/api/stats'),

  // Reminder Configuration
  getReminderConfig: async (): Promise<ReminderConfig> => fetchJSON<ReminderConfig>('/api/reminder/config'),

  updateReminderConfig: async (config: Partial<ReminderConfig>): Promise<ReminderConfig> =>
    fetchJSON<ReminderConfig>('/api/reminder/config', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  sendReminderNow: async (accessToken?: string, recipientEmail?: string): Promise<{ success: boolean; log: ReminderLog; sentVia?: string; notice?: string }> =>
    fetchJSON<{ success: boolean; log: ReminderLog; sentVia?: string; notice?: string }>('/api/reminder/send-now', {
      method: 'POST',
      body: JSON.stringify({ accessToken, recipientEmail }),
    }),

  getReminderLogs: async (): Promise<ReminderLog[]> => fetchJSON<ReminderLog[]>('/api/reminder/logs'),

  // AI Assistant Services
  generateAIDigest: async (): Promise<AIDigestResult> => fetchJSON<AIDigestResult>('/api/ai/digest', { method: 'POST' }),

  generateQuiz: async (topicTitle: string, notes?: string): Promise<{ questions: QuizQuestion[] }> =>
    fetchJSON<{ questions: QuizQuestion[] }>('/api/ai/quiz', {
      method: 'POST',
      body: JSON.stringify({ topicTitle, notes }),
    }),

  generateFlashcards: async (topicTitle: string, notes?: string): Promise<{ flashcards: Flashcard[] }> =>
    fetchJSON<{ flashcards: Flashcard[] }>('/api/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify({ topicTitle, notes }),
    }),

  explainTopic: async (topicTitle: string, userQuery?: string): Promise<{ explanation: string }> =>
    fetchJSON<{ explanation: string }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ topicTitle, userQuery }),
    }),
};

