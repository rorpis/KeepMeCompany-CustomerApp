import { useLanguage } from '../../../../lib/contexts/LanguageContext';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const MedicalSummary = ({ summary }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  
  if (!summary) {
    return <div className="text-gray-500 italic">{t('workspace.calls.modal.noData.summary')}</div>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const renderMarkdown = (text) => {
    // Split into paragraphs and skip first 3 lines
    const paragraphs = text.split('\n');
    return paragraphs.slice(3).map((paragraph, index) => {
      if (!paragraph.trim()) return null;

      // Handle headers
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold my-4">{paragraph.slice(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold my-3">{paragraph.slice(3)}</h2>;
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold my-2">{paragraph.slice(4)}</h3>;
      }

      // Handle lists
      if (paragraph.startsWith('- ')) {
        return <li key={index} className="ml-4 my-1">{paragraph.slice(2)}</li>;
      }

      // Handle *text* as bold
      const boldText = paragraph.replace(
        /\*(.*?)\*/g,
        (_, text) => `<strong>${text}</strong>`
      );

      // Regular paragraph
      return (
        <p 
          key={index} 
          className="my-2"
          dangerouslySetInnerHTML={{ __html: boldText }}
        />
      );
    }).filter(Boolean); // Remove null elements
  };

  return (
    <div className="space-y-2 text-gray-800 relative">
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        title={t('workspace.calls.modal.copyToClipboard')}
      >
        {copied ? (
          <Check className="h-6 w-6 text-green-500" />
        ) : (
          <Copy className="h-6 w-6" />
        )}
      </button>
      {renderMarkdown(summary)}
    </div>
  );
}; 