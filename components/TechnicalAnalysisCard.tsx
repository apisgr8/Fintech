import React from 'react';
import { Card } from './Card';
import type { Stock } from '../types';
import { TrendPrism } from './TrendPrism';

// The "Momentum Gauge" for RSI, visualized as a vertical energy core.
const MomentumGauge: React.FC<{ value: number }> = ({ value }) => {
  const percentage = Math.min(100, Math.max(0, value));
  
  const getGradient = () => {
    if (value > 70) return 'from-amber-500/80 via-amber-400 to-yellow-300/80'; // Overbought
    if (value < 30) return 'from-cyan-500/80 via-cyan-400 to-blue-400/80'; // Oversold
    return 'from-gray-400/80 via-gray-300 to-white/80'; // Neutral
  };

  return (
    <div className="flex flex-col items-center">
        <div className="w-10 h-32 bg-gray-800/50 rounded-md flex items-end overflow-hidden border border-white/10">
            <div
                className={`w-full rounded-t-md bg-gradient-to-t ${getGradient()}`}
                style={{ height: `${percentage}%`, transition: 'height 0.7s ease-out, background 0.7s' }}
            >
                <div className="w-full h-full opacity-50 bg-white/30 animate-pulse" style={{animationDuration: '3s'}} />
            </div>
        </div>
    </div>
  );
};


export const TechnicalAnalysisCard: React.FC<{ stock: Stock }> = ({ stock }) => {
  if (!stock.indicators) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-2">Technical Analysis</h3>
        <p className="text-sm text-gray-500">No indicator data available.</p>
      </Card>
    );
  }

  const { rsi, macd, ema20, ema50 } = stock.indicators;
  const isBreakoutDay = stock.ohlcv.some(d => d.isBreakout);
  const isGoldenCross = ema20 > ema50;

  const getSignalFusionSynopsis = () => {
      let confidence = 50;
      
      let rsiText = '';
      if (rsi > 70) {
        rsiText = 'Momentum is strong, but RSI indicates the stock may be overbought.';
        confidence += 5;
      } else if (rsi < 30) {
        rsiText = 'The stock is in oversold territory, suggesting a potential bounce.';
        confidence -= 5;
      } else {
        rsiText = 'RSI shows balanced momentum.';
      }

      let macdText = '';
      if (macd.histogram > 0) {
          macdText = 'A bullish MACD crossover is in effect, signaling positive momentum.';
          confidence += 15;
      } else {
          macdText = 'A bearish MACD trend is currently active.';
          confidence -= 15;
      }
      
      let emaText = '';
      if (isGoldenCross) {
          emaText = 'The stock is in a bullish trend, with the 20-day EMA above the 50-day EMA.';
          confidence += 20;
      } else {
          emaText = 'A bearish trend is indicated, with the 20-day EMA below the 50-day EMA.';
          confidence -= 20;
      }

      let breakoutText = '';
      if (isBreakoutDay) {
          breakoutText = 'This was confirmed by a recent high-volume breakout.';
          confidence += 25;
      }
      
      confidence = Math.min(98, Math.max(10, confidence + macd.histogram * 2));
      
      return {
          text: `${rsiText} ${macdText} ${emaText} ${breakoutText}`,
          confidence: Math.round(confidence)
      };
  };

  const synopsis = getSignalFusionSynopsis();

  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold mb-4 text-white">Intelligent Analysis Layer</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* RSI Momentum Gauge */}
        <div className="flex flex-col items-center text-center">
          <h4 className="font-semibold text-gray-300 mb-2">Momentum Gauge (RSI)</h4>
          <MomentumGauge value={rsi} />
           <span className="font-mono text-lg mt-2">{rsi.toFixed(2)}</span>
           <p className="text-xs text-gray-400">
                {rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
           </p>
        </div>

        {/* MACD Trend Prism */}
        <div className="flex flex-col items-center text-center">
           <h4 className="font-semibold text-gray-300 mb-2">Trend Prism (MACD)</h4>
           <TrendPrism macd={macd} />
           <p className="text-xs mt-2 text-gray-400">
             {macd.histogram > 0 ? "Bullish Momentum" : "Bearish Momentum"}
           </p>
        </div>

        {/* EMA Display */}
        <div className="flex flex-col items-center text-center">
            <h4 className="font-semibold text-gray-300 mb-2">Moving Averages (EMA)</h4>
            <div className="flex flex-col justify-center items-center h-full space-y-4 pt-4">
            <div>
                <p className="text-xs text-[#FFC400]">20-Day EMA</p>
                <p className="font-mono text-lg text-white">₹{ema20.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-xs text-[#A78BFA]">50-Day EMA</p>
                <p className="font-mono text-lg text-white">₹{ema50.toFixed(2)}</p>
            </div>
            <p className={`text-xs font-bold px-2 py-1 rounded ${isGoldenCross ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {isGoldenCross ? 'Bullish Trend' : 'Bearish Trend'}
            </p>
            </div>
        </div>
        
        {/* Signal Fusion Synopsis */}
        <div className="flex flex-col justify-center text-center md:text-left">
            <h4 className="font-semibold text-gray-300 mb-2">Signal Fusion Synopsis</h4>
            <p className="text-xs text-gray-400 italic mb-4">{synopsis.text}</p>
            <div className="text-center">
                 <p className="text-xs text-gray-400 uppercase tracking-wider">Breakout Confidence</p>
                 <p className="text-3xl font-bold text-[#00E5FF] glow-accent">{synopsis.confidence}%</p>
            </div>
        </div>

      </div>
    </Card>
  );
};