import { useState, useEffect } from "react";
import { Skull, FileText, RefreshCw, Download, Copy, Lightbulb, Play, Clock, Layers, AlertTriangle, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BUGCHECK_CODES } from "@/components/BugcheckScreen";
import { VERSION } from "@/lib/versionInfo";

interface CrashReport {
  id: string;
  stopCode: string;
  stopCodeName: string;
  description: string;
  timestamp: string;
  stackTrace: string[];
  componentTree: string[];
  systemInfo: Record<string, string>;
  location?: string;
  module?: string;
  suggestions: string[];
}

export const CrashAnalyzerTab = () => {
  const [crashReports, setCrashReports] = useState<CrashReport[]>([]);
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stack', 'suggestions']));

  useEffect(() => {
    // Load crash dumps from localStorage
    const dumpKeys = Object.keys(localStorage).filter(k => k.startsWith('urbanshade_dump_'));
    const dumps: CrashReport[] = [];

    for (const key of dumpKeys) {
      try {
        const dump = JSON.parse(localStorage.getItem(key) || '{}');
        if (dump.stopCode) {
          const codeInfo = BUGCHECK_CODES[dump.stopCode as keyof typeof BUGCHECK_CODES];
          dumps.push({
            id: key,
            stopCode: dump.stopCode,
            stopCodeName: codeInfo?.category || dump.stopCode,
            description: dump.description || codeInfo?.userDescription || 'Unknown error',
            timestamp: dump.timestamp || new Date().toISOString(),
            stackTrace: generateStackTrace(dump.stopCode, dump.location),
            componentTree: generateComponentTree(),
            systemInfo: dump.systemInfo || {
              browser: navigator.userAgent.slice(0, 50),
              platform: navigator.platform,
              memory: 'Available',
              url: window.location.href
            },
            location: dump.location,
            module: dump.module,
            suggestions: generateSuggestions(dump.stopCode)
          });
        }
      } catch {}
    }

    // Also load from bugchecks
    const bugchecks = JSON.parse(localStorage.getItem('urbanshade_bugchecks') || '[]');
    for (const bc of bugchecks) {
      if (!dumps.find(d => d.stopCode === bc.code && d.timestamp === bc.timestamp)) {
        const codeInfo = BUGCHECK_CODES[bc.code as keyof typeof BUGCHECK_CODES];
        dumps.push({
          id: `bc-${bc.timestamp}`,
          stopCode: bc.code,
          stopCodeName: codeInfo?.category || bc.code,
          description: bc.description,
          timestamp: bc.timestamp,
          stackTrace: generateStackTrace(bc.code, bc.location),
          componentTree: generateComponentTree(),
          systemInfo: bc.systemInfo || {},
          location: bc.location,
          suggestions: generateSuggestions(bc.code)
        });
      }
    }

    // Sort by timestamp, newest first
    dumps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setCrashReports(dumps);

    if (dumps.length > 0 && !selectedCrash) {
      setSelectedCrash(dumps[0]);
    }
  }, []);

  const generateStackTrace = (code: string, location?: string): string[] => {
    const traces: Record<string, string[]> = {
      'MEMORY_MANAGEMENT': [
        'at allocateMemory (src/lib/memoryManager.ts:45)',
        'at WindowManager.createWindow (src/components/WindowManager.tsx:123)',
        'at Desktop.handleAppLaunch (src/components/Desktop.tsx:89)',
        'at onClick (src/components/DesktopIcon.tsx:34)',
        'at HTMLButtonElement.dispatchEvent (<anonymous>)'
      ],
      'DRIVER_IRQL_NOT_LESS_OR_EQUAL': [
        'at IRQLCheck (src/lib/drivers/irql.ts:12)',
        'at NetworkDriver.initialize (src/lib/drivers/network.ts:56)',
        'at SystemBus.registerDriver (src/lib/systemBus.ts:78)',
        'at boot (src/main.tsx:23)'
      ],
      'CRITICAL_PROCESS_DIED': [
        'at Process.terminate (src/lib/processManager.ts:89)',
        'at SystemMonitor.checkHealth (src/components/apps/SystemMonitor.tsx:45)',
        'at setInterval (<anonymous>)'
      ]
    };
    
    return traces[code] || [
      `at ${location || 'unknown'} (unknown:0)`,
      'at executeOperation (src/lib/runtime.ts:34)',
      'at React.createElement (<anonymous>)',
      'at renderWithHooks (react-dom.development.js:14985)'
    ];
  };

  const generateComponentTree = (): string[] => {
    return [
      'App',
      '└─ Desktop',
      '   ├─ Taskbar',
      '   ├─ WindowManager',
      '   │  └─ Window (crashed)',
      '   │     └─ [Component]',
      '   ├─ StartMenu',
      '   └─ NotificationCenter'
    ];
  };

  const generateSuggestions = (code: string): string[] => {
    const suggestions: Record<string, string[]> = {
      'MEMORY_MANAGEMENT': [
        'Clear browser cache and local storage',
        'Close other windows to free memory',
        'Check for memory leaks in custom apps',
        'Reduce number of concurrent windows'
      ],
      'DRIVER_IRQL_NOT_LESS_OR_EQUAL': [
        'Update network drivers',
        'Check network connectivity',
        'Disable hardware acceleration',
        'Reset network stack settings'
      ],
      'CRITICAL_PROCESS_DIED': [
        'Restart the affected application',
        'Check for conflicting extensions',
        'Verify system file integrity',
        'Review recent changes'
      ],
      'KERNEL_DATA_INPAGE_ERROR': [
        'Check storage device health',
        'Clear corrupted cache entries',
        'Verify localStorage integrity',
        'Reset to factory defaults'
      ]
    };
    
    return suggestions[code] || [
      'Try restarting the application',
      'Clear local storage data',
      'Check console for additional errors',
      'Report issue to developers'
    ];
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const exportCrashReport = (crash: CrashReport) => {
    const report = {
      ...crash,
      exportedAt: new Date().toISOString(),
      version: VERSION.fullVersion
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crash_report_${crash.stopCode}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyStackTrace = (crash: CrashReport) => {
    const text = crash.stackTrace.join('\n');
    navigator.clipboard.writeText(text);
  };

  const reproduceCrash = (crash: CrashReport) => {
    console.warn(`[DEF-DEV] Attempting to reproduce crash: ${crash.stopCode}`);
    console.log('Stack trace:', crash.stackTrace);
    console.log('Component tree:', crash.componentTree);
    // In real implementation, this would replay the crash conditions
  };

  const deleteCrashReport = (crash: CrashReport) => {
    localStorage.removeItem(crash.id);
    setCrashReports(prev => prev.filter(c => c.id !== crash.id));
    if (selectedCrash?.id === crash.id) {
      setSelectedCrash(crashReports.find(c => c.id !== crash.id) || null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
        <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
          <Skull className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold">Crash Analyzer</h2>
          <p className="text-xs text-slate-500">{crashReports.length} crash reports</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Crash list */}
        <div className="w-64 border-r border-slate-800 flex flex-col">
          <div className="p-2 border-b border-slate-800">
            <span className="text-xs text-slate-500">Recent Crashes</span>
          </div>
          <ScrollArea className="flex-1">
            {crashReports.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Skull className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No crash reports</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {crashReports.map(crash => (
                  <button
                    key={crash.id}
                    onClick={() => setSelectedCrash(crash)}
                    className={`w-full p-3 text-left transition-colors ${
                      selectedCrash?.id === crash.id ? 'bg-red-500/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-sm font-mono text-red-400">{crash.stopCode}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{crash.stopCodeName}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {new Date(crash.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Crash details */}
        {selectedCrash ? (
          <div className="flex-1 flex flex-col">
            {/* Crash header */}
            <div className="p-4 border-b border-slate-800 bg-red-500/5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-mono font-bold text-red-400">{selectedCrash.stopCode}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">FATAL</span>
                  </div>
                  <p className="text-sm text-slate-300">{selectedCrash.stopCodeName}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedCrash.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => reproduceCrash(selectedCrash)}>
                    <Play className="w-4 h-4 mr-1" />
                    Reproduce
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportCrashReport(selectedCrash)}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCrashReport(selectedCrash)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Stack Trace */}
                <Card className="border-slate-700 overflow-hidden">
                  <button
                    onClick={() => toggleSection('stack')}
                    className="w-full p-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-medium">Stack Trace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); copyStackTrace(selectedCrash); }}>
                        <Copy className="w-3 h-3" />
                      </Button>
                      {expandedSections.has('stack') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </button>
                  {expandedSections.has('stack') && (
                    <div className="p-3 bg-slate-900/50">
                      <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                        {selectedCrash.stackTrace.map((line, i) => (
                          <div key={i} className={`py-0.5 ${i === 0 ? 'text-red-400' : ''}`}>
                            {line}
                          </div>
                        ))}
                      </pre>
                    </div>
                  )}
                </Card>

                {/* Component Tree */}
                <Card className="border-slate-700 overflow-hidden">
                  <button
                    onClick={() => toggleSection('tree')}
                    className="w-full p-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium">Component Tree at Crash</span>
                    </div>
                    {expandedSections.has('tree') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSections.has('tree') && (
                    <div className="p-3 bg-slate-900/50">
                      <pre className="text-xs font-mono text-slate-300">
                        {selectedCrash.componentTree.map((line, i) => (
                          <div key={i} className={line.includes('crashed') ? 'text-red-400' : ''}>
                            {line}
                          </div>
                        ))}
                      </pre>
                    </div>
                  )}
                </Card>

                {/* Auto-fix Suggestions */}
                <Card className="border-slate-700 overflow-hidden">
                  <button
                    onClick={() => toggleSection('suggestions')}
                    className="w-full p-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium">Auto-fix Suggestions</span>
                    </div>
                    {expandedSections.has('suggestions') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSections.has('suggestions') && (
                    <div className="p-3 bg-slate-900/50 space-y-2">
                      {selectedCrash.suggestions.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                          <span className="text-amber-400 font-bold text-xs">{i + 1}.</span>
                          <span className="text-xs text-slate-300">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* System Info */}
                <Card className="border-slate-700 overflow-hidden">
                  <button
                    onClick={() => toggleSection('sysinfo')}
                    className="w-full p-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">System Information</span>
                    </div>
                    {expandedSections.has('sysinfo') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  {expandedSections.has('sysinfo') && (
                    <div className="p-3 bg-slate-900/50 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-300">{new Date(selectedCrash.timestamp).toLocaleString()}</span>
                      </div>
                      {Object.entries(selectedCrash.systemInfo).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-slate-500 capitalize">{key}:</span>
                          <span className="text-slate-300 truncate max-w-[200px]">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Skull className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Select a crash report to analyze</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrashAnalyzerTab;
