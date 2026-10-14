import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '../src/store/financeStore';

describe('FinanceStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useFinanceStore.getState().resetDemoData();
  });

  it('initializes with seed accounts, transactions, and budgets', () => {
    const state = useFinanceStore.getState();
    expect(state.accounts.length).toBe(4);
    expect(state.transactions.length).toBeGreaterThan(15);
    expect(state.budgets.length).toBe(8);
    expect(state.selectedMonth).toBe('2026-10');
  });

  it('adds a transaction and updates the associated account balance', () => {
    const initialChecking = useFinanceStore
      .getState()
      .accounts.find((a) => a.id === 'acc_checking')!.balance;

    useFinanceStore.getState().addTransaction({
      accountId: 'acc_checking',
      amount: -120.5,
      date: '2026-10-15',
      payee: 'Apple Store Repair',
      category: 'software',
    });

    const updatedChecking = useFinanceStore
      .getState()
      .accounts.find((a) => a.id === 'acc_checking')!.balance;

    expect(updatedChecking).toBe(Number((initialChecking - 120.5).toFixed(2)));
    expect(useFinanceStore.getState().transactions[0].payee).toBe('Apple Store Repair');
  });

  it('deletes a transaction and reverts account balance', () => {
    const initialChecking = useFinanceStore
      .getState()
      .accounts.find((a) => a.id === 'acc_checking')!.balance;

    useFinanceStore.getState().addTransaction({
      accountId: 'acc_checking',
      amount: 500,
      date: '2026-10-15',
      payee: 'Freelance Bonus',
      category: 'income',
    });

    const addedTxId = useFinanceStore.getState().transactions[0].id;
    useFinanceStore.getState().deleteTransaction(addedTxId);

    const revertedChecking = useFinanceStore
      .getState()
      .accounts.find((a) => a.id === 'acc_checking')!.balance;

    expect(revertedChecking).toBe(initialChecking);
  });

  it('updates budget limit for category', () => {
    useFinanceStore.getState().updateBudget('dining', 600);
    const updated = useFinanceStore
      .getState()
      .budgets.find((b) => b.category === 'dining')!;
    expect(updated.monthlyLimit).toBe(600);
  });

  it('deduplicates when importing CSV rows', () => {
    const initialCount = useFinanceStore.getState().transactions.length;

    // Row that already exists in seed data
    const existingRow = {
      date: '2026-10-01',
      payee: 'Mission Lofts Rent',
      amount: -2200.0,
      category: 'housing' as const,
      accountId: 'acc_checking',
    };

    // New unique row
    const newRow = {
      date: '2026-10-16',
      payee: 'Hardware Key Store',
      amount: -45.0,
      category: 'software' as const,
      accountId: 'acc_checking',
    };

    const importedCount = useFinanceStore
      .getState()
      .importTransactions([existingRow, newRow]);

    expect(importedCount).toBe(1);
    expect(useFinanceStore.getState().transactions.length).toBe(initialCount + 1);
  });
});
