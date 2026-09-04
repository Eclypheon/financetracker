import React, { useState, useEffect } from 'react';
import { FinanceCardData, CategoryKey, AssetCategory } from '../types/finance';
import { calculateCardTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Landmark, 
  Home, 
  TrendingUp, 
  Check, 
  X, 
  FolderPlus, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
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
  const [addingCategory, setAddingCategory] = useState<string | null>(null);
  const [newFieldName, setNewFieldName] = useState('');
  const [isAddingHeaderSection, setIsAddingHeaderSection] = useState<'liquid' | 'nonLiquid' | null>(null);
  const [newHeaderName, setNewHeaderName] = useState('');
  const [isEditingMonth, setIsEditingMonth] = useState(false);
  const [monthInput, setMonthInput] = useState(card.monthYear);
  const [isExpanded, setIsExpanded] = useState(mode !== 'compact');
  const [isConfirmingDeleteCard, setIsConfirmingDeleteCard] = useState(false);

  useEffect(() => {
    setIsConfirmingDeleteCard(false);
    setMonthInput(card.monthYear);
    setIsEditingMonth(false);
  }, [card.id, card.monthYear]);

  const totals = calculateCardTotals(card);

  // Field change handler for standard categories
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

  // Field change handler for custom categories
  const handleCustomCategoryFieldValueChange = (
    sectionType: 'liquid' | 'nonLiquid',
    catId: string,
    fieldId: string,
    valStr: string
  ) => {
    if (!onUpdate) return;
    const numeric = parseFloat(valStr.replace(/[^0-9.-]+/g, '')) || 0;
    const key = sectionType === 'liquid' ? 'customLiquidCategories' : 'customNonLiquidCategories';
    const categories = card[key] || [];
    const updated = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        fields: cat.fields.map((f) => (f.id === fieldId ? { ...f, value: numeric } : f)),
      };
    });
    onUpdate({
      ...card,
      [key]: updated,
    });
  };

  // Manual Direct Overrides for Liquid, Non-Liquid, and Total Assets (for missing past breakdowns)
  const handleManualLiquidChange = (valStr: string) => {
    if (!onUpdate) return;
    const numeric = valStr.trim() === '' ? undefined : parseFloat(valStr.replace(/[^0-9.-]+/g, '')) || 0;
    onUpdate({
      ...card,
      manualLiquidTotal: numeric,
      manualTotalAssets: undefined, // auto sum with non-liquid
    });
  };

  const handleManualNonLiquidChange = (valStr: string) => {
    if (!onUpdate) return;
    const numeric = valStr.trim() === '' ? undefined : parseFloat(valStr.replace(/[^0-9.-]+/g, '')) || 0;
    onUpdate({
      ...card,
      manualNonLiquidTotal: numeric,
      manualTotalAssets: undefined, // auto sum with liquid
    });
  };

  const handleManualTotalChange = (valStr: string) => {
    if (!onUpdate) return;
    const numeric = valStr.trim() === '' ? undefined : parseFloat(valStr.replace(/[^0-9.-]+/g, '')) || 0;
    onUpdate({
      ...card,
      manualTotalAssets: numeric,
    });
  };

  const handleResetManualOverrides = () => {
    if (!onUpdate) return;
    onUpdate({
      ...card,
      manualLiquidTotal: undefined,
      manualNonLiquidTotal: undefined,
      manualTotalAssets: undefined,
    });
  };

  // Add field to standard category
  const handleAddField = (category: CategoryKey) => {
    if (!newFieldName.trim() || !onUpdate) return;
    const newField = {
      id: `field_${Date.now()}`,
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

  // Add field to custom category
  const handleAddCustomCategoryField = (sectionType: 'liquid' | 'nonLiquid', catId: string) => {
    if (!newFieldName.trim() || !onUpdate) return;
    const key = sectionType === 'liquid' ? 'customLiquidCategories' : 'customNonLiquidCategories';
    const categories = card[key] || [];
    const newField = {
      id: `field_${Date.now()}`,
      name: newFieldName.trim(),
      value: 0,
      isCustom: true,
    };
    const updated = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        fields: [...cat.fields, newField],
      };
    });
    onUpdate({
      ...card,
      [key]: updated,
    });
    setNewFieldName('');
    setAddingCategory(null);
  };

  // Delete field from standard category
  const handleDeleteField = (category: CategoryKey, fieldId: string) => {
    if (!onUpdate) return;
    onUpdate({
      ...card,
      [category]: card[category].filter((item) => item.id !== fieldId),
    });
  };

  // Delete field from custom category
  const handleDeleteCustomCategoryField = (sectionType: 'liquid' | 'nonLiquid', catId: string, fieldId: string) => {
    if (!onUpdate) return;
    const key = sectionType === 'liquid' ? 'customLiquidCategories' : 'customNonLiquidCategories';
    const categories = card[key] || [];
    const updated = categories.map((cat) => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        fields: cat.fields.filter((f) => f.id !== fieldId),
      };
    });
    onUpdate({
      ...card,
      [key]: updated,
    });
  };

  // Add new custom header category
  const handleAddHeaderCategory = (sectionType: 'liquid' | 'nonLiquid') => {
    if (!newHeaderName.trim() || !onUpdate) return;
    const key = sectionType === 'liquid' ? 'customLiquidCategories' : 'customNonLiquidCategories';
    const categories = card[key] || [];
    const newCategory: AssetCategory = {
      id: `cat_${Date.now()}`,
      name: newHeaderName.trim(),
      isRemovable: true,
      fields: [],
    };
    onUpdate({
      ...card,
      [key]: [...categories, newCategory],
    });
    setNewHeaderName('');
    setIsAddingHeaderSection(null);
  };

  // Delete custom header category
  const handleDeleteHeaderCategory = (sectionType: 'liquid' | 'nonLiquid', catId: string) => {
    if (!onUpdate) return;
    const key = sectionType === 'liquid' ? 'customLiquidCategories' : 'customNonLiquidCategories';
    const categories = card[key] || [];
    onUpdate({
      ...card,
      [key]: categories.filter((cat) => cat.id !== catId),
    });
  };

  // Month year update
  const handleSaveMonthYear = () => {
    const trimmed = monthInput.trim();
    if (onUpdate && trimmed && trimmed !== card.monthYear) {
      onUpdate({
        ...card,
        monthYear: trimmed,
      });
    } else if (!trimmed) {
      setMonthInput(card.monthYear);
    }
    setIsEditingMonth(false);
  };

  const hasManualOverrides =
    card.manualLiquidTotal !== undefined ||
    card.manualNonLiquidTotal !== undefined ||
    card.manualTotalAssets !== undefined;

  // =========================================================================
  // COMPACT MODE (for carousel cards: direct editable totals for missing past data!)
  // =========================================================================
  if (mode === 'compact') {
    return (
      <div
        className={`group relative flex-shrink-0 transition-all duration-200 rounded-xl border p-2 flex flex-col justify-between text-left ${
          isExpanded ? 'w-[280px] max-h-[500px]' : 'w-[190px] h-[145px]'
        } ${
          isSelected
            ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/40'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
        }`}
      >
        {/* Single-line Top Header: MM/YY on left, Total on right */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/80 text-[10px]">
          {/* Left: MM/YY */}
          <div className="flex items-center gap-1">
            {isEditingMonth ? (
              <div 
                className="flex items-center gap-0.5" 
                onClick={(e) => e.stopPropagation()}
                data-no-drag="true"
              >
                <input
                  type="text"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveMonthYear();
                    } else if (e.key === 'Escape') {
                      setIsEditingMonth(false);
                      setMonthInput(card.monthYear);
                    }
                  }}
                  onBlur={handleSaveMonthYear}
                  placeholder="MM/YY"
                  className="w-14 px-1 py-0.5 text-[9px] font-bold bg-slate-800 border border-emerald-500 rounded text-white font-mono-num focus:outline-none select-text"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleSaveMonthYear();
                  }}
                  className="p-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save MM/YY"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-no-drag="true"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isEditable) {
                    setMonthInput(card.monthYear);
                    setIsEditingMonth(true);
                  }
                }}
                className="flex items-center gap-0.5 font-bold font-mono-num text-slate-300 hover:text-emerald-400 cursor-pointer p-0.5 rounded hover:bg-slate-800/80 transition-colors group/m"
                title="Click to edit MM/YY"
              >
                <Calendar className="w-2.5 h-2.5 text-emerald-400" />
                <span>{card.monthYear}</span>
                {isEditable && (
                  <span className="text-[8px] text-slate-500 group-hover/m:text-emerald-400">✎</span>
                )}
              </button>
            )}
          </div>

          {/* Right: Total with Direct Input for unitemized past data */}
          <div className="flex items-center gap-1 font-mono-num" onClick={(e) => e.stopPropagation()}>
            <span className="text-slate-400 text-[9px]">Total:</span>
            {isEditable ? (
              <input
                type="text"
                inputMode="decimal"
                value={totals.totalAssets === 0 ? '' : totals.totalAssets}
                placeholder="0"
                onChange={(e) => handleManualTotalChange(e.target.value)}
                className="w-16 text-right font-mono-num font-bold text-white text-[10px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                title="Direct edit Total Assets"
              />
            ) : (
              <span className="font-bold text-white text-[10px]">{formatCurrency(totals.totalAssets)}</span>
            )}
            {onDelete && (
              isConfirmingDeleteCard ? (
                <div className="flex items-center gap-1 bg-rose-950/90 border border-rose-600/60 rounded px-1.5 py-0.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[9px] text-rose-300 font-medium">Del?</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsConfirmingDeleteCard(false);
                      onDelete();
                    }}
                    className="text-rose-400 hover:text-rose-200 p-0.5"
                    title="Confirm delete"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsConfirmingDeleteCard(false);
                    }}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Cancel"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsConfirmingDeleteCard(true);
                  }}
                  className="text-slate-600 hover:text-rose-400 p-0.5 transition-colors"
                  title="Delete card"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )
            )}
          </div>
        </div>

        {/* When Collapsed: Direct editable inputs for Liquid & Non-liquid totals */}
        {!isExpanded ? (
          <div className="flex-1 flex flex-col justify-between py-1" onClick={onSelect}>
            <div className="space-y-1 text-[9px] font-mono-num" onClick={(e) => e.stopPropagation()}>
              {/* Direct edit Liquid */}
              <div className="flex justify-between items-center text-cyan-300">
                <span className="text-slate-400">Liquid:</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-slate-500">$</span>
                  {isEditable ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={totals.liquidTotal === 0 ? '' : totals.liquidTotal}
                      placeholder="0"
                      onChange={(e) => handleManualLiquidChange(e.target.value)}
                      className="w-16 text-right font-mono-num text-[9px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-cyan-300 focus:border-cyan-500 focus:outline-none font-semibold"
                      title="Direct edit Liquid Assets Total"
                    />
                  ) : (
                    <span>{formatCurrency(totals.liquidTotal, { compact: true })}</span>
                  )}
                </div>
              </div>

              {/* Direct edit Non-liquid */}
              <div className="flex justify-between items-center text-purple-300">
                <span className="text-slate-400">Non-liquid:</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-slate-500">$</span>
                  {isEditable ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={totals.nonLiquidTotal === 0 ? '' : totals.nonLiquidTotal}
                      placeholder="0"
                      onChange={(e) => handleManualNonLiquidChange(e.target.value)}
                      className="w-16 text-right font-mono-num text-[9px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-purple-300 focus:border-purple-500 focus:outline-none font-semibold"
                      title="Direct edit Non-liquid Assets Total"
                    />
                  ) : (
                    <span>{formatCurrency(totals.nonLiquidTotal, { compact: true })}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[8px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
              >
                <span>Edit breakdown</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {hasManualOverrides && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetManualOverrides();
                  }}
                  className="text-slate-500 hover:text-cyan-400 flex items-center gap-0.5"
                  title="Reset to calculated breakdown sum"
                >
                  <RotateCcw className="w-2 h-2" />
                  <span>Calc</span>
                </button>
              )}

              {isSelected ? (
                <span className="text-emerald-400 font-bold">Selected</span>
              ) : (
                <span className="text-slate-500">Click to select</span>
              )}
            </div>
          </div>
        ) : (
          /* When Expanded: Full details breakdown, editable in place! */
          <div className="flex-1 flex flex-col justify-between overflow-hidden pt-1.5 space-y-1.5">
            <div className="overflow-y-auto custom-scrollbar space-y-1.5 max-h-[360px] pr-1 overscroll-y-contain">
              {/* Banks */}
              <CategorySection
                title="Banks"
                icon={<Landmark className="w-2 h-2 text-cyan-400" />}
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
                icon={<TrendingUp className="w-2 h-2 text-blue-400" />}
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

              {/* CPF */}
              <CategorySection
                title="CPF"
                icon={<Landmark className="w-2 h-2 text-purple-400" />}
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
                icon={<Home className="w-2 h-2 text-indigo-400" />}
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

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[8px]">
              <div className="flex items-center gap-1.5 font-mono-num text-[9px]">
                <span className="text-cyan-300">L: {formatCurrency(totals.liquidTotal, { compact: true })}</span>
                <span className="text-purple-300">NL: {formatCurrency(totals.nonLiquidTotal, { compact: true })}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="text-slate-400 hover:text-white flex items-center gap-0.5"
              >
                <span>Collapse</span>
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // FEATURED / MAIN CARD (Vertical Rectangle with single-line header and direct totals)
  // =========================================================================
  return (
    <div
      className={`w-[280px] sm:w-[290px] rounded-2xl border transition-all duration-300 shadow-xl flex flex-col justify-between ${
        mode === 'featured'
          ? 'bg-slate-900/95 border-slate-800 shadow-emerald-950/20 ring-1 ring-emerald-500/10'
          : 'bg-slate-900 border-slate-800 shadow-md'
      }`}
    >
      {/* Single-line Top Header: MM/YY on left, Total on right */}
      <div className="px-2.5 py-2 border-b border-slate-800/90 bg-slate-950/50 rounded-t-2xl flex items-center justify-between text-[11px]">
        {/* Left: MM/YY */}
        <div className="flex items-center gap-1">
          {isEditingMonth ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveMonthYear();
                  } else if (e.key === 'Escape') {
                    setIsEditingMonth(false);
                    setMonthInput(card.monthYear);
                  }
                }}
                onBlur={handleSaveMonthYear}
                placeholder="MM/YY"
                className="w-16 px-1.5 py-0.5 text-[10px] font-bold bg-slate-800 border border-emerald-500 rounded text-white font-mono-num focus:outline-none select-text"
                autoFocus
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleSaveMonthYear();
                }}
                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                title="Save Month"
              >
                <Check className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (isEditable) {
                  setMonthInput(card.monthYear);
                  setIsEditingMonth(true);
                }
              }}
              className={`flex items-center gap-1 font-bold text-slate-200 font-mono-num p-0.5 rounded hover:bg-slate-800/60 transition-colors ${
                isEditable ? 'cursor-pointer hover:text-emerald-400 group/m' : ''
              }`}
              title={isEditable ? 'Click to edit MM/YY' : undefined}
            >
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>{card.monthYear}</span>
              {isEditable && (
                <span className="text-[8px] font-normal text-slate-500 group-hover/m:text-emerald-400">
                  ✎
                </span>
              )}
            </button>
          )}
        </div>

        {/* Right: "Total: $..." on the SAME line */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 font-mono-num">
            <span className="text-[10px] text-slate-400">Total:</span>
            {isEditable ? (
              <input
                type="text"
                inputMode="decimal"
                value={totals.totalAssets === 0 ? '' : totals.totalAssets}
                placeholder="0"
                onChange={(e) => handleManualTotalChange(e.target.value)}
                className="w-20 text-right font-mono-num text-xs font-bold text-white px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                title="Direct edit Total Assets"
              />
            ) : (
              <span className="text-xs font-bold text-white">{formatCurrency(totals.totalAssets)}</span>
            )}
          </div>

          {onDelete && (
            isConfirmingDeleteCard ? (
              <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-600/60 rounded-lg px-2 py-0.5 shadow-sm" onClick={(e) => e.stopPropagation()}>
                <span className="text-[10px] text-rose-300 font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsConfirmingDeleteCard(false);
                    onDelete();
                  }}
                  className="p-1 text-rose-400 hover:text-rose-200 rounded transition-colors"
                  title="Confirm delete"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsConfirmingDeleteCard(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsConfirmingDeleteCard(true);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* 2. Scrollable Body: Categories and fields */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 max-h-[460px] overscroll-y-contain">
        {/* ================= LIQUID ASSETS SECTION ================= */}
        <div className="rounded-xl bg-slate-950/60 p-2 border border-cyan-950/70 ring-1 ring-cyan-500/10 space-y-1.5">
          {/* Banks Category */}
          <CategorySection
            title="Banks"
            icon={<Landmark className="w-2.5 h-2.5 text-cyan-400" />}
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

          {/* Stocks Category */}
          <CategorySection
            title="Stocks"
            icon={<TrendingUp className="w-2.5 h-2.5 text-blue-400" />}
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

          {/* Custom Liquid Categories */}
          {(card.customLiquidCategories || []).map((cat) => (
            <div key={cat.id} className="pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-300">{cat.name}</span>
                <div className="flex items-center gap-1">
                  {isEditable && (
                    <button
                      onClick={() => {
                        if (addingCategory === cat.id) {
                          setAddingCategory(null);
                        } else {
                          setAddingCategory(cat.id);
                          setNewFieldName('');
                        }
                      }}
                      className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 border border-slate-700"
                    >
                      +
                    </button>
                  )}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteHeaderCategory('liquid', cat.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {addingCategory === cat.id && (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800 border border-slate-700 my-1">
                  <input
                    type="text"
                    placeholder="Field name..."
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategoryField('liquid', cat.id)}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleAddCustomCategoryField('liquid', cat.id)}
                    disabled={!newFieldName.trim()}
                    className="p-0.5 rounded bg-cyan-600 text-white"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button onClick={() => setAddingCategory(null)} className="p-0.5 text-slate-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              <div className="space-y-0.5 mt-1">
                {cat.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {isEditable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteCustomCategoryField('liquid', cat.id, f.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                          title="Delete field"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <span className="truncate text-slate-300">{f.name}:</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] text-slate-500 font-mono-num">$</span>
                      {isEditable ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={f.value === 0 ? '' : f.value}
                          placeholder="0"
                          onChange={(e) =>
                            handleCustomCategoryFieldValueChange('liquid', cat.id, f.id, e.target.value)
                          }
                          className="w-16 text-right font-mono-num text-[10px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white"
                        />
                      ) : (
                        <span className="font-mono-num text-[10px] text-slate-200">
                          {formatCurrency(f.value)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add different header under Liquid */}
          {isEditable && (
            <div className="pt-0.5">
              {isAddingHeaderSection === 'liquid' ? (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800/90 border border-cyan-500/40">
                  <input
                    type="text"
                    placeholder="New header (e.g. Crypto)..."
                    value={newHeaderName}
                    onChange={(e) => setNewHeaderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHeaderCategory('liquid')}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleAddHeaderCategory('liquid')}
                    disabled={!newHeaderName.trim()}
                    className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-600 text-white font-semibold"
                  >
                    Add
                  </button>
                  <button onClick={() => setIsAddingHeaderSection(null)} className="p-0.5 text-slate-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAddingHeaderSection('liquid');
                    setNewHeaderName('');
                  }}
                  className="w-full flex items-center justify-center gap-1 py-0.5 rounded border border-dashed border-cyan-900/50 hover:border-cyan-500/50 text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <FolderPlus className="w-2.5 h-2.5" />
                  <span>+ Add Header</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= NON-LIQUID ASSETS SECTION ================= */}
        <div className="rounded-xl bg-slate-950/60 p-2 border border-purple-950/70 ring-1 ring-purple-500/10 space-y-1.5">
          {/* CPF Category */}
          <CategorySection
            title="CPF"
            subTotalLabel="CPF Total"
            subTotalValue={totals.cpfTotal}
            icon={<Landmark className="w-2.5 h-2.5 text-purple-400" />}
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

          {/* Property Category */}
          <CategorySection
            title="Property"
            subTotalLabel="Property Total"
            subTotalValue={totals.propertyTotal}
            icon={<Home className="w-2.5 h-2.5 text-indigo-400" />}
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

          {/* Custom Non-Liquid Categories */}
          {(card.customNonLiquidCategories || []).map((cat) => (
            <div key={cat.id} className="pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-300">{cat.name}</span>
                <div className="flex items-center gap-1">
                  {isEditable && (
                    <button
                      onClick={() => {
                        if (addingCategory === cat.id) {
                          setAddingCategory(null);
                        } else {
                          setAddingCategory(cat.id);
                          setNewFieldName('');
                        }
                      }}
                      className="px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-300 border border-slate-700"
                    >
                      +
                    </button>
                  )}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteHeaderCategory('nonLiquid', cat.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {addingCategory === cat.id && (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800 border border-slate-700 my-1">
                  <input
                    type="text"
                    placeholder="Field name..."
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategoryField('nonLiquid', cat.id)}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleAddCustomCategoryField('nonLiquid', cat.id)}
                    disabled={!newFieldName.trim()}
                    className="p-0.5 rounded bg-purple-600 text-white"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </button>
                  <button onClick={() => setAddingCategory(null)} className="p-0.5 text-slate-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              <div className="space-y-0.5 mt-1">
                {cat.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {isEditable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteCustomCategoryField('nonLiquid', cat.id, f.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                          title="Delete field"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <span className="truncate text-slate-300">{f.name}:</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <span className="text-[9px] text-slate-500 font-mono-num">$</span>
                      {isEditable ? (
                        <input
                          type="text"
                          inputMode="decimal"
                          value={f.value === 0 ? '' : f.value}
                          placeholder="0"
                          onChange={(e) =>
                            handleCustomCategoryFieldValueChange('nonLiquid', cat.id, f.id, e.target.value)
                          }
                          className="w-16 text-right font-mono-num text-[10px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white"
                        />
                      ) : (
                        <span className="font-mono-num text-[10px] text-slate-200">
                          {formatCurrency(f.value)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add different header under Non-Liquid */}
          {isEditable && (
            <div className="pt-0.5">
              {isAddingHeaderSection === 'nonLiquid' ? (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800/90 border border-purple-500/40">
                  <input
                    type="text"
                    placeholder="New header (e.g. Vehicles)..."
                    value={newHeaderName}
                    onChange={(e) => setNewHeaderName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddHeaderCategory('nonLiquid')}
                    autoFocus
                    className="flex-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleAddHeaderCategory('nonLiquid')}
                    disabled={!newHeaderName.trim()}
                    className="px-1.5 py-0.5 text-[9px] rounded bg-purple-600 text-white font-semibold"
                  >
                    Add
                  </button>
                  <button onClick={() => setIsAddingHeaderSection(null)} className="p-0.5 text-slate-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsAddingHeaderSection('nonLiquid');
                    setNewHeaderName('');
                  }}
                  className="w-full flex items-center justify-center gap-1 py-0.5 rounded border border-dashed border-purple-900/50 hover:border-purple-500/50 text-[9px] text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <FolderPlus className="w-2.5 h-2.5" />
                  <span>+ Add Header</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Footer Summary with Direct Inputs */}
      <div className="p-1.5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-1 text-cyan-400">
          <span>Liquid:</span>
          {isEditable ? (
            <input
              type="text"
              inputMode="decimal"
              value={totals.liquidTotal === 0 ? '' : totals.liquidTotal}
              placeholder="0"
              onChange={(e) => handleManualLiquidChange(e.target.value)}
              className="w-16 text-right font-mono-num font-semibold text-cyan-300 text-[9px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none"
              title="Direct edit Liquid Assets Total"
            />
          ) : (
            <span className="font-mono-num font-semibold">{formatCurrency(totals.liquidTotal)}</span>
          )}
        </div>

        {hasManualOverrides && (
          <button
            onClick={handleResetManualOverrides}
            className="text-slate-500 hover:text-slate-300 text-[8px] flex items-center gap-0.5"
            title="Reset direct totals to sum of itemized breakdown"
          >
            <RotateCcw className="w-2 h-2" />
          </button>
        )}

        <div className="flex items-center gap-1 text-purple-400">
          <span>Non-liquid:</span>
          {isEditable ? (
            <input
              type="text"
              inputMode="decimal"
              value={totals.nonLiquidTotal === 0 ? '' : totals.nonLiquidTotal}
              placeholder="0"
              onChange={(e) => handleManualNonLiquidChange(e.target.value)}
              className="w-16 text-right font-mono-num font-semibold text-purple-300 text-[9px] px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none"
              title="Direct edit Non-liquid Assets Total"
            />
          ) : (
            <span className="font-mono-num font-semibold">{formatCurrency(totals.nonLiquidTotal)}</span>
          )}
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
  addingCategory: string | null;
  newFieldName: string;
  setAddingCategory: (cat: string | null) => void;
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
    <div className="space-y-1">
      {/* Category Header */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
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
            className="flex items-center justify-center w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 hover:text-white transition-colors border border-slate-700"
            title={`Add field to ${title}`}
          >
            <Plus className="w-2.5 h-2.5 text-emerald-400" />
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
            className="flex-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => onAddField(category)}
            disabled={!newFieldName.trim()}
            className="p-0.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white"
            title="Save"
          >
            <Check className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => setAddingCategory(null)}
            className="p-0.5 rounded text-slate-400 hover:text-white"
            title="Cancel"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      {/* Field rows - EVERY field has a trash icon! */}
      <div className="space-y-0.5">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
          >
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDeleteField(category, field.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              )}
              <span className="font-medium text-slate-300 truncate" title={field.name}>
                {field.name}:
              </span>
            </div>

            <div className="flex items-center gap-0.5">
              <span className="text-[9px] text-slate-500 font-mono-num">$</span>
              {isEditable ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={field.value === 0 ? '' : field.value}
                  placeholder="0"
                  onChange={(e) => onFieldValueChange(category, field.id, e.target.value)}
                  className="w-16 text-right font-mono-num text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none text-white transition-colors"
                />
              ) : (
                <span className="font-mono-num text-[10px] font-semibold text-slate-200">
                  {formatCurrency(field.value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sub-total row (e.g. CPF Total or Property Total) */}
      {subTotalLabel && subTotalValue !== undefined && (
        <div className="flex items-center justify-between px-1.5 py-0.2 text-[9px] text-slate-400">
          <span>{subTotalLabel}:</span>
          <span className="font-mono-num font-bold text-slate-200">{formatCurrency(subTotalValue)}</span>
        </div>
      )}
    </div>
  );
};
