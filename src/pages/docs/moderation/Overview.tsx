import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Crown, Eye, Gavel, BarChart3, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ModerationOverview = () => {
  const sections = [
    {
      icon: Eye,
      title: 'NAVI Monitor',
      description: 'Real-time monitoring of NAVI bot activity, message filtering, and lockout events.',
      link: '/docs/moderation/navi',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Gavel,
      title: 'Moderation Actions',
      description: 'Warnings, bans, VIP grants, and other enforcement tools available to staff.',
      link: '/docs/moderation/actions',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      icon: BarChart3,
      title: 'Statistics Dashboard',
      description: 'User growth, moderation metrics, role distribution, and activity analytics.',
      link: '/docs/moderation/stats',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-400">Moderation Overview</h1>
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
          <Shield className="w-16 h-16 mx-auto text-red-400" />
          <h2 className="text-4xl font-bold">Moderation Panel</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The moderation panel is where admins manage users, handle reports, and keep UrbanShade OS running smoothly.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            <Lock className="w-4 h-4" />
            Admin Access Required
          </div>
        </section>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-400">Demo Mode Available</AlertTitle>
          <AlertDescription>
            Non-admins can view the moderation panel at <code className="px-2 py-0.5 rounded bg-black/50">/moderation</code> in 
            demo mode. All actions are simulated and don't affect real users - great for learning the interface!
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Role Hierarchy</h3>
          <div className="space-y-4">
            <Card className="bg-yellow-500/5 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-400">Creator (Aswd)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Full control over everything. Can grant/revoke admin status, VIP status, and access all 
                  owner-only features like lockdowns and de-ops. The only one who can make someone an admin.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-red-500/5 border-red-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  <span className="text-red-400">Administrator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Full access to the moderation panel, user management, bans, warnings, and most system controls. 
                  Cannot grant admin status to others or access owner-only features.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Panel Sections</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {sections.map((section) => (
              <Link to={section.link} key={section.title}>
                <Card className={`h-full hover:bg-white/5 transition-colors cursor-pointer border-white/10 ${section.bgColor}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <section.icon className={`w-5 h-5 ${section.color}`} />
                      <span className={section.color}>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{section.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Accessing the Panel</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <p className="text-muted-foreground">
              The moderation panel is available at <code className="px-2 py-1 rounded bg-slate-800 text-primary">/moderation</code>.
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">1.</span>
                Make sure you're logged into an admin account
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">2.</span>
                Navigate to /moderation or use the admin link in your profile
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">3.</span>
                If you see a "Demo Mode" banner, you don't have admin access
              </li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ModerationOverview;