import React from 'react';

interface Props { level: string; showIcon?: boolean; size?: 'sm' | 'md' | 'lg'; }

const riskConfig: Record<string, { bg: string; color: string; border: string; glow: string; icon: string }> = {
  CRITICAL: {
    bg:     'rgba(220,38,38,0.12)',
    color:  '#fca5a5',
    border: 'rgba(220,38,38,0.4)',
    glow:   '0 0 10px rgba(220,38,38,0.3)',
    icon:   '⛔',
  },
  HIGH: {
    bg:     'rgba(244,63,94,0.1)',
    color:  '#fb7185',
    border: 'rgba(244,63,94,0.35)',
    glow:   '0 0 8px rgba(244,63,94,0.25)',
    icon:   '🔴',
  },
  MEDIUM: {
    bg:     'rgba(245,158,11,0.1)',
    color:  '#fbbf24',
    border: 'rgba(245,158,11,0.35)',
    glow:   '0 0 8px rgba(245,158,11,0.2)',
    icon:   '⚠️',
  },
  LOW: {
    bg:     'rgba(16,185,129,0.1)',
    color:  '#34d399',
    border: 'rgba(16,185,129,0.3)',
    glow:   '0 0 8px rgba(16,185,129,0.2)',
    icon:   '✅',
  },
};

export function RiskBadge({ level, showIcon = false, size = 'sm' }: Props) {
  const upperLevel = level?.toUpperCase() ?? 'LOW';
  const cfg = riskConfig[upperLevel] ?? riskConfig.LOW;

  const padding = size === 'lg' ? '0.4rem 1rem' : size === 'md' ? '0.3rem 0.75rem' : '0.2rem 0.6rem';
  const fontSize = size === 'lg' ? '0.8rem' : size === 'md' ? '0.72rem' : '0.65rem';

  return (
    <span
      aria-label={`Risk: ${upperLevel}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        borderRadius: '999px',
        fontSize,
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        animation: upperLevel === 'CRITICAL' ? 'glow-pulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {showIcon && <span style={{ fontSize: '0.75em' }}>{cfg.icon}</span>}
      {upperLevel}
    </span>
  );
}
