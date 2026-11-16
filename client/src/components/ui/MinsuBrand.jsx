import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

/**
 * High-fidelity Vector SVG Seal of Mindoro State University (MinSU)
 * Features official university colors: Deep Forest Green (#004D32), Emerald Green (#159957), and Radiant Gold (#E5B52B).
 */
export function MinsuSeal({ size = 48, className = '', showText = false }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none"
        aria-label="Mindoro State University Official Seal"
      >
        <defs>
          <linearGradient id="minsuGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9DF7B" />
            <stop offset="50%" stopColor="#E5B52B" />
            <stop offset="100%" stopColor="#B38612" />
          </linearGradient>
          <linearGradient id="minsuGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#087A45" />
            <stop offset="100%" stopColor="#004D32" />
          </linearGradient>
          <radialGradient id="minsuShine" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Gold Sunburst Ring */}
        <circle cx="50" cy="50" r="48" fill="url(#minsuGoldGrad)" />
        <circle cx="50" cy="50" r="44" fill="#004D32" stroke="url(#minsuGoldGrad)" strokeWidth="1.5" />

        {/* Outer text path ring */}
        <circle cx="50" cy="50" r="38" fill="none" stroke="#E5B52B" strokeWidth="0.75" strokeDasharray="1.5,1.5" />

        {/* Inner Emerald Field */}
        <circle cx="50" cy="50" r="35" fill="url(#minsuGreenGrad)" />
        <circle cx="50" cy="50" r="35" fill="url(#minsuShine)" />

        {/* Laurel Wreath */}
        <g stroke="#E5B52B" strokeWidth="1.2" fill="none" opacity="0.9">
          <path d="M26 50 C26 36 36 24 50 24 C64 24 74 36 74 50 C74 64 64 76 50 76 C36 76 26 64 26 50" />
          <path d="M24 45 C28 43 31 46 29 50" strokeWidth="1" fill="#E5B52B" />
          <path d="M76 45 C72 43 69 46 71 50" strokeWidth="1" fill="#E5B52B" />
          <path d="M28 35 C32 35 34 38 31 42" strokeWidth="1" fill="#E5B52B" />
          <path d="M72 35 C68 35 66 38 69 42" strokeWidth="1" fill="#E5B52B" />
          <path d="M36 28 C40 30 40 34 36 36" strokeWidth="1" fill="#E5B52B" />
          <path d="M64 28 C60 30 60 34 64 36" strokeWidth="1" fill="#E5B52B" />
        </g>

        {/* Central Torch of Wisdom & Guidance */}
        <path d="M48 42 L52 42 L51 64 L49 64 Z" fill="url(#minsuGoldGrad)" />
        {/* Flame */}
        <path d="M50 32 C47 36 46 39 48 42 C50 43 51 43 52 42 C54 39 53 36 50 32 Z" fill="#FFC107" />
        <path d="M50 34 C49 37 48 39 49 41 C50 41.5 50.5 41.5 51 41 C52 39 51.5 37 50 34 Z" fill="#FFE082" />

        {/* Open Book of Knowledge */}
        <path d="M38 52 C44 50 49 53 50 55 C51 53 56 50 62 52 L61 63 C55 61 51 63 50 65 C49 63 45 61 39 63 Z" fill="#FFFFFF" stroke="#E5B52B" strokeWidth="1" />
        <line x1="50" y1="55" x2="50" y2="65" stroke="#004D32" strokeWidth="1" />

        {/* Guiding Star */}
        <polygon points="50,20 52,24 56,24 53,27 54,31 50,28 46,31 47,27 44,24 48,24" fill="url(#minsuGoldGrad)" />

        {/* Lower Banner Ribbon */}
        <path d="M28 72 Q50 78 72 72 L70 78 Q50 84 30 78 Z" fill="url(#minsuGoldGrad)" stroke="#B38612" strokeWidth="0.5" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold text-[15px] tracking-tight text-white">Mindoro State University</span>
          <span className="text-[11px] font-semibold text-emerald-300 mt-1">MinSU E-Learn &amp; Networking Academy</span>
          <span className="text-[10px] text-amber-300 italic mt-0.5 font-medium">Learn · Connect · Excel</span>
        </div>
      )}
    </div>
  );
}

/**
 * Universal Campus Hero Banner matching the 5-role design reference mockup:
 * - Lush green academic gradient (#004D32 to #087A45)
 * - Gold university curves and architectural campus graphic
 * - University Seal on right with bold institutional crest
 * - Role-tailored title, subtitle, and badge
 */
export function MinsuCampusBanner({
  title,
  subtitle,
  goldTitle,
  roleBadge,
  actions
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B26] via-[#004D32] to-[#087A45] text-white shadow-md border border-emerald-900/40 p-6 sm:p-7">
      {/* Background Architectural & Campus Silhouette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay bg-cover bg-center"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 50%, rgba(229,181,43,0.3) 0%, transparent 60%), linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)`
        }}
        aria-hidden="true"
      />

      {/* Decorative Gold S-Curve Sweep on right */}
      <svg
        className="absolute right-0 top-0 h-full w-96 text-emerald-400/10 pointer-events-none select-none hidden md:block"
        viewBox="0 0 400 200"
        fill="currentColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M150 0 C250 80, 200 140, 400 200 L400 0 Z" fill="url(#bannerGoldSweep)" opacity="0.3" />
        <defs>
          <linearGradient id="bannerGoldSweep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5B52B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#159957" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          {roleBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 border border-amber-300/30 backdrop-blur-xs mb-1">
              {roleBadge}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {title}{' '}
            {goldTitle && (
              <span className="text-[#E5B52B] drop-shadow-xs">{goldTitle}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {actions && <div className="pt-2 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>

        {/* Right side MinSU Institutional Crest Seal Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shadow-inner shrink-0">
          <MinsuSeal size={52} />
          <div className="text-left leading-tight">
            <span className="text-[12px] font-extrabold uppercase tracking-wider text-amber-300 block">
              Mindoro State
            </span>
            <span className="text-[13px] font-extrabold uppercase tracking-wider text-white block">
              University
            </span>
            <span className="text-[10px] text-emerald-200/90 font-semibold block mt-0.5">
              NetAcad Certified Hub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standardized KPI StatCard following the 5-role design reference:
 * - Rounded-2xl card with clean white background and subtle border
 * - Colored icon inside circular/soft-pill badge
 * - Large metric number
 * - Title and optional subtext / trend / link
 */
export function MinsuStatCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon: Icon,
  accent = 'green',
  linkTo,
  linkLabel = 'View All'
}) {
  const accentClasses = {
    green: {
      bg: 'bg-emerald-50 text-[#087A45] border-emerald-100',
      badge: 'text-emerald-700 bg-emerald-50'
    },
    blue: {
      bg: 'bg-blue-50 text-[#2563EB] border-blue-100',
      badge: 'text-blue-700 bg-blue-50'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-100',
      badge: 'text-purple-700 bg-purple-50'
    },
    gold: {
      bg: 'bg-amber-50 text-[#B38612] border-amber-100',
      badge: 'text-amber-800 bg-amber-50'
    },
    red: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      badge: 'text-rose-700 bg-rose-50'
    }
  };

  const currentAccent = accentClasses[accent] || accentClasses.green;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#172B24] tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  trendPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}
              >
                {trend}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border shrink-0 ${currentAccent.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 truncate">{subtitle || 'Updated just now'}</span>
        {linkTo && (
          <a
            href={linkTo}
            className="inline-flex items-center gap-1 font-bold text-[#087A45] hover:text-[#004D32] hover:underline shrink-0"
          >
            {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * Standardized Content Card with header, title, icon, and optional action link
 */
export function MinsuCard({
  title,
  icon: Icon,
  actionLink,
  actionLabel = 'View All',
  children,
  className = '',
  headerRight
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#087A45] border border-emerald-100 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h2 className="text-sm font-bold text-[#172B24] tracking-tight">{title}</h2>
        </div>
        {headerRight || (
          actionLink && (
            <a
              href={actionLink}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#087A45] hover:text-[#004D32] hover:underline"
            >
              {actionLabel} <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/**
 * Quick Action / Quick Link Card for Dashboard Grids
 */
export function MinsuQuickLink({
  icon: Icon,
  title,
  subtitle,
  to,
  onClick,
  accent = 'green'
}) {
  const accentColors = {
    green: 'group-hover:border-[#087A45] group-hover:bg-emerald-50/50 text-[#087A45]',
    blue: 'group-hover:border-blue-600 group-hover:bg-blue-50/50 text-blue-600',
    gold: 'group-hover:border-amber-500 group-hover:bg-amber-50/50 text-amber-600',
    purple: 'group-hover:border-purple-600 group-hover:bg-purple-50/50 text-purple-600'
  };

  const content = (
    <div className={`group p-4 rounded-xl border border-[#E2E8F0] bg-white hover:shadow-xs transition-all flex flex-col items-center text-center gap-2 cursor-pointer ${accentColors[accent] || accentColors.green}`}>
      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center transition-colors group-hover:bg-white group-hover:shadow-xs">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-[#172B24] group-hover:text-[#004D32] transition-colors">
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return <a href={to} className="block">{content}</a>;
  }
  return <div onClick={onClick}>{content}</div>;
}
