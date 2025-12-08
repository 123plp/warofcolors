// DEF-DEV Configuration Export/Import
// Save and restore DEF-DEV preferences

export interface DefDevConfig {
  version: string;
  exportedAt: string;
  preferences: {
    filter: string;
    actionFilter: string;
    showTechnical: boolean;
    selectedTab: string;
    warningAccepted: boolean;
    actionPersistenceEnabled: boolean;
  };
  customSettings: Record<string, any>;
}

const CONFIG_VERSION = '1.0';

export const exportDefDevConfig = (): DefDevConfig => {
  const config: DefDevConfig = {
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: {
      filter: localStorage.getItem('def_dev_filter') || 'all',
      actionFilter: localStorage.getItem('def_dev_action_filter') || 'ALL',
      showTechnical: localStorage.getItem('def_dev_show_technical') !== 'false',
      selectedTab: localStorage.getItem('def_dev_selected_tab') || 'console',
      warningAccepted: localStorage.getItem('def_dev_warning_accepted') === 'true',
      actionPersistenceEnabled: localStorage.getItem('def_dev_actions_consent') === 'true'
    },
    customSettings: {}
  };

  // Collect any def_dev prefixed settings
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('def_dev_') && !Object.keys(config.preferences).some(p => key.includes(p))) {
      config.customSettings[key] = localStorage.getItem(key);
    }
  }

  return config;
};

export const downloadDefDevConfig = (): void => {
  const config = exportDefDevConfig();
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `def-dev-config_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importDefDevConfig = (configJson: string): { success: boolean; error?: string } => {
  try {
    const config = JSON.parse(configJson) as DefDevConfig;
    
    // Validate
    if (!config.version || !config.preferences) {
      return { success: false, error: 'Invalid config format' };
    }

    // Apply preferences
    const { preferences, customSettings } = config;
    
    if (preferences.filter) localStorage.setItem('def_dev_filter', preferences.filter);
    if (preferences.actionFilter) localStorage.setItem('def_dev_action_filter', preferences.actionFilter);
    localStorage.setItem('def_dev_show_technical', String(preferences.showTechnical));
    if (preferences.selectedTab) localStorage.setItem('def_dev_selected_tab', preferences.selectedTab);
    localStorage.setItem('def_dev_warning_accepted', String(preferences.warningAccepted));
    localStorage.setItem('def_dev_actions_consent', String(preferences.actionPersistenceEnabled));

    // Apply custom settings
    for (const [key, value] of Object.entries(customSettings)) {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, String(value));
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to parse config file' };
  }
};

export const resetDefDevConfig = (): void => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('def_dev_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};
