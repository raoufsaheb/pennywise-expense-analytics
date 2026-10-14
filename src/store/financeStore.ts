import { create } from 'zustand';
import type {
  Account,
  Transaction,
  Budget,
  RecurringSubscription,
  ExpenseCategory,
  CSVImportRow,
} from '../types/finance';
import {
  SEED_ACCOUNTS,
  SEED_BUDGETS,
  SEED_SUBSCRIPTIONS,
  SEED_TRANSACTIONS,
} from '../data/seedData';

const STORAGE_KEY = 'pennywise_finance_v1';

interface PersistedState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: RecurringSubscription[];
}

function loadPersistedState(): PersistedState {
  if (typeof window === 'undefined') {
    return {
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      budgets: SEED_BUDGETS,
      subscriptions: SEED_SUBSCRIPTIONS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        accounts: SEED_ACCOUNTS,
        transactions: SEED_TRANSACTIONS,
        budgets: SEED_BUDGETS,
        subscriptions: SEED_SUBSCRIPTIONS,
      };
    }
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed.accounts) &&
      Array.isArray(parsed.transactions) &&
      Array.isArray(parsed.budgets)
    ) {
      return parsed;
    }
    return {
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      budgets: SEED_BUDGETS,
      subscriptions: SEED_SUBSCRIPTIONS,
    };
  } catch {
    return {
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      budgets: SEED_BUDGETS,
      subscriptions: SEED_SUBSCRIPTIONS,
    };
  }
}

function savePersistedState(state: PersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode
  }
}

export interface FinanceState {
  // Domain Data
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: RecurringSubscription[];

  // Navigation & Filtering
  selectedMonth: string; // 'YYYY-MM'
  availableMonths: string[];
  searchQuery: string;
  selectedCategory: ExpenseCategory | 'all';
  selectedAccountId: string | 'all';

  // Modal UI State
  isAddTxModalOpen: boolean;
  isImportModalOpen: boolean;

  // Actions
  setSelectedMonth: (month: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: ExpenseCategory | 'all') => void;
  setSelectedAccountId: (accId: string | 'all') => void;
  openAddTxModal: () => void;
  closeAddTxModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (category: ExpenseCategory, monthlyLimit: number) => void;
  importTransactions: (newRows: CSVImportRow[]) => number;
  resetDemoData: () => void;
}

const initial = loadPersistedState();

export const useFinanceStore = create<FinanceState>((set, get) => ({
  accounts: initial.accounts,
  transactions: initial.transactions,
  budgets: initial.budgets,
  subscriptions: initial.subscriptions,

  selectedMonth: '2026-10',
  availableMonths: ['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05'],
  searchQuery: '',
  selectedCategory: 'all',
  selectedAccountId: 'all',

  isAddTxModalOpen: false,
  isImportModalOpen: false,

  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSelectedAccountId: (accId) => set({ selectedAccountId: accId }),

  openAddTxModal: () => set({ isAddTxModalOpen: true }),
  closeAddTxModal: () => set({ isAddTxModalOpen: false }),
  openImportModal: () => set({ isImportModalOpen: true }),
  closeImportModal: () => set({ isImportModalOpen: false }),

  addTransaction: (txData) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTx: Transaction = { ...txData, id };

    set((state) => {
      const nextTxs = [newTx, ...state.transactions];

      // Update account balance
      const nextAccounts = state.accounts.map((acc) => {
        if (acc.id === newTx.accountId) {
          if (acc.type === 'credit') {
            // Expenses increase credit card debt (positive liability)
            return {
              ...acc,
              balance: acc.balance - newTx.amount,
            };
          } else {
            return {
              ...acc,
              balance: acc.balance + newTx.amount,
            };
          }
        }
        return acc;
      });

      const nextPersisted: PersistedState = {
        accounts: nextAccounts,
        transactions: nextTxs,
        budgets: state.budgets,
        subscriptions: state.subscriptions,
      };

      savePersistedState(nextPersisted);
      return {
        transactions: nextTxs,
        accounts: nextAccounts,
      };
    });
  },

  deleteTransaction: (id) => {
    set((state) => {
      const target = state.transactions.find((t) => t.id === id);
      if (!target) return state;

      const nextTxs = state.transactions.filter((t) => t.id !== id);

      // Revert account balance impact
      const nextAccounts = state.accounts.map((acc) => {
        if (acc.id === target.accountId) {
          if (acc.type === 'credit') {
            return {
              ...acc,
              balance: acc.balance + target.amount,
            };
          } else {
            return {
              ...acc,
              balance: acc.balance - target.amount,
            };
          }
        }
        return acc;
      });

      const nextPersisted: PersistedState = {
        accounts: nextAccounts,
        transactions: nextTxs,
        budgets: state.budgets,
        subscriptions: state.subscriptions,
      };

      savePersistedState(nextPersisted);
      return {
        transactions: nextTxs,
        accounts: nextAccounts,
      };
    });
  },

  updateBudget: (category, monthlyLimit) => {
    set((state) => {
      const existing = state.budgets.some((b) => b.category === category);
      let nextBudgets: Budget[];

      if (existing) {
        nextBudgets = state.budgets.map((b) =>
          b.category === category ? { ...b, monthlyLimit } : b
        );
      } else {
        nextBudgets = [...state.budgets, { category, monthlyLimit }];
      }

      const nextPersisted: PersistedState = {
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: nextBudgets,
        subscriptions: state.subscriptions,
      };

      savePersistedState(nextPersisted);
      return { budgets: nextBudgets };
    });
  },

  importTransactions: (newRows) => {
    const state = get();
    const existingSignatures = new Set(
      state.transactions.map((t) => `${t.date}_${t.payee.toLowerCase()}_${t.amount.toFixed(2)}`)
    );

    const validNewTxs: Transaction[] = [];

    for (const r of newRows) {
      const signature = `${r.date}_${r.payee.toLowerCase()}_${r.amount.toFixed(2)}`;
      if (existingSignatures.has(signature)) {
        continue; // Deduplicate
      }

      const id = `tx_imp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      validNewTxs.push({
        id,
        accountId: r.accountId,
        amount: r.amount,
        date: r.date,
        payee: r.payee,
        category: r.category,
      });
      existingSignatures.add(signature);
    }

    if (validNewTxs.length === 0) return 0;

    set((cur) => {
      const nextTxs = [...validNewTxs, ...cur.transactions];
      const nextPersisted: PersistedState = {
        accounts: cur.accounts,
        transactions: nextTxs,
        budgets: cur.budgets,
        subscriptions: cur.subscriptions,
      };
      savePersistedState(nextPersisted);
      return { transactions: nextTxs };
    });

    return validNewTxs.length;
  },

  resetDemoData: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // safe
      }
    }

    const resetState: PersistedState = {
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      budgets: SEED_BUDGETS,
      subscriptions: SEED_SUBSCRIPTIONS,
    };

    savePersistedState(resetState);

    set({
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      budgets: SEED_BUDGETS,
      subscriptions: SEED_SUBSCRIPTIONS,
      selectedMonth: '2026-10',
      searchQuery: '',
      selectedCategory: 'all',
      selectedAccountId: 'all',
    });
  },
}));
