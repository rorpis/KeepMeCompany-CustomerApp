"use client";

import { createContext, useContext, useState } from 'react';

const OrganisationContext = createContext();

export function OrganisationProvider({ children }) {
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  return (
    <OrganisationContext.Provider value={{ selectedOrgId, setSelectedOrgId }}>
      {children}
    </OrganisationContext.Provider>
  );
}

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error('useOrganisation must be used within an OrganisationProvider');
  }
  return context;
} 