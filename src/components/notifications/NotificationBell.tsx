import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificationCenter } from './NotificationCenter';

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCenter, setShowCenter] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(notificationService.getUnreadCount());
    };

    updateUnreadCount();
    const unsubscribe = notificationService.subscribe(() => {
      updateUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setShowCenter(!showCenter)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        isOpen={showCenter}
        onClose={() => setShowCenter(false)}
        anchorRef={bellRef}
      />
    </div>
  );
};