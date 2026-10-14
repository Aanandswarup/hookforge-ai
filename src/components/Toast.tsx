import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        // Glowing status border and shadow configuration
        const borderGlowClass = isSuccess
          ? 'border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_-3px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]'
          : isError
          ? 'border-rose-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_-3px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]'
          : 'border-sky-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_20px_-3px_rgba(14,165,233,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl bg-[#0d131f]/95 border ${borderGlowClass} backdrop-blur-xl text-xs text-white transition-all duration-300 animate-slide-up`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                </div>
              )}
              {isError && (
                <div className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.5)]" />
                </div>
              )}
              {!isSuccess && !isError && (
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" />
                </div>
              )}
              <span className="font-medium text-slate-200 leading-snug">{toast.text}</span>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1.5 ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
              title="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
