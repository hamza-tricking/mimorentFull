'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutUs() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Mouse movement for desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    // Scroll animation
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Device tilt for mobile
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

  // Use mouse position on desktop, device tilt on mobile
  const currentPosition = isMobile ? deviceTilt : mousePosition;

  return (
    <section className="relative w-full overflow-hidden">
      {/* Hero-style Background */}
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
          
          {/* Geometric Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.1) 50%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.1) 50%, transparent 52%),
                linear-gradient(90deg, transparent 48%, rgba(255, 255, 255, 0.05) 50%, transparent 52%),
                linear-gradient(0deg, transparent 48%, rgba(255, 255, 255, 0.05) 50%, transparent 52%)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Moving Elements with Mouse and Scroll */}
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
          
          <div 
            className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/30 rounded-xl shadow-2xl transition-transform duration-250 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 35}px, ${currentPosition.y * 35}px) rotate(${45 + currentPosition.x * 20}deg) translateY(${scrollY * 0.4}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/3 right-1/3 w-14 h-14 border-4 border-white/40 rounded-full shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -30}px, ${currentPosition.y * -30}px) scale(${1 + currentPosition.x * 0.2}) translateY(${scrollY * -0.2}px)`,
            }}
          ></div>
          
          {/* Mobile Elements */}
          <div className="md:hidden">
            <div 
              className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-full shadow-2xl"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/4 right-1/4 w-14 h-14 bg-white/25 rounded-full shadow-2xl"
              style={{
                animation: 'float 8s ease-in-out infinite reverse',
                animationDelay: '2s',
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{t('about.title')}</h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
          
          {/* Photo Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Photo 1 */}
            <div className="relative group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/about us/gabriel-valdez-iPyailqBGdM-unsplash.jpg"
                  alt="Modern Living Space"
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Modern Design</h3>
                  <p className="text-white/90">Contemporary spaces with thoughtful layouts and premium finishes</p>
                </div>
              </div>
            </div>
            
            {/* Photo 2 */}
            <div className="relative group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/about us/jakub-zerdzicki-GQn9GnMkVQg-unsplash.jpg"
                  alt="Comfortable Interior"
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Comfort First</h3>
                  <p className="text-white/90">Spaces designed for maximum comfort and functionality</p>
                </div>
              </div>
            </div>
            
            {/* Photo 3 */}
            <div className="relative group">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/about us/yaopey-yong--vlbnHa0NBE-unsplash.jpg"
                  alt="Premium Location"
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Prime Locations</h3>
                  <p className="text-white/90">Strategically located properties in desirable neighborhoods</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('about.values.qualityTitle')}</h3>
              <p className="text-white/80">{t('about.values.qualityDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('about.values.customerTitle')}</h3>
              <p className="text-white/80">{t('about.values.customerDesc')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('about.values.serviceTitle')}</h3>
              <p className="text-white/80">{t('about.values.serviceDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
