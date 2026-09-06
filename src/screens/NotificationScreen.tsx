import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Target, 
  HeartPulse, 
  Bookmark, 
  X, 
  ArrowRight,
  EyeOff
} from 'lucide-react';
import { NotificationItem } from '../types';

export const NotificationScreen: React.FC = () => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationAsRead, 
    markAllNotificationsRead, 
    markAllNotificationsUnread, 
    deleteNotification, 
    undoNotificationDelete, 
    canUndoNotification,
    openResourceDetail,
    setActiveTab
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeModalNotif, setActiveModalNotif] = useState<NotificationItem | null>(null);

  const filterOptions = ['All', 'Recommendations', 'Goal Milestones', 'Wellness', 'Library Updates'];

  const filteredNotifications = notifications.filter(n => 
    selectedFilter === 'All' ? true : n.category === selectedFilter
  );

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Recommendations':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'Goal Milestones':
        return <Target className="w-4 h-4 text-amber-500" />;
      case 'Wellness':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      default:
        return <Bookmark className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleOpenNotification = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    setActiveModalNotif(notif);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header with Unread Badge & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Notification Center
              </h2>
              {unreadNotificationsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-xs">
                  {unreadNotificationsCount} unread
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Real-time updates regarding goals, 20-20-20 alerts, and research handbooks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="mark-all-read-btn"
            onClick={markAllNotificationsRead}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>

          <button
            id="mark-all-unread-btn"
            onClick={markAllNotificationsUnread}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors flex items-center gap-1.5"
            title="Mark all as unread"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Mark unread</span>
          </button>
        </div>
      </div>

      {/* Undo Action Bar if item recently deleted */}
      {canUndoNotification && (
        <div className="p-3 bg-zinc-900 text-white rounded-2xl flex items-center justify-between text-xs shadow-lg animate-fade-in">
          <span>Notification dismissed</span>
          <button
            id="undo-dismiss-btn"
            onClick={undoNotificationDelete}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* Category Tags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedFilter(opt)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedFilter === opt
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              id={`notification-item-${notif.id}`}
              onClick={() => handleOpenNotification(notif)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group ${
                notif.read
                  ? 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/80 opacity-85'
                  : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getCategoryIcon(notif.category)}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {notif.category}
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
                    {notif.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>

                  <span className="text-[11px] text-zinc-400 block mt-2">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Dismiss / Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                title="Dismiss"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
              No notifications found
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              You're all caught up with recommendations and goal milestones.
            </p>
          </div>
        )}
      </div>

      {/* Modal Bottom Sheet showing full notification details */}
      {activeModalNotif && (
        <div 
          className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setActiveModalNotif(null)}
        >
          <div 
            id="notification-detail-sheet"
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                {getCategoryIcon(activeModalNotif.category)}
                <span>{activeModalNotif.category}</span>
              </span>
              <button
                onClick={() => setActiveModalNotif(null)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              {activeModalNotif.title}
            </h3>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
              {activeModalNotif.message}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-400">Received {activeModalNotif.timestamp}</span>
              <button
                onClick={() => {
                  setActiveModalNotif(null);
                  if (activeModalNotif.category === 'Wellness') {
                    setActiveTab('health');
                  } else if (activeModalNotif.category === 'Goal Milestones') {
                    setActiveTab('goals');
                  } else {
                    setActiveTab('search');
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
