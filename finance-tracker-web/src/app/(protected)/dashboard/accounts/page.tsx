'use client';

import { ArrowUpRight, Check, Palette, Plus, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { internal_domain_account_Account } from '@/generated/api';
import { cn } from '@/lib/utils';
import { AccountCreateForm } from '../../../../components/accountComponents/AccountCreateForm/AccountCreateForm';

// ─── Types ────────────────────────────────────────────

type ThemeId = 'glass-luxe' | 'midnight-pro' | 'warm-earth' | 'crisp-minimal' | 'bold-gradient';
type Account = internal_domain_account_Account;

interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  preview: string;
}

// ─── Theme Configuration ──────────────────────────────

const THEMES: ThemeConfig[] = [
  {
    id: 'glass-luxe',
    name: 'Glass Luxe',
    description: 'Frosted glass with gradients',
    preview: 'from-violet-400 to-indigo-500',
  },
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    description: 'Dark elegance with glow',
    preview: 'from-slate-700 to-slate-900',
  },
  {
    id: 'warm-earth',
    name: 'Warm Earth',
    description: 'Organic & earthy warmth',
    preview: 'from-amber-300 to-orange-500',
  },
  {
    id: 'crisp-minimal',
    name: 'Crisp Minimal',
    description: 'Ultra-clean banking',
    preview: 'from-indigo-400 to-blue-500',
  },
  {
    id: 'bold-gradient',
    name: 'Bold Gradient',
    description: 'Vibrant & dynamic',
    preview: 'from-blue-500 to-purple-600',
  },
];

const CARD_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-violet-600 to-purple-800',
  'from-orange-500 to-rose-600',
  'from-cyan-500 to-blue-700',
  'from-pink-500 to-rose-700',
];

const MIDNIGHT_ACCENTS = [
  {
    borderL: 'border-l-emerald-400',
    bg: 'bg-emerald-500/15',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    borderL: 'border-l-sky-400',
    bg: 'bg-sky-500/15',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/20',
    badgeBorder: 'border-sky-500/30',
  },
  {
    borderL: 'border-l-violet-400',
    bg: 'bg-violet-500/15',
    color: 'text-violet-400',
    badgeBg: 'bg-violet-500/20',
    badgeBorder: 'border-violet-500/30',
  },
  {
    borderL: 'border-l-amber-400',
    bg: 'bg-amber-500/15',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeBorder: 'border-amber-500/30',
  },
  {
    borderL: 'border-l-rose-400',
    bg: 'bg-rose-500/15',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/30',
  },
  {
    borderL: 'border-l-cyan-400',
    bg: 'bg-cyan-500/15',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeBorder: 'border-cyan-500/30',
  },
];

// ─── Theme Selector ───────────────────────────────────

function ThemeSelector({
  selected,
  onChange,
}: {
  selected: ThemeId;
  onChange: (id: ThemeId) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Choose Theme</span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {THEMES.map((theme) => {
          const isSelected = selected === theme.id;
          return (
            <button
              type="button"
              key={theme.id}
              onClick={() => onChange(theme.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 border cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/25'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-accent/50'
              )}
            >
              <div
                className={cn(
                  'h-7 w-7 rounded-lg bg-gradient-to-br shadow-inner shrink-0',
                  theme.preview
                )}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold leading-tight',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {theme.name}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {theme.description}
                </p>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary ml-1 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME 1: GLASS LUXE
// Frosted glass cards, gradient accents, premium feel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function GlassLuxeCard({ account }: { account: Account }) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl p-0 gap-0',
        'border border-white/30 bg-white/50 backdrop-blur-xl',
        'shadow-lg transition-all duration-300',
        'hover:shadow-xl hover:bg-white/70 hover:-translate-y-0.5'
      )}
    >
      {/* Decorative gradient blobs */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-violet-400/25 to-indigo-500/15 blur-2xl" />
      <div className="absolute -left-4 -bottom-6 h-20 w-20 rounded-full bg-gradient-to-br from-sky-400/15 to-cyan-500/10 blur-xl" />

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800">{account.account_name}</h3>
                {account.is_primary && (
                  <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-violet-700 backdrop-blur-sm border border-violet-200/50">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{account.account_type || 'Account'}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-2">
          {account.bank && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Bank</span>
              <span className="font-medium text-slate-700">{account.bank.name}</span>
            </div>
          )}
          {account.account_number && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Account</span>
              <span className="font-mono text-sm text-slate-600">{account.account_number}</span>
            </div>
          )}
          {account.current_balence !== undefined && (
            <div className="flex items-center justify-between border-t border-white/40 pt-3 mt-1">
              <span className="text-sm text-slate-500">Balance</span>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {formatRupees(account.current_balence)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function GlassLuxeAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left cursor-pointer">
      <Card
        className={cn(
          'group flex min-h-[180px] flex-col items-center justify-center rounded-2xl p-0 gap-0',
          'border-2 border-dashed border-white/40 bg-white/30 backdrop-blur-lg',
          'transition-all duration-300 hover:bg-white/50 hover:border-violet-300/50'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400/30 to-indigo-500/30 transition-colors group-hover:from-violet-400/50 group-hover:to-indigo-500/50">
          <Plus className="h-6 w-6 text-violet-600" />
        </div>
        <h3 className="mt-3 font-semibold text-slate-700">Add Account</h3>
        <p className="mt-1 text-xs text-slate-500">Create a new account</p>
      </Card>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME 2: MIDNIGHT PRO
// Dark cards, colored left borders, neon accents
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MidnightProCard({ account, index }: { account: Account; index: number }) {
  const accent = MIDNIGHT_ACCENTS[index % MIDNIGHT_ACCENTS.length];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-xl p-0 gap-0',
        'bg-slate-900 text-slate-100',
        'border border-slate-700/50',
        'border-l-4',
        accent.borderL,
        'shadow-lg transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-0.5'
      )}
    >
      {/* Top highlight line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', accent.bg)}>
              <Wallet className={cn('h-5 w-5', accent.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-50">{account.account_name}</h3>
                {account.is_primary && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium border',
                      accent.badgeBg,
                      accent.color,
                      accent.badgeBorder
                    )}
                  >
                    Primary
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{account.account_type || 'Account'}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-2">
          {account.bank && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Bank</span>
              <span className="font-medium text-slate-200">{account.bank.name}</span>
            </div>
          )}
          {account.account_number && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Account</span>
              <span className="font-mono text-sm text-slate-300">{account.account_number}</span>
            </div>
          )}
          {account.current_balence !== undefined && (
            <div className="flex items-center justify-between border-t border-slate-700/50 pt-3 mt-1">
              <span className="text-sm text-slate-400">Balance</span>
              <span className={cn('text-xl font-bold', accent.color)}>
                {formatRupees(account.current_balence)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function MidnightProAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left cursor-pointer">
      <Card
        className={cn(
          'group flex min-h-[180px] flex-col items-center justify-center rounded-xl p-0 gap-0',
          'border-2 border-dashed border-slate-700 bg-slate-900/50',
          'transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/80'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700/50 transition-colors group-hover:bg-slate-600/50">
          <Plus className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="mt-3 font-semibold text-slate-300">Add Account</h3>
        <p className="mt-1 text-xs text-slate-500">Create a new account</p>
      </Card>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME 3: WARM EARTH
// Organic warm tones, amber gradients, earthy feel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function WarmEarthCard({ account }: { account: Account }) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl p-0 gap-0',
        'bg-gradient-to-br from-amber-50/90 to-orange-50/80',
        'border border-amber-200/60',
        'shadow-md transition-all duration-300',
        'hover:shadow-lg hover:border-amber-300/70 hover:-translate-y-0.5'
      )}
    >
      {/* Warm decorative accent */}
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[3rem] bg-gradient-to-bl from-amber-200/30 to-transparent" />

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 shadow-sm shadow-amber-600/20">
              <Wallet className="h-5 w-5 text-amber-50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-800">{account.account_name}</h3>
                {account.is_primary && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-300/60">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">{account.account_type || 'Account'}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-2">
          {account.bank && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Bank</span>
              <span className="font-medium text-stone-700">{account.bank.name}</span>
            </div>
          )}
          {account.account_number && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">Account</span>
              <span className="font-mono text-sm text-stone-600">{account.account_number}</span>
            </div>
          )}
          {account.current_balence !== undefined && (
            <div className="flex items-center justify-between border-t border-amber-200/50 pt-3 mt-1">
              <span className="text-sm text-stone-500">Balance</span>
              <span className="text-xl font-bold text-amber-900">
                {formatRupees(account.current_balence)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function WarmEarthAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left cursor-pointer">
      <Card
        className={cn(
          'group flex min-h-[180px] flex-col items-center justify-center rounded-2xl p-0 gap-0',
          'border-2 border-dashed border-amber-300/60 bg-amber-50/50',
          'transition-all duration-300 hover:bg-amber-50 hover:border-amber-400/70'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-200/50 transition-colors group-hover:bg-amber-200/80">
          <Plus className="h-6 w-6 text-amber-700" />
        </div>
        <h3 className="mt-3 font-semibold text-stone-700">Add Account</h3>
        <p className="mt-1 text-xs text-stone-500">Create a new account</p>
      </Card>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME 4: CRISP MINIMAL
// Ultra-clean, barely-there shadows, indigo accent bar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CrispMinimalCard({ account }: { account: Account }) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-lg p-0 gap-0',
        'bg-white border-0',
        'transition-all duration-300',
        'hover:-translate-y-0.5'
      )}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

      <div className="p-6 pt-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Wallet className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{account.account_name}</h3>
                {account.is_primary && (
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-indigo-600">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{account.account_type || 'Account'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {account.bank && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-xs tracking-wider font-medium">
                Bank
              </span>
              <span className="text-sm font-medium text-slate-700">{account.bank.name}</span>
            </div>
          )}
          {account.account_number && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-xs tracking-wider font-medium">
                Account
              </span>
              <span className="font-mono text-sm text-slate-600">{account.account_number}</span>
            </div>
          )}
          {account.current_balence !== undefined && (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 -mx-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Balance
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatRupees(account.current_balence)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function CrispMinimalAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left cursor-pointer">
      <Card
        className={cn(
          'group flex min-h-[180px] flex-col items-center justify-center rounded-lg p-0 gap-0',
          'border-2 border-dashed border-slate-200 bg-white',
          'transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50/30'
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 transition-colors group-hover:bg-indigo-100">
          <Plus className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-600">Add Account</h3>
      </Card>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THEME 5: BOLD GRADIENT
// Vivid gradient backgrounds, white text, radial shine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function BoldGradientCard({ account, index }: { account: Account; index: number }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-2xl p-0 gap-0',
        'bg-gradient-to-br',
        gradient,
        'border-0 shadow-xl transition-all duration-300',
        'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]'
      )}
    >
      {/* Radial shine overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />

      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{account.account_name}</h3>
                {account.is_primary && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white border border-white/30 backdrop-blur-sm">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70">{account.account_type || 'Account'}</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-white/50 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="space-y-2">
          {account.bank && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Bank</span>
              <span className="font-medium text-white/90">{account.bank.name}</span>
            </div>
          )}
          {account.account_number && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Account</span>
              <span className="font-mono text-sm text-white/80">{account.account_number}</span>
            </div>
          )}
          {account.current_balence !== undefined && (
            <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-1">
              <span className="text-sm text-white/60">Balance</span>
              <span className="text-2xl font-bold text-white">
                {formatRupees(account.current_balence)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function BoldGradientAddCard({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left cursor-pointer">
      <Card
        className={cn(
          'group flex min-h-[180px] flex-col items-center justify-center rounded-2xl p-0 gap-0',
          'border-2 border-dashed border-purple-300/50 bg-gradient-to-br from-slate-100 to-purple-50',
          'transition-all duration-300 hover:from-purple-50 hover:to-indigo-50 hover:border-purple-400/60'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400/30 to-indigo-500/30 transition-all group-hover:from-purple-400/50 group-hover:to-indigo-500/50">
          <Plus className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="mt-3 font-semibold text-purple-800">Add Account</h3>
        <p className="mt-1 text-xs text-purple-500">Create a new account</p>
      </Card>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function AccountsPage() {
  const { data: accounts, isLoading, error, refetch, isFetching } = useAccounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('glass-luxe');

  if (isLoading || isFetching || accounts === undefined) {
    return (
      <PageShell title="Accounts">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Accounts">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (accounts.length === 0) {
    return (
      <PageShell title="Accounts">
        <EmptyState
          icon={Wallet}
          title="No accounts found"
          description="Get started by creating your first account to track your finances."
          action={{
            label: 'Create Account',
            onClick: () => setIsCreateDialogOpen(true),
          }}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new financial account.
              </DialogDescription>
            </DialogHeader>
            <AccountCreateForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  const renderCard = (account: Account, index: number) => {
    switch (selectedTheme) {
      case 'glass-luxe':
        return <GlassLuxeCard account={account} />;
      case 'midnight-pro':
        return <MidnightProCard account={account} index={index} />;
      case 'warm-earth':
        return <WarmEarthCard account={account} />;
      case 'crisp-minimal':
        return <CrispMinimalCard account={account} />;
      case 'bold-gradient':
        return <BoldGradientCard account={account} index={index} />;
    }
  };

  const renderAddCard = () => {
    const onClick = () => setIsCreateDialogOpen(true);
    switch (selectedTheme) {
      case 'glass-luxe':
        return <GlassLuxeAddCard onClick={onClick} />;
      case 'midnight-pro':
        return <MidnightProAddCard onClick={onClick} />;
      case 'warm-earth':
        return <WarmEarthAddCard onClick={onClick} />;
      case 'crisp-minimal':
        return <CrispMinimalAddCard onClick={onClick} />;
      case 'bold-gradient':
        return <BoldGradientAddCard onClick={onClick} />;
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);

  return (
    <PageShell title="Accounts" description="View and manage your financial accounts">
      <ThemeSelector selected={selectedTheme} onChange={setSelectedTheme} />

      <Separator />

      {/* Summary stats */}
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Balance
          </p>
          <p className="text-2xl font-bold tracking-tight">{formatRupees(totalBalance)}</p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Accounts
          </p>
          <p className="text-2xl font-bold tracking-tight">{accounts.length}</p>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {renderAddCard()}
        {accounts.map((account, index) => (
          <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
            {renderCard(account, index)}
          </Link>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new financial account.
            </DialogDescription>
          </DialogHeader>
          <AccountCreateForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
