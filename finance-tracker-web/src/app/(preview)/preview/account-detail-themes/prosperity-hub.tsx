'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function ProsperityHubAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
  // Determine accent color based on account id or random
  const accentColors = [
    {
      gradient: 'from-orange-500 to-amber-500',
      text: 'text-orange-500',
      border: 'border-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      gradient: 'from-blue-500 to-cyan-500',
      text: 'text-blue-500',
      border: 'border-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      gradient: 'from-emerald-500 to-teal-500',
      text: 'text-emerald-500',
      border: 'border-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      gradient: 'from-violet-500 to-purple-500',
      text: 'text-violet-500',
      border: 'border-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      gradient: 'from-pink-500 to-rose-500',
      text: 'text-pink-500',
      border: 'border-pink-500',
      bg: 'bg-pink-500/10',
    },
  ];

  // Use account id hash to determine accent color
  const getColorIndex = (id?: string) => {
    if (!id) return 0;
    // Simple hash function for consistent color selection
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % accentColors.length;
  };

  const accent = accentColors[getColorIndex(account.id)];

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
            transform: translateY(20px);
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

        .hub-detail {
          animation: float-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-detail:hover {
          transform: translateY(-2px);
        }

        .accent-line {
          transform-origin: left;
          transform: scaleX(0);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-detail:hover .accent-line {
          transform: scaleX(1);
        }

        .info-value {
          transition: all 0.3s ease;
        }

        .info-row:hover .info-value {
          transform: scale(1.02);
        }

        .gradient-border {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>

      <div className="prosperity-hub min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-4xl font-bold tracking-tight ${
                  isDark
                    ? 'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent'
                    : 'text-slate-900'
                }`}
              >
                {account.account_name}
              </h1>
              {account.is_primary && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                    isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  Primary
                </span>
              )}
            </div>
            <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              View and update account information
            </p>
          </div>

          {/* Account Information Card */}
          <div
            className={`hub-detail border-2 ${
              isDark
                ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm'
                : 'bg-white border-slate-200 shadow-sm'
            } rounded-xl overflow-hidden`}
          >
            {/* Top accent bar */}
            <div className={`accent-line h-1 bg-gradient-to-r ${accent.gradient}`} />

            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${accent.bg} border ${accent.border}`}>
                    <Wallet className={`h-5 w-5 ${accent.text}`} />
                  </div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Account Information
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onEdit}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                      isDark
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white'
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white'
                    } hover:shadow-lg hover:shadow-orange-500/30`}
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
                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Account Name
                  </label>
                  <div
                    className={`info-value text-base font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {account.account_name}
                  </div>
                </div>

                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Account Type
                  </label>
                  <div
                    className={`info-value flex items-center gap-2 text-base font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <CreditCard className={`h-4 w-4 ${accent.text}`} />
                    {account.account_type || '—'}
                  </div>
                </div>

                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Account Number
                  </label>
                  <div
                    className={`info-value text-base font-mono ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {account.account_number || '—'}
                  </div>
                </div>

                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Bank
                  </label>
                  <div
                    className={`info-value flex items-center gap-2 text-base font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <Building2 className={`h-4 w-4 ${accent.text}`} />
                    {account.bank?.name || '—'}
                    {account.bank?.code && (
                      <span
                        className={`text-sm font-normal ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                      >
                        Code: {account.bank.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Current Balance
                  </label>
                  <div className={`info-value text-2xl font-bold ${accent.text}`}>
                    {formatRupees(account.current_balence || 0)}
                  </div>
                </div>

                <div className="info-row">
                  <label
                    className={`text-sm font-semibold mb-2 block ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Primary Account
                  </label>
                  <div className="info-value flex items-center gap-2">
                    {account.is_primary ? (
                      <>
                        <CheckCircle
                          className={`h-5 w-5 ${accent.text}`}
                          style={{ animation: 'pulse-subtle 2s ease-in-out infinite' }}
                        />
                        <span className={`text-base font-bold ${accent.text}`}>
                          This is your primary account
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-base font-medium ${
                          isDark ? 'text-slate-500' : 'text-slate-600'
                        }`}
                      >
                        Not primary
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`accent-line h-1 mt-8 rounded-full bg-gradient-to-r ${accent.gradient}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
