'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Hero() {
  const { language, t } = useLanguage();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Trigger visibility animation after component mounts
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Small delay for smooth entrance

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
      clearTimeout(visibilityTimer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('resize', checkMobile);
    };
  }, [isMobile]);

  // Use mouse position on desktop, device tilt on mobile
  const currentPosition = isMobile ? deviceTilt : mousePosition;

  return (
    <div className="relative min-h-screen">
      {/* Beautiful CSS Background that shows through navbar */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
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
          
          {/* Complex Geometric Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
                linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
                linear-gradient(30deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
                linear-gradient(150deg, rgba(255, 255, 255, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(255, 255, 255, 0.1) 87.5%, rgba(255, 255, 255, 0.1)),
                linear-gradient(60deg, rgba(255, 255, 255, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(255, 255, 255, 0.08) 75.5%, rgba(255, 255, 255, 0.08)),
                linear-gradient(120deg, rgba(255, 255, 255, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(255, 255, 255, 0.08) 75.5%, rgba(255, 255, 255, 0.08))
              `,
              backgroundSize: '80px 140px',
              backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 0 0'
            }}></div>
          </div>
          
          {/* Hexagon Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 0 0, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 40px 0, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 20px 35px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 60px 35px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 0 70px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 40px 70px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 20px 105px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 60px 105px, transparent 0, transparent 20px, rgba(255, 255, 255, 0.1) 20px, rgba(255, 255, 255, 0.1) 21px, transparent 21px)
              `,
              backgroundSize: '80px 140px'
            }}></div>
          </div>
          
          {/* Triangle Pattern */}
          <div className="absolute inset-0 opacity-12">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.1) 55%, transparent 55%),
                linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.1) 55%, transparent 55%),
                linear-gradient(135deg, transparent 45%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.1) 55%, transparent 55%),
                linear-gradient(-135deg, transparent 45%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.1) 55%, transparent 55%)
              `,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 0, 0 30px, 30px 30px'
            }}></div>
          </div>
          
          {/* Complex Grid Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(rgba(255, 255, 255, 0.03) 2px, transparent 2px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 2px, transparent 2px)
              `,
              backgroundSize: '20px 20px, 20px 20px, 40px 40px, 40px 40px'
            }}></div>
          </div>
          
          {/* Diamond Pattern */}
          <div className="absolute inset-0 opacity-8">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 35%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0.08) 65%, transparent 65%),
                linear-gradient(-45deg, transparent 35%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0.08) 65%, transparent 65%),
                linear-gradient(135deg, transparent 35%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0.08) 65%, transparent 65%),
                linear-gradient(-135deg, transparent 35%, rgba(255, 255, 255, 0.08) 35%, rgba(255, 255, 255, 0.08) 65%, transparent 65%)
              `,
              backgroundSize: '100px 100px',
              backgroundPosition: '0 0, 50px 0, 0 50px, 50px 50px'
            }}></div>
          </div>
          
          {/* Wave Pattern */}
          <div className="absolute inset-0 opacity-6">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(ellipse at top, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at bottom, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at left, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
                radial-gradient(ellipse at right, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
              `,
              backgroundSize: '100% 100%, 100% 100%, 100% 100%, 100% 100%',
              backgroundPosition: '0 0, 0 100%, 0 0, 100% 0'
            }}></div>
          </div>
          
          {/* 3D Moving Elements */}
          <div 
            className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/30 rounded-full blur-xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 20}px, ${currentPosition.y * 20}px) translateY(${scrollY * 0.1}px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-3/4 right-1/4 w-20 h-20 bg-white/25 rounded-full blur-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -15}px, ${currentPosition.y * -15}px) translateY(${scrollY * -0.15}px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-1/2 left-1/3 w-12 h-12 bg-white/35 rounded-lg rotate-45 transition-transform duration-250 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 25}px, ${currentPosition.y * 25}px) rotate(${45 + currentPosition.x * 10}deg) translateY(${scrollY * 0.2}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/3 right-1/3 w-14 h-14 border-2 border-white/40 rounded-full transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -20}px, ${currentPosition.y * -20}px) scale(${1 + currentPosition.x * 0.1}) translateY(${scrollY * -0.1}px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-1/5 right-1/5 w-8 h-8 bg-gradient-to-br from-white/40 to-white/20 rounded-full transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 30}px, ${currentPosition.y * 30}px) translateY(${scrollY * 0.25}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/5 left-1/5 w-10 h-10 bg-white/20 rounded-lg transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -25}px, ${currentPosition.y * -25}px) rotate(${currentPosition.y * 15}deg) translateY(${scrollY * -0.2}px)`,
            }}
          ></div>
          
          {/* 3D Floating Shapes */}
          <div 
            className="absolute top-1/3 right-1/2 w-6 h-6 bg-white/30 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 40}px, ${currentPosition.y * 40}px) rotateX(${currentPosition.y * 20}deg) rotateY(${currentPosition.x * 20}deg) translateY(${scrollY * 0.3}px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/2 left-1/2 w-8 h-8 bg-white/25 transition-transform duration-250 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -35}px, ${currentPosition.y * -35}px) rotateX(${currentPosition.y * 15}deg) rotateY(${currentPosition.x * 15}deg) translateY(${scrollY * -0.25}px)`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          ></div>
          
          {/* 3D Lines */}
          <div 
            className="absolute top-1/4 left-1/2 w-32 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 15}px, ${currentPosition.y * 15}px) rotate(${currentPosition.x * 5}deg) translateY(${scrollY * 0.15}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/4 right-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -20}px, ${currentPosition.y * -20}px) rotate(${currentPosition.y * -8}deg) translateY(${scrollY * -0.15}px)`,
            }}
          ></div>
          
          {/* 3D Cube-like elements */}
          <div 
            className="absolute top-2/3 left-1/4 w-12 h-12 transition-transform duration-250 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 22}px, ${currentPosition.y * 22}px) rotateX(${currentPosition.y * 25}deg) rotateY(${currentPosition.x * 25}deg) translateY(${scrollY * 0.2}px)`,
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-white/20 border border-white/30"></div>
              <div className="absolute inset-0 bg-white/15 border border-white/25 transform rotate-45"></div>
            </div>
          </div>
          
          <div 
            className="absolute top-1/6 left-3/4 w-8 h-8 transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -30}px, ${currentPosition.y * -30}px) rotateX(${currentPosition.y * 30}deg) rotateY(${currentPosition.x * 30}deg) translateY(${scrollY * -0.3}px)`,
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-white/25 rounded-full border border-white/35"></div>
              <div className="absolute inset-2 bg-white/15 rounded-full"></div>
            </div>
          </div>
          
          {/* Additional Noticeable Moving Elements */}
          
          {/* Floating Orbs */}
          <div 
            className="absolute top-1/6 left-1/6 w-12 h-12 bg-gradient-to-r from-white/40 to-white/20 rounded-full blur-lg transition-transform duration-300 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * 45}px, ${currentPosition.y * 45}px) translateY(${scrollY * 0.4}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/6 right-1/6 w-16 h-16 bg-gradient-to-br from-white/35 to-white/15 rounded-full blur-xl transition-transform duration-250 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * -35}px, ${currentPosition.y * -35}px) translateY(${scrollY * -0.35}px)`,
            }}
          ></div>
          
          {/* Moving Particles */}
          <div 
            className="absolute top-1/3 left-1/5 w-4 h-4 bg-white/50 rounded-full transition-transform duration-200 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 60}px, ${currentPosition.y * 60}px) translateY(${scrollY * 0.5}px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-2/3 right-1/5 w-3 h-3 bg-white/45 rounded-full transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -50}px, ${currentPosition.y * -50}px) translateY(${scrollY * -0.4}px)`,
            }}
          ></div>
          
          <div 
            className="absolute middle-1/2 left-1/2 w-5 h-5 bg-white/40 rounded-full transition-transform duration-180 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 55}px, ${currentPosition.y * 55}px) translateY(${scrollY * 0.3}px)`,
            }}
          ></div>
          
          {/* Rotating Rings */}
          <div 
            className="absolute top-1/4 right-1/3 w-20 h-20 border-4 border-white/30 rounded-full transition-transform duration-400 ease-out animate-spin"
            style={{
              transform: `translate(${currentPosition.x * 25}px, ${currentPosition.y * 25}px) translateY(${scrollY * 0.2}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/4 left-1/3 w-16 h-16 border-3 border-white/25 rounded-full transition-transform duration-350 ease-out animate-spin"
            style={{
              transform: `translate(${currentPosition.x * -30}px, ${currentPosition.y * -30}px) translateY(${scrollY * -0.25}px)`,
            }}
          ></div>
          
          {/* Pulsing Squares */}
          <div 
            className="absolute top-1/5 left-2/3 w-8 h-8 bg-white/30 transition-transform duration-300 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * 40}px, ${currentPosition.y * 40}px) translateY(${scrollY * 0.3}px) rotate(45deg)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/5 right-2/3 w-6 h-6 bg-white/25 transition-transform duration-250 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * -45}px, ${currentPosition.y * -45}px) translateY(${scrollY * -0.35}px) rotate(-45deg)`,
            }}
          ></div>
          
          {/* Moving Triangles */}
          <div 
            className="absolute top-1/2 left-1/4 w-0 h-0 transition-transform duration-200 ease-out animate-spin"
            style={{
              borderLeft: '15px solid transparent',
              borderRight: '15px solid transparent',
              borderBottom: '25px solid rgba(255, 255, 255, 0.3)',
              transform: `translate(${currentPosition.x * 50}px, ${currentPosition.y * 50}px) translateY(${scrollY * 0.4}px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/2 right-1/4 w-0 h-0 transition-transform duration-180 ease-out animate-spin"
            style={{
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderBottom: '20px solid rgba(255, 255, 255, 0.25)',
              transform: `translate(${currentPosition.x * -55}px, ${currentPosition.y * -55}px) translateY(${scrollY * -0.3}px)`,
            }}
          ></div>
          
          {/* Floating Lines */}
          <div 
            className="absolute top-1/3 left-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${currentPosition.x * 30}px, ${currentPosition.y * 30}px) translateY(${scrollY * 0.25}px) rotate(15deg)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/3 right-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-250 ease-out"
            style={{
              transform: `translate(${currentPosition.x * -35}px, ${currentPosition.y * -35}px) translateY(${scrollY * -0.2}px) rotate(-12deg)`,
            }}
          ></div>
          
          {/* Star Shapes */}
          <div 
            className="absolute top-1/6 right-1/6 transition-transform duration-200 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * 35}px, ${currentPosition.y * 35}px) translateY(${scrollY * 0.3}px) rotate(45deg)`,
            }}
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-white/35" style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}></div>
            </div>
          </div>
          
          <div 
            className="absolute bottom-1/6 left-1/6 transition-transform duration-180 ease-out animate-pulse"
            style={{
              transform: `translate(${currentPosition.x * -40}px, ${currentPosition.y * -40}px) translateY(${scrollY * -0.25}px) rotate(-45deg)`,
            }}
          >
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-white/30" style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}></div>
            </div>
          </div>
          
          {/* Mobile Enhanced Elements */}
          <div className="md:hidden">
            {/* Large Moving Orbs */}
            <div 
              className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur-xl"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-white/25 to-white/5 rounded-full blur-lg"
              style={{
                animation: 'float 8s ease-in-out infinite reverse',
                animationDelay: '2s',
              }}
            ></div>
            
            {/* Spinning Elements */}
            <div 
              className="absolute top-1/3 right-1/3 w-12 h-12 bg-white/35 rounded-lg"
              style={{
                animation: 'spin 10s linear infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-white/30 rounded-full"
              style={{
                animation: 'spin 15s linear infinite reverse',
                animationDelay: '1s',
              }}
            ></div>
            
            {/* Pulsing Elements */}
            <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white/40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 right-1/2 w-4 h-4 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 left-1/2 w-5 h-5 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            {/* Moving Dots */}
            <div 
              className="absolute top-1/6 left-1/3 w-3 h-3 bg-white/45 rounded-full"
              style={{
                animation: 'moveHorizontal 4s ease-in-out infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/6 right-1/3 w-3 h-3 bg-white/40 rounded-full"
              style={{
                animation: 'moveVertical 5s ease-in-out infinite reverse',
                animationDelay: '1.5s',
              }}
            ></div>
          </div>
          <div className="md:hidden">
            {/* Touch Ripple Effects */}
            <div className="absolute top-1/3 left-1/3 w-24 h-24 bg-white/20 rounded-full animate-ping"></div>
            <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-white/15 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            
            {/* Auto-rotating elements for mobile */}
            <div 
              className="absolute top-1/4 right-1/4 w-8 h-8 bg-white/30 rounded-full"
              style={{
                animation: 'spin 8s linear infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-white/25 rounded-lg rotate-45"
              style={{
                animation: 'spin 12s linear infinite reverse',
              }}
            ></div>
            
            {/* Pulsing dots for mobile */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white/40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 left-2/3 w-3 h-3 bg-white/35 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/3 right-2/3 w-3 h-3 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/40 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-20 right-20 w-48 h-48 bg-white/35 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/45 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-10 right-1/3 w-36 h-36 bg-white/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          {/* White Geometric Shapes */}
          <div className="absolute top-1/4 left-1/4 w-24 h-24 border-2 border-white/60 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border border-white/55 rotate-12 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
          <div className="absolute top-1/2 right-1/3 w-20 h-20 border border-white/50 rotate-45 animate-spin" style={{ animationDuration: '25s' }}></div>
          
          {/* White Lines */}
          <div className="absolute top-0 left-1/2 w-px h-64 bg-gradient-to-b from-white/70 to-transparent"></div>
          <div className="absolute bottom-0 right-1/2 w-px h-48 bg-gradient-to-t from-white/65 to-transparent"></div>
          <div className="absolute left-0 top-1/2 w-48 h-px bg-gradient-to-r from-white/60 to-transparent"></div>
          <div className="absolute right-0 bottom-1/2 w-64 h-px bg-gradient-to-l from-white/65 to-transparent"></div>
          
          {/* White Circles Pattern */}
          <div className="absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-white/55 rounded-full animate-pulse"
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${20 + (i % 3) * 30}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + i * 0.5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* White Gradient Overlays */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-white/35 to-transparent rounded-full blur-3xl"></div>
          
          {/* Animated Dots */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${(i * 7 + 5) % 100}%`,
                  top: `${(i * 13 + 10) % 100}%`,
                  animationDelay: `${(i * 0.3) % 5}s`,
                  animationDuration: `${3 + (i * 0.5) % 4}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Hero Content */}
      <div className={`relative z-10 pointer-events-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-22 transition-opacity duration-1000 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="grid mt-12 grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start min-h-[600px]">
          
          {/* Right Side - Split Photo */}
          <div className={`order-2 lg:order-1 flex flex-col h-full mt-2 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Split Photo Container */}
            <div className="relative h-64 md:h-80 lg:h-[85%] w-full flex gap-2 md:gap-3">

                 {/* House outline overlay */}
                <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-10 ">
                  <div className="relative">
                    <svg className="w-16 h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 text-white/80 drop-shadow-2xl" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                  </div>
                </div>
              {/* Left Part - 49% */}
              <div className="relative w-[49%] h-full overflow-hidden shadow-2xl rounded-lg">
                {/* Phone Number */}
                <div className="absolute top-2 right-2 z-20 bg-[#24697F] backdrop-blur-md px-3 py-2 md:px-4 md:py-3 shadow-xl rounded-lg">
                  <span className="text-white font-bold text-sm md:text-md group-hover:text-gray-200 transition-colors duration-300">{t('hero.phoneNumber')}: +213 550307907</span>
                </div>
                
                <div className="absolute inset-0">
                  <Image
                    src="/melrose-by-the-lake-43vHzsfrmxk-unsplash.jpg"
                    alt="Modern living space left"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'left center' }}
                    priority
                  />
                </div>
             
              </div>
              
              {/* Right Part - 49% */}
              <div className="relative w-[49%] h-[90%] md:h-[85%] lg:h-[85%] self-end overflow-hidden shadow-2xl rounded-lg">
                <div className="absolute inset-0">
                  <Image
                    src="/melrose-by-the-lake-43vHzsfrmxk-unsplash.jpg"
                    alt="Modern living space right"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'right center' }}
                    priority
                  />
                </div>
              </div>
             
            </div>
          </div>

          {/* Left Side - Split Layout */}
          <div className={`order-2 lg:order-2 flex flex-col h-full mt-2 transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Top Part - 30% White */}
            <div className="h-[15%] bg-white/95 backdrop-blur-sm flex flex-col shadow-lg">
              {/* Logo Section */}
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#24697F] to-[#1a5366] rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 group-hover:text-[#24697F] transition-colors duration-300 tracking-wide">MIMO RENT</span>
                </div>
              </div>
              
              {/* Heading */}
              <div className="flex-1 flex items-start mt-2 justify-center w-full px-8">
                <div className="text-center">
                  <h1 className="text-2xl md:text-4xl lg:text-2xl font-bold text-gray-800 leading-tight tracking-tight">
                    {t('hero.title')}
                  </h1>
                  <div className=" h-1 w-20 bg-gradient-to-r from-[#24697F] to-transparent mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Bottom Part - 50% #24697F */}
            <div className="h-[50%] bg-[#24697F] flex flex-col justify-center px-8 py-52">
              <div className="space-y-6 max-w-md">
                <div className="group flex items-start bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-[#24697F]/30 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#24697F]/50 transition-all duration-300 hover:scale-105">
                  {language === 'ar' ? (
                    <>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('hero.subtitle')}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('hero.subtitle')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="group flex items-start bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-[#24697F]/30 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#24697F]/50 transition-all duration-300 hover:scale-105">
                  {language === 'ar' ? (
                    <>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('about.description')}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('about.description')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="group flex items-start bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-[#24697F]/30 shadow-lg hover:bg-white hover:shadow-xl hover:border-[#24697F]/50 transition-all duration-300 hover:scale-105">
                  {language === 'ar' ? (
                    <>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('about.features.service')}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-[#24697F] rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1a5366] transition-colors duration-300">
                        <span className="text-white group-hover:text-gray-100 transition-colors duration-300 transform group-hover:scale-110">▶</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base font-medium group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">
                          {t('about.features.service')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button className="bg-white text-[#24697F] px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1">
                  {t('hero.contactUs')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Split Photo */}
          <div className="relative order-2 lg:order-2 h-full flex items-start">
            {/* Split Photo Container */}
            <div className="relative h-[85%] w-full flex gap-2">

             
              {/* Left Part - 49% */}
              <div className="relative w-[49%] overflow-hidden shadow-2xl">
                {/* Phone Number */}
                <div className="absolute top-0 right-0 z-20 bg-[#24697F] backdrop-blur-md px-6 py-3 shadow-xl">
                  <span className="text-white font-bold text-lg group-hover:text-gray-200 transition-colors duration-300">{t('hero.phoneNumber')}: +213 550307907</span>
                </div>
                
                <div className="absolute inset-0">
                  <Image
                    src="/melrose-by-the-lake-43vHzsfrmxk-unsplash.jpg"
                    alt="Modern living space left"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'left center' }}
                    priority
                  />
                </div>
             
              </div>
              
              {/* Right Part - 49% */}
              <div className="relative w-[49%] h-[85%] self-end overflow-hidden shadow-2xl">
                <div className="absolute inset-0">
                  <Image
                    src="/melrose-by-the-lake-43vHzsfrmxk-unsplash.jpg"
                    alt="Modern living space right"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'right center' }}
                    priority
                  />
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
