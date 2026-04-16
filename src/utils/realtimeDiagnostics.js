export const logPriceUpdate = (symbol, oldPrice, newPrice, source) => {
  console.groupCollapsed(`[Realtime] Price Update: ${symbol}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Source: ${source}`);
  console.log(`Old Price Data:`, oldPrice || 'None');
  console.log(`New Price Data:`, newPrice);
  console.groupEnd();
};

export const logPLRecalculation = (tradeId, symbol, oldPL, newPL) => {
  console.log(`[useRealTimePL] Trade ${symbol} (${tradeId}) P/L updated: $${newPL} (was $${oldPL})`);
};

export const logRealtimeStatus = (channel, status, error = null) => {
  if (error) {
    console.error(`[Realtime ERROR] Channel '${channel}' status: ${status}`, error);
  } else {
    console.log(`[Realtime INFO] Channel '${channel}' status: ${status}`);
  }
};