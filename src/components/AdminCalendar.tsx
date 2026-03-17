'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminCalendarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  reserveType: 'daily' | 'monthly';
  onClose: () => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  reserveType,
  onClose
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectingDates, setSelectingDates] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const month = currentMonth;
  const year = currentYear;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDateOfMonth = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const navigateMonth = (direction: number) => {
    if (direction === -1) {
      // Previous month
      if (month === 0) {
        setCurrentMonth(11);
        setCurrentYear(year - 1);
      } else {
        setCurrentMonth(month - 1);
      }
    } else {
      // Next month
      if (month === 11) {
        setCurrentMonth(0);
        setCurrentYear(year + 1);
      } else {
        setCurrentMonth(month + 1);
      }
    }
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };
  
  const handleDateClick = (date: Date, dateStr: string) => {
    if (reserveType === 'monthly') {
      // For monthly reservations: click start date → auto-select same day next month
      if (!selectedStartDate) {
        // First click - set start date and auto-calculate end date
        setSelectedStartDate(date);
        
        // Calculate end date (same day next month) - handle timezone properly
        const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        endDate.setMonth(endDate.getMonth() + 1);
        
        // Handle edge cases for end of month (e.g., Jan 31 → Feb 28/29)
        if (date.getDate() !== endDate.getDate()) {
          endDate.setDate(0); // Set to last day of previous month
        }
        
        setSelectedEndDate(endDate);
        
        // Update the date range - use local date string to avoid timezone issues
        onStartDateChange(dateStr);
        onEndDateChange(endDate.toLocaleDateString('en-CA'));
        
        // Don't auto-clear - let user see the selection
      } else {
        // Check if user clicked the same start date - if so, unselect it
        if (selectedStartDate.toDateString() === date.toDateString()) {
          // Unselect everything
          setSelectedStartDate(null);
          setSelectedEndDate(null);
          onStartDateChange('');
          onEndDateChange('');
        } else {
          // User clicked a different date - enforce same day rule
          const startDay = selectedStartDate.getDate();
          const clickedMonth = date.getMonth();
          const clickedYear = date.getFullYear();
          
          // Calculate the correct end date (same day as start, but in clicked's month/year)
          const correctEndDate = new Date(clickedYear, clickedMonth, startDay);
          
          // Handle edge cases for end of month
          if (startDay !== correctEndDate.getDate()) {
            correctEndDate.setDate(0); // Set to last day of the month
          }
          
          setSelectedEndDate(correctEndDate);
          
          // Update the date range - use local date string
          onEndDateChange(correctEndDate.toLocaleDateString('en-CA'));
        }
      }
    } else {
      // Daily reservations - original logic
      if (!isSelecting) {
        // Check if clicking the same start date to unselect
        if (selectedStartDate && selectedStartDate.toDateString() === date.toDateString()) {
          // Unselect everything
          setSelectedStartDate(null);
          setSelectedEndDate(null);
          setIsSelecting(false);
          onStartDateChange('');
          onEndDateChange('');
        } else {
          // Start selecting
          setSelectedStartDate(date);
          setSelectedEndDate(null);
          setIsSelecting(true);
        }
      } else {
        // Finish selecting
        if (selectedStartDate) {
          // Use getTime() for safer date comparison
          const start = selectedStartDate.getTime() < date.getTime() ? selectedStartDate : date;
          const end = selectedStartDate.getTime() < date.getTime() ? date : selectedStartDate;
          setSelectedStartDate(start);
          setSelectedEndDate(end);
          setIsSelecting(false);
          
          // Update the date range - use local date strings
          onStartDateChange(start.toLocaleDateString('en-CA'));
          onEndDateChange(end.toLocaleDateString('en-CA'));
          
          // Don't auto-clear - let user see the selection for daily too
        }
      }
    }
  };
  
  const isDateInSelection = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };
  
  const isDateInHoverRange = (date: Date, dateStr: string) => {
    if (reserveType === 'monthly') return false; // No hover range for monthly
    
    if (!isSelecting || !selectedStartDate || !hoveredDate) return false;
    
    // Use getTime() for safer date comparison
    const start = selectedStartDate.getTime() < hoveredDate.getTime() ? selectedStartDate : hoveredDate;
    const end = selectedStartDate.getTime() < hoveredDate.getTime() ? hoveredDate : selectedStartDate;
    return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
  };
  
  const isDateSelecting = (date: Date) => {
    if (reserveType === 'monthly') {
      // For monthly, show selecting state only for the start date
      return selectedStartDate && date.toDateString() === selectedStartDate.toDateString();
    }
    
    if (!selectedStartDate || !isSelecting) return false;
    // Only highlight the start date, not all dates after it
    return date.toDateString() === selectedStartDate.toDateString();
  };
  
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  
  const isToday = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr === new Date().toLocaleDateString('en-CA');
  };
  
  const isPastDate = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          title="الشهر السابق"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h4 className="text-gray-900 font-semibold text-base">{monthNames[month]} {year}</h4>
        </div>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          title="الشهر التالي"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {(currentMonth !== new Date().getMonth() || currentYear !== new Date().getFullYear()) && (
        <div className="text-center mb-3">
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
          >
            العودة إلى اليوم
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-1 text-sm mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-gray-600 font-medium py-2 text-xs">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-sm">
        {Array.from({ length: startDateOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, month, i + 1);
          const dateStr = date.toLocaleDateString('en-CA');
          const isReserved = false; // No reservations in search calendar
          const today = dateStr === new Date().toLocaleDateString('en-CA');
          const past = isPastDate(date);
          
          return (
            <button
              key={i + 1}
              disabled={past}
              className={`
                text-center rounded-lg text-sm cursor-pointer relative transition-all duration-200 p-2
                ${past 
                  ? 'text-gray-400 cursor-not-allowed opacity-50' 
                  : isDateInSelection(date)
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md shadow-blue-500/25 border-2 border-blue-500'
                    : isDateInHoverRange(date, dateStr)
                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-2 border-blue-300'
                      : isDateSelecting(date)
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-2 border-blue-400 shadow-sm shadow-blue-400/20'
                      : today
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium shadow-sm shadow-indigo-500/20'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
              title={isDateInSelection(date) ? 'فترة محددة (اضغط لإكمال التحديد)' :
                     isDateInHoverRange(date, dateStr) ? 'جزء من الفترة المحددة' :
                     isDateSelecting(date) ? 'جاري التحديد (اضغط لإكمال)' :
                     'اضغط لبدء تحديد الفترة'}
              onClick={() => !past && handleDateClick(date, dateStr)}
              onMouseEnter={() => isSelecting && !past && setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {i + 1}
              {isDateSelecting(date) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
              {isDateInSelection(date) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selection Status Indicator */}
      {isSelecting && reserveType === 'daily' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 text-center font-medium">
            🔍 جاري تحديد الفترة - اضغط على تاريخ الانتهاء
          </p>
        </div>
      )}
      
      {reserveType === 'monthly' && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-700 text-center font-medium">
            📅 للحجز الشهري: اضغط على تاريخ البدء وسيتم تحديد تاريخ الانتهاء تلقائياً
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="mt-4 flex space-x-3 space-x-reverse ">
        <button
          onClick={() => {
            setIsSelecting(false);
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            onClose();
          }}
          className="flex-1 mx-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          إلغاء
        </button>
        
        {startDate && endDate && (
          <button
            onClick={() => {
              setIsSelecting(false);
              setSelectedStartDate(null);
              setSelectedEndDate(null);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md shadow-blue-500/25"
          >
            تأكيد
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminCalendar;
