import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { PatientTable } from '@/_components/tables/PatientTable';

export const PatientListTable = ({ 
  patients,
  allPatients,
  onEdit,
  onDelete,
  showActions = false,
  showSearch = false,
  columnFilters = {},
  onColumnFilterChange = null,
}) => {
  const { t } = useLanguage();

  if (!patients || patients.length === 0) {
    return (
      <div className="text-center text-text-secondary py-8">
        {t('workspace.organisation.patientList.noPatients')}
      </div>
    );
  }

  // Get all unique fields from patients, excluding internal fields
  const internalFields = ['id', 'lastScheduled'];
  const allFields = [...new Set(patients.flatMap(patient => 
    Object.keys(patient).filter(key => !internalFields.includes(key))
  ))];

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[60vh] overflow-y-auto">
        <PatientTable
          patients={patients}
          allPatients={allPatients}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          showSearch={showSearch}
          columnFilters={columnFilters}
          onColumnFilterChange={onColumnFilterChange}
          visibleColumns={allFields}
          showRowNumbers={true}
        />
      </div>
    </div>
  );
}; 