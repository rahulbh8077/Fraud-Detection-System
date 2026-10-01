import React, { useState } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { Sliders, Save, Shield, Bell, RefreshCw } from 'lucide-react';

export default function Settings() {
  usePageMeta('Settings', 'Configure risk thresholds, alert sensitivity, and platform preferences.');
  const { addToast } = useApp();

  const [lowThreshold, setLowThreshold] = useState(30);
  const [highThreshold, setHighThreshold] = useState(70);
  const [criticalThreshold, setCriticalThreshold] = useState(85);
  const [autoBlockCritical, setAutoBlockCritical] = useState(true);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(false);
  const [detailedExplanations, setDetailedExplanations] = useState(true);

  const handleSave = () => {
    addToast('Platform settings and risk thresholds saved successfully.', 'success');
  };

  const handleReset = () => {
    setLowThreshold(30);
    setHighThreshold(70);
    setCriticalThreshold(85);
    setAutoBlockCritical(true);
    setEnableSoundAlerts(false);
    setDetailedExplanations(true);
    addToast('Settings reset to factory defaults.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Risk Thresholds Card */}
      <div className="card p-6 space-y-6 border-navy-700">
        <div className="flex items-center gap-2 border-b border-navy-700 pb-3">
          <Sliders className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-semibold text-slate-100">Risk Threshold Controls</h3>
        </div>

        <div className="space-y-6">
          {/* Low Risk Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">LOW Risk Cutoff</span>
              <span className="font-mono text-slate-200">{lowThreshold}% probability</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Transactions below {lowThreshold}% are marked LEGITIMATE and auto-approved.
            </p>
          </div>

          {/* High Risk Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400">HIGH Risk Cutoff</span>
              <span className="font-mono text-slate-200">{highThreshold}% probability</span>
            </div>
            <input
              type="range"
              min="50"
              max="85"
              value={highThreshold}
              onChange={(e) => setHighThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-slate-400">
              Transactions between {lowThreshold}% and {highThreshold}% require additional verification.
            </p>
          </div>

          {/* Critical Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-red-400">CRITICAL Risk Cutoff</span>
              <span className="font-mono text-slate-200">{criticalThreshold}% probability</span>
            </div>
            <input
              type="range"
              min="75"
              max="95"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-navy-950 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <p className="text-[11px] text-slate-400">
              Transactions above {criticalThreshold}% trigger immediate freeze and Tier-3 alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Card */}
      <div className="card p-6 space-y-4 border-navy-700">
        <div className="flex items-center gap-2 border-b border-navy-700 pb-3">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-semibold text-slate-100">Automated Security Preferences</h3>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-navy-800 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block">Auto-Block Critical Transactions</span>
              <span className="text-slate-400 text-[11px]">
                Automatically reject transfers scoring above Critical Threshold without holding in queue.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoBlockCritical}
              onChange={(e) => setAutoBlockCritical(e.target.checked)}
              className="w-4 h-4 text-brand-500 bg-navy-900 border-navy-700 rounded focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-navy-800 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block">Generate Factor Explanations</span>
              <span className="text-slate-400 text-[11px]">
                Include natural language factor attributions in prediction API responses.
              </span>
            </div>
            <input
              type="checkbox"
              checked={detailedExplanations}
              onChange={(e) => setDetailedExplanations(e.target.checked)}
              className="w-4 h-4 text-brand-500 bg-navy-900 border-navy-700 rounded focus:ring-brand-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-navy-800 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Toast Notifications for High Risk
              </span>
              <span className="text-slate-400 text-[11px]">
                Display UI notification toast whenever a Critical transaction is detected.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableSoundAlerts}
              onChange={(e) => setEnableSoundAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-500 bg-navy-900 border-navy-700 rounded focus:ring-brand-500"
            />
          </label>
        </div>
      </div>

      {/* Save Action Toolbar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="btn-ghost text-xs flex items-center gap-1.5 text-slate-400 hover:text-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset to Defaults
        </button>

        <button onClick={handleSave} className="btn-primary py-2 px-5 text-xs flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>
    </div>
  );
}

