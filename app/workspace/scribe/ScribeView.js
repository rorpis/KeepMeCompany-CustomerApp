'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Copy, ChevronDown, Mic, MicOff } from 'lucide-react';
import { useOrganisation } from '../../../lib/contexts/OrganisationContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const ScribeInterface = () => {
  const { organisationDetails } = useOrganisation();
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState('SOAP');
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [translationActive, setTranslationActive] = useState(false);
  const contentRef = useRef(null);
  const translationRef = useRef(null);

  const templates = [
    'SOAP',
    'APSO',
    'H&P',
    'Procedure',
    'Emergency'
  ];

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'ar', name: 'Arabic' }
  ];

  const soapTemplate = `Subjective:
• 
• 

Objective:
• 
• 

Assessment:
• 
• 

Plan:
• 
• 
`;

  useEffect(() => {
    if (selectedTemplate === 'SOAP Note' && contentRef.current) {
      contentRef.current.innerHTML = soapTemplate.replace(/\n/g, '<br>');
    }
  }, [selectedTemplate]);

  const handleCopyContent = async (contentRef, buttonId) => {
    if (!contentRef.current) return;
    try {
      const text = contentRef.current.innerText;
      await navigator.clipboard.writeText(text);
      
      const button = document.querySelector(`#${buttonId}`);
      if (button) {
        const originalText = button.innerText;
        button.innerText = 'Copied!';
        setTimeout(() => {
          button.innerText = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleMainCopy = () => handleCopyContent(contentRef, 'mainCopyButton');
  const handleTranslationCopy = () => handleCopyContent(translationRef, 'translationCopyButton');

  return (
    <div className="bg-gray-50 relative">
      <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px] z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-semibold text-gray-700">
            {t('workspace.scribe.comingSoon')}
          </p>
        </div>
      </div>

      <div className="bg-black/80">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full bg-bg-secondary border border-border-main rounded p-2 text-text-primary mb-4"
            >
              <option value="">{t('workspace.scribe.patientSelect.placeholder')}</option>
              {organisationDetails?.patientList?.map((patient, index) => (
                <option key={index} value={patient.id}>
                  {patient.customerName} - {patient.dateOfBirth}
                </option>
              ))}
            </select>

            <div className="relative">
              <button 
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-gray-700 text-white font-bold"
              >
                <span>{t('workspace.scribe.template.label')}: {t(`workspace.scribe.template.types.${selectedTemplate.toLowerCase()}`)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showTemplateDropdown && (
                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                  {templates.map((template) => (
                    <button
                      key={template}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowTemplateDropdown(false);
                      }}
                    >
                      {t(`workspace.scribe.template.types.${template.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                isRecording ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>{t('workspace.scribe.recording.stop')}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>{t('workspace.scribe.recording.start')}</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (translationActive) {
                    setTranslationActive(false);
                    setSelectedLanguage('');
                  } else {
                    setShowLanguageDropdown(!showLanguageDropdown);
                  }
                }}
                className={`px-4 py-2 rounded-md ${
                  translationActive 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {translationActive 
                  ? `${t('workspace.scribe.translation.active')} ${selectedLanguage}` 
                  : t('workspace.scribe.translation.enable')}
              </button>

              {showLanguageDropdown && !translationActive && (
                <div className="absolute right-0 z-10 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder={t('workspace.scribe.translation.searchPlaceholder')}
                      className="w-full px-2 py-1 border border-gray-200 rounded"
                    />
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                      onClick={() => {
                        setSelectedLanguage(lang.name);
                        setTranslationActive(true);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 flex">
        <div className={`bg-white rounded-2xl shadow relative ${translationActive ? 'w-1/2' : 'w-full'}`}>
          <div className="p-4 h-[65vh]">
            <button 
              id="mainCopyButton"
              className="absolute top-4 right-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-white px-3 py-2 rounded-md hover:bg-gray-50"
              onClick={handleMainCopy}
            >
              <Copy className="w-5 h-5" />
              <span>{t('workspace.scribe.copyButton')}</span>
            </button>
            
            <div
              ref={contentRef}
              contentEditable
              className="w-full h-full p-4 font-mono text-lg focus:outline-none whitespace-pre-wrap overflow-y-auto text-black"
              style={{
                lineHeight: '1.5',
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: soapTemplate.replace(/\n/g, '<br>') }}
            />
          </div>
        </div>

        {translationActive && (
          <div className="w-1/2 p-4 bg-gray-50 rounded-xl mx-4 mb-4">
            <div className="bg-white border border-gray-100 rounded-xl relative h-[65vh]">
              <button 
                id="translationCopyButton"
                className="absolute top-4 right-4 flex items-center space-x-2 text-gray-600 hover:text-gray-800 bg-white px-3 py-2 rounded-md hover:bg-gray-50"
                onClick={handleTranslationCopy}
              >
                <Copy className="w-5 h-5" />
                <span>Copy All</span>
              </button>
              <div 
                ref={translationRef}
                className="p-4 h-full"
              >
                [Translation will appear here]
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScribeInterface;