import { Edit, Trash, Search } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useState } from 'react';

export const PatientTable = ({ 
  patients,
  onEdit,
  onDelete,
  visibleColumns = ['customerName', 'dateOfBirth', 'phoneNumber'],
  showActions = false,
  showSearch = false,
  customColumnLabels = {},
  renderCell = null,
  customRowClassName = null,
  customRowActions = null,
  selectable = false,
  selectedPatients = new Map(),
  onPatientSelect = null,
  onSelectAll = null,
  showRowNumbers = false,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Standard fields with their default translations
  const standardFields = {
    customerName: 'firstName',
    dateOfBirth: 'dateOfBirth',
    phoneNumber: 'phoneNumber',
    lastScheduled: 'lastScheduled'
  };

  // Filter patients based on search query
  const filteredPatients = searchQuery
    ? patients.filter(patient => 
        patient.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : patients;

  // Sort patients by name
  const sortedPatients = [...filteredPatients].sort((a, b) => 
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

  // Add this function to check if all filterable patients are selected
  const areAllSelected = () => {
    return sortedPatients.length > 0 && sortedPatients.every(patient => 
      !patient.phoneNumber || selectedPatients.has(patient.id)
    );
  };

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('workspace.organisation.patientList.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent
                      text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
      )}
      
      <div className="overflow-x-auto relative h-[calc(100vh-26rem)] rounded-lg">
        <table className="w-full min-w-[600px] border-collapse bg-white">
          <thead className="sticky top-0 z-10 after:absolute after:left-0 after:bottom-0 after:w-full after:border-b after:border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-16">
                {selectable && onSelectAll && (
                  <input
                    type="checkbox"
                    checked={areAllSelected()}
                    onChange={() => onSelectAll(sortedPatients)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
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
            {sortedPatients.map((patient, index) => {
              const isSelected = selectedPatients.has(patient.id);
              return (
                <tr 
                  key={patient.id || index}
                  onClick={() => selectable && onPatientSelect?.(patient.id)}
                  className={`hover:bg-gray-50 transition-colors duration-150 ease-in-out ${
                    selectable ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-blue-50' : ''} ${
                    customRowClassName ? customRowClassName(patient) : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {showRowNumbers ? (
                      index + 1
                    ) : selectable ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onPatientSelect?.(patient.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    ) : null}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(patient);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-150"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(patient);
                              }}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 