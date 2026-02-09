
import React from 'react';

interface HeaderProps {
  onHome: () => void;
  onLearn: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHome, onLearn }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-wecare-blue text-white shadow-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={onHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg p-1 shadow-sm">
             <img 
               src="https://i.imgur.com/tD07Yrv.png" 
               alt="Wecare Logo" 
               className="h-full object-contain"
             />
          </div>
          <span className="text-xl font-bold font-lexend tracking-tight">C1 Mastery</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={onHome} className="font-medium hover:text-white/80 transition-colors">Trang chủ</button>
          <button onClick={onLearn} className="font-medium hover:text-white/80 transition-colors">Từ vựng</button>
          <button className="px-5 py-2 bg-wecare-green text-white font-bold rounded-lg hover:bg-wecare-green/90 transition-all shadow-sm">Bắt đầu học</button>
        </nav>
        
        <div className="md:hidden">
           <button className="w-10 h-10 flex items-center justify-center text-white">
             <i className="fa-solid fa-bars-staggered text-xl"></i>
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
