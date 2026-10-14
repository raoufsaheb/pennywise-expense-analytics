import React from 'react';
import { ShieldCheck, Lock, Coins } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#E1E8E2] py-12 mt-16 text-xs font-sans text-[#52665B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0D5C3A] flex items-center justify-center text-white">
              <Coins className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <span className="font-bold text-sm text-[#0B1B14] block">
                Pennywise Personal Finance
              </span>
              <span>Privacy-First Expense Analytics & Budget Velocity</span>
            </div>
          </div>

          {/* Privacy badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F7F4] border border-[#D5E0D6] text-[11px] text-[#0D5C3A] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Local Sovereign Sandbox • Zero Server Retention</span>
          </div>

          {/* Metadata */}
          <div className="text-right text-[11px] text-stone-500">
            <p className="flex items-center gap-1 md:justify-end">
              <Lock className="w-3 h-3 text-[#0D5C3A]" />
              Data resides strictly inside browser <code className="font-mono bg-stone-100 px-1 rounded">localStorage</code>
            </p>
            <p className="mt-0.5">© 2026 Pennywise. Professional Developer Portfolio Exhibition.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
