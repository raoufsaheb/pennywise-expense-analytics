import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { calculateNetWorth, formatCurrency } from '../../lib/financialMath';
import {
  Wallet,
  Landmark,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';

export const NetWorthCard: React.FC = () => {
  const { accounts } = useFinanceStore();
  const netWorth = calculateNetWorth(accounts);

  const totalAssets = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = accounts
    .filter((a) => a.type === 'credit')
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Wallet className="w-4 h-4 text-[#0D5C3A]" />;
      case 'savings':
        return <Landmark className="w-4 h-4 text-[#0284C7]" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-[#7C3AED]" />;
      case 'credit':
        return <CreditCard className="w-4 h-4 text-[#DC2626]" />;
      default:
        return <Wallet className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#52665B]">
            Total Net Worth
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D5C3A] bg-[#EBF5EE] px-2.5 py-0.5 rounded-full border border-[#CDE5D4]">
            <ArrowUpRight className="w-3 h-3" />
            +3.4% this month
          </span>
        </div>

        <div className="font-mono text-3xl sm:text-4xl font-bold text-[#0B1B14] tracking-tight mb-4">
          {formatCurrency(netWorth)}
        </div>

        {/* Assets vs Liabilities Split */}
        <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-xl bg-[#F8FAF8] border border-[#EAEFEA] mb-6">
          <div>
            <span className="text-[11px] text-[#52665B] block font-medium">Total Assets</span>
            <span className="font-mono text-sm font-semibold text-[#0D5C3A]">
              {formatCurrency(totalAssets)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#52665B] block font-medium">Liabilities (Debt)</span>
            <span className="font-mono text-sm font-semibold text-[#B91C1C]">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>
        </div>
      </div>

      {/* Account Balance Chips */}
      <div>
        <span className="text-[11px] font-semibold text-[#52665B] block mb-2 uppercase tracking-wider">
          Connected Accounts ({accounts.length})
        </span>
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between p-2.5 rounded-xl border border-[#EAEFEA] hover:bg-[#F8FAF8] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-[#F4F7F4] shrink-0">
                  {getAccountIcon(acc.type)}
                </div>
                <div className="truncate">
                  <span className="text-xs font-semibold text-[#0B1B14] block truncate">
                    {acc.name}
                  </span>
                  <span className="text-[10px] text-[#52665B] block">
                    {acc.institution}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <span
                  className={`font-mono text-xs font-bold ${
                    acc.type === 'credit' ? 'text-[#B91C1C]' : 'text-[#0B1B14]'
                  }`}
                >
                  {acc.type === 'credit' ? `-${formatCurrency(acc.balance)}` : formatCurrency(acc.balance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
