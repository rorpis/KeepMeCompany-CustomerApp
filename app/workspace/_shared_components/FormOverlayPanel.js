import { useEffect } from 'react';
import { SecondaryButton, ConditionalButton } from '@/app/_components/global_components';

export function FormOverlayPanel({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveButtonText = 'Save Changes',
  saveConditions = [],
  width = 'w-[400px]'
}) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`bg-[var(--background)] p-6 rounded-lg ${width}`}>
        <h3 className="text-xl mb-4">{title}</h3>
        
        {children}

        <div className="flex justify-end gap-4 mt-6">
          <SecondaryButton onClick={onClose}>
            Cancel
          </SecondaryButton>
          <ConditionalButton
            onClick={onSave}
            conditions={saveConditions}
          >
            {saveButtonText}
          </ConditionalButton>
        </div>
      </div>
    </div>
  );
} 