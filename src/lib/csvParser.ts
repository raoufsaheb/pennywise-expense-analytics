import type { Transaction, ExpenseCategory, CSVImportRow } from '../types/finance';

/**
 * RFC 4180 compliant CSV line tokenizer that respects escaped quotes and internal commas.
 */
export function parseCSVTokens(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  while (i < sanitized.length) {
    const char = sanitized[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < sanitized.length && sanitized[i + 1] === '"') {
          // Escaped quote: "" -> "
          field += '"';
          i += 2;
          continue;
        } else {
          // Close quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        field += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        row.push(field.trim());
        field = '';
        i++;
        continue;
      } else if (char === '\n') {
        row.push(field.trim());
        if (row.some((cell) => cell.length > 0)) {
          lines.push(row);
        }
        row = [];
        field = '';
        i++;
        continue;
      } else {
        field += char;
        i++;
        continue;
      }
    }
  }

  // Push lingering field and row
  row.push(field.trim());
  if (row.some((cell) => cell.length > 0)) {
    lines.push(row);
  }

  return lines;
}

/**
 * Intelligent categorization heuristic based on common bank merchant keywords.
 */
export function inferCategoryFromPayee(payee: string): ExpenseCategory {
  const lower = payee.toLowerCase();

  if (
    lower.includes('salary') ||
    lower.includes('payroll') ||
    lower.includes('deposit') ||
    lower.includes('stripe') ||
    lower.includes('dividend')
  ) {
    return 'income';
  }

  if (
    lower.includes('market') ||
    lower.includes('trader joe') ||
    lower.includes('whole foods') ||
    lower.includes('safeway') ||
    lower.includes('kroger') ||
    lower.includes('grocery') ||
    lower.includes('wegmans')
  ) {
    return 'groceries';
  }

  if (
    lower.includes('coffee') ||
    lower.includes('cafe') ||
    lower.includes('starbucks') ||
    lower.includes('blue bottle') ||
    lower.includes('restaurant') ||
    lower.includes('doordash') ||
    lower.includes('uber eats') ||
    lower.includes('diner') ||
    lower.includes('bakery')
  ) {
    return 'dining';
  }

  if (
    lower.includes('netflix') ||
    lower.includes('spotify') ||
    lower.includes('apple.com') ||
    lower.includes('github') ||
    lower.includes('aws') ||
    lower.includes('google cloud') ||
    lower.includes('notion') ||
    lower.includes('cursor') ||
    lower.includes('figma')
  ) {
    return 'software';
  }

  if (
    lower.includes('rent') ||
    lower.includes('mortgage') ||
    lower.includes('landlord') ||
    lower.includes('property')
  ) {
    return 'housing';
  }

  if (
    lower.includes('coned') ||
    lower.includes('electric') ||
    lower.includes('national grid') ||
    lower.includes('water') ||
    lower.includes('verizon') ||
    lower.includes('at&t')
  ) {
    return 'utilities';
  }

  if (
    lower.includes('uber') ||
    lower.includes('lyft') ||
    lower.includes('mta') ||
    lower.includes('bart') ||
    lower.includes('clipper') ||
    lower.includes('transit') ||
    lower.includes('subway') ||
    lower.includes('train') ||
    lower.includes('gas') ||
    lower.includes('shell') ||
    lower.includes('chevron')
  ) {
    return 'transit';
  }

  if (
    lower.includes('pharmacy') ||
    lower.includes('cvs') ||
    lower.includes('walgreens') ||
    lower.includes('gym') ||
    lower.includes('equinox') ||
    lower.includes('dental')
  ) {
    return 'health';
  }

  if (
    lower.includes('cinema') ||
    lower.includes('theater') ||
    lower.includes('ticketmaster') ||
    lower.includes('concert')
  ) {
    return 'entertainment';
  }

  return 'other';
}

export interface HeaderMapping {
  dateIndex: number;
  payeeIndex: number;
  amountIndex: number;
  categoryIndex: number;
}

/**
 * Detects relevant column indexes from CSV headers.
 */
export function detectHeaderMapping(headers: string[]): HeaderMapping {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

  let dateIndex = lowerHeaders.findIndex((h) =>
    ['date', 'transaction date', 'posted date', 'trans date', 'time'].includes(h)
  );
  if (dateIndex === -1) {
    dateIndex = lowerHeaders.findIndex((h) => h.includes('date'));
  }

  let payeeIndex = lowerHeaders.findIndex((h) =>
    ['payee', 'description', 'merchant', 'name', 'narrative', 'details'].includes(h)
  );
  if (payeeIndex === -1) {
    payeeIndex = lowerHeaders.findIndex((h) => h.includes('desc') || h.includes('payee'));
  }

  let amountIndex = lowerHeaders.findIndex((h) =>
    ['amount', 'total', 'debit', 'value', 'net'].includes(h)
  );
  if (amountIndex === -1) {
    amountIndex = lowerHeaders.findIndex((h) => h.includes('amount'));
  }

  let categoryIndex = lowerHeaders.findIndex((h) =>
    ['category', 'type', 'classification'].includes(h)
  );

  return {
    dateIndex: dateIndex !== -1 ? dateIndex : 0,
    payeeIndex: payeeIndex !== -1 ? payeeIndex : 1,
    amountIndex: amountIndex !== -1 ? amountIndex : 2,
    categoryIndex: categoryIndex !== -1 ? categoryIndex : -1,
  };
}

/**
 * Parses raw CSV content into typed CSVImportRow items.
 */
export function parseCSVTransactions(
  csvContent: string,
  targetAccountId: string
): { rows: CSVImportRow[]; errors: string[] } {
  const tokenGrid = parseCSVTokens(csvContent);
  if (tokenGrid.length < 2) {
    return { rows: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const headers = tokenGrid[0];
  const mapping = detectHeaderMapping(headers);
  const rows: CSVImportRow[] = [];
  const errors: string[] = [];

  for (let r = 1; r < tokenGrid.length; r++) {
    const line = tokenGrid[r];
    const rawDate = line[mapping.dateIndex];
    const rawPayee = line[mapping.payeeIndex];
    const rawAmount = line[mapping.amountIndex];

    if (!rawDate || !rawPayee || rawAmount === undefined) {
      continue;
    }

    // Clean amount (handles $ symbol, commas, parentheses for negative numbers)
    let cleanAmountStr = rawAmount.replace(/[$, ]/g, '');
    let isNegative = false;
    if (cleanAmountStr.startsWith('(') && cleanAmountStr.endsWith(')')) {
      isNegative = true;
      cleanAmountStr = cleanAmountStr.slice(1, -1);
    }
    const num = parseFloat(cleanAmountStr);
    if (isNaN(num)) {
      errors.push(`Row ${r + 1}: Invalid amount "${rawAmount}".`);
      continue;
    }

    let parsedAmount = isNegative ? -Math.abs(num) : num;

    // Standardize date to YYYY-MM-DD
    let formattedDate = rawDate;
    if (rawDate.includes('/')) {
      const parts = rawDate.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY or YYYY/MM/DD
        if (parts[0].length === 4) {
          formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          formattedDate = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
      }
    }

    let category: ExpenseCategory = 'other';
    if (mapping.categoryIndex !== -1 && line[mapping.categoryIndex]) {
      const explicitCategory = line[mapping.categoryIndex].toLowerCase().trim() as ExpenseCategory;
      category = explicitCategory;
    } else {
      category = inferCategoryFromPayee(rawPayee);
    }

    rows.push({
      date: formattedDate,
      payee: rawPayee,
      amount: parsedAmount,
      category,
      accountId: targetAccountId,
    });
  }

  return { rows, errors };
}

/**
 * Serializes transactions into an RFC 4180 CSV string with header.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  accountNames: Record<string, string>
): string {
  const header = ['ID', 'Date', 'Payee', 'Category', 'Account', 'Amount', 'Recurring', 'Notes'];

  const rows = transactions.map((t) => {
    const accName = accountNames[t.accountId] || 'Primary';
    const cleanPayee = `"${t.payee.replace(/"/g, '""')}"`;
    const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;

    return [
      t.id,
      t.date,
      cleanPayee,
      t.category,
      `"${accName}"`,
      t.amount.toFixed(2),
      t.isRecurring ? 'Yes' : 'No',
      cleanNotes,
    ].join(',');
  });

  return [header.join(','), ...rows].join('\n');
}
