import React, { useState, useMemo } from 'react';
import { usePageMeta } from '../components/layout/Layout';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/ui/EmptyState';
import { RiskBadge } from '../components/ui/RiskBadge';
import { RiskScore } from '../components/ui/RiskScore';
import { formatCurrency, formatNumber } from '../utils/format';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

export default function TransactionExplorer() {
  usePageMeta('Transaction Explorer', 'Search, filter, and inspect batch transaction records.');
  const { uploadedResults } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'amount' | 'fraud_probability' | 'risk_score'>('fraud_probability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const transactions = uploadedResults?.top_results || [];

  const filteredData = useMemo(() => {
    return transactions
      .filter((tx: any) => {
        const matchesSearch =
          searchTerm === '' ||
          tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.risk_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(tx.amount).includes(searchTerm);

        const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
        const matchesRisk = riskFilter === 'ALL' || tx.risk_level === riskFilter;

        return matchesSearch && matchesType && matchesRisk;
      })
      .sort((a: any, b: any) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [transactions, searchTerm, typeFilter, riskFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  if (!uploadedResults) {
    return (
      <EmptyState
        title="No Dataset Uploaded"
        description="Please upload a CSV/XLSX dataset in the 'Upload Dataset' tab to explore and filter transaction records."
      />
    );
  }

  const toggleSort = (field: 'amount' | 'fraud_probability' | 'risk_score') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by type, risk, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="input-field py-1.5 text-xs"
            >
              <option value="ALL">All Types</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="CASH_OUT">CASH_OUT</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="CASH_IN">CASH_IN</option>
              <option value="DEBIT">DEBIT</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="input-field py-1.5 text-xs"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-navy-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            Showing {filteredData.length} records
          </h3>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-navy-950 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-1">
                    Amount <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="p-3 cursor-pointer select-none"
                  onClick={() => toggleSort('fraud_probability')}
                >
                  <div className="flex items-center gap-1">
                    Fraud Prob <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="p-3 cursor-pointer select-none"
                  onClick={() => toggleSort('risk_score')}
                >
                  <div className="flex items-center gap-1">
                    Risk Score <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching transactions found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-navy-700/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{row.type}</td>
                    <td className="p-3 font-mono font-medium">{formatCurrency(row.amount)}</td>
                    <td className="p-3 font-mono">
                      {(row.fraud_probability * 100).toFixed(2)}%
                    </td>
                    <td className="p-3">
                      <RiskBadge level={row.risk_level} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedTx(row)}
                        className="btn-ghost py-1 px-2 text-xs flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-400" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-navy-700 flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 rounded text-xs font-semibold ${
                    page === pageNum
                      ? 'bg-brand-500 text-white'
                      : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inspect Modal Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-4 border border-navy-600 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-700 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Transaction Inspection
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-navy-950 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Transaction Type</span>
                <span className="font-semibold text-slate-200 text-sm">{selectedTx.type}</span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Amount</span>
                <span className="font-semibold text-emerald-400 text-sm font-mono">
                  {formatCurrency(selectedTx.amount)}
                </span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Fraud Probability</span>
                <span className="font-semibold text-red-400 text-sm font-mono">
                  {(selectedTx.fraud_probability * 100).toFixed(2)}%
                </span>
              </div>
              <div className="bg-navy-950 p-3 rounded-lg">
                <span className="text-slate-400 block mb-1">Risk Level</span>
                <RiskBadge level={selectedTx.risk_level} />
              </div>
            </div>

            <div className="bg-navy-950 p-3 rounded-lg space-y-1 text-xs">
              <span className="text-slate-400 block">Model Version</span>
              <p className="text-slate-300 font-mono">{selectedTx.model_version || '1.0'}</p>
              <span className="text-slate-400 block pt-2">Processed At</span>
              <p className="text-slate-300 font-mono">
                {selectedTx.prediction_timestamp
                  ? new Date(selectedTx.prediction_timestamp).toLocaleString()
                  : 'N/A'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedTx(null)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

