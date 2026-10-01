import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { getAnalyticsOverview, AnalyticsOverview } from '../api/client';
import { ChartCard } from '../components/ui/ChartCard';
import { MetricCard } from '../components/ui/MetricCard';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton, ChartSkeleton } from '../components/ui/LoadingSkeleton';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import { ShieldAlert, DollarSign, Database, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const TYPE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export default function FraudAnalytics() {
  usePageMeta('Fraud Analytics', 'Deep-dive analysis into historical transaction patterns and fraud distribution.');
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalyticsOverview()
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <ChartSkeleton height={260} />
      </div>
    );
  }

  if (!data) return <EmptyState title="No analytics data available" description="Please train the model first." />;

  const typeStatsArray = Object.entries(data.type_stats || {}).map(([type, stats]) => ({
    type,
    count: stats.count,
    fraud_count: stats.fraud_count,
    fraud_rate: stats.fraud_rate * 100,
    avg_amount: stats.avg_amount,
  }));

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Historical Rows"
          value={formatNumber(data.dataset_rows || 0)}
          icon={<Database className="w-5 h-5 text-brand-400" />}
          subtitle="Dataset transaction sample"
        />
        <MetricCard
          title="Confirmed Fraud Cases"
          value={formatNumber(data.fraud_count || 0)}
          icon={<ShieldAlert className="w-5 h-5 text-red-400" />}
          subtitle={`${formatPercent(data.fraud_rate || 0)} fraud rate`}
        />
        <MetricCard
          title="Average Amount"
          value={formatCurrency(data.avg_amount || 0)}
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
          subtitle="Across all transaction types"
        />
        <MetricCard
          title="Top Fraud Type"
          value={
            typeStatsArray.length > 0
              ? [...typeStatsArray].sort((a, b) => b.fraud_count - a.fraud_count)[0]?.type || 'N/A'
              : 'N/A'
          }
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          subtitle="Highest absolute volume of fraud"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Fraud Trend */}
        <ChartCard title="Temporal Fraud Trend" subtitle="Daily breakdown of fraud rate over simulated steps">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.fraud_trend || []}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
              <XAxis dataKey="step_bucket" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Day', position: 'insideBottomRight', fill: '#64748b', fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${(Number(v) * 100).toFixed(2)}%`, 'Fraud Rate']} contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
              <Area type="monotone" dataKey="fraud_rate" stroke="#ef4444" fill="url(#analyticsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Fraud Rate by Type */}
        <ChartCard title="Fraud Rate by Category" subtitle="Percentage of transactions flagged per type">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeStatsArray}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2340" />
              <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `${v.toFixed(1)}%`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Fraud Rate']} contentStyle={{ background: '#0f1729', border: '1px solid #1e2d4a', borderRadius: 8 }} />
              <Bar dataKey="fraud_rate" radius={[4, 4, 0, 0]}>
                {typeStatsArray.map((_, i) => (
                  <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Breakdown Table */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-100 mb-4">Transaction Type Breakdown Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-navy-950 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Total Volume</th>
                <th className="p-3">Fraud Count</th>
                <th className="p-3">Fraud Rate</th>
                <th className="p-3">Avg Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {typeStatsArray.map((row) => (
                <tr key={row.type} className="hover:bg-navy-700/50 transition-colors">
                  <td className="p-3 font-semibold text-brand-400">{row.type}</td>
                  <td className="p-3 font-mono">{formatNumber(row.count)}</td>
                  <td className="p-3 font-mono text-red-400">{formatNumber(row.fraud_count)}</td>
                  <td className="p-3 font-mono">{row.fraud_rate.toFixed(2)}%</td>
                  <td className="p-3 font-mono">{formatCurrency(row.avg_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


