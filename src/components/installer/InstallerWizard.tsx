import { useState, useEffect, useRef } from "react";
import { Monitor, HardDrive, Disc, Folder, Check, ChevronRight, Waves, Shield, Zap, Settings, Clock } from "lucide-react";

interface InstallerWizardProps {
  onComplete: (adminData: { username: string; password: string }) => void;
}

type Stage = "welcome" | "install-type" | "directory" | "product-key" | "installing" | "complete";

const VALID_KEYS = ["URBSH-2024-FACIL-MGMT", "DEMO-KEY-URBANSHADE", "TEST-INSTALL-KEY", "DEPTH-8247-FACILITY"];

export const InstallerWizard = ({ onComplete }: InstallerWizardProps) => {
  const [stage, setStage] = useState<Stage>("welcome");
  
  // Installation options
  const [installType, setInstallType] = useState<"minimal" | "standard" | "full">("standard");
  const [installDir, setInstallDir] = useState("C:\\URBANSHADE");
  const [productKey, setProductKey] = useState("");
  const [keySegments, setKeySegments] = useState(["", "", "", ""]);
  
  // Installation progress
  const [installProgress, setInstallProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [installComplete, setInstallComplete] = useState(false);
  
  // Configuration during install
  const [configStep, setConfigStep] = useState(0);
  const [timezone, setTimezone] = useState("UTC-8 Pacific");
  const [computerName, setComputerName] = useState("URBANSHADE-01");
  const [networkType, setNetworkType] = useState("corporate");
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [userConfigComplete, setUserConfigComplete] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Installation simulation with simplified actions
  useEffect(() => {
    if (stage === "installing" && !installComplete) {
      const actions = [
        "Extracting kernel files...",
        "Installing core modules...",
        "Configuring HAL subsystem...",
        "Loading security certificates...",
        "Installing system drivers...",
        "Configuring network stack...",
        "Setting up containment protocols...",
        "Installing applications...",
        "Registering components...",
        "Applying system configuration...",
        "Finalizing installation...",
      ];
      
      let actionIndex = 0;
      let progress = 0;
      const totalSteps = actions.length * 10;
      
      const interval = setInterval(() => {
        progress++;
        const currentActionIndex = Math.min(Math.floor((progress / totalSteps) * actions.length), actions.length - 1);
        
        if (currentActionIndex !== actionIndex) {
          actionIndex = currentActionIndex;
          setCurrentAction(actions[actionIndex]);
        }
        
        setInstallProgress((progress / totalSteps) * 100);
        
        if (progress >= totalSteps) {
          clearInterval(interval);
          setInstallComplete(true);
          setCurrentAction("Installation complete!");
        }
      }, getInstallSpeed());
      
      return () => clearInterval(interval);
    }
  }, [stage, installType]);

  const getInstallSpeed = () => {
    switch (installType) {
      case "minimal": return 80;
      case "standard": return 60;
      case "full": return 45;
      default: return 60;
    }
  };

  const handleKeySegmentChange = (index: number, value: string) => {
    const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    const newSegments = [...keySegments];
    newSegments[index] = cleanValue;
    setKeySegments(newSegments);
    setProductKey(newSegments.join("-"));
    
    if (cleanValue.length === 5 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const isValidKey = VALID_KEYS.includes(productKey);

  const handleFinish = () => {
    localStorage.setItem("urbanshade_first_boot", "true");
    localStorage.setItem("urbanshade_install_type", installType);
    localStorage.setItem("urbanshade_computer_name", computerName);
    onComplete({ username: "Administrator", password: "admin" });
  };

  const handleExpressSetup = () => {
    localStorage.setItem("urbanshade_first_boot", "true");
    localStorage.setItem("urbanshade_install_type", "standard");
    localStorage.setItem("urbanshade_computer_name", "URBANSHADE-01");
    onComplete({ username: "Administrator", password: "" });
  };

  const canFinish = installComplete && userConfigComplete;

  // Progress steps for the top stepper
  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "install-type", label: "Setup" },
    { id: "directory", label: "Location" },
    { id: "product-key", label: "Activate" },
    { id: "installing", label: "Install" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === stage);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header with stepper */}
      <div className="flex-shrink-0 bg-slate-900/80 border-b border-cyan-500/20 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-cyan-100 font-bold text-sm">URBANSHADE OS</div>
                <div className="text-cyan-500/70 text-xs">Setup Wizard v2.3</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-500/50">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>STNDT Active</span>
            </div>
          </div>
          
          {/* Horizontal stepper */}
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all ${
                  i < currentStepIndex 
                    ? "bg-cyan-500/20 text-cyan-400"
                    : i === currentStepIndex
                      ? "bg-cyan-500 text-slate-900 font-bold"
                      : "bg-slate-800/50 text-slate-500"
                }`}>
                  {i < currentStepIndex ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="w-4 text-center">{i + 1}</span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded ${
                    i < currentStepIndex ? "bg-cyan-500/50" : "bg-slate-700"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        <div className="w-full max-w-2xl">
          {stage === "welcome" && (
            <WelcomeScreen 
              onNext={() => setStage("install-type")} 
              onExpress={handleExpressSetup}
            />
          )}
          
          {stage === "install-type" && (
            <InstallTypeScreen 
              installType={installType}
              setInstallType={setInstallType}
              onBack={() => setStage("welcome")}
              onNext={() => setStage("directory")}
            />
          )}
          
          {stage === "directory" && (
            <DirectoryScreen
              installDir={installDir}
              setInstallDir={setInstallDir}
              onBack={() => setStage("install-type")}
              onNext={() => setStage("product-key")}
            />
          )}
          
          {stage === "product-key" && (
            <ProductKeyScreen
              keySegments={keySegments}
              inputRefs={inputRefs}
              handleKeySegmentChange={handleKeySegmentChange}
              isValidKey={isValidKey}
              onBack={() => setStage("directory")}
              onNext={() => setStage("installing")}
            />
          )}
          
          {stage === "installing" && (
            <InstallingScreen
              installProgress={installProgress}
              currentAction={currentAction}
              installComplete={installComplete}
              userConfigComplete={userConfigComplete}
              configStep={configStep}
              setConfigStep={setConfigStep}
              timezone={timezone}
              setTimezone={setTimezone}
              computerName={computerName}
              setComputerName={setComputerName}
              networkType={networkType}
              setNetworkType={setNetworkType}
              autoUpdates={autoUpdates}
              setAutoUpdates={setAutoUpdates}
              setUserConfigComplete={setUserConfigComplete}
              canFinish={canFinish}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>
      
      {/* Footer status */}
      <div className="flex-shrink-0 bg-slate-900/60 border-t border-cyan-500/10 px-6 py-2">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>Depth: 8,247m • Pressure: 824 atm</span>
          <span>© 2024 UrbanShade Corporation</span>
        </div>
      </div>
    </div>
  );
};

// Welcome screen with Express Setup option
const WelcomeScreen = ({ onNext, onExpress }: { onNext: () => void; onExpress: () => void }) => {
  return (
    <div className="text-center space-y-8">
      <div>
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
          <Shield className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to UrbanShade OS</h1>
        <p className="text-cyan-400/70">Deep Sea Facility Management System</p>
      </div>
      
      <div className="grid gap-4 max-w-md mx-auto">
        <button
          onClick={onNext}
          className="group p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 hover:border-cyan-400 hover:from-cyan-500/20 hover:to-blue-600/20 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
              <Settings className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-100">Standard Install</div>
              <div className="text-sm text-slate-400">Configure installation options</div>
            </div>
            <ChevronRight className="w-5 h-5 text-cyan-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
        
        <button
          onClick={onExpress}
          className="group p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Zap className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div>
              <div className="text-lg font-medium text-slate-300">Express Setup</div>
              <div className="text-sm text-slate-500">Use default settings</div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </div>
      
      <p className="text-xs text-slate-600 max-w-sm mx-auto">
        Standard installation gives you control over components, location, and system settings.
        Express setup uses optimal defaults for quick deployment.
      </p>
    </div>
  );
};

const InstallTypeScreen = ({ installType, setInstallType, onBack, onNext }: {
  installType: string;
  setInstallType: (type: "minimal" | "standard" | "full") => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Choose Installation Type</h2>
      <p className="text-slate-400">Select components based on your facility needs</p>
    </div>
    
    <div className="space-y-3">
      {[
        { id: "minimal", label: "Minimal", desc: "Core system only — backup terminals", size: "2.4 GB", time: "~2 min" },
        { id: "standard", label: "Standard", desc: "Essential facility tools — recommended", size: "5.7 GB", time: "~5 min", recommended: true },
        { id: "full", label: "Complete", desc: "All applications and research modules", size: "12.3 GB", time: "~10 min" },
      ].map(opt => (
        <button
          key={opt.id}
          onClick={() => setInstallType(opt.id as "minimal" | "standard" | "full")}
          className={`w-full p-5 rounded-xl border text-left transition-all ${
            installType === opt.id 
              ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" 
              : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              installType === opt.id ? "border-cyan-400 bg-cyan-400" : "border-slate-600"
            }`}>
              {installType === opt.id && <Check className="w-4 h-4 text-slate-900" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`font-bold ${installType === opt.id ? "text-cyan-300" : "text-slate-300"}`}>
                  {opt.label}
                </span>
                {opt.recommended && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <div className="text-sm text-slate-500 mt-1">{opt.desc}</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-slate-400 font-mono">{opt.size}</div>
              <div className="text-slate-600 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                {opt.time}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
    
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-xs">
      <HardDrive className="w-4 h-4 text-cyan-500" />
      <span className="text-slate-400">Available space: <span className="text-cyan-400 font-mono">847.2 GB</span></span>
    </div>
    
    <div className="flex justify-between pt-4">
      <InstallerButton variant="ghost" onClick={onBack}>← Back</InstallerButton>
      <InstallerButton onClick={onNext}>Continue →</InstallerButton>
    </div>
  </div>
);

const DirectoryScreen = ({ installDir, setInstallDir, onBack, onNext }: {
  installDir: string;
  setInstallDir: (dir: string) => void;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Installation Location</h2>
      <p className="text-slate-400">Choose where to install UrbanShade OS</p>
    </div>
    
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-lg">
          <Folder className="w-5 h-5 text-cyan-500" />
          <input
            type="text"
            value={installDir}
            onChange={(e) => setInstallDir(e.target.value)}
            className="flex-1 bg-transparent text-cyan-300 font-mono text-sm focus:outline-none"
          />
        </div>
        <InstallerButton variant="ghost">Browse</InstallerButton>
      </div>
      
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 max-h-48 overflow-y-auto">
        <div className="text-xs space-y-1 font-mono">
          {[
            { icon: HardDrive, name: "Local Disk (C:)", indent: 0 },
            { icon: Folder, name: "Program Files", indent: 1 },
            { icon: Folder, name: "URBANSHADE", indent: 1, active: true },
            { icon: Folder, name: "System", indent: 1 },
            { icon: Folder, name: "Users", indent: 1 },
          ].map((item, i) => (
            <div 
              key={i}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                item.active ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:bg-slate-700/50 hover:text-cyan-300"
              }`}
              style={{ paddingLeft: `${item.indent * 16 + 8}px` }}
            >
              <item.icon className={`w-4 h-4 ${item.active ? "text-cyan-400" : "text-slate-500"}`} />
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="flex justify-between pt-4">
      <InstallerButton variant="ghost" onClick={onBack}>← Back</InstallerButton>
      <InstallerButton onClick={onNext}>Continue →</InstallerButton>
    </div>
  </div>
);

const ProductKeyScreen = ({ keySegments, inputRefs, handleKeySegmentChange, isValidKey, onBack, onNext }: {
  keySegments: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleKeySegmentChange: (index: number, value: string) => void;
  isValidKey: boolean;
  onBack: () => void;
  onNext: () => void;
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2">Activate Your License</h2>
      <p className="text-slate-400">Enter your facility license key to continue</p>
    </div>
    
    <div className="flex justify-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center">
        <Disc className="w-10 h-10 text-cyan-400" />
      </div>
    </div>
    
    <div className="flex items-center gap-2 justify-center mb-6">
      {keySegments.map((seg, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            ref={el => inputRefs.current[i] = el}
            type="text"
            value={seg}
            onChange={(e) => handleKeySegmentChange(i, e.target.value)}
            maxLength={5}
            className="w-20 px-3 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-center font-mono text-cyan-300 uppercase focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          />
          {i < 3 && <span className="text-slate-600 text-xl font-bold">-</span>}
        </div>
      ))}
    </div>
    
    {isValidKey && (
      <div className="text-center text-green-400 text-sm flex items-center justify-center gap-2">
        <Check className="w-5 h-5" /> License validated successfully
      </div>
    )}
    
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-xs">
      <div className="text-slate-400 mb-2">Demo keys for testing:</div>
      <div className="font-mono text-cyan-400/70 space-y-1">
        <div>URBSH-2024-FACIL-MGMT</div>
        <div>DEMO-KEY-URBANSHADE</div>
      </div>
    </div>
    
    <div className="flex justify-between pt-4">
      <InstallerButton variant="ghost" onClick={onBack}>← Back</InstallerButton>
      <InstallerButton onClick={onNext} disabled={!isValidKey}>Continue →</InstallerButton>
    </div>
  </div>
);

const InstallingScreen = ({
  installProgress, currentAction, installComplete,
  userConfigComplete, configStep, setConfigStep,
  timezone, setTimezone, computerName, setComputerName,
  networkType, setNetworkType, autoUpdates, setAutoUpdates,
  setUserConfigComplete, canFinish, onFinish
}: {
  installProgress: number;
  currentAction: string;
  installComplete: boolean;
  userConfigComplete: boolean;
  configStep: number;
  setConfigStep: (step: number) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  computerName: string;
  setComputerName: (name: string) => void;
  networkType: string;
  setNetworkType: (type: string) => void;
  autoUpdates: boolean;
  setAutoUpdates: (updates: boolean) => void;
  setUserConfigComplete: (complete: boolean) => void;
  canFinish: boolean;
  onFinish: () => void;
}) => {
  const configSteps = [
    { title: "Time Zone", content: (
      <div className="space-y-3">
        <select 
          value={timezone} 
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
        >
          <option>UTC-8 Pacific (HQ)</option>
          <option>UTC-5 Eastern</option>
          <option>UTC+0 London</option>
          <option>UTC+9 Tokyo</option>
          <option>UTC-11 Mariana Trench</option>
        </select>
      </div>
    )},
    { title: "Terminal Name", content: (
      <div className="space-y-3">
        <input
          type="text"
          value={computerName}
          onChange={(e) => setComputerName(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""))}
          maxLength={15}
          className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg font-mono text-cyan-300 text-sm focus:outline-none focus:border-cyan-400"
        />
      </div>
    )},
    { title: "Network", content: (
      <div className="space-y-2">
        {[
          { id: "corporate", label: "Facility Network" },
          { id: "guest", label: "Guest Access" },
          { id: "isolated", label: "Isolated Mode" },
        ].map(opt => (
          <label key={opt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
            <input
              type="radio"
              name="network"
              checked={networkType === opt.id}
              onChange={() => setNetworkType(opt.id)}
              className="text-cyan-400"
            />
            <span className="text-sm text-slate-300">{opt.label}</span>
          </label>
        ))}
      </div>
    )},
    { title: "Updates", content: (
      <label className="flex items-center gap-3 cursor-pointer p-2">
        <input
          type="checkbox"
          checked={autoUpdates}
          onChange={(e) => setAutoUpdates(e.target.checked)}
        />
        <span className="text-sm text-slate-300">Enable automatic updates</span>
      </label>
    )},
    { title: "Dev Mode", content: <DevModeConfig /> },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {installComplete && userConfigComplete ? "Ready to Launch" : "Installing UrbanShade OS"}
        </h2>
        <p className="text-slate-400">
          {installComplete && userConfigComplete ? "Your system is configured and ready" : "Configure settings while files are copied"}
        </p>
      </div>
      
      {/* Main progress bar */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
        <div className="flex justify-between text-sm mb-3">
          <span className={installComplete ? "text-green-400 font-medium" : "text-cyan-400"}>
            {installComplete ? "✓ Installation Complete" : `${Math.round(installProgress)}%`}
          </span>
          <span className="text-slate-500 text-xs truncate max-w-[200px]">{currentAction}</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${installComplete ? "bg-green-500" : "bg-gradient-to-r from-cyan-600 to-cyan-400"}`}
            style={{ width: `${installProgress}%` }}
          />
        </div>
      </div>
      
      {/* Configuration panel */}
      {!userConfigComplete ? (
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-cyan-400">
              Configure: {configSteps[configStep].title}
            </div>
            <div className="flex gap-1">
              {configSteps.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${
                  i <= configStep ? "bg-cyan-400" : "bg-slate-700"
                }`} />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            {configSteps[configStep].content}
          </div>
          
          <div className="flex justify-between">
            <InstallerButton 
              variant="ghost" 
              size="sm"
              onClick={() => setConfigStep(Math.max(0, configStep - 1))}
              disabled={configStep === 0}
            >
              Previous
            </InstallerButton>
            {configStep < configSteps.length - 1 ? (
              <InstallerButton size="sm" onClick={() => setConfigStep(configStep + 1)}>
                Next
              </InstallerButton>
            ) : (
              <InstallerButton size="sm" onClick={() => setUserConfigComplete(true)}>
                Finish Config
              </InstallerButton>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <Check className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <div className="text-green-300 font-medium">Configuration Complete</div>
          <div className="text-green-500/70 text-sm">
            {installComplete ? "Ready to launch!" : "Waiting for installation..."}
          </div>
        </div>
      )}
      
      {canFinish && (
        <InstallerButton onClick={onFinish} className="w-full">
          Launch UrbanShade OS →
        </InstallerButton>
      )}
    </div>
  );
};

const DevModeConfig = () => {
  const [devMode, setDevMode] = useState(false);
  
  const handleToggle = (checked: boolean) => {
    setDevMode(checked);
    localStorage.setItem("urbanshade_dev_mode_install", JSON.stringify(checked));
    localStorage.setItem("settings_developer_mode", JSON.stringify(checked));
  };
  
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer p-2">
        <input
          type="checkbox"
          checked={devMode}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        <div>
          <div className="text-sm text-slate-300">Enable Developer Mode</div>
          <div className="text-xs text-slate-500">Access DEF-DEV debug console</div>
        </div>
      </label>
      {devMode && (
        <div className="text-xs text-amber-400/70 p-2 bg-amber-500/10 rounded-lg">
          ⚠ Advanced features will be enabled
        </div>
      )}
    </div>
  );
};

const InstallerButton = ({ children, onClick, disabled, variant = "primary", size = "md", className = "" }: { 
  children: React.ReactNode; 
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`font-medium transition-all rounded-lg ${
      size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3"
    } ${
      variant === "primary"
        ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/20"
        : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50"
    } ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
  >
    {children}
  </button>
);

export default InstallerWizard;
