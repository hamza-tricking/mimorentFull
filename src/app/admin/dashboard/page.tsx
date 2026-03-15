'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../contexts/ToastContext';
import ContractModal from '../../../components/admin/ContractModal';
import Notifications from '../../../components/admin/Notifications';
import NotificationDropdown from '../../../components/admin/NotificationDropdown';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AdminProfileModal from '../../../components/admin/AdminProfileModal';
import GoogleMapPreview from '../../../components/GoogleMapPreview';

// Debug translation function
let debugT: (key: string) => string = (key: string) => key;
import { 
  Home, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Calendar,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  CreditCard,
  Activity,
  UserCheck,
  Building,
  Car,
  Star,
  LogOut,
  Edit,
  Trash2,
  Clock,
  History,
  ChevronDown,
  PieChart,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { addToast } = useToast();
  
  // Update debug function with actual t function
  const debugT = (key: string) => {

    return t(key);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL hash first, then localStorage, then default
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'notifications') {
        return 'notifications';
      }
      const savedTab = localStorage.getItem('adminActiveTab');
      return savedTab || 'wilayas';
    }
    return 'wilayas';
  });
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditOfficeModal, setShowEditOfficeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedOfficeForUser, setSelectedOfficeForUser] = useState<any>(null);
  const [editingWilaya, setEditingWilaya] = useState<any>(null);
  const [editingOffice, setEditingOffice] = useState<any>(null);
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Error states for modals
  const [wilayaError, setWilayaError] = useState<string | null>(null);
  const [officeError, setOfficeError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [propertyError, setPropertyError] = useState<string | null>(null);
  
  // Loading states
  const [isAddingWilaya, setIsAddingWilaya] = useState(false);
  const [isAddingOffice, setIsAddingOffice] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [isEditingReservation, setIsEditingReservation] = useState(false);
  
  // Property modals state
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isUpdatingProperty, setIsUpdatingProperty] = useState(false);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [imageLinks, setImageLinks] = useState<string[]>([]);
  const [currentImageLink, setCurrentImageLink] = useState('');
  const [editWilayaId, setEditWilayaId] = useState<string>('');
  const [editOfficeId, setEditOfficeId] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [addPropertyAvailable, setAddPropertyAvailable] = useState(true);
  const [editPropertyAvailable, setEditPropertyAvailable] = useState(true);
  
  // Reservation pricing states
  const [addReservationType, setAddReservationType] = useState('daily');
  const [editReservationType, setEditReservationType] = useState('daily');
  const [addMonthlyPrice, setAddMonthlyPrice] = useState('');
  const [editMonthlyPrice, setEditMonthlyPrice] = useState('');
  const [editMapUrl, setEditMapUrl] = useState('');
  const [addMapUrl, setAddMapUrl] = useState('');
  
  const handleLocationSelect = (lat: number, lng: number) => {
    // Create a new Google Maps URL with the selected coordinates
    const newMapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
    setEditMapUrl(newMapUrl);
  };
  
  const handleAddLocationSelect = (lat: number, lng: number) => {
    // Create a new Google Maps URL with selected coordinates
    const newMapUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15`;
    setAddMapUrl(newMapUrl);
  };
  const [addMonthlyDiscountPrice, setAddMonthlyDiscountPrice] = useState('');
  const [editMonthlyDiscountPrice, setEditMonthlyDiscountPrice] = useState('');
  
  // Price calculation functions
  const calculateDailyFromMonthly = (monthlyPrice: string): string => {
    const monthly = parseFloat(monthlyPrice);
    if (isNaN(monthly) || monthly <= 0) return '';
    return (monthly / 30).toFixed(2);
  };
  
  const calculateMonthlyFromDaily = (dailyPrice: string): string => {
    const daily = parseFloat(dailyPrice);
    if (isNaN(daily) || daily <= 0) return '';
    return (daily * 30).toFixed(2);
  };
  
  const calculateDailyFromMonthlyRounded = (monthlyPrice: string): string => {
    const monthly = parseFloat(monthlyPrice);
    if (isNaN(monthly) || monthly <= 0) return '';
    const daily = monthly / 30;
    return Math.round(daily).toString();
  };
  
  const calculateMonthlyFromDailyRounded = (dailyPrice: string): string => {
    const daily = parseFloat(dailyPrice);
    if (isNaN(daily) || daily <= 0) return '';
    const monthly = daily * 30;
    return Math.round(monthly).toString();
  };
  
  const handleAddReservationTypeChange = (type: string) => {
    setAddReservationType(type);
    if (type === 'daily') {
      // When switching to daily, clear monthly price
      setAddMonthlyPrice('');
    }
  };
  
  const handleEditReservationTypeChange = (type: string) => {
    setEditReservationType(type);
    if (type === 'daily') {
      setEditMonthlyPrice('');
    }
  };
  
  const handleAddMonthlyPriceChange = (monthlyPrice: string) => {
    setAddMonthlyPrice(monthlyPrice);
    const dailyPrice = calculateDailyFromMonthlyRounded(monthlyPrice);
    // Update the daily price input field with rounded value
    const dailyInput = document.querySelector('input[name="pricePerDay"]') as HTMLInputElement;
    if (dailyInput && dailyPrice) {
      dailyInput.value = dailyPrice;
    }
  };
  
  const handleEditMonthlyPriceChange = (monthlyPrice: string) => {
    setEditMonthlyPrice(monthlyPrice);
    const dailyPrice = calculateDailyFromMonthlyRounded(monthlyPrice);
    // Update the daily price input field with rounded value
    const dailyInput = document.querySelector('input[name="pricePerDay"]') as HTMLInputElement;
    if (dailyInput && dailyPrice) {
      dailyInput.value = dailyPrice;
    }
  };
  
  const handleAddDailyPriceChange = (dailyPrice: string) => {
    const monthlyPrice = calculateMonthlyFromDailyRounded(dailyPrice);
    setAddMonthlyPrice(monthlyPrice);
    // Update the monthly price input field with rounded value
    const monthlyInput = document.querySelector('input[name="monthlyPrice"]') as HTMLInputElement;
    if (monthlyInput && monthlyPrice) {
      monthlyInput.value = monthlyPrice;
    }
  };
  
  const handleEditDailyPriceChange = (dailyPrice: string) => {
    const monthlyPrice = calculateMonthlyFromDailyRounded(dailyPrice);
    setEditMonthlyPrice(monthlyPrice);
    // Update the monthly price input field with rounded value
    const monthlyInput = document.querySelector('input[name="monthlyPrice"]') as HTMLInputElement;
    if (monthlyInput && monthlyPrice) {
      monthlyInput.value = monthlyPrice;
    }
  };
  
  const handleAddMonthlyDiscountPriceChange = (monthlyDiscountPrice: string) => {
    setAddMonthlyDiscountPrice(monthlyDiscountPrice);
    const dailyDiscountPrice = calculateDailyFromMonthlyRounded(monthlyDiscountPrice);
    // Update the daily discount price input field with rounded value
    const dailyDiscountInput = document.querySelector('input[name="priceBeforeDiscountPerDay"]') as HTMLInputElement;
    if (dailyDiscountInput && dailyDiscountPrice) {
      dailyDiscountInput.value = dailyDiscountPrice;
    }
  };
  
  const handleEditMonthlyDiscountPriceChange = (monthlyDiscountPrice: string) => {
    setEditMonthlyDiscountPrice(monthlyDiscountPrice);
    const dailyDiscountPrice = calculateDailyFromMonthlyRounded(monthlyDiscountPrice);
    // Update the daily discount price input field with rounded value
    const dailyDiscountInput = document.querySelector('input[name="priceBeforeDiscountPerDay"]') as HTMLInputElement;
    if (dailyDiscountInput && dailyDiscountPrice) {
      dailyDiscountInput.value = dailyDiscountPrice;
    }
  };
  
  const handleAddDailyDiscountPriceChange = (dailyDiscountPrice: string) => {
    const monthlyDiscountPrice = calculateMonthlyFromDailyRounded(dailyDiscountPrice);
    setAddMonthlyDiscountPrice(monthlyDiscountPrice);
    // Update the monthly discount price input field with rounded value
    const monthlyDiscountInput = document.querySelector('input[name="monthlyDiscountPrice"]') as HTMLInputElement;
    if (monthlyDiscountInput && monthlyDiscountPrice) {
      monthlyDiscountInput.value = monthlyDiscountPrice;
    }
  };
  
  const handleEditDailyDiscountPriceChange = (dailyDiscountPrice: string) => {
    const monthlyDiscountPrice = calculateMonthlyFromDailyRounded(dailyDiscountPrice);
    setEditMonthlyDiscountPrice(monthlyDiscountPrice);
    // Update the monthly discount price input field with rounded value
    const monthlyDiscountInput = document.querySelector('input[name="monthlyDiscountPrice"]') as HTMLInputElement;
    if (monthlyDiscountInput && monthlyDiscountPrice) {
      monthlyDiscountInput.value = monthlyDiscountPrice;
    }
  };
  
  // Reservation state
  const [reservations, setReservations] = useState<any[]>([]);
  const [showAddReservationModal, setShowAddReservationModal] = useState(false);
  const [showReservationDetails, setShowReservationDetails] = useState(false);
  const [detailedReservations, setDetailedReservations] = useState<any>({
    type: '',
    name: '',
    reservations: []
  });
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [selectedPropertyForReservation, setSelectedPropertyForReservation] = useState<string>('');
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [showEditReservationModal, setShowEditReservationModal] = useState(false);
  const [showReservationsListModal, setShowReservationsListModal] = useState(false);
  const [selectedPropertyForReservationsList, setSelectedPropertyForReservationsList] = useState<string>('');
  const [selectedReservationId, setSelectedReservationId] = useState<string>('');
  const [preSelectedDates, setPreSelectedDates] = useState<{ startDate: Date; endDate: Date } | null>(null);
  
  // Pre-filled reservation data from orders
  const [preFilledReservationData, setPreFilledReservationData] = useState<any>(null);
  
  // Reservation form state
  const [addReservationForm, setAddReservationForm] = useState({
    totalPrice: '',
    paidAmount: '',
    remainingAmount: '',
    status: 'pending',
    isMarried: false,
    numberOfPeople: '',
    identityImages: [] as string[],
    notes: [] as string[],
    currentNote: ''
  });
  const [editReservationForm, setEditReservationForm] = useState({
    totalPrice: '',
    paidAmount: '',
    remainingAmount: '',
    status: 'pending',
    isMarried: false,
    numberOfPeople: '',
    identityImages: [] as string[],
    notes: [] as string[]
  });
  
  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<string>>(new Set());
  const [expandedPropertyCards, setExpandedPropertyCards] = useState<Set<string>>(new Set());
  
  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showOrderActionModal, setShowOrderActionModal] = useState(false);
  const [orderAction, setOrderAction] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  
  // Inline editing state
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  
  // Financial state
  const [financialStats, setFinancialStats] = useState({
    all: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
    daily: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
    weekly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
    monthly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
    byWilaya: [],
    byOffice: [],
    byEmployer: []
  });
  const [allWilayasStats, setAllWilayasStats] = useState([]); // For unfiltered wilaya data
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialFilter, setFinancialFilter] = useState<'all' | 'wilaya' | 'office' | 'employer'>('all');
  const [selectedWilayaForStats, setSelectedWilayaForStats] = useState<string>('');
  const [selectedOfficeForStats, setSelectedOfficeForStats] = useState<string>('');
  const [selectedEmployerForStats, setSelectedEmployerForStats] = useState<string>('');

  // Debounce state for financial stats
  const [financialTimeoutId, setFinancialTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Action loading states for admin dashboard

  // Get admin user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Debug edit reservation modal
  useEffect(() => {
    if (showEditReservationModal && editingReservation) {
      
      const foundProperty = properties.find((p: any) => p._id === editingReservation?.propertyId);
          }
  }, [showEditReservationModal, editingReservation, properties]);

  // Filter reservations based on selected wilaya and office
  const filteredReservations = reservations.filter((reservation: any) => {
        
    // If no wilaya selected, show all reservations
    if (!selectedWilaya && !selectedOffice) {
return true;
    }
    
    // Get property info for this reservation
    const propertyId = typeof reservation.propertyId === 'string' 
      ? reservation.propertyId 
      : reservation.propertyId?._id || reservation.propertyId.id;
    
        const property = properties.find((p: any) => p._id === propertyId);
        
    if (!property) {
      return false;
    }
    
    // Extract wilaya and office IDs (handle both string and object formats)
    if (property && property.wilayaId && property.officeId) {
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
      if (selectedOffice) {
        if (propertyOfficeId !== selectedOffice) {
          return false;
        }
      }
    }
    
        return true;
  });
  
  // Additional debugging: Check if any reservation properties match available properties
  const reservationPropertyIds = reservations.filter(r => r).map(r => 
    r.propertyId ? 
      (typeof r.propertyId === 'string' ? r.propertyId : r.propertyId?._id || r.propertyId.id) 
      : null
  ).filter(id => id !== null);
  const availablePropertyIds = properties.filter(p => p && p._id).map(p => p._id);
    
  // Check property wilaya/office distribution
  const propertyWilayaOfficeMap = properties.filter(p => p && p._id).map(p => ({
    propertyId: p._id,
    title: p.title,
    wilayaId: p.wilayaId,
    officeId: p.officeId
  }));
      
  // Check which properties match the selected filters
  const matchingProperties = properties.filter(p => {
    const wilayaMatch = !selectedWilaya || p.wilayaId === selectedWilaya;
    const officeMatch = !selectedOffice || p.officeId === selectedOffice;
    return wilayaMatch && officeMatch;
  });
  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'office' | 'wilaya' | 'property' | 'user' | null;
    id: string | null;
    name: string | null;
  }>({ type: null, id: null, name: null });

  
  // Contract modal state
  const [showContractModal, setShowContractModal] = useState(false);

  // User details modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userData);
        if (user.role !== 'admin' && user.role !== 'sous admin') {
          router.push('/login');
          return;
        }
      } catch (error) {
        router.push('/login');
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [router]);

  // Scroll effect for sidebar padding
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'notifications') {
        setActiveTab('notifications');
      }
    };

    // Check hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Refresh notifications when switching to notifications tab
  useEffect(() => {
    if (activeTab === 'notifications') {
      // Don't clear cache immediately, just trigger refresh
      // This prevents data loss when switching tabs
      
      // Trigger a custom event to notify Notifications component to refresh
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }
  }, [activeTab]);

  // Listen for custom navigation event from NotificationDropdown
  useEffect(() => {
    const handleNavigateToNotifications = () => {
      console.log('🔄 Navigate to notifications event received');
      setActiveTab('notifications');
      setSelectedWilaya(null);
      setSelectedOffice(null);
    };

    const handleNavigateToOrders = () => {
      console.log('🔄 Navigate to orders event received - switching to orders tab');
      setActiveTab('orders');
      setSelectedWilaya(null);
      setSelectedOffice(null);
    };

    const handleNavigateToReservations = () => {
      console.log('🔄 Navigate to reservations event received - switching to reservations tab');
      setActiveTab('reservations');
      setSelectedWilaya(null);
      setSelectedOffice(null);
    };

    // Add event listeners with capture to ensure they catch events from portals
    window.addEventListener('navigateToNotifications', handleNavigateToNotifications, true);
    window.addEventListener('navigateToOrders', handleNavigateToOrders, true);
    window.addEventListener('navigateToReservations', handleNavigateToReservations, true);
    
    // Also add functions to window object for direct access
    (window as any).navigateToAdminOrders = () => {
      console.log('🔄 Direct navigateToAdminOrders called');
      setActiveTab('orders');
      setSelectedWilaya(null);
      setSelectedOffice(null);
    };

    (window as any).navigateToAdminReservations = () => {
      console.log('🔄 Direct navigateToAdminReservations called');
      setActiveTab('reservations');
      setSelectedWilaya(null);
      setSelectedOffice(null);
    };
    
    // Debug: Log that functions are attached
    console.log('🔧 Navigation functions attached to window:', {
      navigateToAdminOrders: !!(window as any).navigateToAdminOrders,
      navigateToAdminReservations: !!(window as any).navigateToAdminReservations
    });
    
    return () => {
      window.removeEventListener('navigateToNotifications', handleNavigateToNotifications, true);
      window.removeEventListener('navigateToOrders', handleNavigateToOrders, true);
      window.removeEventListener('navigateToReservations', handleNavigateToReservations, true);
      delete (window as any).navigateToAdminOrders;
      delete (window as any).navigateToAdminReservations;
    };
  }, [setSelectedWilaya, setSelectedOffice, setActiveTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const stats = [
    {
      title: t('admin.totalProperties'),
      value: '24',
      change: '+12%',
      icon: Building,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t('admin.activeRentals'),
      value: '18',
      change: '+8%',
      icon: Car,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('admin.totalRevenue'),
      value: '$45,678',
      change: '+23%',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: t('admin.userSatisfaction'),
      value: '4.8',
      change: '+5%',
      icon: Star,
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const menuItems = [
    { id: 'wilayas', label: 'الولايات', icon: Building, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'offices', label: 'المكاتب', icon: Building, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'users', label: 'المستخدمون', icon: Users },
    { id: 'properties', label: 'العقارات', icon: Home, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'reservations', label: 'الحجوزات', icon: Calendar, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'orders', label: 'طلبات الحجز', icon: FileText, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'financial', label: 'الإحصائيات المالية', icon: PieChart, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
    { id: 'history', label: 'السجل', icon: Clock, onClick: () => { setSelectedWilaya(null); setSelectedOffice(null); } },
  ];

  // Helper function for delayed API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Retry function with exponential backoff
  const fetchWithRetry = async (url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // If successful, return the response
        if (response.ok) {
          return response;
        }
        
        // If rate limited, wait and retry
        if (response.status === 429) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10 seconds
          console.warn(`⚠️ Rate limited, retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`);
          await delay(waitTime);
          continue;
        }
        
        // Other errors, don't retry
        return response;
      } catch (error) {
        console.error(`🔴 Fetch attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) throw error;
        await delay(1000 * Math.pow(2, attempt)); // Exponential backoff
      }
    }
    throw new Error('Max retries exceeded');
  };

  // Fetch data from backend
  useEffect(() => {
    if (!authChecked) return; // Don't fetch if auth not checked
    
    const fetchData = async () => {
      try {
    
        // 1. Fetch wilayas (no delay - first call)
    const wilayasResponse = await fetchWithRetry('https://dmtart.pro/mimorent/api/admin/wilayas', {
          headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const wilayasData = await wilayasResponse.json();
        
        if (wilayasData.success) {
          setWilayas(wilayasData.data.wilayas || []);
      }
        
        // Add delay before next call
        await delay(500);
        
        // 2. Fetch offices
    const officesResponse = await fetchWithRetry('https://dmtart.pro/mimorent/api/admin/offices', {
          headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const officesData = await officesResponse.json();
        
        if (officesData.success) {
          setOffices(officesData.data.offices || []);
      }
        
        // Add delay before next call
        await delay(500);
        
        // 3. Fetch properties
    await fetchProperties();
    
        // Add delay before next call
        await delay(500);
        
        // 4. Fetch reservations
    await fetchReservations();
    
        // Add delay before next call
        await delay(500);
        
        // 5. Fetch orders
    await fetchOrders();
    
        // Add delay before next call
        await delay(500);
        
        // 6. Fetch admin settings
    await fetchAdminSettings();
    
    
      } catch (error) {
        console.error('🔴 Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authChecked]);

  // Fetch users when users tab is active OR offices tab is active (to show users under offices)
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'offices') {
      fetchUsers();
    }
  }, [activeTab]);

  // Auto-approve pending orders when auto-accept is enabled or orders change
  useEffect(() => {
    if (autoAcceptOrders && orders.length > 0) {
      // Add a small delay to avoid immediate execution on orders fetch
      const timer = setTimeout(() => {
        autoApprovePendingOrders();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoAcceptOrders, orders]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [activeTab]);

  // Real-time property status checking for admin dashboard
  useEffect(() => {
    if (!authChecked) return;

    const checkPropertyStatus = async () => {
      try {
        // Check if any property status has changed by fetching fresh data
        const token = localStorage.getItem('token');
        
        const response = await fetch(`https://dmtart.pro/mimorent/api/admin/properties?t=${Date.now()}`, {
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
              console.log('Admin dashboard: Property status changed, refreshing...');
              await fetchProperties();
              await fetchReservations();
              addToast('تم تحديث حالة العقارات', 'info');
            }
          }
        }
      } catch (error) {
        console.error('Error checking property status in admin dashboard:', error);
      }
    };

    // Check every 10 seconds for property status changes
    const interval = setInterval(checkPropertyStatus, 10000);

    return () => clearInterval(interval);
  }, [authChecked, properties, addToast]);

  // Property CRUD operations
  const handleAddProperty = async (propertyData: { 
    title: string; 
    description: string; 
    pricePerDay: number; 
    images: string[]; 
    wilayaId: string; 
    officeId: string; 
    location: string;
  }) => {
    setIsAddingProperty(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProperties([...properties, data.data.property]);
        setShowAddPropertyModal(false);
        setImageLinks([]);
        setCurrentImageLink('');
        setAddMapUrl('');
        setPropertyError(null);
        setAddPropertyAvailable(true);
        addToast('تمت إضافة العقار بنجاح', 'success');
      } else {
        // Handle detailed error messages
        let errorMessage = 'فشل في إضافة العقار';
        
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors array
          errorMessage = data.errors.map((err: any) => err.msg || err.message).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        console.error('Backend error response:', data);
        setPropertyError(errorMessage);
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Failed to add property:', error);
      setPropertyError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsAddingProperty(false);
    }
  };

  const handleEditProperty = async (propertyData: { 
    title: string; 
    description: string; 
    pricePerDay: number; 
    images: string[]; 
    wilayaId: string; 
    officeId: string; 
    location: string;
  }) => {
    setIsUpdatingProperty(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/properties/${editingProperty._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProperties(properties.map(p => p._id === editingProperty._id ? data.data.property : p));
        setShowEditPropertyModal(false);
        setEditingProperty(null);
        setImageLinks([]);
        setEditWilayaId('');
        setEditOfficeId('');
        setEditMapUrl('');
        setPropertyError(null);
        setEditPropertyAvailable(true);
        addToast('تم تحديث العقار بنجاح', 'success');
      } else {
        // Handle detailed error messages
        let errorMessage = 'فشل في تحديث العقار';
        
        if (data.errors && Array.isArray(data.errors)) {
          // Validation errors array
          errorMessage = data.errors.map((err: any) => err.msg || err.message).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
        
        console.error('Backend error response:', data);
        setPropertyError(errorMessage);
        addToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Failed to update property:', error);
      setPropertyError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsUpdatingProperty(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const property = properties.find(p => p._id === propertyId);
    setDeleteConfirmation({
      type: 'property',
      id: propertyId,
      name: property?.title || 'Unknown Property'
    });
  };

  const executeDeleteProperty = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setProperties(properties.filter(p => p._id !== propertyId));
      }
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  // Orders functions
  const fetchOrders = async () => {
    try {
const token = localStorage.getItem('token');
      const response = await fetchWithRetry('https://dmtart.pro/mimorent/api/admin/orders-reservation', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        const orders = data.data?.orders || [];
setOrders(orders);
      } else {
        console.error('🔴 Orders API error:', data.message);
        setOrderError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('🔴 Failed to fetch orders:', error);
      setOrderError('Failed to fetch orders');
    }
  };

  // Auto-approve pending orders when auto-accept is enabled
  const autoApprovePendingOrders = async () => {
    if (!autoAcceptOrders) return;
    
    const pendingOrders = orders.filter(order => order.status === 'pending');
    if (pendingOrders.length === 0) return;
    
    console.log(`🤖 Auto-approving ${pendingOrders.length} pending orders`);
    
    for (const order of pendingOrders) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${order._id}/approve`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Auto-approved order: ${order._id}`);
        } else {
          console.error(`❌ Failed to auto-approve order ${order._id}:`, data.message);
        }
      } catch (error) {
        console.error(`❌ Error auto-approving order ${order._id}:`, error);
      }
    }
    
    // Refresh orders after auto-approving
    await fetchOrders();
  };

  // Load admin settings from backend
  const fetchAdminSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAutoAcceptOrders(data.data.autoAcceptOrders);
        console.log('📋 Loaded admin settings:', data.data.autoAcceptOrders);
      } else {
        console.error('🔴 Failed to load admin settings:', data.message);
      }
    } catch (error) {
      console.error('🔴 Error loading admin settings:', error);
    }
  };

  // Save auto-accept setting to backend
  const saveAutoAcceptSetting = async (value: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/settings/auto-accept', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ autoAcceptOrders: value })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('💾 Saved auto-accept setting:', value);
      } else {
        console.error('🔴 Failed to save auto-accept setting:', data.message);
        // Revert the state if save failed
        setAutoAcceptOrders(!value);
      }
    } catch (error) {
      console.error('🔴 Error saving auto-accept setting:', error);
      // Revert the state if save failed
      setAutoAcceptOrders(!value);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'delete' | 'approve_and_reserve', notes: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'delete') {
        const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}`, {
          method: 'DELETE',
          headers: {
'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          addToast('تم حذف الطلب بنجاح', 'success');
          await fetchOrders();
          setShowOrderActionModal(false);
          setSelectedOrder(null);
          setOrderAction(null);
          setAdminNotes('');
        } else {
          addToast(data.message || 'فشل حذف الطلب', 'error');
        }
      } else if (action === 'approve_and_reserve') {
        // First approve the order
        const approveResponse = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}/approve`, {
          method: 'PUT',
          headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
          },
          body: JSON.stringify({ adminNotes: notes })
        });
        
        const approveData = await approveResponse.json();
        
        if (approveData.success) {
          // Close the order action modal
          setShowOrderActionModal(false);
          setSelectedOrder(null);
          setOrderAction(null);
          setAdminNotes('');
          
          // Open the reservation modal with the order's property
          const order = selectedOrder;
          if (order && order.propertyId) {
            // Find the full property object
            const propertyId = typeof order.propertyId === 'string' 
              ? order.propertyId 
              : order.propertyId?._id || order.propertyId.id;
            const property = properties.find(p => p._id === propertyId);
            if (property) {
              // Pre-fill the reservation form with order data
              const isFamilyProperty = property?.propertyType === 'home' || property?.propertyType === 'villa';
              setAddReservationForm({
                totalPrice: '0',
                paidAmount: '0',
                remainingAmount: '0',
                status: 'confirmed',
                isMarried: isFamilyProperty ? true : false,
                numberOfPeople: isFamilyProperty ? '1' : '1',
                identityImages: [],
                notes: [],
                currentNote: ''
              });
              
              // Set pre-filled data for form inputs
              setPreFilledReservationData({
                customerName: order.fullname,
                customerPhone: order.phoneNumber,
                propertyId: property._id,
                wilayaId: property.wilayaId._id,
                officeId: property.officeId._id,
                startDate: new Date(order.startDate).toISOString().split('T')[0],
                endDate: new Date(order.endDate).toISOString().split('T')[0],
                notes: `تم إنشاء الحجز بناءً على طلب الموافقة: ${order.fullname} - ${order.phoneNumber}`
              });
              
              // Open the reservation modal
              setSelectedPropertyForReservation(property._id);
              setShowAddReservationModal(true);
              
              addToast('تم الموافقة على الطلب. يرجى إكمال بيانات الحجز.', 'success');
            } else {
              addToast('تم الموافقة على الطلب ولكن لم يتم العثور على العقار', 'error');
            }
          } else {
            addToast('تم الموافقة على الطلب بنجاح', 'success');
          }
          
          await fetchOrders();
        } else {
          addToast(approveData.message || 'فشل الموافقة على الطلب', 'error');
        }
      } else {
        const response = await fetch(`https://dmtart.pro/mimorent/api/admin/orders-reservation/${orderId}/${action}`, {
          method: 'PUT',
          headers: {
'Authorization': `Bearer ${token}`,
'Content-Type': 'application/json'
          },
          body: JSON.stringify({ adminNotes: notes })
        });
        
        const data = await response.json();
        
        if (data.success) {
          addToast(`تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} الطلب بنجاح`, 'success');
          await fetchOrders();
          setShowOrderActionModal(false);
          setSelectedOrder(null);
          setOrderAction(null);
          setAdminNotes('');
        } else {
          addToast(data.message || `فشل ${action === 'approve' ? 'الموافقة على' : 'رفض'} الطلب`, 'error');
        }
      }
    } catch (error) {
      console.error(`🔴 Failed to ${action} order:`, error);
      addToast(`فشل ${action === 'delete' ? 'حذف' : action === 'approve' ? 'الموافقة على' : 'رفض'} الطلب`, 'error');
    }
  };

  // Handler functions for order actions
  const handleApproveOrder = (orderId: string) => {
    setSelectedOrder(orders.find(o => o._id === orderId));
    setOrderAction('approve');
    setShowOrderActionModal(true);
  };

  const handleRejectOrder = (orderId: string) => {
    setSelectedOrder(orders.find(o => o._id === orderId));
    setOrderAction('reject');
    setShowOrderActionModal(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    setSelectedOrder(orders.find(o => o._id === orderId));
    setOrderAction('delete');
    setShowOrderActionModal(true);
  };

  // Inline editing functions
  const startEditingOrder = (order: any) => {
    setEditingOrder(order._id);
    setEditPriority(order.priority);
    setEditAdminNotes(order.adminNotes || '');
  };

  const cancelEditingOrder = () => {
    setEditingOrder(null);
    setEditPriority('');
    setEditAdminNotes('');
  };

  // Handler functions for inline editing
  const handleEditOrder = (order: any) => {
    setEditingOrder(order._id);
    setEditPriority(order.priority);
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
      
      const data = await response.json();
      
      if (data.success) {
        addToast('تم تحديث الطلب بنجاح', 'success');
        setEditingOrder(null);
        setEditPriority('');
        setEditAdminNotes('');
        await fetchOrders();
      } else {
        addToast(data.message || 'فشل تحديث الطلب', 'error');
      }
    } catch (error) {
      console.error('🔴 Failed to update order:', error);
      addToast('فشل تحديث الطلب', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditPriority('');
    setEditAdminNotes('');
  };

  const saveOrderEdits = async (orderId: string) => {
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
      
      const data = await response.json();
      
      if (data.success) {
        addToast('تم تحديث الطلب بنجاح', 'success');
        // Update the order in the local state
        setOrders(orders.map(order => 
          order._id === orderId 
? { ...order, priority: editPriority, adminNotes: editAdminNotes }
: order
        ));
        cancelEditingOrder();
      } else {
        addToast(data.message || 'فشل تحديث الطلب', 'error');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      addToast('فشل تحديث الطلب', 'error');
    }
  };

  // Reservation functions
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchWithRetry('https://dmtart.pro/mimorent/api/admin/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      // Get raw text first to see what we're getting
      const rawText = await response.text();
      
      if (!rawText || rawText.trim() === '') {
        console.error('🔴 Empty response from API');
        return;
      }
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error('🔴 Failed to parse JSON:', parseError);
        console.error('🔴 Raw text that failed to parse:', rawText);
        return;
      }
      
      
      if (data.success) {
        const reservations = data.data?.data || [];  // Fixed: use data.data.data to match API response structure
        console.log('🟢 Reservations fetched:', reservations.length);
        console.log('🟢 Sample reservation:', reservations[0]);
        setReservations(reservations);
      } else {
        console.error('🔴 Reservations API error:', data.message);
      }
    } catch (error) {
      console.error('🔴 Failed to fetch reservations:', error);
    }
  };

  // History functions
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data.history || []);
      } else {
        console.error('History API Error:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleHistoryItem = (itemId: string) => {
    setExpandedHistoryItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

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
        setSelectedPropertyForReservation(propertyId);
        setSelectedReservationId(reservationInfo.reservationId);
        
        // Use the same data source as the working "تعديل الحجز الأخير" button
        const reservation = reservations.find((r: any) => {
          const reservationPropertyId = typeof r.propertyId === 'string' 
            ? r.propertyId 
            : r.propertyId?._id || r.propertyId.id;
          return r._id === reservationInfo.reservationId;
        });
        
        if (reservation) {
          setEditingReservation(reservation);
          setShowEditReservationModal(true);
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
          // Use getTime() for safer date comparison
          const start = selectedStartDate.getTime() < date.getTime() ? selectedStartDate : date;
          const end = selectedStartDate.getTime() < date.getTime() ? date : selectedStartDate;
          setSelectedStartDate(start);
          setSelectedEndDate(end);
          setIsSelecting(false);
          
          // Open add reservation modal with selected dates
          setSelectedPropertyForReservation(propertyId);
          setPreSelectedDates({ startDate: start, endDate: end });
          setShowAddReservationModal(true);
          
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
      
      // Check if this date is reserved
      const reservationInfo = reservedDates.get(dateStr);
      if (reservationInfo) return false;
      
      // Use getTime() for safer date comparison
      const start = selectedStartDate.getTime() < hoveredDate.getTime() ? selectedStartDate : hoveredDate;
      const end = selectedStartDate.getTime() < hoveredDate.getTime() ? hoveredDate : selectedStartDate;
      return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    };
    
    const isDateSelecting = (date: Date) => {
      if (!selectedStartDate || !isSelecting) return false;
      // Only highlight the start date, not all dates after it
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
      
      // Collect dates from all reservations with color info
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
      <div className="bg-white/5 rounded-lg p-2  border border-white/20">
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
                {/* under calendary resrvation  */}

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
                    setSelectedPropertyForReservation(propertyId);
                    setSelectedReservationId(reservation._id);
                    setEditingReservation(reservation);
                    setShowEditReservationModal(true);
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

  const fetchFinancialStats = async () => {
    if (isRateLimited) {
      return;
    }

    setFinancialLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('🔴 No token found');
        setFinancialLoading(false);
        return;
      }

      // Fetch filtered financial stats
      const params = new URLSearchParams();
      
      if (selectedWilayaForStats) params.append('wilayaId', selectedWilayaForStats);
      if (selectedOfficeForStats) params.append('officeId', selectedOfficeForStats);
      if (selectedEmployerForStats) params.append('employerId', selectedEmployerForStats);
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/financial-stats?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 429) {
        console.warn('⚠️ Rate limited, setting rate limit flag');
        setIsRateLimited(true);
        setFinancialLoading(false);
        
        // Reset rate limit flag after 10 seconds
        setTimeout(() => {
          setIsRateLimited(false);
        }, 10000);
        
        setFinancialStats({
          all: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          daily: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          weekly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          monthly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          byWilaya: [],
          byOffice: [],
          byEmployer: []
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFinancialStats(data.data);
      } else {
        console.error('🔴 Financial stats API Error:', data.message);
        setFinancialStats({
          all: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          daily: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          weekly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          monthly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
          byWilaya: [],
          byOffice: [],
          byEmployer: []
        });
      }
      
      // Also fetch all wilayas data without filters for the chart
      try {
        // First get all wilayas (same logic as sidebar)
        const wilayasResponse = await fetch('https://dmtart.pro/mimorent/api/admin/wilayas', {
          headers: {
'Authorization': `Bearer ${token}`
          }
        });
        
        if (wilayasResponse.ok) {
          const wilayasData = await wilayasResponse.json();
          if (wilayasData.success) {
const allWilayas = wilayasData.data.wilayas || [];
// Now get financial stats for all wilayas
const financialResponse = await fetch('https://dmtart.pro/mimorent/api/admin/financial-stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
if (financialResponse.ok) {
  const financialData = await financialResponse.json();
  if (financialData.success) {
    const financialWilayas = financialData.data.byWilaya || [];
    
    // Merge the data: include all wilayas, even those with 0 reservations
    const mergedWilayaData = allWilayas.map((wilaya: any) => {
      const financialInfo = financialWilayas.find((fw: any) => fw._id === wilaya._id);
      return {
        _id: wilaya._id,
        wilayaName: wilaya.name,
        completedRevenue: financialInfo?.completedRevenue || 0,
        reservationCount: financialInfo?.reservationCount || 0,
        totalRevenue: financialInfo?.totalRevenue || 0,
        totalPaid: financialInfo?.totalPaid || 0,
        statusBreakdown: financialInfo?.statusBreakdown || []
      };
    });
    
    setAllWilayasStats(mergedWilayaData);
  }
}
          } else {
console.error('🔴 Wilayas API error:', wilayasData.message);
          }
        } else {
          console.error('🔴 Wilayas HTTP error:', wilayasResponse.status);
        }
      } catch (error) {
        console.error('🔴 Error fetching wilayas data:', error);
      }
      
    } catch (error) {
      console.error('🔴 Financial stats fetch error:', error);
      setFinancialStats({
        all: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
        daily: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
        weekly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
        monthly: { totalRevenue: 0, totalPaid: 0, totalPending: 0, reservationCount: 0, completedRevenue: 0, completedPaid: 0, completedPending: 0, completedCount: 0 },
        byWilaya: [],
        byOffice: [],
        byEmployer: []
      });
    } finally {
      setFinancialLoading(false);
    }
  };
  
  // Debounced version of fetchFinancialStats
  const debouncedFetchFinancialStats = () => {
    if (financialTimeoutId) {
      clearTimeout(financialTimeoutId);
    }
    
    const timeoutId = setTimeout(() => {
      fetchFinancialStats();
    }, 500); // 500ms debounce
    
    setFinancialTimeoutId(timeoutId);
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/properties', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const handleAddReservation = async (reservationData: {
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: string;
    employerId: string | null;
    propertyId: string;
    status: string;
    isMarried: boolean;
    numberOfPeople: string;
    identityImages: string[];
    notes: string[];
    previousReservation?: {
      customerName?: string;
      customerPhone?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      totalPrice?: number;
    };
  }) => {
    setIsAddingReservation(true);
    try {
      const token = localStorage.getItem('token');
      
      // Optimistic update - update property immediately
      setProperties(prevProperties => 
        prevProperties.map(property => 
          property._id === reservationData.propertyId 
? { ...property,  isReserved: true }
: property
        )
      );
      
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      
      if (data.success) {
        setReservations([...reservations, data.data.reservation]);
        
        // Update properties to refresh calendar
        setProperties(prev => prev.map(property => {
          if (property._id === selectedPropertyForReservation) {
            // Update the reservation in the property's reservationIds array
            return {
              ...property,
              reservationIds: [...(property.reservationIds || []), data.data.reservation._id]
            };
          }
          return property;
        }));
        
        setShowAddReservationModal(false);
        setSelectedPropertyForReservation('');
        setReservationError(null);
        // Reset form
        setAddReservationForm({
          totalPrice: '',
          paidAmount: '',
          remainingAmount: '',
          status: 'pending',
          isMarried: false,
          numberOfPeople: '',
          identityImages: [],
          notes: [],
          currentNote: ''
        });
        // Refresh orders to update their status after reservation is created
        await fetchOrders();
        addToast('تمت إضافة الحجز بنجاح', 'success');
      } else {
        // Revert optimistic update on failure
        await fetchProperties();
        
        // Handle detailed validation errors
        let errorMessage = 'Failed to add reservation';
        
        if (data.message) {
          errorMessage = data.message;
        }
        
        // Handle array of validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorDetails = data.errors.map((err: any) => {
if (err.msg && err.path) {
  return `${err.path}: ${err.msg}`;
}
return err.msg || JSON.stringify(err);
          }).join('\n');
          errorMessage = `Validation failed:\n${errorDetails}`;
        }
        
        setReservationError(errorMessage);
        addToast(errorMessage || 'فشل في إضافة الحجز', 'error');
      }
    } catch (error) {
      console.error('Failed to add reservation:', error);
      // Revert optimistic update on error
      await fetchProperties();
      setReservationError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsAddingReservation(false);
    }
  };

  const resetAddReservationForm = () => {
    const property = properties.find((p: any) => p._id === selectedPropertyForReservation);
    const isFamilyProperty = property?.propertyType === 'home' || property?.propertyType === 'villa';
    
    setAddReservationForm({
      totalPrice: '',
      paidAmount: '',
      remainingAmount: '',
      status: 'pending',
      isMarried: isFamilyProperty ? true : false, // Auto-set to married for family properties
      numberOfPeople: '',
      identityImages: [],
      notes: [],
      currentNote: ''
    });
    // Don't reset selectedPropertyForReservation here - it should stay set
  };

  const handleEditReservation = async (reservationData: {
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: string;
  }) => {
    setIsEditingReservation(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/reservations/${editingReservation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReservations(reservations.map(r => r._id === editingReservation._id ? data.data.reservation : r));
        
        // Update properties to refresh calendar with new reservation data
        setProperties(prev => prev.map(property => {
          if (property._id === editingReservation.propertyId) {
            // Update the reservation in the property's reservationIds array
            return {
              ...property,
              reservationIds: property.reservationIds?.map((resId: any) => 
                resId._id === editingReservation._id ? data.data.reservation : resId
              ) || []
            };
          }
          return property;
        }));
        
        setShowEditReservationModal(false);
        setEditingReservation(null);
        setReservationError(null);
        addToast('تم تحديث الحجز بنجاح', 'success');
      } else {
        setReservationError(data.message || 'Failed to update reservation');
        addToast(data.message || 'فشل في تحديث الحجز', 'error');
      }
    } catch (error) {
      console.error('Failed to update reservation:', error);
      setReservationError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsEditingReservation(false);
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReservations(reservations.filter(r => r._id !== reservationId));
      }
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  const openEditReservationModal = (reservation: any) => {
    setEditingReservation(reservation);
    setShowEditReservationModal(true);
  };

  const openReservationModal = (property: any) => {
    setSelectedPropertyForReservation(property._id);
    resetAddReservationForm();
    setShowAddReservationModal(true);
  };

  const fetchReservationDetails = async (type: string, id: string, name: string) => {
    setDetailsLoading(true);
    setShowReservationDetails(true);
    
    try {
      const token = localStorage.getItem('token');
      let url = `https://dmtart.pro/mimorent/api/admin/reservations?`;
      
      if (type === 'wilaya') {
        url += `wilayaId=${id}`;
      } else if (type === 'office') {
        url += `officeId=${id}`;
      } else if (type === 'employer') {
        url += `employerId=${id}`;
      }
      
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle nested data structure
        const reservationsData = data.data?.data || data.data || [];
        
        
        if (reservationsData && reservationsData.length > 0) {
        } else {
        }
        
        setDetailedReservations({
          type,
          name,
          reservations: reservationsData
        });
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
        } catch {
        }
      }
    } catch (error) {
    } finally {
      setDetailsLoading(false);
    }
  };

  const isPropertyReserved = (propertyId: string) => {
    return reservations.some((reservation: any) => {
      const reservationPropertyId = typeof reservation.propertyId === 'string' 
        ? reservation.propertyId 
        : reservation.propertyId?._id || reservation.propertyId.id;
      return reservationPropertyId === propertyId && 
 ['pending', 'confirmed', 'approved'].includes(reservation.status);
    });
  };

  const openEditPropertyModal = (property: any) => {
    setEditingProperty(property);
    setImageLinks(property.images || []);
    
    // Set the selected wilaya and office to match the property
    const wilayaId = property.wilayaId ? 
      (typeof property.wilayaId === 'string' ? property.wilayaId : property.wilayaId._id || property.wilayaId.id) : '';
    const officeId = property.officeId ? 
      (typeof property.officeId === 'string' ? property.officeId : property.officeId._id || property.officeId.id) : '';
    
    setSelectedWilaya(wilayaId);
    setSelectedOffice(officeId);
    setEditWilayaId(wilayaId);
    setEditOfficeId(officeId);
    setEditPropertyAvailable(property.available !== false);
    setEditMapUrl(property.locationGoogleMapLink || '');
    
    setShowEditPropertyModal(true);
  };

  // Image link management functions
  const addImageLink = () => {
    if (currentImageLink.trim() && !imageLinks.includes(currentImageLink.trim())) {
      setImageLinks([...imageLinks, currentImageLink.trim()]);
      setCurrentImageLink(''); // Clear input field after adding
    }
  };

  const removeImageLink = (index: number) => {
    setImageLinks(imageLinks.filter((_, i) => i !== index));
  };

  const handleImageLinkKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addImageLink();
    }
  };

  // Image navigation functions
  const nextImage = (propertyId: string) => {
    const property = properties.find((p: any) => p._id === propertyId);
    if (property && property.images && property.images.length > 1) {
      const currentIndex = currentImageIndex[propertyId] || 0;
      const nextIndex = (currentIndex + 1) % property.images.length;
      setCurrentImageIndex(prev => ({ ...prev, [propertyId]: nextIndex }));
    }
  };

  const prevImage = (propertyId: string) => {
    const property = properties.find((p: any) => p._id === propertyId);
    if (property && property.images && property.images.length > 1) {
      const currentIndex = currentImageIndex[propertyId] || 0;
      const prevIndex = currentIndex === 0 ? property.images.length - 1 : currentIndex - 1;
      setCurrentImageIndex(prev => ({ ...prev, [propertyId]: prevIndex }));
    }
  };

  const getCurrentImage = (propertyId: string) => {
    const property = properties.find((p: any) => p._id === propertyId);
    if (property && property.images && property.images.length > 0) {
      const currentIndex = currentImageIndex[propertyId] || 0;
      return property.images[currentIndex] || property.images[0];
    }
    return '';
  };

  const handleAddOffice = async (officeData: { name: string; address: string; phone: string; wilayaId: string }) => {
    try {
      setIsAddingOffice(true);
      
      // Clear previous errors
      setOfficeError(null);
      
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/offices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(officeData)
      });
      
      
      const data = await response.json();
      
      if (data.success) {
        setOffices([...offices, data.data.office]);
        setShowAddModal(false);
        addToast('تمت إضافة المكتب بنجاح', 'success');
      } else {
        console.error('Error adding office:', data);
        // Set error message for display
        setOfficeError(data.message || 'Failed to add office');
        addToast(data.message || 'فشل في إضافة المكتب', 'error');
      }
    } catch (error) {
      console.error('Failed to add office:', error);
      setOfficeError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsAddingOffice(false);
    }
  };

  const handleAddWilaya = async (wilayaData: { name: string; image?: string }) => {
    try {
      setIsAddingWilaya(true);
      
      // Clear previous errors
      setWilayaError(null);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/wilayas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(wilayaData)
      });

      
      if (response.ok) {
        const result = await response.json();
        // Handle different response structures
        const newWilaya = result.data?.wilaya || result.wilaya || result.data || result;
        setWilayas([...wilayas, newWilaya]);
        setShowAddModal(false);
        addToast('تمت إضافة الولاية بنجاح', 'success');
      } else {
        const error = await response.json();
        console.error('Error adding wilaya:', error);
        // Set error message for display
        setWilayaError(error.message || 'Failed to add wilaya');
        addToast(error.message || 'فشل في إضافة الولاية', 'error');
      }
    } catch (error) {
      console.error('Network error adding wilaya:', error);
      setWilayaError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsAddingWilaya(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Request more users to get all of them (not just 10)
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      if (response.status === 429) {
        setTimeout(() => fetchUsers(), 3000);
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        console.error('🔴 Users API error:', data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('🔴 Failed to fetch users:', error);
      setUsers([]);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    if (!authChecked) return; // Don't fetch if auth not checked
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch wilayas
        const wilayasResponse = await fetch('https://dmtart.pro/mimorent/api/admin/wilayas', {
          headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const wilayasData = await wilayasResponse.json();
        
        // Fetch offices
        const officesResponse = await fetch('https://dmtart.pro/mimorent/api/admin/offices', {
          headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const officesData = await officesResponse.json();
        
        if (wilayasData.success) {
          setWilayas(wilayasData.data.wilayas || []);
        }
        
        if (officesData.success) {
          setOffices(officesData.data.offices || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch history when history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  // Fetch financial stats when financial tab is active or filters change
  useEffect(() => {
    if (activeTab === 'financial') {
      // Make sure users are fetched when switching to financial tab
      fetchUsers();
      debouncedFetchFinancialStats();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (financialTimeoutId) {
        clearTimeout(financialTimeoutId);
      }
    };
  }, [activeTab, selectedWilayaForStats, selectedOfficeForStats, selectedEmployerForStats]);

  const handleAddUser = async (userData: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
    officeId: string;
    image: string 
  }) => {
    try {
      setIsAddingUser(true);
      
      // Clear previous errors
      setUserError(null);
      console.log(userData)
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const newUser = await response.json();
        
        // Refresh users list
        fetchUsers();
        
        setShowUserModal(false);
        addToast('تمت إضافة المستخدم بنجاح', 'success');
      } else {
        const error = await response.json();
        console.error('Error adding user:', error);
        
        // Set error message for display
        setUserError(error.message || 'Failed to add user');
        
        // Show more detailed toast message for existing user
        if (error.message?.includes('already exists')) {
          const existingUser = error.data;
          if (existingUser?.username === userData.username) {
            addToast(`اسم المستخدم "${userData.username}" مستخدم بالفعل من قبل ${existingUser.fullName}`, 'error');
          } else if (existingUser?.email === userData.email && userData.email) {
            addToast(`البريد الإلكتروني "${userData.email}" مستخدم بالفعل من قبل ${existingUser.fullName}`, 'error');
          } else if (!userData.email && existingUser?.email === '') {
            addToast(`المستخدم "${existingUser.fullName}" ليس لديه بريد إلكتروني أيضاً. يرجى إدخال بريد إلكتروني فريد.`, 'error');
          } else {
            addToast(error.message || 'فشل في إضافة المستخدم', 'error');
          }
        } else {
          addToast(error.message || 'فشل في إضافة المستخدم', 'error');
        }
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setUserError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleEditUser = async (userData: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    officeId: string;
    image: string;
    address: string;
  }) => {
    try {
      setIsEditingUser(true);
      
      // Clear previous errors
      setUserError(null);
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Refresh users list
        fetchUsers();
        
        setShowEditUserModal(false);
        setSelectedUser(null);
        addToast('تم تحديث المستخدم بنجاح', 'success');
      } else {
        const error = await response.json();
        console.error('Error updating user:', error);
        // Set error message for display
        setUserError(error.message || 'Failed to update user');
        addToast(error.message || 'فشل في تحديث المستخدم', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setUserError('Network error. Please check your connection.');
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    } finally {
      setIsEditingUser(false);
    }
  };

  const openUserModal = (office: any) => {
    setSelectedOfficeForUser(office);
    setUserError(null); // Clear previous errors
    setShowUserModal(true);
  };

  const openUserDetailsModal = (user: any) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const openAddModal = () => {
    setWilayaError(null); // Clear previous errors
    setOfficeError(null); // Clear previous errors
    setShowAddModal(true);
  };

  
  
  const handleEditWilaya = async (wilayaData: { name: string; image?: string }) => {
    try {
      
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/wilayas/${editingWilaya._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(wilayaData)
      });
      
      
      const data = await response.json();
      
      if (data.success) {
        setWilayas(wilayas.map(w => w._id === editingWilaya._id ? data.data.wilaya : w));
        setShowEditModal(false);
        setEditingWilaya(null);
      }
    } catch (error) {
      console.error('Failed to update wilaya:', error);
    }
  };

  const handleEditOffice = async (officeData: { name: string; address: string; phone: string; wilayaId: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/offices/${editingOffice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(officeData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOffices(offices.map(o => o._id === editingOffice._id ? data.data.office : o));
        setShowEditOfficeModal(false);
        setEditingOffice(null);
        addToast('تم تحديث المكتب بنجاح', 'success');
      } else {
        addToast(data.message || 'فشل في تحديث المكتب', 'error');
      }
    } catch (error) {
      console.error('Failed to update office:', error);
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    }
  };

  const handleDeleteWilaya = async (wilayaId: string) => {
    try {
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/wilayas/${wilayaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWilayas(wilayas.filter(w => w._id !== wilayaId));
        addToast('تم حذف الولاية بنجاح', 'success');
      } else {
        addToast(data.message || 'فشل في حذف الولاية', 'error');
      }
    } catch (error) {
      console.error('Failed to delete wilaya:', error);
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    }
  };

  const handleDeleteWilayaConfirmation = (wilayaId: string) => {
    const wilaya = wilayas.find(w => w._id === wilayaId);
    setDeleteConfirmation({
      type: 'wilaya',
      id: wilayaId,
      name: wilaya?.name || 'Unknown Wilaya'
    });
  };

  const handleDeleteOffice = async (officeId: string) => {
    try {
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/offices/${officeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOffices(offices.filter(o => o._id !== officeId));
        addToast('تم حذف المكتب بنجاح', 'success');
      } else {
        addToast(data.message || 'فشل في حذف المكتب', 'error');
      }
    } catch (error) {
      console.error('Failed to delete office:', error);
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    }
  };

  const handleDeleteOfficeConfirmation = (officeId: string) => {
    const office = offices.find(o => o._id === officeId);
    setDeleteConfirmation({
      type: 'office',
      id: officeId,
      name: office?.name || 'Unknown Office'
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`https://dmtart.pro/mimorent/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Update UI immediately by removing user from state
        setUsers(users.filter(u => u._id !== userId));
        addToast('تم حذف المستخدم بنجاح', 'success');
      } else {
        addToast(data.message || 'فشل في حذف المستخدم', 'error');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      addToast('خطأ في الشبكة. يرجى التحقق من اتصالك.', 'error');
    }
  };

  const handleDeleteUserConfirmation = (userId: string) => {
    const user = users.find(u => u._id === userId);
    setDeleteConfirmation({
      type: 'user',
      id: userId,
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Unknown User'
    });
  };

  const openEditModal = (office: any) => {
    setEditingOffice(office);
    setEditingWilaya(null);
    setShowEditModal(true);
  };

  const openEditOfficeModal = (office: any) => {
    setEditingOffice(office);
    setShowEditOfficeModal(true);
  };

  const openEditWilayaModal = (wilaya: any) => {
    setEditingWilaya(wilaya);
    setEditingOffice(null);
    setShowEditModal(true);
  };

  // Filter offices based on selected wilaya
  const isOfficeTab = activeTab === 'offices';
  const filteredOffices = selectedWilaya 
    ? offices.filter((office: any) => office.wilayaId?._id === selectedWilaya)
    : offices;

  // Filter users based on selected wilaya
  const filteredUsers = selectedWilaya 
    ? users.filter((user: any) => {
        const userOffice = offices.find((office: any) => office._id === user.officeId);
        return userOffice?.wilayaId?._id === selectedWilaya;
      })
    : users;

  // Don't render anything until auth is checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br pt-22 from-[#24697F] via-[#2a7d94] to-[#1e5f73] relative overflow-hidden">
      {/* Animated Background Pattern Overlay */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 animate-pulse" style={{
          backgroundImage: `
radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.35) 0%, transparent 50%)
          `,
          backgroundSize: '150% 150%',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <header className="relative flex justify-end z-10">
        <div className="px-4  sm:px-6 lg:px-8 pt-3 w-full md:w-[calc(100vw-16rem)] flex justify-center">
          <div className="flex items-center justify-center h-16 bg-white/12 backdrop-blur-lg w-full rounded-2xl shadow-lg border border-white/15">
{/* Logo and Menu Toggle */}
<div className="flex items-center">
  <button
    onClick={() => setSidebarOpen(!sidebarOpen)}
    className="text-white hover:text-white/80 transition-colors p-2 rounded-lg hover:bg-white/10 md:hidden lg:hidden"
  >
    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
  </button>
  
</div>

{/* Right Side Actions */}
<div className="flex items-center space-x-2 sm:space-x-4">
  <NotificationDropdown />
  <div className="flex items-center space-x-2 sm:space-x-3">
    <button
      onClick={() => setShowProfileModal(true)}
      className="flex items-center space-x-2 sm:space-x-3 hover:bg-white/10 rounded-xl p-2 transition-all duration-200"
    >
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/15">
        <UserCheck className="w-5 h-5 text-white" />
      </div>
      <span className="text-white font-medium hidden sm:block mx-2 text-sm">{t('admin.adminUser')}</span>
    </button>
  </div>
</div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10 ">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed w-64 h-screen inset-y-0 left-0 ${scrolled ? 'pt-0' : 'pt-20'} bg-white/12 backdrop-blur-xl border-r border-white/25 transition-all duration-300 ease-in-out z-50 shadow-2xl shadow-black/20`}>
          <nav className="p-2">
{menuItems.map((item) => {
  const Icon = item.icon;
  return (
    <button
      key={item.id}
      onClick={() => {
        setActiveTab(item.id);
        setSidebarOpen(false);
      }}
      className={`w-full  flex  items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        activeTab === item.id
          ? 'bg-gradient-to-r from-white/20 to-white/12 text-white border-l-4 border-white shadow-md shadow-white/10'
          : 'text-white/80 hover:bg-white/12 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium mx-2">{item.label}</span>
    </button>
  );
})}
<div className="pt-2 mt-2 border-t border-white/20">
  <button 
    onClick={handleLogout}
    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-red-500/15 hover:text-red-200 transition-all duration-300"
  >
    <LogOut className="w-5 h-5" />
    <span className="font-medium mx-2">{t('admin.logout')}</span>
  </button>
</div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-2  overflow-auto md:ml-64">
          <div className="relative">
{/* Wilayas Management */}
{activeTab === 'wilayas' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : wilayas.length === 0 ? (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 border border-white/20 text-center">
      <Building className="w-16 h-16 text-white/50 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">No Wilayas Found</h3>
      <p className="text-white/70 mb-6">Start by adding your first wilaya to manage your locations</p>
      <button
        onClick={openAddModal}
        className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-6 py-3 text-white font-medium transition-all hover:scale-105"
      >
        {t('admin.addWilaya')}
      </button>
    </div>
  ) : (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">جميع الولايات</h2>
        <button
          onClick={openAddModal}
          className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-4 py-2 text-white text-sm font-medium transition-all hover:scale-105"
        >
          إضافة ولاية جديدة
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          <thead>
<tr className="border-b border-white/20">
  <th className="text-left py-3 px-4">الصورة</th>
  <th className="text-left py-3 px-4">اسم الولاية</th>
  <th className="text-left py-3 px-4">الإجراءات</th>
</tr>
          </thead>
          <tbody>
{wilayas.map((wilaya) => (
  <tr key={wilaya._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
    <td className="py-3 px-4">
      {wilaya.image ? (
        <img 
          src={wilaya.image} 
          alt={wilaya.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Building className="w-6 h-6 text-white/50" />
        </div>
      )}
    </td>
    <td className="py-3 px-4">{wilaya.name}</td>
    <td className="py-3 px-4">
      <div className="flex space-x-2">
        <button 
          onClick={() => openEditWilayaModal(wilaya)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleDeleteWilayaConfirmation(wilaya._id)}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
))}
          </tbody>
        </table>
      </div>
    </div>
  )}

  {/* Edit Modal */}
  {showEditModal && (
    <div 
      className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-center justify-center z-70 p-4 sm:p-6 pt-24 modal-backdrop"
      onClick={() => {
        setShowEditModal(false);
        setEditingOffice(null);
        setEditingWilaya(null);
      }}
    >
      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
        
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
          
          <div className="relative flex-1">
<div className="inline-block">
  <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
    {editingOffice ? t('admin.editOffice') : t('admin.editWilaya')}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
  </h3>
  <div className="flex items-center text-gray-500">
    <div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>
    </div>
    <span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
      {editingOffice ? 'تعديل مكتب' : 'تعديل ولاية'}
    </span>
  </div>
</div>
          </div>
          
          <button
onClick={() => {
  setShowEditModal(false);
  setEditingOffice(null);
  setEditingWilaya(null);
}}
className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
<X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form
          onSubmit={(e) => {
e.preventDefault();
const formData = new FormData(e.target);
if (editingOffice) {
  const officeData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    phone: formData.get('phone') as string,
    wilayaId: formData.get('wilayaId') as string
  };
  handleEditOffice(officeData);
} else {
  const wilayaData = {
    name: formData.get('name') as string,
    image: formData.get('image') as string || undefined
  };
  handleEditWilaya(wilayaData);
}
          }}
          className="space-y-3"
        >
          {editingOffice ? (
<>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">Name</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input
        type="text"
        name="name"
        required
        defaultValue={editingOffice?.name || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
        placeholder={t('admin.enterOfficeName')}
      />
    </div>
  </div>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.address')}</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input
        type="text"
        name="address"
        required
        defaultValue={editingOffice?.address || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
        placeholder={t('admin.enterAddress')}
      />
    </div>
  </div>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">Phone</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input
        type="text"
        name="phone"
        required
        defaultValue={editingOffice?.phone || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
        placeholder={t('admin.enterPhone')}
      />
    </div>
  </div>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.wilaya')}</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <select
        name="wilayaId"
        defaultValue={editingOffice?.wilayaId?._id || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
      >
        <option value="">{t('admin.selectWilaya')}</option>
        {wilayas.map((wilaya) => (
          <option key={wilaya._id} value={wilaya._id}>
{wilaya.name}
          </option>
        ))}
      </select>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</>
          ) : (
<>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">Name</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input
        type="text"
        name="name"
        required
        defaultValue={editingWilaya?.name || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
        placeholder={debugT('admin.enterWilayaName')}
      />
    </div>
  </div>
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1 text-right">{debugT('admin.imageUrlOptional')}</label>
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <input
        type="url"
        name="image"
        defaultValue={editingWilaya?.image || ''}
        className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
        placeholder={debugT('admin.enterImageUrl')}
      />
    </div>
  </div>
</>
          )}
          
          {/* Footer Actions */}
          <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4">
<div className="flex gap-3">
  <button
    type="button"
    onClick={() => {
      setShowEditModal(false);
      setEditingOffice(null);
      setEditingWilaya(null);
    }}
    className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
  >
    {t('admin.cancel')}
  </button>
  <button
    type="submit"
    className="flex-1 px-4 py-2 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-xl font-medium transition-all duration-200 text-sm cursor-pointer border-2 border-white/60"
  >
    {editingOffice ? 'Update Office' : t('admin.updateWilaya')}
  </button>
</div>
          </div>
        </form>
        </div>
      </div>
    </div>
  )}
</div>
          )}

        {/* Offices Management */}
          {activeTab === 'offices' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : (
    <>
      {/* Wilayas Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
        <h2 className="text-xl text-center font-bold text-white mb-4">الولايات</h2>
        <div className="flex flex-wrap gap-3 mb-2">
          <button
key="all"
onClick={() => setSelectedWilaya(null)}
className={`px-4 py-2 rounded-full border-2 transition-all cursor-pointer ${
  selectedWilaya === null
    ? 'bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white border-white/60'
    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
}`}
          >
جميع المكاتب
          </button>
          {wilayas.map((wilaya) => (
<button
  key={wilaya._id}
  onClick={() => setSelectedWilaya(wilaya._id)}
  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 cursor-pointer ${
    selectedWilaya === wilaya._id
      ? 'bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white border-white/60'
      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
  }`}
>
  {wilaya.image ? (
    <img 
      src={wilaya.image} 
      alt={wilaya.name}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <Building className="w-6 h-6 text-white/50" />
  )}
  <span>{wilaya.name}</span>
</button>
          ))}
        </div>
      </div>

      {/* Offices List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
{selectedWilaya 
  ? ` ${wilayas.find(w => w._id === selectedWilaya)?.name}`
  : t('admin.allOffices')
}
          </h2>
          <button
onClick={() => {
  openAddModal();
}}
className="bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg px-4 py-2 text-white text-sm font-medium transition-all hover:scale-105"
          >
{t('admin.addNewOffice')}
          </button>
        </div>
        
        {filteredOffices.length === 0 ? (
          <div className="text-center py-12">
<Building className="w-16 h-16 text-white/50 mx-auto mb-4" />
<h3 className="text-xl font-semibold text-white mb-2">
  {selectedWilaya ? t('admin.noOfficesInWilaya') : t('admin.noOfficesFound')}
</h3>
<p className="text-white/70 mb-6">
  {selectedWilaya 
    ? `${t('admin.addFirstOffice')} ${wilayas.find(w => w._id === selectedWilaya)?.name}`
    : t('admin.startAddingFirstOffice')
  }
</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full text-white">
  <thead>
    <tr className="border-b border-white/60">
      <th className="text-left py-3 px-4">الصورة</th>
      <th className="text-left py-3 px-4">اسم</th>
      <th className="text-left py-3 px-4">العنوان</th>
      <th className="text-left py-3 px-4">رقم الهاتف</th>
      <th className="text-left py-3 px-4">الولاية</th>
      <th className="text-left py-3 px-4">الإجراءات</th>
    </tr>
  </thead>
  <tbody>
    {filteredOffices.map((office) => (
      <tr key={office._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
        <td className="py-3 px-4">
          {office.image ? (
<img 
  src={office.image} 
  alt={office.name}
  className="w-12 h-12 rounded-lg object-cover"
/>
          ) : (
<div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
  <Building className="w-6 h-6 text-white/50" />
</div>
          )}
        </td>
        <td className="py-3 px-4">{office.name}</td>
        <td className="py-3 px-4">{office.address}</td>
        <td className="py-3 px-4">{office.phone}</td>
        <td className="py-3 px-4">
          {office.wilayaId ? (
<span className="text-blue-300">{office.wilayaId.name}</span>
          ) : (
<span className="text-gray-400">No Wilaya</span>
          )}
        </td>
        <td className="py-3 px-4">
          <div className="flex flex-wrap gap-1">
<button 
  onClick={() => openEditOfficeModal(office)}
  className="text-white/60 hover:text-white transition-colors"
>
  <Edit className="w-4 h-4" />
</button>
<button 
  onClick={() => handleDeleteOfficeConfirmation(office._id)}
  className="text-red-400 hover:text-red-300 transition-colors"
>
  <Trash2 className="w-4 h-4" />
</button>
          </div>
          <div className="mt-2">
<span className="text-xs text-white/60">{t('admin.users')}:</span>
<div className="flex flex-wrap gap-1 mt-1">
  {users
    .filter(user => user.officeId === office._id)
    .map((user) => (
      <button
        key={user._id}
        className="relative"
        title={`${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.name || 'Unknown'} - ${user.role || 'No Role'}`}
      >
        {user.image ? (
          <img 
src={user.image} 
alt={user.firstName || user.username || 'User'}
className="w-8 h-8 rounded-full object-cover border border-white/30"
          />
        ) : (
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
<Users className="w-4 h-4 text-white/70" />
          </div>
        )}
        {/* User role indicator */}
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border border-white/30 flex items-center justify-center">
          <span className="text-[8px] text-white leading-none">
{user.role === 'admin' ? 'A' : user.role === 'employer' ? 'E' : 'U'}
          </span>
        </div>
      </button>
    ))}
  {users.filter(user => user.officeId === office._id).length === 0 && (
    <div className="flex items-center justify-center w-full py-2">
      <span className="bg-white/10 text-white/60 text-xs px-2 py-1 rounded-full">
        لا يوجد مستخدمين
      </span>
    </div>
  )}
</div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          </div>
        )}
      </div>
    </>
  )}
</div>
          )}

          {/* Add Modal - Shared between tabs */}
          {showAddModal && (
<div 
  className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-70 p-4 sm:p-6 modal-backdrop"
  onClick={() => setShowAddModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-2xl mt-4 rounded-3xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[10000]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
    
    {/* Header */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
      
      <div className="relative flex-1">
        <div className="inline-block">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
{isOfficeTab ? debugT('admin.addNewOffice') : debugT('admin.addWilaya')}
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
          </h3>
          <div className="flex items-center text-gray-500">
<div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
</div>
<span className="text-xs text-center font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
  {isOfficeTab ? 'إضافة مكتب جديد' : 'إضافة ولاية جديدة'}
</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowAddModal(false)}
        className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        if (isOfficeTab) {
          handleAddOffice({
name: formData.get('name') as string,
address: formData.get('address') as string,
phone: formData.get('phone') as string,
wilayaId: formData.get('wilayaId') as string
          });
        } else {
          handleAddWilaya({
name: formData.get('name') as string,
image: formData.get('image') as string || undefined
          });
        }
      }}
      className="space-y-3"
    >
      {isOfficeTab ? (
        <>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.officeName')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="name"
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder={t('admin.enterOfficeName')}
  />
</div>
          </div>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.address')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="address"
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder={t('admin.enterAddress')}
  />
</div>
          </div>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.phoneNumber')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="phone"
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder={t('admin.enterPhone')}
  />
</div>
          </div>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{t('admin.wilaya')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <select
    name="wilayaId"
    required
    defaultValue={selectedWilaya || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
  >
    <option value="">{t('admin.selectWilaya')}</option>
    {wilayas.map((wilaya) => (
      <option key={wilaya._id} value={wilaya._id}>
        {wilaya.name}
      </option>
    ))}
  </select>
  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
          </div>
        </>
      ) : (
        <>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{debugT('admin.wilayaName')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="name"
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder={debugT('admin.enterWilayaName')}
  />
</div>
          </div>
          <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">{debugT('admin.imageUrlOptional')}</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="url"
    name="image"
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder={debugT('admin.enterImageUrl')}
  />
</div>
          </div>
        </>
      )}
      
      {/* Error Display */}
      {(isOfficeTab ? officeError : wilayaError) && (
        <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-xl border border-red-200/50 backdrop-blur-sm p-3">
          <div className="flex items-center text-red-700">
<svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
</svg>
<span className="text-xs font-medium">
  {isOfficeTab ? officeError : wilayaError}
</span>
          </div>
        </div>
      )}
      
      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4">
        <div className="flex gap-3">
          <button
type="button"
onClick={() => setShowAddModal(false)}
className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
{t('admin.cancel')}
          </button>
          <button
type="submit"
disabled={isOfficeTab ? isAddingOffice : isAddingWilaya}
className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
  (isOfficeTab && isAddingOffice) || (!isOfficeTab && isAddingWilaya) ? 'opacity-75 cursor-not-allowed' : ''
}`}
          >
{isOfficeTab && isAddingOffice ? (
  <>
    <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
    </div>
    جارٍ الإضافة...
  </>
) : !isOfficeTab && isAddingWilaya ? (
  <>
    <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
    </div>
    جارٍ الإضافة...
  </>
) : (
  <>
    {isOfficeTab ? t('admin.addNewOffice') : t('admin.addWilaya')}
  </>
)}
          </button>
        </div>
      </div>
    </form>
    </div>
  </div>
</div>
          )}

          {/* Users Management */}
          {activeTab === 'users' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : (
    <>
      {/* Wilayas Filter for Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white">الولايات</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
key="all"
onClick={() => setSelectedWilaya(null)}
className={`px-4 py-2 rounded-full border-2 transition-all ${
  selectedWilaya === null
    ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
}`}
          >
جميع المكاتب
          </button>
          {wilayas.map((wilaya) => (
<button
  key={wilaya._id}
  onClick={() => setSelectedWilaya(wilaya._id)}
  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
    selectedWilaya === wilaya._id
      ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
  }`}
>
  {wilaya.name}
</button>
          ))}
        </div>
      </div>

      {/* Offices with Users */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
{selectedWilaya 
  ? `${t('admin.offices')} ${wilayas.find(w => w._id === selectedWilaya)?.name}`
  : t('admin.allOffices')
}
          </h2>
        </div>
        
        {filteredOffices.length === 0 ? (
          <div className="text-center py-12">
<Building className="w-16 h-16 text-white/50 mx-auto mb-4" />
<h3 className="text-xl font-semibold text-white mb-2">
  {selectedWilaya ? t('admin.noOfficesInWilaya') : t('admin.noOfficesFound')}
</h3>
<p className="text-white/70 mb-6">
  {selectedWilaya 
    ? `${t('admin.addFirstOffice')} ${wilayas.find(w => w._id === selectedWilaya)?.name}`
    : t('admin.startAddingFirstOffice')
  }
</p>
          </div>
        ) : (
          <div className="space-y-4">
{filteredOffices.map((office) => (
  <div key={office._id} className="bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{office.name}</h3>
        <p className="text-white/60 text-sm">{office.address}</p>
      </div>
      <button 
        onClick={() => openUserModal(office)}
        className="bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600 border-2 border-white/60 hover:bg-green-700 text-white px-3 py-1 rounded-full cursor-pointer text-sm transition-colors"
      >
        إضافة مستخدم للمكتب
      </button>
    </div>
    
    {/* Users List - User Icons */}
    <div className="border-t border-white/10 pt-3">
      <h4 className="text-sm font-medium text-white/80 mb-2">المستخدمون في المكتب:</h4>
      <div className="flex flex-wrap gap-2">
        {users
          .filter(user => user.officeId === office._id)
          .map((user) => (
<button
  key={user._id}
  onClick={() => openUserDetailsModal(user)}
  className="relative group"
  title={`${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.name || 'Unknown'} - ${user.role || 'No Role'}`}
>
  {user.image ? (
    <div className="w-10 h-10 rounded-full border-2 border-white/30 hover:border-blue-400 transition-all hover:scale-110 cursor-pointer overflow-hidden bg-gray-800">
      <img 
        src={user.image} 
        alt={user.firstName || user.username || 'User'}
        className="w-full h-full object-contain"
      />
    </div>
  ) : (
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 hover:border-blue-400 transition-all hover:scale-110 cursor-pointer">
      <Users className="w-5 h-5 text-white/70" />
    </div>
  )}
  {/* User role indicator */}
  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white/30 flex items-center justify-center">
    <span className="text-xs text-white">
      {user.role === 'admin' ? 'A' : user.role === 'employer' ? 'E' : 'U'}
    </span>
  </div>
  {/* Delete button - shows on hover */}
  <div
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteUserConfirmation(user._id);
    }}
    className="absolute -top-4 -left-3 w-5 h-5 bg-red-500 rounded-full border border-white/30 flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:scale-110 z-[99999] cursor-pointer"
    title="حذف المستخدم"
  >
    <X className="w-3 h-3 text-white" />
  </div>
</button>
          ))}
        {users.filter(user => user.officeId === office._id).length === 0 && (
          <div className="flex items-center justify-center w-full py-4">
<span className="bg-white/10 text-white/60 text-xs px-3 py-2 rounded-full">
  لا يوجد مستخدمين
</span>
          </div>
        )}
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </>
  )}
</div>
          )}

          {/* User Details Modal */}
          {showUserDetailsModal && selectedUser && (
<div 
  className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-[9999999] p-4 sm:p-6 pt-24 modal-backdrop pointer-events-none"
  onClick={() => setShowUserDetailsModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[75vh] flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[9999999] overflow-hidden pointer-events-auto"
    onClick={(e) => e.stopPropagation()}
  >
    
    {/* Header */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden flex-shrink-0">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
      
      <div className="relative flex-1">
        <div className="inline-block">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
تفاصيل المستخدم
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
          </h3>
          <div className="flex items-center text-gray-500">
<div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
</div>
<span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
  معلومات المستخدم
</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowUserDetailsModal(false)}
        className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
      </button>
    </div>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl backdrop-blur-sm border border-gray-200/30">
        {selectedUser.image ? (
          <img 
src={selectedUser.image} 
alt={selectedUser.firstName || selectedUser.username || 'User'}
className="w-20 h-20 rounded-full object-cover border-4 border-white/50 shadow-lg"
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-4 border-white/50 shadow-lg">
<Users className="w-10 h-10 text-gray-600" />
          </div>
        )}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
{selectedUser.firstName && selectedUser.lastName 
  ? `${selectedUser.firstName} ${selectedUser.lastName}` 
  : selectedUser.username || selectedUser.name || 'Unknown User'
}
          </h4>
          <p className="text-gray-600 text-sm">{selectedUser.email || 'N/A'}</p>
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm rounded-full mt-2 border border-blue-300/50">
{selectedUser.role || 'No Role'}
          </span>
        </div>
      </div>

      {/* User Details */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">اسم المستخدم:</span>
          <span className="text-gray-800 font-medium text-sm">
{selectedUser.username || selectedUser.name || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">البريد الإلكتروني:</span>
          <span className="text-gray-800 font-medium text-sm">{selectedUser.email || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">رقم الهاتف:</span>
          <span className="text-gray-800 font-medium text-sm">{selectedUser.phone || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">المكتب:</span>
          <span className="text-gray-800 font-medium text-sm">
{offices.find(o => o._id === selectedUser.officeId)?.name || 'N/A'}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">الولاية:</span>
          <span className="text-gray-800 font-medium text-sm">
{(() => {
  const userOffice = offices.find(o => o._id === selectedUser.officeId);
  const userWilaya = wilayas.find(w => w._id === userOffice?.wilayaId || userOffice?.wilayaId?._id);
  return userWilaya?.name || 'N/A';
})()}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-4 bg-gray-50/50 rounded-xl border border-gray-200/30">
          <span className="text-gray-600 text-sm font-medium">الحالة:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
selectedUser.isActive 
  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300/50' 
  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300/50'
          }`}>
{selectedUser.isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4">
        <div className="flex gap-3">
          <button
type="button"
onClick={() => setShowUserDetailsModal(false)}
className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
إغلاق
          </button>
          <button
type="button"
onClick={() => {
  setShowUserDetailsModal(false);
  setShowEditUserModal(true);
}}
className="flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm"
          >
تعديل
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
          )}

          {/* Edit User Modal */}
          {showEditUserModal && selectedUser && (
<div 
  className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-70 p-4 sm:p-6 pt-24 modal-backdrop"
  onClick={() => setShowEditUserModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[100000]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
    
    {/* Header */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
      
      <div className="relative flex-1">
        <div className="inline-block">
          <h3 className="text-xl font-semibold mt-2 text-gray-900 leading-tight mb-1 relative">
            تعديل المستخدم - {selectedUser.fullName || selectedUser.firstName + ' ' + selectedUser.lastName}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
          </h3>
          <div className="flex items-center text-gray-500">
<div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
</div>
<span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
  تعديل معلومات المستخدم
</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowEditUserModal(false)}
        className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
      </button>
    </div>
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const userData = {
          username: formData.get('username') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          role: formData.get('role') as string,
          officeId: formData.get('officeId') as string,
          image: formData.get('image') as string,
          address: formData.get('address') as string
        };
        
        handleEditUser(userData);
      }}
      className="flex-1 overflow-y-auto"
    >
      <div className="p-4 sm:p-6 space-y-3">
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">اسم المستخدم (للتسجيل)</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="username"
    defaultValue={selectedUser.username || ''}
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل اسم المستخدم للتسجيل"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">الاسم الأول</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="firstName"
    defaultValue={selectedUser.firstName || ''}
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل الاسم الأول"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">الاسم الأخير</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="lastName"
    defaultValue={selectedUser.lastName || ''}
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل الاسم الأخير"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="email"
    name="email"
    defaultValue={selectedUser.email || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل البريد الإلكتروني"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">صورة المستخدم</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="image"
    defaultValue={selectedUser.image || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل رابط الصورة"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">رقم الهاتف</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="tel"
    name="phone"
    defaultValue={selectedUser.phone || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل رقم الهاتف"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">العنوان</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <input
    type="text"
    name="address"
    defaultValue={selectedUser.address || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
    placeholder="أدخل العنوان"
  />
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">المكتب</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <select
    name="officeId"
    defaultValue={selectedUser.officeId || ''}
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
  >
    <option value="">اختر مكتب</option>
    {filteredOffices.map((office) => (
<option key={office._id} value={office._id}>
  {office.name}
</option>
    ))}
  </select>
</div>
      </div>
      
      <div>
<label className="block text-xs font-medium text-gray-700 mb-1 text-right">دور المستخدم</label>
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <select
    name="role"
    defaultValue={selectedUser.role || ''}
    required
    className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
        >
    <option value="">اختر دور المستخدم</option>
    <option value="employer">موظف</option>
  </select>
</div>
      </div>

      {/* Error Display */}
      {userError && (
        <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-xl border border-red-200/50 backdrop-blur-sm p-3">
          <div className="flex items-center text-red-700">
<svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
</svg>
<span className="text-xs font-medium">
  {userError}
</span>
          </div>
        </div>
      )}
      
      </div>
      
      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm">
        <div className="flex gap-3">
          <button
type="button"
onClick={() => setShowEditUserModal(false)}
className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
{t('admin.cancel')}
          </button>
          <button
type="submit"
disabled={isEditingUser}
className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
  isEditingUser ? 'opacity-75 cursor-not-allowed' : ''
}`}
          >
{isEditingUser ? (
  <>
    <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
    </div>
    جارٍ التحديث...
  </>
) : (
  <>
    تحديث المستخدم
  </>
)}
          </button>
        </div>
      </div>
    </form>
    </div>
  </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmation.type && (
<div 
  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
  onClick={() => setDeleteConfirmation({ type: null, id: null, name: null })}
>
  <div 
    className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md relative z-[100000] max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl transform transition-all duration-300 ease-out"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-pulse shadow-lg">
        <Trash2 className="w-6 h-6 text-red-600 animate-bounce" />
      </div>
    </div>
    
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      {deleteConfirmation.type === 'office' ? 'حذف المكتب' : 
       deleteConfirmation.type === 'wilaya' ? 'حذف الولاية' : 
       deleteConfirmation.type === 'property' ? 'حذف العقار' : 
       'حذف المستخدم'}
    </h3>
    
    <p className="text-gray-600 mb-6">
      هل أنت متأكد من أنك تريد حذف {
        deleteConfirmation.type === 'office' ? 'المكتب' : 
        deleteConfirmation.type === 'wilaya' ? 'الولاية' : 
        deleteConfirmation.type === 'property' ? 'العقار' : 
        'المستخدم'
      } "{deleteConfirmation.name || ''}"؟
    </p>
    
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={() => setDeleteConfirmation({ type: null, id: null, name: null })}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transform hover:scale-105 transition-all duration-200 ease-out font-medium"
      >
        إلغاء
      </button>
      <button
        type="button"
        onClick={() => {
          if (deleteConfirmation.type === 'office') {
handleDeleteOffice(deleteConfirmation.id!);
          } else if (deleteConfirmation.type === 'wilaya') {
handleDeleteWilaya(deleteConfirmation.id!);
          } else if (deleteConfirmation.type === 'property') {
executeDeleteProperty(deleteConfirmation.id!);
          } else if (deleteConfirmation.type === 'user') {
handleDeleteUser(deleteConfirmation.id!);
          }
          setDeleteConfirmation({ type: null, id: null, name: null });
        }}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-out font-medium"
      >
        تأكيد الحذف
      </button>
    </div>
  </div>
</div>
          )}

          
          {/* Edit Office Modal */}
          {showEditOfficeModal && editingOffice && (
<div 
  className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-start justify-center z-70 p-4 sm:p-6 pt-24 modal-backdrop"
  onClick={() => setShowEditOfficeModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[100000]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
    
    {/* Header */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
      
      <div className="relative flex-1">
        <div className="inline-block">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
تعديل المكتب
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
          </h3>
          <div className="flex items-center text-gray-500">
<div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
</div>
<span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
  تعديل معلومات المكتب
</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowEditOfficeModal(false)}
        className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const officeData = {
          name: formData.get('name') as string,
          address: formData.get('address') as string,
          phone: formData.get('phone') as string,
          wilayaId: formData.get('wilayaId') as string
        };
        handleEditOffice(officeData);
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">اسم المكتب</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="name"
required
defaultValue={editingOffice?.name || ''}
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل اسم المكتب"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">العنوان</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="address"
required
defaultValue={editingOffice?.address || ''}
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل العنوان"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">رقم الهاتف</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="phone"
required
defaultValue={editingOffice?.phone || ''}
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل رقم الهاتف"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">الولاية</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
name="wilayaId"
defaultValue={editingOffice?.wilayaId?._id || ''}
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
<option value="">اختر الولاية</option>
{wilayas.map((wilaya) => (
  <option key={wilaya._id} value={wilaya._id}>
    {wilaya.name}
  </option>
))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
</svg>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4">
        <div className="flex gap-3">
          <button
type="button"
onClick={() => {
  setShowEditOfficeModal(false);
  setEditingOffice(null);
}}
className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
إلغاء
          </button>
          <button
type="submit"
className="flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm"
          >
تحديث المكتب
          </button>
        </div>
      </div>
    </form>
    </div>
  </div>
</div>
          )}

          {/* Properties Management */}
          {activeTab === 'properties' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : (
    <>
      {/* Wilayas Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">الولايات</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            تحديث
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
key="all"
onClick={() => setSelectedWilaya(null)}
className={`px-4 py-2 rounded-full border-2 transition-all ${
  selectedWilaya === null
    ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
}`}
          >
جميع العقارات
          </button>
          {wilayas.map((wilaya) => (
<button
  key={wilaya._id}
  onClick={() => setSelectedWilaya(wilaya._id)}
  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
    selectedWilaya === wilaya._id
      ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
  }`}
>
  {wilaya.image ? (
    <img 
      src={wilaya.image} 
      alt={wilaya.name}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <Building className="w-6 h-6 text-white/50" />
  )}
  {wilaya.name}
</button>
          ))}
        </div>

        {/* Offices Filter */}
        {selectedWilaya && (
          <div>
<h3 className="text-lg font-semibold text-white mb-4">المكاتب</h3>
<div className="flex flex-wrap gap-4 sm:p-6 mb-6">
  {offices
    .filter((office: any) => office.wilayaId?._id === selectedWilaya)
    .map((office: any) => (
      <button
        key={office._id}
        onClick={() => setSelectedOffice(office._id)}
        className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
          selectedOffice === office._id
? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white shadow-lg shadow-blue-600/30'
: 'bg-white/20 text-white border-white/40 hover:bg-white/30 hover:border-white/60'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          selectedOffice === office._id 
? 'bg-white/20' 
: 'bg-white/10'
        }`}>
          <Building className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-center">{office.name}</span>
        <span className="text-xs opacity-75 mt-1">
          {users.filter((user: any) => user.officeId === office._id).length} مستخدم
        </span>
      </button>
    ))}
</div>
{/* Add Property Button - Only show when office is selected */}
{selectedOffice && (
  <div className="flex justify-end">
    <button
      onClick={() => setShowAddPropertyModal(true)}
      className="px-6 py-3 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-xl hover:from-[#3a8faf] hover:to-[#2d9f5d] cursor-pointer border-2 border-white/60 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/30 flex items-center gap-2"
    >
      <Home className="w-5 h-5" />
      إضافة عقار
    </button>
  </div>
)}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties
          .filter((property: any) => {
           
if (!selectedWilaya) return true;
if (!selectedOffice) return false;
// Handle both ObjectId and populated object cases
return property.officeId?._id === selectedOffice || 
       property.officeId?.id === selectedOffice ||
       property.officeId?.toString() === selectedOffice;
          })
          .map((property: any) => (
<div key={property._id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
  {/* Property Image */}
  <div className="relative w-full aspect-[4/2] bg-gray-900 overflow-hidden">
    {property.images && property.images.length > 0 ? (
      <>
        <img 
          src={getCurrentImage(property._id)} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Buttons - Show for testing */}
        {property.images && property.images.length > 0 && (
          <>
{/* Previous Button */}
<button
  onClick={() => {
    prevImage(property._id);
  }}
  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
</button>
{/* Next Button */}
<button
  onClick={() => {
    nextImage(property._id);
  }}
  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>
{/* Image Counter */}
<div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
  {(currentImageIndex[property._id] || 0) + 1} / {property.images.length}
</div>
          </>
        )}
      </>
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-300">
        <Home className="w-12 h-12 text-gray-400" />
      </div>
    )}
    <div className="absolute top-2 right-2">
      <span className={`px-2 py-1 rounded-full text-xs ${
        property.available 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {property.available ? 'متاح' : 'غير متاح'}
      </span>
    </div>
  </div>
  
  {/* Property Details */}
  <div className="p-4 sm:p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-white">{property.title}</h3>
      {property.isReserved && (
        <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center">
          <Calendar className="w-3 h-3 ml-1" />
          محجوز
        </span>
      )}
    </div>
    <div className="flex items-center gap-2 mb-2">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        property.propertyType === 'home' 
          ? 'bg-blue-500/20 text-blue-300' 
          : property.propertyType === 'villa'
          ? 'bg-green-500/20 text-green-300'
          : 'bg-orange-500/20 text-orange-300'
      }`}>
        {property.propertyType === 'home' ? 'منزل' : 
         property.propertyType === 'villa' ? 'فيلا' : 'قاراج'}
      </span>
      <span className="text-white/60 text-sm">
        {offices.find((office: any) => {
          const propertyOfficeId = typeof property.officeId === 'string' 
? property.officeId 
: property.officeId?._id || property.officeId.id;
          return office._id === propertyOfficeId;
        })?.name || 'Unknown Office'}
      </span>
    </div>
    <p className="text-white/80 text-sm mb-3 line-clamp-2">{property.description}</p>
    <div className="flex items-center justify-between mb-3">
      <span className="text-blue-300 font-bold">{property.pricePerDay} دج/يوم</span>
    </div>
    
    {/* Action Buttons */}
    <div className="flex gap-2">
      <button
        onClick={() => openEditPropertyModal(property)}
        className="flex-1 px-3 py-2 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all text-sm border-2 border-white/60 cursor-pointer"
      >
        تعديل
      </button>
      <button
        onClick={() => handleDeleteProperty(property._id)}
        className="flex-1 px-3 py-2 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all text-sm border-2 border-white/60 cursor-pointer"
      >
        حذف
      </button>
    </div>
    
      </div>
</div>
          ))}
      </div>

      {properties.filter((property: any) => {
        if (!selectedWilaya) return true;
        if (!selectedOffice) return false;
        return property.officeId?._id === selectedOffice || 
   property.officeId?.id === selectedOffice ||
   property.officeId?.toString() === selectedOffice;
      }).length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">
{!selectedOffice 
  ? 'الرجاء اختيار مكتب لعرض العقارات' 
  : 'لا توجد عقارات في هذا المكتب'
}
          </p>
        </div>
      )}
    </>
  )}
</div>
          )}

          {/* Add User Modal */}
          {showUserModal && (
<div 
  className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-70 p-4 sm:p-6 pt-24 modal-backdrop"
  onClick={() => setShowUserModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[75vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative z-[100000]"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
    
    {/* Header */}
    <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
      
      <div className="relative flex-1">
        <div className="inline-block">
          <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
{selectedOfficeForUser ? 
  `${t('admin.addUser')} - ${selectedOfficeForUser.name}` 
  : t('admin.addUser')
}
<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
          </h3>
          <div className="flex items-center text-gray-500">
<div className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm">
  <svg fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
</div>
<span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">
  إضافة مستخدم جديد
</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setShowUserModal(false)}
        className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        handleAddUser({
          username: formData.get('username') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          phone: formData.get('phone') as string,
          role: formData.get('role') as string,
          officeId: formData.get('officeId') as string,
          image: formData.get('image') as string
        });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">اسم المستخدم (للتسجيل)</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="username"
required
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل اسم المستخدم للتسجيل"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">الاسم الأول</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="firstName"
required
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل الاسم الأول"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">الاسم الأخير</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="lastName"
required
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل الاسم الأخير"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="email"
name="email"
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل البريد الإلكتروني"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">كلمة المرور</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="password"
name="password"
required
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل كلمة المرور"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">صورة المستخدم</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="image"
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل رابط الصورة (اختياري)"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">رقم الهاتف</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="tel"
name="phone"
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل رقم الهاتف"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">العنوان</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
type="text"
name="address"
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
placeholder="أدخل العنوان"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">المكتب</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
name="officeId"
required
value={selectedOfficeForUser?._id || ''}
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
<option value="">اختر مكتب</option>
{filteredOffices.map((office) => (
  <option key={office._id} value={office._id}>
    {office.name}
  </option>
))}
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
</svg>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1 text-right">دور المستخدم</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
name="role"
required
className="relative w-full px-3 py-2 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
<option value="">اختر دور المستخدم</option>
<option value="employer">موظف</option>
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
</svg>
          </div>
        </div>
      </div>
      
      {/* Error Display */}
      {userError && (
        <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 rounded-xl border border-red-200/50 backdrop-blur-sm p-3">
          <div className="flex items-center text-red-700">
<svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
</svg>
<span className="text-xs font-medium">{userError}</span>
          </div>
        </div>
      )}
      
      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4">
        <div className="flex gap-3">
          <button
type="button"
onClick={() => setShowUserModal(false)}
className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
{t('admin.cancel')}
          </button>
          <button
type="submit"
disabled={isAddingUser}
className={`flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
  isAddingUser ? 'opacity-75 cursor-not-allowed' : ''
}`}
          >
{isAddingUser ? (
  <>
    <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
      <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
    </div>
    جارٍ الإضافة...
  </>
) : (
  <>
    {t('admin.addUser')}
  </>
)}
          </button>
        </div>
      </div>
    </form>
    </div>
  </div>
</div>
          )}

          {/* Add Property Modal */}
          {showAddPropertyModal && (
<div 
  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
  onClick={() => setShowAddPropertyModal(false)}
>
  <div  
    className="bg-white/95  backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-5xl lg:max-w-4xl md:max-w-3xl sm:max-w-full mx-4 relative z-[100000] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e1 #f1f5f9',
      direction: 'ltr'
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
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl border border-white/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">إضافة عقار جديد</h3>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              أدخل معلومات العقار الجديد
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddPropertyModal(false)}
          className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-300 group border border-white/30"
        >
          <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    {/* Error Message */}
    {propertyError && (
      <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">خطأ في الإضافة</p>
            <p className="text-xs text-red-600 mt-1">{propertyError}</p>
          </div>
        </div>
      </div>
    )}
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setPropertyError(null); // Clear previous error
        
        const formData = new FormData(e.target);
        const propertyData = {
          title: formData.get('title') as string,
          location: formData.get('location') as string,
          description: formData.get('description') as string,
          propertyType: formData.get('propertyType') as string,
          pricePerDay: Number(formData.get('pricePerDay')),
          reserveTheProperty: formData.get('reserveTheProperty') as string || 'daily',
          locationGoogleMapLink: formData.get('locationGoogleMapLink') as string || '',
          priceBeforeDiscountPerDay: formData.get('priceBeforeDiscountPerDay') ? Number(formData.get('priceBeforeDiscountPerDay')) : undefined,
          capacity: formData.get('capacity') ? Number(formData.get('capacity')) : undefined,
          targetAudience: formData.get('targetAudience') as string || 'both',
          images: imageLinks,
          wilayaId: formData.get('wilayaId') as string,
          officeId: formData.get('officeId') as string,
          available: addPropertyAvailable
        };
        handleAddProperty(propertyData);
      }}
      className="p-6 space-y-6"
    >
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#24697f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          عنوان العقار
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="title"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-200 bg-gray-50/50 hover:bg-white group-hover:border-gray-300"
            placeholder="أدخل عنوان العقار"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#24697f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          موقع العقار
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="location"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-200 bg-gray-50/50 hover:bg-white group-hover:border-gray-300"
            placeholder="أدخل موقع العقار (الشارع، الحي، المدينة)"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">رابط خرائط جوجل (اختياري)</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="url"
            name="locationGoogleMapLink"
            value={addMapUrl}
            onChange={(e) => setAddMapUrl(e.target.value)}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل رابط خرائط جوجل"
          />
        </div>
        <GoogleMapPreview mapUrl={addMapUrl} className="mt-3" onLocationSelect={handleAddLocationSelect} />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">نوع الحجز</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="reserveTheProperty"
            value={addReservationType}
            onChange={(e) => handleAddReservationTypeChange(e.target.value)}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="daily">يومي</option>
            <option value="monthly">شهري</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Price Fields - moved under reservation type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
          {addReservationType === 'monthly' ? 'السعر باليوم (دج)' : 'السعر باليوم (دج)'}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="pricePerDay"
            required
            min="0"
            onChange={(e) => addReservationType === 'monthly' ? handleAddDailyPriceChange(e.target.value) : undefined}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل السعر باليوم"
          />
        </div>
      </div>
      
      {addReservationType === 'monthly' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
            السعر بالشهر (دج)
            <span className="text-xs text-gray-500 mr-2">(بالسعر اليومي × 30 يوم - بالتقريب)</span>
            {addMonthlyPrice && (
              <span className="text-xs text-blue-600 mr-2 block">
                القيمة الحقيقية: {calculateDailyFromMonthly(addMonthlyPrice)} يومي
              </span>
            )}
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="number"
              name="monthlyPrice"
              value={addMonthlyPrice}
              onChange={(e) => handleAddMonthlyPriceChange(e.target.value)}
              min="0"
              className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
              placeholder="أدخل السعر بالشهر"
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
          {addReservationType === 'monthly' ? 'السعر قبل الخصم باليوم (دج) (اختياري)' : 'السعر قبل الخصم باليوم (دج) (اختياري)'}
          {addReservationType === 'monthly' && addMonthlyDiscountPrice && (
            <span className="text-xs text-blue-600 mr-2 block">
              القيمة الحقيقية: {calculateDailyFromMonthly(addMonthlyDiscountPrice)} يومي
            </span>
          )}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="priceBeforeDiscountPerDay"
            min="0"
            onChange={(e) => addReservationType === 'monthly' ? handleAddDailyDiscountPriceChange(e.target.value) : undefined}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل السعر قبل الخصم"
          />
        </div>
      </div>
      
      {addReservationType === 'monthly' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
            السعر قبل الخصم بالشهر (دج) (اختياري)
            <span className="text-xs text-gray-500 mr-2">(بالسعر اليومي × 30 يوم - بالتقريب)</span>
            {addMonthlyDiscountPrice && (
              <span className="text-xs text-blue-600 mr-2 block">
                القيمة الحقيقية: {calculateDailyFromMonthly(addMonthlyDiscountPrice)} يومي
              </span>
            )}
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="number"
              name="monthlyDiscountPrice"
              value={addMonthlyDiscountPrice}
              onChange={(e) => handleAddMonthlyDiscountPriceChange(e.target.value)}
              min="0"
              className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
              placeholder="أدخل السعر قبل الخصم بالشهر"
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">السعة (عدد الأشخاص)</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="capacity"
            min="1"
            max="50"
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل عدد الأشخاص"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">الفئة المستهدفة</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="targetAudience"
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="both">الجميع</option>
            <option value="family">عائلات</option>
            <option value="normal">أفراد</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">وصف العقار</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <textarea
            name="description"
            required
            rows={4}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right resize-none"
            placeholder="أدخل وصف العقار"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">نوع العقار</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="propertyType"
            required
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="home">منزل</option>
            <option value="villa">فيلا</option>
            <option value="shop">قاراج</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-200/50">
        <span className="text-sm font-medium text-gray-700">العقار متاح للحجز:</span>
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            checked={addPropertyAvailable}
            onChange={(e) => setAddPropertyAvailable(e.target.checked)}
            className="sr-only"
          />
          <div className="relative w-14 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full shadow-inner transition-all duration-300">
            {/* Inner track */}
            <div className="absolute inset-0.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full"></div>
            
            {/* Energy lines */}
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${addPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '20%', transform: 'rotate(15deg)' }}></div>
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${addPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '50%', transform: 'rotate(0deg)' }}></div>
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${addPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '80%', transform: 'rotate(-15deg)' }}></div>
            
            {/* Toggle orb */}
            <div className={`absolute h-6 w-6 top-1 left-1 bg-gradient-to-br from-rose-500 to-teal-500 rounded-full transition-all duration-600 ease-out transform ${addPropertyAvailable ? 'translate-x-6 rotate-360' : 'translate-x-0'} shadow-xl`}>
              <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-200 rounded-full transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  background: 'repeating-conic-gradient(from 0deg, transparent 0deg, rgba(0, 0, 0, 0.1) 10deg, transparent 20deg)',
                  animation: addPropertyAvailable ? 'patternRotate 10s linear infinite' : 'none'
                }}></div>
              </div>
              <div className={`absolute inset-0 border border-white/10 rounded-full transition-all duration-500 ${addPropertyAvailable ? 'border-emerald-400/30' : ''}`}
                   style={{ animation: addPropertyAvailable ? 'ringPulse 2s infinite' : 'none' }}></div>
            </div>
            
            {/* Particles */}
            {addPropertyAvailable && (
              <div className="absolute w-full h-full">
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '20%', animationDelay: '0s' }}></div>
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '40%', animationDelay: '0.2s' }}></div>
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '60%', animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </label>
        <span className={`text-sm mx-2 font-semibold transition-colors duration-300 ${
          addPropertyAvailable 
            ? 'text-emerald-400 drop-shadow-sm' 
            : 'text-gray-400'
        }`}>
          {addPropertyAvailable ? 'متاح' : 'غير متاح'}
        </span>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">الصور</label>
        <div className="space-y-3">
          {/* Input field and add button */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentImageLink}
              onChange={(e) => setCurrentImageLink(e.target.value)}
              onKeyPress={handleImageLinkKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل رابط الصورة"
            />
            <button
              type="button"
              onClick={addImageLink}
              disabled={!currentImageLink.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              إضافة
            </button>
          </div>
          
          {/* Image links tags */}
          {imageLinks.length > 0 && (
<div className="flex flex-wrap gap-2">
  {imageLinks.map((link, index) => (
    <div
      key={index}
      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
    >
      <span className="truncate max-w-xs">{link}</span>
      <button
        type="button"
        onClick={() => removeImageLink(index)}
        className="text-blue-600 hover:text-blue-800 font-bold"
      >
        ×
      </button>
    </div>
  ))}
</div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">الولاية</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="wilayaId"
            required
            defaultValue={selectedWilaya || ''}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="">اختر الولاية</option>
            {wilayas.map((wilaya) => (
<option key={wilaya._id} value={wilaya._id}>
  {wilaya.name}
</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">المكتب</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="officeId"
            required
            defaultValue={selectedOffice || ''}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="">اختر المكتب</option>
            {offices
.filter((office: any) => !selectedWilaya || office.wilayaId?._id === selectedWilaya)
.map((office: any) => (
  <option key={office._id} value={office._id}>
    {office.name}
  </option>
))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {propertyError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-sm font-medium">خطأ: {propertyError}</p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-6 -mb-6 rounded-b-2xl mt-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
setShowAddPropertyModal(false);
setImageLinks([]);
setCurrentImageLink('');
setAddMapUrl('');
setPropertyError(null);
setAddPropertyAvailable(true);
            }}
            className="px-6 py-3 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isAddingProperty}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isAddingProperty ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإضافة...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                إضافة العقار
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
          )}

          {/* Edit Property Modal */}
          {showEditPropertyModal && editingProperty && (
<div 
  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
  onClick={() => setShowEditPropertyModal(false)}
>
  <div 
    className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-5xl lg:max-w-4xl md:max-w-3xl sm:max-w-full mx-4 relative z-[100000] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e1 #f1f5f9',
      direction: 'rtl'
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
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl border border-white/30">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">تعديل العقار</h3>
            <p className="text-sm text-white/80 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              قم بتحديث معلومات العقار
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEditPropertyModal(false)}
          className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-300 group border border-white/30"
        >
          <svg className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    {/* Error Message */}
    {propertyError && (
      <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">خطأ في التحديث</p>
            <p className="text-xs text-red-600 mt-1">{propertyError}</p>
          </div>
        </div>
      </div>
    )}
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setPropertyError(null); // Clear previous error
        
        const formData = new FormData(e.target);
        const propertyData = {
          title: formData.get('title') as string,
          location: formData.get('location') as string,
          description: formData.get('description') as string,
          propertyType: formData.get('propertyType') as string,
          pricePerDay: Number(formData.get('pricePerDay')),
          reserveTheProperty: formData.get('reserveTheProperty') as string || editingProperty?.reserveTheProperty || 'daily',
          locationGoogleMapLink: formData.get('locationGoogleMapLink') as string || editingProperty?.locationGoogleMapLink || '',
          priceBeforeDiscountPerDay: formData.get('priceBeforeDiscountPerDay') ? Number(formData.get('priceBeforeDiscountPerDay')) : editingProperty?.priceBeforeDiscountPerDay,
          capacity: formData.get('capacity') ? Number(formData.get('capacity')) : editingProperty?.capacity,
          targetAudience: formData.get('targetAudience') as string || editingProperty?.targetAudience || 'both',
          images: imageLinks,
          wilayaId: editWilayaId,
          officeId: editOfficeId,
          available: editPropertyAvailable
        };
        handleEditProperty(propertyData);
      }}
      className="p-6 space-y-6"
    >
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#24697f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          عنوان العقار
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="title"
            required
            defaultValue={editingProperty?.title || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-200 bg-gray-50/50 hover:bg-white group-hover:border-gray-300"
            placeholder="أدخل عنوان العقار"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#24697f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          موقع العقار
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="location"
            required
            defaultValue={editingProperty?.location || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-200 bg-gray-50/50 hover:bg-white group-hover:border-gray-300"
            placeholder="أدخل موقع العقار (الشارع، الحي، المدينة)"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">رابط خرائط جوجل (اختياري)</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="url"
            name="locationGoogleMapLink"
            value={editMapUrl}
            onChange={(e) => setEditMapUrl(e.target.value)}
            defaultValue={editingProperty?.locationGoogleMapLink || ''}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل رابط خرائط جوجل"
          />
        </div>
        <GoogleMapPreview mapUrl={editMapUrl} className="mt-3" onLocationSelect={handleLocationSelect} />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">نوع الحجز</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="reserveTheProperty"
            value={editReservationType}
            onChange={(e) => handleEditReservationTypeChange(e.target.value)}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="daily">يومي</option>
            <option value="monthly">شهري</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Price Fields - moved under reservation type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
          {editReservationType === 'monthly' ? 'السعر باليوم (دج)' : 'السعر باليوم (دج)'}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="pricePerDay"
            required
            min="0"
            defaultValue={editingProperty?.pricePerDay || ''}
            onChange={(e) => editReservationType === 'monthly' ? handleEditDailyPriceChange(e.target.value) : undefined}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل السعر باليوم"
          />
        </div>
      </div>
      
      {editReservationType === 'monthly' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
            السعر بالشهر (دج)
            <span className="text-xs text-gray-500 mr-2">(بالسعر اليومي × 30 يوم - بالتقريب)</span>
            {editMonthlyPrice && (
              <span className="text-xs text-blue-600 mr-2 block">
                القيمة الحقيقية: {calculateDailyFromMonthly(editMonthlyPrice)} يومي
              </span>
            )}
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="number"
              name="monthlyPrice"
              value={editMonthlyPrice}
              onChange={(e) => handleEditMonthlyPriceChange(e.target.value)}
              min="0"
              className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
              placeholder="أدخل السعر بالشهر"
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
          {editReservationType === 'monthly' ? 'السعر قبل الخصم باليوم (دج) (اختياري)' : 'السعر قبل الخصم باليوم (دج) (اختياري)'}
          {editReservationType === 'monthly' && editMonthlyDiscountPrice && (
            <span className="text-xs text-blue-600 mr-2 block">
              القيمة الحقيقية: {calculateDailyFromMonthly(editMonthlyDiscountPrice)} يومي
            </span>
          )}
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="priceBeforeDiscountPerDay"
            min="0"
            defaultValue={editingProperty?.priceBeforeDiscountPerDay || ''}
            onChange={(e) => editReservationType === 'monthly' ? handleEditDailyDiscountPriceChange(e.target.value) : undefined}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل السعر قبل الخصم"
          />
        </div>
      </div>
      
      {editReservationType === 'monthly' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2 text-right">
            السعر قبل الخصم بالشهر (دج) (اختياري)
            <span className="text-xs text-gray-500 mr-2">(بالسعر اليومي × 30 يوم - بالتقريب)</span>
            {editMonthlyDiscountPrice && (
              <span className="text-xs text-blue-600 mr-2 block">
                القيمة الحقيقية: {calculateDailyFromMonthly(editMonthlyDiscountPrice)} يومي
              </span>
            )}
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="number"
              name="monthlyDiscountPrice"
              value={editMonthlyDiscountPrice}
              onChange={(e) => handleEditMonthlyDiscountPriceChange(e.target.value)}
              min="0"
              className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
              placeholder="أدخل السعر قبل الخصم بالشهر"
            />
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">السعة (عدد الأشخاص)</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <input
            type="number"
            name="capacity"
            min="1"
            max="50"
            defaultValue={editingProperty?.capacity || ''}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm text-right"
            placeholder="أدخل عدد الأشخاص"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2 text-right">الفئة المستهدفة</label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <select
            name="targetAudience"
            defaultValue={editingProperty?.targetAudience || 'both'}
            className="relative w-full px-4 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm text-right"
          >
            <option value="both">الجميع</option>
            <option value="family">عائلات</option>
            <option value="normal">أفراد</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">وصف العقار</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={editingProperty?.description || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل وصف العقار"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار</label>
        <select
          name="propertyType"
          required
          defaultValue={editingProperty?.propertyType || 'home'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="home">منزل</option>
          <option value="villa">فيلا</option>
          <option value="shop">قاراج</option>
        </select>
      </div>
      
      <div dir='rtl' className="flex items-center justify-end gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-200/50">
        <span className="text-sm font-medium text-gray-700">العقار متاح للحجز:</span>
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            checked={editPropertyAvailable}
            onChange={(e) => setEditPropertyAvailable(e.target.checked)}
            className="sr-only"
          />
          <div className="relative w-14 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full shadow-inner transition-all duration-300">
            {/* Inner track */}
            <div className="absolute inset-0.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full"></div>
            
            {/* Energy lines */}
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${editPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '20%', transform: 'rotate(15deg)' }}></div>
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${editPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '50%', transform: 'rotate(0deg)' }}></div>
            <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${editPropertyAvailable ? 'opacity-100' : 'opacity-0'}`}
                 style={{ top: '80%', transform: 'rotate(-15deg)' }}></div>
            
            {/* Toggle orb */}
            <div className={`absolute h-6 w-6 top-1 left-1 bg-gradient-to-br from-rose-500 to-teal-500 rounded-full transition-all duration-600 ease-out transform ${editPropertyAvailable ? 'translate-x-6 rotate-360' : 'translate-x-0'} shadow-xl`}>
              <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-200 rounded-full transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                  background: 'repeating-conic-gradient(from 0deg, transparent 0deg, rgba(0, 0, 0, 0.1) 10deg, transparent 20deg)',
                  animation: editPropertyAvailable ? 'patternRotate 10s linear infinite' : 'none'
                }}></div>
              </div>
              <div className={`absolute inset-0 border border-white/10 rounded-full transition-all duration-500 ${editPropertyAvailable ? 'border-emerald-400/30' : ''}`}
                   style={{ animation: editPropertyAvailable ? 'ringPulse 2s infinite' : 'none' }}></div>
            </div>
            
            {/* Particles */}
            {editPropertyAvailable && (
              <div className="absolute w-full h-full">
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '20%', animationDelay: '0s' }}></div>
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '40%', animationDelay: '0.2s' }}></div>
                <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '60%', animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </label>
        <span className={`text-sm mx-2 font-semibold transition-colors duration-300 ${
          editPropertyAvailable 
            ? 'text-emerald-400 drop-shadow-sm' 
            : 'text-gray-400'
        }`}>
          {editPropertyAvailable ? 'متاح' : 'غير متاح'}
        </span>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">روابط الصور</label>
        <div className="space-y-3">
          {/* Input field and add button */}
          <div className="flex gap-2">
<input
  type="url"
  value={currentImageLink}
  onChange={(e) => setCurrentImageLink(e.target.value)}
  onKeyPress={handleImageLinkKeyPress}
  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="أدخل رابط الصورة"
/>
<button
  type="button"
  onClick={addImageLink}
  disabled={!currentImageLink.trim()}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
>
  إضافة
</button>
          </div>
          
          {/* Image links tags */}
          {imageLinks.length > 0 && (
<div className="flex flex-wrap gap-2">
  {imageLinks.map((link, index) => (
    <div
      key={index}
      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
    >
      <span className="truncate max-w-xs">{link}</span>
      <button
        type="button"
        onClick={() => removeImageLink(index)}
        className="text-blue-600 hover:text-blue-800 font-bold"
      >
        ×
      </button>
    </div>
  ))}
</div>
          )}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الولاية</label>
        <select
          name="wilayaId"
          required
          value={editWilayaId}
          onChange={(e) => setEditWilayaId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر الولاية</option>
          {wilayas.map((wilaya) => (
<option key={wilaya._id} value={wilaya._id}>
  {wilaya.name}
</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">المكتب</label>
        <select
          name="officeId"
          required
          value={editOfficeId}
          onChange={(e) => setEditOfficeId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">اختر المكتب</option>
          {offices
.filter((office: any) => !editWilayaId || office.wilayaId?._id === editWilayaId)
.map((office: any) => (
  <option key={office._id} value={office._id}>
    {office.name}
  </option>
))}
        </select>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200/30 bg-white/80 p-4 sm:p-6 backdrop-blur-sm -mx-4 -mb-4 rounded-b-2xl mt-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
setShowEditPropertyModal(false);
setEditingProperty(null);
setImageLinks([]);
setCurrentImageLink('');
setEditWilayaId('');
setEditOfficeId('');
setEditMapUrl('');
setPropertyError(null);
setEditPropertyAvailable(true);
            }}
            className="px-6 py-3 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isUpdatingProperty}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isUpdatingProperty ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التحديث...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                تحديث العقار
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
          )}

          {/* Reservations Management */}
          {activeTab === 'reservations' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : (
    <>
      {/* Wilayas Filter */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">الولايات</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
            تحديث
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
key="all"
onClick={() => {
  setSelectedWilaya(null);
  setSelectedOffice(null);
  setSelectedPropertyForReservation('');
}}
className={`px-4 py-2 rounded-full border-2 transition-all ${
  selectedWilaya === null
    ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
    : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
}`}
          >
جميع العقارات
          </button>
          {wilayas.map((wilaya) => (
<button
  key={wilaya._id}
  onClick={() => {
    setSelectedWilaya(wilaya._id);
    setSelectedOffice(null);
    setSelectedPropertyForReservation('');
  }}
  className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
    selectedWilaya === wilaya._id
      ? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white'
      : 'bg-white/20 text-white border-white/40 hover:bg-white/30'
  }`}
>
  {wilaya.image ? (
    <img 
      src={wilaya.image} 
      alt={wilaya.name}
      className="w-6 h-6 rounded-full object-cover"
    />
  ) : (
    <Building className="w-6 h-6 text-white/50" />
  )}
  {wilaya.name}
</button>
          ))}
        </div>

        {/* Offices Filter */}
        {selectedWilaya && (
          <div>
<h3 className="text-lg font-semibold text-white mb-4">المكاتب</h3>
<div className="flex flex-wrap gap-4 sm:p-6 mb-6">
  {offices
    .filter((office: any) => office.wilayaId?._id === selectedWilaya)
    .map((office: any) => (
      <button
        key={office._id}
        onClick={() => {
          setSelectedOffice(office._id);
          setSelectedPropertyForReservation('');
        }}
        className={`flex flex-col items-center p-4 sm:p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
          selectedOffice === office._id
? 'bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white shadow-lg shadow-blue-600/30'
: 'bg-white/20 text-white border-white/40 hover:bg-white/30 hover:border-white/60'
        }`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
          selectedOffice === office._id 
? 'bg-white/20' 
: 'bg-white/10'
        }`}>
          <Building className="w-6 h-6" />
        </div>
        <span className="text-sm font-medium text-center">{office.name}</span>
        <span className="text-xs opacity-75 mt-1">
          {users.filter((user: any) => user.officeId === office._id).length} مستخدم
        </span>
      </button>
    ))}
</div>
          </div>
        )}
      </div>

      {/* Properties Grid principal cards off reservation  */}
      <div dir='rtl' className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2  ">
        {properties
          .filter((property: any) => {
if (!selectedWilaya) return true;
if (!selectedOffice) return false;
return property.officeId?._id === selectedOffice || 
       property.officeId?.id === selectedOffice ||
       property.officeId?.toString() === selectedOffice;
          })
          .map((property: any) => (
<div key={property._id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border-2 border-white/40">
  {/* Property Image */}
  <div className="relative w-full aspect-[4/2] bg-gray-900 overflow-hidden">
    {property.images && property.images.length > 0 ? (
      <>
        <img 
          src={getCurrentImage(property._id)} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Buttons - Show for testing */}
        {property.images && property.images.length > 0 && (
          <>
{/* Previous Button */}
<button
  onClick={() => {
    prevImage(property._id);
  }}
  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
</button>
{/* Next Button */}
<button
  onClick={() => {
    nextImage(property._id);
  }}
  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>
{/* Image Counter */}
<div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
  {(currentImageIndex[property._id] || 0) + 1} / {property.images.length}
</div>
          </>
        )}
      </>
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-300">
        <Home className="w-12 h-12 text-gray-400" />
      </div>
    )}
    <div className="absolute top-2 right-2">
      <span className={`px-2 py-1 rounded-full text-xs ${
        property.isReserved
          ? 'bg-red-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {property.isReserved ? 'محجوز' : 'متاح'}
      </span>
    </div>
  </div>
  
  <div className="p-4 sm:p-2">
    <div className="flex items-center justify-between mb-1">
      <h3 className="font-semibold text-white">{property.title}</h3>
      <div className="flex items-center space-x-2 space-x-reverse">
        {property.isReserved && (() => {
          const reservation = reservations.find((r: any) => {
            const reservationPropertyId = typeof r.propertyId === 'string' 
              ? r.propertyId 
              : r.propertyId?._id || r.propertyId.id;
            return reservationPropertyId === property._id;
          });
          const isExpired = reservation && new Date() > new Date(reservation.endDate);
          
          return (
            <>
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full flex items-center">
                <Calendar className="w-3 h-3 ml-1" />
                محجوز
              </span>
              {isExpired && (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  منتهي الصلاحية
                </span>
              )}
            </>
          );
        })()}
      </div>
    </div>
    <p className="text-white/80 text-sm mb-2">{property.description}</p>
    <p className="text-white/90 font-semibold">{property.pricePerDay} دج/يوم</p>
    
    {/* Payment Information for Reserved Properties */}
    {property.isReserved && (() => {
      const reservation = reservations.find((r: any) => {
        const reservationPropertyId = typeof r.propertyId === 'string' 
          ? r.propertyId 
          : r.propertyId?._id || r.propertyId.id;
        return reservationPropertyId === property._id;
      });
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
          </div>
          <div className="flex justify-between items-center">
<span className="text-white/80 text-xs">المبلغ المتبقي:</span>
<span className={`font-semibold text-sm ${
  reservation.remainingAmount > 0 ? 'text-red-400' : 'text-green-400'
}`}>
  {reservation.remainingAmount} دج
</span>
          </div>
        </div>
      ) : null;
    })()}
    
    {!property.isReserved ? (
      <button
        onClick={() => {
          setSelectedPropertyForReservation(property._id);
          resetAddReservationForm();
          setShowAddReservationModal(true);
        }}
        className="mt-3 w-full px-4 py-2 bg-gradient-to-br from-[#3daf6d] to-[#2d9f5d] text-white rounded-lg hover:from-[#2d9f5d] hover:to-[#1d8f4d] transition-all cursor-pointer border-2 border-white/60"
      >
        حجز العقار
      </button>
    ) : (
      <div className="space-y-2">
        <button
          onClick={() => {
// Find the reservation for this property and open edit modal
const reservation = reservations.find((r: any) => {
  const reservationPropertyId = typeof r.propertyId === 'string' 
    ? r.propertyId 
    : r.propertyId?._id || r.propertyId.id;
  return reservationPropertyId === property._id;
});
openEditReservationModal(reservation);
          }}
          className="w-full px-4 py-2 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all cursor-pointer border-2 border-white/60"
        >
          تعديل الحجز الأخير
        </button>
        <button
          onClick={() => {
            setSelectedPropertyForReservation(property._id);
            resetAddReservationForm();
            setShowAddReservationModal(true);
          }}
          className="w-full px-4 py-2 bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white rounded-lg hover:from-[#16a34a] hover:to-[#15803d] transition-all cursor-pointer border-2 border-white/60"
        >
          إضافة حجز آخر
        </button>
        <button
          onClick={() => {
            setSelectedPropertyForReservationsList(property._id);
            setShowReservationsListModal(true);
          }}
          className="w-full px-4 py-2 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white rounded-lg hover:from-[#7c3aed] hover:to-[#6d28d9] transition-all cursor-pointer border-2 border-white/60"
        >
          عرض الحجوزات الأخرى
        </button>
              </div>
    )}
    
    {/* Expandable Calendar Section */}
    <div className="mt-4 border-t border-white/20">
      <button
        onClick={() => togglePropertyCard(property._id)}
        className="w-full py-2 flex items-center justify-center text-white/60 hover:text-white transition-colors"
      >
        <span className="text-sm">عرض التقويم</span>
        <ChevronDown 
          className={`w-4 h-4 mr-2 transition-transform ${
            expandedPropertyCards.has(property._id) ? 'rotate-180' : ''
          }`}
        />
      </button>
      
      {expandedPropertyCards.has(property._id) && (
        <div className="mt-4 animate-in slide-in-from-top duration-200">
          <PropertyCalendar propertyId={property._id} />
        </div>
      )}
    </div>
  </div>
</div>
          ))}
      </div>

      {properties.filter((property: any) => {
        if (!selectedWilaya) return true;
        if (!selectedOffice) return false;
        return property.officeId?._id === selectedOffice || 
   property.officeId?.id === selectedOffice ||
   property.officeId?.toString() === selectedOffice;
      }).length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/60">
{!selectedOffice 
  ? 'الرجاء اختيار مكتب لعرض العقارات' 
  : 'لا توجد عقارات في هذا المكتب'
}
          </p>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-bold text-white mb-6">قائمة الحجوزات</h2>
        
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12">
<Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
<p className="text-white/60">
  {reservations.length === 0 
    ? 'لا توجد حجوزات حالياً' 
    : 'لا توجد حجوزات في هذا النطاق المحدد'
  }
</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:p-6">
{filteredReservations.map((reservation: any) => {
  // Check if this reservation's property is currently reserved
  // AND this reservation is the active one for that property
  const reservationPropertyId = typeof reservation.propertyId === 'string' 
    ? reservation.propertyId 
    : reservation.propertyId?._id || reservation.propertyId.id;
  
  const property = properties.find((p: any) => p._id === reservationPropertyId);
  
  // Show badge only if:
  // 1. Property is reserved (isReserved: true)
  // 2. This reservation is active (not cancelled or completed)
  // 3. This reservation is for the currently reserved property
  const isPropertyCurrentlyReserved = property?.isReserved && 
    ['pending', 'confirmed'].includes(reservation.status);
  
  return (
  <div key={reservation._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-white">{reservation.customerName}</h3>
      {isPropertyCurrentlyReserved && (
        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center">
          <Home className="w-3 h-3 ml-1" />
          عقار محجوز
        </span>
      )}
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
      <div className="flex justify-between items-center">
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
    </div>
    
    {/* Reservation Status */}
    <div className="flex justify-between items-center mb-3">
      <span className="text-white/80 text-sm">حالة الحجز:</span>
      <span className={`px-2 py-1 rounded-full text-xs ${
        reservation.status === 'confirmed' 
          ? 'bg-blue-500 text-white' 
          : reservation.status === 'completed'
          ? 'bg-green-500 text-white'
          : reservation.status === 'cancelled'
          ? 'bg-red-500 text-white'
          : 'bg-gray-500 text-white'
      }`}>
        {reservation.status === 'confirmed' ? 'مؤكد' : 
         reservation.status === 'completed' ? 'مكتمل' :
         reservation.status === 'cancelled' ? 'ملغي' : 'معلق'}
      </span>
    </div>
    
    <div className="flex space-x-2 mt-3">
      <button
        onClick={() => {
          openEditReservationModal(reservation);
        }}
        className="flex-1 px-3 mx-2 py-2 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all text-sm cursor-pointer border-2 border-white/60"
      >
        تعديل
      </button>
      <button
        onClick={() => handleDeleteReservation(reservation._id)}
        className="flex-1 px-3 py-2 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all text-sm cursor-pointer border-2 border-white/60"
      >
        حذف
      </button>
    </div>
  </div>
  );
})}
          </div>
        )}
      </div>
    </>
  )}
</div>
          )}

          {/* Add Reservation Modal */}
          {showAddReservationModal && (
<div 
  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
  onClick={() => {
      setShowAddReservationModal(false);
      resetAddReservationForm();
      setPreSelectedDates(null);
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
          <h3 className="text-2xl font-bold text-white">إضافة حجز جديد</h3>
          <button
            onClick={() => {
              setShowAddReservationModal(false);
              resetAddReservationForm();
              setPreSelectedDates(null);
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
          const property = properties.find((p: any) => p._id === selectedPropertyForReservation);
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
                  <span className="text-white/90">{property.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-white/90">{property.propertyType === 'home' ? 'منزل' : property.propertyType === 'villa' ? 'فيلا' : 'متجر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/90">{property.reserveTheProperty === 'daily' ? 'يومي' : 'شهري'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/90">{property.pricePerDay} دج/{property.reserveTheProperty === 'daily' ? 'يوم' : 'شهر'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-white/90">
                    {property.propertyType === 'home' ? 'عائلات' : property.propertyType === 'villa' ? 'عائلات' : 'تجار'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
    
    <div className="p-6">
    {/* Error Message */}
    {reservationError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="text-sm font-medium mb-1">خطأ:</p>
        <pre className="text-xs whitespace-pre-line font-mono">
          {reservationError}
        </pre>
      </div>
    )}
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setReservationError(null); // Clear previous error
        
        const formData = new FormData(e.target);
        const totalPrice = Number(formData.get('totalPrice'));
        const paidAmount = Number(formData.get('paidAmount'));
        const remainingAmount = totalPrice - paidAmount;
        
        // Client-side date validation
        const startDate = new Date(formData.get('startDate') as string);
        const endDate = new Date(formData.get('endDate') as string);
        
        if (startDate >= endDate) {
          setReservationError('يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء');
          return;
        }
        
        const reservationData = {
          propertyId: selectedPropertyForReservation,
          customerName: formData.get('customerName') as string,
          customerPhone: formData.get('customerPhone') as string,
          startDate: formData.get('startDate') as string,
          endDate: formData.get('endDate') as string,
          totalPrice: totalPrice,
          paidAmount: paidAmount,
          remainingAmount: remainingAmount,
          paymentStatus: formData.get('paymentStatus') as string,
          employerId: formData.get('employerId') as string || null,
          status: 'pending',
          isMarried: addReservationForm.isMarried,
          numberOfPeople: addReservationForm.isMarried ? addReservationForm.numberOfPeople : '1',
          identityImages: addReservationForm.identityImages.filter(img => img.trim() !== ''),
          notes: addReservationForm.notes
        };
        
        handleAddReservation(reservationData);
      }}
      className="space-y-4"
    >
      {/* Property Info (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
          {properties.find((p: any) => p._id === selectedPropertyForReservation)?.title || 'العقار المحدد'}
        </div>
      </div>
      
      {/* Employer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الموظف (اختياري)</label>
        <select
          name="employerId"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">بدون تعيين موظف</option>
          {users.filter((user: any) => user.role === 'employer').map((employer: any) => (
<option key={employer._id} value={employer._id}>
  {employer.firstName && employer.lastName ? 
    `${employer.firstName} ${employer.lastName}` : 
    employer.username || 'Unknown'
  } - {employer.officeId?.name || 'No Office'}
</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
        <input
          type="text"
          name="customerName"
          required
          defaultValue={preFilledReservationData?.customerName || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل اسم العميل"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">هاتف العميل</label>
        <input
          type="tel"
          name="customerPhone"
          required
          defaultValue={preFilledReservationData?.customerPhone || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل رقم الهاتف"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
          <input
type="date"
name="startDate"
required
defaultValue={preSelectedDates?.startDate ? 
                new Date(preSelectedDates.startDate.getFullYear(), preSelectedDates.startDate.getMonth(), preSelectedDates.startDate.getDate()).toLocaleDateString('en-CA') : 
                preFilledReservationData?.startDate || new Date().toLocaleDateString('en-CA')}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
          <input
type="date"
name="endDate"
required
defaultValue={preSelectedDates?.endDate ? 
                new Date(preSelectedDates.endDate.getFullYear(), preSelectedDates.endDate.getMonth(), preSelectedDates.endDate.getDate()).toLocaleDateString('en-CA') : 
                preFilledReservationData?.endDate || new Date().toLocaleDateString('en-CA')}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (دج)</label>
        <input
          type="number"
          name="totalPrice"
          required
          min="0"
          value={addReservationForm.totalPrice}
          onChange={(e) => {
const totalPrice = e.target.value;
const paidAmount = Number(addReservationForm.paidAmount) || 0;
const remainingAmount = Math.max(0, Number(totalPrice) - paidAmount);
setAddReservationForm(prev => ({
  ...prev,
  totalPrice,
  remainingAmount: remainingAmount.toString()
}));
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل السعر الإجمالي"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع (دج)</label>
          <input
type="number"
name="paidAmount"
required
min="0"
value={addReservationForm.paidAmount}
onChange={(e) => {
  const paidAmount = e.target.value;
  const totalPrice = Number(addReservationForm.totalPrice) || 0;
  const remainingAmount = Math.max(0, totalPrice - Number(paidAmount));
  
  setAddReservationForm(prev => ({
    ...prev,
    paidAmount,
    remainingAmount: remainingAmount.toString()
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
name="remainingAmount"
required
min="0"
value={addReservationForm.remainingAmount}
readOnly
className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
placeholder="المبلغ المتبقي"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
        <select
          name="paymentStatus"
          required
          onChange={(e) => {
const newPaymentStatus = e.target.value;
const totalPriceInput = document.querySelector('input[name="totalPrice"]') as HTMLInputElement;
const paidAmountInput = document.querySelector('input[name="paidAmount"]') as HTMLInputElement;
const remainingAmountInput = document.querySelector('input[name="remainingAmount"]') as HTMLInputElement;
if (newPaymentStatus === 'paid' && totalPriceInput && paidAmountInput && remainingAmountInput) {
  const totalPrice = parseFloat(totalPriceInput.value) || 0;
  paidAmountInput.value = totalPrice.toString();
  const remainingAmount = Math.max(0, totalPrice - parseFloat(paidAmountInput.value));
  remainingAmountInput.value = remainingAmount.toString();
}
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
          name="status"
          required
          value={addReservationForm.status}
          onChange={(e) => {
setAddReservationForm(prev => ({
  ...prev,
  status: e.target.value as 'pending' | 'confirmed' | 'cancelled' | 'completed'
}));
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">معلق</option>
          <option value="confirmed">مؤكد</option>
          <option value="cancelled">ملغي</option>
          <option value="completed">مكتمل</option>
        </select>
      </div>

      {/* New Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العائلية</label>
        {(() => {
          const property = properties.find((p: any) => p._id === selectedPropertyForReservation);
          const isFamilyProperty = property?.propertyType === 'home' || property?.propertyType === 'villa';
          
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
              name="isMarried"
              required
              value={addReservationForm.isMarried.toString()}
              onChange={(e) => {
                const isMarried = e.target.value === 'true';
                setAddReservationForm(prev => ({
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
          name="numberOfPeople"
          required
          min="1"
          value={addReservationForm.numberOfPeople}
          onChange={(e) => {
            setAddReservationForm(prev => ({
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
          {addReservationForm.isMarried ? 'يرجى رفع صور الدفتر العائلي' : 'يرجى رفع صور بطاقة التعريف'}
        </label>
        <div className="space-y-2">
          {addReservationForm.identityImages.map((image, index) => (
            <div key={index} className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                value={image}
                onChange={(e) => {
                  const newImages = [...addReservationForm.identityImages];
                  newImages[index] = e.target.value;
                  setAddReservationForm(prev => ({
                    ...prev,
                    identityImages: newImages
                  }));
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="رابط الصورة"
              />
              <button
                type="button"
                onClick={() => {
                  const newImages = addReservationForm.identityImages.filter((_, i) => i !== index);
                  setAddReservationForm(prev => ({
                    ...prev,
                    identityImages: newImages
                  }));
                }}
                className="px-3 py-2 mx-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setAddReservationForm(prev => ({
                ...prev,
                identityImages: [...prev.identityImages, '']
              }));
            }}
            className="w-full px-3 py-2 bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            إضافة صورة
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {addReservationForm.notes.map((note, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {note}
                <button
                  type="button"
                  onClick={() => {
                    const newNotes = addReservationForm.notes.filter((_, i) => i !== index);
                    setAddReservationForm(prev => ({
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
              value={addReservationForm.currentNote || ''}
              onChange={(e) => {
                setAddReservationForm(prev => ({
                  ...prev,
                  currentNote: e.target.value
                }));
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && addReservationForm.currentNote?.trim()) {
                  e.preventDefault();
                  setAddReservationForm(prev => ({
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
                if (addReservationForm.currentNote?.trim()) {
                  setAddReservationForm(prev => ({
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

      {/* Error Message */}
      {reservationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-sm font-medium">خطأ: {reservationError}</p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
setShowAddReservationModal(false);
setSelectedPropertyForReservation('');
setReservationError(null);
setPreSelectedDates(null);
          }}
          className="flex-1 px-4 py-2 mx-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={() => {
setShowContractModal(true);
          }}
          className="flex-1 mx-2 px-6 py-3 bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          إنشاء عقد
        </button>
        <button
          type="submit"
          disabled={isAddingReservation}
          className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
            isAddingReservation ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isAddingReservation ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
              </div>
              جارٍ الإضافة...
            </>
          ) : (
            <>
              إضافة الحجز
            </>
          )}
        </button>
      </div>
    </form>
    </div>
  </div>
</div>
          )}

          {/* Edit Reservation Modal */}
          {showEditReservationModal && (
<div 
  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
  onClick={() => {
    setShowEditReservationModal(false);
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
      
      <div className="relative flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">تعديل الحجز</h3>
        <button
          onClick={() => {
            setShowEditReservationModal(false);
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
    </div>
    
    <div className="p-6">
    {/* Error Message */}
    {reservationError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="text-sm font-medium">خطأ: {reservationError}</p>
      </div>
    )}
    
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setReservationError(null); // Clear previous error
        
        const formData = new FormData(e.target);
        const totalPrice = Number(formData.get('totalPrice'));
        const paidAmount = Number(formData.get('paidAmount'));
        const remainingAmount = totalPrice - paidAmount;
        
        // Client-side date validation
        const startDate = new Date(formData.get('startDate') as string);
        const endDate = new Date(formData.get('endDate') as string);
        
        if (startDate >= endDate) {
          setReservationError('يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء');
          return;
        }
        
        const reservationData = {
          propertyId: editingReservation?.propertyId || '',
          customerName: formData.get('customerName') as string,
          customerPhone: formData.get('customerPhone') as string,
          startDate: formData.get('startDate') as string,
          endDate: formData.get('endDate') as string,
          totalPrice: totalPrice,
          paidAmount: paidAmount,
          remainingAmount: remainingAmount,
          paymentStatus: formData.get('paymentStatus') as string,
          employerId: editingReservation?.employerId || null,
          status: formData.get('status') as string,
          isMarried: formData.get('isMarried') === 'true',
          numberOfPeople: formData.get('numberOfPeople') as string,
          identityImages: editingReservation?.identityImages || [],
          notes: editingReservation?.notes || []
        };
        handleEditReservation(reservationData);
      }}
      className="space-y-4"
    >
      {/* Property Info (Read-only) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
          {properties.find((p: any) => p._id === editingReservation?.propertyId)?.title || 'العقار المحدد'}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
        <input
          type="text"
          name="customerName"
          required
          defaultValue={editingReservation?.customerName || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل اسم العميل"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">هاتف العميل</label>
        <input
          type="tel"
          name="customerPhone"
          required
          defaultValue={editingReservation?.customerPhone || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل رقم الهاتف"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
          <input
type="date"
name="startDate"
required
defaultValue={editingReservation?.startDate ? new Date(editingReservation.startDate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
          <input
type="date"
name="endDate"
required
defaultValue={editingReservation?.endDate ? new Date(editingReservation.endDate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA')}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">السعر الإجمالي (دج)</label>
        <input
          type="number"
          name="totalPrice"
          required
          min="0"
          defaultValue={editingReservation?.totalPrice?.toString() || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل السعر الإجمالي"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع (دج)</label>
          <input
type="number"
name="paidAmount"
required
min="0"
defaultValue={editingReservation?.paidAmount?.toString() || ''}
onChange={(e) => {
  const form = e.target.form;
  if (form) {
    const totalPrice = Number(form.totalPrice?.value) || 0;
    const paidAmount = Number(e.target.value) || 0;
    const remainingAmount = Math.max(0, totalPrice - paidAmount);
    const remainingField = form.remainingAmount;
    if (remainingField) {
      remainingField.value = remainingAmount;
    }
  }
}}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="المبلغ المدفوع"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المتبقي (دج)</label>
          <input
type="number"
name="remainingAmount"
required
min="0"
defaultValue={editingReservation?.remainingAmount?.toString() || ''}
readOnly
className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
placeholder="المبلغ المتبقي"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
        <select
          name="paymentStatus"
          required
          defaultValue={editingReservation?.paymentStatus || 'pending'}
          onChange={(e) => {
const newPaymentStatus = e.target.value;
const totalPriceInput = document.querySelector('input[name="totalPrice"]') as HTMLInputElement;
const paidAmountInput = document.querySelector('input[name="paidAmount"]') as HTMLInputElement;
const remainingAmountInput = document.querySelector('input[name="remainingAmount"]') as HTMLInputElement;
if (newPaymentStatus === 'paid' && totalPriceInput && paidAmountInput && remainingAmountInput) {
  const totalPrice = parseFloat(totalPriceInput.value) || 0;
  paidAmountInput.value = totalPrice.toString();
  remainingAmountInput.value = '0';
}
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
          name="status"
          required
          defaultValue={editingReservation?.status || 'pending'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">معلق</option>
          <option value="confirmed">مؤكد</option>
          <option value="cancelled">ملغي</option>
          <option value="completed">مكتمل</option>
        </select>
      </div>

      {/* New Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة العائلية</label>
        <select
          name="isMarried"
          required
          defaultValue={editingReservation?.isMarried?.toString() || 'false'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="false">أعزب</option>
          <option value="true">متزوج</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">عدد الأشخاص</label>
        <input
          type="number"
          name="numberOfPeople"
          required
          min="1"
          defaultValue={editingReservation?.numberOfPeople?.toString() || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="أدخل عدد الأشخاص"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {editingReservation?.isMarried ? 'يرجى رفع صور الدفتر العائلي' : 'يرجى رفع صور بطاقة التعريف'}
        </label>
        <div className="space-y-2">
          {(editingReservation?.identityImages || []).map((image: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 space-x-reverse">
              <input
                type="text"
                name={`identityImages_${index}`}
                defaultValue={image}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="رابط الصورة"
              />
              <button
                type="button"
                onClick={() => {
                  const currentImages = editingReservation?.identityImages || [];
                  const newImages = currentImages.filter((_: string, i: number) => i !== index);
                  setEditingReservation((prev: any) => prev ? {
                    ...prev,
                    identityImages: newImages
                  } : null);
                }}
                className="px-3 py-2 mx-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditingReservation((prev: { identityImages: any; }) => prev ? {
                ...prev,
                identityImages: [...(prev.identityImages || []), '']
              } : null);
            }}
            className="w-full px-3 py-2 bg-gradient-to-br from-[#24697f] via-[#2a7f9a] to-teal-600  text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            إضافة صورة
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {(editingReservation?.notes || []).map((note: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {note}
                <button
                  type="button"
                  onClick={() => {
                    const currentNotes = editingReservation?.notes || [];
                    const newNotes = currentNotes.filter((_: string, i: number) => i !== index);
                    setEditingReservation((prev: any) => prev ? {
                      ...prev,
                      notes: newNotes
                    } : null);
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
              name="newNote"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أضف ملاحظة واضغط Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  if (target.value.trim()) {
                    setEditingReservation((prev: { notes: any; }) => prev ? {
                      ...prev,
                      notes: [...(prev.notes || []), target.value.trim()]
                    } : null);
                    target.value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[name="newNote"]') as HTMLInputElement;
                if (input?.value.trim()) {
                  setEditingReservation((prev: any) => prev ? {
                    ...prev,
                    notes: [...(prev.notes || []), input.value.trim()]
                  } : null);
                  input.value = '';
                }
              }}
              className="px-4 mx-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {reservationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <p className="text-sm font-medium">خطأ: {reservationError}</p>
        </div>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
setShowEditReservationModal(false);
setEditingReservation(null);
setReservationError(null);
          }}
          className="flex-1 px-6 py-3 mx-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={() => {
setShowContractModal(true);
          }}
          className="flex-1 px-6 py-3 mx-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          إنشاء عقد
        </button>
        <button
          type="submit"
          disabled={isEditingReservation}
          className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
            isEditingReservation ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isEditingReservation ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin">
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full"></div>
              </div>
              جارٍ التحديث...
            </>
          ) : (
            <>
              تحديث الحجز
            </>
          )}
        </button>
      </div>
    </form>
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
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {(() => {
                    const propertyReservations = reservations.filter((r: any) => {
                      const reservationPropertyId = typeof r.propertyId === 'string' 
                        ? r.propertyId 
                        : r.propertyId?._id || r.propertyId.id;
                      return reservationPropertyId === selectedPropertyForReservationsList;
                    });

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
                                    openEditReservationModal(reservation);
                                    setShowReservationsListModal(false);
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

          {/* Contract Modal */}
          <ContractModal 
            isOpen={showContractModal}
            onClose={() => setShowContractModal(false)}
          />

          {/* History Management */}
          {activeTab === 'history' && (
<div className="space-y-6">
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <h2 className="text-2xl font-bold text-white mb-6">سجل النشاطات</h2>
    
    {historyLoading ? (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
      </div>
    ) : history.length === 0 ? (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white/60 text-lg">لا يوجد سجل نشاطات حالياً</p>
      </div>
    ) : (
      <div className="space-y-2">
        {history.map((item: any) => (
          <div key={item._id} className="bg-white/5 rounded-lg border border-white/60 hover:bg-white/10 transition-all">
<div 
  className="p-4 sm:p-6 cursor-pointer flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0"
  onClick={() => toggleHistoryItem(item._id)}
>
  <div className="flex items-center gap-3 w-full sm:w-auto">
    <div className={`p-2 rounded-full flex-shrink-0 ${
      item.action === 'reservation_created' ? 'bg-green-500/20' :
      item.action === 'reservation_updated' ? 'bg-blue-500/20' :
      item.action === 'reservation_cancelled' ? 'bg-red-500/20' :
      'bg-gray-500'
    }`}>
      {item.action === 'reservation_created' && <Clock className="w-4 h-4 text-green-400" />}
      {item.action === 'reservation_updated' && <Edit className="w-4 h-4 text-blue-400" />}
      {item.action === 'reservation_cancelled' && <Trash2 className="w-4 h-4 text-red-400" />}
    </div>
    <span className="text-white font-medium text-sm sm:text-base break-words flex-1 min-w-0">{item.description}</span>
  </div>
  <div className="flex items-center gap-2 sm:gap-4 sm:p-6 flex-col sm:flex-row text-center sm:text-right w-full sm:w-auto">
    <div className="text-white/60 text-xs sm:text-sm">
      {new Date(item.createdAt).toLocaleDateString('ar-DZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}
    </div>
    <div className="text-white/60 text-xs sm:text-sm">
      {new Date(item.createdAt).toLocaleTimeString('ar-DZ', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })}
    </div>
    <ChevronDown 
      className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${
        expandedHistoryItems.has(item._id) ? 'rotate-180' : ''
      }`}
    />
  </div>
</div>
{expandedHistoryItems.has(item._id) && (
  <div className="px-4 pb-4 border-t border-white/10">
    <div className="pt-4 space-y-3">
      {/* User Information */}
      <div className="text-white/80 text-sm flex items-center gap-2">
        <span>بواسطة:</span>
        <span className="font-medium">
          {item.userId?.firstName ? `${item.userId.firstName} ${item.userId.lastName || ''}` : 
           item.userId?.username || 'مستخدم مجهول'}
        </span>
        {item.userId?.email && (
          <span className="text-white/60">({item.userId.email})</span>
        )}
      </div>
      
      {/* Detailed Metadata */}
      {item.metadata && (
        <div className="bg-white/5 rounded-lg p-4 sm:p-6 space-y-4">
          <h4 className="text-white font-medium mb-3 border-b border-white/80 pb-2">
            تفاصيل الحجز
          </h4>
          
          {/* Previous Reservation Information */}
          {item.metadata.previousReservation && (
            <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
              <h5 className="text-blue-600 text-center bg-white rounded-full font-medium mb-3">الحجز السابق:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {item.metadata.previousReservation.customerName && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">العميل:</span>
                    <span className="text-white font-medium">{item.metadata.previousReservation.customerName}</span>
                  </div>
                )}
                {item.metadata.previousReservation.customerPhone && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">الهاتف:</span>
                    <span className="text-white font-medium">{item.metadata.previousReservation.customerPhone}</span>
                  </div>
                )}
                {item.metadata.previousReservation.status && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">الحالة:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.metadata.previousReservation.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                      item.metadata.previousReservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {item.metadata.previousReservation.status === 'confirmed' ? 'مؤكد' :
                       item.metadata.previousReservation.status === 'pending' ? 'في الانتظار' :
                       item.metadata.previousReservation.status}
                    </span>
                  </div>
                )}
                {item.metadata.previousReservation.totalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">السعر الإجمالي:</span>
                    <span className="text-white font-medium">{item.metadata.previousReservation.totalPrice} دج</span>
                  </div>
                )}
                {item.metadata.previousReservation.startDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">تاريخ البدء:</span>
                    <span className="text-white font-medium">
                      {new Date(item.metadata.previousReservation.startDate).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                )}
                {item.metadata.previousReservation.endDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">تاريخ الانتهاء:</span>
                    <span className="text-white font-medium">
                      {new Date(item.metadata.previousReservation.endDate).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Current Reservation Details */}
          <div className="border-t border-white/10 pt-4">
            <h5 className="text-white/80 font-medium mb-3">معلومات الحجز:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {item.metadata.customerName && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">اسم العميل:</span>
                  <span className="text-white font-medium">{item.metadata.customerName}</span>
                </div>
              )}
              {item.metadata.customerPhone && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">رقم الهاتف:</span>
                  <span className="text-white font-medium">{item.metadata.customerPhone}</span>
                </div>
              )}
              {item.metadata.startDate && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">تاريخ البدء:</span>
                  <span className="text-white font-medium">
                    {new Date(item.metadata.startDate).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
              )}
              {item.metadata.endDate && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">تاريخ الانتهاء:</span>
                  <span className="text-white font-medium">
                    {new Date(item.metadata.endDate).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
              )}
              {item.metadata.totalPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">السعر الإجمالي:</span>
                  <span className="text-white font-medium">{item.metadata.totalPrice} دج</span>
                </div>
              )}
              {item.metadata.paidAmount !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">المبلغ المدفوع:</span>
                  <span className="text-white font-medium">{item.metadata.paidAmount} دج</span>
                </div>
              )}
              {item.metadata.remainingAmount !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">المبلغ المتبقي:</span>
                  <span className="text-white font-medium">{item.metadata.remainingAmount} دج</span>
                </div>
              )}
              {item.metadata.paymentStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">حالة الدفع:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.metadata.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                    item.metadata.paymentStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.metadata.paymentStatus === 'paid' ? 'مدفوع بالكامل' :
                     item.metadata.paymentStatus === 'partial' ? 'مدفوع جزئياً' :
                     item.metadata.paymentStatus}
                  </span>
                </div>
              )}
              {item.metadata.status && (
                <div className="flex items-center gap-2">
                  <span className="text-white/70">حالة الحجز:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.metadata.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                    item.metadata.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.metadata.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.metadata.status === 'confirmed' ? 'مؤكد' :
                     item.metadata.status === 'pending' ? 'في الانتظار' :
                     item.metadata.status === 'cancelled' ? 'ملغي' :
                     item.metadata.status === 'completed' ? 'مكتمل' : item.metadata.status}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Property Information */}
          {item.metadata.propertyTitle && (
            <div className="border-t border-white/10 pt-4">
              <h5 className="text-white/80 font-medium mb-3">معلومات العقار:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">العقار:</span>
                  <span className="text-white font-medium">{item.metadata.propertyTitle}</span>
                </div>
                {item.metadata.propertyPricePerDay && (
                  <div className="flex items-center gap-2">
                    <span className="text-white/70">السعر اليومي:</span>
                    <span className="text-white font-medium">{item.metadata.propertyPricePerDay} دج/يوم</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
          )}

          {/* Notifications Management */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Notifications 
                properties={properties}
                reservations={reservations}
                loading={loading}
                wilayas={wilayas}
                offices={offices}
                selectedWilaya={selectedWilaya}
                selectedOffice={selectedOffice}
                setSelectedWilaya={setSelectedWilaya}
                setSelectedOffice={setSelectedOffice}
              />
            </div>
          )}

          {/* Orders Management */}
          {activeTab === 'orders' && (
<div className="space-y-6">
  {loading ? (
    <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" text={t('loading') || 'Loading...'} />
    </div>
  ) : (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">طلبات الحجز</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-white/80">قبول تلقائي:</span>
                <label className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAcceptOrders}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setAutoAcceptOrders(newValue);
                      saveAutoAcceptSetting(newValue);
                    }}
                    className="sr-only"
                  />
                  <div className="relative w-20 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full transition-all duration-500 shadow-lg overflow-hidden">
                    {/* Cosmos background */}
                    <div className="absolute inset-0 opacity-10 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-white" style={{
                        background: 'radial-gradient(1px 1px at 10% 10%, #fff 100%, transparent), radial-gradient(1px 1px at 20% 20%, #fff 100%, transparent), radial-gradient(2px 2px at 30% 30%, #fff 100%, transparent), radial-gradient(1px 1px at 40% 40%, #fff 100%, transparent), radial-gradient(2px 2px at 50% 50%, #fff 100%, transparent), radial-gradient(1px 1px at 60% 60%, #fff 100%, transparent), radial-gradient(2px 2px at 70% 70%, #fff 100%, transparent), radial-gradient(1px 1px at 80% 80%, #fff 100%, transparent), radial-gradient(1px 1px at 90% 90%, #fff 100%, transparent)',
                        backgroundSize: '200% 200%'
                      }}></div>
                    </div>
                    
                    {/* Energy lines */}
                    <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${autoAcceptOrders ? 'opacity-100' : 'opacity-0'}`}
                         style={{ top: '20%', transform: 'rotate(15deg)' }}></div>
                    <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${autoAcceptOrders ? 'opacity-100' : 'opacity-0'}`}
                         style={{ top: '50%', transform: 'rotate(0deg)' }}></div>
                    <div className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent transition-all duration-500 ${autoAcceptOrders ? 'opacity-100' : 'opacity-0'}`}
                         style={{ top: '80%', transform: 'rotate(-15deg)' }}></div>
                    
                    {/* Toggle orb */}
                    <div className={`absolute h-8 w-8 top-1 left-1 bg-gradient-to-br from-rose-500 to-teal-500 rounded-full transition-all duration-600 ease-out transform ${autoAcceptOrders ? 'translate-x-10 rotate-360' : 'translate-x-0'} shadow-xl`}>
                      <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-200 rounded-full transition-all duration-500 overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{
                          background: 'repeating-conic-gradient(from 0deg, transparent 0deg, rgba(0, 0, 0, 0.1) 10deg, transparent 20deg)',
                          animation: autoAcceptOrders ? 'patternRotate 10s linear infinite' : 'none'
                        }}></div>
                      </div>
                      <div className={`absolute inset-0 border border-white/10 rounded-full transition-all duration-500 ${autoAcceptOrders ? 'border-emerald-400/30' : ''}`}
                           style={{ animation: autoAcceptOrders ? 'ringPulse 2s infinite' : 'none' }}></div>
                    </div>
                    
                    {/* Particles */}
                    {autoAcceptOrders && (
                      <div className="absolute w-full h-full">
                        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '20%', animationDelay: '0s' }}></div>
                        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '40%', animationDelay: '0.2s' }}></div>
                        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '60%', animationDelay: '0.4s' }}></div>
                        <div className="absolute w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{ left: '80%', animationDelay: '0.6s' }}></div>
                      </div>
                    )}
                  </div>
                </label>
                <span className={`text-sm mx-2 font-semibold transition-colors duration-300 ${
                  autoAcceptOrders 
                    ? 'text-emerald-400 drop-shadow-sm' 
                    : 'text-gray-400'
                }`}>
                  {autoAcceptOrders ? 'مفعل' : 'معطل'}
                </span>
              </div>
              {autoAcceptOrders && (
                <div className="flex items-center space-x-1 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-400/80">يعمل تلقائياً</span>
                </div>
              )}
            </div>
          </div>
          <button
onClick={fetchOrders}
              className="px-2 cursor-pointer py-1.5 sm:px-3 sm:py-2 bg-green-600/20 text-white rounded-lg hover:bg-green-600/30 transition-all text-sm sm:font-medium flex items-center gap-1 sm:gap-2 border-white/60 border-2"
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
<FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
<p className="text-lg">لا توجد طلبات حجز حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
{orders.map((order: any) => (
  <div key={order._id} className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
    {/* Compact Summary Row - Always Visible */}
    <div 
      className="p-4 sm:p-6 cursor-pointer hover:bg-white/5 transition-colors overflow-x-auto"
      onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}
    >
      <div className="flex items-center justify-between min-w-max lg:min-w-0">
        <div className="flex items-center space-x-4">
          <div>
<h3 className="text-lg font-semibold text-white">{order.fullname}</h3>
<p className="text-white/70 text-sm">{order.phoneNumber}</p>
          </div>
          <div className="text-sm text-white/60">
<span className="font-medium">العقار:</span> {order.propertyId?.title || 'N/A'}
          </div>
          <div className="text-sm text-white/60">
<span className="font-medium">من:</span> {new Date(order.startDate).toLocaleDateString('ar-DZ')}
          </div>
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
      <div className="p-4 sm:p-6 overflow-y-auto lg:overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:p-6">
          {/* Left Column - Property and Dates */}
          <div className="space-y-4">
{/* Property Information */}
<div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-white/20">
  <h4 className="text-sm font-medium text-white/80 mb-2">معلومات العقار</h4>
  <div className="grid grid-cols-1 gap-2 text-sm">
    <div className="flex justify-between">
      <span className="text-white/60">العقار:</span>
      <span className="text-white font-medium">{order.propertyId?.title || 'N/A'}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/60">الولاية:</span>
      <span className="text-white font-medium">{order.wilayaId?.name || 'N/A'}</span>
    </div>
  </div>
</div>

{/* Reservation Dates */}
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

{editingOrder === order._id ? (
  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
    <div className="text-sm">
      <span className="font-medium text-white/80">ملاحظات الإدارة:</span>
      <textarea
        value={editAdminNotes}
        onChange={(e) => setEditAdminNotes(e.target.value)}
        className="w-full mt-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
        placeholder="أضف ملاحظات الإدارة..."
      />
    </div>
  </div>
) : (
  order.adminNotes && (
    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
      <div className="text-sm">
        <span className="font-medium text-white/80">ملاحظات الإدارة:</span>
        <p className="text-white/70 mt-1">{order.adminNotes}</p>
      </div>
    </div>
  )
)}

{/* Employer Notes Display */}
{order.employerNotes && order.employerNotes.length > 0 && (
  <div className="bg-white/10 rounded-lg p-3 border border-white/20">
    <div className="text-sm">
      <span className="font-medium text-white/80">ملاحظات الموظفين:</span>
      <div className="mt-2 space-y-2">
        {order.employerNotes.map((note: any, index: number) => (
          <div key={index} className="bg-white/5 rounded p-2 border border-white/10">
            <p className="text-white/70 text-sm">{note.message}</p>
            <p className="text-white/50 text-xs mt-1">
              {note.employerId?.firstName || note.employerId?.username || 'موظف'} - {new Date(note.createdAt).toLocaleDateString('ar-DZ')} {new Date(note.createdAt).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/20">
          {editingOrder === order._id ? (
<>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleSaveEdit(order._id);
    }}
    className="px-3 py-1 bg-gradient-to-br from-[#3daf6d] to-[#2d9f5d] text-white rounded-lg hover:from-[#2d9f5d] hover:to-[#1d8f4d] transition-all text-sm cursor-pointer border-2 border-white/60"
  >
    حفظ
  </button>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleCancelEdit();
    }}
    className="px-3 py-1 bg-gradient-to-br from-[#888888] to-[#666666] text-white rounded-lg hover:from-[#777777] hover:to-[#555555] transition-all text-sm cursor-pointer border-2 border-white/60"
  >
    إلغاء
  </button>
</>
          ) : (
<>
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleEditOrder(order);
    }}
    className="px-3 py-1 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all text-sm cursor-pointer border-2 border-white/60"
  >
    تعديل
  </button>
  {order.status === 'pending' && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleApproveOrder(order._id);
      }}
      className="px-3 py-1 bg-gradient-to-br from-[#3daf6d] to-[#2d9f5d] text-white rounded-lg hover:from-[#2d9f5d] hover:to-[#1d8f4d] transition-all text-sm cursor-pointer border-2 border-white/60"
    >
      موافقة
    </button>
  )}
  {order.status === 'pending' && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRejectOrder(order._id);
      }}
      className="px-3 py-1 bg-gradient-to-br from-[#ff4444] to-[#cc0000] text-white rounded-lg hover:from-[#ff3333] hover:to-[#aa0000] transition-all text-sm cursor-pointer border-2 border-white/60"
    >
      رفض
    </button>
  )}
  {order.status === 'approved' && (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedOrder(order);
          setOrderAction('reject');
          setShowOrderActionModal(true);
        }}
        className="px-3 py-1 bg-gradient-to-br from-[#ff8844] to-[#cc6600] text-white rounded-lg hover:from-[#ff7733] hover:to-[#aa5500] transition-all text-sm cursor-pointer border-2 border-white/60"
      >
        إلغاء الموافقة
      </button>
      {order.orderType === 'notreserver_property' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
            handleOrderAction(order._id, 'approve_and_reserve', '');
          }}
          className="px-3 py-1 bg-gradient-to-br from-[#3daf6d] to-[#2d9f5d] text-white rounded-lg hover:from-[#2d9f5d] hover:to-[#1d8f4d] transition-all text-sm cursor-pointer border-2 border-white/60"
        >
          الحجز في الحين
        </button>
      )}
    </>
  )}
  {order.status === 'rejected' && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedOrder(order);
        setOrderAction('approve');
        setShowOrderActionModal(true);
      }}
      className="px-3 py-1 bg-gradient-to-br from-[#4a9fbf] via-[#5aafca] to-[#3daf6d] text-white rounded-lg hover:from-[#3a8faf] hover:to-[#2d9f5d] transition-all text-sm cursor-pointer border-2 border-white/60"
    >
      إعادة الموافقة
    </button>
  )}
  <button
    onClick={(e) => {
      e.stopPropagation();
      setSelectedOrder(order);
      setOrderAction('delete');
      setShowOrderActionModal(true);
    }}
    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
  >
    حذف
  </button>
</>
          )}
        </div>
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </>
  )}
</div>
          )}

          {/* Financial Statistics */}
          {activeTab === 'financial' && (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600/20 via-cyan-600/20 to-blue-600/20 p-6 border-b border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">الإحصائيات المالية</h1>
                          <p className="text-blue-200 text-lg">نظرة شاملة على الأداء المالي والإيرادات</p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                            <p className="text-blue-200 text-sm">تاريخ التحديث</p>
                            <p className="text-white font-semibold">{new Date().toLocaleDateString('ar-DZ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filter Type */}
                        <div className="space-y-2">
                          <label className="block text-white/90 text-sm font-semibold">نوع التصفية</label>
                          <select
                            value={financialFilter}
                            onChange={(e) => {
                              const newFilter = e.target.value as any;
                              setFinancialFilter(newFilter);
                              // Clear all filter values when changing filter type
                              setSelectedWilayaForStats('');
                              setSelectedOfficeForStats('');
                              setSelectedEmployerForStats('');
                              if (newFilter === 'all') {
                                debouncedFetchFinancialStats();
                              }
                            }}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="all" className="bg-slate-800 text-white">جميع البيانات</option>
                            <option value="wilaya" className="bg-slate-800 text-white">حسب الولاية</option>
                            <option value="office" className="bg-slate-800 text-white">حسب المكتب</option>
                            <option value="employer" className="bg-slate-800 text-white">حسب الموظف</option>
                          </select>
                        </div>

                        {/* Wilaya Filter */}
                        {financialFilter === 'wilaya' && (
                          <div className="space-y-2">
                            <label className="block text-white/90 text-sm font-semibold">الولاية</label>
                            <select
                              value={selectedWilayaForStats}
                              onChange={(e) => setSelectedWilayaForStats(e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="" className="bg-slate-800 text-white">اختر الولاية</option>
                              {wilayas.map((wilaya: any) => (
                                <option key={wilaya._id} value={wilaya._id} className="bg-slate-800 text-white">{wilaya.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Office Filter */}
                        {financialFilter === 'office' && (
                          <div className="space-y-2">
                            <label className="block text-white/90 text-sm font-semibold">المكتب</label>
                            <select
                              value={selectedOfficeForStats}
                              onChange={(e) => setSelectedOfficeForStats(e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="" className="bg-slate-800 text-white">اختر المكتب</option>
                              {offices.map((office: any) => (
                                <option key={office._id} value={office._id} className="bg-slate-800 text-white">{office.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Employer Filter */}
                        {financialFilter === 'employer' && (
                          <div className="space-y-2">
                            <label className="block text-white/90 text-sm font-semibold">الموظف</label>
                            <select
                              value={selectedEmployerForStats}
                              onChange={(e) => setSelectedEmployerForStats(e.target.value)}
                              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="" className="bg-slate-800 text-white">اختر الموظف</option>
                              {users.map((user: any) => (
                                <option key={user._id} value={user._id} className="bg-slate-800 text-white">
                                  {user.firstName} {user.lastName} ({user.role})
                                </option>
                              ))}
                            </select>
                            {users.length === 0 && (
                              <div className="text-amber-400 text-xs mt-1 bg-amber-400/10 px-2 py-1 rounded">لا يوجد مستخدمون متاحون</div>
                            )}
                            {users.length > 0 && (
                              <div className="text-white/60 text-xs mt-1">
                                {users.length} مستخدم متاح
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

    {/* Loading State */}
                {financialLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-white/70 text-lg">جاري تحميل الإحصائيات المالية...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Main Revenue Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Total Revenue Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/20 rounded-2xl border border-emerald-500/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="bg-emerald-500/10 px-3 py-1 rounded-full">
                              <span className="text-emerald-300 text-xs font-semibold">الإجمالي</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-3xl font-bold text-white">
                              {new Intl.NumberFormat('ar-DZ').format(financialStats.all?.totalRevenue || 0)}
                            </div>
                            <div className="text-emerald-300 text-sm font-medium">دج</div>
                            <div className="text-emerald-200/70 text-xs">إجمالي الإيرادات (كل الحجوزات)</div>
                          </div>
                        </div>
                      </div>

                      {/* Completed Revenue Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-green-500/20 via-green-600/10 to-emerald-500/20 rounded-2xl border border-green-500/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="bg-green-500/10 px-3 py-1 rounded-full">
                              <span className="text-green-300 text-xs font-semibold">مكتمل</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-3xl font-bold text-white">
                              {new Intl.NumberFormat('ar-DZ').format(financialStats.all?.completedRevenue || 0)}
                            </div>
                            <div className="text-green-300 text-sm font-medium">دج</div>
                            <div className="text-green-200/70 text-xs">إيرادات (حجوزات مكتملة فقط)</div>
                          </div>
                        </div>
                      </div>

                      {/* Paid Amount Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-violet-600/10 to-purple-500/20 rounded-2xl border border-violet-500/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-violet-400" />
                            </div>
                            <div className="bg-violet-500/10 px-3 py-1 rounded-full">
                              <span className="text-violet-300 text-xs font-semibold">مدفوع</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-3xl font-bold text-white">
                              {new Intl.NumberFormat('ar-DZ').format(financialStats.all?.totalPaid || 0)}
                            </div>
                            <div className="text-violet-300 text-sm font-medium">دج</div>
                            <div className="text-violet-200/70 text-xs">المبلغ المدفوع</div>
                          </div>
                        </div>
                      </div>

                      {/* Total Reservations Card */}
                      <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-orange-600/10 to-yellow-500/20 rounded-2xl border border-amber-500/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:scale-[1.02]">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative p-2">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="bg-amber-500/10 px-3 py-1 rounded-full">
                              <span className="text-amber-300 text-xs font-semibold">حجوزات</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-3xl font-bold text-white">
                              {new Intl.NumberFormat('ar-DZ').format(financialStats.all?.reservationCount || 0)}
                            </div>
                            <div className="text-amber-300 text-sm font-medium">حجز</div>
                            <div className="text-amber-200/70 text-xs">إجمالي عدد الحجوزات</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Section - Only show when filter is 'all' */}
        {financialFilter === 'all' && (
          <>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Revenue Trend Chart */}
  <div className="bg-white/5 rounded-xl p-2 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-4">اتجاه الإيرادات</h3>
    <div className="h-80">
      <Line
        data={{
          labels: ['يومي', 'أسبوعي', 'شهري', 'إجمالي'],
          datasets: [
{
  label: 'إجمالي الإيرادات',
  data: [
    financialStats.daily?.totalRevenue || 0,
    financialStats.weekly?.totalRevenue || 0,
    financialStats.monthly?.totalRevenue || 0,
    financialStats.all?.totalRevenue || 0
  ],
  borderColor: 'rgb(59, 130, 246)',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  tension: 0.4,
  fill: true,
},
{
  label: 'الإيرادات المكتملة',
  data: [
    financialStats.daily?.completedRevenue || 0,
    financialStats.weekly?.completedRevenue || 0,
    financialStats.monthly?.completedRevenue || 0,
    financialStats.all?.completedRevenue || 0
  ],
  borderColor: 'rgb(34, 197, 94)',
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  tension: 0.4,
  fill: true,
},
{
  label: 'المبلغ المدفوع',
  data: [
    financialStats.daily?.totalPaid || 0,
    financialStats.weekly?.totalPaid || 0,
    financialStats.monthly?.totalPaid || 0,
    financialStats.all?.totalPaid || 0
  ],
  borderColor: 'rgb(168, 85, 247)',
  backgroundColor: 'rgba(168, 85, 247, 0.1)',
  tension: 0.4,
  fill: true,
}
          ]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
legend: {
  labels: {
    color: 'white',
    font: {
      size: 12
    }
  }
},
tooltip: {
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  titleColor: 'white',
  bodyColor: 'white',
  callbacks: {
    label: function(context) {
      return context.dataset.label + ': ' + context.parsed.y + ' دج';
    }
  }
}
          },
          scales: {
x: {
  grid: {
    color: 'rgba(255, 255, 255, 0.1)'
  },
  ticks: {
    color: 'white'
  }
},
y: {
  grid: {
    color: 'rgba(255, 255, 255, 0.1)'
  },
  ticks: {
    color: 'white',
    callback: function(value) {
      return value + ' دج';
    }
  }
}
          }
        }}
      />
    </div>
  </div>

  {/* Revenue Distribution Chart */}
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h3 className="text-lg font-semibold text-white mb-4">توزيع الإيرادات حسب الولايات</h3>
    
    {/* Debug Info - Remove in production */}
    {process.env.NODE_ENV === 'development' && (
      <div className="text-white/60 text-xs mb-2">
        Debug: Found {allWilayasStats?.length || 0} wilayas (unfiltered)
      </div>
    )}
    
    <div className="h-80">
      {allWilayasStats && allWilayasStats.length > 0 ? (
        <Bar
          data={{
labels: allWilayasStats.map((item: any) => item.wilayaName || 'ولاية غير معروفة'),
datasets: [
  {
    label: 'الإيرادات',
    data: allWilayasStats.map((item: any) => item.completedRevenue || 0) as number[],
    backgroundColor: [
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(250, 204, 21, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(99, 102, 241, 0.8)',
      'rgba(244, 63, 94, 0.8)',
      'rgba(16, 185, 129, 0.8)'
    ],
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2
  },
  {
    label: 'عدد الحجوزات',
    data: allWilayasStats.map((item: any) => item.reservationCount || 0) as number[],
    backgroundColor: 'rgba(250, 204, 21, 0.6)',
    borderColor: 'rgba(250, 204, 21, 1)',
    borderWidth: 1,
    yAxisID: 'y1'
  }
]
          }}
          options={{
responsive: true,
maintainAspectRatio: false,
plugins: {
  legend: {
    labels: {
      color: 'white',
      font: {
        size: 12
      }
    }
  },
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: 'white',
    bodyColor: 'white',
    callbacks: {
      label: function(context) {
        const value = context.parsed.y || 0;
        const wilayaData = (allWilayasStats as any[])?.[context.dataIndex];
        
        if (context.datasetIndex === 0) {
          // Revenue dataset
          const total = context.dataset.data.reduce((sum: number, val: any) => sum + (val || 0), 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
          return [
`الإيرادات: ${value.toLocaleString()} دج (${percentage}%)`,
`متوسط الإيراد: ${wilayaData?.reservationCount > 0 ? Math.round(value / wilayaData.reservationCount).toLocaleString() : 0} دج/حجز`
          ];
        } else {
          // Reservations dataset
          return `عدد الحجوزات: ${value}`;
        }
      }
    }
  }
},
scales: {
  x: {
    grid: {
      color: 'rgba(255, 255, 255, 0.1)'
    },
    ticks: {
      color: 'white'
    }
  },
  y: {
    type: 'linear',
    display: true,
    position: 'left',
    grid: {
      color: 'rgba(255, 255, 255, 0.1)'
    },
    ticks: {
      color: 'white',
      callback: function(value) {
        return value + ' دج';
      }
    }
  },
  y1: {
    type: 'linear',
    display: true,
    position: 'right',
    grid: {
      drawOnChartArea: false
    },
    ticks: {
      color: 'white'
    }
  }
}
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
<div className="text-white/60 mb-4">لا توجد بيانات كافية لعرض المخطط</div>
<div className="text-white/40 text-sm">
  {allWilayasStats?.length === 0 
    ? 'لا توجد ولايات بحجوزات' 
    : 'جاري تحميل البيانات...'
  }
</div>
          </div>
        </div>
      )}
    </div>
    
    {/* Wilaya Statistics Summary */}
    {allWilayasStats && allWilayasStats.length > 0 && (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allWilayasStats.slice(0, 9).map((wilaya: any, index: number) => (
          <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <div 
      className="w-3 h-3 rounded-full flex-shrink-0" 
      style={{ backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(99, 102, 241, 0.8)',
        'rgba(244, 63, 94, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ][index % 12] }}
    />
    <span className="text-white text-sm font-medium truncate">{wilaya.wilayaName || 'ولاية غير معروفة'}</span>
  </div>
  <div className="text-left flex-shrink-0">
    <div className="text-green-400 text-xs font-semibold">{(wilaya.completedRevenue || 0).toLocaleString()} دج</div>
    <div className="text-white/60 text-xs">{wilaya.reservationCount || 0} حجوزات</div>
  </div>
</div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

{/* Status Breakdown Chart */}
<div className="bg-white/5 rounded-xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-white mb-4">تحليل حالة الحجوزات حسب الولايات</h3>
  <div className="h-80">
    <Bar
      data={{
        labels: allWilayasStats?.map((item: any) => item.wilayaName || 'ولاية غير معروفة') || [],
        datasets: [
          {
label: 'في الانتظار',
data: allWilayasStats?.map((item: any) => 
  item.statusBreakdown?.find((s: any) => s.status === 'pending')?.count || 0) || [],
backgroundColor: 'rgba(250, 204, 21, 0.8)',
          },
          {
label: 'مؤكد',
data: allWilayasStats?.map((item: any) => 
  item.statusBreakdown?.find((s: any) => s.status === 'confirmed')?.count || 0) || [],
backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
          {
label: 'مكتمل',
data: allWilayasStats?.map((item: any) => 
  item.statusBreakdown?.find((s: any) => s.status === 'completed')?.count || 0) || [],
backgroundColor: 'rgba(34, 197, 94, 0.8)',
          },
          {
label: 'ملغي',
data: allWilayasStats?.map((item: any) => 
  item.statusBreakdown?.find((s: any) => s.status === 'cancelled')?.count || 0) || [],
backgroundColor: 'rgba(239, 68, 68, 0.8)',
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
labels: {
  color: 'white',
  font: {
    size: 12
  }
}
          },
          tooltip: {
backgroundColor: 'rgba(0, 0, 0, 0.8)',
titleColor: 'white',
bodyColor: 'white'
          }
        },
        scales: {
          x: {
grid: {
  color: 'rgba(255, 255, 255, 0.1)'
},
ticks: {
  color: 'white'
}
          },
          y: {
grid: {
  color: 'rgba(255, 255, 255, 0.1)'
},
ticks: {
  color: 'white'
}
          }
        }
      }}
    />
  </div>
</div>
          </>
        )}

        {/* Detailed Statistics by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* By Wilaya */}
          {(financialFilter === 'all' || financialFilter === 'wilaya') && (
<div className="bg-white/5 rounded-xl p-6 border border-white/20">
  <h3 className="text-lg font-semibold text-white mb-4">إحصائيات حسب الولاية</h3>
  <div className="space-y-3">
    {financialStats.byWilaya?.map((stat: any, index: number) => (
      <div key={index} className="p-4 sm:p-6 bg-white/5 rounded-lg border-2 border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div>
<div className="text-white font-medium">{stat.wilayaName}</div>
<div className="text-white/60 text-sm flex items-center gap-2">
  <span>إجمالي: {stat.reservationCount} حجوزات</span>
  <button
    onClick={() => {
     
      fetchReservationDetails('wilaya', stat._id, stat.wilayaName);
    }}
    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded text-xs transition-colors"
  >
    عرض التفاصيل
  </button>
</div>
          </div>
          <div className="text-left">
<div className="text-green-400 font-semibold">{stat.completedRevenue || 0} دج</div>
<div className="text-white/60 text-sm">إيرادات (مكتملة)</div>
          </div>
        </div>
        
        {/* Status Breakdown */}
        {stat.statusBreakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
{stat.statusBreakdown.map((status: any, idx: number) => (
  <div key={idx} className={`p-2 rounded text-xs ${
    status.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
    status.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
    status.status === 'completed' ? 'bg-green-500/10 text-green-400' :
    status.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
    'bg-gray-500/10 text-gray-400'
  }`}>
    <div className="font-medium">
      {status.status === 'pending' ? 'في الانتظار' :
       status.status === 'confirmed' ? 'مؤكد' :
       status.status === 'completed' ? 'مكتمل' :
       status.status === 'cancelled' ? 'ملغي' : status.status}
    </div>
    <div className="text-white/80">{status.count} حجوزات</div>
    <div className="text-white/60">{status.revenue} دج</div>
  </div>
))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>
          )}

          {/* By Office */}
          {(financialFilter === 'all' || financialFilter === 'office') && (
<div className="bg-white/5 rounded-xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-white mb-4">إحصائيات حسب المكتب</h3>
  <div className="space-y-3">
    {financialStats.byOffice?.map((stat: any, index: number) => (
      <div key={index} className="p-4 sm:p-6 bg-white/5 rounded-lg  border-2 border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div>
<div className="text-white font-medium">{stat.officeName}</div>
<div className="text-white/60 text-sm flex items-center gap-2">
  <span>إجمالي: {stat.reservationCount} حجوزات</span>
  <button
    onClick={() => fetchReservationDetails('office', stat._id, stat.officeName)}
    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded text-xs transition-colors"
  >
    عرض التفاصيل
  </button>
</div>
          </div>
          <div className="text-left">
<div className="text-green-400 font-semibold">{stat.completedRevenue || 0} دج</div>
<div className="text-white/60 text-sm">إيرادات (مكتملة)</div>
          </div>
        </div>
        
        {/* Status Breakdown */}
        {stat.statusBreakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
{stat.statusBreakdown.map((status: any, idx: number) => (
  <div key={idx} className={`p-2 rounded text-xs ${
    status.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
    status.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
    status.status === 'completed' ? 'bg-green-500/10 text-green-400' :
    status.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
    'bg-gray-500/10 text-gray-400'
  }`}>
    <div className="font-medium">
      {status.status === 'pending' ? 'في الانتظار' :
       status.status === 'confirmed' ? 'مؤكد' :
       status.status === 'completed' ? 'مكتمل' :
       status.status === 'cancelled' ? 'ملغي' : status.status}
    </div>
    <div className="text-white/80">{status.count} حجوزات</div>
    <div className="text-white/60">{status.revenue} دج</div>
  </div>
))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>
          )}

          {/* By Employer */}
          {(financialFilter === 'all' || financialFilter === 'employer') && (
<div className="bg-white/5 rounded-xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-white mb-4">إحصائيات حسب الموظف</h3>
  <div className="space-y-3">
    {financialStats.byEmployer?.map((stat: any, index: number) => (
      <div key={index} className="p-4 sm:p-6 bg-white/5 rounded-lg  border-2 border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div>
<div className="text-white font-medium">{stat.employerName}</div>
<div className="text-white/60 text-sm flex items-center gap-2">
  <span>إجمالي: {stat.reservationCount} حجوزات</span>
  <button
    onClick={() => fetchReservationDetails('employer', stat._id, stat.employerName)}
    className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded text-xs transition-colors"
  >
    عرض التفاصيل
  </button>
</div>
          </div>
          <div className="text-left">
<div className="text-green-400 font-semibold">{stat.completedRevenue || 0} دج</div>
<div className="text-white/60 text-sm">إيرادات (مكتملة)</div>
          </div>
        </div>
        
        {/* Status Breakdown */}
        {stat.statusBreakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
{stat.statusBreakdown.map((status: any, idx: number) => (
  <div key={idx} className={`p-2 rounded text-xs ${
    status.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
    status.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
    status.status === 'completed' ? 'bg-green-500/10 text-green-400' :
    status.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
    'bg-gray-500/10 text-gray-400'
  }`}>
    <div className="font-medium">
      {status.status === 'pending' ? 'في الانتظار' :
       status.status === 'confirmed' ? 'مؤكد' :
       status.status === 'completed' ? 'مكتمل' :
       status.status === 'cancelled' ? 'ملغي' : status.status}
    </div>
    <div className="text-white/80">{status.count} حجوزات</div>
    <div className="text-white/60">{status.revenue} دج</div>
  </div>
))}
          </div>
        )}
      </div>
    ))}
  </div>
</div>
          )}
        </div>
      </div>
    )}
  </div>
</div>
          )}

      {/* Reservation Details Modal */}
      {showReservationDetails && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
          onClick={() => setShowReservationDetails(false)}
        >
          <div 
className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-4xl relative z-[100000] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto"
style={{
  scrollbarWidth: 'thin',
  scrollbarColor: '#cbd5e1 #f1f5f9'
}}
onClick={(e) => e.stopPropagation()}
          >
<div className="flex justify-between items-center mb-6">
  <h3 className="text-xl font-bold text-gray-800">
    تفاصيل الحجوزات - {detailedReservations.name}
  </h3>
  <button
    onClick={() => setShowReservationDetails(false)}
    className="text-gray-400 hover:text-gray-600"
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>

{detailsLoading ? (
  <div className="flex items-center justify-center h-64">
    <div className="text-gray-600">جاري تحميل التفاصيل...</div>
  </div>
) : (
  <div className="space-y-4">
    {detailedReservations.reservations?.length > 0 ? (
      detailedReservations.reservations.map((reservation: any, index: number) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header with Property and Status */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
<div className="flex items-center justify-between">
  <div>
    <h4 className="text-lg font-semibold text-gray-800">
      {reservation.propertyId?.title || 'عقار غير محدد'}
    </h4>
    <p className="text-sm text-gray-600 mt-1">
      {reservation.propertyId?.description || 'لا يوجد وصف'}
    </p>
    <p className="text-sm font-medium text-gray-700 mt-1">
      العميل: {reservation.customerName || 'غير محدد'}
    </p>
  </div>
  <div className="flex flex-col items-end gap-2">
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
      reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
      reservation.status === 'completed' ? 'bg-green-100 text-green-800' :
      reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {reservation.status === 'pending' ? 'في الانتظار' :
       reservation.status === 'confirmed' ? 'مؤكد' :
       reservation.status === 'completed' ? 'مكتمل' :
       reservation.status === 'cancelled' ? 'ملغي' :
       reservation.status}
    </span>
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      reservation.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
      reservation.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800'
    }`}>
      {reservation.paymentStatus === 'paid' ? 'مدفوع بالكامل' : 
       reservation.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'معلق'}
    </span>
  </div>
</div>
          </div>

          {/* Customer Information */}
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
<h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
  </svg>
  معلومات العميل
</h5>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6">
  <div>
    <span className="text-xs text-gray-600 block">اسم العميل</span>
    <p className="font-medium text-gray-900">{reservation.customerName}</p>
  </div>
  <div>
    <span className="text-xs text-gray-600 block">رقم الهاتف</span>
    <p className="font-medium text-gray-900">{reservation.customerPhone}</p>
  </div>
</div>
          </div>

          {/* Date Information */}
          <div className="px-6 py-4 bg-purple-50 border-b border-gray-200">
<h5 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
  </svg>
  معلومات التاريخ
</h5>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:p-6">
  <div>
    <span className="text-xs text-gray-600 block">تاريخ البدء</span>
    <p className="font-medium text-gray-900">
      {new Date(reservation.startDate).toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
  </div>
  <div>
    <span className="text-xs text-gray-600 block">تاريخ الانتهاء</span>
    <p className="font-medium text-gray-900">
      {new Date(reservation.endDate).toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
  </div>
  <div>
    <span className="text-xs text-gray-600 block">مدة الإيجار</span>
    <p className="font-medium text-gray-900">{reservation.durationDays || 0} أيام</p>
  </div>
</div>
          </div>

          {/* Financial Information */}
          <div className="px-6 py-4 bg-green-50">
<h5 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
  <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
  </svg>
  المعلومات المالية
</h5>
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:p-6">
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <span className="text-xs text-gray-600 block">السعر الإجمالي</span>
    <p className="text-lg font-bold text-gray-900">{reservation.totalPrice.toLocaleString()} دج</p>
  </div>
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <span className="text-xs text-gray-600 block">المبلغ المدفوع</span>
    <p className="text-lg font-bold text-green-600">{reservation.paidAmount.toLocaleString()} دج</p>
  </div>
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <span className="text-xs text-gray-600 block">المبلغ المتبقي</span>
    <p className={`text-lg font-bold ${reservation.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
      {reservation.remainingAmount.toLocaleString()} دج
    </p>
  </div>
  <div className="bg-white rounded-lg p-3 border border-gray-200">
    <span className="text-xs text-gray-600 block">نسبة الدفع</span>
    <p className="text-lg font-bold text-blue-600">
      {reservation.totalPrice > 0 
        ? Math.round((reservation.paidAmount / reservation.totalPrice) * 100) 
        : 0}%
    </p>
  </div>
</div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
        <p className="text-gray-600 text-lg">لا توجد حجوزات لهذا {detailedReservations.type === 'wilaya' ? 'الولاية' : detailedReservations.type === 'office' ? 'المكتب' : 'الموظف'}</p>
        <p className="text-gray-500 text-sm mt-2">قد لا تكون هناك حجوزات مسجلة في هذه الفترة</p>
      </div>
    )}
  </div>
)}
          </div>
        </div>
      )}

          {/* Order Details Modal */}
          {showOrderDetails && selectedOrder && (
<div 
  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
  onClick={() => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  }}
>
  <div 
    className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-5xl lg:max-w-4xl md:max-w-3xl sm:max-w-full mx-4 relative z-[100000] max-h-[90vh] sm:max-h-[95vh] overflow-y-auto"
    style={{
      scrollbarWidth: 'thin',
      scrollbarColor: '#cbd5e1 #f1f5f9'
    }}
    onClick={(e) => e.stopPropagation()}
  >
    <h3 className="text-xl font-bold text-gray-800 mb-4">تفاصيل طلب الحجز</h3>
    
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
          <p className="text-gray-900">{selectedOrder.fullname}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
          <p className="text-gray-900">{selectedOrder.phoneNumber}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نوع الطلب</label>
          <p className="text-gray-900">
{selectedOrder.orderType === 'reserver_property' ? 'عقار محجوز' : 'عقار جديد'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
          <p className="text-gray-900">
{selectedOrder.status === 'pending' ? 'في الانتظار' :
 selectedOrder.status === 'processing' ? 'قيد المعالجة' :
 selectedOrder.status === 'approved' ? 'موافق عليه' :
 selectedOrder.status === 'rejected' ? 'مرفوض' :
 selectedOrder.status}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">العقار</label>
          <p className="text-gray-900">{selectedOrder.propertyId?.title || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الولاية</label>
          <p className="text-gray-900">{selectedOrder.wilayaId?.name || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البدء</label>
          <p className="text-gray-900">{new Date(selectedOrder.startDate).toLocaleDateString('ar-DZ')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء</label>
          <p className="text-gray-900">{new Date(selectedOrder.endDate).toLocaleDateString('ar-DZ')}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المدة</label>
          <p className="text-gray-900">
{Math.ceil((new Date(selectedOrder.endDate).getTime() - new Date(selectedOrder.startDate).getTime()) / (1000 * 60 * 60 * 24))} أيام
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
          <p className="text-gray-900">
{selectedOrder.priority === 'high' ? 'عالية' :
 selectedOrder.priority === 'medium' ? 'متوسطة' :
 'منخفضة'}
          </p>
        </div>
      </div>

      {selectedOrder.notes && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات العميل</label>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
        </div>
      )}

      {selectedOrder.adminNotes && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات الإدارة</label>
          <p className="text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedOrder.adminNotes}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
        <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString('ar-DZ')}</p>
      </div>
    </div>

    <div className="flex justify-end mt-6">
      <button
        onClick={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        إغلاق
      </button>
    </div>
  </div>
</div>
          )}

          {/* Order Action Modal */}
          {showOrderActionModal && selectedOrder && orderAction && (
<div 
  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 "
  onClick={() => {
    setShowOrderActionModal(false);
    setSelectedOrder(null);
    setOrderAction(null);
    setAdminNotes('');
  }}
>
  <div 
    className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 w-full max-w-md relative z-[100000] max-h-[90vh] overflow-y-auto"
    onClick={(e) => e.stopPropagation()}
  >
    <h3 className="text-xl font-bold text-gray-800 mb-4">
      {orderAction === 'approve' 
        ? (selectedOrder?.status === 'rejected' ? 'إعادة الموافقة على الطلب' : 'الموافقة على الطلب')
        : 'رفض الطلب'
      }
    </h3>
    
    <div className="mb-4">
      <p className="text-gray-600 mb-2">
        هل أنت متأكد من {orderAction === 'approve' 
          ? (selectedOrder?.status === 'rejected' ? 'إعادة الموافقة على' : 'الموافقة على') 
          : 'رفض'} طلب الحجز التالي؟
      </p>
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="font-medium">{selectedOrder.fullname}</p>
        <p className="text-sm text-gray-600">{selectedOrder.phoneNumber}</p>
        <p className="text-sm text-gray-600">{selectedOrder.propertyId?.title}</p>
      </div>
    </div>

    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ملاحظات الإدارة (اختياري)
      </label>
      <textarea
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        placeholder="أضف ملاحظاتك هنا..."
      />
    </div>

    {orderError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {orderError}
      </div>
    )}

    <div className="flex flex-col space-y-2">
      {orderAction === 'approve' && (
        <button
          onClick={() => selectedOrder?.orderType === 'notreserver_property' && handleOrderAction(selectedOrder._id, 'approve_and_reserve', adminNotes)}
          disabled={selectedOrder?.orderType === 'reserver_property'}
          className={`w-full px-4 py-2 rounded-lg transition-colors ${
            selectedOrder?.orderType === 'reserver_property' 
              ? 'bg-gray-200 text-black cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          الموافقة والحجز في الحين
          {selectedOrder?.orderType === 'reserver_property' && (
            <> (العقار محجوز بالفعل)</>
          )}
        </button>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={() => handleOrderAction(selectedOrder._id, orderAction, adminNotes)}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
            orderAction === 'approve' 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {orderAction === 'approve' 
            ? (selectedOrder?.status === 'rejected' ? 'إعادة الموافقة' : 'موافقة')
            : 'رفض'
          }
        </button>
        <button
          onClick={() => {
            setShowOrderActionModal(false);
            setSelectedOrder(null);
            setOrderAction(null);
            setAdminNotes('');
          }}
          className="flex-1 px-4 mx-2 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
</div>
          )}
          </div>
        </main>
      </div>
      
      {/* Admin Profile Modal */}
      {adminUser && (
        <AdminProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          adminUser={adminUser}
        />
      )}
    </div>

  );
}
