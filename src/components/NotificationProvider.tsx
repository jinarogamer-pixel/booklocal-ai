"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove notification after duration (unless persistent)
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Keyboard shortcut to clear all notifications
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && notifications.length > 0) {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notifications.length]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type: Notification['type']) => {
    const className = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${className} text-green-400`} />;
      case 'error':
        return <AlertCircle className={`${className} text-red-400`} />;
      case 'warning':
        return <AlertTriangle className={`${className} text-yellow-400`} />;
      case 'info':
        return <Info className={`${className} text-blue-400`} />;
    }
  };

  const getColorClasses = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`relative backdrop-blur-sm border rounded-2xl p-4 shadow-xl ${getColorClasses(notification.type)}`}
            style={{ zIndex: 1000 - index }}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm">
                  {notification.title}
                </h4>
                {notification.message && (
                  <p className="text-white/80 text-sm mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                )}
                
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 p-1 text-white/60 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar for timed notifications */}
            {!notification.persistent && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-2xl"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Convenience hooks for different notification types
export function useSuccessNotification() {
  const { addNotification } = useNotifications();
  return (title: string, message?: string) =>
    addNotification({ type: 'success', title, message });
}

export function useErrorNotification() {
  const { addNotification } = useNotifications();
  return (title: string, message?: string) =>
    addNotification({ type: 'error', title, message, duration: 7000 });
}

export function useWarningNotification() {
  const { addNotification } = useNotifications();
  return (title: string, message?: string) =>
    addNotification({ type: 'warning', title, message, duration: 6000 });
}

export function useInfoNotification() {
  const { addNotification } = useNotifications();
  return (title: string, message?: string) =>
    addNotification({ type: 'info', title, message });
}
