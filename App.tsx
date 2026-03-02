
import React, { useState, useMemo } from 'react';
import { AppState, Word, ReadingVocab } from './types';
import { C1_VOCABULARY, getRandomWords, getWordCountByCategory } from './constants';
import Header from './components/Header';
import VocabularyList from './components/VocabularyList';
import Flashcard from './components/Flashcard';
import ReadingVocabPage from './components/ReadingVocabPage';
import ReadingFlashcard from './components/ReadingFlashcard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.LANDING);
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [currentCategory, setCurrentCategory] = useState("All");
  const [readingVocabsForReview, setReadingVocabsForReview] = useState<ReadingVocab[]>([]);

  const wordCounts = useMemo(() => getWordCountByCategory(), []);
  const totalWords = C1_VOCABULARY.length;

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
      setState(AppState.LANDING);
    }
  };

  const prevCard = () => {
    if (currentCardIdx > 0) {
      setCurrentCardIdx(prev => prev - 1);
    }
  };

  const startReadingFlashcards = (vocabs: ReadingVocab[]) => {
    setReadingVocabsForReview(vocabs);
    setState(AppState.READING_FLASHCARDS);
  };

  const categoryIcons: Record<string, string> = {
    "Literature": "fa-book",
    "Urban Life": "fa-city",
    "Climate Change": "fa-leaf",
    "Culture": "fa-globe",
    "Economy": "fa-chart-line",
    "Nutrition": "fa-apple-whole",
    "Global Issues": "fa-earth-americas",
    "Leisure": "fa-gamepad",
    "Technology": "fa-microchip",
    "Lifestyle": "fa-heart",
    "Migration": "fa-plane-departure",
    "Personality": "fa-user",
    "Science": "fa-flask",
    "Space": "fa-rocket",
  };

  const renderContent = () => {
    switch (state) {
      case AppState.LANDING:
        return (
          <div className="flex flex-col items-center text-center space-y-12 py-8 animate-fade-in">
            {/* Hero Section */}
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                <i className="fa-solid fa-graduation-cap"></i>
                <span>Flyer C1 Curriculum</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-text tracking-tight leading-tight font-outfit">
                Master <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">C1 English</span>
                <br />Vocabulary
              </h1>

              <p className="text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
                Ghi nhớ <span className="font-bold text-primary-600">{totalWords}</span> từ vựng học thuật thông qua hệ thống Flashcard AI thông minh.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setState(AppState.LEARNING)}
                className="group px-6 py-3.5 bg-surface text-text font-bold rounded-2xl border-2 border-border hover:border-primary-300 hover:shadow-card transition-all duration-200 flex items-center gap-3 cursor-pointer"
              >
                <i className="fa-solid fa-list-ul text-primary-500 group-hover:scale-110 transition-transform"></i>
                <span>Danh sách từ</span>
              </button>
              <button
                onClick={() => startFlashcards("All")}
                className="group px-8 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-2xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200 flex items-center gap-3 cursor-pointer"
              >
                <i className="fa-solid fa-bolt group-hover:scale-110 transition-transform"></i>
                <span>Học ngay</span>
              </button>
              <button
                onClick={() => setState(AppState.READING_VOCAB)}
                className="group px-6 py-3.5 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white font-bold rounded-2xl hover:from-secondary-700 hover:to-secondary-600 shadow-lg shadow-secondary-500/25 hover:shadow-xl transition-all duration-200 flex items-center gap-3 cursor-pointer"
              >
                <i className="fa-solid fa-book-open group-hover:scale-110 transition-transform"></i>
                <span>Kho Reading</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 py-4">
              <div className="text-center">
                <p className="text-3xl font-extrabold text-primary-600 font-outfit">{totalWords}</p>
                <p className="text-sm text-text-secondary">Từ vựng</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-secondary-600 font-outfit">{Object.keys(wordCounts).length - 1}</p>
                <p className="text-sm text-text-secondary">Chủ đề</p>
              </div>
              <div className="w-px h-10 bg-border"></div>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-accent-500 font-outfit">C1</p>
                <p className="text-sm text-text-secondary">Trình độ</p>
              </div>
            </div>

            {/* Category Cards */}
            <div className="w-full max-w-5xl">
              <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">
                Chọn chủ đề Flashcard
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Object.entries(wordCounts).filter(([cat]) => cat !== "All").map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => startFlashcards(cat)}
                    className="group glass rounded-xl p-4 hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        <i className={`fa-solid ${categoryIcons[cat] || 'fa-folder'} text-sm text-primary-600 group-hover:text-white`}></i>
                      </div>
                      <span className="text-xs font-bold text-primary-600">{count}</span>
                    </div>
                    <p className="text-sm font-semibold text-text group-hover:text-primary-600 transition-colors truncate">{cat}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case AppState.LEARNING:
        return <VocabularyList words={C1_VOCABULARY} />;

      case AppState.READING_VOCAB:
        return <ReadingVocabPage onStartFlashcards={startReadingFlashcards} />;

      case AppState.READING_FLASHCARDS:
        return (
          <ReadingFlashcard
            vocabs={readingVocabsForReview}
            onBack={() => setState(AppState.READING_VOCAB)}
          />
        );

      case AppState.FLASHCARDS:
        const progress = ((currentCardIdx + 1) / deck.length) * 100;
        return (
          <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-fade-in">
            {/* Top Bar */}
            <div className="w-full max-w-2xl flex justify-between items-center px-2">
              <button
                onClick={() => setState(AppState.LANDING)}
                className="text-text-secondary hover:text-text font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-chevron-left"></i>
                <span>Thoát</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-secondary">
                  {currentCategory}
                </span>
                <div className="px-3 py-1 bg-primary-100 rounded-full">
                  <span className="text-sm font-bold text-primary-700">
                    {currentCardIdx + 1} / {deck.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Flashcard */}
            <div className="w-full max-w-2xl">
              <Flashcard word={deck[currentCardIdx]} />
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4 w-full max-w-2xl">
              <button
                onClick={prevCard}
                disabled={currentCardIdx === 0}
                className="flex-1 py-3.5 bg-surface border-2 border-border text-text rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary-300 hover:shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span className="hidden sm:inline">Trước</span>
              </button>
              <button
                onClick={nextCard}
                className="flex-[2] py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-xl hover:from-primary-700 hover:to-primary-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentCardIdx === deck.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}</span>
                <i className={`fa-solid ${currentCardIdx === deck.length - 1 ? 'fa-check' : 'fa-arrow-right'}`}></i>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary-200 selection:text-primary-900">
      <Header
        onHome={() => setState(AppState.LANDING)}
        onLearn={() => setState(AppState.LEARNING)}
        onReadingVocab={() => setState(AppState.READING_VOCAB)}
      />
      <main className="container mx-auto px-4 max-w-6xl pt-24 pb-32">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 glass rounded-2xl md:hidden z-50 px-4 py-3 flex justify-around shadow-glass border border-white/50">
        <button
          onClick={() => setState(AppState.LANDING)}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${state === AppState.LANDING ? 'text-primary-600 scale-110' : 'text-text-secondary'}`}
        >
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[10px] font-medium">Trang chủ</span>
        </button>
        <button
          onClick={() => setState(AppState.LEARNING)}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${state === AppState.LEARNING ? 'text-primary-600 scale-110' : 'text-text-secondary'}`}
        >
          <i className="fa-solid fa-list text-lg"></i>
          <span className="text-[10px] font-medium">Từ vựng</span>
        </button>
        <button
          onClick={() => setState(AppState.READING_VOCAB)}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${state === AppState.READING_VOCAB || state === AppState.READING_FLASHCARDS ? 'text-secondary-600 scale-110' : 'text-text-secondary'}`}
        >
          <i className="fa-solid fa-book-open text-lg"></i>
          <span className="text-[10px] font-medium">Reading</span>
        </button>
        <button
          onClick={() => startFlashcards("All")}
          className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${state === AppState.FLASHCARDS ? 'text-primary-600 scale-110' : 'text-text-secondary'}`}
        >
          <i className="fa-solid fa-bolt text-lg"></i>
          <span className="text-[10px] font-medium">Flashcard</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
