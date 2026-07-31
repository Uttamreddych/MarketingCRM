import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext(null);

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    // Load the active company set during login
    const stored = localStorage.getItem('activeCompany');
    if (stored) {
      try {
        setCompany(JSON.parse(stored));
      } catch (e) {
        console.warn('Could not parse activeCompany from localStorage');
      }
    }
  }, []);

  const updateCompany = (newCompany) => {
    setCompany(newCompany);
    localStorage.setItem('activeCompany', JSON.stringify(newCompany));
  };

  return (
    <CompanyContext.Provider value={{ company, updateCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => useContext(CompanyContext);
