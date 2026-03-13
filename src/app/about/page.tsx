'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
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
                من نحن – Mimorent
              </h1>
              <div className="w-24 h-1 bg-white/60 mx-auto rounded-full relative z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Introduction */}
          <div className="mb-20">
            <div className="max-w-4xl mx-auto">
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                في Mimorent نحن نؤمن أن إدارة كراء العقارات يجب أن تكون واضحة، منظمة، وسهلة للجميع. انطلقت فكرتنا لإنشاء منصة رقمية متكاملة تجمع بين التكنولوجيا والإدارة الميدانية، لتقديم نظام حديث لإدارة كراء العقارات عبر عدة ولايات في الجزائر.
              </p>
              
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                نقدم من خلال موقعنا www.mimorent.com منصة موحدة لإدارة:
              </p>
              
              {/* Property Types */}
              <div className={`flex flex-wrap justify-center gap-6 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-3 bg-[#24697F]/10 px-6 py-3 rounded-full">
                  <span className="text-2xl">🏠</span>
                  <span className={`text-lg font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>السكنات</span>
                </div>
                <div className="flex items-center gap-3 bg-[#24697F]/10 px-6 py-3 rounded-full">
                  <span className="text-2xl">🏬</span>
                  <span className={`text-lg font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>المحلات التجارية</span>
                </div>
                <div className="flex items-center gap-3 bg-[#24697F]/10 px-6 py-3 rounded-full">
                  <span className="text-2xl">🏡</span>
                  <span className={`text-lg font-semibold text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>الفيلات</span>
                </div>
              </div>
              
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                وذلك في ولايات:
              </p>
              
              {/* Cities */}
              <div className={`flex flex-wrap justify-center gap-4 mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="bg-gradient-to-r from-[#24697F] to-teal-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">
                  <span className={isRTL ? 'font-arabic' : ''}>وهران</span>
                </div>
                <div className="bg-gradient-to-r from-[#24697F] to-teal-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">
                  <span className={isRTL ? 'font-arabic' : ''}>عين تموشنت</span>
                </div>
                <div className="bg-gradient-to-r from-[#24697F] to-teal-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg">
                  <span className={isRTL ? 'font-arabic' : ''}>المشرية</span>
                </div>
              </div>
              
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed text-center ${isRTL ? 'font-arabic' : ''}`}>
                مع وجود مكاتب محلية وفرق عمل ميدانية، مما يسمح بتسيير احترافي للحجوزات اليومية أو السنوية بكل شفافية ودقة.
              </p>
            </div>
          </div>

          {/* Vision Section */}
          <div className="mb-20">
            <div className="text-center mb-12 relative">
              {/* Decorative elements for Vision section */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-20 h-20 bg-[#24697F]/10 rounded-full blur-lg animate-pulse"></div>
                <div className="absolute top-5 right-1/4 w-16 h-16 bg-teal-500/10 rounded-full blur-md animate-pulse delay-100"></div>
                <div className="absolute -top-4 left-1/2 w-2 h-16 bg-gradient-to-b from-[#24697F]/20 to-transparent"></div>
                <div className="absolute -top-4 right-1/2 w-2 h-16 bg-gradient-to-b from-teal-500/20 to-transparent"></div>
              </div>
              
              <h2 className={`text-4xl font-bold text-gray-900 mb-4 relative z-10 ${isRTL ? 'font-arabic' : ''}`}>رؤيتنا</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#24697F] to-teal-500 mx-auto rounded-full relative z-10"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                نهدف إلى تحويل طريقة تسيير كراء العقارات من الأسلوب التقليدي القائم على الورق والاتصالات العشوائية، إلى نظام رقمي ذكي يضمن:
              </p>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                <div className={`flex items-start gap-4 p-6 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>تنظيم الحجوزات بدون تداخل</h3>
                  </div>
                </div>
                
                <div className={`flex items-start gap-4 p-6 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>متابعة الأرباح في أي وقت</h3>
                  </div>
                </div>
                
                <div className={`flex items-start gap-4 p-6 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8a4 4 0 01-8 0V6a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h12"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>تحليل أداء كل ولاية وكل مكتب</h3>
                  </div>
                </div>
                
                <div className={`flex items-start gap-4 p-6 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>تقليل الأخطاء البشرية</h3>
                  </div>
                </div>
                
                <div className={`flex items-start gap-4 p-6 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>تسهيل التواصل بين الإدارة، الموظفين، والزبائن</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-20">
            <div className="text-center mb-12 relative">
              {/* Decorative elements for What We Offer section */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-24 h-24 bg-gradient-to-br from-[#24697F]/10 to-teal-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-8 right-1/3 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-[#24697F]/10 rounded-full blur-lg animate-pulse delay-150"></div>
                <div className="absolute -top-2 left-1/2 w-1 h-12 bg-gradient-to-b from-[#24697F]/30 to-transparent"></div>
                <div className="absolute -top-2 right-1/2 w-1 h-12 bg-gradient-to-b from-teal-500/30 to-transparent"></div>
              </div>
              
              <h2 className={`text-4xl font-bold text-gray-900 mb-4 relative z-10 ${isRTL ? 'font-arabic' : ''}`}>ماذا نقدم؟</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#24697F] to-teal-500 mx-auto rounded-full relative z-10"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-[#24697F]/10 to-teal-500/10 p-8 rounded-2xl">
                <div className={`flex items-start gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-12 h-12 bg-[#24697F] rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold text-gray-900 mb-3 ${isRTL ? 'font-arabic' : ''}`}>للزبائن</h3>
                    <p className={`text-gray-700 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                      نوفر تجربة سهلة للبحث عن العقار المناسب حسب الولاية، النوع، السعر، أو مدة الكراء، مع إمكانية الحجز المباشر أو طلب زيارة، واستلام تأكيد سريع.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commitment */}
          <div className="mb-20">
            <div className="text-center mb-12 relative">
              {/* Decorative elements for Commitment section */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-28 h-28 bg-[#24697F]/8 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-10 right-1/4 w-20 h-20 bg-teal-500/8 rounded-full blur-xl animate-pulse delay-200"></div>
                <div className="absolute -top-6 left-1/2 w-0.5 h-20 bg-gradient-to-b from-[#24697F]/25 to-transparent"></div>
                <div className="absolute -top-6 right-1/2 w-0.5 h-20 bg-gradient-to-b from-teal-500/25 to-transparent"></div>
              </div>
              
              <h2 className={`text-4xl font-bold text-gray-900 mb-4 relative z-10 ${isRTL ? 'font-arabic' : ''}`}>التزامنا</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#24697F] to-teal-500 mx-auto rounded-full relative z-10"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                نحرص على توفير نظام آمن ومنظم يعتمد على:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-16 h-16 bg-[#24697F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>تسجيل كل العمليات لضمان الشفافية</h3>
                </div>
                
                <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-16 h-16 bg-[#24697F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>نسخ احتياطي تلقائي</h3>
                </div>
                
                <div className="text-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                  <div className="w-16 h-16 bg-[#24697F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#24697F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <h3 className={`font-semibold text-gray-900 mb-2 ${isRTL ? 'font-arabic' : ''}`}>حماية البيانات ومنع أي تلاعب في الحجوزات</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Ambitions */}
          <div className="mb-20">
            <div className="text-center mb-12 relative">
              {/* Decorative elements for Ambitions section */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-32 h-32 bg-gradient-to-br from-[#24697F]/12 to-teal-500/12 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-12 right-1/3 w-24 h-24 bg-gradient-to-br from-teal-500/12 to-[#24697F]/12 rounded-full blur-2xl animate-pulse delay-300"></div>
                <div className="absolute -top-8 left-1/2 w-1 h-24 bg-gradient-to-b from-[#24697F]/35 to-transparent"></div>
                <div className="absolute -top-8 right-1/2 w-1 h-24 bg-gradient-to-b from-teal-500/35 to-transparent"></div>
              </div>
              
              <h2 className={`text-4xl font-bold text-gray-900 mb-4 relative z-10 ${isRTL ? 'font-arabic' : ''}`}>طموحنا</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#24697F] to-teal-500 mx-auto rounded-full relative z-10"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mb-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                Mimorent ليست مجرد منصة حجز، بل نظام قابل للتوسع والنمو، مع خطط مستقبلية تشمل:
              </p>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isRTL ? 'md:grid-flow-col-dense' : ''}`}>
                <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-[#24697F]/5 to-transparent rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-[#24697F] rounded-full"></div>
                  <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إضافة ولايات جديدة</span>
                </div>
                <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-[#24697F]/5 to-transparent rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-[#24697F] rounded-full"></div>
                  <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إطلاق تطبيق هاتف</span>
                </div>
                <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-[#24697F]/5 to-transparent rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-[#24697F] rounded-full"></div>
                  <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إدماج الدفع الإلكتروني</span>
                </div>
                <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-[#24697F]/5 to-transparent rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-[#24697F] rounded-full"></div>
                  <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>إصدار فواتير PDF</span>
                </div>
                <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-[#24697F]/5 to-transparent rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-2 h-2 bg-[#24697F] rounded-full"></div>
                  <span className={`text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>توقيع عقود إلكترونية</span>
                </div>
              </div>
              
              <p className={`text-lg md:text-xl text-gray-700 leading-relaxed mt-8 text-center ${isRTL ? 'font-arabic' : ''}`}>
                نحن نعمل يوميًا لنقدم حلاً عصريًا يجعل إدارة العقارات أكثر ذكاءً، وأكثر ربحية، وأكثر تنظيمًا.
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-[#24697F] to-teal-500 p-8 rounded-2xl shadow-xl">
              <h3 className={`text-2xl md:text-3xl font-bold text-white mb-2 ${isRTL ? 'font-arabic' : ''}`}>
                Mimorent – إدارة عقارية بطريقة احترافية
              </h3>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
