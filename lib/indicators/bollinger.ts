import { OHLCV, BollingerBandsSettings, BollingerBandsData } from '@/lib/types';

/**
 * Computes Bollinger Bands indicator values
 * 
 * Formula Implementation:
 * - Basis (middle band) = SMA(source, length)
 * - StdDev = Sample Standard Deviation of the last length values of source
 * - Upper = Basis + (StdDev multiplier * StdDev)
 * - Lower = Basis - (StdDev multiplier * StdDev)
 * - Offset: shifts the three series by offset bars on the chart
 * 
 * Note: This implementation uses SAMPLE standard deviation (divides by n-1)
 * as it's more commonly used in financial analysis for estimating population
 * standard deviation from a sample.
 */

/**
 * Calculate Simple Moving Average (SMA)
 */
function calculateSMA(values: number[], period: number): number[] {
  const sma: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      sma.push(NaN); // Not enough data points
    } else {
      const sum = values.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
      sma.push(sum / period);
    }
  }
  
  return sma;
}

/**
 * Calculate Sample Standard Deviation
 * Uses n-1 denominator (sample standard deviation)
 */
function calculateStandardDeviation(values: number[], period: number): number[] {
  const stdDev: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      stdDev.push(NaN); // Not enough data points
    } else {
      const slice = values.slice(i - period + 1, i + 1);
      const mean = slice.reduce((acc, val) => acc + val, 0) / period;
      
      // Sample standard deviation (divides by n-1)
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (period - 1);
      stdDev.push(Math.sqrt(variance));
    }
  }
  
  return stdDev;
}

/**
 * Apply offset to a data series
 * Positive offset shifts forward (future), negative shifts backward (past)
 */
function applyOffset<T>(data: T[], offset: number): T[] {
  if (offset === 0) return data;
  
  const result: T[] = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    const sourceIndex = i - offset;
    if (sourceIndex >= 0 && sourceIndex < data.length) {
      result[i] = data[sourceIndex];
    } else {
      // Use NaN or null for TypeScript compatibility
      result[i] = NaN as any;
    }
  }
  
  return result;
}

/**
 * Extract source values based on the source type
 */
function extractSourceValues(data: OHLCV[], source: string): number[] {
  switch (source.toLowerCase()) {
    case 'open':
      return data.map(candle => candle.open);
    case 'high':
      return data.map(candle => candle.high);
    case 'low':
      return data.map(candle => candle.low);
    case 'close':
    default:
      return data.map(candle => candle.close);
  }
}

/**
 * Main Bollinger Bands calculation function
 */
export function computeBollingerBands(
  data: OHLCV[], 
  settings: BollingerBandsSettings
): BollingerBandsData[] {
  
  if (!data || data.length === 0) {
    return [];
  }

  const { length, source, stdDevMultiplier, offset } = settings;
  
  // Extract source values (close, open, high, low)
  const sourceValues = extractSourceValues(data, source);
  
  // Calculate SMA (basis/middle band)
  const smaValues = calculateSMA(sourceValues, length);
  
  // Calculate Standard Deviation
  const stdDevValues = calculateStandardDeviation(sourceValues, length);
  
  // Calculate Upper and Lower bands
  const upperBands = smaValues.map((sma, i) => {
    if (isNaN(sma) || isNaN(stdDevValues[i])) return NaN;
    return sma + (stdDevMultiplier * stdDevValues[i]);
  });
  
  const lowerBands = smaValues.map((sma, i) => {
    if (isNaN(sma) || isNaN(stdDevValues[i])) return NaN;
    return sma - (stdDevMultiplier * stdDevValues[i]);
  });
  
  // Apply offset to all bands
  const offsetBasis = applyOffset(smaValues, offset);
  const offsetUpper = applyOffset(upperBands, offset);
  const offsetLower = applyOffset(lowerBands, offset);
  
  // Combine into result format
  const result: BollingerBandsData[] = data.map((_, index) => ({
    timestamp: data[index].timestamp,
    basis: offsetBasis[index] || NaN,
    upper: offsetUpper[index] || NaN,
    lower: offsetLower[index] || NaN,
    // Additional metadata for debugging/validation
    sourceValue: sourceValues[index],
    stdDev: stdDevValues[index] || NaN
  }));
  
  return result;
}

/**
 * Utility function to validate Bollinger Bands data
 * Useful for debugging and ensuring calculation correctness
 */
export function validateBollingerBands(
  bollingerData: BollingerBandsData[], 
  settings: BollingerBandsSettings
): {
  isValid: boolean;
  errors: string[];
  validCount: number;
} {
  const errors: string[] = [];
  let validCount = 0;
  
  for (let i = settings.length - 1; i < bollingerData.length; i++) {
    const bb = bollingerData[i];
    
    if (isNaN(bb.basis) || isNaN(bb.upper) || isNaN(bb.lower)) {
      continue; // Skip invalid entries
    }
    
    validCount++;
    
    // Validate that upper > basis > lower (should always be true)
    if (bb.upper <= bb.basis) {
      errors.push(`Index ${i}: Upper band (${bb.upper}) should be > Basis (${bb.basis})`);
    }
    
    if (bb.basis <= bb.lower) {
      errors.push(`Index ${i}: Basis (${bb.basis}) should be > Lower band (${bb.lower})`);
    }
    
    // Validate that the bands are symmetric around basis
    const upperDistance = bb.upper - bb.basis;
    const lowerDistance = bb.basis - bb.lower;
    const tolerance = 0.0001; // Small tolerance for floating point precision
    
    if (Math.abs(upperDistance - lowerDistance) > tolerance) {
      errors.push(`Index ${i}: Bands should be symmetric around basis. Upper distance: ${upperDistance}, Lower distance: ${lowerDistance}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validCount
  };
}

/**
 * Export utility functions for testing
 */
export const utils = {
  calculateSMA,
  calculateStandardDeviation,
  applyOffset,
  extractSourceValues
};