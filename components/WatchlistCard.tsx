import React from 'react';
import { Card } from './Card';
import type { Page, Stock, Watchlist } from '../types';

interface WatchlistCardProps {
  watchlist: Watchlist;
  stocks: Stock[];
  navigateTo: (page: Page, params?: Record<string, any>) => void;
}

const WatchlistRow: React.FC<{ stock: Stock; onClick: () => void }> = ({ stock, onClick }) => {
  const isPositive = stock.changePercent >= 0;
  return (
    <tr
      className="border-b border-gray-700/50 hover:bg-gray-800/40 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      <td className="p-3">
        <div className="font-bold">{stock.symbol}</div>
      </td>
      <td className="p-3 font-mono text-right">₹{stock.price.toFixed(2)}</td>
      <td className={`p-3 font-mono text-right ${isPositive ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
      </td>
    </tr>
  );
};

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ watchlist, stocks, navigateTo }) => {
  const watchedStocks = stocks.filter(s => watchlist.includes(s.symbol));

  return (
    <Card className="flex flex-col">
      <h2 className="text-xl font-semibold mb-4">My Watchlist</h2>
      <div className="overflow-y-auto custom-scrollbar flex-grow">
        {watchedStocks.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#1A1F2A]">
              <tr className="text-left text-gray-400">
                <th className="p-3 font-semibold">Symbol</th>
                <th className="p-3 font-semibold text-right">Price</th>
                <th className="p-3 font-semibold text-right">Chg%</th>
              </tr>
            </thead>
            <tbody>
              {watchedStocks.map(stock => (
                <WatchlistRow
                  key={stock.symbol}
                  stock={stock}
                  onClick={() => navigateTo('StockDetail', { symbol: stock.symbol })}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-gray-500 text-sm">
            <p>Your watchlist is empty. <br/> Add stocks from the Search page.</p>
          </div>
        )}
      </div>
    </Card>
  );
};