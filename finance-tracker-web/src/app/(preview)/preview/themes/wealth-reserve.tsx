'use client';

import { Landmark, Plus, Shield } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function WealthReserveTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;

  return (
    <div
      className={`min-h-screen w-full ${
        isDark
          ? 'bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-950'
          : 'bg-gradient-to-br from-stone-50 via-amber-50/50 to-stone-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .wealth-reserve {
          font-family: 'DM Sans', -apple-system, sans-serif;
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .wealth-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .wealth-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(217, 179, 100, 0.4), transparent, rgba(217, 179, 100, 0.4));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .wealth-card:hover::before {
          opacity: 1;
        }

        .wealth-card:hover {
          transform: translateY(-2px);
        }

        .gold-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(217, 179, 100, 0.2),
            transparent
          );
          background-size: 200% 100%;
        }

        .wealth-card:hover .gold-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .balance-glow {
          transition: all 0.3s ease;
        }

        .wealth-card:hover .balance-glow {
          color: rgb(217, 179, 100);
          text-shadow: 0 0 20px rgba(217, 179, 100, 0.3);
        }
      `}</style>

      <div className="wealth-reserve min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Landmark className={`h-8 w-8 ${isDark ? 'text-amber-600' : 'text-amber-700'}`} />
                  <h1
                    className={`text-5xl font-bold tracking-tight ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent'
                        : 'text-stone-900'
                    }`}
                  >
                    Wealth Reserve
                  </h1>
                </div>
                <p
                  className={`text-base font-medium ${
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  }`}
                >
                  Preserving and growing your financial legacy
                </p>
              </div>

              <button
                type="button"
                onClick={onCreateAccount}
                className={`group flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white'
                } hover:shadow-lg hover:shadow-amber-500/30`}
              >
                <Plus className="h-5 w-5" />
                <span>New Account</span>
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div
                className={`wealth-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-stone-900/50 border-stone-800 backdrop-blur-sm'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="gold-shimmer absolute inset-0 rounded-xl" />
                <div className="relative">
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Total Reserve
                  </div>
                  <div
                    className={`balance-glow text-3xl font-bold mb-1 ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {formatRupees(totalBalance)}
                  </div>
                  <div
                    className={`h-1 w-20 rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`wealth-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-stone-900/50 border-stone-800 backdrop-blur-sm'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="gold-shimmer absolute inset-0 rounded-xl" />
                <div className="relative">
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Active Vaults
                  </div>
                  <div
                    className={`balance-glow text-3xl font-bold mb-1 ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {activeAccounts}
                    <span
                      className={`text-xl ml-2 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}
                    >
                      / {accounts.length}
                    </span>
                  </div>
                  <div
                    className={`h-1 w-20 rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`wealth-card p-6 rounded-xl border ${
                  isDark
                    ? 'bg-stone-900/50 border-stone-800 backdrop-blur-sm'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="gold-shimmer absolute inset-0 rounded-xl" />
                <div className="relative">
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Protection
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield
                      className={`h-6 w-6 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}
                      style={{ animation: 'glow 2s ease-in-out infinite' }}
                    />
                    <div
                      className={`balance-glow text-3xl font-bold ${
                        isDark ? 'text-white' : 'text-stone-900'
                      }`}
                    >
                      Secured
                    </div>
                  </div>
                  <div
                    className={`h-1 w-20 rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-600'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accounts Grid - 2 Column */}
          <div className="grid grid-cols-2 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`wealth-card group cursor-pointer p-6 rounded-xl border ${
                  isDark
                    ? 'bg-stone-900/50 border-stone-800 backdrop-blur-sm hover:bg-stone-900/70'
                    : 'bg-white border-stone-200 hover:shadow-lg'
                }`}
              >
                <div className="gold-shimmer absolute inset-0 rounded-xl" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          isDark
                            ? 'bg-gradient-to-br from-amber-700/20 to-yellow-700/20'
                            : 'bg-gradient-to-br from-amber-100 to-yellow-100'
                        }`}
                      >
                        <Landmark
                          className={`h-5 w-5 ${isDark ? 'text-amber-500' : 'text-amber-700'}`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${
                            isDark ? 'text-white' : 'text-stone-900'
                          }`}
                        >
                          {account.account_name}
                        </h3>
                        <p
                          className={`text-sm font-medium ${
                            isDark ? 'text-stone-400' : 'text-stone-600'
                          }`}
                        >
                          {account.account_type || 'Account'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {account.is_primary && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isDark
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          Primary
                        </span>
                      )}
                      {account.is_active && (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDark ? 'bg-amber-500' : 'bg-amber-600'
                          }`}
                          style={{ animation: 'glow 2s ease-in-out infinite' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        Institution
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isDark ? 'text-stone-300' : 'text-stone-700'
                        }`}
                      >
                        {account.bank?.name || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        Account Number
                      </span>
                      <span
                        className={`text-sm font-mono ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        {account.account_number || '—'}
                      </span>
                    </div>

                    <div
                      className={`pt-3 border-t ${
                        isDark ? 'border-stone-800' : 'border-stone-200'
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        Reserve Balance
                      </div>
                      <div
                        className={`balance-glow text-2xl font-bold ${
                          isDark ? 'text-white' : 'text-stone-900'
                        }`}
                      >
                        {formatRupees(account.current_balence || 0)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`h-1 mt-4 rounded-full ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-700 to-yellow-700'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                    }`}
                    style={{ width: '0%', transition: 'width 0.4s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.width = '100%';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.width = '0%';
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Add Account Card */}
            <button
              type="button"
              onClick={onCreateAccount}
              className={`wealth-card group cursor-pointer p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                isDark
                  ? 'border-stone-800 hover:border-amber-700 hover:bg-stone-900/30'
                  : 'border-stone-300 hover:border-amber-500 hover:bg-amber-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center py-8">
                <Plus
                  className={`h-12 w-12 mb-4 ${
                    isDark ? 'text-stone-600' : 'text-stone-400'
                  } group-hover:text-amber-600 transition-colors duration-300`}
                />
                <span
                  className={`text-lg font-bold ${
                    isDark ? 'text-stone-400' : 'text-stone-600'
                  } group-hover:text-amber-700 transition-colors duration-300`}
                >
                  Add New Vault
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
