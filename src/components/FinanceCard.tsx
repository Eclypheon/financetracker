import React, { useState } from 'react';
import { FinanceCardData, CategoryKey } from '../types/finance';
import { calculateCardTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Wallet, 
  TrendingUp, 
  Landmark, 
  Home, 
  Coins, 
  Check, 
  Sparkles,
  ChevronDown,
  ChevronUp
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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(mode === 'featured');

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

  // Compact Mode (for horizontal spread of past cards)
  if (mode === 'compact') {
    return (
      <div
        onClick={onSelect}
        className={`group relative flex-shrink-0 w-72 rounded-2xl border transition-all duration-300 p-4 cursor-pointer text-left ${
          isSelected
            ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/20'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{card.monthYear}</span>
          </div>
          {isSelected && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Selected
            </span>
          )}
        </div>

        <div className="mb-3">
          <div className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">Total Assets</div>
          <div className="text-xl font-bold font-mono-num text-white group-hover:text-emerald-300 transition-colors">
            {formatCurrency(totals.totalAssets)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800/50">
            <div className="text-[10px] text-cyan-400/90 font-medium flex items-center gap-1">
              <Coins className="w-3 h-3" /> Liquid
            </div>
            <div className="font-semibold font-mono-num text-slate-200 mt-0.5">
              {formatCurrency(totals.liquidTotal, { compact: true })}
            </div>
          </div>
          <div className="bg-slate-950/40 rounded-lg p-2 border border-slate-800/50">
            <div className="text-[10px] text-purple-400/90 font-medium flex items-center gap-1">
              <Landmark className="w-3 h-3" /> Non-liquid
            </div>
            <div className="font-semibold font-mono-num text-slate-200 mt-0.5">
              {formatCurrency(totals.nonLiquidTotal, { compact: true })}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>{card.banks.length + card.stocks.length} liquid · {card.cpf.length + card.property.length} non-liquid</span>
          <span className="text-emerald-400/70 group-hover:text-emerald-400 text-xs">View &rarr;</span>
        </div>
      </div>
    );
  }

  // Full / Featured Mode or Comparison Single Card Mode
  return (
    <div
      className={`relative w-full rounded-2xl border transition-all duration-300 shadow-2xl backdrop-blur-xl ${
        mode === 'featured'
          ? 'bg-slate-900/90 border-slate-800 max-w-2xl mx-auto shadow-emerald-950/20'
          : 'bg-slate-900/95 border-slate-800 shadow-lg'
      }`}
    >
      {/* Top Card Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {mode === 'featured' ? 'Latest Record' : 'Snapshot'}
                </span>
                {mode === 'featured' && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>

              {/* Month/Year with inline edit */}
              <div className="flex items-center gap-2 mt-0.5">
                {isEditingMonth ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={monthInput}
                      onChange={(e) => setMonthInput(e.target.value)}
                      placeholder="MM/YY"
                      className="w-24 px-2 py-1 text-sm font-bold bg-slate-800 border border-emerald-500 rounded-lg text-white font-mono-num focus:outline-none"
                    />
                    <button
                      onClick={handleSaveMonthYear}
                      className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Save Month"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => isEditable && setIsEditingMonth(true)}
                    className={`flex items-center gap-1.5 text-lg font-bold text-white font-mono-num ${
                      isEditable ? 'cursor-pointer hover:text-emerald-400 group/month' : ''
                    }`}
                    title={isEditable ? 'Click to edit Month/Year' : undefined}
                  >
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>Month/Year = {card.monthYear}</span>
                    {isEditable && (
                      <span className="text-[10px] font-normal text-slate-500 group-hover/month:text-emerald-400 ml-1">
                        (edit)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/20"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {mode === 'featured' && (
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <span>{isDetailsExpanded ? 'Collapse' : 'Expand'}</span>
                {isDetailsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Big Total Assets Display */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800/70 to-slate-900 border border-slate-700/70 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Total Assets</span>
                <span className="text-[10px] text-slate-500 font-normal lowercase">(liquid + non-liquid)</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono-num text-white tracking-tight">
                {formatCurrency(totals.totalAssets)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="font-medium">Liquid:</span>
                <span className="font-bold font-mono-num">{formatCurrency(totals.liquidTotal, { compact: true })}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span className="font-medium">Non-liquid:</span>
                <span className="font-bold font-mono-num">{formatCurrency(totals.nonLiquidTotal, { compact: true })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content & Categories */}
      {isDetailsExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* ================= SECTION 1: LIQUID ASSETS ================= */}
          <div className="space-y-4 rounded-2xl bg-slate-950/50 p-4 sm:p-5 border border-cyan-950/60 ring-1 ring-cyan-500/10">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Liquid Assets Breakdown
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Banks + Stocks
              </div>
            </div>

            {/* Category: Banks */}
            <CategoryBlock
              title="Banks"
              icon={<Landmark className="w-4 h-4 text-cyan-400" />}
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

            {/* Category: Stocks */}
            <CategoryBlock
              title="Stocks"
              icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
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

            {/* Liquid Assets Total calculated row */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-bold text-cyan-200">
                  Liquid Assets Total:
                </span>
                <span className="text-[11px] text-cyan-400/80 hidden sm:inline">(Banks + Stocks)</span>
              </div>
              <span className="text-base sm:text-lg font-extrabold font-mono-num text-cyan-300">
                {formatCurrency(totals.liquidTotal)}
              </span>
            </div>
          </div>

          {/* ================= SECTION 2: NON-LIQUID ASSETS ================= */}
          <div className="space-y-4 rounded-2xl bg-slate-950/50 p-4 sm:p-5 border border-purple-950/60 ring-1 ring-purple-500/10">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Non-Liquid Assets Breakdown
                </span>
              </div>
              <div className="text-xs text-slate-400">
                CPF + Property
              </div>
            </div>

            {/* Category: CPF */}
            <div className="space-y-2">
              <CategoryBlock
                title="CPF"
                icon={<Landmark className="w-4 h-4 text-purple-400" />}
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
              {/* CPF Total Row */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs">
                <span className="font-semibold text-purple-300">CPF Total:</span>
                <span className="font-bold font-mono-num text-purple-200">{formatCurrency(totals.cpfTotal)}</span>
              </div>
            </div>

            {/* Category: Property */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <CategoryBlock
                title="Property"
                icon={<Home className="w-4 h-4 text-indigo-400" />}
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
              {/* Property Total Row */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs">
                <span className="font-semibold text-purple-300">Property Total:</span>
                <span className="font-bold font-mono-num text-purple-200">{formatCurrency(totals.propertyTotal)}</span>
              </div>
            </div>

            {/* Non-liquid Assets Total calculated row */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-purple-200">
                  Non-liquid Assets Total:
                </span>
                <span className="text-[11px] text-purple-400/80 hidden sm:inline">(CPF Total + Property Total)</span>
              </div>
              <span className="text-base sm:text-lg font-extrabold font-mono-num text-purple-300">
                {formatCurrency(totals.nonLiquidTotal)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategoryBlockProps {
  title: string;
  icon: React.ReactNode;
  category: CategoryKey;
  fields: { id: string; name: string; value: number; isCustom?: boolean }[];
  isEditable: boolean;
  addingCategory: CategoryKey | null;
  newFieldName: string;
  setAddingCategory: (cat: CategoryKey | null) => void;
  setNewFieldName: (name: string) => void;
  onFieldValueChange: (cat: CategoryKey, fieldId: string, val: string) => void;
  onAddField: (cat: CategoryKey) => void;
  onDeleteField: (cat: CategoryKey, fieldId: string) => void;
}

const CategoryBlock: React.FC<CategoryBlockProps> = ({
  title,
  icon,
  category,
  fields,
  isEditable,
  addingCategory,
  newFieldName,
  setAddingCategory,
  setNewFieldName,
  onFieldValueChange,
  onAddField,
  onDeleteField,
}) => {
  return (
    <div className="space-y-2">
      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <h4 className="text-xs font-bold tracking-wide uppercase text-slate-300">{title}</h4>
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
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={`Add more fields to ${title}`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add field</span>
          </button>
        )}
      </div>

      {/* Field Add Form */}
      {addingCategory === category && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/90 border border-slate-700 my-2">
          <input
            type="text"
            placeholder={`New field name in ${title} (e.g. UOB, Citibank)...`}
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddField(category)}
            autoFocus
            className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => onAddField(category)}
            disabled={!newFieldName.trim()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => setAddingCategory(null)}
            className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Field Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-medium text-slate-300 truncate" title={field.name}>
                {field.name}:
              </span>
              {field.isCustom && isEditable && (
                <button
                  onClick={() => onDeleteField(category, field.id)}
                  className="text-slate-600 hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 font-mono-num">$</span>
              {isEditable ? (
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={field.value === 0 ? '' : field.value}
                  placeholder="0"
                  onChange={(e) => onFieldValueChange(category, field.id, e.target.value)}
                  className="w-24 sm:w-28 text-right font-mono-num text-xs font-semibold px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition-colors"
                />
              ) : (
                <span className="font-mono-num text-xs font-semibold text-slate-200">
                  {formatCurrency(field.value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
