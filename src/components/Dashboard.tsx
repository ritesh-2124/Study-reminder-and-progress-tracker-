import React, { useState, useEffect } from 'react';
import { StudyTopic, StudyStats, AIDigestResult, WeeklyDashboardReport } from '../types';
import { API } from '../services/api';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, Target, Flame, ArrowRight, BookOpen, RefreshCw, Award, BarChart3, FileText } from 'lucide-react';

interface DashboardProps {
  topics: StudyTopic[];
  stats: StudyStats | null;
  onRefresh: () => void;
  onSelectTopicForAI: (topic: StudyTopic, mode: 'quiz' | 'explain' | 'flashcards') => void;
  onQuickToggleComplete: (id: string, completed: boolean) => void;
  onNavigateToAssessments?: () => void;
  onOpenChatGPTImporter?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  topics,
  stats,
  onRefresh,
  onSelectTopicForAI,
  onQuickToggleComplete,
  onNavigateToAssessments,
  onOpenChatGPTImporter,
}) => {
  const [aiDigest, setAiDigest] = useState<AIDigestResult | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyDashboardReport | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [digestError, setDigestError] = useState<string | null>(null);

  const fetchAIDigestAndReport = async () => {
    setLoadingDigest(true);
    setDigestError(null);
    try {
      const [dig, rep] = await Promise.all([
        API.generateAIDigest(),
        API.getWeeklyDashboardReport(),
      ]);
      setAiDigest(dig);
      setWeeklyReport(rep);
    } catch (err: any) {
      console.error('Failed to load AI digest:', err);
      setDigestError(err.message || 'Could not generate AI digest');
    } finally {
      setLoadingDigest(false);
    }
  };

  useEffect(() => {
    fetchAIDigestAndReport();
  }, []);

  const pendingHigh = topics.filter(t => t.priority === 'high' && t.status !== 'completed');
  const pendingMedium = topics.filter(t => t.priority === 'medium' && t.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Completion</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.completionRatePercentage || 0}%</span>
            <span className="text-xs font-semibold text-slate-500">
              {stats?.completedTopics || 0} / {stats?.totalTopics || 0} Topics
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionRatePercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Assessment Avg Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs cursor-pointer hover:border-amber-300 transition-all" onClick={onNavigateToAssessments}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Avg Score</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600">{stats?.recentAssessmentAvg || 88}%</span>
            <span className="text-xs font-bold text-slate-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Grade {weeklyReport?.overallGrade || 'A'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium flex items-center justify-between">
            <span>Daily & Weekly Exams</span>
            <span className="text-blue-600 font-bold hover:underline">Take Drill →</span>
          </p>
        </div>

        {/* High Priority Warning Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Priority Needed</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-red-600">{stats?.highPriorityPending || 0}</span>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              Urgent Focus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Included first in 8 AM morning digest</p>
        </div>

        {/* Streak Counter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Study Streak</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Flame className="w-5 h-5 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600">{stats?.currentStreakDays || 0} Days</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              On Track 🔥
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Updated on completed assessments</p>
        </div>
      </div>

      {/* AI Daily Learning Update Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-xl">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Daily Learning Update & Action Plan</h2>
              <p className="text-xs text-slate-300">Generated by Gemini AI • Tailored for your morning study session</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChatGPTImporter && (
              <button
                onClick={onOpenChatGPTImporter}
                className="px-3.5 py-1.5 text-xs font-bold text-blue-200 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Import ChatGPT Notes
              </button>
            )}

            <button
              onClick={fetchAIDigestAndReport}
              disabled={loadingDigest}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDigest ? 'animate-spin' : ''}`} />
              Refresh Plan
            </button>
          </div>
        </div>

        {loadingDigest ? (
          <div className="py-8 text-center space-y-2">
            <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-300 font-medium">Gemini AI is analyzing your study materials and ChatGPT imports...</p>
          </div>
        ) : digestError ? (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-200 text-xs">
            {digestError}
          </div>
        ) : aiDigest ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-blue-200">{aiDigest.headline}</h3>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">{aiDigest.dailyFocusAdvice}</p>
            </div>

            {aiDigest.suggestedActionItems && aiDigest.suggestedActionItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiDigest.suggestedActionItems.map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center border border-blue-400/30">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 italic">
              <span>"{aiDigest.motivationalQuote}"</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-300">Click Refresh Plan to generate your customized AI study digest.</p>
        )}
      </div>

      {/* Main Grid: Priorities Breakdown & Daily Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's High Priority Study Focus (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Priority Study Queue</h3>
              <p className="text-xs text-slate-500">High & Medium priority materials scheduled for review</p>
            </div>
            <span className="px-3 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-200">
              {pendingHigh.length} High Priority Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingHigh.concat(pendingMedium).slice(0, 5).map(topic => (
              <div
                key={topic.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={topic.status === 'completed'}
                    onChange={e => onQuickToggleComplete(topic.id, e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{topic.title}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          topic.priority === 'high'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : topic.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {topic.priority} Priority
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {topic.category}
                      </span>
                    </div>
                    {topic.notes && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{topic.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectTopicForAI(topic, 'quiz')}
                    className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                  >
                    AI Quiz
                  </button>
                  <button
                    onClick={() => onSelectTopicForAI(topic, 'flashcards')}
                    className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                  >
                    Flashcards
                  </button>
                  <button
                    onClick={() => onSelectTopicForAI(topic, 'explain')}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Explain
                  </button>
                </div>
              </div>
            ))}

            {pendingHigh.length === 0 && pendingMedium.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                🎉 Awesome work! No high or medium priority pending topics remaining right now.
              </div>
            )}
          </div>
        </div>

        {/* Priority & Category Breakdown (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Priority Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of study material priorities</p>
          </div>

          <div className="space-y-4">
            {/* High */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span> High Priority
                </span>
                <span className="text-slate-700">
                  {topics.filter(t => t.priority === 'high').length} topics
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${topics.length > 0 ? (topics.filter(t => t.priority === 'high').length / topics.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium Priority
                </span>
                <span className="text-slate-700">
                  {topics.filter(t => t.priority === 'medium').length} topics
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${topics.length > 0 ? (topics.filter(t => t.priority === 'medium').length / topics.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Low */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Low Priority
                </span>
                <span className="text-slate-700">
                  {topics.filter(t => t.priority === 'low').length} topics
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${topics.length > 0 ? (topics.filter(t => t.priority === 'low').length / topics.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Categories Mastery</h4>
            <div className="space-y-3">
              {stats?.categoryBreakdown.map(cat => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="text-slate-500 font-medium">
                      {cat.completed}/{cat.total} completed
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-slate-800 h-1.5 rounded-full"
                      style={{ width: `${cat.total > 0 ? (cat.completed / cat.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
