import { describe, it, expect } from 'vitest';
import {
  calculateNetWorth,
  calculateMonthlyCashFlow,
  calculateCategoryBreakdown,
  calculateBudgetPacing,
  detectRecurringSubscriptions,
  formatCurrency,
} from '../src/lib/financialMath';
import type { Account, Transaction, Budget } from '../src/types/finance';

describe('FinancialMath Engine', () => {
  const mockAccounts: Account[] = [
    {
      id: 'chk',
      name: 'Checking',
      type: 'checking',
      institution: 'Bank A',
      balance: 10000,
      currency: 'USD',
      lastUpdated: '2026-10-01',
    },
    {
      id: 'sav',
      name: 'Savings',
      type: 'savings',
      institution: 'Bank B',
      balance: 25000,
      currency: 'USD',
      lastUpdated: '2026-10-01',
    },
    {
      id: 'inv',
      name: 'Investments',
      type: 'investment',
      institution: 'Brokerage C',
      balance: 50000,
      currency: 'USD',
      lastUpdated: '2026-10-01',
    },
    {
      id: 'crd',
      name: 'Credit Card',
      type: 'credit',
      institution: 'Card D',
      balance: 2000,
      currency: 'USD',
      lastUpdated: '2026-10-01',
    },
  ];

  it('calculates net worth correctly (Assets - Liabilities)', () => {
    // 10000 + 25000 + 50000 - 2000 = 83000
    const netWorth = calculateNetWorth(mockAccounts);
    expect(netWorth).toBe(83000);
  });

  it('formats currency with positive, negative, and decimal controls', () => {
    expect(formatCurrency(1250.5)).toBe('$1,250.50');
    expect(formatCurrency(-42.1)).toBe('-$42.10');
    expect(formatCurrency(500, false)).toBe('$500');
  });

  const mockTransactions: Transaction[] = [
    {
      id: 't1',
      accountId: 'chk',
      amount: 4000,
      date: '2026-10-01',
      payee: 'Employer Payroll',
      category: 'income',
    },
    {
      id: 't2',
      accountId: 'chk',
      amount: -1500,
      date: '2026-10-02',
      payee: 'Rent Corp',
      category: 'housing',
      isRecurring: true,
    },
    {
      id: 't3',
      accountId: 'crd',
      amount: -250,
      date: '2026-10-05',
      payee: 'Market Groceries',
      category: 'groceries',
    },
    {
      id: 't4',
      accountId: 'crd',
      amount: -50,
      date: '2026-10-08',
      payee: 'Blue Bottle',
      category: 'dining',
    },
  ];

  it('calculates monthly cash flow and savings rate', () => {
    const flow = calculateMonthlyCashFlow(mockTransactions, '2026-10');
    expect(flow.income).toBe(4000);
    expect(flow.expenses).toBe(1800); // 1500 + 250 + 50
    expect(flow.netSavings).toBe(2200); // 4000 - 1800
    expect(flow.savingsRate).toBe(55); // (2200 / 4000) * 100 = 55%
  });

  it('aggregates category breakdown sorted by spend descending', () => {
    const breakdown = calculateCategoryBreakdown(mockTransactions, '2026-10');
    expect(breakdown.length).toBe(3);
    expect(breakdown[0].category).toBe('housing');
    expect(breakdown[0].totalSpent).toBe(1500);
    expect(breakdown[1].category).toBe('groceries');
    expect(breakdown[1].totalSpent).toBe(250);
  });

  it('computes budget pacing velocity accurately', () => {
    const mockBudgets: Budget[] = [
      { category: 'housing', monthlyLimit: 2000 },
      { category: 'groceries', monthlyLimit: 400 },
    ];

    // Reference date: Oct 10 (day 10 of 31 days in October)
    const refDate = new Date(2026, 9, 10); // month 9 is October (0-indexed)
    const pacing = calculateBudgetPacing(mockBudgets, mockTransactions, '2026-10', refDate);

    const housingPacing = pacing.find((p) => p.category === 'housing')!;
    expect(housingPacing.spent).toBe(1500);
    expect(housingPacing.remaining).toBe(500);
    expect(housingPacing.dailyBurnRate).toBe(150); // 1500 / 10 days
    expect(housingPacing.projectedMonthEnd).toBe(4650); // 150 * 31 days
    expect(housingPacing.status).toBe('exceeded'); // projected > limit * 1.15

    const groceriesPacing = pacing.find((p) => p.category === 'groceries')!;
    expect(groceriesPacing.spent).toBe(250);
    expect(groceriesPacing.dailyBurnRate).toBe(25); // 250 / 10 days
    expect(groceriesPacing.projectedMonthEnd).toBe(775); // 25 * 31 days
    expect(groceriesPacing.status).toBe('exceeded');
  });

  it('detects recurring transactions', () => {
    const recurring = detectRecurringSubscriptions(mockTransactions);
    expect(recurring.length).toBe(1);
    expect(recurring[0].payee).toBe('Rent Corp');
    expect(recurring[0].amount).toBe(1500);
  });
});
