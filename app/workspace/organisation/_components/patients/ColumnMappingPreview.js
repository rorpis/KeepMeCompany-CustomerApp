import { useState } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';

export default function ColumnMappingPreview({ csvColumns, onCancel, onContinue, existingFields = [] }) {
  const { t } = useLanguage();
  
  // Required fields first with translations
  const dbAttributes = [
    { 
      value: 'customerName', 
      label: t('workspace.organisation.patientList.fields.firstName'), 
      required: true 
    },
    { 
      value: 'dateOfBirth', 
      label: t('workspace.organisation.patientList.fields.dateOfBirth'), 
      required: true 
    },
    { 
      value: 'phoneNumber', 
      label: t('workspace.organisation.patientList.fields.phoneNumber'), 
      required: true 
    }
  ];

  const existingCustomAttributes = existingFields.map(field => ({
    value: field,
    label: field,
    isCustom: true
  }));

  const initialMappings = dbAttributes
    .filter(attr => attr.required)
    .map(attr => ({
      csvColumn: '',
      dbAttribute: attr.value,
      isRequired: true,
      label: attr.label,
      isCustom: false
    }));

  const [mappings, setMappings] = useState(initialMappings);
  const [customProperties, setCustomProperties] = useState(existingCustomAttributes);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');

  const availableAttributes = [
    ...dbAttributes.filter(attr => !attr.required),
    ...customProperties
  ];
  const usedAttributes = new Set(mappings.map(m => m.dbAttribute));
  const unusedAttributes = availableAttributes.filter(attr => !usedAttributes.has(attr.value));

  const addNewMapping = (attribute) => {
    setMappings([...mappings, {
      csvColumn: '',
      dbAttribute: attribute.value,
      isRequired: false,
      label: attribute.label,
      isCustom: attribute.isCustom || false
    }]);
  };

  const handleNewProperty = () => {
    if (newPropertyName.trim()) {
      const newProperty = {
        value: newPropertyName,
        label: newPropertyName,
        isCustom: true
      };
      setCustomProperties([...customProperties, newProperty]);
      setNewPropertyName('');
      setIsCreatingNew(false);
    }
  };

  const handleContinue = () => {
    const mappingResult = {};
    mappings.forEach(mapping => {
      if (mapping.csvColumn && mapping.dbAttribute !== 'dontImport') {
        mappingResult[mapping.dbAttribute] = mapping.csvColumn;
      }
    });
    onContinue(mappingResult);
  };

  return (
    <div className="w-full max-w-2xl bg-bg-elevated rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">
          {t('workspace.organisation.patientList.columnMapping.title')}
        </h1>
        <p className="text-sm text-text-secondary mt-2">
          {t('workspace.organisation.patientList.columnMapping.description')}
        </p>
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
              <select
                value={mapping.csvColumn}
                onChange={(e) => {
                  const newMappings = [...mappings];
                  newMappings[index].csvColumn = e.target.value;
                  setMappings(newMappings);
                }}
                className="w-full p-3 rounded-lg border border-border-main bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-primary"
              >
                <option value="">
                  {t('workspace.organisation.patientList.columnMapping.selectColumn')}
                </option>
                {csvColumns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
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
              placeholder="Enter new property name"
              className="flex-1 p-3 rounded-lg border border-border-main bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-primary"
              autoFocus
            />
            <button
              onClick={handleNewProperty}
              className="px-4 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover"
            >
              Add
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
          onClick={onCancel}
          className="px-6 py-2 text-text-secondary hover:text-text-primary font-medium"
        >
          {t('workspace.organisation.patientList.columnMapping.cancel')}
        </button>
        <button 
          onClick={handleContinue}
          className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover disabled:bg-primary-blue/50 disabled:cursor-not-allowed font-medium"
          disabled={!mappings.every(m => m.csvColumn && m.dbAttribute) || isCreatingNew}
        >
          {t('workspace.organisation.patientList.columnMapping.continue')}
        </button>
      </div>
    </div>
  );
} 