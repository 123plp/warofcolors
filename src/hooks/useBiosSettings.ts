import { useState, useEffect, useCallback } from 'react';

export interface BiosSettings {
  // Boot settings
  fastBoot: boolean;
  bootLogo: boolean;
  secureBoot: boolean;
  bootTimeout: number;
  bootOrder: string[];
  
  // Advanced settings
  hyperThreading: boolean;
  virtualization: boolean;
  turboBoost: boolean;
  cStates: boolean;
  sataMode: 'ahci' | 'raid' | 'ide';
  pcieLinkSpeed: 'auto' | 'gen3' | 'gen4' | 'gen5';
  iommu: boolean;
  
  // Security settings
  tpmEnabled: boolean;
  adminPassword: string | null;
  bootPassword: string | null;
}

const DEFAULT_SETTINGS: BiosSettings = {
  fastBoot: false,
  bootLogo: true,
  secureBoot: true,
  bootTimeout: 3,
  bootOrder: ['hdd', 'usb', 'network'],
  hyperThreading: true,
  virtualization: true,
  turboBoost: true,
  cStates: true,
  sataMode: 'ahci',
  pcieLinkSpeed: 'gen4',
  iommu: true,
  tpmEnabled: true,
  adminPassword: null,
  bootPassword: null,
};

const STORAGE_KEY = 'bios_settings';

export const useBiosSettings = () => {
  const [settings, setSettings] = useState<BiosSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_SETTINGS;
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Persist settings on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Also store in session for boot sequence access
    sessionStorage.setItem('fast_boot_enabled', String(settings.fastBoot));
    sessionStorage.setItem('boot_timeout', String(settings.bootTimeout));
    sessionStorage.setItem('boot_logo_enabled', String(settings.bootLogo));
    sessionStorage.setItem('boot_order', JSON.stringify(settings.bootOrder));
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof BiosSettings>(
    key: K,
    value: BiosSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const toggleSetting = useCallback((key: keyof BiosSettings) => {
    setSettings(prev => {
      const current = prev[key];
      if (typeof current === 'boolean') {
        return { ...prev, [key]: !current };
      }
      return prev;
    });
    setHasChanges(true);
  }, []);

  const setBootOrder = useCallback((order: string[]) => {
    setSettings(prev => ({ ...prev, bootOrder: order }));
    setHasChanges(true);
  }, []);

  const loadDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  }, []);

  const saveChanges = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setHasChanges(false);
  }, [settings]);

  const setAdminPassword = useCallback((password: string | null) => {
    setSettings(prev => ({ ...prev, adminPassword: password }));
    setHasChanges(true);
  }, []);

  const setBootPassword = useCallback((password: string | null) => {
    setSettings(prev => ({ ...prev, bootPassword: password }));
    setHasChanges(true);
  }, []);

  const verifyAdminPassword = useCallback((password: string): boolean => {
    return settings.adminPassword === password;
  }, [settings.adminPassword]);

  const verifyBootPassword = useCallback((password: string): boolean => {
    return settings.bootPassword === password;
  }, [settings.bootPassword]);

  // Static getters for external use (like BootScreen)
  const getFastBoot = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).fastBoot ?? false;
      }
    } catch {}
    return false;
  };

  const getBootTimeout = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).bootTimeout ?? 3;
      }
    } catch {}
    return 3;
  };

  const getBootLogo = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).bootLogo ?? true;
      }
    } catch {}
    return true;
  };

  const getBootOrder = (): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored).bootOrder ?? ['hdd', 'usb', 'network'];
      }
    } catch {}
    return ['hdd', 'usb', 'network'];
  };

  const hasAdminPassword = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return !!JSON.parse(stored).adminPassword;
      }
    } catch {}
    return false;
  };

  return {
    settings,
    hasChanges,
    updateSetting,
    toggleSetting,
    setBootOrder,
    loadDefaults,
    saveChanges,
    setAdminPassword,
    setBootPassword,
    verifyAdminPassword,
    verifyBootPassword,
    getFastBoot,
    getBootTimeout,
    getBootLogo,
    getBootOrder,
    hasAdminPassword,
    DEFAULT_SETTINGS,
  };
};

// Static utility for external access without hook
export const getBiosSettings = (): BiosSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
};
