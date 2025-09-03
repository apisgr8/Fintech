// services/analysisService.ts
import type { Stock, StockAnalysis, TechnicalScores, FundamentalScores, ValuationSnapshot, HorizonScenario } from '../types';
import * as indicators from '../utils/indicators';

// Heuristic-based scoring functions, ported from the provided logic.
const computeTechnicalScores = (stock: Stock): TechnicalScores => {
    const closes = stock.ohlcv.map(d => d.close);
    const rsi = indicators.rsi14(closes);
    const macdResult = indicators.macd(closes);
    const atr = indicators.atr14(stock.ohlcv);
    const bollingerResult = indicators.bollinger(closes);
    const avg20Vol = stock.ohlcv.slice(-20).reduce((acc, d) => acc + (d.volume || 0), 0) / 20;


    let shortMomentum = 0;
    shortMomentum += (rsi > 60 ? 25 : (rsi > 40 ? 10 : 0));
    shortMomentum += macdResult.hist > 0 ? 20 : 0;
    shortMomentum += indicators.isSqueezePresent(bollingerResult.bandwidth) ? 10 : 0;
    // Mock OBV slope and ADX
    const obvSlope = macdResult.hist > 0 ? 'up' : 'down';
    if (obvSlope === 'up') shortMomentum += 10;
    const adx = Math.abs(macdResult.hist) > 2 ? 30 : 15;
    
    let mediumTrend = 0;
    const emaAlignment = stock.indicators.ema20 > stock.indicators.ema50;
    mediumTrend += emaAlignment ? 25 : 0;
    mediumTrend += adx >= 25 ? 25 : (adx >= 20 ? 15 : 0);
    // Mock Supertrend and RS
    const supertrendBullish = emaAlignment;
    if (supertrendBullish) mediumTrend += 15;
    const rsPositive = emaAlignment;
    if (rsPositive) mediumTrend += 15;

    let breakoutProb = 50;
    if(stock.ohlcv.slice(-1)[0].isBreakout) breakoutProb += 25;
    if(emaAlignment) breakoutProb += 10;
    if(rsi > 60) breakoutProb += 10;
    if(macdResult.hist > 0) breakoutProb += 5;


    return {
        shortMomentum: Math.min(100, shortMomentum),
        mediumTrend: Math.min(100, mediumTrend),
        emaAlignment,
        adx,
        rsi,
        macdAboveZero: macdResult.macd > 0,
        bbSqueeze: indicators.isSqueezePresent(bollingerResult.bandwidth),
        obvSlope,
        supertrendBullish,
        rsPositive,
        atrPct: (atr / stock.price) * 100,
        breakoutStatus: stock.ohlcv.slice(-1)[0].isBreakout ? 'Breakout' : 'Base',
        breakoutProb: Math.min(95, Math.max(10, breakoutProb)),
        resistance: Math.max(...stock.ohlcv.slice(-20).map(d => d.high)),
        avg20Vol,
    };
};

const computeFundamentalScores = (stock: Stock): FundamentalScores => {
    const { roe, deRatio, peRatio, profitGrowth3Y, sectorPE, historicalPE } = stock.fundamentals;
    const quality = (roe > 15 ? 80 : 50) + (deRatio < 1.5 ? 20 : 0);
    const growth = Math.min(100, profitGrowth3Y * 3);
    const value = (peRatio < sectorPE ? 70 : 40) + (peRatio < historicalPE ? 30 : 0);
    const stability = deRatio < 1 ? 90 : (deRatio < 2.5 ? 60 : 30);
    const peg = peRatio / profitGrowth3Y;

    return {
        quality: Math.round(quality),
        growth: Math.round(growth),
        value: Math.round(value),
        stability: Math.round(stability),
        roe,
        roce: roe, // Mocking ROCE as ROE
        salesCagr5Y: stock.fundamentals.salesGrowth3Y,
        profitCagr5Y: stock.fundamentals.profitGrowth3Y,
        epsGrowth3Y: stock.fundamentals.epsGrowth3Y,
        pe: peRatio,
        pb: peRatio / roe, // Estimate
        peg,
        debtEquity: deRatio,
        interestCoverage: 5, // Mock
        fcfToNp: 1.1, // Mock
        marginStability: 0.9, // Mock
        valuationFlag: peg < 1 ? 'Undervalued' : peg < 2 ? 'Fair' : 'Expensive',
    };
};

const makeValuationSnapshot = (stock: Stock, fundamentalScores: FundamentalScores): ValuationSnapshot => {
    return {
        peVsSectorPct: (stock.fundamentals.peRatio / stock.fundamentals.sectorPE - 1) * 100,
        pbVsSectorPct: 0, // Mock
        peg: fundamentalScores.peg,
        flag: fundamentalScores.valuationFlag,
    };
};

const buildPlaybooks = (technicalScores: TechnicalScores, fundamentalScores: FundamentalScores): HorizonScenario[] => {
    const shortBias = technicalScores.shortMomentum > 65 ? 'bullish' : technicalScores.shortMomentum > 40 ? 'neutral' : 'cautious';
    const medBias = technicalScores.mediumTrend > 70 && fundamentalScores.quality > 65 ? 'bullish' : 'neutral';
    const longBias = fundamentalScores.quality > 70 && fundamentalScores.peg < 2.0 ? 'bullish' : 'neutral';

    const short: HorizonScenario = {
        horizon: 'short',
        bias: shortBias,
        conditions: ['Close above resistance with volume', 'ADX >= 25', 'RSI > 50'],
        entryStyles: ['Breakout close', 'Retest near breakout line'],
        stopExamples: [`${(technicalScores.atrPct * 1.5).toFixed(1)}% below entry`, 'Below recent swing low'],
        targetBands: ['Next Fibonacci level', 'Previous high'],
        invalidation: 'Close below breakout line with rising volume',
        monitoring: ['Price crossing key EMA', 'RSI dropping below 45'],
        confidence: Math.round(technicalScores.shortMomentum * 0.8 + 15),
    };

    const medium: HorizonScenario = {
        horizon: 'medium',
        bias: medBias,
        conditions: ['EMA20 > EMA50', 'MACD histogram positive', 'Consistent volume'],
        entryStyles: ['Pullback to 20-day EMA', 'Consolidation near support'],
        stopExamples: ['Close below 50-day EMA'],
        targetBands: ['52-week high', 'Major resistance zone'],
        invalidation: 'Break of the 50-day EMA and medium-term trend',
        monitoring: ['EMA crossover events', 'Quarterly earnings report'],
        confidence: Math.round(technicalScores.mediumTrend * 0.7 + fundamentalScores.quality * 0.2),
    };

    const long: HorizonScenario = {
        horizon: 'long',
        bias: longBias,
        conditions: ['ROE > 15%', 'Debt/Equity < 1.5', 'Consistent profit growth (>10%)'],
        entryStyles: ['Systematic Investment (SIP)', 'Accumulate on major market dips'],
        stopExamples: ['Fundamental thesis breaks (e.g., loss of market share)'],
        targetBands: ['Held for 3-5+ years based on business growth'],
        invalidation: 'Significant deterioration in company fundamentals',
        monitoring: ['Annual reports', 'Competitor landscape changes'],
        confidence: Math.round(fundamentalScores.quality * 0.6 + fundamentalScores.growth * 0.4),
    };

    return [short, medium, long];
};


export const generateStockAnalysis = (stock: Stock): StockAnalysis => {
    const technical = computeTechnicalScores(stock);
    const fundamental = computeFundamentalScores(stock);
    const valuation = makeValuationSnapshot(stock, fundamental);
    const scenarios = buildPlaybooks(technical, fundamental);

    return {
        symbol: stock.symbol,
        generatedAt: new Date(),
        technical,
        fundamental,
        valuation,
        scenarios,
    };
};
