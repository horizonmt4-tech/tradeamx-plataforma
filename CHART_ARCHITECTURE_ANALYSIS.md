# Chart Architecture & Data Flow Analysis

This document outlines the technical architecture for the charting system within the application, detailing how market data is fetched, cached, processed, and rendered.

---

## 1. DATA SOURCES & STRATEGY

The application uses a **Tri-Layer Data Strategy** to ensure high availability and responsiveness:

1.  **Primary (Real-Time Streams):** WebSocket connections to Binance for Crypto and Forex assets.
2.  **Secondary (Historical/Batch):** REST API calls to Finnhub or Alpha Vantage via Supabase Edge Functions for Stocks and Indices.
3.  **Tertiary (Fallback/Simulation):** Local mock data generation based on the last known database price if external APIs fail or return 401/429 errors.

---

## 2. CORE CHART COMPONENTS

### `TradingChart.jsx`
*   **Purpose:** Primary technical analysis tool for users.
*   **Library:** `lightweight-charts` by TradingView.
*   **Mechanism:** 
    *   Initializes a `CandlestickSeries`.
    *   Subscribes to global `prices` from `AssetContext`.
    *   Uses `useBinanceChart` hook to manage the lifecycle of the data stream.
    *   Implements `safeRemoveChart` utility to prevent memory leaks during symbol switching.

### `PerformanceChart.jsx`
*   **Purpose:** Displays user equity curve and P/L history.
*   **Mechanism:**
    *   Uses `AreaSeries` to show balance fluctuations.
    *   Calculates data points by iterating through the `trades` array, sorting by `close_time`, and applying cumulative sums to the `initialBalance`.
    *   Includes a `uniqueMap` deduplication logic to prevent timestamp collisions in the chart library.

---

## 3. DATA FETCHING & STATE HOOKS

### `useBinanceChart.js`
This is the "Engine" of the charting system. It contains logic to:
1.  **Detect Asset Type:** Uses `getAssetType(symbol)` to decide between WebSocket (Crypto/Forex) or Polling (Stocks).
2.  **Symbol Mapping:** Uses `symbolMapper.js` to convert internal symbols (e.g., "BTC/USD") to provider-specific formats (e.g., "btcusdt").
3.  **Real-Time Integration:**
    *   **WebSockets:** Listens to `@kline` streams for sub-second updates.
    *   **Polling:** Invokes the `get-chart-data` Edge Function every 30 seconds for non-crypto assets.
4.  **Validation:** Every incoming tick is piped through `validatePriceBySymbol` before being added to the series.

---

## 4. SERVICES & UTILITIES

### `TradingViewChartService.js`
*   **Abstraction Layer:** Acts as a gateway for fetching historical candles.
*   **Resiliency:** Implements exponential backoff retries (3 attempts) when calling Edge Functions.
*   **Mock Injection:** If all API attempts fail, it calls `generateMockData` using the base price from the Supabase `assets` table to ensure the UI doesn't break.

### `ChartDataCache.js`
*   **Deduplication:** Uses a `pendingRequests` Map to ensure that if multiple components request data for "AAPL:1H" simultaneously, only **one** network request is fired.
*   **TTL (Time To Live):** Implements a 5-minute memory cache to reduce API credit consumption.

---

## 5. DATA FLOW DIAGRAM