import { useState, useEffect, useCallback, useMemo } from "react";
import { useDoNotDisturb } from "./useDoNotDisturb";

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationBehavior = "toast" | "silent" | "alert" | "persistent";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: NotificationType;
  // New Phase 2 fields
  app?: string;
  priority?: NotificationPriority;
  behavior?: NotificationBehavior;
  actions?: NotificationAction[];
  persistent?: boolean;
  dismissed?: boolean;
  groupId?: string;
  sound?: boolean;
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  app?: string;
  timeRange?: "today" | "week" | "all";
  unreadOnly?: boolean;
}

export interface GroupedNotifications {
  [key: string]: SystemNotification[];
}

export const useNotifications = () => {
  const { isDndEnabled, shouldBreakthrough } = useDoNotDisturb();
  
  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('system_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [filters, setFilters] = useState<NotificationFilters>({
    timeRange: "all",
    unreadOnly: false
  });

  useEffect(() => {
    localStorage.setItem('system_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('system_notifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Don't show dismissed persistent notifications
      if (n.dismissed) return false;
      
      if (filters.unreadOnly && n.read) return false;
      if (filters.type && n.type !== filters.type) return false;
      if (filters.app && n.app !== filters.app) return false;
      
      if (filters.timeRange) {
        const notifTime = new Date(n.time);
        const now = new Date();
        
        if (filters.timeRange === "today") {
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (notifTime < startOfDay) return false;
        } else if (filters.timeRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (notifTime < weekAgo) return false;
        }
      }
      
      return true;
    });
  }, [notifications, filters]);

  // Group notifications by time period
  const groupedByTime = useMemo((): GroupedNotifications => {
    const groups: GroupedNotifications = {
      "Just now": [],
      "Earlier today": [],
      "Yesterday": [],
      "This week": [],
      "Older": []
    };
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    filteredNotifications.forEach(n => {
      const time = new Date(n.time);
      const diff = now.getTime() - time.getTime();
      
      if (diff < 5 * 60 * 1000) {
        groups["Just now"].push(n);
      } else if (time >= startOfToday) {
        groups["Earlier today"].push(n);
      } else if (time >= startOfYesterday) {
        groups["Yesterday"].push(n);
      } else if (time >= startOfWeek) {
        groups["This week"].push(n);
      } else {
        groups["Older"].push(n);
      }
    });
    
    return groups;
  }, [filteredNotifications]);

  // Group notifications by app
  const groupedByApp = useMemo((): GroupedNotifications => {
    const groups: GroupedNotifications = {};
    
    filteredNotifications.forEach(n => {
      const app = n.app || "System";
      if (!groups[app]) groups[app] = [];
      groups[app].push(n);
    });
    
    return groups;
  }, [filteredNotifications]);

  // Get unique apps for filtering
  const availableApps = useMemo(() => {
    const apps = new Set<string>();
    notifications.forEach(n => apps.add(n.app || "System"));
    return Array.from(apps).sort();
  }, [notifications]);

  const addNotification = useCallback((
    notification: Omit<SystemNotification, "id" | "time" | "read" | "dismissed">
  ) => {
    const priority = notification.priority || "normal";
    const isPriorityNotification = priority === "high" || priority === "urgent";
    
    // Check if should show based on DND
    const canShow = shouldBreakthrough(isPriorityNotification);
    
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      time: new Date().toISOString(),
      read: false,
      dismissed: false,
      priority: priority,
      behavior: notification.behavior || "toast",
      sound: notification.sound ?? (notification.behavior === "alert")
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 100)); // Keep max 100
    
    // Return notification with display info
    return {
      notification: newNotification,
      shouldShow: canShow,
      shouldPlaySound: canShow && newNotification.sound && !isDndEnabled
    };
  }, [isDndEnabled, shouldBreakthrough]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, dismissed: true, read: true } : n
    ));
  }, []);

  const clearAll = useCallback(() => {
    // Keep persistent notifications, just mark them as dismissed
    setNotifications(prev => prev.map(n => 
      n.persistent ? { ...n, dismissed: true, read: true } : n
    ).filter(n => n.persistent));
  }, []);

  const clearByApp = useCallback((app: string) => {
    setNotifications(prev => prev.filter(n => (n.app || "System") !== app));
  }, []);

  const clearByType = useCallback((type: NotificationType) => {
    setNotifications(prev => prev.filter(n => n.type !== type));
  }, []);

  // Execute notification action
  const executeAction = useCallback((notificationId: string, actionName: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // Mark as read when action is taken
    markAsRead(notificationId);
    
    // Dispatch action to system bus
    window.dispatchEvent(new CustomEvent('notification-action', {
      detail: { notificationId, action: actionName, notification }
    }));
  }, [notifications, markAsRead]);

  const unreadCount = notifications.filter(n => !n.read && !n.dismissed).length;
  const persistentCount = notifications.filter(n => n.persistent && !n.dismissed).length;

  return {
    notifications,
    filteredNotifications,
    groupedByTime,
    groupedByApp,
    availableApps,
    unreadCount,
    persistentCount,
    filters,
    setFilters,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissNotification,
    clearAll,
    clearByApp,
    clearByType,
    executeAction
  };
};
