
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type DemandSchema, type ListingSchema } from '@/lib/schema';
import { type User } from './auth-context';
import { useToast } from '@/hooks/use-toast';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
export type AgentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Hold';
export type ListingStatus = 'pending' | 'approved' | 'rejected';


export type Submission = {
    submissionId: string;
    listingId: string;
    demandId: string;
    providerEmail: string;
    isNew?: boolean;
    demandUserEmail?: string;
    status: SubmissionStatus;
}

export type ViewedByRecord = {
  name: string;
  company: string;
  timestamp: number;
};

export type DownloadedByRecord = {
  name: string;
  company: string;
  timestamps: number[];
};


export type ListingAnalytics = {
  listingId: string;
  views: number;
  downloads: number;
  customerIndustries: Record<string, number>;
  downloadedBy?: DownloadedByRecord[];
  viewedBy?: ViewedByRecord[];
};

export type DownloadRecord = {
    userId: string;
    listingId: string;
    location: string;
    timestamp: number;
}

type DataEvent = {
  type: 'new_demand' | 'new_submission' | 'new_listing' | 'download_limit_exceeded';
  id: string; // The ID of the demand, submission, or user email
  timestamp: string;
  triggeredBy: string | undefined; // The email of the user who triggered the event
};

type DataContextType = {
  listings: ListingSchema[];
  addListing: (listing: ListingSchema, userEmail?: string) => void;
  updateListing: (listing: ListingSchema) => void;
  updateListingStatus: (listingId: string, status: ListingStatus) => void;
  listingAnalytics: ListingAnalytics[];
  logListingView: (user: User, listingId: string) => void;

  demands: DemandSchema[];
  addDemand: (demand: DemandSchema, userEmail?: string) => void;
  updateDemand: (demand: DemandSchema) => void;
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'status' | 'submissionId'>, userEmail?: string) => void;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus) => void;
  shortlistedItems: Submission[];
  toggleShortlist: (submission: Submission) => void;
  clearNewSubmissions: (submissionIds: string[]) => void;
  lastEvent: DataEvent | null;
  agentLeads: AgentLead[];
  addAgentLead: (lead: Omit<AgentLead, 'id' | 'status'>) => void;
  updateAgentLeadStatus: (leadId: string, status: AgentStatus) => void;
  isLoading: boolean;
  logDownload: (userId: string) => { success: boolean; limitReached: boolean };
  selectedForDownload: ListingSchema[];
  toggleSelectedForDownload: (listing: ListingSchema) => { limitReached: boolean };
  clearSelectedForDownload: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export type AgentLead = {
  id: string;
  agentType: 'Individual' | 'Company';
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  socialProfileId: string;
  status: AgentStatus;
};


export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [listings, setListings] = useState<ListingSchema[]>([]);
  const [listingAnalytics, setListingAnalytics] = useState<ListingAnalytics[]>([]);
  const [demands, setDemands] = useState<DemandSchema[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lastEvent, setLastEvent] = useState<DataEvent | null>(null);
  const [agentLeads, setAgentLeads] = useState<AgentLead[]>([]);
  const [shortlistedItems, setShortlistedItems] = useState<Submission[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);
  const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        try {
            const [
                listingsRes,
                demandsRes,
                submissionsRes,
                agentLeadsRes,
                analyticsRes
            ] = await Promise.all([
                fetch('/api/listings'),
                fetch('/api/demands'),
                fetch('/api/submissions'),
                fetch('/api/agent-leads'),
                fetch('/api/listing-analytics')
            ]);

            const listingsData = await listingsRes.json();
            const demandsData = await demandsRes.json();
            const submissionsData = await submissionsRes.json();
            const agentLeadsData = await agentLeadsRes.json();
            const analyticsData = await analyticsRes.json();


            setListings(listingsData);
            setDemands(demandsData);
            setSubmissions(submissionsData);
            setAgentLeads(agentLeadsData);
            setListingAnalytics(analyticsData);
            
            localStorage.setItem('warehouseorigin_agent_leads', JSON.stringify(agentLeadsData));

        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setIsLoading(false);
        }
    }

    fetchData();
    
    try {
        const storedLeads = localStorage.getItem('warehouseorigin_agent_leads');
        if (storedLeads) setAgentLeads(JSON.parse(storedLeads));
        const storedDownloads = localStorage.getItem('warehouseorigin_downloads');
        if(storedDownloads) setDownloadHistory(JSON.parse(storedDownloads));

    } catch (e) {
        console.error("Failed to parse data from local storage", e);
    }
  }, []);

  const addListing = (listing: ListingSchema, userEmail?: string) => {
    const newListings = [{ ...listing, status: 'pending' as const }, ...listings];
    setListings(newListings);
    setLastEvent({
      type: 'new_listing',
      id: listing.listingId,
      timestamp: new Date().toISOString(),
      triggeredBy: userEmail,
    });
  }

  const updateListing = (updatedListing: ListingSchema) => {
    setListings(prev => prev.map(l => l.listingId === updatedListing.listingId ? updatedListing : l));
  }

  const updateListingStatus = (listingId: string, status: ListingStatus) => {
    setListings(prev => prev.map(l => l.listingId === listingId ? { ...l, status } : l));
  }


  const persistAgentLeads = (updatedLeads: AgentLead[]) => {
      setAgentLeads(updatedLeads);
      localStorage.setItem('warehouseorigin_agent_leads', JSON.stringify(updatedLeads));
  }

  const addAgentLead = (lead: Omit<AgentLead, 'id' | 'status'>) => {
      const newLead: AgentLead = { 
        ...lead, 
        id: `AGENT-${Date.now()}`, 
        status: 'Pending' 
      };
      const updatedLeads = [newLead, ...agentLeads];
      persistAgentLeads(updatedLeads);
  }

  const updateAgentLeadStatus = (leadId: string, status: AgentStatus) => {
    const updatedLeads = agentLeads.map(lead => lead.id === leadId ? { ...lead, status } : lead);
    persistAgentLeads(updatedLeads);
  };

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

  const addSubmission = (submission: Omit<Submission, 'status' | 'submissionId'>, userEmail?: string) => {
    const demand = demands.find(d => d.demandId === submission.demandId);
    const submissionWithDefaults: Submission = {
        ...submission,
        submissionId: `SUB-${Date.now()}`,
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

  const updateSubmissionStatus = (submissionId: string, status: SubmissionStatus) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.submissionId === submissionId ? { ...sub, status, isNew: status === 'Approved' ? true : sub.isNew } : sub
      )
    );
    if (status === 'Rejected') {
      setShortlistedItems(prev => prev.filter(item => item.submissionId !== submissionId));
    }
  };

  const toggleShortlist = (submissionToToggle: Submission) => {
    if (submissionToToggle.status !== 'Approved') return;

    setShortlistedItems((prev) => {
      const isShortlisted = prev.some(
        (item) => item.submissionId === submissionToToggle.submissionId
      );
      if (isShortlisted) {
        return prev.filter(
          (item) => item.submissionId !== submissionToToggle.submissionId
        );
      } else {
        return [...prev, submissionToToggle];
      }
    });
  };

  const clearNewSubmissions = (submissionIds: string[]) => {
    const idsToClear = new Set(submissionIds);
    setSubmissions(prev => 
        prev.map(sub => 
            idsToClear.has(sub.submissionId) ? { ...sub, isNew: false } : sub
        )
    );
  };
  
  const getTodaysTotalDownloads = (userId: string): number => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const downloadEntries = downloadHistory.filter(d => d.userId === userId && d.timestamp >= startOfDay);
    const uniqueTimestamps = new Set(downloadEntries.map(d => d.timestamp));
    return uniqueTimestamps.size;
  };

  const logDownload = (userId: string): { success: boolean; limitReached: boolean } => {
    const todaysTotalDownloads = getTodaysTotalDownloads(userId);

    if (todaysTotalDownloads >= 2) {
        setLastEvent({
            type: 'download_limit_exceeded',
            id: userId,
            timestamp: new Date().toISOString(),
            triggeredBy: userId,
        });
        toast({
            variant: "destructive",
            title: "Daily Download Limit Reached",
            description: "You have already downloaded twice today. Please try again tomorrow.",
        });
        return { success: false, limitReached: true };
    }
    
    const newRecord: DownloadRecord = {
        userId,
        listingId: "batch_download",
        location: "multiple",
        timestamp: new Date().getTime(),
    };
    
    const updatedHistory = [...downloadHistory, newRecord];
    setDownloadHistory(updatedHistory);
    localStorage.setItem('warehouseorigin_downloads', JSON.stringify(updatedHistory));

    return { success: true, limitReached: false };
  }

  const logListingView = React.useCallback((user: User, listingId: string) => {
    setListingAnalytics(prevAnalytics => {
      const newAnalytics = prevAnalytics.map(analytic => {
        if (analytic.listingId === listingId) {
          const newViewer: ViewedByRecord = {
            name: user.userName,
            company: user.companyName,
            timestamp: Date.now(),
          };

          const existingViewers = analytic.viewedBy || [];
          const viewerIndex = existingViewers.findIndex(v => v.name === newViewer.name && v.company === newViewer.company);
          
          let updatedViewers;
          if (viewerIndex > -1) {
            updatedViewers = [...existingViewers];
            updatedViewers[viewerIndex] = newViewer;
          } else {
             updatedViewers = [...existingViewers, newViewer];
          }

          return {
            ...analytic,
            views: (analytic.views || 0) + 1,
            viewedBy: updatedViewers,
          };
        }
        return analytic;
      });
      return newAnalytics;
    });
  }, []);

  const toggleSelectedForDownload = (listing: ListingSchema): { limitReached: boolean } => {
    const isSelected = selectedForDownload.some(item => item.listingId === listing.listingId);

    if (isSelected) {
      setSelectedForDownload(prev => prev.filter(item => item.listingId !== listing.listingId));
      return { limitReached: false };
    } else {
      if (selectedForDownload.length >= 5) {
        return { limitReached: true };
      }
      setSelectedForDownload(prev => [...prev, listing]);
      return { limitReached: false };
    }
  };


  const clearSelectedForDownload = () => {
    setSelectedForDownload([]);
  };

  return (
    <DataContext.Provider value={{ 
        listings, addListing, updateListing, updateListingStatus, listingAnalytics, logListingView,
        demands, addDemand, updateDemand, submissions, addSubmission, updateSubmissionStatus, shortlistedItems, toggleShortlist, clearNewSubmissions, lastEvent, agentLeads, addAgentLead, updateAgentLeadStatus, isLoading,
        logDownload,
        selectedForDownload,
        toggleSelectedForDownload,
        clearSelectedForDownload,
        }}>
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
