
import React, { useState, useEffect } from 'react';
import { Word } from '../types';

interface FlashcardProps {
  word: Word;
}

const Flashcard: React.FC<FlashcardProps> = ({ word }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  return (
    <div
      className="relative w-full aspect-[16/10] cursor-pointer perspective-1000 group"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      aria-label={`Flashcard for ${word.term}. Click to flip.`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden glass rounded-2xl shadow-card flex items-center justify-between p-6 md:p-8 border border-white/50">
          <div className="flex-1 min-w-0">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 rounded-full mb-3">
              <i className="fa-solid fa-tag text-[10px] text-primary-500"></i>
              <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide">
                {word.category}
              </span>
            </div>

            {/* Term */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-text font-outfit tracking-tight mb-2 leading-tight">
              {word.term}
            </h2>

            {/* Part of Speech */}
            {word.partOfSpeech && (
              <span className="inline-block text-sm font-medium text-text-secondary italic bg-muted px-2.5 py-1 rounded-lg">
                {word.partOfSpeech}
              </span>
            )}
          </div>

          {/* Flip Indicator */}
          <div className="flex flex-col items-center text-text-muted ml-4 group-hover:text-primary-500 transition-colors">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <i className="fa-solid fa-rotate text-xl animate-pulse-soft"></i>
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider">Lật thẻ</p>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-secondary-50 to-white rounded-2xl shadow-card border border-secondary-200 flex flex-col md:flex-row items-stretch p-6 md:p-8 gap-4 md:gap-6">
          {/* Translation */}
          <div className="flex-shrink-0 flex items-center md:border-r md:border-secondary-200 md:pr-6">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest">Nghĩa</span>
              <p className="text-xl md:text-2xl font-extrabold text-secondary-700 font-outfit mt-1">
                {word.translation}
              </p>
            </div>
          </div>

          {/* Definition & Example */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="bg-white/80 p-4 rounded-xl border border-secondary-100">
              <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Định nghĩa</h4>
              <p className="text-text font-medium leading-relaxed text-sm md:text-base line-clamp-3">
                {word.definition}
              </p>
            </div>

            {word.example && (
              <div className="mt-3 px-4 py-3 bg-secondary-50 rounded-xl border-l-4 border-secondary-400">
                <p className="text-text-secondary text-sm italic line-clamp-2">
                  "{word.example}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
