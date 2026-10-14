import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCurrency,
} from '../../lib/financialMath';
import type { ExpenseCategory } from '../../types/finance';
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

export const TransactionTable: React.FC = () => {
  const {
    transactions,
    accounts,
    selectedMonth,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedAccountId,
    setSelectedAccountId,
    deleteTransaction,
  } = useFinanceStore();

  const accountMap: Record<string, string> = {};
  accounts.forEach((a) => {
    accountMap[a.id] = a.name;
  });

  // Filter transactions
  const filtered = transactions.filter((t) => {
    // 1. Month match
    if (!t.date.startsWith(selectedMonth)) return false;

    // 2. Category match
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

    // 3. Account match
    if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;

    // 4. Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchPayee = t.payee.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q) || false;
      const matchCategory = t.category.toLowerCase().includes(q);
      if (!matchPayee && !matchNotes && !matchCategory) return false;
    }

    return true;
  });

  const categories: ExpenseCategory[] = [
    'housing',
    'groceries',
    'dining',
    'utilities',
    'software',
    'transit',
    'health',
    'entertainment',
    'income',
  ];

  return (
    <section aria-labelledby="ledger-heading" className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs">
      {/* Title & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAEFEA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#0D5C3A]" />
            <h2 id="ledger-heading" className="font-sans font-bold text-lg text-[#0B1B14]">
              Transaction Ledger
            </h2>
          </div>
          <p className="text-xs text-[#52665B]">
            Showing {filtered.length} entries for{' '}
            <span className="font-semibold text-[#0B1B14]">{selectedMonth}</span>
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search payee or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F4F7F4] border border-[#D5E0D6] rounded-xl pl-9 pr-4 py-2 text-xs font-sans text-[#0B1B14] placeholder-stone-400 focus:outline-none focus:border-[#0D5C3A] w-48 sm:w-60 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-[#52665B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as ExpenseCategory | 'all')
              }
              className="bg-[#F4F7F4] border border-[#D5E0D6] rounded-xl pl-8 pr-8 py-2 text-xs font-sans font-medium text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A] cursor-pointer appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-stone-500">
              ▼
            </div>
          </div>

          {/* Account Dropdown */}
          <div className="relative">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-[#F4F7F4] border border-[#D5E0D6] rounded-xl px-3 pr-8 py-2 text-xs font-sans font-medium text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A] cursor-pointer appearance-none"
            >
              <option value="all">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-stone-500">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs">
            <p className="font-semibold text-stone-800 text-sm mb-1">
              No matching transactions found
            </p>
            <p>Try adjusting your search query, category, or month filter.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAEFEA] text-[11px] font-semibold text-[#52665B] uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Merchant / Payee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Account</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F4F1] text-xs font-sans">
              {filtered.map((t) => {
                const isIncome = t.amount > 0;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-[#F8FAF8] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-[#52665B] font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{t.date}</span>
                      </div>
                    </td>

                    {/* Payee & Notes */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#0B1B14]">
                        {t.payee}
                      </div>
                      {t.notes && (
                        <div className="text-[11px] text-[#52665B] truncate max-w-xs">
                          {t.notes}
                        </div>
                      )}
                    </td>

                    {/* Category Tag */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[t.category] || '#6B7280',
                        }}
                      >
                        {CATEGORY_LABELS[t.category] || t.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3 px-3 whitespace-nowrap text-[#52665B] text-[11px]">
                      {accountMap[t.accountId] || 'Primary'}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono font-bold">
                      <span
                        className={
                          isIncome
                            ? 'text-[#0D5C3A]'
                            : 'text-[#0B1B14]'
                        }
                      >
                        {isIncome
                          ? `+${formatCurrency(t.amount)}`
                          : formatCurrency(t.amount)}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-[#B91C1C] hover:bg-[#FEE2E2] rounded-lg transition-all"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
