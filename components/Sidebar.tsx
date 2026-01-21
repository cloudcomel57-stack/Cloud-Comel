
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  const navItems = [
    { name: AppView.OVERVIEW, icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: AppView.EVENT_REQUESTS, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: AppView.CANCELLATION_REQUESTS, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: AppView.USER_MANAGEMENT, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  ];

  return (
    <div className="w-64 bg-red-900 text-white flex flex-col shadow-2xl z-20">
      <div className="p-6 border-b border-red-800">
        <h1 className="text-2xl font-black tracking-tighter">CourtSync</h1>
        <p className="text-[10px] text-red-300 mt-1 uppercase font-bold tracking-[0.2em]">Administrator</p>
      </div>
      
      <nav className="flex-1 py-8 px-4 space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeView === item.name 
                ? 'bg-white text-red-900 shadow-lg' 
                : 'text-red-100 hover:bg-red-800'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="font-bold text-sm">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-red-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:text-white hover:bg-red-800 rounded-xl transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
