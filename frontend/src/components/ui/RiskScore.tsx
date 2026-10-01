import React from 'react';
import { getRiskColor } from '../../utils/format';

interface Props { score: number; level: string; probability: number; }

export function RiskScore({ score, level, probability }: Props) {
  const color = getRiskColor(level);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2340" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-100" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold" style={{ color }}>{level} RISK</div>
        <div className="text-sm text-slate-400">{(probability * 100).toFixed(1)}% fraud probability</div>
      </div>
      {/* Risk scale */}
      <div className="w-full">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="flex-1 bg-green-500/70" />
          <div className="flex-1 bg-amber-500/70" />
          <div className="flex-1 bg-red-500/70" />
          <div className="flex-1 bg-red-900/70" />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>LOW</span><span>MEDIUM</span><span>HIGH</span><span>CRITICAL</span>
        </div>
      </div>
    </div>
  );
}
