import { useState, useCallback } from 'react';
import { FormField } from '@/app/_components/FormComponents';
import { ConditionalButton } from '@/app/_components/global_components';

export function DataSharingAgreement({ 
  data = { name: '', phone: '', email: '' }, 
  updateData, 
  onComplete,
  onShowPopup 
}) {
  const [errors, setErrors] = useState({});
  const [formValidation, setFormValidation] = useState({
    name: { isValid: false, error: '' },
    phone: { isValid: false, error: '' },
    email: { isValid: false, error: '' }
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, [data, updateData]);

  const handleValidation = useCallback((fieldName, isValid, error) => {
    setFormValidation(prev => ({
      ...prev,
      [fieldName]: { isValid, error }
    }));
  }, []);

  const handleSubmit = () => {
    const isFormValid = Object.values(formValidation).every(field => field.isValid);
    
    if (isFormValid) {
      onShowPopup("The document was sent to your email to sign digitally");
      onComplete?.();
    } else {
      const newErrors = {};
      Object.entries(formValidation).forEach(([fieldName, validation]) => {
        if (!validation.isValid) {
          newErrors[fieldName] = validation.error;
        }
      });
      setErrors(newErrors);
    }
  };

  return (
    <div className="mx-auto flex gap-12 items-center">
      {/* Right Section - Form Fields and Button */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col gap-2 w-[50%]">
          <FormField
            name="name"
            label="Name"
            type="text"
            required
            value={data.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter DPO name"
            onValidation={handleValidation}
          />

          <FormField
            name="phone"
            label="Phone"
            type="tel"
            required
            value={data.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter phone number"
            onValidation={handleValidation}
          />

          <FormField
            name="email"
            label="Email"
            type="email"
            required
            value={data.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter email address"
            onValidation={handleValidation}
          />
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <ConditionalButton
            onClick={handleSubmit}
            conditions={[
              { check: !!data.name, message: 'Name is required' },
              { check: !!data.phone, message: 'Phone number is required' },
              { check: !!data.email, message: 'Email is required' }
            ]}
            formValidation={formValidation}
          >
            Submit Information
          </ConditionalButton>
        </div>
      </div>
    </div>
  );
}