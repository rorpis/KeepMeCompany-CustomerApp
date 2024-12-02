import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Form management logic
const useFormValidation = (customValidate) => {
  const validateField = (value, type, required, label) => {
    // If there's a custom validation function, use it first
    if (customValidate) {
      const customResult = customValidate(value);
      if (customResult.error) return customResult;
    }

    // Default validations
    if (required && !value?.trim()) {
      return { isValid: false, error: `${label} is required` };
    }

    switch (type) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
        break;
      case 'password':
        if (value && value.length < 8) {
          return { isValid: false, error: 'Password must be at least 8 characters' };
        }
        break;
    }

    return { isValid: true, error: '' };
  };

  return { validateField };
};

// FormField Component
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
    validate, // Custom validation function
    onValidation,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const { validateField } = useFormValidation(validate);

    const handleValidation = (value) => {
        if (onValidation) {
            const result = validateField(value, type, required, label);
            onValidation(name, result.isValid, result.error);
        }
    };

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
        handleValidation(e.target.value);
    };

    const handleBlur = (e) => {
        handleValidation(e.target.value);
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type={isPassword ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    placeholder={placeholder}
                    name={name}
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
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}

// Add this new validation function
export const validateNHSEmail = (email) => {
  if (!email) return { isValid: false, error: 'Email is required' };
  if (!email.includes('@')) return { isValid: false, error: 'Please enter a valid NHS email address' };
  
  const nhsEmailRegex = /@(nhs\.(uk|net)|[a-zA-Z0-9-]+\.nhs\.uk)$/i;
  if (!nhsEmailRegex.test(email)) {
    return { isValid: false, error: 'Must be an NHS email address (e.g., name@nhs.uk)' };
  }
  
  return { isValid: true, error: '' };
};
