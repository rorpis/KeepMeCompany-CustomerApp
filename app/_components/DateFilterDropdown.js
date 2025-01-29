import { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import SingleDatePicker from './SingleDatePicker';

export const DateFilterDropdown = ({ 
  onFilterChange,
  buttonClassName,
  dropdownClassName,
  isLastColumn
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState('right');

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  const handleDateChange = (type, date) => {
    const newRange = { ...dateRange };
    if (type === 'start') {
      newRange.start = date;
    } else if (type === 'end') {
      newRange.end = date;
    }
    setDateRange(newRange);
    
    if (type === 'start') {
      onFilterChange({ type: 'from', start: date, end: null });
    } else if (type === 'end') {
      onFilterChange({ type: 'until', start: null, end: date });
    }
  };

  const handleClear = () => {
    setDateRange({ start: null, end: null });
    onFilterChange(null);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!isOpen && dropdownRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const tableElement = dropdownRef.current.closest('.overflow-x-auto'); // Find the table container
      
      if (tableElement) {
        const tableRect = tableElement.getBoundingClientRect();
        const spaceOnRight = tableRect.right - dropdownRect.right;
        
        // Check if dropdown would overflow the table
        if (spaceOnRight < 250) { // 250px is our dropdown width
          setDropdownPosition('left');
        } else {
          setDropdownPosition('right');
        }
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:text-text-secondary border border-border-main rounded-lg ${buttonClassName}`}
      >
        <Filter size={14} className="text-gray-400"/>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className={`absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-[250px] ${
          isLastColumn ? 'right-full mr-2' : 'left-0'
        } ${dropdownClassName}`}>
          <div className="p-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workspace.patientList.table.filters.from')}
                </label>
                <SingleDatePicker
                  selectedDate={dateRange.start}
                  onDateChange={(date) => handleDateChange('start', date)}
                  isLastColumn={isLastColumn}
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('workspace.patientList.table.filters.until')}
                </label>
                <SingleDatePicker
                  selectedDate={dateRange.end}
                  onDateChange={(date) => handleDateChange('end', date)}
                  isLastColumn={isLastColumn}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 my-1"></div>
            <button
              onClick={handleClear}
              className="w-full text-center px-3 py-2 rounded text-red-600 hover:bg-red-50"
            >
              {t('workspace.patientList.table.filters.clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};