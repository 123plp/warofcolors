import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Activity, TrendingUp, Clock, Shield, PieChart, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Statistics = () => {
  const metrics = [
    {
      icon: Users,
      title: 'User Growth',
      description: 'Track new signups, active users, and user retention over time with interactive charts.',
      color: 'text-blue-400',
    },
    {
      icon: Activity,
      title: 'Moderation Metrics',
      description: 'See warnings issued, bans enacted, and appeals processed with trend analysis.',
      color: 'text-red-400',
    },
    {
      icon: PieChart,
      title: 'Role Distribution',
      description: 'Visualize the breakdown of users by role: regular users, VIPs, staff, and admins.',
      color: 'text-purple-400',
    },
    {
      icon: Calendar,
      title: 'Activity Heatmap',
      description: 'See when users are most active to plan maintenance windows and announcements.',
      color: 'text-green-400',
    },
    {
      icon: TrendingUp,
      title: 'Engagement Trends',
      description: 'Monitor message volumes, feature usage, and overall platform engagement.',
      color: 'text-amber-400',
    },
    {
      icon: Clock,
      title: 'Session Analytics',
      description: 'Average session duration, bounce rates, and user engagement time.',
      color: 'text-cyan-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-400">Statistics Dashboard</h1>
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
          <BarChart3 className="w-16 h-16 mx-auto text-blue-400" />
          <h2 className="text-4xl font-bold">Statistics Dashboard</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analytics and insights about UrbanShade OS usage, moderation actions, and user activity.
          </p>
        </section>

        <Alert className="border-blue-500/50 bg-blue-500/10">
          <Shield className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-400">Admin Access Required</AlertTitle>
          <AlertDescription>
            The Statistics Dashboard is only accessible to users with administrator privileges. 
            All data is refreshed in real-time.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Available Metrics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {metrics.map((metric) => (
              <Card key={metric.title} className="bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                    <span className={metric.color}>{metric.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{metric.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Using Statistics Effectively</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-6">
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Identify Peak Times</h4>
              <p className="text-sm text-muted-foreground">
                Use the activity heatmap to see when users are most active. Schedule maintenance during 
                low-activity periods and ensure admin coverage during peak times.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Track Moderation Load</h4>
              <p className="text-sm text-muted-foreground">
                Monitor warning and ban trends. A sudden spike might indicate a raid or coordinated attack. 
                A steady increase might mean you need more moderators.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Measure Health</h4>
              <p className="text-sm text-muted-foreground">
                User retention and engagement metrics tell you if the community is healthy. 
                Declining engagement might mean it's time for new features or events.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 mb-2">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Need deeper analysis? Export data for external tools. Useful for reports or long-term trend analysis.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Accessing the Dashboard</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                <span>Navigate to the Moderation Panel at <code className="px-2 py-0.5 rounded bg-slate-800 text-primary">/moderation</code></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                <span>Click the "Stats" tab</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</span>
                <span>Use the date range picker to filter data by time period</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</span>
                <span>Click on any chart for more detailed breakdowns</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">5</span>
                <span>Use the <Download className="w-4 h-4 inline" /> export button for external analysis</span>
              </li>
            </ol>
          </div>
        </section>

        <div className="flex gap-4">
          <Link to="/docs/moderation/actions">
            <Button variant="outline">← Moderation Actions</Button>
          </Link>
          <Link to="/docs/moderation">
            <Button variant="outline">Back to Overview</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Statistics;