'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function CapitalTrustAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
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
            transform: scale(0.98);
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

        .capital-detail {
          animation: grow-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .capital-detail:hover {
          transform: scale(1.01);
        }

        .info-value {
          transition: all 0.3s ease;
        }

        .info-row:hover .info-value {
          color: rgb(16, 185, 129);
        }
      `}</style>

      <div className="capital-trust min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-4xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-emerald-950'
                }`}
              >
                {account.account_name}
              </h1>
              {account.is_primary && (
                <span
                  className={`px-3 py-1.5 rounded text-sm font-bold ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  Primary
                </span>
              )}
            </div>
            <p
              className={`text-base font-medium ${
                isDark ? 'text-emerald-300/70' : 'text-emerald-800/70'
              }`}
            >
              View and update account information
            </p>
          </div>

          {/* Account Information Card */}
          <div
            className={`capital-detail border ${
              isDark
                ? 'bg-emerald-900/30 border-emerald-800 backdrop-blur-sm'
                : 'bg-white border-emerald-200'
            } rounded-lg p-8`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                Account Information
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onEdit}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                    isDark
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } hover:shadow-lg hover:shadow-emerald-500/40`}
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
                  } hover:shadow-lg hover:shadow-red-500/40`}
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
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Account Name
                </label>
                <div
                  className={`info-value text-base font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {account.account_name}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`text-sm font-semibold mb-2 block ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Account Type
                </label>
                <div
                  className={`info-value flex items-center gap-2 text-base font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  <CreditCard
                    className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                  {account.account_type || '—'}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`text-sm font-semibold mb-2 block ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Account Number
                </label>
                <div
                  className={`info-value text-base font-mono ${
                    isDark ? 'text-emerald-300' : 'text-emerald-800'
                  }`}
                >
                  {account.account_number || '—'}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`text-sm font-semibold mb-2 block ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Bank
                </label>
                <div
                  className={`info-value flex items-center gap-2 text-base font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  <Building2
                    className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                  />
                  {account.bank?.name || '—'}
                  {account.bank?.code && (
                    <span
                      className={`text-sm font-normal ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}
                    >
                      Code: {account.bank.code}
                    </span>
                  )}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`text-sm font-semibold mb-2 block ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Current Balance
                </label>
                <div
                  className={`info-value text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {formatRupees(account.current_balence || 0)}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`text-sm font-semibold mb-2 block ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  Primary Account
                </label>
                <div className="info-value flex items-center gap-2">
                  {account.is_primary ? (
                    <>
                      <CheckCircle
                        className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                        style={{ animation: 'pulse-grow 2s ease-in-out infinite' }}
                      />
                      <span
                        className={`text-base font-bold ${
                          isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        This is your primary account
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-base font-medium ${
                        isDark ? 'text-emerald-600' : 'text-emerald-700'
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
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
