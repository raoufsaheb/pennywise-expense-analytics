import React, { useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { CATEGORY_LABELS } from '../../lib/financialMath';
import type { ExpenseCategory } from '../../types/finance';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTxModalOpen,
    closeAddTxModal,
    addTransaction,
    accounts,
    selectedMonth,
  } = useFinanceStore();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [payee, setPayee] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc_checking');
  const [date, setDate] = useState(`${selectedMonth}-15`);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAddTxModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please specify a positive numeric amount.');
      return;
    }

    if (!payee.trim()) {
      setError('Please provide a payee or merchant name.');
      return;
    }

    const finalAmount = type === 'expense' ? -numAmount : numAmount;

    addTransaction({
      accountId,
      amount: finalAmount,
      date,
      payee: payee.trim(),
      category: type === 'income' ? 'income' : category,
      isRecurring,
      notes: notes.trim() || undefined,
    });

    closeAddTxModal();
    // Reset form
    setPayee('');
    setAmountStr('');
    setNotes('');
  };

  const categories: ExpenseCategory[] = [
    'housing',
    'groceries',
    'dining',
    'utilities',
    'software',
    'transit',
    'health',
    'entertainment',
    'other',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#D5E0D6] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={closeAddTxModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] flex items-center justify-center text-[#0D5C3A]">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-sans font-bold text-lg text-[#0B1B14]">
            Record Transaction
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-sans font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F7F4] rounded-xl border border-[#EAEFEA]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-white text-[#B91C1C] shadow-xs'
                  : 'text-[#52665B] hover:text-[#0B1B14]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Expense Outflow
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-white text-[#0D5C3A] shadow-xs'
                  : 'text-[#52665B] hover:text-[#0B1B14]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Income Inflow
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-stone-400 font-bold">
                $
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl pl-8 pr-4 py-2.5 font-mono text-base font-bold text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
              />
            </div>
          </div>

          {/* Payee / Merchant */}
          <div>
            <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
              Payee / Merchant
            </label>
            <input
              type="text"
              placeholder="e.g. Trader Joe's, Stripe, ConEd"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              required
              className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-3 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-2 gap-3">
            {type === 'expense' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-2.5 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={type === 'income' ? 'col-span-2' : ''}>
              <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-2.5 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Recurring */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-2.5 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-[#D5E0D6] text-[#0D5C3A] focus:ring-[#0D5C3A]"
                />
                <span className="text-xs text-[#0B1B14] font-medium">
                  Recurring monthly
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#52665B] uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Reimbursement pending, annual promotion"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F8FAF8] border border-[#D5E0D6] rounded-xl px-3 py-2 text-xs text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeAddTxModal}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0D5C3A] hover:bg-[#083823] text-white font-semibold transition-all shadow-xs"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
