import { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Battery, 
  BatteryCharging,
  BatteryLow,
  Bell,
  BellOff,
  ChevronUp,
  Calendar,
  Bluetooth,
  BluetoothOff
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { useNotifications } from "@/hooks/useNotifications";
import { useDoNotDisturb } from "@/hooks/useDoNotDisturb";

interface SystemTrayProps {
  onNotificationsClick: () => void;
  onClockClick: () => void;
}

export const SystemTray = ({ onNotificationsClick, onClockClick }: SystemTrayProps) => {
  const [time, setTime] = useState(new Date());
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(() => 
    localStorage.getItem("settings_bluetooth") === "true"
  );
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem("settings_sound_enabled") !== "false"
  );
  const [volume, setVolume] = useState(() => 
    parseInt(localStorage.getItem("settings_volume") || "75")
  );
  const [batteryLevel] = useState(() => Math.floor(Math.random() * 40) + 60);
  const [isCharging] = useState(() => Math.random() > 0.5);
  const [showHiddenIcons, setShowHiddenIcons] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const { unreadCount } = useNotifications();
  const { isDndEnabled } = useDoNotDisturb();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("settings_sound_enabled", soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("settings_volume", volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("settings_bluetooth", bluetoothEnabled.toString());
  }, [bluetoothEnabled]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const BatteryIcon = batteryLevel < 20 ? BatteryLow : isCharging ? BatteryCharging : Battery;

  const hiddenIcons = [
    { 
      id: 'bluetooth', 
      icon: bluetoothEnabled ? Bluetooth : BluetoothOff, 
      active: bluetoothEnabled,
      onClick: () => setBluetoothEnabled(!bluetoothEnabled),
      label: 'Bluetooth'
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {/* Hidden Icons Overflow */}
      <Popover open={showHiddenIcons} onOpenChange={setShowHiddenIcons}>
        <PopoverTrigger asChild>
          <button className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            <ChevronUp className={`w-3 h-3 transition-transform ${showHiddenIcons ? 'rotate-180' : ''}`} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end" sideOffset={8}>
          <div className="flex gap-1">
            {hiddenIcons.map(item => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  item.active 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title={item.label}
              >
                <item.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Network */}
      <button 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        title={wifiEnabled ? "Connected" : "Disconnected"}
      >
        {wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      </button>

      {/* Volume */}
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            title={soundEnabled ? `Volume: ${volume}%` : "Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="end" sideOffset={8}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Volume</span>
              <span className="text-xs text-muted-foreground">{volume}%</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                ) : (
                  <VolumeX className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </button>
              <Slider
                value={[volume]}
                onValueChange={([val]) => setVolume(val)}
                min={0}
                max={100}
                step={5}
                className="flex-1"
                disabled={!soundEnabled}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Battery */}
      <div 
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
          batteryLevel < 20 ? 'text-destructive' : 'text-muted-foreground'
        }`}
        title={`Battery: ${batteryLevel}%${isCharging ? ' (Charging)' : ''}`}
      >
        <BatteryIcon className="w-4 h-4" />
        <span>{batteryLevel}%</span>
      </div>

      {/* Notifications */}
      <button
        onClick={onNotificationsClick}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all relative"
        title="Notifications"
      >
        {isDndEnabled ? (
          <BellOff className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && !isDndEnabled && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center animate-pulse font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Clock with Calendar Dropdown */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={onClockClick}
            className="flex flex-col items-end text-right hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all"
          >
            <div className="text-sm font-mono text-foreground">
              {formatTime(time)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {formatDate(time)}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end" sideOffset={8}>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-foreground">
                {formatTime(time)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatFullDate(time)}
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">No upcoming events</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
