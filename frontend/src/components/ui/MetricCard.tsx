import React from 'react';
import { cn } from '../../utils/format';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  accent?: 'default' | 'green' | 'red' | 'amber' | 'blue';
  loading?: boolean;
}

const accentColors = {
  default: 'border-l-4 border-navy-500',
  green: 'border-l-4 border-green-500 accent-glow-green',
  red: 'border-l-4 border-red-500 accent-glow-red',
  amber: 'border-l-4 border-amber-500 accent-glow-amber',
  blue: 'border-l-4 border-brand-500 accent-glow-blue',
};

const iconAccents = {
  default: 'bg-navy-700/80 text-slate-300 border-navy-500/50',
  green: 'bg-green-950/60 text-green-400 border-green-800/60',
  red: 'bg-red-950/60 text-red-400 border-red-800/60',
  amber: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
  blue: 'bg-brand-950/60 text-brand-400 border-brand-800/60',
};

export function MetricCard({ title, value, subtitle, trend, trendUp, icon, accent = 'default', loading }: Props) {
  if (loading) {
    return (
      <div className={cn('metric-card', accentColors[accent])}>
        <div className="skeleton h-3 w-24 mb-2" />
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-3 w-20 mt-1" />
      </div>
    );
  }
  return (
    <div className={cn('metric-card', accentColors[accent])}>
      <div className="flex items-center justify-between">
        <span className="label-text font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={cn('p-1.5 rounded-lg border shadow-sm transition-transform duration-200 group-hover:scale-110', iconAccents[accent])}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 drop-shadow-sm">{value}</div>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <span className="text-xs font-semibold text-slate-400">{subtitle}</span>}
          {trend && (
            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', trendUp ? 'bg-green-950 text-green-400 border border-green-800/60' : 'bg-red-950 text-red-400 border border-red-800/60')}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
