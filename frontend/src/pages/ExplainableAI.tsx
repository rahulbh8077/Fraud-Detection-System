import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { getFeatureImportance } from '../api/client';
import { ChartCard } from '../components/ui/ChartCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ChartSkeleton } from '../components/ui/LoadingSkeleton';
import { Cpu, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ExplainableAI() {
  usePageMeta('Explainable AI (XAI)', 'Transparent model feature importance, decision factors, and interpretability rules.');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureImportance()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={320} />;
  if (!data || !data.feature_importances) return <EmptyState title="No Explanation Data Available" />;

  const sortedFeatures = [...data.feature_importances].sort(
    (a: any, b: any) => b.importance - a.importance
  );

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border-navy-700 space-y-2">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-brand-400" />
          <h3 className="text-base font-bold text-slate-100">
            Model Interpretability & Explanation Engine
          </h3>
        </div>
        <p className="text-sm text-slate-300 max-w-3xl">
          FraudShield AI utilizes a dual-layer explainability approach: Global Feature Importance from tree-based ensembles ({data.model_name || 'Random Forest'}) and Local Rule-Based Risk Attribution for individual transaction predictions.
        </p>
      </div>

      {/* Global Feature Importance Chart */}
      <ChartCard
        title="Global Feature Importance"
        subtitle="Relative contribution of each transaction feature across all training samples"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={sortedFeatures} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              width={160}
            />
            <Tooltip
              formatter={(v: any) => [`${(Number(v) * 100).toFixed(2)}%`, 'Weight']}
              contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }}
            />
            <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]}>
              {sortedFeatures.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#ef4444' : i < 3 ? '#f59e0b' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Factor Attribution Guide Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 space-y-3 border-navy-700">
          <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
            <Layers className="w-4 h-4" />
            Balance Inconsistency Signals
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The model flags transactions where balance before and after does not match the transferred amount:
            <code className="block mt-1 font-mono text-[11px] text-slate-300 bg-navy-950 p-1.5 rounded">
              origin_error = |oldOrg - amount - newOrg|
            </code>
          </p>
        </div>

        <div className="card p-5 space-y-3 border-navy-700">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <HelpCircle className="w-4 h-4" />
            Transaction Type Weighting
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            In PaySim distribution data, fraud is overwhelmingly concentrated in <strong>TRANSFER</strong> and <strong>CASH_OUT</strong> types. Others (PAYMENT, CASH_IN) carry minimal baseline risk.
          </p>
        </div>

        <div className="card p-5 space-y-3 border-navy-700">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Balance Drain Signals
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A strong indicator of account takeover is an origin balance that drops completely to zero immediately following a high-value transfer.
          </p>
        </div>
      </div>
    </div>
  );
}

