import { useState, useCallback, useEffect } from 'react';

export interface VirtualDesktop {
  id: string;
  name: string;
  windowIds: string[];
  createdAt: string;
}

const DESKTOPS_KEY = 'urbanshade_virtual_desktops';
const ACTIVE_DESKTOP_KEY = 'urbanshade_active_desktop';

export const useMultipleDesktops = () => {
  const [desktops, setDesktops] = useState<VirtualDesktop[]>(() => {
    try {
      const stored = localStorage.getItem(DESKTOPS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return [{ id: 'desktop-1', name: 'Desktop 1', windowIds: [], createdAt: new Date().toISOString() }];
  });

  const [activeDesktopId, setActiveDesktopId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_DESKTOP_KEY) || 'desktop-1';
  });

  const [switchDirection, setSwitchDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(DESKTOPS_KEY, JSON.stringify(desktops));
  }, [desktops]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_DESKTOP_KEY, activeDesktopId);
  }, [activeDesktopId]);

  const activeDesktop = desktops.find(d => d.id === activeDesktopId) || desktops[0];

  const createDesktop = useCallback((name?: string) => {
    const newId = `desktop-${Date.now()}`;
    const newDesktop: VirtualDesktop = {
      id: newId,
      name: name || `Desktop ${desktops.length + 1}`,
      windowIds: [],
      createdAt: new Date().toISOString()
    };
    setDesktops(prev => [...prev, newDesktop]);
    return newId;
  }, [desktops.length]);

  const deleteDesktop = useCallback((desktopId: string) => {
    if (desktops.length <= 1) return false;
    
    // Get windows from deleted desktop to move to another desktop
    const deletedDesktop = desktops.find(d => d.id === desktopId);
    const windowsToMove = deletedDesktop?.windowIds || [];
    
    setDesktops(prev => {
      const remaining = prev.filter(d => d.id !== desktopId);
      // Move windows to first remaining desktop
      if (windowsToMove.length > 0 && remaining.length > 0) {
        remaining[0].windowIds = [...remaining[0].windowIds, ...windowsToMove];
      }
      return remaining;
    });
    
    if (activeDesktopId === desktopId) {
      const remaining = desktops.filter(d => d.id !== desktopId);
      if (remaining.length > 0) {
        setActiveDesktopId(remaining[0].id);
      }
    }
    return true;
  }, [desktops, activeDesktopId]);

  const switchDesktop = useCallback((desktopId: string) => {
    if (!desktops.some(d => d.id === desktopId)) return false;
    if (desktopId === activeDesktopId) return true;
    
    // Determine direction for animation
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const targetIndex = desktops.findIndex(d => d.id === desktopId);
    setSwitchDirection(targetIndex > currentIndex ? 'left' : 'right');
    setIsAnimating(true);
    
    setTimeout(() => {
      setActiveDesktopId(desktopId);
      setTimeout(() => {
        setIsAnimating(false);
        setSwitchDirection(null);
      }, 200);
    }, 150);
    
    return true;
  }, [desktops, activeDesktopId]);

  const renameDesktop = useCallback((desktopId: string, newName: string) => {
    setDesktops(prev => prev.map(d => 
      d.id === desktopId ? { ...d, name: newName } : d
    ));
  }, []);

  const moveWindowToDesktop = useCallback((windowId: string, targetDesktopId: string) => {
    setDesktops(prev => prev.map(d => ({
      ...d,
      windowIds: d.id === targetDesktopId 
        ? [...d.windowIds.filter(id => id !== windowId), windowId]
        : d.windowIds.filter(id => id !== windowId)
    })));
  }, []);

  const addWindowToDesktop = useCallback((windowId: string, desktopId?: string) => {
    const targetId = desktopId || activeDesktopId;
    setDesktops(prev => prev.map(d => 
      d.id === targetId && !d.windowIds.includes(windowId)
        ? { ...d, windowIds: [...d.windowIds, windowId] }
        : d
    ));
  }, [activeDesktopId]);

  const removeWindowFromDesktop = useCallback((windowId: string) => {
    setDesktops(prev => prev.map(d => ({
      ...d,
      windowIds: d.windowIds.filter(id => id !== windowId)
    })));
  }, []);

  const getWindowDesktop = useCallback((windowId: string): VirtualDesktop | null => {
    return desktops.find(d => d.windowIds.includes(windowId)) || null;
  }, [desktops]);

  // Window is visible on active desktop if:
  // 1. It's explicitly assigned to active desktop
  // 2. Unassigned windows are now HIDDEN by default (changed from visible everywhere)
  const isWindowOnActiveDesktop = useCallback((windowId: string): boolean => {
    const assignedDesktop = desktops.find(d => d.windowIds.includes(windowId));
    // If window is assigned to a desktop, only show on that desktop
    if (assignedDesktop) {
      return assignedDesktop.id === activeDesktopId;
    }
    // Unassigned windows are now hidden by default - must be assigned to show
    return false;
  }, [desktops, activeDesktopId]);

  const switchToNextDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const nextIndex = (currentIndex + 1) % desktops.length;
    switchDesktop(desktops[nextIndex].id);
  }, [desktops, activeDesktopId, switchDesktop]);

  const switchToPreviousDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const prevIndex = (currentIndex - 1 + desktops.length) % desktops.length;
    switchDesktop(desktops[prevIndex].id);
  }, [desktops, activeDesktopId, switchDesktop]);

  // Get windows count per desktop
  const getDesktopWindowCount = useCallback((desktopId: string): number => {
    const desktop = desktops.find(d => d.id === desktopId);
    return desktop?.windowIds.length || 0;
  }, [desktops]);

  return {
    desktops,
    activeDesktop,
    activeDesktopId,
    createDesktop,
    deleteDesktop,
    switchDesktop,
    renameDesktop,
    moveWindowToDesktop,
    addWindowToDesktop,
    removeWindowFromDesktop,
    getWindowDesktop,
    isWindowOnActiveDesktop,
    switchToNextDesktop,
    switchToPreviousDesktop,
    getDesktopWindowCount,
    switchDirection,
    isAnimating
  };
};
