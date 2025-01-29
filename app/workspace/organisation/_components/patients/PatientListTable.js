import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import { PatientTable } from '@/_components/tables/PatientTable';

export const PatientListTable = ({ 
  patients, 
  onEdit, 
  onDelete 
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
          onEdit={onEdit}
          onDelete={onDelete}
          visibleColumns={allFields}
          showActions={true}
          showSearch={true}
          showRowNumbers={true}
        />
      </div>
    </div>
  );
}; 