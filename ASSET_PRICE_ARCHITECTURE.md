# Asset Price System Architecture Document

This document provides a comprehensive analysis of the asset pricing system within the application, detailing how market data is queried, updated, validated, and stored.

---

## 1. FILES THAT QUERY ASSET PRICES

These files consume price data to render the UI or calculate financial metrics.

*   **`src/components/dashboard/TradingPanel.jsx`**
    *   **Usage:** Reads real-time prices to display current Bid/Ask rates and calculate required margin for opening trades.
    *   **Imports:** `usePrices` from `PriceContext`, `useAssets` from `AssetContext`.
    *   **Patterns:** Uses `getPriceData(selectedSymbol)` and falls back to `selectedAsset?.price`. Calculates `bidPrice` and `askPrice` based on the asset's spread.
*   **`src/components/home/StockTickerBanner.jsx`**
    *   **Usage:** Displays scrolling ticker tape of live prices across the top of the screen.
    *   **Imports:** `useAssets` from `AssetContext`.
    *   **Patterns:** Iterates over `assets` array, pulls current mid prices from `assetPrices[asset.symbol]`, and calculates the percentage change against the base price.
*   **`src/components/dashboard/TradingChart.jsx`**
    *   **Usage:** Renders live candlestick charts.
    *   **Imports:** `useAssets` from `AssetContext`.
    *   **Patterns:** Listens to `prices[symbol]` and updates chart series dynamically (simulating candles based on current price).
*   **`src/pages/AnalysisPage.jsx`**
    *   **Usage:** Fetches prices to determine the correct exit price when a user manually closes a trade.
    *   **Imports:** `useAssets` from `AssetContext`.
    *   **Patterns:** Extracts `prices[trade.symbol]` to find `bid` or `ask` depending on whether the trade was a BUY or SELL before passing it to the `close_trade_final` RPC.
*   **`src/hooks/useRealTimePL.jsx`**
    *   **Usage:** Core engine for calculating floating Profit/Loss.
    *   **Imports:** `useAssets` from `AssetContext`.
    *   **Patterns:** Joins user's open trades with `prices[trade.symbol]` to continuously recalculate floating equity and margin levels.

---

## 2. FILES THAT UPDATE ASSET PRICES

These files modify global price states or database records.

*   **`src/contexts/AssetContext.jsx`**
    *   **Mechanism:** Contains `startPriceSimulation` which continuously updates prices via a random walk algorithm using base volatility. Also contains a `syncInterval` that periodically queries APIs to correct the simulated prices.
*   **`src/contexts/PriceContext.jsx`**
    *   **Mechanism:** Exposes the `updatePrice` function and runs a local `setInterval` to simulate price fluctuations for components that subscribe to specific symbols.
*   **`src/pages/admin/AssetSettingsPage.jsx`**
    *   **Mechanism:** Admin interface that performs direct database mutations.
    *   **Trigger:** Manual admin action. Calls `supabase.from('assets').update(...)` to modify base prices, spreads, and contract sizes.
*   **`src/hooks/useBinanceChart.js`**
    *   **Mechanism:** Establishes a direct WebSocket connection to Binance (`wss://stream.binance.com`) for Crypto/Forex, or uses polling for Stocks. Updates local chart state with live ticks.

---

## 3. DATA SOURCES FOR PRICES

The system uses a hybrid approach of persistent storage, external APIs, and local simulation.

1.  **Supabase `assets` Table (Primary Source of Truth):**
    *   Stores base prices, spread configurations, and precision requirements. Used as the anchor point when the application boots.
2.  **External APIs (via Edge Functions & WebSockets):**
    *   **Binance WebSocket:** Direct connection used for real-time Crypto and Forex charting (`kline` streams).
    *   **Finnhub / AlphaVantage:** Used for Stocks and Indices, routed through the Supabase Edge Function `get-chart-data`.
3.  **Local Simulation (Fallback & Interpolation):**
    *   To save API costs and ensure the UI always feels "alive", `AssetContext` and `PriceContext` generate intermediate micro-ticks (simulated volatility based on asset spread and baseline prices).

---

## 4. PRICE UPDATE FLOW

**Architecture Flow Diagram:**