import React from 'react';
import { Bell, Sun, Moon, Command } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Props {
  title: string;
  subtitle?: string;
  modelOnline?: boolean;
}

export function Header({ title, subtitle, modelOnline = false }: Props) {
  const { theme, toggleTheme } = useApp();

  return (
    <header
      className="h-16 flex items-center px-6 gap-4 shrink-0"
      style={{
        background: 'rgba(8,8,15,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
        boxShadow: '0 1px 0 rgba(124,58,237,0.08)',
      }}
    >
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-lg font-black tracking-tight truncate"
          style={{
            background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-medium truncate" style={{ color: 'rgba(148,163,184,0.6)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search hint */}
      <button
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
        style={{
          background: 'rgba(124,58,237,0.07)',
          border: '1px solid rgba(124,58,237,0.18)',
          color: 'rgba(148,163,184,0.6)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.4)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(167,139,250,0.9)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.18)';
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.6)';
        }}
      >
        <Command className="w-3 h-3" />
        <span>Quick Search</span>
        <span
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa' }}
        >
          ⌘K
        </span>
      </button>

      {/* Live status pill */}
      <div
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: modelOnline ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
          border: `1px solid ${modelOnline ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
        }}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: modelOnline ? '#10b981' : '#f43f5e',
            boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#f43f5e'}`,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
        />
        <span
          className="text-xs font-bold"
          style={{ color: modelOnline ? '#34d399' : '#fb7185' }}
        >
          {modelOnline ? 'AI Engine Online' : 'Engine Offline'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ color: 'rgba(148,163,184,0.6)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{ color: 'rgba(148,163,184,0.6)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.12)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {/* Notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{
              background: '#f43f5e',
              boxShadow: '0 0 4px #f43f5e',
            }}
          />
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black cursor-pointer ml-1 transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#ffffff',
            boxShadow: '0 0 12px rgba(124,58,237,0.4)',
          }}
          title="User Profile"
        >
          FS
        </div>
      </div>
    </header>
  );
}
