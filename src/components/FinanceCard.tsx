import React, { useState } from 'react';
import { FinanceCardData, CategoryKey, AssetCategory } from '../types/finance';
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
  X,
  FolderPlus
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

  // Delete field from standard category (Every field has trash icon now)
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

  // Delete entire custom header category
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
    if (onUpdate && monthInput.trim()) {
      onUpdate({
        ...card,
        monthYear: monthInput.trim(),
      });
    }
    setIsEditingMonth(false);
  };

  // Compact Mode (for past cards horizontal carousel - now short and snug!)
  if (mode === 'compact') {
    return (
      <div
        onClick={onSelect}
        className={`group relative flex-shrink-0 w-[185px] h-[165px] rounded-xl border transition-all duration-200 p-2.5 flex flex-col justify-between cursor-pointer select-none text-left ${
          isSelected
            ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div>
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-1 text-[10px] font-bold font-mono-num text-slate-300">
              <Calendar className="w-2.5 h-2.5 text-emerald-400" />
              <span>{card.monthYear}</span>
            </div>
            {isSelected && (
              <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Selected
              </span>
            )}
          </div>

          {/* Total Assets */}
          <div className="my-1.5 p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/70">
            <div className="text-[8px] text-slate-400 uppercase tracking-wider">Total Assets</div>
            <div className="text-sm font-bold font-mono-num text-white group-hover:text-emerald-300 transition-colors">
              {formatCurrency(totals.totalAssets)}
            </div>
          </div>

          {/* Mini Liquid & Non-liquid totals */}
          <div className="space-y-1 text-[9px] font-mono-num">
            <div className="flex justify-between items-center text-cyan-300">
              <span className="text-slate-400">Liquid:</span>
              <span>{formatCurrency(totals.liquidTotal, { compact: true })}</span>
            </div>
            <div className="flex justify-between items-center text-purple-300">
              <span className="text-slate-400">Non-liquid:</span>
              <span>{formatCurrency(totals.nonLiquidTotal, { compact: true })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1 border-t border-slate-800 text-[8px] text-slate-500 flex items-center justify-between">
          <span>Compare snapshot</span>
          <span className="text-emerald-400">&rarr;</span>
        </div>
      </div>
    );
  }

  // Vertical Rectangle Card (now compact, reduced vertical height, tight padding, smaller fonts)
  return (
    <div
      className={`w-[290px] sm:w-[310px] max-h-[580px] rounded-2xl border transition-all duration-300 shadow-xl flex flex-col justify-between ${
        mode === 'featured'
          ? 'bg-slate-900/95 border-slate-800 shadow-emerald-950/20 ring-1 ring-emerald-500/10'
          : 'bg-slate-900 border-slate-800 shadow-md'
      }`}
    >
      {/* 1. Header (Month/Year + Total Assets) */}
      <div className="p-2.5 border-b border-slate-800/90 bg-slate-950/50 rounded-t-2xl">
        <div className="flex items-center justify-between gap-1 mb-1.5">
          {/* Month/Year */}
          <div className="flex items-center gap-1">
            {isEditingMonth ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={monthInput}
                  onChange={(e) => setMonthInput(e.target.value)}
                  placeholder="MM/YY"
                  className="w-14 px-1 py-0.2 text-[10px] font-bold bg-slate-800 border border-emerald-500 rounded text-white font-mono-num focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveMonthYear}
                  className="p-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save Month"
                >
                  <Check className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => isEditable && setIsEditingMonth(true)}
                className={`flex items-center gap-1 text-[11px] font-bold text-slate-200 font-mono-num ${
                  isEditable ? 'cursor-pointer hover:text-emerald-400 group/m' : ''
                }`}
                title={isEditable ? 'Click to edit Month/Year' : undefined}
              >
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>Month/Year = {card.monthYear}</span>
                {isEditable && (
                  <span className="text-[8px] font-normal text-slate-500 group-hover/m:text-emerald-400">
                    ✎
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {mode === 'featured' && (
              <span className="px-1.5 py-0.2 text-[8px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Latest
              </span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Total Assets Display */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>Total Assets:</span>
          </div>
          <div className="text-sm sm:text-base font-bold font-mono-num text-white tracking-tight">
            {formatCurrency(totals.totalAssets)}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: Categories and fields */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {/* ================= LIQUID ASSETS SECTION ================= */}
        <div className="rounded-xl bg-slate-950/60 p-2 border border-cyan-950/70 ring-1 ring-cyan-500/10 space-y-1.5">
          {/* Liquid Header & Total */}
          <div className="flex items-center justify-between pb-1 border-b border-cyan-900/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Coins className="w-2.5 h-2.5" /> Liquid Assets Total:
            </span>
            <span className="text-[11px] font-bold font-mono-num text-cyan-300">
              {formatCurrency(totals.liquidTotal)}
            </span>
          </div>

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
                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-300">
                  <span>{cat.name}</span>
                </div>
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
                      onClick={() => handleDeleteHeaderCategory('liquid', cat.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                      title="Delete category header"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add field to this custom category */}
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

              {/* Custom Category Field rows */}
              <div className="space-y-0.5 mt-1">
                {cat.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {isEditable && (
                        <button
                          onClick={() => handleDeleteCustomCategoryField('liquid', cat.id, f.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
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

          {/* Button to add a different Header under Liquid */}
          {isEditable && (
            <div className="pt-1">
              {isAddingHeaderSection === 'liquid' ? (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800/90 border border-cyan-500/40">
                  <input
                    type="text"
                    placeholder="New header name (e.g. Crypto, Bonds)..."
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
          {/* Non-liquid Header & Total */}
          <div className="flex items-center justify-between pb-1 border-b border-purple-900/30">
            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Landmark className="w-2.5 h-2.5" /> Non-liquid Assets Total:
            </span>
            <span className="text-[11px] font-bold font-mono-num text-purple-300">
              {formatCurrency(totals.nonLiquidTotal)}
            </span>
          </div>

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
                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-300">
                  <span>{cat.name}</span>
                </div>
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
                      onClick={() => handleDeleteHeaderCategory('nonLiquid', cat.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
                      title="Delete category header"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Add field to custom non-liquid category */}
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

              {/* Field rows */}
              <div className="space-y-0.5 mt-1">
                {cat.fields.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
                  >
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {isEditable && (
                        <button
                          onClick={() => handleDeleteCustomCategoryField('nonLiquid', cat.id, f.id)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded"
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

          {/* Button to add a different Header under Non-Liquid */}
          {isEditable && (
            <div className="pt-1">
              {isAddingHeaderSection === 'nonLiquid' ? (
                <div className="flex items-center gap-1 p-1 rounded bg-slate-800/90 border border-purple-500/40">
                  <input
                    type="text"
                    placeholder="New header name (e.g. Vehicles, Pensions)..."
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

      {/* 3. Compact Footer Summary */}
      <div className="p-1.5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl flex items-center justify-between text-[9px]">
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

      {/* Field rows - EVERY field now has a trash icon! */}
      <div className="space-y-0.5">
        {fields.map((field) => (
          <div
            key={field.id}
            className="flex items-center justify-between gap-1 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800/70 text-[10px]"
          >
            <div className="flex items-center gap-1 min-w-0 flex-1">
              {isEditable && (
                <button
                  onClick={() => onDeleteField(category, field.id)}
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
