export const logMarketData = (context: string, data: any, type: 'info' | 'error' | 'warning' = 'info') => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    context,
    type,
    data,
  };

  // In a real production environment, you might send this to a logging service (e.g., Logtail, Sentry)
  // For now, we log to the console which Supabase captures.
  console.log(JSON.stringify(logEntry));
};

export const formatError = (error: any) => {
  return {
    message: error.message || 'Unknown error',
    stack: error.stack,
    name: error.name,
  };
};