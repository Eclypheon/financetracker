import React, { useState } from 'react';
import { FinanceCardData, CategoryKey } from '../types/finance';
import { calculateCardTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Wallet, 
  Coins, 
  Landmark, 
  Home, 
  TrendingUp, 
  Check, 
  X 
} from 'lucide-react';

interface FinanceCardProps {
  card: FinanceCardData;
  mode?: 'featured' | 'compact' | 'comparison';
  isEditable?: boolean;
  isSelected?: boolean;
  onUpdate?: (updated: FinanceCardData) => void;
  onDelete?: () => void;
  onSelect?: () => void;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  card,
  mode = 'featured',
  isEditable = true,
  isSelected = false,
  onUpdate,
  onDelete,
  onSelect,
}) => {
  const [addingCategory, setAddingCategory] = useState<CategoryKey | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [monthInput, setMonthInput] = useState(card.monthYear);

  const totals = calculateCardTotals(card);

  // Field change handler
  const handleFieldValueChange = (category: CategoryKey, fieldId: string, valStr: string) => {
    if (!onUpdate) return;
    const numeric = parseFloat(valStr.replace(/[^0-9.-]+/g, '')) || 0;
    const updatedCategory = card[category].map((item) =>
      item.id === fieldId ? { ...item, value: numeric } : item
    );
    onUpdate({
      ...card,
      [category]: updatedCategory,
    });
  };

  // Add custom field handler
  const handleAddField = (category: CategoryKey) => {
    if (!newFieldName.trim() || !onUpdate) return;
    const newField = {
      id: `custom_${Date.now()}`,
      name: newFieldName.trim(),
      value: 0,
      isCustom: true,
    };
    onUpdate({
      ...card,
      [category]: [...card[category], newField],
    });
    setNewFieldName('');
    setAddingCategory(null);
  };

  // Delete field handler
  const handleDeleteField = (category: CategoryKey, fieldId: string) => {
    if (!onUpdate) return;
    onUpdate({
      ...card,
      [category]: card[category].filter((item) => item.id !== fieldId),
    });
  };

  // Month year update
  const handleSaveMonthYear = () => {
    if (onUpdate && monthInput.trim()) {
      onUpdate({
        ...card,
        monthYear: monthInput.trim(),
      });
    }
    setIsEditingMonth(false);
  };

  // Compact Mode (for past cards horizontal spread)
  if (mode === 'compact') {
    return (
      <div
        onClick={onSelect}
        className={`group relative flex-shrink-0 w-[240px] h-[520px] rounded-2xl border transition-all duration-200 p-3.5 flex flex-col justify-between cursor-pointer select-none text-left ${
          isSelected
            ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow'
        }`}
      >
        {/* Top bar */}
        <div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono-num text-slate-300">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{card.monthYear}</span>
            </div>
            {isSelected && (
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Selected
              </span>
            )}
          </div>

          {/* Total Assets Pill */}
          <div className="my-2.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Assets</div>
            <div className="text-base font-bold font-mono-num text-white group-hover:text-emerald-300 transition-colors">
              {formatCurrency(totals.totalAssets)}
            </div>
          </div>

          {/* Mini breakdown preview */}
          <div className="space-y-2 text-[11px]">
            {/* Liquid */}
            <div className="p-2 rounded-lg bg-cyan-950/20 border border-cyan-900/30">
              <div className="flex justify-between items-center text-cyan-300 font-semibold text-[10px] pb-1 border-b border-cyan-900/30">
                <span className="flex items-center gap-1"><Coins className="w-2.5 h-2.5" /> Liquid Total</span>
                <span className="font-mono-num">{formatCurrency(totals.liquidTotal)}</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                <span>Banks: {formatCurrency(totals.banksTotal, { compact: true })}</span>
                <span>Stocks: {formatCurrency(totals.stocksTotal, { compact: true })}</span>
              </div>
            </div>

            {/* Non-liquid */}
            <div className="p-2 rounded-lg bg-purple-950/20 border border-purple-900/30">
              <div className="flex justify-between items-center text-purple-300 font-semibold text-[10px] pb-1 border-b border-purple-900/30">
                <span className="flex items-center gap-1"><Landmark className="w-2.5 h-2.5" /> Non-liquid</span>
                <span className="font-mono-num">{formatCurrency(totals.nonLiquidTotal)}</span>
              </div>
              <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                <span>CPF: {formatCurrency(totals.cpfTotal, { compact: true })}</span>
                <span>Prop: {formatCurrency(totals.propertyTotal, { compact: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom card footer */}
        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Click to compare</span>
          <span className="text-emerald-400/80 group-hover:text-emerald-300">&rarr;</span>
        </div>
      </div>
    );
  }

  // Vertical Rectangle Card (around 600 to 700px tall and ~320px wide)
  return (
    <div
      className={`w-[320px] sm:w-[330px] min-h-[620px] max-h-[680px] rounded-2xl border transition-all duration-300 shadow-xl flex flex-col justify-between ${
        mode === 'featured'
          ? 'bg-slate-900/95 border-slate-800 shadow-emerald-950/20 ring-1 ring-emerald-500/10'
          : 'bg-slate-900 border-slate-800 shadow-md'
      }`}
    >
      {/* 1. Header (Month/Year + Total Assets) */}
      <div className="p-3.5 border-b border-slate-800/90 bg-slate-950/40 rounded-t-2xl">
        <div className="flex items-center justify-between gap-1 mb-2">
          {/* Month/Year */}
          <div className="flex items-center gap-1">
            {isEditingMonth ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  placeholder="MM/YY"
                  className="w-16 px-1.5 py-0.5 text-xs font-bold bg-slate-800 border border-emerald-500 rounded text-white font-mono-num focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveMonthYear}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save Month"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => isEditable && setIsEditingMonth(true)}
                className={`flex items-center gap-1 text-xs font-bold text-slate-200 font-mono-num ${
                  isEditable ? 'cursor-pointer hover:text-emerald-400 group/m' : ''
                }`}
                title={isEditable ? 'Click to edit Month/Year' : undefined}
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Month/Year = {card.monthYear}</span>
                {isEditable && (
                  <span className="text-[9px] font-normal text-slate-500 group-hover/m:text-emerald-400">
                    ✎
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {mode === 'featured' && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Latest
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Total Assets Display */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Assets:</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono-num text-white tracking-tight">
            {formatCurrency(totals.totalAssets)}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: Categories and fields */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* ================= LIQUID ASSETS SECTION ================= */}
        <div className="rounded-xl bg-slate-950/60 p-2.5 border border-cyan-950/70 ring-1 ring-cyan-500/10 space-y-2">
          {/* Section Total Row */}
          <div className="flex items-center justify-between pb-1 border-b border-cyan-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Coins className="w-3 h-3" /> Liquid Assets Total:
            </span>
            <span className="text-xs font-bold font-mono-num text-cyan-300">
              {formatCurrency(totals.liquidTotal)}
            </span>
          </div>

          {/* Banks */}
          <CategorySection
            title="Banks"
            icon={<Landmark className="w-3 h-3 text-cyan-400" />}
            category="banks"
            fields={card.banks}
            isEditable={isEditable}
            addingCategory={addingCategory}
            newFieldName={newFieldName}
            setAddingCategory={setAddingCategory}
            setNewFieldName={setNewFieldName}
            onFieldValueChange={handleFieldValueChange}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
          />

          {/* Stocks */}
          <CategorySection
            title="Stocks"
            icon={<TrendingUp className="w-3 h-3 text-blue-400" />}
            category="stocks"
            fields={card.stocks}
            isEditable={isEditable}
            addingCategory={addingCategory}
            newFieldName={newFieldName}
            setAddingCategory={setAddingCategory}
            setNewFieldName={setNewFieldName}
            onFieldValueChange={handleFieldValueChange}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
          />
        </div>

        {/* ================= NON-LIQUID ASSETS SECTION ================= */}
        <div className="rounded-xl bg-slate-950/60 p-2.5 border border-purple-950/70 ring-1 ring-purple-500/10 space-y-2">
          {/* Section Total Row */}
          <div className="flex items-center justify-between pb-1 border-b border-purple-900/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Non-liquid Assets Total:
            </span>
            <span className="text-xs font-bold font-mono-num text-purple-300">
              {formatCurrency(totals.nonLiquidTotal)}
            </span>
          </div>

          {/* CPF */}
          <CategorySection
            title="CPF"
            subTotalLabel="CPF Total"
            subTotalValue={totals.cpfTotal}
            icon={<Landmark className="w-3 h-3 text-purple-400" />}
            category="cpf"
            fields={card.cpf}
            isEditable={isEditable}
            addingCategory={addingCategory}
            newFieldName={newFieldName}
            setAddingCategory={setAddingCategory}
            setNewFieldName={setNewFieldName}
            onFieldValueChange={handleFieldValueChange}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
          />

          {/* Property */}
          <CategorySection
            title="Property"
            subTotalLabel="Property Total"
            subTotalValue={totals.propertyTotal}
            icon={<Home className="w-3 h-3 text-indigo-400" />}
            category="property"
            fields={card.property}
            isEditable={isEditable}
            addingCategory={addingCategory}
            newFieldName={newFieldName}
            setAddingCategory={setAddingCategory}
            setNewFieldName={setNewFieldName}
            onFieldValueChange={handleFieldValueChange}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
          />
        </div>
      </div>

      {/* 3. Footer Summary */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 text-cyan-400">
          <span>Liquid:</span>
          <span className="font-mono-num font-semibold">{formatCurrency(totals.liquidTotal, { compact: true })}</span>
        </div>
        <div className="text-slate-600">+</div>
        <div className="flex items-center gap-1 text-purple-400">
          <span>Non-liquid:</span>
          <span className="font-mono-num font-semibold">{formatCurrency(totals.nonLiquidTotal, { compact: true })}</span>
        </div>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  icon: React.ReactNode;
  category: CategoryKey;
  fields: { id: string; name: string; value: number; isCustom?: boolean }[];
  isEditable: boolean;
  subTotalLabel?: string;
  subTotalValue?: number;
  addingCategory: CategoryKey | null;
  newFieldName: string;
  setAddingCategory: (cat: CategoryKey | null) => void;
  setNewFieldName: (name: string) => void;
  onFieldValueChange: (cat: CategoryKey, fieldId: string, val: string) => void;
  onAddField: (cat: CategoryKey) => void;
  onDeleteField: (cat: CategoryKey, fieldId: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  category,
  fields,
  isEditable,
  subTotalLabel,
  subTotalValue,
  addingCategory,
  newFieldName,
  setAddingCategory,
  setNewFieldName,
  onFieldValueChange,
  onAddField,
  onDeleteField,
}) => {
  return (
    <div className="space-y-1.5">
      {/* Category Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
          {icon}
          <span>{title}</span>
        </div>

        {isEditable && (
          <button
            onClick={() => {
              if (addingCategory === category) {
                setAddingCategory(null);
              } else {
                setAddingCategory(category);
                setNewFieldName('');
              }
            }}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={`Add more fields to ${title}`}
          >
            <Plus className="w-2.5 h-2.5 text-emerald-400" />
            <span>+</span>
          </button>
        )}
      </div>

      {/* Field Add Form */}
      {addingCategory === category && (
        <div className="flex items-center gap-1 p-1 rounded bg-slate-800 border border-slate-700 my-1">
          <input
            type="text"
            placeholder="Field name..."
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddField(category)}
            autoFocus
            className="flex-1 px-1.5 py-0.5 text-[11px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => onAddField(category)}
            disabled={!newFieldName.trim()}
            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white"
            title="Save"
          >
            <Check className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => setAddingCategory(null)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Cancel"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Field rows */}
      <div className="space-y-1">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-1 px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-800/70 text-[11px]"
          >
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="font-medium text-slate-300 truncate" title={field.name}>
                {field.name}:
              </span>
              {field.isCustom && isEditable && (
                <button
                  onClick={() => onDeleteField(category, field.id)}
                  className="text-slate-600 hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-500 font-mono-num">$</span>
              {isEditable ? (
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={field.value === 0 ? '' : field.value}
                  placeholder="0"
                  onChange={(e) => onFieldValueChange(category, field.id, e.target.value)}
                  className="w-20 text-right font-mono-num text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition-colors"
                />
              ) : (
                <span className="font-mono-num text-[11px] font-semibold text-slate-200">
                  {formatCurrency(field.value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Optional sub-total row (e.g. CPF Total or Property Total) */}
      {subTotalLabel && subTotalValue !== undefined && (
        <div className="flex items-center justify-between px-2 py-0.5 text-[10px] text-slate-400">
          <span>{subTotalLabel}:</span>
          <span className="font-mono-num font-bold text-slate-200">{formatCurrency(subTotalValue)}</span>
        </div>
      )}
    </div>
  );
};
