import React from 'react';
import { AlertTriangle, Mail, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: 'mail' | 'warning';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  icon = 'warning',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${confirmVariant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              {icon === 'mail' ? <Mail className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-xs transition-colors ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/30'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
