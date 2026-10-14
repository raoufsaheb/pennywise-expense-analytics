# Pennywise — Design Research & Visual Identity

## 1. Visual Research & Benchmarks

Modern personal finance applications fall into two extreme visual categories:
1. **Generic "Bank Blue" Web Portals**: Rigid, uninspiring grey tables with tiny fonts, aggressive promotional banners, and visual clutter.
2. **Hyper-Gamified "Neon Cyber" Apps**: Oversaturated gradients, excessive micro-animations, and meaningless crypto widgets that degrade trust.

Pennywise references high-trust modern fintech standards:
- **Mercury**: Calm layout density, clean financial typography, generous padding, and muted monochromatic hierarchy.
- **Monzo & Wealthfront**: Approachable green accents denoting financial growth, clean card containers, and visual cash flow summaries.
- **Copilot Money**: Intelligent recurring subscription tracking and intuitive category breakdowns.

---

## 2. Palette & Contrast Matrix

| Role | Color | Hex Code | Purpose |
|---|---|---|---|
| **Background Ground** | Sage Paper | `#F4F7F4` | Soft natural paper feel, reducing screen glare |
| **Card Surface** | Pure White | `#FFFFFF` | High-contrast container surface |
| **Primary Ink** | Deep Forest | `#0B1B14` | High-contrast text & structural borders |
| **Secondary Ink** | Slate Pine | `#4A5D53` | Subtitles, labels, and secondary metadata |
| **Brand Accent** | Viridian Emerald | `#0D5C3A` | Positive cash flow, primary buttons, on-track status |
| **Income Positive** | Mint Emerald | `#10B981` | Income inflows and savings rate badges |
| **Expense / Warning** | Crimson Burn | `#B91C1C` | Over-budget warnings, negative cash flow |
| **Pacing Alert** | Amber Horizon | `#D97706` | Approaching monthly cap before mid-month |

---

## 3. Typography Hierarchy

1. **Brand & UI Typography**: `Plus Jakarta Sans`
   - Bold, contemporary geometric grotesque with humanistic touches.
   - Used for headers, navigation, filter pills, and button labels.
2. **Financial Numerical Typography**: `JetBrains Mono`
   - Tabular figures (`font-feature-settings: 'tnum' 1`) ensure strict vertical decimal alignment in transaction ledgers and balance sheets.
   - Eliminates layout shifting when values increment.

---

## 4. Visual Components & Layout Patterns

1. **Net Worth & Liquidity Overview**:
   - Primary metric card showing total net worth with 30-day delta.
   - Sub-ledger breaking down Liquid Cash, Investments, and Credit Liabilities.
2. **Monthly Cash Flow Bar Chart**:
   - Dual-bar SVG chart comparing monthly Income vs. Expenses across the last 6 months.
   - Interactive hover tooltip showing net savings and savings rate.
3. **Budget Velocity Gauges**:
   - Horizontal progress meter with dual indicators: current spend bar and a subtle vertical line representing the current day of the month ($D_{\text{elapsed}} / D_{\text{total}}$).
   - If the spend bar exceeds the day indicator line, a warning badge highlights that burn rate is outpacing the calendar.
4. **Subscription Radar**:
   - Distinct cards for recurring services showing billing cycle, cost per month, and days until next charge.
5. **Privacy Shield Indicator**:
   - Prominent badge at top/footer reassuring the user: "Zero Telemetry • In-Browser Sandbox • No External Server Leaks".
