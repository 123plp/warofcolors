import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Key, AlertTriangle, Fingerprint, EyeOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AccountSafety = () => {
  const securityFeatures = [
    {
      icon: Key,
      title: 'Strong Password',
      description: 'Use a unique password with at least 12 characters. Mix letters, numbers, and symbols. Don\'t reuse passwords from other sites.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      icon: Fingerprint,
      title: 'Two-Factor Authentication',
      description: 'Enable 2FA in your account settings when available. This adds an extra layer of security even if your password is compromised.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: EyeOff,
      title: 'Privacy Settings',
      description: 'Review who can see your profile and activity. Control your visibility in the account settings.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Lock,
      title: 'Session Management',
      description: 'Log out when using shared devices. Check active sessions in your account settings and revoke any you don\'t recognize.',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Account Safety</h1>
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
          <Shield className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Keep Your Account Secure</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your UrbanShade account is your gateway to the facility. Here's how to keep it safe.
          </p>
        </section>

        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-400">Critical Warning</AlertTitle>
          <AlertDescription>
            No one from UrbanShade - including Aswd and admins - will EVER ask for your password. 
            If someone asks, they're trying to steal your account. Report them immediately.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Security Features</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className={`${feature.bgColor} border-white/10`}>
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
          <h3 className="text-2xl font-bold">Recognizing Threats</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-6">
            <div>
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Phishing Attempts
              </h4>
              <p className="text-sm text-muted-foreground">
                Be wary of links promising "free VIP status" or "admin access." Real staff never need to 
                send you external links to verify anything. If a link looks suspicious, don't click it.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-orange-400 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Impersonation
              </h4>
              <p className="text-sm text-muted-foreground">
                Anyone pretending to be Aswd or an admin without the proper badge is fake. Real staff 
                ALWAYS have their badges visible. Check for the official Creator, Admin, or VIP badge.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Suspicious Activity
              </h4>
              <p className="text-sm text-muted-foreground">
                Notice something weird with your account? Unfamiliar logins, settings changes you didn't make, 
                or messages you didn't send? Change your password immediately and contact an admin.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">If Your Account is Compromised</h3>
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Act fast! Here's what to do:
            </p>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                <div>
                  <span className="font-bold text-foreground">Change your password immediately</span>
                  <p className="text-sm text-muted-foreground">Use a completely new password you haven't used anywhere else.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                <div>
                  <span className="font-bold text-foreground">Enable 2FA if not already enabled</span>
                  <p className="text-sm text-muted-foreground">This prevents future unauthorized access even if your password leaks again.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</span>
                <div>
                  <span className="font-bold text-foreground">Revoke all active sessions</span>
                  <p className="text-sm text-muted-foreground">This kicks out anyone currently logged in, including the attacker.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</span>
                <div>
                  <span className="font-bold text-foreground">Message an admin</span>
                  <p className="text-sm text-muted-foreground">Let them know what happened. They can help secure your account and investigate.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <div className="flex gap-4">
          <Link to="/docs/safety/badges">
            <Button variant="outline">← Badges</Button>
          </Link>
          <Link to="/docs/safety/reporting">
            <Button variant="outline">Reporting →</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AccountSafety;