'use client';

import { useState } from 'react';
import { X, MapPin, Home, Phone, Mail, Calendar, Users, Bath, Square, Check, Star, Share2, Heart, ArrowLeft, ArrowRight } from 'lucide-react';

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

interface PropertyPreviewModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (property: Property) => void;
}

const PropertyPreviewModal: React.FC<PropertyPreviewModalProps> = ({
  property,
  isOpen,
  onClose,
  onContact
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  if (!isOpen || !property) return null;

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (property.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (property.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  const handleContact = () => {
    onContact(property);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-60 p-4 modal-backdrop"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20"></div>
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90"></div>
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
          
          <div className="relative flex-1 text-center max-w-md mx-4">
            <div className="inline-block">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-1 relative">
                {property.title}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
              </h2>
              <div className="flex items-center justify-center text-gray-500">
                <MapPin className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm" />
                <span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">{property.wilayaId.name}</span>
              </div>
            </div>
          </div>
          
          <div className="relative flex items-center space-x-1">
            <button
              onClick={handleShare}
              className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4 text-gray-600 hover:text-[#24697f]" />
            </button>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
              title={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            >
              <Heart className={`w-4 h-4 transition-all duration-200 ${isLiked ? 'fill-pink-500 text-pink-500 drop-shadow-sm' : 'text-gray-600 hover:text-pink-500'}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Images Section */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`${property.title} - صورة ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home className="w-24 h-24 text-gray-300" />
                  </div>
                )}

                {/* Image Navigation */}
                {property.images && property.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-lg border border-white/40 transition-all duration-300 ${
                    property.isReserved 
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' 
                      : property.available 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                  }`}>
                    {property.isReserved ? 'محجوز' : property.available ? 'متاح' : 'غير متاح'}
                  </span>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        index === currentImageIndex 
                          ? 'border-[#24697f] shadow-xl scale-105 ring-2 ring-[#24697f]/30' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - صورة مصغرة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6 text-center">
              {/* Price and Quick Info */}
              <div className="bg-gradient-to-br from-[#24697f]/10 via-teal-500/10 to-pink-500/10 rounded-3xl p-8 border border-[#24697f]/20 shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    {property.priceBeforeDiscountPerDay && property.priceBeforeDiscountPerDay > property.pricePerDay ? (
                      <div className="space-y-1">
                        <div className="text-lg text-gray-400 line-through">
                          {property.priceBeforeDiscountPerDay.toLocaleString('ar-DZ')} دج/يوم
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent">
                          {property.pricePerDay.toLocaleString('ar-DZ')} 
                          <span className="text-xl font-normal text-gray-600 mr-2">دج/يوم</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          وفر {((property.priceBeforeDiscountPerDay - property.pricePerDay).toLocaleString('ar-DZ'))} دج/يوم
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent">
                        {property.pricePerDay.toLocaleString('ar-DZ')} 
                        <span className="text-xl font-normal text-gray-600 mr-2">دج/يوم</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-2 font-medium">
                      {(property.pricePerDay * 30).toLocaleString('ar-DZ')} دج/شهرياً (تقريباً)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">ممتاز</div>
                  </div>
                </div>

                {/* Property Features */}
                <div className="space-y-4 mt-8">
                  {/* First Row - Basic Features */}
                  <div className="grid grid-cols-2 gap-4">
                    {property.bedrooms && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-800 text-lg">{property.bedrooms}</div>
                            <div className="text-purple-600 text-xs font-medium">غرف نوم</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Bath className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-800 text-lg">{property.bathrooms}</div>
                            <div className="text-blue-600 text-xs font-medium">حمامات</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Second Row - Size & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    {property.area && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Square className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-800 text-lg">{property.area}</div>
                            <div className="text-green-600 text-xs font-medium">متر مربع</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {property.propertyType && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Home className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-800 text-lg capitalize">{property.propertyType}</div>
                            <div className="text-orange-600 text-xs font-medium">نوع العقار</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Third Row - New Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {property.capacity && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 border border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-indigo-800 text-lg">{property.capacity}</div>
                            <div className="text-indigo-600 text-xs font-medium">السعة</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {property.targetAudience && (
                      <div className="group relative overflow-hidden bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 border border-pink-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-pink-800 text-lg">
                              {property.targetAudience === 'family' ? 'عائلات' : 
                               property.targetAudience === 'normal' ? 'أفراد' : 'الجميع'}
                            </div>
                            <div className="text-pink-600 text-xs font-medium">الفئة المستهدفة</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fourth Row - Reservation Type */}
                  {property.reserveTheProperty && (
                    <div className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-4 border border-teal-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-teal-800 text-lg">
                            {property.reserveTheProperty === 'daily' ? 'يومي' : 'شهري'}
                          </div>
                          <div className="text-teal-600 text-xs font-medium">نوع الحجز</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/60 rounded-3xl p-6 backdrop-blur-sm border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">الوصف</h3>
                <p className="text-gray-700 leading-relaxed text-center text-base font-medium">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white/60 rounded-3xl p-6 backdrop-blur-sm border border-white/50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">المرافق</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center justify-center text-gray-700 bg-white/70 rounded-xl p-3 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 border border-white/50">
                        <Check className="w-4 h-4 ml-2 text-teal-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Office Information */}
              <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 rounded-3xl p-6 border border-white/50 shadow-2xl backdrop-blur-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">معلومات المكتب</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/50">
                    <Home className="w-5 h-5 mr-3 text-[#24697f]" />
                    <div className="text-center">
                      <div className="font-bold text-lg">{property.officeId.name}</div>
                      <div className="text-sm text-gray-500 font-medium">وكالة عقارية معتمدة</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/50">
                    <MapPin className="w-5 h-5 mr-3 text-[#24697f]" />
                    <span className="font-medium text-lg">{property.wilayaId.name}</span>
                  </div>
                </div>
              </div>

              {/* Google Maps Location */}
              {property.locationGoogleMapLink && (
                <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-3xl p-6 border border-blue-200/50 shadow-2xl backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent text-right">الموقع على الخريطة</h3>
                  <div className="space-y-3">
                    <a
                      href={property.locationGoogleMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-blue-700 bg-white/60 rounded-xl p-4 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all duration-300 hover:scale-105"
                    >
                      <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                      <div className="text-center">
                        <div className="font-bold text-lg">عرض الموقع</div>
                        <div className="text-sm text-blue-600 font-medium">افتح في خرائط جوجل</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* Availability Status */}
              <div className={`rounded-3xl p-6 border shadow-2xl backdrop-blur-sm transition-all duration-300 ${
                property.isReserved 
                  ? 'bg-gradient-to-br from-pink-50/80 to-pink-100/80 border-pink-200/50' 
                  : property.available 
                    ? 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50' 
                    : 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50'
              }`}>
                <div className="flex items-center justify-center">
                  {property.isReserved ? (
                    <>
                      <Calendar className="w-5 h-5 ml-3 text-pink-500" />
                      <div className="text-center">
                        <div className="font-bold text-lg text-pink-800">محجوز حالياً</div>
                        <div className="text-sm text-pink-600 mt-1">
                          يمكنك تقديم طلب حجز وسيتواصل معك المكتب في حال توفرت فترة زمنية مناسبة
                        </div>
                        {property.reservationEndDate && (
                          <div className="text-sm text-pink-500 mt-2 font-medium">
                            تنتهي الحجز: {new Date(property.reservationEndDate).toLocaleDateString('ar-DZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  ) : property.available ? (
                    <>
                      <Check className="w-5 h-5 ml-3 text-teal-500" />
                      <div className="text-center">
                        <div className="font-bold text-lg text-teal-800">متاح للحجز</div>
                        <div className="text-sm text-teal-600 mt-1">يمكنك حجز هذا العقار فوراً</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 ml-3 text-gray-500" />
                      <div className="text-center">
                        <div className="font-bold text-lg text-gray-800">غير متاح</div>
                        <div className="text-sm text-gray-600 mt-1">هذا العقار غير متاح للحجز حالياً</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200/30 bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex gap-3">
            <button
              onClick={handleContact}
              disabled={!property.available}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                property.isReserved
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white'
                  : property.available
                    ? 'bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {property.isReserved ? (
                <>
                  <Calendar className="w-4 h-4 ml-2" />
                  <span>تقديم طلب حجز</span>
                </>
              ) : property.available ? (
                <>
                  <Phone className="w-4 h-4 ml-2" />
                  <span>تواصل مع المكتب</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 ml-2" />
                  <span>غير متاح</span>
                </>
              )}
            </button>
            
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPreviewModal;