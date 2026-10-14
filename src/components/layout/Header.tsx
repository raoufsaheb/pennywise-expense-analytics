import React from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { exportTransactionsToCSV } from '../../lib/csvParser';
import {
  Coins,
  Download,
  Upload,
  Plus,
  RotateCcw,
  Calendar,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    transactions,
    accounts,
    selectedMonth,
    availableMonths,
    setSelectedMonth,
    openAddTxModal,
    openImportModal,
    resetDemoData,
  } = useFinanceStore();

  const handleExportCSV = () => {
    const accountNames: Record<string, string> = {};
    accounts.forEach((a) => {
      accountNames[a.id] = a.name;
    });

    const csvData = exportTransactionsToCSV(transactions, accountNames);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pennywise_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatMonthLabel = (m: string) => {
    const [year, monthNum] = m.split('-').map(Number);
    return `${monthNames[monthNum - 1]} ${year}`;
  };

  return (
    <header className="bg-white border-b border-[#E1E8E2] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0D5C3A] flex items-center justify-center text-white shadow-xs">
            <Coins className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-lg text-[#0B1B14] tracking-tight">
                Pennywise
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#0D5C3A] border border-[#CDE5D4]">
                v1.0 Local
              </span>
            </div>
            <p className="text-xs text-[#52665B] hidden sm:block">
              Privacy-First Expense Analytics & Budget Velocity
            </p>
          </div>
        </div>

        {/* Month Selector & Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Month Selector */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-[#52665B] absolute left-3 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-[#F4F7F4] hover:bg-[#EAEFEA] border border-[#D5E0D6] rounded-xl pl-8 pr-8 py-2 text-xs font-sans font-semibold text-[#0B1B14] focus:outline-none focus:border-[#0D5C3A] cursor-pointer appearance-none transition-colors"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
            <div className="absolute right-3 pointer-events-none text-[10px] text-stone-500">
              ▼
            </div>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={resetDemoData}
            title="Reset to default 90-day demo fixtures"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#D5E0D6] hover:bg-[#F4F7F4] text-[#52665B] hover:text-[#0B1B14] text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            title="Export all transactions as RFC 4180 CSV"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#D5E0D6] hover:bg-[#F4F7F4] text-[#52665B] hover:text-[#0B1B14] text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={openImportModal}
            title="Import bank export CSV"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#D5E0D6] hover:bg-[#F4F7F4] text-[#52665B] hover:text-[#0B1B14] text-xs font-sans font-medium transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Import CSV</span>
          </button>

          {/* Add Transaction Button */}
          <button
            onClick={openAddTxModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0D5C3A] hover:bg-[#083823] text-white text-xs font-sans font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
