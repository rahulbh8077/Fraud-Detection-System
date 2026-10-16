import React, { useEffect, useState } from 'react';
import { getRules, predictTransaction, BusinessRule, PredictionResult } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { useApp } from '../context/AppContext';

export const RulesEngine: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Test form state
  const [testType, setTestType] = useState<string>('TRANSFER');
  const [testAmount, setTestAmount] = useState<number>(75000);
  const [testOldOrg, setTestOldOrg] = useState<number>(80000);
  const [testNewOrg, setTestNewOrg] = useState<number>(5000);
  const [testOldDest, setTestOldDest] = useState<number>(0);
  const [testNewDest, setTestNewDest] = useState<number>(0);
  const [testResult, setTestResult] = useState<PredictionResult | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  useEffect(() => {
    getRules()
      .then((data) => setRules(data.rules))
      .catch((err) => console.error('Failed to fetch rules', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    try {
      const res = await predictTransaction({
        step: 1,
        type: testType,
        amount: Number(testAmount),
        oldbalanceOrg: Number(testOldOrg),
        newbalanceOrig: Number(testNewOrg),
        oldbalanceDest: Number(testOldDest),
        newbalanceDest: Number(testNewDest)
      });
      setTestResult(res);
    } catch (err: any) {
      alert('Rules evaluation test failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const getActionBadgeClass = (act: string) => {
    if (isDark) {
      switch (act) {
        case 'BLOCK': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
        case 'MANUAL_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        case 'CHALLENGE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      }
    } else {
      switch (act) {
        case 'BLOCK': return 'border text-red-700 border-red-300';
        case 'MANUAL_REVIEW': return 'border text-amber-700 border-amber-300';
        case 'CHALLENGE': return 'border text-blue-700 border-blue-300';
        default: return 'border text-emerald-700 border-emerald-300';
      }
    }
  };

  const getActionBadgeStyle = (act: string): React.CSSProperties => {
    if (isDark) return {};
    switch (act) {
      case 'BLOCK': return { background: '#fef2f2' };
      case 'MANUAL_REVIEW': return { background: '#fffbeb' };
      case 'CHALLENGE': return { background: '#eff6ff' };
      default: return { background: '#f0fdf4' };
    }
  };

  // Theme-aware helpers
  const textPrimary = isDark ? '#e2e8f0' : '#0a0a0a';
  const textSecondary = isDark ? '#94a3b8' : '#525252';
  const textMuted = isDark ? '#64748b' : '#737373';
  const borderColor = isDark ? 'rgba(30,30,58,0.8)' : '#e5e5e5';

  const cardStyle: React.CSSProperties = isDark
    ? { background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(30,30,58,0.8)' }
    : { background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };

  const sandboxCardStyle: React.CSSProperties = isDark
    ? { background: 'rgba(13,13,23,0.9)', border: '1px solid rgba(30,30,58,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }
    : { background: '#ffffff', border: '1px solid #e5e5e5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' };

  const inputStyle: React.CSSProperties = isDark
    ? { background: 'rgba(8,8,15,0.8)', border: '1px solid rgba(124,58,237,0.25)', color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #d4d4d4', color: '#0a0a0a' };

  const ruleCardHoverBg = isDark ? 'rgba(22,22,42,0.8)' : '#f9fafb';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>
          <span
            className="p-2 rounded-lg"
            style={isDark
              ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
              : { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
            }
          >⚙️</span>
          Configurable Business Rules &amp; Decision Engine
        </h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Hard business policy rules that override or augment ML probability scores to produce immediate decision matrix actions.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard title="Active Rules" value={rules.length} icon="🛡️" accent="green" />
        <MetricCard title="Critical Severity" value={rules.filter(r => r.severity === 'CRITICAL').length} icon="🚨" accent="red" />
        <MetricCard title="High Severity" value={rules.filter(r => r.severity === 'HIGH').length} icon="⚠️" accent="amber" />
        <MetricCard title="Medium Severity" value={rules.filter(r => r.severity === 'MEDIUM').length} icon="ℹ️" accent="blue" />
      </div>

      {/* Rules Registry Table & Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Registry */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Rule Definition Registry</h2>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                  style={cardStyle}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = ruleCardHoverBg)}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = isDark ? 'rgba(13,13,23,0.9)' : '#ffffff')}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>{rule.id}</span>
                      <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>{rule.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionBadgeClass(rule.action)}`}
                        style={getActionBadgeStyle(rule.action)}
                      >
                        {rule.action}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: textSecondary }}>{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono uppercase" style={{ color: textMuted }}>{rule.severity}</span>
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded"
                      style={isDark
                        ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                        : { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                      }
                    >
                      Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Rules Sandbox */}
        <div className="rounded-xl p-5 space-y-4 self-start" style={sandboxCardStyle}>
          <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: textPrimary }}>
            <span>🧪</span> Rules Evaluation Sandbox
          </h2>
          <p className="text-xs" style={{ color: textSecondary }}>
            Test custom transaction parameters against the rules engine and ML decision matrix.
          </p>

          <form onSubmit={handleRunTest} className="space-y-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: textMuted }}>Transaction Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full text-sm rounded-lg p-2 focus:outline-none"
                style={inputStyle}
              >
                <option value="TRANSFER">TRANSFER</option>
                <option value="CASH_OUT">CASH_OUT</option>
                <option value="CASH_IN">CASH_IN</option>
                <option value="DEBIT">DEBIT</option>
                <option value="PAYMENT">PAYMENT</option>
              </select>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: textMuted }}>Amount ($)</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full text-sm rounded-lg p-2 focus:outline-none"
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1" style={{ color: textMuted }}>Old Origin Bal</label>
                <input
                  type="number"
                  value={testOldOrg}
                  onChange={(e) => setTestOldOrg(Number(e.target.value))}
                  className="w-full text-sm rounded-lg p-2 focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: textMuted }}>New Origin Bal</label>
                <input
                  type="number"
                  value={testNewOrg}
                  onChange={(e) => setTestNewOrg(Number(e.target.value))}
                  className="w-full text-sm rounded-lg p-2 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs block mb-1" style={{ color: textMuted }}>Old Dest Bal</label>
                <input
                  type="number"
                  value={testOldDest}
                  onChange={(e) => setTestOldDest(Number(e.target.value))}
                  className="w-full text-sm rounded-lg p-2 focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: textMuted }}>New Dest Bal</label>
                <input
                  type="number"
                  value={testNewDest}
                  onChange={(e) => setTestNewDest(Number(e.target.value))}
                  className="w-full text-sm rounded-lg p-2 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full py-2 text-white text-xs font-semibold rounded-lg shadow-md transition disabled:opacity-50"
              style={{ background: isDark ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#4f46e5' }}
              onMouseEnter={e => { if (!testing) (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : '#4338ca'; }}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = isDark ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#4f46e5')}
            >
              {testing ? 'Evaluating...' : '⚡ Evaluate Decision Matrix'}
            </button>
          </form>

          {/* Test Outcome */}
          {testResult && (
            <div className="pt-3 space-y-3" style={{ borderTop: `1px solid ${borderColor}` }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: textSecondary }}>Final Decision</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getActionBadgeClass(testResult.decision || 'ALLOW')}`}
                  style={getActionBadgeStyle(testResult.decision || 'ALLOW')}
                >
                  {testResult.decision}
                </span>
              </div>
              <div
                className="text-xs p-2 rounded"
                style={isDark
                  ? { background: 'rgba(22,22,42,0.6)', border: '1px solid rgba(30,30,58,0.5)', color: '#cbd5e1' }
                  : { background: '#f9fafb', border: '1px solid #e5e5e5', color: '#374151' }
                }
              >
                {testResult.decision_reason}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: textSecondary }}>
                  Triggered Rules ({testResult.triggered_rules?.length || 0})
                </span>
                {testResult.triggered_rules && testResult.triggered_rules.length > 0 ? (
                  <div className="space-y-1">
                    {testResult.triggered_rules.map((tr, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded text-xs"
                        style={isDark
                          ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fca5a5' }
                          : { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }
                        }
                      >
                        <strong>{tr.rule_id}</strong>: {tr.rule_name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: textMuted }}>No business rules triggered.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
