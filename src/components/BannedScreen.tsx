import { useState, useEffect } from "react";
import { Ban, AlertTriangle, Clock, PartyPopper, Mail, Bot, Shield, Wifi, Lock, Terminal, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BannedScreenProps {
  reason: string | null;
  expiresAt: Date | null;
  isFakeBan: boolean;
  onFakeBanDismiss?: () => void;
}

export const BannedScreen = ({ reason, expiresAt, isFakeBan, onFakeBanDismiss }: BannedScreenProps) => {
  const [showJoke, setShowJoke] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  // For fake bans, show the "just kidding" after 5 seconds
  useEffect(() => {
    if (isFakeBan) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowJoke(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isFakeBan]);

  // NAVI terminal animation for permanent bans
  useEffect(() => {
    if (isFakeBan) return;
    
    const lines = [
      "NAVI: Initiating security protocol...",
      "NAVI: User authentication check... FAILED",
      "NAVI: Access credentials revoked",
      "NAVI: Violation detected in user record",
      `NAVI: Reason: ${reason || 'Policy violation'}`,
      "NAVI: All network access terminated",
      "NAVI: Cloud sync disabled",
      "NAVI: Session locked permanently",
      "================================================",
      "ACCESS DENIED - ACCOUNT SUSPENDED",
    ];

    let lineIndex = 0;
    const lineInterval = setInterval(() => {
      if (lineIndex < lines.length) {
        setTerminalLines(prev => [...prev, lines[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(lineInterval);
      }
    }, 400);

    // Scan progress animation
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 50);

    return () => {
      clearInterval(lineInterval);
      clearInterval(scanInterval);
    };
  }, [isFakeBan, reason]);

  const formatTimeRemaining = () => {
    if (!expiresAt) return null;
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Fake ban reveal screen
  if (isFakeBan && showJoke) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-green-950 to-emerald-900 flex items-center justify-center z-[9999]">
        <div className="text-center p-8 max-w-lg animate-in zoom-in duration-500">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce">
            <PartyPopper className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            JUST KIDDING! 🎉
          </h1>
          <p className="text-xl text-green-300 mb-6">
            You're not actually banned. This was a prank by an admin!
          </p>
          <p className="text-sm text-green-400/70 mb-8">
            "{reason || 'No reason given'}" - lol gottem
          </p>
          <Button 
            onClick={onFakeBanDismiss}
            className="bg-green-600 hover:bg-green-500 text-lg px-8 py-6"
          >
            Continue to UrbanShade OS
          </Button>
        </div>
      </div>
    );
  }

  // NAVI-style permanent ban screen
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999] overflow-hidden">
      {/* Animated scan lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)',
          }}
        />
        {/* Scanning line */}
        <div 
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"
          style={{
            top: `${scanProgress}%`,
            transition: 'top 0.05s linear'
          }}
        />
      </div>

      {/* CRT overlay effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, black 100%)'
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/50 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-4">
        {/* NAVI Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-red-500/50 flex items-center justify-center bg-red-500/10 animate-pulse">
              <Bot className="w-10 h-10 text-red-500" />
            </div>
            {/* Orbiting lock */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
              <Lock className="w-6 h-6 text-red-400 absolute -top-3 left-1/2 transform -translate-x-1/2" />
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-red-400 tracking-widest mb-1">NAVI SECURITY SYSTEM</div>
            <h1 className="text-4xl font-bold text-red-500 font-mono tracking-wider">
              ACCESS REVOKED
            </h1>
          </div>
        </div>

        {/* Terminal output */}
        <div className="bg-black/80 border-2 border-red-500/30 rounded-lg p-4 mb-6 font-mono text-sm max-h-64 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-500/20">
            <Terminal className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs">NAVI SECURITY TERMINAL</span>
          </div>
          <div className="space-y-1 text-green-400">
            {terminalLines.map((line, i) => (
              <div 
                key={i} 
                className={`${line.includes('DENIED') ? 'text-red-500 font-bold' : ''} ${line.startsWith('===') ? 'text-red-400' : ''}`}
              >
                <span className="text-slate-500">{'>'}</span> {line}
              </div>
            ))}
            <div className="animate-pulse">
              <span className="text-slate-500">{'>'}</span> <span className="text-red-400">_</span>
            </div>
          </div>
        </div>

        {/* Ban details */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Reason */}
          <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-xs uppercase">Violation Reason</span>
            </div>
            <p className="text-red-200">
              {reason || "No reason provided. Contact support for details."}
            </p>
          </div>

          {/* Status */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="font-mono text-xs uppercase">Account Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                expiresAt ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {expiresAt ? 'TEMPORARILY SUSPENDED' : 'PERMANENTLY BANNED'}
              </span>
            </div>
            {expiresAt && (
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{formatTimeRemaining()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Disabled features */}
        <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-400 text-sm mb-3">
            <Wifi className="w-4 h-4" />
            <span className="font-bold">ALL ONLINE FEATURES DISABLED</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-amber-300/70">
            <span>• Messages</span>
            <span>• Cloud Sync</span>
            <span>• Online Profile</span>
            <span>• Moderation</span>
          </div>
        </div>

        {/* Contact support */}
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-3">
            If you believe this is a mistake, please contact support:
          </p>
          <a 
            href="mailto:support@urbanshade.app" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            <Mail className="w-4 h-4" />
            support@urbanshade.app
          </a>
        </div>

        {/* Hidden countdown for fake bans */}
        {isFakeBan && !showJoke && (
          <div className="absolute bottom-4 right-4 text-xs text-slate-700 font-mono opacity-30">
            [{countdown}]
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};
