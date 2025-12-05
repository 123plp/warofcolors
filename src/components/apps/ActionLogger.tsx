import { useState, useEffect } from "react";
import { Activity, Filter, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { actionDispatcher, ActionEvent, ERROR_TYPES } from "@/lib/actionDispatcher";

interface LogEntry {
  time: string;
  type: "SYSTEM" | "APP" | "FILE" | "USER" | "SECURITY" | "WINDOW" | "ERROR";
  message: string;
  isError?: boolean;
}

export const ActionLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    // Initial system logs - no error spam
    const initialLogs: LogEntry[] = [
      { time: formatTime(new Date()), type: "SYSTEM", message: "Action Logger initialized" },
      { time: formatTime(new Date()), type: "SYSTEM", message: `LocalStorage: ${localStorage.length} entries loaded` },
    ];
    setLogs(initialLogs);

    // Subscribe to action dispatcher
    const unsubscribe = actionDispatcher.subscribe((action: ActionEvent) => {
      addLog(action.type, action.message);
    });

    // Listen for window events from the OS
    const handleWindowOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      addLog("WINDOW", `Opened: ${detail?.name || 'Unknown window'}`);
    };

    const handleWindowClose = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      addLog("WINDOW", `Closed: ${detail?.name || 'Unknown window'}`);
    };

    const handleAppAction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type && detail?.message) {
        addLog(detail.type, detail.message);
      }
    };

    const handleStorageChange = () => {
      addLog("FILE", "LocalStorage modified");
    };

    window.addEventListener('window-open', handleWindowOpen);
    window.addEventListener('window-close', handleWindowClose);
    window.addEventListener('defdev-action', handleAppAction);
    window.addEventListener('storage', handleStorageChange);

    // Dispatch initial event
    actionDispatcher.system("Action Logger connected to system bus");

    return () => {
      unsubscribe();
      window.removeEventListener('window-open', handleWindowOpen);
      window.removeEventListener('window-close', handleWindowClose);
      window.removeEventListener('defdev-action', handleAppAction);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const addLog = (type: LogEntry["type"], message: string) => {
    const isError = message.startsWith("!");
    const newLog: LogEntry = {
      time: formatTime(new Date()),
      type,
      message,
      isError
    };
    setLogs(prev => [newLog, ...prev].slice(0, 200));
  };

  const getTypeColor = (type: string, isError?: boolean) => {
    if (isError) return "bg-red-500/20 text-red-400 border-red-500/30";
    switch (type) {
      case "SYSTEM": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "APP": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "FILE": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "USER": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "SECURITY": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "WINDOW": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "ERROR": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const filteredLogs = filter === "ALL" ? logs : logs.filter(log => log.type === filter);

  const clearLogs = () => {
    setLogs([{ time: formatTime(new Date()), type: "SYSTEM", message: "Logs cleared" }]);
  };

  const triggerTestError = () => {
    actionDispatcher.dispatchError("FILE_NOT_FOUND", "Test error triggered by user");
    actionDispatcher.dispatchError("STORAGE_ERROR", "Simulated storage access failure");
    actionDispatcher.dispatchError("PERMISSION_DENIED", "Simulated permission check");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Action Logger</h2>
            <span className="text-xs text-muted-foreground">Live System Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerTestError}
              className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
              title="Trigger test errors"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`p-1.5 rounded transition-colors ${autoScroll ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
              title="Auto-scroll"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={clearLogs}
              className="p-1.5 rounded hover:bg-destructive/20 text-destructive transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["ALL", "SYSTEM", "APP", "FILE", "USER", "SECURITY", "WINDOW", "ERROR"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === type
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {type}
              {type !== "ALL" && (
                <span className="ml-1 opacity-70">
                  ({logs.filter(l => l.type === type).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Waiting for system events...</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                log.isError 
                  ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10' 
                  : 'bg-muted/30 border-border hover:bg-muted/50'
              }`}
            >
              <div className="text-muted-foreground text-xs min-w-[65px] font-mono">
                {log.time}
              </div>
              <div className={`px-2 py-0.5 rounded text-xs font-bold border ${getTypeColor(log.type, log.isError)}`}>
                {log.type}
              </div>
              <div className={`flex-1 text-xs ${log.isError ? 'text-red-400 font-semibold' : 'text-foreground'}`}>
                {log.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex justify-between text-xs">
          <div className="flex gap-4">
            <span className="text-muted-foreground">Total: <span className="text-foreground font-bold">{logs.length}</span></span>
            <span className="text-red-400">Errors: <span className="font-bold">{logs.filter(l => l.type === "ERROR" || l.isError).length}</span></span>
          </div>
          <span className="text-muted-foreground">
            Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
};
