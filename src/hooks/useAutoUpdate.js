
import { useState, useEffect, useCallback } from 'react';

const POLL_INTERVAL = 45000; // 45 seconds
const CACHE_KEY = 'app_version_hash';

export function useAutoUpdate() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(localStorage.getItem(CACHE_KEY) || null);
  const [latestVersion, setLatestVersion] = useState(null);

  const checkForUpdates = useCallback(async () => {
    try {
      // Append timestamp to prevent caching the version.json file
      const response = await fetch(`/version.json?t=${new Date().getTime()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (!currentVersion) {
        // First load, just set the version
        localStorage.setItem(CACHE_KEY, data.hash);
        setCurrentVersion(data.hash);
      } else if (data.hash && data.hash !== currentVersion) {
        // New version detected
        setLatestVersion(data.hash);
        setIsUpdateAvailable(true);
        
        // Note: Task 2 requested a silent automatic reload, but Task 3 requests a manual banner.
        // We set the state to true so the banner can handle it interactively. 
        // If strict forced reload is required instead of the banner, uncomment the next line:
        // window.location.reload(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }, [currentVersion]);

  useEffect(() => {
    checkForUpdates();
    const interval = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return { isUpdateAvailable, currentVersion, latestVersion, checkForUpdates };
}
