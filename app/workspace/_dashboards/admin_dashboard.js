'use client';

import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { SecondaryButton, ConditionalButton } from '@/app/_components/global_components';
import { formatNumber, parseFormattedNumber } from '@/app/_utils/number-formatting';

// Practice Information Component
function PracticeInfo({ practiceData, setPracticeData, dailyOperationCost }) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedData, setEditedData] = useState(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowEditPopup(false);
        setEditedData(null);
      }
    };

    if (showEditPopup) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEditPopup]);

  const handleEdit = () => {
    setEditedData({...practiceData});
    setShowEditPopup(true);
  };

  const handleSave = () => {
    setPracticeData(editedData);
    setShowEditPopup(false);
    setEditedData(null);
  };

  const handleCancel = () => {
    setShowEditPopup(false);
    setEditedData(null);
  };

  const hasChanges = () => {
    if (!editedData) return false;
    return Object.entries(editedData).some(([key, value]) => {
      // Handle numeric values differently from strings
      if (typeof value === 'number') {
        return value !== practiceData[key];
      }
      // Only apply trim() to string values
      return typeof value === 'string' && 
             value.trim() !== practiceData[key];
    });
  };

  const handleInputChange = (key, value) => {
    if (key === 'patients') {
      // Remove any non-digit characters except commas
      const cleanValue = value.replace(/[^\d,]/g, '');
      // Parse the cleaned value
      const numericValue = parseFormattedNumber(cleanValue);
      
      if (!isNaN(numericValue)) {
        setEditedData(prev => ({
          ...prev,
          [key]: numericValue
        }));
      }
    } else if (key === 'dailyCapacity') {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        setEditedData(prev => ({
          ...prev,
          [key]: numericValue
        }));
      }
    } else {
      setEditedData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // Add safety check for number display
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <>
      <div 
        onClick={handleEdit}
        className="border border-gray-stroke rounded-2xl p-6 hover:shadow-lg transition-all hover:scale-[1.02] relative cursor-pointer"
      >
        <div className="absolute top-4 right-4">
          <Pencil size={16} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-medium bold mb-2">{practiceData.name}</h3>
        <p className="text-gray-300">Address: {practiceData.address}</p>
        <p className="text-gray-300">Patients: {formatNumber(safeNumber(practiceData.patients))}</p>
        
        <p className="text-gray-300">Daily capacity: {safeNumber(practiceData.dailyCapacity)}</p>
        <p className="text-gray-300">
          Balance (£): {safeNumber(practiceData.balance).toFixed(1)} 
        </p>
        <div className="mt-4">
          <SecondaryButton
            onClick={() => window.location.href = '/Scriber'}
            className="w-full"
          >
            Open Scribe Interface
          </SecondaryButton>
        </div>
      </div>

      {showEditPopup && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && handleCancel()}
        >
          <div className="bg-[var(--background)] p-6 rounded-lg w-[400px]">
            <h3 className="text-xl mb-4">Edit Practice Information</h3>
            
            {Object.entries(editedData).map(([key, value]) => (
              key !== 'balance' && (
                <div 
                  key={key}
                  className="p-3 rounded-xl hover:bg-gray-stroke/20 transition-all mb-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="capitalize">{key}:</span>
                    <input
                      type={key === 'patients' ? 'text' : 
                           key === 'dailyCapacity' ? 'number' : 
                           'text'}
                      value={key === 'patients' ? formatNumber(value) : 
                             key === 'dailyCapacity' ? safeNumber(value) : 
                             value}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      step={key === 'patients' ? 1000 : 
                            key === 'dailyCapacity' ? 1 : 
                            undefined}
                      min="0"
                      className="bg-transparent border border-gray-stroke rounded px-2 py-1 ml-2"
                    />
                  </div>
                </div>
              )
            ))}

            <div className="flex justify-end gap-4 mt-6">
              <SecondaryButton onClick={handleCancel}>
                Cancel
              </SecondaryButton>
              <ConditionalButton
                onClick={handleSave}
                conditions={[
                  { 
                    check: hasChanges(),
                    message: 'No changes made'
                  }
                ]}
              >
                Save Changes
              </ConditionalButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// User Invitation Section Component
function UserInvitation({ setSelectedRole, setShowEmailPopup }) {
  return (
    <div className="border border-gray-stroke rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-semibold mb-4">Invite Users</h2>
      <div className="flex gap-4 justify-center">
        <InviteButton role="Reception" onClick={() => {
          setSelectedRole('Reception');
          setShowEmailPopup(true);
        }} />
        <InviteButton role="Admin" onClick={() => {
          setSelectedRole('Admin');
          setShowEmailPopup(true);
        }} />
      </div>
    </div>
  );
}

// Invite Button Component
function InviteButton({ role, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-40 text-center p-3 border border-gray-stroke rounded-xl hover:shadow-md transition-all hover:scale-105"
    >
      {role}
    </button>
  );
}

// Pending Tasks Component
function PendingTasks({ completedTasks, setCompletedTasks, allTasksCompleted, onAddBalanceClick }) {
  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-semibold mb-6 text-center">Pending Tasks</h2>
      <div className="space-y-8">
        <TaskList 
          completedTasks={completedTasks} 
          setCompletedTasks={setCompletedTasks}
          onAddBalanceClick={onAddBalanceClick}
        />
        <StartOperationsButton allTasksCompleted={allTasksCompleted} />
      </div>
    </div>
  );
}

// Task List Component
function TaskList({ completedTasks, setCompletedTasks, onAddBalanceClick }) {
  return (
    <div className="space-y-4 mx-auto w-[70%]">
      {Object.keys(completedTasks).map((item) => (
        <button
          key={item}
          onClick={() => {
            if (item === 'Add Balance') {
              onAddBalanceClick();
            } else {
              setCompletedTasks(prev => ({...prev, [item]: !prev[item]}));
            }
          }}
          className={`w-full text-left p-4 border border-gray-stroke rounded-3xl hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] ${
            completedTasks[item] ? 'bg-gray-stroke/20' : ''
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

// Start Operations Button Component
function StartOperationsButton({ allTasksCompleted }) {
  return (
    <div className="mx-auto w-[70%] flex justify-center">
      <ConditionalButton
        onClick={() => console.log('Start Operations')}
        conditions={[
          { 
            check: allTasksCompleted,
            message: 'Please complete all tasks before starting operations'
          }
        ]}
      >
        Start Operations
      </ConditionalButton>
    </div>
  );
}

// Email Popup Component
function EmailPopup({ showEmailPopup, selectedRole, email, setEmail, setShowEmailPopup }) {
  // Add useEffect for escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowEmailPopup(false);
      }
    };

    if (showEmailPopup) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmailPopup, setShowEmailPopup]);

  // Handle clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowEmailPopup(false);
    }
  };

  return showEmailPopup ? (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={handleBackdropClick}  // Add click handler to backdrop
    >
      <div className="bg-[var(--background)] p-6 rounded-lg w-[400px]">
        <h3 className="text-xl mb-4">Invite {selectedRole}</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="w-full p-2 mb-4 bg-transparent border border-[var(--gray)] rounded"
        />
        <div className="flex justify-end gap-4">
          <SecondaryButton onClick={() => setShowEmailPopup(false)}>
            Cancel
          </SecondaryButton>
          <ConditionalButton
            onClick={() => {
              console.log('Sending invite to:', email);
              setShowEmailPopup(false);
            }}
            conditions={[
              { 
                check: email.includes('@'),
                message: 'Please enter a valid email'
              }
            ]}
          >
            Send Invite
          </ConditionalButton>
        </div>
      </div>
    </div>
  ) : null;
}

// Main Component
export function ReadyToOperate({ 
  practiceData,
  setPracticeData,
  completedTasks,
  setCompletedTasks,
  onAddBalanceClick,
  dailyOperationCost
}) {
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  
  const allTasksCompleted = Object.values(completedTasks).every(task => task);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-[70vw] h-[65vh] p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold mb-6 text-center">Your Practice</h2>
            <div className="space-y-8">
              <PracticeInfo 
                practiceData={practiceData}
                setPracticeData={setPracticeData}
                dailyOperationCost={dailyOperationCost}
              />
              <UserInvitation 
                setSelectedRole={setSelectedRole}
                setShowEmailPopup={setShowEmailPopup}
              />
            </div>
          </div>

          {/* Right Column */}
          <PendingTasks 
            completedTasks={completedTasks}
            setCompletedTasks={setCompletedTasks}
            allTasksCompleted={allTasksCompleted}
            onAddBalanceClick={onAddBalanceClick}
          />
        </div>
      </div>

      <EmailPopup 
        showEmailPopup={showEmailPopup}
        selectedRole={selectedRole}
        email={email}
        setEmail={setEmail}
        setShowEmailPopup={setShowEmailPopup}
      />
    </div>
  );
} 