
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type DemandSchema, type ListingSchema, type TenantImprovementsSheet, type NegotiationBoardSchema, type AcknowledgmentDetails, type LayoutRequestData } from '@/lib/schema';
import { type User, useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, startOfDay } from 'date-fns';

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

export type DownloadedByRecord = {
  name: string;
  company: string;
  timestamps: number[];
};

export type ViewedByRecord = {
    userId: string;
    name: string;
    company: string;
    timestamp: number;
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
    companyName: string;
    listingId: string;
    location: string;
    timestamp: number;
}

export type ViewRecord = {
    userId: string;
    companyName: string;
    listingId: string;
    timestamp: number;
}

export type LayoutRequestRecord = LayoutRequestData & {
  id: string;
  requestedAt: string;
};


export type AcknowledgmentRecord = {
    userId: string;
    timestamp: number;
};

type DataEvent = {
  type: 'new_demand' | 'new_submission' | 'new_listing' | 'download_limit_exceeded' | 'listing_status_changed' | 'new_lead_for_provider';
  id: string; // The ID of the demand, submission, or user email
  timestamp: string;
  triggeredBy: string | undefined; // The email of the user who triggered the event
  message?: string; // Optional message for the event
};

export type RegisteredLeadProperty = {
  listingId: string;
  status: RegisteredLeadStatus;
  acknowledgedAt?: string;
  rejectionReason?: string;
  acknowledgedBy?: AcknowledgmentDetails;
  rentPerSft?: number;
  rentalSecurityDeposit?: number;
  actualChargeableArea?: number;
}

export type RegisteredLeadProvider = {
  providerEmail: string;
  properties: RegisteredLeadProperty[];
}

export type RegisteredLead = {
  id: string; // Unique transaction ID
  customerId: string; // The User's email (ID)
  agentId?: string; // Optional agent email
  leadName: string;
  leadContact: string;
  leadEmail: string;
  leadPhone: string;
  requirementsSummary: string;
  registeredBy: string; // email of LBO2O user
  registeredAt: string;
  providers: RegisteredLeadProvider[];
  isO2OCollaborator?: boolean;
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

export type AboutUsContent = {
    feature1: string;
    feature2: string;
    feature3: string;
    originStory: string;
};

export type LocationCircle = {
  name: string;
  locations: string[];
};

export type ChatMessage = {
    senderEmail: string;
    senderName: string;
    text: string;
    timestamp: string;
};

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
  logDownload: (user: User, listings: ListingSchema[]) => { success: boolean; limitReached: boolean; message: string };
  selectedForDownload: ListingSchema[];
  toggleSelectedForDownload: (listing: ListingSchema) => { limitReached: boolean };
  clearSelectedForDownload: () => void;
  registeredLeads: RegisteredLead[];
  addRegisteredLead: (lead: Omit<RegisteredLead, 'registeredAt'>, userEmail?: string) => void;
  updateRegisteredLead: (lead: RegisteredLead) => void;
  transactionActivities: TransactionActivity[];
  addTransactionActivity: (activity: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => void;
  getTenantImprovements: (leadId: string) => TenantImprovementsSheet | null;
  updateTenantImprovements: (leadId: string, sheet: TenantImprovementsSheet) => void;
  getNegotiationBoard: (leadId: string) => NegotiationBoardSchema | null;
  updateNegotiationBoard: (leadId: string, sheet: NegotiationBoardSchema) => void;
  generalShortlist: string[]; // Array of listingIds
  toggleGeneralShortlist: (listingId: string) => void;
  isShortlistLoading: boolean;
  aboutUsContent: AboutUsContent | null;
  updateAboutUsContent: (newContent: AboutUsContent) => void;
  locationCircles: LocationCircle[];
  downloadAcknowledgments: AcknowledgmentRecord[];
  logAcknowledgment: (userId: string) => void;
  viewHistory: ViewRecord[];
  layoutRequests: LayoutRequestRecord[];
  addLayoutRequest: (request: LayoutRequestData) => void;
  chatMessages: Record<string, ChatMessage[]>;
  addChatMessage: (threadId: string, message: ChatMessage) => Promise<void>;
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
  const { user: authUser, users: allUsers } = useAuth();
  const [listings, setListings] = useState<ListingSchema[]>([]);
  const [listingAnalytics, setListingAnalytics] = useState<ListingAnalytics[]>([]);
  const [demands, setDemands] = useState<DemandSchema[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [lastEvent, setLastEvent] = useState<DataEvent | null>(null);
  const [agentLeads, setAgentLeads] = useState<AgentLead[]>([]);
  const [registeredLeads, setRegisteredLeads] = useState<RegisteredLead[]>([]);
  const [transactionActivities, setTransactionActivities] = useState<TransactionActivity[]>([]);
  const [tenantImprovements, setTenantImprovements] = useState<TenantImprovementsSheet[]>([]);
  const [negotiationBoards, setNegotiationBoards] = useState<NegotiationBoardSchema[]>([]);
  const [shortlistedItems, setShortlistedItems] = useState<Submission[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadRecord[]>([]);
  const [viewHistory, setViewHistory] = useState<ViewRecord[]>([]);
  const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generalShortlist, setGeneralShortlist] = useState<string[]>([]);
  const [isShortlistLoading, setIsShortlistLoading] = useState(true);
  const [aboutUsContent, setAboutUsContent] = useState<AboutUsContent | null>(null);
  const [locationCircles, setLocationCircles] = useState<LocationCircle[]>([]);
  const [downloadAcknowledgments, setDownloadAcknowledgments] = useState<AcknowledgmentRecord[]>([]);
  const [layoutRequests, setLayoutRequests] = useState<LayoutRequestRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

   useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      try {
        const [
          listingsRes,
          demandsRes,
          submissionsRes,
          agentLeadsRes,
          analyticsRes,
          registeredLeadsRes,
          activitiesRes,
          tenantImprovementsRes,
          negotiationBoardsRes,
          aboutUsContentRes,
          locationCirclesRes,
          acknowledgmentsRes,
          downloadHistoryRes,
          viewHistoryRes,
          layoutRequestsRes,
          chatMessagesRes,
        ] = await Promise.all([
          fetch('/api/listings'),
          fetch('/api/demands'),
          fetch('/api/submissions'),
          fetch('/api/agent-leads'),
          fetch('/api/listing-analytics'),
          fetch('/api/registered-leads'),
          fetch('/api/transaction-activities'),
          fetch('/api/tenant-improvements'),
          fetch('/api/negotiation-boards'),
          fetch('/api/about-us-content'),
          fetch('/api/location-circles'),
          fetch('/api/download-acknowledgments'),
          fetch('/api/download-history'),
          fetch('/api/view-history'),
          fetch('/api/layout-requests'),
          fetch('/api/chat-messages'),
        ]);

        setListings(await listingsRes.json());
        setDemands(await demandsRes.json());
        setSubmissions(await submissionsRes.json());
        setAgentLeads(await agentLeadsRes.json());
        setListingAnalytics(await analyticsRes.json());
        setRegisteredLeads(await registeredLeadsRes.json());
        setTransactionActivities(await activitiesRes.json());
        setTenantImprovements(await tenantImprovementsRes.json());
        setNegotiationBoards(await negotiationBoardsRes.json());
        setAboutUsContent(await aboutUsContentRes.json());
        setLocationCircles(await locationCirclesRes.json());
        setDownloadAcknowledgments(await acknowledgmentsRes.json());
        setDownloadHistory(await downloadHistoryRes.json());
        setViewHistory(await viewHistoryRes.json());
        setLayoutRequests(await layoutRequestsRes.json());
        setChatMessages(await chatMessagesRes.json());

        const storedShortlist = localStorage.getItem('general_shortlist');
        if (storedShortlist) {
            setGeneralShortlist(JSON.parse(storedShortlist));
        }

      } catch (error) {
        console.error("Failed to load initial data", error);
        toast({
          variant: "destructive",
          title: "Data Loading Error",
          description: "Could not load application data from the server."
        });
      } finally {
        setIsShortlistLoading(false);
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [toast]);
  
  // Effect to clear shortlist on logout
  useEffect(() => {
    if (!authUser) {
        setGeneralShortlist([]);
        // No need to write to localStorage on logout, it's a per-session preference for logged-in users.
    }
  }, [authUser]);

  const toggleGeneralShortlist = (listingId: string) => {
    setGeneralShortlist(prev => {
        const isShortlisted = prev.includes(listingId);
        let updatedList: string[];
        if (isShortlisted) {
            updatedList = prev.filter(id => id !== listingId);
            toast({ title: "Removed from Shortlist" });
        } else {
            updatedList = [...prev, listingId];
            toast({ title: "Added to Shortlist" });
        }
        localStorage.setItem('general_shortlist', JSON.stringify(updatedList));
        return updatedList;
    });
  };


  const persistData = async (endpoint: string, data: any, entityName: string) => {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to save ${entityName} to the server.`);
        }
    } catch (error) {
        console.error(`Error persisting ${entityName}:`, error);
        toast({
            variant: "destructive",
            title: "Data Sync Error",
            description: `Could not save ${entityName} changes to the server.`
        });
    }
  }

  const persistListings = useCallback((updatedListings: ListingSchema[]) => persistData('listings', updatedListings, 'listings'), []);
  const persistDemands = useCallback((updatedDemands: DemandSchema[]) => persistData('demands', updatedDemands, 'demands'), []);
  const persistSubmissions = useCallback((updatedSubmissions: Submission[]) => persistData('submissions', updatedSubmissions, 'submissions'), []);
  const persistAgentLeads = useCallback((updatedLeads: AgentLead[]) => persistData('agent-leads', updatedLeads, 'agent leads'), []);
  const persistRegisteredLeads = useCallback((updatedLeads: RegisteredLead[]) => persistData('registered-leads', updatedLeads, 'registered leads'), []);
  const persistActivities = useCallback((updatedActivities: TransactionActivity[]) => persistData('transaction-activities', updatedActivities, 'transaction activities'), []);
  const persistTenantImprovements = useCallback((updatedSheets: TenantImprovementsSheet[]) => persistData('tenant-improvements', updatedSheets, 'tenant improvements'), []);
  const persistNegotiationBoards = useCallback((updatedSheets: NegotiationBoardSchema[]) => persistData('negotiation-boards', updatedSheets, 'negotiation boards'), []);
  const persistListingAnalytics = useCallback((updatedAnalytics: ListingAnalytics[]) => persistData('listing-analytics', updatedAnalytics, 'listing analytics'), []);
  const persistAboutUsContent = useCallback((updatedContent: AboutUsContent) => persistData('about-us-content', updatedContent, 'about us content'), []);
  const persistDownloadAcknowledgments = useCallback((updatedAcks: AcknowledgmentRecord[]) => persistData('download-acknowledgments', updatedAcks, 'download acknowledgments'), []);
  const persistDownloadHistory = useCallback((updatedHistory: DownloadRecord[]) => persistData('download-history', updatedHistory, 'download history'), []);
  const persistViewHistory = useCallback((updatedHistory: ViewRecord[]) => persistData('view-history', updatedHistory, 'view history'), []);
  const persistLayoutRequests = useCallback((updatedRequests: LayoutRequestRecord[]) => persistData('layout-requests', updatedRequests, 'layout requests'), []);
  const persistChatMessages = useCallback((updatedMessages: Record<string, ChatMessage[]>) => persistData('chat-messages', updatedMessages, 'chat messages'), []);

  const addChatMessage = async (threadId: string, message: ChatMessage) => {
    const updatedMessages = { ...chatMessages };
    if (!updatedMessages[threadId]) {
      updatedMessages[threadId] = [];
    }
    updatedMessages[threadId].push(message);
    setChatMessages(updatedMessages);
    await persistChatMessages(updatedMessages);
  };

  const updateAboutUsContent = (newContent: AboutUsContent) => {
    setAboutUsContent(newContent);
    persistAboutUsContent(newContent);
  };


  const addListing = useCallback((listing: ListingSchema, userEmail?: string) => {
    setListings(prevListings => {
        const newListings = [{ ...listing, status: 'pending' as const, createdAt: new Date().toISOString() }, ...prevListings];
        persistListings(newListings);
        setLastEvent({
          type: 'new_listing',
          id: listing.listingId,
          timestamp: new Date().toISOString(),
          triggeredBy: userEmail,
        });
        return newListings;
    });
  }, [persistListings]);

  const updateListing = useCallback((updatedListing: ListingSchema) => {
    setListings(prevListings => {
        const newListings = prevListings.map(l => l.listingId === updatedListing.listingId ? updatedListing : l);
        persistListings(newListings);
        setLastEvent({
          type: 'new_listing',
          id: updatedListing.listingId,
          timestamp: new Date().toISOString(),
          triggeredBy: updatedListing.developerId,
        });
        return newListings;
    });
  }, [persistListings]);

  const updateListingStatus = useCallback((listingId: string, status: ListingStatus, userEmail?: string) => {
    setListings(prev => {
        const updatedListings = prev.map(l => {
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
  }, [persistListings]);

  const addAgentLead = useCallback((lead: Omit<AgentLead, 'id' | 'status'>) => {
    setAgentLeads(prevLeads => {
        const newLead: AgentLead = { 
          ...lead, 
          id: `AGENT-${Date.now()}`, 
          status: 'Pending' 
        };
        const updatedLeads = [newLead, ...prevLeads];
        persistAgentLeads(updatedLeads);
        return updatedLeads;
    });
  }, [persistAgentLeads]);

  const updateAgentLeadStatus = useCallback((leadId: string, status: AgentStatus) => {
    setAgentLeads(prevLeads => {
        const updatedLeads = prevLeads.map(lead => lead.id === leadId ? { ...lead, status } : lead);
        persistAgentLeads(updatedLeads);
        return updatedLeads;
    });
  }, [persistAgentLeads]);

  const addDemand = useCallback((demand: Omit<DemandSchema, 'createdAt'>, userEmail?: string) => {
    setDemands(prevDemands => {
        const newDemand = { ...demand, createdAt: new Date().toISOString() };
        const newDemands = [newDemand, ...prevDemands];
        persistDemands(newDemands);
        setLastEvent({
          type: 'new_demand',
          id: demand.demandId,
          timestamp: new Date().toISOString(),
          triggeredBy: userEmail,
        });
        return newDemands;
    });
  }, [persistDemands]);

  const updateDemand = useCallback((updatedDemand: DemandSchema) => {
    setDemands(prevDemands => {
        const newDemands = prevDemands.map((demand) =>
            demand.demandId === updatedDemand.demandId ? updatedDemand : demand
        );
        persistDemands(newDemands);
        return newDemands;
    });
  }, [persistDemands]);

  const addSubmission = useCallback((submission: Omit<Submission, 'status' | 'submissionId'>, userEmail?: string) => {
    setSubmissions(prevSubmissions => {
        const demand = demands.find(d => d.demandId === submission.demandId);
        const submissionWithDefaults: Submission = {
            ...submission,
            submissionId: `SUB-${Date.now()}`,
            isNew: true,
            demandUserEmail: demand?.userEmail,
            status: 'Pending', 
        };
        const newSubmissions = [submissionWithDefaults, ...prevSubmissions];
        persistSubmissions(newSubmissions);
        setLastEvent({
            type: 'new_submission',
            id: submission.demandId,
            timestamp: new Date().toISOString(),
            triggeredBy: userEmail,
        });
        return newSubmissions;
    });
  }, [demands, persistSubmissions]);

  const updateSubmissionStatus = useCallback((submissionId: string, status: SubmissionStatus) => {
    setSubmissions(prevSubmissions => {
        const newSubmissions = prevSubmissions.map(sub =>
            sub.submissionId === submissionId ? { ...sub, status, isNew: status === 'Approved' ? true : sub.isNew } : sub
        );
        persistSubmissions(newSubmissions);
        if (status === 'Rejected') {
          setShortlistedItems(prev => prev.filter(item => item.submissionId !== submissionId));
        }
        return newSubmissions;
    });
  }, [persistSubmissions]);

  const toggleShortlist = useCallback((submissionToToggle: Submission) => {
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
  }, []);

  const clearNewSubmissions = useCallback((submissionIds: string[]) => {
    setSubmissions(prevSubmissions => {
        const idsToClear = new Set(submissionIds);
        const newSubmissions = prevSubmissions.map(sub => 
                idsToClear.has(sub.submissionId) ? { ...sub, isNew: false } : sub
        );
        persistSubmissions(newSubmissions);
        return newSubmissions;
    });
  }, [persistSubmissions]);
  
  const getCompanyDownloadCounts = useCallback((companyName: string): { daily: number; weekly: number } => {
    const now = new Date();
    const todayStart = startOfDay(now).getTime();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).getTime();

    const companyDownloads = downloadHistory.filter(d => d.companyName === companyName);
    
    const dailyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= todayStart).map(d => d.timestamp));
    const weeklyTimestamps = new Set(companyDownloads.filter(d => d.timestamp >= weekStart).map(d => d.timestamp));

    return {
        daily: dailyTimestamps.size,
        weekly: weeklyTimestamps.size,
    };
  }, [downloadHistory]);
  
  const logAcknowledgment = useCallback((userId: string) => {
    setDownloadAcknowledgments(prevAcks => {
        const alreadyExists = prevAcks.some(ack => ack.userId === userId);
        if (alreadyExists) {
            return prevAcks;
        }
        const newAck: AcknowledgmentRecord = { userId, timestamp: Date.now() };
        const updatedAcks = [...prevAcks, newAck];
        persistDownloadAcknowledgments(updatedAcks);
        return updatedAcks;
    });
  }, [persistDownloadAcknowledgments]);

  const logDownload = useCallback((user: User, listingsToDownload: ListingSchema[]): { success: boolean; limitReached: boolean; message: string } => {
    const { daily, weekly } = getCompanyDownloadCounts(user.companyName);

    if (user.plan !== 'Paid_Premium') {
        if (daily >= 2) {
            const message = "Your company has reached its daily download limit of 2. Premium users have unlimited downloads.";
            toast({ variant: "destructive", title: "Daily Limit Reached", description: message });
            return { success: false, limitReached: true, message };
        }
        if (weekly >= 4) {
            const message = "Your company has reached its weekly download limit of 4. Premium users have unlimited downloads.";
            toast({ variant: "destructive", title: "Weekly Limit Reached", description: message });
            return { success: false, limitReached: true, message };
        }
    }
    
    const now = new Date().getTime();
    const newDownloadRecords: DownloadRecord[] = [];
    
    setListingAnalytics(prevAnalytics => {
        const newAnalytics = [...prevAnalytics];
        listingsToDownload.forEach(listing => {
            const record: DownloadRecord = { userId: user.email, companyName: user.companyName, listingId: listing.listingId, location: listing.location, timestamp: now };
            newDownloadRecords.push(record);

            let analytic = newAnalytics.find(a => a.listingId === listing.listingId);
            if (!analytic) {
                analytic = { listingId: listing.listingId, views: 0, downloads: 0, customerIndustries: {}, downloadedBy: [] };
                newAnalytics.push(analytic);
            }
            analytic.downloads = (analytic.downloads || 0) + 1;

            if (user) {
              analytic.downloadedBy = analytic.downloadedBy || [];
              let customerRecord = analytic.downloadedBy.find(c => c.company === user.companyName);
              if (customerRecord) {
                customerRecord.timestamps.push(now);
              } else {
                analytic.downloadedBy.push({
                    name: user.userName,
                    company: user.companyName,
                    timestamps: [now],
                });
              }
            }
        });
        persistListingAnalytics(newAnalytics);
        return newAnalytics;
    });

    setDownloadHistory(prev => {
        const updatedHistory = [...prev, ...newDownloadRecords];
        persistDownloadHistory(updatedHistory);
        return updatedHistory;
    });

    return { success: true, limitReached: false, message: "Download successful." };
  }, [downloadHistory, getCompanyDownloadCounts, toast, persistListingAnalytics, persistDownloadHistory]);

  const logListingView = useCallback((user: User, listingId: string) => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      const lastView = viewHistory
          .slice()
          .reverse()
          .find(v => v.userId === user.email && v.listingId === listingId);

      if (lastView && (now - lastView.timestamp < fiveMinutes)) {
          return;
      }

      const newView: ViewRecord = {
          userId: user.email,
          companyName: user.companyName,
          listingId: listingId,
          timestamp: now,
      };

      setViewHistory(prev => {
          const updatedHistory = [...prev, newView];
          persistViewHistory(updatedHistory);
          return updatedHistory;
      });

      setListingAnalytics(prevAnalytics => {
          const newAnalytics = [...prevAnalytics];
          let analytic = newAnalytics.find(a => a.listingId === listingId);

          if (!analytic) {
              analytic = { listingId: listingId, views: 0, downloads: 0, customerIndustries: {}, viewedBy: [] };
              newAnalytics.push(analytic);
          }
          
          analytic.views = (analytic.views || 0) + 1;
          
          analytic.viewedBy = analytic.viewedBy || [];
          analytic.viewedBy.push({
              userId: user.email,
              name: user.userName,
              company: user.companyName,
              timestamp: now,
          });

          persistListingAnalytics(newAnalytics);
          return newAnalytics;
      });

  }, [viewHistory, persistViewHistory, persistListingAnalytics]);


  const toggleSelectedForDownload = useCallback((listing: ListingSchema): { limitReached: boolean } => {
    if (selectedForDownload.length >= 5 && !selectedForDownload.some(item => item.listingId === listing.listingId)) {
      return { limitReached: true };
    }

    setSelectedForDownload(prev => {
      const isSelected = prev.some(item => item.listingId === listing.listingId);
      if (isSelected) {
        return prev.filter(item => item.listingId !== listing.listingId);
      } else {
        return [...prev, listing];
      }
    });

    return { limitReached: false };
  }, [selectedForDownload]);


  const clearSelectedForDownload = useCallback(() => {
    setSelectedForDownload([]);
  }, []);

  const addRegisteredLead = useCallback((leadData: Omit<RegisteredLead, 'registeredAt'>, userEmail?: string) => {
    setRegisteredLeads(prevLeads => {
        const newLead: RegisteredLead = {
          ...leadData,
          registeredAt: new Date().toISOString(),
        };
        const updatedLeads = [newLead, ...prevLeads];
        persistRegisteredLeads(updatedLeads);

        newLead.providers.forEach(provider => {
            provider.properties.forEach(property => {
                setLastEvent({
                    type: 'new_lead_for_provider',
                    id: `${provider.providerEmail}|${newLead.id}|${property.listingId}`,
                    timestamp: new Date().toISOString(),
                    triggeredBy: userEmail,
                    message: `New lead for listing ${property.listingId}`
                });
            });
        });

        return updatedLeads;
    });
  }, [persistRegisteredLeads]);

  const updateRegisteredLead = useCallback((updatedLead: RegisteredLead) => {
      setRegisteredLeads(prevLeads => {
          const newLeads = prevLeads.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
          );
          persistRegisteredLeads(newLeads);
          return newLeads;
      });
  }, [persistRegisteredLeads]);
  
  const addTransactionActivity = useCallback((activityData: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
      setTransactionActivities(prevActivities => {
          const newActivity: TransactionActivity = {
              ...activityData,
              activityId: `ACT-${Date.now()}`,
              createdAt: new Date().toISOString(),
          };
          const updatedActivities = [newActivity, ...prevActivities];
          persistActivities(updatedActivities);
          return updatedActivities;
      });
  }, [persistActivities]);
  
  const getTenantImprovements = useCallback((leadId: string): TenantImprovementsSheet | null => {
    return tenantImprovements.find(sheet => sheet.leadId === leadId) || null;
  }, [tenantImprovements]);
  
  const updateTenantImprovements = useCallback((leadId: string, sheetData: TenantImprovementsSheet) => {
    setTenantImprovements(prevSheets => {
        const existingSheet = prevSheets.find(sheet => sheet.leadId === leadId);
        let updatedSheets: TenantImprovementsSheet[];

        if (existingSheet) {
          updatedSheets = prevSheets.map(sheet => sheet.leadId === leadId ? sheetData : sheet);
        } else {
          updatedSheets = [...prevSheets, sheetData];
        }
        
        persistTenantImprovements(updatedSheets);
        toast({
            title: "Improvements Sheet Saved",
            description: "Your changes have been saved successfully.",
        });
        return updatedSheets;
    });
  }, [persistTenantImprovements, toast]);

  const getNegotiationBoard = useCallback((leadId: string): NegotiationBoardSchema | null => {
    const result = negotiationBoards.find((sheet: any) => sheet.leadId === leadId);
    return result || null;
  }, [negotiationBoards]);

  const updateNegotiationBoard = useCallback((leadId: string, sheetData: NegotiationBoardSchema) => {
      setNegotiationBoards(prevSheets => {
        const sheetWithId = { ...sheetData, leadId: leadId };
        const existingSheetIndex = prevSheets.findIndex((sheet: any) => sheet.leadId === leadId);
        let updatedSheets: NegotiationBoardSchema[];

        if (existingSheetIndex > -1) {
            updatedSheets = [...prevSheets];
            updatedSheets[existingSheetIndex] = sheetWithId as any;
        } else {
            updatedSheets = [...prevSheets, sheetWithId as any];
        }
        
        persistNegotiationBoards(updatedSheets);
        toast({
            title: "Negotiation Board Saved",
            description: "Your changes have been saved successfully.",
        });
        return updatedSheets;
    });
  }, [persistNegotiationBoards, toast]);

  const addLayoutRequest = useCallback((request: LayoutRequestData) => {
    setLayoutRequests(prev => {
      const newRequest: LayoutRequestRecord = {
        ...request,
        id: `LR-${Date.now()}`,
        requestedAt: new Date().toISOString(),
      };
      const updatedRequests = [newRequest, ...prev];
      persistLayoutRequests(updatedRequests);
      return updatedRequests;
    });
  }, [persistLayoutRequests]);


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
        updateRegisteredLead,
        transactionActivities,
        addTransactionActivity,
        getTenantImprovements,
        updateTenantImprovements,
        getNegotiationBoard,
        updateNegotiationBoard,
        generalShortlist,
        toggleGeneralShortlist,
        isShortlistLoading,
        aboutUsContent,
        updateAboutUsContent,
        locationCircles,
        downloadAcknowledgments,
        logAcknowledgment,
        viewHistory,
        layoutRequests,
        addLayoutRequest,
        chatMessages,
        addChatMessage
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
