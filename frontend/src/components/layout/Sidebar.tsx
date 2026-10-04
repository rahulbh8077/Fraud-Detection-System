import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Search, Upload, BarChart3, Table,
  Activity, FileText, Settings, BookOpen, Info,
  ChevronLeft, ChevronRight, Zap, ClipboardList, Sliders,
  TrendingUp, Cpu
} from 'lucide-react';
import { cn } from '../../utils/format';

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

  return (
    <aside
      className={cn(
        'h-screen flex flex-col transition-all duration-300 shrink-0 relative overflow-hidden',
        collapsed ? 'w-[68px]' : 'w-[232px]'
      )}
      style={{
        /* Rich violet-purple gradient — fully saturated like the preview */
        background: 'linear-gradient(160deg, #3b0764 0%, #4c1d95 30%, #5b21b6 55%, #4a1d96 75%, #2e1065 100%)',
        borderRight: '1px solid rgba(167,139,250,0.2)',
        boxShadow: '4px 0 32px rgba(124,58,237,0.3)',
      }}
    >
      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 10% 0%, rgba(167,139,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 90% 100%, rgba(6,182,212,0.1) 0%, transparent 50%)',
        }}
      />

      {/* Top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.8) 50%, transparent 100%)',
        }}
      />

      {/* ── Brand / Logo ─────────────────────────────── */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 relative z-10 shrink-0',
          collapsed && 'justify-center px-2'
        )}
        style={{ borderBottom: '1px solid rgba(167,139,250,0.2)' }}
      >
        {/* Logo mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(167,139,250,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <Shield className="w-5 h-5" style={{ color: '#ffffff' }} />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span
              className="font-black text-base tracking-tight block"
              style={{ color: '#ffffff', textShadow: '0 0 20px rgba(196,181,253,0.6)' }}
            >
              FraudShield
            </span>
            <span
              className="text-[10px] font-semibold block -mt-0.5 tracking-widest uppercase"
              style={{ color: 'rgba(196,181,253,0.7)' }}
            >
              AI Enterprise
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('rounded-lg p-1.5 transition-all duration-200', collapsed ? 'mx-auto' : 'ml-auto')}
          style={{
            color: 'rgba(196,181,253,0.8)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(196,181,253,0.8)';
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
                  style={{ color: 'rgba(196,181,253,0.55)' }}
                >
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(196,181,253,0.3), transparent)' }}
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
                      style={isActive ? {
                        background: 'rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.2)',
                      } : {
                        background: 'transparent',
                        border: '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Icon container */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                        style={isActive ? {
                          background: 'rgba(255,255,255,0.25)',
                          boxShadow: '0 0 12px rgba(196,181,253,0.4)',
                        } : {
                          background: 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: isActive ? '#ffffff' : 'rgba(196,181,253,0.75)' }}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Label */}
                      {!collapsed && (
                        <span
                          className="text-xs font-semibold truncate"
                          style={{ color: isActive ? '#ffffff' : 'rgba(221,214,254,0.8)' }}
                        >
                          {label}
                        </span>
                      )}

                      {/* Active right dot */}
                      {!collapsed && isActive && (
                        <div
                          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: '#a78bfa',
                            boxShadow: '0 0 6px #a78bfa',
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
        style={{ borderTop: '1px solid rgba(167,139,250,0.2)' }}
      >
        {!collapsed ? (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: modelOnline ? '#34d399' : '#f87171',
                boxShadow: `0 0 8px ${modelOnline ? '#34d399' : '#f87171'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <div className="flex-1 min-w-0">
              <span
                className="text-[11px] font-bold block truncate"
                style={{ color: modelOnline ? '#6ee7b7' : '#fca5a5' }}
              >
                {modelOnline ? 'AI Engine Online' : 'Engine Offline'}
              </span>
              <span
                className="text-[9px] block truncate"
                style={{ color: 'rgba(196,181,253,0.5)' }}
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
                background: modelOnline ? '#34d399' : '#f87171',
                boxShadow: `0 0 8px ${modelOnline ? '#34d399' : '#f87171'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
