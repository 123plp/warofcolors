import { useState, useEffect } from "react";
import { Lock, Shield, KeyRound, AlertTriangle, Scan, Radio, Terminal, Waves, Eye, Zap, Users, Skull, Siren, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProtocolType = "black" | "red" | "yellow" | "blue" | "green" | "purple";

interface LockdownScreenProps {
  onAuthorized: () => void;
  protocolName: string;
  protocolId?: ProtocolType;
}

const protocolConfigs: Record<ProtocolType, {
  primaryColor: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  messages: string[];
  marqueeText: string;
}> = {
  black: {
    primaryColor: "red",
    bgGradient: "from-red-950 via-red-900/50 to-black",
    borderColor: "border-red-500",
    textColor: "text-red-400",
    icon: <Lock className="w-20 h-20" />,
    title: "TOTAL LOCKDOWN",
    subtitle: "ALL SYSTEMS SEALED",
    messages: [
      "CONTAINMENT BREACH DETECTED",
      "SECURITY PERIMETER COMPROMISED",
      "LOCKDOWN PROTOCOL ACTIVATED",
      "AWAITING AUTHORIZATION..."
    ],
    marqueeText: "⚠️ CODE BLACK IN EFFECT — ALL PERSONNEL SHELTER IN PLACE — DO NOT ATTEMPT TO EXIT — AWAIT FURTHER INSTRUCTIONS —"
  },
  red: {
    primaryColor: "orange",
    bgGradient: "from-orange-950 via-orange-900/50 to-black",
    borderColor: "border-orange-500",
    textColor: "text-orange-400",
    icon: <ShieldAlert className="w-20 h-20" />,
    title: "CONTAINMENT BREACH",
    subtitle: "SPECIMEN ESCAPED",
    messages: [
      "SPECIMEN BREACH DETECTED",
      "CONTAINMENT TEAMS DEPLOYED",
      "AFFECTED ZONES SEALED",
      "TRACKING SYSTEMS ACTIVE..."
    ],
    marqueeText: "⚠️ CODE RED ACTIVE — CONTAINMENT BREACH IN PROGRESS — AVOID AFFECTED SECTORS — SECURITY TEAMS EN ROUTE —"
  },
  yellow: {
    primaryColor: "yellow",
    bgGradient: "from-yellow-950 via-yellow-900/50 to-black",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-400",
    icon: <Skull className="w-20 h-20" />,
    title: "CHEMICAL HAZARD",
    subtitle: "CONTAMINATION DETECTED",
    messages: [
      "CHEMICAL LEAK DETECTED",
      "VENTILATION OVERRIDE ACTIVE",
      "HAZMAT TEAMS DEPLOYED",
      "DECONTAMINATION IN PROGRESS..."
    ],
    marqueeText: "⚠️ CODE YELLOW — CHEMICAL HAZARD — DO NOT REMOVE PROTECTIVE EQUIPMENT — AWAIT DECONTAMINATION CLEARANCE —"
  },
  blue: {
    primaryColor: "blue",
    bgGradient: "from-blue-950 via-blue-900/50 to-black",
    borderColor: "border-blue-500",
    textColor: "text-blue-400",
    icon: <Users className="w-20 h-20" />,
    title: "MEDICAL EMERGENCY",
    subtitle: "MASS CASUALTY EVENT",
    messages: [
      "MEDICAL EMERGENCY DECLARED",
      "ALL MEDICAL PERSONNEL ALERTED",
      "TRIAGE PROTOCOLS ACTIVATED",
      "EMERGENCY BAY PREPARED..."
    ],
    marqueeText: "⚠️ CODE BLUE — MEDICAL EMERGENCY — MEDICAL PERSONNEL REPORT TO STATIONS — TRIAGE PROTOCOLS IN EFFECT —"
  },
  green: {
    primaryColor: "emerald",
    bgGradient: "from-emerald-950 via-emerald-900/50 to-black",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-400",
    icon: <Siren className="w-20 h-20" />,
    title: "EVACUATION",
    subtitle: "PROCEED TO EXIT POINTS",
    messages: [
      "EVACUATION ORDER ISSUED",
      "EMERGENCY EXITS OPENED",
      "PROCEED TO DESIGNATED ZONES",
      "EVACUATION COORDINATORS DEPLOYED..."
    ],
    marqueeText: "⚠️ CODE GREEN — FACILITY EVACUATION — PROCEED CALMLY TO NEAREST EXIT — DO NOT USE ELEVATORS —"
  },
  purple: {
    primaryColor: "purple",
    bgGradient: "from-purple-950 via-purple-900/50 to-black",
    borderColor: "border-purple-500",
    textColor: "text-purple-400",
    icon: <Shield className="w-20 h-20" />,
    title: "HOSTILE THREAT",
    subtitle: "SECURITY ALERT",
    messages: [
      "HOSTILE INTRUSION DETECTED",
      "ARMED RESPONSE DEPLOYED",
      "FACILITY ENTRANCES LOCKED",
      "THREAT TRACKING ACTIVE..."
    ],
    marqueeText: "⚠️ CODE PURPLE — HOSTILE THREAT — SHELTER IN SECURE LOCATION — DO NOT ENGAGE —"
  }
};

const getProtocolType = (protocolName: string): ProtocolType => {
  const lower = protocolName.toLowerCase();
  if (lower.includes("black") || lower.includes("total")) return "black";
  if (lower.includes("red") || lower.includes("containment breach")) return "red";
  if (lower.includes("yellow") || lower.includes("chemical")) return "yellow";
  if (lower.includes("blue") || lower.includes("medical")) return "blue";
  if (lower.includes("green") || lower.includes("evacuation")) return "green";
  if (lower.includes("purple") || lower.includes("hostile")) return "purple";
  return "black";
};

export const LockdownScreen = ({ onAuthorized, protocolName, protocolId }: LockdownScreenProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanLines, setScanLines] = useState<number[]>([]);
  const [threatLevel, setThreatLevel] = useState(85);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);

  const type = protocolId || getProtocolType(protocolName);
  const config = protocolConfigs[type];

  const colorClasses = {
    red: {
      bg: "bg-red-500/20",
      border: "border-red-500/50",
      text: "text-red-400",
      fill: "fill-red-500",
      gradient: "from-red-500 to-red-600",
      glow: "bg-red-500/30"
    },
    orange: {
      bg: "bg-orange-500/20",
      border: "border-orange-500/50",
      text: "text-orange-400",
      fill: "fill-orange-500",
      gradient: "from-orange-500 to-orange-600",
      glow: "bg-orange-500/30"
    },
    yellow: {
      bg: "bg-yellow-500/20",
      border: "border-yellow-500/50",
      text: "text-yellow-400",
      fill: "fill-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
      glow: "bg-yellow-500/30"
    },
    blue: {
      bg: "bg-blue-500/20",
      border: "border-blue-500/50",
      text: "text-blue-400",
      fill: "fill-blue-500",
      gradient: "from-blue-500 to-blue-600",
      glow: "bg-blue-500/30"
    },
    emerald: {
      bg: "bg-emerald-500/20",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      fill: "fill-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      glow: "bg-emerald-500/30"
    },
    purple: {
      bg: "bg-purple-500/20",
      border: "border-purple-500/50",
      text: "text-purple-400",
      fill: "fill-purple-500",
      gradient: "from-purple-500 to-purple-600",
      glow: "bg-purple-500/30"
    }
  };

  const colors = colorClasses[config.primaryColor as keyof typeof colorClasses];

  useEffect(() => {
    const lines: number[] = [];
    for (let i = 0; i < 8; i++) {
      lines.push(Math.random() * 100);
    }
    setScanLines(lines);

    config.messages.forEach((msg, i) => {
      setTimeout(() => {
        setSystemMessages(prev => [...prev, msg]);
      }, i * 800);
    });

    const threatInterval = setInterval(() => {
      setThreatLevel(prev => Math.min(99, Math.max(70, prev + (Math.random() - 0.5) * 10)));
    }, 2000);

    return () => clearInterval(threatInterval);
  }, [config.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!password) {
      setError("Authorization code required");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const adminData = localStorage.getItem("urbanshade_admin");
      
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (!admin.password || password === admin.password) {
          onAuthorized();
        } else {
          setError("AUTHORIZATION DENIED - Invalid credentials");
          setLoading(false);
        }
      } else {
        onAuthorized();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Animated Background */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${config.bgGradient}`}
      />

      {/* Scan Lines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {scanLines.map((pos, i) => (
          <div
            key={i}
            className={`absolute left-0 right-0 h-px ${colors.bg}`}
            style={{
              top: `${pos}%`,
              animation: `scanline ${3 + i * 0.5}s linear infinite`,
              opacity: 0.5 + Math.random() * 0.5
            }}
          />
        ))}
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, currentColor 25%, currentColor 26%, transparent 27%, transparent 74%, currentColor 75%, currentColor 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, currentColor 25%, currentColor 26%, transparent 27%, transparent 74%, currentColor 75%, currentColor 76%, transparent 77%, transparent)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Header Warning Bar */}
        <div className={`absolute top-0 left-0 right-0 ${colors.bg} ${colors.border} border-b-2 py-3 px-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 ${colors.text} animate-pulse`} />
            <span className={`font-bold ${colors.text} tracking-wider text-sm`}>{config.title} ACTIVE</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Radio className={`w-4 h-4 ${colors.text} animate-pulse`} />
              <span className={colors.text}>EMERGENCY BROADCAST</span>
            </div>
            <div className={colors.text}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Central Panel */}
        <div className="w-full max-w-2xl">
          {/* Protocol Badge */}
          <div className="flex justify-center mb-6">
            <div className={`px-6 py-2 ${colors.bg} ${colors.border} border rounded-full`}>
              <span className={`${colors.text} font-mono text-sm tracking-wider`}>
                PROTOCOL: {protocolName}
              </span>
            </div>
          </div>

          {/* Shield Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className={`absolute inset-0 ${colors.glow} rounded-full blur-3xl animate-pulse`} />
              <div className={`relative p-8 rounded-full ${colors.border} border-2 bg-gradient-to-br ${colors.bg}`}>
                <div className={colors.text}>{config.icon}</div>
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
                <Lock className={`absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 ${colors.text}`} />
              </div>
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                <Eye className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 ${colors.text}`} />
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`bg-black/40 ${colors.border} border rounded-lg p-4 text-center`}>
              <Scan className={`w-6 h-6 mx-auto mb-2 ${colors.text}`} />
              <div className={`text-xs ${colors.text}/70 mb-1`}>THREAT LEVEL</div>
              <div className={`text-2xl font-bold ${colors.text}`}>{threatLevel.toFixed(0)}%</div>
            </div>
            <div className={`bg-black/40 ${colors.border} border rounded-lg p-4 text-center`}>
              <Waves className={`w-6 h-6 mx-auto mb-2 ${colors.text}`} />
              <div className={`text-xs ${colors.text}/70 mb-1`}>PRESSURE</div>
              <div className={`text-2xl font-bold ${colors.text}`}>8,247</div>
              <div className={`text-xs ${colors.text}/50`}>PSI</div>
            </div>
            <div className={`bg-black/40 ${colors.border} border rounded-lg p-4 text-center`}>
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-500 animate-pulse" />
              <div className={`text-xs ${colors.text}/70 mb-1`}>POWER</div>
              <div className="text-2xl font-bold text-yellow-500">BACKUP</div>
            </div>
          </div>

          {/* Terminal Messages */}
          <div className={`bg-black/60 ${colors.border} border rounded-lg p-4 mb-6 font-mono text-xs max-h-32 overflow-y-auto`}>
            {systemMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className={`${colors.text}/60`}>[{String(i).padStart(2, '0')}]</span>
                <Terminal className={`w-3 h-3 ${colors.text}`} />
                <span className={i === systemMessages.length - 1 ? `${colors.text} animate-pulse` : `${colors.text}/70`}>
                  {msg}
                </span>
              </div>
            ))}
            <span className={`${colors.text} animate-pulse`}>█</span>
          </div>

          {/* Authorization Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`bg-black/60 ${colors.border} border rounded-lg p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <KeyRound className={`w-5 h-5 ${colors.text}`} />
                <span className={`font-bold ${colors.text}`}>ADMINISTRATOR OVERRIDE REQUIRED</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-xs ${colors.text}/70 mb-2 font-mono`}>
                    ENTER AUTHORIZATION CODE
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-black/60 ${colors.border} border text-white placeholder:${colors.text}/30 focus:${colors.border} font-mono tracking-wider`}
                    placeholder="••••••••••••"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="p-3 rounded bg-destructive/20 border border-destructive/40 text-destructive text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white ${colors.border} border font-bold tracking-wider`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      VERIFYING...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-4 h-4" />
                      DEACTIVATE LOCKDOWN
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className={`mt-6 text-center text-xs ${colors.text}/50 font-mono`}>
            <div>URBANSHADE SECURITY SYSTEM v3.2.1</div>
            <div className="mt-1">ALL ACCESS ATTEMPTS LOGGED AND MONITORED</div>
          </div>
        </div>

        {/* Bottom Warning Bar */}
        <div className={`absolute bottom-0 left-0 right-0 ${colors.bg} ${colors.border} border-t py-2 overflow-hidden`}>
          <div className={`animate-marquee whitespace-nowrap ${colors.text} text-xs font-mono`}>
            {config.marqueeText} {config.marqueeText}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
