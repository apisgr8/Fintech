import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Card } from '../components/Card';
import { StockChart } from '../components/StockChart';
import { TechnicalAnalysisCard } from '../components/TechnicalAnalysisCard';
import { getStockBySymbol } from '../services/mockDataService';
import { generateStockAnalysis } from '../services/analysisService';
import type { Page, Stock, Watchlist, StockAnalysis, HorizonScenario } from '../types';

interface StockDetailProps {
  symbol: string;
  navigateTo: (page: Page, params?: Record<string, any>) => void;
  watchlist: Watchlist;
  toggleWatchlist: (symbol: string) => void;
}

type AIVerdict = 'Bullish Momentum' | 'Accumulation Phase' | 'Fairly Valued' | 'Overextended' | 'Under Pressure';

const getAIVerdict = (stock: Stock): { verdict: AIVerdict; color: string } => {
    const { rsi, ema20, ema50, macd } = stock.indicators;
    const { peRatio, historicalPE } = stock.fundamentals;

    if (rsi > 70 && ema20 > ema50 && macd.histogram > 0) {
        if (rsi > 75) return { verdict: 'Overextended', color: 'amber' };
        return { verdict: 'Bullish Momentum', color: 'green' };
    }
    if (rsi < 40 && Math.abs(stock.price - ema50) / ema50 < 0.05) {
        return { verdict: 'Accumulation Phase', color: 'blue' };
    }
    if (ema20 < ema50 && macd.histogram < 0) {
        return { verdict: 'Under Pressure', color: 'red' };
    }
    if (Math.abs(peRatio - historicalPE) / historicalPE < 0.1) {
        return { verdict: 'Fairly Valued', color: 'gray' };
    }
    return { verdict: 'Fairly Valued', color: 'gray' };
};

const AIVerdictTag: React.FC<{ stock: Stock }> = ({ stock }) => {
    const { verdict, color } = getAIVerdict(stock);
    const colorClasses = {
        green: 'bg-green-500/20 text-green-300 border-green-500/50',
        blue: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
        gray: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        red: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return (
        <div className={`px-4 py-1.5 text-sm font-semibold rounded-full border ${colorClasses[color]} inline-block`}>
            {verdict}
        </div>
    );
};

const ValuationMeter: React.FC<{ stock: Stock }> = ({ stock }) => {
    const { peRatio, sectorPE, historicalPE } = stock.fundamentals;
    const min = Math.min(peRatio, sectorPE, historicalPE) * 0.8;
    const max = Math.max(peRatio, sectorPE, historicalPE) * 1.2;
    const range = max - min;
    const position = ((peRatio - min) / range) * 100;

    return (
        <div>
            <h4 className="font-semibold text-gray-300 mb-2 text-center">Valuation Meter (P/E Ratio)</h4>
            <div className="relative h-2 bg-gray-700 rounded-full my-4">
                <div className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" style={{ width: '100%' }}></div>
                {/* Needle */}
                <div className="absolute top-[-4px] w-1 h-4 bg-white rounded-full" style={{ left: `calc(${position}% - 2px)` }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>Undervalued</span>
                <span>Overvalued</span>
            </div>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Current P/E:</span> <span className="font-mono">{peRatio.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Sector Average:</span> <span className="font-mono">{sectorPE.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Historical Average:</span> <span className="font-mono">{historicalPE.toFixed(2)}</span></div>
            </div>
        </div>
    );
};

const QualityGrowthRadials: React.FC<{ stock: Stock }> = ({ stock }) => {
    const { roe, deRatio, promoterHolding, salesGrowth3Y, profitGrowth3Y, epsGrowth3Y } = stock.fundamentals;
    
    // Normalize data for better visualization. Higher is better for all metrics here.
    const qualityData = [
        { subject: 'ROE', value: roe, fullMark: 50 },
        { subject: 'Debt/Equity', value: (1 / (deRatio + 0.1)) * 10, fullMark: 10 }, // Inverse D/E
        { subject: 'Promoters', value: promoterHolding, fullMark: 100 },
    ];
    const growthData = [
        { subject: 'Sales', value: salesGrowth3Y, fullMark: 50 },
        { subject: 'Profit', value: profitGrowth3Y, fullMark: 50 },
        { subject: 'EPS', value: epsGrowth3Y, fullMark: 50 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
                <h4 className="font-semibold text-gray-300 mb-2">Quality Radial</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={qualityData}>
                        <PolarGrid stroke="#4A5568" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                        <Radar name="Quality" dataKey="value" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center">
                <h4 className="font-semibold text-gray-300 mb-2">Growth Radial</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={growthData}>
                        <PolarGrid stroke="#4A5568" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                        <Radar name="Growth" dataKey="value" stroke="#00D084" fill="#00D084" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const PeerBattleground: React.FC<{ stock: Stock }> = ({ stock }) => {
    const [metric, setMetric] = useState<'peRatio' | 'roe' | 'marketCap'>('peRatio');
    const data = [stock, ...stock.peers];
    const unit = metric === 'marketCap' ? 'Cr' : '';

    return (
        <div>
            <h4 className="font-semibold text-gray-300 mb-2 text-center">Peer Battleground</h4>
            <div className="text-center my-4">
                <select value={metric} onChange={e => setMetric(e.target.value as any)} className="bg-[#1A1F2A] border border-white/20 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5FF]">
                    <option value="peRatio">P/E Ratio</option>
                    <option value="roe">Return on Equity (%)</option>
                    <option value="marketCap">Market Cap (Cr)</option>
                </select>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" stroke="#A0AEC0" fontSize={12} domain={[0, 'dataMax + 10']} />
                    <YAxis type="category" dataKey="symbol" stroke="#A0AEC0" fontSize={12} width={80} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ backgroundColor: '#0B0F14', border: '1px solid #4A5568' }} />
                    <Bar dataKey={metric} name={metric.replace(/([A-Z])/g, ' $1').toUpperCase()} unit={unit}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.symbol === stock.symbol ? '#00E5FF' : '#4A5568'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const FundamentalScoresDisplay: React.FC<{ analysis: StockAnalysis }> = ({ analysis }) => {
    const { quality, growth, value } = analysis.fundamental;
    const scores = [
        { name: 'Quality', score: quality, color: 'bg-cyan-500' },
        { name: 'Growth', score: growth, color: 'bg-green-500' },
        { name: 'Value', score: value, color: 'bg-amber-500' },
    ];
    return (
        <div>
            <h4 className="font-semibold text-gray-300 mb-4 text-center">Fundamental Scores</h4>
            <div className="space-y-4">
                {scores.map(item => (
                    <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-gray-300">{item.name}</span>
                            <span className="font-mono text-white">{item.score}/100</span>
                        </div>
                        <div className="h-2 w-full bg-gray-700 rounded-full">
                            <div className={`h-2 ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.score}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlaybookCard: React.FC<{ scenario: HorizonScenario }> = ({ scenario }) => {
    const biasColors = {
        bullish: 'text-green-300',
        neutral: 'text-gray-300',
        cautious: 'text-amber-300',
    };
    const icon = {
        short: '⚡️',
        medium: '📈',
        long: '🌳'
    };
    return (
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
            <h4 className={`font-bold ${biasColors[scenario.bias]} flex items-center`}>
                <span className="text-xl mr-2">{icon[scenario.horizon]}</span>
                <span>For the {scenario.horizon === 'short' ? 'Short-Term Trader' : scenario.horizon === 'medium' ? 'Medium-Term Swing' : 'Long-Term Investor'}</span>
            </h4>
            <div className="mt-3 text-sm text-gray-300 space-y-3">
                <p><strong>Bias:</strong> <span className={`font-semibold ${biasColors[scenario.bias]}`}>{scenario.bias.charAt(0).toUpperCase() + scenario.bias.slice(1)}</span> (Confidence: {scenario.confidence}%)</p>
                <div><strong>Conditions:</strong><ul className="list-disc list-inside pl-2 text-gray-400 text-xs space-y-1"> {scenario.conditions.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
                <div><strong>Entry Styles:</strong><ul className="list-disc list-inside pl-2 text-gray-400 text-xs space-y-1"> {scenario.entryStyles.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
                <div><strong>Risk / Invalidation:</strong> <p className="text-gray-400 text-xs pl-2">{scenario.invalidation}</p></div>
                 <div><strong>Monitoring:</strong><ul className="list-disc list-inside pl-2 text-gray-400 text-xs space-y-1"> {scenario.monitoring.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            </div>
        </div>
    );
};

const AIStrategicPlaybooks: React.FC<{ analysis: StockAnalysis }> = ({ analysis }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4 text-center">AI Strategic Playbooks</h3>
            <div className="space-y-4">
                {analysis.scenarios.map(scenario => (
                    <PlaybookCard key={scenario.horizon} scenario={scenario} />
                ))}
            </div>
        </Card>
    );
};


export const StockDetail: React.FC<StockDetailProps> = ({ symbol, watchlist, toggleWatchlist }) => {
  const stock = getStockBySymbol(symbol);

  const analysis = useMemo(() => {
    if (stock) {
      return generateStockAnalysis(stock);
    }
    return null;
  }, [stock]);

  if (!stock || !analysis) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-red-500">Stock Not Found</h1>
        <p className="text-gray-400">The symbol "{symbol}" does not exist in our mock database.</p>
      </div>
    );
  }
  
  const isWatched = watchlist.includes(stock.symbol);

  return (
    <div className="space-y-8">
      {/* Module 1: Header & AI Verdict */}
      <div>
        <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white">{stock.name}</h1>
            <button 
                onClick={() => toggleWatchlist(stock.symbol)} 
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill={isWatched ? '#FFC400' : 'currentColor'}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        </div>
        <div className="flex items-center space-x-4 mt-2">
            <p className="text-lg text-gray-400">{stock.symbol}</p>
            <AIVerdictTag stock={stock} />
        </div>
         <div className="flex items-baseline space-x-4 mt-4">
            <p className="text-3xl font-mono">₹{stock.price.toFixed(2)}</p>
            <p className={`text-xl font-mono ${stock.changePercent >= 0 ? 'text-[#00D084]' : 'text-[#FF5252]'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </p>
        </div>
      </div>
      
      {/* Module 2: Technical Analysis "Cockpit" */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Technical Cockpit</h3>
        <StockChart data={stock.ohlcv} />
      </Card>
      <TechnicalAnalysisCard stock={stock} />

      {/* Module 3: Fundamental Analysis "Health Scan" */}
      <Card>
          <h3 className="text-xl font-semibold mb-6 text-center">Fundamental Health Scan</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 space-y-8">
                  <FundamentalScoresDisplay analysis={analysis} />
                  <ValuationMeter stock={stock} />
              </div>
              <div className="lg:col-span-2">
                  <QualityGrowthRadials stock={stock} />
              </div>
          </div>
          <div className="mt-8">
            <PeerBattleground stock={stock} />
          </div>
      </Card>

      {/* Module 4: The "Strategic Outlook" AI Recommendation Engine */}
      <AIStrategicPlaybooks analysis={analysis} />

    </div>
  );
};