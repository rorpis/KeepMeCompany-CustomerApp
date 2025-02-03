'use client';

import { useState, useRef, useEffect } from 'react';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import { SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';
import { PatientTable } from '@/app/_components/tables/PatientTable';
import { ChevronDown } from 'lucide-react';
import { isDateColumn, parseDate } from '@/app/_utils/dateUtils';

const callingCodes = [
  { country: 'UK', code: '44', iso2: 'GB' },
  { country: 'FR', code: '33', iso2: 'FR' },
  { country: 'DE', code: '49', iso2: 'DE' },
  { country: 'ES', code: '34', iso2: 'ES' },
  { country: 'CL', code: '56', iso2: 'CL' },
].map(item => ({
  ...item,
  label: `${item.country} (+${item.code})`
}));

const ColumnSelector = ({ 
  availableColumns, 
  selectedColumns, 
  onColumnToggle,
  standardFields 
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to get translated field name
  const getFieldLabel = (field) => {
    // Only translate standard fields and lastScheduled
    if (standardFields.includes(field)) {
      return t(`workspace.organisation.patientList.fields.${field}`);
    }
    if (field === 'lastScheduled') {
      return t('workspace.organisation.patientList.fields.lastScheduled');
    }
    // Return the actual field name for custom fields
    return field;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:text-text-secondary border border-border-main rounded-lg"
      >
        {t('workspace.remoteMonitoring.stepOne.fields.title')}
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border-main z-50">
          <div className="p-2">
            {availableColumns.map(column => (
              <label
                key={column}
                className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => onColumnToggle(column)}
                  disabled={standardFields.includes(column)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  {getFieldLabel(column)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StepOne = ({ 
  organisationDetails, 
  selectedPatients, 
  setSelectedPatients, 
  onNext 
}) => {
  const { t } = useLanguage();
  const [selectedCode, setSelectedCode] = useState('44');
  const [searchQuery, setSearchQuery] = useState('');
  const standardFields = ['customerName', 'dateOfBirth', 'phoneNumber'];
  const [visibleColumns, setVisibleColumns] = useState([...standardFields, 'lastScheduled']);
  const [columnFilters, setColumnFilters] = useState({});

  const getAllFields = () => {
    const internalFields = ['id'];
    const excludedFields = [...standardFields, ...internalFields];
    
    const allFields = new Set([...standardFields, 'lastScheduled']);
    
    organisationDetails?.patientList?.forEach(patient => {
      Object.keys(patient).forEach(field => {
        if (!excludedFields.includes(field)) {
          allFields.add(field);
        }
      });
    });
    
    return Array.from(allFields);
  };

  const handleColumnToggle = (column) => {
    setVisibleColumns(prev => 
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleColumnFilterChange = (field, values) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: values
    }));
  };

  const handlePatientSelect = (patientId) => {
    if (!patientId) return;

    const selectedPatientDetails = organisationDetails?.patientList?.find(
      patient => patient.id === patientId
    );

    const newSelectedPatients = new Map(selectedPatients);
    
    if (selectedPatients.has(patientId)) {
      newSelectedPatients.delete(patientId);
    } else {
      let phoneNumber = '';
      let countryCode = selectedCode;

      if (selectedPatientDetails?.phoneNumber) {
        const phoneStr = selectedPatientDetails.phoneNumber.replace(/\D/g, '');
        const matchedCode = callingCodes.find(code => phoneStr.startsWith(code.code));
        if (matchedCode) {
          countryCode = matchedCode.code;
          phoneNumber = phoneStr.substring(matchedCode.code.length);
        } else {
          phoneNumber = phoneStr;
        }
      }

      const countryIso2 = callingCodes.find(c => c.code === countryCode)?.iso2;
      const fullNumber = `+${countryCode}${phoneNumber}`;
      let isValid = false;
      try {
        const parsedPhoneNumber = parsePhoneNumberFromString(fullNumber, countryIso2);
        isValid = parsedPhoneNumber?.isValid() ?? false;
      } catch (error) {
        isValid = false;
      }

      newSelectedPatients.set(patientId, { phoneNumber, countryCode, isValid });
    }
    
    setSelectedPatients(newSelectedPatients);
  };

  const handleSelectAll = (patients) => {
    const newSelectedPatients = new Map(selectedPatients);
    
    const allSelected = patients.every(patient => 
      !patient.phoneNumber || selectedPatients.has(patient.id)
    );

    if (allSelected) {
      patients.forEach(patient => {
        newSelectedPatients.delete(patient.id);
      });
    } else {
      patients.forEach(patient => {
        if (patient.phoneNumber && !selectedPatients.has(patient.id)) {
          let phoneNumber = '';
          let countryCode = selectedCode;

          const phoneStr = patient.phoneNumber.replace(/\D/g, '');
          const matchedCode = callingCodes.find(code => phoneStr.startsWith(code.code));
          if (matchedCode) {
            countryCode = matchedCode.code;
            phoneNumber = phoneStr.substring(matchedCode.code.length);
          } else {
            phoneNumber = phoneStr;
          }

          const countryIso2 = callingCodes.find(c => c.code === countryCode)?.iso2;
          const fullNumber = `+${countryCode}${phoneNumber}`;
          let isValid = false;
          try {
            const parsedPhoneNumber = parsePhoneNumberFromString(fullNumber, countryIso2);
            isValid = parsedPhoneNumber?.isValid() ?? false;
          } catch (error) {
            isValid = false;
          }

          newSelectedPatients.set(patient.id, { phoneNumber, countryCode, isValid });
        }
      });
    }
    
    setSelectedPatients(newSelectedPatients);
  };

  const handleNext = () => {
    const isValid = Array.from(selectedPatients.values())
      .every(data => data.phoneNumber.trim() !== '' && data.isValid);

    if (isValid && selectedPatients.size > 0) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-elevated rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-text-primary">
          {t('workspace.remoteMonitoring.stepOne.title')}
        </h3>
        <ColumnSelector
          availableColumns={getAllFields()}
          selectedColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
          standardFields={standardFields}
        />
      </div>
      
      <div className="flex-1 mb-4">
        <PatientTable 
          allPatients={organisationDetails?.patientList || []}
          patients={organisationDetails?.patientList.filter(patient => {
            return Object.entries(columnFilters).every(([field, filter]) => {
              if (!filter) return true;

              const value = patient[field];
              
              // Handle date filters
              if (isDateColumn(field, [{ value }])) {
                const date = parseDate(value);
                if (!date) return false;
                
                const { type, start, end } = filter;
                switch (type) {
                  case 'range':
                    return (!start || date >= start) && (!end || date <= end);
                  case 'from':
                    return date >= start;
                  case 'until':
                    return date <= end;
                  default:
                    return true;
                }
              }
              
              // Handle regular filters (arrays of values)
              return filter.includes?.(value?.toString() || '');
            });
          }) || []}
          columnFilters={columnFilters}
          onColumnFilterChange={handleColumnFilterChange}
          visibleColumns={visibleColumns}
          showSearch={true}
          selectable={true}
          selectedPatients={selectedPatients}
          onPatientSelect={(patientId) => {
            const patient = organisationDetails?.patientList?.find(p => p.id === patientId);
            if (patient?.phoneNumber) {
              handlePatientSelect(patientId);
            }
          }}
          onSelectAll={handleSelectAll}
          renderCell={(patient, field) => {
            if (field === 'lastScheduled' && patient.lastScheduled) {
              try {
                const date = typeof patient.lastScheduled === 'string' 
                  ? parseISO(patient.lastScheduled)
                  : patient.lastScheduled?.toDate?.()
                  || new Date(patient.lastScheduled);
                
                return format(date, 'dd/MM/yyyy HH:mm');
              } catch (error) {
                return '';
              }
            }
            return undefined;
          }}
          customRowClassName={(patient) => 
            !patient.phoneNumber ? 'opacity-50 cursor-not-allowed' : ''
          }
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-border-main">
        <div className="text-text-secondary">
          {selectedPatients.size} {t('workspace.remoteMonitoring.stepOne.selectedCount')}
        </div>
        <SecondaryButton
          onClick={handleNext}
          disabled={!selectedPatients.size || Array.from(selectedPatients.values()).some(data => !data.phoneNumber.trim())}
        >
          {t('workspace.remoteMonitoring.stepOne.nextButton')}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default StepOne; 