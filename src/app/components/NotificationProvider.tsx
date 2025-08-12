"use client";
// NotificationProvider: Context for in-app toasts/alerts
import { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: Notification['type'], message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const MAX_NOTIFICATIONS = 5;

  function showNotification(type: Notification['type'], message: string) {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => {
      const next = [...prev, { id, type, message }];
      return next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next;
    });
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 4000);
  }

  return (
    <NotificationContext.Provider value={{ notifications, showNotification }}>
      {children}
      <div className="fixed z-[9999] left-1/2 bottom-8 flex flex-col gap-2 items-center" style={{transform:'translateX(-50%)'}} aria-live="polite" aria-atomic="true">
        {notifications.map((n) => (
          <div key={n.id} className={`toast ${n.type}`}>{n.message}</div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
