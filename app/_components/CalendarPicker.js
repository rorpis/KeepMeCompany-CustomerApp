import React, { useState, useEffect } from 'react';

const TwoWeekCalendar = ({ onDatesSelect, selectedDates }) => {
  const [internalSelectedDates, setInternalSelectedDates] = useState(new Set(selectedDates));
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    setInternalSelectedDates(new Set(selectedDates));
  }, [selectedDates]);

  useEffect(() => {
    const generateTwoWeeks = () => {
      const days = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time part for proper date comparison
      
      // Find the most recent Monday (or today if it's Monday)
      const startDate = new Date(today);
      const daysSinceMonday = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
      startDate.setDate(startDate.getDate() - daysSinceMonday);
      
      // Generate 14 days starting from Monday
      for (let i = 0; i < 28; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({
          date: date,
          dayOfMonth: date.getDate(),
          dayOfWeek: date.toLocaleString('en-US', { weekday: 'short' }),
          isToday: date.getTime() === today.getTime(),
          isPast: date < today
        });
      }
      return days;
    };
    
    setCalendarDays(generateTwoWeeks());
  }, []);

  const toggleDate = (date) => {
    // Don't allow selecting past dates
    if (date < new Date().setHours(0, 0, 0, 0)) return;

    const dateStr = date.toDateString();
    const newSelected = new Set(internalSelectedDates);
    
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    
    setInternalSelectedDates(newSelected);
    if (onDatesSelect) onDatesSelect(newSelected);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">
          {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
        </h2>
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {/* Day headers - Starting with Monday */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
          <div key={`header-${index}`} className="text-center text-gray-500 font-medium">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => toggleDate(day.date)}
            disabled={day.isPast}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg
              transition-colors duration-200 relative
              ${day.isPast 
                ? 'text-gray-300 cursor-not-allowed' 
                : internalSelectedDates.has(day.date.toDateString())
                  ? 'text-black ring-2 ring-red-400 bg-red-100'
                  : 'hover:bg-gray-100'
              }
              ${day.isToday 
                ? 'ring-2 ring-blue-400 font-bold' 
                : ''
              }
            `}
          >
            {day.dayOfMonth}
            {day.isToday && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <span className="text-xs text-blue-600 font-medium">Today</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TwoWeekCalendar;