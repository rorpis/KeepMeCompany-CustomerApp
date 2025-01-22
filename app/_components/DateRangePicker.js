import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selecting, setSelecting] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Add event listener when the picker is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateClick = (clickedDate) => {
    if (!clickedDate) return;

    try {
      // Create a date at noon to avoid timezone issues
      const selectedDate = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        clickedDate.getDate(),
        12, 0, 0, 0
      );

      if (!selecting) {
        // First click - set start date
        setSelecting(true);
        if (onStartDateChange) onStartDateChange(selectedDate);
        if (onEndDateChange) onEndDateChange(null);
      } else {
        // Second click - set end date
        setSelecting(false);
        if (startDate && selectedDate < startDate) {
          // If clicking before start date, swap them
          if (onEndDateChange) onEndDateChange(startDate);
          if (onStartDateChange) onStartDateChange(selectedDate);
        } else {
          if (onEndDateChange) onEndDateChange(selectedDate);
        }
      }
    } catch (error) {
      console.error('Error handling date selection:', error);
    }
  };

  const generateDates = (baseDate) => {
    const dates = [];
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    // Get the day of week (0-6), convert Sunday (0) to 7 to handle Monday start
    const dayOfWeek = start.getDay() || 7;
    // Adjust to start from Monday by subtracting (dayOfWeek - 1) days
    start.setDate(start.getDate() - (dayOfWeek - 1));

    for (let i = 0; i < 35; i++) {
      dates.push(new Date(start.getTime()));
      start.setDate(start.getDate() + 1);
    }
    return dates;
  };

  const isInRange = (date) => {
    if (!startDate || !date) return false;
    
    const compareDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0, 0
    ).getTime();
    
    const startCompare = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate(),
      12, 0, 0, 0
    ).getTime();
    
    if (!endDate) {
      return compareDate === startCompare;
    }
    
    const endCompare = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      12, 0, 0, 0
    ).getTime();
    
    return compareDate >= startCompare && compareDate <= endCompare;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    // Use the current language for date formatting
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const dates = generateDates(currentMonth);

  const weekDays = language === 'es' 
    ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:border-blue-500 flex items-center gap-2"
      >
        <span>
          {formatDate(startDate)} {endDate ? `- ${formatDate(endDate)}` : selecting ? ` (${t('common.selectEndDate')})` : ''}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 w-[320px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(prev.getMonth() - 1);
                return newDate;
              })}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-700">
              {currentMonth.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            <button 
              onClick={() => setCurrentMonth(prev => {
                const newDate = new Date(prev);
                newDate.setMonth(prev.getMonth() + 1);
                return newDate;
              })}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 mb-2">
                {day}
              </div>
            ))}
            
            {generateDates(currentMonth).map((date, index) => {
              const isSelected = isInRange(date);
              const isStart = startDate && date.toDateString() === startDate.toDateString();
              const isEnd = endDate && date.toDateString() === endDate.toDateString();
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isCurrent = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    relative w-full h-10 flex items-center justify-center text-sm
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isSelected && !isStart && !isEnd ? 'bg-blue-50' : ''}
                    ${isStart ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isEnd ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${isSelected && !isStart && !isEnd ? 'hover:bg-blue-100' : 'hover:bg-gray-100'}
                    
                    // Add connecting background for range
                    ${isSelected && !isEnd ? 'border-r-0' : ''}
                    ${isSelected && !isStart ? 'border-l-0' : ''}
                    ${isStart ? 'rounded-l-full' : ''}
                    ${isEnd ? 'rounded-r-full' : ''}
                    
                    // Add continuous background between dates
                    ${isSelected && !isStart && !isEnd ? 'border-x-0' : ''}
                    ${isSelected ? 'relative' : ''}
                  `}
                >
                  {/* Add continuous background between dates */}
                  {isSelected && !isStart && !isEnd && (
                    <div className="absolute inset-0 bg-blue-50" />
                  )}
                  
                  {/* Date number */}
                  <span className={`
                    relative z-10
                    ${isStart || isEnd ? 'font-semibold' : ''}
                    ${isCurrent ? 'font-bold' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 