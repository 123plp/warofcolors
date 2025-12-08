// Terminal Script Runner
// Save and execute multiple terminal commands as a script

export interface TerminalScript {
  id: string;
  name: string;
  description?: string;
  commands: string[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

const SCRIPTS_KEY = 'urbanshade_terminal_scripts';

export const getScripts = (): TerminalScript[] => {
  try {
    const stored = localStorage.getItem(SCRIPTS_KEY);
    return stored ? JSON.parse(stored) : getDefaultScripts();
  } catch {
    return getDefaultScripts();
  }
};

const getDefaultScripts = (): TerminalScript[] => [
  {
    id: 'system-check',
    name: 'System Check',
    description: 'Run basic system diagnostics',
    commands: ['neofetch', 'uptime', 'whoami'],
    createdAt: new Date().toISOString(),
    runCount: 0
  },
  {
    id: 'dev-setup',
    name: 'Dev Setup',
    description: 'Enable developer mode and open DEF-DEV',
    commands: ['sudo set developer_mode true', 'echo "Dev mode enabled"'],
    createdAt: new Date().toISOString(),
    runCount: 0
  }
];

export const saveScript = (script: Omit<TerminalScript, 'id' | 'createdAt' | 'runCount'>): TerminalScript => {
  const scripts = getScripts();
  const newScript: TerminalScript = {
    ...script,
    id: `script_${Date.now()}`,
    createdAt: new Date().toISOString(),
    runCount: 0
  };
  scripts.push(newScript);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
  return newScript;
};

export const updateScript = (id: string, updates: Partial<TerminalScript>): boolean => {
  try {
    const scripts = getScripts();
    const index = scripts.findIndex(s => s.id === id);
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...updates };
      localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const deleteScript = (id: string): boolean => {
  try {
    const scripts = getScripts().filter(s => s.id !== id);
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
    return true;
  } catch {
    return false;
  }
};

export const markScriptRun = (id: string): void => {
  const scripts = getScripts();
  const script = scripts.find(s => s.id === id);
  if (script) {
    script.lastRun = new Date().toISOString();
    script.runCount++;
    localStorage.setItem(SCRIPTS_KEY, JSON.stringify(scripts));
  }
};

export const getScript = (id: string): TerminalScript | null => {
  return getScripts().find(s => s.id === id) || null;
};
