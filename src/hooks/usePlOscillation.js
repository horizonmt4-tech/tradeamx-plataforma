// This hook is deprecated and has been replaced by useRealTimePL.jsx
// Keeping file to prevent breakages, but it should not be used.
export const usePlOscillation = (pl) => pl;
export const useRealTimePL = (trade) => trade.profit_loss || 0;
export const useTotalPL = (trades) => 0;
export const TradeMetricsDisplay = () => null;
export default useRealTimePL;