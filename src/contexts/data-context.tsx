
'use client';


import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { type DemandSchema, type ListingSchema, type TenantImprovementsSheet, type NegotiationBoardSchema, type AcknowledgmentDetails, type LayoutRequestData, type CommunityPost, type ShareHistoryEntry } from '@/lib/schema';
import { type User, useAuth } from './auth-context';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
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

export type OffPlatformProperty = {
  address: string;
  area: number;
  buildingType: string;
  indicativeRent?: number;
  securityDeposit?: number;
  leasePeriod?: string;
  notes?: string;
};

export type DealInvitee = {
  name: string;
  email: string;
  role: 'Customer' | 'Developer' | 'Agent' | 'Stakeholder';
  roleDescription?: string;   // e.g. "Legal Counsel", "Finance Team", "Bank Representative"
  token: string;
  invitedAt: string;
  invitedBy?: string;         // email of the person who invited
  lastAccessedAt?: string;
  registered?: boolean;
  accessType?: 'edit' | 'readonly';  // stakeholders always 'readonly'
};

export type RegisteredLead = {
  id: string;
  customerId: string;
  agentId?: string;
  leadName: string;
  leadContact: string;
  leadEmail: string;
  leadPhone: string;
  requirementsSummary: string;
  registeredBy: string;
  registeredAt: string;
  providers: RegisteredLeadProvider[];
  isO2OCollaborator?: boolean;
  engagePath?: 'direct' | 'orsone' | 'agent' | null;
  developerEngagePath?: 'independent' | 'orsone-partner' | null;
  agentInviteCode?: string;
  agentInviteEmail?: string;
  agentInviteExpiry?: number;
  messageGated?: boolean;
  // Off-platform deal fields
  isOffPlatform?: boolean;
  offPlatformProperty?: OffPlatformProperty;
  invitees?: DealInvitee[];
  dealRegisteredAt?: string;
  // Transaction mode & broker fields
  transactionMode?: 'direct' | 'ors-tp' | 'agent';
  brokerEmail?: string;
  brokerName?: string;
  brokerAcknowledged?: boolean;
  brokerAcknowledgedAt?: string;
  platformFeeAccepted?: boolean;
}

export type TransactionActivity = {
    activityId: string;
    leadId: string; // RegisteredLead ID
    activityType: 'Lead Registered' | 'Quote Requested' | 'Quote Submitted' | 'Site Visit Request' | 'Site Visit Update' | 'Customer Feedback' | 'Tenant Improvements' | 'Proposal Submitted' | 'Lead Acknowledged';
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
  deleteDemand: (demandId: string) => void;
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
  downloadHistory: DownloadRecord[];
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
  setNotificationsFromWatcher: (notifs: Notification[]) => void;
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
  const [notifications,
        setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>([]);
  
  // ── Role-based endpoint splitting ──────────────────────────────────────────
  // Only fetch what each role actually needs. Cuts startup requests 60-70%.
  // ALL_ENDPOINTS order must match stateSetters order below.
  const ALL_ENDPOINTS = [
    'listings',               // 0  - all roles that browse
    'demands',                // 1  - customer, agent, admin
    'submissions',            // 2  - developer, admin
    'agent-leads',            // 3  - agent, admin
    'listing-analytics',      // 4  - developer, admin (lazy — only on analytics tab)
    'registered-leads',       // 5  - customer, developer, agent, admin
    'transaction-activities', // 6  - customer, developer, agent, admin
    'tenant-improvements',    // 7  - customer, developer, admin
    'negotiation-boards',     // 8  - customer, developer, admin
    'about-us-content',       // 9  - admin only (rarely changes)
    'location-circles',       // 10 - admin, developer (listing form)
    'download-acknowledgments', // 11 - admin
    'download-history',       // 12 - admin, customer
    'view-history',           // 13 - admin
    'layout-requests',        // 14 - admin
    'chat-messages',          // 15 - customer, developer, agent
    'notifications',          // 16 - all logged-in
    'typing-status',          // 17 - customer, developer, agent (chat)
    'community-posts',        // 18 - all
    'share-history',          // 19 - admin
  ];

  // Determine which endpoints to fetch based on role
  const role = authUser?.role;
  const isAdmin = role === 'SuperAdmin' || role === 'O2O';
  const isDeveloper = role === 'Warehouse Developer';
  const isCustomer = role === 'User';
  const isAgent = role === 'Agent';
  const isLoggedIn = !!authUser;

  const endpointMask: boolean[] = [
    // 0  listings
    true,
    // 1  demands — public (visible on /demands without login)
    true,
    // 2  submissions
    isDeveloper || isAdmin,
    // 3  agent-leads
    isAgent || isAdmin,
    // 4  listing-analytics — LAZY: fetched on-demand in analytics pages
    false,
    // 5  registered-leads
    isLoggedIn,
    // 6  transaction-activities
    isLoggedIn,
    // 7  tenant-improvements
    isLoggedIn,
    // 8  negotiation-boards
    isLoggedIn,
    // 9  about-us-content
    isAdmin,
    // 10 location-circles
    isDeveloper || isAdmin,
    // 11 download-acknowledgments
    isAdmin,
    // 12 download-history — LAZY: analytics pages only
    false,
    // 13 view-history — LAZY: analytics pages only
    false,
    // 14 layout-requests
    isAdmin,
    // 15 chat-messages — initial fetch via polling; real-time updates via onSnapshot
    isLoggedIn,
    // 16 notifications — initial fetch via polling; real-time updates via NotificationWatcher
    isLoggedIn,
    // 17 typing-status
    isLoggedIn,
    // 18 community-posts — LAZY: /community pages only
    false,
    // 19 share-history — LAZY: analytics pages only
    false,
  ];

  const endpoints = ALL_ENDPOINTS.filter((_, i) => endpointMask[i]);

  
  // ALL_ENDPOINTS → stateSetters mapping (must stay in sync with index order above)
  const ALL_STATE_SETTERS = [
    setListings, setDemands, setSubmissions, setAgentLeads, setListingAnalytics,
    setRegisteredLeads, setTransactionActivities, setTenantImprovements,
    setNegotiationBoards, setAboutUsContent, setLocationCircles,
    setDownloadAcknowledgments, setDownloadHistory, setViewHistory,
    setLayoutRequests, setChatMessages, setNotifications, setTypingStatus,
    setCommunityPosts, setShareHistory,
  ];

  const fetchData = useCallback(() => {
    (async () => {
        try {
            // Only fetch the role-filtered endpoints
            const fetchPromises = endpoints.map(ep => fetch(`/api/${ep}`));
            const responses = await Promise.allSettled(fetchPromises);

            const data = await Promise.all(responses.map(async (res, index) => {
                if (res.status === 'fulfilled' && res.value.ok) {
                    try {
                        const text = await res.value.text();
                        return text ? JSON.parse(text) : null;
                    } catch { return null; }
                }
                return null;
            }));

            // Map results back to correct state setters using ALL_ENDPOINTS index
            endpoints.forEach((ep, fetchIdx) => {
              const allIdx = ALL_ENDPOINTS.indexOf(ep);
              if (allIdx === -1 || data[fetchIdx] === null) return;
              const setter = ALL_STATE_SETTERS[allIdx];
              if (!setter) return;
              setter((prev: any) => {
                // Shallow length check first — avoids full JSON.stringify on large arrays
                if (Array.isArray(prev) && Array.isArray(data[fetchIdx]) &&
                    prev.length === data[fetchIdx].length &&
                    JSON.stringify(prev) === JSON.stringify(data[fetchIdx])) {
                  return prev;
                }
                return data[fetchIdx];
              });
            });

            if (isLoading) {
              try {
                const storedShortlist = localStorage.getItem('general_shortlist');
                if (storedShortlist) setGeneralShortlist(JSON.parse(storedShortlist));
              } catch {}
              setIsShortlistLoading(false);
              setIsLoading(false);
            }
        } catch (error) {
            console.error("A critical error occurred during data polling", error);
            if (isLoading) setIsLoading(false);
        }
    })();
  }, [isLoading, endpoints.join(',')]);

  useEffect(() => {
    // Skip polling entirely for unauthenticated public visitors
    // Re-runs automatically when authUser changes (login/logout)
    if (endpoints.length === 0) {
      if (isLoading) setIsLoading(false);
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData, authUser?.email]); // re-run on login/logout

  // ── Tier 3: Firestore real-time listeners ───────────────────────────────────
  // notifications — handled by NotificationWatcher component (watches doc '0')
  // Do NOT add a second listener here — it causes React error #300

  // chat-messages — real-time listener on doc '0'
  useEffect(() => {
    if (!isLoggedIn) return;
    const docRef = doc(db, 'chat-messages', '0');
    const unsubscribe = onSnapshot(docRef,
      (snap) => {
        queueMicrotask(() => {
          try {
            if (!snap.exists()) return;
            const data = snap.data() || {};
            setChatMessages(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data)) return prev;
              return data;
            });
          } catch {}
        });
      },
      (err) => console.error('Chat messages listener error:', err)
    );
    return () => unsubscribe();
  }, [isLoggedIn]);

  // ── Tier 2: Lazy fetch — call when navigating to a section that needs it ────
  // Use refs so fetchLazy never closes over stale setters
  const lazySetterRef = React.useRef<Record<string, (data: any) => void>>({});
  lazySetterRef.current = {
    'listing-analytics': setListingAnalytics,
    'download-history': setDownloadHistory,
    'view-history': setViewHistory,
    'community-posts': setCommunityPosts,
    'share-history': setShareHistory,
  };

  const fetchLazy = useCallback(async (endpoint: string) => {
    const setter = lazySetterRef.current[endpoint];
    if (!setter) return;
    try {
      const res = await fetch(`/api/${endpoint}`);
      if (!res.ok) return;
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : null;
      if (parsed !== null) setter(parsed);
    } catch {}
  }, []); // stable — refs never go stale

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


  const sendEmailNotification = async (recipientEmail: string, title: string, message: string, href: string) => {
    try {
      const allUsers = Object.values(users || {}) as any[];
      const recipient = allUsers.find((u: any) => u.email === recipientEmail);
      if (!recipient || recipient.emailNotifications === false) return;
      await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipientEmail, userName: recipient.userName, title, message, href }),
      });
    } catch(e) { console.error('Email notification error:', e); }
  };

  const addNotification = useCallback((notification: Omit<Notification, 'isRead'>) => {
    setNotifications(prev => {
        const newNotification = { ...notification, isRead: false };
        const updatedNotifications = [newNotification, ...prev];
        // persistNotifications calls /api/notifications POST which fires emails server-side (single path)
        persistNotifications(updatedNotifications);
        return updatedNotifications;
    });
  }, [persistNotifications]);

  const setNotificationsFromWatcher = useCallback((notifs: Notification[]) => {
    setNotifications(notifs);
  }, []);

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

    // Determine recipient — if customer sent, notify developer and vice versa
    const isCustomerSending = context.lead.customerId === authUser?.email;
    const providerEmail = context.lead.providers?.[0]?.providerEmail;
    const recipientEmail = isCustomerSending ? providerEmail : context.lead.customerId;
    const recipient = recipientEmail ? users[recipientEmail] : null;
    if (recipient && recipientEmail) {
      const notifTitle = isCustomerSending
        ? 'Customer sent you a message'
        : `New message from ${authUser?.userName}`;
      const notifMessage = isCustomerSending
        ? 'A customer has sent you a message. Pay to connect and read their message.'
        : `Regarding transaction ${context.lead.id}: "${message.text?.substring(0, 50)}..."`;
      addNotification({
        id: `notif-${Date.now()}-${recipientEmail}-${Math.random()}`,
        type: 'new_chat_message',
        title: notifTitle,
        message: notifMessage,
        href: `/dashboard?tab=${isCustomerSending ? 'prospects' : 'registered-leads'}`,
        recipientEmail,
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
        // Always include ORS-ONE admin on transactions
        participants.add('balaji@lakshmibalajio2o.com');
        // Include broker if appointed
        if ((lead as any).brokerEmail) participants.add((lead as any).brokerEmail);
        // Include agent if present
        if ((lead as any).agentInviteEmail) participants.add((lead as any).agentInviteEmail);
        
        const uniqueParticipants = Array.from(participants).filter(p => p !== newActivity.createdBy);

        // Skip 'Lead Registered' — addRegisteredLead fires its own dedicated notification below
        // Skip 'Quote Requested' — listing page fires its own dedicated notification
        // This prevents duplicate emails on those two events
        const skipTypes = ['Lead Registered', 'Quote Requested'];
        if (!skipTypes.includes(newActivity.activityType)) {
          const actorName = (users as any)[newActivity.createdBy]?.companyName || (users as any)[newActivity.createdBy]?.userName || 'A transaction participant';
          const activityMsg = newActivity.details?.message || `${newActivity.activityType} logged by ${actorName}.`;
          uniqueParticipants.forEach(participantEmail => {
              addNotification({
                  id: `notif-${newActivity.createdAt}-${participantEmail}-${Math.random()}`,
                  type: 'new_activity',
                  title: `${newActivity.activityType}: Transaction ${lead.id}`,
                  message: activityMsg,
                  href: `/dashboard/leads/${lead.id}?tab=activity`,
                  recipientEmail: participantEmail,
                  timestamp: newActivity.createdAt,
                  triggeredBy: newActivity.createdBy
              });
          });
        }
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
                title: `New Lead: ${newLead.leadName}`,
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
                title: `New Lead: ${newLead.leadName}`,
                message: `${newLead.leadName} has shown interest in your listing and initiated contact on ORS-ONE. Please open the Transaction Workspace to review and respond.`,
                href: `/dashboard/leads/${newLead.id}?tab=activity`,
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

  const deleteDemand = useCallback((demandId: string) => {
    setDemands(prevDemands => {
        const newDemands = prevDemands.filter(d => d.demandId !== demandId);
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
  
  const getEmailDomain = (email: string) => {
    if (email === 'balajispillai@gmail.com') return 'balaji-test';
    return email.split('@')[1]?.toLowerCase() || email;
  };

  const getDownloadLimits = useCallback((user: User, listingsToDownload: ListingSchema[]) => {
    // Demo account — no limits
    if (user.email === 'balajispillai@gmail.com') return { allowed: true, message: 'Unlimited access.' };
    const todayStart = startOfDay(new Date()).getTime();
    const domain = getEmailDomain(user.email);
    const INDIVIDUAL_LIMIT = 5;
    const CITY_LIMIT = 5;
    const MAX_CITIES = 3;
    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;
    if (individualToday >= INDIVIDUAL_LIMIT) {
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);
      const resumeStr = tomorrowDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ' at 12:00 AM';
      return { allowed: false, message: `You've reached your daily download limit of ${INDIVIDUAL_LIMIT}. Access resumes on ${resumeStr}. For increased limits, write to balaji@lakshmibalajio2o.com.` };
    }
    const companyTodayDownloads = downloadHistory.filter(d => getEmailDomain(d.userId) === domain && d.timestamp >= todayStart);
    const citiesDownloadedToday = [...new Set(companyTodayDownloads.map(d => d.location?.toLowerCase().trim()))].filter(Boolean);
    const newCities = [...new Set(listingsToDownload.map(l => l.location?.toLowerCase().trim()))].filter(Boolean);
    for (const city of newCities) {
      const cityDownloads = companyTodayDownloads.filter(d => d.location?.toLowerCase().trim() === city).length;
      if (cityDownloads >= CITY_LIMIT) {
        return { allowed: false, message: `Your team has reached the daily download limit for ${city}. Try listings in other cities. For increased limits, write to balaji@lakshmibalajio2o.com.` };
      }
    }
    const allCitiesToday = new Set([...citiesDownloadedToday, ...newCities]);
    if (allCitiesToday.size > MAX_CITIES) {
      return { allowed: false, message: `Your team has reached the maximum of ${MAX_CITIES} cities per day. For increased limits, write to balaji@lakshmibalajio2o.com.` };
    }
    return { allowed: true, message: '' };
  }, [downloadHistory]);

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
    const limitCheck = getDownloadLimits(user, listingsToDownload);
    if (!limitCheck.allowed) {
        toast({ variant: "destructive", title: "Download Limit Reached", description: limitCheck.message });
        return { success: false, limitReached: true, message: limitCheck.message };
    }
    const todayStart = startOfDay(new Date()).getTime();
    const individualToday = downloadHistory.filter(d => d.userId === user.email && d.timestamp >= todayStart).length;
    const INDIVIDUAL_LIMIT = 5;
    if (individualToday === INDIVIDUAL_LIMIT - 1) {
        toast({ title: "1 download remaining today", description: "You are close to your daily limit." });
    }
    
    const newDownloadRecords: DownloadRecord[] = [];
    
    const providerToListingsMap: { [providerEmail: string]: string[] } = {};

    listingsToDownload.forEach(listing => {
        // Always use the actual developer's email — every download creates a chat thread
        const providerEmail = listing.developerId || 'balaji@lakshmibalajio2o.com';
        
        if (!providerToListingsMap[providerEmail]) {
            providerToListingsMap[providerEmail] = [];
        }
        providerToListingsMap[providerEmail].push(listing.listingId);

        const record: DownloadRecord = { userId: user.email, companyName: user.companyName, listingId: listing.listingId, location: listing.location, timestamp: Date.now() };
        newDownloadRecords.push(record);
    });

    // Auto-create one lead per listing per provider — each gets its own chat thread
    Object.entries(providerToListingsMap).forEach(([providerEmail, listingIds]) => {
      if (providerEmail === 'balaji@lakshmibalajio2o.com') return;
      listingIds.forEach(listingId => {
        const listing = listingsToDownload.find(l => l.listingId === listingId);
        const leadId = 'LDR-DL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();
        const newLead: Omit<RegisteredLead, 'registeredAt'> = {
          id: leadId,
          customerId: user.email,
          leadName: user.companyName,
          leadContact: user.userName,
          leadEmail: user.email,
          leadPhone: user.phone || '',
          requirementsSummary: `Customer downloaded: ${listing?.name || listingId}. Awaiting engagement.`,
          registeredBy: user.email,
          providers: [{
            providerEmail,
            properties: [{ listingId, status: 'Pending' }],
          }],
          isO2OCollaborator: false,
          engagePath: null,
        };
        addRegisteredLead(newLead, user.email);
      });
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
  }, [getCompanyDownloadCounts, getDownloadLimits, persistDownloadHistory, persistListingAnalytics, toast]);

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
    if (authUser?.email !== 'balajispillai@gmail.com' && selectedForDownload.length >= 5 && !selectedForDownload.some(item => item.listingId === listing.listingId)) {
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
      const isAdding = !generalShortlist.includes(listingId);
      const newShortlist = isAdding
        ? [...generalShortlist, listingId]
        : generalShortlist.filter(id => id !== listingId);
      
      setGeneralShortlist(newShortlist);
      try {
          localStorage.setItem('general_shortlist', JSON.stringify(newShortlist));
      } catch (error) {
          console.error("Could not write to localStorage", error);
      }

      // TP4 — Shortlist signal: notify developer in-app (soft signal, no email)
      if (isAdding && authUser?.role === 'User') {
        const listing = listings.find(l => l.listingId === listingId);
        if (listing?.developerId && listing.developerId !== authUser.email) {
          addNotification({
            id: `shortlist-${authUser.email}-${listingId}-${Date.now()}`,
            type: 'new_lead_for_provider',
            title: `Listing Shortlisted: ${listingId}`,
            message: `A customer from ${authUser.companyName || 'a company'} has shortlisted your listing ${listingId} (${listing.location?.split(',')[0]}). This is an early interest signal — they may send a Request for Quote soon.`,
            href: `/dashboard?tab=prospects`,
            recipientEmail: listing.developerId,
            timestamp: new Date().toISOString(),
            triggeredBy: authUser.email,
          });
        }
      }

      setTimeout(() => setIsShortlistLoading(false), 300);
  }, [generalShortlist, authUser, listings, addNotification]);

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
        demands, addDemand, updateDemand, deleteDemand, submissions, addSubmission, updateSubmissionStatus, shortlistedItems, toggleShortlist, clearNewSubmissions, lastEvent, agentLeads, addAgentLead, updateAgentLeadStatus, isLoading,
        downloadHistory,
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
        toggleGeneralShortlist, fetchLazy,
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
        setNotificationsFromWatcher,
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
