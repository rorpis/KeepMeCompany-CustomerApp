import { useState } from 'react';
import { FormField, ActiveButton, PopupMessage, SecondaryButton } from '@/app/_components/global_components';

export default function Register({ data = { name: '', email: '', password: '' }, updateData }) {
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCreateAccount = () => {
    // Basic validation
    const newErrors = {};
    if (!data.name?.trim()) newErrors.name = 'Name is required';
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!data.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (data.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Proceed with account creation
    setShowPopup(true);
  };

  return (
    <div className="w-[60%] mx-auto p-10">
      {showPopup && (
        <PopupMessage
          message="We've sent you a link to verify your email"
          type="success"
          onClose={() => setShowPopup(false)}
        />
      )}

      <FormField
        name="name"
        label="Name"
        type="text"
        required
        value={data.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Enter your name"
      />

      <FormField
        name="email"
        label="Email"
        type="email"
        required
        value={data.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Enter your email"
      />

      <FormField
        name="password"
        label="Password"
        type="password"
        required
        value={data.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Enter your password"
      />

      <div className="mt-6 flex justify-center">
        {!data.name || !data.email || !data.password ? (
          <SecondaryButton 
            onClick={handleCreateAccount}
            disabled={true}
          >
            Create Account
          </SecondaryButton>
        ) : (
          <ActiveButton 
            onClick={handleCreateAccount}
          >
            Create Account
          </ActiveButton>
        )}
      </div>
    </div>
  );
}