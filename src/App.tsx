import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { FinanceCardData } from './types/finance';
import { 
  loadStoredCards, 
  saveStoredCards, 
  loadStoredEntryCard,
  saveStoredEntryCard,
  sampleInitialCards, 
  createNewBlankCard, 
  exportCardsToCsv, 
  importCardsFromFile 
} from './utils/storage';
import { 
  getSupabaseClient, 
  fetchCloudCards, 
  fetchCloudEntryCard,
  saveCloudEntryCard,
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
import { ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [savedCards, setSavedCards] = useState<FinanceCardData[]>(() => loadStoredCards());
  const [entryCard, setEntryCard] = useState<FinanceCardData>(() => loadStoredEntryCard());
  const [showCardSavedModal, setShowCardSavedModal] = useState(false);
  const cardSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedBaseCardId, setSelectedBaseCardId] = useState<string | null>(() => {
    const loaded = loadStoredCards();
    return loaded[0]?.id || null;
  });
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
        setSavedCards(cloudCards);
        saveStoredCards(cloudCards);
        setSelectedBaseCardId(cloudCards[0].id);
        if (cloudCards.length > 1) {
          setSelectedCompareCardId(cloudCards[1].id);
        } else {
          setSelectedCompareCardId(cloudCards[0].id);
        }
      } else {
        // If cloud is empty, migrate current local cards to user's cloud account
        const localCards = loadStoredCards();
        if (localCards.length > 0) {
          await syncAllCardsToCloud(localCards, user);
        }
      }

      // Sync and restore entry card template from cloud
      const cloudEntry = await fetchCloudEntryCard();
      if (cloudEntry) {
        setEntryCard(cloudEntry);
        saveStoredEntryCard(cloudEntry);
      } else {
        const localEntry = loadStoredEntryCard();
        await saveCloudEntryCard(localEntry, user);
      }
    } catch (err) {
      console.error('Failed to sync cloud data:', err);
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

  // Always save savedCards to localStorage for offline access
  useEffect(() => {
    saveStoredCards(savedCards);
  }, [savedCards]);

  // Always save entryCard to localStorage for offline access
  useEffect(() => {
    saveStoredEntryCard(entryCard);
  }, [entryCard]);

  // Cleanup modal timer on unmount
  useEffect(() => {
    return () => {
      if (cardSavedTimerRef.current) {
        clearTimeout(cardSavedTimerRef.current);
      }
    };
  }, []);

  // Active base card for comparison
  const activeBaseCardId = (selectedBaseCardId && savedCards.some((c) => c.id === selectedBaseCardId))
    ? selectedBaseCardId
    : savedCards[0]?.id || '';

  // Ensure valid compare selection
  useEffect(() => {
    if (savedCards.length > 1 && (!selectedCompareCardId || !savedCards.some((c) => c.id === selectedCompareCardId))) {
      setSelectedCompareCardId(savedCards[1].id);
    }
  }, [savedCards, selectedCompareCardId]);

  // Update entry card handler (Screen 1)
  const handleUpdateEntryCard = (updated: FinanceCardData) => {
    setEntryCard(updated);
    saveStoredEntryCard(updated);
    if (currentUser) {
      saveCloudEntryCard(updated, currentUser);
    }
  };

  // Save entry card handler (Screen 1 -> Saved Cards Carousel)
  const handleSaveCard = () => {
    const newCardId = `card_${Date.now()}`;
    const newSavedCard: FinanceCardData = {
      ...entryCard,
      id: newCardId,
      createdAt: Date.now(),
      banks: entryCard.banks.map((b) => ({ ...b })),
      stocks: entryCard.stocks.map((s) => ({ ...s })),
      cpf: entryCard.cpf.map((c) => ({ ...c })),
      property: entryCard.property.map((p) => ({ ...p })),
      others: (entryCard.others || []).map((o) => ({ ...o })),
      customLiquidCategories: (entryCard.customLiquidCategories || []).map((cat) => ({
        ...cat,
        fields: cat.fields.map((f) => ({ ...f })),
      })),
      customNonLiquidCategories: (entryCard.customNonLiquidCategories || []).map((cat) => ({
        ...cat,
        fields: cat.fields.map((f) => ({ ...f })),
      })),
    };

    // Prepend to saved cards so it becomes the latest card in the carousel
    setSavedCards((prev) => [newSavedCard, ...prev]);
    // Auto-populate compare feature with latest card and second latest card
    setSelectedBaseCardId(newSavedCard.id);
    if (savedCards.length > 0) {
      setSelectedCompareCardId(savedCards[0].id);
    }

    // Persist entry card locally and to cloud database so values and fields are completely retained
    saveStoredEntryCard(entryCard);

    if (currentUser) {
      saveCloudCard(newSavedCard, currentUser);
      saveCloudEntryCard(entryCard, currentUser);
    }

    // Show temporary "Card Saved" modal
    setShowCardSavedModal(true);
    if (cardSavedTimerRef.current) {
      clearTimeout(cardSavedTimerRef.current);
    }
    cardSavedTimerRef.current = setTimeout(() => {
      setShowCardSavedModal(false);
      cardSavedTimerRef.current = null;
    }, 1600);
  };

  // Carousel card click handler: replace the second latest card with the clicked card,
  // while keeping the base card as the latest card in the past cards carousel
  const handleSelectCarouselCard = (cardId: string) => {
    if (savedCards.length > 0) {
      setSelectedBaseCardId(savedCards[0].id);
    }
    setSelectedCompareCardId(cardId);
  };

  // Update card in saved cards (carousel / past cards)
  const handleUpdateCard = (updatedCard: FinanceCardData) => {
    setSavedCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    if (currentUser) {
      saveCloudCard(updatedCard, currentUser);
    }
  };

  // Add new BLANK card handler
  const handleAddNewBlankCard = () => {
    const blankCard = createNewBlankCard();
    setSavedCards((prev) => [blankCard, ...prev]);
    setSelectedBaseCardId(blankCard.id);
    if (savedCards.length > 0) {
      setSelectedCompareCardId(savedCards[0].id);
    }
    if (currentUser) {
      saveCloudCard(blankCard, currentUser);
    }
  };

  // Delete card handler
  const handleDeleteCard = (cardId: string) => {
    if (savedCards.length <= 1) {
      alert('You must keep at least one card in your tracker.');
      return;
    }
    setSavedCards((prev) => {
      const updated = prev.filter((c) => c.id !== cardId);
      setSelectedBaseCardId(updated[0]?.id || null);
      setSelectedCompareCardId(updated.length > 1 ? updated[1].id : updated[0]?.id || null);
      return updated;
    });
    if (currentUser) {
      deleteCloudCard(cardId);
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
    exportCardsToCsv(savedCards);
  };

  // Import handler
  const handleImport = async (file: File) => {
    try {
      const imported = await importCardsFromFile(file);
      setSavedCards(imported);
      setSelectedBaseCardId(imported[0]?.id || null);
      if (imported.length > 1) {
        setSelectedCompareCardId(imported[1].id);
      } else if (imported.length > 0) {
        setSelectedCompareCardId(imported[0].id);
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
    setSavedCards(sampleInitialCards);
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

  // Track scroll session inside child scrollable containers (e.g. FinanceCard overflow-y-auto body)
  // to ensure hitting bottom/top does NOT immediately shift screens during the same scroll gesture.
  // Instead, the user must release (pause scrolling for a brief moment) and scroll again to trigger screen jump.
  const childScrollSessionRef = useRef<{
    target: HTMLElement | null;
    startedAtBottom: boolean;
    startedAtTop: boolean;
    releaseTimer: ReturnType<typeof setTimeout> | null;
  }>({
    target: null,
    startedAtBottom: false,
    startedAtTop: false,
    releaseTimer: null,
  });

  const scrollToScreen = useCallback((index: number) => {
    if (index < 0 || index > 2) return;
    const target = screenRefs[index]?.current;
    if (target) {
      isJumpingRef.current = true;
      setActiveScreenIndex(index);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Reset child scroll session on screen transition
      if (childScrollSessionRef.current.releaseTimer) {
        clearTimeout(childScrollSessionRef.current.releaseTimer);
        childScrollSessionRef.current.releaseTimer = null;
      }
      childScrollSessionRef.current.target = null;
      childScrollSessionRef.current.startedAtBottom = false;
      childScrollSessionRef.current.startedAtTop = false;

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

      // If scrolling inside an internal list (e.g. card items)
      const target = e.target as HTMLElement;
      const scrollableChild = target.closest('.overflow-y-auto') as HTMLElement | null;
      if (scrollableChild && scrollableChild !== container) {
        const isScrollable = scrollableChild.scrollHeight > scrollableChild.clientHeight + 4;
        if (isScrollable) {
          const atTop = scrollableChild.scrollTop <= 2;
          const atBottom = scrollableChild.scrollTop + scrollableChild.clientHeight >= scrollableChild.scrollHeight - 2;

          // If starting a fresh scroll gesture session, record boundary state at start
          if (!childScrollSessionRef.current.releaseTimer) {
            childScrollSessionRef.current.target = scrollableChild;
            childScrollSessionRef.current.startedAtBottom = atBottom;
            childScrollSessionRef.current.startedAtTop = atTop;
          }

          // Reset the release timer: after 200ms of inactivity, the gesture is considered released
          if (childScrollSessionRef.current.releaseTimer) {
            clearTimeout(childScrollSessionRef.current.releaseTimer);
          }
          childScrollSessionRef.current.releaseTimer = setTimeout(() => {
            childScrollSessionRef.current.releaseTimer = null;
            childScrollSessionRef.current.target = null;
            childScrollSessionRef.current.startedAtBottom = false;
            childScrollSessionRef.current.startedAtTop = false;
          }, 200);

          // 1. If actively scrolling within the content bounds, let child scroll naturally
          if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
            wheelAccum = 0;
            return;
          }

          // 2. Boundary hit: If user reached bottom during THIS gesture (did not start at bottom),
          // absorb remaining wheel momentum/events so it does NOT shift screens.
          if (e.deltaY > 0 && atBottom && !childScrollSessionRef.current.startedAtBottom) {
            e.preventDefault();
            wheelAccum = 0;
            return;
          }

          // 3. Boundary hit: If user reached top during THIS gesture (did not start at top),
          // absorb remaining wheel momentum/events so it does NOT shift screens.
          if (e.deltaY < 0 && atTop && !childScrollSessionRef.current.startedAtTop) {
            e.preventDefault();
            wheelAccum = 0;
            return;
          }

          // 4. Otherwise: User started this gesture while ALREADY at the boundary (they released and scrolled again).
          // Allow fall-through to screen jumping accumulator below.
        }
      }

      e.preventDefault();
      wheelAccum += e.deltaY;
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAccum = 0;
      }, 200);

      const WHEEL_THRESHOLD = 90;

      if (Math.abs(wheelAccum) >= WHEEL_THRESHOLD) {
        if (wheelAccum > 0) {
          // Scroll down -> Jump to next screen
          if (activeScreenIndex < 2) {
            wheelAccum = 0;
            scrollToScreen(activeScreenIndex + 1);
          }
        } else if (wheelAccum < 0) {
          // Scroll up -> Jump to previous screen
          if (activeScreenIndex > 0) {
            wheelAccum = 0;
            scrollToScreen(activeScreenIndex - 1);
          }
        }
      }
    };

    let touchStartY = 0;
    let touchScrollChild: HTMLElement | null = null;
    let touchStartedAtBottom = false;
    let touchStartedAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      const target = e.target as HTMLElement;
      touchScrollChild = target.closest('.overflow-y-auto') as HTMLElement | null;
      if (touchScrollChild && touchScrollChild !== container) {
        const isScrollable = touchScrollChild.scrollHeight > touchScrollChild.clientHeight + 4;
        if (isScrollable) {
          touchStartedAtBottom = touchScrollChild.scrollTop + touchScrollChild.clientHeight >= touchScrollChild.scrollHeight - 2;
          touchStartedAtTop = touchScrollChild.scrollTop <= 2;
        } else {
          touchScrollChild = null;
        }
      } else {
        touchScrollChild = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !touchScrollChild) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // > 0 means dragging up -> scrolling down

      const atBottom = touchScrollChild.scrollTop + touchScrollChild.clientHeight >= touchScrollChild.scrollHeight - 2;
      const atTop = touchScrollChild.scrollTop <= 2;

      // Prevent chaining to screen snapping if gesture did not start at boundary
      if (deltaY > 0 && atBottom && !touchStartedAtBottom) {
        e.preventDefault();
      } else if (deltaY < 0 && atTop && !touchStartedAtTop) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchScrollChild) return;
      const currentY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - currentY; // > 0 is scroll down

      const TOUCH_SWIPE_THRESHOLD = 95;

      // If user started already at bottom and swiped up significantly: jump to next screen
      if (deltaY > TOUCH_SWIPE_THRESHOLD && touchStartedAtBottom) {
        if (activeScreenIndex < 2) {
          scrollToScreen(activeScreenIndex + 1);
        }
      } else if (deltaY < -TOUCH_SWIPE_THRESHOLD && touchStartedAtTop) {
        if (activeScreenIndex > 0) {
          scrollToScreen(activeScreenIndex - 1);
        }
      }
      touchScrollChild = null;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (wheelTimer) clearTimeout(wheelTimer);
      if (childScrollSessionRef.current.releaseTimer) {
        clearTimeout(childScrollSessionRef.current.releaseTimer);
      }
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
      style={{ scrollPaddingTop: 'calc(46px + env(safe-area-inset-top, 0px))' }}
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
          { index: 0, label: 'New Card' },
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
        {/* SCREEN 1: TOP OF THE PAGE (NEW CARD ENTRY)                   */}
        {/* ============================================================ */}
        <section
          ref={screen1Ref}
          id="screen-1"
          style={{ minHeight: 'calc(100dvh - 46px - env(safe-area-inset-top, 0px))' }}
          className="snap-start w-full flex flex-col items-center justify-center py-2 relative"
        >
          {/* Screen 1 Header: Save Card button */}
          <div className="w-full flex items-center justify-end mb-1.5 px-1">
            <button
              onClick={handleSaveCard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm shadow-emerald-950/40 cursor-pointer active:scale-95"
              title="Save Card"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
          </div>

          <FinanceCard
            card={entryCard}
            mode="featured"
            isEditable={true}
            onUpdate={handleUpdateEntryCard}
          />

          {/* Navigation text: just below the card container */}
          <div className="w-full flex justify-center mt-2.5">
            <button
              onClick={() => scrollToScreen(1)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 animate-pulse"
              title="Jump down to Past Cards & Compare"
            >
              <span>Past Cards &amp; Compare</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SCREEN 2: PAST CARD DECK & COMPARE CARDS SCREEN              */}
        {/* ============================================================ */}
        <section
          ref={screen2Ref}
          id="screen-2"
          style={{ minHeight: 'calc(100dvh - 46px - env(safe-area-inset-top, 0px))' }}
          className="snap-start w-full flex flex-col items-center justify-center py-2 relative"
        >
          {/* Navigation text: just above the past cards container */}
          <div className="w-full flex justify-center mb-1.5">
            <button
              onClick={() => scrollToScreen(0)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-0.5 px-2.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800"
              title="Jump up to New Card"
            >
              <ChevronUp className="w-3 h-3" />
              <span>New Card</span>
            </button>
          </div>

          {/* Middle Content: Carousel Deck + Compare Section */}
          <div className="w-full space-y-2.5">
            {/* Part A: Past Cards Carousel (Deck) */}
            <div className="w-full">
              <PastCardsCarousel
                cards={savedCards}
                selectedCardId={selectedCompareCardId}
                onSelectCard={handleSelectCarouselCard}
                onAddNewBlankCard={handleAddNewBlankCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
              />
            </div>

            {/* Part B: Compare Cards Section (3 Columns) */}
            {savedCards.length > 0 && (
              <div className="w-full">
                <CompareSection
                  cards={savedCards}
                  baseCardId={activeBaseCardId}
                  compareCardId={selectedCompareCardId}
                  onSelectBaseCard={(id) => setSelectedBaseCardId(id)}
                  onSelectCompareCard={(id) => setSelectedCompareCardId(id)}
                />
              </div>
            )}
          </div>

          {/* Navigation text: just below the compare cards container */}
          <div className="w-full flex justify-center mt-2.5">
            <button
              onClick={() => scrollToScreen(2)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 animate-pulse"
              title="Jump down to Asset Graph"
            >
              <span>Asset Graph</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SCREEN 3: GRAPH OVER TIME SCREEN                             */}
        {/* ============================================================ */}
        <section
          ref={screen3Ref}
          id="screen-3"
          style={{ minHeight: 'calc(100dvh - 46px - env(safe-area-inset-top, 0px))' }}
          className="snap-start w-full flex flex-col items-center justify-center py-2 relative"
        >
          {/* Navigation text: just above the graph container */}
          <div className="w-full flex justify-center mb-1.5">
            <button
              onClick={() => scrollToScreen(1)}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors py-0.5 px-2.5 rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800"
              title="Jump up to Past Cards & Compare"
            >
              <ChevronUp className="w-3 h-3" />
              <span>Past Cards &amp; Compare</span>
            </button>
          </div>

          {/* Assets Chart */}
          <div className="w-full">
            <AssetsChart cards={savedCards} />
          </div>

          {/* Footer */}
          <footer 
            style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
            className="w-full border-t border-slate-900 bg-slate-950/80 py-2.5 text-center text-[9px] text-slate-500 mt-2"
          >
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

      {/* Temporary "Card Saved" Modal */}
      {showCardSavedModal && (
        <div 
          onClick={() => setShowCardSavedModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/95 border border-emerald-500/50 shadow-2xl shadow-emerald-950/80 rounded-2xl p-6 flex flex-col items-center gap-3 text-center max-w-[280px] w-full animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white tracking-wide">Card Saved</h3>
              <p className="text-[11px] text-slate-400">Added to past cards carousel</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
