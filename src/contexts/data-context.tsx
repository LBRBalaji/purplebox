
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type DemandSchema, type PropertySchema } from '@/lib/schema';
import { type GetPropertyMatchScoreOutput } from '@/ai/flows/get-property-match-score';
import { mockDemands, mockSubmissions } from '@/lib/mock-data';

export type Submission = {
    demandId: string;
    property: PropertySchema;
    matchResult: GetPropertyMatchScoreOutput;
}

type DataContextType = {
  demands: DemandSchema[];
  addDemand: (demand: DemandSchema) => void;
  updateDemand: (demand: DemandSchema) => void;
  submissions: Submission[];
  addSubmission: (submission: Submission) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<DemandSchema[]>(mockDemands as DemandSchema[]);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions as Submission[]);

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
    setSubmissions((prev) => [...prev, submission]);
  };

  return (
    <DataContext.Provider value={{ demands, addDemand, updateDemand, submissions, addSubmission }}>
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
