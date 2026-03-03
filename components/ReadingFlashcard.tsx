import React, { useState, useEffect, useCallback } from 'react';
import { ReadingVocab } from '../types';

interface ReadingFlashcardProps {
    vocabs: ReadingVocab[];
    onBack: () => void;
}

type CardSide = 'front' | 'back';

const ReadingFlashcard: React.FC<ReadingFlashcardProps> = ({ vocabs, onBack }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [side, setSide] = useState<CardSide>('front');
    const [shuffledVocabs, setShuffledVocabs] = useState<ReadingVocab[]>([]);
    const [knownCount, setKnownCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showComplete, setShowComplete] = useState(false);

    useEffect(() => {
        // Shuffle on mount
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
        setShuffledVocabs(shuffled);
    }, [vocabs]);

    const currentVocab = shuffledVocabs[currentIdx];
    const progress = shuffledVocabs.length > 0 ? ((currentIdx + 1) / shuffledVocabs.length) * 100 : 0;

    const flip = useCallback(() => {
        if (isAnimating) return;
        setSide(prev => prev === 'front' ? 'back' : 'front');
    }, [isAnimating]);

    const goNext = useCallback((known: boolean) => {
        if (isAnimating) return;
        setIsAnimating(true);

        if (known) setKnownCount(prev => prev + 1);
        else setReviewCount(prev => prev + 1);

        if (currentIdx >= shuffledVocabs.length - 1) {
            // Finished
            setTimeout(() => {
                setShowComplete(true);
                setIsAnimating(false);
            }, 300);
            return;
        }

        setTimeout(() => {
            setCurrentIdx(prev => prev + 1);
            setSide('front');
            setIsAnimating(false);
        }, 200);
    }, [currentIdx, shuffledVocabs.length, isAnimating]);

    const restart = () => {
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
        setShuffledVocabs(shuffled);
        setCurrentIdx(0);
        setSide('front');
        setKnownCount(0);
        setReviewCount(0);
        setShowComplete(false);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                flip();
            } else if (e.key === 'ArrowRight' || e.key === 'l') {
                goNext(true);
            } else if (e.key === 'ArrowLeft' || e.key === 'h') {
                goNext(false);
            } else if (e.key === 'Escape') {
                onBack();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [flip, goNext, onBack]);

    if (shuffledVocabs.length === 0) {
        return (
            <div className="text-center py-20">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-primary-500"></i>
            </div>
        );
    }

    // Completion screen
    if (showComplete) {
        const total = knownCount + reviewCount;
        const knownPercent = total > 0 ? Math.round((knownCount / total) * 100) : 0;

        return (
            <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-fade-in max-w-lg mx-auto">
                {/* Trophy */}
                <div className="w-24 h-24 bg-gradient-to-br from-accent-400 to-accent-300 rounded-3xl flex items-center justify-center shadow-lg shadow-accent-500/30">
                    <i className="fa-solid fa-trophy text-4xl text-white"></i>
                </div>

                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-text font-outfit">Hoàn thành!</h2>
                    <p className="text-text-secondary">Bạn đã ôn tập {total} từ vựng</p>
                </div>

                {/* Stats */}
                <div className="w-full glass rounded-2xl shadow-card p-6 space-y-4">
                    {/* Progress bar */}
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-muted">
                        <div
                            className="bg-gradient-to-r from-secondary-500 to-secondary-400 rounded-full transition-all duration-500"
                            style={{ width: `${knownPercent}%` }}
                        ></div>
                        <div
                            className="bg-gradient-to-r from-accent-400 to-accent-300 rounded-full transition-all duration-500"
                            style={{ width: `${100 - knownPercent}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-around">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <i className="fa-solid fa-check text-secondary-600 text-lg"></i>
                            </div>
                            <p className="text-2xl font-extrabold text-secondary-600 font-outfit">{knownCount}</p>
                            <p className="text-xs text-text-secondary font-medium">Đã thuộc</p>
                        </div>
                        <div className="w-px bg-border"></div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <i className="fa-solid fa-rotate text-accent-500 text-lg"></i>
                            </div>
                            <p className="text-2xl font-extrabold text-accent-500 font-outfit">{reviewCount}</p>
                            <p className="text-xs text-text-secondary font-medium">Cần ôn lại</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3.5 bg-surface border-2 border-border text-text font-bold rounded-xl hover:border-primary-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                    <button
                        onClick={restart}
                        className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-rotate"></i>
                        <span>Học lại</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-4 animate-fade-in max-w-2xl mx-auto">
            {/* Top Bar */}
            <div className="w-full flex justify-between items-center px-2">
                <button
                    onClick={onBack}
                    className="text-text-secondary hover:text-text font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <i className="fa-solid fa-chevron-left"></i>
                    <span>Thoát</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-text-secondary">Reading Vocab</span>
                    <div className="px-3 py-1 bg-primary-100 rounded-full">
                        <span className="text-sm font-bold text-primary-700">
                            {currentIdx + 1} / {shuffledVocabs.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Flashcard */}
            <div
                className="w-full cursor-pointer perspective-1000 group"
                onClick={flip}
                role="button"
                tabIndex={0}
                aria-label={`Reading flashcard for ${currentVocab.term}. Click to flip.`}
            >
                <div className={`relative w-full transition-all duration-500 preserve-3d ${side === 'back' ? 'rotate-y-180' : ''}`}>
                    {/* Front Face - Term + Meaning */}
                    <div className="backface-hidden glass rounded-2xl shadow-card p-8 md:p-10 border border-white/50 min-h-[320px] flex flex-col justify-center">
                        <div className="text-center space-y-4">
                            {/* Term */}
                            <h2 className="text-3xl md:text-5xl font-extrabold text-text font-outfit tracking-tight">
                                {currentVocab.term}
                            </h2>

                            {/* Structure badge */}
                            {currentVocab.relatedStructure && (
                                <code className="inline-block text-sm font-mono text-secondary-700 bg-secondary-50 px-4 py-1.5 rounded-lg border border-secondary-200">
                                    {currentVocab.relatedStructure}
                                </code>
                            )}
                        </div>

                        {/* Flip Indicator */}
                        <div className="flex justify-center mt-6 text-text-muted group-hover:text-primary-500 transition-colors">
                            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full group-hover:bg-primary-50 transition-colors">
                                <i className="fa-solid fa-rotate animate-pulse-soft"></i>
                                <span className="text-xs font-semibold uppercase tracking-wider">Lật để xem chi tiết</span>
                            </div>
                        </div>
                    </div>

                    {/* Back Face - Full details */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-secondary-50 to-white rounded-2xl shadow-card border border-secondary-200 p-6 md:p-8 overflow-auto min-h-[320px]">
                        <div className="space-y-4">
                            {/* Term header */}
                            <div className="flex items-center gap-3 pb-3 border-b border-secondary-200">
                                <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-400 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold font-outfit">
                                        {currentVocab.term.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-text font-outfit">{currentVocab.term}</h3>
                                    <span className="text-sm font-semibold text-primary-600">{currentVocab.meaning}</span>
                                </div>
                            </div>

                            {/* Structure */}
                            {currentVocab.relatedStructure && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-accent-500 uppercase tracking-wider bg-accent-50 px-2 py-0.5 rounded flex-shrink-0">Cấu trúc</span>
                                    <code className="text-sm font-mono text-text bg-white px-3 py-1 rounded border border-border">{currentVocab.relatedStructure}</code>
                                </div>
                            )}

                            {/* Explanation */}
                            {currentVocab.explanation && (
                                <div className="bg-white/80 p-4 rounded-xl border border-secondary-100">
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-2">Giải thích</p>
                                    <p className="text-sm text-text leading-relaxed">{currentVocab.explanation}</p>
                                </div>
                            )}

                            {/* Examples */}
                            {currentVocab.examples.length > 0 && (
                                <div className="bg-secondary-50 rounded-xl p-4 border-l-4 border-secondary-400 space-y-2">
                                    <p className="text-[10px] font-bold text-secondary-600 uppercase tracking-widest mb-1">Ví dụ</p>
                                    {currentVocab.examples.map((ex, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <i className="fa-solid fa-quote-left text-[10px] text-secondary-400 mt-1.5 flex-shrink-0"></i>
                                            <p className="text-sm text-text-secondary italic leading-relaxed">{ex}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full">
                <button
                    onClick={() => goNext(false)}
                    className="flex-1 py-3.5 bg-surface border-2 border-border text-accent-500 font-bold rounded-xl hover:border-accent-300 hover:bg-accent-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-rotate"></i>
                    <span>Ôn lại</span>
                </button>
                <button
                    onClick={() => goNext(true)}
                    className="flex-[2] py-3.5 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white font-bold rounded-xl shadow-lg shadow-secondary-500/20 hover:from-secondary-700 hover:to-secondary-600 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-check"></i>
                    <span>Đã thuộc</span>
                </button>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="hidden md:flex items-center justify-center gap-6 text-[10px] text-text-muted">
                <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-text-secondary font-mono">Space</kbd>
                    <span>Lật thẻ</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-text-secondary font-mono">←</kbd>
                    <span>Ôn lại</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-text-secondary font-mono">→</kbd>
                    <span>Đã thuộc</span>
                </div>
                <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-text-secondary font-mono">Esc</kbd>
                    <span>Thoát</span>
                </div>
            </div>
        </div>
    );
};

export default ReadingFlashcard;
