import { useEffect, useRef, useCallback } from "react";

// Simple notification sounds using Web Audio API
const createNotificationSound = (type: "default" | "alert" | "success" | "error") => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Different sound patterns for different types
  switch (type) {
    case "alert":
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      break;
    case "success":
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case "error":
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      break;
    default:
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
  }
  
  return audioContext;
};

export const useNotificationSounds = () => {
  const soundEnabled = useRef(true);
  
  useEffect(() => {
    const checkSound = () => {
      soundEnabled.current = localStorage.getItem("settings_sound_enabled") !== "false";
    };
    checkSound();
    window.addEventListener("storage", checkSound);
    return () => window.removeEventListener("storage", checkSound);
  }, []);

  const playSound = useCallback((type: "default" | "alert" | "success" | "error" = "default") => {
    if (!soundEnabled.current) return;
    
    try {
      createNotificationSound(type);
    } catch (e) {
      console.warn("Could not play notification sound:", e);
    }
  }, []);

  return { playSound };
};
