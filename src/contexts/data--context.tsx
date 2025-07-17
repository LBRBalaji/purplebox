
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type DemandSchema, type PropertySchema } from '@/lib/schema';
import { type GetPropertyMatchScoreOutput } from '@/ai/flows/get-property-match-score';
import { mockDemands, mockSubmissions } from '@/lib/mock-data';

export type Submission = {
    demandId: string;
    property: PropertySchema;
    matchResult: GetPropertyMatchScoreOutput;
    isNew?: boolean;
    demandUserEmail?: string;
}

type DataContextType = {
  demands: DemandSchema[];
  addDemand: (demand: DemandSchema) => void;
  updateDemand: (demand: DemandSchema) => void;
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
  shortlistedItems: Submission[];
  toggleShortlist: (submission: Submission) => void;
  clearNewSubmissions: (propertyIds: string[]) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<DemandSchema[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [shortlistedItems, setShortlistedItems] = useState<Submission[]>([]);

  useEffect(() => {
    const loadedDemands = (mockDemands as DemandSchema[]).map(d => ({
        ...d,
        userEmail: d.userEmail || 'user@example.com' 
    }));
    setDemands(loadedDemands);

    const loadedSubmissions = (mockSubmissions as Submission[]).map((sub, index) => {
        const demand = loadedDemands.find(d => d.demandId === sub.demandId);
        return {
            ...sub,
            demandUserEmail: demand?.userEmail,
            // Mark the first two submissions for the default user as "new" for testing
            isNew: demand?.userEmail === 'user@example.com' && (index === 0 || index === 1)
        }
    });
    setSubmissions(loadedSubmissions);

    const initialShortlist = loadedSubmissions.filter(sub => 
        sub.property.propertyId === 'PS-ACME-001' || 
        sub.property.propertyId === 'PS-LOGI-001'
    );
    setShortlistedItems(initialShortlist);

  }, []);


  const addDemand = (demand: DemandSchema) => {
    setDemands((prev) => [...prev, demand]);
  };

  const updateDemand = (updatedDemand: DemandSchema) => {
    setDemands((prev) =>
      prev.map((demand) =>
        demand.demandId === updatedDemand.demandId ? updatedDemand : demand
      )
    );
  };

  const addSubmission = (submission: Submission) => {
    const demand = demands.find(d => d.demandId === submission.demandId);
    const submissionWithNewFlag: Submission = {
        ...submission,
        isNew: true,
        demandUserEmail: demand?.userEmail
    };
    setSubmissions((prev) => [...prev, submissionWithNewFlag]);
  };

  const toggleShortlist = (submissionToToggle: Submission) => {
    setShortlistedItems((prev) => {
      const isShortlisted = prev.some(
        (item) => item.property.propertyId === submissionToToggle.property.propertyId
      );
      if (isShortlisted) {
        return prev.filter(
          (item) => item.property.propertyId !== submissionToToggle.property.propertyId
        );
      } else {
        return [...prev, submissionToToggle];
      }
    });
  };

  const clearNewSubmissions = (propertyIds: string[]) => {
    setSubmissions(prev => 
        prev.map(sub => 
            propertyIds.includes(sub.property.propertyId) ? { ...sub, isNew: false } : sub
        )
    );
  }

  return (
    <DataContext.Provider value={{ demands, addDemand, updateDemand, submissions, addSubmission, shortlistedItems, toggleShortlist, clearNewSubmissions }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
