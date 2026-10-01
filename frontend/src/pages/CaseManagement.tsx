import React, { useEffect, useState } from 'react';
import { getCases, getCaseMetrics, updateCase, CaseItem, QueueMetrics } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

export const CaseManagement: React.FC = () => {
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Form edit state
  const [editNotes, setEditNotes] = useState<string>('');
  const [editAssignee, setEditAssignee] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [editVerdict, setEditVerdict] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        getCaseMetrics(),
        getCases({ status: statusFilter, priority: priorityFilter })
      ]);
      setMetrics(m);
      setCases(c.cases);
    } catch (err) {
      console.error('Failed to fetch case management data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  const handleOpenCase = (c: CaseItem) => {
    setSelectedCase(c);
    setEditNotes(c.analyst_notes || '');
    setEditAssignee(c.assigned_to || 'Unassigned');
    setEditStatus(c.status);
    setEditVerdict(c.analyst_verdict || 'UNVERIFIED');
  };

  const handleSaveCase = async () => {
    if (!selectedCase) return;
    setUpdating(true);
    try {
      const updated = await updateCase(selectedCase.case_number, {
        status: editStatus,
        assigned_to: editAssignee,
        analyst_notes: editNotes,
        analyst_verdict: editVerdict
      });
      setSelectedCase(updated);
      await fetchData();
    } catch (err) {
      alert('Failed to update case details');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getDecisionBadge = (d: string) => {
    switch (d) {
      case 'BLOCK': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'MANUAL_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'CHALLENGE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">📋</span>
            Analyst Case Management & Review Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise case triage, manual investigation, analyst notes, and ground-truth verdict recording.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition flex items-center gap-2 self-start sm:self-auto"
        >
          🔄 Refresh Queue
        </button>
      </div>

      {/* Queue Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard title="Total Cases" value={metrics.total_cases} icon="📁" accent="blue" />
          <MetricCard title="Pending Review" value={metrics.pending_review} icon="⏳" accent="amber" />
          <MetricCard title="Investigating" value={metrics.under_investigation} icon="🔍" accent="default" />
          <MetricCard title="Confirmed Fraud" value={metrics.confirmed_fraud} icon="🚨" accent="red" />
          <MetricCard title="False Positives" value={metrics.false_positives} icon="✅" accent="green" />
          <MetricCard title="Critical Priority" value={metrics.critical_priority} icon="⚠️" accent="red" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
              <option value="FALSE_POSITIVE">False Positive</option>
              <option value="RESOLVED_LEGITIMATE">Resolved Legitimate</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Priority Filter</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{cases.length}</span> active cases
        </div>
      </div>

      {/* Cases Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Case #</th>
                  <th className="py-3.5 px-4">Tx ID</th>
                  <th className="py-3.5 px-4">Type / Amount</th>
                  <th className="py-3.5 px-4">ML Score</th>
                  <th className="py-3.5 px-4">Decision</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      No cases match the selected filters.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.case_number} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-indigo-400 font-medium">{c.case_number}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.transaction_id || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{c.tx_type}</div>
                        <div className="text-xs text-slate-400">${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{c.risk_score}</span>
                          <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDecisionBadge(c.decision)}`}>
                          {c.decision}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(c.priority)}`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-slate-300 font-medium">
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">{c.assigned_to}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenCase(c)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition shadow-sm"
                        >
                          Review Case
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Case Review Modal Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-100">{selectedCase.case_number}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDecisionBadge(selectedCase.decision)}`}>
                    {selectedCase.decision}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(selectedCase.priority)}`}>
                    {selectedCase.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Created: {new Date(selectedCase.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Transaction Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-xs text-slate-400 block">Type</span>
                  <span className="font-semibold text-slate-200">{selectedCase.tx_type}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Amount</span>
                  <span className="font-semibold text-emerald-400">${selectedCase.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Origin Bal (Old → New)</span>
                  <span className="text-xs text-slate-300 font-mono">${selectedCase.oldbalanceOrg.toLocaleString()} → ${selectedCase.newbalanceOrig.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Dest Bal (Old → New)</span>
                  <span className="text-xs text-slate-300 font-mono">${selectedCase.oldbalanceDest.toLocaleString()} → ${selectedCase.newbalanceDest.toLocaleString()}</span>
                </div>
              </div>

              {/* Decision Rationale & Rules Triggered */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Decision Rationale</h3>
                <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-sm text-slate-300">
                  {selectedCase.decision_reason}
                </div>
                {selectedCase.triggered_rules && selectedCase.triggered_rules.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block mb-2">Triggered Business Rules</span>
                    <div className="space-y-2">
                      {selectedCase.triggered_rules.map((r, i) => (
                        <div key={i} className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300 flex items-center justify-between">
                          <span><strong>{r.rule_id}</strong>: {r.rule_name}</span>
                          <span className="px-2 py-0.5 bg-rose-500/20 rounded text-[10px] uppercase">{r.severity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyst Edit Form */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Analyst Investigation Form</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Queue Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="UNDER_INVESTIGATION">Under Investigation</option>
                      <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
                      <option value="FALSE_POSITIVE">False Positive</option>
                      <option value="RESOLVED_LEGITIMATE">Resolved Legitimate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Assigned Analyst</label>
                    <input
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Analyst Verdict (Ground Truth)</label>
                    <select
                      value={editVerdict}
                      onChange={(e) => setEditVerdict(e.target.value)}
                      className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-2 border border-slate-700 focus:outline-none focus:border-indigo-500 font-semibold text-indigo-300"
                    >
                      <option value="UNVERIFIED">Unverified</option>
                      <option value="CONFIRMED_FRAUD">Confirmed Fraud (Positive)</option>
                      <option value="FALSE_POSITIVE">False Positive (Legitimate)</option>
                      <option value="CONFIRMED_LEGITIMATE">Confirmed Legitimate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Investigation Notes & Evidence</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter analyst notes, cardholder verification response, branch checks, or evidence..."
                    className="w-full bg-slate-800 text-slate-200 text-sm rounded-lg p-3 border border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg border border-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCase}
                disabled={updating}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
              >
                {updating ? 'Saving...' : '💾 Save Case Investigation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
