
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Minus, X, ArrowLeft, Users, ExternalLink, Scaling, MapPin, Search } from 'lucide-react';
import { ChatPanel, type ChatSubmission } from './chat-dialog';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { type DemandSchema } from '@/lib/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

function ConversationList({ onSelectConversation }: { onSelectConversation: (chat: ChatSubmission) => void }) {
    const { user, users } = useAuth();
    const { registeredLeads, listings, chatMessages, clearNewMessages } = useData();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filter, setFilter] = React.useState('all');

    const conversations = React.useMemo(() => {
        if (!user) return [];

        const allUserLeads = registeredLeads.filter(lead => 
            lead.customerId === user.email || 
            lead.agentId === user.email ||
            lead.providers.some(p => p.providerEmail === user.email) ||
            (lead.isO2OCollaborator && (user.role === 'SuperAdmin' || user.role === 'O2O'))
        );

        return allUserLeads.flatMap(lead => {
             const provider = lead.isO2OCollaborator ? { providerEmail: 'superadmin@o2o.com', properties: lead.providers.flatMap(p => p.properties) } : lead.providers.find(p => p.providerEmail !== 'superadmin@o2o.com');
             if (!provider) return [];
             
             const listing = listings.find(l => l.listingId === provider.properties[0]?.listingId);
             const customer = users[lead.customerId];
             const developer = users[provider.providerEmail];

             let chatPartnerName: string;
             let partnerInitials: string;

             if (lead.isO2OCollaborator && (user.email === customer?.email || user.email === developer?.email || user.email === lead.agentId)) {
                 chatPartnerName = "O2O Team";
                 partnerInitials = "O2O";
             } else if (user.email === customer?.email) {
                 chatPartnerName = developer?.companyName || "Developer";
                 partnerInitials = developer?.companyName?.[0] || 'D';
             } else {
                 chatPartnerName = customer?.companyName || "Customer";
                 partnerInitials = customer?.companyName?.[0] || 'C';
             }
             
             const threadId = `chat-${lead.id}-${provider.providerEmail}`;
             const messages = chatMessages[threadId] || [];
             const lastMessage = messages[messages.length - 1];
             const isUnread = messages.some(m => m.isNew && m.senderEmail !== user.email);

             const listingIdentifier = user.role === 'Warehouse Developer' ? listing?.warehouseBoxId : listing?.listingId;

             return {
                 id: threadId,
                 submission: {
                     submissionId: threadId,
                     demandId: lead.id,
                     listingId: listing?.listingId || '',
                     providerEmail: provider.providerEmail,
                     listing: listing,
                     customerName: customer?.userName || '',
                     customerId: customer?.email || '',
                     customerCompany: customer?.companyName || '',
                     chatPartnerName,
                 },
                 partnerName: chatPartnerName,
                 partnerInitials: partnerInitials,
                 lastMessage: lastMessage ? `${lastMessage.senderName}: ${lastMessage.text?.substring(0, 30)}...` : `Re: ${listingIdentifier || lead.requirementsSummary}`,
                 timestamp: lastMessage ? new Date(lastMessage.timestamp) : new Date(lead.registeredAt),
                 isUnread,
             } as const;
        }).filter(Boolean)
        .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        
    }, [user, registeredLeads, listings, users, chatMessages]);

    const filteredConversations = React.useMemo(() => {
        let results = conversations;

        if (filter === 'unread') {
            results = results.filter(c => c.isUnread);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            return results.filter(conv => 
                conv.partnerName.toLowerCase().includes(lowerCaseSearch) ||
                conv.lastMessage.toLowerCase().includes(lowerCaseSearch) ||
                conv.submission.listing?.listingId.toLowerCase().includes(lowerCaseSearch) ||
                conv.submission.listing?.warehouseBoxId?.toLowerCase().includes(lowerCaseSearch) ||
                conv.submission.demandId.toLowerCase().includes(lowerCaseSearch)
            );
        }
        return results;
    }, [conversations, searchTerm, filter]);

    const unreadCount = React.useMemo(() => {
        return conversations.filter(c => c.isUnread).length;
    }, [conversations]);
    
    const handleSelect = (chat: ChatSubmission) => {
        clearNewMessages(chat.submissionId);
        onSelectConversation(chat);
    }

    if(conversations.length === 0) {
        return <div className="p-8 text-center text-sm text-muted-foreground">No active conversations.</div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b shrink-0 space-y-3">
                <h3 className="font-semibold">Conversations</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search conversations..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
             <Tabs value={filter} onValueChange={setFilter} className="w-full shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">
                        Unread
                        {unreadCount > 0 && <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>}
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="flex-grow overflow-y-auto">
                <ScrollArea className="h-full">
                     <div className="p-2 space-y-1">
                        {filteredConversations.length > 0 ? filteredConversations.map(conv => (
                            <button key={conv.id} onClick={() => handleSelect(conv.submission as ChatSubmission)} className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors relative">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{conv.partnerInitials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold truncate">{conv.partnerName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground self-start shrink-0">{conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                {conv.isUnread && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary" />}
                            </button>
                        )) : (
                            <div className="p-8 text-center text-sm text-muted-foreground">No {filter === 'unread' ? 'unread' : ''} conversations match your search.</div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}


export function GlobalChatWidget() {
    const { user } = useAuth();
    const { activeChat, setActiveChat, demands } = useData();
    const [isOpen, setIsOpen] = React.useState(false);

    if (!user) return null;

    const handleSelectConversation = (chat: ChatSubmission) => {
        setActiveChat(chat);
    };

    const handleBackToList = () => {
        setActiveChat(null);
    };
    
    if (!isOpen) {
        return (
            <div className="fixed bottom-8 right-8 z-50">
                <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full shadow-lg h-14 pl-5 pr-6 flex items-center gap-3">
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-lg font-medium">Chat</span>
                </Button>
            </div>
        )
    }
    
    let title = "Conversations";
    let subtitle: React.ReactNode = null;
    let linkHref = null;

    if (activeChat) {
        const listing = activeChat.listing;
        
        let headerTitle: string;
        
        if (user?.email === activeChat.customerId) {
            headerTitle = activeChat.chatPartnerName;
        } else {
            headerTitle = activeChat.customerCompany || 'Customer';
        }

        title = headerTitle;

        const isDeveloper = user?.email === activeChat.providerEmail;
        const listingIdentifier = isDeveloper ? listing?.warehouseBoxId : listing?.listingId;

        subtitle = (
            <div className="text-xs text-muted-foreground space-y-1">
                <p>
                    <span className="font-semibold">Listing:</span> {listingIdentifier || 'N/A'} | {listing?.location} | {listing?.sizeSqFt.toLocaleString()} sq. ft.
                </p>
                 <p>
                    <span className="font-semibold">Demand:</span> {activeChat.demandId}
                </p>
            </div>
        );

        linkHref = `/dashboard/leads/${activeChat.demandId}`;
    }


    return (
        <div className="fixed bottom-0 right-8 z-50 w-full max-w-sm h-[600px] flex flex-col">
            <Card className="flex flex-col h-full shadow-2xl border-border">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-secondary/50 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {activeChat && (
                             <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleBackToList}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex-grow space-y-1 overflow-hidden">
                            <CardTitle className="text-base flex items-center gap-2 truncate">
                                {activeChat ? <Users className="h-4 w-4 shrink-0" /> : <MessageSquare className="h-4 w-4 shrink-0" /> }
                                <span className="truncate">{title}</span>
                                {linkHref && (
                                    <Link href={linkHref} target="_blank">
                                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                    </Link>
                                )}
                            </CardTitle>
                            {subtitle && <div className="truncate">{subtitle}</div>}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setIsOpen(false)}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="p-0 flex-grow relative">
                    {activeChat ? (
                        <ChatPanel submission={activeChat} />
                    ) : (
                        <ConversationList onSelectConversation={handleSelectConversation} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
