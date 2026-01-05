import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor, Cpu, HardDrive, Shield, Power, Settings, Package, Clock, Zap, Thermometer, GripVertical, HelpCircle, ChevronUp, ChevronDown, Lock, Unlock, AlertTriangle } from "lucide-react";
import { useBiosSettings, BiosSettings } from "@/hooks/useBiosSettings";

interface BiosScreenProps {
  onExit: () => void;
}

type Section = "main" | "advanced" | "boot" | "security" | "exit" | "custom";

interface FocusableItem {
  section: Section;
  id: string;
  type: 'toggle' | 'select' | 'slider' | 'button' | 'drag';
}

export const BiosScreen = ({ onExit }: BiosScreenProps) => {
  const [selectedSection, setSelectedSection] = useState<Section>("main");
  const [showingExit, setShowingExit] = useState(false);
  const [exitCountdown, setExitCountdown] = useState<number | null>(null);
  const [oemUnlocked] = useState(() => localStorage.getItem("settings_oem_unlocked") === "true");
  const [showHelp, setShowHelp] = useState(false);
  const [showLoadDefaults, setShowLoadDefaults] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState<'admin' | 'boot' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemUptime, setSystemUptime] = useState(0);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  
  const {
    settings,
    hasChanges,
    updateSetting,
    toggleSetting,
    setBootOrder,
    loadDefaults,
    saveChanges,
    setAdminPassword,
    setBootPassword,
  } = useBiosSettings();

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setSystemUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPasswordDialog || showHelp || showLoadDefaults) {
        if (e.key === 'Escape') {
          setShowPasswordDialog(null);
          setShowHelp(false);
          setShowLoadDefaults(false);
          setPasswordInput('');
          setPasswordConfirm('');
          setPasswordError('');
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          onExit();
          break;
        case 'F1':
          e.preventDefault();
          setShowHelp(true);
          break;
        case 'F9':
          e.preventDefault();
          setShowLoadDefaults(true);
          break;
        case 'F10':
          e.preventDefault();
          saveChanges();
          setShowingExit(true);
          setExitCountdown(3);
          break;
        case 'Tab':
          e.preventDefault();
          const sectionOrder: Section[] = ['main', 'advanced', 'boot', 'security', 'exit'];
          if (oemUnlocked) sectionOrder.push('custom');
          const currentIndex = sectionOrder.indexOf(selectedSection);
          const nextIndex = e.shiftKey 
            ? (currentIndex - 1 + sectionOrder.length) % sectionOrder.length
            : (currentIndex + 1) % sectionOrder.length;
          setSelectedSection(sectionOrder[nextIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSection, oemUnlocked, showPasswordDialog, showHelp, showLoadDefaults, saveChanges, onExit]);

  // Exit countdown
  useEffect(() => {
    if (exitCountdown !== null && exitCountdown > 0) {
      const timer = setTimeout(() => setExitCountdown(exitCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (exitCountdown === 0) {
      onExit();
    }
  }, [exitCountdown, onExit]);

  const sections = [
    { id: "main", label: "Main", icon: <Monitor className="w-5 h-5" /> },
    { id: "advanced", label: "Advanced", icon: <Settings className="w-5 h-5" /> },
    { id: "boot", label: "Boot", icon: <Power className="w-5 h-5" /> },
    { id: "security", label: "Security", icon: <Shield className="w-5 h-5" /> },
    { id: "exit", label: "Exit", icon: <Power className="w-5 h-5" /> },
  ];

  if (oemUnlocked) {
    sections.push({ id: "custom", label: "Custom Apps", icon: <Package className="w-5 h-5" /> });
  }

  // Boot order drag handlers
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    
    const newOrder = [...settings.bootOrder];
    const [removed] = newOrder.splice(draggingIndex, 1);
    newOrder.splice(index, 0, removed);
    setBootOrder(newOrder);
    setDraggingIndex(index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const moveBootDevice = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= settings.bootOrder.length) return;
    
    const newOrder = [...settings.bootOrder];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setBootOrder(newOrder);
  };

  const getBootDeviceLabel = (device: string) => {
    const labels: Record<string, { name: string; desc: string }> = {
      hdd: { name: 'URBANSHADE-SSD-01', desc: 'NVMe SSD (2TB)' },
      usb: { name: 'USB Storage', desc: 'Removable Media' },
      network: { name: 'Network Boot (PXE)', desc: 'Ethernet Adapter' },
    };
    return labels[device] || { name: device, desc: 'Unknown Device' };
  };

  const handleSetPassword = (type: 'admin' | 'boot') => {
    if (passwordInput !== passwordConfirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordInput.length > 0 && passwordInput.length < 4) {
      setPasswordError('Password must be at least 4 characters');
      return;
    }
    
    if (type === 'admin') {
      setAdminPassword(passwordInput.length > 0 ? passwordInput : null);
    } else {
      setBootPassword(passwordInput.length > 0 ? passwordInput : null);
    }
    
    setShowPasswordDialog(null);
    setPasswordInput('');
    setPasswordConfirm('');
    setPasswordError('');
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ToggleItem = ({ label, description, value, onToggle, focused }: {
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
    focused?: boolean;
  }) => (
    <button
      onClick={onToggle}
      className={`w-full flex justify-between items-center p-3 rounded cursor-pointer transition-all border ${
        focused 
          ? 'bg-[#0078D7]/30 border-[#0078D7]' 
          : 'hover:bg-[#0078D7]/10 border-transparent hover:border-[#0078D7]/30'
      }`}
    >
      <div className="text-left">
        <div className="font-semibold">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
      <span className={`font-semibold px-3 py-1 rounded ${
        value 
          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
      }`}>
        {value ? "Enabled" : "Disabled"}
      </span>
    </button>
  );

  const SliderItem = ({ label, value, min, max, unit, onChange }: {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    onChange: (v: number) => void;
  }) => (
    <div className="p-3 rounded hover:bg-[#0078D7]/10 transition-all">
      <div className="flex justify-between mb-2">
        <span className="font-semibold">{label}</span>
        <span className="text-[#0078D7] font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#0078D7] cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );

  const renderMain = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        {/* System Information Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">System Information</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">UEFI Version:</span>
              <span className="font-mono text-primary">2.9.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Processor:</span>
              <span className="font-mono">Urbanshade Quantum Core v4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Speed:</span>
              <span className="font-mono">4.2 GHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cores:</span>
              <span className="font-mono">8 Cores / 16 Threads</span>
            </div>
          </div>
        </div>

        {/* Memory Card - Dynamic */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Memory</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Memory:</span>
              <span className="font-mono">32 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="font-mono">DDR5-6400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Browser Heap:</span>
              <span className="font-mono text-primary">
                {typeof performance !== 'undefined' && (performance as any).memory 
                  ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400 font-mono">Operational</span>
            </div>
          </div>
        </div>

        {/* Storage Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Storage Devices</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">NVMe SSD:</span>
                <span className="font-mono text-primary">Primary</span>
              </div>
              <div className="text-xs text-gray-500">URBANSHADE-SSD-01 (2TB)</div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Interface:</span>
              <span className="font-mono">PCIe 4.0 x4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Health:</span>
              <span className="text-green-400 font-mono">100%</span>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/30 rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">System Status</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">CPU Temperature:</span>
              <span className="font-mono text-green-400">42°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fan Speed:</span>
              <span className="font-mono">1200 RPM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">BIOS Uptime:</span>
              <span className="font-mono text-primary">{formatUptime(systemUptime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Power State:</span>
              <span className="text-green-400 font-mono">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <div className="text-sm text-gray-400">System Time (Real-time)</div>
            <div className="font-mono text-lg">{currentTime.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0078D7]" />
            CPU Configuration
          </h3>
          <div className="space-y-1">
            <ToggleItem
              label="Hyper-Threading"
              description="Enables virtual cores"
              value={settings.hyperThreading}
              onToggle={() => toggleSetting('hyperThreading')}
            />
            <ToggleItem
              label="Virtualization (VT-x)"
              description="Hardware virtualization support"
              value={settings.virtualization}
              onToggle={() => toggleSetting('virtualization')}
            />
            <ToggleItem
              label="Turbo Boost"
              description="Dynamic frequency scaling"
              value={settings.turboBoost}
              onToggle={() => toggleSetting('turboBoost')}
            />
            <ToggleItem
              label="C-States"
              description="CPU power saving states"
              value={settings.cStates}
              onToggle={() => toggleSetting('cStates')}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0078D7]" />
            Chipset Configuration
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 rounded hover:bg-[#0078D7]/10 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-semibold">SATA Mode</span>
                <select
                  value={settings.sataMode}
                  onChange={(e) => updateSetting('sataMode', e.target.value as any)}
                  className="bg-[#0078D7]/20 border border-[#0078D7]/50 rounded px-2 py-1 text-sm cursor-pointer"
                >
                  <option value="ahci">AHCI</option>
                  <option value="raid">RAID</option>
                  <option value="ide">IDE (Legacy)</option>
                </select>
              </div>
            </div>
            <div className="p-3 rounded hover:bg-[#0078D7]/10 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-semibold">PCIe Link Speed</span>
                <select
                  value={settings.pcieLinkSpeed}
                  onChange={(e) => updateSetting('pcieLinkSpeed', e.target.value as any)}
                  className="bg-[#0078D7]/20 border border-[#0078D7]/50 rounded px-2 py-1 text-sm cursor-pointer"
                >
                  <option value="auto">Auto</option>
                  <option value="gen3">Gen 3</option>
                  <option value="gen4">Gen 4</option>
                  <option value="gen5">Gen 5</option>
                </select>
              </div>
            </div>
            <ToggleItem
              label="IOMMU"
              description="I/O Memory Management"
              value={settings.iommu}
              onToggle={() => toggleSetting('iommu')}
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <div className="font-bold text-amber-400 mb-1">Warning</div>
            <div className="text-sm text-gray-300">
              Modifying advanced settings may cause system instability. Only change these settings if you understand their purpose.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBoot = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Power className="w-5 h-5 text-[#0078D7]" />
          Boot Priority
          <span className="text-xs text-gray-400 font-normal ml-2">(Drag to reorder)</span>
        </h3>
        <div className="space-y-2">
          {settings.bootOrder.map((device, index) => {
            const { name, desc } = getBootDeviceLabel(device);
            return (
              <div
                key={device}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-3 rounded-lg flex items-center gap-3 transition-all cursor-grab active:cursor-grabbing ${
                  index === 0 
                    ? 'bg-[#0078D7]/20 border border-[#0078D7]' 
                    : 'bg-[#0078D7]/10 border border-[#0078D7]/30'
                } ${draggingIndex === index ? 'opacity-50 scale-95' : ''}`}
              >
                <GripVertical className="w-5 h-5 text-gray-500" />
                <div className="w-8 h-8 bg-[#0078D7]/40 rounded flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{name}</div>
                  <div className="text-xs text-gray-400">{desc}</div>
                </div>
                {index === 0 && (
                  <div className="text-green-400 text-sm font-semibold">Primary</div>
                )}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveBootDevice(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-[#0078D7]/30 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveBootDevice(index, 'down')}
                    disabled={index === settings.bootOrder.length - 1}
                    className="p-1 hover:bg-[#0078D7]/30 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Boot Options</h3>
          <div className="space-y-1">
            <ToggleItem
              label="Fast Boot"
              description="Skip POST memory test"
              value={settings.fastBoot}
              onToggle={() => toggleSetting('fastBoot')}
            />
            <ToggleItem
              label="Boot Logo"
              description="Show Urbanshade logo during boot"
              value={settings.bootLogo}
              onToggle={() => toggleSetting('bootLogo')}
            />
            <ToggleItem
              label="Secure Boot"
              description="UEFI Secure Boot validation"
              value={settings.secureBoot}
              onToggle={() => toggleSetting('secureBoot')}
            />
          </div>
          <div className="mt-4">
            <SliderItem
              label="Boot Timeout"
              value={settings.bootTimeout}
              min={1}
              max={10}
              unit="s"
              onChange={(v) => updateSetting('bootTimeout', v)}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Boot Keys</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 py-0.5 rounded">DEL</span> Enter UEFI Setup</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 py-0.5 rounded">F2</span> Enter UEFI Setup</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 py-0.5 rounded">F8</span> Safe Mode</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 py-0.5 rounded">F10</span> Save & Exit</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#0078D7]" />
          Security Features
        </h3>
        <div className="space-y-3">
          <ToggleItem
            label="Secure Boot"
            description="UEFI firmware security feature"
            value={settings.secureBoot}
            onToggle={() => toggleSetting('secureBoot')}
          />
          <ToggleItem
            label="TPM 2.0"
            description="Trusted Platform Module"
            value={settings.tpmEnabled}
            onToggle={() => toggleSetting('tpmEnabled')}
          />
          
          {/* Admin Password */}
          <button
            onClick={() => setShowPasswordDialog('admin')}
            className="w-full flex justify-between items-center p-3 rounded cursor-pointer transition-all border hover:bg-[#0078D7]/10 border-transparent hover:border-[#0078D7]/30"
          >
            <div className="text-left flex items-center gap-3">
              {settings.adminPassword ? <Lock className="w-5 h-5 text-green-400" /> : <Unlock className="w-5 h-5 text-gray-400" />}
              <div>
                <div className="font-semibold">Administrator Password</div>
                <div className="text-xs text-gray-400">UEFI setup password</div>
              </div>
            </div>
            <span className={`font-semibold px-3 py-1 rounded ${
              settings.adminPassword 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
            }`}>
              {settings.adminPassword ? "Set" : "Not Set"}
            </span>
          </button>
          
          {/* Boot Password */}
          <button
            onClick={() => setShowPasswordDialog('boot')}
            className="w-full flex justify-between items-center p-3 rounded cursor-pointer transition-all border hover:bg-[#0078D7]/10 border-transparent hover:border-[#0078D7]/30"
          >
            <div className="text-left flex items-center gap-3">
              {settings.bootPassword ? <Lock className="w-5 h-5 text-green-400" /> : <Unlock className="w-5 h-5 text-gray-400" />}
              <div>
                <div className="font-semibold">Boot Password</div>
                <div className="text-xs text-gray-400">Pre-boot authentication</div>
              </div>
            </div>
            <span className={`font-semibold px-3 py-1 rounded ${
              settings.bootPassword 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
            }`}>
              {settings.bootPassword ? "Set" : "Not Set"}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
          <Shield className="w-5 h-5" />
          OEM Unlock Status
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Developer Options</span>
            <span className={`font-semibold ${oemUnlocked ? 'text-green-400' : 'text-gray-400'}`}>
              {oemUnlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>
          <div className="text-xs text-gray-300">
            {oemUnlocked 
              ? 'Custom applications are enabled in UEFI. System warranty may be voided.'
              : 'Enable in Settings → Developer Options to unlock custom features.'
            }
          </div>
        </div>
      </div>
    </div>
  );

  const renderExit = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => {
            saveChanges();
            setShowingExit(true);
            setExitCountdown(3);
          }}
          className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 hover:from-[#0078D7]/30 hover:to-[#0063B1]/30 border border-[#0078D7]/50 rounded-lg p-8 text-left transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-[#0078D7]/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Power className="w-7 h-7 text-[#0078D7]" />
            </div>
            <div>
              <div className="text-lg font-bold">Save & Exit</div>
              <div className="text-sm text-gray-400">Save changes and restart</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Press F10 or click to exit</div>
          {hasChanges && (
            <div className="mt-2 text-xs text-amber-400">⚠ You have unsaved changes</div>
          )}
        </button>

        <button
          onClick={onExit}
          className="bg-gradient-to-br from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/50 rounded-lg p-8 text-left transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-red-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Power className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <div className="text-lg font-bold">Discard & Exit</div>
              <div className="text-sm text-gray-400">Exit without saving</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">Press ESC to discard changes</div>
        </button>
      </div>

      <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Load Defaults</h3>
        <button 
          onClick={() => setShowLoadDefaults(true)}
          className="w-full p-3 bg-[#0078D7]/20 hover:bg-[#0078D7]/30 border border-[#0078D7]/50 rounded-lg transition-all"
        >
          Load Optimized Defaults
        </button>
      </div>
    </div>
  );

  const renderCustom = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <Package className="w-6 h-6 text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-2">Custom Applications</h3>
            <div className="text-sm text-gray-300">
              OEM Unlock is enabled. You can now install custom applications and modifications.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Available Custom Apps</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <div className="p-2 hover:bg-[#0078D7]/10 rounded cursor-pointer">• Custom Facility Tools</div>
            <div className="p-2 hover:bg-[#0078D7]/10 rounded cursor-pointer">• Advanced Diagnostics</div>
            <div className="p-2 hover:bg-[#0078D7]/10 rounded cursor-pointer">• System Modding Tools</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0078D7]/20 to-[#0063B1]/20 border border-[#0078D7]/50 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4">Installation Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Custom Apps:</span>
              <span className="text-green-400">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Warranty:</span>
              <span className="text-amber-400">Voided</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Help Dialog
  const renderHelpDialog = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0a1929] to-[#001f3f] border border-[#0078D7]/50 rounded-lg p-6 max-w-lg w-full mx-4 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-[#0078D7]" />
          <h2 className="text-xl font-bold">UEFI Help</h2>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-bold text-[#0078D7] mb-2">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="font-mono bg-[#0078D7]/20 px-2 rounded">Tab</span> Switch sections</div>
              <div><span className="font-mono bg-[#0078D7]/20 px-2 rounded">F1</span> Show help</div>
              <div><span className="font-mono bg-[#0078D7]/20 px-2 rounded">F9</span> Load defaults</div>
              <div><span className="font-mono bg-[#0078D7]/20 px-2 rounded">F10</span> Save & Exit</div>
              <div><span className="font-mono bg-[#0078D7]/20 px-2 rounded">ESC</span> Discard & Exit</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-[#0078D7] mb-2">Sections</h3>
            <ul className="space-y-1 text-gray-300">
              <li><strong>Main:</strong> System information and status</li>
              <li><strong>Advanced:</strong> CPU and chipset settings</li>
              <li><strong>Boot:</strong> Boot priority and options</li>
              <li><strong>Security:</strong> Passwords and security features</li>
              <li><strong>Exit:</strong> Save or discard changes</li>
            </ul>
          </div>
          
          <div className="bg-amber-500/20 border border-amber-500/50 rounded p-3">
            <div className="text-amber-400 font-bold mb-1">⚠ Warning</div>
            <div className="text-gray-300">
              Incorrect settings may prevent system boot. Use "Load Defaults" (F9) to restore safe settings.
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowHelp(false)}
          className="w-full mt-4 p-2 bg-[#0078D7] hover:bg-[#0078D7]/80 rounded transition-all"
        >
          Close (ESC)
        </button>
      </div>
    </div>
  );

  // Load Defaults Dialog
  const renderLoadDefaultsDialog = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0a1929] to-[#001f3f] border border-[#0078D7]/50 rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-[#0078D7]" />
          <h2 className="text-xl font-bold">Load Optimized Defaults?</h2>
        </div>
        
        <p className="text-gray-300 mb-6">
          This will reset all BIOS settings to their default values. Your passwords will also be cleared.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => {
              loadDefaults();
              setShowLoadDefaults(false);
            }}
            className="flex-1 p-2 bg-[#0078D7] hover:bg-[#0078D7]/80 rounded transition-all"
          >
            Yes, Load Defaults
          </button>
          <button
            onClick={() => setShowLoadDefaults(false)}
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Password Dialog
  const renderPasswordDialog = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-[#0a1929] to-[#001f3f] border border-[#0078D7]/50 rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-[#0078D7]" />
          <h2 className="text-xl font-bold">
            {showPasswordDialog === 'admin' ? 'Administrator' : 'Boot'} Password
          </h2>
        </div>
        
        <p className="text-gray-300 mb-4 text-sm">
          {(showPasswordDialog === 'admin' ? settings.adminPassword : settings.bootPassword)
            ? 'Enter a new password or leave empty to clear.'
            : 'Set a password to protect BIOS access.'}
        </p>
        
        <div className="space-y-3">
          <input
            type="password"
            placeholder="New password (or empty to clear)"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError('');
            }}
            className="w-full p-2 bg-[#0078D7]/10 border border-[#0078D7]/50 rounded focus:border-[#0078D7] outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setPasswordError('');
            }}
            className="w-full p-2 bg-[#0078D7]/10 border border-[#0078D7]/50 rounded focus:border-[#0078D7] outline-none"
          />
          
          {passwordError && (
            <div className="text-red-400 text-sm">{passwordError}</div>
          )}
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => handleSetPassword(showPasswordDialog!)}
            className="flex-1 p-2 bg-[#0078D7] hover:bg-[#0078D7]/80 rounded transition-all"
          >
            {passwordInput ? 'Set Password' : 'Clear Password'}
          </button>
          <button
            onClick={() => {
              setShowPasswordDialog(null);
              setPasswordInput('');
              setPasswordConfirm('');
              setPasswordError('');
            }}
            className="flex-1 p-2 bg-gray-600 hover:bg-gray-500 rounded transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  if (showingExit) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a1929] to-[#001f3f] flex items-center justify-center text-white">
        <div className="text-center space-y-6 animate-scale-in">
          <div className="w-32 h-32 mx-auto relative">
            <div className="absolute inset-0 bg-[#0078D7]/20 rounded-full animate-ping"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-[#0078D7] to-[#0063B1] rounded-full flex items-center justify-center">
              <Power className="w-16 h-16" />
            </div>
          </div>
          <h2 className="text-3xl font-bold">Exiting UEFI Setup...</h2>
          <p className="text-xl text-gray-300">System will restart in {exitCountdown} seconds</p>
          {hasChanges && <p className="text-green-400">✓ Changes saved</p>}
          <div className="flex gap-4 justify-center">
            <div className="w-3 h-3 bg-[#0078D7] rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-[#0078D7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-[#0078D7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0a1929] to-[#001f3f] text-white flex flex-col">
      {/* Scanline effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}
      />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0078D7] to-[#0063B1] p-6 border-b border-[#0078D7]/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">URBANSHADE UEFI FIRMWARE</h1>
            <p className="text-sm opacity-80">
              Version 2.9.0 - {settings.secureBoot ? 'Secure Boot Enabled' : 'Secure Boot Disabled'}
              {hasChanges && <span className="ml-2 text-amber-300">• Unsaved changes</span>}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">System Time</div>
            <div className="text-lg font-mono">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-[#0078D7]/10 border-b border-[#0078D7]/30 px-6 py-3">
        <div className="flex gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section.id as Section)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedSection === section.id
                  ? 'bg-[#0078D7] text-white shadow-lg scale-105'
                  : 'bg-[#0078D7]/20 hover:bg-[#0078D7]/30 text-gray-300'
              }`}
            >
              {section.icon}
              <span className="font-semibold">{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {selectedSection === "main" && renderMain()}
          {selectedSection === "advanced" && renderAdvanced()}
          {selectedSection === "boot" && renderBoot()}
          {selectedSection === "security" && renderSecurity()}
          {selectedSection === "exit" && renderExit()}
          {selectedSection === "custom" && oemUnlocked && renderCustom()}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0078D7]/10 border-t border-[#0078D7]/30 px-6 py-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-6 text-gray-400">
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 rounded">F1</span> Help</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 rounded">F9</span> Load Defaults</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 rounded">F10</span> Save & Exit</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 rounded">ESC</span> Discard & Exit</div>
            <div><span className="text-[#0078D7] font-mono bg-[#0078D7]/20 px-2 rounded">Tab</span> Switch Section</div>
          </div>
          <div className="text-gray-500">© 2025 Urbanshade Corporation</div>
        </div>
      </div>

      {/* Dialogs */}
      {showHelp && renderHelpDialog()}
      {showLoadDefaults && renderLoadDefaultsDialog()}
      {showPasswordDialog && renderPasswordDialog()}
    </div>
  );
};
