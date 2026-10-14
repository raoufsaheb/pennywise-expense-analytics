import type {
  Account,
  Transaction,
  Budget,
  MonthlyCashFlow,
  CategorySummary,
  BudgetPacing,
  RecurringSubscription,
  ExpenseCategory,
} from '../types/finance';

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: '#0D5C3A', // Viridian Emerald
  groceries: '#10B981', // Mint Emerald
  dining: '#F59E0B', // Amber
  utilities: '#0284C7', // Sky Blue
  software: '#6366F1', // Indigo
  transit: '#8B5CF6', // Purple
  health: '#EC4899', // Pink
  entertainment: '#14B8A6', // Teal
  income: '#059669', // Dark Emerald
  other: '#6B7280', // Slate Grey
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing & Rent',
  groceries: 'Groceries & Market',
  dining: 'Dining & Cafes',
  utilities: 'Utilities & Bills',
  software: 'Software & Subscriptions',
  transit: 'Transit & Fuel',
  health: 'Health & Wellness',
  entertainment: 'Entertainment & Leisure',
  income: 'Income & Deposits',
  other: 'General & Miscellaneous',
};

/**
 * Calculates total net worth: Sum of Assets minus Sum of Liabilities (Credit Cards).
 */
export function calculateNetWorth(accounts: Account[]): number {
  return accounts.reduce((total, acc) => {
    if (acc.type === 'credit') {
      return total - Math.abs(acc.balance);
    }
    return total + acc.balance;
  }, 0);
}

/**
 * Formats a numeric value into USD currency representation.
 */
export function formatCurrency(amount: number, showDecimals = true): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Computes income, expenses, net savings, and savings rate percentage for a given month (YYYY-MM).
 */
export function calculateMonthlyCashFlow(
  transactions: Transaction[],
  targetMonth: string
): { income: number; expenses: number; netSavings: number; savingsRate: number } {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(targetMonth));

  let income = 0;
  let expenses = 0;

  for (const t of monthTransactions) {
    if (t.amount > 0) {
      income += t.amount;
    } else {
      expenses += Math.abs(t.amount);
    }
  }

  const netSavings = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

  return {
    income: Number(income.toFixed(2)),
    expenses: Number(expenses.toFixed(2)),
    netSavings: Number(netSavings.toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(1)),
  };
}

/**
 * Generates an array of historical monthly cash flows across specified YYYY-MM months.
 */
export function calculateMultiMonthCashFlow(
  transactions: Transaction[],
  months: string[]
): MonthlyCashFlow[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return months.map((monthKey) => {
    const [year, monthNum] = monthKey.split('-');
    const label = `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`;
    const flow = calculateMonthlyCashFlow(transactions, monthKey);

    return {
      month: monthKey,
      monthLabel: label,
      ...flow,
    };
  });
}

/**
 * Aggregates category breakdown for expenses in a target month.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  targetMonth: string
): CategorySummary[] {
  const monthExpenses = transactions.filter(
    (t) => t.date.startsWith(targetMonth) && t.amount < 0 && t.category !== 'income'
  );

  const totalsByCategory: Partial<Record<ExpenseCategory, { total: number; count: number }>> = {};
  let overallExpenses = 0;

  for (const t of monthExpenses) {
    const abs = Math.abs(t.amount);
    overallExpenses += abs;

    if (!totalsByCategory[t.category]) {
      totalsByCategory[t.category] = { total: 0, count: 0 };
    }
    const cur = totalsByCategory[t.category]!;
    cur.total += abs;
    cur.count += 1;
  }

  const summaries: CategorySummary[] = Object.entries(totalsByCategory).map(
    ([categoryKey, data]) => {
      const category = categoryKey as ExpenseCategory;
      const percentage = overallExpenses > 0 ? (data.total / overallExpenses) * 100 : 0;
      return {
        category,
        totalSpent: Number(data.total.toFixed(2)),
        percentage: Number(percentage.toFixed(1)),
        transactionCount: data.count,
        color: CATEGORY_COLORS[category] || '#6B7280',
      };
    }
  );

  return summaries.sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Computes budget velocity and projected month-end spend.
 */
export function calculateBudgetPacing(
  budgets: Budget[],
  transactions: Transaction[],
  targetMonth: string,
  referenceDate = new Date()
): BudgetPacing[] {
  const [targetYear, targetMonthNum] = targetMonth.split('-').map(Number);

  // Total days in target month
  const totalDays = new Date(targetYear, targetMonthNum, 0).getDate();

  // Elapsed days
  const isCurrentMonth =
    referenceDate.getFullYear() === targetYear &&
    referenceDate.getMonth() + 1 === targetMonthNum;

  const elapsedDays = isCurrentMonth
    ? Math.max(1, Math.min(referenceDate.getDate(), totalDays))
    : totalDays;

  const dayOfMonthPercentage = Number(((elapsedDays / totalDays) * 100).toFixed(1));

  // Compute spend per category
  const monthExpenses = transactions.filter(
    (t) => t.date.startsWith(targetMonth) && t.amount < 0
  );

  return budgets.map((b) => {
    const spent = monthExpenses
      .filter((t) => t.category === b.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const remaining = Math.max(0, b.monthlyLimit - spent);
    const spentPercentage = Number(((spent / b.monthlyLimit) * 100).toFixed(1));

    const dailyBurnRate = Number((spent / elapsedDays).toFixed(2));
    const projectedMonthEnd = Number((dailyBurnRate * totalDays).toFixed(2));

    let status: 'on-track' | 'warning' | 'exceeded' = 'on-track';
    if (spent >= b.monthlyLimit || projectedMonthEnd > b.monthlyLimit * 1.15) {
      status = 'exceeded';
    } else if (projectedMonthEnd > b.monthlyLimit) {
      status = 'warning';
    }

    return {
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      spentPercentage,
      dayOfMonthPercentage,
      dailyBurnRate,
      projectedMonthEnd,
      status,
    };
  });
}

/**
 * Identifies recurring transactions by grouping transactions by payee and detecting cadence.
 */
export function detectRecurringSubscriptions(
  transactions: Transaction[]
): RecurringSubscription[] {
  const recurringFlagged = transactions.filter((t) => t.isRecurring && t.amount < 0);
  const byPayee: Record<string, Transaction> = {};

  for (const t of recurringFlagged) {
    if (!byPayee[t.payee] || t.date > byPayee[t.payee].date) {
      byPayee[t.payee] = t;
    }
  }

  return Object.values(byPayee).map((t, idx) => {
    // Generate sensible next renewal date (30 days from transaction)
    const [y, m, d] = t.date.split('-').map(Number);
    const nextDate = new Date(y, m - 1 + 1, d);
    const nextRenewalDate = nextDate.toISOString().split('T')[0];

    return {
      id: `sub_${idx + 1}`,
      payee: t.payee,
      amount: Math.abs(t.amount),
      billingCycle: 'monthly',
      nextRenewalDate,
      category: t.category,
    };
  });
}
