'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart as KChart, LineType } from 'klinecharts';
import { TrendingUp, Settings2 } from 'lucide-react';
import { BollingerSettings } from './BollingerSettings';
import { computeBollingerBands } from '@/lib/indicators/bollinger';
import { OHLCV, BollingerBandsSettings, BollingerBandsStyle, BollingerBandsData } from '@/lib/types';

interface ChartProps {
  data: OHLCV[];
}

export const Chart: React.FC<ChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<KChart | null>(null);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bollingerData, setBollingerData] = useState<BollingerBandsData[]>([]);

  const [settings, setSettings] = useState<BollingerBandsSettings>({
    length: 20,
    maType: 'SMA',
    source: 'close',
    stdDevMultiplier: 2,
    offset: 0
  });

  const [style, setStyle] = useState<BollingerBandsStyle>({
    basic: {
      visible: true,
      color: '#FF6B35',
      lineWidth: 2,
      lineStyle: 'solid'
    },
    upper: {
      visible: true,
      color: '#4ECDC4',
      lineWidth: 1,
      lineStyle: 'solid'
    },
    lower: {
      visible: true,
      color: '#4ECDC4',
      lineWidth: 1,
      lineStyle: 'solid'
    },
    backgroundFill: {
      visible: true,
      opacity: 0.1,
      color: '#4ECDC4'
    }
  });

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = init(chartRef.current);

    chartInstance.current.setStyles({
      grid: {
        show: true,
        horizontal: {
          show: true,
          size: 1,
          color: '#393939',
          style: LineType.Solid,
        },
        vertical: {
          show: true,
          size: 1,
          color: '#393939',
          style: LineType.Solid,
        },
      },
      candle: {
        type: 'candle_solid',
        bar: {
          upColor: '#26a69a',
          downColor: '#ef5350',
          noChangeColor: '#888888',
        },
      },
      crosshair: {
        show: true,
        horizontal: {
          show: true,
          line: {
            show: true,
            style: LineType.Dashed,
            dashedValue: [4, 2],
            size: 1,
            color: '#EDEDED',
          },
        },
        vertical: {
          show: true,
          line: {
            show: true,
            style: LineType.Dashed,
            dashedValue: [4, 2],
            size: 1,
            color: '#EDEDED',
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        dispose(chartRef.current!);
        chartInstance.current = null;
      }
    };
  }, []);

  // Load candlestick data
  useEffect(() => {
    if (chartInstance.current && data.length > 0) {
      chartInstance.current.applyNewData(data);
    }
  }, [data]);

  // Compute Bollinger Bands
  const updateBollingerBands = useCallback(() => {
    if (data.length > 0) {
      const bb = computeBollingerBands(data, settings);
      setBollingerData(bb);
      return bb;
    }
    return [];
  }, [data, settings]);

  useEffect(() => {
    updateBollingerBands();
  }, [updateBollingerBands]);

  // Add or remove Bollinger indicator
  useEffect(() => {
    if (!chartInstance.current) return;

    try {
      chartInstance.current.removeIndicator('BOLL');
    } catch {}

    if (!showBollinger) return;

    chartInstance.current.createIndicator('BOLL', true, { id: 'candle_pane' });

    chartInstance.current.overrideIndicator({
      name: 'BOLL',
      calcParams: [settings.length, settings.stdDevMultiplier],
      styles: {
        up: {
          color: style.upper.color,
          size: style.upper.lineWidth,
          style: style.upper.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
          show: style.upper.visible,
        },
        mid: {
          color: style.basic.color,
          size: style.basic.lineWidth,
          style: style.basic.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
          show: style.basic.visible,
        },
        dn: {
          color: style.lower.color,
          size: style.lower.lineWidth,
          style: style.lower.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
          show: style.lower.visible,
        },
      },
    });
  }, [showBollinger, settings, style]);

  return (
    <div className="w-full h-full relative">
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Bollinger Bands Indicator
        </h1>
        <div className="flex gap-2">
          {!showBollinger && (
            <button
              onClick={() => setShowBollinger(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Bollinger Bands
            </button>
          )}
          {showBollinger && (
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" />
              Settings
            </button>
          )}
        </div>
      </div>

      <div ref={chartRef} className="w-full" style={{ height: 'calc(100vh - 80px)' }} />

      <BollingerSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        style={style}
        onSettingsChange={setSettings}
        onStyleChange={setStyle}
      />
    </div>
  );
};
