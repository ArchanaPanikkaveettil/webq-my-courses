import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Spinner from "../ui/Spinner";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("notifications/");
      const data = response.data;
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for notifications or fetch on mount + focus
  useEffect(() => {
    fetchNotifications();

    // Set up auto-refetch every 30 seconds for dynamic live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation(); // prevent triggering parent routing click
    try {
      await api.post(`notifications/${id}/read/`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.is_read) {
      try {
        await api.post(`notifications/${notif.id}/read/`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Failed to mark read on click:", err);
      }
    }

    if (notif.target_url) {
      let stateTab = "syllabus";
      if (notif.notification_type === "ASSIGNMENT_DUE" || notif.notification_type === "ASSIGNMENT_SUBMITTED") {
        stateTab = "assignments";
      } else if (notif.notification_type === "LIVE_SESSION_UPCOMING" || notif.notification_type === "LIVE_SESSION_LIVE") {
        stateTab = "live_sessions";
      }
      navigate(notif.target_url, { state: { activeTab: stateTab } });
    }
  };

  // Group notifications by relative date
  const getGroupedNotifications = () => {
    const groups = { Today: [], Yesterday: [], Older: [] };
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    notifications.forEach((n) => {
      const createdDate = new Date(n.created_at);
      if (createdDate.toDateString() === today.toDateString()) {
        groups.Today.push(n);
      } else if (createdDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(n);
      } else {
        groups.Older.push(n);
      }
    });

    return groups;
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "ASSIGNMENT_DUE":
        return (
          <div className="h-8 w-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "ASSIGNMENT_SUBMITTED":
        return (
          <div className="h-8 w-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "MATERIAL_COMPLETED":
        return (
          <div className="h-8 w-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "LIVE_SESSION_UPCOMING":
        return (
          <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "LIVE_SESSION_LIVE":
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-600 shrink-0 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-40"></span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case "PROFILE_UPDATED":
        return (
          <div className="h-8 w-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const grouped = getGroupedNotifications();
  const hasNotifications = notifications.length > 0;

  return (
    <div ref={dropdownRef} className="relative font-sans shrink-0">
      {/* Bell Button Icon */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications(); // Refresh notifications when opening dropdown
          }
        }}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-2xl border border-gray-150 shadow-2xl z-55 overflow-hidden animate-fade-in-up text-left">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-150 bg-slate-50/50">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-purple-650 hover:text-purple-800 font-bold focus:outline-none cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12 gap-2 text-gray-500 text-xs font-semibold">
                <Spinner size="sm" />
                Loading alerts...
              </div>
            ) : !hasNotifications ? (
              <div className="text-center py-12 px-4 space-y-2 text-gray-400">
                <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-900 font-bold text-xs">All caught up!</p>
                <p className="text-[11px] font-semibold text-gray-400">No notifications to show right now.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([groupName, groupItems]) => {
                if (groupItems.length === 0) return null;
                return (
                  <div key={groupName} className="p-1">
                    <h5 className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {groupName}
                    </h5>
                    <div className="space-y-0.5">
                      {groupItems.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs ${
                            !n.is_read ? "bg-purple-50/20 font-medium" : ""
                          }`}
                        >
                          {getNotifIcon(n.notification_type)}
                          <div className="flex-1 space-y-0.5 text-left">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-gray-900 font-bold ${!n.is_read ? "text-purple-950" : ""}`}>
                                {n.title}
                              </span>
                              {!n.is_read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="h-2 w-2 rounded-full bg-purple-600 self-center shrink-0"
                                  title="Mark as read"
                                />
                              )}
                            </div>
                            <p className="text-gray-500 font-semibold leading-normal">{n.description}</p>
                            <span className="text-[10px] font-bold text-gray-400 block pt-0.5">
                              {formatTime(n.created_at)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
