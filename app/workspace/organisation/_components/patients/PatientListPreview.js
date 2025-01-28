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

  // Internal fields that shouldn't be DISPLAYED (but should be kept in the data)
  const internalFields = ['lastScheduled'];

  // Get all unique fields from patients, excluding internal fields
  const allFields = [...new Set(patients.flatMap(patient => 
    Object.keys(patient).filter(key => key !== 'id' && !internalFields.includes(key))
  ))];

  // Sort patients by name
  const sortedPatients = [...patients].sort((a, b) => 
    (a.customerName || '').localeCompare(b.customerName || '')
  );

  return (
    <div className="overflow-x-auto relative h-[calc(100vh-22rem)] rounded-lg border border-gray-200">
      <table className="w-full min-w-[600px] border-collapse bg-white">
        <thead className="sticky top-0 z-10 after:absolute after:left-0 after:bottom-0 after:w-full after:border-b after:border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-16">
            </th>
            {allFields.map((field) => {
              const standardField = dbAttributes.find(attr => attr.value === field);
              return (
                <th 
                  key={field} 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
                >
                  {standardField ? standardField.label : field}
                </th>
              );
            })}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-24">
              {t('workspace.organisation.patientList.fields.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedPatients.map((patient, index) => (
            <tr 
              key={patient.id || index}
              className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
            >
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {index + 1}
              </td>
              {allFields.map((field) => (
                <td key={field} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {patient[field] || '-'}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(patient)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-150"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(patient)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-150"
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