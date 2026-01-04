import { useState, useEffect } from "react";
import { Bot, AlertTriangle, Users, MessageSquare, Shield, TrendingUp, Activity, Wifi, Clock, Bell, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MonitoringEvent {
  id: string;
  event_type: string;
  event_data: any;
  user_id: string | null;
  created_at: string;
}

interface AnomalyAlert {
  id: string;
  type: 'signup_spike' | 'message_flood' | 'failed_logins' | 'suspicious_activity';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  count: number;
}

export const NaviMonitoringTab = () => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    signupsLast5Min: 0,
    messagesLast5Min: 0,
    activeUsers: 0,
    failedLogins: 0
  });

  // Thresholds for anomaly detection
  const THRESHOLDS = {
    signupsPerFiveMin: 5,
    messagesPerFiveMin: 20,
    failedLoginsPerFiveMin: 10
  };

  const fetchMonitoringData = async () => {
    try {
      // Fetch recent monitoring events
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: recentEvents, error } = await supabase
        .from('monitoring_events')
        .select('*')
        .gte('created_at', fiveMinAgo)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setEvents(recentEvents || []);

      // Calculate stats
      const signups = recentEvents?.filter(e => e.event_type === 'signup').length || 0;
      const messages = recentEvents?.filter(e => e.event_type === 'message').length || 0;
      const failedLogins = recentEvents?.filter(e => e.event_type === 'failed_login').length || 0;

      setStats({
        signupsLast5Min: signups,
        messagesLast5Min: messages,
        activeUsers: new Set(recentEvents?.map(e => e.user_id).filter(Boolean)).size,
        failedLogins
      });

      // Check for anomalies
      const newAlerts: AnomalyAlert[] = [];
      
      if (signups >= THRESHOLDS.signupsPerFiveMin) {
        newAlerts.push({
          id: `signup-${Date.now()}`,
          type: 'signup_spike',
          severity: signups >= THRESHOLDS.signupsPerFiveMin * 2 ? 'critical' : 'warning',
          message: `Unusual signup activity: ${signups} new signups in 5 minutes`,
          timestamp: new Date(),
          count: signups
        });
      }

      if (messages >= THRESHOLDS.messagesPerFiveMin) {
        newAlerts.push({
          id: `message-${Date.now()}`,
          type: 'message_flood',
          severity: messages >= THRESHOLDS.messagesPerFiveMin * 2 ? 'critical' : 'warning',
          message: `High message volume: ${messages} messages in 5 minutes`,
          timestamp: new Date(),
          count: messages
        });
      }

      if (failedLogins >= THRESHOLDS.failedLoginsPerFiveMin) {
        newAlerts.push({
          id: `login-${Date.now()}`,
          type: 'failed_logins',
          severity: failedLogins >= THRESHOLDS.failedLoginsPerFiveMin * 2 ? 'critical' : 'warning',
          message: `Multiple failed login attempts: ${failedLogins} failures in 5 minutes`,
          timestamp: new Date(),
          count: failedLogins
        });
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));
        // Show toast for critical alerts
        newAlerts.filter(a => a.severity === 'critical').forEach(alert => {
          toast.error(`🚨 NAVI Alert: ${alert.message}`);
        });
      }

    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);

    // Subscribe to realtime events
    const channel = supabase
      .channel('monitoring-events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'monitoring_events' },
        (payload) => {
          setEvents(prev => [payload.new as MonitoringEvent, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'signup': return <Users className="w-3 h-3 text-green-400" />;
      case 'message': return <MessageSquare className="w-3 h-3 text-cyan-400" />;
      case 'login': return <Shield className="w-3 h-3 text-blue-400" />;
      case 'failed_login': return <AlertTriangle className="w-3 h-3 text-amber-400" />;
      default: return <Activity className="w-3 h-3 text-slate-400" />;
    }
  };

  const getAlertColor = (severity: 'warning' | 'critical') => {
    return severity === 'critical' 
      ? 'bg-red-500/20 border-red-500/50 text-red-400'
      : 'bg-amber-500/20 border-amber-500/50 text-amber-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">NAVI Monitoring</h3>
            <p className="text-xs text-muted-foreground">Real-time activity monitoring & anomaly detection</p>
          </div>
        </div>
        <Button onClick={fetchMonitoringData} variant="outline" size="sm" className="gap-2">
          <Wifi className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-mono">SIGNUPS (5m)</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.signupsLast5Min}</div>
          {stats.signupsLast5Min >= THRESHOLDS.signupsPerFiveMin && (
            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Above threshold
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-mono">MESSAGES (5m)</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stats.messagesLast5Min}</div>
          {stats.messagesLast5Min >= THRESHOLDS.messagesPerFiveMin && (
            <div className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> High volume
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-mono">ACTIVE USERS</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.activeUsers}</div>
        </div>

        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-400 font-mono">FAILED LOGINS</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.failedLogins}</div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-400" />
            <h4 className="font-bold text-red-400">Active Alerts</h4>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-mono">
              {alerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border flex items-center gap-3 ${getAlertColor(alert.severity)}`}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs opacity-70">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  alert.severity === 'critical' ? 'bg-red-500/30' : 'bg-amber-500/30'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold">Live Activity Feed</h4>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        </div>
        
        <ScrollArea className="h-[300px] rounded-lg border border-slate-800 bg-slate-900/50 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading activity feed...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Bot className="w-8 h-8 mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Events will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-xs">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50"
                >
                  {getEventIcon(event.event_type)}
                  <span className="text-slate-400">
                    [{new Date(event.created_at).toLocaleTimeString()}]
                  </span>
                  <span className="text-slate-300 uppercase">{event.event_type}</span>
                  {event.user_id && (
                    <span className="text-cyan-400 truncate">
                      {event.user_id.slice(0, 8)}...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
        <div className="flex items-start gap-3">
          <Bot className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-bold text-cyan-400 mb-1">About NAVI Monitoring</p>
            <p className="text-xs text-slate-400">
              NAVI automatically monitors for unusual patterns like signup spikes, 
              message floods, and suspicious login attempts. Critical alerts are 
              shown immediately. Thresholds: {THRESHOLDS.signupsPerFiveMin}+ signups, {" "}
              {THRESHOLDS.messagesPerFiveMin}+ messages, {THRESHOLDS.failedLoginsPerFiveMin}+ failed logins per 5 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
