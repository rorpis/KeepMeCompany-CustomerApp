import { useState, useEffect } from 'react';
import { Upload, FileWarning, FileCheck, X } from 'lucide-react';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';

export const PatientList = ({ patientList, onUploadList }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [parsedPatients, setParsedPatients] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [columnMapping, setColumnMapping] = useState({
    nameColumn: '',
    dobColumn: ''
  });

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
          dateOfBirth: values[headers.indexOf(columnMapping.dobColumn)]
        };
      });
      setParsedPatients(patients);
    }
  }, [csvPreview, columnMapping]);

  const validateFile = (file) => {
    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file');
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
      setError("Please select both name and date of birth columns");
      return;
    }

    if (!parsedPatients || parsedPatients.length === 0) {
      setError("No valid patient data to upload");
      return;
    }

    try {
      await onUploadList(parsedPatients);
      setIsUploadModalOpen(false);
      handleRemoveFile();
    } catch (error) {
      setError("Failed to upload patient list");
    }
  };

  return (
    <section className="bg-bg-elevated rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-text-primary">Patient List</h2>
        <ActiveButton onClick={() => setIsUploadModalOpen(true)}>
          Update Patient List
        </ActiveButton>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-main">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date of Birth
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {patientList.map((patient, index) => (
              <tr key={index} className="hover:bg-bg-secondary">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                  {patient.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  {patient.dateOfBirth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <div className="grid grid-cols-2 gap-4 mb-4">
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
    </section>
  );
}; 