import React, { useState, useEffect } from 'react';
import { StudyTopic, StudyStats, ReminderConfig, ReminderLog } from './types';
import { API } from './services/api';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TopicList } from './components/TopicList';
import { TopicModal } from './components/TopicModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AssessmentView } from './components/AssessmentView';
import { ChatGPTImporterModal } from './components/ChatGPTImporterModal';
import { ReminderConfigView } from './components/ReminderConfig';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'assessments' | 'reminder'>('dashboard');
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>({
    email: 'riteshyad222000@gmail.com',
    enabled: true,
    scheduledTime: '08:00',
    timezone: 'America/Los_Angeles',
    includeAIDigest: true,
    maxTopicsPerEmail: 5,
    selectedPriorities: ['high', 'medium', 'low'],
    frequency: 'daily',
  });
  const [logs, setLogs] = useState<ReminderLog[]>([]);

  // UI state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<StudyTopic | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState<StudyTopic | null>(null);
  const [aiMode, setAiMode] = useState<'quiz' | 'explain' | 'flashcards'>('quiz');

  const [isChatGPTModalOpen, setIsChatGPTModalOpen] = useState(false);

  const [isSendingNow, setIsSendingNow] = useState(false);
  const [isConfirmSendOpen, setIsConfirmSendOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = async () => {
    try {
      const [fetchedTopics, fetchedStats, fetchedConfig, fetchedLogs] = await Promise.all([
        API.getTopics(),
        API.getStats(),
        API.getReminderConfig(),
        API.getReminderLogs(),
      ]);
      setTopics(fetchedTopics);
      setStats(fetchedStats);
      setReminderConfig(fetchedConfig);
      setLogs(fetchedLogs);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Categories list
  const categories = Array.from(new Set(topics.map(t => t.category || 'General')));
  if (!categories.includes('Computer Science')) categories.push('Computer Science');
  if (!categories.includes('Software Engineering')) categories.push('Software Engineering');

  // Topic CRUD
  const handleSaveTopic = async (topicData: Partial<StudyTopic>) => {
    try {
      if (topicData.id) {
        await API.updateTopic(topicData.id, topicData);
        showToast('Study material updated successfully!');
      } else {
        await API.createTopic(topicData);
        showToast('New study topic added to priority list!');
      }
      loadAllData();
    } catch (err: any) {
      showToast('Error saving topic: ' + err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTopicId) return;
    try {
      await API.deleteTopic(deletingTopicId);
      showToast('Topic deleted.');
      setDeletingTopicId(null);
      loadAllData();
    } catch (err: any) {
      showToast('Error deleting topic: ' + err.message);
    }
  };

  const handleQuickToggleComplete = async (id: string, completed: boolean) => {
    try {
      await API.updateTopic(id, { status: completed ? 'completed' : 'in-progress' });
      showToast(completed ? '🎉 Topic completed! Study streak updated.' : 'Topic marked as in-progress.');
      loadAllData();
    } catch (err: any) {
      showToast('Error updating topic status: ' + err.message);
    }
  };

  // Reminder Config Update
  const handleUpdateReminderConfig = async (updated: Partial<ReminderConfig>) => {
    try {
      const newConfig = await API.updateReminderConfig(updated);
      setReminderConfig(newConfig);
      showToast('8:00 AM Daily Email schedule updated!');
    } catch (err: any) {
      showToast('Error updating schedule: ' + err.message);
    }
  };

  // Send Daily Email Now
  const handleConfirmSendEmailNow = async () => {
    setIsSendingNow(true);
    try {
      const res = await API.sendReminderNow(undefined, reminderConfig.email);
      if (res.success) {
        if (res.sentVia === 'gmail' || res.sentVia === 'smtp') {
          showToast(`📬 Daily Study Digest email sent directly to ${reminderConfig.email}!`);
        } else {
          showToast(`📬 Daily Study Digest generated for ${reminderConfig.email}! Click 'Preview HTML' in Audit Logs to view.`);
        }
      } else {
        showToast(`Email triggered & logged in history. ${res.log?.errorDetails || ''}`);
      }
      loadAllData();
    } catch (err: any) {
      showToast('Failed to send email: ' + err.message);
    } finally {
      setIsSendingNow(false);
    }
  };

  const handleLoadTemplate = async (templateType: string) => {
    try {
      await API.loadDefaultTemplate(templateType);
      showToast(`Loaded preset ${templateType} study materials!`);
      loadAllData();
    } catch (err: any) {
      showToast('Failed loading template: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakDays={stats?.currentStreakDays || 0}
        reminderConfig={reminderConfig}
        onSendReminderNow={() => setIsConfirmSendOpen(true)}
        onOpenChatGPTImporter={() => setIsChatGPTModalOpen(true)}
        userEmail={reminderConfig.email}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            topics={topics}
            stats={stats}
            onRefresh={loadAllData}
            onSelectTopicForAI={(topic, mode) => {
              setAiTopic(topic);
              setAiMode(mode);
              setIsAIModalOpen(true);
            }}
            onQuickToggleComplete={handleQuickToggleComplete}
            onNavigateToAssessments={() => setActiveTab('assessments')}
            onOpenChatGPTImporter={() => setIsChatGPTModalOpen(true)}
          />
        )}

        {activeTab === 'topics' && (
          <TopicList
            topics={topics}
            categories={categories}
            onAddTopic={() => {
              setTopicToEdit(null);
              setIsTopicModalOpen(true);
            }}
            onEditTopic={topic => {
              setTopicToEdit(topic);
              setIsTopicModalOpen(true);
            }}
            onDeleteTopic={id => {
              setDeletingTopicId(id);
              setIsConfirmDeleteOpen(true);
            }}
            onSelectTopicForAI={(topic, mode) => {
              setAiTopic(topic);
              setAiMode(mode);
              setIsAIModalOpen(true);
            }}
            onQuickToggleComplete={handleQuickToggleComplete}
            onLoadTemplate={handleLoadTemplate}
          />
        )}

        {activeTab === 'assessments' && (
          <AssessmentView
            onAssessmentCompleted={loadAllData}
          />
        )}

        {activeTab === 'reminder' && (
          <ReminderConfigView
            config={reminderConfig}
            logs={logs}
            onSaveConfig={handleUpdateReminderConfig}
            onSendTestEmailNow={() => setIsConfirmSendOpen(true)}
            isSendingNow={isSendingNow}
            userEmail={reminderConfig.email}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        Daily Study Reminder & Assessment Engine • ChatGPT Importer • 8:00 AM Cron • Gemini AI
      </footer>

      {/* Topic Add/Edit Modal */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        topicToEdit={topicToEdit}
        categories={categories}
      />

      {/* ChatGPT Material Import Modal */}
      <ChatGPTImporterModal
        isOpen={isChatGPTModalOpen}
        onClose={() => setIsChatGPTModalOpen(false)}
        onSuccess={() => {
          showToast('ChatGPT materials imported & structured into study topics!');
          loadAllData();
        }}
      />

      {/* AI Assistant Quiz/Flashcards/Explanation Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        topic={aiTopic}
        mode={aiMode}
      />

      {/* Confirmation Modal for Email Trigger */}
      <ConfirmModal
        isOpen={isConfirmSendOpen}
        onClose={() => setIsConfirmSendOpen(false)}
        onConfirm={handleConfirmSendEmailNow}
        title="Send Daily Morning Study Email Now?"
        description={`This will immediately compile your highest-priority study materials and AI study digest, and dispatch the email to ${reminderConfig.email}.`}
        confirmText="Send Daily Email Now"
        icon="mail"
      />

      {/* Confirmation Modal for Topic Deletion */}
      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Study Material?"
        description="Are you sure you want to remove this topic from your study list? This action cannot be undone."
        confirmText="Delete Topic"
        confirmVariant="danger"
        icon="warning"
      />
    </div>
  );
}
