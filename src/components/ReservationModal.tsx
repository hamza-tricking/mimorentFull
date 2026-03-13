'use client';

import { useState } from 'react';
import { X, Calendar, DollarSign, Phone, User, AlertCircle, Home, MapPin, MessageCircle } from 'lucide-react';
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

interface ReservationModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !property) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days * property.pricePerDay;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const orderData = {
        fullname: formData.customerName,
        phoneNumber: formData.customerPhone,
        propertyId: property._id,
        wilayaId: property.wilayaId._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        orderType: 'notreserver_property', // For properties not reserved yet
        priority: 'medium',
        notes: formData.notes ? `طلب حجز للعقار: ${property.title} - السعر: ${property.pricePerDay} دج/يوم - ملاحظات: ${formData.notes}` : `طلب حجز للعقار: ${property.title} - السعر: ${property.pricePerDay} دج/يوم`
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
        onClose();
        // Reset form
        setFormData({
          customerName: '',
          customerPhone: '',
          startDate: '',
          endDate: '',
          notes: ''
        });
      } else {
        // Handle validation errors specifically
        if (result.errors && Array.isArray(result.errors)) {
          const validationError = result.errors[0];
          const errorMessage = validationError.msg || validationError.message || 'فشل إرسال طلب الحجز';
          setError(errorMessage);
          addToast(errorMessage, 'error');
        } else {
          setError(result.message || 'فشل إرسال طلب الحجز');
          addToast(result.message || 'فشل إرسال طلب الحجز', 'error');
        }
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      addToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = calculateTotalPrice();

  return (
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
                طلب حجز جديد
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-[#24697f]/40 to-transparent"></div>
              </h2>
              <div className="flex items-center text-gray-500">
                <Home className="w-3 h-3 ml-1 text-[#24697f] drop-shadow-sm" />
                <span className="text-xs font-medium bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">{property.title}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Property Info */}
          <div className="bg-gradient-to-br from-[#24697f]/10 via-teal-500/10 to-pink-500/10 rounded-3xl p-6 border border-[#24697f]/20 shadow-2xl backdrop-blur-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-center">معلومات العقار</h3>
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-white/50">
                <Home className="w-4 h-4 ml-2 text-[#24697f]" />
                <span className="font-medium text-sm">{property.title}</span>
              </div>
              <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-white/50">
                <MapPin className="w-4 h-4 ml-2 text-[#24697f]" />
                <span className="text-sm font-medium">{property.wilayaId.name}</span>
              </div>
              <div className="flex items-center justify-center text-gray-700 bg-white/60 rounded-xl p-3 backdrop-blur-sm border border-white/50">
                <DollarSign className="w-4 h-4 ml-2 text-[#24697f]" />
                <span className="text-sm font-bold text-[#24697f]">{property.pricePerDay.toLocaleString('ar-DZ')} دج/يوم</span>
              </div>
              {property.reservationEndDate && (
                <div className="flex items-center justify-center text-pink-600 bg-pink-50/50 rounded-xl p-3 backdrop-blur-sm border border-pink-200/50">
                  <Calendar className="w-4 h-4 ml-2" />
                  <span className="text-xs font-medium">الحجز الحالي ينتهي: {new Date(property.reservationEndDate).toLocaleDateString('ar-DZ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-pink-50/80 border border-pink-200/50 rounded-xl flex items-start backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-pink-500 ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-pink-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white/60 rounded-3xl p-6 backdrop-blur-sm border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">معلومات العميل</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                    <User className="w-4 h-4 mr-2 text-[#24697f]" />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-right"
                    placeholder="أدخل اسم العميل الكامل"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                    <Phone className="w-4 h-4 mr-2 text-[#24697f]" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-right"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
              </div>
            </div>

            {/* Reservation Dates */}
            <div className="bg-white/60 rounded-3xl p-6 backdrop-blur-sm border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">تواريخ الحجز</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                    <Calendar className="w-4 h-4 mr-2 text-[#24697f]" />
                    تاريخ البدء
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-right"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                    <Calendar className="w-4 h-4 mr-2 text-[#24697f]" />
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-right"
                  />
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-xl border border-[#24697f]/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">السعر الإجمالي:</span>
                    <span className="text-xl font-bold text-[#24697f]">
                      {totalPrice.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-white/60 rounded-3xl p-6 backdrop-blur-sm border border-white/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#24697f] to-teal-600 bg-clip-text text-transparent text-right">ملاحظات إضافية</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                  <MessageCircle className="w-4 h-4 mr-2 text-[#24697f]" />
                  رسالتك (اختياري)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-[#24697f] focus:border-transparent transition-all duration-300 text-right resize-none"
                  placeholder="أي ملاحظات إضافية أو طلبات خاصة..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200/30 bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300/50 text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 font-medium"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.customerName || !formData.customerPhone || !formData.startDate || !formData.endDate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال طلب الحجز'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
