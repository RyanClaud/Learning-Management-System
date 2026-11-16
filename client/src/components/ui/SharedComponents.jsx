import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Loader2,
  Inbox
} from 'lucide-react';
import minsuCampusBg from '../../assets/minsu-bg.jpg';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
              t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'error' ? (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : t.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
              className="opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { addToast: () => {} };
}

export function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    enrolled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    graded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    submitted_for_approval: 'bg-amber-50 text-amber-700 border-amber-200',
    under_review: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    late: 'bg-orange-50 text-orange-700 border-orange-200',
    returned_for_revision: 'bg-purple-50 text-purple-700 border-purple-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
    missing: 'bg-red-50 text-red-700 border-red-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  const badgeClass = styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = String(status || 'unknown').replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[13px] leading-4 font-semibold border capitalize ${badgeClass}`}>
      {label}
    </span>
  );
}

export function StatCard({ title, value, subtitle, icon: Icon, accent = 'green', linkTo, linkLabel = 'View All' }) {
  const accentMap = {
    green: 'bg-emerald-50 text-[#087A45] border-emerald-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    gold: 'bg-amber-50 text-[#B38612] border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#172B24] tracking-tight mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl border shrink-0 ${accentMap[accent] || accentMap.green}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {linkTo && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
          <a href={linkTo} className="text-xs font-bold text-[#087A45] hover:text-[#004D32] hover:underline inline-flex items-center gap-1">
            {linkLabel} →
          </a>
        </div>
      )}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = 'button', disabled = false, className = '', icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#087A45] hover:bg-[#004D32] text-white shadow-xs disabled:opacity-50 transition-colors ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, type = 'button', disabled = false, className = '', icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 disabled:opacity-50 transition-colors ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function GoldButton({ children, onClick, type = 'button', disabled = false, className = '', icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#E5B52B] hover:bg-[#c99a1b] text-slate-950 shadow-xs disabled:opacity-50 transition-colors ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function DashboardCard({ title, icon: Icon, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#087A45] border border-emerald-100 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h2 className="text-sm font-bold text-[#172B24] tracking-tight">{title}</h2>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export { MinsuSeal, MinsuCampusBanner, MinsuStatCard, MinsuCard, MinsuQuickLink } from './MinsuBrand';

export function PageHeader({ badge, title, subtitle, actions }) {
  return (
    <div className="relative overflow-hidden rounded-2xl text-white shadow-md border border-[#003824] p-5 sm:p-6 mb-6">
      {/* Real MinSU Campus Building Photograph Background */}
      <div
        className="absolute inset-0 bg-cover bg-center select-none"
        style={{
          backgroundImage: `url(${minsuCampusBg})`,
          backgroundPosition: 'center 40%'
        }}
        aria-hidden="true"
      />

      {/* Dark Green Gradient Wash: high contrast on text, revealing campus scenery */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#003824]/95 via-[#004D32]/85 to-[#087A45]/45"
        aria-hidden="true"
      />

      {/* Gold & Emerald Curved Sweep on right */}
      <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none select-none hidden md:block overflow-hidden">
        <div className="absolute -right-10 -top-10 w-80 h-80 rounded-full border-[5px] border-[#E5B52B]/30 pointer-events-none" />
        <div className="absolute -right-20 -bottom-10 w-96 h-96 rounded-full border-[10px] border-[#159957]/30 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="max-w-2xl">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/30 text-[#E5B52B] border border-[#E5B52B]/40 backdrop-blur-md mb-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5B52B] animate-pulse" />
              {badge}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xs">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-xl drop-shadow-xs">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function LoadingState({ label = 'Loading academic data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ title = 'No records found', description = 'Get started by creating a new item.', action }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message = 'Failed to load data.', onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <h3 className="text-base font-semibold text-red-900">Unable to Retrieve Data</h3>
      <p className="text-sm text-red-700 mt-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
        >
          Retry Request
        </button>
      )}
    </div>
  );
}

export function ModalDialog({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className={`bg-white rounded-xl border border-slate-200 shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 id="modal-title" className="text-base font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
