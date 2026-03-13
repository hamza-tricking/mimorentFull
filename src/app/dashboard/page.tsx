'use client';

import React, { useState, useEffect } from 'react';
import { Home, Calendar, User, LogOut,  Mail, Bell, ChevronDown, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../contexts/ToastContext';
import NotificationDropdown from '../../components/employer/NotificationDropdown';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmployeeProfileModal from '../../components/employer/EmployeeProfileModal';

interface Property {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  images: string[];
  available: boolean;
  isReserved: boolean;
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
  propertyId: string;
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
  
  // Make property available confirmation modal state
  const [makeAvailableConfirmation, setMakeAvailableConfirmation] = useState<{
    propertyId: string | null;
    propertyTitle: string | null;
    reservation: any | null;
  }>({ propertyId: null, propertyTitle: null, reservation: null });
  
  // Action loading states
  const [isMakingAvailable, setIsMakingAvailable] = useState(false);
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
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed'
  });

  // Get user data from localStorage
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

  // Validation functions
  const validatePropertyAction = async (propertyId: string, action: 'reserve' | 'edit' | 'makeAvailable') => {
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
        
        case 'makeAvailable':
          if (!currentProperty.isReserved) {
            addToast('العقار متاح بالفعل', 'error');
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
        // Check if data is nested like orders
        const reservationsArray = Array.isArray(data?.data?.reservations) ? data.data.reservations : 
                                Array.isArray(data?.reservations) ? data.reservations : [];
        
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
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/orders-reservation/employer', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure we always set an array - data is nested: data.data.data
        const ordersArray = Array.isArray(data?.data?.data) ? data.data.data : [];
        setOrders(ordersArray);
      } else {
        console.error('Failed to fetch orders:', response.statusText);
        setOrders([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
        status: 'confirmed' as 'pending' | 'confirmed' | 'cancelled' | 'completed' // Set to confirmed since this is from an approved order
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

  const openEditReservationModal = async (property: Property) => {
    // Validate property has an active reservation to edit
    const isValid = await validatePropertyAction(property._id, 'edit');
    if (!isValid) return;

    // After validation and refresh, check the property state again
    const updatedProperty = properties.find(p => p._id === property._id);
    
    // Double-check if property is still reserved after refresh
    if (!updatedProperty || !updatedProperty.isReserved) {
      addToast('لا يوجد حجز نشط لهذا العقار', 'info');
      return;
    }

    const reservation = reservations.find((r: any) => {
      const reservationPropertyId = typeof r.propertyId === 'string' 
        ? r.propertyId 
        : r.propertyId?._id || r.propertyId.id;
      return reservationPropertyId === property._id;
    });
    
    if (reservation) {
      // Open edit modal with reservation data
      setSelectedProperty(property);
      setFormData({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        startDate: new Date(reservation.startDate).toISOString().split('T')[0],
        endDate: new Date(reservation.endDate).toISOString().split('T')[0],
        totalPrice: reservation.totalPrice,
        paidAmount: reservation.paidAmount,
        remainingAmount: reservation.remainingAmount || 0,
        paymentStatus: reservation.paymentStatus,
        status: reservation.status || 'pending'
      });
      setEditingReservation(reservation);
      setShowReservationModal(true);
    } else {
      addToast('لم يتم العثور على الحجز', 'error');
    }
  };

  const openReservationModal = async (property: Property) => {
    // Validate property can be reserved
    const isValid = await validatePropertyAction(property._id, 'reserve');
    if (!isValid) return;

    setSelectedProperty(property);
    setEditingReservation(null); // Clear any existing editing reservation
    setFormData({
      customerName: '',
      customerPhone: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totalPrice: 0,
      paidAmount: 0,
      remainingAmount: 0,
      paymentStatus: 'pending',
      status: 'pending'
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

    try {
      const token = localStorage.getItem('token');
      const reservationData = {
        propertyId: selectedProperty?._id,
        ...(editingReservation ? {} : { employerId: user?.id }), // Only set employerId for new reservations
        ...formData,
        remainingAmount: formData.totalPrice - formData.paidAmount,
        ...(currentBookingOrder && { orderReservationId: currentBookingOrder._id }) // Add order reference if booking from order
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleMakePropertyAvailable = async (propertyId: string, propertyTitle: string) => {
    // Validate property can be made available
    const isValid = await validatePropertyAction(propertyId, 'makeAvailable');
    if (!isValid) return;

    // After validation and refresh, check the property state again
    const updatedProperty = properties.find(p => p._id === propertyId);
    
    // Double-check if property is still reserved after refresh
    if (!updatedProperty || !updatedProperty.isReserved) {
      addToast('العقار متاح بالفعل', 'info');
      return;
    }

    // Find the active reservation for this property
    const activeReservation = reservations.find((r: any) => {
      const reservationPropertyId = typeof r.propertyId === 'string' 
        ? r.propertyId 
        : r.propertyId?._id || r.propertyId.id;
      return reservationPropertyId === propertyId && 
             ['pending', 'confirmed', 'approved'].includes(r.status);
    });
    
    // Show confirmation modal with reservation details
    setMakeAvailableConfirmation({
      propertyId,
      propertyTitle,
      reservation: activeReservation
    });
  };

  const confirmMakePropertyAvailable = async () => {
    const { propertyId } = makeAvailableConfirmation;
    
    if (!propertyId) {
      return;
    }

    try {
      setIsMakingAvailable(true);
      const token = localStorage.getItem('token');
      
      // Optimistic update - update UI immediately
      setProperties(prevProperties => {
        const updated = prevProperties.map(property => 
          property._id === propertyId 
            ? { ...property, available: true, isReserved: false }
            : property
        );
        return updated;
      });
      
      // Close modal
      setMakeAvailableConfirmation({ propertyId: null, propertyTitle: null, reservation: null });
      
      // Update property status to available (keep reservation for history)
      const response = await fetch(`https://dmtart.pro/mimorent/api/employer/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          available: true,
          isReserved: false
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        addToast('تم جعل العقار متاحًا بنجاح', 'success');
        
        // Refresh properties to ensure consistency
        await fetchProperties();
        await fetchReservations();
      } else {
        // Revert optimistic update on failure
        await fetchProperties();
        await fetchReservations();
        addToast('فشل تحديث حالة العقار: ' + (data.message || 'خطأ غير معروف'), 'error');
      }
    } catch (error) {
      console.error('Error making property available:', error);
      // Revert optimistic update on error
      await fetchProperties();
      await fetchReservations();
      addToast('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsMakingAvailable(false);
    }
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
                return (
                <div key={property._id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
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
                        property.isReserved
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {property.isReserved ? 'محجوز' : 'متاح'}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditReservationModal(property)}
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
                              'تعديل الحجز'
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => handleMakePropertyAvailable(property._id, property.title)}
                          disabled={isValidatingAction || isMakingAvailable}
                          className="w-full px-3 py-2 bg-gradient-to-br from-[#ff8844] to-[#cc6600] text-white rounded-lg hover:from-[#ff7733] hover:to-[#aa5500] transition-all text-sm cursor-pointer border-2 border-white/60 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {(isValidatingAction || isMakingAvailable) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
                              </div>
                              جاري التحقق...
                            </>
                          ) : (
                            'جعل العقار متاحا'
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openReservationModal(property)}
                        disabled={isValidatingAction}
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 "
          onClick={() => {
            setShowReservationModal(false);
            setCurrentBookingOrder(null);
          }}
        >
          <div 
            className="bg-white/95 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-2xl relative z-[100000] max-h-[85vh] flex flex-col"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 p-6 border-b border-gray-100/20 rounded-t-2xl overflow-hidden flex-shrink-0">
              <h3 className="text-xl font-bold text-white">
                {editingReservation ? 'تعديل الحجز' : 'حجز عقار'}
              </h3>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
            {/* Property Info */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-800">{selectedProperty.title}</h4>
              <p className="text-gray-600 text-sm">{selectedProperty.description}</p>
              <p className="text-blue-600 font-semibold">{selectedProperty.pricePerDay} دج/يوم</p>
            </div>
            
            {/* Error Message */}
            {reservationError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="text-sm font-medium">خطأ: {reservationError}</p>
              </div>
            )}
            
            <form onSubmit={handleReservationSubmit} className="space-y-4">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (دج)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.totalPrice}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    totalPrice: Number(e.target.value),
                    remainingAmount: Math.max(0, Number(e.target.value) - prev.paidAmount)
                  }))}
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
                    onChange={(e) => handlePaidAmountChange(e.target.value)}
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
                    value={formData.totalPrice - formData.paidAmount}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">معلق</option>
                  <option value="partial">مدفوع جزئياً</option>
                  <option value="paid">مدفوع بالكامل</option>
                </select>
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

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReservationModal(false);
                    setCurrentBookingOrder(null);
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

      {/* Make Property Available Confirmation Modal */}
      {makeAvailableConfirmation.propertyId && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setMakeAvailableConfirmation({ propertyId: null, propertyTitle: null, reservation: null })}
        >
          <div 
            className="bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md relative z-[100000] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
 
            
            <h3 className="text-xl font-bold text-white mb-4">
              جعل العقار متاحًا
                         <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-green-600" />
              </div>
            </div>
            </h3>
            
            <p className="text-white mb-4">
              تأكد من معلومات الحجز قبل جعل العقار متاح
            </p>
            
            {/* Reservation Details */}
            {makeAvailableConfirmation.reservation && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">السعر الإجمالي (دج)</span>
                  <span className="text-gray-900 font-bold">
                    {makeAvailableConfirmation.reservation.totalPrice?.toLocaleString('ar-DZ') || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">المبلغ المدفوع (دج)</span>
                  <span className="text-gray-900 font-bold">
                    {makeAvailableConfirmation.reservation.paidAmount?.toLocaleString('ar-DZ') || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">المبلغ المتبقي (دج)</span>
                  <span className="text-gray-900 font-bold">
                    {makeAvailableConfirmation.reservation.remainingAmount?.toLocaleString('ar-DZ') || 
                     (makeAvailableConfirmation.reservation.totalPrice - makeAvailableConfirmation.reservation.paidAmount)?.toLocaleString('ar-DZ') || 0}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">حالة الدفع</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      makeAvailableConfirmation.reservation.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      makeAvailableConfirmation.reservation.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {makeAvailableConfirmation.reservation.paymentStatus === 'paid' ? 'مدفوع بالكامل' :
                       makeAvailableConfirmation.reservation.paymentStatus === 'partial' ? 'مدفوع جزئياً' :
                       'غير مدفوع'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">حالة الحجز</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      makeAvailableConfirmation.reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      makeAvailableConfirmation.reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      makeAvailableConfirmation.reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {makeAvailableConfirmation.reservation.status === 'confirmed' ? 'مؤكد' :
                       makeAvailableConfirmation.reservation.status === 'pending' ? 'معلق' :
                       makeAvailableConfirmation.reservation.status === 'cancelled' ? 'ملغي' :
                       makeAvailableConfirmation.reservation.status}
                    </span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="text-sm text-gray-600">
                    <div className="mb-1">
                      <span className="font-medium">العميل:</span> {makeAvailableConfirmation.reservation.customerName}
                    </div>
                    <div className="mb-1">
                      <span className="font-medium">الهاتف:</span> {makeAvailableConfirmation.reservation.customerPhone}
                    </div>
                    <div>
                      <span className="font-medium">الفترة:</span> {
                        new Date(makeAvailableConfirmation.reservation.startDate).toLocaleDateString('ar-DZ')
                      } - {
                        new Date(makeAvailableConfirmation.reservation.endDate).toLocaleDateString('ar-DZ')
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-white text-sm mb-6">
              هل أنت متأكد من أنك تريد جعل العقار "{makeAvailableConfirmation.propertyTitle || ''}" متاحًا؟
            </p>
            
            <div className="flex space-x-2 space-x-reverse">
              <button
                type="button"
                onClick={() => setMakeAvailableConfirmation({ propertyId: null, propertyTitle: null, reservation: null })}
                className="flex-1  px-4 py-2   border border-gray-300 text-white rounded-lg hover:bg-gray-50 hover:text-black cursor-pointer transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmMakePropertyAvailable}
                className="flex-1 cursor-pointer  px-4 py-2 mx-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                تأكيد
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
