'use client';

import { DateRangePicker } from '@/components/shared/form/DateRangePicker';
import { useDashboard } from '@/components/shared/hooks/useDashboard';
import type { BudgetHealthData, GoalProgressItem } from '@/components/shared/hooks/useDashboard';
import { useAuth } from '@clerk/nextjs';
import { formatRupees } from '@/components/shared/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Layers,
  TrendingUp,
  Wallet,
  Activity,
} from 'lucide-react';
import Masonry from 'react-masonry-css';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// ─── Storage ──────────────────────────────────────────────────────────────────

const FILTER_KEY = 'dashboard-global-filter';

// ─── Presets ──────────────────────────────────────────────────────────────────

type PresetId = '1m' | '3m' | '6m' | '1y' | 'custom';
interface Preset {
  id: PresetId;
  label: string;
  months: number;
}

const PRESETS: Preset[] = [
  { id: '1m', label: '1M', months: 1 },
  { id: '3m', label: '3M', months: 3 },
  { id: '6m', label: '6M', months: 6 },
  { id: '1y', label: '1Y', months: 12 },
];

function presetDates(months: number) {
  const to = endOfMonth(new Date());
  const from = startOfMonth(subMonths(to, months - 1));
  return { from, to };
}

function toApiDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useAnimatedCount(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return value;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton({ height = 220 }: { height?: number }) {
  return (
    <Card className="border-stone-200 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton style={{ height }} className="w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <div className="space-y-1 items-end flex flex-col">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-2.5 w-12" />
      </div>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-amber-200/60 bg-white px-3.5 py-2.5 shadow-xl text-xs">
      <p className="font-bold text-stone-400 mb-1.5 uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color || '#b45309' }}>
          {p.name || p.dataKey}: {formatRupees(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHead({ label, title, badge }: { label: string; title: string; badge?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
          <span className="h-px w-3 bg-gradient-to-r from-amber-600 to-yellow-500 inline-block" />
          {label}
        </h2>
        <CardTitle className="text-base font-bold text-stone-800">{title}</CardTitle>
      </div>
      {badge && (
        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  '#b45309',
  '#92400e',
  '#d97706',
  '#a16207',
  '#78716c',
  '#ca8a04',
  '#57534e',
];

// ─── Pie sector shape ─────────────────────────────────────────────────────────

function PieSectorShape(props: any) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    isActive,
  } = props;
  if (isActive) {
    return (
      <g>
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize={10} fontWeight="700" fill="#292524">
          {(payload.category_name as string)?.split(' ')[0]}
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={17} fontWeight="800" fill="#b45309">
          {(percent * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize={9} fill="#a8a29e">
          {formatRupees(payload.total_amount)}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 9}
          outerRadius={outerRadius + 12}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  }
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

// ─── Goal ring card ───────────────────────────────────────────────────────────

function GoalRingCard({ goal, index }: { goal: GoalProgressItem; index: number }) {
  const current = goal.current_amount ?? 0;
  const target = goal.target_amount ?? 1;
  const pct = Math.min(Math.round((current / target) * 100), 100);
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const isOnTrack = goal.status === 'active' || goal.status === 'on-track';
  const color = isOnTrack ? '#b45309' : '#d97706';

  const daysLeft = goal.target_date
    ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
      className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0"
    >
      <div className="relative shrink-0">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="#f5f0e8" strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
            transform="rotate(-90 40 40)"
          />
          <text x="40" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>
            {pct}%
          </text>
          <text x="40" y="50" textAnchor="middle" fontSize="8.5" fill="#a8a29e">
            funded
          </text>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800 truncate mb-0.5">{goal.name}</p>
        <p className="text-[11px] text-stone-500 mb-2">
          {formatRupees(current)} of {formatRupees(target)}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
              isOnTrack
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isOnTrack ? '✓ On Track' : '⚠ Needs Attention'}
          </span>
          {daysLeft !== null && (
            <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {daysLeft}d left
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Budget health card ───────────────────────────────────────────────────────

function BudgetHealthCard({ budget }: { budget: BudgetHealthData }) {
  const spent = budget.total_spent ?? 0;
  const scaledBudget = budget.scaled_budget ?? budget.monthly_budget ?? 80000;
  const pct = scaledBudget > 0 ? Math.min(Math.round((spent / scaledBudget) * 100), 100) : 0;
  const isOver = spent > scaledBudget;
  const remaining = scaledBudget - spent;
  const r = 48;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const ringColor = pct > 90 ? '#dc2626' : pct > 70 ? '#d97706' : '#b45309';

  return (
    <Card className="border-stone-200 bg-white shadow-sm h-full">
      <CardHeader className="px-5 pt-5 pb-2">
        <SectionHead label="Monthly Budget" title="Spend Health" />
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex justify-center mb-5">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f5f0e8" strokeWidth="9" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={ringColor}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="800" fill={ringColor}>
              {pct}%
            </text>
            <text x="60" y="71" textAnchor="middle" fontSize="10" fill="#a8a29e">
              of budget
            </text>
          </svg>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-xs text-stone-500">Spent</span>
            <span className="text-sm font-bold text-stone-800">{formatRupees(spent)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-stone-100">
            <span className="text-xs text-stone-500">Budget ({budget.months_in_range ?? 1}M)</span>
            <span className="text-sm font-bold text-stone-800">{formatRupees(scaledBudget)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-stone-500">Remaining</span>
            <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
              {isOver ? '-' : ''}
              {formatRupees(Math.abs(remaining))}
              <span className="text-[10px] font-semibold ml-1">{isOver ? 'over' : 'left'}</span>
            </span>
          </div>
        </div>
        {pct > 85 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-700 font-medium">
              {pct >= 100 ? 'Budget exceeded this period.' : `${100 - pct}% of budget remaining.`}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Loading pulse dot ────────────────────────────────────────────────────────

function LoadingDot() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      Loading…
    </span>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardA() {
  const [activePreset, setActivePreset] = useState<PresetId>('6m');

  const [from, setFrom] = useState<Date>(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY);
      if (saved) {
        const { from: f } = JSON.parse(saved);
        if (f) return new Date(f);
      }
    } catch {}
    return presetDates(6).from;
  });

  const [to, setTo] = useState<Date>(() => {
    try {
      const saved = localStorage.getItem(FILTER_KEY);
      if (saved) {
        const { to: t } = JSON.parse(saved);
        if (t) return new Date(t);
      }
    } catch {}
    return presetDates(6).to;
  });

  const [activePieIdx, setActivePieIdx] = useState(0);

  const { isLoaded: clerkLoaded } = useAuth();

  const fromStr = toApiDate(from);
  const toStr = toApiDate(to);

  function applyRange(newFrom: Date, newTo: Date, preset: PresetId = 'custom') {
    setFrom(newFrom);
    setTo(newTo);
    setActivePreset(preset);
    try {
      localStorage.setItem(
        FILTER_KEY,
        JSON.stringify({ from: newFrom.toISOString(), to: newTo.toISOString() })
      );
    } catch {}
  }

  function applyPreset(p: Preset) {
    const { from: f, to: t } = presetDates(p.months);
    applyRange(f, t, p.id);
  }

  function handlePickerChange(newFrom: Date | null, newTo: Date | null) {
    if (newFrom && newTo) applyRange(newFrom, newTo, 'custom');
    else if (newFrom) {
      setFrom(newFrom);
      setActivePreset('custom');
    }
  }

  const { data: dashData, isLoading: isDashLoading } = useDashboard(fromStr, toStr, clerkLoaded);

  const netWorthTrend = dashData?.net_worth_trend ?? [];
  const rawCategories = dashData?.spend_by_category ?? [];
  const budget = dashData?.budget_health ?? null;
  const goals = dashData?.goal_progress ?? [];
  const accounts = dashData?.account_balances ?? [];
  const portfolio = dashData?.portfolio_mix ?? [];

  const categories = useMemo(() => {
    const total = rawCategories.reduce((s, c) => s + (c.total_amount ?? 0), 0);
    return rawCategories.map((c, i) => ({
      ...c,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      pct: total > 0 ? Math.round(((c.total_amount ?? 0) / total) * 100) : 0,
    }));
  }, [rawCategories]);

  const currentNetWorth = netWorthTrend[netWorthTrend.length - 1]?.running_net_worth ?? 0;
  const startNetWorth = netWorthTrend[0]?.running_net_worth ?? 0;
  const netWorthGrowthPct =
    startNetWorth > 0
      ? (((currentNetWorth - startNetWorth) / startNetWorth) * 100).toFixed(1)
      : '0';

  const totalBalance = accounts.reduce((s, a) => s + (a.current_balance ?? 0), 0);
  const totalPortfolio = portfolio.reduce((s, p) => s + (p.total_value ?? 0), 0);
  const totalIncome = accounts.reduce((s, a) => s + (a.period_income ?? 0), 0);
  const totalExpense = accounts.reduce((s, a) => s + (a.period_expense ?? 0), 0);
  const totalCategorySpend = categories.reduce((s, c) => s + (c.total_amount ?? 0), 0);

  const isNetWorthLoading = isDashLoading;
  const isCategoryLoading = isDashLoading;
  const isBudgetLoading = isDashLoading;
  const isGoalsLoading = isDashLoading;
  const isAccountsLoading = isDashLoading;
  const isPortfolioLoading = isDashLoading;

  const animatedNetWorth = useAnimatedCount(currentNetWorth);
  const animatedIncome = useAnimatedCount(totalIncome);
  const animatedExpense = useAnimatedCount(totalExpense);
  const animatedBalance = useAnimatedCount(totalBalance);

  const rangeLabel =
    activePreset === 'custom'
      ? `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`
      : (PRESETS.find((p) => p.id === activePreset)?.label ?? '');

  const anyLoading = isDashLoading;

  return (
    <div className="min-h-screen bg-stone-50/60 p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Wealth Reserve
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Financial overview · All sections respond to the date filter
          </p>
        </div>
        {anyLoading && (
          <div className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-700">Loading</span>
          </div>
        )}
      </motion.div>

      {/* Global date filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200/70 bg-white px-5 py-3 shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
                activePreset === p.id
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-500 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-stone-200" />
        <DateRangePicker from={from} to={to} onChange={handlePickerChange} label="Custom range" />
        <div className="ml-auto text-[11px] text-stone-400">
          <span className="font-semibold text-amber-700">{rangeLabel}</span>
          <span className="mx-1">·</span>
          <span>
            {fromStr} → {toStr}
          </span>
        </div>
      </motion.div>

      {/* Hero Net Worth banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Card className="border-0 bg-gradient-to-br from-amber-700 via-amber-800 to-yellow-800 text-white shadow-xl shadow-amber-900/20 overflow-hidden relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)',
            }}
          />
          <CardContent className="p-6 relative">
            {isNetWorthLoading && isAccountsLoading ? (
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <Skeleton className="h-4 w-32 bg-white/20" />
                  <Skeleton className="h-12 w-56 bg-white/20" />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-xl bg-white/20" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-6 items-center">
                <div className="md:col-span-2">
                  <p className="text-amber-200 text-[10px] font-bold uppercase tracking-widest mb-2">
                    Net Worth · {rangeLabel}
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentNetWorth}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-5xl font-bold tracking-tight mb-3"
                    >
                      {formatRupees(animatedNetWorth)}
                    </motion.p>
                  </AnimatePresence>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-amber-200" />
                      <span className="text-sm text-amber-100">
                        {Number(netWorthGrowthPct) >= 0 ? '+' : ''}
                        {netWorthGrowthPct}% over period
                      </span>
                    </div>
                    <span className="text-amber-600">·</span>
                    <span className="text-sm text-amber-100">
                      {formatRupees(Math.abs(currentNetWorth - startNetWorth))}
                      {currentNetWorth >= startNetWorth ? ' gained' : ' lost'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Total Income',
                      value: isAccountsLoading ? null : formatRupees(animatedIncome),
                    },
                    {
                      label: 'Total Expense',
                      value: isAccountsLoading ? null : formatRupees(animatedExpense),
                    },
                    {
                      label: 'All Accounts',
                      value: isAccountsLoading ? null : formatRupees(animatedBalance),
                    },
                    {
                      label: 'Portfolio',
                      value: isPortfolioLoading ? null : formatRupees(totalPortfolio),
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/70">
                        {stat.label}
                      </p>
                      {stat.value === null ? (
                        <Skeleton className="h-5 w-20 mt-1 bg-white/20" />
                      ) : (
                        <p className="text-base font-bold mt-1 text-amber-100">{stat.value}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 1: Net Worth Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        {isNetWorthLoading ? (
          <CardSkeleton height={220} />
        ) : (
          <Card className="border-stone-200 bg-white shadow-sm">
            <CardHeader className="px-5 pt-5 pb-2">
              <SectionHead
                label="Net Worth Trend"
                title="Wealth Growth"
                badge={`+${netWorthGrowthPct}%`}
              />
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={fromStr + toStr}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={netWorthTrend}
                      margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b45309" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#b45309" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f0e8" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#a8a29e' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#a8a29e' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="running_net_worth"
                        name="Net Worth"
                        stroke="#b45309"
                        strokeWidth={2.5}
                        fill="url(#goldGrad)"
                        dot={{ fill: '#b45309', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#b45309', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive
                        animationDuration={700}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Row 2: Spend by Category (3/5) + Budget Health (2/5) */}
      <div className="grid md:grid-cols-5 gap-5">
        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          {isCategoryLoading ? (
            <CardSkeleton height={260} />
          ) : (
            <Card className="border-stone-200 bg-white shadow-sm h-full">
              <CardHeader className="px-5 pt-5 pb-3">
                <SectionHead
                  label="Monthly Spend Health"
                  title="Spend by Category"
                  badge={formatRupees(totalCategorySpend)}
                />
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={fromStr + toStr + 'cat'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-6"
                  >
                    <div className="shrink-0 self-center">
                      <PieChart width={170} height={170}>
                        <Pie
                          data={categories.map((c, i) => ({
                            ...c,
                            fill: c.color,
                            isActive: i === activePieIdx,
                          }))}
                          cx={85}
                          cy={85}
                          innerRadius={50}
                          outerRadius={72}
                          dataKey="total_amount"
                          shape={PieSectorShape}
                          onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                          isAnimationActive
                          animationDuration={700}
                        />
                      </PieChart>
                    </div>
                    <div className="flex-1 min-w-0 space-y-0">
                      <div className="flex items-center gap-3 pb-2 border-b border-stone-100 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex-1">
                          Category
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 w-24 hidden sm:block">
                          Spend
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 w-8 text-right">
                          %
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 w-24 text-right">
                          Amount
                        </span>
                      </div>
                      {categories.map((cat, i) => (
                        <motion.div
                          key={cat.category_name}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.04 * i }}
                          className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs font-semibold text-stone-700 truncate">
                              {cat.category_name}
                            </span>
                          </div>
                          <div className="w-24 hidden sm:block">
                            <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: cat.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.pct}%` }}
                                transition={{
                                  duration: 0.65,
                                  delay: 0.1 + i * 0.05,
                                  ease: 'easeOut',
                                }}
                              />
                            </div>
                          </div>
                          <span
                            className="text-[11px] font-bold w-8 text-right shrink-0"
                            style={{ color: cat.color }}
                          >
                            {cat.pct}%
                          </span>
                          <span className="text-[11px] font-semibold text-stone-700 w-24 text-right shrink-0">
                            {formatRupees(cat.total_amount)}
                          </span>
                        </motion.div>
                      ))}
                      {categories.length === 0 && (
                        <p className="text-sm text-stone-400 py-6 text-center">
                          No spend data for this range
                        </p>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          {isBudgetLoading ? (
            <CardSkeleton height={300} />
          ) : budget ? (
            <BudgetHealthCard budget={budget} />
          ) : (
            <Card className="border-stone-200 bg-white shadow-sm h-full flex items-center justify-center">
              <p className="text-stone-400 text-sm p-6 text-center">
                No budget data for this range
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Row 3: Goal Progress (3/5) + Accounts + Portfolio (2/5) */}
      <div className="grid md:grid-cols-5 gap-5">
        <motion.div
          className="md:col-span-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <Card className="border-stone-200 bg-white shadow-sm h-full">
            <CardHeader className="px-5 pt-5 pb-2">
              <div className="flex items-center justify-between">
                <SectionHead label="Goals" title="Goal Progress" />
                {isGoalsLoading && <LoadingDot />}
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-3">
              {isGoalsLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-stone-100">
                      <Skeleton className="h-20 w-20 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : goals.length === 0 ? (
                <p className="text-sm text-stone-400 py-6 text-center">No goals yet</p>
              ) : (
                <Masonry
                  breakpointCols={{ default: 2, 768: 1 }}
                  className="flex gap-0"
                  columnClassName="flex flex-col"
                >
                  {goals.map((goal, i) => (
                    <GoalRingCard key={goal.id ?? i} goal={goal} index={i} />
                  ))}
                </Masonry>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="md:col-span-2 flex flex-col gap-5">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="flex-1"
          >
            <Card className="border-stone-200 bg-white shadow-sm h-full">
              <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between">
                  <SectionHead
                    label="Accounts"
                    title="All Balances"
                    badge={isAccountsLoading ? undefined : formatRupees(totalBalance)}
                  />
                  {isAccountsLoading && <LoadingDot />}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-0">
                {isAccountsLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <RowSkeleton key={i} />
                    ))}
                  </>
                ) : accounts.length === 0 ? (
                  <p className="text-sm text-stone-400 py-4 text-center">No accounts</p>
                ) : (
                  accounts.map((acc, i) => (
                    <motion.div
                      key={acc.id ?? i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                      className="flex items-center justify-between py-2.5 border-b border-stone-100 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                          <Wallet className="h-3.5 w-3.5 text-amber-700" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-800">
                            {acc.account_name ?? '—'}
                          </p>
                          <p className="text-[10px] text-stone-400">{acc.account_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-800">
                          {formatRupees(acc.current_balance)}
                        </p>
                        <p
                          className={`text-[10px] font-semibold flex items-center gap-0.5 justify-end ${(acc.period_income ?? 0) >= (acc.period_expense ?? 0) ? 'text-emerald-600' : 'text-red-500'}`}
                        >
                          {(acc.period_income ?? 0) >= (acc.period_expense ?? 0) ? (
                            <ArrowUpRight className="h-2.5 w-2.5" />
                          ) : (
                            <ArrowDownRight className="h-2.5 w-2.5" />
                          )}
                          {formatRupees(
                            Math.abs((acc.period_income ?? 0) - (acc.period_expense ?? 0))
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="flex-1"
          >
            <Card className="border-stone-200 bg-white shadow-sm h-full">
              <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between">
                  <SectionHead
                    label="Portfolio"
                    title="Investment Mix"
                    badge={isPortfolioLoading ? undefined : formatRupees(totalPortfolio)}
                  />
                  {isPortfolioLoading && <LoadingDot />}
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {isPortfolioLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Skeleton className="h-3 w-3 rounded" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-1.5 flex-1 rounded-full" />
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </>
                ) : portfolio.length === 0 ? (
                  <p className="text-sm text-stone-400 py-4 text-center">No investments</p>
                ) : (
                  <>
                    {portfolio.map((inv, i) => {
                      const pct =
                        totalPortfolio > 0
                          ? Math.round(((inv.total_value ?? 0) / totalPortfolio) * 100)
                          : 0;
                      return (
                        <motion.div
                          key={inv.investment_type ?? i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                          className="flex items-center gap-2.5"
                        >
                          <Layers className="h-3 w-3 text-amber-600 shrink-0" />
                          <span className="text-xs font-semibold text-stone-700 w-24 truncate">
                            {inv.investment_type}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 0.8,
                                delay: 0.15 + i * 0.08,
                                ease: 'easeOut',
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 w-6 text-right">
                            {pct}%
                          </span>
                          <span className="text-[11px] font-semibold text-stone-800 w-20 text-right">
                            {formatRupees(inv.total_value)}
                          </span>
                        </motion.div>
                      );
                    })}
                    <div className="border-t border-stone-100 pt-2.5 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-sm font-bold text-amber-700">
                        {formatRupees(totalPortfolio)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.55 }}
        className="flex items-center gap-2 text-xs text-stone-400 pb-2"
      >
        <Activity className="h-3 w-3" />
        {anyLoading
          ? 'Loading…'
          : `Showing ${fromStr} → ${toStr} · ${accounts.length} accounts · ${goals.length} goals`}
      </motion.div>
    </div>
  );
}
