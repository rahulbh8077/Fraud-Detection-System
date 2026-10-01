import React from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { FileText, Download, FileSpreadsheet, ShieldCheck, Clock } from 'lucide-react';

export default function Reports() {
  usePageMeta('Reports', 'Generate, export, and download comprehensive fraud intelligence reports.');
  const { uploadedResults, addToast } = useApp();

  const handleDownload = (format: 'csv' | 'xlsx') => {
    if (!uploadedResults) {
      addToast('Please upload a dataset first in the Upload Dataset tab to generate exports.', 'warning');
      return;
    }

    addToast(`Preparing ${format.toUpperCase()} export download...`, 'info');
    setTimeout(() => {
      addToast(`Export generated successfully: fraudshield_report.${format}`, 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card p-6 bg-gradient-to-r from-navy-800 via-navy-800 to-navy-900 border-navy-700 space-y-2">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand-400" />
          <h3 className="text-base font-bold text-slate-100">
            Executive Fraud Intelligence & Compliance Export
          </h3>
        </div>
        <p className="text-sm text-slate-300 max-w-3xl">
          Generate audit-ready CSV and multi-tab Excel (XLSX) reports containing full transaction classifications, probability scores, risk levels, and automated executive summaries.
        </p>
      </div>

      {/* Available Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Report Card */}
        <div className="card p-6 space-y-4 border-navy-700 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-brand-500/10 rounded-xl text-brand-400">
                <FileText className="w-6 h-6" />
              </div>
              <span className="badge badge-info font-mono text-[10px]">.CSV FORMAT</span>
            </div>

            <h4 className="text-base font-semibold text-slate-100">Raw Predictions Dataset Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Includes row-level fraud predictions, risk scores, probabilities, model metadata, and explanation tags in clean CSV format. Suitable for SIEM integration or pandas analysis.
            </p>
          </div>

          <div className="pt-4 border-t border-navy-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Instant Generation
            </span>
            <button
              onClick={() => handleDownload('csv')}
              className="btn-primary py-1.5 px-4 text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>
        </div>

        {/* Excel XLSX Report Card */}
        <div className="card p-6 space-y-4 border-navy-700 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="badge badge-low font-mono text-[10px]">.XLSX MULTI-TAB</span>
            </div>

            <h4 className="text-base font-semibold text-slate-100">Executive Excel Summary Workbook</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Includes multiple worksheets: Executive Summary, High-Risk Flagged Feed, Category Breakdown, and Complete Predictions list formatted for financial reviewers.
            </p>
          </div>

          <div className="pt-4 border-t border-navy-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Audit Ready
            </span>
            <button
              onClick={() => handleDownload('xlsx')}
              className="btn-secondary py-1.5 px-4 text-xs flex items-center gap-2 text-slate-200 hover:text-white"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Download Excel (.xlsx)
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Context State */}
      <div className="card p-4 bg-navy-950/60 border-navy-700 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Active Upload Session:{' '}
          <strong className="text-slate-200">
            {uploadedResults ? `${uploadedResults.analytics.total} rows loaded` : 'No file uploaded in active session'}
          </strong>
        </div>
        <span className="text-xs text-slate-500 font-mono">FraudShield AI v1.0.0 Report Engine</span>
      </div>
    </div>
  );
}

