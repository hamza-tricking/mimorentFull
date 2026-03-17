'use client';

import React, { useState, useEffect } from 'react';
import { Home, Calendar, User, LogOut,  Mail, Bell, ChevronDown, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';
import NotificationDropdown from '../../components/employer/NotificationDropdown';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmployeeProfileModal from '../../components/employer/EmployeeProfileModal';
import ImageUpload from '../../components/ImageUpload';

interface Property {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  images: string[];
  available: boolean;
  isReserved: boolean;
  location?: string;
  propertyType?: string;
  reserveTheProperty?: string;
  targetAudience?: string;
  reservationIds?: any[];
  wilayaId: {
    _id: string;
    name: string;
  };
  officeId: {
    _id: string;
    name: string;
  };
}

interface Reservation {
  _id: string;
  propertyId: string | { _id: string; id?: string };
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  employerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  isMarried: boolean;
  numberOfPeople: string;
  identityImages: string[];
  notes: string[];
}

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  wilayaId: string;
  officeId: string;
  officeName: string;
  role: string;
  image?: string;
  lastLogin?: string;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const { addToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure reservations is always an array to prevent runtime errors
  useEffect(() => {
    if (!Array.isArray(reservations)) {
      setReservations([]);
    }
    if (!Array.isArray(orders)) {
      setOrders([]);
    }
    if (!Array.isArray(notifications)) {
      setNotifications([]);
    }
  }, [reservations, orders, notifications]);
  const [activeTab, setActiveTab] = useState<'properties' | 'reservations' | 'notifications' | 'orders'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('employerDashboardTab');
      return (savedTab as 'properties' | 'reservations' | 'notifications' | 'orders') || 'properties';
    }
    return 'properties';
  });
  
  // Modal states
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [currentBookingOrder, setCurrentBookingOrder] = useState<any | null>(null);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  
  // Action loading states
  const [isValidatingAction, setIsValidatingAction] = useState(false);
  
  // Order management state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<string>('medium');
  const [editAdminNotes, setEditAdminNotes] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [employerNote, setEmployerNote] = useState<string>('');
  
  // Contract modal state
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState({
    propertyName: 'إقامة الأوراس',
    ownerName: '',
    ownerBirthDate: '',
    ownerCinNumber: '',
    ownerCinDate: '',
    ownerCinLocation: '',
    ownerAddress: '',
    tenantName: '',
    tenantBirthPlace: '',
    tenantBirthDate: '',
    tenantCinNumber: '',
    tenantCinDate: '',
    tenantCinLocation: '',
    propertyAddress: '',
    guaranteeAmount: '',
    monthlyRent: '',
    contractLocation: '',
    contractDate: ''
  });

  // Calendar and expanded cards state
  const [expandedPropertyCards, setExpandedPropertyCards] = useState<Set<string>>(new Set());
  const [preSelectedDates, setPreSelectedDates] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [showReservationsListModal, setShowReservationsListModal] = useState(false);
  const [selectedPropertyForReservationsList, setSelectedPropertyForReservationsList] = useState<string>('');
  const [clearReservationsConfirmation, setClearReservationsConfirmation] = useState<{
    propertyId: string | null;
    propertyTitle: string | null;
    reservationCount: number | null;
  }>({ propertyId: null, propertyTitle: null, reservationCount: null });

  // Form states
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    totalPrice: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    isMarried: false,
    numberOfPeople: '1',
    identityImages: [] as string[],
    notes: [] as string[],
    currentNote: ''
  });

  // State for tracking original dates and smart suggestions
  const [originalDates, setOriginalDates] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [dateChangeSuggestion, setDateChangeSuggestion] = useState<string | null>(null);

  // Function to generate date change suggestion
  const generateDateChangeSuggestion = (oldStartDate: string, oldEndDate: string, newStartDate: string, newEndDate: string): string | null => {
    const oldStart = new Date(oldStartDate);
    const oldEnd = new Date(oldEndDate);
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);
    
    const oldDays = Math.ceil((oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const newDays = Math.ceil((newEnd.getTime() - newStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dayDifference = newDays - oldDays;
    
    // Only generate suggestion if there's an actual change in days
    if (dayDifference === 0) return null;
    
    const action = dayDifference > 0 ? 'إضافة' : 'إزالة';
    const daysCount = Math.abs(dayDifference);
    
    return `العميل يريد ${action} ${daysCount} ${daysCount === 1 ? 'يوم' : 'أيام'} من الحجز. الفترة السابقة: ${formatDate(oldStartDate)} - ${formatDate(oldEndDate)}. الفترة الجديدة: ${formatDate(newStartDate)} - ${formatDate(newEndDate)}.`;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Validation function for monthly reservation dates
  const validateMonthlyReservation = (startDate: Date, endDate: Date, propertyId: string): { isValid: boolean; message?: string } => {
    const property = properties.find((p: any) => p._id === propertyId);
    
    // If property is daily, no monthly validation needed
    if (!property || property.reserveTheProperty !== 'monthly') {
      return { isValid: true };
    }
    
    // For monthly reservations, check if end date is exactly one or more months after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in months
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const dayDiff = end.getDate() - start.getDate();
    
    // Check if it's exactly at least one month
    if (monthsDiff < 1) {
      return { 
        isValid: false, 
        message: 'فترة الحجز غير صحيحة. يجب أن يكون تاريخ الانتهاء بعد شهر واحد على الأقل من تاريخ البدء للحجوزات الشهرية.' 
      };
    }
    
    // For exactly one month, day should be the same
    if (monthsDiff === 1 && dayDiff !== 0) {
      return { 
        isValid: false, 
        message: 'فترة الحجز غير صحيحة. للحجز الشهري، يجب أن يكون تاريخ الانتهاء هو نفس اليوم من الشهر التالي (مثال: 03/15/2026 → 04/15/2026).' 
      };
    }
    
    // For multiple months, day should be the same
    if (monthsDiff > 1 && dayDiff !== 0) {
      return { 
        isValid: false, 
        message: 'فترة الحجز غير صحيحة. للحجز الشهري، يجب أن يكون تاريخ الانتهاء هو نفس اليوم من الشهر المناسب (مثال: 03/15/2026 → 06/15/2026 لمدة 3 أشهر).' 
      };
    }
    
    return { isValid: true };
  };

  // Function to calculate end date for monthly reservations
  const calculateMonthlyEndDate = (startDate: string, months: number = 1): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    
    // Handle edge cases for end of month (e.g., Jan 31 → Feb 28/29)
    if (start.getDate() !== end.getDate()) {
      end.setDate(0); // Set to last day of previous month
    }
    
    return end.toISOString().split('T')[0];
  };

  // Function to calculate total price based on property price and reservation dates
  const calculateReservationPrice = (startDate: string, endDate: string, propertyId: string): number => {
    const property = properties.find((p: any) => p._id === propertyId);
    if (!property) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (property.reserveTheProperty === 'daily') {
      // Calculate days difference (including both start and end dates)
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return daysDiff * property.pricePerDay;
    } else {
      // For monthly reservations, calculate months difference
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      return monthsDiff * property.pricePerDay;
    }
  };
  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      
      if (parsedUser.role === 'admin' || parsedUser.role === 'sous admin') {
        router.push('/admin/dashboard');
        return;
      }
      
      setUser(parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  // Fetch properties for user's wilaya
  useEffect(() => {
    if (user?.wilayaId) {
      const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        try {
          await Promise.all([
            fetchProperties(),
            fetchReservations(),
            fetchNotifications(),
            fetchOrders()
          ]);
        } catch (error) {
          console.error('Error fetching data:', error);
          setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAllData();
    } else {
      // Set loading to false to prevent infinite loading
      setLoading(false);
    }
  }, [user]);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('employerDashboardTab', activeTab);
    }
  }, [activeTab]);

  const togglePropertyCard = (propertyId: string) => {
    setExpandedPropertyCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  // Real-time property status checking
  useEffect(() => {
    if (!user?.wilayaId) return;

    const checkPropertyStatus = async () => {
      try {
        // Check if any property status has changed by fetching fresh data
        const token = localStorage.getItem('token');
        
        const response = await fetch(`https://dmtart.pro/mimorent/api/employer/properties/wilaya/${user.wilayaId}?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.properties) {
            // Compare with current properties and update if changed
            const currentPropertiesMap = new Map(properties.map(p => [p._id, p]));
            const hasChanges = data.data.properties.some((newProperty: any) => {
              const currentProperty = currentPropertiesMap.get(newProperty._id);
              return !currentProperty || 
                     currentProperty.available !== newProperty.available || 
                     currentProperty.isReserved !== newProperty.isReserved;
            });

            if (hasChanges) {
              console.log('Property status changed, refreshing...');
              await fetchProperties();
              await fetchReservations();
              addToast('تم تحديث حالة العقارات', 'info');
            }
          }
        }
      } catch (error) {
        console.error('Error checking property status:', error);
      }
    };

    // Check every 10 seconds for property status changes
    const interval = setInterval(checkPropertyStatus, 10000);

    return () => clearInterval(interval);
  }, [user, properties, addToast]);

  // Listen for navigation events from NotificationDropdown
  useEffect(() => {
    const handleNavigateToNotifications = () => {
      setActiveTab('notifications');
    };

    const handleNavigateToOrders = () => {
      setActiveTab('orders');
    };

    window.addEventListener('navigateToNotifications', handleNavigateToNotifications);
    window.addEventListener('navigateToOrders', handleNavigateToOrders);

    return () => {
      window.removeEventListener('navigateToNotifications', handleNavigateToNotifications);
      window.removeEventListener('navigateToOrders', handleNavigateToOrders);
    };
  }, []);

  // Populate form data when editingReservation changes
  useEffect(() => {
    if (editingReservation && properties.length > 0) {
      console.log('🔄 Populating form data for reservation:', editingReservation._id);
      
      // Find the property for this reservation
      const propertyId = typeof editingReservation.propertyId === 'string' 
        ? editingReservation.propertyId 
        : editingReservation.propertyId?._id || (editingReservation.propertyId as any)?.id || '';
      
      const property = properties.find((p: any) => p._id === propertyId);
      
      if (property) {
        console.log('🏠 Found property:', property.title);
        
        // Safe date conversion
        const safeDateToISOString = (dateString: string | undefined) => {
          if (!dateString) return new Date().toISOString().split('T')[0];
          
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
              return new Date().toISOString().split('T')[0];
            }
            return date.toISOString().split('T')[0];
          } catch (error) {
            return new Date().toISOString().split('T')[0];
          }
        };
        
        const formDataToSet = {
          customerName: editingReservation.customerName || '',
          customerPhone: editingReservation.customerPhone || '',
          startDate: safeDateToISOString(editingReservation.startDate),
          endDate: safeDateToISOString(editingReservation.endDate),
          totalPrice: editingReservation.totalPrice || 0,
          paidAmount: editingReservation.paidAmount || 0,
          remainingAmount: editingReservation.remainingAmount || 0,
          paymentStatus: editingReservation.paymentStatus || 'pending',
          status: editingReservation.status || 'pending',
          isMarried: editingReservation.isMarried || false,
          numberOfPeople: editingReservation.numberOfPeople?.toString() || '1',
          identityImages: editingReservation.identityImages || [''],
          notes: editingReservation.notes || [],
          currentNote: ''
        };
        
        // Store original dates for change detection
        setOriginalDates({
          startDate: safeDateToISOString(editingReservation.startDate),
          endDate: safeDateToISOString(editingReservation.endDate)
        });
        setDateChangeSuggestion(null); // Reset suggestion when opening edit modal
        
        console.log('📝 Setting form data:', formDataToSet);
        setFormData(formDataToSet);
      }
    }
  }, [editingReservation, properties]);

  // Validation functions
  const validatePropertyAction = async (propertyId: string, action: 'reserve' | 'edit') => {
    try {
      setIsValidatingAction(true);
      
      // Refresh properties to get latest data
      await fetchProperties();
      await fetchReservations();
      
      // Find the current property state
      const currentProperty = properties.find(p => p._id === propertyId);
      
      if (!currentProperty) {
        addToast('العقار غير موجود', 'error');
        return false;
      }

      switch (action) {
        case 'reserve':
          if (currentProperty.isReserved || !currentProperty.available) {
            addToast('العقار غير متاح للحجز حاليًا', 'error');
            return false;
          }
          break;
        
        case 'edit':
          if (!currentProperty.isReserved) {
            addToast('لا يوجد حجز نشط لهذا العقار للتعديل', 'error');
            return false;
          }
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating property action:', error);
      addToast('حدث خطأ أثناء التحقق', 'error');
      return false;
    } finally {
      setIsValidatingAction(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!user?.wilayaId) {
        console.error('No wilayaId found in user object');
        setError('لا يمكن الوصول إلى بيانات الولاية');
        return;
      }
      
      const url = `https://dmtart.pro/mimorent/api/employer/properties/wilaya/${user.wilayaId}?t=${Date.now()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setProperties(data.data.properties || []);
        } else {
          console.error('Failed to fetch properties:', data.message);
          setError('فشل في تحميل العقارات');
        }
      } else {
        console.error('Failed to fetch properties:', response.statusText);
        setError('فشل في تحميل العقارات');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('حدث خطأ أثناء تحميل العقارات');
    }
  };

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!user?.wilayaId) {
        console.error('No wilayaId found in user object');
        return;
      }
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/employer/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📥 Received reservations data:', data);
        
        // Check if data is nested like admin routes
        const reservationsArray = Array.isArray(data?.data?.data) ? data.data.data : 
                                Array.isArray(data?.data?.reservations) ? data.data.reservations : 
                                Array.isArray(data?.reservations) ? data.reservations : [];
        
        console.log('📋 Processed reservations array:', reservationsArray);
        if (reservationsArray.length > 0) {
          console.log('🔍 Sample reservation:', {
            _id: reservationsArray[0]._id,
            totalPrice: reservationsArray[0].totalPrice,
            paidAmount: reservationsArray[0].paidAmount,
            remainingAmount: reservationsArray[0].remainingAmount,
            propertyId: reservationsArray[0].propertyId
          });
        }
        
        // Ensure we always set an array
        setReservations(reservationsArray);
      } else {
        console.error('Failed to fetch reservations:', response.statusText);
        setReservations([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      setReservations([]); // Set empty array on error
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://dmtart.pro/mimorent/api/employer/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ensure we always set an array
        setNotifications(Array.isArray(data?.data) ? data.data : []);
      } else {
        console.error('Failed to fetch notifications:', response.statusText);
        setNotifications([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]); // Set empty array on error
    }
  };

  // Mark all notifications as seen
  const markAllNotificationsAsSeen = async () => {
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

  const fetchOrders = async () => {
    try {
      console.log('🔍 Employer fetching orders...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('🔴 No token found in localStorage');
        setOrders([]);
        return;
      }
      
      console.log('🔍 Making request to: https://dmtart.pro/mimorent/api/admin/orders-reservation/employer');
      
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/orders-reservation/employer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔍 Employer orders response status:', response.status);
      console.log('🔍 Employer orders response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Employer orders response data:', data);
        
        // Ensure we always set an array - data is nested: data.data.data
        const ordersArray = Array.isArray(data?.data?.data) ? data.data.data : [];
        console.log('🔍 Employer orders array length:', ordersArray.length);
        setOrders(ordersArray);
      } else {
        console.error('🔴 Failed to fetch orders:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🔴 Error response body:', errorText);
        setOrders([]); // Set empty array on error
      }
    } catch (error) {
      console.error('🔴 Failed to fetch orders - Network error:', error);
      console.error('🔴 Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack,
        name: (error as Error).name
      });
      setOrders([]); // Set empty array on error
    }
  };

  // Order management functions
  const handleEditOrder = (order: any) => {
    setEditingOrder(order._id);
    setEditPriority(order.priority || 'medium');
    setEditAdminNotes(order.adminNotes || '');
  };

  const handleSaveEdit = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priority: editPriority,
          adminNotes: editAdminNotes
        })
      });

      if (response.ok) {
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, priority: editPriority, adminNotes: editAdminNotes }
            : order
        ));
        setEditingOrder(null);
        setOrderError(null);
      } else {
        setOrderError('فشل في حفظ التعديلات');
      }
    } catch (error) {
      setOrderError('حدث خطأ أثناء حفظ التعديلات');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditPriority('medium');
    setEditAdminNotes('');
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'approved' }
            : order
        ));
        setOrderError(null);
      } else {
        setOrderError('فشل في الموافقة على الطلب');
      }
    } catch (error) {
      setOrderError('حدث خطأ أثناء الموافقة على الطلب');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'rejected' }
            : order
        ));
        setOrderError(null);
      } else {
        setOrderError('فشل في رفض الطلب');
      }
    } catch (error) {
      setOrderError('حدث خطأ أثناء رفض الطلب');
    }
  };

  const handleAddEmployerNote = async (orderId: string) => {
    if (!employerNote.trim()) {
      setOrderError('ملاحظة الموظف لا يمكن أن تكون فارغة');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}/employer-notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: employerNote.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the order in local state with the new employer notes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  employerNotes: data.order?.employerNotes || [
                    ...(order.employerNotes || []),
                    {
                      employerId: user?.id,
                      message: employerNote.trim(),
                      createdAt: new Date().toISOString()
                    }
                  ]
                }
              : order
          )
        );
        setEmployerNote('');
        setOrderError(null);
      } else {
        setOrderError('فشل في إضافة ملاحظة الموظف');
      }
    } catch (error) {
      setOrderError('حدث خطأ أثناء إضافة ملاحظة الموظف');
    }
  };

  const handleBookNow = async (order: any) => {
    try {
      // Find the property for this order
      const property = properties.find(p => p._id === (order.propertyId?._id || order.propertyId));
      
      if (!property) {
        setOrderError('العقار غير موجود');
        return;
      }

      // Set the selected property
      setSelectedProperty(property);
      
      // Set the current booking order
      setCurrentBookingOrder(order);
      
      // Pre-fill the form with order data
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        } catch (error) {
          console.error('Error formatting date:', error);
          return '';
        }
      };

      setFormData({
        customerName: order.fullname || order.customerName || '',
        customerPhone: order.phoneNumber || order.customerPhone || '',
        startDate: formatDateForInput(order.startDate),
        endDate: formatDateForInput(order.endDate),
        totalPrice: order.totalPrice || property.pricePerDay || 0,
        paidAmount: order.advancePayment || 0,
        remainingAmount: (order.totalPrice || property.pricePerDay || 0) - (order.advancePayment || 0),
        paymentStatus: 'pending' as 'pending' | 'partial' | 'paid',
        status: 'confirmed' as 'pending' | 'confirmed' | 'cancelled' | 'completed', // Set to confirmed since this is from an approved order
        isMarried: order.isMarried || false,
        numberOfPeople: order.numberOfPeople?.toString() || '1',
        identityImages: order.identityImages || [''],
        notes: [],
        currentNote: ''
      });
      
      setReservationError(null);
      setShowReservationModal(true);
    } catch (error) {
      console.error('Error opening reservation modal:', error);
      setOrderError('حدث خطأ أثناء فتح نموذج الحجز');
    }
  };

  const isPropertyReserved = (propertyId: string) => {
    if (!reservations || !Array.isArray(reservations)) {
      return false;
    }
    return reservations.some((reservation: any) => {
      const reservationPropertyId = typeof reservation.propertyId === 'string' 
        ? reservation.propertyId 
        : reservation.propertyId?._id || reservation.propertyId.id;
      return reservationPropertyId === propertyId && 
             ['pending', 'confirmed', 'approved'].includes(reservation.status);
    });
  };

  // Alternative: Use property.isReserved field (more efficient)
  const isPropertyReservedDirect = (property: any) => {
    return property.isReserved || false;
  };

  const openEditReservationModal = (reservation: any) => {
    console.log('🎯 Opening edit modal with reservation:', reservation._id);
    console.log('📝 Reservation data:', {
      totalPrice: reservation.totalPrice,
      paidAmount: reservation.paidAmount,
      remainingAmount: reservation.remainingAmount
    });
    
    // Find and set the property for this reservation
    const propertyId = typeof reservation.propertyId === 'string' 
      ? reservation.propertyId 
      : reservation.propertyId?._id || (reservation.propertyId as any)?.id || '';
    
    const property = properties.find((p: any) => p._id === propertyId);
    if (property) {
      console.log('🏠 Found property for reservation:', property.title);
      setSelectedProperty(property);
    } else {
      console.log('❌ No property found for reservation, using fallback');
      // Create a minimal property object to prevent modal from failing
      setSelectedProperty({
        _id: propertyId,
        title: 'عقار',
        description: '',
        pricePerDay: 0,
        images: [],
        available: true,
        isReserved: true,
        wilayaId: { _id: '', name: '' },
        officeId: { _id: '', name: '' }
      });
    }
    
    setEditingReservation(reservation);
    setShowReservationModal(true);
  };

  const openEditReservationModalForProperty = async (property: Property) => {
    console.log('🔍 Looking for reservations for property:', property._id);
    console.log('📋 Available reservations:', reservations.length);
    
    // Find the latest reservation for this property
    const propertyReservations = reservations.filter((r: any) => {
      const reservationPropertyId = typeof r.propertyId === 'string' 
        ? r.propertyId 
        : r.propertyId?._id || r.propertyId.id;
      console.log(`🔍 Checking reservation ${r._id}: propertyId = ${reservationPropertyId}, target = ${property._id}`);
      return reservationPropertyId === property._id;
    });
    
    console.log('📊 Found reservations for property:', propertyReservations.length);
    
    if (propertyReservations.length === 0) {
      console.log('❌ No reservations found for this property');
      addToast('لا يوجد حجوزات لهذا العقار', 'error');
      return;
    }
    
    // Get the most recent reservation
    const latestReservation = propertyReservations[0];
    console.log('✅ Opening edit modal for reservation:', latestReservation._id);
    openEditReservationModal(latestReservation);
  };

  const openReservationModal = async (property: Property) => {
    // Validate property can be reserved
    const isValid = await validatePropertyAction(property._id, 'reserve');
    if (!isValid) return;

    setSelectedProperty(property);
    setEditingReservation(null); // Clear any existing editing reservation
    
    // Check if this is a family property and auto-set marital status
    const isFamilyProperty = property.targetAudience === 'family';
    
    setFormData({
      customerName: '',
      customerPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalPrice: 0,
      paidAmount: 0,
      remainingAmount: 0,
      paymentStatus: 'pending',
      status: 'pending',
      isMarried: isFamilyProperty,
      numberOfPeople: '1',
      identityImages: [],
      notes: [],
      currentNote: ''
    });
    setReservationError(null);
    setShowReservationModal(true);
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReservationError(null);
    setIsSubmittingReservation(true);

    // Client-side date validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (startDate >= endDate) {
      setReservationError('يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء');
      setIsSubmittingReservation(false);
      return;
    }
    
    // Monthly reservation validation
    const monthlyValidation = validateMonthlyReservation(startDate, endDate, selectedProperty?._id || '');
    if (!monthlyValidation.isValid) {
      setReservationError(monthlyValidation.message || 'فترة الحجز غير صحيحة للحجوزات الشهرية');
      setIsSubmittingReservation(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const reservationData = {
        propertyId: selectedProperty?._id,
        ...(editingReservation ? {} : { employerId: user?.id }), // Only set employerId for new reservations
        ...formData,
        remainingAmount: formData.totalPrice - formData.paidAmount,
        ...(currentBookingOrder && { orderReservationId: currentBookingOrder._id }), // Add order reference if booking from order
        // Exclude currentNote from submission as it's only for UI state
        currentNote: undefined
      };

      let response;
      
      if (editingReservation) {
        // Update existing reservation
        response = await fetch(`https://dmtart.pro/mimorent/api/employer/reservations/${editingReservation._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reservationData)
        });
      } else {
        // Create new reservation
        response = await fetch('https://dmtart.pro/mimorent/api/employer/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reservationData)
        });
      }

      if (response.ok) {
        setShowReservationModal(false);
        setEditingReservation(null);
        setCurrentBookingOrder(null); // Clear current booking order
        setPreSelectedDates(null); // Reset pre-selected dates
        
        // If this reservation was created from an order, update the order status
        if (currentBookingOrder) {
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o._id === currentBookingOrder._id 
                ? { ...o, status: 'booked' }
                : o
            )
          );
        }
        
        fetchReservations();
        fetchProperties(); // Refresh to update property availability
        
        // Show success toast
        addToast(
          editingReservation ? 'تم تحديث الحجز بنجاح' : 'تم إنشاء الحجز بنجاح', 
          'success'
        );
      } else {
        const errorData = await response.json();
        setReservationError(errorData.message || `Failed to ${editingReservation ? 'update' : 'create'} reservation`);
        addToast(errorData.message || `فشل في ${editingReservation ? 'تحديث' : 'إنشاء'} الحجز`, 'error');
      }
    } catch (error) {
      setReservationError('Network error. Please try again.');
      addToast('خطأ في الشبكة. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  // Calendar component for current month
  const PropertyCalendar = ({ propertyId }: { propertyId: string }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectingDates, setSelectingDates] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    
    const month = currentMonth;
    const year = currentYear;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const navigateMonth = (direction: number) => {
      if (direction === -1) {
        // Previous month
        if (month === 0) {
          setCurrentMonth(11);
          setCurrentYear(year - 1);
        } else {
          setCurrentMonth(month - 1);
        }
      } else {
        // Next month
        if (month === 11) {
          setCurrentMonth(0);
          setCurrentYear(year + 1);
        } else {
          setCurrentMonth(month + 1);
        }
      }
    };
    
    const goToToday = () => {
      setCurrentMonth(new Date().getMonth());
      setCurrentYear(new Date().getFullYear());
    };
    
    const handleDateClick = (date: Date, dateStr: string) => {
      const reservationInfo = reservedDates.get(dateStr);
      
      // If date is reserved, open edit modal
      if (reservationInfo) {
        const property = properties.find((p: any) => p._id === propertyId);
        if (property) {
          setSelectedProperty(property);
        }
        
        const reservation = reservations.find((r: any) => {
          const reservationPropertyId = typeof r.propertyId === 'string' 
            ? r.propertyId 
            : r.propertyId?._id || r.propertyId.id;
          return r._id === reservationInfo.reservationId;
        });
        
        if (reservation) {
          setEditingReservation(reservation);
          setShowReservationModal(true);
        }
        return;
      }
      
      // If date is not reserved, handle date selection
      if (!isSelecting) {
        // Start selecting
        setSelectedStartDate(date);
        setSelectedEndDate(null);
        setIsSelecting(true);
      } else {
        // Finish selecting
        if (selectedStartDate) {
          const start = selectedStartDate.getTime() < date.getTime() ? selectedStartDate : date;
          const end = selectedStartDate.getTime() < date.getTime() ? date : selectedStartDate;
          setSelectedStartDate(start);
          setSelectedEndDate(end);
          setIsSelecting(false);
          
          // Open add reservation modal with selected dates
          const property = properties.find((p: any) => p._id === propertyId);
          if (property) {
            setSelectedProperty(property);
          }
          setPreSelectedDates({ startDate: start, endDate: end });
          
          // Check if this is a family property and auto-set marital status
          const isFamilyProperty = property?.targetAudience === 'family';
          
          // Calculate the total price based on selected dates and property
          const startDate = start.toISOString().split('T')[0];
          const endDate = end.toISOString().split('T')[0];
          const calculatedPrice = calculateReservationPrice(startDate, endDate, propertyId);
          
          setFormData({
            customerName: '',
            customerPhone: '',
            startDate: startDate,
            endDate: endDate,
            totalPrice: calculatedPrice,
            paidAmount: 0,
            remainingAmount: calculatedPrice,
            paymentStatus: 'pending',
            status: 'pending',
            isMarried: isFamilyProperty,
            numberOfPeople: '1',
            identityImages: [],
            notes: [],
            currentNote: ''
          });
          setReservationError(null);
          setShowReservationModal(true);
          
          // Reset selection after opening modal
          setTimeout(() => {
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setHoveredDate(null);
          }, 100);
        }
      }
    };
    
    const isDateInSelection = (date: Date) => {
      if (!selectedStartDate || !selectedEndDate) return false;
      return date >= selectedStartDate && date <= selectedEndDate;
    };
    
    const isDateInHoverRange = (date: Date, dateStr: string) => {
      if (!isSelecting || !selectedStartDate || !hoveredDate) return false;
      
      const reservationInfo = reservedDates.get(dateStr);
      if (reservationInfo) return false;
      
      const start = selectedStartDate.getTime() < hoveredDate.getTime() ? selectedStartDate : hoveredDate;
      const end = selectedStartDate.getTime() < hoveredDate.getTime() ? hoveredDate : selectedStartDate;
      return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    };
    
    const isDateSelecting = (date: Date) => {
      if (!selectedStartDate || !isSelecting) return false;
      return date.toDateString() === selectedStartDate.toDateString();
    };
    
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                       'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    // Get the property and its reservations
    const property = properties.find((p: any) => p._id === propertyId);
    const propertyReservations = property?.reservationIds || [];
    
    // Color palette for different reservations
    const reservationColors = [
      { bg: 'bg-red-500/30', text: 'text-red-300', border: 'border-red-500/50', light: 'bg-red-500/20', lightBorder: 'border-red-500/30' },
      { bg: 'bg-blue-500/30', text: 'text-blue-300', border: 'border-blue-500/50', light: 'bg-blue-500/20', lightBorder: 'border-blue-500/30' },
      { bg: 'bg-green-500/30', text: 'text-green-300', border: 'border-green-500/50', light: 'bg-green-500/20', lightBorder: 'border-green-500/30' },
      { bg: 'bg-purple-500/30', text: 'text-purple-300', border: 'border-purple-500/50', light: 'bg-purple-500/20', lightBorder: 'border-purple-500/30' },
      { bg: 'bg-yellow-500/30', text: 'text-yellow-300', border: 'border-yellow-500/50', light: 'bg-yellow-500/20', lightBorder: 'border-yellow-500/30' },
      { bg: 'bg-pink-500/30', text: 'text-pink-300', border: 'border-pink-500/50', light: 'bg-pink-500/20', lightBorder: 'border-pink-500/30' },
      { bg: 'bg-indigo-500/30', text: 'text-indigo-300', border: 'border-indigo-500/50', light: 'bg-indigo-500/20', lightBorder: 'border-indigo-500/30' },
      { bg: 'bg-orange-500/30', text: 'text-orange-300', border: 'border-orange-500/50', light: 'bg-orange-500/20', lightBorder: 'border-orange-500/30' }
    ];
    
    const getReservedDates = () => {
      if (!propertyReservations || propertyReservations.length === 0) return new Map();
      const reservedDatesMap = new Map();
      
      propertyReservations.forEach((reservation: any, index: number) => {
        const colorIndex = index % reservationColors.length;
        const colors = reservationColors[colorIndex];
        const start = new Date(reservation.startDate);
        const end = new Date(reservation.endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toLocaleDateString('en-CA');
          reservedDatesMap.set(dateStr, {
            ...colors,
            reservationIndex: index,
            customerName: reservation.customerName,
            reservationId: reservation._id
          });
        }
      });
      
      return reservedDatesMap;
    };
    
    const reservedDates = getReservedDates();
    
    return (
      <div className="bg-white/5 rounded-lg p-2 border border-white/20">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            title="الشهر السابق"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-center">
            <h4 className="text-white font-semibold text-sm sm:text-base">{monthNames[month]} {year}</h4>
          </div>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            title="الشهر التالي"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {(currentMonth !== new Date().getMonth() || currentYear !== new Date().getFullYear()) && (
          <div className="text-center mb-2">
            <button
              onClick={goToToday}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              العودة إلى اليوم
            </button>
          </div>
        )}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-xs">
          {dayNames.map(day => (
            <div key={day} className="text-center text-white/60 font-medium py-0.5 sm:py-1 text-xs sm:text-xs">
              {day}
            </div>
          ))}
          {Array.from({ length: startDate }, (_, i) => (
            <div key={`empty-${i}`} className="p-1 sm:p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            const dateStr = date.toLocaleDateString('en-CA');
            const reservationInfo = reservedDates.get(dateStr);
            const isReserved = reservationInfo;
            const isToday = dateStr === new Date().toLocaleDateString('en-CA');
            
            return (
              <div
                key={i + 1}
                className={` text-center rounded text-xs cursor-pointer relative transition-all duration-200 ${
                  isReserved 
                    ? `${reservationInfo.bg} ${reservationInfo.text} border ${reservationInfo.border} hover:opacity-80` 
                    : isToday 
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 hover:bg-blue-500/40'
                      : isDateInHoverRange(date, dateStr)
                        ? 'bg-green-500/50 text-white border-2 border-green-400/80 shadow-md shadow-green-500/25'
                        : isDateInSelection(date)
                          ? 'bg-green-500/60 text-white border-2 border-green-400 shadow-lg shadow-green-500/30 font-semibold'
                        : isDateSelecting(date)
                          ? 'bg-green-500/40 text-white border-2 border-green-400/60 shadow-md shadow-green-500/20'
                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                title={isReserved ? `${reservationInfo.customerName} - حجز #${reservationInfo.reservationIndex + 1} (اضغط للتعديل)` : 
                       isDateInSelection(date) ? 'فترة محددة (اضغط لإكمال التحديد)' :
                       isDateInHoverRange(date, dateStr) ? 'جزء من الفترة المحددة' :
                       isDateSelecting(date) ? 'جاري التحديد (اضغط لإكمال)' :
                       'اضغط لبدء تحديد الفترة'}
                onClick={() => handleDateClick(date, dateStr)}
                onMouseEnter={() => isSelecting && !isReserved && setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {i + 1}
                {isDateSelecting(date) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
                {isDateInSelection(date) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-300 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Selection Status Indicator */}
        {isSelecting && (
          <div className="mt-2 p-2 bg-green-500/20 border border-green-400/40 rounded-lg">
            <p className="text-xs text-green-300 text-center">
              🔍 جاري تحديد الفترة - اضغط على تاريخ الانتهاء
            </p>
          </div>
        )}

        {propertyReservations && propertyReservations.length > 0 && (
          <div className="mt-2 sm:mt-3 space-y-1">
            <p className="text-xs text-white/80 font-medium mb-1">فترات الحجز:</p>
            {propertyReservations.map((reservation: any, index: number) => {
              const colorIndex = index % reservationColors.length;
              const colors = reservationColors[colorIndex];
              return (
                <div 
                  key={reservation._id} 
                  className={`p-1.5 sm:p-2 ${colors.light} rounded border ${colors.lightBorder} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => {
                    const fullReservation = reservations.find((r: any) => r._id === reservation._id);
                    if (fullReservation) {
                      openEditReservationModal(fullReservation);
                    }
                  }}
                  title="اضغط للتعديل"
                >
                  <p className={`text-xs ${colors.text}`}>
                    <span className="font-medium">حجز #{index + 1}:</span> {new Date(reservation.startDate).toLocaleDateString('ar-DZ')} - {new Date(reservation.endDate).toLocaleDateString('ar-DZ')}
                    <span className={`ml-2 ${colors.text}`}>
                      ({reservation.customerName})
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const resetAddReservationForm = () => {
    // Check if selected property is a family property
    const isFamilyProperty = selectedProperty?.targetAudience === 'family';
    
    setFormData({
      customerName: '',
      customerPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalPrice: 0,
      paidAmount: 0,
      remainingAmount: 0,
      paymentStatus: 'pending',
      status: 'pending',
      isMarried: isFamilyProperty || false,
      numberOfPeople: '1',
      identityImages: [],
      notes: [],
      currentNote: ''
    });
    setReservationError(null);
    setEditingReservation(null);
    setPreSelectedDates(null);
  };

  const handleClearAllReservations = async (propertyId: string, propertyTitle: string) => {
    // Count reservations for this property
    const propertyReservations = reservations.filter((r: any) => {
      const reservationPropertyId = typeof r.propertyId === 'string' 
        ? r.propertyId 
        : r.propertyId?._id || r.propertyId.id;
      return reservationPropertyId === propertyId;
    });

    setClearReservationsConfirmation({
      propertyId,
      propertyTitle,
      reservationCount: propertyReservations.length
    });
  };

  const confirmClearAllReservations = async () => {
    const { propertyId } = clearReservationsConfirmation;
    if (!propertyId) return;

    try {
      const token = localStorage.getItem('token');
      
      // Update property to clear reservationIds and set isReserved to false
      const response = await fetch(`https://dmtart.pro/mimorent/api/employer/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservationIds: [],
          isReserved: false,
          available: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Delete all reservations for this property
        const propertyReservations = reservations.filter((r: any) => {
          const reservationPropertyId = typeof r.propertyId === 'string' 
            ? r.propertyId 
            : r.propertyId?._id || r.propertyId.id;
          return reservationPropertyId === propertyId;
        });

        // Delete each reservation
        for (const reservation of propertyReservations) {
          await fetch(`https://dmtart.pro/mimorent/api/employer/reservations/${reservation._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }

        // Show success toast
        addToast('تم إنهاء جميع الحجوزات بنجاح', 'success');
        
        // Refresh data
        await fetchProperties();
        await fetchReservations();
        
        // Close modal
        setClearReservationsConfirmation({ propertyId: null, propertyTitle: null, reservationCount: null });
      } else {
        addToast('فشل إنهاء الحجوزات: ' + (data.message || 'خطأ غير معروف'), 'error');
      }
    } catch (error) {
      console.error('Error clearing reservations:', error);
      addToast('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handlePaidAmountChange = (value: string) => {
    const paidAmount = Number(value) || 0;
    const totalPrice = formData.totalPrice;
    const remainingAmount = Math.max(0, totalPrice - paidAmount);
    
    setFormData(prev => ({
      ...prev,
      paidAmount,
      remainingAmount,
      paymentStatus: remainingAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">{error}</div>
          <button
            onClick={() => {
              setError(null);
              if (user?.wilayaId) {
                const fetchAllData = async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    await Promise.all([
                      fetchProperties(),
                      fetchReservations(),
                      fetchNotifications(),
                      fetchOrders()
                    ]);
                  } catch (error) {
                    console.error('Error fetching data:', error);
                    setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
                  } finally {
                    setLoading(false);
                  }
                };
                fetchAllData();
              }
            }}
            className="px-4 py-2 bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white rounded-lg hover:from-[#45a049] hover:to-[#3d8b40] transition-all cursor-pointer border-2 border-white/60 mr-2"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all cursor-pointer border-2 border-white/60"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  // Show message if user has no wilayaId
  if (!user?.wilayaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">لا يمكن الوصول إلى بيانات الولاية</div>
          <div className="text-white/80 mb-4">يرجى التواصل مع المسؤول لتعيين ولاية لحسابك</div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all cursor-pointer border-2 border-white/60"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73]">
      {/* Background Pattern Overlay */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%)
          `,
          backgroundSize: '100% 100%'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Menu Toggle */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-lg sm:text-xl font-bold text-white hidden sm:block">لوحة تحكم الموظف</h1>
                <h1 className="ml-3 text-lg font-bold text-white sm:hidden">الموظف</h1>
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowProfileModal(true)}
                className="hidden sm:flex items-center space-x-2 sm:space-x-3 hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/15">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium hidden sm:block mx-2 text-sm">{user?.firstName} {user?.lastName}</span>
              </button>
              
              {/* Mobile user avatar */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="sm:hidden w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-200"
              >
                <User className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <button
                  onClick={handleLogout}
                  className="flex items-center px-2 sm:px-3 py-2 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all text-sm cursor-pointer border-2 border-white/60"
                >
                  <LogOut className="w-4 h-4 sm:ml-2" />
                  <span className="hidden sm:inline ml-2">تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm border-b border-white/20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'properties'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <Home className="w-5 h-5 sm:mr-2 mx-2" />
              <span>العقارات</span>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`flex items-center py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'reservations'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <Calendar className="w-5 mx-2 h-5 sm:mr-2" />
              <span>الحجوزات</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                // Mark all notifications as seen when switching to notifications tab
                if (notifications.length > 0) {
                  markAllNotificationsAsSeen();
                }
              }}
              className={`flex items-center py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'notifications'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <Bell className="w-5 mx-2 h-5 sm:mr-2" />
              <span>الإشعارات</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center py-3 sm:py-4 px-3 sm:px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === 'orders'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              <Mail className="w-5 mx-2 h-5 sm:mr-2" />
              <span>الطلبات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'properties' && (
          <div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">العقارات المتاحة</h2>
                  <p className="text-white/80">عرض العقارات في ولايتك فقط</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  تحديث
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const isReservedByReservation = isPropertyReserved(property._id);
                const isDisabled = !property.available;
                return (
                <div key={property._id} className={`bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 transition-all duration-300 ${
                  isDisabled 
                    ? 'opacity-50 grayscale pointer-events-none' 
                    : 'hover:bg-white/15'
                }`}>
                  {/* Property Image */}
                  <div className="relative w-full aspect-[4/2] bg-gray-900 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-600 to-indigo-600">
                        <Home className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    
                    {/* Availability Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        property.available 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {property.available ? 'متاح' : 'غير متاح'}
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{property.title}</h3>
                    <p className="text-white/80 text-sm mb-2">{property.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-300 font-bold">{property.pricePerDay} دج/يوم</span>
                      <span className="text-white/60 text-sm">
                        {property.officeId?.name || 'Unknown Office'}
                      </span>
                    </div>
                    
                    {/* Payment Info for Reserved Properties */}
                    {property.isReserved && (() => {
                      const reservation = reservations.find((r: any) => {
                        // Handle different propertyId formats
                        const reservationPropertyId = typeof r.propertyId === 'string' 
                          ? r.propertyId 
                          : r.propertyId?._id || r.propertyId.id || r.propertyId;
                        return reservationPropertyId === property._id;
                      });
                      
                      const isExpired = reservation && new Date() > new Date(reservation.endDate);
                      
                      return reservation ? (
                        <div className="my-3 p-2 bg-white/10 rounded-lg border border-white/20">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white/80 text-xs">العميل:</span>
                            <span className="text-white font-medium text-xs">{reservation.customerName || 'غير محدد'}</span>
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white/80 text-xs">حالة الحجز:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reservation.status === 'pending' ? 'bg-yellow-500 text-white' :
                              reservation.status === 'confirmed' ? 'bg-blue-500 text-white' :
                              reservation.status === 'completed' ? 'bg-green-500 text-white' :
                              reservation.status === 'cancelled' ? 'bg-red-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {reservation.status === 'pending' ? 'في الانتظار' :
                               reservation.status === 'confirmed' ? 'مؤكد' :
                               reservation.status === 'completed' ? 'مكتمل' :
                               reservation.status === 'cancelled' ? 'ملغي' :
                               reservation.status}
                            </span>
                            {isExpired && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                منتهي الصلاحية
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white/80 text-xs">المبلغ المدفوع:</span>
                            <span className="text-green-400 font-semibold text-sm">
                              {reservation.paidAmount || 0} دج
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/80 text-xs">المبلغ المتبقي:</span>
                            <span className={`font-semibold text-sm ${
                              (reservation.remainingAmount || 0) > 0 ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {reservation.remainingAmount || 0} دج
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    {property.isReserved ? (
                      <div className="mt-3 space-y-2">
                        <button
                          onClick={() => openEditReservationModalForProperty(property)}
                          disabled={isValidatingAction}
                          className="w-full px-3 py-2 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all text-sm cursor-pointer border-2 border-white/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isValidatingAction ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
                              </div>
                              جاري التحقق...
                            </>
                          ) : (
                            'تعديل الحجز الأخير'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            resetAddReservationForm();
                            setShowReservationModal(true);
                          }}
                          className="w-full px-3 py-2 bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white rounded-lg hover:from-[#16a34a] hover:to-[#15803d] transition-all text-sm cursor-pointer border-2 border-white/60"
                        >
                          إضافة حجز آخر
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPropertyForReservationsList(property._id);
                            setShowReservationsListModal(true);
                          }}
                          className="w-full px-3 py-2 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white rounded-lg hover:from-[#7c3aed] hover:to-[#6d28d9] transition-all text-sm cursor-pointer border-2 border-white/60"
                        >
                          عرض الحجوزات الأخرى
                        </button>
                        <button
                          onClick={() => handleClearAllReservations(property._id, property.title)}
                          className="w-full px-3 py-2 bg-gradient-to-br from-[#ef4444] to-[#dc2626] text-white rounded-lg hover:from-[#dc2626] hover:to-[#b91c1c] transition-all text-sm cursor-pointer border-2 border-white/60"
                        >
                          جعل كل الحجوزات مكتملة
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReservationModal(property)}
                        disabled={isValidatingAction || !property.available}
                        className="mt-3 w-full px-4 py-2 bg-gradient-to-br from-[#3daf6d] to-[#2d9f5d] text-white rounded-lg hover:from-[#2d9f5d] hover:to-[#1d8f4d] transition-all cursor-pointer border-2 border-white/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isValidatingAction ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                              <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
                            </div>
                            جاري التحقق...
                          </>
                        ) : (
                          'احجز الآن'
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Expandable Calendar Section */}
                  <div className="mt-4 border-t border-white/20">
                    <button
                      onClick={() => togglePropertyCard(property._id)}
                      className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 text-white/80 text-sm font-medium transition-colors flex items-center justify-between"
                    >
                      <span>عرض التقويم</span>
                      <Calendar className={`w-4 h-4 transition-transform ${expandedPropertyCards.has(property._id) ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {expandedPropertyCards.has(property._id) && (
                      <div className="mt-4 animate-in slide-in-from-top duration-200">
                        <PropertyCalendar propertyId={property._id} />
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {properties.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">لا توجد عقارات متاحة في ولايتك حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
          <div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">حجوزاتي</h2>
                  <p className="text-white/80">إدارة حجوزاتك</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  تحديث
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations
                .filter((reservation) => {
                  // Show only reservations created by current employer
                  const reservationEmployerId = reservation.employerId?._id || reservation.employerId;
                  const currentEmployerId = user?.id;
                  return String(reservationEmployerId) === String(currentEmployerId);
                })
                .map((reservation) => (
                <div key={reservation._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white">{reservation.customerName}</h3>
                    <div className="text-xs text-white/60">
                      بواسطة: {reservation.employerId?.firstName || reservation.employerId?.username || 'غير معروف'}
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-1">هاتف: {reservation.customerPhone}</p>
                  <p className="text-white/80 text-sm mb-1">من: {new Date(reservation.startDate).toLocaleDateString('ar-DZ')}</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/80 text-sm">إلى: {new Date(reservation.endDate).toLocaleDateString('ar-DZ')}</p>
                    {new Date() > new Date(reservation.endDate) && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        منتهي الصلاحية
                      </span>
                    )}
                  </div>
                  
                  {/* Payment Information */}
                  <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm">السعر الإجمالي:</span>
                      <span className="text-white font-semibold">{reservation.totalPrice} دج</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm">المبلغ المدفوع:</span>
                      <span className="text-green-400 font-semibold">{reservation.paidAmount} دج</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm">المبلغ المتبقي:</span>
                      <span className={`font-semibold ${
                        reservation.remainingAmount > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {reservation.remainingAmount} دج
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm">حالة الدفع:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        reservation.paymentStatus === 'paid' 
                          ? 'bg-green-500 text-white' 
                          : reservation.paymentStatus === 'partial'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {reservation.paymentStatus === 'paid' ? 'مدفوع بالكامل' : 
                         reservation.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'معلق'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 text-sm">حالة الحجز:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'pending' ? 'bg-yellow-500 text-white' :
                        reservation.status === 'confirmed' ? 'bg-blue-500 text-white' :
                        reservation.status === 'completed' ? 'bg-green-500 text-white' :
                        reservation.status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {reservation.status === 'pending' ? 'في الانتظار' :
                         reservation.status === 'confirmed' ? 'مؤكد' :
                         reservation.status === 'completed' ? 'مكتمل' :
                         reservation.status === 'cancelled' ? 'ملغي' :
                         reservation.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">لا توجد حجوزات حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">الإشعارات</h2>
                  <p className="text-white/80">عرض جميع الإشعارات الخاصة بعقارات مكتبك</p>
                </div>
                <button
                  onClick={() => {
                    // Mark all notifications as seen when refreshing
                    if (notifications.length > 0) {
                      markAllNotificationsAsSeen();
                    }
                    window.location.reload();
                  }}
                  className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  تحديث
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notifications.map((notification) => (
                <div key={notification._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notification.read ? 'bg-gray-500/20 text-gray-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {notification.read ? 'مقروء' : 'جديد'}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{new Date(notification.createdAt).toLocaleDateString('ar-DZ')}</span>
                    <span>{new Date(notification.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">الطلبات</h2>
                <button
                  onClick={fetchOrders}
              className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-2 border-white/60"
          >              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />                
                  تحديث
                </button>
              </div>

              {orderError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {orderError}
                </div>
              )}

              {orders.length === 0 ? (
                <div className="text-center py-8 text-white">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">لا توجد طلبات حجز حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                      {/* Compact Summary Row - Always Visible */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-white/5 transition-colors overflow-x-auto"
                        onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
                      >
                        <div className="flex items-center justify-between min-w-max lg:min-w-0">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white">{order.fullname || order.customerName}</h3>
                              <p className="text-white/70 text-sm">{order.phoneNumber || order.customerPhone}</p>
                            </div>
                            <div className="text-sm text-white/60">
                              <span className="font-medium">العقار:</span> {order.propertyId?.title || order.propertyTitle || 'N/A'}
                            </div>
                            {order.startDate && (
                              <div className="text-sm text-white/60">
                                <span className="font-medium">من:</span> {new Date(order.startDate).toLocaleDateString('ar-DZ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                              order.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                              order.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                              order.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {order.status === 'pending' ? 'في الانتظار' :
                               order.status === 'processing' ? 'قيد المعالجة' :
                               order.status === 'approved' ? 'موافق عليه' :
                               order.status === 'rejected' ? 'مرفوض' :
                               order.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.orderType === 'reserver_property' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-purple-500/20 text-purple-300'
                            }`}>
                              {order.orderType === 'reserver_property' ? 'عقار محجوز' : 'عقار غير محجوز'}
                            </span>
                            <ChevronDown 
                              className={`w-5 h-5 text-white/60 transition-transform duration-200 ${
                                selectedOrder?._id === order._id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details - Always Rendered, Animation Controlled by Classes */}
                      <div 
                        className={`border-t border-white/20 bg-gradient-to-b from-white/5 to-transparent transition-all duration-300 ease-in-out origin-top ${
                          selectedOrder?._id === order._id 
                            ? 'opacity-100 scale-y-100' 
                            : 'opacity-0 scale-y-0'
                        }`}
                        style={{
                          maxHeight: selectedOrder?._id === order._id ? '' : '0px',
                          overflow: 'hidden'
                        }}
                      >
                        <div className="p-4 overflow-y-auto lg:overflow-visible">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left Column - Property and Dates */}
                            <div className="space-y-4">
                              {/* Property Information */}
                              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-white/20">
                                <h4 className="text-sm font-medium text-white/80 mb-2">معلومات العقار</h4>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-white/60">العقار:</span>
                                    <span className="text-white font-medium">{order.propertyId?.title || order.propertyTitle || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/60">الولاية:</span>
                                    <span className="text-white font-medium">{order.wilayaId?.name || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Reservation Dates */}
                              {order.startDate && order.endDate && (
                                <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-lg p-3 border border-white/20">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">تواريخ الحجز</h4>
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="text-center">
                                      <div className="text-white/60 text-xs">من</div>
                                      <div className="text-white font-medium">{new Date(order.startDate).toLocaleDateString('ar-DZ')}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-white/60 text-xs">إلى</div>
                                      <div className="text-white font-medium">{new Date(order.endDate).toLocaleDateString('ar-DZ')}</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-white/60 text-xs">المدة</div>
                                      <div className="text-white font-medium">{Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24))} أيام</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Column - Priority and Notes */}
                            <div className="space-y-4">
                              {/* Priority */}
                              <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-white/20">
                                <h4 className="text-sm font-medium text-white/80 mb-2">الأولوية والتحكم</h4>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm font-medium text-white/80">الأولوية:</span>
                                  {editingOrder === order._id ? (
                                    <select
                                      value={editPriority}
                                      onChange={(e) => setEditPriority(e.target.value)}
                                      className="px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="low" className="text-gray-800">منخفضة</option>
                                      <option value="medium" className="text-gray-800">متوسطة</option>
                                      <option value="high" className="text-gray-800">عالية</option>
                                    </select>
                                  ) : (
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      order.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                      order.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                      'bg-green-500/20 text-green-300'
                                    }`}>
                                      {order.priority === 'high' ? 'عالية' :
                                       order.priority === 'medium' ? 'متوسطة' :
                                       'منخفضة'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Notes */}
                              {order.notes && (
                                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                                  <div className="text-sm">
                                    <span className="font-medium text-white/80">ملاحظات العميل:</span>
                                    <p className="text-white/70 mt-1">{order.notes}</p>
                                  </div>
                                </div>
                              )}

                              {/* New Order Fields */}
                              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-white/20">
                                <h4 className="text-sm font-medium text-white/80 mb-2">معلومات إضافية</h4>
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-white/60">الحالة الاجتماعية:</span>
                                    <span className="text-white font-medium">
                                      {order.isMarried ? 'متزوج' : 'أعزب'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/60">عدد الأشخاص:</span>
                                    <span className="text-white font-medium">{order.numberOfPeople || '1'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-white/60">السعر الإجمالي:</span>
                                    <span className="text-white font-medium">{order.totalPrice || '0'} دج</span>
                                  </div>
                                </div>
                              </div>

                              {/* Identity Images */}
                              {order.identityImages && order.identityImages.length > 0 && (
                                <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-lg p-3 border border-white/20">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">صور الهوية</h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {order.identityImages.map((image: string, index: number) => (
                                      <div key={index} className="relative group">
                                        <img
                                          src={image}
                                          alt={`Identity ${index + 1}`}
                                          className="w-full h-16 object-cover rounded border border-white/20 cursor-pointer hover:scale-105 transition-transform"
                                          onClick={() => {
                                            // Open image in new tab
                                            window.open(image, '_blank');
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                          <span className="text-white text-xs">فتح</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes - Read Only */}
                              {order.adminNotes && (
                                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                                  <div className="text-sm">
                                    <span className="font-medium text-white/80">ملاحظات الإدارة:</span>
                                    <p className="text-white/70 mt-1">{order.adminNotes}</p>
                                  </div>
                                </div>
                              )}

                              {/* Employer Notes Section */}
                              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                                <div className="text-sm">
                                  <span className="font-medium text-white/80">ملاحظات الموظف:</span>
                                  
                                  {/* Display existing employer notes */}
                                  {order.employerNotes && order.employerNotes.length > 0 ? (
                                    <div className="mt-2 space-y-2">
                                      {order.employerNotes
                                        .filter((note: any) => {
                                          // Filter notes to show only current employer's notes
                                          const noteEmployerId = note.employerId?._id || note.employerId;
                                          const currentEmployerId = user?.id;
                                  
                                          return String(noteEmployerId) === String(currentEmployerId);
                                        })
                                        .map((note: any, index: number) => (
                                          <div key={index} className="bg-white/5 rounded p-2 border border-white/10">
                                            <p className="text-white/70 text-sm">{note.message}</p>
                                            <p className="text-white/50 text-xs mt-1">
                                              {new Date(note.createdAt).toLocaleDateString('ar-DZ')} {new Date(note.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                          </div>
                                        ))}
                                      {order.employerNotes.filter((note: any) => {
                                        const noteEmployerId = note.employerId?._id || note.employerId;
                                        const currentEmployerId = user?.id;
                                        return String(noteEmployerId) === String(currentEmployerId);
                                      }).length === 0 && (
                                        <p className="text-white/50 text-sm italic">لا توجد ملاحظات من هذا الموظف</p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="mt-2">
                                      <p className="text-white/50 text-sm italic">لا توجد ملاحظات بعد</p>
                                    </div>
                                  )}
                                  
                                  {/* Add new employer note */}
                                  <div className="mt-3">
                                    <textarea
                                      value={employerNote}
                                      onChange={(e) => setEmployerNote(e.target.value)}
                                      className="w-full mt-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                      rows={2}
                                      placeholder="أضف ملاحظة..."
                                    />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddEmployerNote(order._id);
                                      }}
                                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                      إضافة ملاحظة
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
                            {order.status === 'approved' && 
                             order.propertyId && 
                             !order.propertyId.isReserved && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookNow(order);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                الحجز في الحين
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Reservation Modal */}
      {showReservationModal && selectedProperty && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 sm:p-6 "
          onClick={() => {
            setShowReservationModal(false);
            setCurrentBookingOrder(null);
            setPreSelectedDates(null);
            setReservationError(null);
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-5xl lg:max-w-4xl md:max-w-3xl sm:max-w-full mx-4 relative z-[100000] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 p-6 border-b border-gray-100/20 rounded-t-2xl overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl"></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">
                    {editingReservation ? 'تعديل الحجز' : 'إضافة حجز جديد'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowReservationModal(false);
                      setCurrentBookingOrder(null);
                      setPreSelectedDates(null);
                      setEditingReservation(null);
                      setReservationError(null);
                    }}
                    className="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Property Details */}
                {(() => {
                  // For editing, get property from reservation; for adding, use selectedProperty
                  let property;
                  
                  if (editingReservation) {
                    // Editing mode: get property from reservation
                    const propertyId = typeof editingReservation.propertyId === 'string' 
                      ? editingReservation.propertyId 
                      : editingReservation.propertyId?._id || (editingReservation.propertyId as any)?.id || '';
                    property = properties.find((p: any) => p._id === propertyId);
                  } else {
                    // Adding mode: use selectedProperty
                    property = selectedProperty;
                  }
                  
                  if (!property) return null;
                  
                  return (
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <h4 className="text-lg font-semibold text-white mb-3">{property.title}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-white/90">{property.location || property.wilayaId?.name || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="text-white/90">{property.propertyType === 'home' ? 'منزل' : property.propertyType === 'villa' ? 'فيلا' : property.propertyType === 'shop' ? 'متجر' : 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-white/90">{property.reserveTheProperty === 'daily' ? 'يومي' : property.reserveTheProperty === 'monthly' ? 'شهري' : 'يومي'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-white/90">{property.pricePerDay} دج/{property.reserveTheProperty === 'monthly' ? 'شهر' : 'يوم'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-white/90">
                            {property.targetAudience === 'family' ? 'عائلات' : property.targetAudience === 'normal' ? 'أفراد' : property.targetAudience === 'both' ? 'الجميع' : 'الجميع'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
            
            <form onSubmit={handleReservationSubmit} className="space-y-4">
              {/* Property Info (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  {selectedProperty.title}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل اسم العميل"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">هاتف العميل</label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      const property = properties.find((p: any) => p._id === selectedProperty._id);
                      
                      // Auto-calculate end date for monthly properties
                      if (property && property.reserveTheProperty === 'monthly' && startDate) {
                        const endDate = calculateMonthlyEndDate(startDate, 1);
                        const calculatedPrice = calculateReservationPrice(startDate, endDate, selectedProperty._id);
                        setFormData(prev => ({
                          ...prev,
                          startDate,
                          endDate,
                          totalPrice: calculatedPrice,
                          remainingAmount: Math.max(0, calculatedPrice - prev.paidAmount)
                        }));
                        
                        // Generate suggestion if editing and original dates exist
                        if (editingReservation && originalDates) {
                          const suggestion = generateDateChangeSuggestion(
                            originalDates.startDate,
                            originalDates.endDate,
                            startDate,
                            endDate
                          );
                          setDateChangeSuggestion(suggestion);
                        }
                      } else if (startDate && formData.endDate) {
                        // For daily properties, calculate if end date is already set
                        const calculatedPrice = calculateReservationPrice(startDate, formData.endDate, selectedProperty._id);
                        setFormData(prev => ({
                          ...prev,
                          startDate,
                          totalPrice: calculatedPrice,
                          remainingAmount: Math.max(0, calculatedPrice - prev.paidAmount)
                        }));
                        
                        // Generate suggestion if editing and original dates exist
                        if (editingReservation && originalDates) {
                          const suggestion = generateDateChangeSuggestion(
                            originalDates.startDate,
                            originalDates.endDate,
                            startDate,
                            formData.endDate
                          );
                          setDateChangeSuggestion(suggestion);
                        }
                      } else {
                        setFormData(prev => ({ ...prev, startDate }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => {
                      const endDate = e.target.value;
                      const startDate = formData.startDate;
                      
                      // Always update the endDate in state so UI reflects user input
                      setFormData(prev => ({ ...prev, endDate }));
                      
                      if (startDate && endDate) {
                        const validation = validateMonthlyReservation(new Date(startDate), new Date(endDate), selectedProperty._id);
                        if (!validation.isValid) {
                          setReservationError(validation.message || 'فترة الحجز غير صحيحة للحجوزات الشهرية');
                        } else {
                          setReservationError(null);
                          // Auto-calculate total price
                          const calculatedPrice = calculateReservationPrice(startDate, endDate, selectedProperty._id);
                          setFormData(prev => ({
                            ...prev,
                            totalPrice: calculatedPrice,
                            remainingAmount: Math.max(0, calculatedPrice - prev.paidAmount)
                          }));
                          
                          // Generate suggestion if editing and original dates exist
                          if (editingReservation && originalDates) {
                            const suggestion = generateDateChangeSuggestion(
                              originalDates.startDate,
                              originalDates.endDate,
                              startDate,
                              endDate
                            );
                            setDateChangeSuggestion(suggestion);
                          }
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Error Message */}
              {reservationError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="text-sm font-medium mb-1">خطأ:</p>
                  <pre className="text-xs whitespace-pre-line font-mono">
                    {reservationError}
                  </pre>
                </div>
              )}

              {/* Smart Suggestion */}
              {dateChangeSuggestion && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-amber-800 font-medium mb-2">💡 اقتراح ذكي:</p>
                      <p className="text-sm text-amber-700">{dateChangeSuggestion}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (dateChangeSuggestion) {
                          setFormData(prev => ({
                            ...prev,
                            notes: [...prev.notes, dateChangeSuggestion]
                          }));
                          setDateChangeSuggestion(null);
                        }
                      }}
                      className="mr-3 px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600 transition-colors"
                    >
                      تطبيق
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (دج)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalPrice}
                  onChange={(e) => {
                    const totalPrice = Number(e.target.value);
                    const paidAmount = formData.paidAmount;
                    
                    // Validate that paid amount doesn't exceed total price
                    if (paidAmount > totalPrice && totalPrice > 0) {
                      setReservationError('المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي');
                      return;
                    } else {
                      setReservationError(null);
                    }
                    
                    const remainingAmount = Math.max(0, totalPrice - paidAmount);
                    
                    // Auto-calculate payment status
                    let paymentStatus: 'pending' | 'partial' | 'paid';
                    if (paidAmount === 0) {
                      paymentStatus = 'pending';
                    } else if (paidAmount >= totalPrice) {
                      paymentStatus = 'paid';
                    } else {
                      paymentStatus = 'partial';
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      totalPrice,
                      remainingAmount,
                      paymentStatus
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل السعر الإجمالي"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع (دج)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.paidAmount}
                    onChange={(e) => {
                      const paidAmount = Number(e.target.value);
                      const totalPrice = formData.totalPrice;
                      
                      // Validate that paid amount doesn't exceed total price
                      if (paidAmount > totalPrice && totalPrice > 0) {
                        setReservationError('المبلغ المدفوع لا يمكن أن يكون أكبر من السعر الإجمالي');
                        return;
                      } else {
                        setReservationError(null);
                      }
                      
                      const remainingAmount = Math.max(0, totalPrice - paidAmount);
                      
                      // Auto-calculate payment status
                      let paymentStatus: 'pending' | 'partial' | 'paid';
                      if (paidAmount === 0) {
                        paymentStatus = 'pending';
                      } else if (paidAmount >= totalPrice) {
                        paymentStatus = 'paid';
                      } else {
                        paymentStatus = 'partial';
                      }
                      
                      setFormData(prev => ({
                        ...prev,
                        paidAmount,
                        remainingAmount,
                        paymentStatus
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="المبلغ المدفوع"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المتبقي (دج)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.remainingAmount}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                    placeholder="المبلغ المتبقي"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                <select
                  required
                  value={formData.paymentStatus}
                  onChange={(e) => {
                    const newPaymentStatus = e.target.value;
                    let updatedFormData = { ...formData, paymentStatus: newPaymentStatus as any };
                    
                    // If paid in full, set paid amount to equal total price
                    if (newPaymentStatus === 'paid') {
                      updatedFormData.paidAmount = formData.totalPrice;
                      updatedFormData.remainingAmount = 0;
                    }
                    
                    setFormData(updatedFormData);
                  }}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                  style={{ cursor: 'not-allowed' }}
                  disabled
                >
                  <option value="pending">معلق</option>
                  <option value="partial">مدفوع جزئياً</option>
                  <option value="paid">مدفوع بالكامل</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">يتم تحديد الحالة تلقائياً بناءً على المبلغ المدفوع</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة الحجز</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">معلق</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="cancelled">ملغي</option>
                  <option value="completed">مكتمل</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العائلية</label>
                {(() => {
                  const property = properties.find((p: any) => p._id === selectedProperty._id);
                  const isFamilyProperty = property?.targetAudience === 'family';
                  
                  if (isFamilyProperty) {
                    // Auto-set to married for family properties
                    return (
                      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                        متزوج (تلقائي للعقارات العائلية)
                      </div>
                    );
                  }
                  
                  return (
                    <select
                      required
                      value={formData.isMarried.toString()}
                      onChange={(e) => {
                        const isMarried = e.target.value === 'true';
                        setFormData(prev => ({
                          ...prev,
                          isMarried
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">أعزب</option>
                      <option value="true">متزوج</option>
                    </select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأشخاص</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.numberOfPeople}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      numberOfPeople: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عدد الأشخاص"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.isMarried ? 'يرجى رفع صور الدفتر العائلي' : 'يرجى رفع صور بطاقة التعريف'}
                </label>
                <ImageUpload
                  images={formData.identityImages}
                  onImagesChange={(images) => setFormData(prev => ({ ...prev, identityImages: images }))}
                  error={error}
                  onError={setError}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.notes.map((note, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {note}
                        <button
                          type="button"
                          onClick={() => {
                            const newNotes = formData.notes.filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              notes: newNotes
                            }));
                          }}
                          className="mr-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <input
                      type="text"
                      value={formData.currentNote || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          currentNote: e.target.value
                        }));
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && formData.currentNote?.trim()) {
                          e.preventDefault();
                          setFormData(prev => ({
                            ...prev,
                            notes: [...prev.notes, prev.currentNote!.trim()],
                            currentNote: ''
                          }));
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أضف ملاحظة واضغط Enter"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentNote?.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            notes: [...prev.notes, prev.currentNote!.trim()],
                            currentNote: ''
                          }));
                        }
                      }}
                      className="px-4 mx-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      إضافة
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReservationModal(false);
                    setCurrentBookingOrder(null);
                    setPreSelectedDates(null);
                    setReservationError(null);
                  }}
                  className="flex-1 px-4 py-2 mx-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => setShowContractModal(true)}
                  className="flex-1 px-4 py-2 mx-2  bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  إنشاء عقد
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReservation}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
                    isSubmittingReservation ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmittingReservation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                        <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
                      </div>
                      {editingReservation ? 'جارٍ التحديث...' : 'جارٍ الإضافة...'}
                    </>
                  ) : (
                    <>
                      {editingReservation ? 'تحديث الحجز' : 'إضافة الحجز'}
                    </>
                  )}
                </button>
              </div>
              
              {/* Duplicate Error Display Before Submit */}
              {reservationError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <p className="text-sm font-medium mb-1">خطأ:</p>
                  <pre className="text-xs whitespace-pre-line font-mono">
                    {reservationError}
                  </pre>
                </div>
              )}
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Contract Modal */}
      {showContractModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 "
          onClick={() => setShowContractModal(false)}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-4xl relative z-[100000] max-h-[90vh] overflow-y-auto"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">عقد كراء مسكن</h3>
              <button
                onClick={() => setShowContractModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-right" dir="rtl">
              {/* Contract Title */}
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">عقد كراء مسكن "{contractData.propertyName}"</h4>
                <p className="text-gray-600">ما بين الموقعين أسفله:</p>
              </div>

              {/* First Party - Owner */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الطرف الأول: المرقي العقاري السيد:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={contractData.ownerName}
                      onChange={(e) => setContractData({...contractData, ownerName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل اسم المالك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={contractData.ownerBirthDate}
                      onChange={(e) => setContractData({...contractData, ownerBirthDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم بطاقة التعريف</label>
                    <input
                      type="text"
                      value={contractData.ownerCinNumber}
                      onChange={(e) => setContractData({...contractData, ownerCinNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل رقم البطاقة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ إصدار البطاقة</label>
                    <input
                      type="date"
                      value={contractData.ownerCinDate}
                      onChange={(e) => setContractData({...contractData, ownerCinDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الإصدار</label>
                    <input
                      type="text"
                      value={contractData.ownerCinLocation}
                      onChange={(e) => setContractData({...contractData, ownerCinLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="دائرة/بلدية"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={contractData.ownerAddress}
                      onChange={(e) => setContractData({...contractData, ownerAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="العنوان الكامل"
                    />
                  </div>
                </div>
                <p className="mt-3 text-gray-700">من جهة كمالك.</p>
              </div>

              {/* Second Party - Tenant */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الطرف الثاني: السيد(ة):</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      value={contractData.tenantName}
                      onChange={(e) => setContractData({...contractData, tenantName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل اسم المستأجر"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الميلاد</label>
                    <input
                      type="text"
                      value={contractData.tenantBirthPlace}
                      onChange={(e) => setContractData({...contractData, tenantBirthPlace: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مكان الميلاد"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={contractData.tenantBirthDate}
                      onChange={(e) => setContractData({...contractData, tenantBirthDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم بطاقة التعريف</label>
                    <input
                      type="text"
                      value={contractData.tenantCinNumber}
                      onChange={(e) => setContractData({...contractData, tenantCinNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل رقم البطاقة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإصدار</label>
                    <input
                      type="date"
                      value={contractData.tenantCinDate}
                      onChange={(e) => setContractData({...contractData, tenantCinDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان الإصدار</label>
                    <input
                      type="text"
                      value={contractData.tenantCinLocation}
                      onChange={(e) => setContractData({...contractData, tenantCinLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ولاية"
                    />
                  </div>
                </div>
                <p className="mt-3 text-gray-700">من جهة أخرى كمستأجر.</p>
              </div>

              {/* Agreement */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3 text-center">وقع الوفاق والتراضي بين الطرفين على ما يلي:</h5>
              </div>

              {/* Article 1 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 1: تعيين المسكن موضوع الكراء</h5>
                <p className="text-gray-700 mb-3">تحت جميع الضمانات الفعلية والقانونية، أستأجر بصفتي الطرف الأول بمقتضى هذا العقد للطرف الثاني السكن الإيجاري "{contractData.propertyName}" والكائن بشارع:</p>
                <input
                  type="text"
                  value={contractData.propertyAddress}
                  onChange={(e) => setContractData({...contractData, propertyAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان العقار"
                />
              </div>

              {/* Article 2 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 2: المعاينة</h5>
                <p className="text-gray-700">لقد تم تفحص ومعاينة المسكن الإيجاري من طرف المستأجر قبل المكوث فيه، حيث تأكد من جاهزيته التامة والكاملة بتوفر جميع مستلزمات العيش من كهرباء، غاز، ماء، حنفيات، مصابيح، وهاتف ، كما هو موضح في وثيقة محضر المعاينة.</p>
              </div>

              {/* Article 3 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 3: مبلغ الضمان</h5>
                <p className="text-gray-700 mb-3">يجب على المستأجر أن يدفع مسبقاً مبلغاً مالياً كضمان يقدر بـ:</p>
                <input
                  type="text"
                  value={contractData.guaranteeAmount}
                  onChange={(e) => setContractData({...contractData, guaranteeAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مبلغ الضمان (دج)"
                />
                <p className="text-gray-700 mt-3">ويسترجع عند مغادرته، وهذا مقابل عدم إلحاق أضرار بتجهيزات المبنى ودفع كل المستحقات الشهرية للإيجار.</p>
              </div>

              {/* Article 4 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 4: الالتزامات وشروط العقد</h5>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>يستلزم على المستأجر أن يحافظ على المسكن وكذا إرجاعه إلى حالته التي وجد عليها بعد انتهاء مفعول هذا العقد.</li>
                  <li>يستلزم على المستأجر الحفاظ على نظافة المسكن وعدم طلاء الجدران وترميمه إلا للضرورة القصوى، وهذا باستشارة المالك أولاً قبل البدء في عملية الترميم.</li>
                  <li>يتعهد المستأجر بالقيام بأشغال الإصلاح التي تقتضيها الضرورة في صيانة المسكن موضوع الكراء دون قيد أو شرط.</li>
                  <li>يستلزم على المستأجر دفع مستحقات الكهرباء دون تأخير حسب نظام الاستهلاك.</li>
                  <li>يسلم المستأجر للمالك المفاتيح وذلك بإرجاعهما على حالتهما الطبيعية عند انتهاء العقد.</li>
                  <li>يجب على المستأجر احترام الجيران وعدم إزعاجهم وأعوان الأمن، وأن يتقيد بالتعليمات الموجهة له الخاصة بالمرآب وساحة لعب الأطفال.</li>
                  <li>يمنع منعاً باتاً على المستأجر أن يسلم لمستأجر آخر مفاتيح المسكن دون علم المالك بذلك.</li>
                </ul>
              </div>

              {/* Article 5 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 5: ثمن الكراء</h5>
                <p className="text-gray-700 mb-3">اتفق الطرفان على تحديد ثمن كراء المسكن بمبلغ:</p>
                <input
                  type="text"
                  value={contractData.monthlyRent}
                  onChange={(e) => setContractData({...contractData, monthlyRent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="السعر الشهري (دج)"
                />
                <p className="text-gray-700 mt-3">للشهر الواحد، وتدفع لثلاثة أشهر (الطريقة الثلاثية). وفي حالة عدم احترام المستأجر للشروط المتفق عليها سابقاً أو تأخره عن أداء مستحقات الكراء في أجلها المحدد، فإن للمالك حق توجيه إنذار يمهله فيه 03 أيام قبل أن يمارس إجراءات فسخ هذا العقد بقوة القانون.</p>
              </div>

              {/* Article 6 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 6: ما يترتب على المستأجر حال خروجه</h5>
                <p className="text-gray-700">في حالة إرادة المستأجر إخلاء المسكن قبل نهاية العقد أو قبل موعد تجديد الدفع، يجب عليه أن يعلم المالك قبل الإخلاء بـ 15 يوماً (خمسة عشر يوماً)، وإلا ستحتسب مدة فراغ المسكن على عاتق المستأجر.</p>
              </div>

              {/* Article 7 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-bold text-lg mb-3">الفصل 7: نهاية العقد والأحكام القضائية</h5>
                <p className="text-gray-700">في حالة الإخلال بأحد الشروط المذكورة أعلاه، يفسخ العقد تلقائياً وتنتهي صلاحيته. وكذا في حالة عدم امتثال أحد الطرفين للشروط المنصوص عليها وتعمد الإخلال بها، يلجأ مباشرة إلى العدالة القضائية لدى محكمة المشرية للفصل الشرعي والقانوني للقضية.</p>
              </div>

              {/* Contract Location and Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">حرر بـ:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">مكان تحرير العقد</label>
                    <input
                      type="text"
                      value={contractData.contractLocation}
                      onChange={(e) => setContractData({...contractData, contractLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="المكان"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ تحرير العقد</label>
                    <input
                      type="date"
                      value={contractData.contractDate}
                      onChange={(e) => setContractData({...contractData, contractDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="font-bold mb-4">إمضاء المالك</p>
                    <div className="border-b-2 border-gray-400 pb-8"></div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold mb-4">إمضاء المستأجر</p>
                    <div className="border-b-2 border-gray-400 pb-8"></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="flex-1 px-4   py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Here you can add print functionality or save contract
                    window.print();
                  }}
                  className="flex-1 px-4  py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  طباعة العقد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservations List Modal */}
      {showReservationsListModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
          onClick={() => setShowReservationsListModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">جميع حجوزات العقار</h3>
              <button
                onClick={() => setShowReservationsListModal(false)}
                className="text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(() => {
                // Find the property and use its reservationIds array (same as calendar)
                const property = properties.find((p: any) => p._id === selectedPropertyForReservationsList);
                const propertyReservations = property?.reservationIds || [];

                if (propertyReservations.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">لا توجد حجوزات لهذا العقار</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {propertyReservations.map((reservation: any, index: number) => (
                      <div key={reservation._id} className="bg-white/5 rounded-lg p-4 border border-white/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                                حجز #{index + 1}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                reservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                reservation.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' :
                                reservation.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                reservation.status === 'cancelled' ? 'bg-red-500/20 text-red-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {reservation.status === 'pending' ? 'في الانتظار' :
                                 reservation.status === 'confirmed' ? 'مؤكد' :
                                 reservation.status === 'completed' ? 'مكتمل' :
                                 reservation.status === 'cancelled' ? 'ملغي' :
                                 reservation.status}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-white/60">العميل:</span>
                                <span className="text-white mr-2">{reservation.customerName}</span>
                              </div>
                              <div>
                                <span className="text-white/60">الهاتف:</span>
                                <span className="text-white mr-2">{reservation.customerPhone}</span>
                              </div>
                              <div>
                                <span className="text-white/60">من:</span>
                                <span className="text-white mr-2">{new Date(reservation.startDate).toLocaleDateString('ar-DZ')}</span>
                              </div>
                              <div>
                                <span className="text-white/60">إلى:</span>
                                <span className="text-white mr-2">{new Date(reservation.endDate).toLocaleDateString('ar-DZ')}</span>
                              </div>
                              <div>
                                <span className="text-white/60">السعر الإجمالي:</span>
                                <span className="text-white mr-2">{reservation.totalPrice} دج</span>
                              </div>
                              <div>
                                <span className="text-white/60">المبلغ المدفوع:</span>
                                <span className="text-white mr-2">{reservation.paidAmount} دج</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => {
                                const property = properties.find((p: any) => p._id === selectedPropertyForReservationsList);
                                if (property) {
                                  setSelectedProperty(property);
                                  setEditingReservation(reservation);
                                  setShowReservationModal(true);
                                  setShowReservationsListModal(false);
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              تعديل الحجز
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowReservationsListModal(false)}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Clear Reservations Confirmation Modal */}
      {clearReservationsConfirmation.propertyId && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setClearReservationsConfirmation({ propertyId: null, propertyTitle: null, reservationCount: null })}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md relative z-[100000]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              تأكيد إنهاء جميع الحجوزات
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                هل أنت متأكد من إنهاء جميع حجوزات العقار التالي؟
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{clearReservationsConfirmation.propertyTitle}</p>
                <p className="text-sm text-gray-600">
                  عدد الحجوزات: {clearReservationsConfirmation.reservationCount}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={confirmClearAllReservations}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                نعم، إنهاء جميع الحجوزات
              </button>
              <button
                onClick={() => setClearReservationsConfirmation({ propertyId: null, propertyTitle: null, reservationCount: null })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Employee Profile Modal */}
      {user && (
        <EmployeeProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          employeeUser={user}
        />
      )}
    </div>
  );
}
