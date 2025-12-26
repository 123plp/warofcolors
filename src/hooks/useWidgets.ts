import { useState, useCallback, useEffect } from 'react';
import { loadState, saveState } from '@/lib/persistence';

export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetType = 
  | 'clock' 
  | 'weather' 
  | 'notes' 
  | 'system-monitor' 
  | 'quick-links'
  | 'calendar'
  | 'news-feed'
  | 'music'
  | 'image'
  | 'search'
  | 'anomaly-status'
  | 'breach-alert'
  | 'security-level'
  | 'power-grid'
  | 'personnel-tracker';

export interface Widget {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
  size: WidgetSize;
  settings?: Record<string, unknown>;
}

export interface WidgetConfig {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  category: 'general' | 'scp' | 'utility';
}

export const WIDGET_CONFIGS: WidgetConfig[] = [
  { type: 'clock', name: 'Clock', description: 'Analog/digital clock with timezones', icon: 'Clock', defaultSize: 'small', category: 'general' },
  { type: 'weather', name: 'Weather', description: 'Current weather and forecast', icon: 'CloudRain', defaultSize: 'medium', category: 'general' },
  { type: 'notes', name: 'Quick Notes', description: 'Sticky notes for quick thoughts', icon: 'StickyNote', defaultSize: 'medium', category: 'general' },
  { type: 'system-monitor', name: 'System Monitor', description: 'CPU/RAM usage graphs', icon: 'Activity', defaultSize: 'medium', category: 'utility' },
  { type: 'quick-links', name: 'Quick Links', description: 'App shortcuts', icon: 'Link', defaultSize: 'small', category: 'utility' },
  { type: 'calendar', name: 'Calendar', description: 'Month view with events', icon: 'Calendar', defaultSize: 'large', category: 'general' },
  { type: 'search', name: 'Search', description: 'Quick system search', icon: 'Search', defaultSize: 'small', category: 'utility' },
  { type: 'anomaly-status', name: 'Anomaly Status', description: 'SCP containment status', icon: 'AlertTriangle', defaultSize: 'medium', category: 'scp' },
  { type: 'breach-alert', name: 'Breach Alert', description: 'Facility warning system', icon: 'Siren', defaultSize: 'small', category: 'scp' },
  { type: 'security-level', name: 'Security Level', description: 'Current clearance status', icon: 'Shield', defaultSize: 'small', category: 'scp' },
  { type: 'power-grid', name: 'Power Grid', description: 'Facility power status', icon: 'Zap', defaultSize: 'medium', category: 'scp' },
  { type: 'personnel-tracker', name: 'Personnel', description: 'Who\'s online in facility', icon: 'Users', defaultSize: 'medium', category: 'scp' },
];

export const WIDGET_SIZES: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 200 },
  large: { width: 400, height: 300 },
};

const WIDGETS_KEY = 'urbanshade_widgets';

export const useWidgets = () => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    return loadState(WIDGETS_KEY, []);
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    saveState(WIDGETS_KEY, widgets);
  }, [widgets]);

  const addWidget = useCallback((type: WidgetType, x: number = 100, y: number = 100) => {
    const config = WIDGET_CONFIGS.find(c => c.type === type);
    if (!config) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      size: config.defaultSize,
      settings: {},
    };

    setWidgets(prev => [...prev, newWidget]);
    return newWidget.id;
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidget === id) setSelectedWidget(null);
  }, [selectedWidget]);

  const updateWidgetPosition = useCallback((id: string, x: number, y: number) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, x, y } : w
    ));
  }, []);

  const updateWidgetSize = useCallback((id: string, size: WidgetSize) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  }, []);

  const updateWidgetSettings = useCallback((id: string, settings: Record<string, unknown>) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w
    ));
  }, []);

  const cycleWidgetSize = useCallback((id: string) => {
    const sizes: WidgetSize[] = ['small', 'medium', 'large'];
    setWidgets(prev => prev.map(w => {
      if (w.id !== id) return w;
      const currentIndex = sizes.indexOf(w.size);
      const nextIndex = (currentIndex + 1) % sizes.length;
      return { ...w, size: sizes[nextIndex] };
    }));
  }, []);

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
    if (editMode) setSelectedWidget(null);
  }, [editMode]);

  return {
    widgets,
    editMode,
    selectedWidget,
    setSelectedWidget,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetSettings,
    cycleWidgetSize,
    toggleEditMode,
  };
};
