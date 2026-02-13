'use client';

import { Building2, Plus, TrendingUp } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ExecutivePortfolioTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap');

        .executive-portfolio {
          font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes card-entrance {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes value-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .executive-card {
          animation: card-entrance 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .executive-card:hover {
          transform: translateY(-4px);
        }

        .executive-card:hover .card-accent {
          width: 100%;
        }

        .card-accent {
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 0;
        }

        .balance-value {
          transition: all 0.3s ease;
        }

        .executive-card:hover .balance-value {
          transform: scale(1.05);
          color: rgb(59, 130, 246);
        }

        .status-badge {
          transition: all 0.3s ease;
        }

        .executive-card:hover .status-badge {
          transform: scale(1.1);
          box-shadow: 0 0 12px currentColor;
        }
      `}</style>

      <div className="executive-portfolio min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h1
                    className={`text-5xl font-semibold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Executive Portfolio
                  </h1>
                </div>
                <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Comprehensive overview of your financial accounts
                </p>
              </div>

              <button
                type="button"
                onClick={onCreateAccount}
                className={`group flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } hover:shadow-lg hover:shadow-blue-500/30`}
              >
                <Plus className="h-5 w-5" />
                <span>New Account</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div
                className={`executive-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                    : 'bg-white border-slate-200'
                }`}
                style={{ animationDelay: '0.1s' }}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Total Balance
                </div>
                <div
                  className={`balance-value text-3xl font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatRupees(totalBalance)}
                </div>
                <div className={`card-accent h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              </div>

              <div
                className={`executive-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                    : 'bg-white border-slate-200'
                }`}
                style={{ animationDelay: '0.2s' }}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Active Accounts
                </div>
                <div
                  className={`balance-value text-3xl font-bold mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activeAccounts}
                  <span className={`text-xl ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    / {accounts.length}
                  </span>
                </div>
                <div className={`card-accent h-0.5 ${isDark ? 'bg-sky-400' : 'bg-sky-600'}`} />
              </div>

              <div
                className={`executive-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                    : 'bg-white border-slate-200'
                }`}
                style={{ animationDelay: '0.3s' }}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Growth
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`balance-value text-3xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    +5.2%
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className={`card-accent h-0.5 ${isDark ? 'bg-green-400' : 'bg-green-600'}`} />
              </div>
            </div>
          </div>

          {/* Accounts Grid - 2 Column */}
          <div className="grid grid-cols-2 gap-6">
            {accounts.map((account, index) => (
              <div
                key={account.id}
                className={`executive-card group cursor-pointer p-6 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 hover:border-slate-600'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                      <Building2
                        className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {account.account_name}
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {account.account_type || 'Account'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {account.is_primary && (
                      <span
                        className={`status-badge px-3 py-1 rounded-full text-xs font-medium ${
                          isDark
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}
                      >
                        Primary
                      </span>
                    )}
                    {account.is_active && (
                      <div
                        className="w-2 h-2 rounded-full bg-green-500"
                        style={{ animation: 'value-pulse 2s ease-in-out infinite' }}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Bank
                    </span>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {account.bank?.name || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Account Number
                    </span>
                    <span
                      className={`text-sm font-mono ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {account.account_number || '—'}
                    </span>
                  </div>

                  <div
                    className={`pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Current Balance
                    </div>
                    <div
                      className={`balance-value text-2xl font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {formatRupees(account.current_balence || 0)}
                    </div>
                  </div>
                </div>

                <div
                  className={`card-accent h-1 mt-4 rounded-full ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-sky-500'
                      : 'bg-gradient-to-r from-blue-600 to-sky-600'
                  }`}
                />
              </div>
            ))}

            {/* Add Account Card */}
            <button
              type="button"
              onClick={onCreateAccount}
              className={`executive-card group cursor-pointer p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark
                  ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/30'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              style={{ animationDelay: `${0.4 + accounts.length * 0.1}s` }}
            >
              <div className="flex flex-col items-center justify-center py-8">
                <Plus
                  className={`h-12 w-12 mb-4 ${
                    isDark ? 'text-slate-600' : 'text-slate-400'
                  } group-hover:text-blue-500 transition-colors duration-300`}
                />
                <span
                  className={`text-lg font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  } group-hover:text-blue-600 transition-colors duration-300`}
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
