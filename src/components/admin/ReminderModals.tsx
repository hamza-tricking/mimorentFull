'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  X, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ReminderModalsProps {
  showBeforeEndModal: boolean;
  showSpecificTimeModal: boolean;
  onCloseBeforeEnd: () => void;
  onCloseSpecificTime: () => void;
  reservationId: string;
  propertyTitle: string;
  customerName: string;
  reservationStartDate: string;
  reservationEndDate: string;
  onReminderCreated: () => void;
}

export default function ReminderModals({
  showBeforeEndModal,
  showSpecificTimeModal,
  onCloseBeforeEnd,
  onCloseSpecificTime,
  reservationId,
  propertyTitle,
  customerName,
  reservationStartDate,
  reservationEndDate,
  onReminderCreated
}: ReminderModalsProps) {
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Before End Modal State
  const [daysBeforeEnd, setDaysBeforeEnd] = useState('');
  const [beforeEndMessage, setBeforeEndMessage] = useState('تذكير بخصوص حجز العقار القادم. يرجى التأكد من الاستعداد لتسليم العقار في الوقت المحدد.');
  const [beforeEndLoading, setBeforeEndLoading] = useState(false);

  // Specific Time Modal State
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [specificTimeMessage, setSpecificTimeMessage] = useState('تذكير بخصوص حجز العقار. يرجى مراجعة التفاصيل والتأكد من الاستعداد للزيارة.');
  const [specificTimeLoading, setSpecificTimeLoading] = useState(false);

  // Reset form when modals close
  useEffect(() => {
    if (!showBeforeEndModal) {
      setDaysBeforeEnd('');
      setBeforeEndMessage('');
    }
    if (!showSpecificTimeModal) {
      setReminderDateTime('');
      setSpecificTimeMessage('');
    }
  }, [showBeforeEndModal, showSpecificTimeModal]);

  // Create before end reminder
  const handleCreateBeforeEndReminder = async () => {
    if (!daysBeforeEnd || !beforeEndMessage) {
      addToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    const days = parseInt(daysBeforeEnd);
    if (isNaN(days) || days < 1 || days > 30) {
      addToast('يجب أن يكون عدد الأيام بين 1 و 30', 'error');
      return;
    }

    // Check if reservation is expired
    const now = new Date();
    const reservationEnd = new Date(reservationEndDate);
    if (now > reservationEnd) {
      addToast('لا يمكن إنشاء تذكير لحجز منتهي الصلاحية', 'error');
      return;
    }

    setBeforeEndLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservationId,
          reminderType: 'before_end',
          daysBeforeEnd: days,
          message: beforeEndMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('تم إنشاء التذكير بنجاح', 'success');
        onCloseBeforeEnd();
        onReminderCreated();
      } else {
        // Show the specific error message from backend
        addToast(data.message || 'فشل إنشاء التذكير', 'error');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      addToast('حدث خطأ. يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setBeforeEndLoading(false);
    }
  };

  // Create specific time reminder
  const handleCreateSpecificTimeReminder = async () => {
    if (!reminderDateTime || !specificTimeMessage) {
      addToast('يرجى ملء جميع الحقول المطلوبة', 'error');
      return;
    }

    const reminderDate = new Date(reminderDateTime);
    const reservationEnd = new Date(reservationEndDate);
    const now = new Date();

    if (reminderDate < now) {
      addToast('لا يمكن تحديد تذكير في الماضي', 'error');
      return;
    }

    if (reminderDate > reservationEnd) {
      addToast('يجب أن يكون تاريخ التذكير ضمن فترة الحجز', 'error');
      return;
    }

    // Check if reservation is expired
    if (now > reservationEnd) {
      addToast('لا يمكن إنشاء تذكير لحجز منتهي الصلاحية', 'error');
      return;
    }

    setSpecificTimeLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dmtart.pro/mimorent/api/admin/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservationId,
          reminderType: 'specific_time',
          reminderDateTime: reminderDateTime,
          message: specificTimeMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast('تم إنشاء التذكير بنجاح', 'success');
        onCloseSpecificTime();
        onReminderCreated();
      } else {
        // Show the specific error message from backend
        addToast(data.message || 'فشل إنشاء التذكير', 'error');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      addToast('حدث خطأ. يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setSpecificTimeLoading(false);
    }
  };

  // Get min and max dates for specific time input
  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const getMaxDateTime = () => {
    return new Date(reservationEndDate).toISOString().slice(0, 16);
  };

  return (
    <>
      {/* Before End Reminder Modal */}
      {showBeforeEndModal && (
        <div 
          className="fixed inset-0 bg-white/20 bg-opacity-50 flex items-center justify-center pt-4 p-2"
          style={{ zIndex: 999999 }}
        >
          <div className="bg-white rounded-xl  w-full shadow-2xl p-4" dir="rtl" style={{ maxHeight: '90vh', overflowY: 'auto' ,  maxWidth: '70vw'}}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">تذكير قبل نهاية الحجز</h3>
              <button
                onClick={onCloseBeforeEnd}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Reservation Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">العقار:</span>
                  <span className="font-medium text-gray-800">{propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-medium text-gray-800">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ البدء:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(reservationStartDate).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ النهاية:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">
                      {new Date(reservationEndDate).toLocaleDateString('ar-DZ')}
                    </span>
                    {new Date() > new Date(reservationEndDate) && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        منتهي الصلاحية
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 ">
              {/* Days Before End */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأيام قبل النهاية
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysBeforeEnd}
                    onChange={(e) => setDaysBeforeEnd(e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل عدد الأيام"
                  />
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">يوم</span>
                </div>
                {daysBeforeEnd && parseInt(daysBeforeEnd) > 0 && (() => {
                      // Debug logging
                      const reservationEnd = new Date(reservationEndDate);
                      const reminderDate = new Date(reservationEnd);
                      reminderDate.setDate(reservationEnd.getDate() - parseInt(daysBeforeEnd));
                      reminderDate.setHours(9, 0, 0, 0);
                      const now = new Date();
                      
                      console.log('🔍 Debug Info:');
                      console.log('Current time:', now.toLocaleString('ar-DZ'));
                      console.log('Reminder time:', reminderDate.toLocaleString('ar-DZ'));
                      console.log('Reminder > Current:', reminderDate > now);
                      console.log('Time difference (hours):', (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60));
                      
                      // Check if reminder is at least 2 hours in advance
                      const minHoursInAdvance = 2;
                      const timeDifferenceHours = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                      const isValid = reminderDate > now && timeDifferenceHours >= minHoursInAdvance;
                      const isToday = (() => {
                        const today = new Date();
                        const reminderToday = new Date(reminderDate);
                        today.setHours(0, 0, 0, 0);
                        reminderToday.setHours(0, 0, 0, 0);
                        return reminderToday.getTime() === today.getTime();
                      })();
                      
                      return (
                        <div className={`mt-2 p-3 border rounded-lg  ${
                          isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <p className={`text-sm ${isValid ? 'text-blue-800' : 'text-red-800'}`}>
                            <span className="font-medium">
                              {isValid ? 'سيتم إرسال التذكير في:' : 
                               (reminderDate <= now ? 
                                (isToday ? '⚠️ وقت التذكير اليوم قد انتهى:' : '⚠️ تاريخ التذكير قد انتهى:') :
                                '⚠️ وقت التذكير قصير جداً:')}
                            </span>
                          </p>
                          <p className={`text-lg font-semibold ${isValid ? 'text-blue-900' : 'text-red-900'}`}>
                            {reminderDate.toLocaleString('ar-DZ', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className={`text-xs mt-1 ${isValid ? 'text-blue-700' : 'text-red-700'}`}>
                            أي قبل {daysBeforeEnd} يوم من نهاية الحجز ({new Date(reservationEndDate).toLocaleDateString('ar-DZ', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })})
                            {!isValid && (
                              reminderDate <= now ? 
                              (isToday ? 
                                ' - وقت التذكير (9:00 ص) قد انتهى لهذا اليوم، يرجى اختيار عدد أيام أقل' :
                                ' - هذا التاريخ في الماضي، يرجى اختيار عدد أيام أقل') :
                              ` - وقت التذكير أقل من ${minHoursInAdvance} ساعة من الآن (${timeDifferenceHours.toFixed(1)} ساعة متبقية)، يرجى اختيار وقت أبعد`
                            )}
                          </p>
                        </div>
                      );
                    })()}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة التذكير
                </label>
                <textarea
                  value={beforeEndMessage}
                  onChange={(e) => setBeforeEndMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="مثال: تذكير بخصوص حجز العقار القادم. يرجى التأكد من الاستعداد لتسليم العقار في الوقت المحدد."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {beforeEndMessage.length}/500 حرف
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={onCloseBeforeEnd}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={beforeEndLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateBeforeEndReminder}
                disabled={beforeEndLoading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {beforeEndLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإنشاء...
                  </span>
                ) : (
                  'إنشاء التذكير'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specific Time Reminder Modal */}
      {showSpecificTimeModal && (
        <div 
          className="fixed inset-0 bg-white/20 backdrop-blur-sm bg-opacity-50 flex items-center justify-center pt-4 p-2"
          style={{ zIndex: 999999 }}
        >
          <div className="bg-white rounded-xl  shadow-2xl p-4" dir="rtl" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">تذكير في وقت معين</h3>
              <button
                onClick={onCloseSpecificTime}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Reservation Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">العقار:</span>
                  <span className="font-medium text-gray-800">{propertyTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العميل:</span>
                  <span className="font-medium text-gray-800">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ البدء:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(reservationStartDate).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ النهاية:</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">
                      {new Date(reservationEndDate).toLocaleDateString('ar-DZ')}
                    </span>
                    {new Date() > new Date(reservationEndDate) && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        منتهي الصلاحية
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Date Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وقت التذكير
                </label>
                <input
                  type="datetime-local"
                  value={reminderDateTime}
                  onChange={(e) => setReminderDateTime(e.target.value)}
                  min={getMinDateTime()}
                  max={getMaxDateTime()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  style={{ fontSize: '16px' }} /* Prevents zoom on mobile */
                />
                {reminderDateTime && (() => {
                  const reminderDate = new Date(reminderDateTime);
                  const now = new Date();
                  const reservationStart = new Date(reservationStartDate);
                  const reservationEnd = new Date(reservationEndDate);
                  
                  // Check if reminder is valid
                  const isValid = reminderDate > now && reminderDate >= reservationStart && reminderDate <= reservationEnd;
                  const isPast = reminderDate <= now;
                  const isBeforeStart = reminderDate < reservationStart;
                  const isAfterEnd = reminderDate > reservationEnd;
                  
                  return (
                    <div className={`mt-2 p-3 border rounded-lg ${
                      isValid ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm ${isValid ? 'text-blue-800' : 'text-red-800'}`}>
                        <span className="font-medium">
                          {isValid ? 'سيتم إرسال التذكير في:' :
                           isPast ? '⚠️ وقت التذكير قد انتهى:' :
                           isBeforeStart ? '⚠️ وقت التذكير قبل بدء الحجز:' :
                           '⚠️ وقت التذكير بعد انتهاء الحجز:'}
                        </span>
                      </p>
                      <p className={`text-lg font-semibold ${isValid ? 'text-blue-900' : 'text-red-900'}`}>
                        {reminderDate.toLocaleString('ar-DZ', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'Africa/Algiers'
                        })}
                      </p>
                      <p className={`text-xs mt-1 ${isValid ? 'text-blue-700' : 'text-red-700'}`}>
                        فترة الحجز: {reservationStart.toLocaleDateString('ar-DZ')} - {reservationEnd.toLocaleDateString('ar-DZ')}
                        {!isValid && (
                          isPast ? ' - هذا التاريخ في الماضي، يرجى اختيار وقت في المستقبل' :
                          isBeforeStart ? ' - هذا التاريخ قبل بدء الحجز، يرجى اختيار وقت ضمن فترة الحجز' :
                          ' - هذا التاريخ بعد انتهاء الحجز، يرجى اختيار وقت ضمن فترة الحجز'
                        )}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة التذكير
                </label>
                <textarea
                  value={specificTimeMessage}
                  onChange={(e) => setSpecificTimeMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="مثال: تذكير بخصوص حجز العقار. يرجى مراجعة التفاصيل والتأكد من الاستعداد للزيارة."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {specificTimeMessage.length}/500 حرف
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 space-x-reverse mt-6">
              <button
                onClick={onCloseSpecificTime}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={specificTimeLoading}
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateSpecificTimeReminder}
                disabled={specificTimeLoading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {specificTimeLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإنشاء...
                  </span>
                ) : (
                  'إنشاء التذكير'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
