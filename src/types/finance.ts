export type AccountType = 'checking' | 'savings' | 'investment' | 'credit';

export type ExpenseCategory =
  | 'housing'
  | 'groceries'
  | 'dining'
  | 'utilities'
  | 'software'
  | 'transit'
  | 'health'
  | 'entertainment'
  | 'income'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  balance: number; // positive for asset balances, positive liability for credit cards
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number; // Positive for income, negative for expenses
  date: string; // YYYY-MM-DD
  payee: string;
  category: ExpenseCategory;
  isRecurring?: boolean;
  notes?: string;
}

export interface Budget {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface RecurringSubscription {
  id: string;
  payee: string;
  amount: number; // Monthly cost
  billingCycle: 'monthly' | 'yearly';
  nextRenewalDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  icon?: string;
}

export interface MonthlyCashFlow {
  month: string; // YYYY-MM
  monthLabel: string; // e.g. "Sep 2026"
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number; // 0 to 100 percentage
}

export interface CategorySummary {
  category: ExpenseCategory;
  totalSpent: number;
  percentage: number; // 0 to 100
  transactionCount: number;
  color: string;
}

export interface BudgetPacing {
  category: ExpenseCategory;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  spentPercentage: number;
  dayOfMonthPercentage: number;
  dailyBurnRate: number;
  projectedMonthEnd: number;
  status: 'on-track' | 'warning' | 'exceeded';
}

export interface CSVImportRow {
  date: string;
  payee: string;
  amount: number;
  category: ExpenseCategory;
  accountId: string;
  rawString?: string;
}
