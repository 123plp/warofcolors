import { useState, useEffect } from "react";
import { Lock, Terminal as TerminalIcon, Server, Cpu, HardDrive, Wifi } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

const bootMessages = [
  { text: "[    0.000000] UrbanShade kernel 3.1.0-stable booting...", delay: 0 },
  { text: "[    0.124512] CPU: x86_64 compatible processor detected", delay: 100 },
  { text: "[    0.256789] Memory: 16384MB available", delay: 200 },
  { text: "[    0.389012] ACPI: Core subsystem initialized", delay: 300 },
  { text: "[    0.512345] PCI: Scanning bus 0000:00", delay: 400 },
  { text: "[    0.634567] NET: Registered protocol family 2 (TCP/IP)", delay: 500 },
  { text: "[    0.789123] EXT4-fs: mounted filesystem with ordered data mode", delay: 600 },
  { text: "[    1.023456] systemd[1]: Starting UrbanShade System...", delay: 700 },
  { text: "[    1.256789] systemd[1]: Started Authentication Service.", delay: 850 },
  { text: "[    1.456123] urbanshade[1]: Initializing secure terminal...", delay: 1000 },
  { text: "[  OK  ] Ready for login.", delay: 1200 },
];

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootPhase, setBootPhase] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [uptime, setUptime] = useState(0);

  // Boot sequence animation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    bootMessages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setBootPhase(index + 1);
      }, msg.delay);
      timers.push(timer);
    });

    // Show login form after boot
    const showTimer = setTimeout(() => {
      setShowLogin(true);
    }, 1500);
    timers.push(showTimer);

    return () => timers.forEach(clearTimeout);
  }, []);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Authentication failed: missing credentials");
      return;
    }

    setLoading(true);

    const timeoutId = setTimeout(() => {
      setError("Connection timed out. Retry?");
      setLoading(false);
    }, 10000);

    setTimeout(() => {
      clearTimeout(timeoutId);
      const adminData = localStorage.getItem("urbanshade_admin");
      
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (username === admin.username && password === admin.password) {
          onLogin();
        } else {
          setError("Authentication failed: invalid credentials");
          setLoading(false);
        }
      } else {
        setError("System error: no administrator configured");
        setLoading(false);
      }
    }, 1500);
  };

  const lastLoginDate = new Date();
  lastLoginDate.setHours(lastLoginDate.getHours() - Math.floor(Math.random() * 48));

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 font-mono relative overflow-hidden">
      {/* Matrix-style background rain */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary text-xs whitespace-pre animate-pulse"
            style={{
              left: `${i * 5}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3 + Math.random() * 0.4,
            }}
          >
            {[...Array(20)].map((_, j) => (
              <div key={j} style={{ animationDelay: `${j * 0.1}s` }}>
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Top bar - System info */}
      <div className="border-b border-primary/20 bg-slate-900/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between text-xs text-muted-foreground z-10">
        <div className="flex items-center gap-4">
          <span className="text-primary font-bold">URBANSHADE OS</span>
          <span className="text-muted-foreground/60">|</span>
          <span>kernel: urbanshade-3.1-stable</span>
          <span className="text-muted-foreground/60">|</span>
          <span>arch: x86_64</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-green-400" />
            <span>2.4%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-cyan-400" />
            <span>47.2GB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-green-400" />
            <span>Connected</span>
          </div>
          <span className="text-muted-foreground/60">|</span>
          <span>uptime: {formatUptime(uptime)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Boot log panel */}
        <div className="w-80 border-r border-primary/10 bg-slate-900/50 p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Server className="w-4 h-4 text-primary" />
            <span>System Boot Log</span>
          </div>
          <div className="space-y-1 text-[10px] font-mono">
            {bootMessages.slice(0, bootPhase).map((msg, index) => (
              <div 
                key={index} 
                className={`animate-fade-in ${
                  msg.text.includes('[  OK  ]') 
                    ? 'text-green-400' 
                    : msg.text.includes('Error') 
                      ? 'text-red-400' 
                      : 'text-muted-foreground/70'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {msg.text}
              </div>
            ))}
            {bootPhase === bootMessages.length && (
              <div className="mt-4 pt-4 border-t border-primary/10">
                <div className="text-muted-foreground/50 animate-pulse">
                  █ Awaiting authentication...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={`w-full max-w-md transition-all duration-500 ${showLogin ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* ASCII Art Header */}
            <pre className="text-primary text-[8px] leading-tight mb-6 text-center opacity-60">
{`
 _   _ ____  ____    _    _   _ ____  _   _    _    ____  _____ 
| | | |  _ \\| __ )  / \\  | \\ | / ___|| | | |  / \\  |  _ \\| ____|
| | | | |_) |  _ \\ / _ \\ |  \\| \\___ \\| |_| | / _ \\ | | | |  _|  
| |_| |  _ <| |_) / ___ \\| |\\  |___) |  _  |/ ___ \\| |_| | |___ 
 \\___/|_| \\_\\____/_/   \\_\\_| \\_|____/|_| |_/_/   \\_\\____/|_____|
                                                                 
`}
            </pre>

            {/* Last login info */}
            <div className="text-xs text-muted-foreground/60 mb-4 font-mono">
              <div>Last login: {lastLoginDate.toLocaleString()} from 192.168.1.xxx</div>
              <div className="text-primary/60">Welcome to UrbanShade OS 3.1 LTS (Deep Ocean)</div>
            </div>

            {/* Login Box */}
            <div className="border border-primary/30 bg-slate-900/80 backdrop-blur-sm rounded-lg overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/20 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">urbanshade-auth — secure terminal</span>
              </div>

              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-primary mb-4">
                  <Lock className="w-4 h-4" />
                  <span className="font-mono">Authentication Required</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-mono">login:</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-primary/20 rounded text-foreground text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all placeholder:text-muted-foreground/40"
                      placeholder="username"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-mono">pass:</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-primary/20 rounded text-foreground text-sm font-mono focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all placeholder:text-muted-foreground/40"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono animate-fade-in">
                    <span className="text-red-500">error:</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded bg-primary/20 border border-primary/40 text-primary font-mono text-sm hover:bg-primary/30 hover:border-primary/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <TerminalIcon className="w-4 h-4" />
                      <span>$ sudo login</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-[10px] text-muted-foreground/40 font-mono space-y-1">
              <div>© 2025 UrbanShade Corporation — All Rights Reserved</div>
              <div className="text-yellow-500/60">⚠ CLASSIFIED SYSTEM — AUTHORIZED PERSONNEL ONLY</div>
              <div className="text-muted-foreground/30 pt-2">Simulated operating system environment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="border-t border-primary/20 bg-slate-900/80 px-4 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
        <div className="flex items-center gap-3">
          <span>TTY1</span>
          <span>•</span>
          <span>Secure Shell Active</span>
          <span>•</span>
          <span>Encryption: AES-256-GCM</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Depth: 8,247m</span>
          <span>•</span>
          <span>Pressure: 824.7 bar</span>
          <span>•</span>
          <span className="text-green-400">● All Systems Nominal</span>
        </div>
      </div>
    </div>
  );
};
