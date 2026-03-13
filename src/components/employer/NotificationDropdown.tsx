'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, Calendar, Home } from 'lucide-react';
import { createPortal } from 'react-dom';
import LoadingSpinner from '../LoadingSpinner';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  seenBy: Array<{
    _id: string;
    username: string;
    fullName: string;
  }>;
  createdAt: string;
  reservationId?: {
    _id: string;
    customerName: string;
    customerPhone: string;
  };
  propertyId?: {
    _id: string;
    title: string;
  };
  metadata?: {
    reminderId?: {
      _id: string;
      message: string;
      reminderType: string;
    };
    customerName?: string;
    propertyTitle?: string;
    reminderDateTime?: string;
  };
}

export default function EmployerNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Listen for localStorage changes to sync with other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'employerNotifications') {
        const updatedNotifications = JSON.parse(e.newValue || '[]');
        setNotifications(updatedNotifications);
        setUnreadCount(0);  
        // Recalculate unread count
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const unseen = updatedNotifications.filter((n: Notification) => {
          const currentUserSeen = n.seenBy?.some((user: any) => 
            user._id === currentUser.id || user._id === currentUser._id
          );
          return !currentUserSeen;
        }).length;
        setUnreadCount(unseen);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Also check localStorage on mount and force refresh
  useEffect(() => {
    // Clear old localStorage data to force fresh fetch
    localStorage.removeItem('employerNotifications');
    
    // Fetch notifications immediately
    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://dmtart.pro/mimorent/api/employer/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      if (response.ok) {
        const data = await response.json();
       
        
        if (data.success) {
          setNotifications(data.data);
          // Count notifications that haven't been seen by current user
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          
          const unseen = data.data.filter((n: Notification) => {
            // Check if current user has seen this notification
            const currentUserSeen = n.seenBy?.some((user: any) => {
              const match = user._id === currentUser.id || user._id === currentUser._id;
              return match;
            });
            
            return !currentUserSeen;
          }).length;
          
          setUnreadCount(unseen);
        }
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as seen when opening dropdown
  const markAllAsSeen = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update local state immediately
      const updatedNotifications = notifications.map(n => ({
        ...n,
        seenBy: [...(n.seenBy || []), { 
          _id: currentUser.id || currentUser._id, 
          username: currentUser.username || '', 
          fullName: currentUser.fullName || currentUser.name || '' 
        }]
      }));
      
      
      // Store in localStorage for sync
      localStorage.setItem('employerNotifications', JSON.stringify(updatedNotifications));
      
      // Trigger storage event for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'employerNotifications',
        newValue: JSON.stringify(updatedNotifications)
      }));
      
      // Call API to mark all as seen
      const seenResponse = await fetch('https://dmtart.pro/mimorent/api/employer/notifications/seen-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Also mark all as read
      const readResponse = await fetch('https://dmtart.pro/mimorent/api/employer/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (readResponse.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  // Handle notification click - mark as seen
  const handleNotificationClick = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Mark as seen
      const seenResponse = await fetch(`https://dmtart.pro/mimorent/api/employer/notifications/${notificationId}/seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (seenResponse.ok) {
        // Update local state to reflect seen status
        setNotifications(prev => 
          prev.map(n => n._id === notificationId 
            ? { ...n, seenBy: [...(n.seenBy || []), { _id: currentUser._id || currentUser.id, username: currentUser.username || '', fullName: currentUser.fullName || currentUser.name || '' }] }
            : n
          )
        );
        
        // Update unseen count
        const newUnseenCount = notifications.filter(n => {
          if (n._id === notificationId) return false; // This one is now seen
          const currentUserSeen = n.seenBy?.some((user: any) => 
            user._id === currentUser.id || user._id === currentUser._id
          );
          return !currentUserSeen;
        }).length;
        setUnreadCount(newUnseenCount);
      }

      // Also mark as read
      const readResponse = await fetch(`https://dmtart.pro/mimorent/api/employer/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (readResponse.ok) {
        // Update local state to reflect read status
        setNotifications(prev => 
          prev.map(n => n._id === notificationId 
            ? { ...n, read: true }
            : n
          )
        );
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/employer/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Employer unread count data:', data);
        if (data.success && data.data) {
          setUnreadCount(data.data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/employer/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/employer/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification (disabled for employer)
  const deleteNotification = async (notificationId: string) => {
    // Employers cannot delete notifications
    console.log('Delete action not allowed for employer');
  };

  // Update dropdown position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notification-dropdown-content') && !target.closest('.notification-button')) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and set up interval
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'reservation':
        return <Calendar className="w-4 h-4 text-green-400" />;
      case 'property':
        return <Home className="w-4 h-4 text-orange-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen) {
            setIsAnimating(true);
            setIsOpen(true);
            // Mark all notifications as seen when opening dropdown
            if (notifications.length > 0) {
              markAllAsSeen();
            }
            // Stop animation after transition completes
            setTimeout(() => setIsAnimating(false), 200);
          } else {
            setIsAnimating(true);
            setTimeout(() => {
              setIsOpen(false);
              setIsAnimating(false);
            }, 150);
          }
        }}
        className="notification-button relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-200 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ pointerEvents: 'auto' }}
            onClick={() => {
              setIsAnimating(true);
              setTimeout(() => {
                setIsOpen(false);
                setIsAnimating(false);
              }, 150);
            }}
          />
          
          <div
            className={`notification-dropdown-content fixed bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[28rem] overflow-y-auto z-[9999] transition-all duration-200 ${
              isAnimating && isOpen ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
              transformOrigin: 'top right',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
          {/* Header */}
          <div className=" bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 text-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">الإشعارات</h3>
              <button
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setIsOpen(false);
                    setIsAnimating(false);
                  }, 150);
                }}
                className="text-white hover:bg-white/20 rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white/80 hover:text-white mt-2 flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                تعيين الكل كمقروء
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <LoadingSpinner size="sm" text="جاري التحميل..." />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                لا توجد إشعارات
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium text-sm truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-medium">الرسالة: </span>
                        {notification.message}
                      </p>
                      
                      {/* Additional context */}
                      {notification.metadata?.propertyTitle && (
                        <p className="text-xs text-gray-500 mb-1">
                          العقار: {notification.metadata.propertyTitle}
                        </p>
                      )}
                      
                      {notification.metadata?.customerName && (
                        <p className="text-xs text-gray-500 mb-1">
                          العميل: {notification.metadata.customerName}
                        </p>
                      )}
                      
                      {notification.metadata?.reminderDateTime && (
                        <p className="text-xs text-gray-500 mb-1">
                          التذكير: {new Date(notification.metadata.reminderDateTime).toLocaleString('ar-DZ')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {formatTime(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-blue-500 hover:text-blue-700"
                              title="تعيين كمقروء"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Action Buttons */}
          <div className="p-3 border-t border-gray-100 space-y-2">
            <button
              onClick={() => {
                // Navigate to notifications tab using custom event
                window.dispatchEvent(new CustomEvent('navigateToNotifications'));
                // Close dropdown
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 px-3 rounded-lg transition-colors duration-200 font-medium"
            >
              عرض جميع الإشعارات
            </button>
            
            <button
              onClick={() => {
                // Navigate to orders tab using custom event
                window.dispatchEvent(new CustomEvent('navigateToOrders'));
                // Close dropdown
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-green-600 hover:text-green-800 hover:bg-green-50 py-2 px-3 rounded-lg transition-colors duration-200 font-medium"
            >
              عرض جميع الطلبات
            </button>
          </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
