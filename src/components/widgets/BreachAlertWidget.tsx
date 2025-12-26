import { useState, useEffect } from 'react';
import { Siren, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface BreachAlertWidgetProps {
  widget: Widget;
}

type AlertLevel = 'green' | 'yellow' | 'orange' | 'red';

const ALERT_CONFIG: Record<AlertLevel, {
  label: string;
  color: string;
  bg: string;
  message: string;
}> = {
  green: {
    label: 'ALL CLEAR',
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    message: 'All systems nominal. No threats detected.',
  },
  yellow: {
    label: 'ELEVATED',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    message: 'Minor anomaly detected. Monitoring active.',
  },
  orange: {
    label: 'HIGH ALERT',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    message: 'Potential breach. MTF on standby.',
  },
  red: {
    label: 'CONTAINMENT BREACH',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    message: 'IMMEDIATE ACTION REQUIRED. Evacuation in progress.',
  },
};

export const BreachAlertWidget = ({ widget }: BreachAlertWidgetProps) => {
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('green');
  const [isMuted, setIsMuted] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

  useEffect(() => {
    // Occasionally change alert level
    const interval = setInterval(() => {
      setAlertLevel(prev => {
        if (prev === 'red') return Math.random() > 0.3 ? 'orange' : 'red';
        if (prev === 'orange') return Math.random() > 0.5 ? 'yellow' : 'orange';
        if (prev === 'yellow') return Math.random() > 0.7 ? 'green' : 'yellow';
        return Math.random() > 0.95 ? 'yellow' : 'green';
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Blinking effect for high alerts
  useEffect(() => {
    if (alertLevel === 'red' || alertLevel === 'orange') {
      const interval = setInterval(() => setBlinkOn(v => !v), 500);
      return () => clearInterval(interval);
    } else {
      setBlinkOn(true);
    }
  }, [alertLevel]);

  const config = ALERT_CONFIG[alertLevel];
  const isSmall = widget.size === 'small';
  const isHighAlert = alertLevel === 'red' || alertLevel === 'orange';

  return (
    <div className={cn(
      "w-full h-full p-3 flex flex-col transition-colors duration-300",
      config.bg,
      isHighAlert && blinkOn && "brightness-110"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Siren className={cn(
            "w-5 h-5",
            config.color,
            isHighAlert && "animate-pulse"
          )} />
          {!isSmall && (
            <span className="text-sm font-medium">Facility Alert</span>
          )}
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={cn(
          "text-center font-bold tracking-wider",
          isSmall ? "text-lg" : "text-2xl",
          config.color,
          isHighAlert && "animate-pulse"
        )}>
          {config.label}
        </div>
        
        {!isSmall && (
          <p className={cn(
            "text-xs text-center mt-2 px-2",
            config.color,
            "opacity-80"
          )}>
            {config.message}
          </p>
        )}
      </div>

      {isHighAlert && !isSmall && (
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          <span>Emergency protocols active</span>
        </div>
      )}
    </div>
  );
};
