import { Edit, Trash, Search, Filter } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useState, useRef } from 'react';
import { CheckboxDropdown } from '../CheckboxDropdown';
import { isDateColumn, parseDate } from '@/app/_utils/dateUtils';
import { DateFilterDropdown } from '../DateFilterDropdown';

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
  columnFilters = {},
  onColumnFilterChange = null,
  allPatients = null,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Standard fields with their default translations
  const standardFields = {
    customerName: 'firstName',
    dateOfBirth: 'dateOfBirth',
    phoneNumber: 'phoneNumber',
    lastScheduled: 'lastScheduled'
  };

  // Modify this function to use the original patients array instead of filtered patients
  const getUniqueColumnValues = (field) => {
    // Use allPatients (unfiltered) for dropdown options
    const sourceData = allPatients || patients;
    const values = new Set(sourceData.map(patient => patient[field]?.toString() || ''));
    return Array.from(values)
      .sort((a, b) => (a || '').localeCompare(b || ''))
      .map(value => ({
        value,
        label: value || '(Empty)'
      }));
  };

  const handleColumnFilterChange = (field, values) => {
    if (values === null) {
      // Handle clearing the filter
      onColumnFilterChange(field, null);
      return;
    }

    if (isDateColumn(field, getUniqueColumnValues(field))) {
      // Handle date filter
      const { type, start, end } = values;
      onColumnFilterChange(field, { type, start, end });
    } else {
      // Handle regular filter
      onColumnFilterChange(field, values);
    }
  };

  const filterPatients = (patients, filters) => {
    return patients.filter(patient => {
      return Object.entries(filters).every(([field, filter]) => {
        if (!filter) return true;

        const value = patient[field];
        
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
        
        // Regular string filtering
        return filter.includes(value?.toString() || '');
      });
    });
  };

  // Filter patients based on search query and column filters
  const filteredPatients = filterPatients(
    patients.filter(patient => 
      searchQuery === '' || 
      patient.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    columnFilters
  );

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
        <table className="w-full min-w-[600px] border-collapse bg-white relative">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="sticky left-0 top-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-16 border-r border-gray-200 after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
                {selectable && (
                  <input
                    type="checkbox"
                    checked={areAllSelected()}
                    onChange={() => onSelectAll?.(sortedPatients)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                )}
              </th>
              {visibleColumns.map((field) => (
                <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  <div className="flex items-center gap-2">
                    {getColumnLabel(field)}
                    {isDateColumn(field, getUniqueColumnValues(field)) ? (
                      <DateFilterDropdown
                        onFilterChange={(filter) => handleColumnFilterChange(field, filter)}
                        buttonClassName="p-1 text-gray-400 hover:text-gray-600"
                        dropdownClassName="right-0"
                        isLastColumn={field === visibleColumns[visibleColumns.length - 1]}
                      />
                    ) : field !== 'customerName' && ( // Don't show filter for customerName
                      <CheckboxDropdown
                        title={<Filter size={14} className="text-gray-400" />}
                        items={getUniqueColumnValues(field)}
                        selectedItems={columnFilters[field] || []}
                        onItemToggle={(value) => {
                          const currentValues = columnFilters[field] || [];
                          const newValues = currentValues.includes(value)
                            ? currentValues.filter(v => v !== value)
                            : [...currentValues, value];
                          handleColumnFilterChange(field, newValues);
                        }}
                        onSelectAll={() => handleColumnFilterChange(field, getUniqueColumnValues(field).map(v => v.value))}
                        onDeselectAll={() => handleColumnFilterChange(field, [])}
                        buttonClassName="p-1 text-gray-400 hover:text-gray-600"
                        dropdownClassName="right-0"
                      />
                    )}
                  </div>
                </th>
              ))}
              {showActions && (
                <th className="sticky right-0 z-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-24 border-l border-gray-200 after:absolute after:top-0 after:left-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
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
                  <td className="sticky left-0 z-[5] px-4 py-3 text-sm text-gray-500 whitespace-nowrap bg-white after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
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
                    <td className="sticky right-0 z-[5] px-4 py-3 bg-white after:absolute after:top-0 after:left-0 after:bottom-0 after:w-[1px] after:bg-gray-200">
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