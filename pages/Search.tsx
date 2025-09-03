import React, { useState, useMemo } from 'react';
import { Card } from '../components/Card';
import { mockStocks } from '../services/mockDataService';
import type { Page, Stock, Watchlist } from '../types';

interface SearchProps {
  navigateTo: (page: Page, params?: Record<string, any>) => void;
  watchlist: Watchlist;
  toggleWatchlist: (symbol: string) => void;
}

const SearchResultRow: React.FC<{ 
    stock: Stock; 
    onRowClick: () => void;
    onWatchlistToggle: () => void;
    isWatched: boolean;
}> = ({ stock, onRowClick, onWatchlistToggle, isWatched }) => {
  const isPositive = stock.changePercent >= 0;

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when toggling watchlist
    onWatchlistToggle();
  }

  return (
    <div
      onClick={onRowClick}
      className="grid grid-cols-[1fr,auto,auto,auto] md:grid-cols-[1fr,auto,auto,auto,auto] items-center p-3 border-b border-gray-700/50 hover:bg-gray-800/40 cursor-pointer transition-all duration-200"
    >
      <div className="truncate pr-2">
        <div className="font-bold">{stock.symbol}</div>
        <div className="text-xs text-gray-400 truncate">{stock.name}</div>
      </div>
      <div className="font-mono text-right">₹{stock.price.toFixed(2)}</div>
      <div className={`font-mono text-right ${isPositive ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
      </div>
      <div className="hidden md:block text-right">
        <div className="inline-block px-3 py-1 text-xs font-semibold text-cyan-200 bg-cyan-900/50 rounded-full">
          {stock.breakoutScore}
        </div>
      </div>
      <div className="text-right pl-2">
          <button onClick={handleWatchlistClick} className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isWatched ? '#FFC400' : 'currentColor'}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
      </div>
    </div>
  );
};

export const Search: React.FC<SearchProps> = ({ navigateTo, watchlist, toggleWatchlist }) => {
  const [query, setQuery] = useState('');

  const filteredStocks = useMemo(() => {
    if (!query) {
      return mockStocks;
    }
    const lowerCaseQuery = query.toLowerCase();
    return mockStocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(lowerCaseQuery) ||
        stock.symbol.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search Stocks</h1>
        <p className="text-gray-400">Find your next investment opportunity.</p>
      </div>

      <div className="sticky top-20 z-40">
         <div className="relative">
            <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or symbol (e.g., INFY)"
            className="w-full bg-[#1A1F2A] p-4 pl-12 text-lg border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00E5FF]"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
        </div>
      </div>
      
      <Card>
        <div className="grid grid-cols-[1fr,auto,auto,auto] md:grid-cols-[1fr,auto,auto,auto,auto] p-3 text-left text-sm font-semibold text-gray-400 border-b border-gray-600">
            <h3 className="pr-2">Symbol/Name</h3>
            <h3 className="text-right">Price</h3>
            <h3 className="text-right">Change %</h3>
            <h3 className="hidden md:block text-right">Breakout Score</h3>
            <h3 className="text-right pl-2">Watch</h3>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {filteredStocks.length > 0 ? (
                filteredStocks.map(stock => (
                    <SearchResultRow 
                        key={stock.symbol} 
                        stock={stock} 
                        onRowClick={() => navigateTo('StockDetail', { symbol: stock.symbol })}
                        onWatchlistToggle={() => toggleWatchlist(stock.symbol)}
                        isWatched={watchlist.includes(stock.symbol)}
                    />
                ))
            ) : (
                <div className="p-8 text-center text-gray-500">
                    <p>No stocks found for "{query}"</p>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};