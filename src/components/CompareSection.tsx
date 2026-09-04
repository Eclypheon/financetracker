import React from 'react';
import { FinanceCardData } from '../types/finance';
import { calculateCardTotals, calculateDelta } from '../utils/calculations';
import { formatCurrency, formatDeltaNumber, formatPercent } from '../utils/formatters';
import { 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Calendar, 
  Coins, 
  Landmark, 
  Wallet,
  Sparkles,
  Layers
} from 'lucide-react';

interface CompareSectionProps {
  cards: FinanceCardData[];
  baseCardId: string;
  compareCardId: string | null;
  onSelectBaseCard: (id: string) => void;
  onSelectCompareCard: (id: string) => void;
}

export const CompareSection: React.FC<CompareSectionProps> = ({
  cards,
  baseCardId,
  compareCardId,
  onSelectBaseCard,
  onSelectCompareCard,
}) => {
  const baseCard = cards.find((c) => c.id === baseCardId) || cards[0];
  const compareCard = cards.find((c) => c.id === compareCardId) || (cards.length > 1 ? cards[1] : cards[0]);

  if (!baseCard || !compareCard) {
    return null;
  }

  const baseTotals = calculateCardTotals(baseCard);
  const compareTotals = calculateCardTotals(compareCard);
  const delta = calculateDelta(baseCard, compareCard);

  const renderDeltaMetric = (
    label: string,
    icon: React.ReactNode,
    metric: { base: number; target: number; diff: number; percent: number },
    colorTheme: 'cyan' | 'purple' | 'emerald'
  ) => {
    const formattedDelta = formatDeltaNumber(metric.diff);

    const themeBorder = {
      cyan: 'border-cyan-500/30 bg-cyan-950/20',
      purple: 'border-purple-500/30 bg-purple-950/20',
      emerald: 'border-emerald-500/30 bg-emerald-950/20',
    }[colorTheme];

    return (
      <div className={`p-4 rounded-xl border ${themeBorder} space-y-2`}>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${formattedDelta.colorClass} ${formattedDelta.bgClass} border ${formattedDelta.borderClass}`}>
            {formattedDelta.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : formattedDelta.isNeutral ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{formatPercent(metric.percent)}</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-xs text-slate-400">Net Delta:</span>
          <span className={`text-lg font-extrabold font-mono-num ${formattedDelta.colorClass}`}>
            {formattedDelta.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <span>{baseCard.monthYear}: <strong className="text-slate-200 font-mono-num">{formatCurrency(metric.base)}</strong></span>
          <span>&larr;</span>
          <span>{compareCard.monthYear}: <strong className="text-slate-300 font-mono-num">{formatCurrency(metric.target)}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full space-y-4">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Month-over-Month Asset Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Comparing latest record ({baseCard.monthYear}) with past snapshot ({compareCard.monthYear}) to see asset changes.
            </p>
          </div>
        </div>

        {/* Quick selector dropdowns */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Compare:</span>
            <select
              value={baseCard.id}
              onChange={(e) => onSelectBaseCard(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500"
            >
              {cards.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {c.monthYear} {idx === 0 ? '(Latest)' : ''}
                </option>
              ))}
            </select>
            <span className="text-slate-500">vs</span>
            <select
              value={compareCard.id}
              onChange={(e) => onSelectCompareCard(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-cyan-500"
            >
              {cards.map((c, idx) => (
                <option key={c.id} value={c.id}>
                  {c.monthYear} {idx === 0 ? '(Latest)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3-Column Comparison Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CARD 1: Latest Card (or Base Card) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Month: {baseCard.monthYear}</span>
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400">
                Primary (Latest)
              </span>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assets</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-white mt-0.5">
                {formatCurrency(baseTotals.totalAssets)}
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Liquid Assets Total:</span>
                </div>
                <span className="font-mono-num font-bold text-sm text-cyan-200">
                  {formatCurrency(baseTotals.liquidTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Landmark className="w-3.5 h-3.5 text-purple-400" />
                  <span>Non-liquid Assets Total:</span>
                </div>
                <span className="font-mono-num font-bold text-sm text-purple-200">
                  {formatCurrency(baseTotals.nonLiquidTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Banks: {formatCurrency(baseTotals.banksTotal, { compact: true })}</span>
            <span>Stocks: {formatCurrency(baseTotals.stocksTotal, { compact: true })}</span>
            <span>CPF: {formatCurrency(baseTotals.cpfTotal, { compact: true })}</span>
            <span>Prop: {formatCurrency(baseTotals.propertyTotal, { compact: true })}</span>
          </div>
        </div>

        {/* CARD 2: Compared Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Month: {compareCard.monthYear}</span>
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">
                Comparison Card
              </span>
            </div>

            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Assets</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-white mt-0.5">
                {formatCurrency(compareTotals.totalAssets)}
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                  <Coins className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Liquid Assets Total:</span>
                </div>
                <span className="font-mono-num font-bold text-sm text-cyan-200">
                  {formatCurrency(compareTotals.liquidTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <Landmark className="w-3.5 h-3.5 text-purple-400" />
                  <span>Non-liquid Assets Total:</span>
                </div>
                <span className="font-mono-num font-bold text-sm text-purple-200">
                  {formatCurrency(compareTotals.nonLiquidTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Banks: {formatCurrency(compareTotals.banksTotal, { compact: true })}</span>
            <span>Stocks: {formatCurrency(compareTotals.stocksTotal, { compact: true })}</span>
            <span>CPF: {formatCurrency(compareTotals.cpfTotal, { compact: true })}</span>
            <span>Prop: {formatCurrency(compareTotals.propertyTotal, { compact: true })}</span>
          </div>
        </div>

        {/* CARD 3: Third Generated DELTA Card */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-emerald-500/40 p-5 flex flex-col justify-between shadow-xl shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Delta ({baseCard.monthYear} vs {compareCard.monthYear})</span>
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300">
                Calculated
              </span>
            </div>

            <div className="space-y-3">
              {/* Total Assets Delta */}
              {renderDeltaMetric(
                'Total Assets Delta',
                <Wallet className="w-4 h-4 text-emerald-400" />,
                delta.total,
                'emerald'
              )}

              {/* Liquid Assets Total Delta */}
              {renderDeltaMetric(
                'Liquid Assets Total Delta',
                <Coins className="w-4 h-4 text-cyan-400" />,
                delta.liquid,
                'cyan'
              )}

              {/* Non-liquid Assets Total Delta */}
              {renderDeltaMetric(
                'Non-liquid Assets Total Delta',
                <Layers className="w-4 h-4 text-purple-400" />,
                delta.nonLiquid,
                'purple'
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-center text-slate-400">
            {delta.total.diff >= 0 ? (
              <span className="text-emerald-400 font-semibold">
                Net wealth increased by {formatCurrency(delta.total.diff)} ({formatPercent(delta.total.percent)})
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                Net wealth decreased by {formatCurrency(Math.abs(delta.total.diff))} ({formatPercent(delta.total.percent)})
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
