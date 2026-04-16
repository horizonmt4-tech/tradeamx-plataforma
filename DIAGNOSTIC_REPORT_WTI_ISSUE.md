# Diagnostic Report: "WTI/USD0" Rendering Issue & Symbol Architecture

This report analyzes the root cause of the unexpected "0" appearing in the symbol display (e.g., "WTI/USD0") and documents the end-to-end symbol transformation pipeline.

---

## 1. Symbol Format in Supabase `assets` Table
Based on the existing database schema and `AssetContext.jsx` processing:
*   **Table Name:** `public.assets`
*   **Symbol Column Type:** `text`
*   **Stored Format:** Standardized uppercase with slash for pairs (e.g., `"WTI/USD"`, `"BTC/USD"`, `"EUR/USD"`).
*   **Current Inventory:** 
    *   Forex: `EUR/USD`, `GBP/USD`, `USD/JPY`
    *   Crypto: `BTC/USD`, `ETH/USD`
    *   Commodities: `WTI/USD`, `XAU/USD` (Gold)

---

## 2. Component Identification
The rendering of open trades occurs in two primary locations:
1.  **User Dashboard/Analysis:** `src/components/dashboard/TradesList.jsx` (Component: `TradeRow`)
2.  **Admin Panel:** `src/components/admin/OpenPositions.jsx` (Component: `OscillatingRow`)

---

## 3. The "WTI/USD0" Mystery: Root Cause Analysis

### The Culprit Code
In `src/components/dashboard/TradesList.jsx`, the symbol rendering logic was identified as follows: