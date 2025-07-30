
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type DemandSchema, type PropertySchema } from '@/lib/schema';
import { type GetPropertyMatchScoreOutput } from '@/ai/flows/get-property-match-score';
import { mockDemands, mockSubmissions } from '@/lib/mock-data';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';

export type Submission = {
    demandId: string;
    property: PropertySchema;
    matchResult: GetPropertyMatchScoreOutput;
    isNew?: boolean;
    demandUserEmail?: string;
    status: SubmissionStatus;
}

export type AgentLead = {
    id: string;
    agentType: 'Individual' | 'Company';
    name: string;
    companyName: string;
    email: string;
    phone: string;
    address: string;
}

type DataEvent = {
  type: 'new_demand' | 'new_submission';
  id: string; // The ID of the demand or submission
  timestamp: string;
  triggeredBy: string | undefined; // The email of the user who triggered the event
};

type DataContextType = {
  demands: DemandSchema[];
  addDemand: (demand: DemandSchema, userEmail?: string) => void;
  updateDemand: (demand: DemandSchema) => void;
  submissions: Submission[];
  addSubmission: (submission: Submission, userEmail?: string) => void;
  updateSubmissionStatus: (propertyId: string, status: SubmissionStatus) => void;
  shortlistedItems: Submission[];
  toggleShortlist: (submission: Submission) => void;
  clearNewSubmissions: (propertyIds: string[]) => void;
  lastEvent: DataEvent | null;
  agentLeads: AgentLead[];
  addAgentLead: (lead: Omit<AgentLead, 'id'>) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [demands, setDemands] = useState<DemandSchema[]>(mockDemands as DemandSchema[]);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions as Submission[]);
  const [lastEvent, setLastEvent] = useState<DataEvent | null>(null);
  const [agentLeads, setAgentLeads] = useState<AgentLead[]>([]);
  const [shortlistedItems, setShortlistedItems] = useState<Submission[]>(() => {
    const initialShortlist = mockSubmissions.filter(sub => 
        (sub.property.propertyId === 'PS-ACME-001' || 
        sub.property.propertyId === 'PS-LOGI-001') && sub.status === 'Approved'
    );
    return initialShortlist as Submission[];
  });

  useEffect(() => {
    try {
        const storedLeads = localStorage.getItem('warehouseorigin_agent_leads');
        if (storedLeads) {
            setAgentLeads(JSON.parse(storedLeads));
        }
    } catch (e) {
        console.error("Failed to parse agent leads from local storage", e);
    }
  }, []);

  const persistAgentLeads = (updatedLeads: AgentLead[]) => {
      setAgentLeads(updatedLeads);
      localStorage.setItem('warehouseorigin_agent_leads', JSON.stringify(updatedLeads));
  }

  const addAgentLead = (lead: Omit<AgentLead, 'id'>) => {
      const newLead = { ...lead, id: `AGENT-${Date.now()}` };
      const updatedLeads = [newLead, ...agentLeads];
      persistAgentLeads(updatedLeads);
  }

  const addDemand = (demand: DemandSchema, userEmail?: string) => {
    setDemands((prev) => [demand, ...prev]);
    setLastEvent({
      type: 'new_demand',
      id: demand.demandId,
      timestamp: new Date().toISOString(),
      triggeredBy: userEmail,
    });
  };

  const updateDemand = (updatedDemand: DemandSchema) => {
    setDemands((prev) =>
      prev.map((demand) =>
        demand.demandId === updatedDemand.demandId ? updatedDemand : demand
      )
    );
  };

  const addSubmission = (submission: Submission, userEmail?: string) => {
    const demand = demands.find(d => d.demandId === submission.demandId);
    // All new submissions are pending
    const submissionWithDefaults: Submission = {
        ...submission,
        isNew: true,
        demandUserEmail: demand?.userEmail,
        status: 'Pending', 
    };
    setSubmissions((prev) => [submissionWithDefaults, ...prev]);
    setLastEvent({
        type: 'new_submission',
        id: submission.demandId,
        timestamp: new Date().toISOString(),
        triggeredBy: userEmail,
    });
  };

  const updateSubmissionStatus = (propertyId: string, status: SubmissionStatus) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.property.propertyId === propertyId ? { ...sub, status } : sub
      )
    );
     // If a property is rejected, remove it from the shortlist
    if (status === 'Rejected') {
      setShortlistedItems(prev => prev.filter(item => item.property.propertyId !== propertyId));
    }
  };

  const toggleShortlist = (submissionToToggle: Submission) => {
    // A customer can only shortlist an approved submission
    if (submissionToToggle.status !== 'Approved') return;

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
    <DataContext.Provider value={{ demands, addDemand, updateDemand, submissions, addSubmission, updateSubmissionStatus, shortlistedItems, toggleShortlist, clearNewSubmissions, lastEvent, agentLeads, addAgentLead }}>
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
