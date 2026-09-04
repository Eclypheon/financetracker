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
  // Track which card index is in front
  const [frontIndex, setFrontIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  // Synchronize frontIndex with selectedCardId
  useEffect(() => {
    if (selectedCardId) {
      const idx = cards.findIndex((c) => c.id === selectedCardId);
      if (idx !== -1) {
        setFrontIndex(idx);
      }
    }
  }, [selectedCardId, cards]);

  const handlePrev = () => {
    if (cards.length === 0) return;
    const newIdx = Math.max(0, frontIndex - 1);
    setFrontIndex(newIdx);
    onSelectCard(cards[newIdx].id);
  };

  const handleNext = () => {
    if (cards.length === 0) return;
    const newIdx = Math.min(cards.length - 1, frontIndex + 1);
    setFrontIndex(newIdx);
    onSelectCard(cards[newIdx].id);
  };

  // Wheel scroll handler (no scrollbar, wheel shifts front card)
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
      if (e.deltaX > 20 || e.deltaY > 20) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
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
              <span>+ Card</span>
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

      {/* Overlapping Deck Container - Zero scrollbar, all cards fit within width */}
      {cards.length === 0 ? (
        <div className="text-center py-4 px-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <p className="text-[11px] text-slate-400">No past cards yet.</p>
        </div>
      ) : (
        <div
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[180px] overflow-hidden flex items-center justify-center pt-1"
        >
          {cards.map((card, idx) => {
            const offset = idx - frontIndex;
            const isFront = offset === 0;
            // Only render cards close to front to keep DOM clean
            if (Math.abs(offset) > 3) return null;

            // Horizontal overlap offset calculation
            const translateX = offset * 45; // 45px peek per card
            const scale = Math.max(0.78, 1 - Math.abs(offset) * 0.08);
            const zIndex = 30 - Math.abs(offset);
            const opacity = Math.max(0.4, 1 - Math.abs(offset) * 0.25);

            return (
              <div
                key={card.id}
                onClick={() => {
                  setFrontIndex(idx);
                  onSelectCard(card.id);
                }}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`absolute transition-all cursor-pointer ${
                  isFront ? 'pointer-events-auto' : 'pointer-events-auto filter brightness-90'
                }`}
              >
                <FinanceCard
                  card={card}
                  mode="compact"
                  isSelected={card.id === selectedCardId}
                  onSelect={() => {
                    setFrontIndex(idx);
                    onSelectCard(card.id);
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
