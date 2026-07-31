import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { API } from '../services/api';

interface ChatGPTImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChatGPTImporterModal: React.FC<ChatGPTImporterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [textInput, setTextInput] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      setError('Please paste your ChatGPT study material or notes.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await API.importChatGPTMaterial(textInput, category);
      setImportedCount(res.importedCount);
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
        onClose();
        setTextInput('');
        setImportedCount(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to parse ChatGPT material.');
      setIsLoading(false);
    }
  };

  const samplePromptText = `ChatGPT Study Session Output:
Topic 1: Advanced Graph Algorithms & Dijkstra's Shortest Path
Key Notes: Priority queue based implementation O((V + E) log V). Used in network routing protocols like OSPF.
Flashcard 1: What is the time complexity of Dijkstra using Fibonacci Heap? Answer: O(E + V log V).

Topic 2: Microservice Architecture & API Gateways
Key Notes: Service discovery, reverse proxy, authentication offloading, rate limiting using Token Bucket algorithm.
Flashcard 1: Name 2 main responsibilities of an API Gateway. Answer: Request routing and central authentication/rate limiting.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Import ChatGPT Project Materials</h3>
              <p className="text-xs text-slate-300">
                Paste your ChatGPT study notes or conversation output for automatic topic extraction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleImport} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {importedCount !== null && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>🎉 Successfully parsed and created {importedCount} new study topics from your ChatGPT text!</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Default Topic Category
              </label>
              <button
                type="button"
                onClick={() => setTextInput(samplePromptText)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Insert Sample Text
              </button>
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-900 bg-white"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="System Design">System Design</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Mathematics">Mathematics</option>
              <option value="General">General Study</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Paste ChatGPT Project / Study Material Text *
            </label>
            <textarea
              required
              rows={8}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Paste your ChatGPT responses, course notes, prompt history, or study outlines here..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono text-slate-900 resize-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Gemini AI will analyze your text, divide it into discrete study topics, auto-assign priorities, and generate practice flashcards.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || importedCount !== null}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'AI Extracting Topics...' : 'Import & Auto-Generate Topics'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
