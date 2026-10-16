import React, { useEffect, useState } from 'react';
import { getCases, getCaseMetrics, updateCase, CaseItem, QueueMetrics } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { useApp } from '../context/AppContext';

export const CaseManagement: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

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
    if (isDark) {
      switch (p) {
        case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
        case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      }
    } else {
      switch (p) {
        case 'CRITICAL': return 'border text-red-700 border-red-300';
        case 'HIGH': return 'border text-orange-700 border-orange-300';
        case 'MEDIUM': return 'border text-amber-700 border-amber-300';
        default: return 'border text-gray-600 border-gray-300';
      }
    }
  };

  const getPriorityStyle = (p: string): React.CSSProperties => {
    if (isDark) return {};
    switch (p) {
      case 'CRITICAL': return { background: '#fef2f2' };
      case 'HIGH': return { background: '#fff7ed' };
      case 'MEDIUM': return { background: '#fffbeb' };
      default: return { background: '#f5f5f5' };
    }
  };

  const getDecisionBadge = (d: string) => {
    if (isDark) {
      switch (d) {
        case 'BLOCK': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
        case 'MANUAL_REVIEW': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        case 'CHALLENGE': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      }
    } else {
      switch (d) {
        case 'BLOCK': return 'border text-red-700 border-red-300';
        case 'MANUAL_REVIEW': return 'border text-amber-700 border-amber-300';
        case 'CHALLENGE': return 'border text-blue-700 border-blue-300';
        default: return 'border text-emerald-700 border-emerald-300';
      }
    }
  };

  const getDecisionBadgeStyle = (d: string): React.CSSProperties => {
    if (isDark) return {};
    switch (d) {
      case 'BLOCK': return { background: '#fef2f2' };
      case 'MANUAL_REVIEW': return { background: '#fffbeb' };
      case 'CHALLENGE': return { background: '#eff6ff' };
      default: return { background: '#f0fdf4' };
    }
  };

  // Theme-aware style helpers
  const surface = isDark
    ? { background: 'rgba(15,15,27,0.9)', border: '1px solid rgba(30,30,58,0.8)', color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #e5e5e5', color: '#0a0a0a' };

  const surfaceAlt = isDark
    ? { background: 'rgba(22,22,42,0.7)', border: '1px solid rgba(30,30,58,0.6)' }
    : { background: '#f9fafb', border: '1px solid #e5e5e5' };

  const inputStyle: React.CSSProperties = isDark
    ? { background: 'rgba(8,8,15,0.8)', border: '1px solid rgba(124,58,237,0.25)', color: '#e2e8f0' }
    : { background: '#ffffff', border: '1px solid #d4d4d4', color: '#0a0a0a' };

  const textPrimary = isDark ? '#e2e8f0' : '#0a0a0a';
  const textSecondary = isDark ? '#94a3b8' : '#525252';
  const textMuted = isDark ? '#64748b' : '#737373';
  const borderColor = isDark ? 'rgba(30,30,58,0.8)' : '#e5e5e5';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: `1px solid ${borderColor}` }}
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>
            <span
              className="p-2 rounded-lg"
              style={isDark
                ? { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }
                : { background: '#eff6ff', color: '#4f46e5', border: '1px solid #c7d2fe' }
              }
            >📋</span>
            Analyst Case Management &amp; Review Queue
          </h1>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>
            Enterprise case triage, manual investigation, analyst notes, and ground-truth verdict recording.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 self-start sm:self-auto"
          style={isDark
            ? { background: 'rgba(22,22,42,0.8)', color: '#e2e8f0', border: '1px solid rgba(30,30,58,0.8)' }
            : { background: '#f5f5f5', color: '#171717', border: '1px solid #e5e5e5' }
          }
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
      <div
        className="p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between"
        style={isDark
          ? { background: 'rgba(13,13,23,0.8)', border: '1px solid rgba(30,30,58,0.8)' }
          : { background: '#f9fafb', border: '1px solid #e5e5e5' }
        }
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs block mb-1" style={{ color: textMuted }}>Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
              style={inputStyle}
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
            <label className="text-xs block mb-1" style={{ color: textMuted }}>Priority Filter</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm rounded-lg px-3 py-1.5 focus:outline-none"
              style={inputStyle}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
        <div className="text-xs" style={{ color: textMuted }}>
          Showing <span className="font-semibold" style={{ color: textPrimary }}>{cases.length}</span> active cases
        </div>
      </div>

      {/* Cases Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div
          className="rounded-xl overflow-hidden shadow-xl"
          style={{ border: `1px solid ${borderColor}`, background: isDark ? 'rgba(13,13,23,0.9)' : '#ffffff' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead style={{ background: isDark ? 'rgba(8,8,15,0.8)' : '#f5f5f5', borderBottom: `1px solid ${borderColor}` }}>
                <tr>
                  {['Case #', 'Tx ID', 'Type / Amount', 'ML Score', 'Decision', 'Priority', 'Status', 'Assigned To', 'Action'].map((h, i) => (
                    <th
                      key={h}
                      className="py-3.5 px-4 text-xs uppercase tracking-wider font-bold"
                      style={{ color: textSecondary, textAlign: i === 8 ? 'right' : 'left' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: textPrimary }}>
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8" style={{ color: textMuted }}>
                      No cases match the selected filters.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr
                      key={c.case_number}
                      className="transition"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(124,58,237,0.04)' : '#f9fafb')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 px-4 font-mono font-medium" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>{c.case_number}</td>
                      <td className="py-3 px-4 font-mono" style={{ color: textSecondary }}>{c.transaction_id || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium" style={{ color: textPrimary }}>{c.tx_type}</div>
                        <div className="text-xs" style={{ color: textSecondary }}>${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: textPrimary }}>{c.risk_score}</span>
                          <span className="text-xs" style={{ color: textSecondary }}>/ 100</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDecisionBadge(c.decision)}`}
                          style={getDecisionBadgeStyle(c.decision)}
                        >
                          {c.decision}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(c.priority)}`}
                          style={getPriorityStyle(c.priority)}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium" style={{ color: textPrimary }}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs" style={{ color: textSecondary }}>{c.assigned_to}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenCase(c)}
                          className="px-3 py-1 text-white text-xs font-medium rounded transition shadow-sm"
                          style={isDark
                            ? { background: '#4f46e5' }
                            : { background: '#4f46e5' }
                          }
                          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4338ca')}
                          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4f46e5')}
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
        <div
          className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ background: isDark ? 'rgba(8,8,15,0.85)' : 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
            style={{ background: isDark ? '#0f0f1b' : '#ffffff', border: `1px solid ${isDark ? 'rgba(124,58,237,0.3)' : '#e5e5e5'}` }}
          >
            {/* Modal Header */}
            <div
              className="p-6 flex items-center justify-between sticky top-0 z-10"
              style={{ background: isDark ? '#0f0f1b' : '#ffffff', borderBottom: `1px solid ${borderColor}` }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold" style={{ color: textPrimary }}>{selectedCase.case_number}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDecisionBadge(selectedCase.decision)}`}
                    style={getDecisionBadgeStyle(selectedCase.decision)}
                  >
                    {selectedCase.decision}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(selectedCase.priority)}`}
                    style={getPriorityStyle(selectedCase.priority)}
                  >
                    {selectedCase.priority}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: textMuted }}>Created: {new Date(selectedCase.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-xl font-bold p-1 rounded transition"
                style={{ color: textSecondary }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = textPrimary)}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = textSecondary)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Transaction Specs */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl"
                style={isDark
                  ? { background: 'rgba(22,22,42,0.6)', border: '1px solid rgba(30,30,58,0.6)' }
                  : { background: '#f9fafb', border: '1px solid #e5e5e5' }
                }
              >
                <div>
                  <span className="text-xs block" style={{ color: textMuted }}>Type</span>
                  <span className="font-semibold" style={{ color: textPrimary }}>{selectedCase.tx_type}</span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: textMuted }}>Amount</span>
                  <span className="font-semibold" style={{ color: isDark ? '#34d399' : '#15803d' }}>
                    ${selectedCase.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: textMuted }}>Origin Bal (Old → New)</span>
                  <span className="text-xs font-mono" style={{ color: textPrimary }}>
                    ${selectedCase.oldbalanceOrg.toLocaleString()} → ${selectedCase.newbalanceOrig.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: textMuted }}>Dest Bal (Old → New)</span>
                  <span className="text-xs font-mono" style={{ color: textPrimary }}>
                    ${selectedCase.oldbalanceDest.toLocaleString()} → ${selectedCase.newbalanceDest.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Decision Rationale & Rules Triggered */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>Decision Rationale</h3>
                <div
                  className="p-3 rounded-lg text-sm"
                  style={isDark
                    ? { background: 'rgba(22,22,42,0.4)', border: '1px solid rgba(30,30,58,0.5)', color: '#cbd5e1' }
                    : { background: '#f9fafb', border: '1px solid #e5e5e5', color: '#171717' }
                  }
                >
                  {selectedCase.decision_reason}
                </div>
                {selectedCase.triggered_rules && selectedCase.triggered_rules.length > 0 && (
                  <div>
                    <span
                      className="text-xs font-semibold uppercase tracking-wider block mb-2"
                      style={{ color: isDark ? '#f87171' : '#b91c1c' }}
                    >
                      Triggered Business Rules
                    </span>
                    <div className="space-y-2">
                      {selectedCase.triggered_rules.map((r, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg text-xs flex items-center justify-between"
                          style={isDark
                            ? { background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fca5a5' }
                            : { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c' }
                          }
                        >
                          <span><strong>{r.rule_id}</strong>: {r.rule_name}</span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] uppercase"
                            style={isDark
                              ? { background: 'rgba(244,63,94,0.2)' }
                              : { background: '#fee2e2', color: '#991b1b' }
                            }
                          >
                            {r.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Analyst Edit Form */}
              <div className="space-y-4 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>Analyst Investigation Form</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: textMuted }}>Queue Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full text-sm rounded-lg p-2 focus:outline-none"
                      style={inputStyle}
                    >
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="UNDER_INVESTIGATION">Under Investigation</option>
                      <option value="CONFIRMED_FRAUD">Confirmed Fraud</option>
                      <option value="FALSE_POSITIVE">False Positive</option>
                      <option value="RESOLVED_LEGITIMATE">Resolved Legitimate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs block mb-1" style={{ color: textMuted }}>Assigned Analyst</label>
                    <input
                      type="text"
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-full text-sm rounded-lg p-2 focus:outline-none"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="text-xs block mb-1" style={{ color: textMuted }}>Analyst Verdict (Ground Truth)</label>
                    <select
                      value={editVerdict}
                      onChange={(e) => setEditVerdict(e.target.value)}
                      className="w-full text-sm rounded-lg p-2 focus:outline-none font-semibold"
                      style={{ ...inputStyle, color: isDark ? '#818cf8' : '#4f46e5' }}
                    >
                      <option value="UNVERIFIED">Unverified</option>
                      <option value="CONFIRMED_FRAUD">Confirmed Fraud (Positive)</option>
                      <option value="FALSE_POSITIVE">False Positive (Legitimate)</option>
                      <option value="CONFIRMED_LEGITIMATE">Confirmed Legitimate</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs block mb-1" style={{ color: textMuted }}>Investigation Notes &amp; Evidence</label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Enter analyst notes, cardholder verification response, branch checks, or evidence..."
                    className="w-full text-sm rounded-lg p-3 focus:outline-none resize-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="p-4 flex items-center justify-end gap-3 sticky bottom-0"
              style={{ background: isDark ? '#0f0f1b' : '#ffffff', borderTop: `1px solid ${borderColor}` }}
            >
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition"
                style={isDark
                  ? { background: 'rgba(22,22,42,0.8)', color: '#cbd5e1', border: '1px solid rgba(30,30,58,0.8)' }
                  : { background: '#f5f5f5', color: '#374151', border: '1px solid #e5e5e5' }
                }
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCase}
                disabled={updating}
                className="px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                style={{ background: '#4f46e5' }}
                onMouseEnter={e => { if (!updating) (e.currentTarget as HTMLButtonElement).style.background = '#4338ca'; }}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#4f46e5')}
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
