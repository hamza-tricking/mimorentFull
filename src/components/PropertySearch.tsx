'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Home, Calendar, Phone, Filter, X, MessageCircle, DollarSign } from 'lucide-react';
import PropertyPreviewModal from './PropertyPreviewModal';
import ReservationModal from './ReservationModal';
import { useToast } from '../contexts/ToastContext';

interface Property {
  _id: string;
  title: string;
  description: string;
  pricePerDay: number;
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [photoPreviewIndex, setPhotoPreviewIndex] = useState(0);

  // Fetch properties and wilayas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch properties
        const propertiesResponse = await fetch('https://dmtart.pro/mimorent/api/properties');
        const propertiesData = await propertiesResponse.json();
        
        // Fetch wilayas
        const wilayasResponse = await fetch('https://dmtart.pro/mimorent/api/wilayas');
        const wilayasData = await wilayasResponse.json();
        
        if (propertiesData.success) {
          setProperties(propertiesData.data.properties || []);
        }
        
        if (wilayasData.success) {
          setWilayas(wilayasData.data.wilayas || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter properties based on search and wilaya
  useEffect(() => {
    console.log('Filtering properties. Total received:', properties.length);
    console.log('Properties details:', properties.map(p => ({
      title: p.title,
      available: p.available,
      isReserved: p.isReserved
    })));

    let filtered = properties;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.wilayaId.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    // Filter by wilaya
    if (selectedWilaya) {
      filtered = filtered.filter(property =>
        property.wilayaId._id === selectedWilaya
      );
      console.log('After wilaya filter:', filtered.length);
    }

    // Show all available properties (both reserved and not reserved)
    filtered = filtered.filter(property => property.available);

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedWilaya]);

  const openContactModal = (property: Property) => {
    setSelectedProperty(property);
    
    // Calculate default dates based on property reservation
    let defaultStartDate = new Date();
    let defaultEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    if (property.reservationEndDate) {
      const reservationEnd = new Date(property.reservationEndDate);
      console.log('🔍 Reservation end date:', reservationEnd);
      
      // Add 1 day to reservation end date
      defaultStartDate = new Date(reservationEnd);
      defaultStartDate.setDate(reservationEnd.getDate() + 1);
      
      // Add 7 days to start date
      defaultEndDate = new Date(defaultStartDate);
      defaultEndDate.setDate(defaultStartDate.getDate() + 7);
      
      console.log('🔍 Calculated start date:', defaultStartDate);
      console.log('🔍 Calculated end date:', defaultEndDate);
    }
    
    setContactForm({
      name: '',
      phone: '',
      message: '',
      startDate: defaultStartDate.toISOString().split('T')[0],
      endDate: defaultEndDate.toISOString().split('T')[0]
    });
    
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedProperty(null);
    setContactForm({ 
      name: '', 
      phone: '', 
      message: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProperty) return;

    try {
      const orderData = {
        fullname: contactForm.name,
        phoneNumber: contactForm.phone,
        propertyId: selectedProperty._id,
        wilayaId: selectedProperty.wilayaId._id,
        startDate: contactForm.startDate,
        endDate: contactForm.endDate,
        orderType: selectedProperty.isReserved ? 'reserver_property' : 'notreserver_property',
        priority: 'medium',
        notes: `طلب حجز للعقار: ${selectedProperty.title} - ${selectedProperty.isReserved ? 'عقار محجوز حالياً' : 'عقار متاح'} - ${contactForm.message}`
      };

      const response = await fetch('https://dmtart.pro/mimorent/api/orders-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        addToast('تم إرسال طلب الحجز بنجاح! سيتواصل معك المكتب لتأكيد الحجز.', 'success');
        closeContactModal();
      } else {
        // Handle validation errors specifically
        if (result.errors && Array.isArray(result.errors)) {
          const validationError = result.errors[0];
          const errorMessage = validationError.msg || validationError.message || 'فشل إرسال طلب الحجز';
          addToast(errorMessage, 'error');
        } else {
          addToast(result.message || 'فشل إرسال طلب الحجز', 'error');
        }
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      addToast('حدث خطأ في الاتصال بالخادم', 'error');
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
                
                {(searchTerm || selectedWilaya) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedWilaya('');
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
                <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/70 overflow-hidden hover:shadow-3xl hover:scale-[1.02] transition-all duration-500">
                {/* Property Image */}
                <div className="h-36 bg-gradient-to-br cursor-pointer from-[#24697f] via-teal-600 to-pink-600 relative overflow-hidden group" onClick={() => openPhotoPreview(property, currentImageIndex[property._id] || 0)}>
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
                            onClick={() => prevImage(property._id, property.images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-100 transition-all duration-300 hover:bg-white/90 hover:scale-110 shadow-lg z-20"
                          >
                            <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          {/* Next Button */}
                          <button
                            onClick={() => nextImage(property._id, property.images.length)}
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
                      onClick={() => openPreviewModal(property)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-bold flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-xs"
                    >
                      <Home className="w-3 h-3 mx-2 ml-1" />
                      التفاصيل
                    </button>
                    
                    {property.isReserved ? (
                      <button
                        onClick={() => openContactModal(property)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-300 font-bold flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl text-xs"
                      >
                        <MessageCircle className="w-3 mx-2 h-3 ml-1" />
                        تواصل
                      </button>
                    ) : (
                      <button
                        onClick={() => openReservationModal(property)}
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
      {showContactModal && selectedProperty && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-center justify-center z-70 p-4 modal-backdrop">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[95vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
            {/* Header */}
            <div className="relative flex items-center justify-between p-4 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
              <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
              
              <div className="relative flex-1">
                <div className="inline-block">
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
                    {selectedProperty.isReserved ? 'طلب حجز (عقار محجوز)' : 'طلب حجز جديد'}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
                  </h2>
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm" />
                    <span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">{selectedProperty.title}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={closeContactModal}
                className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Property Info */}
              <div className="bg-gradient-to-br from-[#24697f]/10 via-teal-500/10 to-pink-500/10 rounded-3xl p-4 border border-[#24697f]/20 shadow-2xl backdrop-blur-sm mb-4">
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-2 backdrop-blur-sm border border-white/50">
                    <Home className="w-3 h-3 ml-1 text-[#24697f]" />
                    <span className="font-medium text-xs">{selectedProperty.title}</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-2 backdrop-blur-sm border border-white/50">
                    <MapPin className="w-3 h-3 ml-1 text-[#24697f]" />
                    <span className="text-xs font-medium">{selectedProperty.wilayaId.name}</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-2 backdrop-blur-sm border border-white/50">
                    <DollarSign className="w-3 h-3 ml-1 text-[#24697f]" />
                    <span className="text-xs font-bold text-[#24697f]">{selectedProperty.pricePerDay} دج/يوم</span>
                  </div>
                </div>
              </div>

              {selectedProperty.isReserved && (
                <div className="mb-4 p-3 bg-gradient-to-r from-pink-50/80 to-pink-100/80 rounded-xl border border-pink-200/50 backdrop-blur-sm">
                  <div className="flex items-center text-pink-700 text-xs font-medium">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span className="font-bold">محجوز حالياً</span>
                  </div>
                  <div className="text-pink-600 text-xs mt-1">
                    يمكنك تقديم طلب الحجز وسيتم مراجعته من قبل المكتب
                  </div>
                  {selectedProperty.reservationEndDate && (
                    <div className="text-pink-500 text-xs mt-2 font-medium">
                      تنتهي الحجز: {new Date(selectedProperty.reservationEndDate).toLocaleDateString('ar-DZ', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-right">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent text-right transition-all duration-300 text-sm"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-right">رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent text-right transition-all duration-300 text-sm"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-right">تاريخ البدء</label>
                  <input
                    type="date"
                    required
                    value={contactForm.startDate}
                    onChange={(e) => setContactForm({...contactForm, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent text-right transition-all duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-right">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    required
                    value={contactForm.endDate}
                    onChange={(e) => setContactForm({...contactForm, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent text-right transition-all duration-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 text-right">رسالتك</label>
                  <textarea
                    required
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    placeholder="أخبرنا عن احتياجاتك..."
                    className="w-full px-3 py-2 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-[#24697f] focus:border-transparent text-right transition-all duration-300 text-sm resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200/30 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeContactModal}
                  className="px-4 py-2 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  onClick={handleContactSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 text-sm"
                >
                  إرسال طلب الحجز
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
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
