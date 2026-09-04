import React, { useState, useMemo } from 'react';
import { FinanceCardData } from '../types/finance';
import { calculateCardTotals, parseMonthYear } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Eye, EyeOff, Coins, Landmark, Wallet } from 'lucide-react';

interface AssetsChartProps {
  cards: FinanceCardData[];
}

export const AssetsChart: React.FC<AssetsChartProps> = ({ cards }) => {
  // Default: only show total assets line
  const [showTotal, setShowTotal] = useState<boolean>(true);
  const [showLiquid, setShowLiquid] = useState<boolean>(false);
  const [showNonLiquid, setShowNonLiquid] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Chronologically sort data (oldest to newest for the graph timeline)
  const chartData = useMemo(() => {
    return [...cards]
      .sort((a, b) => {
        const timeA = parseMonthYear(a.monthYear).timestamp || a.createdAt;
        const timeB = parseMonthYear(b.monthYear).timestamp || b.createdAt;
        return timeA - timeB;
      })
      .map((card) => {
        const totals = calculateCardTotals(card);
        return {
          id: card.id,
          monthYear: card.monthYear,
          totalAssets: totals.totalAssets,
          liquidTotal: totals.liquidTotal,
          nonLiquidTotal: totals.nonLiquidTotal,
        };
      });
  }, [cards]);

  // Requirement: "on the y axis, the lowest value should always be 0 it should not auto fit the graph"
  const { minVal, maxVal } = useMemo(() => {
    const min = 0; // Always strictly 0!

    if (chartData.length === 0) return { minVal: min, maxVal: 100000 };

    let allValues: number[] = [];
    chartData.forEach((d) => {
      if (showTotal) allValues.push(d.totalAssets);
      if (showLiquid) allValues.push(d.liquidTotal);
      if (showNonLiquid) allValues.push(d.nonLiquidTotal);
    });

    if (allValues.length === 0) {
      allValues = chartData.map((d) => d.totalAssets);
    }

    const peak = Math.max(...allValues, 10000);
    const max = peak * 1.15;
    return { minVal: min, maxVal: max };
  }, [chartData, showTotal, showLiquid, showNonLiquid]);

  // SVG Chart dimensions - compact and half width (~480px)
  const width = 460;
  const height = 210;
  const padding = { top: 15, right: 15, bottom: 25, left: 52 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Coordinate helpers
  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    const clamped = Math.max(minVal, Math.min(maxVal, val));
    return padding.top + innerHeight - ((clamped - minVal) / range) * innerHeight;
  };

  // Generate SVG path for a line
  const generateLinePath = (dataKey: 'totalAssets' | 'liquidTotal' | 'nonLiquidTotal') => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, point, index) => {
      const x = getX(index);
      const y = getY(point[dataKey]);
      return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Generate Area Path for gradient fill
  const generateAreaPath = (dataKey: 'totalAssets') => {
    if (chartData.length === 0) return '';
    const linePath = generateLinePath(dataKey);
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Y-axis ticks starting strictly from 0
  const yTicks = [0, 0.5, 1].map((ratio) => {
    const value = minVal + ratio * (maxVal - minVal);
    const y = padding.top + innerHeight - ratio * innerHeight;
    return { value, y };
  });

  const activeHoverData = hoveredPointIndex !== null ? chartData[hoveredPointIndex] : null;

  return (
    <section className="w-full max-w-[480px] mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-3 shadow-md space-y-2">
      {/* Header & Line Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3 h-3" />
          </div>
          <h2 className="text-xs font-bold text-white tracking-wide">
            Assets Over Time
          </h2>
        </div>

        {/* Minimalist Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setShowTotal(!showTotal)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
              showTotal
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showTotal ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            <span>Total</span>
          </button>

          <button
            onClick={() => setShowLiquid(!showLiquid)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
              showLiquid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showLiquid ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span>Liquid</span>
          </button>

          <button
            onClick={() => setShowNonLiquid(!showNonLiquid)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
              showNonLiquid
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showNonLiquid ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
            <span className="w-1 h-1 rounded-full bg-purple-400"></span>
            <span>Non-liquid</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full overflow-hidden">
        {chartData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-[10px]">
            Not enough data to plot.
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '220px' }}
            >
              <defs>
                <linearGradient id="totalGradientMini2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines - Lowest value is strictly 0 */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={width - padding.right}
                    y2={tick.y}
                    stroke="rgba(51, 65, 85, 0.3)"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={tick.y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {tick.value === 0 ? '$0' : formatCurrency(tick.value, { compact: true })}
                  </text>
                </g>
              ))}

              {/* X Axis Line */}
              <line
                x1={padding.left}
                y1={padding.top + innerHeight}
                x2={width - padding.right}
                y2={padding.top + innerHeight}
                stroke="#334155"
                strokeWidth="1"
              />

              {/* Area Under Total Assets */}
              {showTotal && (
                <path d={generateAreaPath('totalAssets')} fill="url(#totalGradientMini2)" />
              )}

              {/* Liquid Assets Line */}
              {showLiquid && (
                <path
                  d={generateLinePath('liquidTotal')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Non-liquid Assets Line */}
              {showNonLiquid && (
                <path
                  d={generateLinePath('nonLiquidTotal')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Total Assets Line */}
              {showTotal && (
                <path
                  d={generateLinePath('totalAssets')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data points & hover triggers */}
              {chartData.map((d, index) => {
                const x = getX(index);
                const isHovered = hoveredPointIndex === index;

                return (
                  <g key={d.id}>
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + innerHeight}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    {showLiquid && (
                      <circle
                        cx={x}
                        cy={getY(d.liquidTotal)}
                        r={isHovered ? 4 : 2.5}
                        fill="#06b6d4"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    {showNonLiquid && (
                      <circle
                        cx={x}
                        cy={getY(d.nonLiquidTotal)}
                        r={isHovered ? 4 : 2.5}
                        fill="#a855f7"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    {showTotal && (
                      <circle
                        cx={x}
                        cy={getY(d.totalAssets)}
                        r={isHovered ? 4.5 : 3}
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    <text
                      x={x}
                      y={padding.top + innerHeight + 16}
                      textAnchor="middle"
                      fill={isHovered ? '#34d399' : '#94a3b8'}
                      fontSize="9"
                      fontWeight={isHovered ? '700' : '500'}
                      fontFamily="monospace"
                    >
                      {d.monthYear}
                    </text>

                    <rect
                      x={x - (innerWidth / chartData.length) / 2}
                      y={padding.top}
                      width={innerWidth / Math.max(1, chartData.length)}
                      height={innerHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(index)}
                      onTouchStart={() => setHoveredPointIndex(index)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Snapshot */}
        {activeHoverData && (
          <div className="mt-1.5 p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.2 rounded bg-slate-800 text-slate-200 font-mono-num font-bold text-[9px]">
                {activeHoverData.monthYear}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono-num text-[10px]">
              {showTotal && (
                <div className="flex items-center gap-0.5">
                  <Wallet className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{formatCurrency(activeHoverData.totalAssets)}</span>
                </div>
              )}
              {showLiquid && (
                <div className="flex items-center gap-0.5">
                  <Coins className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="text-cyan-400">{formatCurrency(activeHoverData.liquidTotal)}</span>
                </div>
              )}
              {showNonLiquid && (
                <div className="flex items-center gap-0.5">
                  <Landmark className="w-2.5 h-2.5 text-purple-400" />
                  <span className="text-purple-400">{formatCurrency(activeHoverData.nonLiquidTotal)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
