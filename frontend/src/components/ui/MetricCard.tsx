import React from 'react';
import { cn } from '../../utils/format';
import { useApp } from '../../context/AppContext';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  accent?: 'default' | 'violet' | 'cyan' | 'green' | 'red' | 'amber' | 'blue';
  loading?: boolean;
}

const darkAccentConfig = {
  default: {
    border:  'rgba(124,58,237,0.15)',
    glow:    'rgba(124,58,237,0.08)',
    iconBg:  'rgba(124,58,237,0.12)',
    iconClr: '#a78bfa',
    bar:     'linear-gradient(180deg, #8b5cf6, #7c3aed)',
    value:   '#e2e8f0',
  },
  violet: {
    border:  'rgba(124,58,237,0.35)',
    glow:    'rgba(124,58,237,0.15)',
    iconBg:  'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(139,92,246,0.15))',
    iconClr: '#a78bfa',
    bar:     'linear-gradient(180deg, #a78bfa, #7c3aed)',
    value:   '#c4b5fd',
  },
  cyan: {
    border:  'rgba(6,182,212,0.35)',
    glow:    'rgba(6,182,212,0.12)',
    iconBg:  'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))',
    iconClr: '#22d3ee',
    bar:     'linear-gradient(180deg, #67e8f9, #06b6d4)',
    value:   '#67e8f9',
  },
  green: {
    border:  'rgba(16,185,129,0.35)',
    glow:    'rgba(16,185,129,0.12)',
    iconBg:  'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.1))',
    iconClr: '#34d399',
    bar:     'linear-gradient(180deg, #6ee7b7, #10b981)',
    value:   '#6ee7b7',
  },
  red: {
    border:  'rgba(244,63,94,0.35)',
    glow:    'rgba(244,63,94,0.12)',
    iconBg:  'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(251,113,133,0.1))',
    iconClr: '#fb7185',
    bar:     'linear-gradient(180deg, #fda4af, #f43f5e)',
    value:   '#fda4af',
  },
  amber: {
    border:  'rgba(245,158,11,0.35)',
    glow:    'rgba(245,158,11,0.12)',
    iconBg:  'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))',
    iconClr: '#fbbf24',
    bar:     'linear-gradient(180deg, #fde68a, #f59e0b)',
    value:   '#fde68a',
  },
  blue: {
    border:  'rgba(59,130,246,0.35)',
    glow:    'rgba(59,130,246,0.12)',
    iconBg:  'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.1))',
    iconClr: '#60a5fa',
    bar:     'linear-gradient(180deg, #93c5fd, #3b82f6)',
    value:   '#93c5fd',
  },
};

export function MetricCard({ title, value, subtitle, trend, trendUp, icon, accent = 'default', loading }: Props) {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const cfg = darkAccentConfig[accent] ?? darkAccentConfig.default;

  if (loading) {
    return (
      <div
        className="metric-card"
        style={{
          background: isDark ? undefined : '#ffffff',
          borderColor: isDark ? cfg.border : '#e5e5e5',
        }}
      >
        <div className="skeleton h-3 w-24 mb-2" />
        <div className="skeleton h-8 w-28" />
        <div className="skeleton h-3 w-20 mt-1" />
      </div>
    );
  }

  return (
    <div
      className="metric-card group"
      style={isDark ? {
        borderColor: cfg.border,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}`,
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      } : {
        background: '#ffffff',
        borderColor: '#e5e5e5',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        if (isDark) {
          el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.7), 0 0 20px ${cfg.glow}, 0 0 0 1px ${cfg.border}`;
          el.style.transform = 'translateY(-3px)';
        } else {
          el.style.borderColor = '#000000';
          el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
          el.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        if (isDark) {
          el.style.boxShadow = `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}`;
          el.style.transform = 'translateY(0)';
        } else {
          el.style.borderColor = '#e5e5e5';
          el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
          el.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Accent left bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{
          background: isDark ? cfg.bar : '#000000',
        }}
      />

      <div className="flex items-center justify-between">
        <span
          className="label-text text-[11px] font-bold uppercase tracking-wider"
          style={{ color: isDark ? 'rgba(148,163,184,0.7)' : '#525252' }}
        >
          {title}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
            style={isDark ? {
              background: cfg.iconBg,
              border: `1px solid ${cfg.border}`,
              color: cfg.iconClr,
              fontSize: '1rem',
            } : {
              background: '#f5f5f5',
              border: '1px solid #e5e5e5',
              color: '#000000',
              fontSize: '1rem',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className="text-2xl md:text-3xl font-black tracking-tight mt-1 tabular-nums"
        style={{
          color: isDark ? cfg.value : '#000000',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {subtitle && (
            <span
              className="text-xs font-medium"
              style={{ color: isDark ? 'rgba(148,163,184,0.7)' : '#737373' }}
            >
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={
                trendUp
                  ? isDark
                    ? {
                        background: 'rgba(16,185,129,0.12)',
                        color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.25)',
                      }
                    : {
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                      }
                  : isDark
                    ? {
                        background: 'rgba(244,63,94,0.12)',
                        color: '#fb7185',
                        border: '1px solid rgba(244,63,94,0.25)',
                      }
                    : {
                        background: '#fef2f2',
                        color: '#b91c1c',
                        border: '1px solid #fecaca',
                      }
              }
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
