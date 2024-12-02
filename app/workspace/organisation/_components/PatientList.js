import { useState } from 'react';
import { Upload, FileWarning, FileCheck, X } from 'lucide-react';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';

export const PatientList = ({ patientList, onUploadList }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
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
        setCsvPreview({ headers, rows });
      }
    };
    reader.readAsText(file);
  };

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

    try {
      await onUploadList(csvFile, columnMapping);
      setIsUploadModalOpen(false);
      handleRemoveFile();
    } catch (error) {
      setError("Failed to upload CSV");
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6 md:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient List</h2>
        <button onClick={() => setIsUploadModalOpen(true)}>
          Update Patient List
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patientList.map((patient, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patient.customerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.DateOfBirth}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Update Patient List</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            {!csvFile && (
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8
                  flex flex-col items-center justify-center gap-4
                  ${isDragging ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10' : 'border-[var(--gray)]'}
                  ${error ? 'border-red-500' : ''}
                `}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload size={40} className="text-[var(--gray)]" />
                <div className="text-center">
                  <p className="text-lg mb-2">Drag and drop your file here</p>
                  <p className="text-sm text-[var(--gray)]">or</p>
                  <label className="mt-2 cursor-pointer text-[var(--primary-blue)] hover:underline">
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
              <div className="border border-[var(--gray)] rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-green-500">
                    <FileCheck size={20} />
                    <span>{csvFile.name}</span>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="text-[var(--gray)] hover:text-[var(--foreground)]"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Column Mapping */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name Column
                    </label>
                    <select
                      value={columnMapping.nameColumn}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        nameColumn: e.target.value
                      }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select column</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth Column
                    </label>
                    <select
                      value={columnMapping.dobColumn}
                      onChange={(e) => setColumnMapping(prev => ({
                        ...prev,
                        dobColumn: e.target.value
                      }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select column</option>
                      {csvPreview.headers.map((header, index) => (
                        <option key={index} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table Preview */}
                <div className="bg-black/20 p-4 rounded">
                  <h5 className="text-sm mb-4">Preview (first 5 rows):</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] border-collapse">
                      <thead>
                        <tr>
                          {csvPreview.headers.map((header, i) => (
                            <th key={i} className="border border-[var(--gray)] p-2 text-left">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j} className="border border-[var(--gray)] p-2">
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
                  <button onClick={() => setIsUploadModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadConfirm}
                    disabled={!csvFile || !columnMapping.nameColumn || !columnMapping.dobColumn}
                  >
                    Upload
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}; 