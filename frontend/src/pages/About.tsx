import React from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { Shield, AlertTriangle, Cpu, Layers, Lock, CheckCircle2 } from 'lucide-react';

export default function About() {
  usePageMeta('About FraudShield AI', 'Platform architecture, machine learning methodology, safety disclaimers, and technical stack.');

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Product Hero Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border-navy-700 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 rounded-xl text-brand-400 border border-brand-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">FraudShield AI</h3>
            <p className="text-xs text-brand-400 font-medium">
              AI-Powered Transaction Risk & Fraud Intelligence Platform
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed pt-1">
          FraudShield AI is an enterprise-grade fintech security platform designed to detect, analyze, and explain fraudulent financial transactions in real time using machine learning pipelines and transparent rule attribution.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="card p-4 bg-amber-950/20 border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
          <AlertTriangle className="w-4 h-4" /> Model Risk Disclaimer
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          FraudShield AI provides machine-learning-based risk estimates and probability scores. A prediction does not establish that a transaction is definitively fraudulent. High-risk transactions should be reviewed according to appropriate organizational compliance procedures before taking action.
        </p>
      </div>

      {/* Tech Stack Grid */}
      <div className="card p-6 space-y-4 border-navy-700">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-400" /> Technology Architecture Stack
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-semibold text-brand-400 block text-sm">Frontend Layer</span>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> React 18 + TypeScript</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tailwind CSS (Fintech Theme)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recharts Data Visualizations</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Lucide React Icons</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-semibold text-emerald-400 block text-sm">Backend & ML Pipeline</span>
            <ul className="space-y-1 text-slate-300">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> FastAPI (Python 3.11+)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> scikit-learn (Random Forest Ensemble)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PR-AUC Model Optimization</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> OpenPyXL XLSX Report Engine</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dataset & Machine Learning Note */}
      <div className="card p-6 space-y-3 border-navy-700">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" /> Machine Learning Methodology
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          The underlying model is trained on PaySim financial synthetic transaction datasets (containing 100,000+ transaction rows). Four algorithms—Logistic Regression, Decision Trees, Random Forest, and HistGradientBoosting—are evaluated, with automatic selection prioritizing PR-AUC over raw accuracy to effectively handle severe class imbalance.
        </p>
      </div>
    </div>
  );
}

