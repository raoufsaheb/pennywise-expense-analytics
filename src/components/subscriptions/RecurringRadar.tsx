import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCurrency,
} from '../../lib/financialMath';
import { RefreshCw, CalendarClock } from 'lucide-react';

export const RecurringRadar: React.FC = () => {
  const { subscriptions } = useFinanceStore();

  const totalMonthlyRunRate = subscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount);
  }, 0);

  const getDaysUntilRenewal = (dateStr: string) => {
    const today = new Date('2026-10-14'); // Fixed reference for deterministic demo
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <section aria-labelledby="recurring-radar-heading" className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EAEFEA] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] flex items-center justify-center text-[#0D5C3A]">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <h2 id="recurring-radar-heading" className="font-sans font-bold text-base text-[#0B1B14]">
              Recurring Subscriptions Radar
            </h2>
            <p className="text-xs text-[#52665B]">
              Detected recurring vendor commitments & upcoming renewal obligations
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#52665B] block font-medium">
            Monthly Run-Rate
          </span>
          <span className="font-mono text-base font-bold text-[#0D5C3A]">
            {formatCurrency(totalMonthlyRunRate)}/mo
          </span>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subscriptions.map((sub) => {
          const daysLeft = getDaysUntilRenewal(sub.nextRenewalDate);

          return (
            <div
              key={sub.id}
              className="p-4 rounded-xl border border-[#EAEFEA] bg-[#F8FAF8] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-sans font-bold text-xs text-[#0B1B14] truncate">
                    {sub.payee}
                  </h3>
                  <span
                    className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[sub.category] }}
                  >
                    {CATEGORY_LABELS[sub.category].split(' ')[0]}
                  </span>
                </div>

                <div className="font-mono text-xl font-bold text-[#0B1B14] mb-3">
                  {formatCurrency(sub.amount)}
                  <span className="text-[11px] text-[#52665B] font-sans font-normal ml-1">
                    /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EAEFEA] flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-1.5 text-[#52665B]">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>{sub.nextRenewalDate}</span>
                </div>

                <span
                  className={`font-semibold ${
                    daysLeft <= 7
                      ? 'text-[#B45309]'
                      : 'text-[#0D5C3A]'
                  }`}
                >
                  {daysLeft > 0 ? `in ${daysLeft}d` : 'Today'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
