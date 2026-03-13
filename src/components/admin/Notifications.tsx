'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  Bell, 
  Calendar, 
  Home, 
  User, 
  Phone, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  X,
  Eye,
  Check,
  RefreshCw
} from 'lucide-react';
import ReminderModals from './ReminderModals';
import ReminderPortal from './ReminderPortal';

interface Property {
  _id: string;
  title: string;
  location: string;
  pricePerDay: number;
  propertyType: string;
  images: string[];
  wilayaId?: any;
  officeId?: any;
  isReserved: boolean;
  available: boolean;
}

interface Reservation {
  _id: string;
  propertyId: string | Property;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

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

interface Reminder {
  _id: string;
  message: string;
  reminderType: string;
  reminderDateTime?: string;
  daysBeforeEnd?: number;
  status: string;
  reservationId: {
    _id: string;
    customerName: string;
    customerPhone: string;
  };
  propertyId: {
    _id: string;
    title: string;
  };
}

interface NotificationsProps {
  properties: Property[];
  reservations: Reservation[];
  loading?: boolean;
  wilayas: any[];
  offices: any[];
  selectedWilaya: string | null;
  selectedOffice: string | null;
  setSelectedWilaya: (wilaya: string | null) => void;
  setSelectedOffice: (office: string | null) => void;
}

export default function Notifications({ 
  properties, 
  reservations, 
  loading = false, 
  wilayas, 
  offices, 
  selectedWilaya, 
  selectedOffice, 
  setSelectedWilaya, 
  setSelectedOffice 
}: NotificationsProps) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  // View state - either 'reminders' or 'notifications'
  const [currentView, setCurrentView] = useState<'reminders' | 'notifications'>('reminders');
  
  // Reminder modals state
  const [showBeforeEndModal, setShowBeforeEndModal] = useState(false);
  const [showSpecificTimeModal, setShowSpecificTimeModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [reminders, setReminders] = useState<{ [key: string]: any[] }>({});
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // State for toggling reminders per property
  const [expandedReminders, setExpandedReminders] = useState<{ [key: string]: boolean }>({});

  // Toggle function for reminders
  const toggleReminders = (propertyId: string) => {
    setExpandedReminders(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Rate limiting and debouncing
  let lastRequestTime = 0;
  const REQUEST_THROTTLE = 2000; // 2 seconds minimum between requests
  let refreshTimeoutId: NodeJS.Timeout | null = null;

  // Fetch notifications with rate limiting
  const fetchNotifications = async (forceRefresh = false) => {
    try {
      // Rate limiting - prevent too many requests
      const now = Date.now();
      if (!forceRefresh && now - lastRequestTime < REQUEST_THROTTLE) {
        console.log(`⏱️ Rate limited - waiting ${REQUEST_THROTTLE - (now - lastRequestTime)}ms`);
        return;
      }
      
      lastRequestTime = now;
      setNotificationsLoading(true);
      
      const token = localStorage.getItem('token');
      // Add cache busting with timestamp
      const timestamp = Date.now();
      const response = await fetch(`https://dmtart.pro/mimorent/api/notifications?t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        console.log('📊 Notifications fetched successfully:', data.data?.length || 0);
        
        // Save to localStorage with timestamp for caching
        localStorage.setItem('adminNotifications', JSON.stringify(data.data || []));
        localStorage.setItem('adminNotificationsTimestamp', Date.now().toString());
        
        // Calculate unread count
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const unseen = data.data?.filter((n: any) => {
          const hasSeenByCurrentUser = n.seenBy?.some((user: any) => user._id === currentUser.id || user._id === currentUser._id);
          return !hasSeenByCurrentUser;
        }).length || 0;
        setUnreadCount(unseen);
      } else {
        const errorText = await response.text();
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          console.warn('Rate limit hit, waiting before retry...');
          // Wait longer before next request
          lastRequestTime = Date.now() + 10000; // Add 10 seconds penalty
          return;
        }
        
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Debounced refresh function
  const debouncedRefresh = (forceRefresh = false) => {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }
    
    refreshTimeoutId = setTimeout(() => {
      fetchNotifications(forceRefresh);
    }, 300); // 300ms debounce delay
  };

  // Mark notification as seen
  const markAsSeen = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/notifications/${notificationId}/seen`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId 
            ? { ...n, seenBy: [...(n.seenBy || []), { _id: '', username: '', fullName: '' }] }
            : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking as seen:', error);
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load notifications only when manually requested
  // Removed automatic loading on mount

  // Initial data setup - set loading to false since we're not auto-loading
  useEffect(() => {
    setNotificationsLoading(false);
  }, []);

  // Listen for localStorage changes to sync with dropdown
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminNotifications') {
        const updatedNotifications = JSON.parse(e.newValue || '[]');
        setNotifications(updatedNotifications);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Also check localStorage on mount and force refresh
  useEffect(() => {
    // Only clear cache if it's very old (more than 5 minutes) to prevent stale data
    const cachedData = localStorage.getItem('adminNotifications');
    const cacheTimestamp = localStorage.getItem('adminNotificationsTimestamp');
    const now = Date.now();
    
    if (cachedData && cacheTimestamp) {
      const age = now - parseInt(cacheTimestamp);
      if (age > 5 * 60 * 1000) { // 5 minutes
        console.log('🗑️ Clearing old notification cache');
        localStorage.removeItem('adminNotifications');
        localStorage.removeItem('adminNotificationsTimestamp');
      } else {
        // Use cached data while fetching fresh data
        try {
          const parsed = JSON.parse(cachedData);
          setNotifications(parsed);
          console.log('📦 Using cached notifications:', parsed.length);
        } catch (error) {
          console.error('Error parsing cached notifications:', error);
          localStorage.removeItem('adminNotifications');
        }
      }
    }
    
    // Always fetch fresh data
    fetchNotifications();
  }, []);

  // Listen for custom refresh event from dashboard
  useEffect(() => {
    const handleRefreshNotifications = () => {
      console.log('🔄 Refresh notifications event received');
      debouncedRefresh(true); // Force refresh bypassing rate limit
    };

    window.addEventListener('refreshNotifications', handleRefreshNotifications);
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefreshNotifications);
    };
  }, []);

  // Removed automatic refresh on page visibility change
  // Only manual refresh is allowed

  // Filter properties that are reserved
  const reservedProperties = properties.filter(property => property.isReserved);

  // Filter reserved properties based on selected wilaya and office
  const filteredReservedProperties = reservedProperties.filter((property: any) => {
    // If no wilaya selected, show all reserved properties
    if (!selectedWilaya && !selectedOffice) {
      return true;
    }
    
    // Extract wilaya and office IDs (handle both string and object formats)
    const propertyWilayaId = typeof property.wilayaId === 'string' 
      ? property.wilayaId 
      : property.wilayaId?._id || property.wilayaId.id;
    
    const propertyOfficeId = typeof property.officeId === 'string' 
      ? property.officeId 
      : property.officeId?._id || property.officeId.id;
    
    // If wilaya selected, filter by wilaya
    if (selectedWilaya && propertyWilayaId !== selectedWilaya) {
      return false;
    }
    
    // If office selected, filter by office
    if (selectedOffice && propertyOfficeId !== selectedOffice) {
      return false;
    }
    
    return true;
  });

  // Get reservation details for each reserved property
  const getPropertyReservation = (propertyId: string) => {
    return reservations.find(reservation => {
      const reservationPropertyId = typeof reservation.propertyId === 'string' 
        ? reservation.propertyId 
        : reservation.propertyId?._id;
      return reservationPropertyId === propertyId && 
             (reservation.status === 'pending' || reservation.status === 'confirmed');
    });
  };

  // Handle opening reminder modals
  const handleOpenBeforeEndModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowBeforeEndModal(true);
  };

  const handleOpenSpecificTimeModal = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowSpecificTimeModal(true);
  };

  // Handle reminder created
  const handleReminderCreated = () => {
    // Refresh reminders for the selected reservation without triggering useEffect
    if (selectedReservation) {
      // Direct update instead of refetching to avoid infinite loop
      setReminders(prev => ({
        ...prev,
        [selectedReservation._id]: [] // Clear temporarily, then fetch
      }));
      
      // Fetch with a small delay to avoid race conditions
      setTimeout(() => {
        fetchRemindersForReservation(selectedReservation._id);
      }, 1000);
    }
    addToast('تم إنشاء التذكير بنجاح', 'success');
  };

  // Fetch reminders for a specific reservation
  const fetchRemindersForReservation = async (reservationId: string, retryCount = 0) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/reminders/reservation/${reservationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle rate limiting
      if (response.status === 429) {
        if (retryCount < 3) {
          // Wait for 2 seconds and retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchRemindersForReservation(reservationId, retryCount + 1);
        } else {
          return;
        }
      }

      const data = await response.json();

      if (data.success) {
        setReminders(prev => ({
          ...prev,
          [reservationId]: data.data.reminders
        }));
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  // Simple auto-fetch for all reservations
  useEffect(() => {
    // Wait for data to load, then fetch reminders
    const timer = setTimeout(() => {
      // Get all reservations and fetch reminders for each
      reservations.forEach(async (reservation) => {
        if (reservation.status === 'pending' || reservation.status === 'confirmed') {
          await fetchRemindersForReservation(reservation._id);
        }
      });
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [reservations]); // Re-run when reservations change

  // Delete reminder
  const handleDeleteReminder = async (reminderId: string, reservationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Refresh reminders for this reservation
        await fetchRemindersForReservation(reservationId);
        addToast('تم حذف التذكير بنجاح', 'success');
      } else {
        addToast(data.message || 'فشل حذف التذكير', 'error');
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      addToast('حدث خطأ. يرجى المحاولة مرة أخرى', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'confirmed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      case 'partial':
        return 'text-blue-600 bg-blue-100';
      case 'paid':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'منزل';
      case 'villa':
        return 'فيلا';
      case 'shop':
        return 'متجر';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">الإشعارات والتذكيرات</h2>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
            <button
              onClick={() => setCurrentView('reminders')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:font-medium transition-all ${
                currentView === 'reminders'
                  ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 border-white/60 border-2 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="hidden sm:inline">عرض جميع التذكيرات</span>
              <span className="sm:hidden">التذكيرات</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('notifications');
                // Mark all notifications as seen when switching to notifications view
                if (notifications.length > 0) {
                  markAllAsSeen();
                }
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:font-medium transition-all ${
                currentView === 'notifications'
                  ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 border-white/60 border-2 text-white shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="hidden sm:inline">عرض جميع الإشعارات</span>
              <span className="sm:hidden">الإشعارات</span>
            </button>
            <button
              onClick={() => {
                // Clear cache and refresh
                localStorage.removeItem('adminNotifications');
                debouncedRefresh(true); // Force refresh bypassing rate limit
                // Mark all notifications as seen when refreshing
                if (notifications.length > 0) {
                  markAllAsSeen();
                }
                addToast('تم تحديث الإشعارات', 'success');
              }}
              className="px-2 py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2"
              title="تحديث الإشعارات"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Based on Current View */}
      {currentView === 'reminders' ? (
        <div className="space-y-6">
          {/* Wilayas Filter */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">الولايات</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                key="all"
                onClick={() => {
                  setSelectedWilaya(null);
                  setSelectedOffice(null);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 text-sm sm:text-base sm:font-medium transition-all ${
                  selectedWilaya === null
                    ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
                    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                }`}
              >
                جميع الولايات
              </button>
              {wilayas.map((wilaya) => (
                <button
                  key={wilaya._id}
                  onClick={() => {
                    setSelectedWilaya(wilaya._id);
                    setSelectedOffice(null);
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 text-sm sm:text-base sm:font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                    selectedWilaya === wilaya._id
                      ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
                      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                  }`}
                >
                  {wilaya.image ? (
                <img 
                  src={wilaya.image} 
                  alt={wilaya.name}
                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full object-cover"
                />
              ) : null}
              <span className="hidden sm:inline">{wilaya.name}</span>
              <span className="sm:hidden">{wilaya.name.length > 8 ? wilaya.name.substring(0, 8) + '...' : wilaya.name}</span>
            </button>
          ))}
        </div>

        {/* Offices Filter */}
        {selectedWilaya && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">المكاتب</h3>
            <div className="flex flex-wrap gap-2">
              <button
                key="all-offices"
                onClick={() => setSelectedOffice(null)}
                className={`px-3 py-1 rounded-full border text-sm transition-all ${
                  selectedOffice === null
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                }`}
              >
                جميع المكاتب
              </button>
              {offices
                .filter(office => {
                  const officeWilayaId = typeof office.wilayaId === 'string' 
                    ? office.wilayaId 
                    : office.wilayaId?._id || office.wilayaId.id;
                  return officeWilayaId === selectedWilaya;
                })
                .map((office) => (
                <button
                  key={office._id}
                  onClick={() => setSelectedOffice(office._id)}
                  className={`px-3 py-1 rounded-full border text-sm transition-all ${
                    selectedOffice === office._id
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
                  }`}
                >
                  {office.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">حجوزات العقارات المحجوزة</h2>
        
        {filteredReservedProperties.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-300 text-lg">لا توجد إشعارات حالياً</p>
            <p className="text-gray-400 text-sm mt-2">جميع العقارات متاحة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {filteredReservedProperties.map((property) => {
              const reservation = getPropertyReservation(property._id);
              
              return (
                <div 
                  key={property._id} 
                  className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-200"
                >
                  {/* Property Image */}
                  {property.images && property.images.length > 0 && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Property Content */}
                  <div className="p-4">
                    {/* Property Title and Status */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {property.title}
                      </h3>
                      {reservation && (
                        <div className={`flex items-center space-x-2 space-x-reverse px-2 py-1 rounded-full border ${getStatusColor(reservation.status)}`}>
                          {getStatusIcon(reservation.status)}
                          <span className="text-xs font-medium">
                            {reservation.status === 'pending' && 'في الانتظار'}
                            {reservation.status === 'confirmed' && 'مؤكد'}
                            {reservation.status === 'cancelled' && 'ملغي'}
                            {reservation.status === 'completed' && 'مكتمل'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Property Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 ml-2" />
                        {property.location}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-300">
                          {getPropertyTypeLabel(property.propertyType)}
                        </span>
                        <span className="text-green-300">
                          {property.pricePerDay} دج/يوم
                        </span>
                      </div>
                    </div>

                    {/* Reservation Details */}
                    {reservation && (
                      <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
                        {/* Customer Info */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">العميل:</span>
                          <span className="text-white font-medium">
                            {reservation.customerName}
                          </span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">الهاتف:</span>
                          <span className="text-white font-medium">
                            {reservation.customerPhone}
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">الفترة:</span>
                          <span className="text-white text-xs">
                            {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                          </span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">الدفع:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                            {reservation.paymentStatus === 'pending' && 'في الانتظار'}
                            {reservation.paymentStatus === 'partial' && 'مدفوع جزئياً'}
                            {reservation.paymentStatus === 'paid' && 'مدفوع بالكامل'}
                          </span>
                        </div>

                        {/* Remaining Amount */}
                        {reservation.remainingAmount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">المتبقي:</span>
                            <span className="text-orange-300 font-medium">
                              {reservation.remainingAmount} دج
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 space-x-reverse mt-4 pt-3 border-t border-white/10">
                      <button
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-[#ff8844] to-[#cc6600] text-white rounded-lg hover:from-[#ff7733] hover:to-[#aa5500] transition-all text-sm font-medium cursor-pointer border-2 border-white/60"
                        onClick={() => {
                          if (reservation) {
                            handleOpenBeforeEndModal(reservation);
                          }
                        }}
                      >
                        تذكير قبل نهاية الحجز بـ
                      </button>
                      <button
                        className="flex-1 px-3 py-2 bg-gradient-to-br from-[#888888] to-[#666666] text-white rounded-lg hover:from-[#777777] hover:to-[#555555] transition-all text-sm font-medium cursor-pointer border-2 border-white/60"
                        onClick={() => {
                          if (reservation) {
                            handleOpenSpecificTimeModal(reservation);
                          }
                        }}
                      >
                        تذكير في وقت معين
                      </button>
                    </div>

                    {/* Reminders List */}
                    {reservation && reminders[reservation._id] && reminders[reservation._id].length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <h4 
                          className="text-sm font-medium text-white mb-3 flex items-center cursor-pointer hover:text-white/80 transition-colors"
                          onClick={() => toggleReminders(property._id)}
                        >
                          <Bell className="w-4 h-4 ml-2" />
                          التذكيرات ({reminders[reservation._id].length})
                          <span className="ml-auto text-xs">
                            {expandedReminders[property._id] ? '▼' : '▶'}
                          </span>
                        </h4>
                        {expandedReminders[property._id] && (
                          <div className="space-y-2">
                            {reminders[reservation._id].map((reminder: any) => (
                            <div key={reminder._id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      reminder.reminderType === 'before_end' 
                                        ? 'bg-orange-500/20 text-orange-300' 
                                        : 'bg-gray-500/20 text-gray-300'
                                    }`}>
                                      {reminder.reminderType === 'before_end' ? `قبل ${reminder.daysBeforeEnd} يوم` : 'وقت محدد'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      reminder.status === 'pending' 
                                        ? 'bg-yellow-500/20 text-yellow-300' 
                                        : 'bg-green-500/20 text-green-300'
                                    }`}>
                                      {reminder.status === 'pending' ? 'في الانتظار' : 'تم الإرسال'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-300 mb-1">{reminder.message}</p>
                                  {reminder.reminderType === 'specific_time' && reminder.reminderDateTime && (
                                    <p className="text-xs text-gray-400">
                                      {(() => {
                                        const reminderDate = new Date(reminder.reminderDateTime);
                                        // Subtract 1 hour to convert from UTC to Africa/Algiers
                                        reminderDate.setHours(reminderDate.getHours() - 1);
                                        return reminderDate.toLocaleString('ar-DZ', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        });
                                      })()}
                                    </p>
                                  )}
                                  {reminder.reminderType === 'before_end' && (
                                    <p className="text-xs text-gray-400">
                                      قبل {reminder.daysBeforeEnd} يوم من نهاية الحجز
                                    </p>
                                  )}
                                </div>
                                {reminder.status === 'pending' && (
                                  <button
                                    onClick={() => handleDeleteReminder(reminder._id, reservation._id)}
                                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                                    title="حذف التذكير"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </div>
      ) : (
        // Notifications View
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">جميع الإشعارات</h2>
          {notificationsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-black/70">جاري تحميل الإشعارات...</p>
            </div>
          ) : (!notifications || notifications.length === 0) ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification._id} className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-white/80 mb-2">{notification.message}</p>
                      {notification.type === 'reservation' && (
                        <p className="text-white/70 text-sm mb-2">
                          تم الحجز بواسطة: <span className="text-white/90 font-medium">
                            {notification.userId?.firstName && notification.userId?.lastName 
                              ? `${notification.userId.firstName} ${notification.userId.lastName}`
                              : notification.userId?.username || notification.userId?.name || notification.metadata?.createdByName || 'System'
                            }
                          </span>
                        </p>
                      )}
                      {notification.type === 'property' && (
                        <p className="text-white/70 text-sm mb-2">
                          تم بواسطة: <span className="text-white/90 font-medium">
                            {notification.userId?.firstName && notification.userId?.lastName 
                              ? `${notification.userId.firstName} ${notification.userId.lastName}`
                              : notification.userId?.username || notification.userId?.name || notification.metadata?.createdByName || 'System'
                            }
                          </span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-white/60 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>شوهد من قبل {(notification.seenBy || []).length} شخص</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      notification.read 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {notification.read ? 'مقروء' : 'غير مقروء'}
                    </div>
                  </div>
                  
                  {/* Seen By Section */}
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm">من شاهد الإشعار:</span>
                      {!(notification.seenBy || []).some(user => user._id === '') && (
                        <button
                          onClick={() => markAsSeen(notification._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>تعيين كمشاهد</span>
                        </button>
                      )}
                    </div>
                    {(notification.seenBy || []).length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {(notification.seenBy || []).map((user, index) => {
        return (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg text-white/80 text-sm"
          >
            <Check className="w-3 h-3 text-green-400" />
            <span>{user.fullName || user.username || 'مستخدم'}</span>
          </div>
        );
      })}
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm italic">لم يشاهد أي شخص هذا الإشعار بعد</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminder Portal - Renders at document root */}
      <ReminderPortal
        showBeforeEndModal={showBeforeEndModal}
        showSpecificTimeModal={showSpecificTimeModal}
        onCloseBeforeEnd={() => setShowBeforeEndModal(false)}
        onCloseSpecificTime={() => setShowSpecificTimeModal(false)}
        reservationId={selectedReservation?._id}
        propertyTitle={selectedReservation?.propertyId?.title || 'عقار غير محدد'}
        customerName={selectedReservation?.customerName}
        reservationStartDate={selectedReservation?.startDate}
        reservationEndDate={selectedReservation?.endDate}
        onReminderCreated={handleReminderCreated}
      />
    </div>
  );
}
