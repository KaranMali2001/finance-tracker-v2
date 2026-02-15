'use client';

import { Activity, ArrowRight, CreditCard, Plus, Shield, TrendingUp, Zap } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ACCENT_COLORS = [
  {
    border: 'border-l-emerald-400',
    glow: 'shadow-emerald-500/20',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
  },
  {
    border: 'border-l-cyan-400',
    glow: 'shadow-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    textColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
  },
  {
    border: 'border-l-violet-400',
    glow: 'shadow-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    textColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/10',
    badgeBorder: 'border-violet-500/30',
  },
  {
    border: 'border-l-fuchsia-400',
    glow: 'shadow-fuchsia-500/20',
    iconBg: 'bg-fuchsia-500/10',
    iconColor: 'text-fuchsia-400',
    textColor: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-500/10',
    badgeBorder: 'border-fuchsia-500/30',
  },
  {
    border: 'border-l-amber-400',
    glow: 'shadow-amber-500/20',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
  },
  {
    border: 'border-l-rose-400',
    glow: 'shadow-rose-500/20',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    textColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
  },
];

export default function MidnightProTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const primaryAccount = accounts.find((acc) => acc.is_primary);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  return (
    <div
      className={`min-h-screen w-full ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100'
      }`}
    >
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Scanline effect */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
          <div
            className="w-full h-full bg-gradient-to-b from-transparent via-white to-transparent"
            style={{
              animation: 'scan 8s linear infinite',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .card-enter {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .neon-line {
          position: relative;
        }

        .neon-line::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, currentColor, transparent);
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`relative p-1.5 rounded-lg ${
                    isDark
                      ? 'bg-slate-900 border border-slate-800'
                      : 'bg-white border border-slate-300'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-lg animate-pulse" />
                  <Zap
                    className={`relative h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
                  />
                </div>
                <div>
                  <h1
                    className={`text-3xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    }}
                  >
                    ACCOUNTS_
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${isDark ? 'shadow-[0_0_8px_rgba(52,211,153,0.6)]' : ''}`}
                      style={{
                        animation: 'pulse-glow 2s ease-in-out infinite',
                      }}
                    />
                    <span
                      className={`text-xs font-medium tracking-wider ${
                        isDark ? 'text-slate-500' : 'text-slate-600'
                      }`}
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      SYSTEM ONLINE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onCreateAccount}
              className={`group relative flex items-center gap-2 px-5 py-2.5 font-bold text-xs tracking-wider border transition-all duration-300 ${
                isDark
                  ? 'bg-slate-900 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/30'
                  : 'bg-slate-900 text-white border-slate-700 hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-600/20'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Plus className="h-4 w-4" />
              NEW_ACCOUNT
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div
              className={`card-enter relative p-5 border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="neon-line absolute inset-x-0 top-0 text-emerald-400" />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                  <TrendingUp
                    className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                </div>
                <Activity className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              </div>
              <p
                className={`text-[10px] font-bold tracking-widest mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                TOTAL_BALANCE
              </p>
              <p
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {formatRupees(totalBalance)}
              </p>
            </div>

            <div
              className={`card-enter relative p-5 border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="neon-line absolute inset-x-0 top-0 text-cyan-400" />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-100'}`}>
                  <CreditCard className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <Shield className={`h-4 w-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              </div>
              <p
                className={`text-[10px] font-bold tracking-widest mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACTIVE_ACCOUNTS
              </p>
              <p
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {activeAccounts}
                <span className={`text-sm ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  / {accounts.length}
                </span>
              </p>
            </div>

            <div
              className={`card-enter relative p-5 border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="neon-line absolute inset-x-0 top-0 text-violet-400" />
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded ${isDark ? 'bg-violet-500/10' : 'bg-violet-100'}`}>
                  <Zap className={`h-4 w-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                </div>
              </div>
              <p
                className={`text-[10px] font-bold tracking-widest mb-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                PRIMARY_ACCOUNT
              </p>
              <p
                className={`text-lg font-bold truncate ${
                  isDark ? 'text-violet-400' : 'text-violet-600'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {primaryAccount?.account_name?.toUpperCase() || 'NONE'}
              </p>
            </div>
          </div>
        </header>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account, index) => {
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
            return (
              <div
                key={account.id}
                className={`card-enter group relative border-l-4 ${accent.border} transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
                  isDark
                    ? `bg-slate-900 border-r border-t border-b border-slate-800 hover:shadow-xl ${accent.glow}`
                    : `bg-white border-r border-t border-b border-slate-200 hover:shadow-lg ${accent.glow}`
                }`}
                style={{ animationDelay: `${0.4 + index * 0.05}s` }}
              >
                {/* Top line indicator */}
                <div className={`neon-line absolute inset-x-0 top-0 ${accent.textColor}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${accent.iconBg}`}>
                        <CreditCard className={`h-4 w-4 ${accent.iconColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-bold text-sm tracking-wide ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {account.account_name?.toUpperCase()}
                          </h3>
                          {account.is_primary && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider border ${accent.badgeBg} ${accent.textColor} ${accent.badgeBorder}`}
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[10px] tracking-wider ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {account.account_type?.toUpperCase() || 'ACCOUNT'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 ${accent.iconColor}`}
                    />
                  </div>

                  <div className="space-y-2.5">
                    {account.bank && (
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold tracking-widest ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          BANK
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {account.bank.name}
                        </span>
                      </div>
                    )}

                    {account.account_number && (
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold tracking-widest ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          ACCOUNT
                        </span>
                        <span
                          className={`text-xs font-mono ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {account.account_number}
                        </span>
                      </div>
                    )}

                    {account.current_balence !== undefined && (
                      <div
                        className={`pt-3 mt-2 border-t ${
                          isDark ? 'border-slate-800' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold tracking-widest ${
                              isDark ? 'text-slate-500' : 'text-slate-500'
                            }`}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            BALANCE
                          </span>
                          <span
                            className={`text-xl font-bold ${accent.textColor}`}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {formatRupees(account.current_balence)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Account Card */}
          <button
            type="button"
            onClick={onCreateAccount}
            className={`card-enter group flex flex-col items-center justify-center min-h-[240px] border-2 border-dashed transition-all duration-300 hover:scale-[1.01] ${
              isDark
                ? 'bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900'
                : 'bg-slate-50 border-slate-300 hover:border-cyan-500 hover:bg-white'
            }`}
            style={{ animationDelay: `${0.4 + accounts.length * 0.05}s` }}
          >
            <div
              className={`p-3 mb-3 rounded transition-all duration-300 group-hover:scale-110 ${
                isDark
                  ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20'
                  : 'bg-cyan-100 group-hover:bg-cyan-200'
              }`}
            >
              <Plus className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
            <h3
              className={`font-bold text-sm tracking-wider mb-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              NEW_ACCOUNT
            </h3>
            <p
              className={`text-[10px] tracking-widest ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              INITIALIZE_NEW
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
