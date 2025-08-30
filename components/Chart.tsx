'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart as KChart } from 'klinecharts';
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

  // Default settings matching assignment requirements
  const [settings, setSettings] = useState<BollingerBandsSettings>({
    length: 20,
    maType: 'SMA',
    source: 'close',
    stdDevMultiplier: 2,
    offset: 0
  });

  // Default style settings
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

    chartInstance.current = init(chartRef.current, {
      styles: {
        candle: {
          type: 'candle_solid',
          bar: {
            upColor: '#26a69a',
            downColor: '#ef5350',
            noChangeColor: '#888888'
          },
          area: {
            lineSize: 2,
            value: 'close'
          },
          priceMark: {
            show: true,
            high: {
              show: true,
              color: '#D9D9D9',
              textMargin: 5
            },
            low: {
              show: true,
              color: '#D9D9D9',
              textMargin: 5
            }
          },
          tooltip: {
            showRule: 'always',
            showType: 'standard',
            labels: ['Time', 'Open', 'High', 'Low', 'Close', 'Volume'],
            values: null
          }
        },
        grid: {
          show: true,
          horizontal: {
            show: true,
            size: 1,
            color: '#393939',
            style: 'solid'
          },
          vertical: {
            show: true,
            size: 1,
            color: '#393939',
            style: 'solid'
          }
        },
        xAxis: {
          show: true,
          size: 'auto',
          axisLine: {
            show: true,
            color: '#888888',
            size: 1
          },
          tickText: {
            show: true,
            color: '#D9D9D9',
            size: 12
          },
          tickLine: {
            show: true,
            size: 1,
            length: 3,
            color: '#888888'
          }
        },
        yAxis: {
          show: true,
          size: 'auto',
          position: 'right',
          type: 'normal',
          axisLine: {
            show: true,
            color: '#888888',
            size: 1
          },
          tickText: {
            show: true,
            color: '#D9D9D9',
            size: 12
          },
          tickLine: {
            show: true,
            size: 1,
            length: 3,
            color: '#888888'
          }
        },
        crosshair: {
          show: true,
          horizontal: {
            show: true,
            line: {
              show: true,
              style: 'dashed',
              dashValue: [4, 2],
              size: 1,
              color: '#888888'
            },
            text: {
              show: true,
              color: '#D9D9D9',
              size: 12,
              paddingLeft: 2,
              paddingRight: 2,
              paddingTop: 2,
              paddingBottom: 2,
              borderSize: 1,
              borderColor: '#505050',
              backgroundColor: '#505050'
            }
          },
          vertical: {
            show: true,
            line: {
              show: true,
              style: 'dashed',
              dashValue: [4, 2],
              size: 1,
              color: '#888888'
            },
            text: {
              show: true,
              color: '#D9D9D9',
              size: 12,
              paddingLeft: 2,
              paddingRight: 2,
              paddingTop: 2,
              paddingBottom: 2,
              borderSize: 1,
              borderColor: '#505050',
              backgroundColor: '#505050'
            }
          }
        }
      },
      customApi: {
        formatDate: (dateTimeFormat: any, timestamp: number, format: string, type: string) => {
          const date = new Date(timestamp);
          if (type === 'time') {
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          }
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        }
      }
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
      const formattedData = data.map(candle => ({
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));

      chartInstance.current.applyNewData(formattedData);
    }
  }, [data]);

  // Compute Bollinger Bands when settings change
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

  // Update chart with Bollinger Bands overlay
  useEffect(() => {
    if (!chartInstance.current) return;

    if (!showBollinger) {
      try {
        chartInstance.current.removeIndicator('BOLL');
      } catch (e) { 
        // Indicator might not exist, that's okay
      }
      return;
    }

    try {
      // Remove existing indicator if present
      try {
        chartInstance.current.removeIndicator('BOLL');
      } catch (e) {
        // Indicator might not exist
      }
      
      // Create the Bollinger Bands indicator
      const indicatorId = chartInstance.current.createIndicator(
        'BOLL', 
        true,
        { id: 'candle_pane' }
      );

      if (indicatorId) {
        // Override indicator styles
        chartInstance.current.overrideIndicator({
          name: 'BOLL',
          calcParams: [settings.length, settings.stdDevMultiplier],
          styles: {
            lines: [
              {
                color: style.upper.color,
                size: style.upper.lineWidth,
                style: style.upper.lineStyle === 'dashed' ? 'dashed' : 'solid',
                show: style.upper.visible,
                dashValue: style.upper.lineStyle === 'dashed' ? [4, 4] : [0, 0]
              },
              {
                color: style.basic.color,
                size: style.basic.lineWidth,
                style: style.basic.lineStyle === 'dashed' ? 'dashed' : 'solid',
                show: style.basic.visible,
                dashValue: style.basic.lineStyle === 'dashed' ? [4, 4] : [0, 0]
              },
              {
                color: style.lower.color,
                size: style.lower.lineWidth,
                style: style.lower.lineStyle === 'dashed' ? 'dashed' : 'solid',
                show: style.lower.visible,
                dashValue: style.lower.lineStyle === 'dashed' ? [4, 4] : [0, 0]
              }
            ]
          }
        });
      }

    } catch (error) {
      console.error('Error adding Bollinger Bands indicator:', error);
    }

  }, [showBollinger, settings, style]);

  const handleAddIndicator = () => {
    setShowBollinger(true);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  const handleSettingsChange = (newSettings: BollingerBandsSettings) => {
    setSettings(newSettings);
  };

  const handleStyleChange = (newStyle: BollingerBandsStyle) => {
    setStyle(newStyle);
  };

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
              onClick={handleAddIndicator}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add Bollinger Bands
            </button>
          )}
          {showBollinger && (
            <button
              onClick={handleShowSettings}
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
        onSettingsChange={handleSettingsChange}
        onStyleChange={handleStyleChange}
      />
    </div>
  );
};