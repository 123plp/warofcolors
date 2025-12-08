import { useCallback } from "react";

// Sound effect types
type SoundType = 
  | "startup" 
  | "shutdown" 
  | "error" 
  | "notification" 
  | "click" 
  | "success" 
  | "warning"
  | "boot"
  | "login"
  | "logout"
  | "app_open"
  | "app_close"
  | "message"
  | "critical";

// Create audio context for generating sounds
const createOscillatorSound = (frequency: number, duration: number, type: OscillatorType = "sine", volume: number = 0.3) => {
  const enabled = localStorage.getItem('settings_sound_enabled') !== 'false';
  if (!enabled) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.warn("Audio not supported");
  }
};

// Multi-tone sound with delays
const playSequence = (notes: Array<{ freq: number; delay: number; duration: number; type?: OscillatorType; volume?: number }>) => {
  notes.forEach(({ freq, delay, duration, type = "sine", volume = 0.2 }) => {
    setTimeout(() => createOscillatorSound(freq, duration, type, volume), delay);
  });
};

const playStartupSound = () => {
  // Chord progression for startup
  playSequence([
    { freq: 440, delay: 0, duration: 0.3 },
    { freq: 554, delay: 100, duration: 0.3 },
    { freq: 659, delay: 200, duration: 0.4 },
    { freq: 880, delay: 300, duration: 0.5, volume: 0.3 }
  ]);
};

const playBootSound = () => {
  // BIOS-style beep
  createOscillatorSound(1000, 0.15, "square", 0.15);
};

const playShutdownSound = () => {
  // Descending tone
  playSequence([
    { freq: 880, delay: 0, duration: 0.3 },
    { freq: 659, delay: 100, duration: 0.3 },
    { freq: 440, delay: 200, duration: 0.4 },
    { freq: 330, delay: 300, duration: 0.5, volume: 0.1 }
  ]);
};

const playErrorSound = () => {
  createOscillatorSound(200, 0.2, "square", 0.2);
  setTimeout(() => createOscillatorSound(150, 0.3, "square", 0.2), 200);
};

const playCriticalSound = () => {
  // Alarming sound for critical errors
  playSequence([
    { freq: 300, delay: 0, duration: 0.15, type: "square", volume: 0.3 },
    { freq: 200, delay: 150, duration: 0.15, type: "square", volume: 0.3 },
    { freq: 300, delay: 300, duration: 0.15, type: "square", volume: 0.3 },
    { freq: 200, delay: 450, duration: 0.15, type: "square", volume: 0.3 },
  ]);
};

const playNotificationSound = () => {
  createOscillatorSound(800, 0.1, "sine", 0.2);
  setTimeout(() => createOscillatorSound(1000, 0.15, "sine", 0.2), 100);
};

const playMessageSound = () => {
  playSequence([
    { freq: 600, delay: 0, duration: 0.08 },
    { freq: 800, delay: 80, duration: 0.1 },
  ]);
};

const playClickSound = () => {
  createOscillatorSound(1200, 0.05, "sine", 0.1);
};

const playSuccessSound = () => {
  playSequence([
    { freq: 523, delay: 0, duration: 0.1 },
    { freq: 659, delay: 100, duration: 0.1 },
    { freq: 784, delay: 200, duration: 0.2 },
  ]);
};

const playWarningSound = () => {
  createOscillatorSound(400, 0.15, "triangle", 0.2);
  setTimeout(() => createOscillatorSound(400, 0.15, "triangle", 0.2), 200);
};

const playLoginSound = () => {
  playSequence([
    { freq: 392, delay: 0, duration: 0.15 },
    { freq: 523, delay: 100, duration: 0.15 },
    { freq: 659, delay: 200, duration: 0.25 },
  ]);
};

const playLogoutSound = () => {
  playSequence([
    { freq: 659, delay: 0, duration: 0.15 },
    { freq: 523, delay: 100, duration: 0.15 },
    { freq: 392, delay: 200, duration: 0.25, volume: 0.1 },
  ]);
};

const playAppOpenSound = () => {
  createOscillatorSound(600, 0.08, "sine", 0.1);
  setTimeout(() => createOscillatorSound(800, 0.06, "sine", 0.1), 50);
};

const playAppCloseSound = () => {
  createOscillatorSound(700, 0.06, "sine", 0.08);
  setTimeout(() => createOscillatorSound(500, 0.08, "sine", 0.06), 40);
};

export const useSoundEffects = () => {
  const playSound = useCallback((type: SoundType) => {
    switch (type) {
      case "startup": playStartupSound(); break;
      case "boot": playBootSound(); break;
      case "shutdown": playShutdownSound(); break;
      case "error": playErrorSound(); break;
      case "critical": playCriticalSound(); break;
      case "notification": playNotificationSound(); break;
      case "message": playMessageSound(); break;
      case "click": playClickSound(); break;
      case "success": playSuccessSound(); break;
      case "warning": playWarningSound(); break;
      case "login": playLoginSound(); break;
      case "logout": playLogoutSound(); break;
      case "app_open": playAppOpenSound(); break;
      case "app_close": playAppCloseSound(); break;
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('settings_sound_enabled', String(enabled));
  }, []);

  const isEnabled = useCallback(() => {
    return localStorage.getItem('settings_sound_enabled') !== 'false';
  }, []);

  return { playSound, setEnabled, isEnabled };
};
