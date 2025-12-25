import { useState, useEffect } from "react";
import { Zap, MousePointer, Keyboard, AppWindow, Bell, Settings, Trash2, Filter, Clock } from "lucide-react";

interface SystemEvent {
  id: string;
  type: 'keyboard' | 'window' | 'system' | 'notification' | 'settings';
  name: string;
  details: string;
  timestamp: Date;
}

export const EventsTab = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'keyboard' | 'window' | 'system'>('all');
  const [isPaused, setIsPaused] = useState(false);

  // Listen for real keyboard events
  useEffect(() => {
    if (isPaused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Win');
      
      const keyCombo = [...modifiers, e.key].join('+');
      
      const newEvent: SystemEvent = {
        id: `evt-${Date.now()}`,
        type: 'keyboard',
        name: 'Key Press',
        details: keyCombo,
        timestamp: new Date()
      };
      
      setEvents(prev => [newEvent, ...prev].slice(0, 100));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  // Simulate other system events
  useEffect(() => {
    if (isPaused) return;

    const systemEvents = [
      { type: 'window' as const, name: 'Window Focus', details: 'Settings.exe gained focus' },
      { type: 'window' as const, name: 'Window Minimize', details: 'Terminal.exe minimized' },
      { type: 'system' as const, name: 'Auto-save', details: 'Settings persisted to localStorage' },
      { type: 'notification' as const, name: 'Notification', details: 'New system notification queued' },
      { type: 'settings' as const, name: 'Setting Change', details: 'theme_mode updated' },
      { type: 'system' as const, name: 'Sync Check', details: 'Cloud sync status verified' },
    ];

    const addEvent = () => {
      const evt = systemEvents[Math.floor(Math.random() * systemEvents.length)];
      const newEvent: SystemEvent = {
        id: `evt-${Date.now()}`,
        ...evt,
        timestamp: new Date()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 100));
    };

    const interval = setInterval(addEvent, 5000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyboard': return <Keyboard className="w-3 h-3" />;
      case 'window': return <AppWindow className="w-3 h-3" />;
      case 'notification': return <Bell className="w-3 h-3" />;
      case 'settings': return <Settings className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'keyboard': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'window': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'notification': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'settings': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Event Debugger</h2>
            <p className="text-xs text-slate-500">{events.length} events captured</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isPaused
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => setEvents([])}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'keyboard', 'window', 'system'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
        {filteredEvents.map((evt, index) => (
          <div
            key={evt.id}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-all animate-fade-in"
            style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
          >
            {/* Type icon */}
            <div className={`p-1.5 rounded-lg border ${getTypeColor(evt.type)}`}>
              {getTypeIcon(evt.type)}
            </div>

            {/* Event info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">{evt.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${getTypeColor(evt.type)}`}>
                  {evt.type}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono truncate">
                {evt.details}
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {evt.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events captured</p>
            <p className="text-xs mt-1">Press keys or interact with the system</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Keyboard className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <div className="text-sm font-bold text-purple-400">
            {events.filter(e => e.type === 'keyboard').length}
          </div>
          <div className="text-[10px] text-slate-500">Keyboard</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <AppWindow className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <div className="text-sm font-bold text-cyan-400">
            {events.filter(e => e.type === 'window').length}
          </div>
          <div className="text-[10px] text-slate-500">Window</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1 text-blue-400" />
          <div className="text-sm font-bold text-blue-400">
            {events.filter(e => e.type === 'system').length}
          </div>
          <div className="text-[10px] text-slate-500">System</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Settings className="w-4 h-4 mx-auto mb-1 text-green-400" />
          <div className="text-sm font-bold text-green-400">
            {events.filter(e => e.type === 'settings').length}
          </div>
          <div className="text-[10px] text-slate-500">Settings</div>
        </div>
      </div>
    </div>
  );
};
