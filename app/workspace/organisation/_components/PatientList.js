import { useState, useEffect } from 'react';
import { Upload, FileWarning, FileCheck, X, Download, UserPlus, Edit, Trash } from 'lucide-react';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const PatientList = ({ patientList, onUploadList }) => {
  const { t } = useLanguage();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [parsedPatients, setParsedPatients] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    nameColumn: '',
    dobColumn: '',
    phoneColumn: ''
  });
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  const handleFileRead = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(header => header.trim());
        const rows = lines.slice(1, 6).map(line => 
          line.split(',').map(cell => cell.trim())
        );
        setCsvFile(file);
        setCsvPreview({ headers, rows, allRows: lines.slice(1) });
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    if (csvPreview && columnMapping.nameColumn && columnMapping.dobColumn) {
      const headers = csvPreview.headers;
      const patients = csvPreview.allRows.map(line => {
        const values = line.split(',').map(value => value.trim());
        return {
          customerName: values[headers.indexOf(columnMapping.nameColumn)],
          dateOfBirth: values[headers.indexOf(columnMapping.dobColumn)],
          phoneNumber: columnMapping.phoneColumn ? values[headers.indexOf(columnMapping.phoneColumn)] : null
        };
      });
      setParsedPatients(patients);
    }
  }, [csvPreview, columnMapping]);

  const validateFile = (file) => {
    if (file.type !== 'text/csv') {
      setError(t('workspace.organisation.patientList.uploadModal.errors.csvOnly'));
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      handleFileRead(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      handleFileRead(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setCsvFile(null);
    setCsvPreview(null);
    setColumnMapping({ nameColumn: '', dobColumn: '' });
    setError('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleUploadConfirm = async () => {
    if (!columnMapping.nameColumn || !columnMapping.dobColumn) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.requiredColumns'));
      return;
    }

    if (!parsedPatients || parsedPatients.length === 0) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.noData'));
      return;
    }

    try {
      await onUploadList(parsedPatients);
      setIsUploadModalOpen(false);
      handleRemoveFile();
    } catch (error) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.uploadFailed'));
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['Patient Name,Date of Birth,Phone Number'];
    const rows = patientList.map(patient => 
      `${patient.customerName},${patient.dateOfBirth},${patient.phoneNumber || ''}`
    );
    const csvContent = [headers, ...rows].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'patient_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleAddPatient = async (formData) => {
    if (!formData.customerName || !formData.dateOfBirth) {
      alert(t('workspace.organisation.patientList.patientModal.errors.required'));
      return;
    }

    setIsAddingPatient(true);
    try {
      await onUploadList([...patientList, formData]);
      setShowAddPatientModal(false);
    } catch (error) {
      alert(t('workspace.organisation.patientList.patientModal.errors.addFailed'));
    } finally {
      setIsAddingPatient(false);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    const updatedList = patientList.map(patient => 
      patient === editingPatient ? updatedPatient : patient
    );
    try {
      await onUploadList(updatedList);
      setEditingPatient(null);
    } catch (error) {
      alert('Failed to update patient');
    }
  };

  const handleDeletePatient = async (patientToDelete) => {
    if (!window.confirm(t('workspace.patientList.deleteConfirm'))) return;
    
    const updatedList = patientList.filter(patient => patient !== patientToDelete);
    try {
      await onUploadList(updatedList);
    } catch (error) {
      alert(t('workspace.patientList.errors.deleteFailed'));
    }
  };

  const PatientModal = ({ patient, onSave, onClose, isEditing, isLoading }) => {
    // Format incoming date to YYYY-MM-DD for input element
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      // Handle mm/dd/yyyy format
      const parts = dateString.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
      return dateString;
    };

    // Format date to mm/dd/yyyy for saving
    const formatDateForSave = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const [formData, setFormData] = useState({
      customerName: patient?.customerName || '',
      dateOfBirth: formatDateForInput(patient?.dateOfBirth) || '',
      phoneNumber: patient?.phoneNumber || ''
    });

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-bg-elevated rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-text-primary">
              {isEditing 
                ? t('workspace.organisation.patientList.patientModal.editTitle')
                : t('workspace.organisation.patientList.patientModal.addTitle')}
            </h3>
            <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('workspace.organisation.patientList.patientModal.fields.name')} *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customerName: e.target.value
                }))}
                className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('workspace.organisation.patientList.patientModal.fields.dob')} *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  dateOfBirth: e.target.value
                }))}
                className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                {t('workspace.organisation.patientList.patientModal.fields.phone')}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phoneNumber: e.target.value
                }))}
                className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <SecondaryButton onClick={onClose}>
              {t('workspace.organisation.patientList.patientModal.buttons.cancel')}
            </SecondaryButton>
            <ActiveButton
              onClick={() => {
                if (!formData.customerName || !formData.dateOfBirth) {
                  alert('Name and Date of Birth are required');
                  return;
                }
                // Format the date before saving
                const formattedData = {
                  ...formData,
                  dateOfBirth: formatDateForSave(formData.dateOfBirth)
                };
                onSave(formattedData);
              }}
              disabled={!formData.customerName || !formData.dateOfBirth || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </div>
              ) : (
                isEditing ? 'Save Changes' : 'Add Patient'
              )}
            </ActiveButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-bg-elevated rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-text-primary">
          {t('workspace.patientList.title')}
        </h2>
        <div className="flex gap-2">
          <ActiveButton onClick={handleDownloadCsv}>
            <Download size={16} className="mr-2" />
            {t('workspace.patientList.buttons.downloadCsv')}
          </ActiveButton>
          <SecondaryButton onClick={() => setShowAddPatientModal(true)}>
            <UserPlus size={16} className="mr-2" />
            {t('workspace.patientList.buttons.addPatient')}
          </SecondaryButton>
          <SecondaryButton onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            {t('workspace.patientList.buttons.updateList')}
          </SecondaryButton>
        </div>
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-border-main">
            <thead className="bg-bg-secondary sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('workspace.patientList.table.headers.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('workspace.patientList.table.headers.dob')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  {t('workspace.patientList.table.headers.phone')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-bg-elevated">
              {patientList.map((patient, index) => (
                <tr key={index} className="hover:bg-bg-secondary">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                    {patient.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {patient.dateOfBirth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {patient.phoneNumber || t('workspace.patientList.table.headers.notProvided')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-elevated rounded-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-text-primary">Update Patient List</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)} 
                className="text-text-secondary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {!csvFile && (
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  ${isDragging ? 'border-primary-blue bg-primary-blue/10' : 'border-border-main'}
                  ${error ? 'border-red-500' : ''}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload size={40} className="text-text-secondary" />
                <div className="text-center">
                  <p className="text-lg mb-2 text-text-primary">Drag and drop your file here</p>
                  <p className="text-sm text-text-secondary">or</p>
                  <label className="mt-2 cursor-pointer text-primary-blue hover:text-primary-blue-hover">
                    Browse files
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 mt-4">
                <FileWarning size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* File Preview */}
            {csvFile && csvPreview && (
              <div className="border border-border-main rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <FileCheck size={20} />
                    <span className="text-text-primary">{csvFile.name}</span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-text-secondary hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Column Mapping */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Name Column
                    </label>
                    <select
                      value={columnMapping.nameColumn}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        nameColumn: e.target.value
                      }))}
                      className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
                    >
                      <option value="">Select column</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Date of Birth Column
                    </label>
                    <select
                      value={columnMapping.dobColumn}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        dobColumn: e.target.value
                      }))}
                      className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
                    >
                      <option value="">Select column</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Phone Number Column
                    </label>
                    <select
                      value={columnMapping.phoneColumn}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        phoneColumn: e.target.value
                      }))}
                      className="w-full rounded-md bg-bg-secondary border-border-main text-text-primary"
                    >
                      <option value="">Select column</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-bg-secondary p-4 rounded">
                  <h5 className="text-sm mb-4 text-text-primary">Preview (first 5 rows):</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr>
                          {csvPreview.headers.map((header, i) => (
                            <th key={i} className="border border-border-main p-2 text-left text-text-secondary">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-border-main p-2 text-text-primary">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <SecondaryButton onClick={() => setIsUploadModalOpen(false)}>
                    Cancel
                  </SecondaryButton>
                  <ActiveButton
                    onClick={handleUploadConfirm}
                    disabled={!csvFile || !columnMapping.nameColumn || !columnMapping.dobColumn}
                  >
                    Upload
                  </ActiveButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddPatientModal && (
        <PatientModal
          onSave={handleAddPatient}
          onClose={() => setShowAddPatientModal(false)}
          isEditing={false}
          isLoading={isAddingPatient}
          patient={{
            customerName: '',
            dateOfBirth: '',
            phoneNumber: ''
          }}
        />
      )}

      {editingPatient && (
        <PatientModal
          patient={editingPatient}
          onSave={handleEditPatient}
          onClose={() => setEditingPatient(null)}
          isEditing={true}
          isLoading={isAddingPatient}
        />
      )}
    </section>
  );
}; 