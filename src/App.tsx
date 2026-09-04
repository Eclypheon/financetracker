import React, { useState, useEffect } from 'react';
import { FinanceCardData } from './types/finance';
import { 
  loadStoredCards, 
  saveStoredCards, 
  sampleInitialCards, 
  createNewBlankCard, 
  exportCardsToJson, 
  importCardsFromJson 
} from './utils/storage';
import { Header } from './components/Header';
import { FinanceCard } from './components/FinanceCard';
import { PastCardsCarousel } from './components/PastCardsCarousel';
import { CompareSection } from './components/CompareSection';
import { AssetsChart } from './components/AssetsChart';

export const App: React.FC = () => {
  const [cards, setCards] = useState<FinanceCardData[]>(() => loadStoredCards());
  const [selectedBaseCardId, setSelectedBaseCardId] = useState<string | null>(null);
  const [selectedCompareCardId, setSelectedCompareCardId] = useState<string | null>(() => {
    const loaded = loadStoredCards();
    return loaded.length > 1 ? loaded[1].id : loaded[0]?.id || null;
  });

  // Save to localStorage whenever cards change
  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  // Latest Card is always cards[0]
  const latestCard = cards[0];
  // Past cards are cards[1...]
  const pastCards = cards.slice(1);

  // Active base card for comparison: defaults to latest card if not explicitly changed
  const activeBaseCardId = (selectedBaseCardId && cards.some((c) => c.id === selectedBaseCardId))
    ? selectedBaseCardId
    : latestCard?.id || '';

  // Ensure valid compare selection
  useEffect(() => {
    if (cards.length > 1 && (!selectedCompareCardId || !cards.some((c) => c.id === selectedCompareCardId))) {
      setSelectedCompareCardId(cards[1].id);
    }
  }, [cards, selectedCompareCardId]);

  // Update card handler
  const handleUpdateCard = (updatedCard: FinanceCardData) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  // Add new BLANK card handler
  const handleAddNewBlankCard = () => {
    const blankCard = createNewBlankCard();
    setCards((prev) => [blankCard, ...prev]);
    setSelectedBaseCardId(blankCard.id);
    if (latestCard) {
      setSelectedCompareCardId(latestCard.id);
    }
  };

  // Delete card handler
  const handleDeleteCard = (cardId: string) => {
    if (cards.length <= 1) {
      alert('You must keep at least one card in your tracker.');
      return;
    }
    if (confirm('Delete this card?')) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    }
  };

  // Export handler
  const handleExport = () => {
    exportCardsToJson(cards);
  };

  // Import handler
  const handleImport = async (file: File) => {
    try {
      const imported = await importCardsFromJson(file);
      setCards(imported);
      if (imported.length > 1) {
        setSelectedCompareCardId(imported[1].id);
      }
    } catch (err) {
      alert('Could not import backup file.');
    }
  };

  // Reset to sample handler
  const handleResetSample = () => {
    setCards(sampleInitialCards);
    setSelectedBaseCardId(sampleInitialCards[0].id);
    if (sampleInitialCards.length > 1) {
      setSelectedCompareCardId(sampleInitialCards[1].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <Header
        onAddNewBlankCard={handleAddNewBlankCard}
        onExport={handleExport}
        onImport={handleImport}
        onResetSample={handleResetSample}
      />

      {/* Main Content Dashboard: Container is half width (max-w-[500px]) */}
      <main className="flex-1 max-w-[500px] w-full mx-auto px-3 py-4 space-y-6">
        {/* ====================================================================
            SECTION 1: TOP CENTER LATEST CARD
            ==================================================================== */}
        <section className="w-full flex flex-col items-center">
          {latestCard ? (
            <FinanceCard
              card={latestCard}
              mode="featured"
              isEditable={true}
              onUpdate={handleUpdateCard}
              onDelete={cards.length > 1 ? () => handleDeleteCard(latestCard.id) : undefined}
            />
          ) : null}
        </section>

        {/* ====================================================================
            SECTION 2: PAST CARDS SPREAD HORIZONTALLY (HALF WIDTH CONTAINER)
            ==================================================================== */}
        <section className="w-full">
          <PastCardsCarousel
            cards={pastCards}
            selectedCardId={selectedCompareCardId}
            onSelectCard={(id) => setSelectedCompareCardId(id)}
            onAddNewBlankCard={handleAddNewBlankCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
          />
        </section>

        {/* ====================================================================
            SECTION 3: COMPARE SECTION WITH "LARGEST DELTA" (TOP 4 ASSETS)
            ==================================================================== */}
        {latestCard && (
          <section className="w-full">
            <CompareSection
              cards={cards}
              baseCardId={activeBaseCardId}
              compareCardId={selectedCompareCardId}
              onSelectBaseCard={(id) => setSelectedBaseCardId(id)}
              onSelectCompareCard={(id) => setSelectedCompareCardId(id)}
            />
          </section>
        )}

        {/* ====================================================================
            SECTION 4: GRAPH OVER TIME (Y-AXIS LOWEST IS STRICTLY 0)
            ==================================================================== */}
        <section className="w-full">
          <AssetsChart cards={cards} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-3 text-center text-[9px] text-slate-500">
        <div className="max-w-[500px] mx-auto px-3 flex items-center justify-between">
          <span>Finance Tracker PWA</span>
          <span>github.com/Eclypheon/financetracker</span>
        </div>
      </footer>
    </div>
  );
};
