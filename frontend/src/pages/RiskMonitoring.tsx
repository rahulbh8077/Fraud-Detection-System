import React, { useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { RiskBadge } from '../components/ui/RiskBadge';
import { formatCurrency } from '../utils/format';
import { ShieldAlert, AlertTriangle, CheckCircle, Ban, RefreshCw, Radio } from 'lucide-react';

export default function RiskMonitoring() {
  usePageMeta('Risk Monitoring', 'Real-time transaction risk monitoring, active security alerts, and rule enforcement.');
  const { uploadedResults, addToast } = useApp();

  const [actionsTaken, setActionsTaken] = useState<Record<string, string>>({});

  const highRiskItems = uploadedResults?.analytics?.high_risk_transactions || [
    {
      type: 'TRANSFER',
      amount: 450000.0,
      risk_level: 'CRITICAL',
      risk_score: 96,
      fraud_probability: 0.9642,
      predicted_fraud: 'FRAUDULENT',
    },
    {
      type: 'CASH_OUT',
      amount: 220000.0,
      risk_level: 'HIGH',
      risk_score: 84,
      fraud_probability: 0.8415,
      predicted_fraud: 'FRAUDULENT',
    },
    {
      type: 'TRANSFER',
      amount: 185000.0,
      risk_level: 'HIGH',
      risk_score: 79,
      fraud_probability: 0.789,
      predicted_fraud: 'FRAUDULENT',
    },
  ];

  const handleAction = (id: string, action: string, typeName: string) => {
    setActionsTaken((prev) => ({ ...prev, [id]: action }));
    if (action === 'BLOCK') {
      addToast(`Transaction (${typeName}) has been blocked and sender account frozen.`, 'error');
    } else if (action === 'REVIEW') {
      addToast(`Transaction (${typeName}) sent to Tier-2 manual review queue.`, 'warning');
    } else if (action === 'APPROVE') {
      addToast(`Transaction (${typeName}) approved and whitelisted.`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Feed Banner */}
      <div className="card p-4 bg-gradient-to-r from-red-950/30 via-navy-800 to-navy-800 border-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-6 h-6 text-red-500 animate-pulse" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Active Fraud Sentinel Feed
              <span className="badge badge-critical text-[10px] uppercase">LIVE</span>
            </h3>
            <p className="text-xs text-slate-400">
              Monitoring active transaction streams using ML score threshold enforcement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Threshold: <strong className="text-slate-200">≥ 0.70 Fraud Probability</strong></span>
        </div>
      </div>

      {/* Rules & Thresholds bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="card p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Critical Risk Threshold</span>
          <span className="text-lg font-bold text-red-400">≥ 85% Score</span>
          <p className="text-[11px] text-slate-500">Action: Immediate Auto-Freeze</p>
        </div>
        <div className="card p-4 space-y-1">
          <span className="text-slate-400 block font-medium">High Risk Threshold</span>
          <span className="text-lg font-bold text-amber-400">70% – 84% Score</span>
          <p className="text-[11px] text-slate-500">Action: Tier-2 Manual Hold</p>
        </div>
        <div className="card p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Medium Risk Threshold</span>
          <span className="text-lg font-bold text-yellow-400">30% – 69% Score</span>
          <p className="text-[11px] text-slate-500">Action: Step-Up Auth Request</p>
        </div>
        <div className="card p-4 space-y-1">
          <span className="text-slate-400 block font-medium">Low Risk Threshold</span>
          <span className="text-lg font-bold text-emerald-400">&lt; 30% Score</span>
          <p className="text-[11px] text-slate-500">Action: Auto-Approve</p>
        </div>
      </div>

      {/* High-Risk Alerts Feed */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-navy-700 pb-3">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            High-Risk Alert Stream ({highRiskItems.length} flagged cases)
          </h3>
        </div>

        <div className="space-y-3">
          {highRiskItems.map((item: any, idx: number) => {
            const itemId = `item-${idx}`;
            const action = actionsTaken[itemId];

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 hover:border-navy-600 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={item.risk_level} />
                    <span className="font-semibold text-slate-200 text-sm">{item.type}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      Prob: {(item.fraud_probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Amount:{' '}
                    <strong className="text-slate-200 font-mono">
                      {formatCurrency(item.amount)}
                    </strong>{' '}
                    — Flagged due to abnormal balance drainage and high-value type patterns.
                  </p>
                </div>

                {action ? (
                  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 text-slate-300">
                    {action === 'BLOCK' && <Ban className="w-4 h-4 text-red-400" />}
                    {action === 'REVIEW' && <RefreshCw className="w-4 h-4 text-amber-400" />}
                    {action === 'APPROVE' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    Status: {action}ED
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      onClick={() => handleAction(itemId, 'BLOCK', item.type)}
                      className="btn-danger py-1 px-3 text-xs flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" /> Block
                    </button>
                    <button
                      onClick={() => handleAction(itemId, 'REVIEW', item.type)}
                      className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Hold & Review
                    </button>
                    <button
                      onClick={() => handleAction(itemId, 'APPROVE', item.type)}
                      className="btn-ghost py-1 px-3 text-xs flex items-center gap-1 text-emerald-400"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

