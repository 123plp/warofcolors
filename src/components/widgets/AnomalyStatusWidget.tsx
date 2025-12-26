import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, AlertOctagon, Clock } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface AnomalyStatusWidgetProps {
  widget: Widget;
}

type ContainmentStatus = 'contained' | 'unstable' | 'breach' | 'unknown';

interface Anomaly {
  id: string;
  status: ContainmentStatus;
  lastCheck: string;
}

const STATUS_CONFIG: Record<ContainmentStatus, { 
  color: string; 
  bg: string; 
  icon: typeof Shield; 
  label: string;
}> = {
  contained: { color: 'text-green-400', bg: 'bg-green-500/20', icon: CheckCircle, label: 'CONTAINED' },
  unstable: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertTriangle, label: 'UNSTABLE' },
  breach: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertOctagon, label: 'BREACH' },
  unknown: { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Clock, label: 'UNKNOWN' },
};

const generateAnomalies = (): Anomaly[] => {
  const scps = ['SCP-173', 'SCP-096', 'SCP-049', 'SCP-682', 'SCP-106', 'SCP-914'];
  const statuses: ContainmentStatus[] = ['contained', 'contained', 'contained', 'unstable', 'contained', 'unknown'];
  
  return scps.map((id, i) => ({
    id,
    status: Math.random() > 0.9 ? 'unstable' : statuses[i],
    lastCheck: `${Math.floor(Math.random() * 60)}m ago`,
  }));
};

export const AnomalyStatusWidget = ({ widget }: AnomalyStatusWidgetProps) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>(() => generateAnomalies());

  useEffect(() => {
    const interval = setInterval(() => {
      setAnomalies(prev => prev.map(a => ({
        ...a,
        status: Math.random() > 0.95 ? 'unstable' : 
                Math.random() > 0.99 ? 'breach' : 
                a.status === 'breach' ? 'unstable' :
                a.status === 'unstable' && Math.random() > 0.7 ? 'contained' : a.status,
        lastCheck: `${Math.floor(Math.random() * 5)}m ago`,
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isSmall = widget.size === 'small';
  const displayAnomalies = isSmall ? anomalies.slice(0, 3) : anomalies;
  
  const containedCount = anomalies.filter(a => a.status === 'contained').length;
  const breachCount = anomalies.filter(a => a.status === 'breach').length;

  return (
    <div className="w-full h-full p-3 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Containment Status</span>
        </div>
        {breachCount > 0 && (
          <div className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-400 animate-pulse">
            {breachCount} BREACH
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        {displayAnomalies.map(anomaly => {
          const config = STATUS_CONFIG[anomaly.status];
          const StatusIcon = config.icon;
          
          return (
            <div 
              key={anomaly.id}
              className={cn(
                "flex items-center justify-between p-1.5 rounded",
                config.bg,
                anomaly.status === 'breach' && 'animate-pulse'
              )}
            >
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("w-3 h-3", config.color)} />
                <span className={cn(
                  "font-mono",
                  isSmall ? "text-xs" : "text-sm",
                  config.color
                )}>
                  {anomaly.id}
                </span>
              </div>
              {!isSmall && (
                <span className={cn("text-xs", config.color)}>
                  {config.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!isSmall && (
        <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-xs text-muted-foreground">
          <span>{containedCount}/{anomalies.length} Secured</span>
          <span>Last scan: 2m ago</span>
        </div>
      )}
    </div>
  );
};
