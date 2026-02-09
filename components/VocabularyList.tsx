
import React, { useState, useMemo } from 'react';
import { Word } from '../types';
import { CATEGORIES, getWordCountByCategory } from '../constants';

interface VocabularyListProps {
  words: Word[];
}

const VocabularyList: React.FC<VocabularyListProps> = ({ words }) => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const wordCounts = useMemo(() => getWordCountByCategory(), []);

  const filteredWords = words.filter(w =>
    (filter === "All" || w.category === filter) &&
    (w.term.toLowerCase().includes(search.toLowerCase()) ||
      w.translation.toLowerCase().includes(search.toLowerCase()) ||
      w.definition.toLowerCase().includes(search.toLowerCase()))
  );

  const categoryIcons: Record<string, string> = {
    "All": "fa-layer-group",
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filters */}
      <div className="glass p-5 rounded-2xl shadow-card space-y-4">
        {/* Search Input */}
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"></i>
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng, nghĩa hoặc định nghĩa..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search vocabulary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                ${filter === cat
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                  : 'bg-muted text-text-secondary hover:bg-primary-100 hover:text-primary-700'
                }
              `}
            >
              <i className={`fa-solid ${categoryIcons[cat] || 'fa-folder'}`}></i>
              <span>{cat}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${filter === cat ? 'bg-white/20' : 'bg-border'
                }`}>
                {wordCounts[cat] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-medium text-text-secondary">
          Tìm thấy <span className="font-bold text-primary-600">{filteredWords.length}</span> từ
          {filter !== "All" && <> trong chủ đề <span className="font-bold text-text">{filter}</span></>}
        </p>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <i className="fa-solid fa-circle-info"></i>
          <span>Bấm vào thẻ để xem chi tiết</span>
        </div>
      </div>

      {/* Word Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredWords.map((word, idx) => (
          <div
            key={`${word.term}-${idx}`}
            className="group glass rounded-xl px-4 py-3 shadow-sm hover:shadow-card transition-all duration-200 flex items-center gap-4 cursor-pointer border border-transparent hover:border-primary-200"
          >
            {/* Left: Term & Translation */}
            <div className="flex-shrink-0 w-36 md:w-44">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-base font-bold text-text font-outfit tracking-tight group-hover:text-primary-600 transition-colors truncate">
                  {word.term}
                </h4>
                {word.partOfSpeech && (
                  <span className="text-[10px] font-medium text-text-muted italic">
                    ({word.partOfSpeech})
                  </span>
                )}
              </div>
              <p className="text-primary-600 font-semibold text-sm truncate">{word.translation}</p>
            </div>

            {/* Right: Definition */}
            <div className="flex-1 min-w-0 border-l border-border pl-4">
              <p className="text-text-secondary text-xs leading-relaxed line-clamp-2">{word.definition}</p>
            </div>

            {/* Category Badge */}
            <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-lg">
              <i className={`fa-solid ${categoryIcons[word.category] || 'fa-folder'} text-[10px] text-text-muted`}></i>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
                {word.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWords.length === 0 && (
        <div className="text-center py-20 glass rounded-2xl border-2 border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-search text-2xl text-text-muted"></i>
          </div>
          <p className="text-text-secondary font-semibold mb-1">Không tìm thấy từ phù hợp</p>
          <p className="text-sm text-text-muted mb-4">Thử thay đổi từ khóa hoặc bộ lọc</p>
          <button
            onClick={() => { setFilter("All"); setSearch(""); }}
            className="text-primary-600 font-semibold text-sm hover:underline cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabularyList;
