import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const SingleDatePicker = ({ selectedDate, onDateChange, isLastColumn }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('date');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateClick = (clickedDate) => {
    if (!clickedDate) return;

    try {
      const selected = new Date(
        clickedDate.getFullYear(),
        clickedDate.getMonth(),
        clickedDate.getDate(),
        12, 0, 0, 0
      );
      onDateChange(selected);
      setIsOpen(false);
    } catch (error) {
      console.error('Error handling date selection:', error);
    }
  };

  const generateDates = (baseDate) => {
    const dates = [];
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const dayOfWeek = start.getDay() || 7;
    start.setDate(start.getDate() - (dayOfWeek - 1));

    for (let i = 0; i < 35; i++) {
      dates.push(new Date(start.getTime()));
      start.setDate(start.getDate() + 1);
    }
    return dates;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const weekDays = language === 'es' 
    ? ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const months = language === 'es'
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleMonthSelect = (monthIndex) => {
    const newDate = new Date(currentMonth.setMonth(monthIndex));
    setCurrentMonth(newDate);
    setView('date');
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(currentMonth.setFullYear(year));
    setCurrentMonth(newDate);
    setView('month');
  };

  const generateYearGrid = () => {
    const currentYear = currentMonth.getFullYear();
    const startYear = currentYear - 6;
    const years = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-2">
      <button 
        onClick={() => {
          if (view === 'date') {
            setCurrentMonth(prev => {
              const newDate = new Date(prev);
              newDate.setMonth(prev.getMonth() - 1);
              return newDate;
            });
          } else if (view === 'year') {
            setCurrentMonth(prev => {
              const newDate = new Date(prev);
              newDate.setFullYear(prev.getFullYear() - 12);
              return newDate;
            });
          }
        }}
        className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => setView(view === 'date' ? 'month' : 'year')}
        className="text-sm font-semibold text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
      >
        {view === 'year' 
          ? `${currentMonth.getFullYear() - 6} - ${currentMonth.getFullYear() + 5}`
          : view === 'month'
            ? currentMonth.getFullYear()
            : currentMonth.toLocaleString(language === 'es' ? 'es-ES' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
              })
        }
      </button>

      <button 
        onClick={() => {
          if (view === 'date') {
            setCurrentMonth(prev => {
              const newDate = new Date(prev);
              newDate.setMonth(prev.getMonth() + 1);
              return newDate;
            });
          } else if (view === 'year') {
            setCurrentMonth(prev => {
              const newDate = new Date(prev);
              newDate.setFullYear(prev.getFullYear() + 12);
              return newDate;
            });
          }
        }}
        className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-3 gap-2">
      {months.map((month, index) => (
        <button
          key={month}
          onClick={() => handleMonthSelect(index)}
          className={`
            p-2 text-sm rounded
            ${currentMonth.getMonth() === index ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
          `}
        >
          {month.slice(0, 3)}
        </button>
      ))}
    </div>
  );

  const renderYearView = () => (
    <div className="grid grid-cols-3 gap-2">
      {generateYearGrid().map((year) => (
        <button
          key={year}
          onClick={() => handleYearSelect(year)}
          className={`
            p-2 text-sm rounded
            ${currentMonth.getFullYear() === year ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
          `}
        >
          {year}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-sm text-left border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {selectedDate ? formatDate(selectedDate) : '-'}
      </button>

      {isOpen && (
        <div className={`absolute mt-1 bg-white rounded-lg shadow-lg z-50 w-[250px] ${
          isLastColumn ? 'right-0' : 'left-0'
        }`}>
          <div className="p-2">
            {renderHeader()}
            
            {view === 'date' && (
              <div className="grid grid-cols-7 gap-0">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 mb-1">
                    {day}
                  </div>
                ))}
                
                {generateDates(currentMonth).map((date, index) => {
                  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                  const isCurrent = isToday(date);
                  const dateSelected = isSelected(date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`
                        relative w-full h-7 flex items-center justify-center text-xs
                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                        ${dateSelected ? 'bg-blue-500 text-white hover:bg-blue-600 rounded-full' : 'hover:bg-gray-100'}
                        ${isCurrent ? 'font-bold' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            )}
            
            {view === 'month' && renderMonthView()}
            {view === 'year' && renderYearView()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleDatePicker; 