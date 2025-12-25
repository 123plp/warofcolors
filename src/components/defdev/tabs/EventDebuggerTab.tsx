import { useState, useEffect, useCallback } from "react";
import { Zap, Keyboard, MousePointer, Monitor, Trash2, Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

interface SystemEvent {
  id: number;
  type: "keyboard" | "mouse" | "window" | "system" | "custom";
  name: string;
  data: Record<string, any>;
  timestamp: Date;
}

let eventIdCounter = 0;

const EventDebuggerTab = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [trackKeyboard, setTrackKeyboard] = useState(true);
  const [trackMouse, setTrackMouse] = useState(false);
  const [trackWindow, setTrackWindow] = useState(true);
  const [trackSystem, setTrackSystem] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

  const addEvent = useCallback((event: Omit<SystemEvent, "id" | "timestamp">) => {
    if (isPaused) return;
    setEvents(prev => [...prev.slice(-200), {
      ...event,
      id: eventIdCounter++,
      timestamp: new Date()
    }]);
  }, [isPaused]);

  // Keyboard events
  useEffect(() => {
    if (!trackKeyboard) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      addEvent({
        type: "keyboard",
        name: "keydown",
        data: {
          key: e.key,
          code: e.code,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey
        }
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      addEvent({
        type: "keyboard",
        name: "keyup",
        data: { key: e.key, code: e.code }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [trackKeyboard, addEvent]);

  // Mouse events (only clicks to avoid spam)
  useEffect(() => {
    if (!trackMouse) return;
    
    const handleClick = (e: MouseEvent) => {
      addEvent({
        type: "mouse",
        name: "click",
        data: {
          x: e.clientX,
          y: e.clientY,
          button: e.button,
          target: (e.target as HTMLElement)?.tagName
        }
      });
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [trackMouse, addEvent]);

  // Window events
  useEffect(() => {
    if (!trackWindow) return;
    
    const handleResize = () => {
      addEvent({
        type: "window",
        name: "resize",
        data: { width: window.innerWidth, height: window.innerHeight }
      });
    };

    const handleFocus = () => {
      addEvent({
        type: "window",
        name: "focus",
        data: {}
      });
    };

    const handleBlur = () => {
      addEvent({
        type: "window",
        name: "blur",
        data: {}
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [trackWindow, addEvent]);

  // System bus events
  useEffect(() => {
    if (!trackSystem) return;
    
    const handleStorage = () => {
      addEvent({
        type: "system",
        name: "storage",
        data: { itemCount: localStorage.length }
      });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [trackSystem, addEvent]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "keyboard": return <Keyboard className="w-4 h-4 text-blue-400" />;
      case "mouse": return <MousePointer className="w-4 h-4 text-green-400" />;
      case "window": return <Monitor className="w-4 h-4 text-purple-400" />;
      case "system": return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const clearEvents = () => {
    setEvents([]);
    setSelectedEvent(null);
  };

  return (
    <div className="flex h-full">
      {/* Event List */}
      <div className="flex-1 flex flex-col border-r border-slate-700">
        {/* Toolbar */}
        <div className="p-3 border-b border-slate-700 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-amber-400">Event Debugger</h2>
            <div className="flex-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsPaused(!isPaused)}
              className={isPaused ? "text-yellow-400" : ""}
            >
              {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearEvents}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <Switch checked={trackKeyboard} onCheckedChange={setTrackKeyboard} />
              <Keyboard className="w-4 h-4" />
              <span>Keyboard</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={trackMouse} onCheckedChange={setTrackMouse} />
              <MousePointer className="w-4 h-4" />
              <span>Mouse</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={trackWindow} onCheckedChange={setTrackWindow} />
              <Monitor className="w-4 h-4" />
              <span>Window</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={trackSystem} onCheckedChange={setTrackSystem} />
              <Zap className="w-4 h-4" />
              <span>System</span>
            </label>
          </div>
        </div>

        {/* Event List */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-800">
            {events.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No events captured yet</p>
                <p className="text-xs mt-1">Interact with the page to see events</p>
              </div>
            ) : (
              [...events].reverse().map(event => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full p-2 text-left hover:bg-slate-800/50 transition-colors flex items-center gap-2 ${
                    selectedEvent?.id === event.id ? 'bg-slate-800' : ''
                  }`}
                >
                  {getEventIcon(event.type)}
                  <span className="font-mono text-sm flex-1">{event.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Stats */}
        <div className="p-2 border-t border-slate-700 text-xs text-muted-foreground flex gap-4">
          <span>{events.length} events</span>
          {isPaused && <span className="text-yellow-400">⏸ Paused</span>}
        </div>
      </div>

      {/* Event Details */}
      <div className="w-72 flex flex-col">
        {selectedEvent ? (
          <>
            <div className="p-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                {getEventIcon(selectedEvent.type)}
                <h3 className="font-bold text-sm">{selectedEvent.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedEvent.timestamp.toLocaleString()}
              </p>
            </div>
            <ScrollArea className="flex-1 p-3">
              <Card className="p-3 bg-slate-800/50 border-slate-700">
                <h4 className="text-xs font-bold text-muted-foreground mb-2">Event Data</h4>
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </Card>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Select an event to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDebuggerTab;
