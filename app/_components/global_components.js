import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export function ActiveButton({ onClick, children }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white font-bold rounded transition-all duration-300 ease-in-out"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ onClick, children }) {
    return (
      <button 
        onClick={onClick}
        className="px-4 py-2 border border-[var(--gray)] text-[var(--gray)] hover:bg-[var(--gray)] hover:text-black font-bold rounded transition-all duration-300 ease-in-out"
      >
        {children}
      </button>
    );
  }

export function ConditionalButton({ 
    onClick,
    children,
    conditions = [],
    disabled = false
}) {
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const allConditionsMet = conditions.length === 0 || conditions.every(c => c.check);

    const handleClick = () => {
        if (conditions.length > 0) {
          const failedCondition = conditions.find(c => !c.check);
          if (failedCondition) {
              setErrorMessage(failedCondition.message);
              setShowError(true);
              setTimeout(() => setShowError(false), 3000);
              return;
          }
        }
        if (typeof onClick === 'function') {
            onClick();
        }
    };

    return (
      <div className="relative">
        <button 
          onClick={handleClick}
          disabled={disabled}
          className={`
            px-4 py-2 rounded font-bold
            transition-all duration-700 ease-in-out
            ${allConditionsMet 
              ? 'bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white border-transparent' 
              : 'border border-[var(--gray)] text-[var(--gray)] hover:bg-[var(--gray)] hover:text-black'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {children}
        </button>
  
        {showError && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-red-500 text-white rounded text-sm whitespace-nowrap animate-fade-in">
            {errorMessage}
          </div>
        )}
      </div>
    );
}
  
export function PopupMessage({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`
      fixed top-4 right-4 
      ${colors[type]} text-white 
      px-6 py-3 
      rounded shadow-lg
      flex items-center gap-2
      animate-fade-in
    `}>
      {message}
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="hover:opacity-80"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function HoverTooltip({ children, content, width = 'w-64', position = 'center' }) {
  const positionClasses = {
    center: '-translate-x-1/2 left-1/2',
    left: '-translate-x-full left-1/2',
    right: 'translate-x-0 left-0'
  };

  return (
    <div className="group relative">
      {children}
      <div className={`
        invisible group-hover:visible 
        opacity-0 group-hover:opacity-100 
        transition-opacity
        absolute z-10 
        ${width}
        p-4 mt-2
        bg-gray-700 text-white 
        rounded-lg shadow-lg
        ${positionClasses[position]}
        text-left
      `}>
        {content}
      </div>
    </div>
  );
}


