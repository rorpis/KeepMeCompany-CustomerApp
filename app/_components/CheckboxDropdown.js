import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export const CheckboxDropdown = ({ 
  title,
  items,
  selectedItems,
  onItemToggle,
  onSelectAll,
  onDeselectAll,
  searchable = true,
  buttonClassName = '',
  dropdownClassName = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Store the complete list of items
  const allItems = useMemo(() => items, [items]);

  // Filter items only for display based on search
  const displayedItems = useMemo(() => {
    return searchQuery
      ? allItems.filter(item => 
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allItems;
  }, [allItems, searchQuery]);

  const allSelected = allItems.length === selectedItems.length;
  const someSelected = selectedItems.length > 0 && !allSelected;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:text-text-secondary border border-border-main rounded-lg ${buttonClassName}`}
      >
        {title}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className={`absolute mt-2 w-56 bg-white rounded-lg shadow-lg border border-border-main z-50 ${dropdownClassName}`}>
          <div className="p-2">
            {searchable && (
              <div className="px-3 py-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-2 py-1 text-sm border border-gray-200 rounded"
                  />
                </div>
              </div>
            )}
            
            <div className="px-3 py-2 border-b">
              <label className="flex items-center hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = someSelected;
                    }
                  }}
                  onChange={() => {
                    if (allSelected) {
                      onDeselectAll();
                    } else {
                      onSelectAll();
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">Select All</span>
              </label>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {displayedItems.map(item => (
                <label
                  key={item.value}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.value)}
                    onChange={() => onItemToggle(item.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 