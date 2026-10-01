import React, { useEffect, useState } from 'react';
import { getRules, predictTransaction, BusinessRule, PredictionResult } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

export const RulesEngine: React.FC = () => {
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

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'BLOCK': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'MANUAL_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CHALLENGE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">⚙️</span>
          Configurable Business Rules & Decision Engine
        </h1>
        <p className="text-sm text-slate-400 mt-1">
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
          <h2 className="text-lg font-semibold text-slate-200">Rule Definition Registry</h2>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{rule.id}</span>
                      <h3 className="text-sm font-semibold text-slate-100">{rule.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getActionBadge(rule.action)}`}>
                        {rule.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono uppercase">{rule.severity}</span>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded">
                      Enabled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Rules Sandbox */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl self-start">
          <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
            <span>🧪</span> Rules Evaluation Sandbox
          </h2>
          <p className="text-xs text-slate-400">
            Test custom transaction parameters against the rules engine and ML decision matrix.
          </p>

          <form onSubmit={handleRunTest} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Transaction Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
              >
                <option value="TRANSFER">TRANSFER</option>
                <option value="CASH_OUT">CASH_OUT</option>
                <option value="CASH_IN">CASH_IN</option>
                <option value="DEBIT">DEBIT</option>
                <option value="PAYMENT">PAYMENT</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Amount ($)</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(Number(e.target.value))}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Old Origin Bal</label>
                <input
                  type="number"
                  value={testOldOrg}
                  onChange={(e) => setTestOldOrg(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Origin Bal</label>
                <input
                  type="number"
                  value={testNewOrg}
                  onChange={(e) => setTestNewOrg(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Old Dest Bal</label>
                <input
                  type="number"
                  value={testOldDest}
                  onChange={(e) => setTestOldDest(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Dest Bal</label>
                <input
                  type="number"
                  value={testNewDest}
                  onChange={(e) => setTestNewDest(Number(e.target.value))}
                  className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition"
            >
              {testing ? 'Evaluating...' : '⚡ Evaluate Decision Matrix'}
            </button>
          </form>

          {/* Test Outcome */}
          {testResult && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Final Decision</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getActionBadge(testResult.decision || 'ALLOW')}`}>
                  {testResult.decision}
                </span>
              </div>
              <div className="text-xs text-slate-300 p-2 bg-slate-800/60 rounded border border-slate-700/50">
                {testResult.decision_reason}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Triggered Rules ({testResult.triggered_rules?.length || 0})
                </span>
                {testResult.triggered_rules && testResult.triggered_rules.length > 0 ? (
                  <div className="space-y-1">
                    {testResult.triggered_rules.map((tr, idx) => (
                      <div key={idx} className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-xs text-rose-300">
                        <strong>{tr.rule_id}</strong>: {tr.rule_name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No business rules triggered.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
