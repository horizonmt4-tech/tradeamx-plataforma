export const ASSET_CATEGORIES = {
  'Divisas (Forex)': [
    { symbol: 'EUR/USD', contractSize: 100000, price: 1.07, precision: 5 },
    { symbol: 'USD/MXN', contractSize: 100000, price: 18.40, precision: 5 },
    { symbol: 'GBP/JPY', contractSize: 100000, price: 200.5, precision: 3 },
    { symbol: 'AUD/USD', contractSize: 100000, price: 0.66, precision: 5 },
    { symbol: 'USD/CAD', contractSize: 100000, price: 1.37, precision: 5 },
  ],
  'Criptomonedas': [
    { symbol: 'BTC/USD', contractSize: 1, price: 67000, precision: 2 },
    { symbol: 'ETH/USD', contractSize: 1, price: 3500, precision: 2 },
    { symbol: 'SOL/USD', contractSize: 1, price: 150, precision: 2 },
  ],
  'Acciones (Stocks)': [
    { symbol: 'AAPL', contractSize: 1, price: 190, precision: 2 },
    { symbol: 'AMZN', contractSize: 1, price: 185, precision: 2 },
    { symbol: 'BAC', contractSize: 1, price: 39, precision: 2 },
    { symbol: 'GOOGL', contractSize: 1, price: 175, precision: 2 },
    { symbol: 'KO', contractSize: 1, price: 62, precision: 2 },
    { symbol: 'MA', contractSize: 1, price: 450, precision: 2 },
    { symbol: 'META', contractSize: 1, price: 495, precision: 2 },
    { symbol: 'NVDA', contractSize: 1, price: 120, precision: 2 },
    { symbol: 'TSLA', contractSize: 1, price: 180, precision: 2 },
    { symbol: 'V', contractSize: 1, price: 275, precision: 2 },
  ],
  'Índices': [
    { symbol: 'US30', contractSize: 1, price: 38800, precision: 2 }, // Dow Jones
    { symbol: 'US500', contractSize: 1, price: 5400, precision: 2 }, // S&P 500
    { symbol: 'NAS100', contractSize: 1, price: 19500, precision: 2 }, // Nasdaq 100
    { symbol: 'GER40', contractSize: 1, price: 18300, precision: 2 }, // DAX
  ],
  'Materias Primas': [
    { symbol: 'XAU/USD', contractSize: 100, price: 2300, precision: 2 },
    { symbol: 'XAG/USD', contractSize: 5000, price: 29, precision: 3 },
    { symbol: 'WTI/USD', contractSize: 1000, price: 80, precision: 2 },
  ],
};

export const getMockPrice = (symbol) => {
  const asset = Object.values(ASSET_CATEGORIES).flat().find(a => a.symbol === symbol);
  if (!asset) return 1 + Math.random();
  const volatility = asset.price * 0.005;
  return asset.price + (Math.random() - 0.5) * volatility;
};