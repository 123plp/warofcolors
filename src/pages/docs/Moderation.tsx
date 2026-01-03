import { ArrowLeft, Shield, Users, Ban, MessageSquare, AlertTriangle, Eye, Lock, Radio, Settings, UserX, Clock, Flag, Sparkles, Crown, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Moderation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-red-400">Moderation Guide</h1>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-red-400" />
          <h2 className="text-4xl font-bold">Moderation Panel Guide</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive guide for admins on how to use the moderation panel effectively. 
            This is an internal document - handle with care.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
            <Lock className="w-4 h-4" />
            Admin Access Required
          </div>
        </section>

        {/* Getting Started */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">1</span>
            Getting Started
          </h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <p className="text-muted-foreground">
              Access the moderation panel at <code className="px-2 py-1 rounded bg-slate-800 text-primary">/moderation</code>. 
              You must be logged in as an admin to use the panel. Non-admins can view the panel in demo mode, 
              but cannot perform any real actions.
            </p>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-amber-400">Demo Mode Notice</span>
              </div>
              <p className="text-sm text-muted-foreground">
                If you're not an admin, you'll see a demo mode banner. All actions in demo mode are simulated 
                and don't affect real users. It's a great way to learn the interface!
              </p>
            </div>
          </div>
        </section>

        {/* User Management */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">2</span>
            User Management
          </h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-6">
            <p className="text-muted-foreground">
              The Users tab is your main workspace for managing accounts.
            </p>

            <div className="grid gap-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-cyan-400">View User Details</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on any user to see their full profile, including account creation date, 
                  last activity, warnings, and moderation history.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400">Issue Warnings</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Warnings are official notices to users about rule violations. They're tracked in the 
                  user's history and can lead to bans if accumulated.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">Ban Users</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bans can be temporary or permanent. When banning, you'll see a preview of the 
                  message the user will receive. Always include a clear reason.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-purple-400">Grant VIP Status</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only Aswd can grant VIP status. VIPs get special perks like cloud priority, 
                  message check bypass, and the coveted purple badge.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-orange-400">Demote Admins (De-OP)</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Owner-only action. Removes admin privileges from a user. Use with caution - 
                  this action is logged and the user will be notified.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">3</span>
            Quick Actions
          </h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-6">
            <p className="text-muted-foreground">
              The Quick Actions panel provides emergency controls and system-wide operations.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">Lock Site</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Emergency lockdown. Prevents all users from accessing the site. 
                  Use only in critical situations (security breach, major attack, etc.).
                </p>
              </div>

              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-amber-400">Global Broadcast</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send a message to all online users. Great for announcements, 
                  maintenance notices, or emergency alerts.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-cyan-400">Maintenance Mode</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enables a maintenance screen for regular users while admins can still access 
                  the system. Perfect for updates and fixes.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="font-bold text-purple-400">Scheduled Actions</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Plan bans, unbans, or other moderation actions to execute at a specific time. 
                  Useful for timed punishments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Logs & Reports */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">4</span>
            Logs & Reports
          </h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <p className="text-muted-foreground">
              The Logs tab tracks all moderation actions for accountability and review.
            </p>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Action History</span>
                  <p className="text-sm text-muted-foreground">
                    Every ban, warning, and moderation action is logged with timestamp, 
                    actor (which admin did it), and reason.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">User Reports</span>
                  <p className="text-sm text-muted-foreground">
                    View reports submitted by users about rule violations or suspicious activity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Security Events</span>
                  <p className="text-sm text-muted-foreground">
                    Track login attempts, password changes, and other security-relevant events.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Tab */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">5</span>
            Security Settings
          </h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <p className="text-muted-foreground">
              The Security tab contains advanced protection features.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="font-bold text-primary">IP Blocking</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Block specific IP addresses from accessing the site.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="font-bold text-primary">Rate Limiting</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure how many requests users can make in a given timeframe.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="font-bold text-primary">Spam Filters</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatic detection and filtering of spam messages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">✓</span>
            Best Practices
          </h3>
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/30 space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-green-400">Always include reasons</strong> - Every action should have a clear, documented reason.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-green-400">Start with warnings</strong> - Unless severe, warn before banning.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-green-400">Use the preview</strong> - Check how ban messages look before sending.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-green-400">Communicate with the team</strong> - Coordinate with other admins on major actions.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-green-400">Stay calm</strong> - Handle situations professionally, even when users are difficult.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground mb-4">
            This document is for authorized personnel only. Handle with care.
          </p>
          <Link to="/" className="text-primary hover:underline">← Return to UrbanShade OS</Link>
        </footer>
      </main>
    </div>
  );
};

export default Moderation;