import React, { useState, useMemo } from 'react';
import { FinanceCardData } from '../types/finance';
import { calculateCardTotals, parseMonthYear } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { TrendingUp, Eye, EyeOff, Coins, Landmark, Wallet } from 'lucide-react';

interface AssetsChartProps {
  cards: FinanceCardData[];
}

export const AssetsChart: React.FC<AssetsChartProps> = ({ cards }) => {
  // Requirement: "By default, it should only show the total assets line."
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

  // Compute scale boundaries
  const { minVal, maxVal } = useMemo(() => {
    if (chartData.length === 0) return { minVal: 0, maxVal: 100000 };

    let allValues: number[] = [];
    chartData.forEach((d) => {
      if (showTotal) allValues.push(d.totalAssets);
      if (showLiquid) allValues.push(d.liquidTotal);
      if (showNonLiquid) allValues.push(d.nonLiquidTotal);
    });

    if (allValues.length === 0) {
      allValues = chartData.map((d) => d.totalAssets);
    }

    const min = Math.max(0, Math.min(...allValues) * 0.9);
    const max = Math.max(...allValues) * 1.1 || 100000;
    return { minVal: min, maxVal: max };
  }, [chartData, showTotal, showLiquid, showNonLiquid]);

  // SVG Chart dimensions - compact and minimalist
  const width = 760;
  const height = 240;
  const padding = { top: 20, right: 20, bottom: 30, left: 60 };
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

  // Generate Area Path for gentle gradient fill
  const generateAreaPath = (dataKey: 'totalAssets') => {
    if (chartData.length === 0) return '';
    const linePath = generateLinePath(dataKey);
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Y-axis ticks (3 ticks)
  const yTicks = [0, 0.5, 1].map((ratio) => {
    const value = minVal + ratio * (maxVal - minVal);
    const y = padding.top + innerHeight - ratio * innerHeight;
    return { value, y };
  });

  const activeHoverData = hoveredPointIndex !== null ? chartData[hoveredPointIndex] : null;

  return (
    <section className="w-full max-w-4xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-md space-y-3">
      {/* Header & Line Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              Assets Over Time
            </h2>
            <p className="text-[10px] text-slate-400">
              Toggle lines below. Hover to view snapshot details.
            </p>
          </div>
        </div>

        {/* Minimalist Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Total Assets Toggle */}
          <button
            onClick={() => setShowTotal(!showTotal)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              showTotal
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showTotal ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Total Assets</span>
          </button>

          {/* Liquid Assets Toggle */}
          <button
            onClick={() => setShowLiquid(!showLiquid)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              showLiquid
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showLiquid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Liquid Total</span>
          </button>

          {/* Non-liquid Assets Toggle */}
          <button
            onClick={() => setShowNonLiquid(!showNonLiquid)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              showNonLiquid
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-slate-800/60 text-slate-500 border-slate-700/60 hover:text-slate-300'
            }`}
          >
            {showNonLiquid ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Non-liquid Total</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full overflow-hidden">
        {chartData.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-slate-500 text-xs">
            Not enough data to plot graph. Add month cards to see graph.
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto select-none"
              style={{ maxHeight: '250px' }}
            >
              <defs>
                <linearGradient id="totalGradientMini" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={width - padding.right}
                    y2={tick.y}
                    stroke="rgba(51, 65, 85, 0.3)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padding.left - 8}
                    y={tick.y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {formatCurrency(tick.value, { compact: true })}
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
                <path d={generateAreaPath('totalAssets')} fill="url(#totalGradientMini)" />
              )}

              {/* Liquid Assets Line */}
              {showLiquid && (
                <path
                  d={generateLinePath('liquidTotal')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
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
                  strokeWidth="2.5"
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
                  strokeWidth="2.5"
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
                        r={isHovered ? 4.5 : 3}
                        fill="#06b6d4"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    {showNonLiquid && (
                      <circle
                        cx={x}
                        cy={getY(d.nonLiquidTotal)}
                        r={isHovered ? 4.5 : 3}
                        fill="#a855f7"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    {showTotal && (
                      <circle
                        cx={x}
                        cy={getY(d.totalAssets)}
                        r={isHovered ? 5 : 3.5}
                        fill="#10b981"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                    )}

                    <text
                      x={x}
                      y={padding.top + innerHeight + 18}
                      textAnchor="middle"
                      fill={isHovered ? '#34d399' : '#94a3b8'}
                      fontSize="10"
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

        {/* Minimalist Hover Tooltip */}
        {activeHoverData && (
          <div className="mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-mono-num font-bold text-[10px]">
                {activeHoverData.monthYear}
              </span>
              <span className="text-slate-400">Snapshot:</span>
            </div>

            <div className="flex items-center gap-3 font-mono-num text-[11px]">
              {showTotal && (
                <div className="flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-400">Total:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(activeHoverData.totalAssets)}</span>
                </div>
              )}
              {showLiquid && (
                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-400">Liquid:</span>
                  <span className="text-cyan-400 font-bold">{formatCurrency(activeHoverData.liquidTotal)}</span>
                </div>
              )}
              {showNonLiquid && (
                <div className="flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-purple-400" />
                  <span className="text-slate-400">Non-liquid:</span>
                  <span className="text-purple-400 font-bold">{formatCurrency(activeHoverData.nonLiquidTotal)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
