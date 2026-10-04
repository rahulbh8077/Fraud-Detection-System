import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, LayoutDashboard, Upload, BarChart3, Table, Activity,
  FileText, Settings, BookOpen, Info, Zap, ClipboardList, Sliders,
  TrendingUp, Cpu, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const SEARCH_ITEMS = [
  { label: 'Dashboard',           path: '/',                 icon: LayoutDashboard, desc: 'Overview & KPI metrics'           },
  { label: 'Analyze Transaction', path: '/analyze',          icon: Search,          desc: 'Run real-time fraud prediction'   },
  { label: 'Upload Dataset',      path: '/upload',           icon: Upload,          desc: 'Batch CSV/XLSX processing'        },
  { label: 'Case Queue',          path: '/cases',            icon: ClipboardList,   desc: 'Analyst investigation queue'      },
  { label: 'Rules Engine',        path: '/rules',            icon: Sliders,         desc: 'Business rule management'         },
  { label: 'Fraud Analytics',     path: '/fraud-analytics',  icon: BarChart3,       desc: 'Fraud trends & statistics'        },
  { label: 'Transactions',        path: '/transactions',     icon: Table,           desc: 'Transaction explorer'             },
  { label: 'Risk Monitoring',     path: '/risk-monitoring',  icon: Activity,        desc: 'Live risk monitoring'             },
  { label: 'Model Performance',   path: '/model-performance',icon: TrendingUp,      desc: 'ML metrics & benchmarks'          },
  { label: 'Explainable AI',      path: '/explainable-ai',   icon: Zap,             desc: 'SHAP feature explanations'        },
  { label: 'Reports',             path: '/reports',          icon: FileText,        desc: 'Export CSV / XLSX reports'        },
  { label: 'System Health',       path: '/system-health',    icon: Cpu,             desc: 'API & service status'             },
  { label: 'API Docs',            path: '/api-docs',         icon: BookOpen,        desc: 'Interactive API reference'        },
  { label: 'Settings',            path: '/settings',         icon: Settings,        desc: 'App configuration'                },
  { label: 'About',               path: '/about',            icon: Info,            desc: 'Project information'              },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const filtered = SEARCH_ITEMS.filter(item =>
    query === '' ||
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const go = useCallback((path: string) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  // Keyboard navigation inside modal
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(s => Math.min(s + 1, Math.max(filtered.length - 1, 0)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(s => Math.max(s - 1, 0));
      }
      if (e.key === 'Enter' && filtered[selected]) {
        e.preventDefault();
        go(filtered[selected].path);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, selected, go, onClose]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 animate-fade-in"
      style={{
        background: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-slide-up"
        style={isDark ? {
          background: '#0d0d1a',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(124,58,237,0.15)',
        } : {
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{
            borderBottom: isDark ? '1px solid rgba(124,58,237,0.18)' : '1px solid #e5e5e5'
          }}
        >
          <Search
            className="w-4 h-4 shrink-0"
            style={{ color: isDark ? '#a78bfa' : '#000000' }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages, operations, model insights..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm font-semibold"
            style={{
              color: isDark ? '#f8fafc' : '#000000',
              caretColor: isDark ? '#a78bfa' : '#000000',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:opacity-75 transition-opacity"
              aria-label="Clear search"
            >
              <X
                className="w-4 h-4"
                style={{ color: isDark ? '#94a3b8' : '#737373' }}
              />
            </button>
          )}
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={isDark ? {
              background: 'rgba(124,58,237,0.2)',
              color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.3)',
            } : {
              background: '#f5f5f5',
              color: '#000000',
              border: '1px solid #e5e5e5',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div
              className="px-4 py-10 text-center text-sm font-medium"
              style={{ color: isDark ? '#94a3b8' : '#737373' }}
            >
              No matching pages found for "{query}"
            </div>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              const isActive = i === selected;
              return (
                <button
                  key={item.path}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100"
                  style={
                    isActive
                      ? isDark
                        ? {
                            background: 'rgba(124,58,237,0.18)',
                            borderLeft: '3px solid #a78bfa',
                          }
                        : {
                            background: '#f5f5f5',
                            borderLeft: '3px solid #000000',
                          }
                      : {
                          background: 'transparent',
                          borderLeft: '3px solid transparent',
                        }
                  }
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => go(item.path)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                    style={
                      isActive
                        ? isDark
                          ? {
                              background: 'rgba(124,58,237,0.35)',
                              color: '#ffffff',
                            }
                          : {
                              background: '#000000',
                              color: '#ffffff',
                            }
                        : isDark
                          ? {
                              background: 'rgba(124,58,237,0.12)',
                              color: '#a78bfa',
                            }
                          : {
                              background: '#f5f5f5',
                              color: '#525252',
                            }
                    }
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-bold truncate"
                      style={{ color: isDark ? '#f8fafc' : '#000000' }}
                    >
                      {item.label}
                    </div>
                    <div
                      className="text-xs truncate font-medium"
                      style={{ color: isDark ? '#94a3b8' : '#737373' }}
                    >
                      {item.desc}
                    </div>
                  </div>
                  {isActive && (
                    <ArrowRight
                      className="w-4 h-4 shrink-0"
                      style={{ color: isDark ? '#a78bfa' : '#000000' }}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center justify-between px-4 py-2.5 text-[11px] font-semibold"
          style={{
            borderTop: isDark ? '1px solid rgba(124,58,237,0.18)' : '1px solid #e5e5e5',
            color: isDark ? '#94a3b8' : '#737373',
            background: isDark ? '#090914' : '#fafafa',
          }}
        >
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ background: isDark ? '#1f1f38' : '#e5e5e5' }}>↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ background: isDark ? '#1f1f38' : '#e5e5e5' }}>↵</kbd> Open</span>
            <span><kbd className="px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ background: isDark ? '#1f1f38' : '#e5e5e5' }}>Esc</kbd> Close</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: isDark ? '#7c3aed' : '#000000' }}>
            FraudShield AI
          </span>
        </div>
      </div>
    </div>
  );
}
