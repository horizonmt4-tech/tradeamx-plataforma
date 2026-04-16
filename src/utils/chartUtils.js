export const validateChartContainer = (containerRef) => {
  if (!containerRef || !containerRef.current) {
    console.warn("Chart container ref is not attached.");
    return false;
  }
  // Check if it's actually in the DOM
  if (!document.body.contains(containerRef.current)) {
    console.warn("Chart container is not in the DOM.");
    return false;
  }
  return true;
};

export const safeRemoveChart = (chartInstance) => {
  if (!chartInstance) return;
  try {
    // Attempt to remove the chart
    chartInstance.remove();
  } catch (error) {
    console.warn("Error while removing chart instance (may already be disposed):", error);
  }
};