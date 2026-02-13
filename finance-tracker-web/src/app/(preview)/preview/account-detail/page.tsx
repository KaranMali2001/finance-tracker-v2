'use client';

import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useAuth } from '@clerk/nextjs';
import { Check, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import CapitalTrustAccountDetailTheme from '../account-detail-themes/capital-trust';
import DataPrecisionAccountDetailTheme from '../account-detail-themes/data-precision';
import ExecutivePortfolioAccountDetailTheme from '../account-detail-themes/executive-portfolio';
import MidnightProAccountDetailTheme from '../account-detail-themes/midnight-pro';
import ProsperityHubAccountDetailTheme from '../account-detail-themes/prosperity-hub';
import WealthReserveAccountDetailTheme from '../account-detail-themes/wealth-reserve';

type ThemeId =
  | 'midnight-pro'
  | 'data-precision'
  | 'executive-portfolio'
  | 'wealth-reserve'
  | 'capital-trust'
  | 'prosperity-hub';

interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  component: typeof MidnightProAccountDetailTheme;
}

const THEMES: ThemeOption[] = [
  {
    id: 'midnight-pro',
    name: 'Midnight Pro',
    description: 'Dark elegance with neon accents',
    component: MidnightProAccountDetailTheme,
  },
  {
    id: 'data-precision',
    name: 'Data Precision',
    description: 'Bloomberg Terminal inspired',
    component: DataPrecisionAccountDetailTheme,
  },
  {
    id: 'executive-portfolio',
    name: 'Executive Portfolio',
    description: 'Professional navy/blue theme',
    component: ExecutivePortfolioAccountDetailTheme,
  },
  {
    id: 'wealth-reserve',
    name: 'Wealth Reserve',
    description: 'Elegant gold & brown luxury',
    component: WealthReserveAccountDetailTheme,
  },
  {
    id: 'capital-trust',
    name: 'Capital Trust',
    description: 'Growth-focused emerald theme',
    component: CapitalTrustAccountDetailTheme,
  },
  {
    id: 'prosperity-hub',
    name: 'Prosperity Hub',
    description: 'Multi-tone professional dashboard',
    component: ProsperityHubAccountDetailTheme,
  },
];

export default function AccountDetailPreviewPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('midnight-pro');
  const [isDark, setIsDark] = useState(true);

  // Use first account or primary account for demo
  const demoAccount = accounts?.find((acc) => acc.is_primary) || accounts?.[0];

  const handleEdit = () => {
    alert('Edit functionality would be implemented here');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this account?')) {
      alert('Delete functionality would be implemented here');
    }
  };

  // Loading state
  if (!isLoaded || accountsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white text-sm font-medium">Loading account details...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold text-white mb-3">Authentication Required</h1>
          <p className="text-slate-400 mb-6">Please sign in to view the account detail preview.</p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // No accounts
  if (!accounts || accounts.length === 0 || !demoAccount) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold text-white mb-3">No Accounts Found</h1>
          <p className="text-slate-400 mb-6">
            Create your first account to see the detail page preview.
          </p>
          <a
            href="/dashboard/accounts"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    );
  }

  // Get selected theme component
  const SelectedThemeComponent =
    THEMES.find((t) => t.id === selectedTheme)?.component || MidnightProAccountDetailTheme;

  return (
    <div className="relative min-h-screen">
      {/* Floating Theme Selector - Top Right */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={`group relative p-3 rounded-full backdrop-blur-xl border transition-all duration-300 hover:scale-110 ${
            isDark
              ? 'bg-white/10 border-white/20 hover:bg-white/20'
              : 'bg-slate-900/10 border-slate-900/20 hover:bg-slate-900/20'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-yellow-400" strokeWidth={2} />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" strokeWidth={2} />
          )}
        </button>

        {/* Theme Selector Dropdown */}
        <div
          className={`backdrop-blur-xl rounded-2xl border shadow-2xl transition-all duration-300 ${
            isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/80 border-slate-200'
          }`}
        >
          <div className="p-3">
            <p
              className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Select Theme
            </p>
            <div className="space-y-1.5">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`w-full flex items-center justify-between gap-4 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-500/20 border border-indigo-400/30'
                          : 'bg-indigo-50 border border-indigo-200'
                        : isDark
                          ? 'hover:bg-white/5 border border-transparent'
                          : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isSelected
                            ? isDark
                              ? 'text-indigo-300'
                              : 'text-indigo-700'
                            : isDark
                              ? 'text-white'
                              : 'text-slate-900'
                        }`}
                      >
                        {theme.name}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {theme.description}
                      </p>
                    </div>
                    {isSelected && (
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          isDark ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preview */}
      <SelectedThemeComponent
        account={demoAccount}
        isDark={isDark}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
