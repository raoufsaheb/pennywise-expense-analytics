import React, { useState } from 'react';
import { ShieldCheck, Lock, Database, Info, X } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="bg-[#EAEFEA] border-b border-[#D5E0D6] py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#0D5C3A]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D5C3A]" />
            </span>
            <span className="font-semibold tracking-wide">Privacy Sandbox Active:</span>
            <span className="text-[#3A5043] hidden sm:inline">
              Client-side encrypted • Zero telemetry • No third-party data broker leaks
            </span>
          </div>

          <button
            onClick={() => setShowInfo(true)}
            className="inline-flex items-center gap-1 text-[#0D5C3A] hover:text-[#083823] font-medium transition-colors cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>How your data is protected</span>
          </button>
        </div>
      </div>

      {/* Privacy Details Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#D5E0D6] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center text-[#0D5C3A]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-[#0B1B14]">
                  Zero-Telemetry Architecture
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Built on local sovereignty principles
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans text-stone-600 leading-relaxed">
              <div className="flex gap-3">
                <Database className="w-5 h-5 text-[#0D5C3A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">
                    100% In-Browser Storage
                  </span>
                  Your account balances, transaction records, and budgets live exclusively inside your browser&apos;s sandboxed local storage.
                </div>
              </div>

              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-[#0D5C3A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">
                    No Financial Aggregators
                  </span>
                  Unlike traditional apps that sell transaction feeds to consumer profiling networks, Pennywise requires no bank logins or third-party Plaid/Yodlee tokens.
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-[#0D5C3A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 block mb-0.5">
                    Deterministic Client-Side CSV Pipeline
                  </span>
                  Import and export pipelines operate as in-memory streams with zero server handshakes.
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 rounded-lg bg-[#0D5C3A] hover:bg-[#083823] text-white text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
