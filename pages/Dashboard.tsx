import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { StockChart } from '../components/StockChart';
import { CandleMelt } from '../components/CandleMelt';
import { mockStocks, mockMutualFunds } from '../services/mockDataService';
import { getAIBriefing } from '../services/geminiService';
import type { Stock, DashboardState, Page, Watchlist } from '../types';
import { TechnicalAnalysisCard } from '../components/TechnicalAnalysisCard';
import { UpcomingEarningsCard } from '../components/UpcomingEarningsCard';
import { WatchlistCard } from '../components/WatchlistCard';

interface DashboardProps {
  navigateTo: (page: Page, params?: Record<string, any>) => void;
  watchlist: Watchlist;
}

const StockRow: React.FC<{stock: Stock, onSelect: () => void, isSelected: boolean}> = ({ stock, onSelect, isSelected }) => {
  const isPositive = stock.changePercent >= 0;
  return (
    <tr 
        className={`border-b border-gray-700/50 hover:bg-gray-800/40 cursor-pointer transition-all duration-200 ${isSelected ? 'bg-[#00E5FF]/10' : ''}`}
        onClick={onSelect}
    >
      <td className="p-3">
        <div className="font-bold">{stock.symbol}</div>
        <div className="text-xs text-gray-400">{stock.name}</div>
      </td>
      <td className="p-3 font-mono text-right">₹{stock.price.toFixed(2)}</td>
      <td className={`p-3 font-mono text-right ${isPositive ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
      </td>
      <td className="p-3 text-right">
        <div className="inline-block px-3 py-1 text-xs font-semibold text-cyan-200 bg-cyan-900/50 rounded-full">
            {stock.breakoutScore}
        </div>
      </td>
    </tr>
  );
};

const AIBriefingCard: React.FC = () => {
    const [briefing, setBriefing] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBriefing = async () => {
            setIsLoading(true);
            const response = await getAIBriefing();
            setBriefing(response);
            setIsLoading(false);
        };
        fetchBriefing();
    }, []);

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-2 text-[#00E5FF]">Your Morning Briefing</h2>
            {isLoading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
            ) : (
                <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: briefing.replace(/(\*|`)(.*?)\1/g, '<strong>$2</strong>') }}>
                </div>
            )}
        </Card>
    );
};

const MarketHoursView: React.FC<DashboardProps> = ({ navigateTo, watchlist }) => {
    const [selectedStock, setSelectedStock] = useState<Stock>(mockStocks[0]);
    const topBreakouts = [...mockStocks].sort((a, b) => b.breakoutScore - a.breakoutScore).slice(0, 5);

    const handleStockSelect = (stock: Stock) => {
        navigateTo('StockDetail', { symbol: stock.symbol });
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h2 className="text-xl font-semibold mb-1">{selectedStock.name} ({selectedStock.symbol})</h2>
                        <div className="flex items-baseline space-x-4 mb-4">
                             <p className="text-2xl font-mono">₹{selectedStock.price.toFixed(2)}</p>
                             <p className={`text-lg font-mono ${selectedStock.changePercent >= 0 ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
                                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                            </p>
                        </div>
                        <StockChart data={selectedStock.ohlcv} />
                    </Card>

                    <TechnicalAnalysisCard stock={selectedStock} />
                </div>

                <div className="lg:col-span-1 space-y-6 flex flex-col">
                    <Card className="flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">AI Breakout Radar</h2>
                        <div className="overflow-y-auto custom-scrollbar flex-grow">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-[#1A1F2A]">
                                    <tr className="text-left text-gray-400">
                                        <th className="p-3 font-semibold">Symbol</th>
                                        <th className="p-3 font-semibold text-right">Price</th>
                                        <th className="p-3 font-semibold text-right">Chg%</th>
                                        <th className="p-3 font-semibold text-right">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topBreakouts.map(stock => (
                                        <StockRow 
                                          key={stock.symbol} 
                                          stock={stock} 
                                          onSelect={() => setSelectedStock(stock)}
                                          isSelected={selectedStock.symbol === stock.symbol} 
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <WatchlistCard watchlist={watchlist} stocks={mockStocks} navigateTo={navigateTo} />
                </div>
            </div>
            
            <UpcomingEarningsCard navigateTo={navigateTo} />

             <Card>
                <h2 className="text-xl font-semibold mb-4">Featured Mutual Funds</h2>
                 <p className="text-sm text-gray-400 mb-6">Expense ratio visualization: a lower, greener bar is better.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {mockMutualFunds.map(fund => (
                        <div key={fund.name}>
                            <CandleMelt expenseRatio={fund.expenseRatio} />
                            <h3 className="font-semibold mt-3 text-sm">{fund.name}</h3>
                            <p className="text-xs text-gray-400">{fund.category}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const PostMarketView: React.FC = () => (
    <Card>
        <h2 className="text-xl font-semibold mb-2 text-center">Market Closed</h2>
        <div className="text-center bg-gray-800/50 p-6 rounded-lg">
            <h3 className="font-bold text-lg">Daily Digest</h3>
            <p className="text-gray-400 mt-2">Your portfolio changed by <span className="text-[#00D084] font-mono">+1.25%</span> today.</p>
            <p className="text-gray-400 mt-1">Top Gainer: <span className="font-semibold text-white">Reliance Industries</span></p>
            <p className="text-gray-400 mt-1">Check back tomorrow for a new AI briefing!</p>
        </div>
    </Card>
);

const DashboardStateSwitcher: React.FC<{currentState: DashboardState, setState: (state: DashboardState) => void}> = ({currentState, setState}) => (
    <div className="flex justify-center mb-6">
        <div className="bg-[#1A1F2A] p-1 rounded-lg flex space-x-1">
            {(['Pre-Market', 'Market Hours', 'Post-Market'] as DashboardState[]).map(state => (
                <button 
                    key={state} 
                    onClick={() => setState(state)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${currentState === state ? 'text-[#00E5FF] bg-white/10' : 'text-[#E6EDF3]/70 hover:text-white hover:bg-white/5'}`}
                >
                    {state}
                </button>
            ))}
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ navigateTo, watchlist }) => {
    const [dashboardState, setDashboardState] = useState<DashboardState>('Market Hours');

    const renderContent = () => {
        switch (dashboardState) {
            case 'Pre-Market': return <AIBriefingCard />;
            case 'Market Hours': return <MarketHoursView navigateTo={navigateTo} watchlist={watchlist} />;
            case 'Post-Market': return <PostMarketView />;
            default: return <MarketHoursView navigateTo={navigateTo} watchlist={watchlist} />;
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Market Dashboard</h1>
                <p className="text-gray-400">An intelligent overview of your investment world.</p>
            </div>
            
            <DashboardStateSwitcher currentState={dashboardState} setState={setDashboardState} />

            {renderContent()}
        </div>
    );
};