import { useEffect, useState, useRef, useCallback } from "react";
import { useOnlineAccount } from "./useOnlineAccount";
import { toast } from "sonner";

export const useAutoSync = () => {
  const { isOnlineMode, isDevMode, user, syncSettings } = useOnlineAccount();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const lastSettingsHash = useRef<string>("");

  // Generate hash of current settings to detect changes
  const getSettingsHash = useCallback(() => {
    const settings = {
      install_type: localStorage.getItem("urbanshade_install_type"),
      desktop_icons: localStorage.getItem("urbanshade_desktop_icons"),
      installed_apps: localStorage.getItem("urbanshade_installed_apps"),
      theme: localStorage.getItem("settings_theme"),
      bg_gradient_start: localStorage.getItem("settings_bg_gradient_start"),
      bg_gradient_end: localStorage.getItem("settings_bg_gradient_end"),
      animations: localStorage.getItem("settings_animations"),
      device_name: localStorage.getItem("settings_device_name"),
      accent_color: localStorage.getItem("settings_accent_color"),
    };
    return JSON.stringify(settings);
  }, []);

  // Perform sync with change detection
  const performSync = useCallback(async (force = false) => {
    if (isDevMode || !isOnlineMode || !user) return false;

    const currentHash = getSettingsHash();
    
    // Skip if no changes (unless forced)
    if (!force && currentHash === lastSettingsHash.current) {
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await syncSettings();
      lastSettingsHash.current = currentHash;
      setLastSyncTime(new Date());
      return true;
    } catch (err) {
      console.error("Auto-sync failed:", err);
      setSyncError("Sync failed");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isDevMode, isOnlineMode, user, syncSettings, getSettingsHash]);

  // Manual sync with toast feedback
  const manualSync = useCallback(async () => {
    const success = await performSync(true);
    if (success) {
      toast.success("Settings synced to cloud");
    } else if (!isOnlineMode) {
      toast.error("Online mode not enabled");
    } else if (!user) {
      toast.error("Not signed in");
    }
    return success;
  }, [performSync, isOnlineMode, user]);

  // Auto-sync every 2 minutes
  useEffect(() => {
    if (isDevMode || !isOnlineMode || !user) return;

    // Initial sync on mount
    performSync(true);

    // Set up interval (2 minutes = 120000ms)
    const interval = setInterval(() => {
      performSync();
    }, 120000);

    return () => clearInterval(interval);
  }, [isDevMode, isOnlineMode, user, performSync]);

  // Sync on beforeunload (save before closing)
  useEffect(() => {
    if (isDevMode || !isOnlineMode || !user) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable sync on close
      performSync(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDevMode, isOnlineMode, user, performSync]);

  return {
    lastSyncTime,
    isSyncing,
    syncError,
    manualSync,
    performSync,
    isEnabled: isOnlineMode && !!user && !isDevMode,
  };
};
