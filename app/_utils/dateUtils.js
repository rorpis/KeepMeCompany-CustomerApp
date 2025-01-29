import { parseISO, isValid } from 'date-fns';

export const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
  /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
  /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
];

export const DATETIME_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // ISO datetime
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/, // YYYY-MM-DD HH:mm
];

export const isDateColumn = (fieldName, sampleValues) => {
  // Check field name patterns
  if (fieldName.toLowerCase().includes('date') || 
      fieldName.toLowerCase().includes('scheduled') ||
      fieldName.toLowerCase().includes('birth')) {
    return true;
  }

  // Check sample values
  return sampleValues.some(({ value }) => {
    if (!value) return false;
    
    // Try all date patterns
    const matchesPattern = [...DATE_PATTERNS, ...DATETIME_PATTERNS]
      .some(pattern => pattern.test(value));
    
    if (matchesPattern) return true;

    // Try parsing as ISO date
    try {
      const parsed = parseISO(value);
      return isValid(parsed);
    } catch {
      return false;
    }
  });
};

export const parseDate = (value) => {
  if (!value) return null;
  
  // Handle Date objects
  if (value instanceof Date) return value;
  
  // Handle Firebase timestamps
  if (value?.toDate) return value.toDate();
  
  // Try parsing as ISO date
  try {
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
  } catch {
    // Continue to other formats if ISO parsing fails
  }
  
  // Try creating a new Date
  const date = new Date(value);
  return isValid(date) ? date : null;
};