import { useState, useEffect } from 'react';
import { Widget, WidgetSize } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface ClockWidgetProps {
  widget: Widget;
}

export const ClockWidget = ({ widget }: ClockWidgetProps) => {
  const [time, setTime] = useState(new Date());
  const isAnalog = widget.settings?.analog !== false;
  const timezone = (widget.settings?.timezone as string) || 'local';

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeInTimezone = () => {
    if (timezone === 'local') return time;
    try {
      return new Date(time.toLocaleString('en-US', { timeZone: timezone }));
    } catch {
      return time;
    }
  };

  const displayTime = getTimeInTimezone();
  const hours = displayTime.getHours();
  const minutes = displayTime.getMinutes();
  const seconds = displayTime.getSeconds();

  // Analog clock calculations
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const isSmall = widget.size === 'small';

  if (isAnalog) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-2">
        <div className={cn(
          "relative rounded-full border-2 border-primary/50 bg-background/50",
          isSmall ? "w-24 h-24" : "w-32 h-32"
        )}>
          {/* Clock face markers */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-primary/50"
              style={{
                left: '50%',
                top: '4px',
                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                transformOrigin: `50% ${isSmall ? '46px' : '60px'}`,
              }}
            />
          ))}
          
          {/* Hour hand */}
          <div
            className="absolute left-1/2 bg-primary rounded-full"
            style={{
              width: '3px',
              height: isSmall ? '24px' : '32px',
              bottom: '50%',
              transform: `translateX(-50%) rotate(${hourDeg}deg)`,
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Minute hand */}
          <div
            className="absolute left-1/2 bg-primary/80 rounded-full"
            style={{
              width: '2px',
              height: isSmall ? '32px' : '44px',
              bottom: '50%',
              transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Second hand */}
          <div
            className="absolute left-1/2 bg-destructive rounded-full"
            style={{
              width: '1px',
              height: isSmall ? '36px' : '48px',
              bottom: '50%',
              transform: `translateX(-50%) rotate(${secondDeg}deg)`,
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Center dot */}
          <div className="absolute left-1/2 top-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>
        
        {!isSmall && (
          <div className="mt-2 text-xs text-muted-foreground">
            {timezone === 'local' ? 'Local Time' : timezone}
          </div>
        )}
      </div>
    );
  }

  // Digital clock
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      <div className={cn(
        "font-mono font-bold text-primary",
        isSmall ? "text-2xl" : "text-4xl"
      )}>
        {String(hours).padStart(2, '0')}:
        {String(minutes).padStart(2, '0')}
        <span className="text-primary/60">:{String(seconds).padStart(2, '0')}</span>
      </div>
      <div className={cn(
        "text-muted-foreground mt-1",
        isSmall ? "text-xs" : "text-sm"
      )}>
        {displayTime.toLocaleDateString('en-US', { 
          weekday: isSmall ? 'short' : 'long', 
          month: 'short', 
          day: 'numeric' 
        })}
      </div>
      {!isSmall && (
        <div className="text-xs text-muted-foreground mt-1">
          {timezone === 'local' ? 'Local Time' : timezone}
        </div>
      )}
    </div>
  );
};
