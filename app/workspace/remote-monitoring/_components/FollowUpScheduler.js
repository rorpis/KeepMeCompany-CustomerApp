'use client';

import { useState } from 'react';
import { useOrganisation } from '../../../../lib/contexts/OrganisationContext';
import { ActiveButton, SecondaryButton } from '@/app/_components/global_components';
import { useAuth } from '../../../../lib/firebase/authContext';


export const FollowUpScheduler = () => {
  const { organisationDetails } = useOrganisation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [objectives, setObjectives] = useState('');
  const [questions, setQuestions] = useState([]);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const { getIdToken } = useAuth();

  const handleScheduleCall = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/schedule_follow_up_call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getIdToken()}`
        },
        body: JSON.stringify({
          organisationId: organisationDetails.id,
          patientId: selectedPatient,
          scheduledFor: scheduledDateTime,
          objectives: objectives.split('\n').filter(obj => obj.trim()),
          questions: questions.map(q => q.text),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule follow-up call');
      }

      const data = await response.json();
      
      // Reset form and show success message
      setCurrentStep(1);
      setSelectedPatient('');
      setObjectives('');
      setQuestions([]);
      setScheduledDateTime('');
      
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-bg-elevated rounded-lg p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-text-primary">Schedule Follow-up Call</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-primary-blue' : 'bg-border-main'}`} />
          <span className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-primary-blue' : 'bg-border-main'}`} />
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 1: Select Patient</h3>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
          >
            <option value="">Select a patient</option>
            {organisationDetails?.patientList?.map((patient, index) => (
              <option key={index} value={patient.id}>
                {patient.customerName} - {patient.dateOfBirth}
              </option>
            ))}
          </select>
          <div className="flex justify-end mt-6">
            <ActiveButton
              onClick={() => setCurrentStep(2)}
              disabled={!selectedPatient}
            >
              Next
            </ActiveButton>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <QuestionSetup questions={questions} setQuestions={setQuestions} setCurrentStep={setCurrentStep} />
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">Step 3: Schedule Call</h3>
          <input
            type="datetime-local"
            value={scheduledDateTime}
            onChange={(e) => setScheduledDateTime(e.target.value)}
            className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary"
          />
          <div className="flex justify-between mt-6">
            <SecondaryButton onClick={() => setCurrentStep(2)}>
              Back
            </SecondaryButton>
            <ActiveButton
              onClick={handleScheduleCall}
              disabled={!scheduledDateTime}
            >
              Schedule Follow-up
            </ActiveButton>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionSetup = ({ questions, setQuestions, setCurrentStep }) => {
  const [newQuestion, setNewQuestion] = useState('');

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, { text: newQuestion }]);
      setNewQuestion('');
    }
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary mb-4">Step 2: Confirm questions</h2>
      
      {/* Existing questions */}
      <div className="space-y-2">
        {questions.map((question, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="bg-bg-elevated p-3 rounded-lg flex-grow">
              {question.text}
            </div>
            <button
              onClick={() => removeQuestion(index)}
              className="text-text-secondary hover:text-text-primary"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new question */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter a new question"
          className="flex-grow bg-bg-elevated p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
        />
        <SecondaryButton onClick={addQuestion}>
          Add
        </SecondaryButton>
      </div>

      <div className="flex justify-between mt-6">
        <SecondaryButton onClick={() => setCurrentStep(1)}>
          Back
        </SecondaryButton>
        <ActiveButton
          onClick={() => setCurrentStep(3)}
          disabled={questions.length === 0}
        >
          Next
        </ActiveButton>
      </div>
    </div>
  );
};