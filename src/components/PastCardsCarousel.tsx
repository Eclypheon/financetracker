import React, { useState, useEffect, useRef } from 'react';
import { FinanceCardData } from '../types/finance';
import { FinanceCard } from './FinanceCard';
import { ChevronLeft, ChevronRight, History, Plus, Layers } from 'lucide-react';

interface PastCardsCarouselProps {
  cards: FinanceCardData[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onAddNewBlankCard?: () => void;
  onUpdateCard?: (updated: FinanceCardData) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const PastCardsCarousel: React.FC<PastCardsCarouselProps> = ({
  cards,
  selectedCardId,
  onSelectCard,
  onAddNewBlankCard,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [frontIndex, setFrontIndex] = useState<number>(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Wheel accumulator state
  const wheelAccumulatorRef = useRef(0);
  const lastWheelTriggerRef = useRef(0);
  const wheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pointer drag state
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);

  // Synchronize frontIndex with selectedCardId only on selection change (not on initial mount)
  const isInitialMount = useRef(true);
  const prevSelectedCardIdRef = useRef(selectedCardId);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (selectedCardId && selectedCardId !== prevSelectedCardIdRef.current) {
      prevSelectedCardIdRef.current = selectedCardId;
      const idx = cards.findIndex((c) => c.id === selectedCardId);
      if (idx !== -1) {
        setFrontIndex(idx);
      }
    }
  }, [selectedCardId, cards]);

  // When cards change (e.g. new card saved or prepended), display the newest card in front
  const prevFirstCardIdRef = useRef(cards[0]?.id);
  useEffect(() => {
    if (cards[0]?.id !== prevFirstCardIdRef.current) {
      prevFirstCardIdRef.current = cards[0]?.id;
      setFrontIndex(0);
    }
  }, [cards]);

  const handlePrev = () => {
    if (cards.length === 0) return;
    setExpandedCardId(null);
    const newIdx = Math.max(0, frontIndex - 1);
    setFrontIndex(newIdx);
    onSelectCard(cards[newIdx].id);
  };

  const handleNext = () => {
    if (cards.length === 0) return;
    setExpandedCardId(null);
    const newIdx = Math.min(cards.length - 1, frontIndex + 1);
    setFrontIndex(newIdx);
    onSelectCard(cards[newIdx].id);
  };

  // Highly responsive wheel event listener with delta accumulation and history swipe prevention
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Only allow vertical scrolling if target is inside an internal scrollable list inside the card
      const scrollableChild = target.closest('.overflow-y-auto') as HTMLElement | null;
      if (scrollableChild && el.contains(scrollableChild) && scrollableChild !== el) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          return;
        }
      }

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Prevent macOS Safari/Chrome back/forward swipe gesture
      const isHorizontal = absX > 3 || (absX > absY && absX > 1.5) || e.shiftKey;
      if (isHorizontal) {
        e.preventDefault();
      }

      // Carousel ONLY consumes horizontal swipe/wheel (browsing past cards)
      // or Shift+wheel. Vertical wheel gestures bubble up to jump page screens!
      let delta = 0;
      if (absX > 1.5 || e.shiftKey) {
        delta = e.shiftKey ? e.deltaY : e.deltaX;
      }

      if (delta === 0) return;

      wheelAccumulatorRef.current += delta;

      // Reset accumulator after 160ms of inactivity
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 160);

      const now = Date.now();
      const THRESHOLD = 24; // Responsive threshold for instant feel
      const COOLDOWN_MS = 140; // Fast cooldown between card advances

      if (Math.abs(wheelAccumulatorRef.current) >= THRESHOLD) {
        if (now - lastWheelTriggerRef.current > COOLDOWN_MS) {
          if (wheelAccumulatorRef.current > 0) {
            // Scroll forward/next
            if (cards.length > 0) {
              setFrontIndex((prev) => {
                const next = Math.min(cards.length - 1, prev + 1);
                onSelectCard(cards[next].id);
                return next;
              });
            }
          } else {
            // Scroll backward/prev
            if (cards.length > 0) {
              setFrontIndex((prev) => {
                const next = Math.max(0, prev - 1);
                onSelectCard(cards[next].id);
                return next;
              });
            }
          }
          lastWheelTriggerRef.current = now;
          wheelAccumulatorRef.current = 0;
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelResetTimerRef.current) clearTimeout(wheelResetTimerRef.current);
    };
  }, [cards, onSelectCard]);

  // Robust Native Touch Event Handlers for Mobile Devices (iOS Safari, Android Chrome)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalSwipe = false;
    let isVerticalScroll = false;
    let currentDrag = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isHorizontalSwipe = false;
      isVerticalScroll = false;
      currentDrag = 0;
      hasMovedRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isVerticalScroll) return;

      const diffX = e.touches[0].clientX - touchStartX;
      const diffY = e.touches[0].clientY - touchStartY;

      if (!isHorizontalSwipe && !isVerticalScroll) {
        // Distinguish horizontal card swipe from vertical screen scroll
        if (Math.abs(diffX) > 5 && Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipe = true;
          hasMovedRef.current = true;
          setIsDragging(true);
          // Blur any focused input during swipe
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        } else if (Math.abs(diffY) > 7 && Math.abs(diffY) > Math.abs(diffX)) {
          isVerticalScroll = true;
          return;
        }
      }

      if (isHorizontalSwipe) {
        // Stop default browser scroll and iOS back/forward history swipe
        if (e.cancelable) {
          e.preventDefault();
        }

        // Apply resistance at edges
        let resisted = diffX;
        if (
          (frontIndex === 0 && diffX > 0) ||
          (frontIndex === cards.length - 1 && diffX < 0)
        ) {
          resisted = diffX * 0.35;
        }
        currentDrag = resisted;
        setDragOffset(resisted);
      }
    };

    const onTouchEnd = () => {
      if (isHorizontalSwipe) {
        const SWIPE_THRESHOLD = 26;
        if (currentDrag < -SWIPE_THRESHOLD && frontIndex < cards.length - 1) {
          handleNext();
        } else if (currentDrag > SWIPE_THRESHOLD && frontIndex > 0) {
          handlePrev();
        }
      }

      setIsDragging(false);
      setDragOffset(0);

      // Briefly keep hasMoved true to prevent accidental card click right after swipe
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    };

    const onTouchCancel = () => {
      setIsDragging(false);
      setDragOffset(0);
      hasMovedRef.current = false;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [frontIndex, cards, onSelectCard]);

  // Mouse Drag Handler for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'BUTTON' || 
      target.closest('input') || 
      target.closest('button')
    ) {
      return;
    }

    const startX = e.clientX;
    hasMovedRef.current = false;
    setIsDragging(true);

    let moveDiff = 0;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const diffX = moveEvt.clientX - startX;
      if (Math.abs(diffX) > 4) {
        hasMovedRef.current = true;
      }
      let resisted = diffX;
      if (
        (frontIndex === 0 && diffX > 0) ||
        (frontIndex === cards.length - 1 && diffX < 0)
      ) {
        resisted = diffX * 0.35;
      }
      moveDiff = resisted;
      setDragOffset(resisted);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (hasMovedRef.current) {
        const SWIPE_THRESHOLD = 30;
        if (moveDiff < -SWIPE_THRESHOLD && frontIndex < cards.length - 1) {
          handleNext();
        } else if (moveDiff > SWIPE_THRESHOLD && frontIndex > 0) {
          handlePrev();
        }
      }

      setIsDragging(false);
      setDragOffset(0);
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-1.5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-1 text-[11px]">
        <div className="flex items-center gap-1">
          <div className="p-0.5 rounded bg-slate-800 text-slate-400">
            <History className="w-3 h-3" />
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide flex items-center gap-1">
            <span>Past Cards Deck</span>
            <Layers className="w-2.5 h-2.5 text-emerald-400" />
          </h3>
          <span className="text-[10px] text-slate-400">
            ({cards.length > 0 ? `${frontIndex + 1}/${cards.length}` : '0'})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onAddNewBlankCard && (
            <button
              onClick={onAddNewBlankCard}
              className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-[10px] font-semibold transition-all mr-1"
              title="Add a new blank card"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Card</span>
            </button>
          )}

          <button
            onClick={handlePrev}
            disabled={frontIndex === 0}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Previous card"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={handleNext}
            disabled={frontIndex >= cards.length - 1}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Next card"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Overlapping Deck Container - with real-time 1:1 drag & responsive wheel */}
      {cards.length === 0 ? (
        <div className="text-center py-4 px-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <p className="text-[11px] text-slate-400">No past cards yet.</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          style={{
            overscrollBehavior: 'none',
            overscrollBehaviorX: 'none',
            touchAction: 'pan-y',
          }}
          className={`relative w-full ${
            expandedCardId ? 'h-[445px]' : 'h-[185px]'
          } transition-[height] duration-300 ease-out overflow-hidden flex ${
            expandedCardId ? 'items-start pt-1' : 'items-center pt-1'
          } justify-center ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {cards.map((card, idx) => {
            const offset = idx - frontIndex;
            const isFront = offset === 0;

            // Render up to 3 cards on each side for smooth peeking
            if (Math.abs(offset) > 3) return null;

            // Responsive offset calculation with drag follow-through
            const baseTranslateX = offset * 48;
            const translateX = baseTranslateX + dragOffset * 0.75;
            const visualOffset = offset - (dragOffset / 130);
            const scale = Math.max(0.76, 1 - Math.abs(visualOffset) * 0.08);
            const zIndex = 30 - Math.round(Math.abs(offset));
            const opacity = Math.max(0.35, 1 - Math.abs(visualOffset) * 0.22);

            return (
              <div
                key={card.id}
                onClick={() => {
                  // Only select if not dragging
                  if (!hasMovedRef.current) {
                    setFrontIndex(idx);
                    onSelectCard(card.id);
                    if (expandedCardId && expandedCardId !== card.id) {
                      setExpandedCardId(null);
                    }
                  }
                }}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.22s ease',
                  willChange: 'transform, opacity',
                }}
                className={`absolute select-none ${
                  isFront ? 'pointer-events-auto' : 'pointer-events-auto filter brightness-90 hover:brightness-100'
                }`}
              >
                <FinanceCard
                  card={card}
                  mode="compact"
                  isSelected={card.id === selectedCardId}
                  isExpanded={expandedCardId === card.id}
                  onToggleExpand={(expanded) => {
                    setExpandedCardId(expanded ? card.id : null);
                  }}
                  onSelect={() => {
                    if (!hasMovedRef.current) {
                      setFrontIndex(idx);
                      onSelectCard(card.id);
                      if (expandedCardId && expandedCardId !== card.id) {
                        setExpandedCardId(null);
                      }
                    }
                  }}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard ? () => onDeleteCard(card.id) : undefined}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Dot indicators */}
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-1 pt-0.5">
          {cards.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setExpandedCardId(null);
                setFrontIndex(idx);
                onSelectCard(c.id);
              }}
              className={`transition-all rounded-full ${
                idx === frontIndex
                  ? 'w-3 h-1 bg-emerald-400'
                  : 'w-1 h-1 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Card ${c.monthYear}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
