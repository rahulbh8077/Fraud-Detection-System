import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cn } from '../../utils/format';

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-950 border-green-700', text: 'text-green-300' },
  error: { icon: AlertCircle, bg: 'bg-red-950 border-red-700', text: 'text-red-300' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-950 border-amber-700', text: 'text-amber-300' },
  info: { icon: Info, bg: 'bg-navy-700 border-navy-500', text: 'text-blue-300' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const { icon: Icon, bg, text } = config[toast.type];
        return (
          <div key={toast.id}
            className={cn('flex items-start gap-3 p-4 rounded-xl border shadow-xl', bg)}
            role="alert" aria-live="polite">
            <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', text)} />
            <p className={cn('text-sm flex-1', text)}>{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300" aria-label="Dismiss">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
