'use client';

import { useState, useRef, useEffect } from 'react';
import { UserCheck, Mail, Phone, Calendar, Shield, X } from 'lucide-react';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminUser: {
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    image?: string;
    role?: string;
    createdAt?: string;
  };
}

export default function AdminProfileModal({ isOpen, onClose, adminUser }: AdminProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 transform transition-all duration-300 ease-out scale-100 opacity-100"
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        {/* Header with X button */}
        <div className="relative bg-gradient-to-r from-[#24697F] to-[#1a5366] p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Profile Avatar */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-3 border-white/30 mb-3 overflow-hidden">
              {adminUser.image ? (
                <img 
                  src={adminUser.image} 
                  alt={`${adminUser.firstName} ${adminUser.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : adminUser.firstName && adminUser.lastName ? (
                <span className="text-2xl font-bold text-white">
                  {adminUser.firstName.charAt(0).toUpperCase()}{adminUser.lastName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <UserCheck className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white text-center">
              {adminUser.firstName && adminUser.lastName 
                ? `${adminUser.firstName} ${adminUser.lastName}` 
                : adminUser.username}
            </h2>
            <p className="text-white/80 text-sm mt-1">مدير النظام</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 space-y-3">
          {/* Username */}
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-[#24697F]/10 rounded-lg flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-[#24697F]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">اسم المستخدم</p>
              <p className="text-sm font-medium text-gray-900">{adminUser.username}</p>
            </div>
          </div>

          {/* Email */}
          {adminUser.email && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
              </div>
            </div>
          )}

          {/* Role */}
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">الصلاحية</p>
              <p className="text-sm font-medium text-gray-900">{adminUser.role || 'مدير'}</p>
            </div>
          </div>

          {/* Member Since */}
          {adminUser.createdAt && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">عضو منذ</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(adminUser.createdAt).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-center pt-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-800">نشط</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#24697F] to-[#1a5366] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            إغلاق
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
