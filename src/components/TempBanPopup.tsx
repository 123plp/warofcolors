import { useState } from "react";
import { AlertTriangle, Clock, X, Cloud } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TempBanPopupProps {
  open: boolean;
  onDismiss: () => void;
  reason: string | null;
  expiresAt: Date | null;
}

export const TempBanPopup = ({ open, onDismiss, reason, expiresAt }: TempBanPopupProps) => {
  const formatTimeRemaining = () => {
    if (!expiresAt) return "Unknown";
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="bg-gradient-to-br from-amber-950/95 to-slate-950 border-amber-500/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-amber-400">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            Temporary Suspension
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-slate-300">
            Your account has been temporarily suspended. During this time, 
            <strong className="text-amber-400"> all cloud features are disabled</strong>.
          </p>
          
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="w-4 h-4 text-red-400" />
              <span className="text-slate-400">Cloud features disabled:</span>
            </div>
            <ul className="text-xs text-slate-500 space-y-1 ml-6">
              <li>• Messages & Chat</li>
              <li>• Cloud Sync</li>
              <li>• Online Features</li>
              <li>• Moderation Panel</li>
            </ul>
          </div>
          
          {reason && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="text-xs text-red-400 font-mono mb-1">REASON</div>
              <p className="text-sm text-red-300">{reason}</p>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Time remaining:</span>
            </div>
            <span className="font-mono text-amber-400 font-bold">
              {formatTimeRemaining()}
            </span>
          </div>
          
          <p className="text-xs text-slate-500">
            You can still use UrbanShade OS offline. Your suspension will be lifted on{" "}
            <span className="text-slate-400">{expiresAt?.toLocaleString()}</span>.
          </p>
          
          <Button 
            onClick={onDismiss} 
            className="w-full bg-amber-600 hover:bg-amber-500"
          >
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
