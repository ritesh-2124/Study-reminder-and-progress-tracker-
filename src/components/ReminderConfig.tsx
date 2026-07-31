import React, { useState } from 'react';
import { ReminderConfig, ReminderLog } from '../types';
import { Mail, Clock, CheckCircle2, AlertCircle, ShieldCheck, Eye, Sparkles, Send } from 'lucide-react';

interface ReminderConfigProps {
  config: ReminderConfig;
  logs: ReminderLog[];
  onSaveConfig: (updated: Partial<ReminderConfig>) => void;
  onSendTestEmailNow: () => void;
  isSendingNow: boolean;
  userEmail?: string;
}

export const ReminderConfigView: React.FC<ReminderConfigProps> = ({
  config,
  logs,
  onSaveConfig,
  onSendTestEmailNow,
  isSendingNow,
  userEmail = 'riteshyad222000@gmail.com',
}) => {
  const [email, setEmail] = useState(config.email || userEmail);
  const [scheduledTime, setScheduledTime] = useState(config.scheduledTime || '08:00');
  const [enabled, setEnabled] = useState(config.enabled ?? true);
  const [includeAIDigest, setIncludeAIDigest] = useState(config.includeAIDigest ?? true);
  const [maxTopics, setMaxTopics] = useState(config.maxTopicsPerEmail || 5);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewLogHtml, setPreviewLogHtml] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      email,
      scheduledTime,
      enabled,
      includeAIDigest,
      maxTopicsPerEmail: Number(maxTopics),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 8 AM Email Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daily Morning Email Schedule</h2>
              <p className="text-xs text-slate-500 font-medium">
                Automatically delivers high & medium priority study material to your inbox every morning at 8 AM
              </p>
            </div>
          </div>

          <button
            onClick={onSendTestEmailNow}
            disabled={isSendingNow}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingNow ? 'Sending Digest...' : 'Send Daily Email Now'}
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Schedule settings saved successfully! Automated 8:00 AM Cron updated.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipient Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Recipient Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your study digest emails will be sent directly to this address.
              </p>
            </div>

            {/* Scheduled Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Daily Reminder Time (24h) *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={scheduledTime}
                  onChange={e => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-900"
                />
                <span className="px-3 py-2 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 whitespace-nowrap">
                  Default: 08:00 AM
                </span>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {/* Enable Schedule */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Automated Cron</span>
                <span className="text-[11px] text-slate-500">Enable 8 AM background trigger</span>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={e => setEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* AI Digest Included */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-xs font-bold text-slate-900 block">AI Study Digest</span>
                <span className="text-[11px] text-slate-500">Include Gemini study advice</span>
              </div>
              <input
                type="checkbox"
                checked={includeAIDigest}
                onChange={e => setIncludeAIDigest(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Max Topics */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Max Topics / Email</span>
                <span className="text-[11px] text-slate-500">Top priority items</span>
              </div>
              <input
                type="number"
                min="1"
                max="15"
                value={maxTopics}
                onChange={e => setMaxTopics(parseInt(e.target.value) || 5)}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 text-center"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Save Schedule Settings
            </button>
          </div>
        </form>
      </div>

      {/* Delivery Engine & Email Transport Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Email Transport Engine: Active & Ready</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Immediate & 8:00 AM daily digests are generated using Gemini AI. Each dispatch creates a complete HTML study digest with a visual preview in your Audit Log. For direct inbox delivery, configure <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-200">SMTP_HOST</code> & <code className="bg-white/10 px-1.5 py-0.5 rounded text-blue-200">SMTP_PASS</code> or Google OAuth.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 border border-white/10 flex items-center gap-2 self-start md:self-center whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          HTML Digest Generator Online
        </div>
      </div>

      {/* Email Dispatch Audit Log History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Email Dispatch History & Audit Logs</h3>
          <p className="text-xs text-slate-500">Log of daily 8 AM reminders and manual digests sent</p>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                  <th className="p-3 rounded-l-xl">Status</th>
                  <th className="p-3">Sent Time</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Topics Count</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status === 'success' ? 'Sent' : 'Failed'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">
                      {new Date(log.sentAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-slate-800 font-medium">{log.recipientEmail}</td>
                    <td className="p-3 text-slate-900 font-bold line-clamp-1">{log.subject}</td>
                    <td className="p-3 text-slate-600 font-semibold">{log.topicsIncludedCount} Topics</td>
                    <td className="p-3 text-right">
                      {log.previewHtml && (
                        <button
                          onClick={() => setPreviewLogHtml(log.previewHtml || null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Preview HTML
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">
            No email logs recorded yet. Click "Send Daily Email Now" above to test sending your first digest!
          </p>
        )}
      </div>

      {/* HTML Email Preview Modal */}
      {previewLogHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold">Email HTML Preview</h3>
              <button
                onClick={() => setPreviewLogHtml(null)}
                className="text-slate-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto bg-slate-100">
              <iframe
                title="Email Preview"
                srcDoc={previewLogHtml}
                className="w-full h-[500px] border-0 rounded-xl bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
