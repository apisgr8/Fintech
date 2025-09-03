import type { Stock, MutualFund, PortfolioHolding, PortfolioAllocation, OhlcvData } from '../types';

const generateOHLCV = (base: number, symbol: string): OhlcvData[] => {
  let price = base;
  const rawData: Omit<OhlcvData, 'ema20' | 'ema50'>[] = [];
  
  // Generate more historical data to properly calculate EMAs
  for (let i = 0; i < 80; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (80 - i));
    const open = price;
    const change = (Math.random() - 0.5) * (base * 0.03);
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * (base * 0.015);
    const low = Math.min(open, close) - Math.random() * (base * 0.015);
    price = close;
    rawData.push({ date: date.toISOString().split('T')[0], open, high, low, close });
  }

  // Calculate EMAs (mocked as SMAs for simplicity) and add to data
  const dataWithEmas: OhlcvData[] = rawData.map((d, i, arr) => {
    let ema20: number | undefined;
    let ema50: number | undefined;
    if (i >= 19) {
      const sum20 = arr.slice(i - 19, i + 1).reduce((acc, val) => acc + val.close, 0);
      ema20 = sum20 / 20;
    }
    if (i >= 49) {
      const sum50 = arr.slice(i - 49, i + 1).reduce((acc, val) => acc + val.close, 0);
      ema50 = sum50 / 50;
    }
    return { ...d, ema20, ema50 };
  });

  // Return only the last 30 days of data for the chart
  const finalData = dataWithEmas.slice(50);

  // Add a mock breakout event for Reliance
  if (symbol === 'RELIANCE.NS') {
    const breakoutIndex = finalData.length - 3;
    if (finalData[breakoutIndex]) {
        finalData[breakoutIndex].isBreakout = true;
        finalData[breakoutIndex].breakoutVolumeMultiplier = 3.5;
    }
  }

  // Create a bullish cross for INFY
  if (symbol === 'INFY.NS') {
    for (let i = finalData.length - 10; i < finalData.length; i++) {
      if (finalData[i].ema20 && finalData[i].ema50) {
        finalData[i].ema20 = finalData[i].ema50! * (1 + (i - (finalData.length - 11)) * 0.005);
      }
    }
  }

  // Create a bearish cross for HDFCBANK.NS
  if (symbol === 'HDFCBANK.NS') {
     for (let i = finalData.length - 10; i < finalData.length; i++) {
      if (finalData[i].ema20 && finalData[i].ema50) {
        finalData[i].ema20 = finalData[i].ema50! * (1 - (i - (finalData.length - 11)) * 0.005);
      }
    }
  }

  return finalData;
};

// Generate future date for earnings
const futureDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

const relianceOhlcv = generateOHLCV(2800, 'RELIANCE.NS');
const tcsOhlcv = generateOHLCV(3850, 'TCS.NS');
const hdfcOhlcv = generateOHLCV(1640, 'HDFCBANK.NS');
const infyOhlcv = generateOHLCV(1480, 'INFY.NS');
const iciciOhlcv = generateOHLCV(1130, 'ICICIBANK.NS');
const itcOhlcv = generateOHLCV(430, 'ITC.NS');
const ltOhlcv = generateOHLCV(3600, 'LT.NS');
const axisOhlcv = generateOHLCV(1150, 'AXISBANK.NS');
const hulOhlcv = generateOHLCV(2450, 'HUL.NS');
const sbinOhlcv = generateOHLCV(830, 'SBIN.NS');
const kotakOhlcv = generateOHLCV(1750, 'KOTAKBANK.NS');
const marutiOhlcv = generateOHLCV(12500, 'MARUTI.NS');
const tatamotorsOhlcv = generateOHLCV(980, 'TATAMOTORS.NS');
const sunpharmaOhlcv = generateOHLCV(1500, 'SUNPHARMA.NS');
const bhartiartlOhlcv = generateOHLCV(1350, 'BHARTIARTL.NS');
const wiproOhlcv = generateOHLCV(480, 'WIPRO.NS');
const hcltechOhlcv = generateOHLCV(1450, 'HCLTECH.NS');
const bajfinanceOhlcv = generateOHLCV(7000, 'BAJFINANCE.NS');
const tatasteelOhlcv = generateOHLCV(170, 'TATASTEEL.NS');
const asianpaintOhlcv = generateOHLCV(2900, 'ASIANPAINT.NS');
const ultracemcoOhlcv = generateOHLCV(10800, 'ULTRACEMCO.NS');


export const mockStocks: Stock[] = [
  { 
    symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: 2850.55, change: 45.10, changePercent: 1.61, volume: '6.5M', marketCap: 1928000, breakoutScore: 92, ohlcv: relianceOhlcv, 
    indicators: { rsi: 75.5, macd: { macdLine: 12.5, signalLine: 10.2, histogram: 2.3 }, ema20: relianceOhlcv.slice(-1)[0].ema20!, ema50: relianceOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 28.5, roe: 8.9, deRatio: 0.4, salesGrowth3Y: 15.2, profitGrowth3Y: 12.5, epsGrowth3Y: 11.8, sectorPE: 25.0, historicalPE: 26.0, promoterHolding: 50.3 },
    peers: [ { symbol: 'IOC.NS', name: 'Indian Oil Corp', peRatio: 5.5, roe: 21.0, marketCap: 235000 }, { symbol: 'BPCL.NS', name: 'Bharat Petroleum', peRatio: 4.8, roe: 25.5, marketCap: 132000 } ],
    earningsDate: futureDate(5)
  },
  { 
    symbol: 'TCS.NS', name: 'Tata Consultancy', price: 3825.90, change: -12.45, changePercent: -0.32, volume: '2.1M', marketCap: 1385000, breakoutScore: 78, ohlcv: tcsOhlcv,
    indicators: { rsi: 55.2, macd: { macdLine: 5.1, signalLine: 6.8, histogram: -1.7 }, ema20: tcsOhlcv.slice(-1)[0].ema20!, ema50: tcsOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 30.2, roe: 45.8, deRatio: 0.1, salesGrowth3Y: 18.5, profitGrowth3Y: 15.1, epsGrowth3Y: 14.9, sectorPE: 28.0, historicalPE: 32.0, promoterHolding: 72.3 },
    peers: [ { symbol: 'INFY.NS', name: 'Infosys', peRatio: 27.5, roe: 31.2, marketCap: 627000 }, { symbol: 'HCLTECH.NS', name: 'HCL Technologies', peRatio: 25.1, roe: 27.8, marketCap: 386000 } ],
    earningsDate: futureDate(12)
  },
  { 
    symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1650.20, change: 2.75, changePercent: 0.17, volume: '10.2M', marketCap: 1254000, breakoutScore: 65, ohlcv: hdfcOhlcv,
    indicators: { rsi: 45.8, macd: { macdLine: -2.3, signalLine: -1.1, histogram: -1.2 }, ema20: hdfcOhlcv.slice(-1)[0].ema20!, ema50: hdfcOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 21.0, roe: 17.2, deRatio: 1.8, salesGrowth3Y: 12.1, profitGrowth3Y: 18.5, epsGrowth3Y: 17.9, sectorPE: 19.5, historicalPE: 23.0, promoterHolding: 0 },
    peers: [ { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', peRatio: 20.5, roe: 18.5, marketCap: 785000 }, { symbol: 'SBIN.NS', name: 'State Bank of India', peRatio: 11.2, roe: 15.1, marketCap: 742000 } ]
  },
  { 
    symbol: 'INFY.NS', name: 'Infosys', price: 1510.75, change: 25.00, changePercent: 1.68, volume: '4.8M', marketCap: 627000, breakoutScore: 88, ohlcv: infyOhlcv,
    indicators: { rsi: 68.1, macd: { macdLine: 8.9, signalLine: 7.5, histogram: 1.4 }, ema20: infyOhlcv.slice(-1)[0].ema20!, ema50: infyOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 27.5, roe: 31.2, deRatio: 0.1, salesGrowth3Y: 20.3, profitGrowth3Y: 14.8, epsGrowth3Y: 14.5, sectorPE: 28.0, historicalPE: 29.0, promoterHolding: 15.1 },
    peers: [ { symbol: 'TCS.NS', name: 'Tata Consultancy', peRatio: 30.2, roe: 45.8, marketCap: 1385000 }, { symbol: 'WIPRO.NS', name: 'Wipro', peRatio: 22.8, roe: 16.5, marketCap: 254000 } ]
  },
  { 
    symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: 1120.40, change: -5.15, changePercent: -0.46, volume: '12.3M', marketCap: 785000, breakoutScore: 55, ohlcv: iciciOhlcv,
    indicators: { rsi: 28.4, macd: { macdLine: -4.5, signalLine: -4.0, histogram: -0.5 }, ema20: iciciOhlcv.slice(-1)[0].ema20!, ema50: iciciOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 20.5, roe: 18.5, deRatio: 2.1, salesGrowth3Y: 14.2, profitGrowth3Y: 25.1, epsGrowth3Y: 24.8, sectorPE: 19.5, historicalPE: 22.0, promoterHolding: 0 },
    peers: [ { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', peRatio: 21.0, roe: 17.2, marketCap: 1254000 }, { symbol: 'AXISBANK.NS', name: 'Axis Bank', peRatio: 15.6, roe: 14.8, marketCap: 378000 } ]
  },
  {
    symbol: 'ITC.NS', name: 'ITC Limited', price: 435.10, change: 2.50, changePercent: 0.58, volume: '15.1M', marketCap: 543000, breakoutScore: 72, ohlcv: itcOhlcv,
    indicators: { rsi: 60.3, macd: { macdLine: 1.2, signalLine: 0.8, histogram: 0.4 }, ema20: itcOhlcv.slice(-1)[0].ema20!, ema50: itcOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 25.5, roe: 29.8, deRatio: 0.0, salesGrowth3Y: 10.5, profitGrowth3Y: 12.1, epsGrowth3Y: 11.9, sectorPE: 27.0, historicalPE: 24.0, promoterHolding: 0 },
    peers: [ { symbol: 'HUL.NS', name: 'Hindustan Unilever', peRatio: 56.7, roe: 20.1, marketCap: 586000 } ],
    earningsDate: futureDate(8)
  },
  {
    symbol: 'LT.NS', name: 'Larsen & Toubro', price: 3580.00, change: 40.10, changePercent: 1.13, volume: '1.8M', marketCap: 495000, breakoutScore: 85, ohlcv: ltOhlcv,
    indicators: { rsi: 71.2, macd: { macdLine: 25.0, signalLine: 22.1, histogram: 2.9 }, ema20: ltOhlcv.slice(-1)[0].ema20!, ema50: ltOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 35.1, roe: 15.2, deRatio: 1.2, salesGrowth3Y: 14.8, profitGrowth3Y: 10.5, epsGrowth3Y: 10.2, sectorPE: 40.0, historicalPE: 33.0, promoterHolding: 0 },
    peers: [ { symbol: 'IRB.NS', name: 'IRB Infrastructure', peRatio: 18.2, roe: 8.5, marketCap: 40000 } ],
    earningsDate: futureDate(15)
  },
  {
    symbol: 'AXISBANK.NS', name: 'Axis Bank', price: 1155.60, change: -8.20, changePercent: -0.70, volume: '7.2M', marketCap: 378000, breakoutScore: 48, ohlcv: axisOhlcv,
    indicators: { rsi: 48.5, macd: { macdLine: -3.1, signalLine: -2.5, histogram: -0.6 }, ema20: axisOhlcv.slice(-1)[0].ema20!, ema50: axisOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 15.6, roe: 14.8, deRatio: 2.5, salesGrowth3Y: 11.5, profitGrowth3Y: 40.2, epsGrowth3Y: 39.8, sectorPE: 19.5, historicalPE: 18.0, promoterHolding: 0 },
    peers: [ { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', peRatio: 20.5, roe: 18.5, marketCap: 785000 } ],
  },
  {
    symbol: 'HUL.NS', name: 'Hindustan Unilever', price: 2445.00, change: 15.20, changePercent: 0.62, volume: '1.5M', marketCap: 574000, breakoutScore: 60, ohlcv: hulOhlcv,
    indicators: { rsi: 51.0, macd: { macdLine: -5.0, signalLine: -7.1, histogram: 2.1 }, ema20: hulOhlcv.slice(-1)[0].ema20!, ema50: hulOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 56.7, roe: 20.1, deRatio: 0.0, salesGrowth3Y: 12.0, profitGrowth3Y: 9.0, epsGrowth3Y: 8.8, sectorPE: 45.0, historicalPE: 60.0, promoterHolding: 61.9 },
    peers: [ { symbol: 'ITC.NS', name: 'ITC Limited', peRatio: 25.5, roe: 29.8, marketCap: 543000 } ],
  },
  {
    symbol: 'SBIN.NS', name: 'State Bank of India', price: 835.50, change: 10.80, changePercent: 1.31, volume: '18.5M', marketCap: 745000, breakoutScore: 75, ohlcv: sbinOhlcv,
    indicators: { rsi: 65.2, macd: { macdLine: 15.2, signalLine: 13.1, histogram: 2.1 }, ema20: sbinOhlcv.slice(-1)[0].ema20!, ema50: sbinOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 11.2, roe: 15.1, deRatio: 1.5, salesGrowth3Y: 8.0, profitGrowth3Y: 22.0, epsGrowth3Y: 21.5, sectorPE: 19.5, historicalPE: 10.0, promoterHolding: 57.5 },
    peers: [ { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', peRatio: 21.0, roe: 17.2, marketCap: 1254000 } ],
  },
  {
    symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', price: 1760.00, change: -20.40, changePercent: -1.15, volume: '5.6M', marketCap: 349000, breakoutScore: 40, ohlcv: kotakOhlcv,
    indicators: { rsi: 38.1, macd: { macdLine: -18.0, signalLine: -15.2, histogram: -2.8 }, ema20: kotakOhlcv.slice(-1)[0].ema20!, ema50: kotakOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 22.5, roe: 14.1, deRatio: 1.2, salesGrowth3Y: 10.2, profitGrowth3Y: 16.5, epsGrowth3Y: 16.0, sectorPE: 19.5, historicalPE: 25.0, promoterHolding: 25.9 },
    peers: [ { symbol: 'AXISBANK.NS', name: 'Axis Bank', peRatio: 15.6, roe: 14.8, marketCap: 378000 } ],
  },
  {
    symbol: 'MARUTI.NS', name: 'Maruti Suzuki India', price: 12550.00, change: 150.00, changePercent: 1.21, volume: '0.5M', marketCap: 395000, breakoutScore: 82, ohlcv: marutiOhlcv,
    indicators: { rsi: 69.5, macd: { macdLine: 250, signalLine: 220, histogram: 30 }, ema20: marutiOhlcv.slice(-1)[0].ema20!, ema50: marutiOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 30.5, roe: 14.5, deRatio: 0.1, salesGrowth3Y: 18.0, profitGrowth3Y: 25.0, epsGrowth3Y: 24.5, sectorPE: 35.0, historicalPE: 32.0, promoterHolding: 56.4 },
    peers: [ { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', peRatio: 16.2, roe: 18.2, marketCap: 325000 } ],
  },
  {
    symbol: 'TATAMOTORS.NS', name: 'Tata Motors', price: 975.00, change: 8.50, changePercent: 0.88, volume: '25.5M', marketCap: 325000, breakoutScore: 78, ohlcv: tatamotorsOhlcv,
    indicators: { rsi: 64.1, macd: { macdLine: 12.0, signalLine: 10.0, histogram: 2.0 }, ema20: tatamotorsOhlcv.slice(-1)[0].ema20!, ema50: tatamotorsOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 16.2, roe: 18.2, deRatio: 1.1, salesGrowth3Y: 22.0, profitGrowth3Y: 30.0, epsGrowth3Y: 29.8, sectorPE: 35.0, historicalPE: 20.0, promoterHolding: 46.4 },
    peers: [ { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', peRatio: 25.1, roe: 16.8, marketCap: 289000 } ],
    earningsDate: futureDate(18)
  },
  {
    symbol: 'SUNPHARMA.NS', name: 'Sun Pharma', price: 1505.00, change: -10.00, changePercent: -0.66, volume: '2.2M', marketCap: 361000, breakoutScore: 52, ohlcv: sunpharmaOhlcv,
    indicators: { rsi: 49.2, macd: { macdLine: 5.0, signalLine: 7.0, histogram: -2.0 }, ema20: sunpharmaOhlcv.slice(-1)[0].ema20!, ema50: sunpharmaOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 38.2, roe: 15.8, deRatio: 0.2, salesGrowth3Y: 12.5, profitGrowth3Y: 14.0, epsGrowth3Y: 13.8, sectorPE: 40.0, historicalPE: 35.0, promoterHolding: 54.5 },
    peers: [ { symbol: 'CIPLA.NS', name: 'Cipla', peRatio: 33.1, roe: 14.2, marketCap: 110000 } ],
  },
  {
    symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', price: 1340.00, change: 25.00, changePercent: 1.90, volume: '8.1M', marketCap: 755000, breakoutScore: 90, ohlcv: bhartiartlOhlcv,
    indicators: { rsi: 72.8, macd: { macdLine: 30.0, signalLine: 25.0, histogram: 5.0 }, ema20: bhartiartlOhlcv.slice(-1)[0].ema20!, ema50: bhartiartlOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 65.1, roe: 10.5, deRatio: 2.5, salesGrowth3Y: 19.0, profitGrowth3Y: 45.0, epsGrowth3Y: 44.5, sectorPE: 50.0, historicalPE: 60.0, promoterHolding: 53.5 },
    peers: [ { symbol: 'RELIANCE.NS', name: 'Reliance Industries', peRatio: 28.5, roe: 8.9, marketCap: 1928000 } ],
  },
  {
    symbol: 'WIPRO.NS', name: 'Wipro', price: 490.00, change: 5.00, changePercent: 1.03, volume: '9.5M', marketCap: 254000, breakoutScore: 68, ohlcv: wiproOhlcv,
    indicators: { rsi: 58.2, macd: { macdLine: 4.0, signalLine: 3.0, histogram: 1.0 }, ema20: wiproOhlcv.slice(-1)[0].ema20!, ema50: wiproOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 22.8, roe: 16.5, deRatio: 0.3, salesGrowth3Y: 15.0, profitGrowth3Y: 8.0, epsGrowth3Y: 7.8, sectorPE: 28.0, historicalPE: 25.0, promoterHolding: 72.9 },
    peers: [ { symbol: 'INFY.NS', name: 'Infosys', peRatio: 27.5, roe: 31.2, marketCap: 627000 } ],
  },
  {
    symbol: 'HCLTECH.NS', name: 'HCL Technologies', price: 1440.00, change: -15.00, changePercent: -1.03, volume: '3.1M', marketCap: 386000, breakoutScore: 55, ohlcv: hcltechOhlcv,
    indicators: { rsi: 47.1, macd: { macdLine: -10.0, signalLine: -8.0, histogram: -2.0 }, ema20: hcltechOhlcv.slice(-1)[0].ema20!, ema50: hcltechOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 25.1, roe: 27.8, deRatio: 0.1, salesGrowth3Y: 14.0, profitGrowth3Y: 12.0, epsGrowth3Y: 11.8, sectorPE: 28.0, historicalPE: 26.0, promoterHolding: 60.7 },
    peers: [ { symbol: 'TCS.NS', name: 'Tata Consultancy', peRatio: 30.2, roe: 45.8, marketCap: 1385000 } ],
  },
  {
    symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', price: 7100.00, change: 100.00, changePercent: 1.43, volume: '1.2M', marketCap: 440000, breakoutScore: 70, ohlcv: bajfinanceOhlcv,
    indicators: { rsi: 60.5, macd: { macdLine: 80.0, signalLine: 60.0, histogram: 20.0 }, ema20: bajfinanceOhlcv.slice(-1)[0].ema20!, ema50: bajfinanceOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 35.5, roe: 23.5, deRatio: 3.5, salesGrowth3Y: 25.0, profitGrowth3Y: 30.0, epsGrowth3Y: 29.5, sectorPE: 30.0, historicalPE: 40.0, promoterHolding: 54.8 },
    peers: [ { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv', peRatio: 32.1, roe: 20.1, marketCap: 250000 } ],
  },
  {
    symbol: 'TATASTEEL.NS', name: 'Tata Steel', price: 175.00, change: 3.50, changePercent: 2.04, volume: '50.1M', marketCap: 218000, breakoutScore: 88, ohlcv: tatasteelOhlcv,
    indicators: { rsi: 70.8, macd: { macdLine: 2.5, signalLine: 2.0, histogram: 0.5 }, ema20: tatasteelOhlcv.slice(-1)[0].ema20!, ema50: tatasteelOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 45.1, roe: 5.2, deRatio: 0.8, salesGrowth3Y: 8.0, profitGrowth3Y: -10.0, epsGrowth3Y: -11.0, sectorPE: 15.0, historicalPE: 10.0, promoterHolding: 33.6 },
    peers: [ { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', peRatio: 25.8, roe: 12.5, marketCap: 225000 } ],
  },
  {
    symbol: 'ASIANPAINT.NS', name: 'Asian Paints', price: 2900.00, change: -30.00, changePercent: -1.02, volume: '1.8M', marketCap: 278000, breakoutScore: 45, ohlcv: asianpaintOhlcv,
    indicators: { rsi: 44.5, macd: { macdLine: -20.0, signalLine: -15.0, histogram: -5.0 }, ema20: asianpaintOhlcv.slice(-1)[0].ema20!, ema50: asianpaintOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 55.2, roe: 28.5, deRatio: 0.1, salesGrowth3Y: 16.0, profitGrowth3Y: 18.0, epsGrowth3Y: 17.8, sectorPE: 50.0, historicalPE: 65.0, promoterHolding: 52.6 },
    peers: [ { symbol: 'BERGEPAINT.NS', name: 'Berger Paints', peRatio: 58.1, roe: 20.2, marketCap: 55000 } ],
  },
  {
    symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', price: 10850.00, change: 120.00, changePercent: 1.12, volume: '0.4M', marketCap: 313000, breakoutScore: 76, ohlcv: ultracemcoOhlcv,
    indicators: { rsi: 66.2, macd: { macdLine: 150, signalLine: 120, histogram: 30 }, ema20: ultracemcoOhlcv.slice(-1)[0].ema20!, ema50: ultracemcoOhlcv.slice(-1)[0].ema50! },
    fundamentals: { peRatio: 33.8, roe: 14.8, deRatio: 0.3, salesGrowth3Y: 15.0, profitGrowth3Y: 10.0, epsGrowth3Y: 9.8, sectorPE: 30.0, historicalPE: 35.0, promoterHolding: 59.9 },
    peers: [ { symbol: 'GRASIM.NS', name: 'Grasim Industries', peRatio: 20.5, roe: 8.5, marketCap: 160000 } ],
  }
];

export const mockMutualFunds: MutualFund[] = [
  { name: 'Parag Parikh Flexi Cap Fund', category: 'Flexi Cap', expenseRatio: 0.64, returns: { '1Y': 38.5, '3Y': 21.2, '5Y': 24.8 } },
  { name: 'Axis Small Cap Fund', category: 'Small Cap', expenseRatio: 0.52, returns: { '1Y': 45.1, '3Y': 28.9, '5Y': 29.5 } },
  { name: 'Mirae Asset Large Cap Fund', category: 'Large Cap', expenseRatio: 0.58, returns: { '1Y': 25.6, '3Y': 15.3, '5Y': 18.2 } },
  { name: 'Quant Mid Cap Fund', category: 'Mid Cap', expenseRatio: 0.77, returns: { '1Y': 65.2, '3Y': 35.1, '5Y': 33.4 } },
];

export const mockPortfolioHoldings: PortfolioHolding[] = [
  { name: 'Reliance Industries', symbol: 'RELIANCE.NS', type: 'Stock', quantity: 10, avgPrice: 2500, currentPrice: 2850.55 },
  { name: 'Infosys', symbol: 'INFY.NS', type: 'Stock', quantity: 20, avgPrice: 1400, currentPrice: 1510.75 },
  { name: 'Parag Parikh Flexi Cap Fund', symbol: 'PPFCF', type: 'Mutual Fund', quantity: 500, avgPrice: 70, currentPrice: 85.50 },
];

export const mockPortfolioAllocation: PortfolioAllocation[] = [
    { name: 'Equity', value: 400 },
    { name: 'Debt', value: 300 },
    { name: 'Gold', value: 200 },
    { name: 'Cash', value: 100 },
];

export const mockWatchlist: string[] = ['RELIANCE.NS', 'INFY.NS', 'TATAMOTORS.NS'];

export const getMockData = () => ({
  stocks: mockStocks,
  mutualFunds: mockMutualFunds,
  portfolioHoldings: mockPortfolioHoldings,
  portfolioAllocation: mockPortfolioAllocation,
  watchlist: mockWatchlist,
});

export const getStockBySymbol = (symbol: string) => mockStocks.find(s => s.symbol === symbol);