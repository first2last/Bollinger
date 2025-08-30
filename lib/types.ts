// OHLCV data structure
export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Bollinger Bands calculation settings
export interface BollingerBandsSettings {
  length: number;           // Period for moving average (default: 20)
  maType: 'SMA';           // Moving average type (only SMA for this assignment)
  source: 'close' | 'open' | 'high' | 'low'; // Price source (default: 'close')
  stdDevMultiplier: number; // Standard deviation multiplier (default: 2)
  offset: number;          // Shift bands by N bars (default: 0)
}

// Style configuration for each band line
export interface LineStyle {
  visible: boolean;
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed';
}

// Background fill style for area between upper and lower bands
export interface BackgroundFillStyle {
  visible: boolean;
  opacity: number; // 0-1
  color: string;
}

// Complete Bollinger Bands style configuration
export interface BollingerBandsStyle {
  basic: LineStyle;    // Middle band (basis/SMA)
  upper: LineStyle;    // Upper band
  lower: LineStyle;    // Lower band
  backgroundFill: BackgroundFillStyle; // Area fill between upper and lower
}

// Calculated Bollinger Bands data point
export interface BollingerBandsData {
  timestamp: number;
  basis: number;       // Middle band (SMA)
  upper: number;       // Upper band
  lower: number;       // Lower band
  sourceValue?: number; // Original source value (for debugging)
  stdDev?: number;     // Standard deviation value (for debugging)
}

// Chart component props
export interface ChartProps {
  data: OHLCV[];
}

// Settings modal props
export interface BollingerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BollingerBandsSettings;
  style: BollingerBandsStyle;
  onSettingsChange: (settings: BollingerBandsSettings) => void;
  onStyleChange: (style: BollingerBandsStyle) => void;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validCount: number;
}

// Default settings (matching assignment requirements)
export const DEFAULT_BOLLINGER_SETTINGS: BollingerBandsSettings = {
  length: 20,
  maType: 'SMA',
  source: 'close',
  stdDevMultiplier: 2,
  offset: 0
};

// Default style settings (dark theme appropriate)
export const DEFAULT_BOLLINGER_STYLE: BollingerBandsStyle = {
  basic: {
    visible: true,
    color: '#FF6B35', // Orange for middle band
    lineWidth: 2,
    lineStyle: 'solid'
  },
  upper: {
    visible: true,
    color: '#4ECDC4', // Teal for upper band
    lineWidth: 1,
    lineStyle: 'solid'
  },
  lower: {
    visible: true,
    color: '#4ECDC4', // Teal for lower band
    lineWidth: 1,
    lineStyle: 'solid'
  },
  backgroundFill: {
    visible: true,
    opacity: 0.1,
    color: '#4ECDC4' // Light teal fill
  }
};