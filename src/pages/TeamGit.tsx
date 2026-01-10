import { ArrowLeft, Github, GitCommit, Users, Star, Code, Heart, ExternalLink, Loader2, GitBranch, GitPullRequest, Award, Clock, Activity, FileCode, AlertCircle, CheckCircle2, Bot, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

interface GitHubRepoStats {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
  size: number;
}

interface Contributor {
  name: string;
  role: string;
  contributions: string[];
  description: string;
  github?: string;
  githubUrl?: string;
  avatarUrl?: string;
  avatarIcon?: React.ReactNode;
  joinedAt?: string;
  contributionCount?: number;
  highlight?: string;
}

const coreTeam: Contributor[] = [
  {
    name: "Aswd_LV",
    role: "Founder and Lead Developer",
    contributions: ["Core architecture", "Window management", "Authentication", "Cloud sync", "Admin panel", "DefDev console"],
    description: "Started the project in January 2025 and has written the vast majority of the codebase. Handles architecture decisions, feature development, and project direction.",
    github: "aswdBatch",
    joinedAt: "January 2025",
    highlight: "Project founder",
  },
  {
    name: "plplll",
    role: "Developer and Tester",
    contributions: ["Cloud features", "Testing", "Code contributions", "Feedback"],
    description: "Joined early in development to help with cloud features, testing, and providing feedback on the direction of the project.",
    joinedAt: "Early 2025",
  },
  {
    name: "robo-karlix",
    role: "Lead Tester and Ideas",
    contributions: ["Extensive testing", "Feature ideas", "Edge case hunting", "Technical perspective"],
    description: "Handles thorough testing from a technical standpoint, finding edge cases and contributing feature ideas that improve the overall experience.",
    avatarIcon: <Bot className="w-6 h-6 text-purple-400" />,
    joinedAt: "2025",
    highlight: "High-volume testing",
  },
  {
    name: "Kombainis_yehaw",
    role: "QA Tester",
    contributions: ["Bug hunting", "Quality assurance", "User perspective"],
    description: "Tests the project from a regular user perspective, finding issues that casual usage reveals and ensuring the experience makes sense.",
    joinedAt: "2025",
  },
];

const TeamGit = () => {
  const [githubContributors, setGithubContributors] = useState<GitHubContributor[]>([]);
  const [repoStats, setRepoStats] = useState<GitHubRepoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contributorsRes, repoRes] = await Promise.all([
          fetch('https://api.github.com/repos/aswdbatch/Urbanshade-OS/contributors'),
          fetch('https://api.github.com/repos/aswdbatch/Urbanshade-OS'),
        ]);

        if (!contributorsRes.ok) throw new Error('Failed to fetch contributors');
        if (!repoRes.ok) throw new Error('Failed to fetch repo stats');

        const contributorsData: GitHubContributor[] = await contributorsRes.json();
        const repoData: GitHubRepoStats = await repoRes.json();

        const filtered = contributorsData.filter(c => 
          c.type === 'User' && 
          c.login.toLowerCase() !== 'aswdbatch'
        );
        
        setGithubContributors(filtered);
        setRepoStats(repoData);
      } catch (err) {
        console.error('Failed to fetch GitHub data:', err);
        setError('Failed to load GitHub data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalContributions = githubContributors.reduce((acc, c) => acc + c.contributions, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <GitCommit className="w-4 h-4 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-purple-400">All Contributors</h1>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/aswdbatch/Urbanshade-OS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              Repository
            </a>
            <Link 
              to="/team" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Team
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center border border-purple-500/30">
              <Users className="w-12 h-12 text-purple-400" />
            </div>
            <div className="absolute -inset-4 bg-purple-500/10 blur-2xl rounded-full -z-10" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Every <span className="text-purple-400">Contributor</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              This is a complete list of everyone who has contributed to Urbanshade OS. Whether through 
              code commits, testing, ideas, or feedback - every contribution is valued.
            </p>
          </div>

          <div className="flex justify-center gap-4 text-sm flex-wrap">
            <span className="px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              {coreTeam.length} Core Team
            </span>
            {githubContributors.length > 0 && (
              <span className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 font-medium flex items-center gap-2">
                <Github className="w-4 h-4" />
                {githubContributors.length} GitHub Contributors
              </span>
            )}
            <span className="px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {coreTeam.length + githubContributors.length} Total
            </span>
          </div>
        </section>

        {/* Repository Stats */}
        {repoStats && (
          <section className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Repository Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <Star className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{repoStats.stargazers_count}</div>
                <div className="text-xs text-muted-foreground">Stars</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <GitBranch className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{repoStats.forks_count}</div>
                <div className="text-xs text-muted-foreground">Forks</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <AlertCircle className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{repoStats.open_issues_count}</div>
                <div className="text-xs text-muted-foreground">Open Issues</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <FileCode className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{repoStats.language || 'TS'}</div>
                <div className="text-xs text-muted-foreground">Language</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <Zap className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round(repoStats.size / 1024)}MB</div>
                <div className="text-xs text-muted-foreground">Size</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-sm font-bold">{formatDate(repoStats.updated_at)}</div>
                <div className="text-xs text-muted-foreground">Last Update</div>
              </div>
            </div>
          </section>
        )}

        {/* Core Team Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              Core Team
            </h3>
            <span className="text-sm text-muted-foreground">{coreTeam.length} members</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {coreTeam.map((contributor) => (
              <div 
                key={contributor.name}
                className={`p-6 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 hover:border-yellow-500/50 transition-all ${contributor.highlight ? 'ring-1 ring-yellow-500/20' : ''}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  {contributor.avatarIcon ? (
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                      {contributor.avatarIcon}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-yellow-400">{contributor.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-yellow-400">{contributor.name}</h4>
                      {contributor.highlight && (
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                          {contributor.highlight}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{contributor.role}</p>
                  </div>
                  {contributor.github && (
                    <a 
                      href={`https://github.com/${contributor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Github className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{contributor.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {contributor.contributions.map((contrib, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400/90 border border-yellow-500/20"
                    >
                      {contrib}
                    </span>
                  ))}
                </div>
                
                {contributor.joinedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Since {contributor.joinedAt}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* GitHub Contributors Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Github className="w-5 h-5 text-purple-400" />
              </div>
              GitHub Contributors
            </h3>
            {!isLoading && !error && (
              <span className="text-sm text-muted-foreground">
                {githubContributors.length} contributors, {totalContributions} commits
              </span>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-400 mx-auto" />
                <p className="text-muted-foreground">Loading contributors from GitHub...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later or view contributors directly on GitHub.</p>
              <a 
                href="https://github.com/aswdbatch/Urbanshade-OS/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                View on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : githubContributors.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-xl bg-white/5 border border-white/10">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No additional GitHub contributors yet</p>
              <p className="text-sm text-muted-foreground mt-2">Be the first to contribute and see your name here.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {githubContributors.map((contributor) => (
                <div 
                  key={contributor.id}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/[0.07] transition-all group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={contributor.avatar_url} 
                      alt={contributor.login}
                      className="w-14 h-14 rounded-xl border-2 border-purple-500/30 group-hover:border-purple-500/50 transition-colors"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate group-hover:text-purple-400 transition-colors">
                        {contributor.login}
                      </h4>
                      <p className="text-sm text-muted-foreground">GitHub Contributor</p>
                    </div>
                    <a 
                      href={contributor.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/20 text-purple-400 border border-purple-500/20 font-medium flex items-center gap-2">
                      <GitCommit className="w-4 h-4" />
                      {contributor.contributions} commit{contributor.contributions > 1 ? 's' : ''}
                    </span>
                    {contributor.contributions >= 10 && (
                      <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contribution Types */}
        <section className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-400" />
            Ways to Contribute
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <Code className="w-6 h-6 text-blue-400 mb-3" />
              <h4 className="font-bold mb-1">Code</h4>
              <p className="text-sm text-muted-foreground">Fix bugs, add features, improve performance.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <AlertCircle className="w-6 h-6 text-orange-400 mb-3" />
              <h4 className="font-bold mb-1">Bug Reports</h4>
              <p className="text-sm text-muted-foreground">Find and report issues so they can be fixed.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <GitPullRequest className="w-6 h-6 text-green-400 mb-3" />
              <h4 className="font-bold mb-1">Ideas</h4>
              <p className="text-sm text-muted-foreground">Suggest new features and improvements.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <FileCode className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="font-bold mb-1">Documentation</h4>
              <p className="text-sm text-muted-foreground">Help make the docs clearer and more complete.</p>
            </div>
          </div>
        </section>

        {/* Start Contributing */}
        <section className="p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 text-center">
          <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Code className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Want to See Your Name Here?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Contribute to Urbanshade OS and get added to this list. Every bug report, code contribution, 
            idea, or feedback counts. Your GitHub avatar will appear here automatically once you make a commit.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a 
              href="https://github.com/aswdbatch/Urbanshade-OS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30 transition-colors font-medium"
            >
              <Github className="w-5 h-5" />
              Start Contributing
            </a>
            <a 
              href="https://github.com/aswdbatch/Urbanshade-OS/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 transition-colors font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              View Issues
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/10 space-y-4">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500" /> by the Urbanshade community
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/team" className="text-primary hover:underline text-sm font-semibold">
              Back to Team Page
            </Link>
            <a 
              href="https://github.com/aswdbatch/Urbanshade-OS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-1"
            >
              GitHub Repository <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default TeamGit;
