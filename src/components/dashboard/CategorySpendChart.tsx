import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import {
  calculateCategoryBreakdown,
  CATEGORY_LABELS,
  formatCurrency,
} from '../../lib/financialMath';

export const CategorySpendChart: React.FC = () => {
  const { transactions, selectedMonth, selectedCategory, setSelectedCategory } =
    useFinanceStore();

  const categories = calculateCategoryBreakdown(transactions, selectedMonth);
  const totalExpenses = categories.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-sans font-bold text-base text-[#0B1B14]">
            Category Breakdown
          </h3>
          <p className="text-xs text-[#52665B]">
            Monthly expense distribution ({categories.length} categories)
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#52665B] block font-medium">
            Total Outflow
          </span>
          <span className="font-mono text-base font-bold text-[#0B1B14]">
            {formatCurrency(totalExpenses)}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#52665B]">
          No expense transactions recorded for this month.
        </div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.category;

            return (
              <div
                key={c.category}
                onClick={() =>
                  setSelectedCategory(isSelected ? 'all' : c.category)
                }
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF5EE] ring-1 ring-[#0D5C3A]'
                    : 'hover:bg-[#F8FAF8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-semibold text-[#0B1B14]">
                      {CATEGORY_LABELS[c.category] || c.category}
                    </span>
                    <span className="text-[10px] text-[#52665B] font-mono">
                      ({c.transactionCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#0B1B14]">
                      {formatCurrency(c.totalSpent)}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-[#52665B] w-10 text-right">
                      {c.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#EAEFEA] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCategory !== 'all' && (
        <div className="mt-4 pt-3 border-t border-[#EAEFEA] flex items-center justify-between text-xs">
          <span className="text-[#0D5C3A] font-semibold">
            Filtered by: {CATEGORY_LABELS[selectedCategory]}
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-[11px] text-[#52665B] hover:text-[#0B1B14] underline"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
};
