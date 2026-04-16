import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getNotifications, markAsRead, markAllRead, deleteNotification } from "../api/notification.api";

const Notification = () => {
  const { user } = useSelector((state: any) => state.authReducer);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await getNotifications(user._id);
      if (res?.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    if (!user?._id) return;
    await markAllRead(user._id);
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for real-time-like behavior
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeColors: Record<string, string> = {
    info: "bg-blue-50 border-blue-200",
    success: "bg-green-50 border-green-200",
    warning: "bg-yellow-50 border-yellow-200",
    error: "bg-red-50 border-red-200",
  };

  const dotColors: Record<string, string> = {
    info: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className='p-6 max-w-2xl mx-auto w-full'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold text-gray-800'>Notifications</h1>
          {unreadCount > 0 && (
            <span className='inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full'>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors'>
            Mark all as read
          </button>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className='flex items-center justify-center py-16'>
          <div className='w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin'></div>
        </div>
      ) : !user?._id ? (
        <div className='text-center py-12 text-gray-400'>
          <p className='text-lg'>Please log in to see notifications.</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
          <svg
            className='w-16 h-16 mb-4 text-gray-300'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
            />
          </svg>
          <p className='text-base'>You're all caught up!</p>
          <p className='text-sm mt-1'>No notifications yet.</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-200 ${
                notification.read
                  ? "bg-white border-gray-200"
                  : typeColors[notification.type] || typeColors.info
              }`}>
              <div className='flex items-start flex-1 min-w-0'>
                {!notification.read && (
                  <span
                    className={`mt-1.5 mr-2 flex-shrink-0 w-2 h-2 rounded-full ${
                      dotColors[notification.type] || dotColors.info
                    }`}
                  />
                )}
                <div className='flex-1 min-w-0'>
                  <p
                    className={`text-sm ${
                      notification.read ? "text-gray-500" : "text-gray-800 font-medium"
                    }`}>
                    {notification.message}
                  </p>
                  <p className='text-xs text-gray-400 mt-1'>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 ml-4 flex-shrink-0'>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification._id)}
                    className='text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap transition-colors'>
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notification._id)}
                  className='text-xs text-red-400 hover:text-red-600 transition-colors'>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
