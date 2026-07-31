import React, { useState, useEffect } from 'react';
import { AssessmentResult, QuizQuestion, WeeklyDashboardReport } from '../types';
import { API } from '../services/api';
import { Award, CheckCircle2, XCircle, Sparkles, Calendar, Clock, RotateCcw, BarChart3, TrendingUp, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';

interface AssessmentViewProps {
  onAssessmentCompleted?: () => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onAssessmentCompleted }) => {
  const [history, setHistory] = useState<AssessmentResult[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyDashboardReport | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'history'>('daily');

  // Active quiz state
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizType, setQuizType] = useState<'daily' | 'weekly'>('daily');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<AssessmentResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadHistoryAndReport = async () => {
    try {
      const [hist, rep] = await Promise.all([
        API.getAssessmentHistory(),
        API.getWeeklyDashboardReport(),
      ]);
      setHistory(hist);
      setWeeklyReport(rep);
    } catch (err) {
      console.error('Error loading assessment history:', err);
    }
  };

  useEffect(() => {
    loadHistoryAndReport();
  }, []);

  const handleStartDailyAssessment = async () => {
    setIsLoadingQuiz(true);
    setIsSubmitted(false);
    setSubmittedResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setQuizType('daily');

    try {
      const data = await API.getDailyAssessment();
      setQuizTitle(data.title || 'Daily Learning Assessment');
      setQuizQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to generate daily assessment:', err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleStartWeeklyAssessment = async () => {
    setIsLoadingQuiz(true);
    setIsSubmitted(false);
    setSubmittedResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    setQuizType('weekly');

    try {
      const data = await API.getWeeklyAssessment();
      setQuizTitle(data.title || 'Weekly Comprehensive Exam');
      setQuizQuestions(data.questions || []);
    } catch (err) {
      console.error('Failed to generate weekly assessment:', err);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (quizQuestions.length === 0) return;

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const topicsCovered: string[] = Array.from(new Set(quizQuestions.map(q => q.topicTitle || 'General Topic').filter(Boolean))) as string[];

    let feedback = 'Good effort!';
    if (scorePct >= 90) feedback = 'Outstanding mastery! Retained key concepts flawlessly.';
    else if (scorePct >= 70) feedback = 'Solid retention! Review the highlighted missed topics.';
    else feedback = 'Needs review. Schedule extra study time on missed concepts.';

    setIsSaving(true);
    try {
      const res = await API.saveAssessmentResult({
        type: quizType,
        scorePercentage: scorePct,
        totalQuestions: quizQuestions.length,
        correctCount,
        topicsCovered,
        feedback,
        questions: quizQuestions,
        userAnswers: Object.keys(selectedAnswers).map(k => selectedAnswers[Number(k)]),
      });

      setSubmittedResult(res.result);
      setIsSubmitted(true);
      loadHistoryAndReport();
      if (onAssessmentCompleted) onAssessmentCompleted();
    } catch (err) {
      console.error('Error saving assessment result:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Assessment Selection */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold">Daily & Weekly Assessment Center</h2>
            </div>
            <p className="text-xs text-slate-300">
              Verify your retention daily and evaluate comprehensive mastery weekly with AI-generated drills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('daily');
                handleStartDailyAssessment();
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              Start Daily Assessment
            </button>

            <button
              onClick={() => {
                setActiveTab('weekly');
                handleStartWeeklyAssessment();
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-slate-950" />
              Take Weekly Exam
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'daily' ? 'bg-white/20 text-white' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            Daily Drill Mode
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'weekly' ? 'bg-white/20 text-white' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            Weekly Retention Exam
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'history' ? 'bg-white/20 text-white' : 'text-slate-300 hover:bg-white/10'
            }`}
          >
            Assessment Logs & Weekly Dashboard Report
          </button>
        </div>
      </div>

      {/* QUIZ INTERACTIVE MODE */}
      {(activeTab === 'daily' || activeTab === 'weekly') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          {isLoadingQuiz ? (
            <div className="py-16 text-center space-y-3">
              <div className="inline-block animate-spin text-blue-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Generating {activeTab === 'daily' ? 'Daily Assessment Drill' : 'Weekly Comprehensive Exam'} using Gemini AI...
              </p>
              <p className="text-[11px] text-slate-500">Analyzing your study topics and generating high-yield questions</p>
            </div>
          ) : quizQuestions.length > 0 ? (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {activeTab === 'daily' ? 'Daily Assessment' : 'Weekly Exam'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{quizTitle}</h3>
                </div>

                {!isSubmitted && (
                  <div className="text-xs font-bold text-slate-500">
                    Question {currentQuestionIdx + 1} of {quizQuestions.length}
                  </div>
                )}
              </div>

              {/* Submitted Results Summary */}
              {isSubmitted && submittedResult ? (
                <div className="space-y-6 pt-4">
                  <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Assessment Completed & Saved to Dashboard Report
                      </div>
                      <h4 className="text-xl font-bold">{submittedResult.feedback}</h4>
                      <p className="text-xs text-slate-300">
                        Topics Covered: {submittedResult.topicsCovered.join(', ')}
                      </p>
                    </div>

                    <div className="text-center bg-white/10 px-8 py-4 rounded-2xl border border-white/10 shrink-0">
                      <div className="text-4xl font-black text-amber-400">{submittedResult.scorePercentage}%</div>
                      <div className="text-xs font-bold text-slate-300 mt-1">
                        {submittedResult.correctCount} / {submittedResult.totalQuestions} Correct
                      </div>
                    </div>
                  </div>

                  {/* Question Review Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Detailed Answers & Explanations</h4>
                    {quizQuestions.map((q, qIdx) => {
                      const userAns = selectedAnswers[qIdx];
                      const isCorrect = userAns === q.correctAnswerIndex;
                      return (
                        <div key={qIdx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'} space-y-3`}>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-xs font-bold text-slate-900">
                              Q{qIdx + 1}. {q.question}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const isUserChoice = userAns === oIdx;
                              const isCorrectOpt = q.correctAnswerIndex === oIdx;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                                    isCorrectOpt
                                      ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 font-bold'
                                      : isUserChoice
                                      ? 'bg-red-100/80 border-red-300 text-red-900 font-bold'
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                  {isUserChoice && !isCorrectOpt && <XCircle className="w-4 h-4 text-red-600" />}
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-xs text-slate-600 bg-white/80 p-3 rounded-lg border border-slate-200/60 font-medium">
                            <strong className="text-slate-900">Explanation:</strong> {q.explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={activeTab === 'daily' ? handleStartDailyAssessment : handleStartWeeklyAssessment}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Take Another Assessment
                    </button>
                  </div>
                </div>
              ) : (
                /* Question View */
                <div className="space-y-6 pt-4">
                  {quizQuestions[currentQuestionIdx] && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-900">
                          {quizQuestions[currentQuestionIdx].question}
                        </p>
                        {quizQuestions[currentQuestionIdx].topicTitle && (
                          <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                            Topic: {quizQuestions[currentQuestionIdx].topicTitle}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {quizQuestions[currentQuestionIdx].options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: oIdx }))
                              }
                              className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40"
                    >
                      Previous Question
                    </button>

                    {currentQuestionIdx < quizQuestions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitAssessment}
                        disabled={isSaving || Object.keys(selectedAnswers).length < quizQuestions.length}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isSaving ? 'Submitting & Saving...' : 'Submit Assessment'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <Award className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Ready to test your knowledge?</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Click below to generate a tailored {activeTab === 'daily' ? '5-question Daily Drill' : '10-question Weekly Exam'} covering your current study materials.
              </p>
              <button
                onClick={activeTab === 'daily' ? handleStartDailyAssessment : handleStartWeeklyAssessment}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate {activeTab === 'daily' ? 'Daily Drill' : 'Weekly Exam'} Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD REPORT & ASSESSMENT LOGS HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* AI Executive Weekly Report Card */}
          {weeklyReport && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Weekly Dashboard Performance Report</h3>
                    <p className="text-xs text-slate-500 font-medium">{weeklyReport.weekRange}</p>
                  </div>
                </div>

                <div className="px-4 py-2 bg-slate-900 text-white rounded-xl text-center self-start sm:self-auto">
                  <div className="text-xs font-bold text-slate-400">Overall Grade</div>
                  <div className="text-2xl font-black text-amber-400">{weeklyReport.overallGrade}</div>
                </div>
              </div>

              {/* Stats Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Daily Assessment Avg</span>
                  <span className="text-2xl font-black text-slate-900">{weeklyReport.dailyAssessmentAvg}%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Weekly Retention Exam</span>
                  <span className="text-2xl font-black text-blue-600">{weeklyReport.weeklyAssessmentScore}%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Topics Mastered</span>
                  <span className="text-2xl font-black text-emerald-600">{weeklyReport.topicsMasteredCount} Topics</span>
                </div>
              </div>

              {/* AI Executive Summary */}
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Executive Retention Summary
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {weeklyReport.aiExecutiveSummary}
                </p>
              </div>

              {/* Action Plan & Strengths */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Strong Mastery Areas
                  </h4>
                  <ul className="space-y-1.5">
                    {weeklyReport.strongTopics.map((item, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Next Week's Learning Goals
                  </h4>
                  <ul className="space-y-1.5">
                    {weeklyReport.actionPlanForNextWeek.map((item, idx) => (
                      <li key={idx} className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Assessment Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Assessment History & Scores</h3>
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                      <th className="p-3 rounded-l-xl">Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Correct</th>
                      <th className="p-3">Topics Tested</th>
                      <th className="p-3 rounded-r-xl">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                              item.type === 'weekly'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.type === 'weekly' ? 'Weekly Exam' : 'Daily Drill'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{item.date}</td>
                        <td className="p-3 font-black text-slate-900">{item.scorePercentage}%</td>
                        <td className="p-3 font-medium text-slate-600">{item.correctCount} / {item.totalQuestions}</td>
                        <td className="p-3 text-slate-800 font-medium">{item.topicsCovered.slice(0, 2).join(', ')}</td>
                        <td className="p-3 text-slate-600 italic font-medium">{item.feedback}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No assessment logs recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
