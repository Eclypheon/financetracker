import React, { useRef } from 'react';
import { FinanceCardData } from '../types/finance';
import { FinanceCard } from './FinanceCard';
import { ChevronLeft, ChevronRight, History, Plus } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full max-w-[480px] mx-auto space-y-1.5">
      {/* Carousel Header */}
      <div className="flex items-center justify-between px-1 text-[11px]">
        <div className="flex items-center gap-1">
          <div className="p-0.5 rounded bg-slate-800 text-slate-400">
            <History className="w-3 h-3" />
          </div>
          <h3 className="text-xs font-bold text-white tracking-wide">
            Past Cards Spread
          </h3>
          <span className="text-[10px] text-slate-400">({cards.length})</span>
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
            onClick={() => handleScroll('left')}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="Scroll left"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            title="Scroll right"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Horizontal Spread Container */}
      {cards.length === 0 ? (
        <div className="text-center py-4 px-3 rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <p className="text-[11px] text-slate-400">No past cards yet.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-2 overflow-x-auto pb-2 pt-0.5 px-0.5 custom-scrollbar scroll-smooth"
        >
          {cards.map((card) => (
            <FinanceCard
              key={card.id}
              card={card}
              mode="compact"
              isSelected={card.id === selectedCardId}
              onSelect={() => onSelectCard(card.id)}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard ? () => onDeleteCard(card.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
