import { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, FileWarning, FileCheck, X, AlertCircle } from 'lucide-react';

const STATUS_STYLES = {
  error: 'text-red-500 flex items-center gap-2',
  warning: 'text-yellow-500 bg-yellow-500/20 border border-yellow-500 rounded-md p-4 flex items-center gap-2',
  success: ''  // Using PopupMessage styling
};

function StatusMessage({ status, file, foundColumns, error }) {
  if (error) {
    return (
      <div className={STATUS_STYLES.error}>
        <FileWarning size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (!file) return null;

  if (!foundColumns.name || !foundColumns.dob) {
    return (
      <div className={STATUS_STYLES.warning}>
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>Some important columns (Name or Date of Birth) may be missing...</span>
      </div>
    );
  }
  
  return null;
}

const FileUploadZone = ({ isDragging, error, handleDrop, handleFileInput, setIsDragging }) => {
  // Create a ref for the file input
  const fileInputRef = useRef(null);

  // Handler for clicking the drop zone
  const handleZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-8
        flex flex-col items-center justify-center gap-4
        transition-all duration-200 ease-in-out
        cursor-pointer
        ${isDragging 
          ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)]/10 scale-[1.02] shadow-lg' 
          : 'border-[var(--gray)]'
        }
        ${error ? 'border-red-500' : ''}
        hover:border-[var(--primary-blue)] hover:bg-[var(--primary-blue)]/5
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={handleZoneClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInput}
      />
      <Upload 
        size={40} 
        className={`
          transition-colors duration-200
          ${isDragging ? 'text-[var(--primary-blue)]' : 'text-[var(--gray)]'}
        `} 
      />
      <div className="text-center">
        <p className={`text-lg mb-2 transition-colors duration-200 ${isDragging ? 'text-[var(--primary-blue)]' : ''}`}>
          {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
        </p>
        <p className="text-sm text-[var(--gray)]">or</p>
        <button 
          className="mt-2 text-[var(--primary-blue)] hover:underline"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double file dialog
            fileInputRef.current?.click();
          }}
        >
          Browse files
        </button>
      </div>
    </div>
  );
};

const FilePreviewHeader = ({ fileName, totalRows, onRemove }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-green-500">
        <FileCheck size={20} />
        <span>{fileName}</span>
      </div>
      <span className="text-white text-sm ml-4">
        ({totalRows.toLocaleString()} rows total)
      </span>
    </div>
    <button
      onClick={onRemove}
      className="text-[var(--gray)] hover:text-[var(--foreground)]"
    >
      <X size={20} />
    </button>
  </div>
);

const DataTable = ({ headers, rows, getHeaderClassName }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[600px] border-collapse relative">
      <thead className="sticky top-0 bg-black/30">
        <tr>
          {headers.map((header, i) => (
            <th key={i} className={getHeaderClassName(header)}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
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
);

export function PatientData({ 
  data = { 
    file: null, 
    preview: { headers: [], rows: [] },
    foundColumns: [],
    selectedColumns: {}
  }, 
  updateData, 
  onSuccess,
  onShowPopup 
}) {
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [showMissingColumnsWarning, setShowMissingColumnsWarning] = useState(false);
  const [foundColumns, setFoundColumns] = useState({ name: false, dob: false });

  const namePatterns = [
    'patient name', 'full name', 'name', 'patient',
    'lastname, firstname', 'surname, forename',
    'family name, given name', 'surname', 'lastname',
    'full patient name', 'first name', 'firstname',
    'forename', 'given name', 'last name', 'family name'
  ];

  const dobPatterns = [
    'dob', 'date of birth', 'birth date', 'dateofbirth',
    'birthdate', 'born', 'birth', 'patient dob',
    'd.o.b', 'd.o.b.', 'birth_date', 'birth-date',
    'date_of_birth', 'date-of-birth', 'birthday'
  ];

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
        setTotalRows(lines.length - 1);
        checkForRequiredColumns(headers);
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
    setTotalRows(0);
    setShowMissingColumnsWarning(false);
    setFoundColumns({ name: false, dob: false });
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const checkForRequiredColumns = (headers) => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const foundName = normalizedHeaders.some(header => 
      namePatterns.some(pattern => header.includes(pattern))
    );
    const foundDOB = normalizedHeaders.some(header => 
      dobPatterns.some(pattern => header.includes(pattern))
    );
    setFoundColumns({ name: foundName, dob: foundDOB });
    setShowMissingColumnsWarning(!foundName || !foundDOB);
  };

  const getHeaderClassName = (header) => {
    const headerLower = header.toLowerCase().trim();
    const isName = namePatterns.some(pattern => headerLower.includes(pattern));
    const isDOB = dobPatterns.some(pattern => headerLower.includes(pattern));
    return `border border-[var(--gray)] p-2 text-left ${
      isName || isDOB ? 'bg-green-500/20 text-green-500' : ''
    }`;
  };

  useEffect(() => {
    if (data.file && foundColumns.name && foundColumns.dob) {
      onSuccess?.();
    }
  }, [data.file, foundColumns, onSuccess]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <h4 className="text-center text-lg">
        To verify patients, we need a .csv or .xlsx file that includes their names and dates of birth
      </h4>

      {!data.file && (
        <FileUploadZone
          isDragging={isDragging}
          error={error}
          handleDrop={handleDrop}
          handleFileInput={handleFileInput}
          setIsDragging={setIsDragging}
        />
      )}

      <StatusMessage 
        status={status}
        file={data.file}
        foundColumns={foundColumns}
        error={error}
      />

      {data.file && !error && (
        <div className="border border-[var(--gray)] rounded-lg p-4">
          <FilePreviewHeader
            fileName={data.file.name}
            totalRows={totalRows}
            onRemove={handleRemoveFile}
          />
          
          <div className="bg-black/20 p-4 rounded">
            <h5 className="text-sm mb-4">Preview:</h5>
            <DataTable
              headers={data.preview.headers}
              rows={data.preview.rows}
              getHeaderClassName={getHeaderClassName}
            />
          </div>
        </div>
      )}
    </div>
  );
}