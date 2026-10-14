import { describe, it, expect } from 'vitest';
import {
  parseCSVTokens,
  detectHeaderMapping,
  inferCategoryFromPayee,
  parseCSVTransactions,
  exportTransactionsToCSV,
} from '../src/lib/csvParser';
import type { Transaction } from '../src/types/finance';

describe('CSV Ingestion & Export Engine', () => {
  it('tokenizes RFC 4180 CSV with quotes and commas', () => {
    const raw = `Date,Payee,Amount\n2026-10-01,"Trader Joe's, Inc.",-45.20\n2026-10-02,Blue Bottle,-6.50`;
    const tokens = parseCSVTokens(raw);
    expect(tokens.length).toBe(3);
    expect(tokens[1][1]).toBe("Trader Joe's, Inc.");
    expect(tokens[1][2]).toBe('-45.20');
  });

  it('infers financial categories from merchant keywords', () => {
    expect(inferCategoryFromPayee('Trader Joe Market')).toBe('groceries');
    expect(inferCategoryFromPayee('Blue Bottle Coffee')).toBe('dining');
    expect(inferCategoryFromPayee('Cursor AI Subscription')).toBe('software');
    expect(inferCategoryFromPayee('ConEdison Energy')).toBe('utilities');
    expect(inferCategoryFromPayee('Stripe Direct Deposit')).toBe('income');
    expect(inferCategoryFromPayee('BART Clipper Card')).toBe('transit');
  });

  it('auto-detects header column positions', () => {
    const headers = ['Transaction Date', 'Merchant Details', 'Net Amount', 'Classification'];
    const mapping = detectHeaderMapping(headers);
    expect(mapping.dateIndex).toBe(0);
    expect(mapping.payeeIndex).toBe(1);
    expect(mapping.amountIndex).toBe(2);
    expect(mapping.categoryIndex).toBe(3);
  });

  it('parses raw bank export CSV into valid rows', () => {
    const csvContent = `Date,Description,Amount\n2026-10-04,Whole Foods Market,-84.20\n2026-10-05,Equinox Club,-140.00`;
    const { rows, errors } = parseCSVTransactions(csvContent, 'acc_checking');

    expect(errors.length).toBe(0);
    expect(rows.length).toBe(2);
    expect(rows[0].payee).toBe('Whole Foods Market');
    expect(rows[0].amount).toBe(-84.2);
    expect(rows[0].category).toBe('groceries');
    expect(rows[1].category).toBe('health');
  });

  it('serializes transactions to RFC 4180 CSV export', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx_1',
        accountId: 'acc_chk',
        date: '2026-10-01',
        payee: 'Stripe, Inc.',
        amount: 4250,
        category: 'income',
        notes: 'Payroll direct deposit',
      },
    ];
    const accountNames = { acc_chk: 'Checking' };

    const exported = exportTransactionsToCSV(transactions, accountNames);
    expect(exported).toContain('ID,Date,Payee,Category,Account,Amount,Recurring,Notes');
    expect(exported).toContain('"Stripe, Inc."');
    expect(exported).toContain('"Checking"');
    expect(exported).toContain('4250.00');
  });
});
