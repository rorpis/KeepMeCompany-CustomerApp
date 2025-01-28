import { Edit, Trash } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';

export default function PatientListPreview({ patients, onEdit, onDelete }) {
  const { t } = useLanguage();

  // Standard fields with translations
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

  // Internal fields that shouldn't be shown
  const internalFields = ['id', 'lastScheduled'];

  // Get all unique fields from patients, excluding internal fields
  const allFields = [...new Set(patients.flatMap(patient => Object.keys(patient)))]
    .filter(field => !internalFields.includes(field));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            {allFields.map((field) => {
              const standardField = dbAttributes.find(attr => attr.value === field);
              return (
                <th key={field} className="border border-border-main p-2 text-left text-text-secondary">
                  {standardField ? standardField.label : field}
                </th>
              );
            })}
            <th className="border border-border-main p-2 text-left text-text-secondary w-24">
              {t('workspace.organisation.patientList.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={index}>
              {allFields.map((field) => (
                <td key={field} className="border border-border-main p-2 text-text-primary">
                  {patient[field] || '-'}
                </td>
              ))}
              <td className="border border-border-main p-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(patient)}
                    className="p-1 text-text-secondary hover:text-text-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(patient)}
                    className="p-1 text-text-secondary hover:text-red-500"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 