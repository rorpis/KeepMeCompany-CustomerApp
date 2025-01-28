import { useState } from 'react';
import { Upload, FileWarning, FileCheck, X } from 'lucide-react';
import { useLanguage } from '../../../../../lib/contexts/LanguageContext';
import * as XLSX from 'xlsx';
import ColumnMappingPreview from './ColumnMappingPreview';
import DataPreview from './DataPreview';

export const FileUploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  existingFields 
}) => {
  const { t } = useLanguage();
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [showMappingPreview, setShowMappingPreview] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [mappedData, setMappedData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileRead = (file) => {
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

  const validateFile = (file) => {
    const validExcelExtensions = ['.xlsx', '.xls'];
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/excel',
      'application/x-excel',
      'application/x-msexcel'
    ];
    
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
    setError('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
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
    setShowDataPreview(true);
  };

  const handleUploadConfirm = async () => {
    if (!mappedData || mappedData.length === 0) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.noData'));
      return;
    }

    setIsUploading(true);
    try {
      const result = await onUpload(mappedData);
      if (result.success) {
        onClose();
        handleRemoveFile();
        setShowDataPreview(false);
        setMappedData(null);
      } else {
        setError(t('workspace.organisation.patientList.uploadModal.errors.uploadFailed'));
      }
    } catch (error) {
      setError(t('workspace.organisation.patientList.uploadModal.errors.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-bg-elevated rounded-lg max-w-3xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            {t('workspace.organisation.patientList.uploadModal.title')}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
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
              <p className="text-lg mb-2 text-text-primary">
                {t('workspace.organisation.patientList.uploadModal.dragAndDrop')}
              </p>
              <p className="text-sm text-text-secondary">
                {t('workspace.organisation.patientList.uploadModal.or')}
              </p>
              <label className="mt-2 cursor-pointer text-primary-blue hover:text-primary-blue-hover">
                {t('workspace.organisation.patientList.uploadModal.browseFiles')}
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
              existingFields={existingFields}
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
  );
}; 