import { useState, useCallback } from 'react';
import { Upload, FileWarning, FileCheck, X } from 'lucide-react';
import { ActiveButton, SecondaryButton, PopupMessage } from '@/app/_components/global_components';

export function PatientData({ data = { file: null, preview: { headers: [], rows: [] } }, updateData }) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateFile = (file) => {
    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a CSV or Excel file');
      return false;
    }
    return true;
  };

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
        updateData({ file, preview: { headers, rows } });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      handleFileRead(droppedFile);
    }
  }, []);

  const handleFileInput = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) {
      handleFileRead(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    updateData({ file: null, preview: { headers: [], rows: [] } });
    setError('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = () => {
    console.log('Submit data');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <h4 className="text-center text-lg">
        To verify patients, we need a .csv or .xlsx file that includes their names and dates of birth
      </h4>

      {showSuccess && (
        <PopupMessage
          message="We've received your patient data successfully"
          type="success"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {!data.file && (
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
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
              />
            </label>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <FileWarning size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* File Preview */}
      {data.file && !error && (
        <div className="border border-[var(--gray)] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-green-500">
              <FileCheck size={20} />
              <span>{data.file.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <ActiveButton onClick={handleSubmit}>
                Submit Data
              </ActiveButton>
              <button
                onClick={handleRemoveFile}
                className="text-[var(--gray)] hover:text-[var(--foreground)]"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Table Preview */}
          <div className="bg-black/20 p-4 rounded">
            <h5 className="text-sm mb-4">Preview (first 5 rows):</h5>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse relative">
                <thead className="sticky top-0 bg-black/30">
                  <tr>
                    {data.preview.headers.map((header, i) => (
                      <th key={i} className="border border-[var(--gray)] p-2 text-left">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.preview.rows.map((row, i) => (
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
        </div>
      )}
    </div>
  );
}