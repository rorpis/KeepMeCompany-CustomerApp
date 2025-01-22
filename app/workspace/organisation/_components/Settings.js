'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/firebase/authContext';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import LoadingSpinner from '../../../_components/LoadingSpinner';

export const Settings = ({ organisationDetails, onUpdateSettings }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    patientIntake: {
      firstMessage: '',
      firstObjectives: [],
      lastObjectives: [],
      patientVerificationEnabled: false,
    },
    remoteMonitoring: {
      firstMessage: '',
      firstObjectives: [],
      lastObjectives: [],
      patientInformation: [],
    }
  });
  const [showDropdown, setShowDropdown] = useState({
    patientIntake: {
      firstMessage: false
    },
    remoteMonitoring: {
      firstMessage: false
    }
  });
  const [unsavedSections, setUnsavedSections] = useState({
    patientIntake: false,
    remoteMonitoring: false
  });
  
  const variables = [
    { label: 'Patient Name', value: '@PatientName' },
    { label: 'Organisation Name', value: '@OrganisationName' },
  ];
  const [filteredVariables, setFilteredVariables] = useState(variables);

  const insertVariableFirstMessage = (variable, section) => {
    const input = document.querySelector(`textarea[name="${section}-firstMessage"]`);
    const cursorPosition = input.selectionStart;
    const textBeforeCursor = settings[section].firstMessage.substring(0, cursorPosition);
    const textAfterCursor = settings[section].firstMessage.substring(cursorPosition);
    
    // Find the start of the @ symbol before cursor
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    const newMessage = textBeforeCursor.substring(0, lastAtSymbol) + variable + textAfterCursor;
    
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], firstMessage: newMessage }
    }));
    setShowDropdown(prev => ({
      ...prev,
      [section]: { ...prev[section], firstMessage: false }
    }));
  };

  const handleInputChangeFirstMessage = (e, section) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], firstMessage: value }
    }));
    markSectionAsUnsaved(section);

    // Get text before cursor
    const textBeforeCursor = value.substring(0, cursorPosition);
    
    // Show dropdown if there's an @ symbol before the cursor
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], firstMessage: true }
      }));
      
      // Filter variables based on text after @
      const searchTerm = textBeforeCursor.substring(lastAtSymbol + 1);
      setFilteredVariables(variables.filter(v => 
        v.label.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], firstMessage: false }
      }));
      setFilteredVariables(variables);
    }
  };

  // Initialize settings from organisationDetails when component mounts
  useEffect(() => {
    if (organisationDetails?.settings) {
      setSettings({
        patientIntake: {
          firstMessage: organisationDetails.settings.patientIntake?.firstMessage || '',
          firstObjectives: organisationDetails.settings.patientIntake?.firstObjectives || [],
          lastObjectives: organisationDetails.settings.patientIntake?.lastObjectives || [],
          patientVerificationEnabled: organisationDetails.settings.patientIntake?.patientVerificationEnabled || false,
        },
        remoteMonitoring: {
          firstMessage: organisationDetails.settings.remoteMonitoring?.firstMessage || '',
          firstObjectives: organisationDetails.settings.remoteMonitoring?.firstObjectives || [],
          lastObjectives: organisationDetails.settings.remoteMonitoring?.lastObjectives || [],
          patientInformation: organisationDetails.settings.remoteMonitoring?.patientInformation || [],
        }
      });
      setUnsavedSections({
        patientIntake: false,
        remoteMonitoring: false
      });
    }
  }, [organisationDetails]);

  const markSectionAsUnsaved = (section) => {
    setUnsavedSections(prev => ({
      ...prev,
      [section]: true
    }));
  };

  const handleObjectiveChange = (section, type, index, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].map((obj, i) => i === index ? value : obj)
      }
    }));
    markSectionAsUnsaved(section);
  };

  const handleAddObjective = (section, type) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: [...prev[section][type], '']
      }
    }));
    markSectionAsUnsaved(section);
  };

  const handleRemoveObjective = (section, type, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].filter((_, i) => i !== index)
      }
    }));
    markSectionAsUnsaved(section);
  };

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await onUpdateSettings(settings);
      setUnsavedSections({
        patientIntake: false,
        remoteMonitoring: false
      });
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderSection = (title, section) => (
    <div className="bg-bg-elevated rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-text-primary">
          {t(`workspace.settings.sections.${section}`)}
        </h3>
        {section === 'patientIntake' && !organisationDetails?.registeredNumbers?.length && (
          <span className="text-red-500 text-lg">
            {t('workspace.intake.phoneNumberRequired')}
          </span>
        )}
        {unsavedSections[section] && (
          <span className="text-yellow-500 text-lg">
            {t('workspace.settings.unsavedChanges')}
          </span>
        )}
      </div>
      
      <div className="relative">
        {section === 'patientIntake' && !organisationDetails?.registeredNumbers?.length && (
          <div className="absolute inset-0 bg-bg-elevated/50 backdrop-blur-[0.8px] z-10 rounded" />
        )}
        
        {section === 'patientIntake' && (
          <div className="flex items-center justify-between py-4 border-b border-border-main mb-6">
            <div>
              <label className="text-sm font-medium text-text-primary">
                {t('workspace.settings.patientVerification.title')}
              </label>
              <p className="text-xs text-text-secondary">
                {t('workspace.settings.patientVerification.description')}
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                patientIntake: {
                  ...prev.patientIntake,
                  patientVerificationEnabled: !prev.patientIntake.patientVerificationEnabled
                }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                settings.patientIntake.patientVerificationEnabled 
                  ? 'bg-green-200 focus:ring-green-500' 
                  : 'bg-red-200 focus:ring-red-500'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                  settings.patientIntake.patientVerificationEnabled 
                    ? 'translate-x-6 bg-green-600' 
                    : 'translate-x-1 bg-red-600'
                }`}
              />
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* First Message Section */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <div className="space-y-4">
              <label className="block font-medium text-text-primary">
                {t('workspace.settings.messages.firstMessage')}
              </label>
              <div className="relative">
                <textarea
                  name={`${section}-firstMessage`}
                  value={settings[section].firstMessage}
                  onChange={(e) => handleInputChangeFirstMessage(e, section)}
                  className="w-full h-32 px-4 py-2 rounded-md bg-bg-main border border-border-main text-sm placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                <div className="px-3 text-gray-400 text-sm">@ Variables</div>
                {showDropdown[section]?.firstMessage && (
                  <div className="absolute text-blue-500 font-bold bg-white border border-gray-300 rounded shadow-lg mt-1">
                    {filteredVariables.map((varItem) => (
                      <div
                        key={`${section}-first-${varItem.value}`}
                        onClick={() => insertVariableFirstMessage(varItem.value, section)}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {varItem.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* First Objectives Section */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <div className="space-y-4">
              <label className="block font-medium text-text-primary">
                {t('workspace.settings.objectives.first')}
              </label>
              {settings[section].firstObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(section, 'firstObjectives', index, e.target.value)}
                    placeholder={t('workspace.settings.objectives.placeholder')}
                    className="flex-1 px-4 py-2 rounded-md bg-bg-main border border-border-main text-sm"
                  />
                  <button
                    onClick={() => handleRemoveObjective(section, 'firstObjectives', index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t('workspace.settings.objectives.removeObjective')}
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddObjective(section, 'firstObjectives')}
                className="text-primary-blue hover:text-primary-blue-hover text-sm"
              >
                {t('workspace.settings.objectives.addObjective')}
              </button>
            </div>
          </div>

          {/* Last Objectives Section */}
          <div className="bg-bg-secondary rounded-lg p-6">
            <div className="space-y-4">
              <label className="block font-medium text-text-primary">
                {t('workspace.settings.objectives.last')}
              </label>
              {settings[section].lastObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(section, 'lastObjectives', index, e.target.value)}
                    placeholder={t('workspace.settings.objectives.placeholder')}
                    className="flex-1 px-4 py-2 rounded-md bg-bg-main border border-border-main text-sm"
                  />
                  <button
                    onClick={() => handleRemoveObjective(section, 'lastObjectives', index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t('workspace.settings.objectives.removeObjective')}
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddObjective(section, 'lastObjectives')}
                className="text-primary-blue hover:text-primary-blue-hover text-sm"
              >
                {t('workspace.settings.objectives.addObjective')}
              </button>
            </div>
          </div>

          {/* Patient Information Section - Only show for remoteMonitoring */}
          {section === 'remoteMonitoring' && (
            <div className="bg-bg-secondary rounded-lg p-6 border-2 border-primary-blue/20">
              <div className="space-y-4">
                <label className="block font-medium text-text-primary">
                  {t('workspace.settings.patientInformation.title')}
                </label>
                {settings.remoteMonitoring.patientInformation.map((info, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={info}
                      onChange={(e) => handleObjectiveChange('remoteMonitoring', 'patientInformation', index, e.target.value)}
                      placeholder={t('workspace.settings.patientInformation.placeholder')}
                      className="flex-1 px-4 py-2 rounded-md bg-bg-main border border-border-main text-sm"
                    />
                    <button
                      onClick={() => handleRemoveObjective('remoteMonitoring', 'patientInformation', index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t('workspace.settings.objectives.removeObjective')}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleAddObjective('remoteMonitoring', 'patientInformation')}
                  className="text-primary-blue hover:text-primary-blue-hover text-sm"
                >
                  {t('workspace.settings.patientInformation.addInformation')}
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );

  const hasAnyUnsavedChanges = Object.values(unsavedSections).some(Boolean);

  return (
    <div className="space-y-6">
      {renderSection(t('workspace.settings.sections.remoteMonitoring'), 'remoteMonitoring')}
      {renderSection(t('workspace.settings.sections.patientIntake'), 'patientIntake')}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isUpdating || !hasAnyUnsavedChanges}
          className={`${
            hasAnyUnsavedChanges 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-primary-blue hover:bg-primary-blue/80'
          } text-white px-6 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isUpdating && <LoadingSpinner size="sm" />}
          {t('workspace.settings.buttons.save')}
        </button>
      </div>
    </div>
  );
}; 