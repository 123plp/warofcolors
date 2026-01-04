import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Crown, Star, Sparkles, Users, Bot, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Badges = () => {
  const badges = [
    {
      name: 'Creator',
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      description: 'Exclusive to Aswd, the creator of UrbanShade OS. This is the highest trust level - if you see this badge, you\'re talking to the person who built everything!',
      trustLevel: 'Maximum Trust',
    },
    {
      name: 'Admin',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      description: 'Trusted staff members who help maintain UrbanShade. They can moderate content, manage users, and keep things running smoothly. A verification popup confirms their legitimacy when chatting.',
      trustLevel: 'High Trust',
    },
    {
      name: 'VIP',
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      description: 'Users personally recognized by Aswd. VIPs get perks like cloud priority, skipping message checks when contacting Aswd, and the coveted purple badge. If someone has this, they\'re legit.',
      trustLevel: 'Trusted',
    },
    {
      name: 'Bot',
      icon: Bot,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      description: 'Automated messages from NAVI or other system processes. Used for live announcements, update notifications, and system alerts. Bots cannot initiate private conversations - they only broadcast.',
      trustLevel: 'System',
    },
    {
      name: 'User',
      icon: Users,
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      description: 'Regular members exploring and experiencing the underwater chaos of UrbanShade OS. No special badge, but just as cool!',
      trustLevel: 'Standard',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">User Badges</h1>
          <Link 
            to="/docs" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <Star className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Understanding Badges</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Badges help you identify who you're talking to in UrbanShade OS. 
            They're your first line of defense against impersonators.
          </p>
        </section>

        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Why Badges Matter</AlertTitle>
          <AlertDescription>
            Always check for badges before trusting someone claiming to be staff. 
            Real admins and the creator ALWAYS have their badges visible. No exceptions.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Badge Types</h3>
          <div className="space-y-4">
            {badges.map((badge) => (
              <Card key={badge.name} className={`${badge.bgColor} ${badge.borderColor}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <span className={`p-2 rounded-lg ${badge.bgColor}`}>
                        <badge.icon className={`w-5 h-5 ${badge.color}`} />
                      </span>
                      <span className={badge.color}>{badge.name}</span>
                    </CardTitle>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${badge.bgColor} ${badge.color}`}>
                      {badge.trustLevel}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{badge.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">How Are Badges Earned?</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-yellow-500">Creator</span>
                  <p className="text-sm text-muted-foreground">Only Aswd has this. It's not earnable - it's who made UrbanShade.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-red-500">Admin</span>
                  <p className="text-sm text-muted-foreground">Appointed directly by Aswd. These are highly trusted individuals who've proven themselves.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-purple-500">VIP</span>
                  <p className="text-sm text-muted-foreground">Granted personally by Aswd for exceptional contributions or being particularly cool.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-cyan-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-cyan-500">Bot</span>
                  <p className="text-sm text-muted-foreground">System-assigned to automated accounts. You can't get this badge - it's for NAVI and system processes only.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Spotting Fake Badges</h3>
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-muted-foreground">
              Badges are rendered by the system - users cannot add them to their display names. If someone's "badge" 
              looks different from the official ones shown above, or is just text/emoji in their name, they're faking it.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <span className="text-sm font-bold text-green-400">✓ Real badges</span>
                <p className="text-xs text-muted-foreground mt-1">Appear as styled components next to the username, rendered by the app</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="text-sm font-bold text-red-400">✗ Fake badges</span>
                <p className="text-xs text-muted-foreground mt-1">Text or emojis in the username like "[Admin]" or "👑"</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <Link to="/docs/safety/account">
            <Button variant="outline">Account Safety →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Badges;