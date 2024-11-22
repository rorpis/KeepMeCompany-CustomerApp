import { useState } from 'react';
import { FormField } from '@/app/_components/global_components';

export default function PracticeDetails({ data = { practiceName: '', practiceSize: '', practiceAddress: '' }, updateData }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="w-[60%] mx-auto p-6">
      <FormField
        name="practiceName"
        label="Practice Name"
        type="text"
        required
        value={data.practiceName}
        onChange={handleChange}
        error={errors.practiceName}
        placeholder="Enter practice name"
      />

      <FormField
        name="role"
        label="Your Role"
        type="select" 
        required
        value={data.role}
        onChange={handleChange}
        error={errors.role}
        options={[
          { value: 'gp-partner', label: 'GP Partner' },
          { value: 'practice-manager', label: 'Practice Manager' },
          { value: 'reception-staff', label: 'Reception Staff' },
          { value: 'other', label: 'Other' }
        ]}
      />

      <FormField
        name="practiceSize"
        label="Practice Size (# of Patients)"
        type="number"
        required={false}
        value={data.practiceSize}
        onChange={handleChange}
        error={errors.practiceSize}
        placeholder="Enter number of patients"
        step="1000"
      />

      <FormField
        name="practiceAddress"
        label="Practice Address"
        type="text"
        required={false}
        value={data.practiceAddress}
        onChange={handleChange}
        error={errors.practiceAddress}
        placeholder="Enter practice address"
      />
    </div>
  );
}