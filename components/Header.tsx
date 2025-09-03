import React from 'react';
import type { Page, NavigationState } from '../types';

interface HeaderProps {
  activePage: Page;
  navigateTo: (page: Page) => void;
}

const NavLink: React.FC<{
  pageName: Page;
  activePage: Page;
  onClick: (page: Page) => void;
  children: React.ReactNode;
}> = ({ pageName, activePage, onClick, children }) => (
  <button
    onClick={() => onClick(pageName)}
    className={`px-3 py-2 text-sm md:text-base font-medium rounded-md transition-all duration-300 flex items-center space-x-2 ${
      activePage === pageName
        ? 'text-[#00E5FF] bg-white/10'
        : 'text-[#E6EDF3]/70 hover:text-white hover:bg-white/5'
    }`}
    aria-current={activePage === pageName ? 'page' : undefined}
  >
    {children}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ activePage, navigateTo }) => {
  return (
    <header className="bg-[#0B0F14]/80 backdrop-blur-sm sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigateTo('Dashboard')} className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" className="text-[#00E5FF] glow-accent">
                <path fill="currentColor" d="M12 2L4.5 16.5h15L12 2zm0 5.21L14.79 13H9.21L12 7.21zM4.5 18h15v2h-15v-2z"/>
            </svg>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">Zenith Invest</h1>
          </button>
          <nav className="flex items-center space-x-1 md:space-x-2">
            <NavLink pageName="Dashboard" activePage={activePage} onClick={() => navigateTo('Dashboard')}><span>Dashboard</span></NavLink>
            <NavLink pageName="Portfolio" activePage={activePage} onClick={() => navigateTo('Portfolio')}><span>Portfolio</span></NavLink>
            <NavLink pageName="Search" activePage={activePage} onClick={() => navigateTo('Search')}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <span className="hidden sm:inline">Search</span>
            </NavLink>
            <NavLink pageName="Copilot" activePage={activePage} onClick={() => navigateTo('Copilot')}><span>Copilot</span></NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};