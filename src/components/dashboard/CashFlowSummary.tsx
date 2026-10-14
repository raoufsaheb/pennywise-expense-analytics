import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { calculateMonthlyCashFlow, formatCurrency } from '../../lib/financialMath';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Percent,
} from 'lucide-react';

export const CashFlowSummary: React.FC = () => {
  const { transactions, selectedMonth } = useFinanceStore();
  const cashFlow = calculateMonthlyCashFlow(transactions, selectedMonth);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Monthly Inflow */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#52665B]">
            Monthly Inflow
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] flex items-center justify-center text-[#0D5C3A]">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold text-[#0D5C3A]">
          {formatCurrency(cashFlow.income)}
        </div>
        <span className="text-[11px] text-[#52665B] mt-1 block font-medium">
          Total earnings & deposits
        </span>
      </div>

      {/* 2. Monthly Outflow */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#52665B]">
            Monthly Outflow
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#B91C1C]">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="font-mono text-2xl font-bold text-[#0B1B14]">
          {formatCurrency(cashFlow.expenses)}
        </div>
        <span className="text-[11px] text-[#52665B] mt-1 block font-medium">
          Debits & card expenses
        </span>
      </div>

      {/* 3. Net Savings */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#52665B]">
            Net Cash Flow
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] flex items-center justify-center text-[#0D5C3A]">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`font-mono text-2xl font-bold ${
            cashFlow.netSavings >= 0 ? 'text-[#0D5C3A]' : 'text-[#B91C1C]'
          }`}
        >
          {cashFlow.netSavings >= 0 ? `+${formatCurrency(cashFlow.netSavings)}` : formatCurrency(cashFlow.netSavings)}
        </div>
        <span className="text-[11px] text-[#52665B] mt-1 block font-medium">
          {cashFlow.netSavings >= 0 ? 'Retained capital' : 'Net deficit'}
        </span>
      </div>

      {/* 4. Savings Rate */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#52665B]">
            Savings Rate
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#EAEFEA] flex items-center justify-center text-[#0D5C3A]">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold text-[#0B1B14]">
            {cashFlow.savingsRate.toFixed(1)}%
          </span>
          <span className="text-xs font-semibold text-[#0D5C3A]">
            {cashFlow.savingsRate >= 40 ? 'Exceptional' : 'Standard'}
          </span>
        </div>
        {/* Visual Mini Progress Bar */}
        <div className="w-full bg-[#EAEFEA] h-2 rounded-full overflow-hidden mt-2">
          <div
            className="bg-[#0D5C3A] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, cashFlow.savingsRate)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
