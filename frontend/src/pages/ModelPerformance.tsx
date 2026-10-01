import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricCard } from '../components/ui/MetricCard';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ChartSkeleton } from '../components/ui/LoadingSkeleton';
import { usePageMeta } from '../components/layout/Layout';
import { getModelInfo, getConfusionMatrix, getRocCurve, getPrCurve, getFeatureImportance } from '../api/client';
import { formatPercent } from '../utils/format';

export default function ModelPerformance() {
  usePageMeta('Model Performance', 'Evaluate model accuracy, precision, recall, and fraud detection capability.');
  const [info, setInfo] = useState<any>(null);
  const [cm, setCm] = useState<any>(null);
  const [roc, setRoc] = useState<any>(null);
  const [pr, setPr] = useState<any>(null);
  const [fi, setFi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getModelInfo(), getConfusionMatrix(), getRocCurve(), getPrCurve(), getFeatureImportance()])
      .then(([i, c, r, p, f]) => { setInfo(i); setCm(c); setRoc(r); setPr(p); setFi(f); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && error) return <EmptyState icon="🤖" title="No model data" description={error} />;

  const metrics = info?.metrics || {};
  const comparison = info?.model_comparison || {};
  const compRows = Object.entries(comparison).map(([name, m]: [string, any]) => ({ name, ...m }));

  // ROC chart data
  const rocData = roc?.fpr ? roc.fpr.map((x: number, i: number) => ({ fpr: x, tpr: roc.tpr[i] })) : [];
  const prData = pr?.precision ? pr.precision.map((x: number, i: number) => ({ precision: x, recall: pr.recall[i] })) : [];

  // Feature importance
  const importances: any[] = fi?.feature_importances ?? [];
  const topImportances = importances.slice(0, 10);
  const maxImp = Math.max(...topImportances.map((x) => x.importance), 0.01);

  return (
    <div className="space-y-6">
      {/* Model Info */}
      {!loading && info && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="label-text">Active Model</div>
              <div className="text-lg font-bold text-slate-100">{info.model_display_name || info.selected_model}</div>
            </div>
            <div>
              <div className="label-text">Version</div>
              <div className="font-mono text-sm text-brand-400">{info.model_version || '1.0'}</div>
            </div>
            <div>
              <div className="label-text">Training Date</div>
              <div className="text-sm text-slate-300">{info.training_date ? new Date(info.training_date).toLocaleDateString() : '—'}</div>
            </div>
            <div>
              <div className="label-text">Selection Criterion</div>
              <div className="text-sm text-slate-300">{info.selection || 'Highest PR-AUC'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {['accuracy','precision','recall','f1','roc_auc','pr_auc'].map((k) => (
          <MetricCard
            key={k} loading={loading}
            title={k.replace('_', '-').toUpperCase()}
            value={metrics[k] != null ? metrics[k].toFixed(3) : '—'}
            accent={k === 'recall' ? 'green' : k === 'pr_auc' ? 'blue' : 'default'}
          />
        ))}
      </div>

      {/* ROC + PR Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="ROC Curve" subtitle={`AUC = ${(metrics.roc_auc || 0).toFixed(3)}`}>
          {loading ? <ChartSkeleton height={220} /> : rocData.length === 0 ? <EmptyState title="No ROC data" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={rocData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                <XAxis dataKey="fpr" tickFormatter={(v) => v.toFixed(1)} label={{ value: 'FPR', position: 'insideBottomRight', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickFormatter={(v) => v.toFixed(1)} label={{ value: 'TPR', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                <Line type="monotone" dataKey="tpr" stroke="#3b82f6" dot={false} strokeWidth={2} name="TPR" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Precision–Recall Curve" subtitle={`PR-AUC = ${(metrics.pr_auc || 0).toFixed(3)}`}>
          {loading ? <ChartSkeleton height={220} /> : prData.length === 0 ? <EmptyState title="No PR data" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={prData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                <XAxis dataKey="recall" tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Recall', position: 'insideBottomRight', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                <Line type="monotone" dataKey="precision" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Precision" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Confusion Matrix */}
      {!loading && cm && (
        <ChartCard title="Confusion Matrix" subtitle="At 0.5 probability threshold">
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto my-4">
            {[
              { label: 'True Negative', value: cm.true_negative, color: 'bg-green-950 border-green-800 text-green-300', desc: 'Correctly identified as legitimate' },
              { label: 'False Positive', value: cm.false_positive, color: 'bg-amber-950 border-amber-800 text-amber-300', desc: 'Legitimate flagged as fraud' },
              { label: 'False Negative', value: cm.false_negative, color: 'bg-red-950 border-red-800 text-red-300', desc: 'Fraud missed by model' },
              { label: 'True Positive', value: cm.true_positive, color: 'bg-blue-950 border-blue-800 text-blue-300', desc: 'Correctly identified as fraud' },
            ].map(({ label, value, color, desc }) => (
              <div key={label} className={`border rounded-xl p-4 ${color}`}>
                <div className="text-xs font-semibold mb-1">{label}</div>
                <div className="text-2xl font-bold">{(value ?? 0).toLocaleString()}</div>
                <div className="text-xs opacity-70 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Feature Importance */}
      {!loading && topImportances.length > 0 && (
        <ChartCard title="Feature Importance" subtitle="Most influential features in model predictions">
          <div className="space-y-2 mt-2">
            {topImportances.map((f, i) => (
              <div key={f.feature} className="flex items-center gap-3">
                <div className="text-xs text-slate-400 w-40 shrink-0 truncate" title={f.feature}>{f.feature}</div>
                <div className="flex-1 bg-navy-700 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(f.importance / maxImp) * 100}%` }}
                  />
                </div>
                <div className="font-mono text-xs text-slate-400 w-16 text-right">{(f.importance * 100).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Model Comparison Table */}
      {!loading && compRows.length > 0 && (
        <ChartCard title="Model Comparison" subtitle="All candidate models evaluated on held-out test set">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600">
                  {['Model', 'Accuracy', 'Precision', 'Recall', 'F1', 'ROC-AUC', 'PR-AUC'].map(h => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compRows.map((row) => (
                  <tr key={row.name} className={`table-row ${ row.name === info?.selected_model ? 'bg-brand-500/5 border-l-2 border-brand-500' : '' }`}>
                    <td className="table-cell font-medium">
                      {row.name.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      {row.name === info?.selected_model && <span className="ml-2 badge-low text-xs">Selected</span>}
                    </td>
                    {['accuracy','precision','recall','f1','roc_auc','pr_auc'].map(m => (
                      <td key={m} className="table-cell font-mono">{row[m] != null ? row[m].toFixed(3) : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">Model selection prioritizes PR-AUC (then recall) for class-imbalanced fraud detection.</p>
        </ChartCard>
      )}
    </div>
  );
}
