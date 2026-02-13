'use client';

import { TrendingUp, Wallet, Plus } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CapitalTrustTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-950'
          : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .capital-trust {
          font-family: 'Inter', -apple-system, sans-serif;
        }

        @keyframes grow-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-grow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .capital-card {
          animation: grow-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .capital-card:hover {
          transform: translateY(-6px) scale(1.02);
        }

        .capital-card:hover .growth-indicator {
          transform: scale(1.2);
        }

        .growth-indicator {
          transition: transform 0.3s ease;
        }

        .value-counter {
          transition: all 0.3s ease;
        }

        .capital-card:hover .value-counter {
          color: rgb(16, 185, 129);
        }
      `}</style>

      <div className="capital-trust min-h-screen">
        <div className="max-w-[1400px] mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp
                    className={`h-8 w-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                  <h1
                    className={`text-5xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-emerald-950'
                    }`}
                  >
                    Capital Trust
                  </h1>
                </div>
                <p
                  className={`text-base font-medium ${
                    isDark ? 'text-emerald-300/70' : 'text-emerald-800/70'
                  }`}
                >
                  Building wealth through trusted financial partnerships
                </p>
              </div>

              <button
                type="button"
                onClick={onCreateAccount}
                className={`group flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                } hover:shadow-lg hover:shadow-emerald-500/40`}
              >
                <Plus className="h-5 w-5" />
                <span>New Account</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div
                className={`capital-card p-6 rounded-lg border ${
                  isDark
                    ? 'bg-emerald-900/30 border-emerald-800 backdrop-blur-sm'
                    : 'bg-white border-emerald-200'
                }`}
                style={{ animationDelay: '0.1s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Total Capital
                </div>
                <div
                  className={`value-counter text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {formatRupees(totalBalance)}
                </div>
              </div>

              <div
                className={`capital-card p-6 rounded-lg border ${
                  isDark
                    ? 'bg-emerald-900/30 border-emerald-800 backdrop-blur-sm'
                    : 'bg-white border-emerald-200'
                }`}
                style={{ animationDelay: '0.2s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Active Accounts
                </div>
                <div
                  className={`value-counter text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {activeAccounts}
                  <span
                    className={`text-xl ml-2 ${isDark ? 'text-emerald-600' : 'text-emerald-400'}`}
                  >
                    / {accounts.length}
                  </span>
                </div>
              </div>

              <div
                className={`capital-card p-6 rounded-lg border ${
                  isDark
                    ? 'bg-emerald-900/30 border-emerald-800 backdrop-blur-sm'
                    : 'bg-white border-emerald-200'
                }`}
                style={{ animationDelay: '0.3s' }}
              >
                <div
                  className={`text-sm font-semibold mb-2 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Growth Rate
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`value-counter text-3xl font-bold ${
                      isDark ? 'text-white' : 'text-emerald-950'
                    }`}
                  >
                    +7.4%
                  </div>
                  <TrendingUp
                    className={`growth-indicator h-5 w-5 ${
                      isDark ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Grid - 3 Column */}
          <div className="grid grid-cols-3 gap-6">
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className={`capital-card group cursor-pointer p-5 rounded-lg border ${
                  isDark
                    ? 'bg-emerald-900/30 border-emerald-800 backdrop-blur-sm hover:bg-emerald-900/50 hover:border-emerald-700'
                    : 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-lg ${
                      isDark ? 'bg-emerald-600/20' : 'bg-emerald-100'
                    }`}
                  >
                    <Wallet
                      className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {account.is_primary && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isDark
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-emerald-200 text-emerald-800'
                        }`}
                      >
                        Primary
                      </span>
                    )}
                    {account.is_active && (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-emerald-400' : 'bg-emerald-500'
                        }`}
                        style={{ animation: 'pulse-grow 2s ease-in-out infinite' }}
                      />
                    )}
                  </div>
                </div>

                <h3
                  className={`text-base font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {account.account_name}
                </h3>
                <p
                  className={`text-sm font-medium mb-4 ${
                    isDark ? 'text-emerald-400/70' : 'text-emerald-700/70'
                  }`}
                >
                  {account.account_type || 'Account'}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isDark ? 'text-emerald-500' : 'text-emerald-600'
                      }`}
                    >
                      Bank
                    </span>
                    <span className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      {account.bank?.name || '—'}
                    </span>
                  </div>

                  {account.account_number && (
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          isDark ? 'text-emerald-500' : 'text-emerald-600'
                        }`}
                      >
                        Account
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}
                      >
                        {account.account_number}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className={`pt-3 border-t ${
                    isDark ? 'border-emerald-800' : 'border-emerald-200'
                  }`}
                >
                  <div
                    className={`text-xs font-semibold mb-1 ${
                      isDark ? 'text-emerald-500' : 'text-emerald-600'
                    }`}
                  >
                    Balance
                  </div>
                  <div
                    className={`value-counter text-xl font-bold ${
                      isDark ? 'text-white' : 'text-emerald-950'
                    }`}
                  >
                    {formatRupees(account.current_balence || 0)}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Account Card */}
            <button
              type="button"
              onClick={onCreateAccount}
              className={`capital-card group cursor-pointer p-5 rounded-lg border-2 border-dashed transition-all duration-300 ${
                isDark
                  ? 'border-emerald-800 hover:border-emerald-600 hover:bg-emerald-900/20'
                  : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50'
              }`}
              style={{ animationDelay: `${0.4 + accounts.length * 0.1}s` }}
            >
              <div className="flex flex-col items-center justify-center py-8">
                <Plus
                  className={`h-10 w-10 mb-3 ${
                    isDark ? 'text-emerald-700' : 'text-emerald-400'
                  } group-hover:text-emerald-500 transition-colors duration-300`}
                />
                <span
                  className={`text-base font-bold ${
                    isDark ? 'text-emerald-500' : 'text-emerald-700'
                  } group-hover:text-emerald-600 transition-colors duration-300`}
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
