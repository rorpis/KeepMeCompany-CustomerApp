import React from 'react';
import { Card } from '@/components/ui/card';
const ResultsTable = () => {
  // CURRENT: Hardcoded data structure
  // FUTURE: This will be received as a prop from the backend API
  const sampleData = {
    dates: ['Tuesday Nov 2nd', 'Thursday Nov 5th'],
    data: [
      {
        question: "How is your pain level on a scale from 0-10, and are you following the pain management schedule we provided?",
        responses: [
          {
            date: 'Tuesday Nov 2nd',
            text: "Pain 3-4/10, full medication compliance",
            concern: "LOW"
          },
          {
            date: 'Thursday Nov 5th',
            text: null,
            concern: "HIGH"
          }
        ]
      },
      {
        question: "Have you noticed any changes in the color, swelling, or discharge around the surgical site?",
        responses: [
          {
            date: 'Tuesday Nov 2nd',
            text: "Spreading erythema, warmth, yellow discharge at incision",
            concern: "HIGH"
          },
          {
            date: 'Thursday Nov 5th',
            text: "Redness reduced, minimal clear discharge",
            concern: null
          }
        ]
      },
      {
        question: "Are you doing the prescribed physical therapy exercises twice daily?",
        responses: [
          {
            date: 'Tuesday Nov 2nd',
            text: "3 sessions total since discharge, non-compliant due to pain fear",
            concern: "HIGH"
          },
          {
            date: 'Thursday Nov 5th',
            text: "Started morning sessions, still skipping evening",
            concern: "MEDIUM"
          }
        ]
      },
      {
        question: "Have you been using the crutches as instructed - no weight bearing on the operated leg?",
        responses: [
          {
            date: 'Tuesday Nov 2nd',
            text: "Full compliance with non-weight bearing and proper crutch use",
            concern: "LOW"
          }
          // Missing response for Thursday
        ]
      },
      {
        question: "How is your sleep - are you able to rest through the night?",
        responses: [
          {
            date: 'Tuesday Nov 2nd',
            text: "Severe sleep disruption, hourly waking, 2-3hrs total sleep",
            concern: "HIGH"
          },
          {
            date: 'Thursday Nov 5th',
            text: "4-5 hours continuous sleep achieved",
            concern: "LOW"
          }
        ]
      }
    ]
  };
  // Determines cell background color based on concern level
  const getCellColor = (concern) => {
    switch (concern) {
      case 'HIGH':
        return 'bg-red-100';
      case 'LOW':
        return 'bg-green-100';
      case 'MEDIUM':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-50';
    }
  };
  // Find response for a specific question and date
  const findResponse = (questionData, date) => {
    return questionData.responses.find(r => r.date === date);
  };
  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-4 text-left font-semibold w-1/3">Questions</th>
              {sampleData.dates.map((date, index) => (
                <th key={index} className="p-4 text-center font-semibold">
                  {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleData.data.map((questionData, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="p-4 text-left font-medium">
                  {questionData.question}
                </td>
                {sampleData.dates.map((date, j) => {
                  const response = findResponse(questionData, date);
                  if (!response || !response.text || !response.concern) {
                    return (
                      <td key={j} className="p-4 text-center bg-gray-50">
                        -
                      </td>
                    );
                  }
                  return (
                    <td 
                      key={j} 
                      className={`p-4 text-center ${getCellColor(response.concern)}`}
                    >
                      {response.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
export default ResultsTable;