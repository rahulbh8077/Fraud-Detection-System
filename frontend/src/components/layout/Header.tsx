import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, Command, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SearchModal } from '../ui/SearchModal';

interface Props {
  title: string;
  subtitle?: string;
  modelOnline?: boolean;
}

export function Header({ title, subtitle, modelOnline = false }: Props) {
  const { theme, toggleTheme } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const isDark = theme === 'dark';

  // Global ⌘K / Ctrl+K and '/' shortcut listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input or textarea (unless Cmd/Ctrl key is pressed)
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className="h-16 flex items-center px-6 gap-3 md:gap-4 shrink-0 transition-colors duration-200"
        style={{
          background: isDark ? 'rgba(8,8,15,0.95)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: isDark
            ? '1px solid rgba(124,58,237,0.15)'
            : '1px solid #e5e5e5',
          boxShadow: isDark
            ? '0 1px 0 rgba(124,58,237,0.08)'
            : '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h1
            className="text-lg font-black tracking-tight truncate"
            style={isDark ? {
              background: 'linear-gradient(135deg, #e2e8f0 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : {
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-xs font-medium truncate"
              style={{ color: isDark ? 'rgba(148,163,184,0.6)' : '#737373' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Quick Search Button (Desktop: Pill with badge, Mobile: Icon button) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
          style={isDark ? {
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.22)',
            color: 'rgba(196,181,253,0.85)',
          } : {
            background: '#f5f5f5',
            border: '1px solid #e5e5e5',
            color: '#404040',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = isDark ? 'rgba(124,58,237,0.5)' : '#000000';
            el.style.color = isDark ? '#ffffff' : '#000000';
            el.style.background = isDark ? 'rgba(124,58,237,0.15)' : '#e5e5e5';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = isDark ? 'rgba(124,58,237,0.22)' : '#e5e5e5';
            el.style.color = isDark ? 'rgba(196,181,253,0.85)' : '#404040';
            el.style.background = isDark ? 'rgba(124,58,237,0.08)' : '#f5f5f5';
          }}
          aria-label="Open Quick Search (Ctrl+K)"
          title="Quick Search (Ctrl+K or /)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Search</span>
          <span
            className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold"
            style={isDark
              ? { background: 'rgba(124,58,237,0.25)', color: '#c4b5fd' }
              : { background: '#000000', color: '#ffffff' }
            }
          >
            ⌘K
          </span>
        </button>

        {/* Quick Search Mobile Icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex sm:hidden p-2 rounded-xl transition-all duration-150 cursor-pointer"
          style={isDark ? {
            background: 'rgba(124,58,237,0.08)',
            color: '#c4b5fd',
            border: '1px solid rgba(124,58,237,0.2)',
          } : {
            background: '#f5f5f5',
            color: '#000000',
            border: '1px solid #e5e5e5',
          }}
          aria-label="Open Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Live status pill */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
          style={isDark ? {
            background: modelOnline ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${modelOnline ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          } : {
            background: modelOnline ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${modelOnline ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: modelOnline ? '#10b981' : '#ef4444',
              boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#ef4444'}`,
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
          <span
            className="text-xs font-bold"
            style={{
              color: isDark
                ? (modelOnline ? '#34d399' : '#f87171')
                : (modelOnline ? '#15803d' : '#b91c1c')
            }}
          >
            {modelOnline ? 'Protection Active' : 'System Degraded'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl transition-all duration-150 cursor-pointer"
            style={isDark ? {
              color: '#c4b5fd',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
            } : {
              color: '#000000',
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = isDark ? 'rgba(124,58,237,0.2)' : '#000000';
              el.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = isDark ? 'rgba(124,58,237,0.08)' : '#f5f5f5';
              el.style.color = isDark ? '#c4b5fd' : '#000000';
            }}
            title={isDark ? 'Switch to Day Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-xl transition-all duration-150 cursor-pointer"
            style={isDark ? {
              color: '#c4b5fd',
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
            } : {
              color: '#000000',
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = isDark ? 'rgba(124,58,237,0.2)' : '#000000';
              el.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = isDark ? 'rgba(124,58,237,0.08)' : '#f5f5f5';
              el.style.color = isDark ? '#c4b5fd' : '#000000';
            }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
              style={{ background: '#ef4444', boxShadow: '0 0 4px #ef4444' }}
            />
          </button>

          {/* User Profile Avatar */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black cursor-pointer ml-0.5 shadow-sm"
            style={isDark ? {
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(124,58,237,0.4)',
            } : {
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
            }}
            title="User Profile: Admin Analyst"
          >
            FS
          </div>
        </div>
      </header>
    </>
  );
}
