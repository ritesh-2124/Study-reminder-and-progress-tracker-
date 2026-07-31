import React, { useState, useEffect } from 'react';
import { StudyTopic, QuizQuestion, Flashcard } from '../types';
import { API } from '../services/api';
import { Sparkles, X, CheckCircle, HelpCircle, BookOpen, Layers, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: StudyTopic | null;
  mode: 'quiz' | 'explain' | 'flashcards';
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  topic,
  mode: initialMode,
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'explain' | 'flashcards'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Explanation state
  const [explanation, setExplanation] = useState('');
  const [userQuestion, setUserQuestion] = useState('');

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if (isOpen && topic) {
      loadContent(activeTab);
    }
  }, [isOpen, topic, activeTab]);

  if (!isOpen || !topic) return null;

  const loadContent = async (tab: 'quiz' | 'explain' | 'flashcards') => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'quiz') {
        const res = await API.generateQuiz(topic.title, topic.notes);
        setQuizQuestions(res.questions || []);
        setUserAnswers(new Array(res.questions?.length || 0).fill(-1));
        setQuizSubmitted(false);
      } else if (tab === 'flashcards') {
        if (topic.flashcards && topic.flashcards.length > 0) {
          setFlashcards(topic.flashcards);
        } else {
          const res = await API.generateFlashcards(topic.title, topic.notes);
          setFlashcards(res.flashcards || []);
        }
        setFlippedCards({});
      } else if (tab === 'explain') {
        const res = await API.explainTopic(topic.title, userQuestion || topic.notes);
        setExplanation(res.explanation || '');
      }
    } catch (err: any) {
      console.error('AI Error:', err);
      setError(err.message || 'Failed to load AI content');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = oIdx;
    setUserAnswers(newAnswers);
  };

  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) score += 1;
    });
    return score;
  };

  const toggleFlipCard = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold">AI Study Companion</h3>
              <p className="text-xs text-slate-300 line-clamp-1">{topic.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 inline mr-1.5" />
            Practice Quiz
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'flashcards'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1.5" />
            Flashcards
          </button>
          <button
            onClick={() => setActiveTab('explain')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'explain'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
            Topic Breakdown
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600">
                Gemini AI is generating high-yield study material for "{topic.title}"...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : activeTab === 'quiz' ? (
            <div className="space-y-6">
              {quizQuestions.length > 0 ? (
                <>
                  {quizQuestions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <p className="font-bold text-sm text-slate-900">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === oIdx;
                          const isCorrect = q.correctAnswerIndex === oIdx;

                          let btnStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100';
                          if (isSelected) {
                            btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-bold';
                          }
                          if (quizSubmitted) {
                            if (isCorrect) {
                              btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'border-red-500 bg-red-50 text-red-900 font-bold';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectAnswer(qIdx, oIdx)}
                              className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && isCorrect && (
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="mt-2 p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-900">
                          <span className="font-bold">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={userAnswers.includes(-1)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-colors"
                      >
                        Submit Quiz & Check Score
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-extrabold text-slate-900">
                          Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                        </span>
                        <button
                          onClick={() => loadContent('quiz')}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Try New Questions
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No quiz questions generated.</p>
              )}
            </div>
          ) : activeTab === 'flashcards' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 mb-2">Click any flashcard to flip and test your active recall:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {flashcards.map(card => {
                  const isFlipped = flippedCards[card.id];
                  return (
                    <div
                      key={card.id}
                      onClick={() => toggleFlipCard(card.id)}
                      className={`cursor-pointer min-h-[140px] p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between shadow-xs ${
                        isFlipped
                          ? 'bg-blue-900 text-white border-blue-700'
                          : 'bg-white text-slate-900 border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="space-y-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isFlipped ? 'bg-blue-800 text-blue-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isFlipped ? 'Answer' : 'Question / Concept'}
                        </span>
                        <p className="text-sm font-bold leading-relaxed">
                          {isFlipped ? card.answer : card.question}
                        </p>
                      </div>
                      <span className={`text-[10px] mt-4 block self-end ${isFlipped ? 'text-blue-300' : 'text-slate-400'}`}>
                        Click to flip 🔄
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl whitespace-pre-line text-xs leading-relaxed font-medium text-slate-800">
                {explanation}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={userQuestion}
                  onChange={e => setUserQuestion(e.target.value)}
                  placeholder="Ask a specific question about this topic..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => loadContent('explain')}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Ask AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
