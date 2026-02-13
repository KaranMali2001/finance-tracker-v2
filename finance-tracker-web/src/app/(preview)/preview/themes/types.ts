import type { internal_domain_account_Account } from '@/generated/api';

export type Account = internal_domain_account_Account;

export interface ThemeProps {
  accounts: Account[];
  isDark: boolean;
  onCreateAccount: () => void;
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
}
