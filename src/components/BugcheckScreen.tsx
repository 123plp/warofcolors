import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Download, RefreshCw, Bug, Info, FileWarning, Terminal, Clock, MapPin, Cpu, HardDrive } from "lucide-react";
import { toast } from "sonner";

export interface BugcheckData {
  code: string;
  description: string;
  timestamp: string;
  location?: string;
  stackTrace?: string;
  systemInfo?: Record<string, string>;
}

interface BugcheckScreenProps {
  bugcheck: BugcheckData;
  onRestart: () => void;
  onReportToDev: () => void;
}

export const BugcheckScreen = ({ bugcheck, onRestart, onReportToDev }: BugcheckScreenProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const copyReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    navigator.clipboard.writeText(report);
    toast.success("Bugcheck report copied to clipboard");
  };

  const downloadReport = () => {
    const report = JSON.stringify(bugcheck, null, 2);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bugcheck_${bugcheck.code}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Save bugcheck to localStorage for DEF-DEV
  useEffect(() => {
    const existing = localStorage.getItem('urbanshade_bugchecks');
    const bugchecks = existing ? JSON.parse(existing) : [];
    bugchecks.push(bugcheck);
    localStorage.setItem('urbanshade_bugchecks', JSON.stringify(bugchecks.slice(-50)));
  }, [bugcheck]);

  // Get readable explanation based on bugcheck code
  const getReadableExplanation = (code: string): { title: string; explanation: string; severity: string; fix: string } => {
    const explanations: Record<string, { title: string; explanation: string; severity: string; fix: string }> = {
      ICON_COLLISION_FATAL: {
        title: "Desktop Layout Conflict",
        explanation: "Multiple desktop icons tried to occupy the same position for too long, causing the system to enter an unstable state.",
        severity: "MEDIUM",
        fix: "The system will reset icon positions on restart. If this persists, try resetting desktop settings."
      },
      RENDER_LOOP_DETECTED: {
        title: "Display Rendering Loop",
        explanation: "A component got stuck updating itself repeatedly, which would eventually consume all system resources.",
        severity: "HIGH",
        fix: "This is usually caused by a bug in the application. Try closing problematic apps before restart."
      },
      MEMORY_PRESSURE: {
        title: "Memory Exhaustion",
        explanation: "The system ran out of available memory due to too much data being stored or processed.",
        severity: "HIGH",
        fix: "Try clearing browser cache and localStorage. Reduce the number of open windows."
      },
      UNHANDLED_EXCEPTION: {
        title: "Unexpected Error",
        explanation: "An error occurred that the system wasn't prepared to handle, causing it to fail safely.",
        severity: "MEDIUM",
        fix: "This may be a bug. If reproducible, please report the steps that led to this error."
      },
      STATE_CORRUPTION: {
        title: "Data Integrity Failure",
        explanation: "System state data became corrupted or inconsistent, making it unsafe to continue.",
        severity: "CRITICAL",
        fix: "A system reset may be required. Try Recovery Mode if this happens repeatedly."
      },
      INFINITE_LOOP: {
        title: "Process Stuck",
        explanation: "A process entered an infinite loop and had to be terminated to prevent system freeze.",
        severity: "MEDIUM",
        fix: "The problematic process was stopped. If caused by a specific action, avoid that action."
      }
    };
    
    return explanations[code] || {
      title: "System Error",
      explanation: "An unexpected system error occurred that required the system to stop.",
      severity: "UNKNOWN",
      fix: "Try restarting the system. If the error persists, enter Recovery Mode."
    };
  };

  const readableInfo = getReadableExplanation(bugcheck.code);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-500/20 border-red-500/50";
      case "HIGH": return "text-orange-400 bg-orange-500/20 border-orange-500/50";
      case "MEDIUM": return "text-amber-400 bg-amber-500/20 border-amber-500/50";
      default: return "text-gray-400 bg-gray-500/20 border-gray-500/50";
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1a0505] via-[#0d0d0d] to-[#1a0505] text-gray-100 flex flex-col font-mono z-[9999] overflow-hidden">
      {/* Aggressive animated background for stress effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,50,50,0.15) 2px, rgba(255,50,50,0.15) 4px)'
        }} />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/80 via-red-400 to-red-500/80 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/60 via-red-400 to-red-500/60 animate-pulse" />
        {/* Flickering effect */}
        <div className="absolute inset-0 bg-red-500/5 animate-pulse" style={{ animationDuration: '0.15s' }} />
      </div>

      {/* Header - more alarming */}
      <div className="bg-gradient-to-r from-red-900/80 via-red-800/60 to-red-900/80 border-b-2 border-red-500/60 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
              <Bug className="w-10 h-10 text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">!</div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-red-400 tracking-wide animate-pulse">⚠ SYSTEM BUGCHECK ⚠</h1>
            <p className="text-sm text-red-300/80 mt-1">A critical error has occurred — the system has been stopped to prevent damage</p>
          </div>
          <div className={`px-4 py-2 rounded-lg border-2 ${getSeverityColor(readableInfo.severity)} animate-pulse`}>
            <span className="text-sm font-bold">SEVERITY: {readableInfo.severity}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          
          {/* CRITICAL WARNING - MAXIMUM STRESS */}
          <div className="p-6 bg-red-900/40 border-2 border-red-500/70 rounded-xl shadow-lg shadow-red-500/20 animate-pulse" style={{ animationDuration: '2s' }}>
            <div className="flex items-start gap-4">
              <div className="relative">
                <AlertTriangle className="w-10 h-10 text-red-400 flex-shrink-0 animate-bounce" style={{ animationDuration: '0.5s' }} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-red-400">⚠️ THIS IS NOT A SIMULATION ⚠️</h2>
                <p className="text-base text-red-200 leading-relaxed font-medium">
                  <strong>A REAL ERROR occurred in the system.</strong> This is NOT part of the game, NOT a prank, 
                  and NOT intentional (unless you triggered it via DEF-DEV admin tools).
                </p>
                <p className="text-sm text-red-300/80 leading-relaxed">
                  The system detected a condition that would have caused instability, data corruption, or a crash 
                  if allowed to continue. To protect your data and the application state, execution was halted.
                </p>
                <div className="p-3 bg-black/40 rounded-lg border border-red-500/30 mt-2">
                  <p className="text-xs text-red-300/70 leading-relaxed">
                    <strong className="text-red-400">Why are you seeing this?</strong> Something in the code encountered 
                    an unrecoverable state. This could be a bug, corrupted data, a browser issue, or an edge case we didn't 
                    anticipate. <strong>Please report this</strong> — it helps us fix the issue for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Code Display - More prominent */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-black/60 border-2 border-red-500/50 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <FileWarning className="w-5 h-5 text-red-400" />
                <span className="text-xs text-red-400 uppercase tracking-wider font-bold">BUGCHECK CODE</span>
              </div>
              <div className="text-3xl font-bold text-red-400 font-mono break-all animate-pulse">{bugcheck.code}</div>
              <div className="text-base text-gray-300 mt-2 font-semibold">{readableInfo.title}</div>
            </div>

            <div className="p-5 bg-black/50 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Timestamp</span>
              </div>
              <div className="text-lg font-mono text-gray-300">
                {new Date(bugcheck.timestamp).toLocaleString()}
              </div>
              {bugcheck.location && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="font-mono">{bugcheck.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Memory dump style technical info */}
          <div className="p-4 bg-black/70 border border-gray-700 rounded-xl font-mono text-xs overflow-x-auto">
            <div className="text-gray-500 mb-2">*** BUGCHECK MEMORY DUMP ***</div>
            <div className="space-y-1 text-gray-400">
              <div>STOP: 0x{bugcheck.code.split('').map(c => c.charCodeAt(0).toString(16)).join('').toUpperCase().slice(0, 8)}</div>
              <div>PROCESS: {bugcheck.location || 'system.exe'}</div>
              <div>TIME: {bugcheck.timestamp}</div>
              <div>BUILD: UrbanShade OS 22621.2428</div>
              {bugcheck.systemInfo && Object.entries(bugcheck.systemInfo).map(([k, v]) => (
                <div key={k}>{k.toUpperCase()}: {v}</div>
              ))}
            </div>
          </div>

          {/* What Happened Section */}
          <div className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-cyan-400">What Happened?</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">{readableInfo.explanation}</p>
            <div className="p-4 bg-black/30 rounded-lg border border-white/5">
              <div className="text-xs text-gray-500 uppercase mb-2 font-semibold">Original Error Message</div>
              <p className="text-gray-400 text-sm">{bugcheck.description}</p>
            </div>
          </div>

          {/* How to Fix Section */}
          <div className="p-5 bg-green-900/10 border border-green-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h3 className="font-bold text-green-400">How to Fix This</h3>
            </div>
            <p className="text-green-200/80 text-sm leading-relaxed">{readableInfo.fix}</p>
          </div>

          {/* Technical Details Accordion */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-4 bg-gray-900/50 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-300">System Information</span>
              </div>
              <span className="text-xs text-gray-500">{showDetails ? "▼" : "▶"}</span>
            </button>
            
            {showDetails && bugcheck.systemInfo && (
              <div className="p-4 bg-black/60 border-t border-white/5 grid grid-cols-2 gap-3">
                {Object.entries(bugcheck.systemInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-500">{key}</span>
                    <span className="text-gray-300 font-mono">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stack Trace Accordion */}
          {bugcheck.stackTrace && (
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowStackTrace(!showStackTrace)}
                className="w-full p-4 bg-gray-900/50 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-300">Stack Trace (Technical)</span>
                </div>
                <span className="text-xs text-gray-500">{showStackTrace ? "▼" : "▶"}</span>
              </button>
              
              {showStackTrace && (
                <div className="p-4 bg-black/60 border-t border-white/5">
                  <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono">
                    {bugcheck.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* DEF-DEV Info */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-300/90 font-medium mb-1">
                  This error has been logged to DEF-DEV
                </p>
                <p className="text-xs text-amber-300/60">
                  You can view this and other bugcheck reports in the DEF-DEV Console under "Bugcheck Reports".
                  Share the report with developers for analysis if needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer - More prominent */}
      <div className="border-t-2 border-red-500/40 bg-gradient-to-r from-black/80 via-red-900/20 to-black/80 p-5">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          <button
            onClick={copyReport}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm border border-gray-600"
          >
            <Copy className="w-4 h-4" />
            Copy Report
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm border border-gray-600"
          >
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button
            onClick={onReportToDev}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors text-white text-sm font-bold border-2 border-amber-400"
          >
            <Bug className="w-4 h-4" />
            Open DEF-DEV Console
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 rounded-lg transition-colors text-white font-bold text-sm border-2 border-red-400 animate-pulse"
            style={{ animationDuration: '2s' }}
          >
            <RefreshCw className="w-4 h-4" />
            RESTART SYSTEM
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4">
          💡 Please report this bugcheck if you can reproduce it. Include the steps you took before this appeared.
        </p>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-black/80 text-center text-xs text-gray-600 border-t border-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span>URBANSHADE OS Bugcheck Handler • Build 22621.2428</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Helper to create bugcheck
export const createBugcheck = (
  code: string, 
  description: string, 
  location?: string,
  stackTrace?: string
): BugcheckData => ({
  code,
  description,
  timestamp: new Date().toISOString(),
  location,
  stackTrace,
  systemInfo: {
    userAgent: navigator.userAgent.slice(0, 100),
    localStorage: `${localStorage.length} entries`,
    memory: (performance as any).memory?.usedJSHeapSize 
      ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` 
      : 'N/A',
    url: window.location.pathname
  }
});

// Bugcheck codes
export const BUGCHECK_CODES = {
  ICON_COLLISION_FATAL: "ICON_COLLISION_FATAL",
  RENDER_LOOP_DETECTED: "RENDER_LOOP_DETECTED", 
  MEMORY_PRESSURE: "MEMORY_PRESSURE",
  UNHANDLED_EXCEPTION: "UNHANDLED_EXCEPTION",
  STATE_CORRUPTION: "STATE_CORRUPTION",
  INFINITE_LOOP: "INFINITE_LOOP"
} as const;