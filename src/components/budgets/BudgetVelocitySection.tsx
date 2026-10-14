import React, { useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import {
  calculateBudgetPacing,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCurrency,
} from '../../lib/financialMath';
import type { ExpenseCategory } from '../../types/finance';
import { Gauge, AlertTriangle, CheckCircle2, AlertCircle, Edit2, Check } from 'lucide-react';

export const BudgetVelocitySection: React.FC = () => {
  const { budgets, transactions, selectedMonth, updateBudget } = useFinanceStore();

  const pacingList = calculateBudgetPacing(budgets, transactions, selectedMonth);

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(0);

  const handleStartEdit = (category: ExpenseCategory, currentLimit: number) => {
    setEditingCategory(category);
    setEditLimitValue(currentLimit);
  };

  const handleSaveEdit = (category: ExpenseCategory) => {
    if (editLimitValue > 0) {
      updateBudget(category, editLimitValue);
    }
    setEditingCategory(null);
  };

  // Compute overall budget velocity status
  const totalBudgeted = pacingList.reduce((sum, p) => sum + p.monthlyLimit, 0);
  const totalProjected = pacingList.reduce((sum, p) => sum + p.projectedMonthEnd, 0);
  const calendarDayPct = pacingList[0]?.dayOfMonthPercentage || 45;

  return (
    <section aria-labelledby="budget-velocity-heading" className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs">
      {/* Header with Aggregate Velocity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAEFEA]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gauge className="w-5 h-5 text-[#0D5C3A]" />
            <h2 id="budget-velocity-heading" className="font-sans font-bold text-lg text-[#0B1B14]">
              Budget Velocity & Burn Pacing
            </h2>
          </div>
          <p className="text-xs text-[#52665B]">
            Real-time projection comparing daily expenditure burn rate against elapsed calendar days
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-4 bg-[#F8FAF8] border border-[#EAEFEA] px-4 py-2.5 rounded-xl">
          <div>
            <span className="text-[10px] text-[#52665B] block font-medium uppercase tracking-wider">
              Calendar Progress
            </span>
            <span className="font-mono text-xs font-bold text-[#0B1B14]">
              {calendarDayPct.toFixed(0)}% Elapsed
            </span>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div>
            <span className="text-[10px] text-[#52665B] block font-medium uppercase tracking-wider">
              Projected Month-End
            </span>
            <span
              className={`font-mono text-xs font-bold ${
                totalProjected > totalBudgeted ? 'text-[#B91C1C]' : 'text-[#0D5C3A]'
              }`}
            >
              {formatCurrency(totalProjected, false)} / {formatCurrency(totalBudgeted, false)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Velocity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {pacingList.map((p) => {
          const isEditing = editingCategory === p.category;

          return (
            <div
              key={p.category}
              className="p-4 rounded-xl border border-[#EAEFEA] bg-[#FAFCFA] hover:border-[#D5E0D6] transition-all flex flex-col justify-between"
            >
              {/* Category Name & Pacing Badge */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[p.category] }}
                    />
                    <h3 className="font-sans font-bold text-xs text-[#0B1B14] truncate">
                      {CATEGORY_LABELS[p.category]}
                    </h3>
                  </div>

                  {/* Pacing Status Badge */}
                  {p.status === 'on-track' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0D5C3A] bg-[#EBF5EE] px-2 py-0.5 rounded-full border border-[#CDE5D4] shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      On Track
                    </span>
                  ) : p.status === 'warning' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A] shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B91C1C] bg-[#FEE2E2] px-2 py-0.5 rounded-full border border-[#FECACA] shrink-0">
                      <AlertCircle className="w-3 h-3" />
                      Exceeded
                    </span>
                  )}
                </div>

                {/* Amounts: Spent vs Limit */}
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-[#52665B] block font-medium">Spent</span>
                    <span className="font-mono text-base font-bold text-[#0B1B14]">
                      {formatCurrency(p.spent)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#52665B] block font-medium">Monthly Cap</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={editLimitValue}
                          onChange={(e) => setEditLimitValue(Number(e.target.value))}
                          className="w-20 font-mono text-xs border border-stone-300 rounded px-1.5 py-0.5 text-right focus:outline-none focus:border-[#0D5C3A]"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(p.category)}
                          className="p-1 rounded bg-[#0D5C3A] text-white hover:bg-[#083823]"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-end group">
                        <span className="font-mono text-xs font-semibold text-[#52665B]">
                          {formatCurrency(p.monthlyLimit, false)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(p.category, p.monthlyLimit)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-stone-700 transition-opacity"
                          title="Edit limit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Dual Progress Gauge */}
                <div className="relative w-full bg-[#EAEFEA] h-2.5 rounded-full overflow-hidden mb-2">
                  {/* Calendar Marker Indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-stone-400 z-10"
                    style={{ left: `${Math.min(100, p.dayOfMonthPercentage)}%` }}
                    title={`Day of month: ${p.dayOfMonthPercentage}%`}
                  />

                  {/* Spend Fill Bar */}
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.status === 'exceeded'
                        ? 'bg-[#B91C1C]'
                        : p.status === 'warning'
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#0D5C3A]'
                    }`}
                    style={{ width: `${Math.min(100, p.spentPercentage)}%` }}
                  />
                </div>
              </div>

              {/* Velocity Footnote */}
              <div className="pt-2 border-t border-[#EAEFEA] flex items-center justify-between text-[10px] text-[#52665B] font-mono">
                <span>Burn: {formatCurrency(p.dailyBurnRate)}/day</span>
                <span>Proj: {formatCurrency(p.projectedMonthEnd, false)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
