import { useState, useCallback } from "react";
import { BugcheckData, createBugcheck, BUGCHECK_CODES } from "@/components/BugcheckScreen";
import { commandQueue } from "@/lib/commandQueue";
import { createAndSaveDumpFromBugcheck } from "@/lib/crashDumps";

export type BugcheckSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

// Severity determines how the bugcheck is handled
const getSeverityBehavior = (severity: BugcheckSeverity) => {
  switch (severity) {
    case 'CRITICAL':
      return { forceHalt: true, allowContinue: false, autoRestart: false };
    case 'HIGH':
      return { forceHalt: true, allowContinue: false, autoRestart: true };
    case 'MEDIUM':
      return { forceHalt: false, allowContinue: true, autoRestart: false };
    case 'INFO':
      return { forceHalt: false, allowContinue: true, autoRestart: false };
  }
};

export const useBugcheck = () => {
  const [activeBugcheck, setActiveBugcheck] = useState<BugcheckData | null>(null);
  const [severity, setSeverity] = useState<BugcheckSeverity>('HIGH');

  const triggerBugcheck = useCallback((
    code: keyof typeof BUGCHECK_CODES,
    description: string,
    location?: string,
    stackTrace?: string
  ) => {
    // Check if bugchecks are disabled (via sudo set bugcheck 0)
    if (commandQueue.areBugchecksDisabled()) {
      console.warn(`[BUGCHECK SUPPRESSED] ${code}: ${description}`);
      return;
    }

    const codeInfo = BUGCHECK_CODES[code];
    const bugcheckSeverity = codeInfo?.severity || 'HIGH';
    setSeverity(bugcheckSeverity);

    const bugcheck = createBugcheck(code, description, location, stackTrace);
    setActiveBugcheck(bugcheck);
    
    // Create and save crash dump automatically
    createAndSaveDumpFromBugcheck(code, description, location, stackTrace);
    
    // Log to console for DEF-DEV
    console.error(`[BUGCHECK] ${code} (${bugcheckSeverity}): ${description}`);
    
    // Play error sound
    try {
      const enabled = localStorage.getItem('settings_sound_enabled') !== 'false';
      if (enabled) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 200;
        oscillator.type = 'square';
        gainNode.gain.value = 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch {}
  }, []);

  const clearBugcheck = useCallback(() => {
    setActiveBugcheck(null);
  }, []);

  const restartFromBugcheck = useCallback(() => {
    setActiveBugcheck(null);
    window.location.reload();
  }, []);

  const reportToDev = useCallback(() => {
    // Navigate to DEF-DEV if enabled
    const devEnabled = localStorage.getItem('settings_developer_mode') === 'true' || 
                       localStorage.getItem('urbanshade_dev_mode_install') === 'true';
    if (devEnabled) {
      window.open('/def-dev', '_blank');
    } else {
      // Just clear and continue
      setActiveBugcheck(null);
    }
  }, []);

  const canContinue = useCallback(() => {
    return getSeverityBehavior(severity).allowContinue;
  }, [severity]);

  return {
    activeBugcheck,
    severity,
    triggerBugcheck,
    clearBugcheck,
    restartFromBugcheck,
    reportToDev,
    canContinue
  };
};
