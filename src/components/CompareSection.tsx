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

  const renderDeltaBox = (
    label: string,
    icon: React.ReactNode,
    metric: { base: number; target: number; diff: number; percent: number },
    color: 'emerald' | 'cyan' | 'purple'
  ) => {
    const formatted = formatDeltaNumber(metric.diff);

    const themeBorder = {
      cyan: 'border-cyan-900/40 bg-cyan-950/20',
      purple: 'border-purple-900/40 bg-purple-950/20',
      emerald: 'border-emerald-900/40 bg-emerald-950/20',
    }[color];

    return (
      <div className={`p-2.5 rounded-xl border ${themeBorder} space-y-1.5`}>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <div className="flex items-center gap-1">
            {icon}
            <span>{label}</span>
          </div>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${formatted.colorClass} ${formatted.bgClass}`}>
            {formatted.isPositive ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : formatted.isNeutral ? (
              <Minus className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            <span>{formatPercent(metric.percent)}</span>
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-0.5">
          <span className="text-[10px] text-slate-400">Delta:</span>
          <span className={`text-sm font-bold font-mono-num ${formatted.colorClass}`}>
            {formatted.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-800/80">
          <span>{baseCard.monthYear}: <strong className="text-slate-200">{formatCurrency(metric.base, { compact: true })}</strong></span>
          <span>vs</span>
          <span>{compareCard.monthYear}: <strong className="text-slate-300">{formatCurrency(metric.target, { compact: true })}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full space-y-3 flex flex-col items-center">
      {/* Section Header */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Compare Cards & Delta
            </h2>
            <p className="text-[10px] text-slate-400">
              Comparing latest {baseCard.monthYear} with past {compareCard.monthYear}
            </p>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <select
            value={baseCard.id}
            onChange={(e) => onSelectBaseCard(e.target.value)}
            className="bg-slate-900 text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:border-emerald-500"
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
            className="bg-slate-900 text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            {cards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.monthYear} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Small Vertical Rectangle Cards Side-by-Side */}
      <div className="w-full flex flex-wrap lg:flex-nowrap justify-center gap-3 pt-2">
        {/* CARD 1: Latest Card Snapshot */}
        <div className="w-[300px] sm:w-[320px] min-h-[580px] max-h-[660px] rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1 text-xs font-bold font-mono-num text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Month: {baseCard.monthYear}</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Latest
              </span>
            </div>

            <div className="my-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Assets</span>
              <div className="text-xl font-bold font-mono-num text-white mt-0.5">
                {formatCurrency(baseTotals.totalAssets)}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-900/30">
                <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                  <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-cyan-400" /> Liquid Total:</span>
                  <span className="font-mono-num font-bold">{formatCurrency(baseTotals.liquidTotal)}</span>
                </div>
                <div className="mt-1.5 pt-1 border-t border-cyan-950/60 text-[10px] text-slate-400 flex justify-between">
                  <span>Banks: {formatCurrency(baseTotals.banksTotal)}</span>
                  <span>Stocks: {formatCurrency(baseTotals.stocksTotal)}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                  <span className="flex items-center gap-1"><Landmark className="w-3 h-3 text-purple-400" /> Non-liquid Total:</span>
                  <span className="font-mono-num font-bold">{formatCurrency(baseTotals.nonLiquidTotal)}</span>
                </div>
                <div className="mt-1.5 pt-1 border-t border-purple-950/60 text-[10px] text-slate-400 flex justify-between">
                  <span>CPF: {formatCurrency(baseTotals.cpfTotal)}</span>
                  <span>Property: {formatCurrency(baseTotals.propertyTotal)}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[10px] space-y-1 text-slate-400">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Key Items</div>
                {baseCard.banks.slice(0, 2).map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span>{b.name}</span>
                    <span className="font-mono-num text-slate-300">{formatCurrency(b.value)}</span>
                  </div>
                ))}
                {baseCard.stocks.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="font-mono-num text-slate-300">{formatCurrency(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Baseline Card
          </div>
        </div>

        {/* CARD 2: Compared Past Card */}
        <div className="w-[300px] sm:w-[320px] min-h-[580px] max-h-[660px] rounded-2xl bg-slate-900 border border-slate-800 p-3.5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1 text-xs font-bold font-mono-num text-cyan-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>Month: {compareCard.monthYear}</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Selected Past
              </span>
            </div>

            <div className="my-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Assets</span>
              <div className="text-xl font-bold font-mono-num text-white mt-0.5">
                {formatCurrency(compareTotals.totalAssets)}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-cyan-950/20 border border-cyan-900/30">
                <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                  <span className="flex items-center gap-1"><Coins className="w-3 h-3 text-cyan-400" /> Liquid Total:</span>
                  <span className="font-mono-num font-bold">{formatCurrency(compareTotals.liquidTotal)}</span>
                </div>
                <div className="mt-1.5 pt-1 border-t border-cyan-950/60 text-[10px] text-slate-400 flex justify-between">
                  <span>Banks: {formatCurrency(compareTotals.banksTotal)}</span>
                  <span>Stocks: {formatCurrency(compareTotals.stocksTotal)}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-purple-950/20 border border-purple-900/30">
                <div className="flex items-center justify-between text-[11px] font-semibold text-purple-300">
                  <span className="flex items-center gap-1"><Landmark className="w-3 h-3 text-purple-400" /> Non-liquid Total:</span>
                  <span className="font-mono-num font-bold">{formatCurrency(compareTotals.nonLiquidTotal)}</span>
                </div>
                <div className="mt-1.5 pt-1 border-t border-purple-950/60 text-[10px] text-slate-400 flex justify-between">
                  <span>CPF: {formatCurrency(compareTotals.cpfTotal)}</span>
                  <span>Property: {formatCurrency(compareTotals.propertyTotal)}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[10px] space-y-1 text-slate-400">
                <div className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Key Items</div>
                {compareCard.banks.slice(0, 2).map((b) => (
                  <div key={b.id} className="flex justify-between">
                    <span>{b.name}</span>
                    <span className="font-mono-num text-slate-300">{formatCurrency(b.value)}</span>
                  </div>
                ))}
                {compareCard.stocks.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="font-mono-num text-slate-300">{formatCurrency(s.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Comparison Target
          </div>
        </div>

        {/* CARD 3: Third Generated DELTA Card */}
        <div className="w-[300px] sm:w-[320px] min-h-[580px] max-h-[660px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 p-3.5 flex flex-col justify-between shadow-xl shadow-emerald-950/30 relative">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Delta Card</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {baseCard.monthYear} vs {compareCard.monthYear}
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {/* Total Assets Delta */}
              {renderDeltaBox(
                'Total Assets Delta',
                <Wallet className="w-3 h-3 text-emerald-400" />,
                delta.total,
                'emerald'
              )}

              {/* Liquid Assets Total Delta */}
              {renderDeltaBox(
                'Liquid Assets Delta',
                <Coins className="w-3 h-3 text-cyan-400" />,
                delta.liquid,
                'cyan'
              )}

              {/* Non-liquid Assets Total Delta */}
              {renderDeltaBox(
                'Non-liquid Delta',
                <Layers className="w-3 h-3 text-purple-400" />,
                delta.nonLiquid,
                'purple'
              )}
            </div>
          </div>

          {/* Bottom Summary */}
          <div className="pt-2.5 border-t border-slate-800/80 text-center text-[11px]">
            {delta.total.diff >= 0 ? (
              <span className="text-emerald-400 font-semibold font-mono-num">
                +{formatCurrency(delta.total.diff)} (+{delta.total.percent.toFixed(1)}%)
              </span>
            ) : (
              <span className="text-rose-400 font-semibold font-mono-num">
                -{formatCurrency(Math.abs(delta.total.diff))} ({delta.total.percent.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
