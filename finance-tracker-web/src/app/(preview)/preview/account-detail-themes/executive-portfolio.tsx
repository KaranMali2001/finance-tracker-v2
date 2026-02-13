'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function ExecutivePortfolioAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
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

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .executive-detail {
          animation: fade-in 0.5s ease-out forwards;
        }

        .card-accent {
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          width: 0;
        }

        .executive-detail:hover .card-accent {
          width: 100%;
        }

        .info-label {
          transition: all 0.3s ease;
        }

        .info-value {
          transition: all 0.3s ease;
        }

        .info-row:hover .info-label {
          color: rgb(59, 130, 246);
        }
      `}</style>

      <div className="executive-portfolio min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-4xl font-semibold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {account.account_name}
              </h1>
              {account.is_primary && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    isDark
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                >
                  Primary
                </span>
              )}
            </div>
            <p className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              View and update account information
            </p>
          </div>

          {/* Account Information Card */}
          <div
            className={`executive-detail border ${
              isDark
                ? 'bg-slate-800/50 border-slate-700 backdrop-blur-sm'
                : 'bg-white border-slate-200'
            } rounded-xl p-8`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Account Information
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onEdit}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } hover:shadow-lg hover:shadow-blue-500/30`}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-red-600 hover:bg-red-500 text-white'
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
                  className={`info-label text-sm font-medium mb-2 block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Account Name
                </label>
                <div
                  className={`info-value text-base font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {account.account_name}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`info-label text-sm font-medium mb-2 block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Account Type
                </label>
                <div
                  className={`info-value flex items-center gap-2 text-base font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <CreditCard className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  {account.account_type || '—'}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`info-label text-sm font-medium mb-2 block ${
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
                  className={`info-label text-sm font-medium mb-2 block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Bank
                </label>
                <div
                  className={`info-value flex items-center gap-2 text-base font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Building2 className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
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
                  className={`info-label text-sm font-medium mb-2 block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Current Balance
                </label>
                <div
                  className={`info-value text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatRupees(account.current_balence || 0)}
                </div>
              </div>

              <div className="info-row">
                <label
                  className={`info-label text-sm font-medium mb-2 block ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Primary Account
                </label>
                <div className="info-value flex items-center gap-2">
                  {account.is_primary ? (
                    <>
                      <CheckCircle
                        className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                      />
                      <span
                        className={`text-base font-medium ${
                          isDark ? 'text-green-400' : 'text-green-600'
                        }`}
                      >
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
              className={`card-accent h-1 mt-6 rounded-full ${
                isDark
                  ? 'bg-gradient-to-r from-blue-500 to-sky-500'
                  : 'bg-gradient-to-r from-blue-600 to-sky-600'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
