import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  DividendHolding, 
  DividendFrequency, 
  DIVIDEND_CATEGORIES, 
  MONTH_NAMES,
  ScrapedDividendResult 
} from '../types/dividends';
import { 
  calculateMonthlyDistribution, 
  calculateDividendAnnual, 
  exportDividendsToCsv,
  deduplicateHoldings,
  getHoldingCanonicalTicker
} from '../utils/dividendsStorage';
import { 
  scrapeDividendsForTicker, 
  normalizeTickerInput 
} from '../utils/dividendScraper';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus,
  Search, 
  Download, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles,
  Cloud,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  History,
  ChevronRight,
  Info,
  ExternalLink,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Key
} from 'lucide-react';

interface DividendsTrackerProps {
  holdings: DividendHolding[];
  currentUser: User | null;
  onUpdateHolding: (holding: DividendHolding) => void;
  onAddHolding: (holding: DividendHolding) => void;
  onDeleteHolding: (id: string) => void;
  onResetToSample: () => void;
  onReorderHoldings?: (reordered: DividendHolding[]) => void;
  onBatchUpdateHoldings?: (updated: DividendHolding[]) => void;
}

const formatDpuDisplay = (dpu: number): string => {
  if (dpu >= 1) return `$${dpu.toFixed(2)}`;
  if ((dpu * 100) % 1 === 0) return `$${dpu.toFixed(2)}`;
  if ((dpu * 1000) % 1 === 0) return `$${dpu.toFixed(3)}`;
  return `$${dpu.toFixed(4)}`;
};

export const DividendsTracker: React.FC<DividendsTrackerProps> = ({
  holdings,
  currentUser,
  onUpdateHolding,
  onAddHolding,
  onDeleteHolding,
  onResetToSample,
  onReorderHoldings,
  onBatchUpdateHoldings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'auto' | 'manual'>('auto');

  // Auto-Scraper State
  const [scrapeTickerInput, setScrapeTickerInput] = useState('D05.SI');
  const [scrapeSharesInput, setScrapeSharesInput] = useState('1000');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedResult, setScrapedResult] = useState<ScrapedDividendResult | null>(null);
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);
  const [twelveDataKey, setTwelveDataKey] = useState<string>(() => (typeof window !== 'undefined' ? (localStorage.getItem('twelve_data_api_key') || '') : ''));
  const [eodhdKey, setEodhdKey] = useState<string>(() => (typeof window !== 'undefined' ? (localStorage.getItem('eodhd_api_key') || localStorage.getItem('eodhd_api_token') || '') : ''));
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Re-scrape All State
  const [isReScrapingAll, setIsReScrapingAll] = useState(false);
  const [reScrapeProgress, setReScrapeProgress] = useState<{ current: number; total: number } | null>(null);
  const [reScrapeStatusMessage, setReScrapeStatusMessage] = useState<string | null>(null);
  const hasAutoScrapedRef = useRef(false);

  // Single Holding Refresh State
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  // Form Fields
  const [formTicker, setFormTicker] = useState('');
  const [formCategory, setFormCategory] = useState<string>(DIVIDEND_CATEGORIES[0]);
  const [formInputMode, setFormInputMode] = useState<'direct' | 'shares'>('direct');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formShares, setFormShares] = useState<string>('');
  const [formDps, setFormDps] = useState<string>('');
  const [formFrequency, setFormFrequency] = useState<DividendFrequency>('quarterly');
  const [formPayoutMonths, setFormPayoutMonths] = useState<number[]>([3, 6, 9, 12]);
  const [formMonthlyDpu, setFormMonthlyDpu] = useState<Record<number, string>>({});
  const [isCustomDpuEnabled, setIsCustomDpuEnabled] = useState(false);
  const [formAccount, setFormAccount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Drag-and-Drop Reorder State
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const touchStartYRef = useRef<number>(0);
  const touchSourceIdRef = useRef<string | null>(null);

  // Reordering Logic
  const handleReorder = (sourceId: string, targetId: string, position: 'before' | 'after') => {
    if (sourceId === targetId) return;

    const sourceIndex = holdings.findIndex((h) => h.id === sourceId);
    const targetIndex = holdings.findIndex((h) => h.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...holdings];
    const [moved] = updated.splice(sourceIndex, 1);

    const newTargetIndex = updated.findIndex((h) => h.id === targetId);
    if (position === 'after') {
      updated.splice(newTargetIndex + 1, 0, moved);
    } else {
      updated.splice(newTargetIndex, 0, moved);
    }

    if (onReorderHoldings) {
      onReorderHoldings(updated);
    }
  };

  const handleMoveStep = (id: string, direction: 'up' | 'down') => {
    const currentIndex = holdings.findIndex((h) => h.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= holdings.length) return;
    const targetId = holdings[targetIndex].id;
    handleReorder(id, targetId, direction === 'up' ? 'before' : 'after');
  };

  // HTML5 Drag Events
  const onDragStartCard = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const onDragOverCard = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggedId || draggedId === id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'before' : 'after';

    setDragOverId(id);
    setDropPosition(pos);
  };

  const onDragEndCard = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const onDropCard = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId && dropPosition) {
      handleReorder(draggedId, targetId, dropPosition);
    }
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  // Touch Drag Events for Mobile
  const onTouchStartGrip = (e: React.TouchEvent, id: string) => {
    touchStartYRef.current = e.touches[0].clientY;
    touchSourceIdRef.current = id;
    setDraggedId(id);
  };

  const onTouchMoveGrip = (e: React.TouchEvent) => {
    if (!touchSourceIdRef.current) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const cardEl = targetEl?.closest('[data-holding-id]') as HTMLElement | null;
    if (cardEl) {
      const targetId = cardEl.getAttribute('data-holding-id');
      if (targetId && targetId !== touchSourceIdRef.current) {
        const rect = cardEl.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const pos = touch.clientY < midY ? 'before' : 'after';
        setDragOverId(targetId);
        setDropPosition(pos);
      }
    }
  };

  const onTouchEndGrip = () => {
    if (touchSourceIdRef.current && dragOverId && dropPosition && touchSourceIdRef.current !== dragOverId) {
      handleReorder(touchSourceIdRef.current, dragOverId, dropPosition);
    }
    touchSourceIdRef.current = null;
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  const currentMonthNum = new Date().getMonth() + 1; // 1-indexed (1 = Jan, ..., 12 = Dec)
  const currentYear = new Date().getFullYear();

  // Calculations
  const monthlyDistributions = useMemo(() => {
    return calculateMonthlyDistribution(holdings);
  }, [holdings]);

  const maxMonthAmount = useMemo(() => {
    return Math.max(...monthlyDistributions.map((d) => d.totalAmount), 1);
  }, [monthlyDistributions]);

  const totalAnnualDividends = useMemo(() => {
    return holdings.reduce((sum, h) => sum + calculateDividendAnnual(h), 0);
  }, [holdings]);

  const averageMonthlyDividends = totalAnnualDividends / 12;

  const totalPastYearDividends = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (Number(h.pastYearDividends ?? calculateDividendAnnual(h)) || 0), 0);
  }, [holdings]);

  const totalYtdDividends = useMemo(() => {
    return holdings.reduce((sum, h) => {
      if (h.ytdDividends !== undefined && h.ytdDividends !== null) return sum + Number(h.ytdDividends);
      return sum + (calculateDividendAnnual(h) * (currentMonthNum / 12));
    }, 0);
  }, [holdings, currentMonthNum]);

  // Filtered Holdings
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const matchesSearch = searchQuery === '' || 
        h.tickerOrName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.paymentMethodOrAccount && h.paymentMethodOrAccount.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (h.notes && h.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;

      const matchesMonth = selectedMonthFilter === null || (Array.isArray(h.payoutMonths) && h.payoutMonths.includes(selectedMonthFilter));

      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [holdings, searchQuery, selectedCategory, selectedMonthFilter]);

  // Open modal for new holding
  const handleOpenAdd = () => {
    setEditingId(null);
    setModalTab('auto');
    setScrapeTickerInput('D05.SI');
    setScrapeSharesInput('1000');
    setScrapedResult(null);
    setScrapeError(null);
    setShowPayoutHistory(false);

    setFormTicker('');
    setFormCategory(DIVIDEND_CATEGORIES[0]);
    setFormInputMode('direct');
    setFormAmount('');
    setFormShares('');
    setFormDps('');
    setFormFrequency('quarterly');
    setFormPayoutMonths([3, 6, 9, 12]);
    setFormMonthlyDpu({});
    setIsCustomDpuEnabled(false);
    setFormAccount('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing holding
  const handleOpenEdit = (holding: DividendHolding) => {
    setEditingId(holding.id);
    setModalTab('manual');
    setFormTicker(holding.tickerOrName);
    setFormCategory(holding.category || DIVIDEND_CATEGORIES[0]);

    // Check if holding has variable monthly DPUs
    const initialMonthlyDpu: Record<number, string> = {};
    let hasVaryingDpu = false;
    if (holding.monthlyDpu && Object.keys(holding.monthlyDpu).length > 0) {
      Object.entries(holding.monthlyDpu).forEach(([m, val]) => {
        initialMonthlyDpu[Number(m)] = String(val);
      });
      const dpuVals = Object.values(holding.monthlyDpu);
      hasVaryingDpu = dpuVals.length > 1 && dpuVals.some((v) => v !== dpuVals[0]);
    }
    setFormMonthlyDpu(initialMonthlyDpu);
    setIsCustomDpuEnabled(hasVaryingDpu);

    if (holding.shares && (holding.dividendPerShare || holding.monthlyDpu)) {
      setFormInputMode('shares');
      setFormShares(String(holding.shares));
      const fallbackDps = holding.dividendPerShare || (holding.monthlyDpu ? Object.values(holding.monthlyDpu)[0] : undefined) || '';
      setFormDps(String(fallbackDps));
      setFormAmount(String(holding.amount || (holding.shares * Number(fallbackDps || 0))));
    } else {
      setFormInputMode('direct');
      setFormAmount(String(holding.amount));
      setFormShares(holding.shares ? String(holding.shares) : '');
      setFormDps(holding.dividendPerShare ? String(holding.dividendPerShare) : '');
    }
    setFormFrequency(holding.frequency);
    setFormPayoutMonths(Array.isArray(holding.payoutMonths) ? [...holding.payoutMonths] : [3, 6, 9, 12]);
    setFormAccount(holding.paymentMethodOrAccount || '');
    setFormNotes(holding.notes || '');
    setIsModalOpen(true);
  };

  // Frequency change helper to auto-populate default months
  const handleFrequencyChange = (freq: DividendFrequency) => {
    setFormFrequency(freq);
    if (freq === 'monthly') {
      setFormPayoutMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    } else if (freq === 'quarterly') {
      setFormPayoutMonths([3, 6, 9, 12]);
    } else if (freq === 'semi-annually') {
      setFormPayoutMonths([6, 12]);
    } else if (freq === 'annually') {
      setFormPayoutMonths([12]);
    }
  };

  // Toggle specific month
  const toggleMonth = (monthNum: number) => {
    setFormPayoutMonths((prev) => {
      if (prev.includes(monthNum)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((m) => m !== monthNum).sort((a, b) => a - b);
      } else {
        return [...prev, monthNum].sort((a, b) => a - b);
      }
    });
  };

  // Run auto scraper from ticker input
  const handleRunScraper = async (tickerOverride?: string, sharesOverride?: string) => {
    const ticker = (tickerOverride || scrapeTickerInput).trim();
    const sharesNum = parseFloat(sharesOverride || scrapeSharesInput) || 0;

    if (!ticker) {
      setScrapeError('Please enter a valid stock or ETF ticker symbol.');
      return;
    }

    setIsScraping(true);
    setScrapeError(null);

    try {
      const result = await scrapeDividendsForTicker(ticker, sharesNum);
      setScrapedResult(result);

      // Pre-fill manual form fields as well
      const displayName = result.name ? `${result.name} (${result.ticker})` : result.ticker;
      setFormTicker(displayName);
      setFormCategory(result.category);
      setFormInputMode('shares');
      setFormShares(String(result.shares));
      setFormDps(String(result.latestDPS));
      setFormAmount(String(result.latestDPS * result.shares));
      setFormFrequency(result.frequency);
      setFormPayoutMonths(result.payoutMonths);

      // Check if scraped result has varying monthly DPUs
      const stringMonthlyDpu: Record<number, string> = {};
      let hasVarying = false;
      if (result.monthlyDpu) {
        Object.entries(result.monthlyDpu).forEach(([m, val]) => {
          stringMonthlyDpu[Number(m)] = String(val);
        });
        const vals = Object.values(result.monthlyDpu);
        hasVarying = vals.length > 1 && vals.some((v) => v !== vals[0]);
      }
      setFormMonthlyDpu(stringMonthlyDpu);
      setIsCustomDpuEnabled(hasVarying);

      setFormNotes(`Past 1Y: $${result.pastYearDividends.toFixed(0)} | YTD: $${result.ytdDividends.toFixed(0)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dividend data.';
      setScrapeError(msg);
    } finally {
      setIsScraping(false);
    }
  };

  // Auto re-scrape on component load
  useEffect(() => {
    if (hasAutoScrapedRef.current) return;
    if (!holdings || holdings.length === 0) return;
    hasAutoScrapedRef.current = true;

    // Run auto re-scrape smoothly in background shortly after load
    const timer = setTimeout(() => {
      handleReScrapeAll(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Re-scrape all auto-calculated tickers
  const handleReScrapeAll = async (isAutoOnLoad = false) => {
    if (isReScrapingAll) return;
    if (!holdings || holdings.length === 0) return;

    setIsReScrapingAll(true);
    setReScrapeStatusMessage(isAutoOnLoad ? 'Auto-refreshing dividend rates...' : 'Re-scraping all tickers...');

    const cleanHoldings = deduplicateHoldings(holdings);
    const eligibleHoldings = cleanHoldings.filter((h) => {
      const canonical = getHoldingCanonicalTicker(h);
      return Boolean(canonical && canonical.length >= 1);
    });

    if (eligibleHoldings.length === 0) {
      setIsReScrapingAll(false);
      setReScrapeStatusMessage(null);
      return;
    }

    setReScrapeProgress({ current: 0, total: eligibleHoldings.length });
    const updatedMap = new Map<string, DividendHolding>();
    cleanHoldings.forEach((h) => updatedMap.set(h.id, { ...h }));

    let successCount = 0;

    for (let i = 0; i < eligibleHoldings.length; i++) {
      const holding = eligibleHoldings[i];
      setReScrapeProgress({ current: i + 1, total: eligibleHoldings.length });
      const canonical = getHoldingCanonicalTicker(holding);
      const sharesNum = holding.shares || (holding.dividendPerShare && holding.amount ? Math.round(holding.amount / holding.dividendPerShare) : 100);

      try {
        const result = await scrapeDividendsForTicker(canonical, sharesNum);
        const calculatedAnnual = calculateDividendAnnual({
          amount: result.latestDPS * sharesNum,
          frequency: result.frequency,
          payoutMonths: result.payoutMonths,
          shares: sharesNum,
          dividendPerShare: result.latestDPS,
          monthlyDpu: result.monthlyDpu,
        });

        const updated: DividendHolding = {
          ...holding,
          category: result.category || holding.category,
          shares: sharesNum,
          dividendPerShare: result.latestDPS,
          monthlyDpu: result.monthlyDpu,
          payoutMonths: result.payoutMonths,
          frequency: result.frequency,
          amount: result.latestDPS * sharesNum,
          totalAnnualPayout: calculatedAnnual,
          expectedYearlyDividends: calculatedAnnual,
          pastYearDividends: result.pastYearDividends,
          ytdDividends: result.ytdDividends,
          monthlyAverageDividends: calculatedAnnual / 12,
          currency: result.currency || holding.currency,
          lastFetchedAt: Date.now(),
        };

        updatedMap.set(holding.id, updated);
        successCount++;
      } catch (err) {
        console.warn(`Could not re-scrape ${holding.tickerOrName}:`, err);
      }
    }

    const finalList = deduplicateHoldings(Array.from(updatedMap.values()));

    if (onBatchUpdateHoldings) {
      onBatchUpdateHoldings(finalList);
    } else if (onReorderHoldings) {
      onReorderHoldings(finalList);
    }

    setIsReScrapingAll(false);
    setReScrapeProgress(null);
    setReScrapeStatusMessage(`${successCount}/${eligibleHoldings.length} updated`);

    setTimeout(() => {
      setReScrapeStatusMessage(null);
    }, 3500);
  };

  // Apply scraped result into portfolio
  const handleApplyScrapedHolding = () => {
    if (!scrapedResult) return;

    const displayName = scrapedResult.name ? `${scrapedResult.name} (${scrapedResult.ticker})` : scrapedResult.ticker;
    const canonical = getHoldingCanonicalTicker({ tickerOrName: displayName });
    const existingHolding = editingId
      ? holdings.find((h) => h.id === editingId)
      : holdings.find((h) => getHoldingCanonicalTicker(h) === canonical);

    const calculatedAnnual = calculateDividendAnnual({
      amount: scrapedResult.latestDPS * scrapedResult.shares,
      frequency: scrapedResult.frequency,
      payoutMonths: scrapedResult.payoutMonths,
      shares: scrapedResult.shares,
      dividendPerShare: scrapedResult.latestDPS,
      monthlyDpu: scrapedResult.monthlyDpu,
    });

    const holdingData: DividendHolding = {
      id: editingId || existingHolding?.id || `div_${Date.now()}`,
      tickerOrName: displayName,
      category: scrapedResult.category,
      amount: scrapedResult.latestDPS * scrapedResult.shares,
      frequency: scrapedResult.frequency,
      payoutMonths: scrapedResult.payoutMonths,
      shares: scrapedResult.shares,
      dividendPerShare: scrapedResult.latestDPS,
      monthlyDpu: scrapedResult.monthlyDpu,
      totalAnnualPayout: calculatedAnnual,
      pastYearDividends: scrapedResult.pastYearDividends,
      ytdDividends: scrapedResult.ytdDividends,
      expectedYearlyDividends: calculatedAnnual,
      monthlyAverageDividends: calculatedAnnual / 12,
      currency: scrapedResult.currency,
      paymentMethodOrAccount: formAccount.trim() || undefined,
      notes: formNotes.trim() || undefined,
      lastFetchedAt: Date.now(),
      createdAt: editingId ? (holdings.find((h) => h.id === editingId)?.createdAt || Date.now()) : (existingHolding?.createdAt || Date.now()),
    };

    if (editingId || existingHolding) {
      onUpdateHolding(holdingData);
    } else {
      onAddHolding(holdingData);
    }

    setIsModalOpen(false);
  };

  // Quick refresh single holding from web
  const handleQuickRefreshHolding = async (holding: DividendHolding) => {
    const rawTicker = holding.tickerOrName.match(/\(([^)]+)\)/)?.[1] || holding.tickerOrName.split(' ')[0] || holding.tickerOrName;
    const clean = normalizeTickerInput(rawTicker);
    const sharesNum = holding.shares || (holding.dividendPerShare && holding.amount ? Math.round(holding.amount / holding.dividendPerShare) : 100);

    setRefreshingId(holding.id);
    try {
      const result = await scrapeDividendsForTicker(clean, sharesNum);
      const calculatedAnnual = calculateDividendAnnual({
        amount: result.latestDPS * sharesNum,
        frequency: result.frequency,
        payoutMonths: result.payoutMonths,
        shares: sharesNum,
        dividendPerShare: result.latestDPS,
        monthlyDpu: result.monthlyDpu,
      });

      const updated: DividendHolding = {
        ...holding,
        shares: sharesNum,
        dividendPerShare: result.latestDPS,
        monthlyDpu: result.monthlyDpu,
        amount: result.latestDPS * sharesNum,
        frequency: result.frequency,
        payoutMonths: result.payoutMonths,
        totalAnnualPayout: calculatedAnnual,
        pastYearDividends: result.pastYearDividends,
        ytdDividends: result.ytdDividends,
        expectedYearlyDividends: calculatedAnnual,
        monthlyAverageDividends: calculatedAnnual / 12,
        currency: result.currency,
        lastFetchedAt: Date.now(),
      };
      onUpdateHolding(updated);
    } catch (err) {
      console.error('Refresh error:', err);
      alert(`Could not refresh ${holding.tickerOrName}. Please check internet connection.`);
    } finally {
      setRefreshingId(null);
    }
  };

  // Live calculation preview for manual modal form
  const previewAnnual = useMemo(() => {
    const s = parseFloat(formShares) || 0;
    const d = parseFloat(formDps) || 0;
    const directAmt = parseFloat(formAmount) || 0;

    if (formInputMode === 'shares') {
      if (isCustomDpuEnabled) {
        return formPayoutMonths.reduce((sum, m) => {
          const raw = formMonthlyDpu[m] !== undefined && formMonthlyDpu[m] !== ''
            ? formMonthlyDpu[m]
            : formDps;
          const val = parseFloat(raw) || 0;
          return sum + val * s;
        }, 0);
      }
      return s * d * (formPayoutMonths.length || 1);
    } else {
      if (isCustomDpuEnabled) {
        return formPayoutMonths.reduce((sum, m) => {
          const raw = formMonthlyDpu[m] !== undefined && formMonthlyDpu[m] !== ''
            ? formMonthlyDpu[m]
            : formAmount;
          const val = parseFloat(raw) || 0;
          return sum + val;
        }, 0);
      }
      return directAmt * (formPayoutMonths.length || 1);
    }
  }, [formInputMode, formShares, formDps, formAmount, isCustomDpuEnabled, formMonthlyDpu, formPayoutMonths]);

  // Save Modal Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTicker.trim()) return;

    let payoutAmount = 0;
    let sharesNum: number | undefined;
    let dpsNum: number | undefined;
    let parsedMonthlyDpu: Record<number, number> | undefined = undefined;

    if (formInputMode === 'shares') {
      sharesNum = parseFloat(formShares) || 0;
      dpsNum = parseFloat(formDps) || 0;
      payoutAmount = sharesNum * dpsNum;

      if (isCustomDpuEnabled || Object.keys(formMonthlyDpu).length > 0) {
        parsedMonthlyDpu = {};
        for (const m of formPayoutMonths) {
          const raw = formMonthlyDpu[m] !== undefined && formMonthlyDpu[m] !== ''
            ? formMonthlyDpu[m]
            : formDps;
          parsedMonthlyDpu[m] = parseFloat(raw) || 0;
        }
      }
    } else {
      payoutAmount = parseFloat(formAmount) || 0;
      if (isCustomDpuEnabled || Object.keys(formMonthlyDpu).length > 0) {
        parsedMonthlyDpu = {};
        for (const m of formPayoutMonths) {
          const raw = formMonthlyDpu[m] !== undefined && formMonthlyDpu[m] !== ''
            ? formMonthlyDpu[m]
            : formAmount;
          parsedMonthlyDpu[m] = parseFloat(raw) || 0;
        }
      }
    }

    const calculatedAnnual = calculateDividendAnnual({
      amount: payoutAmount,
      frequency: formFrequency,
      payoutMonths: formPayoutMonths,
      shares: sharesNum,
      dividendPerShare: dpsNum,
      monthlyDpu: parsedMonthlyDpu,
    });

    const canonical = getHoldingCanonicalTicker({ tickerOrName: formTicker.trim() });
    const existingHolding = editingId 
      ? holdings.find((h) => h.id === editingId) 
      : holdings.find((h) => getHoldingCanonicalTicker(h) === canonical);

    const holdingData: DividendHolding = {
      id: editingId || existingHolding?.id || `div_${Date.now()}`,
      tickerOrName: formTicker.trim(),
      category: formCategory,
      amount: payoutAmount,
      frequency: formFrequency,
      payoutMonths: formPayoutMonths,
      shares: sharesNum,
      dividendPerShare: dpsNum,
      monthlyDpu: parsedMonthlyDpu,
      totalAnnualPayout: calculatedAnnual,
      pastYearDividends: existingHolding?.pastYearDividends,
      ytdDividends: existingHolding?.ytdDividends,
      expectedYearlyDividends: calculatedAnnual,
      monthlyAverageDividends: calculatedAnnual / 12,
      currency: existingHolding?.currency,
      paymentMethodOrAccount: formAccount.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: existingHolding?.createdAt || Date.now(),
    };

    if (editingId || existingHolding) {
      onUpdateHolding(holdingData);
    } else {
      onAddHolding(holdingData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col space-y-3 pb-8">
      {/* Top Status Row */}
      <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-slate-300">Monthly Dividends Portfolio</span>
          {reScrapeStatusMessage && (
            <span className="ml-2 text-[9px] font-medium text-cyan-300 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full animate-in fade-in flex items-center gap-1 shadow-sm">
              {isReScrapingAll && <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-400" />}
              {reScrapeStatusMessage}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReScrapeAll(false)}
            disabled={isReScrapingAll}
            title="Re-scrape and update dividend data for all tickers"
            className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/90 px-2 py-0.5 rounded-lg border border-slate-700/70 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isReScrapingAll ? 'animate-spin text-cyan-400' : 'text-cyan-400'}`} />
            <span>
              {isReScrapingAll
                ? (reScrapeProgress ? `${reScrapeProgress.current}/${reScrapeProgress.total}` : 'Scraping...')
                : 'Re-scrape All'}
            </span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-colors shadow-sm"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Add Ticker</span>
          </button>
          <div className="flex items-center gap-1 text-[9px] text-slate-500">
            <Cloud className="w-3 h-3 text-cyan-400" />
            <span>{currentUser ? 'Cloud Sync' : 'Local'}</span>
          </div>
        </div>
      </div>

      {/* 1. Header Overview Metrics (Requested by user: Expected Yearly, Monthly Avg, Past Year, YTD) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Metric 1: Expected Yearly */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Expected Yearly</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(totalAnnualDividends, { showCents: false })}
            </div>
            <div className="text-[9px] text-cyan-400 font-medium">
              Forward 12M projected
            </div>
          </div>
        </div>

        {/* Metric 2: Monthly Average */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Monthly Average</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(averageMonthlyDividends, { showCents: false })}
            </div>
            <div className="text-[9px] text-emerald-400 font-medium">
              Passive cash flow / mo
            </div>
          </div>
        </div>

        {/* Metric 3: Past 1 Year (TTM) */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Past 1 Year (TTM)</span>
            <History className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(totalPastYearDividends, { showCents: false })}
            </div>
            <div className="text-[9px] text-purple-400 font-medium">
              Past 12M historical
            </div>
          </div>
        </div>

        {/* Metric 4: Year-To-Date (YTD) */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>YTD ({currentYear})</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(totalYtdDividends, { showCents: false })}
            </div>
            <div className="text-[9px] text-amber-400 font-medium">
              Jan {currentYear} to date
            </div>
          </div>
        </div>
      </div>

      {/* 2. 12-Month Bar Chart Timeline */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white">Monthly Dividend Distribution</h2>
          </div>
          {selectedMonthFilter !== null ? (
            <button
              onClick={() => setSelectedMonthFilter(null)}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30"
            >
              <span>{MONTH_NAMES[selectedMonthFilter - 1]} filtered</span>
              <X className="w-2.5 h-2.5" />
            </button>
          ) : (
            <span className="text-[10px] text-slate-400">Click a bar to filter</span>
          )}
        </div>

        {/* Bar Chart Container */}
        <div className="grid grid-cols-12 gap-1 pt-3 pb-1 items-end h-32 border-b border-slate-800/80">
          {monthlyDistributions.map((dist) => {
            const isCurrentMonth = dist.month === currentMonthNum;
            const isSelected = selectedMonthFilter === dist.month;
            const heightPercent = maxMonthAmount > 0 
              ? Math.max(Math.round((dist.totalAmount / maxMonthAmount) * 100), 6) 
              : 6;

            return (
              <div 
                key={dist.month}
                onClick={() => setSelectedMonthFilter(isSelected ? null : dist.month)}
                className="h-full flex flex-col items-center justify-end group cursor-pointer relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[9px] font-mono-num text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                  {formatCurrency(dist.totalAmount)}
                </div>

                {/* Amount Label above bar */}
                <span className="text-[8px] font-mono-num text-slate-400 group-hover:text-cyan-300 truncate mb-1">
                  {dist.totalAmount > 0 ? (dist.totalAmount >= 1000 ? `${(dist.totalAmount/1000).toFixed(1)}k` : Math.round(dist.totalAmount)) : ''}
                </span>

                {/* Animated / styled bar */}
                <div 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isSelected 
                      ? 'bg-cyan-400 shadow-md shadow-cyan-500/40 ring-2 ring-cyan-300'
                      : isCurrentMonth
                        ? 'bg-gradient-to-t from-cyan-600 to-teal-400 ring-1 ring-cyan-400/50'
                        : dist.totalAmount > 0
                          ? 'bg-slate-700 hover:bg-cyan-600/80'
                          : 'bg-slate-800/50'
                  }`}
                />

                {/* Month Name */}
                <span className={`text-[9px] mt-1.5 font-semibold transition-colors ${
                  isSelected 
                    ? 'text-cyan-300 font-bold'
                    : isCurrentMonth
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {dist.monthLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filter and Action Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticker, account, notes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Add Holding Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/60 cursor-pointer active:scale-95 flex-shrink-0"
            title="Add a stock or ETF ticker to calculate dividends"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Ticker</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={() => exportDividendsToCsv(holdings)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex-shrink-0"
            title="Export Dividends CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Category Filter Pills (horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            All Categories ({holdings.length})
          </button>
          {DIVIDEND_CATEGORIES.map((cat) => {
            const count = holdings.filter((h) => h.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Dividend Holdings List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-200">Your Portfolio Holdings</span>
            <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono-num">
              {filteredHoldings.length} {filteredHoldings.length === 1 ? 'ticker' : 'tickers'}
            </span>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Add Ticker</span>
          </button>
        </div>

        {filteredHoldings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Plus className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">No dividend assets found</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {searchQuery || selectedCategory !== 'All' || selectedMonthFilter !== null
                  ? 'Try adjusting your filters or search terms.'
                  : 'Enter a ticker symbol and your share count to auto-calculate your dividends.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/60 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Ticker</span>
              </button>
              {holdings.length === 0 && (
                <button
                  onClick={onResetToSample}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                >
                  Load Sample Portfolio
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredHoldings.map((h, idx) => {
            const paysThisMonth = Array.isArray(h.payoutMonths) && h.payoutMonths.includes(currentMonthNum);
            const isRefreshing = refreshingId === h.id;
            const isBeingDragged = draggedId === h.id;
            const isTargetBefore = dragOverId === h.id && dropPosition === 'before';
            const isTargetAfter = dragOverId === h.id && dropPosition === 'after';
            const monthlyDpuVals = h.monthlyDpu ? Object.values(h.monthlyDpu) : [];
            const hasVaryingDpu = monthlyDpuVals.length > 1 && monthlyDpuVals.some((v) => v !== monthlyDpuVals[0]);

            return (
              <div 
                key={h.id}
                data-holding-id={h.id}
                className="relative transition-all"
              >
                {/* Visual Drop Line Indicator (Before) */}
                {isTargetBefore && (
                  <div className="h-1 w-full rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-pulse my-1.5" />
                )}

                <div 
                  draggable={true}
                  onDragStart={(e) => onDragStartCard(e, h.id)}
                  onDragOver={(e) => onDragOverCard(e, h.id)}
                  onDragEnd={onDragEndCard}
                  onDrop={(e) => onDropCard(e, h.id)}
                  className={`p-3 rounded-2xl bg-slate-900/90 border transition-all space-y-2 select-none ${
                    isBeingDragged
                      ? 'opacity-40 border-cyan-500/70 scale-[0.98] shadow-2xl ring-2 ring-cyan-500/40 bg-slate-800'
                      : 'border-slate-800/90 shadow-sm hover:border-slate-700/80'
                  }`}
                >
                  {/* Top Row: Drag Handle + Name + Category & Action buttons */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {/* Drag Handle & Mobile Reorder Nudge */}
                      <div 
                        className="flex flex-col items-center justify-center pt-0.5 text-slate-500 hover:text-cyan-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
                        title="Click and drag to reorder"
                        onTouchStart={(e) => onTouchStartGrip(e, h.id)}
                        onTouchMove={onTouchMoveGrip}
                        onTouchEnd={onTouchEndGrip}
                      >
                        <GripVertical className="w-4 h-4" />
                        <div className="flex flex-col items-center -space-y-1 mt-0.5 sm:hidden">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStep(h.id, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20"
                            title="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveStep(h.id, 'down');
                            }}
                            disabled={idx === filteredHoldings.length - 1}
                            className="p-0.5 text-slate-500 hover:text-cyan-300 disabled:opacity-20"
                            title="Move down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm">
                            {h.tickerOrName}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {h.category}
                          </span>
                          {h.currency && (
                            <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {h.currency}
                            </span>
                          )}
                          {h.paymentMethodOrAccount && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono bg-slate-800 text-slate-400 border border-slate-700">
                              {h.paymentMethodOrAccount}
                            </span>
                          )}
                          {paysThisMonth && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Pays in {MONTH_NAMES[currentMonthNum - 1]}</span>
                            </span>
                          )}
                        </div>

                        {h.shares ? (
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono-num flex items-center gap-2 flex-wrap">
                            <span>{h.shares.toLocaleString()} shares</span>
                            {hasVaryingDpu ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                Variable DPU
                              </span>
                            ) : h.dividendPerShare ? (
                              <span>@ {formatCurrency(h.dividendPerShare, { showCents: true })} DPS</span>
                            ) : null}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Actions (Re-scrape Web, Edit, Delete) */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleQuickRefreshHolding(h)}
                        disabled={isRefreshing}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Re-fetch / scrape latest dividend data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(h)}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {deletingId === h.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDeleteHolding(h.id);
                              setDeletingId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(h.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Auto-Calculated Metrics (Expected Yearly, Monthly Average, Past 1Y, YTD) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Expected Yearly</span>
                      <span className="font-bold text-emerald-400 font-mono-num text-xs sm:text-sm">
                        {formatCurrency(h.expectedYearlyDividends || h.totalAnnualPayout)}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">/ yr</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block">Monthly Average</span>
                      <span className="font-bold text-cyan-400 font-mono-num text-xs sm:text-sm">
                        {formatCurrency(h.monthlyAverageDividends || ((h.totalAnnualPayout || 0) / 12))}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-1">/ mo</span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block">Past 1 Year (TTM)</span>
                      <span className="font-semibold text-purple-300 font-mono-num text-[11px] sm:text-xs">
                        {formatCurrency(h.pastYearDividends !== undefined ? h.pastYearDividends : h.totalAnnualPayout)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block">YTD ({currentYear})</span>
                      <span className="font-semibold text-amber-300 font-mono-num text-[11px] sm:text-xs">
                        {formatCurrency(h.ytdDividends !== undefined ? h.ytdDividends : (h.totalAnnualPayout * (currentMonthNum / 12)))}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Month Badges & Notes */}
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                    {/* Months Badges */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] text-slate-500">Payouts ({h.frequency}):</span>
                      {MONTH_NAMES.map((mName, mIdx) => {
                        const mNum = mIdx + 1;
                        const isPaying = Array.isArray(h.payoutMonths) && h.payoutMonths.includes(mNum);
                        if (!isPaying) return null;
                        const isCurrent = mNum === currentMonthNum;
                        const specificDpu = h.monthlyDpu?.[mNum];
                        const monthPayout = specificDpu !== undefined
                          ? (h.shares ? h.shares * specificDpu : specificDpu)
                          : (h.shares && h.dividendPerShare ? h.shares * h.dividendPerShare : h.amount);

                        return (
                          <span 
                            key={mName}
                            title={`${mName} Payout: ${specificDpu !== undefined ? `$${specificDpu.toFixed(4)}/sh` : ''} (${formatCurrency(monthPayout)})`}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 ${
                              isCurrent
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 ring-1 ring-cyan-400/40'
                                : 'bg-slate-800/90 text-slate-300 border border-slate-700/60'
                            }`}
                          >
                            <span>{mName}</span>
                            {specificDpu !== undefined && (
                              <span className="text-[8.5px] text-cyan-400 font-semibold font-mono-num">
                                {formatDpuDisplay(specificDpu)}
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    {h.notes && (
                      <span className="text-[10px] text-slate-400 italic truncate max-w-full">
                        {h.notes}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Drop Line Indicator (After) */}
                {isTargetAfter && (
                  <div className="h-1 w-full rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-pulse my-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Add / Edit Modal with Auto-Scraping and Calculation */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl p-4 sm:p-5 max-w-md w-full my-8 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingId ? 'Edit Dividend Holding' : 'Add Dividend Holding'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher: Auto-Calculate vs Manual */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setModalTab('auto')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all ${
                  modalTab === 'auto'
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-950/60'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Calculate</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('manual')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold transition-all ${
                  modalTab === 'manual'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manual Entry</span>
              </button>
            </div>

            {/* TAB 1: AUTO-CALCULATE FROM WEB */}
            {modalTab === 'auto' && (
              <div className="space-y-3.5">
                {/* Ticker & Shares Input */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Ticker Symbol *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A35, 5DD, D05, VOO, SCHD"
                      value={scrapeTickerInput}
                      onChange={(e) => setScrapeTickerInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Shares Owned *
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      value={scrapeSharesInput}
                      onChange={(e) => setScrapeSharesInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono-num font-bold placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* API & Format Information Bar */}
                <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                      <span>API: <strong>Yahoo Finance Public Chart API</strong></span>
                    </span>
                    <a
                      href={`https://query2.finance.yahoo.com/v8/finance/chart/${(normalizeTickerInput(scrapeTickerInput) || 'A35.SI')}?interval=1mo&range=2y&events=div`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-0.5 font-semibold text-[9px]"
                      title="Open raw Yahoo Finance JSON endpoint in new tab"
                    >
                      <span>Check JSON Feed</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-relaxed">
                    Supports <strong>all global tickers</strong>. SGX symbols (e.g. <code>A35</code>, <code>5DD</code>, <code>D05</code>, <code>A17U</code>) are automatically mapped to <code>.SI</code> exchange format.
                  </p>
                </div>

                {/* Quick Suggestion Pills */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Popular Quick Fill:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: 'A35 (ABF Bond)', symbol: 'A35', shares: '1000' },
                      { label: '5DD (Micro-Mech)', symbol: '5DD', shares: '1000' },
                      { label: 'DBS', symbol: 'D05', shares: '1000' },
                      { label: 'OCBC', symbol: 'O39', shares: '1000' },
                      { label: 'UOB', symbol: 'U11', shares: '1000' },
                      { label: 'Singtel', symbol: 'Z74', shares: '5000' },
                      { label: 'CLAR', symbol: 'A17U', shares: '2000' },
                      { label: 'CICT', symbol: 'C38U', shares: '2000' },
                      { label: 'VOO', symbol: 'VOO', shares: '100' },
                      { label: 'SCHD', symbol: 'SCHD', shares: '200' },
                      { label: 'Realty Income', symbol: 'O', shares: '150' },
                    ].map((item) => (
                      <button
                        key={item.symbol}
                        type="button"
                        onClick={() => {
                          setScrapeTickerInput(item.symbol);
                          setScrapeSharesInput(item.shares);
                          handleRunScraper(item.symbol, item.shares);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors font-medium"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Keys Configuration (Twelve Data & EODHD) */}
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowKeyInput(!showKeyInput)}
                      className="text-slate-300 hover:text-cyan-300 font-medium flex items-center gap-1.5 text-[10px] cursor-pointer"
                    >
                      <Key className="w-3.5 h-3.5 text-cyan-400" />
                      <span>API Keys & Fallbacks {(twelveDataKey || eodhdKey) ? '(Active)' : '(Optional)'}</span>
                      <span className="text-[9px] text-cyan-400 font-bold ml-1">{showKeyInput ? '▲' : '▼'}</span>
                    </button>
                    <span className="text-[9px] text-slate-500 font-mono">
                      TwelveData → EODHD → yfinance
                    </span>
                  </div>
                  {showKeyInput && (
                    <div className="pt-1.5 space-y-2.5 border-t border-slate-800/80">
                      {/* Twelve Data Key */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-300">
                            1. Twelve Data API Key {twelveDataKey && <span className="text-cyan-400 text-[9px]">(Active)</span>}
                          </label>
                          <span className="text-[9px] text-slate-500 font-mono">Max 8 calls/min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="password"
                            placeholder="Enter Twelve Data API key..."
                            value={twelveDataKey}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setTwelveDataKey(val);
                              localStorage.setItem('twelve_data_api_key', val);
                            }}
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                          {twelveDataKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setTwelveDataKey('');
                                localStorage.removeItem('twelve_data_api_key');
                              }}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-1.5 py-1"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          Uses Twelve Data <code className="text-cyan-400">/dividends_calendar</code> with 24h disk caching.
                        </p>
                      </div>

                      {/* EODHD Key */}
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold text-slate-300">
                            2. EODHD API Token {eodhdKey && <span className="text-emerald-400 text-[9px]">(Active)</span>}
                          </label>
                          <span className="text-[9px] text-slate-500 font-mono">Explicit paymentDate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="password"
                            placeholder="Enter EODHD API token..."
                            value={eodhdKey}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setEodhdKey(val);
                              localStorage.setItem('eodhd_api_key', val);
                            }}
                            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                          />
                          {eodhdKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setEodhdKey('');
                                localStorage.removeItem('eodhd_api_key');
                              }}
                              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-1.5 py-1"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 leading-tight">
                          Extracts exact dividend payment dates (maps SGX to <code className="text-cyan-400">.XSES</code> / <code className="text-cyan-400">.SG</code>). Falls back to yfinance if not configured.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fetch Button */}
                <button
                  type="button"
                  onClick={() => handleRunScraper()}
                  disabled={isScraping}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-cyan-950/60 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
                >
                  {isScraping ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching Dividend Records for {normalizeTickerInput(scrapeTickerInput) || 'Ticker'}...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Auto-Calculate Dividends</span>
                    </>
                  )}
                </button>

                {/* Error Banner */}
                {scrapeError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2 text-[11px] text-rose-300 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">{scrapeError}</p>
                      <button
                        type="button"
                        onClick={() => setModalTab('manual')}
                        className="text-cyan-400 underline font-bold mt-1"
                      >
                        Enter manually instead
                      </button>
                    </div>
                  </div>
                )}

                {/* Scraped Result Display Card */}
                {scrapedResult && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">
                            {scrapedResult.name}
                          </span>
                          {scrapedResult.dataSource === 'live_web' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Live Feed
                            </span>
                          )}
                          {scrapedResult.dataSource === 'verified_dataset' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              Verified Market Data
                            </span>
                          )}
                          {scrapedResult.dataSource === 'custom_estimate' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Editable Baseline
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {scrapedResult.shares.toLocaleString()} shares • {scrapedResult.currency} • {scrapedResult.category}
                        </p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 capitalize">
                        {scrapedResult.frequency}
                      </span>
                    </div>

                    {scrapedResult.warningNote && (
                      <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-300 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
                        <span>{scrapedResult.warningNote}</span>
                      </div>
                    )}

                    {/* Live Provider Verification Card */}
                    {scrapedResult.dataSource === 'live_web' && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            {scrapedResult.apiProvider === 'twelvedata'
                              ? 'Twelve Data Calendar Verified'
                              : scrapedResult.apiProvider === 'eodhd'
                              ? 'EODHD Payment Date Verified'
                              : 'Yahoo Finance / yfinance Verified'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                            {scrapedResult.apiProvider === 'twelvedata'
                              ? 'Twelve Data Live'
                              : scrapedResult.apiProvider === 'eodhd'
                              ? 'EODHD Live'
                              : 'Live Feed'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {scrapedResult.apiProvider === 'twelvedata'
                            ? `Live distributions retrieved from Twelve Data /dividends_calendar (${scrapedResult.pastPayouts.length} distributions recorded, throttled ≤8 calls/min).`
                            : scrapedResult.apiProvider === 'eodhd'
                            ? `Live distributions retrieved from EODHD with explicit payment dates (${scrapedResult.pastPayouts.length} payments recorded). SGX tickers auto-mapped to .XSES / .SG.`
                            : `Live distributions verified directly from Yahoo Finance (${scrapedResult.pastPayouts.length} past payments recorded). Real dividends are prioritized as authoritative.`}
                        </p>
                      </div>
                    )}

                    {scrapedResult.isEstimated && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-amber-400" />
                            Offline Baseline (Yahoo Finance CORS Blocked)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40">
                            Baseline Estimate
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          Direct browser query to Yahoo Finance was blocked by browser CORS. Run <code className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">npm run dev</code> or <code className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">npm run server</code> locally to fetch live Yahoo Finance / yfinance data.
                        </p>
                      </div>
                    )}

                    {/* 4 Big Auto-Calculated Metrics (Past 1 Year, YTD, Expected Yearly, Monthly Avg) */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      {/* Expected Yearly */}
                      <div className="p-1.5 rounded-md bg-slate-950/60">
                        <span className="text-[9px] text-slate-400 block font-semibold">Expected Yearly</span>
                        <span className="font-bold text-emerald-400 font-mono-num text-sm">
                          {formatCurrency(scrapedResult.expectedYearlyDividends)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Forward 12M</span>
                      </div>

                      {/* Monthly Average */}
                      <div className="p-1.5 rounded-md bg-slate-950/60">
                        <span className="text-[9px] text-slate-400 block font-semibold">Monthly Average</span>
                        <span className="font-bold text-cyan-400 font-mono-num text-sm">
                          {formatCurrency(scrapedResult.monthlyAverageDividends)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">/ month</span>
                      </div>

                      {/* Past 1 Year (TTM) */}
                      <div className="p-1.5 rounded-md bg-slate-950/60">
                        <span className="text-[9px] text-slate-400 block font-semibold">Past 1 Year (TTM)</span>
                        <span className="font-bold text-purple-300 font-mono-num text-xs">
                          {formatCurrency(scrapedResult.pastYearDividends)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Past 365 days</span>
                      </div>

                      {/* Year-To-Date (YTD) */}
                      <div className="p-1.5 rounded-md bg-slate-950/60">
                        <span className="text-[9px] text-slate-400 block font-semibold">YTD ({currentYear})</span>
                        <span className="font-bold text-amber-300 font-mono-num text-xs">
                          {formatCurrency(scrapedResult.ytdDividends)}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Jan to present</span>
                      </div>
                    </div>

                    {/* Scheduled Payouts & Variable DPUs Breakdown */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-semibold">Scheduled Payouts & DPUs</span>
                          {scrapedResult.monthlyDpu && Object.values(scrapedResult.monthlyDpu).some((v, _, arr) => v !== arr[0]) && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                              Variable Payouts
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono-num text-[9px]">
                          {scrapedResult.frequency}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {scrapedResult.payoutMonths.map((m) => {
                          const mDpu = scrapedResult.monthlyDpu?.[m] ?? scrapedResult.latestDPS;
                          const mTotal = mDpu * scrapedResult.shares;
                          return (
                            <div key={m} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
                              <div className="flex items-center justify-between">
                                <span className="text-cyan-300 font-bold font-mono text-[10px]">
                                  {MONTH_NAMES[m - 1]}
                                </span>
                                <span className="text-slate-400 font-mono-num text-[9px]">
                                  ${mDpu.toFixed(4)}
                                </span>
                              </div>
                              <div className="text-emerald-400 font-semibold font-mono-num text-[11px] mt-0.5">
                                {formatCurrency(mTotal)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Past Payouts History */}
                    {scrapedResult.pastPayouts.length > 0 && (
                      <div className="border-t border-slate-800 pt-1.5">
                        <button
                          type="button"
                          onClick={() => setShowPayoutHistory(!showPayoutHistory)}
                          className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          <span className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            <span>Recent Public Dividend Payouts ({scrapedResult.pastPayouts.length} events)</span>
                          </span>
                          <ChevronRight className={`w-3 h-3 transition-transform ${showPayoutHistory ? 'rotate-90' : ''}`} />
                        </button>

                        {showPayoutHistory && (
                          <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto no-scrollbar rounded-lg bg-slate-900 p-1.5 text-[10px]">
                            {scrapedResult.pastPayouts.map((p, idx) => (
                              <div key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-800/60 last:border-0 font-mono-num">
                                <span className="text-slate-400">{p.dateFormatted}</span>
                                <span className="text-slate-300">${p.amount.toFixed(4)} / share</span>
                                <span className="font-bold text-emerald-400">{formatCurrency(p.totalForShares)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Account / Custody Input */}
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                        Custody / Broker Account (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. CDP, IBKR, SRS"
                        value={formAccount}
                        onChange={(e) => setFormAccount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={handleApplyScrapedHolding}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 cursor-pointer transition-all active:scale-98"
                    >
                      {editingId ? 'Update Holding with Scraped Data' : 'Add Holding to Dividend Portfolio'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MANUAL ENTRY FORM */}
            {modalTab === 'manual' && (
              <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
                {/* Name / Ticker */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Ticker / Asset Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DBS Group (D05.SI), VOO, Apple"
                    value={formTicker}
                    onChange={(e) => setFormTicker(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {DIVIDEND_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Input Mode Selector: Direct vs Shares × DPS */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">
                      Dividend Payout Calculation
                    </label>
                    <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setFormInputMode('direct')}
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          formInputMode === 'direct' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Direct Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormInputMode('shares')}
                        className={`px-2 py-0.5 rounded-md font-semibold ${
                          formInputMode === 'shares' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Shares × DPS
                      </button>
                    </div>
                  </div>

                  {formInputMode === 'direct' ? (
                    <div>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="Amount per payout event (e.g. 540)"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-num placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="Shares (e.g. 1000)"
                          value={formShares}
                          onChange={(e) => setFormShares(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-num placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="DPS ($ e.g. 0.54)"
                          value={formDps}
                          onChange={(e) => setFormDps(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-num placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Distribution Frequency
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                    {(['quarterly', 'semi-annually', 'monthly', 'annually'] as DividendFrequency[]).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => handleFrequencyChange(freq)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-semibold capitalize border transition-all ${
                          formFrequency === freq
                            ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout Months Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-semibold">
                      Payout Months ({formPayoutMonths.length} selected)
                    </label>
                    {formFrequency === 'quarterly' && (
                      <div className="flex items-center gap-1 text-[9px]">
                        <button
                          type="button"
                          onClick={() => setFormPayoutMonths([3, 6, 9, 12])}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300"
                        >
                          Mar/Jun/Sep/Dec
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormPayoutMonths([2, 5, 8, 11])}
                          className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-cyan-300"
                        >
                          Feb/May/Aug/Nov
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {MONTH_NAMES.map((name, idx) => {
                      const mNum = idx + 1;
                      const isSelected = formPayoutMonths.includes(mNum);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => toggleMonth(mNum)}
                          className={`py-1 rounded-lg text-[10px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                              : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Variable Monthly DPU Editor */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-300">
                        Payout-Specific DPUs (Interim / Final)
                      </span>
                      {isCustomDpuEnabled && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                          Custom
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCustomDpuEnabled;
                        setIsCustomDpuEnabled(nextState);
                        if (!nextState && (formDps || formAmount)) {
                          const base = formInputMode === 'shares' ? formDps : formAmount;
                          const synced: Record<number, string> = {};
                          formPayoutMonths.forEach((m) => { synced[m] = base; });
                          setFormMonthlyDpu(synced);
                        }
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium"
                    >
                      {isCustomDpuEnabled ? 'Reset to Uniform' : 'Customize per month'}
                    </button>
                  </div>

                  {isCustomDpuEnabled ? (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400">
                        Enter specific DPU for each scheduled payout month (e.g. S63 interim $0.04 vs final $0.05):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {formPayoutMonths.map((mNum) => {
                          const defaultVal = formInputMode === 'shares' ? formDps : formAmount;
                          const currentVal = formMonthlyDpu[mNum] ?? defaultVal;
                          const numVal = parseFloat(currentVal) || 0;
                          const s = parseFloat(formShares) || 0;
                          return (
                            <div key={mNum} className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              <label className="text-[10px] text-cyan-300 font-semibold block mb-0.5 font-mono">
                                {MONTH_NAMES[mNum - 1]} {formInputMode === 'shares' ? 'DPU ($)' : 'Payout ($)'}
                              </label>
                              <input
                                type="number"
                                step="any"
                                placeholder={defaultVal || "0.00"}
                                value={currentVal}
                                onChange={(e) => {
                                  setFormMonthlyDpu((prev) => ({ ...prev, [mNum]: e.target.value }));
                                }}
                                className="w-full bg-slate-950 border border-slate-700/60 rounded-md px-2 py-1 text-xs text-white font-mono-num focus:outline-none focus:border-cyan-500"
                              />
                              {formInputMode === 'shares' && s > 0 && (
                                <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">
                                  = {formatCurrency(numVal * s)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      Uniform {formInputMode === 'shares' ? 'DPS' : 'amount'} across all {formPayoutMonths.length} payout months. Click &ldquo;Customize per month&rdquo; to set different interim/final amounts.
                    </p>
                  )}
                </div>

                {/* Custody / Account & Notes */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Broker / Account
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CDP, IBKR, SRS"
                      value={formAccount}
                      onChange={(e) => setFormAccount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scrip dividend, Tax info"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Live Projected Annual Summary */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold">Total Projected Annual Dividends:</span>
                  <div className="text-right font-mono-num">
                    <span className="font-bold text-emerald-400 text-sm">
                      {formatCurrency(previewAnnual)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1.5">
                      ({formatCurrency(previewAnnual / 12)} / mo)
                    </span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-950/60"
                  >
                    {editingId ? 'Save Changes' : 'Add Holding'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
