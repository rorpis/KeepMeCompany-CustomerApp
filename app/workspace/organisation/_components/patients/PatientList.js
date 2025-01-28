import { useState, useEffect } from 'react';
import { Upload, FileWarning, FileCheck, X, Download, UserPlus, Edit, Trash } from 'lucide-react';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import * as XLSX from 'xlsx';
import ColumnMappingPreview from './ColumnMappingPreview';
import DataPreview from './DataPreview';
import UploadStats from './UploadStats';
import PatientListPreview from './PatientListPreview';

export const PatientList = ({ patientList, onUploadList, isLoading }) => {
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
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [fileReaderResult, setFileReaderResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMappingPreview, setShowMappingPreview] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const handleFileRead = (file) => {
    console.log('File type:', file.type);
    console.log('File name:', file.name);
    
    if (file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        // Split by newlines and filter empty lines
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length > 0) {
          // Parse CSV properly using string splitting and handling quotes
          const parseCSVLine = (line) => {
            const cells = [];
            let cell = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                cells.push(cell.trim());
                cell = '';
              } else {
                cell += char;
              }
            }
            cells.push(cell.trim()); // Push the last cell
            return cells;
          };

          const headers = parseCSVLine(lines[0]);
          const allRows = lines.slice(1).map(line => parseCSVLine(line));
          const previewRows = allRows.slice(0, 5);

          setCsvFile(file);
          setCsvPreview({ headers, rows: previewRows, allRows });
        }
      };
      reader.readAsText(file);
    } else {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setAvailableSheets(workbook.SheetNames);
          
          const processSheet = (sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            
            if (jsonData.length > 0) {
              const headers = jsonData[0].map(header => header?.toString().trim() || '');
              const allRows = jsonData.slice(1).map(row => 
                row.map(cell => cell?.toString().trim() || '')
              );
              const previewRows = allRows.slice(0, 5);

              setCsvFile(file);
              setCsvPreview({ headers, rows: previewRows, allRows });
            }
          };

          if (workbook.SheetNames.length > 1) {
            setSelectedSheet(workbook.SheetNames[0]);
            processSheet(workbook.SheetNames[0]);
          } else {
            processSheet(workbook.SheetNames[0]);
          }
        } catch (error) {
          console.error('Error processing Excel file:', error);
          setError('Error processing Excel file: ' + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  useEffect(() => {
    if (csvPreview && columnMapping.nameColumn && columnMapping.dobColumn) {
      const headers = csvPreview.headers;
      const patients = csvPreview.allRows.map(line => {
        // If line is an array (Excel format), use it directly
        // If it's a string (CSV format), split it
        const values = Array.isArray(line) ? line : line.split(',').map(value => value.trim());
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
    // Excel file extensions
    const validExcelExtensions = ['.xlsx', '.xls'];
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      // Additional Excel MIME types that browsers might use
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ];
    
    // Check file extension for Excel files
    const fileName = file.name.toLowerCase();
    const isExcelFile = validExcelExtensions.some(ext => fileName.endsWith(ext));
    
    if (!validTypes.includes(file.type) && !isExcelFile) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.fileTypeError'));
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
    setFileReaderResult(null);
  };

  const handleMappingContinue = (mappingResult) => {
    // Convert the data using the new mapping, keeping only mapped fields
    const convertedData = csvPreview.allRows.map(row => {
      const mappedRow = {};
      // Only include fields that were actually mapped by the user
      Object.entries(mappingResult).forEach(([dbField, csvColumn]) => {
        const columnIndex = csvPreview.headers.indexOf(csvColumn);
        // Only add the field if it has a value
        const value = row[columnIndex]?.trim();
        if (value) {
          mappedRow[dbField] = value;
        }
      });
      return mappedRow;
    });

    setMappedData(convertedData);
    setShowMappingPreview(false);
    setShowDataPreview(true);
  };

  const handleUploadConfirm = async () => {
    if (!mappedData || mappedData.length === 0) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.noData'));
      return;
    }

    setIsFullScreenLoading(true);
    try {
      const result = await onUploadList(mappedData);
      if (result.success) {
        // Close modals first
        setIsUploadModalOpen(false);
        handleRemoveFile();
        setShowDataPreview(false);
        setMappedData(null);
        
        // Show stats and keep loading until parent confirms refresh is complete
        setUploadStats(result.stats);
        
        // Wait for the parent's refresh to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else {
        setError(t('workspace.organisation.patientList.uploadModal.errors.uploadFailed'));
      }
    } catch (error) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.uploadFailed'));
    } finally {
      setIsFullScreenLoading(false);
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

  // Get unique fields from existing patients (excluding standard and internal fields)
  const getExistingCustomFields = () => {
    const standardFields = ['customerName', 'dateOfBirth', 'phoneNumber'];
    const internalFields = ['id', 'lastScheduled']; // Fields that shouldn't be shown in mapping
    const excludedFields = [...standardFields, ...internalFields];
    
    const customFields = new Set();
    
    patientList.forEach(patient => {
      Object.keys(patient).forEach(field => {
        if (!excludedFields.includes(field)) {
          customFields.add(field);
        }
      });
    });
    
    return Array.from(customFields);
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
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-text-secondary">
              {t('workspace.organisation.patientList.loading')}
            </p>
          </div>
        </div>
      ) : (
        <>
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
              {patientList && patientList.length > 0 ? (
                <PatientListPreview 
                  patients={patientList}
                  onEdit={(patient) => setEditingPatient(patient)}
                  onDelete={(patient) => handleDeletePatient(patient)}
                />
              ) : (
                <div className="text-center text-text-secondary py-8">
                  {t('workspace.organisation.patientList.noPatients')}
                </div>
              )}
            </div>
          </div>

          {/* Upload Modal */}
          {isUploadModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-bg-elevated rounded-lg max-w-3xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text-primary">Update Patient List</h3>
                  <button 
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      handleRemoveFile();
                      setShowMappingPreview(false);
                      setShowDataPreview(false);
                    }} 
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
                          accept=".csv,.xlsx,.xls"
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

                {/* Column Mapping */}
                {csvFile && csvPreview && !showDataPreview && (
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

                    <ColumnMappingPreview 
                      csvColumns={csvPreview.headers}
                      onCancel={handleRemoveFile}
                      onContinue={handleMappingContinue}
                      existingFields={getExistingCustomFields()}
                    />
                  </div>
                )}

                {/* Data Preview */}
                {showDataPreview && mappedData && (
                  <DataPreview 
                    mappedData={mappedData}
                    onBack={() => {
                      setShowDataPreview(false);
                      setMappedData(null);
                    }}
                    onConfirm={handleUploadConfirm}
                    isUploading={isUploading}
                  />
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

          {isFullScreenLoading && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-white text-lg">
                  {t('workspace.organisation.patientList.preview.uploading')}
                </p>
              </div>
            </div>
          )}

          {uploadStats && (
            <UploadStats 
              stats={uploadStats} 
              onClose={() => setUploadStats(null)} 
            />
          )}
        </>
      )}
    </section>
  );
}; 