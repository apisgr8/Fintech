import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../components/Card';
import { getMockData } from '../services/mockDataService';
import type { PortfolioHolding, PortfolioAllocation } from '../types';

const COLORS = ['#00E5FF', '#00D084', '#FFC400', '#FF5252'];

const PortfolioAura: React.FC<{ pnlPercent: number, diversificationScore: number }> = ({ pnlPercent, diversificationScore }) => {
    // Determine color based on P&L
    const getAuraColor = () => {
        if (pnlPercent > 1) return 'rgba(0, 208, 132, 0.7)'; // Green for profit
        if (pnlPercent < -1) return 'rgba(255, 82, 82, 0.7)'; // Red for loss
        return 'rgba(0, 229, 255, 0.7)'; // Blue for neutral
    };
    
    // Determine pulse speed based on diversification (higher score = more diverse = slower pulse)
    const pulseDuration = Math.max(1.5, 4 - diversificationScore * 2.5) + 's';

    const auraStyle: React.CSSProperties = {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: getAuraColor().replace('0.7', '0.2'),
        boxShadow: `0 0 25px 10px ${getAuraColor()}`,
        animationDuration: pulseDuration,
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div style={auraStyle} className="animate-pulse-aura" />
            <p className="text-xs text-center mt-4 text-gray-400">
                This aura represents your portfolio's real-time health.
            </p>
        </div>
    );
};


const SipTree: React.FC = () => (
    <div className="flex flex-col items-center p-4 rounded-lg bg-gray-800/30 h-full justify-center">
        <h3 className="text-lg font-semibold mb-4 text-center">Your SIP Growth Story</h3>
        <div className="relative w-24 h-40">
            {/* Trunk */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-16 bg-yellow-900/80 rounded-t-sm animate-pulse" style={{ animationDelay: '0s' }}></div>
            {/* Leaves */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-12 h-12 bg-green-500/50 rounded-full animate-ping opacity-75" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-green-400/50 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-300/50 rounded-full animate-ping opacity-50" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Visualizing the power of compounding with each SIP.</p>
    </div>
);


export const Portfolio: React.FC = () => {
    const { portfolioHoldings, portfolioAllocation } = getMockData();

    const totals = useMemo(() => {
        const totalInvestment = portfolioHoldings.reduce((acc, h) => acc + (h.avgPrice * h.quantity), 0);
        const currentValue = portfolioHoldings.reduce((acc, h) => acc + (h.currentPrice * h.quantity), 0);
        const pnl = currentValue - totalInvestment;
        const pnlPercent = (pnl / totalInvestment) * 100;

        // Calculate a mock diversification score (based on HHI index concept)
        // Lower HHI = more diversification. We normalize it to 0-1 range where 1 is highly diversified.
        const totalValue = portfolioAllocation.reduce((sum, asset) => sum + asset.value, 0);
        const hhi = portfolioAllocation.reduce((sum, asset) => sum + Math.pow(asset.value / totalValue, 2), 0);
        const diversificationScore = 1 - (hhi - 1/portfolioAllocation.length) / (1 - 1/portfolioAllocation.length); // Normalize to 0-1


        return { totalInvestment, currentValue, pnl, pnlPercent, diversificationScore };
    }, [portfolioHoldings, portfolioAllocation]);
    
    const HoldingRow: React.FC<{ holding: PortfolioHolding }> = ({ holding }) => {
        const investment = holding.avgPrice * holding.quantity;
        const currentValue = holding.currentPrice * holding.quantity;
        const pnl = currentValue - investment;
        const isPositive = pnl >= 0;
        return (
            <tr className="border-b border-gray-700/50">
                <td className="p-3">
                    <div className="font-bold">{holding.name}</div>
                    <div className="text-xs text-gray-400">{holding.type}</div>
                </td>
                <td className="p-3 font-mono text-right">₹{currentValue.toFixed(2)}</td>
                <td className={`p-3 font-mono text-right ${isPositive ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
                    {isPositive ? '+' : ''}₹{pnl.toFixed(2)}
                </td>
            </tr>
        );
    }
    
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-[#0B0F14]/80 p-2 border border-white/20 rounded-lg text-sm">
              <p className="font-bold">{`${payload[0].name}`}</p>
              <p className="text-white">{`Value: ${payload[0].value.toLocaleString('en-IN')}`}</p>
            </div>
          );
        }
        return null;
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
                <p className="text-gray-400">A unified view of your investments.</p>
            </div>
            
            <Card className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-1">
                    <PortfolioAura pnlPercent={totals.pnlPercent} diversificationScore={totals.diversificationScore} />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-400">Current Value</p>
                        <p className="text-2xl font-bold font-mono">₹{totals.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Total Investment</p>
                        <p className="text-2xl font-bold font-mono">₹{totals.totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Overall P&L</p>
                        <p className={`text-2xl font-bold font-mono ${totals.pnl >= 0 ? 'text-[#00D084] glow-success' : 'text-[#FF5252] glow-error'}`}>
                            {totals.pnl >= 0 ? '+' : ''}₹{totals.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400">Overall Return</p>
                        <p className={`text-2xl font-bold font-mono ${totals.pnl >= 0 ? 'text-[#00D084] glow-success' : 'text-[#FF5252] glow-error'}`}>
                            {totals.pnlPercent.toFixed(2)}%
                        </p>
                    </div>
                </div>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 flex flex-col">
                     <h2 className="text-xl font-semibold mb-4">Holdings</h2>
                    <div className="overflow-y-auto custom-scrollbar flex-grow">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-[#1A1F2A]">
                                <tr className="text-left text-gray-400">
                                    <th className="p-3 font-semibold">Name</th>
                                    <th className="p-3 font-semibold text-right">Current Value</th>
                                    <th className="p-3 font-semibold text-right">P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolioHoldings.map(h => <HoldingRow key={h.symbol} holding={h}/>)}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card>
                     <h2 className="text-xl font-semibold mb-4 text-center">Asset Allocation</h2>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={portfolioAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={5} cornerRadius={5}>
                                    {portfolioAllocation.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-xs mt-4">
                        {portfolioAllocation.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Card>
                <SipTree />
            </Card>
        </div>
    );
};