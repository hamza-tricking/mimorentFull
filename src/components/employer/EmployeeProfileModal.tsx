'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Building, Shield, X } from 'lucide-react';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeUser: {
    id?: string;
    username: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    image?: string;
    phone?: string;
    role?: string;
    wilayaId?: string | {
      _id: string;
      name: string;
    };
    officeId?: string | {
      _id: string;
      name: string;
    };
    officeName?: string;
    lastLogin?: string;
    createdAt?: string;
  };
}

export default function EmployeeProfileModal({ isOpen, onClose, employeeUser }: EmployeeProfileModalProps) {
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
              {employeeUser.image ? (
                <img 
                  src={employeeUser.image} 
                  alt={`${employeeUser.firstName} ${employeeUser.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : employeeUser.firstName && employeeUser.lastName ? (
                <span className="text-2xl font-bold text-white">
                  {employeeUser.firstName.charAt(0).toUpperCase()}{employeeUser.lastName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white text-center">
              {employeeUser.firstName && employeeUser.lastName 
                ? `${employeeUser.firstName} ${employeeUser.lastName}` 
                : employeeUser.username}
            </h2>
            <p className="text-white/80 text-sm mt-1">موظف</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 space-y-3">
          {/* Username */}
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-[#24697F]/10 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-[#24697F]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">اسم المستخدم</p>
              <p className="text-sm font-medium text-gray-900">{employeeUser.username}</p>
            </div>
          </div>

          {/* Full Name */}
          {employeeUser.firstName && employeeUser.lastName && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">الاسم الكامل</p>
                <p className="text-sm font-medium text-gray-900">{employeeUser.firstName} {employeeUser.lastName}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {employeeUser.email && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                <p className="text-sm font-medium text-gray-900">{employeeUser.email}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {employeeUser.phone && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">رقم الهاتف</p>
                <p className="text-sm font-medium text-gray-900">{employeeUser.phone}</p>
              </div>
            </div>
          )}

          {/* Wilaya */}
          {employeeUser.wilayaId && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">الولاية</p>
                <p className="text-sm font-medium text-gray-900">
                  {typeof employeeUser.wilayaId === 'string' 
                    ? employeeUser.wilayaId 
                    : employeeUser.wilayaId.name}
                </p>
              </div>
            </div>
          )}

          {/* Office */}
          {(employeeUser.officeName || employeeUser.officeId) && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <Building className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">المكتب</p>
                <p className="text-sm font-medium text-gray-900">
                  {employeeUser.officeName || (
                    typeof employeeUser.officeId === 'string' 
                      ? employeeUser.officeId 
                      : employeeUser.officeId?.name
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Role */}
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">الصلاحية</p>
              <p className="text-sm font-medium text-gray-900">{employeeUser.role || 'موظف'}</p>
            </div>
          </div>

          {/* Last Login */}
          {employeeUser.lastLogin && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">آخر تسجيل دخول</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(employeeUser.lastLogin).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Member Since */}
          {employeeUser.createdAt && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">موظف منذ</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(employeeUser.createdAt).toLocaleDateString('ar-DZ', {
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
