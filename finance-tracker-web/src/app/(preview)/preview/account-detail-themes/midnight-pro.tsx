'use client';

import { Edit, Trash2, CheckCircle, Building2, CreditCard, Wallet } from 'lucide-react';
import type { AccountDetailThemeProps } from './types';
import { formatRupees } from '@/components/shared/utils/currency';

export default function MidnightProAccountDetail({
  account,
  isDark,
  onEdit,
  onDelete,
}: AccountDetailThemeProps) {
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
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.4); }
          50% { box-shadow: 0 0 30px rgba(96, 165, 250, 0.6); }
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

      <div className="relative z-10 max-w-4xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1
              className={`text-3xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {account.account_name?.toUpperCase()}
            </h1>
            {account.is_primary && (
              <span
                className={`px-3 py-1 rounded text-xs font-bold tracking-wider border ${
                  isDark
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-cyan-100 text-cyan-700 border-cyan-300'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                PRIMARY
              </span>
            )}
          </div>
          <p
            className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            View and update account information
          </p>
        </div>

        {/* Account Information Card */}
        <div
          className={`relative border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          } p-8`}
        >
          <div className="neon-line absolute inset-x-0 top-0 text-cyan-400" />

          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-xl font-bold tracking-wide ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ACCOUNT_INFORMATION
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-xs tracking-wider border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-900 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10 hover:shadow-lg hover:shadow-cyan-500/30'
                    : 'bg-slate-900 text-white border-slate-700 hover:border-cyan-600 hover:shadow-lg hover:shadow-cyan-600/20'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Edit className="h-3 w-3" />
                EDIT
              </button>
              <button
                type="button"
                onClick={onDelete}
                className={`flex items-center gap-2 px-4 py-2 font-bold text-xs tracking-wider border transition-all duration-300 ${
                  isDark
                    ? 'bg-slate-900 text-rose-400 border-rose-500/50 hover:bg-rose-500/10 hover:shadow-lg hover:shadow-rose-500/30'
                    : 'bg-red-600 text-white border-red-700 hover:bg-red-700 hover:shadow-lg'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <Trash2 className="h-3 w-3" />
                DELETE
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACCOUNT_NAME
              </label>
              <div
                className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {account.account_name}
              </div>
            </div>

            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACCOUNT_TYPE
              </label>
              <div
                className={`flex items-center gap-2 text-base font-medium ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <CreditCard className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                {account.account_type || '—'}
              </div>
            </div>

            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACCOUNT_NUMBER
              </label>
              <div
                className={`text-base font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
              >
                {account.account_number || '—'}
              </div>
            </div>

            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                BANK
              </label>
              <div
                className={`flex items-center gap-2 text-base font-medium ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <Building2
                  className={`h-4 w-4 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}
                />
                {account.bank?.name || '—'}
                {account.bank?.code && (
                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    Code: {account.bank.code}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                CURRENT_BALANCE
              </label>
              <div
                className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {formatRupees(account.current_balence || 0)}
              </div>
            </div>

            <div>
              <label
                className={`text-[10px] font-bold tracking-widest mb-2 block ${
                  isDark ? 'text-slate-500' : 'text-slate-500'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                PRIMARY_ACCOUNT
              </label>
              <div className="flex items-center gap-2">
                {account.is_primary ? (
                  <>
                    <CheckCircle
                      className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                    />
                    <span
                      className={`text-base font-medium ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      This is your primary account
                    </span>
                  </>
                ) : (
                  <span
                    className={`text-base font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-600'
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
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
  );
}
