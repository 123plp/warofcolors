import { useState, useEffect, useCallback, useMemo } from "react";

export interface DndSchedule {
  enabled: boolean;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  days: number[]; // 0-6, Sunday = 0
}

export interface DndSettings {
  enabled: boolean;
  schedule: DndSchedule;
  allowPriority: boolean;
  allowAlarms: boolean;
  allowRepeatCallers: boolean;
}

const DEFAULT_SETTINGS: DndSettings = {
  enabled: false,
  schedule: {
    enabled: false,
    startHour: 22,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    days: [0, 1, 2, 3, 4, 5, 6] // All days
  },
  allowPriority: true,
  allowAlarms: true,
  allowRepeatCallers: false
};

export const useDoNotDisturb = () => {
  const [settings, setSettings] = useState<DndSettings>(() => {
    const saved = localStorage.getItem("dnd_settings");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    // Migrate from old format
    const oldDnd = localStorage.getItem("settings_dnd");
    if (oldDnd === "true") {
      return { ...DEFAULT_SETTINGS, enabled: true };
    }
    return DEFAULT_SETTINGS;
  });

  // Check if currently in scheduled DND time
  const isInScheduledTime = useMemo(() => {
    if (!settings.schedule.enabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    if (!settings.schedule.days.includes(currentDay)) return false;
    
    const startMinutes = settings.schedule.startHour * 60 + settings.schedule.startMinute;
    const endMinutes = settings.schedule.endHour * 60 + settings.schedule.endMinute;
    
    // Handle overnight schedules (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
    
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }, [settings.schedule]);

  // Effective DND status (manual OR scheduled)
  const isDndEnabled = settings.enabled || isInScheduledTime;

  // Persist settings
  useEffect(() => {
    localStorage.setItem("dnd_settings", JSON.stringify(settings));
    // Keep backward compatibility
    localStorage.setItem("settings_dnd", isDndEnabled.toString());
  }, [settings, isDndEnabled]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem("dnd_settings");
      if (saved) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Recheck scheduled time every minute
  useEffect(() => {
    if (!settings.schedule.enabled) return;
    
    const interval = setInterval(() => {
      // Force re-render to recheck schedule
      setSettings(s => ({ ...s }));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [settings.schedule.enabled]);

  const toggleDnd = useCallback(() => {
    setSettings(s => ({ ...s, enabled: !s.enabled }));
  }, []);

  const setDnd = useCallback((value: boolean) => {
    setSettings(s => ({ ...s, enabled: value }));
  }, []);

  const updateSchedule = useCallback((schedule: Partial<DndSchedule>) => {
    setSettings(s => ({
      ...s,
      schedule: { ...s.schedule, ...schedule }
    }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<DndSettings>) => {
    setSettings(s => ({ ...s, ...newSettings }));
  }, []);

  // Check if a notification should break through DND
  const shouldBreakthrough = useCallback((priority: boolean, isAlarm?: boolean) => {
    if (!isDndEnabled) return true;
    if (priority && settings.allowPriority) return true;
    if (isAlarm && settings.allowAlarms) return true;
    return false;
  }, [isDndEnabled, settings.allowPriority, settings.allowAlarms]);

  const getTimeUntilEnd = useCallback(() => {
    if (!isDndEnabled) return null;
    
    if (settings.enabled) return "Until manually disabled";
    
    if (isInScheduledTime) {
      const now = new Date();
      const endMinutes = settings.schedule.endHour * 60 + settings.schedule.endMinute;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      let diff = endMinutes - currentMinutes;
      if (diff < 0) diff += 24 * 60; // Next day
      
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      
      if (hours > 0) return `${hours}h ${mins}m remaining`;
      return `${mins}m remaining`;
    }
    
    return null;
  }, [isDndEnabled, settings.enabled, isInScheduledTime, settings.schedule]);

  return {
    isDndEnabled,
    isManualDnd: settings.enabled,
    isScheduledDnd: isInScheduledTime,
    settings,
    toggleDnd,
    setDnd,
    updateSchedule,
    updateSettings,
    shouldBreakthrough,
    getTimeUntilEnd
  };
};
