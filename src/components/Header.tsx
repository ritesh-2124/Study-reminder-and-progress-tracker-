import React from 'react';
import { BookOpen, Flame, Clock, Mail, LayoutDashboard, ListTodo, Settings, Award, Sparkles } from 'lucide-react';
import { ReminderConfig } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'topics' | 'assessments' | 'reminder';
  setActiveTab: (tab: 'dashboard' | 'topics' | 'assessments' | 'reminder') => void;
  streakDays: number;
  reminderConfig: ReminderConfig;
  onSendReminderNow: () => void;
  onOpenChatGPTImporter: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  reminderConfig,
  onSendReminderNow,
  onOpenChatGPTImporter,
  userEmail = 'riteshyad222000@gmail.com',
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3.5">
          {/* Brand & Status */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Study Reminder & Assessment Hub</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Clock className="w-3.5 h-3.5" />
                  8:00 AM Cron Active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Daily ChatGPT Updates • Daily & Weekly Assessments • Dashboard Reports • 8 AM Gmail Reminders
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakDays} Day Study Streak</span>
            </div>

            {/* Import ChatGPT Materials */}
            <button
              onClick={onOpenChatGPTImporter}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
              title="Import study notes or material copied from your ChatGPT project"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Import ChatGPT Project</span>
            </button>

            {/* Quick Test Reminder Button */}
            <button
              onClick={onSendReminderNow}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors"
              title="Send an immediate 8 AM reminder digest preview email"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Daily Email Now</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard & Reports
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'topics'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Study Materials & Priorities
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assessments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            Daily & Weekly Assessments
          </button>

          <button
            onClick={() => setActiveTab('reminder')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reminder'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Settings className="w-4 h-4" />
            8 AM Email Settings & Logs
          </button>
        </div>
      </div>
    </header>
  );
};

