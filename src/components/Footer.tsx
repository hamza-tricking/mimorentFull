'use client';

import Image from 'next/image';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="relative w-full overflow-hidden">
      {/* Background without moving shapes */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#24697F]/10 via-white to-[#24697F]/5 backdrop-blur-sm">
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
                linear-gradient(45deg, transparent 48%, rgba(0, 0, 0, 0.1) 50%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(0, 0, 0, 0.1) 50%, transparent 52%),
                linear-gradient(90deg, transparent 48%, rgba(0, 0, 0, 0.05) 50%, transparent 52%),
                linear-gradient(0deg, transparent 48%, rgba(0, 0, 0, 0.05) 50%, transparent 52%)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 bg-gradient-to-br from-[#24697F]/10 via-white to-[#24697F]/5 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2 text-center md:text-left">
              <div className="flex items-center mb-6 group justify-center md:justify-start">
                <div className="relative w-22 h-22 mr-4 group-hover:scale-105 transition-all duration-300">
                  <Image
                    src="/IMG_1642.PNG"
                    alt="MIMO RENT"
                    fill
                    loading="eager"
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 group-hover:text-[#24697F] transition-colors duration-300">MIMO RENT</span>
                  <p className="text-sm text-[#24697F] font-medium">COMFORT HOUSE</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="flex space-x-3 justify-center md:justify-start">
                <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#24697F] hover:text-white hover:border-[#24697F] transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#24697F] hover:text-white hover:border-[#24697F] transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#24697F] hover:text-white hover:border-[#24697F] transition-all duration-300 hover:scale-110 shadow-sm hover:shadow-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-6 relative group">
                {t('footer.quickLinks')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24697F] group-hover:w-full transition-all duration-300"></span>
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#24697F] transition-colors duration-300 flex items-center group justify-center md:justify-start">
                    <span className="w-2 h-2 bg-[#24697F]/30 rounded-full mr-3 group-hover:bg-[#24697F] transition-colors duration-300"></span>
                    {t('footer.aboutUs')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#24697F] transition-colors duration-300 flex items-center group justify-center md:justify-start">
                    <span className="w-2 h-2 bg-[#24697F]/30 rounded-full mr-3 group-hover:bg-[#24697F] transition-colors duration-300"></span>
                    {t('footer.properties')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#24697F] transition-colors duration-300 flex items-center group justify-center md:justify-start">
                    <span className="w-2 h-2 bg-[#24697F]/30 rounded-full mr-3 group-hover:bg-[#24697F] transition-colors duration-300"></span>
                    {t('footer.services')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-700 hover:text-[#24697F] transition-colors duration-300 flex items-center group justify-center md:justify-start">
                    <span className="w-2 h-2 bg-[#24697F]/30 rounded-full mr-3 group-hover:bg-[#24697F] transition-colors duration-300"></span>
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-6 relative group">
                {t('footer.getInTouch')}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24697F] group-hover:w-full transition-all duration-300"></span>
              </h3>
              <div className="space-y-4">
                {/* Phone */}
                <a href="tel:+213550307907" className="flex items-center group justify-center md:justify-start p-3 rounded-lg hover:bg-[#24697F]/5 transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#24697F]/10 to-[#24697F]/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-[#24697F] transition-all duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-[#24697F] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('footer.phone')}</p>
                    <p className="text-gray-900 font-semibold hover:text-[#24697F] transition-colors duration-300">+213 550307907</p>
                  </div>
                </a>
                
                {/* Email */}
                <a href="mailto:info@mimorent.com" className="flex items-center group justify-center md:justify-start p-3 rounded-lg hover:bg-[#24697F]/5 transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#24697F]/10 to-[#24697F]/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-[#24697F] transition-all duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-[#24697F] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('footer.email')}</p>
                    <p className="text-gray-900 font-semibold hover:text-[#24697F] transition-colors duration-300">info@mimorent.com</p>
                  </div>
                </a>
                
                {/* Address */}
                <div className="flex items-center group justify-center md:justify-start p-3 rounded-lg hover:bg-[#24697F]/5 transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#24697F]/10 to-[#24697F]/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-[#24697F] transition-all duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-[#24697F] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('footer.address')}</p>
                    <p className="text-gray-900 font-semibold">Algeria</p>
                  </div>
                </div>
                
                {/* Business Hours */}
                <div className="flex items-center group justify-center md:justify-start p-3 rounded-lg hover:bg-[#24697F]/5 transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#24697F]/10 to-[#24697F]/20 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-[#24697F] transition-all duration-300 group-hover:scale-110">
                    <svg className="w-5 h-5 text-[#24697F] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{t('footer.businessHours')}</p>
                    <p className="text-gray-900 font-semibold">Mon - Fri: 9AM - 6PM</p>
                    <p className="text-gray-600 text-sm">Sat: 10AM - 4PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-[#24697F]/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <p className="text-gray-600 text-sm text-center md:text-left">
                  © 2024 MIMO RENT. {t('footer.rights')}
                </p>
              </div>
              <div className="flex space-x-8 ">
                <a href="#" className="text-gray-600 mx-2 hover:text-[#24697F] text-sm font-medium transition-colors duration-300 relative group">
                  {t('footer.privacy')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24697F] group-hover:w-full transition-all duration-300"></span>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#24697F] text-sm font-medium transition-colors duration-300 relative group">
                  {t('footer.terms')}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#24697F] group-hover:w-full transition-all duration-300"></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
