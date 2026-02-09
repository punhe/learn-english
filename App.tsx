
import React, { useState, useMemo } from 'react';
import { AppState, Word } from './types';
import { C1_VOCABULARY, getRandomWords, getWordCountByCategory } from './constants';
import Header from './components/Header';
import VocabularyList from './components/VocabularyList';
import Flashcard from './components/Flashcard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("All");

  const wordCounts = useMemo(() => getWordCountByCategory(), []);

  const startFlashcards = (category: string = "All") => {
    setCurrentCategory(category);
    const selectedWords = getRandomWords(20, category);
    setDeck(selectedWords);
    setCurrentCardIdx(0);
    setState(AppState.FLASHCARDS);
  };

  const nextCard = () => {
    if (currentCardIdx < deck.length - 1) {
      setCurrentCardIdx(prev => prev + 1);
    } else {
      // Loop back or finish
      setState(AppState.LANDING);
    }
  };

  const prevCard = () => {
    if (currentCardIdx > 0) {
      setCurrentCardIdx(prev => prev - 1);
    }
  };

  const renderContent = () => {
    switch (state) {
      case AppState.LANDING:
        return (
          <div className="flex flex-col items-center text-center space-y-12 py-6 animate-fadeIn">
            <div className="max-w-3xl space-y-6">
              <div className="inline-block px-4 py-1.5 bg-wecare-blue/10 text-wecare-blue rounded-full text-xs font-black uppercase tracking-widest font-lexend mb-2">
                Flyer C1 Curriculum
              </div>
              <h1 className="text-4xl md:text-7xl font-extrabold text-charcoal tracking-tighter leading-none font-lexend">
                Master <span className="text-wecare-blue">C1 English</span>
              </h1>
              <p className="text-lg text-medium-grey max-w-2xl mx-auto leading-relaxed font-roboto">
                Ghi nhớ {C1_VOCABULARY.length} từ vựng học thuật thông qua hệ thống Flashcard AI thông minh.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => setState(AppState.LEARNING)}
                className="px-8 py-4 bg-white text-wecare-blue font-black rounded-2xl border-2 border-wecare-blue hover:bg-wecare-blue/5 transition-all flex items-center gap-3 shadow-sm uppercase text-sm tracking-wider"
              >
                <i className="fa-solid fa-list-ul"></i>
                Danh sách từ
              </button>
              <button 
                onClick={() => startFlashcards("All")}
                className="px-10 py-4 bg-wecare-blue text-white font-black rounded-2xl hover:bg-wecare-blue/90 shadow-xl shadow-wecare-blue/30 transition-all flex items-center gap-3 uppercase text-sm tracking-wider"
              >
                <i className="fa-solid fa-layer-group"></i>
                Học tất cả
              </button>
            </div>

            <div className="w-full max-w-5xl">
              <h3 className="text-sm font-black text-charcoal/30 uppercase tracking-[0.2em] mb-8 font-lexend">Chọn chủ đề Flashcard</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(wordCounts).filter(([cat]) => cat !== "All").map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => startFlashcards(cat)}
                    className="bg-white p-4 rounded-xl border border-light-grey hover:border-wecare-blue hover:shadow-md transition-all text-left group"
                  >
                    <p className="text-[10px] font-black text-wecare-blue uppercase mb-1">{count} words</p>
                    <p className="text-sm font-bold text-charcoal group-hover:text-wecare-blue font-lexend">{cat}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case AppState.LEARNING:
        return <VocabularyList words={C1_VOCABULARY} />;

      case AppState.FLASHCARDS:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 py-6 animate-fadeIn">
            <div className="w-full max-w-md flex justify-between items-center px-4">
               <button onClick={() => setState(AppState.LANDING)} className="text-medium-grey hover:text-charcoal font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                 <i className="fa-solid fa-chevron-left"></i> Thoát
               </button>
               <span className="text-sm font-black font-lexend text-wecare-blue">
                 {currentCardIdx + 1} / {deck.length}
               </span>
            </div>

            <div className="w-full max-w-md">
              <Flashcard word={deck[currentCardIdx]} />
            </div>

            <div className="flex items-center gap-6 w-full max-w-md">
              <button 
                onClick={prevCard}
                disabled={currentCardIdx === 0}
                className="flex-1 py-4 bg-white border-2 border-light-grey text-charcoal rounded-2xl font-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-off-white transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <button 
                onClick={nextCard}
                className="flex-[2] py-4 bg-wecare-blue text-white rounded-2xl font-black shadow-lg shadow-wecare-blue/20 hover:bg-wecare-blue/90 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
              >
                {currentCardIdx === deck.length - 1 ? 'Hoàn thành' : 'Thẻ tiếp theo'}
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-off-white selection:bg-wecare-blue/20 selection:text-wecare-blue">
      <Header onHome={() => setState(AppState.LANDING)} onLearn={() => setState(AppState.LEARNING)} />
      <main className="container mx-auto px-4 max-w-6xl pt-24 pb-32">
        {renderContent()}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-charcoal text-white rounded-3xl md:hidden z-50 px-8 py-4 flex gap-10 shadow-2xl border border-white/10 backdrop-blur-md bg-opacity-90">
        <button onClick={() => setState(AppState.LANDING)} className={`flex flex-col items-center gap-1 transition-all ${state === AppState.LANDING ? 'text-wecare-blue scale-110' : 'text-white/50'}`}>
          <i className="fa-solid fa-house-chimney text-lg"></i>
        </button>
        <button onClick={() => setState(AppState.LEARNING)} className={`flex flex-col items-center gap-1 transition-all ${state === AppState.LEARNING ? 'text-wecare-blue scale-110' : 'text-white/50'}`}>
          <i className="fa-solid fa-layer-group text-lg"></i>
        </button>
        <button onClick={() => startFlashcards("All")} className={`flex flex-col items-center gap-1 transition-all ${state === AppState.FLASHCARDS ? 'text-wecare-blue scale-110' : 'text-white/50'}`}>
          <i className="fa-solid fa-bolt text-lg"></i>
        </button>
      </nav>
    </div>
  );
};

export default App;
