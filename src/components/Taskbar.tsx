import { useState, useEffect } from "react";
import { Bell, Volume2, VolumeX, Power, Cloud, CloudOff, Loader2 } from "lucide-react";
import { App } from "./Desktop";
import { NotificationCenter } from "./NotificationCenter";
import { ShutdownOptionsDialog } from "./ShutdownOptionsDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useAutoSync } from "@/hooks/useAutoSync";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WindowData {
  id: string;
  app: App;
  zIndex: number;
  minimized?: boolean;
}

interface TaskbarProps {
  onStartClick: () => void;
  pinnedApps: App[];
  onPinnedClick: (app: App) => void;
  windows?: WindowData[];
  onRestoreWindow?: (id: string) => void;
  onShutdown?: () => void;
  onReboot?: () => void;
  onLogout?: () => void;
}

export const Taskbar = ({ 
  onStartClick, 
  pinnedApps, 
  onPinnedClick, 
  windows = [], 
  onRestoreWindow,
  onShutdown,
  onReboot,
  onLogout
}: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('settings_sound_enabled') !== 'false');
  
  // Auto-sync status
  const { isEnabled: syncEnabled, isSyncing, lastSyncTime, manualSync } = useAutoSync();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('settings_sound_enabled', String(newValue));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const openWindows = windows.filter(w => !w.minimized);
  const minimizedWindows = windows.filter(w => w.minimized);

  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 h-[60px] flex justify-between items-center px-5 z-[800] bg-black/60 backdrop-blur-sm border-t border-white/5 animate-slide-in-right">
        <div className="flex items-center gap-3">
          <button
            onClick={onStartClick}
            data-start-button
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-panel hover:bg-white/5 transition-all duration-200 hover-scale"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-primary to-primary/20 flex items-center justify-center text-black font-extrabold text-lg">
              U
            </div>
            <div className="text-sm font-bold text-muted-foreground">Urbanshade</div>
          </button>

          <div className="flex gap-2">
            {pinnedApps.map(app => (
              <button
                key={app.id}
                onClick={() => onPinnedClick(app)}
                className="w-11 h-11 rounded-lg flex items-center justify-center text-primary hover:bg-white/5 transition-all duration-200 hover-scale"
                title={app.name}
              >
                <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                  {app.icon}
                </div>
              </button>
            ))}
          </div>

          {/* Open & Minimized Windows */}
          {(openWindows.length > 0 || minimizedWindows.length > 0) && (
            <div className="flex gap-2 ml-2 pl-2 border-l border-white/10">
              {/* Open Windows */}
              {openWindows.map(window => (
                <button
                  key={window.id}
                  onClick={() => onRestoreWindow?.(window.id)}
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200 hover-scale border border-primary/30"
                  title={window.app.name}
                >
                  <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                    {window.app.icon}
                  </div>
                </button>
              ))}
              {/* Minimized Windows */}
              {minimizedWindows.map(window => (
                <button
                  key={window.id}
                  onClick={() => onRestoreWindow?.(window.id)}
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-primary/60 hover:text-primary hover:bg-white/5 transition-all duration-200 hover-scale"
                  title={`Restore ${window.app.name}`}
                >
                  <div className="w-6 h-6 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
                    {window.app.icon}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Sync Indicator */}
          {syncEnabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => manualSync()}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isSyncing 
                        ? "text-blue-400 bg-blue-500/10" 
                        : "text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
                    }`}
                    title="Cloud sync"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cloud className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isSyncing ? "Syncing..." : `Last sync: ${formatLastSync(lastSyncTime)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Click to sync now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-all"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white/5 transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Power Button */}
          <button
            onClick={() => setPowerMenuOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Power options"
          >
            <Power className="w-4 h-4" />
          </button>

          <div className="text-sm font-mono text-muted-foreground">
            {formatTime(time)}
          </div>
        </div>

        {/* Notification Center */}
        <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      </div>

      {/* Power Options Dialog */}
      {powerMenuOpen && onShutdown && onReboot && onLogout && (
        <ShutdownOptionsDialog
          onClose={() => setPowerMenuOpen(false)}
          onShutdown={onShutdown}
          onSignOut={onLogout}
          onLock={() => {
            // Lock functionality - just logout for now
            onLogout();
          }}
          onRestart={onReboot}
        />
      )}
    </>
  );
};