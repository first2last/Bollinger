'use client';

import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { BollingerBandsSettings, BollingerBandsStyle } from '@/lib/types';

interface BollingerSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BollingerBandsSettings;
  style: BollingerBandsStyle;
  onSettingsChange: (settings: BollingerBandsSettings) => void;
  onStyleChange: (style: BollingerBandsStyle) => void;
}

export const BollingerSettings: React.FC<BollingerSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  style,
  onSettingsChange,
  onStyleChange
}) => {
  const [activeTab, setActiveTab] = useState<'inputs' | 'style'>('inputs');

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof BollingerBandsSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleStyleChange = (
    section: keyof BollingerBandsStyle,
    property: string,
    value: any
  ) => {
    onStyleChange({
      ...style,
      [section]: {
        ...style[section],
        [property]: value
      }
    });
  };

  const LineStyleSelect = ({ value, onChange }: { value: 'solid' | 'dashed', onChange: (value: 'solid' | 'dashed') => void }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'solid' | 'dashed')}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
    >
      <option value="solid">Solid</option>
      <option value="dashed">Dashed</option>
    </select>
  );

  const ColorInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-8 rounded border border-gray-600 cursor-pointer"
    />
  );

  const NumberInput = ({ value, onChange, min, max, step }: { value: number, onChange: (value: number) => void, min?: number, max?: number, step?: number }) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={step}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
    />
  );

  const Checkbox = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
    />
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Bollinger Bands Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('inputs')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'inputs' 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Inputs
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'style' 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Style
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'inputs' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                <NumberInput
                  value={settings.length}
                  onChange={(value) => handleSettingChange('length', value)}
                  min={1}
                  max={200}
                  step={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">MA Type</label>
                <select
                  value={settings.maType}
                  onChange={(e) => handleSettingChange('maType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                <select
                  value={settings.source}
                  onChange={(e) => handleSettingChange('source', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="close">Close</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">StdDev (Multiplier)</label>
                <NumberInput
                  value={settings.stdDevMultiplier}
                  onChange={(value) => handleSettingChange('stdDevMultiplier', value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Offset</label>
                <NumberInput
                  value={settings.offset}
                  onChange={(value) => handleSettingChange('offset', value)}
                  min={-50}
                  max={50}
                  step={1}
                />
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Basic (Middle Band) */}
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-sm font-medium text-white mb-3">Basic (Middle Band)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visible</label>
                    <Checkbox
                      checked={style.basic.visible}
                      onChange={(checked) => handleStyleChange('basic', 'visible', checked)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <ColorInput
                      value={style.basic.color}
                      onChange={(color) => handleStyleChange('basic', 'color', color)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Width</label>
                    <NumberInput
                      value={style.basic.lineWidth}
                      onChange={(width) => handleStyleChange('basic', 'lineWidth', width)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Style</label>
                    <LineStyleSelect
                      value={style.basic.lineStyle}
                      onChange={(lineStyle) => handleStyleChange('basic', 'lineStyle', lineStyle)}
                    />
                  </div>
                </div>
              </div>

              {/* Upper Band */}
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-sm font-medium text-white mb-3">Upper Band</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visible</label>
                    <Checkbox
                      checked={style.upper.visible}
                      onChange={(checked) => handleStyleChange('upper', 'visible', checked)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <ColorInput
                      value={style.upper.color}
                      onChange={(color) => handleStyleChange('upper', 'color', color)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Width</label>
                    <NumberInput
                      value={style.upper.lineWidth}
                      onChange={(width) => handleStyleChange('upper', 'lineWidth', width)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Style</label>
                    <LineStyleSelect
                      value={style.upper.lineStyle}
                      onChange={(lineStyle) => handleStyleChange('upper', 'lineStyle', lineStyle)}
                    />
                  </div>
                </div>
              </div>

              {/* Lower Band */}
              <div className="border-b border-gray-700 pb-4">
                <h3 className="text-sm font-medium text-white mb-3">Lower Band</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visible</label>
                    <Checkbox
                      checked={style.lower.visible}
                      onChange={(checked) => handleStyleChange('lower', 'visible', checked)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <ColorInput
                      value={style.lower.color}
                      onChange={(color) => handleStyleChange('lower', 'color', color)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Width</label>
                    <NumberInput
                      value={style.lower.lineWidth}
                      onChange={(width) => handleStyleChange('lower', 'lineWidth', width)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Line Style</label>
                    <LineStyleSelect
                      value={style.lower.lineStyle}
                      onChange={(lineStyle) => handleStyleChange('lower', 'lineStyle', lineStyle)}
                    />
                  </div>
                </div>
              </div>

              {/* Background Fill */}
              <div>
                <h3 className="text-sm font-medium text-white mb-3">Background Fill</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Visible</label>
                    <Checkbox
                      checked={style.backgroundFill.visible}
                      onChange={(checked) => handleStyleChange('backgroundFill', 'visible', checked)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Color</label>
                    <ColorInput
                      value={style.backgroundFill.color}
                      onChange={(color) => handleStyleChange('backgroundFill', 'color', color)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Opacity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={style.backgroundFill.opacity}
                      onChange={(e) => handleStyleChange('backgroundFill', 'opacity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-xs text-gray-400 mt-1">{(style.backgroundFill.opacity * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};