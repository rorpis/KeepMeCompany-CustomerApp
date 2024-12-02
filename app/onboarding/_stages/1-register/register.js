import { useState, useCallback } from 'react';
import { FormField, validateNHSEmail } from '@/app/_components/FormComponents';
import { ConditionalButton } from '@/app/_components/global_components';

export default function Register({ data = { name: '', email: '', password: '' }, updateData, onNext }) {
  const [errors, setErrors] = useState({});
  const [formValidation, setFormValidation] = useState({
    name: { isValid: false, error: '' },
    email: { isValid: false, error: '' },
    password: { isValid: false, error: '' }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleValidation = useCallback((fieldName, isValid, error) => {
    setFormValidation(prev => ({
      ...prev,
      [fieldName]: { isValid, error }
    }));
  }, []);

  return (
    <div className="w-[60%] mx-auto p-10">
      <div className="space-y-4">
        <div>
          <FormField
            name="name"
            label="Name"
            type="text"
            required
            value={data.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your name"
            onValidation={handleValidation}
          />
          {formValidation.name.error && (
            <p className="text-red-500 text-sm mt-1 ml-1">{formValidation.name.error}</p>
          )}
        </div>

        <div>
          <FormField
            name="email"
            label="NHS Email"
            type="email"
            required
            value={data.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your NHS email"
            onValidation={handleValidation}
            validate={validateNHSEmail}
          />
          {formValidation.email.error && (
            <p className="text-red-500 text-sm mt-1 ml-1">{formValidation.email.error}</p>
          )}
        </div>

        <div>
          <FormField
            name="password"
            label="Password"
            type="password"
            required
            value={data.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            onValidation={handleValidation}
          />
          {formValidation.password.error && (
            <p className="text-red-500 text-sm mt-1 ml-1">{formValidation.password.error}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <ConditionalButton
          onClick={onNext}
          conditions={[
            { 
              check: formValidation.name.isValid && 
                     formValidation.email.isValid && 
                     formValidation.password.isValid,
              message: null
            }
          ]}
          formValidation={formValidation}
        >
          Create Account
        </ConditionalButton>
      </div>
    </div>
  );
}