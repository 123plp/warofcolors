// Crash Dump System
// Save detailed crash info as downloadable .dmp files

import { BUGCHECK_CODES } from "@/components/BugcheckScreen";

export interface CrashDump {
  id: string;
  timestamp: string;
  stopCode: string;
  hexCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  description: string;
  location?: string;
  stackTrace?: string;
  systemState: {
    localStorage: Record<string, string>;
    windowCount: number;
    memoryUsage?: number;
    userAgent: string;
    screenSize: string;
    url: string;
  };
  processInfo: {
    activeWindows: string[];
    lastActions: string[];
  };
}

const CRASH_DUMPS_KEY = 'urbanshade_crash_dumps';
const MAX_DUMPS = 20;

export const getCrashDumps = (): CrashDump[] => {
  try {
    const stored = localStorage.getItem(CRASH_DUMPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const createCrashDump = (
  stopCode: string,
  description: string,
  location?: string,
  stackTrace?: string,
  additionalInfo?: Partial<CrashDump>
): CrashDump => {
  const codeInfo = BUGCHECK_CODES[stopCode] || {
    hex: '0x000000DE',
    severity: 'CRITICAL' as const
  };

  // Collect localStorage state (limited to prevent huge dumps)
  const localStorageState: Record<string, string> = {};
  const importantKeys = [
    'urbanshade_current_user',
    'urbanshade_system_state',
    'settings_developer_mode',
    'urbanshade_bugchecks'
  ];
  
  for (const key of importantKeys) {
    const val = localStorage.getItem(key);
    if (val) {
      localStorageState[key] = val.length > 500 ? val.substring(0, 500) + '...' : val;
    }
  }

  const dump: CrashDump = {
    id: `dump_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    stopCode,
    hexCode: codeInfo.hex,
    severity: codeInfo.severity,
    description,
    location,
    stackTrace,
    systemState: {
      localStorage: localStorageState,
      windowCount: document.querySelectorAll('[data-window]').length,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
      userAgent: navigator.userAgent,
      screenSize: `${screen.width}x${screen.height}`,
      url: window.location.href
    },
    processInfo: {
      activeWindows: [],
      lastActions: []
    },
    ...additionalInfo
  };

  return dump;
};

export const saveCrashDump = (dump: CrashDump): boolean => {
  try {
    const dumps = getCrashDumps();
    dumps.unshift(dump);
    
    // Keep only last MAX_DUMPS
    const trimmed = dumps.slice(0, MAX_DUMPS);
    localStorage.setItem(CRASH_DUMPS_KEY, JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
};

export const deleteCrashDump = (id: string): boolean => {
  try {
    const dumps = getCrashDumps().filter(d => d.id !== id);
    localStorage.setItem(CRASH_DUMPS_KEY, JSON.stringify(dumps));
    return true;
  } catch {
    return false;
  }
};

export const clearAllCrashDumps = (): void => {
  localStorage.removeItem(CRASH_DUMPS_KEY);
};

export const downloadCrashDump = (dump: CrashDump): void => {
  const content = formatDumpForDownload(dump);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dump.stopCode}_${dump.id}.dmp`;
  a.click();
  URL.revokeObjectURL(url);
};

const formatDumpForDownload = (dump: CrashDump): string => {
  return `================================================================================
URBANSHADE OS CRASH DUMP
================================================================================

STOP CODE: ${dump.stopCode} (${dump.hexCode})
SEVERITY:  ${dump.severity}
TIMESTAMP: ${dump.timestamp}
DUMP ID:   ${dump.id}

================================================================================
ERROR DESCRIPTION
================================================================================

${dump.description}

${dump.location ? `Location: ${dump.location}` : ''}

================================================================================
STACK TRACE
================================================================================

${dump.stackTrace || 'No stack trace available'}

================================================================================
SYSTEM STATE
================================================================================

User Agent: ${dump.systemState.userAgent}
Screen:     ${dump.systemState.screenSize}
URL:        ${dump.systemState.url}
Windows:    ${dump.systemState.windowCount} open
Memory:     ${dump.systemState.memoryUsage ? Math.round(dump.systemState.memoryUsage / 1024 / 1024) + ' MB' : 'N/A'}

================================================================================
LOCAL STORAGE SNAPSHOT
================================================================================

${Object.entries(dump.systemState.localStorage).map(([k, v]) => `${k}: ${v}`).join('\n\n')}

================================================================================
PROCESS INFO
================================================================================

Active Windows: ${dump.processInfo.activeWindows.join(', ') || 'None recorded'}
Last Actions:   ${dump.processInfo.lastActions.join(', ') || 'None recorded'}

================================================================================
END OF DUMP
================================================================================
`;
};

// Auto-create dump on bugcheck
export const createAndSaveDumpFromBugcheck = (
  stopCode: string,
  description: string,
  location?: string,
  stackTrace?: string
): CrashDump => {
  const dump = createCrashDump(stopCode, description, location, stackTrace);
  saveCrashDump(dump);
  return dump;
};
