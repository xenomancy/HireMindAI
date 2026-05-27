import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import {
  LayoutDashboard,
  FileCheck,
  MessageSquare,
  Compass,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, upgradePlan } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlePlanToggle = async () => {
    await upgradePlan();
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ats', label: 'ATS Analyzer', icon: FileCheck },
    { to: '/interview', label: 'AI Mock Interview', icon: MessageSquare },
    { to: '/roadmap', label: 'Study Roadmap', icon: Compass },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-brand-border/60 bg-white p-6 shrink-0">
      {/* Brand Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <span className="font-heading text-xl font-bold tracking-tight">
            HireMind<span className="text-brand-green">.ai</span>
          </span>
        </div>
      </div>

      {/* SaaS Tier Badge / Toggler */}
      {user && (
        <div className="mb-6 rounded-xl border border-brand-border/60 bg-brand-warmBg/50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-brand-gray">SaaS Plan</div>
            <button
              onClick={handlePlanToggle}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all hover:scale-105 active:scale-95 ${
                user.plan === 'premium'
                  ? 'bg-brand-green/20 text-emerald-800 border border-emerald-300/35'
                  : 'bg-brand-peach/20 text-amber-800 border border-amber-300/35'
              }`}
              title="Click to toggle between Free & Premium to test SaaS limits!"
            >
              {user.plan === 'premium' ? 'Premium Tier' : 'Free Tier'}
            </button>
          </div>
          
          {/* Quick usage meters */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-brand-gray">
              <span>ATS Uploads</span>
              <span>{user.usage?.resumesAnalyzed || 0} / {user.plan === 'premium' ? '∞' : '3'}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-brand-border/60">
              <div 
                className="h-1 rounded-full bg-brand-peach transition-all duration-500" 
                style={{ width: `${user.plan === 'premium' ? 100 : Math.min(100, ((user.usage?.resumesAnalyzed || 0) / 3) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-warmBg text-brand-text font-semibold'
                    : 'text-brand-gray hover:bg-brand-bg/50 hover:text-brand-text'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5 stroke-[1.5]" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile / Logout Footer */}
      {user && (
        <div className="mt-auto border-t border-brand-border/60 pt-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-peach/20 text-xs font-semibold text-amber-800 uppercase">
              {user.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-brand-text">{user.name}</div>
              <div className="truncate text-[10px] text-brand-gray">{user.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border/80 px-4 py-2 text-xs font-medium text-brand-gray hover:bg-brand-bg hover:text-brand-text transition-all active:scale-[0.98]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
