import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, Info, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import { RiskScore } from '../components/ui/RiskScore';
import { RiskBadge } from '../components/ui/RiskBadge';
import { usePageMeta } from '../components/layout/Layout';
import { predictTransaction, PredictionResult } from '../api/client';
import { formatCurrency, formatTimestamp } from '../utils/format';
import { useApp } from '../context/AppContext';

const TRANSACTION_TYPES = ['CASH_IN', 'CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER'];

const PRESET_SAMPLES = [
  {
    label: 'Low Risk (Legitimate)',
    level: 'LOW',
    badge: 'badge-low',
    data: {
      step: 1,
      type: 'PAYMENT',
      amount: 468.62,
      oldbalanceOrg: 11318.49,
      newbalanceOrig: 10849.87,
      oldbalanceDest: 1267.02,
      newbalanceDest: 1735.64,
    },
  },
  {
    label: 'Medium Risk (Suspicious)',
    level: 'MEDIUM',
    badge: 'badge-medium',
    data: {
      step: 1,
      type: 'CASH_OUT',
      amount: 99958.37,
      oldbalanceOrg: 10741.88,
      newbalanceOrig: 0,
      oldbalanceDest: 4190.94,
      newbalanceDest: 104149.31,
    },
  },
  {
    label: 'High Risk (Drain Rule)',
    level: 'HIGH',
    badge: 'badge-high',
    data: {
      step: 1,
      type: 'TRANSFER',
      amount: 159131.18,
      oldbalanceOrg: 160000.00,
      newbalanceOrig: 0,
      oldbalanceDest: 0,
      newbalanceDest: 0,
    },
  },
  {
    label: 'Critical Risk (Block)',
    level: 'CRITICAL',
    badge: 'badge-critical',
    data: {
      step: 314,
      type: 'TRANSFER',
      amount: 423700.49,
      oldbalanceOrg: 500000.0,
      newbalanceOrig: 0,
      oldbalanceDest: 0,
      newbalanceDest: 0,
    },
  },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-text block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AnalyzeTransaction() {
  usePageMeta('Analyze Transaction', 'Hybrid ML & Rules Engine risk evaluation with SHAP feature attributions.');
  const { addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [form, setForm] = useState<{
    step: number | string;
    type: string;
    amount: number | string;
    oldbalanceOrg: number | string;
    newbalanceOrig: number | string;
    oldbalanceDest: number | string;
    newbalanceDest: number | string;
  }>({
    step: 1,
    type: 'TRANSFER',
    amount: 75000,
    oldbalanceOrg: 80000,
    newbalanceOrig: 5000,
    oldbalanceDest: 0,
    newbalanceDest: 0,
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const loadPreset = (presetData: any, label: string) => {
    setForm(presetData);
    addToast(`Loaded ${label} test sample values.`, 'info');
  };

  const handleNumberChange = (key: string, rawValue: string) => {
    set(key, rawValue === '' ? '' : rawValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        step: form.step === '' ? 0 : Number(form.step),
        type: form.type,
        amount: form.amount === '' ? 0 : Number(form.amount),
        oldbalanceOrg: form.oldbalanceOrg === '' ? 0 : Number(form.oldbalanceOrg),
        newbalanceOrig: form.newbalanceOrig === '' ? 0 : Number(form.newbalanceOrig),
        oldbalanceDest: form.oldbalanceDest === '' ? 0 : Number(form.oldbalanceDest),
        newbalanceDest: form.newbalanceDest === '' ? 0 : Number(form.newbalanceDest),
      };
      const r = await predictTransaction(payload as any);
      setResult(r);
      addToast('Transaction analyzed with Rules Engine & SHAP explainer.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Analysis failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDecisionBadge = (d?: string) => {
    switch (d) {
      case 'BLOCK': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'MANUAL_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CHALLENGE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Quick Test Presets Banner */}
      <div className="card p-4 space-y-3 bg-navy-800/90 border border-brand-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Enterprise Test Presets</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Click any preset to test Rules Engine & SHAP explanations</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => loadPreset(preset.data, preset.label)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-700/90 hover:bg-navy-600 border border-navy-500/80 transition-all text-xs font-bold text-slate-200 hover:border-brand-400 hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              <span className={preset.badge}>{preset.level}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Information */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-navy-600 pb-3">Transaction Information</h2>
            <Field label="Transaction Type">
              <select className="select-field" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {TRANSACTION_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Amount ($)">
              <input type="number" min={0} step="0.01" className="input-field" value={form.amount}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('amount', e.target.value)} />
            </Field>
            <Field label="Step (Simulation Hour)">
              <input type="number" min={0} className="input-field" value={form.step}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('step', e.target.value)} />
            </Field>
          </div>

          {/* Account Information */}
          <div className="card p-6 space-y-4">
            <h2 className="section-title border-b border-navy-600 pb-3">Account Balances</h2>
            <Field label="Origin — Previous Balance">
              <input type="number" min={0} step="0.01" className="input-field" value={form.oldbalanceOrg}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('oldbalanceOrg', e.target.value)} />
            </Field>
            <Field label="Origin — New Balance">
              <input type="number" min={0} step="0.01" className="input-field" value={form.newbalanceOrig}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('newbalanceOrig', e.target.value)} />
            </Field>
            <Field label="Destination — Previous Balance">
              <input type="number" min={0} step="0.01" className="input-field" value={form.oldbalanceDest}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('oldbalanceDest', e.target.value)} />
            </Field>
            <Field label="Destination — New Balance">
              <input type="number" min={0} step="0.01" className="input-field" value={form.newbalanceDest}
                onFocus={handleFocus}
                onChange={(e) => handleNumberChange('newbalanceDest', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Search className="w-4 h-4" />
            {loading ? 'Evaluating Engine...' : 'Run Risk Analysis'}
          </button>
          <p className="text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Info className="w-3 h-3" /> Hybrid decision evaluation.</span> ML + Rules Engine + SHAP Explainer.
          </p>
        </div>
      </form>

      {/* Result Panel */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Decision Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card">
              <RiskScore score={result.risk_score} level={result.risk_level} probability={result.fraud_probability} />
            </div>

            {/* Decision Matrix & Case Notification */}
            <div className="card p-6 space-y-4 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-navy-600 pb-3 mb-3">
                  <h2 className="section-title flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-indigo-400" /> Decision Engine Output
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDecisionBadge(result.decision)}`}>
                    {result.decision || 'ALLOW'}
                  </span>
                </div>

                <div className="p-3 bg-navy-700/80 rounded-lg border border-navy-600/80 text-sm text-slate-200 mb-4">
                  <strong>Decision Reason:</strong> {result.decision_reason || result.recommended_action}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Probability</span>
                    <span className="font-mono text-slate-200 font-bold">{(result.fraud_probability * 100).toFixed(2)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Risk Level</span>
                    <RiskBadge level={result.risk_level} showIcon />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Step-up Auth</span>
                    <span className={`font-semibold ${result.requires_stepup_auth ? 'text-amber-400' : 'text-slate-400'}`}>
                      {result.requires_stepup_auth ? 'Required (2FA)' : 'Not Required'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Analyst Queue</span>
                    <span className={`font-semibold ${result.requires_analyst_review ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.requires_analyst_review ? 'Case Created' : 'Clear'}
                    </span>
                  </div>
                </div>
              </div>

              {result.case_number && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg flex items-center justify-between text-xs text-indigo-300">
                  <span>📋 Case <strong>{result.case_number}</strong> automatically added to Analyst Review Queue.</span>
                </div>
              )}
            </div>
          </div>

          {/* Triggered Rules & SHAP Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Triggered Rules */}
            <div className="card p-6 space-y-4">
              <h2 className="section-title flex items-center gap-2">
                <span>⚙️</span> Triggered Business Policy Rules
              </h2>
              {!result.triggered_rules || result.triggered_rules.length === 0 ? (
                <div className="p-4 bg-navy-700/50 rounded-lg text-xs text-slate-400 border border-navy-600">
                  No policy rules were violated by this transaction payload.
                </div>
              ) : (
                <div className="space-y-3">
                  {result.triggered_rules.map((rule, idx) => (
                    <div key={idx} className="p-3.5 bg-rose-950/30 border border-rose-800/60 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300">{rule.rule_id}: {rule.rule_name}</span>
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded uppercase">
                          {rule.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{rule.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SHAP Feature Attributions */}
            <div className="card p-6 space-y-4">
              <h2 className="section-title flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> SHAP Feature Attributions
              </h2>
              {!result.shap_explanations || result.shap_explanations.length === 0 ? (
                <div className="space-y-3">
                  {result.explanation.map((exp: any, i: number) => (
                    <div key={i} className="bg-navy-700 border border-navy-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">{exp.feature}</span>
                        <span className={`text-xs ${exp.direction === 'increases' ? 'text-red-400' : 'text-green-400'}`}>
                          {exp.direction === 'increases' ? '↑ Risk' : '↓ Risk'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {result.shap_explanations.slice(0, 5).map((shap, i) => (
                    <div key={i} className="bg-navy-700/80 border border-navy-600 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{shap.feature_label}</span>
                        <span className={`font-mono text-xs font-bold ${shap.impact === 'INCREASES_RISK' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {shap.impact === 'INCREASES_RISK' ? '+' : ''}{shap.shap_value.toFixed(4)} ({shap.contribution_percentage}%)
                        </span>
                      </div>
                      {/* SHAP bar visualization */}
                      <div className="w-full bg-navy-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${shap.impact === 'INCREASES_RISK' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.max(5, shap.contribution_percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="card p-4">
        <p className="text-xs text-slate-500">
          FraudShield AI Enterprise combines ML models with a customizable Business Rules Engine. High-risk predictions and rule triggers should be reviewed by qualified fraud analysts.
        </p>
      </div>
    </div>
  );
}
