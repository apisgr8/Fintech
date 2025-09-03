export type Page = 'Dashboard' | 'Portfolio' | 'Copilot' | 'Search' | 'StockDetail';

export interface NavigationState {
  page: Page;
  params?: Record<string, any>;
}

export type DashboardState = 'Pre-Market' | 'Market Hours' | 'Post-Market';

export interface MacdData {
  macdLine: number;
  signalLine: number;
  histogram: number;
}

export interface StockIndicators {
  rsi: number;
  macd: MacdData;
  ema20: number;
  ema50: number;
}

export interface OhlcvData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  isBreakout?: boolean;
  breakoutVolumeMultiplier?: number;
  ema20?: number;
  ema50?: number;
}

export interface StockFundamentals {
    peRatio: number;
    roe: number;
    deRatio: number;
    salesGrowth3Y: number;
    profitGrowth3Y: number;
    epsGrowth3Y: number;
    sectorPE: number;
    historicalPE: number;
    promoterHolding: number;
}

export interface StockPeer {
    symbol: string;
    name: string;
    peRatio: number;
    roe: number;
    marketCap: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: number;
  breakoutScore: number;
  ohlcv: OhlcvData[];
  indicators: StockIndicators;
  fundamentals: StockFundamentals;
  peers: StockPeer[];
  earningsDate?: string; // e.g., '2024-08-15'
}

export interface MutualFund {
  name: string;
  category: string;
  expenseRatio: number;
  returns: {
    '1Y': number;
    '3Y': number;
    '5Y': number;
  };
}

export interface PortfolioHolding {
  name: string;
  symbol: string;
  type: 'Stock' | 'Mutual Fund';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

export interface PortfolioAllocation {
    name: string;
    value: number;
}

export interface CopilotMessage {
    sender: 'user' | 'ai';
    text: string;
}

export type Watchlist = string[]; // Array of stock symbols

// START: New types for Analysis Module
export interface TechnicalScores {
  shortMomentum: number; // 0-100
  mediumTrend: number; // 0-100
  emaAlignment: boolean;
  adx: number;
  rsi: number;
  macdAboveZero: boolean;
  bbSqueeze: boolean;
  obvSlope: 'up' | 'down' | 'flat';
  supertrendBullish: boolean;
  rsPositive: boolean;
  atrPct: number;
  breakoutStatus: 'Base' | 'Breakout' | 'Retest' | 'Trend';
  breakoutProb: number; // 0-100
  resistance: number;
  avg20Vol: number;
  lastBreakoutTs?: Date;
}

export interface FundamentalScores {
  quality: number; // 0-100
  growth: number; // 0-100
  value: number; // 0-100
  stability: number; // 0-100
  roe: number;
  roce: number;
  salesCagr5Y: number;
  profitCagr5Y: number;
  epsGrowth3Y: number;
  pe: number;
  pb: number;
  peg: number;
  debtEquity: number;
  interestCoverage: number;
  fcfToNp: number;
  marginStability: number;
  valuationFlag: 'Undervalued' | 'Fair' | 'Expensive';
}

export interface ValuationSnapshot {
  peVsSectorPct: number;
  pbVsSectorPct: number;
  peg: number;
  flag: 'Undervalued' | 'Fair' | 'Expensive';
}

export interface HorizonScenario {
  horizon: 'short' | 'medium' | 'long';
  bias: 'bullish' | 'neutral' | 'cautious';
  conditions: string[];
  entryStyles: string[];
  stopExamples: string[];
  targetBands: string[];
  invalidation: string;
  monitoring: string[];
  confidence: number;
}

export interface StockAnalysis {
  symbol: string;
  generatedAt: Date;
  technical: TechnicalScores;
  fundamental: FundamentalScores;
  valuation: ValuationSnapshot;
  scenarios: HorizonScenario[];
}
// END: New types for Analysis Module
