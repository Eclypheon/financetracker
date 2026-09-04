import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { FinanceCardData } from './types/finance';
import { 
  loadStoredCards, 
  saveStoredCards, 
  sampleInitialCards, 
  createNewBlankCard, 
  exportCardsToJson, 
  importCardsFromJson 
} from './utils/storage';
import { 
  getSupabaseClient, 
  fetchCloudCards, 
  saveCloudCard, 
  deleteCloudCard, 
  syncAllCardsToCloud 
} from './utils/supabase';
import { Header } from './components/Header';
import { FinanceCard } from './components/FinanceCard';
import { PastCardsCarousel } from './components/PastCardsCarousel';
import { CompareSection } from './components/CompareSection';
import { AssetsChart } from './components/AssetsChart';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const [cards, setCards] = useState<FinanceCardData[]>(() => loadStoredCards());
  const [selectedBaseCardId, setSelectedBaseCardId] = useState<string | null>(null);
  const [selectedCompareCardId, setSelectedCompareCardId] = useState<string | null>(() => {
    const loaded = loadStoredCards();
    return loaded.length > 1 ? loaded[1].id : loaded[0]?.id || null;
  });

  // Supabase Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load cloud data for authenticated user
  const loadCloudData = useCallback(async (user: User) => {
    try {
      const cloudCards = await fetchCloudCards();
      if (cloudCards && cloudCards.length > 0) {
        setCards(cloudCards);
        saveStoredCards(cloudCards);
        if (cloudCards.length > 1) {
          setSelectedCompareCardId(cloudCards[1].id);
        }
      } else {
        // If cloud is empty, migrate current local cards to user's cloud account
        const localCards = loadStoredCards();
        if (localCards.length > 0) {
          await syncAllCardsToCloud(localCards, user);
        }
      }
    } catch (err) {
      console.error('Failed to sync cloud cards:', err);
    }
  }, []);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        loadCloudData(user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        loadCloudData(user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCloudData]);

  // Always save to localStorage for offline access
  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  // Latest Card is always cards[0]
  const latestCard = cards[0];
  // Past cards are cards[1...]
  const pastCards = cards.slice(1);

  // Active base card for comparison
  const activeBaseCardId = (selectedBaseCardId && cards.some((c) => c.id === selectedBaseCardId))
    ? selectedBaseCardId
    : latestCard?.id || '';

  // Ensure valid compare selection
  useEffect(() => {
    if (cards.length > 1 && (!selectedCompareCardId || !cards.some((c) => c.id === selectedCompareCardId))) {
      setSelectedCompareCardId(cards[1].id);
    }
  }, [cards, selectedCompareCardId]);

  // Update card handler (syncs locally and to cloud if logged in)
  const handleUpdateCard = (updatedCard: FinanceCardData) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    if (currentUser) {
      saveCloudCard(updatedCard, currentUser);
    }
  };

  // Add new BLANK card handler
  const handleAddNewBlankCard = () => {
    const blankCard = createNewBlankCard();
    setCards((prev) => [blankCard, ...prev]);
    setSelectedBaseCardId(blankCard.id);
    if (latestCard) {
      setSelectedCompareCardId(latestCard.id);
    }
    if (currentUser) {
      saveCloudCard(blankCard, currentUser);
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
      if (currentUser) {
        deleteCloudCard(cardId);
      }
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
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
      if (currentUser) {
        await syncAllCardsToCloud(imported, currentUser);
      }
    } catch {
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
    if (currentUser) {
      syncAllCardsToCloud(sampleInitialCards, currentUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header with Cloud Sync */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onAddNewBlankCard={handleAddNewBlankCard}
        onExport={handleExport}
        onImport={handleImport}
        onResetSample={handleResetSample}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-[500px] w-full mx-auto px-3 py-4 space-y-6">
        {/* SECTION 1: TOP CENTER LATEST CARD */}
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

        {/* SECTION 2: PAST CARDS SPREAD (DECK) */}
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

        {/* SECTION 3: COMPARE SECTION (3 COLUMNS) */}
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

        {/* SECTION 4: GRAPH OVER TIME */}
        <section className="w-full">
          <AssetsChart cards={cards} />
        </section>
      </main>

      {/* Auth Modal (Google, Email/Password, Magic Link, DB Config) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => {
          const supabase = getSupabaseClient();
          if (supabase) {
            supabase.auth.getUser().then(({ data: { user } }) => {
              if (user) {
                setCurrentUser(user);
                loadCloudData(user);
              }
            });
          }
        }}
      />

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
