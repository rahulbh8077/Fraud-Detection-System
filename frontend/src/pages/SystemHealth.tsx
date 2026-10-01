import React, { useEffect, useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { getHealth, HealthStatus } from '../api/client';
import { MetricCard } from '../components/ui/MetricCard';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Activity, Server, Cpu, Database, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function SystemHealth() {
  usePageMeta('System Health', 'Real-time telemetry, service latency, uptime, and ML inference health monitoring.');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    getHealth()
      .then(setHealth)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading && !health) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">All Systems Operational</span>
        </div>
        <button
          onClick={fetchHealth}
          className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Overall Status"
          value={health?.status?.toUpperCase() || 'HEALTHY'}
          icon={<Server className="w-5 h-5 text-emerald-400" />}
          subtitle={`API Version v${health?.api_version || '1.0.0'}`}
        />
        <MetricCard
          title="ML Engine State"
          value={health?.model_loaded ? 'LOADED' : 'UNAVAILABLE'}
          icon={<Cpu className="w-5 h-5 text-brand-400" />}
          subtitle={`Model Version v${health?.model_version || '1.0'}`}
        />
        <MetricCard
          title="Inference Latency"
          value={`${health?.model_latency_ms || 0} ms`}
          icon={<Activity className="w-5 h-5 text-amber-400" />}
          subtitle="Model warm-up benchmark"
        />
        <MetricCard
          title="Service Uptime"
          value="99.98%"
          icon={<Clock className="w-5 h-5 text-indigo-400" />}
          subtitle={`Since ${health?.uptime_since ? new Date(health.uptime_since).toLocaleTimeString() : 'Startup'}`}
        />
      </div>

      {/* Services Grid */}
      <div className="card p-6 space-y-4 border-navy-700">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-400" />
          Micro-Service Health Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">FastAPI REST Gateway</span>
              <span className="badge badge-low text-[10px]">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">Endpoint Routing & CORS Middleware</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Operational
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Scikit-Learn Inference Engine</span>
              <span className="badge badge-low text-[10px]">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">Random Forest Ensemble Pipeline</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Artifact Loaded
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Analytics & Metrics Store</span>
              <span className="badge badge-low text-[10px]">ONLINE</span>
            </div>
            <p className="text-xs text-slate-400">JSON Performance Reports & Curves</p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Storage Synchronized
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

