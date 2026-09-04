import React, { useState, useEffect } from 'react';
import { FinanceCardData } from './types/finance';
import { 
  loadStoredCards, 
  saveStoredCards, 
  sampleInitialCards, 
  createNextCardFromPrevious, 
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

  // Add new month handler
  const handleAddNewMonth = () => {
    const newCard = createNextCardFromPrevious(latestCard);
    setCards((prev) => [newCard, ...prev]);
    setSelectedBaseCardId(newCard.id);
    // By default, the previous latest card becomes the comparison card
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
    if (confirm('Are you sure you want to delete this month record?')) {
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
      alert('Could not import backup file. Please ensure it is a valid JSON export.');
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
      {/* Top Header / App Bar */}
      <Header
        onAddNewMonth={handleAddNewMonth}
        onExport={handleExport}
        onImport={handleImport}
        onResetSample={handleResetSample}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* ====================================================================
            SECTION 1: TOP CENTER LATEST CARD
            "The main page would have the latest card at the top center of the page"
            ==================================================================== */}
        <section className="w-full flex flex-col items-center">
          <div className="text-center mb-6 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Current Financial Snapshot
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enter or update your assets below. Totals calculate instantly.
            </p>
          </div>

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
            SECTION 2: PAST CARDS SPREAD HORIZONTALLY
            "with the past cards smaller and below it spread out horizontally."
            ==================================================================== */}
        <section className="w-full pt-2">
          <PastCardsCarousel
            cards={pastCards}
            selectedCardId={selectedCompareCardId}
            onSelectCard={(id) => setSelectedCompareCardId(id)}
            onAddNewMonth={handleAddNewMonth}
            onDeleteCard={handleDeleteCard}
          />
        </section>

        {/* ====================================================================
            SECTION 3: COMPARE DIFFERENT CARDS WITH DELTA CARD
            "Further down the page, I want the feature to compare different cards, 
            so it should by default have the first card as the latest one, and then 
            to the right of that one card can be selected from the above horizontal 
            spread of cards. Finally, a third card is generated that shows the delta 
            for Liquid assets total, Non liquid assets total and total assets."
            ==================================================================== */}
        {latestCard && (
          <section className="w-full pt-2">
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
            SECTION 4: GRAPH OVER TIME
            "Further down on the page I want a graph over time. This graph should have 
            the following lines: Liquid assets total, Non liquid assets total, total Assets. 
            Each of these lines are toggleable to be on or off. By default, it should only 
            show the total assets line."
            ==================================================================== */}
        <section className="w-full pt-2">
          <AssetsChart cards={cards} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Finance Tracker PWA · Offline Capable · Private & Local-First</span>
          <span>Deployable to GitHub Pages</span>
        </div>
      </footer>
    </div>
  );
};
