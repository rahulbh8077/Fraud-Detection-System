import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Search, Upload, BarChart3, Table,
  Activity, Brain, FileText, Settings, Heart, BookOpen, Info,
  ChevronLeft, ChevronRight, Zap, ClipboardList, Sliders,
  TrendingUp, Cpu
} from 'lucide-react';
import { cn } from '../../utils/format';

const navGroups = [
  {
    label: null,
    items: [
      { path: '/',        label: 'Dashboard',          icon: LayoutDashboard },
      { path: '/analyze', label: 'Analyze Transaction', icon: Search },
      { path: '/upload',  label: 'Upload Dataset',      icon: Upload },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/cases', label: 'Case Queue',       icon: ClipboardList },
      { path: '/rules', label: 'Rules Engine',     icon: Sliders },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/fraud-analytics',  label: 'Fraud Analytics', icon: BarChart3 },
      { path: '/transactions',     label: 'Transactions',    icon: Table },
      { path: '/risk-monitoring',  label: 'Risk Monitoring', icon: Activity },
    ],
  },
  {
    label: 'Model',
    items: [
      { path: '/model-performance', label: 'Performance',     icon: TrendingUp },
      { path: '/explainable-ai',    label: 'Explainable AI',  icon: Zap },
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
        'h-screen flex flex-col transition-all duration-300 shrink-0 relative',
        collapsed ? 'w-[68px]' : 'w-[228px]'
      )}
      style={{
        background: 'linear-gradient(180deg, #0a0a18 0%, #08080f 100%)',
        borderRight: '1px solid rgba(124, 58, 237, 0.15)',
      }}
    >
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Brand */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 relative z-10 shrink-0',
          collapsed && 'justify-center px-2'
        )}
        style={{ borderBottom: '1px solid rgba(124,58,237,0.12)' }}
      >
        {/* Gradient logo mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)',
            boxShadow: '0 0 20px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span
              className="font-black text-base tracking-tight block"
              style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FraudShield
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block -mt-0.5 tracking-wider uppercase">
              AI Enterprise
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'rounded-lg p-1.5 transition-all duration-200',
            collapsed ? 'mx-auto' : 'ml-auto'
          )}
          style={{
            color: 'rgba(148,163,184,0.6)',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.15)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,184,0.6)';
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)';
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 relative z-10" aria-label="Main navigation">
        {navGroups.map((group, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-4' : ''}>
            {/* Section label */}
            {group.label && !collapsed && (
              <div className="px-3 mb-1.5 flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'rgba(124,58,237,0.7)' }}
                >
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.25), transparent)' }}
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
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                          isActive
                            ? 'bg-brand-gradient'
                            : 'bg-transparent'
                        )}
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                          boxShadow: '0 0 10px rgba(124,58,237,0.4)',
                        } : {}}
                      >
                        <Icon
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: isActive ? '#ffffff' : 'currentColor' }}
                          aria-hidden="true"
                        />
                      </div>
                      {!collapsed && (
                        <span className="text-xs font-semibold truncate">{label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer status */}
      {!collapsed && (
        <div
          className="p-3 relative z-10 shrink-0"
          style={{ borderTop: '1px solid rgba(124,58,237,0.12)' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: modelOnline
                ? 'rgba(16,185,129,0.08)'
                : 'rgba(244,63,94,0.08)',
              border: `1px solid ${modelOnline ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                background: modelOnline ? '#10b981' : '#f43f5e',
                boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#f43f5e'}`,
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <span
              className="text-[11px] font-bold truncate"
              style={{ color: modelOnline ? '#34d399' : '#fb7185' }}
            >
              {modelOnline ? 'AI Engine Online' : 'Engine Offline'}
            </span>
          </div>
        </div>
      )}

      {/* Collapsed status dot */}
      {collapsed && (
        <div className="p-3 flex justify-center relative z-10 shrink-0">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: modelOnline ? '#10b981' : '#f43f5e',
              boxShadow: `0 0 6px ${modelOnline ? '#10b981' : '#f43f5e'}`,
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
        </div>
      )}
    </aside>
  );
}
