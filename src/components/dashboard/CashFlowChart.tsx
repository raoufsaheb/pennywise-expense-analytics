import React, { useState } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import {
  calculateMultiMonthCashFlow,
  formatCurrency,
} from '../../lib/financialMath';

export const CashFlowChart: React.FC = () => {
  const { transactions, availableMonths, selectedMonth, setSelectedMonth } =
    useFinanceStore();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take chronological order (oldest to newest)
  const chronologicalMonths = [...availableMonths].reverse();
  const data = calculateMultiMonthCashFlow(transactions, chronologicalMonths);

  // Compute maximum value for scaling
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expenses]),
    1000
  );

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingBottom = 30;
  const paddingTop = 20;
  const chartHeight = svgHeight - paddingBottom - paddingTop;
  const groupWidth = svgWidth / data.length;
  const barWidth = 16;
  const gap = 4;

  return (
    <div className="bg-white rounded-2xl border border-[#E1E8E2] p-6 shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-sans font-bold text-base text-[#0B1B14]">
            Income vs. Expenses Trend
          </h3>
          <p className="text-xs text-[#52665B]">
            6-Month cash flow comparison & savings velocity
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#10B981]" />
            <span className="text-[#52665B] font-medium">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0B1B14]" />
            <span className="text-[#52665B] font-medium">Expenses</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 select-none"
          role="img"
          aria-label="6-Month Income and Expenses Bar Chart"
        >
          {/* Subtle grid lines */}
          <line
            x1="0"
            y1={paddingTop + chartHeight * 0.25}
            x2={svgWidth}
            y2={paddingTop + chartHeight * 0.25}
            stroke="#EAEFEA"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={paddingTop + chartHeight * 0.5}
            x2={svgWidth}
            y2={paddingTop + chartHeight * 0.5}
            stroke="#EAEFEA"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={paddingTop + chartHeight * 0.75}
            x2={svgWidth}
            y2={paddingTop + chartHeight * 0.75}
            stroke="#EAEFEA"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={svgHeight - paddingBottom}
            x2={svgWidth}
            y2={svgHeight - paddingBottom}
            stroke="#D5E0D6"
            strokeWidth="1.5"
          />

          {/* Month Bars */}
          {data.map((item, idx) => {
            const centerX = idx * groupWidth + groupWidth / 2;
            const incomeHeight = (item.income / maxVal) * chartHeight;
            const expensesHeight = (item.expenses / maxVal) * chartHeight;

            const incomeY = svgHeight - paddingBottom - incomeHeight;
            const expensesY = svgHeight - paddingBottom - expensesHeight;

            const isSelected = item.month === selectedMonth;
            const isHovered = hoveredIndex === idx;

            return (
              <g
                key={item.month}
                className="cursor-pointer transition-opacity"
                onClick={() => setSelectedMonth(item.month)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Active/Hover column highlight */}
                {(isSelected || isHovered) && (
                  <rect
                    x={idx * groupWidth + 6}
                    y={paddingTop - 10}
                    width={groupWidth - 12}
                    height={chartHeight + 20}
                    rx="8"
                    fill={isSelected ? '#EBF5EE' : '#F4F7F4'}
                    opacity={0.8}
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={centerX - barWidth - gap / 2}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(2, incomeHeight)}
                  rx="3"
                  fill="#10B981"
                  className="transition-all duration-300"
                />

                {/* Expenses Bar */}
                <rect
                  x={centerX + gap / 2}
                  y={expensesY}
                  width={barWidth}
                  height={Math.max(2, expensesHeight)}
                  rx="3"
                  fill="#0B1B14"
                  className="transition-all duration-300"
                />

                {/* X-Axis Month Label */}
                <text
                  x={centerX}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-medium transition-colors ${
                    isSelected ? 'fill-[#0D5C3A] font-bold' : 'fill-[#52665B]'
                  }`}
                >
                  {item.monthLabel.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div className="absolute top-2 right-4 bg-white/95 backdrop-blur-xs border border-[#D5E0D6] rounded-xl p-3 shadow-lg pointer-events-none text-xs font-sans">
            <span className="font-bold text-stone-900 block mb-1">
              {data[hoveredIndex].monthLabel}
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-[#10B981] font-medium">Income:</span>
              <span className="font-mono font-semibold text-right">
                {formatCurrency(data[hoveredIndex].income)}
              </span>
              <span className="text-stone-700 font-medium">Expenses:</span>
              <span className="font-mono font-semibold text-right">
                {formatCurrency(data[hoveredIndex].expenses)}
              </span>
              <span className="text-[#0D5C3A] font-medium pt-1 border-t border-stone-200">
                Net Savings:
              </span>
              <span className="font-mono font-semibold text-right pt-1 border-t border-stone-200 text-[#0D5C3A]">
                +{formatCurrency(data[hoveredIndex].netSavings)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-[11px] text-[#52665B] flex items-center justify-between">
        <span>Click any column to switch active analytics month</span>
        <span className="font-mono font-semibold text-[#0D5C3A]">
          Active: {data.find((d) => d.month === selectedMonth)?.monthLabel}
        </span>
      </div>
    </div>
  );
};
