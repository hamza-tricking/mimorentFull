'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ServicesPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (isMobile && e.beta !== null && e.gamma !== null) {
        const x = Math.max(-1, Math.min(1, e.gamma / 30));
        const y = Math.max(-1, Math.min(1, e.beta / 30));
        setDeviceTilt({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('deviceorientation', handleDeviceOrientation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  const currentPosition = isMobile ? deviceTilt : mousePosition;
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen pointer-events-auto">
      <Navbar />
      
      {/* Hero Section with Background */}
      <section className="relative w-full overflow-hidden pt-32">
        {/* Background matching home page style */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#24697F] via-[#2a7d94] to-[#1e5f73]">
            {/* Animated Pattern Overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
                  radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%)
                `,
                backgroundSize: '100% 100%'
              }}></div>
            </div>
            
            {/* Moving Elements */}
            <div 
              className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-2xl shadow-2xl transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${currentPosition.x * 30}px, ${currentPosition.y * 30}px) translateY(${scrollY * 0.2}px)`,
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white/25 rounded-2xl shadow-2xl transition-transform duration-300 ease-out"
              style={{
                transform: `translate(${currentPosition.x * -25}px, ${currentPosition.y * -25}px) translateY(${scrollY * -0.3}px)`,
              }}
            ></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center ${isRTL ? 'font-arabic' : ''}`}>
              {/* Decorative Shapes */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating circles */}
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-10 right-1/4 w-24 h-24 bg-white/8 rounded-full blur-lg animate-pulse delay-75"></div>
                <div className="absolute bottom-0 left-1/3 w-28 h-28 bg-white/12 rounded-full blur-xl animate-pulse delay-150"></div>
                
                {/* Geometric shapes */}
                <div className="absolute top-1/4 right-1/6 w-16 h-16 border-2 border-white/20 rotate-45 animate-spin-slow"></div>
                <div className="absolute bottom-1/4 left-1/6 w-12 h-12 border border-white/15 rotate-12 animate-bounce-slow"></div>
                
                {/* Lines */}
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <div className="absolute top-1/2 left-1/4 w-px h-20 bg-gradient-to-b from-transparent via-white/15 to-transparent"></div>
                <div className="absolute top-1/2 right-1/4 w-px h-20 bg-gradient-to-b from-transparent via-white/15 to-transparent"></div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 relative z-10">
                خدماتنا – Mimorent
              </h1>
              <div className="w-24 h-1 bg-white/60 mx-auto rounded-full relative z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-lg md:text-xl text-gray-700 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
              في Mimorent لا نقدم فقط منصة لعرض العقارات، بل نوفر نظامًا متكاملًا لإدارة الكراء باحترافية وتنظيم عالي. خدماتنا موجهة للزبائن، للمكاتب المحلية، وللإدارة في نفس الوقت.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          {/* Service 1: Residential Rentals */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-6">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>1) كراء السكنات</h2>
                    <p className={`text-white/90 ${isRTL ? 'font-arabic' : ''}`}>إدارة احترافية للسكنات المجهزة</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className={`text-lg text-gray-700 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                  نوفر سكنات مجهزة للكراء اليومي، الشهري أو السنوي في عدة ولايات.
                  الخدمة تشمل:
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>عرض مفصل للعقار بالصور والمعلومات</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>معرفة التوفر الفوري عبر التقويم</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>حجز مباشر بدون تداخل</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تأكيد سريع للحجز</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إمكانية التواصل المباشر مع المكتب</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 2: Commercial Rentals */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-6">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🏬</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>2) كراء المحلات التجارية</h2>
                    <p className={`text-white/90 ${isRTL ? 'font-arabic' : ''}`}>مساحات تجارية بمواقع استراتيجية</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className={`text-lg text-gray-700 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                  نوفر محلات مناسبة للنشاطات التجارية بمختلف المساحات والمواقع.
                  تشمل الخدمة:
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تصنيف حسب الموقع والسعر</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إمكانية طلب زيارة</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>كراء طويل المدى</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>متابعة العقود وتنظيم الدفعات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 3: Villa Rentals */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-6">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🏡</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>3) كراء الفيلات</h2>
                    <p className={`text-white/90 ${isRTL ? 'font-arabic' : ''}`}>فيلات فاخرة للإقامة المريحة</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className={`text-lg text-gray-700 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                  نوفر فيلات للكراء اليومي أو الموسمي أو السنوي.
                  مع:
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تفاصيل دقيقة حول المرافق</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>نظام حجز يمنع التداخل</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تنظيم العربون والمبلغ المتبقي</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إدارة احترافية للحجوزات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 4: Booking Management */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-6">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🧑‍💼</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>4) إدارة حجوزات متكاملة</h2>
                    <p className={`text-white/90 ${isRTL ? 'font-arabic' : ''}`}>نظام رقمي متقدم لإدارة الحجوزات</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className={`text-lg text-gray-700 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                  نقدم نظام إدارة حجوزات رقمي يسمح بـ:
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تسجيل الحجز من المكتب أو من الزبون مباشرة</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>منع أي حجز مزدوج لنفس التاريخ</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>متابعة حالة الحجز (مؤكد – ملغى – منتهي)</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تقويم واضح لكل عقار</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Service 5: Scalable Solutions */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-6">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">📈</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl md:text-3xl font-bold text-white ${isRTL ? 'font-arabic' : ''}`}>5) حلول قابلة للتوسع</h2>
                    <p className={`text-white/90 ${isRTL ? 'font-arabic' : ''}`}>مستقبل خدماتنا الممتدة</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className={`text-lg text-gray-700 mb-6 ${isRTL ? 'font-arabic' : ''}`}>
                  خدماتنا قابلة للتطوير لتشمل مستقبلاً:
                </p>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>دفع إلكتروني</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>فواتير رقمية</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>عقود إلكترونية</span>
                  </div>
                  <div className={`flex items-start gap-3 p-4 bg-[#24697F]/5 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-2 h-2 bg-[#24697F] rounded-full mt-2"></div>
                    <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>تطبيق هاتف</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-8 rounded-2xl shadow-xl">
              <h3 className={`text-2xl md:text-3xl font-bold text-white mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                Mimorent تقدم خدمات كراء وإدارة عقارية بنظام حديث
              </h3>
              <p className={`text-xl text-white/90 ${isRTL ? 'font-arabic' : ''}`}>
                يضمن التنظيم، الشفافية، والاحترافية في كل خطوة
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
