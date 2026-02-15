import type { internal_domain_account_Account } from '@/generated/api';

export interface AccountDetailThemeProps {
  account: internal_domain_account_Account;
  isDark: boolean;
  onEdit: () => void;
  onDelete: () => void;
}
