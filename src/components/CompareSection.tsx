import React from 'react';
import { FinanceCardData } from '../types/finance';
import { calculateCardTotals, calculateDelta, getTopAssetDeltas } from '../utils/calculations';
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
  Layers,
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
      <div className={`p-1.5 rounded-lg border ${themeBorder} space-y-0.5`}>
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
          <div className="flex items-center gap-1">
            {icon}
            <span>{label}</span>
          </div>
          <span className={`flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold ${formatted.colorClass} ${formatted.bgClass}`}>
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
          <span className="text-[9px] text-slate-400">Delta:</span>
          <span className={`text-[11px] font-bold font-mono-num ${formatted.colorClass}`}>
            {formatted.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-[8px] text-slate-400 pt-0.5 border-t border-slate-800/70">
          <span>{baseCard.monthYear}: <strong className="text-slate-200">{formatCurrency(metric.base, { compact: true })}</strong></span>
          <span>vs</span>
          <span>{compareCard.monthYear}: <strong className="text-slate-300">{formatCurrency(metric.target, { compact: true })}</strong></span>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full max-w-[480px] mx-auto space-y-2 flex flex-col items-center">
      {/* Section Header */}
      <div className="w-full flex items-center justify-between gap-1.5 pb-1 border-b border-slate-800">
        <div className="flex items-center gap-1 text-cyan-400">
          <ArrowRightLeft className="w-3 h-3" />
          <h2 className="text-xs font-bold text-white tracking-wide">Compare</h2>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-1 text-[10px]">
          <select
            value={baseCard.id}
            onChange={(e) => onSelectBaseCard(e.target.value)}
            className="bg-slate-900 text-slate-200 text-[10px] rounded px-1.5 py-0.5 border border-slate-800 focus:outline-none focus:border-emerald-500"
          >
            {cards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.monthYear} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
          <span className="text-slate-500 text-[9px]">vs</span>
          <select
            value={compareCard.id}
            onChange={(e) => onSelectCompareCard(e.target.value)}
            className="bg-slate-900 text-slate-200 text-[10px] rounded px-1.5 py-0.5 border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            {cards.map((c, idx) => (
              <option key={c.id} value={c.id}>
                {c.monthYear} {idx === 0 ? '(Latest)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Small Side-by-Side Cards (Horizontal Scroll within ~480px width) */}
      <div className="w-full flex items-stretch gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {/* CARD 1: Latest Card Snapshot */}
        <div className="w-[230px] flex-shrink-0 rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px]">
              <div className="flex items-center gap-1 font-bold font-mono-num text-emerald-400">
                <Calendar className="w-2.5 h-2.5" />
                <span>{baseCard.monthYear}</span>
              </div>
              <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                Latest
              </span>
            </div>

            <div className="my-1.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-[9px] text-slate-400 font-semibold">Total:</span>
              <span className="font-bold font-mono-num text-white">{formatCurrency(baseTotals.totalAssets)}</span>
            </div>

            <div className="space-y-1">
              <div className="p-1 rounded bg-cyan-950/20 border border-cyan-900/30 flex justify-between text-[9px]">
                <span className="text-cyan-300 flex items-center gap-0.5"><Coins className="w-2 h-2" /> Liquid:</span>
                <span className="font-mono-num font-bold text-cyan-200">{formatCurrency(baseTotals.liquidTotal)}</span>
              </div>
              <div className="p-1 rounded bg-purple-950/20 border border-purple-900/30 flex justify-between text-[9px]">
                <span className="text-purple-300 flex items-center gap-0.5"><Landmark className="w-2 h-2" /> Non-liquid:</span>
                <span className="font-mono-num font-bold text-purple-200">{formatCurrency(baseTotals.nonLiquidTotal)}</span>
              </div>
            </div>

            {/* "Largest delta" section showing top 4 assets */}
            <div className="mt-1.5 p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[9px] space-y-0.5 text-slate-400">
              <div className="text-[8px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>Largest delta</span>
              </div>
              {topAssetDeltas.map((item) => (
                <div key={item.name} className="flex justify-between items-center pt-0.5">
                  <span className="truncate max-w-[120px] text-slate-300" title={item.name}>{item.name}:</span>
                  <span className="font-mono-num text-slate-200">{formatCurrency(item.baseVal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[8px] text-slate-500 text-center">
            Baseline
          </div>
        </div>

        {/* CARD 2: Compared Past Card */}
        <div className="w-[230px] flex-shrink-0 rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px]">
              <div className="flex items-center gap-1 font-bold font-mono-num text-cyan-400">
                <Calendar className="w-2.5 h-2.5" />
                <span>{compareCard.monthYear}</span>
              </div>
              <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                Compare
              </span>
            </div>

            <div className="my-1.5 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="text-[9px] text-slate-400 font-semibold">Total:</span>
              <span className="font-bold font-mono-num text-white">{formatCurrency(compareTotals.totalAssets)}</span>
            </div>

            <div className="space-y-1">
              <div className="p-1 rounded bg-cyan-950/20 border border-cyan-900/30 flex justify-between text-[9px]">
                <span className="text-cyan-300 flex items-center gap-0.5"><Coins className="w-2 h-2" /> Liquid:</span>
                <span className="font-mono-num font-bold text-cyan-200">{formatCurrency(compareTotals.liquidTotal)}</span>
              </div>
              <div className="p-1 rounded bg-purple-950/20 border border-purple-900/30 flex justify-between text-[9px]">
                <span className="text-purple-300 flex items-center gap-0.5"><Landmark className="w-2 h-2" /> Non-liquid:</span>
                <span className="font-mono-num font-bold text-purple-200">{formatCurrency(compareTotals.nonLiquidTotal)}</span>
              </div>
            </div>

            {/* "Largest delta" section showing top 4 assets in Compare Card */}
            <div className="mt-1.5 p-1.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-[9px] space-y-0.5 text-slate-400">
              <div className="text-[8px] uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1">
                <Zap className="w-2 h-2 text-amber-400" />
                <span>Largest delta</span>
              </div>
              {topAssetDeltas.map((item) => (
                <div key={item.name} className="flex justify-between items-center pt-0.5">
                  <span className="truncate max-w-[120px] text-slate-300" title={item.name}>{item.name}:</span>
                  <span className="font-mono-num text-slate-200">{formatCurrency(item.compareVal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 text-[8px] text-slate-500 text-center">
            Comparison Target
          </div>
        </div>

        {/* CARD 3: Third Generated DELTA Card */}
        <div className="w-[230px] flex-shrink-0 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 p-2 flex flex-col justify-between shadow-lg shadow-emerald-950/30">
          <div>
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px]">
              <div className="flex items-center gap-1 font-bold text-emerald-300">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Delta</span>
              </div>
              <span className="text-[8px] font-bold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                {baseCard.monthYear} vs {compareCard.monthYear}
              </span>
            </div>

            <div className="space-y-1 mt-1.5">
              {renderDeltaBox(
                'Total Assets',
                <Wallet className="w-2 h-2 text-emerald-400" />,
                delta.total,
                'emerald'
              )}
              {renderDeltaBox(
                'Liquid Total',
                <Coins className="w-2 h-2 text-cyan-400" />,
                delta.liquid,
                'cyan'
              )}
              {renderDeltaBox(
                'Non-liquid',
                <Layers className="w-2 h-2 text-purple-400" />,
                delta.nonLiquid,
                'purple'
              )}
            </div>

            {/* Delta values for top 4 assets */}
            <div className="mt-1.5 p-1 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[8px] space-y-0.5">
              <div className="text-[8px] font-semibold text-slate-400">Asset Deltas:</div>
              {topAssetDeltas.slice(0, 3).map((item) => {
                const isPos = item.diff > 0;
                const isZero = item.diff === 0;
                return (
                  <div key={item.name} className="flex justify-between items-center text-[8px]">
                    <span className="truncate max-w-[100px] text-slate-400">{item.name}:</span>
                    <span className={`font-mono-num font-semibold ${isPos ? 'text-emerald-400' : isZero ? 'text-slate-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}{formatCurrency(item.diff, { compact: true })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800/80 text-center text-[9px]">
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
