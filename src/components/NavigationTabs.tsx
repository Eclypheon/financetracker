import React from 'react';
import { Landmark, TrendingUp, CalendarSync } from 'lucide-react';

export type ActiveTabType = 'assets' | 'dividends' | 'expenses';

interface NavigationTabsProps {
  activeTab: ActiveTabType;
  onChangeTab: (tab: ActiveTabType) => void;
  dividendsCount?: number;
  expensesCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  dividendsCount,
  expensesCount,
}) => {
  return (
    <div className="w-full max-w-[500px] mx-auto px-3 pb-2 pt-0.5">
      <nav 
        role="tablist"
        aria-label="Tracker Sections"
        className="grid grid-cols-3 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg shadow-slate-950/40 gap-1 backdrop-blur-md"
      >
        {/* Tab 1: Net Assets */}
        <button
          role="tab"
          aria-selected={activeTab === 'assets'}
          onClick={() => onChangeTab('assets')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'assets'
              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Landmark className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'assets' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span className="truncate">Net Assets</span>
        </button>

        {/* Tab 2: Dividends */}
        <button
          role="tab"
          aria-selected={activeTab === 'dividends'}
          onClick={() => onChangeTab('dividends')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'dividends'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'dividends' ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="truncate">Dividends</span>
          {dividendsCount !== undefined && dividendsCount > 0 && (
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
              activeTab === 'dividends' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {dividendsCount}
            </span>
          )}
        </button>

        {/* Tab 3: Recurrent Expenses */}
        <button
          role="tab"
          aria-selected={activeTab === 'expenses'}
          onClick={() => onChangeTab('expenses')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-slate-800 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-950/50'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <CalendarSync className={`w-3.5 h-3.5 flex-shrink-0 ${activeTab === 'expenses' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span className="truncate">Expenses</span>
          {expensesCount !== undefined && expensesCount > 0 && (
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
              activeTab === 'expenses' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {expensesCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
