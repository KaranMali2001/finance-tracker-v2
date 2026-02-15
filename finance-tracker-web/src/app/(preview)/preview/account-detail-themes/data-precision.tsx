'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function DataPrecisionAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
  return (
    <div className={`min-h-screen w-full font-mono ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

        .data-precision {
          font-family: 'IBM Plex Mono', 'Courier New', monospace;
        }

        @keyframes terminal-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes matrix-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        .terminal-cursor {
          animation: terminal-blink 1s ease-in-out infinite;
        }

        .grid-overlay {
          background-image:
            linear-gradient(${isDark ? 'rgba(0,255,0,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(0,255,0,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .data-row {
          transition: all 0.15s ease;
          position: relative;
        }

        .data-row::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgb(0, 255, 0), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .data-row:hover::after {
          opacity: 0.3;
        }

        .data-row:hover {
          background: ${isDark ? 'rgba(0, 255, 0, 0.03)' : 'rgba(0, 0, 0, 0.02)'} !important;
        }
      `}</style>

      <div className="data-precision">
        {/* Fixed header bar */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 border-b ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50/95 border-slate-200'
          } backdrop-blur-sm`}
        >
          <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Wallet className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span
                className={`text-sm font-semibold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                ACCOUNT.VIEW
              </span>
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-8 pt-20 pb-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h1
                className={`text-2xl font-semibold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {account.account_name}
              </h1>
              {account.is_primary && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider ${
                    isDark
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}
                >
                  PRIMARY
                </span>
              )}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              View and update account information
            </p>
          </div>

          {/* Account Information Card */}
          <div
            className={`border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } overflow-hidden`}
          >
            {/* Card Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <div
                className={`text-[10px] font-semibold tracking-widest ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                ACCOUNT_INFORMATION
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onEdit}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium tracking-wider border transition-all duration-200 ${
                    isDark
                      ? 'border-slate-700 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 hover:border-blue-500'
                      : 'border-slate-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 hover:border-blue-400'
                  }`}
                >
                  <Edit className="h-3 w-3" />
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium tracking-wider border transition-all duration-200 ${
                    isDark
                      ? 'border-slate-700 hover:bg-red-500/10 text-slate-400 hover:text-red-400 hover:border-red-500'
                      : 'border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-400'
                  }`}
                >
                  <Trash2 className="h-3 w-3" />
                  DELETE
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    ACCOUNT_NAME
                  </label>
                  <div
                    className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                  >
                    {account.account_name}
                  </div>
                </div>

                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    ACCOUNT_TYPE
                  </label>
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <CreditCard
                      className={`h-3 w-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    />
                    {account.account_type || '—'}
                  </div>
                </div>

                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    ACCOUNT_NUMBER
                  </label>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {account.account_number || '—'}
                  </div>
                </div>

                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    BANK
                  </label>
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <Building2
                      className={`h-3 w-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    />
                    {account.bank?.name || '—'}
                    {account.bank?.code && (
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        Code: {account.bank.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    CURRENT_BALANCE
                  </label>
                  <div
                    className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                  >
                    {formatRupees(account.current_balence || 0)}
                  </div>
                </div>

                <div className="data-row py-3">
                  <label
                    className={`text-[10px] font-medium tracking-widest mb-2 block ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    PRIMARY_ACCOUNT
                  </label>
                  <div className="flex items-center gap-2">
                    {account.is_primary ? (
                      <>
                        <CheckCircle
                          className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`}
                        >
                          This is your primary account
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          isDark ? 'text-slate-500' : 'text-slate-600'
                        }`}
                      >
                        Not primary
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid overlay */}
        <div className="grid-overlay fixed inset-0 pointer-events-none opacity-40" />
      </div>
    </div>
  );
}
