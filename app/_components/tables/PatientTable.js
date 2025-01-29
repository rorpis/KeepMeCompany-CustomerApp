import { Edit, Trash } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export const PatientTable = ({ 
  patients,
  onEdit,
  onDelete,
  visibleColumns = ['customerName', 'dateOfBirth', 'phoneNumber'],
  showActions = false,
  customColumnLabels = {},
  renderCell = null,
  customRowClassName = null,
  customRowActions = null
}) => {
  const { t } = useLanguage();

  // Standard fields with their default translations
  const standardFields = {
    customerName: 'firstName',
    dateOfBirth: 'dateOfBirth',
    phoneNumber: 'phoneNumber',
    lastScheduled: 'lastScheduled'
  };

  // Sort patients by name
  const sortedPatients = [...patients].sort((a, b) => 
    (a.customerName || '').localeCompare(b.customerName || '')
  );

  const getColumnLabel = (field) => {
    if (customColumnLabels[field]) {
      return customColumnLabels[field];
    }
    if (standardFields[field]) {
      return t(`workspace.organisation.patientList.fields.${standardFields[field]}`);
    }
    return field;
  };

  const getCellContent = (patient, field) => {
    if (renderCell) {
      const customContent = renderCell(patient, field);
      if (customContent !== undefined) {
        return customContent;
      }
    }
    return patient[field] || '-';
  };

  return (
    <div className="overflow-x-auto relative h-[calc(100vh-22rem)] rounded-lg">
      <table className="w-full min-w-[600px] border-collapse bg-white">
        <thead className="sticky top-0 z-10 after:absolute after:left-0 after:bottom-0 after:w-full after:border-b after:border-gray-300">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-16">
            </th>
            {visibleColumns.map((field) => (
              <th 
                key={field} 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50"
              >
                {getColumnLabel(field)}
              </th>
            ))}
            {showActions && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-24">
                {t('workspace.organisation.patientList.fields.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedPatients.map((patient, index) => (
            <tr 
              key={patient.id || index}
              className={`hover:bg-gray-50 transition-colors duration-150 ease-in-out ${
                customRowClassName ? customRowClassName(patient) : ''
              }`}
            >
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {index + 1}
              </td>
              {visibleColumns.map((field) => (
                <td key={field} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                  {getCellContent(patient, field)}
                </td>
              ))}
              {showActions && (
                <td className="px-4 py-3">
                  {customRowActions ? (
                    customRowActions(patient)
                  ) : (
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(patient)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-150"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(patient)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-150"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 