import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gavel, Ban, AlertTriangle, Clock, UserX, Shield, Sparkles, Eye, Radio, Lock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ModerationActions = () => {
  const userActions = [
    {
      icon: Eye,
      title: 'View User Details',
      description: 'See full profile, account creation date, last activity, warnings, and moderation history.',
      severity: 'Info',
      color: 'text-cyan-400',
    },
    {
      icon: AlertTriangle,
      title: 'Issue Warning',
      description: 'Formal notice to a user about rule violations. Warnings are tracked and can lead to bans if accumulated.',
      severity: 'Low',
      color: 'text-yellow-400',
    },
    {
      icon: Clock,
      title: 'Temporary Ban',
      description: 'Suspend a user for a specified duration. They see a ban screen with the reason and duration.',
      severity: 'High',
      color: 'text-orange-400',
    },
    {
      icon: Ban,
      title: 'Permanent Ban',
      description: 'Remove a user permanently. Reserved for severe or repeated violations. A clear reason is required.',
      severity: 'Critical',
      color: 'text-red-400',
    },
    {
      icon: Sparkles,
      title: 'Grant VIP Status',
      description: 'Owner-only. Gives the user VIP perks like cloud priority, message check bypass, and the purple badge.',
      severity: 'Owner Only',
      color: 'text-purple-400',
    },
    {
      icon: UserX,
      title: 'Demote Admin (De-OP)',
      description: 'Owner-only. Removes admin privileges from a user. This action is logged and the user is notified.',
      severity: 'Owner Only',
      color: 'text-red-600',
    },
  ];

  const quickActions = [
    {
      icon: Lock,
      title: 'Lock Site',
      description: 'Emergency lockdown. Prevents all non-admin users from accessing the site.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: Radio,
      title: 'Global Broadcast',
      description: 'Send a message to all online users. Great for announcements and emergency alerts.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Settings,
      title: 'Maintenance Mode',
      description: 'Show a maintenance screen to regular users while admins can still access the system.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Clock,
      title: 'Scheduled Actions',
      description: 'Plan bans, unbans, or other actions to execute at a specific time.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-400">Moderation Actions</h1>
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
          <Gavel className="w-16 h-16 mx-auto text-red-400" />
          <h2 className="text-4xl font-bold">Moderation Actions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The enforcement tools available to admins in UrbanShade OS. Use responsibly.
          </p>
        </section>

        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Shield className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-400">All Actions Are Logged</AlertTitle>
          <AlertDescription>
            Every moderation action is recorded with timestamp, who did it, and why. 
            Abuse of moderation powers may result in role revocation.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">User Actions</h3>
          <div className="space-y-3">
            {userActions.map((action) => (
              <Card key={action.title} className="bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <span className={action.color}>{action.title}</span>
                    </CardTitle>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${action.color} bg-white/5`}>
                      {action.severity}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Quick Actions</h3>
          <p className="text-muted-foreground">
            System-wide controls for emergencies and maintenance:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <Card key={action.title} className={`${action.bgColor} border-white/10`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className={action.color}>{action.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Guidelines</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-6">
            <div>
              <h4 className="font-bold text-primary mb-2">Progressive Discipline</h4>
              <p className="text-sm text-muted-foreground">
                Start with warnings. Then temporary bans. Permanent bans are a last resort for repeated or severe violations.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-2">Always Include a Reason</h4>
              <p className="text-sm text-muted-foreground">
                Every action requires a reason. Be specific about what rule was violated and include evidence if possible.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-2">Be Consistent</h4>
              <p className="text-sm text-muted-foreground">
                Apply rules equally to all users. Personal relationships should not affect moderation decisions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-primary mb-2">Appeals Happen</h4>
              <p className="text-sm text-muted-foreground">
                Users can appeal bans by contacting an admin. Be prepared to justify your decision or reconsider if new info emerges.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">How to Take Action</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                <span>Find the user in the Users tab or click on them from a report</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                <span>Click the action button (warn, ban, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</span>
                <span>Fill in the reason and any required fields (duration for temp bans)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</span>
                <span>Review the preview showing what the user will see</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</span>
                <span>Confirm the action</span>
              </li>
            </ol>
          </div>
        </section>

        <div className="flex gap-4">
          <Link to="/docs/moderation/navi">
            <Button variant="outline">← NAVI Monitor</Button>
          </Link>
          <Link to="/docs/moderation/stats">
            <Button variant="outline">Statistics →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ModerationActions;