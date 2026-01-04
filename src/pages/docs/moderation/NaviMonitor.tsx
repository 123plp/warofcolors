import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Activity, MessageSquare, Clock, Shield, Filter, Lock, AlertTriangle, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const NaviMonitor = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Message Queue',
      description: 'View messages currently being processed by NAVI, including priority levels and delivery status.',
      color: 'text-cyan-400',
    },
    {
      icon: Filter,
      title: 'Filter Statistics',
      description: 'See how many messages NAVI has filtered, flagged, or allowed through in real-time.',
      color: 'text-green-400',
    },
    {
      icon: Clock,
      title: 'Response Times',
      description: 'Monitor NAVI\'s response latency and overall performance metrics.',
      color: 'text-yellow-400',
    },
    {
      icon: Lock,
      title: 'Lockout Events',
      description: 'Track when NAVI triggered lockouts for suspicious activity and the reasons behind them.',
      color: 'text-red-400',
    },
    {
      icon: Activity,
      title: 'Processing Status',
      description: 'Real-time view of NAVI\'s processing pipeline and any bottlenecks.',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400">NAVI Monitor</h1>
          <Link 
            to="/docs/moderation" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Moderation
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <Eye className="w-16 h-16 mx-auto text-cyan-400" />
          <h2 className="text-4xl font-bold">NAVI Monitor</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The NAVI Monitor tab gives admins visibility into UrbanShade's automated messaging system and content filtering.
          </p>
        </section>

        <Alert className="border-cyan-500/50 bg-cyan-500/10">
          <Shield className="h-4 w-4 text-cyan-500" />
          <AlertTitle className="text-cyan-400">What is NAVI?</AlertTitle>
          <AlertDescription>
            NAVI is UrbanShade's automated bot system. It handles broadcasts, filters messages to the creator, 
            manages announcements, and can trigger lockouts when it detects suspicious activity. Think of it as the facility's AI assistant.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Monitor Features</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    <span className={feature.color}>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Understanding NAVI Lockouts</h3>
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-muted-foreground">
              NAVI can automatically lock out users who trigger certain security thresholds:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-red-400">Spam Detection:</strong> Sending too many messages too quickly</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-red-400">Suspicious Patterns:</strong> Behavior that matches known attack patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-red-400">Keyword Triggers:</strong> Messages containing flagged content</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Lockouts are temporary and can be reviewed/lifted by admins in the monitor.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Message Filtering to Aswd</h3>
          <div className="p-6 rounded-lg bg-purple-500/10 border border-purple-500/30 space-y-4">
            <p className="text-muted-foreground">
              When users message the creator (Aswd), NAVI reviews the message first:
            </p>
            <div className="grid gap-3 md:grid-cols-2 mt-4">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="text-sm font-bold text-green-400">✓ VIPs</span>
                <p className="text-xs text-muted-foreground mt-1">Messages bypass NAVI filtering and go directly to Aswd</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="text-sm font-bold text-amber-400">○ Regular Users</span>
                <p className="text-xs text-muted-foreground mt-1">Messages are reviewed by NAVI before being delivered</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Using the Monitor</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                <span>Navigate to the Moderation Panel at <code className="px-2 py-0.5 rounded bg-slate-800 text-primary">/moderation</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                <span>Click the "NAVI Monitor" tab</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</span>
                <span>View the live dashboard with message queue, filter stats, and lockout logs</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</span>
                <span>Click on any lockout event to see details and optionally lift it</span>
              </li>
            </ol>
          </div>
        </section>

        <div className="flex gap-4">
          <Link to="/docs/moderation">
            <Button variant="outline">← Overview</Button>
          </Link>
          <Link to="/docs/moderation/actions">
            <Button variant="outline">Moderation Actions →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NaviMonitor;