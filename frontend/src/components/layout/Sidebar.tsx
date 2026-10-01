import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Search, Upload, BarChart3, Table,
  Activity, Brain, FileText, Settings, Heart, BookOpen, Info,
  ChevronLeft, ChevronRight, Zap, ClipboardList, Sliders
} from 'lucide-react';
import { cn } from '../../utils/format';

const navGroups = [
  {
    label: null,
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/analyze', label: 'Analyze Transaction', icon: Search },
      { path: '/upload', label: 'Upload Dataset', icon: Upload },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/cases', label: 'Analyst Case Queue', icon: ClipboardList },
      { path: '/rules', label: 'Rules & Decision Engine', icon: Sliders },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/fraud-analytics', label: 'Fraud Analytics', icon: BarChart3 },
      { path: '/transactions', label: 'Transactions', icon: Table },
      { path: '/risk-monitoring', label: 'Risk Monitoring', icon: Activity },
    ],
  },
  {
    label: 'Model',
    items: [
      { path: '/model-performance', label: 'Model Performance', icon: Brain },
      { path: '/explainable-ai', label: 'Explainable AI', icon: Zap },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/reports', label: 'Reports', icon: FileText },
      { path: '/system-health', label: 'System Health', icon: Heart },
      { path: '/api-docs', label: 'API Docs', icon: BookOpen },
      { path: '/settings', label: 'Settings', icon: Settings },
      { path: '/about', label: 'About', icon: Info },
    ],
  },
];

interface Props { modelOnline?: boolean; modelName?: string; }

export function Sidebar({ modelOnline = false, modelName = 'FraudShield v2.0' }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'h-screen bg-navy-950 border-r border-navy-600 flex flex-col transition-all duration-200 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-navy-600">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-slate-100 text-lg tracking-tight">FraudShield AI</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4" aria-label="Main navigation">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {group.label && !collapsed && (
              <div className="label-text px-2 mb-2 uppercase tracking-wider text-[10px] font-bold text-slate-500">{group.label}</div>
            )}
            <div className="space-y-0.5">
              {group.items.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) =>
                    cn(isActive ? 'sidebar-link-active' : 'sidebar-link')
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="text-xs font-semibold">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
