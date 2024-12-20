'use client';

import { useState } from 'react';
import { SecondaryButton, ActiveButton } from '@/app/_components/global_components';
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import { useLanguage } from '@/lib/contexts/LanguageContext';

const StepTwo = ({ 
  objectives,
  setObjectives,
  onBack,
  onNext,
  onShowPresetModal,
  organisationDetails,
  user,
  selectedPresetIndex,
  setSelectedPresetIndex,
  setPresetName,
  setIsEditingPreset,
  handleDeletePreset,
  activeTab,
  setActiveTab,
  instructions,
  setInstructions,
  isGeneratingObjectives,
  setIsGeneratingObjectives
}) => {
  const { t } = useLanguage();

  const handleGenerateObjectives = async () => {
    if (!instructions.trim()) return;
    
    setIsGeneratingObjectives(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_ups/generate_objectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ instructions }),
      });
      
      const data = await response.json();
      setObjectives(data.generated_objectives);
    } catch (error) {
      console.error('Error generating objectives:', error);
    } finally {
      setIsGeneratingObjectives(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium text-text-primary mb-6">
        {t('workspace.remoteMonitoring.stepTwo.title')}
      </h3>
      
      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border-main mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-2 px-4 ${
            activeTab === 'manual'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('workspace.remoteMonitoring.stepTwo.tabs.manual')}
        </button>
        <button
          onClick={() => setActiveTab('preset')}
          className={`pb-2 px-4 ${
            activeTab === 'preset'
              ? 'border-b-2 border-primary-blue text-primary-blue'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('workspace.remoteMonitoring.stepTwo.tabs.preset')}
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Instructions */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              {t('workspace.remoteMonitoring.stepTwo.manual.instructionsLabel')}
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t('workspace.remoteMonitoring.stepTwo.manual.instructionsPlaceholder')}
              className="w-full h-48 bg-bg-secondary border border-border-main rounded p-2 text-text-primary mb-2"
            />
            <div className="flex justify-end">
              <ActiveButton
                onClick={handleGenerateObjectives}
                disabled={!instructions.trim() || isGeneratingObjectives}
              >
                {t('workspace.remoteMonitoring.stepTwo.manual.generateButton')}
              </ActiveButton>
            </div>
          </div>

          {/* Right Column - Objectives List */}
          <div className="relative min-h-[16rem]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-text-primary font-medium">
                {t('workspace.remoteMonitoring.stepTwo.manual.objectivesLabel')}
              </label>
              <SecondaryButton
                onClick={() => onShowPresetModal()}
                disabled={objectives.length === 0}
              >
                {t('workspace.remoteMonitoring.stepTwo.manual.savePresetButton')}
              </SecondaryButton>
            </div>
            {isGeneratingObjectives && (
              <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/50 z-10 rounded">
                <LoadingSpinner />
              </div>
            )}
            <div className="space-y-2">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => {
                      const newObjectives = [...objectives];
                      newObjectives[index] = e.target.value;
                      setObjectives(newObjectives);
                    }}
                    className="bg-bg-secondary border border-border-main p-2 rounded flex-grow"
                  />
                  <button
                    onClick={() => setObjectives(objectives.filter((_, i) => i !== index))}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={t('workspace.remoteMonitoring.stepTwo.manual.addObjectivePlaceholder')}
                className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setObjectives([...objectives, e.target.value.trim()]);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-text-primary font-medium mb-2">
                {t('workspace.remoteMonitoring.stepTwo.preset.selectPresetLabel')}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPresetIndex !== null ? selectedPresetIndex : ''}
                  onChange={(e) => {
                    const index = e.target.value;
                    if (index) {
                      const preset = organisationDetails?.settings?.remoteMonitoring?.presets[index];
                      setSelectedPresetIndex(index);
                      setPresetName(preset.title);
                      setObjectives([...preset.objectives]);
                    } else {
                      setSelectedPresetIndex(null);
                      setPresetName('');
                      setObjectives([]);
                    }
                  }}
                  className="flex-grow bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
                >
                  <option value="">
                    {t('workspace.remoteMonitoring.stepTwo.preset.selectPresetPlaceholder')}
                  </option>
                  {organisationDetails?.settings?.remoteMonitoring?.presets?.map((preset, index) => (
                    <option key={index} value={index}>
                      {preset.title}
                    </option>
                  ))}
                </select>
                {selectedPresetIndex !== null && (
                  <>
                    <button
                      onClick={() => {
                        const preset = organisationDetails?.settings?.remoteMonitoring?.presets[selectedPresetIndex];
                        if (preset) {
                          setIsEditingPreset(true);
                          onShowPresetModal();
                        }
                      }}
                      className="p-2 text-text-secondary hover:text-primary-blue"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePreset(selectedPresetIndex)}
                      className="p-2 text-text-secondary hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative min-h-[16rem]">
              <label className="block text-text-primary font-medium mb-2">
                {t('workspace.remoteMonitoring.stepTwo.preset.selectedObjectivesLabel')}
              </label>
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index] = e.target.value;
                        setObjectives(newObjectives);
                      }}
                      className="bg-bg-secondary border border-border-main p-2 rounded flex-grow"
                    />
                    <button
                      onClick={() => setObjectives(objectives.filter((_, i) => i !== index))}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder={t('workspace.remoteMonitoring.stepTwo.preset.addObjectivePlaceholder')}
                  className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      setObjectives([...objectives, e.target.value.trim()]);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <SecondaryButton onClick={onBack}>
          {t('workspace.remoteMonitoring.stepTwo.navigation.back')}
        </SecondaryButton>
        <SecondaryButton
          onClick={onNext}
          disabled={objectives.length === 0}
        >
          {t('workspace.remoteMonitoring.stepTwo.navigation.confirm')}
        </SecondaryButton>
      </div>
    </div>
  );
};

export default StepTwo; 