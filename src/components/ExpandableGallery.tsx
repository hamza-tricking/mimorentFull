'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ExpandableGallery() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { language, t } = useLanguage();

  const galleryItems = [
    {
      id: 1,
      title: t('gallery.modernDesign'),
      description: t('gallery.modernDescription'),
      image: "/second/0ccaa7bf2c2be09962e6f631cc0b7357.jpg"
    },
    {
      id: 2,
      title: t('gallery.luxuryLiving'),
      description: t('gallery.luxuryDescription'),
      image: "/second/garage-design.jpg"
    },
    {
      id: 3,
      title: t('gallery.minimalistLiving'),
      description: t('gallery.minimalistDescription'),
      image: "/second/21-Minimalist-Living-Room-Decor-Ideas-You-ll-Want-to-Try-Immediately.jpg"
    }
  ];

  const handleItemClick = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="w-full relative overflow-hidden pointer-events-auto">
      {/* Background with scrolling effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-white">
          {/* Animated Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(0, 0, 0, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(0, 0, 0, 0.25) 0%, transparent 50%)
              `,
              backgroundSize: '100% 100%'
            }}></div>
          </div>
          
          {/* Complex Geometric Patterns */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, rgba(0, 0, 0, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(0, 0, 0, 0.1) 87.5%, rgba(0, 0, 0, 0.1)),
                linear-gradient(150deg, rgba(0, 0, 0, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(0, 0, 0, 0.1) 87.5%, rgba(0, 0, 0, 0.1)),
                linear-gradient(30deg, rgba(0, 0, 0, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(0, 0, 0, 0.1) 87.5%, rgba(0, 0, 0, 0.1)),
                linear-gradient(150deg, rgba(0, 0, 0, 0.1) 12%, transparent 12.5%, transparent 87%, rgba(0, 0, 0, 0.1) 87.5%, rgba(0, 0, 0, 0.1)),
                linear-gradient(60deg, rgba(0, 0, 0, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(0, 0, 0, 0.08) 75.5%, rgba(0, 0, 0, 0.08)),
                linear-gradient(120deg, rgba(0, 0, 0, 0.08) 25%, transparent 25.5%, transparent 75%, rgba(0, 0, 0, 0.08) 75.5%, rgba(0, 0, 0, 0.08))
              `,
              backgroundSize: '80px 140px',
              backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 0 0'
            }}></div>
          </div>
          
          {/* Hexagon Pattern */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 0 0, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 40px 0, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 20px 35px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 60px 35px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 0 70px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 40px 70px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 20px 105px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px),
                radial-gradient(circle at 60px 105px, transparent 0, transparent 20px, rgba(0, 0, 0, 0.1) 20px, rgba(0, 0, 0, 0.1) 21px, transparent 21px)
              `,
              backgroundSize: '80px 140px'
            }}></div>
          </div>
          
          {/* Triangle Pattern */}
          <div className="absolute inset-0 opacity-12">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 45%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.1) 55%, transparent 55%),
                linear-gradient(-45deg, transparent 45%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.1) 55%, transparent 55%),
                linear-gradient(135deg, transparent 45%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.1) 55%, transparent 55%),
                linear-gradient(-135deg, transparent 45%, rgba(0, 0, 0, 0.1) 45%, rgba(0, 0, 0, 0.1) 55%, transparent 55%)
              `,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 0, 0 30px, 30px 30px'
            }}></div>
          </div>
          
          {/* Moving Elements with Mouse and Scroll */}
          <div 
            className="absolute top-1/4 left-1/4 w-24 h-24 bg-[#24697F] rounded-2xl shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-3/4 right-1/4 w-28 h-28 bg-[#24697F] rounded-2xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(0px, 0px) translateY(0px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-1/2 left-1/3 w-20 h-20 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-250 ease-out"
            style={{
              transform: `translate(0px, 0px) rotate(45deg)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/3 right-1/3 w-22 h-22 border-4 border-[#24697F] rounded-full shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-1/5 right-1/5 w-16 h-16 bg-[#24697F] rounded-2xl shadow-2xl transition-transform duration-150 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/5 left-1/5 w-18 h-18 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(0px, 0px) rotate(0deg)`,
            }}
          ></div>
          
          {/* 3D Floating Shapes */}
          <div 
            className="absolute top-1/3 right-1/2 w-12 h-12 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/2 left-1/2 w-14 h-14 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-250 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          ></div>
          
          {/* 3D Lines */}
          <div 
            className="absolute top-1/4 left-1/2 w-48 h-3 bg-[#24697F] transition-transform duration-200 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/4 right-1/2 w-40 h-3 bg-[#24697F] transition-transform duration-300 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          {/* Rotating Elements */}
          <div 
            className="absolute top-1/4 right-1/3 w-28 h-28 border-8 border-[#24697F] rounded-full shadow-2xl transition-transform duration-400 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/4 left-1/3 w-24 h-24 border-6 border-[#24697F] rounded-full shadow-2xl transition-transform duration-350 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          {/* Enhanced Noticeable Moving Elements */}
          
          {/* Floating Orbs */}
          <div 
            className="absolute top-1/6 left-1/6 w-20 h-20 bg-[#24697F] rounded-full shadow-2xl transition-transform duration-300 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/6 right-1/6 w-24 h-24 bg-[#24697F] rounded-full shadow-2xl transition-transform duration-250 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          {/* Moving Particles */}
          <div 
            className="absolute top-1/3 left-1/5 w-8 h-8 bg-[#24697F] rounded-full shadow-2xl transition-transform duration-200 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute top-2/3 right-1/5 w-7 h-7 bg-[#24697F] rounded-full shadow-2xl transition-transform duration-150 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          <div 
            className="absolute middle-1/2 left-1/2 w-9 h-9 bg-[#24697F] rounded-full shadow-2xl transition-transform duration-180 ease-out"
            style={{
              transform: `translate(0px, 0px)`,
            }}
          ></div>
          
          {/* Pulsing Squares */}
          <div 
            className="absolute top-1/5 left-2/3 w-16 h-16 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-300 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px) rotate(45deg)`,
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/5 right-2/3 w-12 h-12 bg-[#24697F] rounded-xl shadow-2xl transition-transform duration-250 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px) rotate(-45deg)`,
            }}
          ></div>
          
          {/* Star Shapes */}
          <div 
            className="absolute top-1/6 right-1/6 w-12 h-12 bg-[#24697F] shadow-2xl transition-transform duration-200 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px) rotate(45deg)`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 100% 35%, 100% 35%, 100% 35%)',
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/6 left-1/6 w-10 h-10 bg-[#24697F] shadow-2xl transition-transform duration-180 ease-out animate-pulse"
            style={{
              transform: `translate(0px, 0px) rotate(-45deg)`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 100% 35%, 100% 35%, 100% 35%)',
            }}
          ></div>
          
          {/* Diamond Shapes */}
          <div 
            className="absolute top-1/3 left-1/2 w-14 h-14 bg-[#24697F] shadow-2xl transition-transform duration-300 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          ></div>
          
          {/* Hexagon Shapes */}
          <div 
            className="absolute top-1/4 left-1/2 w-16 h-16 bg-[#24697F] shadow-2xl transition-transform duration-250 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/4 right-1/2 w-12 h-12 bg-[#24697F] shadow-2xl transition-transform duration-200 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            }}
          ></div>
          
          {/* Triangle Shapes */}
          <div 
            className="absolute top-1/5 left-1/3 w-14 h-14 bg-[#24697F] shadow-2xl transition-transform duration-300 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          ></div>
          
          <div 
            className="absolute bottom-1/5 right-1/3 w-10 h-10 bg-[#24697F] shadow-2xl transition-transform duration-250 ease-out animate-spin"
            style={{
              transform: `translate(0px, 0px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          ></div>
          
          {/* Mobile Enhanced Elements */}
          <div className="md:hidden">
            {/* Large Moving Orbs */}
            <div 
              className="absolute top-1/4 left-1/4 w-28 h-28 bg-[#24697F] rounded-full shadow-2xl"
              style={{
                animation: 'float 6s ease-in-out infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#24697F] rounded-full shadow-2xl"
              style={{
                animation: 'float 8s ease-in-out infinite reverse',
                animationDelay: '2s',
              }}
            ></div>
            
            {/* Spinning Elements */}
            <div 
              className="absolute top-1/3 right-1/3 w-20 h-20 bg-[#24697F] rounded-xl shadow-2xl"
              style={{
                animation: 'spin 10s linear infinite',
              }}
            ></div>
            
            <div 
              className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-[#24697F] rounded-full shadow-2xl"
              style={{
                animation: 'spin 15s linear infinite reverse',
                animationDelay: '1s',
              }}
            ></div>
            
            {/* Pulsing Elements */}
            <div className="absolute top-1/2 left-1/2 w-10 h-10 bg-[#24697F] rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 right-1/2 w-8 h-8 bg-[#24697F] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/4 left-1/2 w-9 h-9 bg-[#24697F] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 bg-gray-50/90 backdrop-blur-sm py-16 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('gallery.title')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </div>
          
          <div className="flex justify-center items-stretch min-h-[400px] w-full">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`relative overflow-hidden shadow-lg transition-all duration-500 ease-in-out cursor-pointer ${
                  expandedIndex === index 
                    ? 'w-[50%] lg:w-[50%]' 
                    : 'w-[33.333%] lg:w-[33.333%]'
                } ${expandedIndex !== null && expandedIndex !== index ? 'opacity-50 scale-95' : ''} ${
                  isMobile ? 'active:scale-95' : ''
                }`}
                onClick={() => handleItemClick(index)}
                onMouseEnter={() => !isMobile && setExpandedIndex(index)}
                onMouseLeave={() => !isMobile && setExpandedIndex(null)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleItemClick(index);
                }}
              >
                {/* Image Container */}
                <div className="relative h-[400px] lg:h-[500px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out"
                    style={{
                      transform: expandedIndex === index ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 transition-transform duration-300"
                        style={{
                          transform: expandedIndex === index ? 'translateY(-10px)' : 'translateY(0)'
                        }}>
                      {item.title}
                    </h3>
                    <p className={`text-sm transition-all duration-300 ${
                      expandedIndex === index 
                        ? 'opacity-100 max-h-20' 
                        : 'opacity-0 max-h-0 overflow-hidden'
                    }`}>
                      {item.description}
                    </p>
                    
                    {/* Button */}
                    <button className={`mt-4 bg-white text-gray-900 px-6 py-2 font-semibold transition-all duration-300 ${
                      expandedIndex === index 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 transform translate-y-4'
                    }`}>
                      Explore More
                    </button>
                  </div>
                </div>
                
                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-4 border-white/20 transition-opacity duration-300 ${
                  expandedIndex === index ? 'opacity-100' : 'opacity-0'
                }`}></div>
                
                {/* Mobile Touch Indicator */}
                <div className="md:hidden absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
          
          {/* Mobile Instructions */}
          <div className="md:hidden text-center mt-8 text-gray-600">
            <p className="text-sm">Tap on any image to expand and explore</p>
          </div>
        </div>
      </div>
    </div>
  );
}
