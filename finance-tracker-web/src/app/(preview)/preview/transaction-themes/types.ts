import type { Transaction } from '@/components/shared/types';
import type {
  internal_domain_account_Account,
  internal_domain_static_Categories,
  internal_domain_static_Merchants,
} from '@/generated/api';

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  merchantId?: string;
  type?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionThemeProps {
  transactions: Transaction[];
  isDark: boolean;
  filters: TransactionFilters;
  onFilterChange: (filters: TransactionFilters) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  accounts?: internal_domain_account_Account[];
  categories?: internal_domain_static_Categories[];
  merchants?: internal_domain_static_Merchants[];
}
