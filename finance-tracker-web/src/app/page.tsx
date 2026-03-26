'use client';

import { Button } from '@/components/ui/button';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  GitMerge,
  Landmark,
  MessageSquare,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

const APK_URL =
  'https://github.com/KaranMali2001/finance-tracker-v2/releases/download/v1.0.0/app-arm64-v8a-release.apk';

function useScrollReveal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return { ref, isInView };
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function NetWorthCard() {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
      <div className="mb-1 text-xs font-medium uppercase tracking-widest text-stone-400">
        Net Worth · 6M
      </div>
      <div
        className="mb-1 text-3xl font-bold text-stone-900"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        ₹24,83,500
      </div>
      <div className="flex items-center gap-1.5 text-sm text-emerald-600">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>+12.4% over period · ₹2,73,200 gained</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: 'Total Income', value: '₹6,40,000', color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Total Expense', value: '₹3,66,800', color: 'bg-red-50 text-red-700' },
          { label: 'All Accounts', value: '₹18,50,000', color: 'bg-amber-50 text-amber-700' },
          { label: 'Portfolio', value: '₹6,33,500', color: 'bg-sky-50 text-sky-700' },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl p-3 ${item.color}`}>
            <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">
              {item.label}
            </div>
            <div className="text-sm font-bold">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpendChart() {
  const bars = [
    { label: 'Oct', h: 45, active: false },
    { label: 'Nov', h: 62, active: false },
    { label: 'Dec', h: 38, active: false },
    { label: 'Jan', h: 78, active: false },
    { label: 'Feb', h: 55, active: false },
    { label: 'Mar', h: 91, active: true },
  ];
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-stone-400">
            Spend by Month
          </div>
          <div className="text-lg font-bold text-stone-900">₹3,66,800</div>
        </div>
        <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          6 months
        </div>
      </div>
      <div className="flex h-20 items-end gap-1.5">
        {bars.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md transition-all ${b.active ? 'bg-gradient-to-t from-amber-600 to-yellow-400' : 'bg-stone-100'}`}
              style={{ height: `${b.h}%` }}
            />
            <span
              className={`text-[9px] font-medium ${b.active ? 'text-amber-700' : 'text-stone-400'}`}
            >
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvestmentGoalCard() {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
          <Target className="h-4 w-4 text-amber-700" />
        </div>
        <div>
          <div className="text-sm font-semibold text-stone-900">Home Purchase</div>
          <div className="text-xs text-stone-400">Target: Dec 2026</div>
        </div>
        <div className="ml-auto text-xs font-semibold text-emerald-600">On Track</div>
      </div>
      <div className="mb-1 flex justify-between text-xs text-stone-500">
        <span>₹18,50,000 saved</span>
        <span>₹50,00,000 goal</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: '37%' }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1 text-right text-xs font-bold text-amber-700">37%</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Monthly SIP', value: '₹25,000' },
          { label: 'This Month', value: '₹25,000' },
          { label: 'Months Left', value: '21' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-stone-50 p-2">
            <div className="text-xs font-bold text-stone-900">{s.value}</div>
            <div className="text-[9px] text-stone-400">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReconciliationCard() {
  const rows = [
    { desc: 'HDFC Bank Transfer', amount: '₹50,000', status: 'matched', match: '98%' },
    { desc: 'Swiggy Food Order', amount: '₹847', status: 'matched', match: '94%' },
    { desc: 'Amazon Purchase', amount: '₹2,499', status: 'review', match: '71%' },
    { desc: 'Netflix Subscription', amount: '₹649', status: 'matched', match: '100%' },
  ];
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100">
            <GitMerge className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <span className="text-sm font-semibold text-stone-900">Statement Reconciliation</span>
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          195 matched
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.desc} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-stone-800">{r.desc}</div>
            </div>
            <div className="text-xs font-bold text-stone-900">{r.amount}</div>
            <div
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${r.status === 'matched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
            >
              {r.match}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SmsCard() {
  const messages = [
    {
      bank: 'HDFC',
      raw: 'Rs.2,500.00 debited from A/c **4821 on 23-03-26',
      parsed: { amount: '₹2,500', type: 'Debit', category: 'Transfer' },
    },
    {
      bank: 'SBI',
      raw: 'INR 15,000.00 credited to A/c ending 7823',
      parsed: { amount: '₹15,000', type: 'Credit', category: 'Income' },
    },
  ];
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-900/5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
          <MessageSquare className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <span className="text-sm font-semibold text-stone-900">SMS Auto-Capture</span>
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
          AI Powered
        </span>
      </div>
      {messages.map((m) => (
        <div key={m.bank} className="mb-2 rounded-xl border border-stone-100 p-3">
          <div className="mb-1.5 rounded bg-stone-100 px-2 py-1 font-mono text-[10px] text-stone-500">
            {m.raw}
          </div>
          <div className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-stone-400">Parsed as</span>
          </div>
          <div className="mt-1 flex gap-2">
            {Object.entries(m.parsed).map(([k, v]) => (
              <div key={k} className="rounded-md bg-amber-50 px-2 py-0.5">
                <div className="text-[8px] uppercase tracking-wide text-amber-600">{k}</div>
                <div className="text-xs font-bold text-amber-900">{v}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: Target,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-700',
    tag: 'Investment Goals',
    title: 'Set goals. Track SIPs. Watch wealth compound.',
    description:
      'Define investment goals like home purchase or retirement. Link SIP rules to auto-track monthly contributions. See real-time progress with projections.',
    bullets: [
      'Auto-link SIP transactions',
      'Goal progress & projections',
      'Mutual funds, PPF, NPS & more',
    ],
    card: <InvestmentGoalCard />,
    reverse: false,
  },
  {
    icon: GitMerge,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
    tag: 'Bank Reconciliation',
    title: 'Upload your statement. We match everything.',
    description:
      'Import any bank statement in Excel format. Our AI scores each transaction against your records — resolving mismatches automatically.',
    bullets: ['Excel bulk import', 'AI-powered fuzzy matching', 'Accept / reject with one tap'],
    card: <ReconciliationCard />,
    reverse: true,
  },
  {
    icon: MessageSquare,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
    tag: 'SMS Capture',
    title: 'Every bank SMS → a clean transaction.',
    description:
      'The Android app reads bank SMS notifications silently in the background. No manual entry, no open apps — just automatic, accurate transaction logging.',
    bullets: [
      'Works with all major Indian banks',
      'Runs in background, even when closed',
      'Google Gemini AI parsing',
    ],
    card: <SmsCard />,
    reverse: false,
  },
];

const stats = [
  { value: '6+', label: 'Investment types tracked' },
  { value: '195', label: 'Transactions reconciled per upload' },
  { value: '100%', label: 'Indian bank SMS support' },
  { value: '0', label: 'Manual entries needed' },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 font-sans">
      {/* ── NAV ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-yellow-500 shadow-sm">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-lg font-bold text-stone-900"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Wealth Reserve
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-sm hover:from-amber-700 hover:to-yellow-600"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden pt-16"
      >
        {/* Background texture */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.88_0.052_70/0.3),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative mx-auto w-full max-w-7xl px-6 py-20"
        >
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  Built for Indian personal finance
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Your wealth,{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
                    reserved
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-amber-600 to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                  />
                </span>{' '}
                & growing.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mb-8 text-lg leading-relaxed text-stone-500"
              >
                Track every rupee automatically — via SMS, bank statements, or manual entry. Set
                investment goals, reconcile accounts, and see your net worth grow in real time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-lg shadow-amber-500/20 hover:from-amber-700 hover:to-yellow-600"
                  >
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href={APK_URL} download>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-stone-200 text-stone-700 hover:border-amber-300 hover:text-amber-700"
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Android App
                  </Button>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex flex-wrap gap-5 text-sm text-stone-400"
              >
                {['Free to use', 'No credit card', 'Works offline (Android)'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — floating UI cards */}
            <div className="relative hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <NetWorthCard />
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  className="absolute -bottom-8 -right-8 w-64"
                >
                  <SpendChart />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -32, y: -16 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.9 }}
                  className="absolute -left-10 top-1/3 rounded-2xl border border-amber-100 bg-white px-4 py-3 shadow-lg shadow-amber-900/5"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <TrendingUp className="h-3.5 w-3.5" />
                    SIP of ₹25,000 logged
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-stone-200 bg-white py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.1} className="text-center">
                <div
                  className="text-4xl font-bold text-stone-900"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-stone-400">{s.label}</div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">Core Features</span>
            </div>
            <h2
              className="text-4xl font-bold text-stone-900 sm:text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Everything your money needs
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-500">
              From capturing transactions to reconciling bank statements — Wealth Reserve handles
              the complexity so you can focus on growing your wealth.
            </p>
          </FadeUp>

          <div className="space-y-32">
            {features.map((f, i) => (
              <FadeUp key={f.tag} delay={0.1}>
                <div
                  className={`grid items-center gap-12 lg:grid-cols-2 ${f.reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
                >
                  {/* Copy */}
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 shadow-sm">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded ${f.iconBg}`}
                      >
                        <f.icon className={`h-3 w-3 ${f.iconColor}`} />
                      </div>
                      <span className="text-xs font-semibold text-stone-600">{f.tag}</span>
                    </div>
                    <h3
                      className="mb-4 text-3xl font-bold leading-tight text-stone-900 sm:text-4xl"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {f.title}
                    </h3>
                    <p className="mb-6 text-base leading-relaxed text-stone-500">{f.description}</p>
                    <ul className="mb-8 space-y-3">
                      {f.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3 text-sm text-stone-700">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <Link href="/sign-up">
                      <Button
                        variant="outline"
                        className="group border-stone-200 text-stone-700 hover:border-amber-300 hover:text-amber-700"
                      >
                        Try it free
                        <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Card mockup */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-50 to-stone-100" />
                    <div className="relative p-8">{f.card}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-stone-900 py-28 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <FadeUp className="mb-16 text-center">
            <h2
              className="text-4xl font-bold sm:text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Three ways
              </span>{' '}
              to capture your finances
            </h2>
            <p className="mt-4 text-stone-400">
              Use one or all three — they all sync into the same dashboard.
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                step: '01',
                title: 'SMS Auto-Capture',
                desc: 'Install the Android app. Every bank SMS is automatically parsed and logged — no action needed.',
                color: 'from-violet-500/20 to-violet-500/5',
                border: 'border-violet-500/20',
                iconBg: 'bg-violet-500/20',
                iconColor: 'text-violet-400',
              },
              {
                icon: FileSpreadsheet,
                step: '02',
                title: 'Bulk Statement Import',
                desc: 'Download your bank statement as Excel, upload it here. Our reconciliation engine handles the rest.',
                color: 'from-sky-500/20 to-sky-500/5',
                border: 'border-sky-500/20',
                iconBg: 'bg-sky-500/20',
                iconColor: 'text-sky-400',
              },
              {
                icon: Wallet,
                step: '03',
                title: 'Manual Entry',
                desc: 'Add transactions manually anytime. Full categorization, notes, and account assignment.',
                color: 'from-amber-500/20 to-amber-500/5',
                border: 'border-amber-500/20',
                iconBg: 'bg-amber-500/20',
                iconColor: 'text-amber-400',
              },
            ].map((item, i) => (
              <FadeUp key={item.step} delay={i * 0.12}>
                <div
                  className={`relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-b ${item.color} p-6`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <span className="text-5xl font-bold text-white/5">{item.step}</span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-white">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-stone-400">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANDROID ── */}
      <section className="border-b border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <FadeUp>
            <div className="flex flex-col items-center gap-8 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-stone-50 p-10 text-center shadow-sm md:flex-row md:text-left">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-500 shadow-lg shadow-amber-500/30">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h3
                  className="mb-2 text-2xl font-bold text-stone-900"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Get the Android App
                </h3>
                <p className="mb-1 text-stone-500">
                  Automatically capture bank transactions from SMS in the background — even when the
                  app is closed. Works with all major Indian banks.
                </p>
                <p className="text-xs text-stone-400">
                  Version 1.0.0 · Android 7.0+ · 64-bit devices
                </p>
              </div>
              <a href={APK_URL} download className="flex-shrink-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-500/20 hover:from-amber-700 hover:to-yellow-600"
                >
                  Download APK
                </Button>
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Your data stays yours',
                desc: 'All data is encrypted at rest and in transit. We never sell or share your financial information.',
              },
              {
                icon: Landmark,
                title: 'Built for Indian finance',
                desc: 'Supports UPI, NEFT, IMPS, SIP patterns and all major banks including HDFC, SBI, ICICI, Axis.',
              },
              {
                icon: BarChart3,
                title: 'Real insights, not noise',
                desc: 'Monthly reports, net worth trends, spend breakdowns — data that actually helps you make decisions.',
              },
            ].map((t, i) => (
              <FadeUp key={t.title} delay={i * 0.1}>
                <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    <t.icon className="h-5 w-5 text-amber-700" />
                  </div>
                  <h4 className="mb-1.5 text-sm font-semibold text-stone-900">{t.title}</h4>
                  <p className="text-sm leading-relaxed text-stone-500">{t.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-16 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.76_0.095_72/0.15),transparent)]" />
              <h2
                className="relative mb-4 text-4xl font-bold text-white sm:text-5xl"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Start building your{' '}
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  financial reserve
                </span>
              </h2>
              <p className="relative mb-8 text-stone-400">
                Free to use. No credit card required. Takes 2 minutes to set up.
              </p>
              <div className="relative flex flex-wrap justify-center gap-3">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-300"
                  >
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-stone-700 bg-transparent text-stone-300 hover:border-amber-500/50 hover:text-white"
                  >
                    Sign in
                  </Button>
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-stone-200 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-amber-600 to-yellow-500">
                <Landmark className="h-3.5 w-3.5 text-white" />
              </div>
              <span
                className="text-sm font-semibold text-stone-700"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                Wealth Reserve
              </span>
            </div>
            <p className="text-xs text-stone-400">
              © {new Date().getFullYear()} Wealth Reserve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
