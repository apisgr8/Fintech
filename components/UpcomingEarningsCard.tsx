import React from 'react';
import { Card } from './Card';
import { mockStocks } from '../services/mockDataService';
import type { Page, Stock } from '../types';

interface UpcomingEarningsCardProps {
  navigateTo: (page: Page, params?: Record<string, any>) => void;
}

const EarningsRow: React.FC<{ stock: Stock; onClick: () => void }> = ({ stock, onClick }) => {
    const earningsDate = new Date(stock.earningsDate!);
    const formattedDate = earningsDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const daysUntil = Math.ceil((earningsDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
        <div onClick={onClick} className="flex justify-between items-center p-3 hover:bg-gray-800/40 cursor-pointer transition-all duration-200 rounded-lg">
            <div>
                <p className="font-bold">{stock.symbol}</p>
                <p className="text-xs text-gray-400 truncate">{stock.name}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold text-[#00E5FF]">{formattedDate}</p>
                <p className="text-xs text-gray-400">{daysUntil} {daysUntil === 1 ? 'day' : 'days'}</p>
            </div>
        </div>
    );
};

export const UpcomingEarningsCard: React.FC<UpcomingEarningsCardProps> = ({ navigateTo }) => {
    const upcomingEarnings = mockStocks
        .filter(stock => stock.earningsDate && new Date(stock.earningsDate) >= new Date())
        .sort((a, b) => new Date(a.earningsDate!).getTime() - new Date(b.earningsDate!).getTime())
        .slice(0, 5); // Show top 5 upcoming

    if (upcomingEarnings.length === 0) {
        return null; // Don't render the card if there's no data
    }

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Upcoming Earnings</h2>
            <div className="space-y-2">
                {upcomingEarnings.map(stock => (
                    <EarningsRow 
                        key={stock.symbol} 
                        stock={stock} 
                        onClick={() => navigateTo('StockDetail', { symbol: stock.symbol })}
                    />
                ))}
            </div>
        </Card>
    );
};