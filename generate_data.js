// Script to generate complete 250 candle dataset
// Run this in Node.js to generate the full data: node generate_complete_data.js

const fs = require('fs');

function generateCompleteOHLCVData() {
  const data = [];
  let basePrice = 100;
  const startTime = 1700000000000; // Start timestamp
  const interval = 86400000; // 1 day intervals

  for (let i = 0; i < 250; i++) {
    const timestamp = startTime + (i * interval);
    
    // Add realistic market movements
    const trend = Math.sin(i * 0.02) * 0.8; // Long-term trend
    const cyclic = Math.cos(i * 0.05) * 0.3; // Medium-term cycles
    const volatility = 0.015 + (Math.sin(i * 0.08) * 0.01); // Dynamic volatility
    const randomWalk = (Math.random() - 0.5) * 2 * volatility * basePrice;
    
    // Apply price change
    basePrice += trend + cyclic + randomWalk;
    basePrice = Math.max(basePrice, 10); // Minimum price floor
    
    // Generate OHLC for the day
    const dailyVolatility = basePrice * (0.008 + Math.random() * 0.025); // 0.8-3.3% daily range
    
    const open = basePrice + (Math.random() - 0.5) * dailyVolatility * 0.4;
    const close = open + (Math.random() - 0.5) * dailyVolatility;
    
    // Ensure high is actually high and low is actually low
    const priceArray = [open, close];
    const high = Math.max(...priceArray) + Math.random() * dailyVolatility * 0.4;
    const low = Math.min(...priceArray) - Math.random() * dailyVolatility * 0.4;
    
    const volume = Math.floor(15000 + Math.random() * 80000); // 15K-95K volume
    
    data.push({
      timestamp,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
    
    // Update base price for next iteration
    basePrice = close;
  }

  return data;
}

// Generate and save the data
const completeData = generateCompleteOHLCVData();

// Write to file
fs.writeFileSync(
  './public/data/ohlcv.json', 
  JSON.stringify(completeData, null, 2)
);

console.log(`Generated ${completeData.length} candles of OHLCV data`);
console.log(`Price range: $${Math.min(...completeData.map(d => d.low)).toFixed(2)} - $${Math.max(...completeData.map(d => d.high)).toFixed(2)}`);
console.log(`Volume range: ${Math.min(...completeData.map(d => d.volume)).toLocaleString()} - ${Math.max(...completeData.map(d => d.volume)).toLocaleString()}`);
console.log('Data saved to ./public/data/ohlcv.json');