import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Shield, Crown, AlertCircle, Users, Flag, CheckCircle, AlertTriangle, Bug, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface Admin {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Reporting = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data: adminRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        if (rolesError) throw rolesError;

        if (adminRoles && adminRoles.length > 0) {
          const adminIds = adminRoles.map(r => r.user_id);
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', adminIds);

          if (profilesError) throw profilesError;
          
          setAdmins(profiles || []);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const reportTypes = [
    {
      icon: UserX,
      title: 'User Misconduct',
      description: 'Harassment, spam, inappropriate content, impersonation, or scam attempts.',
      color: 'text-red-400',
    },
    {
      icon: Shield,
      title: 'Security Issues',
      description: 'Suspicious activity, potential exploits, vulnerabilities, or account compromise.',
      color: 'text-yellow-400',
    },
    {
      icon: Bug,
      title: 'Bugs & Glitches',
      description: 'Broken features, unexpected behavior, crashes, or visual issues.',
      color: 'text-orange-400',
    },
    {
      icon: Flag,
      title: 'Content Concerns',
      description: 'Inappropriate messages, concerning content, or policy violations.',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Reporting Issues</h1>
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
          <Flag className="w-16 h-16 mx-auto text-primary" />
          <h2 className="text-4xl font-bold">Report Problems</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Found something wrong? Here's how to report issues, rule-breakers, and bugs in UrbanShade OS.
          </p>
        </section>

        <Alert className="border-primary/50 bg-primary/10">
          <MessageSquare className="h-4 w-4" />
          <AlertTitle>How to Report</AlertTitle>
          <AlertDescription>
            The simplest way to report anything is to message an admin directly using the <strong>Messages</strong> app. 
            They'll review your report and take action as needed.
          </AlertDescription>
        </Alert>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">What Can Be Reported?</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((type) => (
              <Card key={type.title} className="bg-black/40 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <type.icon className={`w-5 h-5 ${type.color}`} />
                    <span className={type.color}>{type.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Current Administrators
          </h3>
          <p className="text-muted-foreground">
            These are the admins you can contact for help. They have the power to investigate and take action:
          </p>
          
          {loading ? (
            <div className="p-6 rounded-lg bg-black/40 border border-white/10">
              <div className="text-muted-foreground animate-pulse">Loading administrators...</div>
            </div>
          ) : admins.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Administrators Found</AlertTitle>
              <AlertDescription>
                Unable to load the administrator list right now. Try again later or check if you're connected.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {admins.map((admin) => (
                <Card key={admin.id} className="bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-red-500/30">
                        <AvatarImage src={admin.avatar_url || undefined} />
                        <AvatarFallback className="bg-red-500/20 text-red-400">
                          {(admin.display_name || admin.username || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {admin.display_name || admin.username}
                          <Badge variant="outline" className="text-red-400 border-red-500/50">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">@{admin.username}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Writing a Good Report</h3>
          <div className="p-6 rounded-lg bg-black/40 border border-white/10 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Help admins help you by including the right information:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Be specific</span>
                  <p className="text-sm text-muted-foreground">Describe exactly what happened, where, and when.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Include usernames</span>
                  <p className="text-sm text-muted-foreground">If reporting a user, include their exact username.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Add screenshots</span>
                  <p className="text-sm text-muted-foreground">Visual evidence helps admins understand and verify the issue.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-green-400">Be patient</span>
                  <p className="text-sm text-muted-foreground">Admins will respond as soon as they can. Don't spam multiple admins with the same report.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-400">False Reports</AlertTitle>
          <AlertDescription>
            Filing false reports wastes everyone's time and may result in action being taken against your account. 
            Only report genuine issues and concerns.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Link to="/docs/safety/account">
            <Button variant="outline">← Account Safety</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Reporting;