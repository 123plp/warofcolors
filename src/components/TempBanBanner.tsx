import { AlertTriangle, Clock, Cloud } from "lucide-react";

interface TempBanBannerProps {
  expiresAt: Date | null;
}

export const TempBanBanner = ({ expiresAt }: TempBanBannerProps) => {
  const formatTimeRemaining = () => {
    if (!expiresAt) return "Unknown";
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

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-900/95 to-orange-900/95 border-b-2 border-amber-500/50 shadow-lg shadow-amber-500/20">
      <div className="flex items-center justify-center gap-4 px-4 py-2">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm">TEMPORARY SUSPENSION ACTIVE</span>
        </div>
        
        <div className="h-4 w-px bg-amber-500/30" />
        
        <div className="flex items-center gap-2 text-amber-300 text-sm">
          <Cloud className="w-4 h-4" />
          <span>Cloud features disabled</span>
        </div>
        
        <div className="h-4 w-px bg-amber-500/30" />
        
        <div className="flex items-center gap-2 text-amber-200 text-sm font-mono">
          <Clock className="w-4 h-4" />
          <span>{formatTimeRemaining()}</span>
        </div>
      </div>
    </div>
  );
};
