import React, { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  RecurringExpense, 
  ExpenseFrequency, 
  EXPENSE_CATEGORIES, 
  EXPENSE_CATEGORY_COLORS 
} from '../types/expenses';
import { 
  getNormalizedMonthlyAmount, 
  getNormalizedAnnualAmount, 
  exportExpensesToCsv
} from '../utils/expensesStorage';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Download, 
  CalendarSync, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  PauseCircle, 
  Edit3, 
  Trash2, 
  X, 
  PieChart, 
  DollarSign,
  Cloud
} from 'lucide-react';


interface ExpensesTrackerProps {
  expenses: RecurringExpense[];
  currentUser: User | null;
  onUpdateExpense: (expense: RecurringExpense) => void;
  onAddExpense: (expense: RecurringExpense) => void;
  onDeleteExpense: (id: string) => void;
  onResetToSample: () => void;
}

export const ExpensesTracker: React.FC<ExpensesTrackerProps> = ({
  expenses,
  currentUser,
  onUpdateExpense,
  onAddExpense,
  onDeleteExpense,
  onResetToSample,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'monthly' | 'annual'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showPaused, setShowPaused] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState<ExpenseFrequency>('monthly');
  const [formCategory, setFormCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [formBilling, setFormBilling] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculations for active expenses
  const activeExpenses = useMemo(() => {
    return expenses.filter((e) => e.isActive);
  }, [expenses]);

  const totalMonthlyNormalized = useMemo(() => {
    return activeExpenses.reduce((sum, e) => sum + getNormalizedMonthlyAmount(e), 0);
  }, [activeExpenses]);

  const totalAnnualNormalized = useMemo(() => {
    return activeExpenses.reduce((sum, e) => sum + getNormalizedAnnualAmount(e), 0);
  }, [activeExpenses]);

  const strictlyMonthlyTotal = useMemo(() => {
    return activeExpenses
      .filter((e) => e.frequency === 'monthly')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [activeExpenses]);

  const strictlyAnnualTotal = useMemo(() => {
    return activeExpenses
      .filter((e) => e.frequency === 'annual')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [activeExpenses]);

  // Category Distribution Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    activeExpenses.forEach((e) => {
      const monthlyEquivalent = getNormalizedMonthlyAmount(e);
      const current = map.get(e.category) || 0;
      map.set(e.category, current + monthlyEquivalent);
    });

    const list: Array<{ category: string; amount: number; percentage: number }> = [];
    map.forEach((amount, category) => {
      const percentage = totalMonthlyNormalized > 0 ? (amount / totalMonthlyNormalized) * 100 : 0;
      list.push({ category, amount, percentage });
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [activeExpenses, totalMonthlyNormalized]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = searchQuery === '' ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.paymentMethod && e.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.billingDayOrMonth && e.billingDayOrMonth.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFrequency = frequencyFilter === 'all' || e.frequency === frequencyFilter;

      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

      const matchesActive = showPaused ? true : e.isActive;

      return matchesSearch && matchesFrequency && matchesCategory && matchesActive;
    });
  }, [expenses, searchQuery, frequencyFilter, selectedCategory, showPaused]);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormAmount('');
    setFormFrequency('monthly');
    setFormCategory(EXPENSE_CATEGORIES[0]);
    setFormBilling('');
    setFormPaymentMethod('');
    setFormIsActive(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (expense: RecurringExpense) => {
    setEditingId(expense.id);
    setFormName(expense.name);
    setFormAmount(String(expense.amount));
    setFormFrequency(expense.frequency);
    setFormCategory(expense.category || EXPENSE_CATEGORIES[0]);
    setFormBilling(expense.billingDayOrMonth || '');
    setFormPaymentMethod(expense.paymentMethod || '');
    setFormIsActive(expense.isActive);
    setFormNotes(expense.notes || '');
    setIsModalOpen(true);
  };

  // Toggle active status directly
  const handleToggleActive = (expense: RecurringExpense) => {
    onUpdateExpense({
      ...expense,
      isActive: !expense.isActive,
    });
  };

  // Save Modal Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const amt = parseFloat(formAmount) || 0;

    const expenseData: RecurringExpense = {
      id: editingId || `exp_${Date.now()}`,
      name: formName.trim(),
      amount: amt,
      frequency: formFrequency,
      category: formCategory,
      billingDayOrMonth: formBilling.trim() || undefined,
      paymentMethod: formPaymentMethod.trim() || undefined,
      isActive: formIsActive,
      notes: formNotes.trim() || undefined,
      createdAt: editingId ? (expenses.find((item) => item.id === editingId)?.createdAt || Date.now()) : Date.now(),
    };

    if (editingId) {
      onUpdateExpense(expenseData);
    } else {
      onAddExpense(expenseData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col space-y-3 pb-8">
      {/* Top Status Row */}
      <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span className="font-semibold text-slate-300">Recurrent Expenses Tracker</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-slate-500">
          <Cloud className="w-3 h-3 text-amber-400" />
          <span>{currentUser ? 'Supabase Cloud Sync' : 'Local Storage'}</span>
        </div>
      </div>

      {/* 1. Header Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

        {/* Metric 1: Normalized Monthly */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Monthly Run-Rate</span>
            <CalendarSync className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(totalMonthlyNormalized, { showCents: false })}
            </div>
            <div className="text-[9px] text-amber-400 font-medium">
              True cost / month
            </div>
          </div>
        </div>

        {/* Metric 2: Normalized Annual */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Annual Commitment</span>
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(totalAnnualNormalized, { showCents: false })}
            </div>
            <div className="text-[9px] text-rose-400 font-medium">
              True cost / year
            </div>
          </div>
        </div>

        {/* Metric 3: Monthly-Only Total */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Monthly Bills</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(strictlyMonthlyTotal, { showCents: false })}
            </div>
            <div className="text-[9px] text-emerald-400 font-medium">
              Regular monthly items
            </div>
          </div>
        </div>

        {/* Metric 4: Annual-Only Total */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>Annual Lump-Sums</span>
            <CreditCard className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1">
            <div className="text-base sm:text-lg font-bold text-white font-mono-num">
              {formatCurrency(strictlyAnnualTotal, { showCents: false })}
            </div>
            <div className="text-[9px] text-purple-400 font-medium">
              Paid yearly (insurance etc.)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Category Breakdown Bar */}
      {categoryBreakdown.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <div className="flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Spending Breakdown by Category</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              {activeExpenses.length} active bills
            </span>
          </div>

          {/* Multi-segment stacked progress bar */}
          <div className="w-full h-3 rounded-full bg-slate-950 flex overflow-hidden p-0.5 border border-slate-800/80">
            {categoryBreakdown.map((item, idx) => {
              const bgPalette = [
                'bg-amber-400',
                'bg-rose-400',
                'bg-purple-400',
                'bg-cyan-400',
                'bg-blue-400',
                'bg-emerald-400',
                'bg-indigo-400',
                'bg-orange-400',
              ];
              const color = bgPalette[idx % bgPalette.length];
              return (
                <div
                  key={item.category}
                  style={{ width: `${item.percentage}%` }}
                  className={`h-full ${color} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                  title={`${item.category}: ${formatCurrency(item.amount)}/mo (${item.percentage.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Category Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
            {categoryBreakdown.slice(0, 6).map((item, idx) => {
              const dotPalette = [
                'bg-amber-400',
                'bg-rose-400',
                'bg-purple-400',
                'bg-cyan-400',
                'bg-blue-400',
                'bg-emerald-400',
                'bg-indigo-400',
                'bg-orange-400',
              ];
              const dotColor = dotPalette[idx % dotPalette.length];
              return (
                <div key={item.category} className="flex items-center justify-between text-slate-300 pr-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                    <span className="truncate" title={item.category}>{item.category}</span>
                  </div>
                  <span className="font-mono-num font-semibold text-slate-200 ml-1 flex-shrink-0">
                    {formatCurrency(item.amount)}/mo
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Filter Controls & Action Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bills, payment method..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
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

          {/* Add Expense Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/60 cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={() => exportExpensesToCsv(expenses)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors flex-shrink-0"
            title="Export Expenses CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Frequency & Category Filter Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Frequency Toggle */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px]">
            <button
              onClick={() => setFrequencyFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                frequencyFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              onClick={() => setFrequencyFilter('monthly')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                frequencyFilter === 'monthly'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly ({expenses.filter((e) => e.frequency === 'monthly').length})
            </button>
            <button
              onClick={() => setFrequencyFilter('annual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                frequencyFilter === 'annual'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual ({expenses.filter((e) => e.frequency === 'annual').length})
            </button>
          </div>

          {/* Filter Options: Paused Toggle & Category Dropdown */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowPaused((prev) => !prev)}
              className={`px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all ${
                showPaused
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
              title="Toggle display of paused expenses"
            >
              {showPaused ? 'Include Paused' : 'Active Only'}
            </button>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* 4. Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <CalendarSync className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">No recurring expenses found</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {searchQuery || frequencyFilter !== 'all' || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filters.'
                  : 'Start tracking your monthly and annual recurrent commitments.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-all shadow-md shadow-amber-950/60"
              >
                Add Your First Recurring Bill
              </button>
              {expenses.length === 0 && (
                <button
                  onClick={onResetToSample}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700"
                >
                  Load Sample Expenses
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const monthlyNormalized = getNormalizedMonthlyAmount(expense);
            const annualNormalized = getNormalizedAnnualAmount(expense);
            const isAnnual = expense.frequency === 'annual';
            const categoryStyle = EXPENSE_CATEGORY_COLORS[expense.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';

            return (
              <div 
                key={expense.id}
                className={`p-3 rounded-2xl border shadow-sm transition-all space-y-2 ${
                  expense.isActive
                    ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700/80'
                    : 'bg-slate-950/60 border-slate-900/80 opacity-60'
                }`}
              >
                {/* Top Row: Name + Badges & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-bold text-xs sm:text-sm ${expense.isActive ? 'text-white' : 'text-slate-400 line-through'}`}>
                        {expense.name}
                      </span>

                      {/* Frequency Badge */}
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold capitalize border ${
                        isAnnual
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {expense.frequency}
                      </span>

                      {/* Category Badge */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${categoryStyle}`}>
                        {expense.category}
                      </span>
                    </div>

                    {/* Billing Schedule & Payment Method */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                      {expense.billingDayOrMonth && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{isAnnual ? `Renews in ${expense.billingDayOrMonth}` : `Due on ${expense.billingDayOrMonth}`}</span>
                        </span>
                      )}
                      {expense.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>{expense.paymentMethod}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Toggle active, Edit, Delete) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(expense)}
                      className={`p-1 rounded-lg transition-colors ${
                        expense.isActive
                          ? 'text-emerald-400 hover:bg-emerald-950/40'
                          : 'text-slate-500 hover:bg-slate-800'
                      }`}
                      title={expense.isActive ? 'Active (click to pause)' : 'Paused (click to activate)'}
                    >
                      {expense.isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <PauseCircle className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(expense)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {deletingId === expense.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteExpense(expense.id);
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
                        onClick={() => setDeletingId(expense.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Amount Row: Natural cost + Normalized counterpart */}
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Billed Amount</span>
                    <span className="font-bold text-white font-mono-num text-sm">
                      {formatCurrency(expense.amount)}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">
                      / {expense.frequency}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block">
                      {isAnnual ? 'Monthly Equivalent' : 'Annual Run-Rate'}
                    </span>
                    <span className="font-bold text-amber-400 font-mono-num text-sm">
                      {formatCurrency(isAnnual ? monthlyNormalized : annualNormalized)}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-1">
                      / {isAnnual ? 'month' : 'year'}
                    </span>
                  </div>
                </div>

                {/* Notes if present */}
                {expense.notes && (
                  <p className="text-[10px] text-slate-400 italic truncate pt-0.5">
                    {expense.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Add / Edit Modal */}
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
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <CalendarSync className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">
                  {editingId ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="space-y-3 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Expense Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, SP Group, Shield Health Plan"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Amount and Frequency */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 25.90"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-num placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Frequency *
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as ExpenseFrequency)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual (Yearly)</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing Schedule & Payment Method */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Due Date / Month
                  </label>
                  <input
                    type="text"
                    placeholder={formFrequency === 'annual' ? 'e.g. October' : 'e.g. 1st, 15th'}
                    value={formBilling}
                    onChange={(e) => setFormBilling(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DBS GIRO, OCBC Card"
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Notes / Contract Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Contract ends Nov 2026, auto-renews"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isActiveToggle" className="text-slate-300 font-medium">
                  Active (Include in monthly and annual calculations)
                </label>
              </div>

              {/* Action Buttons */}
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
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-950/60"
                >
                  {editingId ? 'Save Changes' : 'Add Recurring Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
