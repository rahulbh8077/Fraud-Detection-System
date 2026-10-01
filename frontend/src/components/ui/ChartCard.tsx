import React, { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({ title, subtitle, children, className = '', action }: Props) {
  return (
    <div className={`card p-5 border border-navy-600/80 hover:border-brand-500/40 ${className}`}>
      <div className="flex items-start justify-between mb-4 pb-2 border-b border-navy-700/60">
        <div>
          <h3 className="section-title text-slate-100 font-bold text-base tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs font-semibold text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
