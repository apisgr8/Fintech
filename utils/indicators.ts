// utils/indicators.ts
import type { OhlcvData } from '../types';

export interface Bar extends OhlcvData {}

export const simpleSMA = (values: number[], period: number): number[] => {
  const sma: number[] = [];
  if (values.length < period) return [];
  let sum = 0;
  for (let i = 0; i < period -1; i++) {
    sum += values[i];
  }
  for (let i = period - 1; i < values.length; i++) {
    sum += values[i];
    sma.push(sum / period);
    sum -= values[i - period + 1];
  }
  return sma;
};


export const ema = (closes: number[], period: number): number[] => {
  if (closes.length === 0) return [];
  const result: number[] = [];
  const k = 2.0 / (period + 1);
  let prev = closes[0];
  result.push(prev);
  for (let i = 1; i < closes.length; i++) {
    const v = closes[i] * k + prev * (1 - k);
    result.push(v);
    prev = v;
  }
  return result;
};

export const rsi14 = (closes: number[]): number => {
  if (closes.length < 15) return 50.0;
  let gain = 0, loss = 0;
  const relevantCloses = closes.slice(closes.length - 15);

  for (let i = 1; i < relevantCloses.length; i++) {
    const diff = relevantCloses[i] - relevantCloses[i - 1];
    if (diff > 0) {
      gain += diff;
    } else {
      loss -= diff;
    }
  }

  const avgGain = gain / 14;
  const avgLoss = loss / 14;
  
  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Math.max(0, Math.min(100, rsi));
};

export interface MacdResult {
  macd: number;
  signal: number;
  hist: number;
  macdSeries: number[];
}

export const macd = (closes: number[], fast = 12, slow = 26, signal = 9): MacdResult => {
  if (closes.length < slow) return { macd: 0, signal: 0, hist: 0, macdSeries: [] };
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  
  // Align lengths
  const alignedEmaFast = emaFast.slice(emaSlow.length - emaFast.length);
  
  const macdSeries = emaSlow.map((s, i) => alignedEmaFast[i] - s);
  const signalSeries = ema(macdSeries, signal);

  const latestMacd = macdSeries[macdSeries.length - 1];
  const latestSignal = signalSeries[signalSeries.length - 1];
  const latestHist = latestMacd - latestSignal;

  return { macd: latestMacd, signal: latestSignal, hist: latestHist, macdSeries };
};

export const atr14 = (bars: Bar[]): number => {
  if (bars.length < 15) return 0;
  const relevantBars = bars.slice(bars.length - 15);
  let sumTR = 0;
  for (let i = 1; i < relevantBars.length; i++) {
    const tr = Math.max(
      relevantBars[i].high - relevantBars[i].low,
      Math.abs(relevantBars[i].high - relevantBars[i - 1].close),
      Math.abs(relevantBars[i].low - relevantBars[i - 1].close)
    );
    sumTR += tr;
  }
  return sumTR / 14;
};

export interface BollingerResult {
  upper: number[];
  middle: number[];
  lower: number[];
  bandwidth: number[];
}

export const bollinger = (closes: number[], period = 20, stdDev = 2.0): BollingerResult => {
    if (closes.length < period) return { upper: [], middle: [], lower: [], bandwidth: [] };
    const middle = simpleSMA(closes, period);
    const upper: number[] = [];
    const lower: number[] = [];
    const bandwidth: number[] = [];
    
    // The SMA is shorter than the closes array, we need to know the offset
    const smaOffset = closes.length - middle.length;

    for (let i = 0; i < middle.length; i++) {
        const slice = closes.slice(i + smaOffset - (period - 1), i + smaOffset + 1);
        const mean = middle[i];
        const sumSq = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        const stdev = Math.sqrt(sumSq / period);
        const u = mean + stdDev * stdev;
        const l = mean - stdDev * stdev;
        upper.push(u);
        lower.push(l);
        bandwidth.push(((u - l) / mean) * 100);
    }
    return { upper, middle, lower, bandwidth };
};

export const isSqueezePresent = (bandwidth: number[], threshold = 0.2): boolean => {
  if (bandwidth.length < 20) return false;
  const last = bandwidth[bandwidth.length - 1];
  const tail = bandwidth.slice(Math.max(0, bandwidth.length - 40));
  const avg = tail.reduce((a, b) => a + b, 0) / tail.length;
  if (avg === 0) return false;
  return (avg - last) / avg > threshold;
};
