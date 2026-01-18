import { useState, useEffect } from "react";
import { 
  ArrowLeft, Power, Settings, Terminal, Database, HardDrive, 
  Shield, RefreshCw, Wrench, ChevronRight, Check, AlertTriangle,
  Cpu, Trash2
} from "lucide-react";

type RecoveryScreen = 
  | "main" 
  | "troubleshoot" 
  | "startup-settings" 
  | "data-recovery" 
  | "system-image"
  | "recovery-image";

interface RecoveryEnvironmentProps {
  onContinue: () => void;
  onShutdown: () => void;
  onBootToBios: () => void;
  onTerminalBoot: () => void;
  onSafeMode: () => void;
  onOfflineMode: () => void;
}

export const RecoveryEnvironment = ({
  onContinue,
  onShutdown,
  onBootToBios,
  onTerminalBoot,
  onSafeMode,
  onOfflineMode,
}: RecoveryEnvironmentProps) => {
  const [screen, setScreen] = useState<RecoveryScreen>("main");
  const [selectedOption, setSelectedOption] = useState(0);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [recoveryStatus, setRecoveryStatus] = useState("");
  const [recoveredItems, setRecoveredItems] = useState<string[]>([]);
  const [recoveryImages, setRecoveryImages] = useState<any[]>([]);
  const [bootLogging, setBootLogging] = useState(false);
  const [forceVerification, setForceVerification] = useState(false);
  const [disableAutoRestart, setDisableAutoRestart] = useState(false);

  // Load recovery images from localStorage
  useEffect(() => {
    const images = localStorage.getItem("urbanshade_recovery_images");
    if (images) {
      try {
        setRecoveryImages(JSON.parse(images));
      } catch {}
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        setSelectedOption(prev => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        setSelectedOption(prev => prev + 1);
      } else if (e.key === "Enter") {
        handleOptionSelect();
      } else if (e.key === "Escape" || e.key === "Backspace") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen, selectedOption]);

  const handleBack = () => {
    if (screen === "troubleshoot") setScreen("main");
    else if (screen === "startup-settings" || screen === "data-recovery" || screen === "system-image" || screen === "recovery-image") {
      setScreen("troubleshoot");
    }
    setSelectedOption(0);
  };

  const handleOptionSelect = () => {
    // Implementation varies by screen
  };

  const runDataRecovery = async () => {
    setRecoveryProgress(0);
    setRecoveryStatus("Scanning localStorage...");
    setRecoveredItems([]);

    const steps = [
      { progress: 10, status: "Checking key integrity..." },
      { progress: 30, status: "Validating JSON structures..." },
      { progress: 50, status: "Scanning for orphaned data..." },
      { progress: 70, status: "Attempting repairs..." },
      { progress: 90, status: "Verifying data consistency..." },
      { progress: 100, status: "Scan complete" },
    ];

    const recovered: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            JSON.parse(value);
          }
        } catch {
          recovered.push(key);
        }
      }
    }

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 400));
      setRecoveryProgress(step.progress);
      setRecoveryStatus(step.status);
    }

    setRecoveredItems(recovered);
  };

  const applyStartupSetting = (setting: string) => {
    switch (setting) {
      case "safe-mode":
        sessionStorage.setItem("urbanshade_safe_mode", "true");
        onSafeMode();
        break;
      case "safe-mode-terminal":
        sessionStorage.setItem("urbanshade_safe_mode", "true");
        sessionStorage.setItem("urbanshade_terminal_only", "true");
        onTerminalBoot();
        break;
      case "offline-mode":
        sessionStorage.setItem("urbanshade_offline_mode", "true");
        onOfflineMode();
        break;
      case "boot-logging":
        setBootLogging(true);
        sessionStorage.setItem("urbanshade_boot_logging", "true");
        break;
      case "force-verification":
        setForceVerification(true);
        sessionStorage.setItem("urbanshade_force_verify", "true");
        break;
      case "disable-auto-restart":
        setDisableAutoRestart(true);
        sessionStorage.setItem("urbanshade_no_auto_restart", "true");
        break;
      case "clear-cache":
        // Clear non-essential caches
        const essentialKeys = [
          "urbanshade_admin",
          "urbanshade_accounts",
          "urbanshade_oobe_complete",
          "urbanshade_disclaimer_accepted",
          "urbanshade_install_type",
        ];
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && !essentialKeys.includes(key) && !key.startsWith("urbanshade_admin")) {
            if (key.includes("cache") || key.includes("temp") || key.includes("session")) {
              localStorage.removeItem(key);
            }
          }
        }
        break;
    }
  };

  const loadRecoveryImage = (image: any) => {
    if (!image?.data) return;
    
    // Apply recovery image data
    Object.entries(image.data).forEach(([key, value]) => {
      if (key !== "urbanshade_recovery_images") {
        localStorage.setItem(key, value as string);
      }
    });
    
    onContinue();
  };

  // Main Menu
  if (screen === "main") {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-10 h-10 text-cyan-400" />
              <h1 className="text-3xl font-light text-white">Recovery Environment</h1>
            </div>
            <p className="text-slate-400 text-sm">Choose an option</p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={onContinue}
              onMouseEnter={() => setSelectedOption(0)}
              className={`w-full p-6 rounded-xl border transition-all flex items-center gap-5 group ${
                selectedOption === 0
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                  : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedOption === 0 ? "bg-cyan-500/20" : "bg-slate-700/50"
              }`}>
                <ChevronRight className={`w-7 h-7 ${selectedOption === 0 ? "text-cyan-400" : "text-slate-400"}`} />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-lg">Continue</div>
                <div className="text-sm text-slate-400">Exit recovery and boot to UrbanShade OS</div>
              </div>
            </button>

            <button
              onClick={onShutdown}
              onMouseEnter={() => setSelectedOption(1)}
              className={`w-full p-6 rounded-xl border transition-all flex items-center gap-5 group ${
                selectedOption === 1
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                  : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedOption === 1 ? "bg-cyan-500/20" : "bg-slate-700/50"
              }`}>
                <Power className={`w-7 h-7 ${selectedOption === 1 ? "text-cyan-400" : "text-slate-400"}`} />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-lg">Turn off your PC</div>
                <div className="text-sm text-slate-400">Shut down the system</div>
              </div>
            </button>

            <button
              onClick={() => { setScreen("troubleshoot"); setSelectedOption(0); }}
              onMouseEnter={() => setSelectedOption(2)}
              className={`w-full p-6 rounded-xl border transition-all flex items-center gap-5 group ${
                selectedOption === 2
                  ? "bg-cyan-500/10 border-cyan-500/50 text-white"
                  : "bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-slate-600"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                selectedOption === 2 ? "bg-cyan-500/20" : "bg-slate-700/50"
              }`}>
                <Wrench className={`w-7 h-7 ${selectedOption === 2 ? "text-cyan-400" : "text-slate-400"}`} />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-lg">Troubleshoot</div>
                <div className="text-sm text-slate-400">Reset your PC or see advanced options</div>
              </div>
            </button>
          </div>

          {/* Footer hint */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Use arrow keys to navigate, Enter to select
          </div>
        </div>
      </div>
    );
  }

  // Troubleshoot / Advanced Options
  if (screen === "troubleshoot") {
    const options = [
      { id: "data-recovery", icon: Database, label: "Data Recovery", desc: "Scan and repair corrupted data" },
      { id: "terminal", icon: Terminal, label: "Terminal", desc: "Boot into command line only" },
      { id: "bios", icon: Cpu, label: "UEFI/BIOS Settings", desc: "Change system firmware settings" },
      { id: "system-image", icon: HardDrive, label: "System Image Recovery", desc: "Recover using a system image file" },
      { id: "recovery-image", icon: RefreshCw, label: "Recovery Image", desc: "Use DEF-DEV recovery snapshots" },
      { id: "startup-settings", icon: Settings, label: "Startup Settings", desc: "Change boot behavior" },
    ];

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20 flex flex-col p-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-white">Advanced Options</h1>
            <p className="text-slate-400 text-sm">Choose a recovery tool</p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start max-w-4xl">
          {options.map((opt, i) => (
            <button
              key={opt.id}
              onClick={() => {
                if (opt.id === "terminal") onTerminalBoot();
                else if (opt.id === "bios") onBootToBios();
                else if (opt.id === "data-recovery") { setScreen("data-recovery"); runDataRecovery(); }
                else if (opt.id === "startup-settings") { setScreen("startup-settings"); setSelectedOption(0); }
                else if (opt.id === "system-image") setScreen("system-image");
                else if (opt.id === "recovery-image") setScreen("recovery-image");
              }}
              onMouseEnter={() => setSelectedOption(i)}
              className={`p-5 rounded-xl border transition-all flex flex-col items-center gap-3 text-center ${
                selectedOption === i
                  ? "bg-cyan-500/10 border-cyan-500/50"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                selectedOption === i ? "bg-cyan-500/20" : "bg-slate-700/50"
              }`}>
                <opt.icon className={`w-6 h-6 ${selectedOption === i ? "text-cyan-400" : "text-slate-400"}`} />
              </div>
              <div>
                <div className="font-medium text-white">{opt.label}</div>
                <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Startup Settings
  if (screen === "startup-settings") {
    const settings = [
      { id: "safe-mode", num: "1", label: "Enable Safe Mode", desc: "Minimal drivers, grayscale display" },
      { id: "safe-mode-terminal", num: "2", label: "Safe Mode with Terminal", desc: "Command line only with safe mode" },
      { id: "offline-mode", num: "3", label: "Enable Offline Mode", desc: "Disable all network connections" },
      { id: "boot-logging", num: "4", label: "Enable Boot Logging", desc: "Log all boot stages to storage", active: bootLogging },
      { id: "force-verification", num: "5", label: "Force Verification", desc: "Verify all data on boot", active: forceVerification },
      { id: "disable-auto-restart", num: "6", label: "Disable Auto-Restart on Failure", desc: "Show errors instead of restarting", active: disableAutoRestart },
      { id: "clear-cache", num: "7", label: "Clear Cached Data", desc: "Reset temporary storage" },
    ];

    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20 flex flex-col p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-white">Startup Settings</h1>
            <p className="text-slate-400 text-sm">Press a number to select an option</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="flex-1 max-w-2xl space-y-2">
          {settings.map((s, i) => (
            <button
              key={s.id}
              onClick={() => applyStartupSetting(s.id)}
              onMouseEnter={() => setSelectedOption(i)}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                selectedOption === i
                  ? "bg-cyan-500/10 border-cyan-500/50"
                  : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold ${
                selectedOption === i ? "bg-cyan-500 text-slate-900" : "bg-slate-700 text-slate-300"
              }`}>
                {s.num}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-white flex items-center gap-2">
                  {s.label}
                  {s.active && <Check className="w-4 h-4 text-green-400" />}
                </div>
                <div className="text-xs text-slate-400">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <p className="text-sm text-slate-400">
            Press <span className="text-cyan-400 font-mono">Enter</span> to return to normal boot
          </p>
        </div>
      </div>
    );
  }

  // Data Recovery
  if (screen === "data-recovery") {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20 flex flex-col p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-white">Data Recovery</h1>
            <p className="text-slate-400 text-sm">Scanning for corrupted data...</p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{recoveryStatus}</span>
              <span className="text-sm text-cyan-400">{recoveryProgress}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${recoveryProgress}%` }}
              />
            </div>
          </div>

          {/* Results */}
          {recoveryProgress === 100 && (
            <div className="space-y-4">
              {recoveredItems.length === 0 ? (
                <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-400" />
                    <div>
                      <div className="font-medium text-green-400">No Issues Found</div>
                      <p className="text-sm text-slate-400 mt-1">All data appears to be intact</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <div>
                      <div className="font-medium text-amber-400">{recoveredItems.length} Issues Found</div>
                      <p className="text-sm text-slate-400 mt-1">The following keys contain invalid JSON:</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recoveredItems.map(key => (
                      <div key={key} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                        <span className="text-sm font-mono text-slate-300">{key}</span>
                        <button
                          onClick={() => {
                            localStorage.removeItem(key);
                            setRecoveredItems(prev => prev.filter(k => k !== key));
                          }}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleBack}
                className="w-full p-4 bg-cyan-500/10 border border-cyan-500/50 rounded-xl text-cyan-400 font-medium hover:bg-cyan-500/20 transition-colors"
              >
                Return to Advanced Options
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // System Image / Recovery Image screens
  if (screen === "system-image" || screen === "recovery-image") {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20 flex flex-col p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-light text-white">
              {screen === "system-image" ? "System Image Recovery" : "Recovery Images"}
            </h1>
            <p className="text-slate-400 text-sm">
              {screen === "system-image" 
                ? "Restore from a system image file" 
                : "Select a DEF-DEV recovery snapshot"}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {recoveryImages.length === 0 ? (
            <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl text-center">
              <HardDrive className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <div className="text-slate-400">No recovery images found</div>
              <p className="text-sm text-slate-500 mt-2">
                Create recovery images in DEF-DEV to use this feature
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recoveryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => loadRecoveryImage(img)}
                  className="w-full p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-colors flex items-center gap-4"
                >
                  <HardDrive className="w-8 h-8 text-cyan-400" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{img.name || `Image ${i + 1}`}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(img.timestamp).toLocaleString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
