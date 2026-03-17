'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Phone, User, AlertCircle, Home, MapPin, MessageCircle, Upload, Users, Heart, ArrowRight, ArrowLeft, Check } from 'lucide-react';
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

interface ContactModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullname: '',
    phoneNumber: '',
    isMarried: (property as any)?.targetAudience === 'family' ? true : false,
    numberOfPeople: (property as any)?.targetAudience === 'family' ? 2 : 1,
    identityImages: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 6;

  // Reset form and step when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setError(null);
      setFormData({
        fullname: '',
        phoneNumber: '',
        isMarried: (property as any)?.targetAudience === 'family' ? true : false,
        numberOfPeople: (property as any)?.targetAudience === 'family' ? 2 : 1,
        identityImages: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, property]);

  if (!isOpen || !property) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 4;
    const currentImages = formData.identityImages.length;
    const maxFileSize = 2 * 1024 * 1024; // 2MB per image
    const maxTotalSize = 5 * 1024 * 1024; // 5MB total
    
    if (currentImages >= maxImages) {
      setError(`لا يمكنك إضافة أكثر من ${maxImages} صور`);
      return;
    }
    
    const remainingSlots = maxImages - currentImages;
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      // Check file size
      if (file.size > maxFileSize) {
        setError(`حجم الصورة ${file.name} كبير جدًا. الحد الأقصى هو 2 ميجابايت.`);
        return;
      }
      
      // Compress image before converting to base64
      compressImage(file, 0.7, 800, 600)
        .then(compressedBase64 => {
          // Check total size after compression
          const currentTotalSize = formData.identityImages.reduce((total, img) => {
            return total + (img.length * 0.75); // Approximate base64 size
          }, 0);
          
          const newImageSize = compressedBase64.length * 0.75;
          
          if (currentTotalSize + newImageSize > maxTotalSize) {
            setError(`إجمالي حجم الصور كبير جدًا. الحد الأقصى هو 5 ميجابايت.`);
            return;
          }
          
          setFormData(prev => ({
            ...prev,
            identityImages: [...prev.identityImages, compressedBase64]
          }));
        })
        .catch(error => {
          console.error('Error compressing image:', error);
          setError(`فشل معالجة الصورة ${file.name}.`);
        });
    });
    
    if (files.length > remainingSlots) {
      setError(`تم إضافة ${remainingSlots} صور فقط. الحد الأقصى هو ${maxImages} صور.`);
    }
  };

  // Image compression function
  const compressImage = (file: File, quality: number, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const removeImage = (index: number) => {
    console.log('🔍 Removing image at index:', index);
    console.log('🔍 Current images before removal:', formData.identityImages);
    setFormData(prev => {
      const newImages = prev.identityImages.filter((_, i) => i !== index);
      console.log('🔍 New images after removal:', newImages);
      return {
        ...prev,
        identityImages: newImages
      };
    });
  };

  // Convert blob URL to base64
  const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      return blobUrl; // Fallback to original URL if conversion fails
    }
  };

  // Convert all blob URLs to base64 before submission
  const convertImagesToBase64 = async (images: string[]): Promise<string[]> => {
    const base64Images = await Promise.all(
      images.map(async (image) => {
        if (image.startsWith('blob:')) {
          return await blobUrlToBase64(image);
        }
        return image; // Already a regular URL or base64
      })
    );
    return base64Images;
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Add slide-out effect
      const stepContent = document.querySelector('.step-content');
      if (stepContent) {
        stepContent.classList.add('slide-out-left');
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
          setError(null);
          // Force a reflow and then add slide-in effect
          setTimeout(() => {
            const newStepContent = document.querySelector('.step-content');
            if (newStepContent) {
              newStepContent.classList.remove('slide-out-left');
              newStepContent.classList.add('slide-in-right');
              setTimeout(() => {
                newStepContent.classList.remove('slide-in-right');
              }, 300);
            }
          }, 10);
        }, 200);
      } else {
        setCurrentStep(currentStep + 1);
        setError(null);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Add slide-out effect
      const stepContent = document.querySelector('.step-content');
      if (stepContent) {
        stepContent.classList.add('slide-out-right');
        setTimeout(() => {
          setCurrentStep(currentStep - 1);
          setError(null);
          // Force a reflow and then add slide-in effect
          setTimeout(() => {
            const newStepContent = document.querySelector('.step-content');
            if (newStepContent) {
              newStepContent.classList.remove('slide-out-right');
              newStepContent.classList.add('slide-in-left');
              setTimeout(() => {
                newStepContent.classList.remove('slide-in-left');
              }, 300);
            }
          }, 10);
        }, 200);
      } else {
        setCurrentStep(currentStep - 1);
        setError(null);
      }
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.fullname || !formData.phoneNumber) {
          setError('يرجى إدخال الاسم الكامل ورقم الهاتف');
          return false;
        }
        break;
      case 2:
        // Validate marital status and number of people against property requirements
        const propertyTargetAudience = (property as any).targetAudience;
        const propertyCapacity = (property as any).capacity;
        
        // Check if marital status matches property target audience
        if (propertyTargetAudience === 'family' && !formData.isMarried) {
          setError('هذا العقار مخصص للعائلات فقط. يرجى اختيار "متزوج" للمتابعة.');
          return false;
        }
        
        if (propertyTargetAudience === 'normal' && formData.isMarried) {
          setError('هذا العقار مخصص للأفراد فقط. يرجى اختيار "أعزب" للمتابعة.');
          return false;
        }
        
        // No marital status restriction for 'both' target audience
        
        // Check if number of people exceeds property capacity
        if (propertyCapacity && formData.numberOfPeople > propertyCapacity) {
          setError(`سعة هذا العقار لا تتجاوز ${propertyCapacity} أشخاص. يرجى تقليل عدد الأشخاص.`);
          return false;
        }
        
        // Additional validation for family properties only (not for 'both' or 'normal')
        if (propertyTargetAudience === 'family' && formData.numberOfPeople < 2) {
          setError('العقارات العائلية تتطلب شخصين على الأقل.');
          return false;
        }
        
        break;
      case 3:
        // Identity images are optional, so no validation needed
        break;
      case 4:
        if (!formData.startDate || !formData.endDate) {
          setError('يرجى اختيار تواريخ البدء والانتهاء');
          return false;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          setError('يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء');
          return false;
        }
        break;
      case 5:
        // Total price is calculated automatically, so no validation needed
        break;
      case 6:
        // Notes are optional, so no validation needed
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
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
      // Convert blob URLs to base64 before sending
      const base64Images = await convertImagesToBase64(formData.identityImages);

      const orderData = {
        fullname: formData.fullname,
        phoneNumber: formData.phoneNumber,
        propertyId: property._id,
        wilayaId: property.wilayaId._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        orderType: 'reserver_property', // For properties already reserved
        priority: 'medium',
        totalPrice: calculateTotalPrice(),
        isMarried: Boolean(formData.isMarried), // Ensure boolean
        numberOfPeople: Number(formData.numberOfPeople), // Ensure number
        identityImages: base64Images, // Use converted base64 images
        notes: formData.notes ? `طلب حجز للعقار: ${property.title} - السعر: ${property.pricePerDay} دج/يوم - ملاحظات: ${formData.notes}` : `طلب حجز للعقار: ${property.title} - السعر: ${property.pricePerDay} دج/يوم`
      };

      console.log('🔍 Sending order data:', orderData); // Debug log

      const response = await fetch('https://dmtart.pro/mimorent/api/orders-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', result);

      if (result.success) {
        addToast('تم إرسال طلب الحجز بنجاح! سيتواصل معك المكتب لتأكيد الحجز.', 'success');
        onClose();
        // Reset form
        setFormData({
          fullname: '',
          phoneNumber: '',
          isMarried: false,
          numberOfPeople: 1,
          identityImages: [],
          startDate: '',
          endDate: '',
          notes: ''
        });
        setCurrentStep(1);
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

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-1 space-x-reverse mb-2 px-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index} className="flex items-center flex-1 max-w-[32px]">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
              index + 1 === currentStep
                ? 'bg-gradient-to-r from-[#24697f] to-teal-600 text-white shadow-lg scale-110'
                : index + 1 < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1 < currentStep ? <Check className="w-3 h-3" /> : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">معلومات الشخصية</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                  <User className="w-4 h-4 mr-2 text-[#24697f]" />
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                  <Phone className="w-4 h-4 mr-2 text-[#24697f]" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">الحالة الاجتماعية وعدد الأشخاص</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                <Heart className="w-4 h-4 mr-2 text-[#24697f]" />
                الحالة الاجتماعية
              </label>
              <div className="flex items-center justify-end space-x-4 space-x-reverse">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="isMarried"
                    value="true"
                    checked={formData.isMarried === true}
                    onChange={() => setFormData(prev => ({ ...prev, isMarried: true }))}
                    className="ml-2 w-4 h-4 text-[#24697f] focus:ring-[#24697f]/50 focus:ring-2"
                  />
                  <span className="text-sm font-medium mx-2 text-gray-700 group-hover:text-[#24697f] transition-colors duration-200">متزوج</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="isMarried"
                    value="false"
                    checked={formData.isMarried === false}
                    onChange={() => setFormData(prev => ({ ...prev, isMarried: false }))}
                    className="ml-2 w-4 h-4 text-[#24697f] focus:ring-[#24697f]/50 focus:ring-2"
                  />
                  <span className="text-sm mx-2 font-medium text-gray-700 group-hover:text-[#24697f] transition-colors duration-200">أعزب</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                <Users className="w-4 h-4 mr-2 text-[#24697f]" />
                عدد الأشخاص
              </label>
              <input
                type="number"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
                placeholder="عدد الأشخاص"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">صور الهوية</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                <Upload className="w-4 h-4 mr-2 text-[#24697f]" />
                رفع صور الهوية (اختياري)
              </label>
              <div className="border-2 border-dashed border-gray-300/50 rounded-xl p-6 text-center bg-gray-50/50 backdrop-blur-sm">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="identity-images"
                  disabled={formData.identityImages.length >= 4}
                />
                <label
                  htmlFor="identity-images"
                  className={`cursor-pointer flex flex-col items-center ${
                    formData.identityImages.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {formData.identityImages.length >= 4 
                      ? 'تم الوصول للحد الأقصى للصور' 
                      : 'اضغط لرفع الصور أو اسحب وأفلت'
                    }
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {formData.identityImages.length}/4 صور (PNG, JPG, GIF حتى 10 ميجابايت)
                  </span>
                </label>
              </div>
              {formData.identityImages.length > 0 && (
                <div className="mt-4 pb-20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">الصور المرفوعة ({formData.identityImages.length}/4)</span>
                    {formData.identityImages.length < 4 && (
                      <span className="text-xs text-gray-500">يمكنك إضافة {4 - formData.identityImages.length} صور أخرى</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.identityImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Identity ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Remove button clicked for image:', index);
                            removeImage(index);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-red-700 shadow-xl z-[1000] transform hover:scale-110 border-2 border-white opacity-90 hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">تواريخ الحجز</h3>
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
                  className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
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
                  className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">السعر الإجمالي</h3>
            <div className="bg-gradient-to-r from-[#24697f]/10 to-teal-500/10 rounded-xl p-6 border border-[#24697f]/20 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <div className="text-sm text-gray-600">تفاصيل الحساب:</div>
                <div className="flex justify-between items-center text-sm">
                  <span>السعر اليومي:</span>
                  <span className="font-medium">{property.pricePerDay.toLocaleString('ar-DZ')} دج</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>عدد الأيام:</span>
                  <span className="font-medium">
                    {formData.startDate && formData.endDate
                      ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      : 0} يوم
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">السعر الإجمالي:</span>
                    <span className="text-xl font-bold text-[#24697f]">
                      {totalPrice.toLocaleString('ar-DZ')} دج
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">رسالتك</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-end">
                <MessageCircle className="w-4 h-4 mr-2 text-[#24697f]" />
                رسالتك (اختياري)
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200/60 bg-gray-50/80 backdrop-blur-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#24697f]/50 focus:border-[#24697f] transition-all duration-300 text-right resize-none placeholder-gray-500 hover:bg-gray-100/80 hover:border-gray-300/80"
                placeholder="أي ملاحظات إضافية أو طلبات خاصة..."
              />
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
              <div className="text-center text-green-700 text-sm font-medium">
                <Check className="w-5 h-5 mx-auto mb-2" />
                جميع المعلومات مكتملة. يمكنك الآن إرسال طلب الحجز.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-xl flex items-center justify-center z-70 p-4 modal-backdrop" onClick={onClose}>
      <div 
        className="bg-white/95 backdrop-blur-2xl rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col shadow-3xl border border-white/70 transition-all duration-300 ease-out relative" 
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style dangerouslySetInnerHTML={{
          __html: `
            div::-webkit-scrollbar {
              display: none;
            }
            .step-content {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .slide-out-left {
              transform: translateX(-100%);
              opacity: 0;
            }
            .slide-out-right {
              transform: translateX(100%);
              opacity: 0;
            }
            .slide-in-left {
              transform: translateX(-100%);
              opacity: 0;
              animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            .slide-in-right {
              transform: translateX(100%);
              opacity: 0;
              animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            @keyframes slideInLeft {
              from {
                transform: translateX(-100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .step-indicator-dot {
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .fade-in {
              animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `
        }} />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24697f] via-teal-500 to-pink-500 rounded-3xl blur-xl opacity-20 pointer-events-none"></div>
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-gray-200/30 bg-gradient-to-r from-[#24697f]/5 via-teal-500/5 to-pink-500/5 backdrop-blur-sm sticky top-0 z-10">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-white/90 overflow-hidden"></div>
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#24697f]/10 to-transparent opacity-60"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-pink-500/10 to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-[#24697f]/30 to-transparent"></div>
          
          <div className="relative flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 leading-tight mb-1 truncate">
              طلب حجز (عقار محجوز)
            </h2>
            <div className="flex items-center text-gray-500">
              <Home className="w-3 h-3 ml-1 text-[#24697f] flex-shrink-0" />
              <span className="text-xs font-medium truncate">{property.title}</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="relative p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-visible px-2 py-6">
          {/* Property Info - Compact */}
          <div className="bg-gradient-to-r from-[#24697f]/8 to-teal-500/8 rounded-2xl p-3 border border-[#24697f]/15 shadow-lg backdrop-blur-sm mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{property.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{(property as any).location || 'موقع غير محدد'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-medium text-[#24697f]">{property.pricePerDay} دج/يوم</span>
                  <span className="text-xs px-2 py-1 bg-[#24697f]/10 text-[#24697f] rounded-full">
                    {(property as any).targetAudience === 'family' ? 'عائلي' : 
                     (property as any).targetAudience === 'normal' ? 'عادي' : 'للكل'}
                  </span>
                  <span className="text-xs px-2 py-1 bg-teal-500/10 text-teal-700 rounded-full">
                    السعة: {(property as any).capacity || 'غير محدد'} أشخاص
                  </span>
                </div>
              </div>
              {property.images && property.images[0] && (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-12 h-12 rounded-lg object-cover border border-[#24697f]/20"
                />
              )}
            </div>
          </div>

          {/* Reserved Property Notice */}
          <div className="mb-4 p-3 bg-gradient-to-r from-pink-50/80 to-pink-100/80 rounded-xl border border-pink-200/50 backdrop-blur-sm">
            <div className="flex items-center text-pink-700 text-xs font-medium">
              <Calendar className="w-3 h-3 mr-2" />
              <span className="font-bold">محجوز حالياً</span>
            </div>
            <div className="text-pink-600 text-xs mt-1">
              يمكنك تقديم طلب الحجز وسيتم مراجعته من قبل المكتب
            </div>
            {property.reservationEndDate && (
              <div className="text-pink-500 text-xs mt-2 font-medium">
                تنتهي الحجز: {new Date(property.reservationEndDate).toLocaleDateString('ar-DZ', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-pink-50/80 border border-pink-200/50 rounded-xl flex items-start backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-pink-500 ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-pink-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="min-h-[200px] transition-all duration-300 ease-in-out step-content fade-in">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200/30 bg-white/90 p-4 backdrop-blur-sm sticky bottom-0 z-[1001]">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 font-medium flex items-center justify-center shadow-sm hover:shadow-md active:shadow-sm transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                <span className="text-xs sm:text-sm">السابق</span>
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#24697f] to-teal-600 hover:from-[#1a5366] hover:to-teal-700 active:from-[#0f4155] active:to-teal-800 text-white rounded-2xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
              >
                <span className="text-xs sm:text-sm">التالي</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:from-green-700 active:to-emerald-800 text-white rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-sm flex items-center justify-center shadow-lg hover:shadow-xl active:shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1 sm:ml-2"></div>
                    <span className="text-xs sm:text-sm">جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs sm:text-sm">إرسال طلب الحجز</span>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  </>
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-red-50 hover:text-red-600 active:bg-red-100 active:text-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:shadow-sm transform hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm"
            >
              <span className="text-xs sm:text-sm">إلغاء</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;
