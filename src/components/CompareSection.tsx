import React from 'react';
import { FinanceCardData } from '../types/finance';
import { calculateCardTotals, calculateDelta, getTopAssetDeltas } from '../utils/calculations';
import { formatCurrency, formatDeltaNumber, formatPercent } from '../utils/formatters';
import { 
  ArrowRightLeft, 
  Calendar, 
  Sparkles,
  Zap
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
  const topAssetDeltas = getTopAssetDeltas(baseCard, compareCard, 4);

  const totalDeltaFormatted = formatDeltaNumber(delta.total.diff);
  const liquidDeltaFormatted = formatDeltaNumber(delta.liquid.diff);
  const nonLiquidDeltaFormatted = formatDeltaNumber(delta.nonLiquid.diff);

  return (
    <section className="w-full max-w-[480px] mx-auto space-y-1.5 flex flex-col items-center">
      {/* Section Header */}
      <div className="w-full flex items-center justify-between gap-1 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1 text-cyan-400">
          <ArrowRightLeft className="w-3 h-3" />
          <h2 className="text-xs font-bold text-white tracking-wide">Compare Cards</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-1 text-[10px]">
          <select
            value={baseCard.id}
            onChange={(e) => onSelectBaseCard(e.target.value)}
            className="bg-slate-900 text-slate-200 text-[9px] rounded px-1 py-0.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {cards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.monthYear} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
          <span className="text-slate-500 text-[8px]">vs</span>
          <select
            value={compareCard.id}
            onChange={(e) => onSelectCompareCard(e.target.value)}
            className="bg-slate-900 text-slate-200 text-[9px] rounded px-1 py-0.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            {cards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.monthYear} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Cards Side-by-Side in 3 Columns - 100% fits within container with NO SCROLLING! */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {/* ================= CARD 1: LATEST / BASE ================= */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-1.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[9px]">
              <div className="flex items-center gap-0.5 font-bold font-mono-num text-emerald-400 truncate">
                <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                <span>{baseCard.monthYear}</span>
              </div>
              <span className="text-[7px] font-bold uppercase px-1 rounded bg-emerald-500/20 text-emerald-300">
                Latest
              </span>
            </div>

            {/* Total */}
            <div className="p-1 rounded bg-slate-950/80 border border-slate-800/80 text-[9px]">
              <div className="text-[8px] text-slate-400">Total:</div>
              <div className="font-bold font-mono-num text-white truncate text-[10px]">
                {formatCurrency(baseTotals.totalAssets, { compact: true })}
              </div>
            </div>

            {/* Liquid & Non-Liquid */}
            <div className="space-y-0.5 text-[8px] font-mono-num">
              <div className="p-0.5 rounded bg-cyan-950/20 text-cyan-300 flex justify-between">
                <span className="text-slate-400">L:</span>
                <span className="font-semibold">{formatCurrency(baseTotals.liquidTotal, { compact: true })}</span>
              </div>
              <div className="p-0.5 rounded bg-purple-950/20 text-purple-300 flex justify-between">
                <span className="text-slate-400">NL:</span>
                <span className="font-semibold">{formatCurrency(baseTotals.nonLiquidTotal, { compact: true })}</span>
              </div>
            </div>

            {/* Largest delta top 4 assets */}
            <div className="pt-1 border-t border-slate-800/60 text-[8px] space-y-0.5">
              <div className="text-[7px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>Largest delta</span>
              </div>
              {topAssetDeltas.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-[8px]">
                  <span className="truncate max-w-[55px] text-slate-400" title={item.name}>{item.name}</span>
                  <span className="font-mono-num text-slate-200">
                    {formatCurrency(item.baseVal, { compact: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[7px] text-slate-500 text-center">
            Base
          </div>
        </div>

        {/* ================= CARD 2: COMPARE / PAST ================= */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-1.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[9px]">
              <div className="flex items-center gap-0.5 font-bold font-mono-num text-cyan-400 truncate">
                <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                <span>{compareCard.monthYear}</span>
              </div>
              <span className="text-[7px] font-bold uppercase px-1 rounded bg-cyan-500/20 text-cyan-300">
                Compare
              </span>
            </div>

            {/* Total */}
            <div className="p-1 rounded bg-slate-950/80 border border-slate-800/80 text-[9px]">
              <div className="text-[8px] text-slate-400">Total:</div>
              <div className="font-bold font-mono-num text-white truncate text-[10px]">
                {formatCurrency(compareTotals.totalAssets, { compact: true })}
              </div>
            </div>

            {/* Liquid & Non-Liquid */}
            <div className="space-y-0.5 text-[8px] font-mono-num">
              <div className="p-0.5 rounded bg-cyan-950/20 text-cyan-300 flex justify-between">
                <span className="text-slate-400">L:</span>
                <span className="font-semibold">{formatCurrency(compareTotals.liquidTotal, { compact: true })}</span>
              </div>
              <div className="p-0.5 rounded bg-purple-950/20 text-purple-300 flex justify-between">
                <span className="text-slate-400">NL:</span>
                <span className="font-semibold">{formatCurrency(compareTotals.nonLiquidTotal, { compact: true })}</span>
              </div>
            </div>

            {/* Largest delta top 4 assets */}
            <div className="pt-1 border-t border-slate-800/60 text-[8px] space-y-0.5">
              <div className="text-[7px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>Largest delta</span>
              </div>
              {topAssetDeltas.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-[8px]">
                  <span className="truncate max-w-[55px] text-slate-400" title={item.name}>{item.name}</span>
                  <span className="font-mono-num text-slate-200">
                    {formatCurrency(item.compareVal, { compact: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[7px] text-slate-500 text-center">
            Target
          </div>
        </div>

        {/* ================= CARD 3: DELTA CARD ================= */}
        <div className="rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 p-1.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[9px]">
              <div className="flex items-center gap-0.5 font-bold text-emerald-300">
                <Sparkles className="w-2.5 h-2.5 flex-shrink-0" />
                <span>Delta</span>
              </div>
              <span className={`text-[7px] font-bold px-1 rounded ${totalDeltaFormatted.colorClass} ${totalDeltaFormatted.bgClass}`}>
                {formatPercent(delta.total.percent)}
              </span>
            </div>

            {/* Total Delta */}
            <div className="p-1 rounded bg-slate-950/80 border border-emerald-500/20 text-[9px]">
              <div className="text-[8px] text-slate-400">Total &Delta;:</div>
              <div className={`font-bold font-mono-num truncate text-[10px] ${totalDeltaFormatted.colorClass}`}>
                {totalDeltaFormatted.text}
              </div>
            </div>

            {/* Liquid & Non-Liquid Deltas */}
            <div className="space-y-0.5 text-[8px] font-mono-num">
              <div className="p-0.5 rounded bg-cyan-950/20 flex justify-between">
                <span className="text-slate-400">L &Delta;:</span>
                <span className={`font-semibold ${liquidDeltaFormatted.colorClass}`}>{liquidDeltaFormatted.text}</span>
              </div>
              <div className="p-0.5 rounded bg-purple-950/20 flex justify-between">
                <span className="text-slate-400">NL &Delta;:</span>
                <span className={`font-semibold ${nonLiquidDeltaFormatted.colorClass}`}>{nonLiquidDeltaFormatted.text}</span>
              </div>
            </div>

            {/* Largest delta top 4 asset changes */}
            <div className="pt-1 border-t border-slate-800/60 text-[8px] space-y-0.5">
              <div className="text-[7px] uppercase font-bold text-slate-400 flex items-center gap-0.5">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>Asset &Delta;</span>
              </div>
              {topAssetDeltas.map((item) => {
                const isPos = item.diff > 0;
                const isZero = item.diff === 0;
                return (
                  <div key={item.name} className="flex justify-between items-center text-[8px]">
                    <span className="truncate max-w-[50px] text-slate-400" title={item.name}>{item.name}</span>
                    <span className={`font-mono-num font-semibold ${isPos ? 'text-emerald-400' : isZero ? 'text-slate-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}{formatCurrency(item.diff, { compact: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-1 text-[7px] text-emerald-400 font-semibold text-center truncate">
            {delta.total.diff >= 0 ? 'Net Growth' : 'Net Decline'}
          </div>
        </div>
      </div>
    </section>
  );
};
