import React, { useState, useEffect } from 'react';
import { StudyTopic, Priority, Status } from '../types';
import { X, BookOpen, AlertCircle, Sparkles } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topic: Partial<StudyTopic>) => void;
  topicToEdit?: StudyTopic | null;
  categories: string[];
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  topicToEdit,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('high');
  const [status, setStatus] = useState<Status>('not-started');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  useEffect(() => {
    if (topicToEdit) {
      setTitle(topicToEdit.title);
      setCategory(topicToEdit.category);
      setPriority(topicToEdit.priority);
      setStatus(topicToEdit.status);
      setEstimatedHours(topicToEdit.estimatedHours || 2);
      setTargetDate(topicToEdit.targetDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setNotes(topicToEdit.notes || '');
      setResourceUrl(topicToEdit.resourceUrl || '');
    } else {
      setTitle('');
      setCategory(categories[0] || 'Computer Science');
      setCustomCategory('');
      setPriority('high');
      setStatus('not-started');
      setEstimatedHours(2);
      setTargetDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
      setNotes('');
      setResourceUrl('');
    }
  }, [topicToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'new' ? (customCategory.trim() || 'General') : category;

    onSave({
      id: topicToEdit?.id,
      title: title.trim(),
      category: finalCategory,
      priority,
      status,
      estimatedHours: Number(estimatedHours),
      targetDate,
      notes: notes.trim(),
      resourceUrl: resourceUrl.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {topicToEdit ? 'Edit Study Material' : 'Add New Study Topic'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Topic Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Topic / Material Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Binary Search Trees & Rotations"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority Level *
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 bg-white"
              >
                <option value="high">🔴 High Priority (Email Top)</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🔵 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Status)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800 bg-white"
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="reviewing">Reviewing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Category & Custom Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category / Field
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800 bg-white"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="new">+ Create Custom Category</option>
              </select>
            </div>

            {category === 'new' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Category Name
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="e.g. Neuroscience"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                />
              </div>
            )}
          </div>

          {/* Estimated Hours & Target Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={estimatedHours}
                onChange={e => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Notes & Key Concepts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Sub-topics / Exam Key Points
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Master left-right rotation steps, tree deletion cases, and height calculations..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Resource Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resource Link / Reference URL (Optional)
            </label>
            <input
              type="url"
              value={resourceUrl}
              onChange={e => setResourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Submit controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {topicToEdit ? 'Save Changes' : 'Add Study Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
