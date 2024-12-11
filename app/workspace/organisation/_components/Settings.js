import { useState, useEffect } from 'react';
import { useAuth } from '../../../../lib/firebase/authContext';
import LoadingSpinner from '../../../_components/LoadingSpinner';

export const Settings = ({ organisationDetails, onUpdateSettings }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    patientIntake: {
      firstMessage: '',
      lastMessage: '',
      firstObjectives: [],
      lastObjectives: [],
      patientVerificationEnabled: false,
    },
    remoteMonitoring: {
      firstMessage: '',
      lastMessage: '',
      firstObjectives: [],
      lastObjectives: [],
    }
  });
  const [showDropdown, setShowDropdown] = useState({
    patientIntake: {
      firstMessage: false,
      lastMessage: false
    },
    remoteMonitoring: {
      firstMessage: false,
      lastMessage: false
    }
  });
  
  const variables = [
    { label: 'Patient Name', value: '@PatientName' },
    { label: 'Organisation Name', value: '@OrganisationName' },
  ];
  const [filteredVariables, setFilteredVariables] = useState(variables);

  const insertVariableFirstMessage = (variable, section) => {
    const newMessage = settings[section].firstMessage.replace(/@.*$/, variable); // Replace the last part after '@'
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], firstMessage: newMessage }
    }))
    setShowDropdown(false);
  };

  const insertVariableLastMessage = (variable, section) => {
    const newMessage = settings[section].firstMessage.replace(/@.*$/, variable); // Replace the last part after '@'
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], lastMessage: newMessage }
    }))
    setShowDropdown(false);
  };

  const handleInputChangeFirstMessage = (e, section) => {

    const value = e.target.value;

    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], firstMessage: value }
    }))

    // Show dropdown if '@' is typed
    if (value.endsWith('@')) {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], firstMessage: true }
      }))
    } else {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], firstMessage: false }
      }))
    }

    // Filter variables based on input
    if (value.includes('@')) {
      const searchTerm = value.split('@').pop();
      setFilteredVariables(variables.filter(v => v.label.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setFilteredVariables(variables);
    }
  };

  const handleInputChangeLastMessage = (e, section) => {

    const value = e.target.value;

    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], lastMessage: value }
    }))

    // Show dropdown if '@' is typed
    if (value.endsWith('@')) {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], lastMessage: true }
      }))
    } else {
      setShowDropdown(prev => ({
        ...prev,
        [section]: { ...prev[section], lastMessage: false }
      }))
    }

    // Filter variables based on input
    if (value.includes('@')) {
      const searchTerm = value.split('@').pop();
      setFilteredVariables(variables.filter(v => v.label.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setFilteredVariables(variables);
    }
  };

  // Initialize settings from organisationDetails when component mounts or when organisationDetails changes
  useEffect(() => {
    if (organisationDetails?.settings) {
      setSettings({
        patientIntake: {
          firstMessage: organisationDetails.settings.patientIntake?.firstMessage || '',
          lastMessage: organisationDetails.settings.patientIntake?.lastMessage || '',
          firstObjectives: organisationDetails.settings.patientIntake?.firstObjectives || [],
          lastObjectives: organisationDetails.settings.patientIntake?.lastObjectives || [],
          patientVerificationEnabled: organisationDetails.settings.patientIntake?.patientVerificationEnabled || false,
        },
        remoteMonitoring: {
          firstMessage: organisationDetails.settings.remoteMonitoring?.firstMessage || '',
          lastMessage: organisationDetails.settings.remoteMonitoring?.lastMessage || '',
          firstObjectives: organisationDetails.settings.remoteMonitoring?.firstObjectives || [],
          lastObjectives: organisationDetails.settings.remoteMonitoring?.lastObjectives || [],
        }
      });
    }
  }, [organisationDetails]);

  const handleObjectiveChange = (section, type, index, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].map((obj, i) => i === index ? value : obj)
      }
    }));
  };

  const handleAddObjective = (section, type) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: [...prev[section][type], '']
      }
    }));
  };

  const handleRemoveObjective = (section, type, index) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsUpdating(true);
      await onUpdateSettings(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderSection = (title, section) => (
    <div className="bg-bg-elevated rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
      
      {section === 'patientIntake' && (
        <div className="flex items-center justify-between py-2 border-b border-border-main">
          <div>
            <label className="text-sm font-medium text-text-primary">Patient Verification</label>
            <p className="text-xs text-text-secondary">Enable patient verification step during intake</p>
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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">First Message</label>
          <textarea
            value={settings[section].firstMessage}
            onChange={(e) => handleInputChangeFirstMessage(e, section)}
            className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary"
            rows={3}
          />
          <div className="px-3 text-gray-500">@ Variables</div>
          {showDropdown[section] && showDropdown[section].firstMessage && (
            <div className="absolute text-blue-500 font-bold bg-white border border-gray-300 rounded shadow-lg mt-1">
              {filteredVariables.map((varItem) => (
                <div
                  onClick={() => insertVariableFirstMessage(varItem.value, section)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {varItem.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Last Message</label>
          <textarea
            value={settings[section].lastMessage}
            onChange={(e) => handleInputChangeLastMessage(e, section)}
            className="w-full px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary"
            rows={3}
          />
          <div className="px-3 text-gray-500">@ Variables</div>
          {showDropdown[section] && showDropdown[section].lastMessage && (
            <div className="absolute text-blue-500 font-bold bg-white border border-gray-300 rounded shadow-lg mt-1">
              {filteredVariables.map((varItem) => (
                <div
                  onClick={() => insertVariableLastMessage(varItem.value, section)}
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {varItem.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">First Objectives</label>
          {settings[section].firstObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(section, 'firstObjectives', index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary"
              />
              <button
                onClick={() => handleRemoveObjective(section, 'firstObjectives', index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => handleAddObjective(section, 'firstObjectives')}
            className="text-primary-blue hover:text-primary-blue-hover"
          >
            + Add Objective
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Last Objectives</label>
          {settings[section].lastObjectives.map((objective, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => handleObjectiveChange(section, 'lastObjectives', index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-md bg-bg-secondary border border-border-main text-text-primary"
              />
              <button
                onClick={() => handleRemoveObjective(section, 'lastObjectives', index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => handleAddObjective(section, 'lastObjectives')}
            className="text-primary-blue hover:text-primary-blue-hover"
          >
            + Add Objective
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      {isUpdating && (
        <div className="absolute inset-0 bg-bg-main/50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-text-primary mb-4">Settings</h2>
      
      {renderSection('Patient Intake', 'patientIntake')}
      {renderSection('Remote Monitoring', 'remoteMonitoring')}
      
      <div className="bg-bg-elevated rounded-lg p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-2">Scribe</h3>
        <p className="text-text-secondary italic">Coming Soon...</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isUpdating}
          className={`px-4 py-2 bg-primary-blue text-white rounded-md ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-blue-hover'
          }`}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}; 