'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "../../../../lib/firebase/authContext";
import { useLanguage } from '@/lib/contexts/LanguageContext';

const ResultsTable = ({ callId, onLoadingChange }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [callData, setCallData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');

  useEffect(() => {
    const fetchCallData = async () => {
      try {
        setIsLoading(true);
        onLoadingChange?.(true);
        const idToken = await user.getIdToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer_app_api/follow_up_results`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ callId: callId }),
          }
        );
        
        const data = await response.json();
        setCallData(data);
      } catch (error) {
        console.error('Error fetching call data:', error);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    };

    if (callId) {
      fetchCallData();
    }
  }, [callId, user, onLoadingChange]);

  const renderConversationHistory = () => (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4">
        {callData.conversation_history.map((message, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'assistant' 
                ? 'bg-gray-100 mr-4' 
                : 'bg-blue-100 ml-4'
            }`}
          >
            <div className="font-semibold text-sm text-gray-600 mb-1">
              {message.role === 'assistant' 
                ? t('workspace.remoteMonitoring.results.table.assistant')
                : t('workspace.remoteMonitoring.results.table.patient')
              }
            </div>
            <div className="text-black">
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderResultsTable = () => (
    <div className="overflow-x-auto max-h-[500px]">
      <table className="w-full border-collapse rounded-lg overflow-hidden">
        <thead className="bg-gray-800">
          <tr>
            <th className="p-4 text-left font-semibold w-1/3 text-white">
              {t('workspace.remoteMonitoring.results.table.questions')}
            </th>
            <th className="p-4 text-center font-semibold text-white">
              {new Date(callData.conversation_date).toLocaleDateString(
                language === 'es' ? 'es-ES' : 'en-GB', 
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {callData.generated_follow_up_response.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="p-4 text-left font-medium text-black">
                {item.question}
              </td>
              <td className={`p-4 text-center text-black ${getCellColor(item.concern_level)}`}>
                {item.response}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) return <div>{t('workspace.remoteMonitoring.results.loading')}</div>;
  if (!callData) return <div>{t('workspace.remoteMonitoring.results.noData')}</div>;

  const getCellColor = (concern) => {
    switch (concern.toUpperCase()) {
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

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === 'results'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('results')}
        >
          {t('workspace.remoteMonitoring.results.tabs.results')}
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'conversation'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('conversation')}
        >
          {t('workspace.remoteMonitoring.results.tabs.conversation')}
        </button>
      </div>

      {activeTab === 'results' ? renderResultsTable() : renderConversationHistory()}
    </div>
  );
};

export default ResultsTable;