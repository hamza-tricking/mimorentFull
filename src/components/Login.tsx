'use client';

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Force re-render when language changes
  React.useEffect(() => {
    // Clear errors when language changes to show translated errors
    console.log('Login component - Current language:', language);
    setErrors({});
  }, [language]);

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('User already logged in:', user.role);
        
        // Redirect based on user role
        if (user.role === 'admin' || user.role === 'sous admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'employer') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard'); // Default fallback
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsCheckingAuth(false); // Show login page
      }
    } else {
      setIsCheckingAuth(false); // Show login page
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!formData.username) {
      newErrors.username = t('login.errors.usernameRequired') || 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = t('login.errors.usernameMinLength') || 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = t('login.errors.passwordRequired') || 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.errors.passwordMinLength') || 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('https://dmtart.pro/mimorent/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Debug: Log complete API response
        console.log('API Response:', data);
        console.log('User data from API:', data.data.user);
        console.log('User image field:', data.data.user.image);
        
        // Store token in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Redirect based on user role
        if (data.data.user.role === 'admin' || data.data.user.role === 'sous admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard'); // Regular user dashboard
        }
      } else {
        setErrors({
          general: data.message || t('login.errors.loginFailed') || 'Login failed. Please try again.'
        });
      }
    } catch (error) {
      setErrors({
        general: t('login.errors.networkError') || 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br py-8 from-slate-900 via-[#24697F] to-slate-900 flex items-center justify-center px-4">
        <div className="text-white text-xl">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br py-8 from-slate-900 via-[#24697F] to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#24697F]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#1a5366]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main login card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-[#24697F] to-[#1a5366] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform transition-all duration-300 hover:rotate-12">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {t('login.title')}
            </h2>
            <p className="text-white/80 text-lg">
              {t('login.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-white/90">
                {t('login.username') || 'Username'}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="h-5 mx-2 w-5 text-white/50 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-4 py-4 bg-white/10 border ${errors.username ? 'border-red-400/50' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-[#24697F]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                  placeholder={t('login.usernamePlaceholder') || 'Enter your username'}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-300 flex items-center gap-1">
                  <svg className="h-4 mx-2 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/90">
                {t('login.password')}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-12 py-4 bg-white/10 border ${errors.password ? 'border-red-400/50' : 'border-white/20'} rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-[#24697F]/50 focus:border-transparent backdrop-blur-sm transition-all duration-300`}
                  placeholder={t('login.passwordPlaceholder')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-white/50 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-300 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#24697F] focus:ring-[#24697F] border-white/20 rounded bg-white/10"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-white/80">
                {t('login.rememberMe')}
              </label>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-red-200 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#24697F] to-[#1a5366] text-white py-4 px-4 rounded-xl font-semibold hover:from-[#1a5366] hover:to-[#24697F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#24697F] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('login.signingIn')}
                  </div>
                ) : (
                  t('login.signIn')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
