"use client";

import { useLanguage } from '../../lib/contexts/LanguageContext';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="bg-bg-secondary text-text-primary rounded-md border-none px-4 py-2 focus:ring-1 focus:ring-primary-blue"
    >
      <option value="en">🇬🇧</option>
      <option value="es">🇪🇸</option>
    </select>
  );
} 