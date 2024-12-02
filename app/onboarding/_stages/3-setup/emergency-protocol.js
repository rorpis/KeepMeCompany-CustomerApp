import { useState } from 'react';
import { HoverTooltip } from '@/app/_components/global_components';
import { RED_FLAG_SYMPTOMS, PROTOCOL_QUESTIONS } from '@/app/config/emergency-triage/protocol-questions';

// Component for the timeline step text
function TimelineSteps() {
  return (
    <div className="grid grid-cols-3 gap-x-4 mb-2 mt-5">
      <div className="text-center font-bold text-lg">
        Hear a Clinical Presentation
      </div>
      <div className="text-center font-bold text-lg">
        Dashboard alert<br/>
        and PoC email
      </div>
      <div className="text-center font-bold text-lg">
        Ask protocol<br/>
        questions
      </div>
    </div>
  );
}

// Component for the red flag symptoms tooltip
function RedFlagSymptoms() {
  const content = (
    <ol className="list-decimal pl-4 space-y-1">
      {RED_FLAG_SYMPTOMS.map((symptom, index) => (
        <li key={index}>{symptom}</li>
      ))}
    </ol>
  );

  return (
    <div className="mt-4 text-sm text-center italic cursor-help">
      <HoverTooltip content={content}>
        {RED_FLAG_SYMPTOMS.length} Red Flag Symptoms
      </HoverTooltip>
    </div>
  );
}

// Component for the protocol questions table
function ProtocolQuestionsTable() {
  const content = (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left pb-2">Clinical Presentation</th>
          <th className="text-left pb-2">Protocol Questions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-500">
        {Object.entries(PROTOCOL_QUESTIONS).map(([condition, questions]) => (
          <tr key={condition}>
            <td className="py-2 pr-4">{condition}</td>
            <td className="py-2">
              {questions.map((q, i) => (
                <span key={i}>
                  {q}
                  {i < questions.length - 1 && <br />}
                </span>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="mt-4 text-sm text-center italic cursor-help">
      <HoverTooltip content={content} width="w-[32rem]" position="left">
        Protocol Questions
      </HoverTooltip>
    </div>
  );
}

// Component for the timeline circles
function TimelineCircles() {
  return (
    <div className="grid grid-cols-3 gap-x-4">
      <div className="flex flex-col items-center group relative">
        <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
          1
        </div>
        <RedFlagSymptoms />
      </div>

      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
          2
        </div>
      </div>

      <div className="flex flex-col items-center group relative">
        <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
          3
        </div>
        <ProtocolQuestionsTable />
      </div>
    </div>
  );
}

// Component for the confirmation checkbox
function ConfirmationCheckbox({ confirmed, onChange }) {
  return (
    <div className="mt-8 border border-gray-700 p-6 rounded-lg">
      <label className="flex items-start gap-4 cursor-pointer">
        <input
          type="checkbox"
          className="mt-1.5 h-4 w-4 rounded border-gray-700"
          checked={confirmed}
          onChange={onChange}
          id="emergency-confirmation-checkbox"
        />
        <span className="text-sm italic">
          I understand that KeepMeCompany is solely a communications platform that facilitates 
          interactions between patients and medical practices, and not a medical service provider. 
          As a primary care centre, I acknowledge that I retain full responsibility for all clinical 
          decisions, emergency responses, and patient care coordination, including but not limited 
          to engagement with emergency services.
        </span>
      </label>
    </div>
  );
}

// Main component
export function EmergencyProtocol({ data = {}, updateData }) {
  const [confirmed, setConfirmed] = useState(false);

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setConfirmed(isChecked);
    updateData({ confirmed: isChecked });
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
      <div className="w-[90%] mx-auto">
        <TimelineSteps />
        <TimelineCircles />
      </div>
      <ConfirmationCheckbox 
        confirmed={confirmed}
        onChange={handleCheckboxChange}
      />
    </div>
  );
}