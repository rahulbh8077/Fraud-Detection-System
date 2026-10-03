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
    <div
      className={`card p-5 ${className}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.5), transparent)' }}
      />

      <div
        className="flex items-start justify-between mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(124,58,237,0.12)' }}
      >
        <div>
          <h3
            className="font-bold text-base tracking-tight"
            style={{ color: '#e2e8f0' }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs font-medium mt-0.5" style={{ color: 'rgba(148,163,184,0.65)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
