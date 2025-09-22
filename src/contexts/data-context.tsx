
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type DemandSchema, type ListingSchema, type TenantImprovementsSheet, type NegotiationBoardSchema, type AcknowledgmentDetails, type LayoutRequestData } from '@/lib/schema';
import { type User, useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, startOfDay } from 'date-fns';
import type { ChatSubmission } from '@/components/chat-dialog';

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

export type Notification = {
    id: string;
    type: 'new_demand' | 'new_submission' | 'new_lead_for_provider' | 'new_chat_message' | 'new_activity';
    title: string;
    message: string;
    href: string;
    timestamp: string;
    isRead: boolean;
    recipientEmail?: string; // For targeted notifications
    triggeredBy: string;
}

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
    activityType: 'Site Visit Request' | 'Site Visit Update' | 'Customer Feedback' | 'Tenant Improvements' | 'Proposal Submitted' | 'Lead Acknowledged';
    details: {
        visitDateTime?: string;
        message?: string;
        status?: SiteVisitStatus;
        notes?: string;
        feedbackText?: string;
        improvementsText?: string;
        listingId?: string;
        rentPerSft?: number;
        rentalSecurityDeposit?: number;
        actualChargeableArea?: number;
        acknowledgedBy?: AcknowledgmentDetails;
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
    text?: string;
    timestamp: string;
    attachment?: {
      fileName: string;
      fileUrl: string;
      fileType: string;
    };
    isNew?: boolean;
};

export type TypingStatus = {
    isTyping: boolean;
    userEmail: string;
    userName: string;
};

type DataContextType = {
  listings: ListingSchema[];
  addListing: (listing: ListingSchema, userEmail?: string) => void;
  updateListing: (listing: ListingSchema) => void;
  updateListingStatus: (listingId: string, status: ListingStatus, userEmail?: string) => void;
  listingAnalytics: ListingAnalytics[];
  logListingView: (user: User | null, listingId: string) => void;

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
  acknowledgeLeadProperties: (leadId: string, providerEmail: string, details: AcknowledgmentDetails) => void;
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
  addChatMessage: (threadId: string, message: ChatMessage, context: { lead: RegisteredLead, partner: User | null }) => Promise<void>;
  clearNewMessages: (threadId: string) => void;
  typingStatus: Record<string, TypingStatus>;
  updateTypingStatus: (threadId: string, status: TypingStatus) => Promise<void>;
  fetchTypingStatus: (threadId: string) => Promise<void>;
  activeChat: ChatSubmission | null;
  setActiveChat: (chat: ChatSubmission | null) => void;
  reassignAnonymousViews: (anonymousId: string, user: User) => void;
  notifications: Notification[];
  unreadCount: number;
  markNotificationsAsRead: () => void;
  addAgentToLead: (leadId: string, agentEmail: string) => void;
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
  const { user: authUser, users } = useAuth();
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
  const [typingStatus, setTypingStatus] = useState<Record<string, TypingStatus>>({});
  const [activeChat, setActiveChat] = useState<ChatSubmission | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

   const loadInitialData = useCallback(async () => {
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
          notificationsRes,
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
          fetch('/api/notifications'),
        ]);

        const notificationsData = await notificationsRes.json();
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
        setNotifications(notificationsData);

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
    }, [toast]);
    
   useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadInitialData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [loadInitialData]);
  
  // Effect to clear shortlist on logout
  useEffect(() => {
    if (!authUser) {
        setGeneralShortlist([]);
        // No need to write to localStorage on logout, it's a per-session preference for logged-in users.
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      const count = notifications.filter(n => !n.isRead && (n.recipientEmail === authUser.email || (n.type === 'new_demand' && (authUser.role === 'SuperAdmin' || authUser.role === 'O2O')) || (n.type === 'new_submission' && (authUser.role === 'SuperAdmin' || authUser.role === 'O2O')) )).length;
      setUnreadCount(count);
    } else {
      setUnreadCount(0);
    }
  }, [notifications, authUser]);

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
  const persistTypingStatus = useCallback((updatedStatus: Record<string, TypingStatus>) => persistData('typing-status', updatedStatus, 'typing status'), []);
  const persistNotifications = useCallback((updatedNotifications: Notification[]) => persistData('notifications', updatedNotifications, 'notifications'), []);


  const addNotification = useCallback((notification: Omit<Notification, 'isRead'>) => {
    setNotifications(prev => {
        const newNotification = { ...notification, isRead: false };
        const updatedNotifications = [newNotification, ...prev];
        persistNotifications(updatedNotifications);
        return updatedNotifications;
    });
  }, [persistNotifications]);

  const markNotificationsAsRead = useCallback(() => {
    if (!authUser) return;
    setNotifications(prev => {
      const updated = prev.map(n => {
        const isRecipient = n.recipientEmail === authUser.email;
        const isAdminForDemand = (n.type === 'new_demand' && (authUser.role === 'SuperAdmin' || authUser.role === 'O2O'));
        const isAdminForSubmission = (n.type === 'new_submission' && (authUser.role === 'SuperAdmin' || authUser.role === 'O2O'));
        
        if (!n.isRead && (isRecipient || isAdminForDemand || isAdminForSubmission)) {
          return { ...n, isRead: true };
        }
        return n;
      });
      persistNotifications(updated);
      return updated;
    });
  }, [authUser, persistNotifications]);


  const addChatMessage = async (threadId: string, message: ChatMessage, context: { lead: RegisteredLead, partner: User | null }) => {
    const updatedMessages = { ...chatMessages };
    if (!updatedMessages[threadId]) {
      updatedMessages[threadId] = [];
    }
    const messageWithReadStatus = { ...message, isNew: true };
    updatedMessages[threadId].push(messageWithReadStatus);
    setChatMessages(updatedMessages);
    await persistChatMessages(updatedMessages);

    // Notify the other user in the chat
    const recipient = context.lead.customerId === authUser?.email ? context.partner : users[context.lead.customerId];
    if (recipient) {
      addNotification({
        id: `notif-${Date.now()}-${Math.random()}`,
        type: 'new_chat_message',
        title: `New message from ${authUser?.userName}`,
        message: `Regarding transaction ${context.lead.id}: "${message.text?.substring(0, 50)}..."`,
        href: `/dashboard/leads/${context.lead.id}`,
        recipientEmail: recipient.email,
        timestamp: new Date().toISOString(),
        triggeredBy: authUser?.email || 'system',
      });
    }
  };

  const clearNewMessages = useCallback((threadId: string) => {
    setChatMessages(prev => {
      if (!prev[threadId]) return prev;
      
      const newThreadMessages = prev[threadId].map(msg => ({ ...msg, isNew: false }));
      const updatedMessages = { ...prev, [threadId]: newThreadMessages };

      persistChatMessages(updatedMessages);
      return updatedMessages;
    });
  }, [persistChatMessages]);


  const updateTypingStatus = async (threadId: string, status: TypingStatus) => {
    const newStatus = { ...typingStatus, [threadId]: status };
    setTypingStatus(newStatus);
    await persistTypingStatus(newStatus);
  };

  const fetchTypingStatus = async (threadId: string) => {
    try {
      const response = await fetch('/api/typing-status');
      if (response.ok) {
        const allStatuses = await response.json();
        setTypingStatus(allStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch typing status:', error);
    }
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
        addNotification({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'new_demand',
            title: `New Demand from ${demand.companyName}`,
            message: `${demand.size.toLocaleString()} sq. ft. required in ${demand.locationName}`,
            href: `/dashboard?tab=active-demands`,
            timestamp: new Date().toISOString(),
            triggeredBy: userEmail || 'system',
        });
        return newDemands;
    });
  }, [persistDemands, addNotification]);

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
        addNotification({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'new_submission',
            title: `New Submission for Demand ${submission.demandId}`,
            message: `Property ${submission.listingId} submitted by ${userEmail}`,
            href: `/dashboard?tab=approval-queue`,
            timestamp: new Date().toISOString(),
            triggeredBy: userEmail || 'system',
        });
        return newSubmissions;
    });
  }, [demands, persistSubmissions, addNotification]);

  const updateSubmissionStatus = useCallback((submissionId: string, status: SubmissionStatus) => {
    setSubmissions(prevSubmissions => {
        const submission = prevSubmissions.find(s => s.submissionId === submissionId);
        if (submission && status === 'Approved') {
            addNotification({
                id: `notif-${Date.now()}-${Math.random()}`,
                type: 'new_submission',
                title: `Your match for Demand ${submission.demandId} was approved!`,
                message: `Property ${submission.listingId} is now visible to the customer.`,
                href: `/dashboard?tab=my-demands`,
                recipientEmail: submission.demandUserEmail,
                timestamp: new Date().toISOString(),
                triggeredBy: authUser?.email || 'system'
            });
        }

        const newSubmissions = prevSubmissions.map(sub =>
            sub.submissionId === submissionId ? { ...sub, status, isNew: status === 'Approved' ? true : sub.isNew } : sub
        );
        persistSubmissions(newSubmissions);
        if (status === 'Rejected') {
          setShortlistedItems(prev => prev.filter(item => item.submissionId !== submissionId));
        }
        return newSubmissions;
    });
  }, [persistSubmissions, addNotification, authUser]);

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

  const logListingView = useCallback((user: User | null, listingId: string) => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      const userId = user?.email || `anonymous_${sessionStorage.getItem('anonymousId')}`;

      const lastView = viewHistory
          .slice()
          .reverse()
          .find(v => v.userId === userId && v.listingId === listingId);

      if (lastView && (now - lastView.timestamp < fiveMinutes)) {
          return;
      }

      const newView: ViewRecord = {
          userId: userId,
          companyName: user?.companyName || 'Anonymous',
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
              userId: userId,
              name: user?.userName || 'Anonymous',
              company: user?.companyName || 'Anonymous',
              timestamp: now,
          });

          persistListingAnalytics(newAnalytics);
          return newAnalytics;
      });

  }, [viewHistory, persistViewHistory, persistListingAnalytics]);

  const reassignAnonymousViews = useCallback((anonymousId: string, user: User) => {
    const anonymousUserId = `anonymous_${anonymousId}`;

    setViewHistory(prev => {
        const updatedHistory = prev.map(record => {
            if (record.userId === anonymousUserId) {
                return {
                    ...record,
                    userId: user.email,
                    companyName: user.companyName,
                };
            }
            return record;
        });
        persistViewHistory(updatedHistory);
        return updatedHistory;
    });

    setListingAnalytics(prev => {
        const updatedAnalytics = prev.map(analytic => {
            if (analytic.viewedBy) {
                analytic.viewedBy = analytic.viewedBy.map(viewer => {
                    if (viewer.userId === anonymousUserId) {
                        return {
                            ...viewer,
                            userId: user.email,
                            name: user.userName,
                            company: user.companyName,
                        };
                    }
                    return viewer;
                });
            }
            return analytic;
        });
        persistListingAnalytics(updatedAnalytics);
        return updatedAnalytics;
    });
  }, [persistViewHistory, persistListingAnalytics]);


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

        // Notify relevant parties
        const registeredByUser = users[newLead.registeredBy];
        const isRegisteredByAdminOrAgent = registeredByUser?.role === 'SuperAdmin' || registeredByUser?.role === 'O2O' || registeredByUser?.role === 'Agent';

        newLead.providers.forEach(provider => {
            const providerUser = users[provider.providerEmail];
            let title: string;
            let message: string;

            if (isRegisteredByAdminOrAgent && !newLead.isO2OCollaborator) {
                // Admin/Agent registering a direct lead to a provider
                title = `New Lead from O2O: ${newLead.leadName}`;
                message = `${registeredByUser.userName} from ${registeredByUser.companyName} has registered a new lead for you.`;
            } else {
                // Customer directly requesting a quote OR admin creating brokered lead
                title = newLead.isO2OCollaborator ? `New Brokered Lead: ${newLead.leadName}` : `New Direct Lead: ${newLead.leadName}`;
                message = newLead.isO2OCollaborator ? `A lead for a free listing requires O2O collaboration.` : `A customer has requested a quote for your premium listing(s). Please acknowledge.`;
            }

            addNotification({
                id: `notif-${Date.now()}-${Math.random()}`,
                type: 'new_lead_for_provider',
                title: title,
                message: message,
                href: `/dashboard?tab=registered-leads`,
                recipientEmail: provider.providerEmail,
                timestamp: new Date().toISOString(),
                triggeredBy: userEmail || 'system'
            });
        });

        return updatedLeads;
    });
  }, [persistRegisteredLeads, addNotification, users]);

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
          
          const lead = registeredLeads.find(l => l.id === newActivity.leadId);
          if (lead) {
              const participants = new Set([lead.customerId, ...(lead.agentId ? [lead.agentId] : []), ...lead.providers.map(p => p.providerEmail)]);
              if (lead.isO2OCollaborator) {
                  participants.add('superadmin@o2o.com');
              }
              
              participants.forEach(participantEmail => {
                  if(participantEmail !== newActivity.createdBy) {
                      addNotification({
                          id: `notif-${Date.now()}-${newActivity.activityId}`,
                          type: 'new_activity',
                          title: `Update on Transaction: ${lead.id}`,
                          message: `${users[newActivity.createdBy]?.userName || 'System'} logged: ${newActivity.activityType}`,
                          href: `/dashboard/leads/${lead.id}`,
                          recipientEmail: participantEmail,
                          timestamp: new Date().toISOString(),
                          triggeredBy: newActivity.createdBy
                      });
                  }
              });
          }

          return updatedActivities;
      });
  }, [persistActivities, registeredLeads, addNotification, users]);
  
  const acknowledgeLeadProperties = useCallback((leadId: string, providerEmail: string, ackDetails: AcknowledgmentDetails) => {
    setRegisteredLeads(prevLeads => {
        let leadToUpdate: RegisteredLead | undefined;
        let wasAnyPropertyAcknowledged = false;
        
        const newLeads = prevLeads.map(lead => {
            if (lead.id === leadId) {
                leadToUpdate = lead;
                const updatedProviders = lead.providers.map(p => {
                    if (p.providerEmail === providerEmail) {
                        const updatedProperties = p.properties.map(prop => {
                            if (prop.status === 'Pending') {
                                wasAnyPropertyAcknowledged = true;
                                return {
                                    ...prop,
                                    status: 'Acknowledged' as RegisteredLeadStatus,
                                    acknowledgedAt: new Date().toISOString(),
                                    acknowledgedBy: ackDetails,
                                };
                            }
                            return prop;
                        });
                        return { ...p, properties: updatedProperties };
                    }
                    return p;
                });
                return { ...lead, providers: updatedProviders };
            }
            return lead;
        });

        if (wasAnyPropertyAcknowledged && leadToUpdate) {
            addTransactionActivity({
                leadId: leadId,
                activityType: 'Lead Acknowledged',
                details: { acknowledgedBy: ackDetails },
                createdBy: providerEmail,
            });

            const participants = new Set([leadToUpdate.customerId, ...(leadToUpdate.agentId ? [leadToUpdate.agentId] : [])]);
            if (leadToUpdate.isO2OCollaborator) {
                participants.add('superadmin@o2o.com');
            }

            participants.forEach(recipientEmail => {
                addNotification({
                    id: `notif-${Date.now()}-${leadId}-${providerEmail}`,
                    type: 'new_activity',
                    title: `Lead Acknowledged by ${ackDetails.name}`,
                    message: `Provider has acknowledged the lead for transaction ${leadId}.`,
                    href: `/dashboard/leads/${leadId}`,
                    recipientEmail: recipientEmail,
                    timestamp: new Date().toISOString(),
                    triggeredBy: providerEmail
                });
            });
        }
        
        persistRegisteredLeads(newLeads);
        return newLeads;
    });
  }, [persistRegisteredLeads, addTransactionActivity, addNotification]);

  const addAgentToLead = useCallback((leadId: string, agentEmail: string) => {
    setRegisteredLeads(prev => {
      const newLeads = prev.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, agentId: agentEmail };
        }
        return lead;
      });
      persistRegisteredLeads(newLeads);
      return newLeads;
    });
  }, [persistRegisteredLeads]);

  
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
  
  const toggleGeneralShortlist = useCallback((listingId: string) => {
      setIsShortlistLoading(true);
      const newShortlist = generalShortlist.includes(listingId)
        ? generalShortlist.filter(id => id !== listingId)
        : [...generalShortlist, listingId];
      
      setGeneralShortlist(newShortlist);
      try {
          localStorage.setItem('general_shortlist', JSON.stringify(newShortlist));
      } catch (error) {
          console.error("Could not write to localStorage", error);
      }
      setTimeout(() => setIsShortlistLoading(false), 300); // Simulate async save
  }, [generalShortlist]);

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
        acknowledgeLeadProperties,
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
        addChatMessage,
        clearNewMessages,
        typingStatus,
        updateTypingStatus,
        fetchTypingStatus,
        activeChat,
        setActiveChat,
        reassignAnonymousViews,
        notifications,
        unreadCount,
        markNotificationsAsRead,
        addAgentToLead
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
