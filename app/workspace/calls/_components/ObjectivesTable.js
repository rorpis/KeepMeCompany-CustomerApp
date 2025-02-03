'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';

const ObjectivesTable = ({ objectives }) => {
  const { t } = useLanguage();
  const currentDate = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg">
      <div className="p-4">
        <div className="space-y-2">
          {objectives.map((objective, index) => (
            <div key={index} className="grid grid-cols-1 gap-4">
              <div className="p-4 text-black bg-white border rounded-lg">
                <span className="mr-3 text-gray-500 font-medium">{index + 1}.</span>
                <span>{objective}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObjectivesTable; 