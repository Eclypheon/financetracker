import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { FinanceCardData } from './types/finance';
import { 
  loadStoredCards, 
  saveStoredCards, 
  sampleInitialCards, 
  createNewBlankCard, 
  exportCardsToCsv, 
  importCardsFromFile 
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
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [authErrorNotice, setAuthErrorNotice] = useState<string | null>(null);

  // Check URL hash or query for OAuth errors returned from Supabase
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
    const search = window.location.search.startsWith('?') ? window.location.search.substring(1) : '';
    const params = new URLSearchParams(hash || search);
    const error = params.get('error');
    const errorDesc = params.get('error_description');

    if (error || errorDesc) {
      const msg = errorDesc
        ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
        : (error || 'Authentication error occurred.');
      setAuthErrorNotice(msg);
      setIsAuthModalOpen(true);
      // Remove error fragment from URL bar
      window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    }
  }, []);

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
    exportCardsToCsv(cards);
  };

  // Import handler
  const handleImport = async (file: File) => {
    try {
      const imported = await importCardsFromFile(file);
      setCards(imported);
      if (imported.length > 1) {
        setSelectedCompareCardId(imported[1].id);
      }
      if (currentUser) {
        await syncAllCardsToCloud(imported, currentUser);
      }
    } catch {
      alert('Could not import file. Please check that it is a valid CSV or JSON file.');
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

  // =========================================================================
  // SCREEN SNAPPING CONTROLLER (3 Screens)
  // Screen 0: Top of page (Latest Month Card)
  // Screen 1: Past card deck & compare cards
  // Screen 2: Graph over time
  // =========================================================================
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const isJumpingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const screen1Ref = useRef<HTMLElement>(null);
  const screen2Ref = useRef<HTMLElement>(null);
  const screen3Ref = useRef<HTMLElement>(null);

  const screenRefs = [screen1Ref, screen2Ref, screen3Ref];

  const scrollToScreen = useCallback((index: number) => {
    if (index < 0 || index > 2) return;
    const target = screenRefs[index]?.current;
    if (target) {
      isJumpingRef.current = true;
      setActiveScreenIndex(index);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        isJumpingRef.current = false;
      }, 550);
    }
  }, []);

  // Intercept vertical wheel gestures on the container to jump screen-by-screen
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let wheelAccum = 0;
    let wheelTimer: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      // Ignore horizontal wheel gestures (which belong to the cards deck carousel)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      if (isJumpingRef.current) {
        e.preventDefault();
        return;
      }

      // If scrolling inside an internal list (e.g. expanded card list), let it scroll
      const target = e.target as HTMLElement;
      const scrollableChild = target.closest('.overflow-y-auto') as HTMLElement | null;
      if (scrollableChild && scrollableChild !== container) {
        const atTop = scrollableChild.scrollTop <= 2;
        const atBottom = scrollableChild.scrollTop + scrollableChild.clientHeight >= scrollableChild.scrollHeight - 2;
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
          return;
        }
      }

      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAccum = 0;
      }, 150);

      const THRESHOLD = 28;

      if (Math.abs(wheelAccum) >= THRESHOLD) {
        if (wheelAccum > 0) {
          // Scroll down -> Jump to next screen
          if (activeScreenIndex < 2) {
            e.preventDefault();
            wheelAccum = 0;
            scrollToScreen(activeScreenIndex + 1);
          }
        } else if (wheelAccum < 0) {
          // Scroll up -> Jump to previous screen
          if (activeScreenIndex > 0) {
            e.preventDefault();
            wheelAccum = 0;
            scrollToScreen(activeScreenIndex - 1);
          }
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, [activeScreenIndex, scrollToScreen]);

  // Keyboard navigation between screens (ArrowDown, ArrowUp, PageDown, PageUp)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeScreenIndex < 2) {
          e.preventDefault();
          scrollToScreen(activeScreenIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeScreenIndex > 0) {
          e.preventDefault();
          scrollToScreen(activeScreenIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeScreenIndex, scrollToScreen]);

  // Track active screen with IntersectionObserver for natural touch scroll snapping
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isJumpingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'screen-1') setActiveScreenIndex(0);
            else if (id === 'screen-2') setActiveScreenIndex(1);
            else if (id === 'screen-3') setActiveScreenIndex(2);
          }
        });
      },
      {
        root: container,
        threshold: 0.45,
      }
    );

    [screen1Ref, screen2Ref, screen3Ref].forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      style={{ scrollPaddingTop: '46px' }}
      className="h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300 relative"
    >
      {/* Header with Cloud Sync (sticky at top) */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onAddNewBlankCard={handleAddNewBlankCard}
        onExport={handleExport}
        onImport={handleImport}
        onResetSample={handleResetSample}
      />

      {/* Floating Screen Navigation Indicator (Right Edge) */}
      <aside 
        className="fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl"
        aria-label="Screen Navigation"
      >
        {[
          { index: 0, label: 'Latest Month' },
          { index: 1, label: 'Past Cards & Compare' },
          { index: 2, label: 'Asset Graph' },
        ].map((item) => (
          <button
            key={item.index}
            onClick={() => scrollToScreen(item.index)}
            className={`transition-all duration-300 rounded-full ${
              activeScreenIndex === item.index
                ? 'w-2 h-4 bg-emerald-400 shadow-sm shadow-emerald-500/50 ring-1 ring-emerald-400/40'
                : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
            }`}
            title={item.label}
          />
        ))}
      </aside>

      {/* Main Content: 3 Snapping Screens */}
      <main className="flex-1 max-w-[500px] w-full mx-auto px-3">
        {/* ============================================================ */}
        {/* SCREEN 1: TOP OF THE PAGE (LATEST MONTH CARD)                */}
        {/* ============================================================ */}
        <section
          ref={screen1Ref}
          id="screen-1"
          className="min-h-[calc(100dvh-46px)] snap-start snap-always w-full flex flex-col items-center justify-center py-2 relative"
        >
          {latestCard ? (
            <FinanceCard
              card={latestCard}
              mode="featured"
              isEditable={true}
              onUpdate={handleUpdateCard}
              onDelete={cards.length > 1 ? () => handleDeleteCard(latestCard.id) : undefined}
            />
          ) : null}

          {/* Jump Hint to Screen 2 */}
          <button
            onClick={() => scrollToScreen(1)}
            className="mt-3 flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 animate-pulse"
            title="Jump down to Past Cards & Compare"
          >
            <span>Past Cards &amp; Compare</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* ============================================================ */}
        {/* SCREEN 2: PAST CARD DECK & COMPARE CARDS SCREEN              */}
        {/* ============================================================ */}
        <section
          ref={screen2Ref}
          id="screen-2"
          className="min-h-[calc(100dvh-46px)] snap-start snap-always w-full flex flex-col justify-center py-2 space-y-3 relative"
        >
          {/* Top navigation jump button */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <button
              onClick={() => scrollToScreen(0)}
              className="flex items-center gap-0.5 hover:text-emerald-400 transition-colors"
              title="Jump up to Latest Card"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Latest Card</span>
            </button>
            <button
              onClick={() => scrollToScreen(2)}
              className="flex items-center gap-0.5 hover:text-emerald-400 transition-colors"
              title="Jump down to Asset Graph"
            >
              <span>Asset Graph</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Part A: Past Cards Carousel (Deck) */}
          <div className="w-full">
            <PastCardsCarousel
              cards={pastCards}
              selectedCardId={selectedCompareCardId}
              onSelectCard={(id) => setSelectedCompareCardId(id)}
              onAddNewBlankCard={handleAddNewBlankCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
            />
          </div>

          {/* Part B: Compare Cards Section (3 Columns) */}
          {latestCard && (
            <div className="w-full">
              <CompareSection
                cards={cards}
                baseCardId={activeBaseCardId}
                compareCardId={selectedCompareCardId}
                onSelectBaseCard={(id) => setSelectedBaseCardId(id)}
                onSelectCompareCard={(id) => setSelectedCompareCardId(id)}
              />
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* SCREEN 3: GRAPH OVER TIME SCREEN                             */}
        {/* ============================================================ */}
        <section
          ref={screen3Ref}
          id="screen-3"
          className="min-h-[calc(100dvh-46px)] snap-start snap-always w-full flex flex-col justify-between py-2 relative"
        >
          {/* Top navigation jump button */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pb-1">
            <button
              onClick={() => scrollToScreen(1)}
              className="flex items-center gap-0.5 hover:text-emerald-400 transition-colors"
              title="Jump up to Past Cards & Compare"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Past Cards &amp; Compare</span>
            </button>
            <button
              onClick={() => scrollToScreen(0)}
              className="flex items-center gap-0.5 hover:text-emerald-400 transition-colors"
              title="Jump back to Top"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Back to Top</span>
            </button>
          </div>

          {/* Assets Chart */}
          <div className="w-full flex-1 flex flex-col justify-center">
            <AssetsChart cards={cards} />
          </div>

          {/* Footer */}
          <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-2.5 text-center text-[9px] text-slate-500 mt-2">
            <div className="flex items-center justify-between">
              <span>Finance Tracker PWA</span>
              <span>github.com/Eclypheon/financetracker</span>
            </div>
          </footer>
        </section>
      </main>

      {/* Auth Modal (Google, Email/Password, Magic Link, DB Config) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialError={authErrorNotice}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthErrorNotice(null);
        }}
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
    </div>
  );
};
