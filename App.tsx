import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { Copilot } from './pages/Copilot';
import { Footer } from './components/Footer';
import { Search } from './pages/Search';
import { StockDetail } from './pages/StockDetail';
import type { Page, NavigationState } from './types';
import { mockWatchlist } from './services/mockDataService';

const App: React.FC = () => {
  const [navigation, setNavigation] = useState<NavigationState>({ page: 'Dashboard' });
  const [watchlist, setWatchlist] = useState<string[]>(mockWatchlist);

  const navigateTo = useCallback((page: Page, params?: Record<string, any>) => {
    setNavigation({ page, params });
    window.scrollTo(0, 0); // Scroll to top on page change
  }, []);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  }, []);

  const renderPage = useCallback(() => {
    const { page, params } = navigation;
    switch (page) {
      case 'Dashboard':
        return <Dashboard navigateTo={navigateTo} watchlist={watchlist} />;
      case 'Portfolio':
        return <Portfolio />;
      case 'Copilot':
        return <Copilot />;
      case 'Search':
        return <Search navigateTo={navigateTo} watchlist={watchlist} toggleWatchlist={toggleWatchlist} />;
      case 'StockDetail':
        if (params?.symbol) {
          return <StockDetail symbol={params.symbol} navigateTo={navigateTo} watchlist={watchlist} toggleWatchlist={toggleWatchlist} />;
        }
        // Fallback to dashboard if no symbol is provided
        return <Dashboard navigateTo={navigateTo} watchlist={watchlist} />;
      default:
        return <Dashboard navigateTo={navigateTo} watchlist={watchlist} />;
    }
  }, [navigation, navigateTo, watchlist, toggleWatchlist]);

  return (
    <div className="bg-[#0B0F14] text-[#E6EDF3] min-h-screen font-sans flex flex-col">
      <Header activePage={navigation.page} navigateTo={navigateTo} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;