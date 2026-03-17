'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Home, Calendar, Phone, Filter, X, MessageCircle, DollarSign, Users, Users2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import PropertyPreviewModal from './PropertyPreviewModal';
import ReservationModal from './ReservationModal';
import ContactModal from './ContactModal';
import AdminCalendar from './AdminCalendar';
import { useToast } from '../contexts/ToastContext';

interface Property {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
  priceBeforeDiscountPerDay?: number;
  images: string[];
  wilayaId: {
    _id: string;
    name: string;
  };
  officeId: {
    _id: string;
    name: string;
  };
  available: boolean;
  isReserved: boolean;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  propertyType?: string;
  amenities?: string[];
  reservationEndDate?: string;
  createdAt?: string;
  updatedAt?: string;
  locationGoogleMapLink?: string;
  targetAudience?: string;
  capacity?: number;
  reserveTheProperty?: string;
}

interface Wilaya {
  _id: string;
  name: string;
}

const PropertySearch = () => {
  const { addToast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('');
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showDateCalendar, setShowDateCalendar] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [photoPreviewIndex, setPhotoPreviewIndex] = useState(0);
  
  // Advanced filter states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [capacity, setCapacity] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [reserveType, setReserveType] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch properties and wilayas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch wilayas first
        const wilayasResponse = await fetch('https://dmtart.pro/mimorent/api/wilayas');
        const wilayasData = await wilayasResponse.json();
        
        if (wilayasData.success) {
          setWilayas(wilayasData.data.wilayas || []);
        }
        
        // Fetch properties will be done based on filters
        await fetchProperties();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch properties based on filters
  const fetchProperties = async () => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedWilaya) params.append('wilayaId', selectedWilaya);
      if (targetAudience) params.append('targetAudience', targetAudience);
      if (capacity) params.append('capacity', capacity);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (reserveType) params.append('reserveType', reserveType);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      
      const url = `https://dmtart.pro/mimorent/api/properties?${params.toString()}`;
      console.log('Fetching from public properties endpoint:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success) {
        setProperties(data.data.properties || []);
      } else {
        console.error('API Error:', data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  // Refetch properties when filters change
  useEffect(() => {
    if (!loading) {
      fetchProperties();
    }
  }, [searchTerm, selectedWilaya, targetAudience, capacity, priceRange, reserveType, dateRange]);

  // Function to calculate end date for monthly reservations (same as admin dashboard)
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

  // Handle date changes for monthly reservations
  const handleStartDateChange = (date: string) => {
    const newDateRange = { ...dateRange, startDate: date };
    
    // If monthly reservation, auto-calculate end date (same as admin dashboard)
    if (reserveType === 'monthly') {
      newDateRange.endDate = calculateMonthlyEndDate(date, 1);
    }
    
    setDateRange(newDateRange);
  };

  const handleEndDateChange = (date: string) => {
    // For monthly reservations, validate that the day matches start date
    if (reserveType === 'monthly' && dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      const end = new Date(date);
      
      // Check if days match
      if (start.getDate() !== end.getDate()) {
        // Don't allow the change - keep the same day as start date
        const correctedEndDate = new Date(start);
        correctedEndDate.setFullYear(end.getFullYear(), end.getMonth(), start.getDate());
        setDateRange(prev => ({ ...prev, endDate: correctedEndDate.toISOString().split('T')[0] }));
        return;
      }
    }
    
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  // Properties are now filtered on the backend, so we just set them directly
  useEffect(() => {
    setFilteredProperties(properties);
  }, [properties]);

  const openContactModal = (property: Property) => {
    setSelectedProperty(property);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedProperty(null);
  };

  const openPreviewModal = (property: Property) => {
    setSelectedProperty(property);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedProperty(null);
  };

  const openReservationModal = (property: Property) => {
    setSelectedProperty(property);
    setShowReservationModal(true);
  };

  const closeReservationModal = () => {
    setShowReservationModal(false);
    setSelectedProperty(null);
  };

  const openPhotoPreview = (property: Property, imageIndex: number) => {
    setSelectedProperty(property);
    setPhotoPreviewIndex(imageIndex);
    setShowPhotoPreview(true);
  };

  const closePhotoPreview = () => {
    setShowPhotoPreview(false);
    setSelectedProperty(null);
    setPhotoPreviewIndex(0);
  };

  const nextPreviewImage = () => {
    if (selectedProperty && selectedProperty.images.length > 0) {
      setPhotoPreviewIndex((prev) => (prev + 1) % selectedProperty.images.length);
    }
  };

  const prevPreviewImage = () => {
    if (selectedProperty && selectedProperty.images.length > 0) {
      setPhotoPreviewIndex((prev) => 
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const nextImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[propertyId] || 0;
      const nextIndex = (currentIndex + 1) % totalImages;
      return { ...prev, [propertyId]: nextIndex };
    });
  };

  const prevImage = (propertyId: string, totalImages: number) => {
    setCurrentImageIndex(prev => {
      const currentIndex = prev[propertyId] || 0;
      const prevIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      return { ...prev, [propertyId]: prevIndex };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#24697f] mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل العقارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 py-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ابحث عن عقارك المثالي</h1>
            <p className="text-gray-600">استكشف أفضل العقارات المتاحة في جميع أنحاء الجزائر</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/95"></div>
            <div className="absolute top-0 left-0 w-48 h-full bg-gradient-to-r from-[#24697f]/5 to-transparent opacity-60"></div>
            <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-pink-500/5 to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#24697f]/20 to-transparent"></div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                {/* Search Input */}
                <div className="col-span-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                    <input
                      type="text"
                      placeholder="ابحث عن عقار..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="relative w-full pl-10 pr-3 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm"
                    />
                  </div>
                </div>

                {/* Wilaya Filter */}
                <div className="col-span-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                    <select
                      value={selectedWilaya}
                      onChange={(e) => setSelectedWilaya(e.target.value)}
                      className="relative w-full pl-10 pr-8 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm"
                    >
                      <option value="">الكل</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya._id} value={wilaya._id}>
                          {wilaya.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Filters Toggle with Active Tags */}
              <div className="mt-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="group relative px-4 py-2 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-full border border-[#24697f]/30 backdrop-blur-sm hover:from-[#24697f]/20 hover:to-teal-500/20 transition-all duration-300 flex items-center space-x-2 space-x-reverse"
                  >
                    <Filter className="w-4 h-4 text-[#24697f]" />
                    <span className="text-[#24697f] font-medium text-sm">
                      {showAdvancedFilters ? 'إخفاء الفلاتر المتقدمة' : 'عرض الفلاتر المتقدمة'}
                    </span>
                    <svg
                      className={`w-4 h-4 text-[#24697f] transition-transform duration-300 ${showAdvancedFilters ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Active Filter Tags */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Search Tag */}
                    {searchTerm && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-blue-500/15 to-blue-600/15 rounded-full border border-blue-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <Search className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 text-xs font-medium">{searchTerm}</span>
                        <button
                          onClick={() => setSearchTerm('')}
                          className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-blue-600" />
                        </button>
                      </div>
                    )}

                    {/* Wilaya Tag */}
                    {selectedWilaya && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-green-500/15 to-green-600/15 rounded-full border border-green-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span className="text-green-700 text-xs font-medium">
                          {wilayas.find(w => w._id === selectedWilaya)?.name}
                        </span>
                        <button
                          onClick={() => setSelectedWilaya('')}
                          className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-green-600" />
                        </button>
                      </div>
                    )}

                    {/* Reservation Status Tag - REMOVED */}

                    {/* Target Audience Tag */}
                    {targetAudience && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-blue-500/15 to-indigo-600/15 rounded-full border border-blue-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <Users className="w-3 h-3 text-blue-600" />
                        <span className="text-blue-700 text-xs font-medium">
                          {targetAudience === 'family' ? 'عائلي' : targetAudience === 'normal' ? 'فردي' : 'للكل'}
                        </span>
                        <button
                          onClick={() => setTargetAudience('')}
                          className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-blue-600" />
                        </button>
                      </div>
                    )}

                    {/* Capacity Tag */}
                    {capacity && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-orange-500/15 to-orange-600/15 rounded-full border border-orange-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <Users2 className="w-3 h-3 text-orange-600" />
                        <span className="text-orange-700 text-xs font-medium">
                          {capacity === 'unspecified' ? 'غير محدد' : 
                           capacity === '10+' ? '10+ شخص' : `${capacity} شخص`}
                        </span>
                        <button
                          onClick={() => setCapacity('')}
                          className="w-4 h-4 bg-orange-500/20 rounded-full flex items-center justify-center hover:bg-orange-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-orange-600" />
                        </button>
                      </div>
                    )}

                    {/* Price Range Tag */}
                    {(priceRange.min || priceRange.max) && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-green-500/15 to-teal-600/15 rounded-full border border-green-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-green-700 text-xs font-medium">
                          {priceRange.min && `من: ${priceRange.min}`}
                          {priceRange.min && priceRange.max && ' - '}
                          {priceRange.max && `إلى: ${priceRange.max}`}
                          {priceRange.min && !priceRange.max && ' دج+'}
                          {priceRange.max && !priceRange.min && `حتى: ${priceRange.max} دج`}
                        </span>
                        <button
                          onClick={() => setPriceRange({ min: '', max: '' })}
                          className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center hover:bg-green-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-green-600" />
                        </button>
                      </div>
                    )}

                    {/* Reserve Type Tag */}
                    {reserveType && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-indigo-500/15 to-indigo-600/15 rounded-full border border-indigo-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span className="text-indigo-700 text-xs font-medium">
                          {reserveType === 'daily' ? 'حجز يومي' : 'حجز شهري'}
                        </span>
                        <button
                          onClick={() => setReserveType('')}
                          className="w-4 h-4 bg-indigo-500/20 rounded-full flex items-center justify-center hover:bg-indigo-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-indigo-600" />
                        </button>
                      </div>
                    )}

                    {/* Date Range Tag */}
                    {(dateRange.startDate || dateRange.endDate) && (
                      <div className="group relative px-3 py-1.5 bg-gradient-to-r from-pink-500/15 to-rose-600/15 rounded-full border border-pink-200/50 backdrop-blur-sm flex items-center space-x-2 space-x-reverse w-full justify-between">
                        <Calendar className="w-3 h-3 text-pink-600" />
                        <span className="text-pink-700 text-xs font-medium">
                          {dateRange.startDate && (() => {
                            const date = new Date(dateRange.startDate);
                            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                          })()}
                          {dateRange.startDate && dateRange.endDate && ' - '}
                          {dateRange.endDate && (() => {
                            const date = new Date(dateRange.endDate);
                            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                          })()}
                          {dateRange.startDate && !dateRange.endDate && ' فصاعدا'}
                          {!dateRange.startDate && dateRange.endDate && ' وحتى'}
                        </span>
                        <button
                          onClick={() => setDateRange({ startDate: '', endDate: '' })}
                          className="w-4 h-4 bg-pink-500/20 rounded-full flex items-center justify-center hover:bg-pink-500/30 transition-colors"
                        >
                          <X className="w-2.5 h-2.5 text-pink-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-6 p-6 bg-gradient-to-br from-white/70 via-white/60 to-white/50 backdrop-blur-md rounded-3xl border border-gray-200/60 shadow-2xl">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-[#24697f]" />
                      فلاتر البحث المتقدمة
                    </h3>
                    <p className="text-sm text-gray-600">استخدم الفلاتر التالية للعثور على العقار المثالي لك</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Target Audience */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        الجمهور المستهدف
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="relative w-full pl-10 pr-8 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm"
                        >
                          <option value="">الكل</option>
                          <option value="family">عائلي</option>
                          <option value="normal">فردي</option>
                          <option value="both">للكل</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Users2 className="w-4 h-4 mr-2 text-orange-500" />
                        السعة بالضبط
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Users2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                        <select
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          className="relative w-full pl-10 pr-8 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm"
                        >
                          <option value="">الكل</option>
                          <option value="unspecified">غير محدد</option>
                          <option value="1">1 شخص</option>
                          <option value="2">2 شخص</option>
                          <option value="3">3 شخص</option>
                          <option value="4">4 شخص</option>
                          <option value="5">5 شخص</option>
                          <option value="6">6 شخص</option>
                          <option value="8">8 شخص</option>
                          <option value="10+">10+ شخص</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                          السعر الأدنى
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                          <input
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                            className="relative w-full pl-10 pr-3 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                          السعر الأعلى
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                          <input
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                            className="relative w-full pl-10 pr-3 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm"
                            placeholder="10000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reservation Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                        نوع الحجز
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                        <select
                          value={reserveType}
                          onChange={(e) => setReserveType(e.target.value)}
                          className="relative w-full pl-10 pr-8 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent appearance-none transition-all duration-300 text-gray-900 hover:bg-gray-100/90 z-10 cursor-pointer text-sm"
                        >
                          <option value="">الكل</option>
                          <option value="daily">يومي</option>
                          <option value="monthly">شهري</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                                      </div>
                </div>
              )}

              {/* Separate Reservation Date Section */}
              <div className="bg-gradient-to-br mt-4 from-indigo-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl border border-indigo-200/50 shadow-lg">
                <div className="p-6 ">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                      تواريخ الحجز
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                        تاريخ البدء
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                          className="relative w-full pl-10 pr-3 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm"
                        />
                      </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-rose-500" />
                        تاريخ الانتهاء
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#24697f] z-10" />
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => handleEndDateChange(e.target.value)}
                          min={dateRange.startDate}
                          className="relative w-full pl-10 pr-3 py-3 border border-gray-300/50 bg-gray-50/90 backdrop-blur-sm rounded-2xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-600 hover:bg-gray-100/90 z-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monthly reservation note */}
                  {reserveType === 'monthly' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-800">
                          <p className="font-medium">ملاحظة للحجز الشهري:</p>
                          <p>يتم حساب تاريخ الانتهاء تلقائياً عند تغيير تاريخ البدء.</p>
                          <p className="text-xs mt-1">يمكنك تغيير الشهر والسنة فقط، اليوم يبقى كما في تاريخ البدء.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Calendar - Show Directly */}
                  <div className="mt-6">
                    <AdminCalendar
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                      reserveType={reserveType as 'daily' | 'monthly'}
                      onClose={() => {}} // No close needed since it's always visible
                    />
                  </div>
                </div>
              </div>

              {/* Results Count and Clear Filter */}
              <div className="mt-6 flex items-center justify-between w-full">
                <div className="flex items-center space-x-4 space-x-reverse flex-1">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#24697f]/20 to-teal-500/20 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative px-4 py-2 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-full border border-[#24697f]/30 backdrop-blur-sm flex items-center min-w-fit whitespace-nowrap">
                      <div className="w-1.5 h-1.5 bg-[#24697f] rounded-full mr-2 animate-pulse"></div>
                      <span className="text-[#24697f] font-bold text-sm whitespace-nowrap">
                        {filteredProperties.length} عقار متاح
                      </span>
                    </div>
                  </div>
                  {(searchTerm || selectedWilaya) && (
                    <div className="flex items-center space-x-3 space-x-reverse bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 min-w-fit">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span className="text-gray-600 text-sm font-medium">
                          {searchTerm && `بحث: "${searchTerm}"`}
                          {searchTerm && selectedWilaya && ' • '}
                          {selectedWilaya && wilayas.find(w => w._id === selectedWilaya)?.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative Arrow Shapes */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="flex items-center">
                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300/30 to-transparent"></div>
                    <div className="w-2 h-2 border-t-2 border-r-2 border-gray-300/30 transform rotate-45 -translate-y-1"></div>
                  </div>
                  <div className="w-2 h-2 bg-gradient-to-r from-teal-400/20 to-pink-400/20 rounded-full animate-pulse"></div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 border-t-2 border-l-2 border-gray-300/30 transform -rotate-45 -translate-y-1"></div>
                    <div className="w-8 h-px bg-gradient-to-r from-gray-300/30 via-transparent to-transparent"></div>
                  </div>
                </div>
                
                  {(searchTerm || selectedWilaya || targetAudience || capacity || priceRange.min || priceRange.max || reserveType || dateRange.startDate || dateRange.endDate) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedWilaya('');
                        setTargetAudience('');
                        setCapacity('');
                        setPriceRange({ min: '', max: '' });
                        setReserveType('');
                        setDateRange({ startDate: '', endDate: '' });
                      }}
                      className="group relative px-6 py-3 bg-gradient-to-r from-pink-500/10 to-pink-600/10 rounded-full border border-pink-200/50 backdrop-blur-sm hover:from-pink-500/20 hover:to-pink-600/20 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md min-w-fit"
                    >
                      <span className="text-pink-600 text-sm font-medium group-hover:text-pink-700 transition-colors duration-300 flex items-center">
                        <X className="w-4 h-4 ml-2" />
                        مسح التصفية
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد عقارات متاحة</h3>
            <p className="text-gray-500 mb-4">جرب تغيير معايير البحث أو التصفية</p>
            {(searchTerm || selectedWilaya) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedWilaya('');
                  setTargetAudience('');
                  setCapacity('');
                  setPriceRange({ min: '', max: '' });
                  setReserveType('');
                  setDateRange({ startDate: '', endDate: '' });
                }}
                className="px-4 py-2 bg-[#24697f] text-white rounded-lg hover:bg-[#1a5366] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                عرض جميع العقارات
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property._id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-1000 group-hover:duration-300"></div>
                <div 
                  className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden hover:shadow-3xl hover:scale-[1.02] transition-all duration-500 cursor-pointer"
                  onClick={() => openPreviewModal(property)}
                >
                {/* Property Image */}
                <div className="h-36 bg-gradient-to-br cursor-pointer from-[#24697f] via-teal-600 to-pink-600 relative overflow-hidden group" onClick={(e) => {
                  e.stopPropagation();
                  openPhotoPreview(property, currentImageIndex[property._id] || 0);
                }}>
                  {property.images && property.images.length > 0 ? (
                    <>
                      <img
                        src={property.images[currentImageIndex[property._id] || 0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Navigation Buttons - Only show if multiple images */}
                      {property.images.length > 1 && (
                        <>
                          {/* Previous Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              prevImage(property._id, property.images.length);
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110 shadow-lg z-20"
                          >
                            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          {/* Next Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              nextImage(property._id, property.images.length);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110 shadow-lg z-20"
                          >
                            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Image Indicator */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 opacity-100 transition-opacity duration-300 z-20">
                            {property.images.map((_, index) => (
                              <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  index === (currentImageIndex[property._id] || 0)
                                    ? 'bg-white w-3'
                                    : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-lg border border-white/40 shadow-2xl ${
                      property.isReserved ? 'bg-gradient-to-r from-pink-500/95 to-pink-600/95 text-white' : 'bg-gradient-to-r from-teal-500/95 to-teal-600/95 text-white'
                    }`}>
                      {property.isReserved ? 'محجوز' : 'متاح'}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Property Details */}
                <div className="p-4 bg-gradient-to-b from-white/95 via-white/90 to-white/80 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#24697f] transition-colors duration-300 flex-1 mr-2">{property.title}</h3>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 border border-[#24697f]/20 rounded-lg">
                        <span className="text-[#24697f] font-bold text-sm">{property.pricePerDay}</span>
                        <span className="text-[#24697f] text-xs ml-1 mx-2">دج/يوم</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Property Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {/* Target Audience Tag */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      (property as any).targetAudience === 'family' 
                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                        : (property as any).targetAudience === 'normal'
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-green-100 text-green-700 border-green-200'
                    }`}>
                      <Users className="w-3 h-3 mr-1" />
                      {(property as any).targetAudience === 'family' ? 'عائلي' : 
                       (property as any).targetAudience === 'normal' ? 'فردي' : 'للكل'}
                    </span>
                    
                    {/* Capacity Tag */}
                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 border-orange-200 rounded-full text-xs font-medium">
                      <Users className="w-3 h-3 mr-1" />
                      السعة: {(property as any).capacity || 'غير محدد'}
                    </span>
                    
                    {/* Reservation Type Tag */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      (property as any).reserveTheProperty === 'daily'
                        ? 'bg-teal-100 text-teal-700 border-teal-200'
                        : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {(property as any).reserveTheProperty === 'daily' ? 'يومي' : 'شهري'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">{property.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-gray-700 text-xs font-medium bg-white/60 px-2 py-1.5 rounded-full border border-gray-200/50">
                      <MapPin className="w-3 h-3 mr-1 text-[#24697f]" />
                      {property.wilayaId.name}
                    </div>
                    <div className="flex items-center text-gray-700 text-xs font-medium bg-white/60 px-2 py-1.5 rounded-full border border-gray-200/50">
                      <Phone className="w-3 h-3 mr-1 text-[#24697f]" />
                      {property.officeId.name}
                    </div>
                  </div>

                  {property.isReserved && property.reservationEndDate && (
                    <div className="mb-3 p-2 bg-gradient-to-r from-pink-50/80 to-pink-100/80 rounded-lg border border-pink-200/50">
                      <div className="flex items-center text-pink-700 text-xs font-medium">
                        <Calendar className="w-3 h-3 mr-2" />
                        تنتهي الحجز: {new Date(property.reservationEndDate).toLocaleDateString('ar-DZ', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreviewModal(property);
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-bold flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-xs"
                    >
                      <Home className="w-3 h-3 mx-2 ml-1" />
                      التفاصيل
                    </button>
                    
                    {property.isReserved ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openContactModal(property);
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-bold flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-xs"
                      >
                        <MessageCircle className="w-3 mx-2 h-3 ml-1" />
                        تواصل
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openReservationModal(property);
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 text-white rounded-xl hover:from-[#1a5366] hover:to-teal-700 transition-all duration-300 font-bold flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-xs"
                      >
                        <Calendar className="w-3 mx-2 h-3 ml-1" />
                        احجز
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

      {/* Contact Modal */}
      <ContactModal
        property={selectedProperty}
        isOpen={showContactModal}
        onClose={closeContactModal}
      />

      {/* Property Preview Modal */}
      <PropertyPreviewModal
        property={selectedProperty}
        isOpen={showPreviewModal}
        onClose={closePreviewModal}
        onContact={openContactModal}
      />

      {/* Reservation Modal */}
      <ReservationModal
        property={selectedProperty}
        isOpen={showReservationModal}
        onClose={closeReservationModal}
      />

      
      {/* Photo Preview Modal */}
      {showPhotoPreview && selectedProperty && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={closePhotoPreview}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Image Container */}
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={selectedProperty.images[photoPreviewIndex]}
              alt={`${selectedProperty.title} - Photo ${photoPreviewIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Navigation Buttons */}
          {selectedProperty.images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={prevPreviewImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={nextPreviewImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          {selectedProperty.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
                {photoPreviewIndex + 1} / {selectedProperty.images.length}
              </span>
            </div>
          )}

          {/* Property Title */}
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full max-w-[300px]">
            <h3 className="text-white text-sm font-medium truncate">
              {selectedProperty.title}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
