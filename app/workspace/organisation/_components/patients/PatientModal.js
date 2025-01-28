import { useState } from 'react';
import { X, Plus, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { SecondaryButton, ActiveButton } from '@/app/_components/global_components';

export const PatientModal = ({ 
  patient, 
  onSave, 
  onClose, 
  isEditing, 
  isLoading,
  existingFields = [] 
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

  // Internal fields that shouldn't be shown or edited
  const internalFields = ['id', 'lastScheduled'];

  // Required fields first with translations
  const dbAttributes = [
    { 
      value: 'customerName', 
      label: t('workspace.organisation.patientList.fields.firstName'), 
      required: true,
      type: 'text'
    },
    { 
      value: 'dateOfBirth', 
      label: t('workspace.organisation.patientList.fields.dateOfBirth'), 
      required: true,
      type: 'date'
    },
    { 
      value: 'phoneNumber', 
      label: t('workspace.organisation.patientList.fields.phoneNumber'), 
      required: true,
      type: 'tel'
    }
  ];

  // Get existing custom fields from all patients
  const existingCustomAttributes = existingFields
    .filter(field => !internalFields.includes(field))
    .filter(field => !dbAttributes.find(attr => attr.value === field))
    .map(field => ({
      value: field,
      label: field,
      isCustom: true,
      type: 'text'
    }));

  // Initialize mappings with required fields and any existing patient data
  const initialMappings = dbAttributes.map(attr => ({
    value: attr.type === 'date' ? formatDateForInput(patient?.[attr.value]) : (patient?.[attr.value] || ''),
    dbAttribute: attr.value,
    isRequired: attr.required,
    label: attr.label,
    type: attr.type,
    isCustom: false
  }));

  // Add any custom fields that the patient already has, excluding internal fields
  if (isEditing) {
    Object.entries(patient || {}).forEach(([key, value]) => {
      if (!dbAttributes.find(attr => attr.value === key) && 
          !internalFields.includes(key) && 
          value) {
        initialMappings.push({
          value: value,
          dbAttribute: key,
          isRequired: false,
          label: key,
          type: 'text',
          isCustom: true
        });
      }
    });
  }

  const [mappings, setMappings] = useState(initialMappings);
  const [customProperties, setCustomProperties] = useState(existingCustomAttributes);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');

  // Available attributes are non-required fields that aren't already in mappings
  const availableAttributes = [
    ...dbAttributes.filter(attr => !attr.required),
    ...existingCustomAttributes
  ];
  const usedAttributes = new Set(mappings.map(m => m.dbAttribute));
  const unusedAttributes = availableAttributes.filter(attr => 
    !usedAttributes.has(attr.value) && !internalFields.includes(attr.value)
  );

  const addNewMapping = (attribute) => {
    setMappings([...mappings, {
      value: '',
      dbAttribute: attribute.value,
      isRequired: false,
      label: attribute.label,
      type: attribute.type || 'text',
      isCustom: attribute.isCustom || false
    }]);
  };

  const handleNewProperty = () => {
    if (newPropertyName.trim()) {
      // Check if the new property name is not an internal field
      if (internalFields.includes(newPropertyName.trim())) {
        return;
      }
      
      const newProperty = {
        value: newPropertyName,
        label: newPropertyName,
        isCustom: true,
        type: 'text'
      };
      setCustomProperties([...customProperties, newProperty]);
      addNewMapping(newProperty);
      setNewPropertyName('');
      setIsCreatingNew(false);
    }
  };

  const handleSave = () => {
    const formData = {};
    mappings.forEach(mapping => {
      if (mapping.value.trim()) {
        // Format date before saving
        formData[mapping.dbAttribute] = mapping.type === 'date' 
          ? formatDateForSave(mapping.value)
          : mapping.value.trim();
      }
    });

    // If we're editing, preserve the original patient's ID
    if (isEditing && patient?.id) {
      formData.id = patient.id;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-bg-elevated rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-text-primary">
            {isEditing 
              ? t('workspace.organisation.patientList.patientModal.editTitle')
              : t('workspace.organisation.patientList.patientModal.addTitle')}
          </h1>
        </div>

        <div className="space-y-4">
          {mappings.map((mapping, index) => (
            <div key={index} className="flex items-center space-x-3">
              {mapping.isRequired ? (
                <div className="flex-1">
                  <div className="w-full p-3 rounded-lg bg-bg-secondary border border-primary-blue/20">
                    {mapping.label} (Required)
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="w-full p-3 rounded-lg bg-bg-secondary border border-border-main">
                    {mapping.label}
                  </div>
                </div>
              )}

              <ChevronRight size={20} className="text-text-secondary flex-shrink-0" />

              <div className="flex-1">
                <input
                  type={mapping.type}
                  value={mapping.value}
                  onChange={(e) => {
                    const newMappings = [...mappings];
                    newMappings[index].value = e.target.value;
                    setMappings(newMappings);
                  }}
                  className="w-full p-3 rounded-lg border border-border-main bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-primary"
                  required={mapping.isRequired}
                />
              </div>

              {!mapping.isRequired && (
                <button
                  onClick={() => {
                    const newMappings = mappings.filter((_, i) => i !== index);
                    setMappings(newMappings);
                  }}
                  className="p-2 text-text-secondary hover:text-text-primary"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          {unusedAttributes.length > 0 && (
            <>
              <h2 className="text-sm font-medium text-text-primary mb-4">
                {t('workspace.organisation.patientList.columnMapping.availableFields')}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {unusedAttributes.map((attr) => (
                  <button
                    key={attr.value}
                    onClick={() => addNewMapping(attr)}
                    className="p-3 text-left rounded-lg border border-border-main hover:border-primary-blue hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-primary"
                  >
                    {attr.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {isCreatingNew ? (
            <div className="mt-4 flex items-center space-x-3">
              <input
                type="text"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
                placeholder={t('workspace.organisation.patientList.columnMapping.newFieldPlaceholder')}
                className="flex-1 p-3 rounded-lg border border-border-main bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-primary"
                autoFocus
              />
              <button
                onClick={handleNewProperty}
                className="px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover"
              >
                {t('workspace.organisation.patientList.patientModal.buttons.add')}
              </button>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewPropertyName('');
                }}
                className="p-2 text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingNew(true)}
              className={`w-full p-3 text-left rounded-lg border border-dashed border-border-main hover:border-primary-blue hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-secondary hover:text-primary-blue ${unusedAttributes.length > 0 ? 'mt-4' : ''}`}
            >
              <Plus size={20} className="inline mr-2" />
              {t('workspace.organisation.patientList.columnMapping.createNewField')}
            </button>
          )}
        </div>

        <div className="mt-8 flex justify-between border-t border-border-main pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-text-secondary hover:text-text-primary font-medium"
          >
            {t('workspace.organisation.patientList.patientModal.buttons.cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover disabled:bg-primary-blue/50 disabled:cursor-not-allowed font-medium"
            disabled={!mappings.every(m => m.isRequired ? m.value : true) || isLoading || isCreatingNew}
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
          </button>
        </div>
      </div>
    </div>
  );
}; 