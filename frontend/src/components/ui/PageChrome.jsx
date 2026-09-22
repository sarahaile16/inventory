import React from 'react';
import { Link } from 'react-router-dom';

/** Shared layout primitives — keep pages uniform with customer details. */
export const PageShell = ({ children, className = '' }) => (
  <div className={`p-3 sm:p-5 lg:p-6 max-w-6xl mx-auto w-full min-w-0 ${className}`}>
    {children}
  </div>
);

export const PageHero = ({
  eyebrow,
  title,
  subtitle,
  actions,
  tone = 'teal'
}) => {
  const tones = {
    teal: 'from-teal-700 to-emerald-600',
    slate: 'from-slate-800 to-teal-800',
    amber: 'from-slate-900 to-amber-900'
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-r ${tones[tone] || tones.teal} text-white p-4 sm:p-5 mb-4 sm:mb-5 overflow-hidden relative`}>
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-white/70">{eyebrow}</p>
          )}
          <h1 className="text-lg sm:text-2xl font-bold mt-0.5 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap gap-1.5 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export const StatGrid = ({ children, cols = '4' }) => {
  const colClass =
    cols === '3'
      ? 'grid-cols-2 sm:grid-cols-3'
      : cols === '6'
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  return (
    <div className={`grid ${colClass} gap-2 sm:gap-3 mb-4 sm:mb-5`}>
      {children}
    </div>
  );
};

export const StatCard = ({ label, value, hint, icon, to, accent = 'teal' }) => {
  const accents = {
    teal: 'bg-teal-50 text-teal-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
    violet: 'bg-violet-50 text-violet-700'
  };
  const body = (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 hover:shadow-md transition h-full">
      {icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${accents[accent] || accents.teal}`}>
          {icon}
        </div>
      )}
      <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-base sm:text-xl font-bold text-slate-800 mt-0.5 break-words">{value}</p>
      {hint && <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
  if (to) return <Link to={to} className="block">{body}</Link>;
  return body;
};

export const Panel = ({ title, action, children, className = '', bodyClassName = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="px-3 sm:px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
        {title && <h2 className="text-sm font-semibold text-slate-800">{title}</h2>}
        {action}
      </div>
    )}
    <div className={`p-3 sm:p-4 ${bodyClassName}`}>{children}</div>
  </div>
);

export const SoftButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const HeroLink = ({ to, children, primary = false }) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      primary
        ? 'bg-white text-teal-800 hover:bg-teal-50'
        : 'bg-white/15 hover:bg-white/25 text-white'
    }`}
  >
    {children}
  </Link>
);

export const LoadingBlock = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
  </div>
);

export const EmptyState = ({ children }) => (
  <p className="text-xs text-slate-500 py-6 text-center">{children}</p>
);

export const SearchInput = ({ value, onChange, placeholder = 'Search…' }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
  />
);
