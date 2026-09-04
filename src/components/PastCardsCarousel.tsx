import React, { useRef } from 'react';
import { FinanceCardData } from '../types/finance';
import { FinanceCard } from './FinanceCard';
import { ChevronLeft, ChevronRight, History, CalendarPlus } from 'lucide-react';

interface PastCardsCarouselProps {
  cards: FinanceCardData[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  onAddNewMonth?: () => void;
  onDeleteCard?: (cardId: string) => void;
}

export const PastCardsCarousel: React.FC<PastCardsCarouselProps> = ({
  cards,
  selectedCardId,
  onSelectCard,
  onAddNewMonth,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full space-y-3">
      {/* Carousel Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Past Cards History
            </h3>
            <p className="text-xs text-slate-400">
              {cards.length} past record{cards.length === 1 ? '' : 's'} available. Click any to compare below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddNewMonth && (
            <button
              onClick={onAddNewMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold transition-all mr-2"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>+ New Month</span>
            </button>
          )}

          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Spread Container */}
      {cards.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
          <p className="text-sm text-slate-400">No past month cards yet.</p>
          <p className="text-xs text-slate-500 mt-1">Add a new month record above to track changes across time.</p>
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3.5 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar scroll-smooth"
        >
          {cards.map((card) => (
            <FinanceCard
              key={card.id}
              card={card}
              mode="compact"
              isSelected={card.id === selectedCardId}
              onSelect={() => onSelectCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
