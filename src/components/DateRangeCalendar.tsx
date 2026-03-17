'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangeCalendarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  reserveType: 'daily' | 'monthly';
  onClose: () => void;
}

const DateRangeCalendar: React.FC<DateRangeCalendarProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  reserveType,
  onClose
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selecting, setSelecting] = useState<'start' | 'end' | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  
  const month = currentMonth;
  const year = currentYear;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDateOfMonth = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const dayNames = ['أ', 'ن', 'ث', 'أ', 'خ', 'ج', 'س'];
  
  const navigateMonth = (direction: number) => {
    if (direction === -1) {
      if (month === 0) {
        setCurrentMonth(11);
        setCurrentYear(year - 1);
      } else {
        setCurrentMonth(month - 1);
      }
    } else {
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
    if (selecting === 'start') {
      onStartDateChange(dateStr);
      setSelecting('end');
    } else if (selecting === 'end') {
      onEndDateChange(dateStr);
      setSelecting(null);
      onClose();
    } else {
      // Start selecting start date
      setSelecting('start');
    }
  };
  
  const isDateSelected = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr === startDate || dateStr === endDate;
  };
  
  const isDateInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    return dateStr >= startDate && dateStr <= endDate;
  };
  
  const isDateHovered = (date: Date) => {
    if (!selecting || !startDate || !hoveredDate) return false;
    const dateStr = date.toLocaleDateString('en-CA');
    const hoveredStr = hoveredDate.toLocaleDateString('en-CA');
    return dateStr >= startDate && dateStr <= hoveredStr;
  };
  
  const isToday = (date: Date) => {
    return date.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');
  };
  
  const isPastDate = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="الشهر السابق"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="text-center">
          <h4 className="text-gray-900 font-semibold">{monthNames[month]} {year}</h4>
        </div>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="الشهر التالي"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {(currentMonth !== new Date().getMonth() || currentYear !== new Date().getFullYear()) && (
        <div className="text-center mb-2">
          <button
            onClick={goToToday}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            العودة إلى اليوم
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-1 text-xs mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-gray-600 font-medium py-2">
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
          const selected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const hovered = isDateHovered(date);
          const today = isToday(date);
          const past = isPastDate(date);
          
          return (
            <button
              key={i + 1}
              disabled={past}
              className={`
                text-center rounded-lg p-2 transition-all duration-200
                ${past ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                ${selected 
                  ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' 
                  : inRange 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : hovered
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      : today
                        ? 'bg-gray-100 text-gray-900 font-medium hover:bg-gray-200'
                        : 'text-gray-700 hover:bg-gray-100'
                }
              `}
              onClick={() => !past && handleDateClick(date, dateStr)}
              onMouseEnter={() => selecting && !past && setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      
      {/* Selection Status */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-gray-700">
                {selecting === 'start' ? 'اختر تاريخ البدء' : 
                 selecting === 'end' ? 'اختر تاريخ الانتهاء' : 
                 'اضغط لبدء التحديد'}
              </span>
            </div>
          </div>
          
          {startDate && (
            <div className="text-blue-600 font-medium">
              {new Date(startDate).toLocaleDateString('ar-DZ')}
              {endDate && ` - ${new Date(endDate).toLocaleDateString('ar-DZ')}`}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="mt-4 flex space-x-2 space-x-reverse">
        <button
          onClick={() => {
            setSelecting(null);
            onClose();
          }}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          إلغاء
        </button>
        
        {startDate && endDate && (
          <button
            onClick={() => {
              setSelecting(null);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            تأكيد
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeCalendar;
