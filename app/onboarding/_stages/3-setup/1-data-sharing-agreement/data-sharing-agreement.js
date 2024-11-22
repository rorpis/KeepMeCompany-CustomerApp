import { useState } from 'react';
import { FormField, ActiveButton, PopupMessage } from '@/app/_components/global_components';

export function DataSharingAgreement() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    // Basic validation
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.email) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show success message
    setShowPopup(true);
  };

  return (
    <div className="mx-auto flex gap-12">
      {showPopup && (
        <PopupMessage
          message="The agreement has been sent to your email for signing."
          type="success"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Left Section - Text Content */}
      <div className="flex-1 flex flex-col justify-center items-end text-right space-y-2">
        <h4 className="text-lg italic w-[80%] ml-auto">
          To access your patient data, we need to sign a Data Sharing Agreement that outlines our responsibilities with it.
        </h4>
        <p className="text-sm text-[var(--gray)]">
          <a 
            href="https://shine-galaxy-e28.notion.site/Privacy-Policy-10d288e561168082b48cce94ef79e3ca" 
            className="hover:underline italic"
            target="_blank"
            rel="noopener noreferrer"
          >
            See our Privacy Policy here
          </a>
        </p>
      </div>

      {/* Right Section - Form Fields and Button */}
      <div className="flex-1 flex flex-col items-center">
        {/* Form Fields with reduced spacing */}
        <div className="flex flex-col gap-2 w-[80%]">
          <FormField
            name="name"
            label="Name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter DPO name"
          />

          <FormField
            name="phone"
            label="Phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter phone number"
          />

          <FormField
            name="email"
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter email address"
          />
        </div>

        {/* Submit Section with reduced top spacing */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <p className="text-sm">I confirm this information is accurate.</p>
          <ActiveButton onClick={handleSubmit}>
            Submit Information
          </ActiveButton>
        </div>
      </div>
    </div>
  );
}