import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Shield, Activity, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { MetricCard } from '../components/ui/MetricCard';
import { ChartCard } from '../components/ui/ChartCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { usePageMeta } from '../components/layout/Layout';
import { getAnalyticsOverview, getModelSummary } from '../api/client';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import { useApp } from '../context/AppContext';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f43f5e', CRITICAL: '#dc2626' };
const TYPE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
export default function Dashboard() {
  usePageMeta('Fraud Intelligence Dashboard', 'Monitor transaction risk, fraud patterns, and model performance.');
  const { addToast, theme } = useApp();
  const isDark = theme === 'dark';
  const [analytics, setAnalytics] = useState<any>(null);

  const tooltipStyle = isDark ? {
    background: 'rgba(13,13,23,0.97)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 12,
    color: '#e2e8f0',
    fontWeight: 'bold',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
  } : {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    color: '#000000',
    fontWeight: 'bold',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  };

  const gridColor = isDark ? 'rgba(124,58,237,0.08)' : '#f0f0f0';
  const axisTextColor = isDark ? '#94a3b8' : '#525252';
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAnalyticsOverview(), getModelSummary()])
      .then(([a, m]) => { setAnalytics(a); setModel(m); })
      .catch((e) => {
        setError(e.message);
        addToast('Could not load dashboard data. Is the API running?', 'warning');
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && error) {
    return (
      <EmptyState
        icon="📊"
        title="No Dashboard Data Available"
        description="Train the model on a dataset first. Run: python -m src.train <dataset_path>"
        action={
          <div className="card p-4 text-left font-mono text-xs text-slate-400 w-full max-w-md">
            <div>python -m src.generate_demo_data</div>
            <div>python -m src.train data/raw/demo_transactions.csv</div>
          </div>
        }
      />
    );
  }

  // KPIs
  const totalRows = analytics?.dataset_rows ?? 0;
  const fraudCount = analytics?.fraud_count ?? 0;
  const fraudRate = analytics?.fraud_rate ?? 0;
  const avgAmount = analytics?.avg_amount ?? 0;
  const recall = model?.metrics?.recall ?? 0;
  const rocAuc = model?.metrics?.roc_auc ?? 0;

  // Type stats for charts
  const typeStats = analytics?.type_stats
    ? Object.entries(analytics.type_stats).map(([type, s]: [string, any]) => ({
        type, ...s, fraud_pct: (s.fraud_rate * 100).toFixed(1),
      }))
    : [];

  // Fraud trend
  const fraudTrend = analytics?.fraud_trend?.slice(-30) ?? [];

  // Pie chart data
  const pieData = [
    { name: 'Legitimate', value: totalRows - fraudCount, color: '#22c55e' },
    { name: 'Fraud', value: fraudCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard loading={loading} title="Total Transactions" value={formatNumber(totalRows)} icon={<Activity className="w-4 h-4" />} accent="cyan" />
        <MetricCard loading={loading} title="Fraud Detected"     value={formatNumber(fraudCount)} icon={<AlertTriangle className="w-4 h-4" />} accent="red" />
        <MetricCard loading={loading} title="Fraud Rate"         value={formatPercent(fraudRate)} subtitle="Training dataset" accent="amber" />
        <MetricCard loading={loading} title="Avg Transaction"    value={avgAmount ? formatCurrency(avgAmount) : '—'} icon={<DollarSign className="w-4 h-4" />} accent="violet" />
        <MetricCard loading={loading} title="Model Recall"       value={recall ? formatPercent(recall) : '—'} subtitle="Fraud detection rate" accent="green" />
        <MetricCard loading={loading} title="ROC-AUC"            value={rocAuc ? rocAuc.toFixed(3) : '—'} subtitle="Discrimination score" accent="cyan" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut */}
        <ChartCard title="Fraud vs Legitimate" subtitle="Training dataset distribution">
          {loading ? <div className="skeleton h-48 w-full" /> : fraudCount === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatNumber(v)} contentStyle={tooltipStyle} />
                <Legend formatter={(v) => <span className="text-xs font-bold" style={{ color: isDark ? '#cbd5e1' : '#171717' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Fraud Trend */}
        <ChartCard title="Fraud Trend" subtitle="Daily fraud rate over time" className="lg:col-span-2">
          {loading ? <div className="skeleton h-48 w-full" /> : fraudTrend.length === 0 ? (
            <EmptyState title="No trend data" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={fraudTrend}>
                <defs>
                  <linearGradient id="fraudGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="step_bucket" tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 'bold' }} label={{ value: 'Day', position: 'insideBottomRight', fill: axisTextColor, fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip formatter={(v: any) => [`${(v * 100).toFixed(2)}%`, 'Fraud Rate']} contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="fraud_rate" stroke="#ef4444" fill="url(#fraudGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fraud by type bar */}
        <ChartCard title="Fraud by Transaction Type" subtitle="Fraud count per type">
          {loading ? <div className="skeleton h-48 w-full" /> : typeStats.length === 0 ? (
            <EmptyState title="No type data" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeStats} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 'bold' }} />
                <YAxis type="category" dataKey="type" tick={{ fill: isDark ? '#cbd5e1' : '#171717', fontSize: 12, fontWeight: 'bold' }} width={80} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="fraud_count" name="Fraud Count" radius={[0, 6, 6, 0]}>
                  {typeStats.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Fraud rate by type */}
        <ChartCard title="Fraud Rate by Transaction Type" subtitle="Percentage flagged per type">
          {loading ? <div className="skeleton h-48 w-full" /> : typeStats.length === 0 ? (
            <EmptyState title="No type data" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="type" tick={{ fill: isDark ? '#cbd5e1' : '#171717', fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: axisTextColor, fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Fraud Rate']} contentStyle={tooltipStyle} />
                <defs>
                  <linearGradient id="amberBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar dataKey="fraud_pct" name="Fraud Rate %" fill="url(#amberBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Transaction type table */}
      {!loading && typeStats.length > 0 && (
        <ChartCard title="Transaction Type Analysis">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-600/80">
                  {['Type', 'Volume', 'Fraud', 'Fraud Rate', 'Avg Amount'].map(h => (
                    <th key={h} className="table-header font-bold text-slate-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typeStats.sort((a, b) => b.fraud_rate - a.fraud_rate).map((row) => (
                  <tr key={row.type} className="table-row font-medium">
                    <td className="table-cell font-mono font-bold text-brand-400">{row.type}</td>
                    <td className="table-cell font-semibold">{formatNumber(row.count)}</td>
                    <td className="table-cell font-bold text-red-400">{formatNumber(row.fraud_count)}</td>
                    <td className="table-cell">
                      <span className={row.fraud_rate > 0.01 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                        {formatPercent(row.fraud_rate)}
                      </span>
                    </td>
                    <td className="table-cell font-semibold">{formatCurrency(row.avg_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {/* Disclaimer */}
      <div
        className="card p-4"
        style={{
          background: 'rgba(245,158,11,0.05)',
          borderColor: 'rgba(245,158,11,0.25)',
          boxShadow: '0 0 20px rgba(245,158,11,0.06)',
        }}
      >
        <p className="text-xs font-medium" style={{ color: '#cbd5e1' }}>
          ⚠️ <strong style={{ color: '#fbbf24' }}>Model Disclaimer:</strong> FraudShield AI provides machine-learning-based risk estimates.
          A prediction does not establish that a transaction is fraudulent. High-risk transactions should be reviewed
          using appropriate organizational procedures.
        </p>
      </div>
    </div>
  );
}
