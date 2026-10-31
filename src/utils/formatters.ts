export const formatCurrency = (
  value: number,
  options: {
    showCents?: boolean;
    compact?: boolean;
    currencySymbol?: string;
  } = {}
): string => {
  const { showCents = false, compact = false, currencySymbol = '$' } = options;
  const num = Number(value) || 0;

  if (compact && Math.abs(num) >= 1000000) {
    return `${currencySymbol}${(num / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(num) >= 10000) {
    return `${currencySymbol}${(num / 1000).toFixed(1)}k`;
  }

  const formatted = new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(num);

  return `${currencySymbol}${formatted}`;
};

export const formatDeltaNumber = (
  diff: number,
  options: { currencySymbol?: string } = {}
): { text: string; isPositive: boolean; isNeutral: boolean; colorClass: string; bgClass: string; borderClass: string } => {
  const { currencySymbol = '$' } = options;
  const num = Number(diff) || 0;

  if (num === 0) {
    return {
      text: `${currencySymbol}0`,
      isPositive: false,
      isNeutral: true,
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-800/40',
      borderClass: 'border-slate-700/50',
    };
  }

  const isPositive = num > 0;
  const sign = isPositive ? '+' : '-';
  const absFormatted = new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(num));

  return {
    text: `${sign}${currencySymbol}${absFormatted}`,
    isPositive,
    isNeutral: false,
    colorClass: isPositive ? 'text-emerald-400' : 'text-rose-400',
    bgClass: isPositive ? 'bg-emerald-950/40' : 'bg-rose-950/40',
    borderClass: isPositive ? 'border-emerald-500/30' : 'border-rose-500/30',
  };
};

export const formatPercent = (percent: number): string => {
  if (isNaN(percent) || !isFinite(percent)) return '0.0%';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
};

const escapeCsvCell = (str: string | number): string => {
  const val = String(str ?? '');
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
};

/** Builds a CSV file (UTF-8 BOM so Excel reads it correctly) and downloads it. */
export const downloadCsv = (filename: string, rows: string[][]): void => {
  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
