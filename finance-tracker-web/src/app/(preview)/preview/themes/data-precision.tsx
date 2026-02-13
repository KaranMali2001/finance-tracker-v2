'use client';

import { Activity, Database, TrendingDown, TrendingUp } from 'lucide-react';
import type { ThemeProps } from './types';

const formatRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function DataPrecisionTheme({ accounts, isDark, onCreateAccount }: ThemeProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balence || 0), 0);
  const activeAccounts = accounts.filter((acc) => acc.is_active).length;
  const primaryAccount = accounts.find((acc) => acc.is_primary);

  // Calculate change metrics (mock for now - would be real delta in production)
  const balanceChange = 2.34;

  return (
    <div className={`min-h-screen w-full font-mono ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

        .data-precision {
          font-family: 'IBM Plex Mono', 'Courier New', monospace;
        }

        @keyframes ticker-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes delta-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .metric-card {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .metric-card:hover::before {
          opacity: 1;
        }

        .metric-card:hover {
          transform: translateY(-1px);
        }

        .metric-card:hover .metric-value {
          color: rgb(59, 130, 246);
        }

        .account-row {
          transition: all 0.15s ease;
          position: relative;
        }

        .account-row::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgb(59, 130, 246), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .account-row:hover::after {
          opacity: 0.5;
        }

        .account-row:hover {
          background: ${isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'} !important;
        }

        .delta-indicator {
          transition: transform 0.3s ease;
        }

        .account-row:hover .delta-indicator {
          animation: delta-pulse 1s ease infinite;
        }

        .status-dot {
          transition: all 0.3s ease;
        }

        .account-row:hover .status-dot {
          box-shadow: 0 0 12px currentColor;
        }

        .grid-overlay {
          background-image:
            linear-gradient(${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="data-precision">
        {/* Fixed header bar */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 border-b ${
            isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50/95 border-slate-200'
          } backdrop-blur-sm`}
        >
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Database className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span
                  className={`text-sm font-semibold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  FINTRACK.TERMINAL
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
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <Activity className="h-3 w-3" />
                <span>LIVE</span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-500"
                  style={{ animation: 'ticker-flash 2s ease-in-out infinite' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-[1600px] mx-auto px-6 pt-20 pb-12">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {/* Total Balance */}
            <div
              className={`metric-card border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`text-[10px] font-medium tracking-widest ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  TOTAL_BALANCE
                </div>
                <div className="flex items-center gap-1 text-xs delta-indicator">
                  {balanceChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      balanceChange >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {balanceChange >= 0 ? '+' : ''}
                    {balanceChange}%
                  </span>
                </div>
              </div>
              <div
                className={`metric-value text-3xl font-semibold tracking-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {formatRupees(totalBalance)}
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                across {accounts.length} accounts
              </div>
            </div>

            {/* Active Accounts */}
            <div
              className={`metric-card border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } p-6`}
            >
              <div
                className={`text-[10px] font-medium tracking-widest mb-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                ACTIVE_ACCOUNTS
              </div>
              <div
                className={`metric-value text-3xl font-semibold tracking-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {activeAccounts}
                <span className={`text-lg ml-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  / {accounts.length}
                </span>
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {((activeAccounts / accounts.length) * 100).toFixed(1)}% active rate
              </div>
            </div>

            {/* Primary Account */}
            <div
              className={`metric-card border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } p-6 col-span-2`}
            >
              <div
                className={`text-[10px] font-medium tracking-widest mb-4 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                PRIMARY_ACCOUNT
              </div>
              <div
                className={`metric-value text-xl font-medium tracking-tight transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {primaryAccount?.account_name || '—'}
              </div>
              <div className={`mt-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                {primaryAccount
                  ? `${formatRupees(primaryAccount.current_balence || 0)} · ${primaryAccount.bank?.name || 'No bank'}`
                  : 'No primary account set'}
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          <div
            className={`border overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Table Header */}
            <div
              className={`grid grid-cols-12 gap-4 px-6 py-3 border-b text-[10px] font-semibold tracking-widest ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-500'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              <div className="col-span-1">STATUS</div>
              <div className="col-span-3">ACCOUNT_NAME</div>
              <div className="col-span-2">ACCOUNT_TYPE</div>
              <div className="col-span-2">BANK</div>
              <div className="col-span-2">ACCOUNT_NUMBER</div>
              <div className="col-span-2 text-right">BALANCE</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800 dark:divide-slate-800">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className={`account-row grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                  style={{
                    animationDelay: `${index * 0.03}s`,
                  }}
                >
                  {/* Status */}
                  <div className="col-span-1 flex items-center gap-2">
                    <div
                      className={`status-dot w-2 h-2 rounded-full ${
                        account.is_active ? 'bg-green-500' : 'bg-slate-600'
                      }`}
                    />
                    {account.is_primary && (
                      <div
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        PRI
                      </div>
                    )}
                  </div>

                  {/* Account Name */}
                  <div
                    className={`col-span-3 text-sm font-medium ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {account.account_name}
                  </div>

                  {/* Account Type */}
                  <div
                    className={`col-span-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {account.account_type || '—'}
                  </div>

                  {/* Bank */}
                  <div
                    className={`col-span-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {account.bank?.name || '—'}
                  </div>

                  {/* Account Number */}
                  <div
                    className={`col-span-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                  >
                    {account.account_number || '—'}
                  </div>

                  {/* Balance */}
                  <div
                    className={`col-span-2 text-right text-base font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatRupees(account.current_balence || 0)}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Account Row */}
            <button
              type="button"
              onClick={onCreateAccount}
              className={`w-full px-6 py-4 flex items-center gap-3 text-left border-t transition-all duration-200 ${
                isDark
                  ? 'border-slate-800 hover:bg-blue-500/10 text-slate-500 hover:text-blue-400'
                  : 'border-slate-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600'
              }`}
            >
              <div className="text-sm font-medium tracking-wider">+ ADD_NEW_ACCOUNT</div>
            </button>
          </div>
        </div>

        {/* Grid overlay */}
        <div className="grid-overlay fixed inset-0 pointer-events-none opacity-40" />
      </div>
    </div>
  );
}
