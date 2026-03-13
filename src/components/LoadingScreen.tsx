'use client';

import Image from 'next/image';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br w-screen from-slate-900 via-[#24697F] to-slate-900 flex flex-col items-center h-screen justify-center fixed inset-0 overflow-hidden z-[99999]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#24697F]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1a5366]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Rotating logo */}
        <div className="mb-8">
          <div className="relative" style={{ perspective: '1000px' }}>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#24697F] to-[#1a5366] rounded-full blur-lg opacity-50"
              style={{
                animation: 'flipCoin 2s linear infinite',
                transformStyle: 'preserve-3d',
              }}
            ></div>
            <div 
              className="relative bg-white/10 backdrop-blur-xl rounded-full p-6 border border-white/20"
              style={{
                animation: 'flipCoin 2s linear infinite',
                transformStyle: 'preserve-3d',
              }}
            >
              <Image
                src="/IMG_1642.PNG"
                alt="MIMO RENT"
                width={120}
                height={120}
                loading="eager"
                className="object-contain"
                style={{
                  backfaceVisibility: 'hidden',
                }}
              />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 mt-8">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#24697F] to-[#1a5366] rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
