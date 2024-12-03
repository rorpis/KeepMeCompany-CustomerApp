import React, { useState, useEffect } from 'react';

const TwoWeekCalendar = () => {
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [calendarDays, setCalendarDays] = useState([]);
  
  useEffect(() => {
    const generateTwoWeeks = () => {
      const days = [];
      const today = new Date();
      
      // Start from today
      for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push({
          date: date,
          dayOfMonth: date.getDate(),
          dayOfWeek: date.toLocaleString('en-US', { weekday: 'short' }),
          isToday: i === 0
        });
      }
      return days;
    };
    
    setCalendarDays(generateTwoWeeks());
  }, []);

  const toggleDate = (date) => {
    const dateStr = date.toDateString();
    const newSelected = new Set(selectedDates);
    
    if (newSelected.has(dateStr)) {
      newSelected.delete(dateStr);
    } else {
      newSelected.add(dateStr);
    }
    
    setSelectedDates(newSelected);
  };

  const handleStartFollowUps = () => {
    // Convert Set to Array of dates for easier backend processing
    const selectedDatesArray = Array.from(selectedDates);
    console.log('Selected dates for follow-ups:', selectedDatesArray);
    
    // Here you would typically send this to your backend
    // For example:
    // await axios.post('/api/follow-ups', { dates: selectedDatesArray });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">
          {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
        </h2>
      </div>
      
      <div className="grid grid-cols-7 gap-4 mb-8">
        {/* Day headers */}
        {calendarDays.slice(0, 7).map((day, index) => (
          <div key={`header-${index}`} className="text-center text-gray-500 font-medium">
            {day.dayOfWeek}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => toggleDate(day.date)}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-lg
              transition-colors duration-200 relative
              ${selectedDates.has(day.date.toDateString())
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

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleStartFollowUps}
          className={`
            px-6 py-3 rounded-lg bg-blue-600 text-white font-medium
            transition-colors duration-200
            ${selectedDates.size > 0 
              ? 'hover:bg-blue-700' 
              : 'opacity-50 cursor-not-allowed'
            }
          `}
          disabled={selectedDates.size === 0}
        >
          Start Follow-Ups ({selectedDates.size} dates selected)
        </button>
      </div>
    </div>
  );
};

export default TwoWeekCalendar;