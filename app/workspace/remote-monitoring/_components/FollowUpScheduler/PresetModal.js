'use client';

import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const PresetModal = ({
  presetName,
  setPresetName,
  isEditingPreset,
  objectives,
  onClose,
  onSave,
  onUpdate
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-elevated p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium text-text-primary mb-4">
          {isEditingPreset 
            ? t('workspace.remoteMonitoring.presetModal.editTitle')
            : t('workspace.remoteMonitoring.presetModal.saveTitle')
          }
        </h3>
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder={t('workspace.remoteMonitoring.presetModal.placeholder')}
          className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary mb-4"
        />
        <div className="flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>
            {t('workspace.remoteMonitoring.presetModal.cancel')}
          </SecondaryButton>
          <ActiveButton
            onClick={isEditingPreset ? onUpdate : onSave}
            disabled={!presetName.trim()}
          >
            {isEditingPreset 
              ? t('workspace.remoteMonitoring.presetModal.update')
              : t('workspace.remoteMonitoring.presetModal.save')
            }
          </ActiveButton>
        </div>
      </div>
    </div>
  );
};

export default PresetModal; 