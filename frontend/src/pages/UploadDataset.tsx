import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RiskBadge } from '../components/ui/RiskBadge';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageMeta } from '../components/layout/Layout';
import { analyzeDataset } from '../api/client';
import { formatCurrency, formatNumber, formatPercent, formatProbability } from '../utils/format';
import { useApp } from '../context/AppContext';

const RISK_COLORS: Record<string, string> = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444', CRITICAL: '#991b1b' };
const STEPS = ['Upload', 'Validate', 'Profile', 'Analyze', 'Results'];

export default function UploadDataset() {
  usePageMeta('Upload & Analyze Dataset', 'Upload transaction data to identify fraud patterns and high-risk activity.');
  const { addToast, setUploadedResults } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(0); // 0=idle, 1=uploaded, 2=analyzing, 3=done
  const [result, setResult] = useState<any>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(csv|xlsx)$/i)) {
      addToast('Only CSV and XLSX files are supported.', 'error');
      return;
    }
    setFile(f);
    setStep(1);
    setResult(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setStep(2);
    try {
      const r = await analyzeDataset(file);
      setResult(r);
      setUploadedResults(r);
      setStep(3);
      addToast(`Dataset analyzed: ${r.analytics.total.toLocaleString()} transactions processed.`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Analysis failed.', 'error');
      setStep(1);
    }
  };

  const analytics = result?.analytics;
  const profile = result?.profile;
  const topResults = result?.top_results ?? [];

  const riskData = analytics?.risk_distribution
    ? Object.entries(analytics.risk_distribution).map(([level, count]) => ({ level, count }))
    : [];

  const typeData = analytics?.type_stats ?? [];

  return (
    <div className="max-w-5xl space-y-6">
      {/* Privacy notice */}
      <div className="card p-4 border-blue-900/40 bg-blue-950/20">
        <p className="text-xs text-slate-400">
          🔒 Upload only data you are authorized to analyze. Avoid unnecessary personal or financial information.
          Data is processed in-memory and not stored permanently.
        </p>
      </div>

      {/* Stepper */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${
                i < step ? 'text-green-400' : i === step ? 'text-brand-400' : 'text-slate-600'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                  i === step ? 'border-brand-500' : 'border-slate-600'
                }`}>{i + 1}</div>}
                <span className="text-xs font-medium hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${ i < step ? 'bg-green-400/30' : 'bg-navy-600'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      {step === 0 && (
        <div
          className={`card p-12 border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
            dragging ? 'border-brand-500 bg-brand-500/10' : 'border-navy-500 hover:border-brand-500/50'
          }`}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          role="button" tabIndex={0} aria-label="Upload file"
        >
          <Upload className="w-12 h-12 text-slate-500" />
          <div className="text-center">
            <p className="text-base font-semibold text-slate-300">Drop your dataset here</p>
            <p className="text-sm text-slate-500">or <span className="text-brand-400">Browse Files</span></p>
          </div>
          <p className="text-xs text-slate-600">Supported: CSV, XLSX • PaySim-compatible format</p>
          <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
        </div>
      )}

      {/* File uploaded — ready to analyze */}
      {step >= 1 && step < 3 && (
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-brand-400" />
            <div className="flex-1">
              <p className="font-semibold text-slate-200">{file?.name}</p>
              <p className="text-sm text-slate-400">{file ? (file.size / 1024).toFixed(1) + ' KB' : ''}</p>
            </div>
            <button onClick={() => { setFile(null); setStep(0); setResult(null); }} className="btn-secondary text-sm">Remove</button>
          </div>
          {step === 1 && (
            <button className="btn-primary mt-4 flex items-center gap-2" onClick={handleAnalyze}>
              <BarChart3 className="w-4 h-4" /> Run Fraud Analysis
            </button>
          )}
          {step === 2 && (
            <div className="mt-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-400">Analyzing transactions…</span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {step === 3 && analytics && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card border-l-2 border-brand-500/30">
              <div className="label-text">Total Analyzed</div>
              <div className="text-2xl font-bold text-slate-100">{formatNumber(analytics.total)}</div>
            </div>
            <div className="metric-card border-l-2 border-red-500/30">
              <div className="label-text">Predicted Fraud</div>
              <div className="text-2xl font-bold text-red-400">{formatNumber(analytics.predicted_fraud)}</div>
            </div>
            <div className="metric-card border-l-2 border-amber-500/30">
              <div className="label-text">Suspicious</div>
              <div className="text-2xl font-bold text-amber-400">{formatNumber(analytics.predicted_suspicious)}</div>
            </div>
            <div className="metric-card border-l-2 border-green-500/30">
              <div className="label-text">Legitimate</div>
              <div className="text-2xl font-bold text-green-400">{formatNumber(analytics.predicted_legitimate)}</div>
            </div>
          </div>

          {/* Supervised metrics if labels exist */}
          {result.has_labels && analytics.supervised_metrics && (
            <div className="card p-5">
              <h3 className="section-title mb-4">Supervised Evaluation (vs Actual Labels)</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(analytics.supervised_metrics).filter(([k]) =>
                  ['accuracy','precision','recall','f1','roc_auc','pr_auc'].includes(k)
                ).map(([k, v]: [string, any]) => (
                  <div key={k}>
                    <div className="label-text">{k.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-lg font-bold text-slate-100">{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!result.has_labels && (
            <div className="card p-4 border-amber-800/30 bg-amber-950/10">
              <p className="text-xs text-amber-400">
                ⚠️ This dataset does not contain verified fraud labels. Results are model-generated risk estimates and are not confirmed fraud labels.
              </p>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Risk Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="level" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                  <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]}>
                    {riskData.map((d: any, i: number) => <Cell key={i} fill={RISK_COLORS[d.level] || '#3b82f6'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Type Analysis">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
                  <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatPercent(v)} contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                  <Bar dataKey="avg_probability" name="Avg Fraud Probability" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top results table */}
          <div className="card">
            <div className="p-5 border-b border-navy-600 flex items-center justify-between">
              <h3 className="section-title">Top High-Risk Transactions</h3>
              <span className="text-xs text-slate-500">Showing top 100 by risk</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy-600">
                    {['Type', 'Amount', 'Fraud Probability', 'Risk Score', 'Risk Level', 'Prediction'].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topResults.slice(0, 50).map((row: any, i: number) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell font-mono text-brand-400">{row.type}</td>
                      <td className="table-cell">{formatCurrency(row.amount || 0)}</td>
                      <td className="table-cell font-mono">{formatProbability(row.fraud_probability || 0)}</td>
                      <td className="table-cell font-mono">{row.risk_score}/100</td>
                      <td className="table-cell"><RiskBadge level={row.risk_level || 'LOW'} /></td>
                      <td className="table-cell">
                        <span className={row.predicted_fraud === 'FRAUDULENT' ? 'text-red-400' : row.predicted_fraud === 'SUSPICIOUS' ? 'text-amber-400' : 'text-green-400'}>
                          {row.predicted_fraud}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download */}
          <div className="flex gap-3">
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => {
                // Build CSV from top results
                const csv = [Object.keys(topResults[0] || {}).join(','), ...topResults.map((r: any) => Object.values(r).join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'fraudshield_results.csv'; a.click();
              }}
            >
              <Download className="w-4 h-4" /> Download Results (CSV)
            </button>
            <button className="btn-secondary flex items-center gap-2" onClick={() => { setFile(null); setStep(0); setResult(null); }}>
              Upload Another
            </button>
          </div>
        </>
      )}
    </div>
  );
}
