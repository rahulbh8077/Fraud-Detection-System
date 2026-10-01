import React from 'react';
import { getRiskBadgeClass } from '../../utils/format';

interface Props { level: string; showIcon?: boolean; }

const icons: Record<string, string> = {
  CRITICAL: '⛔',
  HIGH: '🔴',
  MEDIUM: '🟡',
  LOW: '🟢',
};

export function RiskBadge({ level, showIcon = false }: Props) {
  const upperLevel = level?.toUpperCase();
  return (
    <span className={getRiskBadgeClass(upperLevel)} aria-label={`Risk: ${upperLevel}`}>
      {showIcon && icons[upperLevel] && <span className="mr-1">{icons[upperLevel]}</span>}
      {upperLevel}
    </span>
  );
}
