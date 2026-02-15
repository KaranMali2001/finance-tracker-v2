'use client';

import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const CARD_THEMES = [
  {
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
    border: 'border-orange-500',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-400',
    accentBar: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  {
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20',
    border: 'border-blue-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
    accentBar: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/20',
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    accentBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  {
    gradient: 'from-violet-500 to-purple-500',
    shadow: 'shadow-violet-500/20',
    border: 'border-violet-500',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-400',
    accentBar: 'bg-gradient-to-r from-violet-500 to-purple-500',
  },
  {
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/20',
    border: 'border-pink-500',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500',
    badgeBg: 'bg-pink-500/20',
    badgeText: 'text-pink-400',
    accentBar: 'bg-gradient-to-r from-pink-500 to-rose-500',
  },
];

export default function ProsperityHubTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

        .prosperity-hub {
          font-family: 'Manrope', -apple-system, sans-serif;
        }

        @keyframes float-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .hub-card {
          animation: float-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-card:hover {
          transform: translateY(-4px);
        }

        .hub-card:hover .accent-line {
          transform: scaleX(1);
        }

        .accent-line {
          transform-origin: left;
          transform: scaleX(0);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .balance-text {
          transition: all 0.3s ease;
        }

        .hub-card:hover .balance-text {
          transform: scale(1.03);
        }

        .gradient-border {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        .status-pulse {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>

      <div className="prosperity-hub min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles
                    className={`h-8 w-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}
                  />
                  <h1
                    className={`text-5xl font-bold tracking-tight ${
                      isDark
                        ? 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent'
                        : 'text-slate-900'
                    }`}
                  >
                    Prosperity Hub
                  </h1>
                </div>
                <p
                  className={`text-base font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Your central dashboard for financial growth and success
                </p>
              </div>

              <button
                type="button"
                onClick={onCreateAccount}
                className={`group flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white'
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white'
                } hover:shadow-lg hover:shadow-orange-500/30`}
              >
                <Plus className="h-5 w-5" />
                <span>New Account</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div
                className={`hub-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
                style={{ animationDelay: '0.1s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Total Wealth
                </div>
                <div
                  className={`balance-text text-3xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatRupees(totalBalance)}
                </div>
                <div
                  className={`accent-line h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500`}
                />
              </div>

              <div
                className={`hub-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
                style={{ animationDelay: '0.2s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Active Accounts
                </div>
                <div
                  className={`balance-text text-3xl font-bold mb-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activeAccounts}
                  <span className={`text-xl ml-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    / {accounts.length}
                  </span>
                </div>
                <div
                  className={`accent-line h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500`}
                />
              </div>

              <div
                className={`hub-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
                style={{ animationDelay: '0.3s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Monthly Growth
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`balance-text text-3xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    +6.8%
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div
                  className={`accent-line h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}
                />
              </div>
            </div>
          </div>

          {/* Accounts List - Single Column */}
          <div className="space-y-4">
            {accounts.map((account, index) => {
              const theme = CARD_THEMES[index % CARD_THEMES.length];
              return (
                <div
                  key={account.id}
                  className={`hub-card group cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                    isDark
                      ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  } hover:shadow-lg ${theme.shadow}`}
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  {/* Top accent bar */}
                  <div className={`accent-line h-1 rounded-t-xl ${theme.accentBar}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${theme.iconBg} border ${theme.border}`}>
                          <Sparkles className={`h-5 w-5 ${theme.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`text-lg font-bold ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {account.account_name}
                            </h3>
                            {account.is_primary && (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${theme.badgeBg} ${theme.badgeText}`}
                              >
                                Primary
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm font-medium ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            {account.account_type || 'Account'} •{' '}
                            {account.bank?.name || 'Independent'}
                          </p>
                        </div>
                      </div>

                      {account.is_active && (
                        <div
                          className={`status-pulse w-2.5 h-2.5 rounded-full ${theme.iconColor} bg-current`}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        {account.account_number && (
                          <div className="mb-3">
                            <span
                              className={`text-xs font-semibold ${
                                isDark ? 'text-slate-500' : 'text-slate-600'
                              }`}
                            >
                              Account Number
                            </span>
                            <div
                              className={`text-sm font-mono mt-1 ${
                                isDark ? 'text-slate-400' : 'text-slate-700'
                              }`}
                            >
                              {account.account_number}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-semibold mb-1 ${
                            isDark ? 'text-slate-500' : 'text-slate-600'
                          }`}
                        >
                          Current Balance
                        </div>
                        <div className={`balance-text text-2xl font-bold ${theme.iconColor}`}>
                          {formatRupees(account.current_balence || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Account Card */}
            <button
              type="button"
              onClick={onCreateAccount}
              className={`hub-card w-full text-left p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark
                  ? 'border-slate-800 hover:border-orange-600 hover:bg-slate-900/30'
                  : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50'
              }`}
              style={{ animationDelay: `${0.4 + accounts.length * 0.1}s` }}
            >
              <div className="flex items-center gap-3">
                <Plus
                  className={`h-6 w-6 ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  } group-hover:text-orange-500 transition-colors duration-300`}
                />
                <span
                  className={`text-base font-bold ${
                    isDark ? 'text-slate-500' : 'text-slate-700'
                  } group-hover:text-orange-600 transition-colors duration-300`}
                >
                  Add New Account
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
