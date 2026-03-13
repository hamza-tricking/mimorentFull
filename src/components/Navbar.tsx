'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import SimpleLanguageSwitcher from './SimpleLanguageSwitcher';
import { usePageTransition } from '../hooks/usePageTransition';
import { useRouter } from 'next/navigation';
import { useLoading } from '../contexts/LoadingContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { handleNavigation } = usePageTransition();
  const router = useRouter();
  const { isLoading } = useLoading();

  console.log('Navbar isLoading:', isLoading);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      const user = JSON.parse(userData);
      setUserRole(user.role);
    } else {
      setIsLoggedIn(false);
      setUserRole('');
    }
  }, []);

  const navLinks = [
    { name: t('navbar.home'), href: '/' },
    { name: t('navbar.about'), href: '/about' },
    { name: t('navbar.service'), href: '/services' }
  ];

  const handleLogout = () => {
    if (mounted) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setIsLoggedIn(false);
    setUserRole('');
    router.push('/login');
  };

  const getAuthButton = () => {
    if (isLoggedIn) {
      if (userRole === 'admin' || userRole === 'sous admin') {
        return {
          text: 'Dashboard',
          href: '/admin/dashboard',
          className: 'auth-button auth-button-green text-[10px] px-1 py-0.5'
        };
      } else {
        return {
          text: 'Dashboard',
          href: '/login',
          className: 'auth-button auth-button-green text-[10px]'
        };
      }
    } else {
      return {
        text: t('navbar.login'),
        href: '/login',
        className: 'auth-button auth-button-primary '
      };
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      handleNavigation(() => router.push(href));
    }
  };

  return (
    <nav className={`absolute top-0 left-0 right-0 z-50 pointer-events-auto transition-all duration-700 ease-out transform ${!isLoading ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="relative h-16">
        {/* Glass effect background with enhanced blur */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-white/30 shadow-2xl"></div>
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        
        {/* Subtle animated gradient border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#24697F]/30 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div onClick={() => router.push('/')} className="flex items-center cursor-pointer">
            <Image
              src="/IMG_1642.PNG"
              alt="MIMO RENT"
              width={120}
              height={120}
              loading="eager"
              className="object-contain mt-2"
            />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="relative mx-6 cursor-pointer text-gray-700 hover:text-[#24697F] lg:px-6  py-2 text-sm font-medium transition-all duration-300 group "
              >
                <span className="relative z-10">{link.name}</span>
                {/* Hover background effect */}
                <div className="absolute inset-0 bg-[#24697F]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                {/* Bottom underline effect */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#24697F] to-teal-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
            <div className="ml-2">
              <SimpleLanguageSwitcher />
            </div>
          </div>

          {/* Desktop Contact and Login */}
          <div className="hidden md:flex items-center space-x-4 ">
            <button 
              onClick={() => handleNavClick(getAuthButton().href)} 
              className={getAuthButton().className}
            >
              <span>{getAuthButton().text}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden pointer-events-auto ">
            <button
              onClick={() => {
                console.log('Mobile menu button clicked');
                setIsMenuOpen(!isMenuOpen)}}
              className="relative inline-flex items-center z-50 justify-center p-3 rounded-xl text-gray-700 hover:text-[#24697F] hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#24697F] pointer-events-auto transition-all duration-300 backdrop-blur-sm border border-white/30"
              style={{ position: 'relative', zIndex: 9999 }}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pointer-events-auto">
            <div className="relative px-2 pt-2 pb-3 space-y-1 sm:px-3 pointer-events-auto " style={{ zIndex: 9998 }}>
              {/* Glass effect background for mobile menu */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-white/30 shadow-2xl rounded-b-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent "></div>
              
              <div className="relative flex justify-center flex-col items-center content-center">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      handleNavClick(link.href);
                      setIsMenuOpen(false);
                    }}
                    className="relative  flex justify-center flex-col items-center content-center text-gray-700 hover:text-[#24697F] block px-4 py-3 text-base font-medium hover:bg-white/50 rounded-xl transition-all duration-300 w-full text-left group"
                  >
                    <span className="relative z-10">{link.name}</span>
                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-[#24697F]/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  </button>
                ))}
                <div className="pt-4 pb-3 border-t border-white/30">
                  <div className="px-4 py-3">
                    <SimpleLanguageSwitcher />
                  </div>
                  <div className="px-4 py-3">
                    <button 
                      onClick={() => {
                        handleNavClick(getAuthButton().href);
                        setIsMenuOpen(false);
                      }} 
                      className={getAuthButton().className}
                    >
                      <span>{getAuthButton().text}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </nav>
  );
}
