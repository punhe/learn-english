
import React, { useState, useEffect } from 'react';
import { Word } from '../types';

interface FlashcardProps {
  word: Word;
}

const Flashcard: React.FC<FlashcardProps> = ({ word }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state khi chuyển từ
  useEffect(() => {
    setIsFlipped(false);
  }, [word]);

  return (
    <div 
      className="relative w-full max-w-md aspect-[3/4] cursor-pointer perspective-1000 group mx-auto"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-all duration-500 preserve-3d shadow-2xl rounded-[2.5rem] ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] border-4 border-wecare-blue/10 flex flex-col items-center justify-center p-10 text-center">
          <span className="text-xs font-black text-wecare-blue/40 uppercase tracking-[0.3em] mb-4 font-lexend">
            {word.category}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-charcoal font-lexend tracking-tight mb-2">
            {word.term}
          </h2>
          {word.partOfSpeech && (
            <span className="text-sm font-bold text-medium-grey italic bg-light-grey px-3 py-1 rounded-full">
              {word.partOfSpeech}
            </span>
          )}
          <div className="mt-12 text-wecare-blue/30 animate-bounce">
            <i className="fa-solid fa-repeat text-xl"></i>
          </div>
          <p className="mt-4 text-[10px] font-bold text-medium-grey uppercase tracking-widest">Chạm để lật thẻ</p>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-off-white rounded-[2.5rem] border-4 border-wecare-green/20 flex flex-col p-8 overflow-y-auto scrollbar-hide">
          <div className="text-center mb-6">
            <p className="text-2xl font-black text-wecare-green font-lexend">{word.translation}</p>
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="bg-white p-5 rounded-2xl border border-light-grey shadow-sm">
              <h4 className="text-[10px] font-black text-medium-grey uppercase tracking-widest mb-2 border-b border-light-grey pb-2">Định nghĩa</h4>
              <p className="text-charcoal font-medium leading-relaxed">{word.definition}</p>
            </div>

            {word.example && (
              <div className="bg-wecare-blue/5 p-5 rounded-2xl border border-wecare-blue/10 italic">
                <h4 className="text-[10px] font-black text-wecare-blue uppercase tracking-widest mb-2 not-italic">Ví dụ sử dụng</h4>
                <p className="text-charcoal/80 text-sm leading-relaxed">"{word.example}"</p>
              </div>
            )}
            
            <div className="mt-auto pt-4 text-center">
               <p className="text-[10px] font-bold text-medium-grey/40 uppercase tracking-widest">Mastering C1 Level</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
