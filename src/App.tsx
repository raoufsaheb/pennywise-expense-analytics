import React from 'react';
import { PrivacyBanner } from './components/layout/PrivacyBanner';
import { Header } from './components/layout/Header';
import { CashFlowSummary } from './components/dashboard/CashFlowSummary';
import { NetWorthCard } from './components/dashboard/NetWorthCard';
import { CashFlowChart } from './components/dashboard/CashFlowChart';
import { CategorySpendChart } from './components/dashboard/CategorySpendChart';
import { BudgetVelocitySection } from './components/budgets/BudgetVelocitySection';
import { RecurringRadar } from './components/subscriptions/RecurringRadar';
import { TransactionTable } from './components/transactions/TransactionTable';
import { AddTransactionModal } from './components/transactions/AddTransactionModal';
import { CSVImportModal } from './components/import/CSVImportModal';
import { Footer } from './components/layout/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7F4] text-[#0B1B14] font-sans flex flex-col selection:bg-[#0D5C3A]/20 selection:text-[#0D5C3A]">
      {/* Privacy Sandbox Reassurance Banner */}
      <PrivacyBanner />

      {/* Global Navigation & Month Switcher */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* Row 1: KPI Cash Flow Summary (Inflow, Outflow, Net, Savings Rate) */}
        <CashFlowSummary />

        {/* Row 2: Net Worth Balance Sheet (Col 4) + 6-Month Cash Flow Bar Chart (Col 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col">
            <NetWorthCard />
          </div>
          <div className="lg:col-span-8 flex flex-col">
            <CashFlowChart />
          </div>
        </div>

        {/* Row 3: Budget Velocity & Burn Pacing Engine */}
        <BudgetVelocitySection />

        {/* Row 4: Category Distribution (Col 5) + Recurring Subscriptions Radar (Col 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col">
            <CategorySpendChart />
          </div>
          <div className="lg:col-span-7 flex flex-col">
            <RecurringRadar />
          </div>
        </div>

        {/* Row 5: Full Filterable & Searchable Transaction Ledger */}
        <TransactionTable />
      </main>

      {/* Global Editorial Footer */}
      <Footer />

      {/* Overlays & Modals */}
      <AddTransactionModal />
      <CSVImportModal />
    </div>
  );
};

export default App;
