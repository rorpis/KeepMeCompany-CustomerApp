import { Edit, Trash } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import PatientListPreview from './PatientListPreview';
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

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[60vh] overflow-y-auto">
        <PatientListPreview 
          patients={patients}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}; 