import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Search, Upload, BarChart3, Table,
  Activity, FileText, Settings, BookOpen, Info,
  ChevronLeft, ChevronRight, Zap, ClipboardList, Sliders,
  TrendingUp, Cpu
} from 'lucide-react';
import { cn } from '../../utils/format';
import { useApp } from '../../context/AppContext';

const navGroups = [
  {
    label: null,
    items: [
      { path: '/',        label: 'Dashboard',           icon: LayoutDashboard },
      { path: '/analyze', label: 'Analyze Transaction',  icon: Search },
      { path: '/upload',  label: 'Upload Dataset',       icon: Upload },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/cases', label: 'Case Queue',   icon: ClipboardList },
      { path: '/rules', label: 'Rules Engine', icon: Sliders },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/fraud-analytics', label: 'Fraud Analytics', icon: BarChart3 },
      { path: '/transactions',    label: 'Transactions',    icon: Table },
      { path: '/risk-monitoring', label: 'Risk Monitoring', icon: Activity },
    ],
  },
  {
    label: 'Model',
    items: [
      { path: '/model-performance', label: 'Performance',    icon: TrendingUp },
      { path: '/explainable-ai',    label: 'Explainable AI', icon: Zap },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/reports',       label: 'Reports',       icon: FileText },
      { path: '/system-health', label: 'System Health', icon: Cpu },
      { path: '/api-docs',      label: 'API Docs',      icon: BookOpen },
      { path: '/settings',      label: 'Settings',      icon: Settings },
      { path: '/about',         label: 'About',         icon: Info },
    ],
  },
];

interface Props { modelOnline?: boolean; modelName?: string; }

export function Sidebar({ modelOnline = false, modelName = 'FraudShield v2.0' }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <aside
      className={cn(
        'h-screen flex flex-col transition-all duration-300 shrink-0 relative overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-[232px]'
      )}
      style={isDark ? {
        /* Rich violet-purple gradient for Dark Mode */
        background: 'linear-gradient(160deg, #3b0764 0%, #4c1d95 30%, #5b21b6 55%, #4a1d96 75%, #2e1065 100%)',
        borderRight: '1px solid rgba(167,139,250,0.2)',
        boxShadow: '4px 0 32px rgba(124,58,237,0.3)',
      } : {
        /* Pure Black and White Premium Luxury for Day Mode */
        background: '#ffffff',
        borderRight: '1px solid #e5e5e5',
        boxShadow: '2px 0 20px rgba(0,0,0,0.03)',
      }}
    >
      {/* Noise / Ambient texture overlay for depth in Dark Mode */}
      {isDark && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse at 10% 0%, rgba(167,139,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 90% 100%, rgba(6,182,212,0.1) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-1 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.8) 50%, transparent 100%)',
            }}
          />
        </>
      )}

      {/* ── Brand / Logo ─────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 relative z-10 shrink-0',
          collapsed && 'justify-center px-2'
        )}
        style={{
          borderBottom: isDark ? '1px solid rgba(167,139,250,0.2)' : '1px solid #e5e5e5'
        }}
      >
        {/* Logo mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={isDark ? {
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(167,139,250,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          } : {
            background: '#000000',
            border: '1px solid #000000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span
              className="font-black text-base tracking-tight block"
              style={isDark ? {
                color: '#ffffff',
                textShadow: '0 0 20px rgba(196,181,253,0.6)'
              } : {
                color: '#000000',
                letterSpacing: '-0.02em'
              }}
            >
              FraudShield
            </span>
            <span
              className="text-[10px] font-semibold block -mt-0.5 tracking-widest uppercase"
              style={{ color: isDark ? 'rgba(196,181,253,0.7)' : '#737373' }}
            >
              AI Enterprise
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('rounded-lg p-1.5 transition-all duration-200', collapsed ? 'mx-auto' : 'ml-auto')}
          style={isDark ? {
            color: 'rgba(196,181,253,0.8)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
          } : {
            color: '#404040',
            background: '#f5f5f5',
            border: '1px solid #e5e5e5',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = isDark ? 'rgba(255,255,255,0.18)' : '#000000';
            el.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5';
            el.style.color = isDark ? 'rgba(196,181,253,0.8)' : '#404040';
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 relative z-10" aria-label="Main navigation"
        style={{ scrollbarWidth: 'none' }}
      >
        {navGroups.map((group, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-5' : ''}>

            {/* Section label */}
            {group.label && !collapsed && (
              <div className="px-3 mb-2 flex items-center gap-2">
                <span
                  className="text-[9px] font-black uppercase tracking-[0.2em]"
                  style={{ color: isDark ? 'rgba(196,181,253,0.55)' : '#737373' }}
                >
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, rgba(196,181,253,0.3), transparent)'
                      : 'linear-gradient(90deg, #e5e5e5, transparent)'
                  }}
                />
              </div>
            )}

            <div className="space-y-0.5">
              {group.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  title={collapsed ? label : undefined}
                >
                  {({ isActive }) => (
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer',
                        collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'
                      )}
                      style={
                        isActive
                          ? isDark
                            ? {
                                background: 'rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.25)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.2)',
                              }
                            : {
                                background: '#000000',
                                border: '1px solid #000000',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              }
                          : {
                              background: 'transparent',
                              border: '1px solid transparent',
                            }
                      }
                      onMouseEnter={e => {
                        if (!isActive) {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = isDark ? 'rgba(255,255,255,0.1)' : '#f5f5f5';
                          el.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : '#e5e5e5';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          const el = e.currentTarget as HTMLDivElement;
                          el.style.background = 'transparent';
                          el.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Icon container */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                        style={
                          isActive
                            ? isDark
                              ? {
                                  background: 'rgba(255,255,255,0.25)',
                                  boxShadow: '0 0 12px rgba(196,181,253,0.4)',
                                }
                              : {
                                  background: '#171717',
                                }
                            : isDark
                              ? {
                                  background: 'rgba(255,255,255,0.08)',
                                }
                              : {
                                  background: '#f5f5f5',
                                }
                        }
                      >
                        <Icon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{
                            color: isActive
                              ? '#ffffff'
                              : isDark
                                ? 'rgba(196,181,253,0.75)'
                                : '#525252'
                          }}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Label */}
                      {!collapsed && (
                        <span
                          className="text-xs font-semibold truncate"
                          style={{
                            color: isActive
                              ? '#ffffff'
                              : isDark
                                ? 'rgba(221,214,254,0.8)'
                                : '#262626'
                          }}
                        >
                          {label}
                        </span>
                      )}

                      {/* Active indicator dot */}
                      {!collapsed && isActive && (
                        <div
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: isDark ? '#a78bfa' : '#ffffff',
                            boxShadow: isDark ? '0 0 6px #a78bfa' : 'none',
                          }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer Status ─────────────────────────────── */}
      <div
        className="p-3 relative z-10 shrink-0"
        style={{
          borderTop: isDark ? '1px solid rgba(167,139,250,0.2)' : '1px solid #e5e5e5'
        }}
      >
        {!collapsed ? (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={isDark ? {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            } : {
              background: '#fafafa',
              border: '1px solid #e5e5e5',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: modelOnline ? '#10b981' : '#ef4444',
                boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#ef4444'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <div className="flex-1 min-w-0">
              <span
                className="text-[11px] font-bold block truncate"
                style={{
                  color: isDark
                    ? (modelOnline ? '#6ee7b7' : '#fca5a5')
                    : (modelOnline ? '#15803d' : '#b91c1c')
                }}
              >
                {modelOnline ? 'AI Engine Online' : 'Engine Offline'}
              </span>
              <span
                className="text-[9px] block truncate"
                style={{ color: isDark ? 'rgba(196,181,253,0.5)' : '#737373' }}
              >
                {modelName}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: modelOnline ? '#10b981' : '#ef4444',
                boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#ef4444'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
