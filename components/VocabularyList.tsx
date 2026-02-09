
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

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-light-grey space-y-6">
        <div className="relative max-w-xl mx-auto">
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-medium-grey"></i>
          <input 
            type="text" 
            placeholder="Tìm kiếm từ vựng, nghĩa hoặc định nghĩa..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-off-white border border-light-grey focus:ring-4 focus:ring-wecare-blue/10 focus:border-wecare-blue outline-none transition-all text-base font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide border-t border-light-grey pt-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all uppercase tracking-widest flex items-center gap-2
                ${filter === cat 
                  ? 'bg-wecare-blue text-white shadow-lg shadow-wecare-blue/20 scale-105' 
                  : 'bg-off-white text-medium-grey hover:bg-light-grey'}
              `}
            >
              {cat}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === cat ? 'bg-white/20 text-white' : 'bg-light-grey text-medium-grey'}`}>
                {wordCounts[cat] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center justify-between px-4">
         <p className="text-sm font-bold text-medium-grey font-lexend uppercase tracking-widest">
           Tìm thấy <span className="text-wecare-blue">{filteredWords.length}</span> từ trong chủ đề <span className="text-charcoal">{filter}</span>
         </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWords.map((word, idx) => (
          <div 
            key={`${word.term}-${idx}`}
            className="group bg-white rounded-2xl p-8 shadow-sm border border-light-grey hover:shadow-xl hover:border-wecare-blue/30 transition-all duration-300 flex flex-col h-full"
          >
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-wecare-blue/50 font-lexend">
                  {word.category}
                </span>
                {word.partOfSpeech && (
                  <span className="text-[10px] font-black text-charcoal/20 uppercase bg-light-grey px-2 py-0.5 rounded italic">
                    {word.partOfSpeech}
                  </span>
                )}
              </div>
              <h4 className="text-2xl font-black text-charcoal font-lexend tracking-tight group-hover:text-wecare-blue transition-colors">
                {word.term}
              </h4>
              <p className="text-wecare-blue font-bold mt-1 text-base">{word.translation}</p>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="relative pl-4 border-l-2 border-light-grey group-hover:border-wecare-blue/30 transition-colors">
                <p className="text-charcoal/70 leading-relaxed text-sm font-medium">{word.definition}</p>
              </div>
              
              {word.example && (
                <div className="bg-off-white p-4 rounded-xl italic text-xs text-medium-grey leading-relaxed border border-light-grey/50">
                  "{word.example}"
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredWords.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-light-grey shadow-inner">
          <div className="w-20 h-20 bg-off-white rounded-full flex items-center justify-center mx-auto mb-6 text-light-grey">
            <i className="fa-solid fa-magnifying-glass text-3xl"></i>
          </div>
          <p className="text-medium-grey font-bold font-lexend uppercase tracking-widest">Không tìm thấy từ phù hợp</p>
          <button onClick={() => {setFilter("All"); setSearch("");}} className="mt-4 text-wecare-blue font-black text-xs uppercase underline tracking-tighter">Đặt lại bộ lọc</button>
        </div>
      )}
    </div>
  );
};

export default VocabularyList;
