import { useState, useEffect } from 'react';
import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react';
import { Widget } from '@/hooks/useWidgets';
import { cn } from '@/lib/utils';

interface SystemMonitorWidgetProps {
  widget: Widget;
}

interface SystemStats {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  cpuHistory: number[];
  memHistory: number[];
}

const generateStats = (): SystemStats => {
  const baseCpu = 30 + Math.random() * 40;
  const baseMem = 40 + Math.random() * 30;
  
  return {
    cpu: Math.round(baseCpu),
    memory: Math.round(baseMem),
    disk: Math.round(50 + Math.random() * 30),
    network: Math.round(Math.random() * 100),
    cpuHistory: Array(20).fill(0).map(() => Math.round(baseCpu + (Math.random() - 0.5) * 20)),
    memHistory: Array(20).fill(0).map(() => Math.round(baseMem + (Math.random() - 0.5) * 15)),
  };
};

export const SystemMonitorWidget = ({ widget }: SystemMonitorWidgetProps) => {
  const [stats, setStats] = useState<SystemStats>(() => generateStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const newCpu = Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10));
        const newMem = Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 5));
        
        return {
          cpu: Math.round(newCpu),
          memory: Math.round(newMem),
          disk: prev.disk,
          network: Math.round(Math.random() * 100),
          cpuHistory: [...prev.cpuHistory.slice(1), Math.round(newCpu)],
          memHistory: [...prev.memHistory.slice(1), Math.round(newMem)],
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isSmall = widget.size === 'small';
  const isLarge = widget.size === 'large';

  const MiniGraph = ({ data, color }: { data: number[]; color: string }) => (
    <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M 0 ${30 - (data[0] / 100) * 30} ${data.map((v, i) => 
          `L ${(i / (data.length - 1)) * 100} ${30 - (v / 100) * 30}`
        ).join(' ')} L 100 30 L 0 30 Z`}
        fill={`url(#gradient-${color})`}
      />
      <path
        d={`M 0 ${30 - (data[0] / 100) * 30} ${data.map((v, i) => 
          `L ${(i / (data.length - 1)) * 100} ${30 - (v / 100) * 30}`
        ).join(' ')}`}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  );

  const StatBar = ({ label, value, icon: Icon, color }: { 
    label: string; 
    value: number; 
    icon: typeof Cpu; 
    color: string;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" style={{ color }} />
          <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  if (isSmall) {
    return (
      <div className="w-full h-full p-3 flex flex-col justify-center gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-xs text-muted-foreground">CPU</span>
          </div>
          <span className="text-sm font-mono text-cyan-400">{stats.cpu}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <MemoryStick className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-muted-foreground">RAM</span>
          </div>
          <span className="text-sm font-mono text-purple-400">{stats.memory}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-3 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">System Monitor</span>
      </div>

      <div className="grid gap-2 flex-1">
        <StatBar label="CPU" value={stats.cpu} icon={Cpu} color="#22d3ee" />
        <StatBar label="Memory" value={stats.memory} icon={MemoryStick} color="#a855f7" />
        <StatBar label="Disk" value={stats.disk} icon={HardDrive} color="#22c55e" />
      </div>

      {isLarge && (
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground mb-2">CPU History</div>
          <MiniGraph data={stats.cpuHistory} color="#22d3ee" />
          <div className="text-xs text-muted-foreground mb-2 mt-2">Memory History</div>
          <MiniGraph data={stats.memHistory} color="#a855f7" />
        </div>
      )}
    </div>
  );
};
