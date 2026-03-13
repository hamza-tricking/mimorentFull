'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Notification {
  _id: string;
  type: 'reminder' | 'reservation' | 'order' | 'system' | 'alert' | 'property';
  title: string;
  message: string;
  reservationId?: string;
  orderId?: string;
  propertyId: string;
  userId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    name?: string;
  };
  read: boolean;
  seenBy: Array<{
    _id: string;
    username: string;
    fullName: string;
  }>;
  metadata: {
    reminderId?: string;
    orderId?: string;
    reservationId?: string;
    customerName?: string;
    propertyTitle?: string;
    customerPhone?: string;
    reminderType?: string;
    reminderDateTime?: string;
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
    paymentStatus?: string;
    employerId?: string;
    createdById?: string;
    createdByName?: string;
    createdAt?: string;
    action?: string;
    cancelledReservations?: boolean;
  };
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  // Rate limiting
  let lastRequestTime = 0;
  const REQUEST_THROTTLE = 2000; // 2 seconds minimum between requests

  // Update dropdown position when it opens
  const updateDropdownPosition = (buttonRef: HTMLButtonElement) => {
    const rect = buttonRef.getBoundingClientRect();
    const dropdownWidth = 384; // w-96 = 24rem = 384px
    const windowWidth = window.innerWidth;
    
    // Calculate left position, ensuring dropdown doesn't go off screen
    let left = rect.left + window.scrollX;
    if (left + dropdownWidth > windowWidth) {
      left = windowWidth - dropdownWidth - 16; // 16px padding
    }
    if (left < 16) {
      left = 16;
    }
    
    setDropdownPosition({
      top: rect.bottom + window.scrollY + 8,
      left: left
    });
  };

  // Handle window scroll and resize
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && buttonRef) {
        updateDropdownPosition(buttonRef);
      }
    };

    const handleResize = () => {
      if (isOpen && buttonRef) {
        updateDropdownPosition(buttonRef);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, buttonRef]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside the dropdown
      if (isOpen && !target.closest('.notification-dropdown-content')) {
        console.log('Click outside detected, closing dropdown');
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = async (forceRefresh = false) => {
    try {
      // Rate limiting - prevent too many requests
      const now = Date.now();
      if (!forceRefresh && now - lastRequestTime < REQUEST_THROTTLE) {
        console.log(`⏱️ NotificationDropdown rate limited - waiting ${REQUEST_THROTTLE - (now - lastRequestTime)}ms`);
        return;
      }
      
      lastRequestTime = now;
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/notifications?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setNotifications(data.data);
          // Count notifications that haven't been seen by current user
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const unseen = data.data.filter((n: Notification) => {
            const hasSeenByCurrentUser = n.seenBy?.some((user: any) => user._id === currentUser.id || user._id === currentUser._id);
            return !hasSeenByCurrentUser;
          }).length;
          setUnreadCount(unseen);
        }
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all notifications as seen
  const markAllAsSeen = async () => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Marking all notifications as seen for user:', currentUser);
      
      // Mark all notifications as seen
      const seenPromises = notifications.map(notification => 
        fetch(`https://dmtart.pro/mimorent/api/notifications/${notification._id}/seen`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      
      const results = await Promise.all(seenPromises);
      console.log('All notifications marked as seen:', results);
      
      // Update local state with proper user data
      const userData = {
        _id: currentUser._id || currentUser.id,
        username: currentUser.username || currentUser.name || 'Unknown',
        fullName: currentUser.fullName || currentUser.name || 'Unknown User'
      };
      
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          seenBy: [...(n.seenBy || []), userData._id] // Add only the ID, backend will handle population
        }))
      );
      
      // Store updated notifications in localStorage for other components
      const updatedNotifications = notifications.map(n => ({ 
        ...n, 
        seenBy: [...(n.seenBy || []), userData._id] // Add only the ID
      }));
      
      console.log('Storing updated notifications:', updatedNotifications);
      localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
      
      // Trigger storage event manually for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'adminNotifications',
      }));
      
      // Reset unseen count to 0
      setUnreadCount(0);
      
      // Also mark all as read
      const readResponse = await fetch('https://dmtart.pro/mimorent/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (readResponse.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      }
    } catch (error) {
      console.error('Error marking all notifications as seen:', error);
    }
  };

  // Handle notification click - mark as seen and navigate
  const handleNotificationClick = async (notificationId: string, notification: Notification) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Clicking notification:', notificationId);
      console.log('Current user for seen:', currentUser);
      
      // Mark as seen
      const seenResponse = await fetch(`https://dmtart.pro/mimorent/api/notifications/${notificationId}/seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Seen response status:', seenResponse.status);
      if (seenResponse.ok) {
        const seenData = await seenResponse.json();
        console.log('Seen response data:', seenData);
        
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
          const hasSeenByCurrentUser = n.seenBy?.some((user: any) => user._id === currentUser.id || user._id === currentUser._id);
          return !hasSeenByCurrentUser;
        }).length;
        console.log('New unseen count after click:', newUnseenCount);
        setUnreadCount(newUnseenCount);
      } else {
        const errorText = await seenResponse.text();
        console.error('Seen response error:', errorText);
      }

      // Also mark as read
      const readResponse = await fetch(`https://dmtart.pro/mimorent/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Read response status:', readResponse.status);
      if (readResponse.ok) {
        // Update local state to reflect read status
        setNotifications(prev => 
          prev.map(n => n._id === notificationId 
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
          )
        );
      }

      // Navigate based on notification type
      console.log('🚀 Navigating based on notification type:', notification.type);
      
      // Close dropdown first
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
        
        // Helper function to retry calling window functions
        const retryWindowFunction = (functionName: string, maxRetries = 3, delay = 100) => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            
            const tryCall = () => {
              attempts++;
              console.log(`🔄 Attempt ${attempts} to call ${functionName}`);
              
              if ((window as any)[functionName]) {
                console.log(`✅ Found ${functionName}, calling it`);
                (window as any)[functionName]();
                resolve(true);
              } else if (attempts < maxRetries) {
                console.log(`⏳ ${functionName} not found, retrying in ${delay}ms...`);
                setTimeout(tryCall, delay);
              } else {
                console.log(`❌ ${functionName} not found after ${maxRetries} attempts`);
                reject(new Error(`${functionName} not available`));
              }
            };
            
            tryCall();
          });
        };
        
        // Navigate based on type
        switch (notification.type) {
          case 'reminder':
            console.log('🔄 Navigating to notifications tab for reminder');
            const reminderEvent = new CustomEvent('navigateToNotifications', { bubbles: true });
            window.dispatchEvent(reminderEvent);
            break;
            
          case 'reservation':
            console.log('🔄 Navigating to reservations tab for reservation');
            retryWindowFunction('navigateToAdminReservations')
              .catch(() => {
                console.log('❌ navigateToAdminReservations failed, trying custom event');
                const reservationEvent = new CustomEvent('navigateToReservations', { bubbles: true });
                window.dispatchEvent(reservationEvent);
              });
            break;
            
          case 'order':
            console.log('🔄 Navigating to orders tab for order');
            retryWindowFunction('navigateToAdminOrders')
              .catch(() => {
                console.log('❌ navigateToAdminOrders failed, trying custom event');
                const orderEvent = new CustomEvent('navigateToOrders', { bubbles: true });
                window.dispatchEvent(orderEvent);
              });
            break;
            
          default:
            console.log('🔄 No specific navigation for type:', notification.type);
            // For other types, default to notifications view
            const defaultEvent = new CustomEvent('navigateToNotifications', { bubbles: true });
            window.dispatchEvent(defaultEvent);
            break;
        }
      }, 150);
      
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        );
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
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  return (
    <>
      {/* Bell Button */}
      <button
        ref={setButtonRef}
        onClick={() => {
          if (buttonRef) {
            updateDropdownPosition(buttonRef);
          }
          if (!isOpen) {
            // Set loading to true when opening dropdown if notifications are not loaded yet
            if (notifications.length === 0) {
              setLoading(true);
              fetchNotifications().finally(() => setLoading(false));
            }
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
        className={`text-white hover:text-white/80 transition-all duration-300 p-2.5 rounded-xl hover:bg-white/12 relative ${className}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Portal */}
      {isOpen && createPortal(
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-200 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              console.log('Overlay clicked, closing dropdown');
              setIsAnimating(true);
              setTimeout(() => {
                setIsOpen(false);
                setIsAnimating(false);
              }, 150);
            }}
          />
          
          {/* Dropdown Content */}
          <div
            className={`notification-dropdown-content fixed bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 z-[9999] transition-all duration-200 ${
              isAnimating && isOpen ? 'opacity-0 scale-95 -translate-y-2' : 'opacity-100 scale-100 translate-y-0'
            }`}
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              transformOrigin: 'top right',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => {
              console.log('Dropdown clicked, preventing close');
              // Only prevent close if clicking on the dropdown itself, not on notifications
              if (e.target === e.currentTarget) {
                e.stopPropagation();
              }
            }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 "></div>
              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
              
              <div className="relative flex items-center justify-between w-full">
                <h3 className="text-xl font-semibold text-white leading-tight mb-1 relative">
                  الإشعارات
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetchNotifications(true); // Force refresh bypassing rate limit
                    }}
                    className="text-sm text-white hover:bg-white/60 px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md flex items-center gap-1"
                    title="تحديث الإشعارات"
                  >
                    <RefreshCw className="w-3 h-3" />
                    تحديث
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm hover:bg-white/60 px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                    >
                      تعيين الكل كمقروء
                    </button>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {unreadCount} إشعار غير مقروء
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div 
              className="max-h-64 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {loading ? (
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <LoadingSpinner size="sm" text="" />
                    <p className="text-black/80 text-sm font-medium">جاري تحميل الإشعارات...</p>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation(); // Prevent dropdown from closing
                      handleNotificationClick(notification._id, notification);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            !notification.read ? 'bg-blue-600' : 'bg-gray-300'
                          }`}></div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          <span className="font-medium">الرسالة: </span>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(notification.createdAt)}
                          </span>
                          <span>العميل: {notification.metadata.customerName}</span>
                          {notification.type === 'reservation' && (
                            <span>
                              تم الحجز بواسطة: {
                                notification.userId?.firstName && notification.userId?.lastName 
                                  ? `${notification.userId.firstName} ${notification.userId.lastName}`
                                  : notification.userId?.username || notification.userId?.name || notification.metadata?.createdByName || 'System'
                              }
                            </span>
                          )}
                          {notification.type === 'property' && (
                            <span>
                              تم بواسطة: {
                                notification.userId?.firstName && notification.userId?.lastName 
                                  ? `${notification.userId.firstName} ${notification.userId.lastName}`
                                  : notification.userId?.username || notification.userId?.name || notification.metadata?.createdByName || 'System'
                              }
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          العقار: {notification.metadata.propertyTitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="تعيين كمقروء"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="حذف"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="bg-gray-50 p-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    // Close dropdown with animation
                    setIsAnimating(true);
                    setTimeout(() => {
                      setIsOpen(false);
                      setIsAnimating(false);
                    }, 150);
                    
                    // Trigger the same navigation as the notifications tab
                    const event = new CustomEvent('navigateToNotifications', { bubbles: true });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-center text-teal-600 hover:text-blue-800 text-sm font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  عرض جميع الإشعارات
                </button>
                
                <button
                  onClick={() => {
                    // Close dropdown with animation
                    setIsAnimating(true);
                    setTimeout(() => {
                      setIsOpen(false);
                      setIsAnimating(false);
                    }, 150);
                    
                    // Trigger navigation to orders tab
                    console.log('🚀 Dispatching navigateToOrders event');
                    const event = new CustomEvent('navigateToOrders', { bubbles: true });
                    window.dispatchEvent(event);
                    
                    // Also try direct function call as fallback
                    if ((window as any).navigateToAdminOrders) {
                      console.log('🚀 Calling direct navigateToAdminOrders function');
                      (window as any).navigateToAdminOrders();
                    } else {
                      console.log('❌ navigateToAdminOrders function not found on window');
                    }
                  }}
                  className="w-full text-center text-green-600 hover:text-green-800 text-sm font-medium py-2 px-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  عرض جميع الطلبات
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
