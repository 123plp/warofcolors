import { useState, useEffect } from "react";
import { AlertTriangle, X, WifiOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface SupabaseConnectivityCheckerProps {
  currentRoute: 'main' | 'docs' | 'def-dev';
}

const SupabaseConnectivityChecker = ({ currentRoute }: SupabaseConnectivityCheckerProps) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const checkConnectivity = async () => {
    setIsChecking(true);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<'timeout'>((resolve) => {
      setTimeout(() => resolve('timeout'), 10000);
    });

    // Create the connectivity check promise
    const connectivityCheck = async (): Promise<'online' | 'offline' | 'maintenance'> => {
      try {
        // Check site status from database
        const { data: statusData, error: statusError } = await supabase
          .from('site_status')
          .select('id, status, message')
          .in('id', ['entire-site', currentRoute]);

        if (statusError) {
          console.error('Status check error:', statusError);
          return 'offline';
        }

        // Check entire-site status first
        const entireSite = statusData?.find(s => s.id === 'entire-site');
        if (entireSite && entireSite.status !== 'online') {
          setStatusMessage(entireSite.message || 'Site is currently under maintenance');
          return 'maintenance';
        }

        // Check specific route status
        const routeStatus = statusData?.find(s => s.id === currentRoute);
        if (routeStatus && routeStatus.status !== 'online') {
          setStatusMessage(routeStatus.message || `${currentRoute} is currently under maintenance`);
          return 'maintenance';
        }

        return 'online';
      } catch (error) {
        console.error('Connectivity check failed:', error);
        return 'offline';
      }
    };

    // Race between timeout and connectivity check
    const result = await Promise.race([connectivityCheck(), timeoutPromise]);

    if (result === 'timeout' || result === 'offline') {
      setIsOnline(false);
      setShowWarning(true);
      setStatusMessage('Unable to connect to UrbanShade servers');
    } else if (result === 'maintenance') {
      setIsOnline(false);
      setShowWarning(true);
    } else {
      setIsOnline(true);
      setShowWarning(false);
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkConnectivity();
    
    // Recheck every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);
    return () => clearInterval(interval);
  }, [currentRoute]);

  // Don't show anything if online or dismissed
  if (isOnline || dismissed || !showWarning) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm pointer-events-none" />
      
      {/* Warning Card */}
      <div className="relative bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 border border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20">
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mb-6 animate-pulse">
            <WifiOff className="w-10 h-10 text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Connection Issue
          </h2>

          {/* Message */}
          <p className="text-gray-400 mb-6">
            {statusMessage || 'Unable to establish connection to UrbanShade servers.'}
          </p>

          {/* Status */}
          <div className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Server Status:</span>
              <span className={`font-mono ${isOnline === null ? 'text-amber-400' : isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isChecking ? 'CHECKING...' : isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Route:</span>
              <span className="text-cyan-400 font-mono">/{currentRoute === 'main' ? '' : currentRoute}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button 
              onClick={checkConnectivity}
              disabled={isChecking}
              className="flex-1 gap-2"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              Retry
            </Button>
            <Button 
              onClick={() => setDismissed(true)}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              variant="outline"
            >
              Continue Anyway
            </Button>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-600 mt-6">
            Some features may be unavailable while offline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseConnectivityChecker;
