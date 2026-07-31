import React, { useState } from 'react';
import { StudyTopic, Priority, Status } from '../types';
import { Search, Plus, Filter, Trash2, Edit3, Sparkles, ExternalLink, Calendar, Clock, BookOpen, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface TopicListProps {
  topics: StudyTopic[];
  categories: string[];
  onAddTopic: () => void;
  onEditTopic: (topic: StudyTopic) => void;
  onDeleteTopic: (id: string) => void;
  onSelectTopicForAI: (topic: StudyTopic, mode: 'quiz' | 'explain' | 'flashcards') => void;
  onQuickToggleComplete: (id: string, completed: boolean) => void;
  onLoadTemplate: (templateType: string) => void;
}

export const TopicList: React.FC<TopicListProps> = ({
  topics,
  categories,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  onSelectTopicForAI,
  onQuickToggleComplete,
  onLoadTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredTopics = topics.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;

    return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search, Filter Bar & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search study topics, categories, notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onAddTopic}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Study Material
            </button>

            {/* Template Presets */}
            <select
              onChange={e => {
                if (e.target.value) {
                  onLoadTemplate(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer"
            >
              <option value="" disabled>+ Load Study Template</option>
              <option value="medical">Medical / USMLE Prep</option>
              <option value="entrance-exam">Engineering & Physics Prep</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-100 text-xs font-semibold">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority Filter:
          </span>
          <button
            onClick={() => setSelectedPriority('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedPriority === 'all' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Priorities ({topics.length})
          </button>
          <button
            onClick={() => setSelectedPriority('high')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedPriority === 'high' ? 'bg-red-600 text-white font-bold' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            High Priority ({topics.filter(t => t.priority === 'high').length})
          </button>
          <button
            onClick={() => setSelectedPriority('medium')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedPriority === 'medium' ? 'bg-amber-500 text-white font-bold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Medium ({topics.filter(t => t.priority === 'medium').length})
          </button>
          <button
            onClick={() => setSelectedPriority('low')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              selectedPriority === 'low' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Low ({topics.filter(t => t.priority === 'low').length})
          </button>
        </div>
      </div>

      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map(topic => {
          const isCompleted = topic.status === 'completed';

          return (
            <div
              key={topic.id}
              className={`p-5 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-50/80 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200/90 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={e => onQuickToggleComplete(topic.id, e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-base font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {topic.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
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
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {topic.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          📅 Target: {topic.targetDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTopic(topic)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Topic"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTopic(topic.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {topic.notes && (
                  <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {topic.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{topic.estimatedHours}h Total</span>
                  {topic.resourceUrl && (
                    <a
                      href={topic.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 ml-2"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No study topics match your current filter.</p>
            <button
              onClick={onAddTopic}
              className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
            >
              Add New Study Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
