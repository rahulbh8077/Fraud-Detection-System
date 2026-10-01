import React, { useState } from 'react';
import { Bell, Sun, Moon, HelpCircle, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  title: string;
  subtitle?: string;
  modelOnline?: boolean;
}

export function Header({ title, subtitle, modelOnline = false }: Props) {
  const { theme, toggleTheme } = useApp();

  return (
    <header className="h-16 bg-navy-800 border-b border-navy-600 flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-extrabold text-white tracking-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs font-semibold text-slate-400 truncate">{subtitle}</p>}
      </div>

      {/* Real-time status pill */}
      <div className="hidden md:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/60 px-3 py-1.5 rounded-full shadow-sm">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-xs font-bold text-emerald-400">
          {modelOnline ? 'Real-Time Protection Active' : 'System Degraded'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
