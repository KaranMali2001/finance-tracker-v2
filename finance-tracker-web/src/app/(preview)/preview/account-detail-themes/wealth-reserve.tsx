'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function WealthReserveAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
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

        .wealth-detail {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .wealth-detail::before {
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

        .wealth-detail:hover::before {
          opacity: 1;
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

        .wealth-detail:hover .gold-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .info-value {
          transition: all 0.3s ease;
        }

        .wealth-detail:hover .info-value {
          color: rgb(217, 179, 100);
        }
      `}</style>

      <div className="wealth-reserve min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-4xl font-bold tracking-tight ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent'
                    : 'text-stone-900'
                }`}
              >
                {account.account_name}
              </h1>
              {account.is_primary && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    isDark
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  Primary
                </span>
              )}
            </div>
            <p className={`text-base font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              View and update account information
            </p>
          </div>

          {/* Account Information Card */}
          <div
            className={`wealth-detail border ${
              isDark
                ? 'bg-stone-900/50 border-stone-800 backdrop-blur-sm'
                : 'bg-white border-stone-200'
            } rounded-xl p-8`}
          >
            <div className="gold-shimmer absolute inset-0 rounded-xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  Account Information
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onEdit}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white'
                        : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white'
                    } hover:shadow-lg hover:shadow-amber-500/30`}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-red-900 hover:bg-red-800 text-red-200 border border-red-800'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } hover:shadow-lg hover:shadow-red-500/30`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Account Name
                  </label>
                  <div
                    className={`info-value text-base font-bold ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {account.account_name}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Account Type
                  </label>
                  <div
                    className={`info-value flex items-center gap-2 text-base font-bold ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    <CreditCard
                      className={`h-4 w-4 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}
                    />
                    {account.account_type || '—'}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Account Number
                  </label>
                  <div
                    className={`info-value text-base font-mono ${
                      isDark ? 'text-stone-300' : 'text-stone-700'
                    }`}
                  >
                    {account.account_number || '—'}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Bank
                  </label>
                  <div
                    className={`info-value flex items-center gap-2 text-base font-bold ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    <Building2
                      className={`h-4 w-4 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}
                    />
                    {account.bank?.name || '—'}
                    {account.bank?.code && (
                      <span
                        className={`text-sm font-normal ${isDark ? 'text-stone-500' : 'text-stone-500'}`}
                      >
                        Code: {account.bank.code}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Current Balance
                  </label>
                  <div
                    className={`info-value text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {formatRupees(account.current_balence || 0)}
                  </div>
                </div>

                <div>
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}
                  >
                    Primary Account
                  </label>
                  <div className="info-value flex items-center gap-2">
                    {account.is_primary ? (
                      <>
                        <CheckCircle
                          className={`h-5 w-5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`}
                          style={{ animation: 'glow 2s ease-in-out infinite' }}
                        />
                        <span
                          className={`text-base font-bold ${
                            isDark ? 'text-amber-400' : 'text-amber-600'
                          }`}
                        >
                          This is your primary account
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-base font-medium ${
                          isDark ? 'text-stone-500' : 'text-stone-600'
                        }`}
                      >
                        Not primary
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`h-1 mt-8 rounded-full ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-700 to-yellow-700'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
