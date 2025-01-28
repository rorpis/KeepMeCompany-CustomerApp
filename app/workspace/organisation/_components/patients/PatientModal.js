import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { SecondaryButton, ActiveButton } from '@/app/_components/global_components';

export const PatientModal = ({ 
  patient, 
  onSave, 
  onClose, 
  isEditing, 
  isLoading 
}) => {
  const { t } = useLanguage();

  // Format incoming date to YYYY-MM-DD for input element
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Handle mm/dd/yyyy format
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return dateString;
  };

  // Format date to mm/dd/yyyy for saving
  const formatDateForSave = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const [formData, setFormData] = useState({
    customerName: patient?.customerName || '',
    dateOfBirth: formatDateForInput(patient?.dateOfBirth) || '',
    phoneNumber: patient?.phoneNumber || ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-elevated rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            {isEditing 
              ? t('workspace.organisation.patientList.patientModal.editTitle')
              : t('workspace.organisation.patientList.patientModal.addTitle')}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('workspace.organisation.patientList.patientModal.fields.name')}
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                customerName: e.target.value
              }))}
              className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('workspace.organisation.patientList.patientModal.fields.dob')}
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dateOfBirth: e.target.value
              }))}
              className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              {t('workspace.organisation.patientList.patientModal.fields.phone')}
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                phoneNumber: e.target.value
              }))}
              className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <SecondaryButton onClick={onClose}>
            {t('workspace.organisation.patientList.patientModal.buttons.cancel')}
          </SecondaryButton>
          <ActiveButton
            onClick={() => {
              if (!formData.customerName || !formData.dateOfBirth) {
                alert(t('workspace.organisation.patientList.patientModal.errors.required'));
                return;
              }
              // Format the date before saving
              const formattedData = {
                ...formData,
                dateOfBirth: formatDateForSave(formData.dateOfBirth)
              };
              onSave(formattedData);
            }}
            disabled={!formData.customerName || !formData.dateOfBirth || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('workspace.organisation.patientList.patientModal.buttons.saving')}
              </div>
            ) : (
              isEditing ? 
                t('workspace.organisation.patientList.patientModal.buttons.save') : 
                t('workspace.organisation.patientList.patientModal.buttons.add')
            )}
          </ActiveButton>
        </div>
      </div>
    </div>
  );
}; 