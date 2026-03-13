'use client';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-2 border-white/20 rounded-full animate-spin`}>
          <div className={`${sizeClasses[size]} border-2 border-transparent border-t-white/60 rounded-full`}></div>
        </div>
        
        {/* Inner pulsing dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5'} bg-white/40 rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {text && (
        <div className={`${textSizeClasses[size]} text-white/60 animate-pulse`}>
          {text}
        </div>
      )}
    </div>
  );
}
