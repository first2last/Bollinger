'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { init, dispose, Chart as KChart, CandleType, LineType } from 'klinecharts';
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

    // Default settings
    const [settings, setSettings] = useState<BollingerBandsSettings>({
        length: 20,
        maType: 'SMA',
        source: 'close',
        stdDevMultiplier: 2,
        offset: 0
    });

    // Default style settings
    const [style, setStyle] = useState<BollingerBandsStyle>({
        basic: { visible: true, color: '#FF6B35', lineWidth: 2, lineStyle: 'solid' },
        upper: { visible: true, color: '#4ECDC4', lineWidth: 1, lineStyle: 'solid' },
        lower: { visible: true, color: '#4ECDC4', lineWidth: 1, lineStyle: 'solid' },
        backgroundFill: { visible: true, opacity: 0.1, color: '#4ECDC4' }
    });

    // Initialize chart
    useEffect(() => {
        if (!chartRef.current) return;

        chartInstance.current = init(chartRef.current, {
            styles: {
                candle: {
                    // enum, not string
                    type: CandleType.CandleSolid,
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
                        high: { show: true, color: '#D9D9D9', textMargin: 5 },
                        low: { show: true, color: '#D9D9D9', textMargin: 5 }
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
                        // enum, not string
                        style: LineType.Solid
                    },
                    vertical: {
                        show: true,
                        size: 1,
                        color: '#393939',
                        style: LineType.Solid
                    }
                },
                xAxis: {
                    show: true,
                    size: 'auto',
                    axisLine: { show: true, color: '#888888', size: 1 },
                    tickText: { show: true, color: '#D9D9D9', size: 12 },
                    tickLine: { show: true, size: 1, length: 3, color: '#888888' }
                },
                yAxis: {
                    show: true,
                    size: 'auto',
                    position: 'right',
                    type: 'normal',
                    axisLine: { show: true, color: '#888888', size: 1 },
                    tickText: { show: true, color: '#D9D9D9', size: 12 },
                    tickLine: { show: true, size: 1, length: 3, color: '#888888' }
                },
                crosshair: {
                    show: true,
                    horizontal: {
                        show: true,
                        line: {
                            show: true,
                            style: LineType.Dashed,         // enum
                            dashedValue: [4, 2],            // correct prop name
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
                            style: LineType.Dashed,         // enum
                            dashedValue: [4, 2],
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
                // keep simple; if lint complains about 'any', switch your ESLint rule or add a local ts-ignore
                formatDate: (_fmt: any, timestamp: number, _format: string, type: string) => {
                    const date = new Date(timestamp);
                    if (type === 'time') {
                        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                    }
                    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
                        date.getDate()
                    ).padStart(2, '0')}`;
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                // capture the ref for cleanup to avoid the React hook warning
                const dom = chartRef.current!;
                dispose(dom);
                chartInstance.current = null;
            }
        };
    }, []);

    // Load candlestick data
    useEffect(() => {
        if (chartInstance.current && data.length > 0) {
            const formattedData = data.map((c) => ({
                timestamp: c.timestamp,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                volume: c.volume
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
            } catch {
                /* no-op */
            }
            return;
        }

        try {
            try {
                chartInstance.current.removeIndicator('BOLL');
            } catch {
                /* indicator might not exist */
            }

            const indicatorId = chartInstance.current.createIndicator('BOLL', true, { id: 'candle_pane' });

            if (indicatorId) {
                chartInstance.current.overrideIndicator({
                    name: 'BOLL',
                    calcParams: [settings.length, settings.stdDevMultiplier],
                    styles: {
                        // use individual up/mid/dn configs expected by klinecharts
                        up: {
                            color: style.upper.color,
                            size: style.upper.lineWidth,
                            style: style.upper.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
                            show: style.upper.visible
                        },
                        mid: {
                            color: style.basic.color,
                            size: style.basic.lineWidth,
                            style: style.basic.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
                            show: style.basic.visible
                        },
                        dn: {
                            color: style.lower.color,
                            size: style.lower.lineWidth,
                            style: style.lower.lineStyle === 'dashed' ? LineType.Dashed : LineType.Solid,
                            show: style.lower.visible
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error adding Bollinger Bands indicator:', error);
        }
    }, [showBollinger, settings, style]);

    const handleAddIndicator = () => setShowBollinger(true);
    const handleShowSettings = () => setShowSettings(true);
    const handleSettingsChange = (newSettings: BollingerBandsSettings) => setSettings(newSettings);
    const handleStyleChange = (newStyle: BollingerBandsStyle) => setStyle(newStyle);

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
