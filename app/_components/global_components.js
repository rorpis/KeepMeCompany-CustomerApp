import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

export function ActiveButton({ onClick, children, type = "button", ...props }) {
  return (
    <button 
      onClick={onClick}
      type={type}
      {...props}
      className="px-4 py-2 bg-[var(--primary-blue)] hover:bg-[var(--primary-blue-hover)] text-white font-bold rounded transition-colors duration-200"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ onClick, children, type = "button", ...props }) {
    return (
      <button 
        onClick={onClick}
        type={type}
        {...props}
        className="px-4 py-2 border border-[var(--gray)] text-[var(--gray)] hover:bg-[var(--gray)] hover:text-black font-bold rounded transition-colors duration-200"
      >
        {children}
      </button>
    );
  }

export function FormField({
    label,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    placeholder = '',
    disabled = false,
    name,
    step = 1,
    options = []
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
  
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
  
        <div className="relative">
          {type === 'select' ? (
            <select
              value={value}
              onChange={onChange}
              disabled={disabled}
              name={name}
              className={`
                w-full p-2 rounded
                bg-transparent
                border ${error ? 'border-red-500' : 'border-[var(--gray)]'}
                text-[var(--foreground)]
                focus:outline-none focus:border-[var(--primary-blue)]
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <option value="" disabled>{placeholder || 'Select an option'}</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={isPassword ? (showPassword ? 'text' : 'password') : type}
              value={value}
              onChange={onChange}
              disabled={disabled}
              placeholder={placeholder}
              name={name}
              step={step}
              className={`
                w-full p-2 rounded
                bg-transparent
                border ${error ? 'border-red-500' : 'border-[var(--gray)]'}
                text-[var(--foreground)]
                placeholder:text-[var(--gray)]
                focus:outline-none focus:border-[var(--primary-blue)]
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isPassword ? 'pr-10' : ''}
              `}
            />
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gray)] hover:text-[var(--foreground)] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
  
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
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
