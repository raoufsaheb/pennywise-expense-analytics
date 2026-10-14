import React, { useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { parseCSVTransactions } from '../../lib/csvParser';
import { CATEGORY_LABELS, formatCurrency } from '../../lib/financialMath';
import type { CSVImportRow } from '../../types/finance';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const SAMPLE_CSV = `Date,Description,Amount,Category
2026-10-15,"Blue Bottle Coffee Soho",-6.75,dining
2026-10-15,"Figma Pro Annual Seat",-15.00,software
2026-10-16,"Sweetgreen Green Goddess Salad",-17.40,dining
2026-10-16,"Walgreens Pharmacy Essentials",-24.80,health
2026-10-17,"Stripe Consulting Bonus",1500.00,income
2026-10-17,"Chevron Fuel Station 442",-54.30,transit`;

export const CSVImportModal: React.FC = () => {
  const {
    isImportModalOpen,
    closeImportModal,
    accounts,
    importTransactions,
    transactions,
  } = useFinanceStore();

  const [targetAccountId, setTargetAccountId] = useState(
    accounts[0]?.id || 'acc_checking'
  );
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<CSVImportRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [importedSuccessCount, setImportedSuccessCount] = useState<number | null>(
    null
  );

  if (!isImportModalOpen) return null;

  const handleProcessCSV = (rawText: string) => {
    setCsvText(rawText);
    const { rows, errors } = parseCSVTransactions(rawText, targetAccountId);
    setParseErrors(errors);

    // Compute duplicates against existing transactions
    const existingSignatures = new Set(
      transactions.map(
        (t) => `${t.date}_${t.payee.toLowerCase()}_${t.amount.toFixed(2)}`
      )
    );

    let dupes = 0;
    for (const r of rows) {
      const sig = `${r.date}_${r.payee.toLowerCase()}_${r.amount.toFixed(2)}`;
      if (existingSignatures.has(sig)) dupes++;
    }

    setDuplicateCount(dupes);
    setParsedRows(rows);
    setImportedSuccessCount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) handleProcessCSV(content);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    handleProcessCSV(SAMPLE_CSV);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    const count = importTransactions(parsedRows);
    setImportedSuccessCount(count);
    setTimeout(() => {
      closeImportModal();
      setParsedRows([]);
      setCsvText('');
      setImportedSuccessCount(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#D5E0D6] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={closeImportModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] flex items-center justify-center text-[#0D5C3A]">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-[#0B1B14]">
              Import Bank CSV Export
            </h3>
            <p className="text-xs text-[#52665B]">
              Deterministic in-browser RFC 4180 parsing with auto-header mapping
            </p>
          </div>
        </div>

        {/* Account Destination */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
            Deposit / Post to Account
          </label>
          <select
            value={targetAccountId}
            onChange={(e) => {
              setTargetAccountId(e.target.value);
              if (csvText) {
                const { rows } = parseCSVTransactions(csvText, e.target.value);
                setParsedRows(rows);
              }
            }}
            className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-3 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.institution})
              </option>
            ))}
          </select>
        </div>

        {/* Dropzone & Load Sample */}
        {parsedRows.length === 0 ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[#D5E0D6] rounded-2xl p-8 text-center bg-[#FAFCFA] hover:bg-[#F4F7F4] transition-colors relative">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-10 h-10 text-[#0D5C3A] mx-auto mb-3" />
              <p className="font-sans font-semibold text-sm text-[#0B1B14] mb-1">
                Drag and drop your bank CSV here, or browse files
              </p>
              <p className="text-xs text-[#52665B]">
                Supports Chase, Mercury, Amex, Apple Card, Monzo, and standard formats
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#52665B]">
                Want to test with sample data?
              </span>
              <button
                type="button"
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0D5C3A] text-[#0D5C3A] hover:bg-[#EBF5EE] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Sample Chase CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Parsed Summary Banner */}
            <div className="p-3.5 rounded-xl bg-[#EBF5EE] border border-[#CDE5D4] flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 text-[#0D5C3A]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">
                  Detected {parsedRows.length} transactions from file.
                </span>
              </div>

              {duplicateCount > 0 && (
                <div className="flex items-center gap-1 text-[#B45309] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{duplicateCount} duplicates will be skipped</span>
                </div>
              )}
            </div>

            {/* Error notifications if any */}
            {parseErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <span className="font-bold block mb-1">Validation Notes:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {parseErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div className="border border-[#EAEFEA] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F4F7F4] text-[11px] font-semibold text-[#52665B] sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Payee</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F1]">
                  {parsedRows.slice(0, 8).map((r, i) => (
                    <tr key={i} className="hover:bg-[#F8FAF8]">
                      <td className="py-2 px-3 font-mono text-[11px] text-[#52665B]">
                        {r.date}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#0B1B14] truncate max-w-xs">
                        {r.payee}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[10px] font-medium bg-[#EAEFEA] text-stone-700 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[r.category] || r.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {r.amount > 0 ? (
                          <span className="text-[#0D5C3A]">
                            +{formatCurrency(r.amount)}
                          </span>
                        ) : (
                          <span className="text-[#0B1B14]">
                            {formatCurrency(r.amount)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 8 && (
                <div className="py-2 text-center bg-[#FAFCFA] text-[11px] text-stone-500 border-t border-[#EAEFEA]">
                  + {parsedRows.length - 8} more transactions ready to import
                </div>
              )}
            </div>

            {/* Success state */}
            {importedSuccessCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-100 text-[#0D5C3A] font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Successfully imported {importedSuccessCount} new transactions!
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setParsedRows([]);
                  setCsvText('');
                }}
                className="text-xs text-stone-500 hover:text-stone-800 underline"
              >
                Choose another file
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-5 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#083823] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  Confirm & Import ({parsedRows.length - duplicateCount} new)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
