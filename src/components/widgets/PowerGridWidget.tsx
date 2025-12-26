import { useState, useEffect } from 'react';
import { Zap, Battery, BatteryLow, BatteryWarning, Power } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface PowerGridWidgetProps {
  widget: Widget;
}

interface PowerZone {
  name: string;
  load: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
}

const generatePowerData = (): PowerZone[] => {
  const zones = ['Sector A', 'Sector B', 'Sector C', 'Labs', 'Containment', 'Admin'];
  return zones.map(name => {
    const load = Math.floor(Math.random() * 60) + 40;
    return {
      name,
      load,
      status: load > 90 ? 'critical' : load > 80 ? 'warning' : 'normal',
    };
  });
};

export const PowerGridWidget = ({ widget }: PowerGridWidgetProps) => {
  const [zones, setZones] = useState<PowerZone[]>(() => generatePowerData());
  const [totalLoad, setTotalLoad] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev => prev.map(zone => {
        const newLoad = Math.max(30, Math.min(100, zone.load + (Math.random() - 0.5) * 10));
        return {
          ...zone,
          load: Math.round(newLoad),
          status: newLoad > 95 ? 'critical' : newLoad > 85 ? 'warning' : 'normal',
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalLoad(Math.round(zones.reduce((sum, z) => sum + z.load, 0) / zones.length));
  }, [zones]);

  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'offline': return 'text-slate-500';
      default: return 'text-green-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-slate-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="w-full h-full p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className={cn(
            "w-4 h-4",
            totalLoad > 85 ? "text-red-400 animate-pulse" : "text-primary"
          )} />
          {!isSmall && (
            <span className="text-sm font-medium">Power Grid</span>
          )}
        </div>
        <div className={cn(
          "text-sm font-mono",
          totalLoad > 85 ? "text-red-400" : "text-green-400"
        )}>
          {totalLoad}%
        </div>
      </div>

      {isSmall ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${totalLoad * 2.2} 220`}
                className={totalLoad > 85 ? "text-red-400" : "text-primary"}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Power className={cn(
                "w-6 h-6",
                totalLoad > 85 ? "text-red-400" : "text-primary"
              )} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid gap-1">
          {zones.slice(0, isLarge ? 6 : 4).map(zone => (
            <div key={zone.name} className="flex items-center gap-2">
              <span className={cn(
                "text-xs w-20 truncate",
                getStatusColor(zone.status)
              )}>
                {zone.name}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    getStatusBg(zone.status)
                  )}
                  style={{ width: `${zone.load}%` }}
                />
              </div>
              <span className={cn(
                "text-xs font-mono w-8 text-right",
                getStatusColor(zone.status)
              )}>
                {zone.load}%
              </span>
            </div>
          ))}
        </div>
      )}

      {!isSmall && (
        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>Capacity: 2.4 GW</span>
          <span>
            {zones.filter(z => z.status === 'critical').length > 0 && (
              <span className="text-red-400 animate-pulse">⚠ OVERLOAD</span>
            )}
            {zones.filter(z => z.status === 'critical').length === 0 && (
              <span className="text-green-400">● STABLE</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
