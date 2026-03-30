
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type DemandSchema, type ListingSchema, type TenantImprovementsSheet, type NegotiationBoardSchema, type AcknowledgmentDetails, type LayoutRequestData, type CommunityPost, type ShareHistoryEntry } from '@/lib/schema';
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
  email: string;
  industryType?: string;
  timestamps: number[];
};

export type ViewedByRecord = {
    userId: string;
    name: string;
    company: string;
    industryType?: string;
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
    activityType: 'Lead Registered' | 'Site Visit Request' | 'Site Visit Update' | 'Customer Feedback' | 'Tenant Improvements' | 'Proposal Submitted' | 'Lead Acknowledged';
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
  unreadChatCount: number;
  markNotificationsAsRead: () => void;
  addAgentToLead: (leadId: string, agentEmail: string) => void;
  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'comments'>) => void;
  updateCommunityPost: (post: CommunityPost) => void;
  deleteCommunityPost: (postId: string) => void;
  addCommunityComment: (postId: string, comment: Omit<CommunityPost['comments'][0], 'id' | 'createdAt'>) => void;
  logShareActivity: (shareData: Omit<ShareHistoryEntry, 'id' | 'timestamp'>) => void;
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
  const [selectedForDownload, setSelectedForDownload] = useState<ListingSchema[]>(() => {
    try {
      const saved = sessionStorage.getItem('pendingDownloadSelection');
      if (saved) { sessionStorage.removeItem('pendingDownloadSelection'); return JSON.parse(saved); }
    } catch(e) {}
    return [];
  });
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
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>([]);
  
  const endpoints = [
    'listings', 'demands', 'submissions', 'agent-leads', 'listing-analytics',
    'registered-leads', 'transaction-activities', 'tenant-improvements',
    'negotiation-boards', 'about-us-content', 'location-circles',
    'download-acknowledgments', 'download-history', 'view-history',
    'layout-requests', 'chat-messages', 'notifications', 'typing-status',
    'community-posts', 'share-history'
  ];

  const fetchData = useCallback(() => {
    (async () => {
        try {
            const fetchPromises = endpoints.map(ep => fetch(`/api/${ep}`));
            const responses = await Promise.allSettled(fetchPromises);

            const data = await Promise.all(responses.map(async (res, index) => {
                if (res.status === 'fulfilled' && res.value.ok) {
                    try {
                        const text = await res.value.text();
                        return text ? JSON.parse(text) : null;
                    } catch (e) {
                        console.error(`Failed to parse JSON for ${endpoints[index]}:`, e);
                        return null;
                    }
                } else if (res.status === 'rejected') {
                    console.error(`Fetch failed for ${endpoints[index]}:`, res.reason);
                } else if (res.status === 'fulfilled' && !res.value.ok) {
                     try {
                        const errorBody = await res.value.text();
                        console.error(`API error for ${endpoints[index]} (Status: ${res.value.status}):`, errorBody.substring(0, 500));
                    } catch {
                        console.error(`API error for ${endpoints[index]} (Status: ${res.value.status})`);
                    }
                }
                return null;
            }));
            
            const stateSetters: any[] = [
                setListings, setDemands, setSubmissions, setAgentLeads, setListingAnalytics,
                setRegisteredLeads, setTransactionActivities, setTenantImprovements,
                setNegotiationBoards, setAboutUsContent, setLocationCircles,
                setDownloadAcknowledgments, setDownloadHistory, setViewHistory,
                setLayoutRequests, setChatMessages, setNotifications, setTypingStatus,
                setCommunityPosts, setShareHistory
            ];

            stateSetters.forEach((setter, i) => {
              if (data[i] !== null) {
                  setter((prev: any) => {
                    const stringifiedPrev = JSON.stringify(prev);
                    const stringifiedNew = JSON.stringify(data[i]);
                    if (stringifiedPrev !== stringifiedNew) {
                      return data[i];
                    }
                    return prev;
                  });
              }
            });
            
            if (isLoading) {
              try {
                const storedShortlist = localStorage.getItem('general_shortlist');
                if (storedShortlist) {
                  setGeneralShortlist(JSON.parse(storedShortlist));
                }
              } catch (e) {
                 console.error("Failed to read shortlist from local storage:", e);
              }
              setIsShortlistLoading(false);
              setIsLoading(false);
            }
        } catch (error) {
            console.error("A critical error occurred during data polling", error);
            if (isLoading) setIsLoading(false);
        }
    })();
  }, [isLoading]);

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const persistData = useCallback(async (endpoint: string, data: any, entityName: string) => {
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
        if (!entityName.includes("download history") && !entityName.includes("view history") && !entityName.includes("notifications") && !entityName.includes("typing status")) {
        toast({
            variant: "destructive",
            title: "Data Sync Error",
            description: `Could not save ${entityName} changes to the server.`
        }); }
    }
  }, [toast]);

  const persistListings = useCallback((updatedListings: ListingSchema[]) => persistData('listings', updatedListings, 'listings'), [persistData]);
  const persistDemands = useCallback((updatedDemands: DemandSchema[]) => persistData('demands', updatedDemands, 'demands'), [persistData]);
  const persistSubmissions = useCallback((updatedSubmissions: Submission[]) => persistData('submissions', updatedSubmissions, 'submissions'), [persistData]);
  const persistAgentLeads = useCallback((updatedLeads: AgentLead[]) => persistData('agent-leads', updatedLeads, 'agent leads'), [persistData]);
  const persistRegisteredLeads = useCallback((updatedLeads: RegisteredLead[]) => persistData('registered-leads', updatedLeads, 'registered leads'), [persistData]);
  const persistActivities = useCallback((updatedActivities: TransactionActivity[]) => persistData('transaction-activities', updatedActivities, 'transaction activities'), [persistData]);
  const persistTenantImprovements = useCallback((updatedSheets: TenantImprovementsSheet[]) => persistData('tenant-improvements', updatedSheets, 'tenant improvements'), [persistData]);
  const persistNegotiationBoards = useCallback((updatedSheets: NegotiationBoardSchema[]) => persistData('negotiation-boards', updatedSheets, 'negotiation boards'), [persistData]);
  const persistListingAnalytics = useCallback((updatedAnalytics: ListingAnalytics[]) => persistData('listing-analytics', updatedAnalytics, 'listing analytics'), [persistData]);
  const persistAboutUsContent = useCallback((updatedContent: AboutUsContent) => persistData('about-us-content', updatedContent, 'about us content'), [persistData]);
  const persistDownloadAcknowledgments = useCallback((updatedAcks: AcknowledgmentRecord[]) => persistData('download-acknowledgments', updatedAcks, 'download acknowledgments'), [persistData]);
  const persistDownloadHistory = useCallback((updatedHistory: DownloadRecord[]) => persistData('download-history', updatedHistory, 'download history'), [persistData]);
  const persistViewHistory = useCallback((updatedHistory: ViewRecord[]) => persistData('view-history', updatedHistory, 'view history'), [persistData]);
  const persistLayoutRequests = useCallback((updatedRequests: LayoutRequestRecord[]) => persistData('layout-requests', updatedRequests, 'layout requests'), [persistData]);
  const persistChatMessages = useCallback((updatedMessages: Record<string, ChatMessage[]>) => persistData('chat-messages', updatedMessages, 'chat messages'), [persistData]);
  const persistTypingStatus = useCallback((updatedStatus: Record<string, TypingStatus>) => persistData('typing-status', updatedStatus, 'typing status').catch(() => {}), [persistData]);
  const persistNotifications = useCallback((updatedNotifications: Notification[]) => persistData('notifications', updatedNotifications, 'notifications'), [persistData]);
  const persistCommunityPosts = useCallback((updatedPosts: CommunityPost[]) => persistData('community-posts', updatedPosts, 'community posts'), [persistData]);
  const persistShareHistory = useCallback((updatedHistory: ShareHistoryEntry[]) => persistData('share-history', updatedHistory, 'share history'), [persistData]);


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


  const addChatMessage = useCallback(async (threadId: string, message: ChatMessage, context: { lead: RegisteredLead, partner: User | null }) => {
    setChatMessages(prev => {
        const updatedMessages = { ...prev };
        if (!updatedMessages[threadId]) {
            updatedMessages[threadId] = [];
        }
        const messageWithReadStatus = { ...message, isNew: true };
        updatedMessages[threadId].push(messageWithReadStatus);
        persistChatMessages(updatedMessages);
        return updatedMessages;
    });

    const recipient = context.lead.customerId === authUser?.email ? context.partner : users[context.lead.customerId];
    if (recipient) {
      addNotification({
        id: `notif-${Date.now()}-${recipient.email}-${Math.random()}`,
        type: 'new_chat_message',
        title: `New message from ${authUser?.userName}`,
        message: `Regarding transaction ${context.lead.id}: "${message.text?.substring(0, 50)}..."`,
        href: `/dashboard/leads/${context.lead.id}`,
        recipientEmail: recipient.email,
        timestamp: new Date().toISOString(),
        triggeredBy: authUser?.email || 'system',
      });
    }
  }, [addNotification, authUser, users, persistChatMessages]);

  const clearNewMessages = useCallback((threadId: string) => {
    setChatMessages(prev => {
      if (!prev[threadId]) return prev;
      
      const newThreadMessages = prev[threadId].map(msg => ({ ...msg, isNew: false }));
      const updatedMessages = { ...prev, [threadId]: newThreadMessages };

      persistChatMessages(updatedMessages);
      return updatedMessages;
    });
  }, [persistChatMessages]);


  const updateTypingStatus = useCallback(async (threadId: string, status: TypingStatus) => {
    setTypingStatus(prev => {
      const newStatus = { ...prev, [threadId]: status };
      persistTypingStatus(newStatus);
      return newStatus;
    });
  }, [persistTypingStatus]);

  const fetchTypingStatus = useCallback(async (threadId: string) => {
    try {
      const response = await fetch('/api/typing-status');
      if (response.ok) {
        const allStatuses = await response.json();
        setTypingStatus(allStatuses);
      }
    } catch (error) {
      console.error('Failed to fetch typing status:', error);
    }
  }, []);

  const updateAboutUsContent = useCallback((newContent: AboutUsContent) => {
    setAboutUsContent(newContent);
    persistAboutUsContent(newContent);
  }, [persistAboutUsContent]);


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
  
  const addTransactionActivity = useCallback((activityData: Omit<TransactionActivity, 'activityId' | 'createdAt'>) => {
    const newActivity: TransactionActivity = {
        ...activityData,
        activityId: `ACT-${activityData.leadId}-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
    };

    setTransactionActivities(prevActivities => {
        const updatedActivities = [newActivity, ...prevActivities];
        persistActivities(updatedActivities);
        return updatedActivities;
    });
    
    const lead = registeredLeads.find(l => l.id === newActivity.leadId);
    if (lead) {
        const participants = new Set<string>();
        participants.add(lead.customerId);
        if (lead.agentId) participants.add(lead.agentId);
        lead.providers.forEach(p => participants.add(p.providerEmail));
        
        if (lead.isO2OCollaborator) {
            Object.values(users).forEach(u => {
                if (u.role === 'SuperAdmin' || u.role === 'O2O') {
                    participants.add(u.email);
                }
            });
        }
        
        const uniqueParticipants = Array.from(participants).filter(p => p !== newActivity.createdBy);

        uniqueParticipants.forEach(participantEmail => {
            addNotification({
                id: `notif-${newActivity.createdAt}-${participantEmail}-${Math.random()}`,
                type: 'new_activity',
                title: `Update on Transaction: ${lead.id}`,
                message: `${users[newActivity.createdBy]?.userName || 'System'} logged: ${newActivity.activityType}`,
                href: `/dashboard/leads/${lead.id}`,
                recipientEmail: participantEmail,
                timestamp: newActivity.createdAt,
                triggeredBy: newActivity.createdBy
            });
        });
    }
  }, [persistActivities, registeredLeads, addNotification, users]);

  const addRegisteredLead = useCallback((leadData: Omit<RegisteredLead, 'registeredAt'>, userEmail?: string) => {
    const newLead: RegisteredLead = {
        ...leadData,
        registeredAt: new Date().toISOString(),
    };

    setRegisteredLeads(prevLeads => {
        const updatedLeads = [newLead, ...prevLeads];
        persistRegisteredLeads(updatedLeads);
        return updatedLeads;
    });
    
    addTransactionActivity({
        leadId: newLead.id,
        activityType: 'Lead Registered',
        details: {},
        createdBy: userEmail || 'system',
    });

    const uniqueProviders = Array.from(new Set(newLead.providers.map(p => p.providerEmail)));

    if (newLead.isO2OCollaborator) {
        const adminRecipients = Object.values(users).filter(u => u.role === 'SuperAdmin' || u.role === 'O2O');
        adminRecipients.forEach(admin => {
             addNotification({
                id: `notif-${Date.now()}-${admin.email}-${Math.random()}`,
                type: 'new_lead_for_provider',
                title: `New Broking Lead: ${newLead.leadName}`,
                message: `Registered by ${users[newLead.registeredBy]?.userName || userEmail}. Needs provider assignment.`,
                href: `/dashboard/transactions`,
                recipientEmail: admin.email,
                timestamp: new Date().toISOString(),
                triggeredBy: userEmail || 'system'
            });
        });
    } else {
        uniqueProviders.forEach(providerEmail => {
            addNotification({
                id: `notif-${Date.now()}-${providerEmail}-${Math.random()}`,
                type: 'new_lead_for_provider',
                title: `New Direct Lead: ${newLead.leadName}`,
                message: `A customer has requested a quote for your premium listing(s). Please acknowledge.`,
                href: '/dashboard?tab=registered-leads',
                recipientEmail: providerEmail,
                timestamp: new Date().toISOString(),
                triggeredBy: userEmail || 'system'
            });
        });
    }
  }, [persistRegisteredLeads, addTransactionActivity, addNotification, users]);

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
                id: `notif-${Date.now()}-${submission.listingId}-${Math.random()}`,
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
    
    const newDownloadRecords: DownloadRecord[] = [];
    
    const providerToListingsMap: { [providerEmail: string]: string[] } = {};

    listingsToDownload.forEach(listing => {
        const isBrokered = listing.plan !== 'Paid_Premium';
        const providerEmail = isBrokered ? 'superadmin@o2o.com' : listing.developerId;
        
        if (!providerToListingsMap[providerEmail]) {
            providerToListingsMap[providerEmail] = [];
        }
        providerToListingsMap[providerEmail].push(listing.listingId);

        const record: DownloadRecord = { userId: user.email, companyName: user.companyName, listingId: listing.listingId, location: listing.location, timestamp: Date.now() };
        newDownloadRecords.push(record);
    });

    setDownloadHistory(prev => {
        const updatedHistory = [...prev, ...newDownloadRecords];
        persistDownloadHistory(updatedHistory);
        return updatedHistory;
    });

    setListingAnalytics(prevAnalytics => {
        const newAnalytics = [...prevAnalytics];
        listingsToDownload.forEach(listing => {
            let analytic = newAnalytics.find(a => a.listingId === listing.listingId);
            if (!analytic) {
                analytic = { listingId: listing.listingId, views: 0, downloads: 0, customerIndustries: {}, downloadedBy: [] };
                newAnalytics.push(analytic);
            }
            analytic.downloads = (analytic.downloads || 0) + 1;

            if (user) {
              analytic.downloadedBy = analytic.downloadedBy || [];
              let customerRecord = analytic.downloadedBy.find(c => c.email === user.email);
              if (customerRecord) {
                customerRecord.timestamps.push(Date.now());
              } else {
                analytic.downloadedBy.push({
                    name: user.userName,
                    company: user.companyName,
                    email: user.email,
                    industryType: (user as any).industryType || '',
                    timestamps: [Date.now()],
                });
              }
            }
        });
        persistListingAnalytics(newAnalytics);
        return newAnalytics;
    });

    return { success: true, limitReached: false, message: "Download successful." };
  }, [getCompanyDownloadCounts, persistDownloadHistory, persistListingAnalytics, toast, addRegisteredLead]);

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
              industryType: (user as any)?.industryType || '',
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
  
  const updateRegisteredLead = useCallback((updatedLead: RegisteredLead) => {
      setRegisteredLeads(prevLeads => {
          const newLeads = prevLeads.map(lead => 
              lead.id === updatedLead.id ? updatedLead : lead
          );
          persistRegisteredLeads(newLeads);
          return newLeads;
      });
  }, [persistRegisteredLeads]);
  
  const acknowledgeLeadProperties = useCallback((leadId: string, providerEmail: string, ackDetails: AcknowledgmentDetails) => {
    let wasAnyPropertyAcknowledged = false;
    let acknowledgedLead: RegisteredLead | undefined;

    setRegisteredLeads(prevLeads => {
        const newLeads = prevLeads.map(lead => {
            if (lead.id === leadId) {
                acknowledgedLead = lead;
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
        
        if (wasAnyPropertyAcknowledged) {
            persistRegisteredLeads(newLeads);
        }
        return newLeads;
    });

    if (wasAnyPropertyAcknowledged && acknowledgedLead) {
        addTransactionActivity({
            leadId: leadId,
            activityType: 'Lead Acknowledged',
            details: { acknowledgedBy: ackDetails },
            createdBy: providerEmail,
        });
    }
  }, [persistRegisteredLeads, addTransactionActivity]);

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

  const openChat = (chat: ChatSubmission) => {
      const threadId = `chat-${chat.demandId}-${chat.providerEmail}`;
      clearNewMessages(threadId);
      setActiveChat(chat);
  }

  const addCommunityPost = useCallback((postData: Omit<CommunityPost, 'id' | 'createdAt' | 'comments'>) => {
    setCommunityPosts(prevPosts => {
      const newPost: CommunityPost = {
        ...postData,
        id: `post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        comments: [],
      };
      const updatedPosts = [newPost, ...prevPosts];
      persistCommunityPosts(updatedPosts);
      return updatedPosts;
    });
  }, [persistCommunityPosts]);

  const updateCommunityPost = useCallback((updatedPost: CommunityPost) => {
      setCommunityPosts(prevPosts => {
          const newPosts = prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p);
          persistCommunityPosts(newPosts);
          return newPosts;
      });
  }, [persistCommunityPosts]);

  const deleteCommunityPost = useCallback((postId: string) => {
      setCommunityPosts(prevPosts => {
          const newPosts = prevPosts.filter(p => p.id !== postId);
          persistCommunityPosts(newPosts);
          return newPosts;
      });
  }, [persistCommunityPosts]);

  const addCommunityComment = useCallback((postId: string, commentData: Omit<CommunityPost['comments'][0], 'id' | 'createdAt'>) => {
    setCommunityPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          const newComment = {
            ...commentData,
            id: `comment-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      });
      persistCommunityPosts(updatedPosts);
      return updatedPosts;
    });
  }, [persistCommunityPosts]);

  const logShareActivity = useCallback((shareData: Omit<ShareHistoryEntry, 'id' | 'timestamp'>) => {
      setShareHistory(prev => {
          const newEntry: ShareHistoryEntry = {
              ...shareData,
              id: `share-${Date.now()}`,
              timestamp: new Date().toISOString(),
          };
          const updatedHistory = [newEntry, ...prev];
          persistShareHistory(updatedHistory);
          return updatedHistory;
      });
  }, [persistShareHistory]);
  
  useEffect(() => {
    if (authUser) {
      const count = notifications.filter(n => !n.isRead && (n.recipientEmail === authUser.email || ((n.type === 'new_demand' || n.type === 'new_submission') && (authUser.role === 'SuperAdmin' || authUser.role === 'O2O')))).length;
      setUnreadCount(count);

      const chatCount = Object.entries(chatMessages).reduce((acc, [threadId, messages]) => {
          const leadId = threadId.split('-')[1];
          const lead = registeredLeads.find(l => l.id === leadId);

          if (lead) {
              const isParticipant =
                  lead.customerId === authUser.email ||
                  lead.agentId === authUser.email ||
                  lead.providers.some(p => p.providerEmail === authUser.email) ||
                  ((authUser.role === 'SuperAdmin' || authUser.role === 'O2O') && lead.isO2OCollaborator);

              if (isParticipant) {
                  const hasUnread = messages.some(m => m.isNew && m.senderEmail !== authUser.email);
                  if (hasUnread) {
                      return acc + 1;
                  }
              }
          }
          return acc;
      }, 0);
      setUnreadChatCount(chatCount);
    } else {
      setUnreadCount(0);
      setUnreadChatCount(0);
    }
  }, [notifications, chatMessages, authUser, registeredLeads]);

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
        setActiveChat: (chat) => {
            if (chat) {
                const threadId = `chat-${chat.demandId}-${chat.providerEmail}`;
                clearNewMessages(threadId);
            }
            setActiveChat(chat);
        },
        reassignAnonymousViews,
        notifications,
        unreadCount,
        unreadChatCount,
        markNotificationsAsRead,
        addAgentToLead,
        communityPosts,
        addCommunityPost,
        updateCommunityPost,
        deleteCommunityPost,
        addCommunityComment,
        logShareActivity,
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
