'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const changeLanguage = (langCode: string) => {
    setLanguage(langCode as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#24697F] bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl hover:border-[#24697F] transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden"
      >
        {/* Content */}
        <span>{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <svg
          className={`w-4 h-4 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown with smooth animation */}
      <div className={`absolute right-0 mt-2 w-52 transition-all duration-300 transform origin-top-right z-[10000] ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      }`}>
        <div className="relative bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* Glass effect overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20"></div>
          
          {/* Dropdown content */}
          <div className="relative py-1">
            {languages.map((language, index) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`relative w-full flex items-center space-x-2 px-3 py-2 text-sm transition-all duration-300 group ${
                  currentLanguage.code === language.code 
                    ? 'bg-gradient-to-r from-[#24697F]/20 to-[#1a5366]/20 text-[#24697F]' 
                    : 'text-gray-700 hover:text-[#24697F]'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Content */}
                <span className="relative z-10">{language.flag}</span>
                <span className="relative z-10 font-medium">{language.name}</span>
                
                {/* Checkmark for selected language */}
                {currentLanguage.code === language.code && (
                  <div className="relative z-10 ml-auto">
                    <div className="w-4 h-4 bg-[#24697F] rounded-full flex items-center justify-center animate-scale-in">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Bottom decorative border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#24697F]/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
