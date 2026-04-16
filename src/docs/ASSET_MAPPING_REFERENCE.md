# Guía de Referencia de Mapeo de Activos

Este documento detalla cómo los símbolos internos de la base de datos se transforman para las diferentes integraciones de la plataforma.

## 1. Reglas de Normalización
- **Forex:** Se utiliza el formato `BASE/QUOTE`. Para APIs, se elimina el slash (`/`).
- **Crypto:** Siempre mapeado a pares `USDT` para Binance Streams.
- **Stocks:** Tickers puros (AAPL, TSLA).

## 2. Tabla de Referencia Técnica

| Símbolo | Tipo | Contract Size | API Source |
| :--- | :--- | :--- | :--- |
| EUR/USD | forex | 100,000 | Binance (Proxy) |
| USD/MXN | exotic | 10,000 | Finnhub / FX |
| BTC/USD | crypto | 1 | Binance |
| XAU/USD | commodity | 100 | Oanda / FX |
| WTI/USD | commodity | 1,000 | TVC |

## 3. Resolución de Problemas (Troubleshooting)
- **Error "Symbol0":** No añadir sufijos numéricos manuales en los componentes de UI. La función `getAssetType` en `utils/marketDataValidator.js` es la única fuente de verdad para la clasificación.
- **P/L Excesivo:** Verificar el `contract_size` devuelto por `getContractSizeBySymbol`.