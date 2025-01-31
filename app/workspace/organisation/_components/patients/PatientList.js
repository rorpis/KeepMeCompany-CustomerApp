import { useState, useEffect } from 'react';
import { Upload, FileWarning, FileCheck, X, Download, UserPlus, Edit, Trash } from 'lucide-react';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import * as XLSX from 'xlsx';
import ColumnMappingPreview from './ColumnMappingPreview';
import DataPreview from './DataPreview';
import UploadStats from './UploadStats';
import { FileUploadModal } from './FileUploadModal';
import { PatientModal } from './PatientModal';
import { PatientListTable } from './PatientListTable';
import { ConfirmDialog } from '@/_components/ui/ConfirmDialog';
import { Toast } from '@/_components/ui/Toast';

export const PatientList = ({ 
  patientList, 
  onUploadList, 
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  isLoading 
}) => {
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [localPatientList, setLocalPatientList] = useState(patientList);
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [columnFilters, setColumnFilters] = useState({});

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

  useEffect(() => {
    setLocalPatientList(patientList);
  }, [patientList]);

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

  const handleUpload = async (data) => {
    setIsFullScreenLoading(true);
    try {
      const result = await onUploadList(data);
      if (result.success) {
        setUploadStats(result.stats);
        setUploadResult(result);
        setToast({
          show: true,
          message: t('workspace.organisation.patientList.messages.uploadSuccess'),
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: result.error || t('workspace.organisation.patientList.messages.uploadFailed'),
          type: 'error'
        });
      }
      setShowDataPreview(false);
      setShowMappingPreview(false);
      setIsUploadModalOpen(false);
      handleRemoveFile();
    } catch (error) {
      setToast({
        show: true,
        message: t('workspace.organisation.patientList.messages.uploadFailed'),
        type: 'error'
      });
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
    setIsAddingPatient(true);
    try {
      // Optimistically add the patient to the local list
      const tempPatient = { ...formData };
      setLocalPatientList(prevList => [...prevList, tempPatient]);

      const result = await onAddPatient(formData);
      if (result.success) {
        // Update the temporary patient with the real ID
        setLocalPatientList(prevList => 
          prevList.map(patient => 
            patient === tempPatient ? { ...patient, id: result.patientId } : patient
          )
        );
        setShowAddPatientModal(false);
        setToast({
          show: true,
          message: t('workspace.organisation.patientList.messages.addSuccess'),
          type: 'success'
        });
      } else {
        // Revert the optimistic update
        setLocalPatientList(patientList);
        setToast({
          show: true,
          message: result.error || t('workspace.organisation.patientList.messages.addFailed'),
          type: 'error'
        });
      }
    } catch (error) {
      // Revert the optimistic update
      setLocalPatientList(patientList);
      setToast({
        show: true,
        message: error.message || t('workspace.organisation.patientList.messages.addFailed'),
        type: 'error'
      });
    } finally {
      setIsAddingPatient(false);
    }
  };

  const handleEditPatient = async (updatedPatient) => {
    setIsEditing(true);
    try {
      // Optimistically update the UI
      setLocalPatientList(prevList => 
        prevList.map(patient => 
          patient.id === updatedPatient.id ? updatedPatient : patient
        )
      );

      const result = await onEditPatient(updatedPatient.id, updatedPatient);
      if (result.success) {
        setEditingPatient(null);
        setToast({
          show: true,
          message: t('workspace.organisation.patientList.messages.editSuccess'),
          type: 'success'
        });
      } else {
        // Revert the optimistic update on error
        setLocalPatientList(patientList);
        setToast({
          show: true,
          message: result.error || t('workspace.organisation.patientList.messages.editFailed'),
          type: 'error'
        });
      }
    } catch (error) {
      // Revert the optimistic update on error
      setLocalPatientList(patientList);
      setToast({
        show: true,
        message: error.message || t('workspace.organisation.patientList.messages.editFailed'),
        type: 'error'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeletePatient = async (patient) => {
    setPatientToDelete(patient);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDeletePatient([patientToDelete.id]);
      if (result.success) {
        // Optimistically update the UI
        setLocalPatientList(prevList => 
          prevList.filter(patient => patient.id !== patientToDelete.id)
        );
        setToast({
          show: true,
          message: t('workspace.organisation.patientList.messages.deleteSuccess'),
          type: 'success'
        });
      } else {
        setToast({
          show: true,
          message: t('workspace.organisation.patientList.messages.deleteFailed'),
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: t('workspace.organisation.patientList.messages.deleteFailed'),
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setPatientToDelete(null);
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

  const handleColumnFilterChange = (field, values) => {
    setColumnFilters(prev => ({
      ...prev,
      [field]: values
    }));
  };

  return (
    <section className="bg-bg-elevated rounded-lg p-6">
      {isLoading || isRefreshing ? (
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
                <PatientListTable
                  patients={localPatientList}
                  allPatients={localPatientList}
                  onEdit={handleEditPatient}
                  onDelete={handleDeletePatient}
                  showActions={true}
                  showSearch={true}
                  columnFilters={columnFilters}
                  onColumnFilterChange={handleColumnFilterChange}
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
            <FileUploadModal
              isOpen={isUploadModalOpen}
              onClose={() => {
                setIsUploadModalOpen(false);
                handleRemoveFile();
                setShowMappingPreview(false);
                setShowDataPreview(false);
              }}
              onUpload={handleUpload}
              existingFields={getExistingCustomFields()}
            />
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
              existingFields={getExistingCustomFields()}
            />
          )}

          {editingPatient && (
            <PatientModal
              patient={editingPatient}
              onSave={handleEditPatient}
              onClose={() => setEditingPatient(null)}
              isEditing={true}
              isLoading={isEditing}
              existingFields={getExistingCustomFields()}
            />
          )}

          {showDeleteConfirm && (
            <ConfirmDialog
              isOpen={showDeleteConfirm}
              onClose={() => {
                setShowDeleteConfirm(false);
                setPatientToDelete(null);
              }}
              onConfirm={confirmDelete}
              title={t('workspace.organisation.patientList.deleteConfirmTitle')}
              message={t('workspace.organisation.patientList.deleteConfirmMessage')}
              isLoading={isDeleting}
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
              onClose={() => {
                setUploadStats(null);
                if (uploadResult?.refreshOrganisationDetails) {
                  setIsRefreshing(true);
                  uploadResult.refreshOrganisationDetails().finally(() => {
                    setIsRefreshing(false);
                    setUploadResult(null);
                  });
                }
              }}
            />
          )}

          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}
        </>
      )}
    </section>
  );
}; 