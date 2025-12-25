import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi, Activity, Zap, Clock, TrendingUp, TrendingDown } from "lucide-react";

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  fps: number;
  renderTime: number;
}

export const PerformanceTab = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    fps: 60,
    renderTime: 0
  });

  const [history, setHistory] = useState<number[]>([]);
  const [memHistory, setMemHistory] = useState<number[]>([]);

  // Simulate performance metrics
  useEffect(() => {
    const updateMetrics = () => {
      const newCpu = Math.min(100, Math.max(5, metrics.cpu + (Math.random() - 0.5) * 20));
      const newMem = Math.min(100, Math.max(20, metrics.memory + (Math.random() - 0.5) * 10));
      
      setMetrics({
        cpu: newCpu,
        memory: newMem,
        disk: Math.min(100, Math.max(0, metrics.disk + (Math.random() - 0.5) * 15)),
        network: Math.min(100, Math.max(0, Math.random() * 50)),
        fps: Math.floor(55 + Math.random() * 10),
        renderTime: Math.floor(5 + Math.random() * 15)
      });

      setHistory(prev => [...prev.slice(-29), newCpu]);
      setMemHistory(prev => [...prev.slice(-29), newMem]);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [metrics]);

  const MetricCard = ({ 
    label, 
    value, 
    icon: Icon, 
    unit = '%',
    color = 'cyan'
  }: { 
    label: string; 
    value: number; 
    icon: React.ElementType;
    unit?: string;
    color?: string;
  }) => {
    const getColor = () => {
      if (value > 80) return 'text-red-400';
      if (value > 60) return 'text-amber-400';
      return `text-${color}-400`;
    };

    return (
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${getColor()}`} />
            <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
          </div>
          <span className={`text-lg font-mono font-bold ${getColor()}`}>
            {value.toFixed(1)}{unit}
          </span>
        </div>
        <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              value > 80 ? 'bg-red-500' : value > 60 ? 'bg-amber-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${Math.min(100, value)}%` }}
          />
        </div>
      </div>
    );
  };

  const MiniGraph = ({ data, color = 'cyan' }: { data: number[]; color?: string }) => {
    const max = Math.max(...data, 1);
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={`var(--${color === 'cyan' ? 'primary' : color})`}
          strokeWidth="2"
          className="opacity-80"
        />
        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={`var(--${color === 'cyan' ? 'primary' : color})`} stopOpacity="0.3" />
          <stop offset="100%" stopColor={`var(--${color === 'cyan' ? 'primary' : color})`} stopOpacity="0" />
        </linearGradient>
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#grad-${color})`}
        />
      </svg>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Performance Monitor</h2>
            <p className="text-xs text-slate-500">Real-time system metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="CPU Usage" value={metrics.cpu} icon={Cpu} />
        <MetricCard label="Memory" value={metrics.memory} icon={HardDrive} color="purple" />
        <MetricCard label="Disk I/O" value={metrics.disk} icon={HardDrive} color="amber" />
        <MetricCard label="Network" value={metrics.network} icon={Wifi} color="green" />
      </div>

      {/* CPU Graph */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">CPU History</span>
          <span className="text-xs text-cyan-400 font-mono">{metrics.cpu.toFixed(1)}%</span>
        </div>
        <MiniGraph data={history} />
      </div>

      {/* Memory Graph */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Memory History</span>
          <span className="text-xs text-purple-400 font-mono">{metrics.memory.toFixed(1)}%</span>
        </div>
        <MiniGraph data={memHistory} color="purple" />
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
          <div className="text-lg font-mono font-bold text-amber-400">{metrics.fps}</div>
          <div className="text-[10px] text-slate-500 uppercase">FPS</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
          <div className="text-lg font-mono font-bold text-cyan-400">{metrics.renderTime}ms</div>
          <div className="text-[10px] text-slate-500 uppercase">Render</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
          {metrics.cpu < 50 ? (
            <TrendingDown className="w-4 h-4 mx-auto mb-1 text-green-400" />
          ) : (
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-red-400" />
          )}
          <div className={`text-lg font-mono font-bold ${metrics.cpu < 50 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.cpu < 50 ? 'Good' : 'High'}
          </div>
          <div className="text-[10px] text-slate-500 uppercase">Status</div>
        </div>
      </div>
    </div>
  );
};
