
import React from 'react';

interface HeaderProps {
  onHome: () => void;
  onLearn: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, onLearn }) => {
  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="glass rounded-2xl shadow-glass max-w-6xl mx-auto px-6 py-3 flex items-center justify-between border border-white/50">
        {/* Logo */}
        <button
          onClick={onHome}
          className="flex items-center gap-3 cursor-pointer group"
          aria-label="Go to home page"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:scale-105 transition-all">
            <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-text font-outfit tracking-tight">C1 Master</h1>
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Vocabulary Learning</p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onHome}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-house"></i>
            <span>Trang chủ</span>
          </button>
          <button
            onClick={onLearn}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-list"></i>
            <span>Từ vựng</span>
          </button>
          <button
            onClick={onHome}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-md shadow-primary-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-bolt"></i>
            <span>Học ngay</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-text-secondary hover:bg-primary-100 hover:text-primary-600 transition-all cursor-pointer">
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;
