

'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type DemandSchema, type ListingSchema, type TenantImprovementsSheet, type AcknowledgmentDetails } from '@/lib/schema';
import { type User } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import initialListings from '@/data/listings.json';
import initialDemands from '@/data/demands.json';
import initialSubmissions from '@/data/submissions.json';
import initialAgentLeads from '@/data/agent-leads.json';
import initialListingAnalytics from '@/data/listing-analytics.json';
import initialRegisteredLeads from '@/data/registered-leads.json';
import initialTransactionActivities from '@/data/transaction-activities.json';
import initialTenantImprovements from '@/data/tenant-improvements.json';

export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
export type AgentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Hold';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'leased';
export type RegisteredLeadStatus = 'Pending' | 'Acknowledged' | 'Rejected';
export type SiteVisitStatus = 'Planned' | 'Visited' | 'Re-Scheduled' | 'Cancelled';

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
  type: 'new_demand' | 'new_submission' | 'new_listing' | 'download_limit_exceeded' | 'listing_status_changed';
  id: string; // The ID of the demand, submission, or user email
  timestamp: string;
  triggeredBy: string | undefined; // The email of the user who triggered the event
  message?: string; // Optional message for the event
};

export type RegisteredLeadProvider = {
  providerEmail: string;
  status: RegisteredLeadStatus;
  acknowledgedAt?: string;
  rejectionReason?: string;
  acknowledgedBy?: AcknowledgmentDetails;
}

export type RegisteredLead = {
  id: string; // Unique transaction ID
  customerId: string; // The User's email (ID)
  leadName: string;
  leadContact: string;
  leadEmail: string;
  leadPhone: string;
  requirementsSummary: string;
  registeredBy: string; // email of LBO2O user
  registeredAt: string;
  providers: RegisteredLeadProvider[];
}

export type TransactionActivity = {
    activityId: string;
    leadId: string; // RegisteredLead ID
    activityType: 'Site Visit Request' | 'Site Visit Update' | 'Customer Feedback' | 'Tenant Improvements';
    details: {
        visitDateTime?: string;
        message?: string;
        status?: SiteVisitStatus;
        notes?: string;
        feedbackText?: string;
        improvementsText?: string;
    };
    createdAt: string;
    createdBy: string; // O2O/Admin user email
}


type DataContextType = {
  listings: ListingSchema[];
  addListing: (listing: ListingSchema, userEmail?: string) => void;
  updateListing: (listing: ListingSchema) => void;
  updateListingStatus: (listingId: string, status: ListingStatus, userEmail?: string) => void;
  listingAnalytics: ListingAnalytics[];
  logListingView: (user: User, listingId: string) => void;

  demands: DemandSchema[];
  addDemand: (demand: Omit<DemandSchema, 'createdAt'>, userEmail?: string) => void;
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
  registeredLeads: RegisteredLead[];
  addRegisteredLead: (lead: Omit<RegisteredLead, 'registeredAt'>) => void;
  updateRegisteredLeadStatus: (leadId: string, providerEmail: string, newStatus: RegisteredLeadStatus, details?: AcknowledgmentDetails) => void;
  transactionActivities: TransactionActivity[];
  addTransactionActivity: (activity: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => void;
  getTenantImprovements: (leadId: string) => TenantImprovementsSheet | null;
  updateTenantImprovements: (leadId: string, sheet: TenantImprovementsSheet) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export type AgentLead = {
  id: string;
  agentType: 'Individual' | 'Company' | 'Developer';
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
  const [listings, setListings] = useState<ListingSchema[]>(initialListings as ListingSchema[]);
  const [listingAnalytics, setListingAnalytics] = useState<ListingAnalytics[]>(initialListingAnalytics as ListingAnalytics[]);
  const [demands, setDemands] = useState<DemandSchema[]>(initialDemands as DemandSchema[]);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions as Submission[]);
  const [lastEvent, setLastEvent] = useState<DataEvent | null>(null);
  const [agentLeads, setAgentLeads] = useState<AgentLead[]>(initialAgentLeads as AgentLead[]);
  const [registeredLeads, setRegisteredLeads] = useState<RegisteredLead[]>(initialRegisteredLeads as RegisteredLead[]);
  const [transactionActivities, setTransactionActivities] = useState<TransactionActivity[]>(initialTransactionActivities as TransactionActivity[]);
  const [tenantImprovements, setTenantImprovements] = useState<TenantImprovementsSheet[]>(initialTenantImprovements as TenantImprovementsSheet[]);
  const [shortlistedItems, setShortlistedItems] = useState<Submission[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);
  const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This can be used if we need to load from local storage in the future
  }, [toast]);

  const persistListings = async (updatedListings: ListingSchema[]) => {
    try {
        const response = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedListings)
        });
        if (!response.ok) {
            throw new Error('Failed to save listings to the server.');
        }
        setListings(updatedListings);
    } catch (error) {
        console.error("Error persisting listings:", error);
        toast({
            variant: "destructive",
            title: "Data Sync Error",
            description: "Could not save listing changes to the server."
        });
    }
  };

  const addListing = (listing: ListingSchema, userEmail?: string) => {
    const newListings = [{ ...listing, status: 'pending' as const }, ...listings];
    persistListings(newListings);
    setLastEvent({
      type: 'new_listing',
      id: listing.listingId,
      timestamp: new Date().toISOString(),
      triggeredBy: userEmail,
    });
  }

  const updateListing = (updatedListing: ListingSchema) => {
    const newListings = listings.map(l => l.listingId === updatedListing.listingId ? { ...updatedListing, status: 'pending' as const } : l);
    persistListings(newListings);
     setLastEvent({
      type: 'new_listing',
      id: updatedListing.listingId,
      timestamp: new Date().toISOString(),
      triggeredBy: updatedListing.developerId,
    });
  }

  const updateListingStatus = (listingId: string, status: ListingStatus, userEmail?: string) => {
    let updatedListings: ListingSchema[] = [];
    setListings(prev => {
        updatedListings = prev.map(l => {
            if (l.listingId === listingId) {
                setLastEvent({
                    type: 'listing_status_changed',
                    id: listingId,
                    timestamp: new Date().toISOString(),
                    triggeredBy: userEmail,
                    message: `Listing "${l.name}" status updated to ${status}.`
                });
                return { ...l, status };
            }
            return l;
        });
        persistListings(updatedListings);
        return updatedListings;
    });
  }


  const persistAgentLeads = (updatedLeads: AgentLead[]) => {
      setAgentLeads(updatedLeads);
      // In a real app, this would be an API call. For now, we update state.
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

  const addDemand = (demand: Omit<DemandSchema, 'createdAt'>, userEmail?: string) => {
    const newDemand = { ...demand, createdAt: new Date().toISOString() };
    setDemands((prev) => [newDemand, ...prev]);
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
      const newAnalytics = [...prevAnalytics];
      let analytic = newAnalytics.find(a => a.listingId === listingId);

      if (analytic) {
        const newViewer: ViewedByRecord = {
          name: user.userName,
          company: user.companyName,
          timestamp: Date.now(),
        };

        const existingViewers = analytic.viewedBy || [];
        // Don't add a new view record if the same user viewed it very recently
        const lastView = existingViewers.find(v => v.name === newViewer.name && v.company === newViewer.company);
        const fiveMinutes = 5 * 60 * 1000;
        if (lastView && (Date.now() - lastView.timestamp < fiveMinutes)) {
            return prevAnalytics; // No change
        }

        analytic.views = (analytic.views || 0) + 1;
        analytic.viewedBy = [...existingViewers, newViewer];

      } else {
        // If no analytics record exists for this listing, create one
        analytic = {
          listingId,
          views: 1,
          downloads: 0,
          customerIndustries: {},
          viewedBy: [{ name: user.userName, company: user.companyName, timestamp: Date.now() }],
          downloadedBy: [],
        };
        newAnalytics.push(analytic);
      }
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

  const persistRegisteredLeads = (updatedLeads: RegisteredLead[]) => {
      setRegisteredLeads(updatedLeads);
      // In a real app, this would be an API call
  };

  const addRegisteredLead = (leadData: Omit<RegisteredLead, 'registeredAt'>) => {
    const newLead: RegisteredLead = {
      ...leadData,
      registeredAt: new Date().toISOString(),
    };
    const updatedLeads = [newLead, ...registeredLeads];
    persistRegisteredLeads(updatedLeads);
  };

  const updateRegisteredLeadStatus = (leadId: string, providerEmail: string, newStatus: RegisteredLeadStatus, details?: AcknowledgmentDetails) => {
    const updatedLeads = registeredLeads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          providers: lead.providers.map(provider => 
            provider.providerEmail === providerEmail 
              ? { 
                  ...provider, 
                  status: newStatus, 
                  acknowledgedAt: newStatus === 'Acknowledged' ? new Date().toISOString() : undefined,
                  acknowledgedBy: newStatus === 'Acknowledged' ? details : undefined,
                } 
              : provider
          )
        };
      }
      return lead;
    });
    persistRegisteredLeads(updatedLeads);
  };
  
  const persistActivities = (updatedActivities: TransactionActivity[]) => {
      setTransactionActivities(updatedActivities);
      // In a real app, this would be an API call
  }

  const addTransactionActivity = (activityData: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
      const newActivity: TransactionActivity = {
          ...activityData,
          activityId: `ACT-${Date.now()}`,
          createdAt: new Date().toISOString(),
      };
      const updatedActivities = [newActivity, ...transactionActivities];
      persistActivities(updatedActivities);
  };
  
  const persistTenantImprovements = (updatedSheets: TenantImprovementsSheet[]) => {
    setTenantImprovements(updatedSheets);
    // In a real app, this would be an API call
  }
  
  const getTenantImprovements = (leadId: string): TenantImprovementsSheet | null => {
    return tenantImprovements.find(sheet => sheet.leadId === leadId) || null;
  }
  
  const updateTenantImprovements = (leadId: string, sheetData: TenantImprovementsSheet) => {
    const existingSheet = getTenantImprovements(leadId);
    let updatedSheets: TenantImprovementsSheet[];

    if (existingSheet) {
      updatedSheets = tenantImprovements.map(sheet => sheet.leadId === leadId ? sheetData : sheet);
    } else {
      updatedSheets = [...tenantImprovements, sheetData];
    }
    
    persistTenantImprovements(updatedSheets);
    toast({
        title: "Improvements Sheet Saved",
        description: "Your changes have been saved successfully.",
    });
  }


  return (
    <DataContext.Provider value={{ 
        listings, addListing, updateListing, updateListingStatus, listingAnalytics, logListingView,
        demands, addDemand, updateDemand, submissions, addSubmission, updateSubmissionStatus, shortlistedItems, toggleShortlist, clearNewSubmissions, lastEvent, agentLeads, addAgentLead, updateAgentLeadStatus, isLoading,
        logDownload,
        selectedForDownload,
        toggleSelectedForDownload,
        clearSelectedForDownload,
        registeredLeads,
        addRegisteredLead,
        updateRegisteredLeadStatus,
        transactionActivities,
        addTransactionActivity,
        getTenantImprovements,
        updateTenantImprovements
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
