
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Minus, X, ArrowLeft, Users, ExternalLink, Scaling, MapPin } from 'lucide-react';
import { ChatPanel, type ChatSubmission } from './chat-dialog';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import Link from 'next/link';

function ConversationList({ onSelectConversation }: { onSelectConversation: (chat: ChatSubmission) => void }) {
    const { user, users } = useAuth();
    const { registeredLeads, listings, chatMessages } = useData();

    const conversations = React.useMemo(() => {
        if (!user) return [];

        const allUserLeads = registeredLeads.filter(lead => 
            lead.customerId === user.email || 
            lead.agentId === user.email ||
            lead.providers.some(p => p.providerEmail === user.email)
        );

        return allUserLeads.flatMap(lead => 
            lead.providers
              .filter(provider => provider.properties && provider.properties.length > 0)
              .map(provider => {
                const listing = listings.find(l => l.listingId === provider.properties[0]?.listingId);
                const customer = users[lead.customerId];
                const developer = users[provider.providerEmail];

                let chatPartnerName: string;
                let partnerInitials: string;

                if (user.email === customer?.email) {
                    chatPartnerName = developer?.companyName || "Developer";
                    partnerInitials = developer?.companyName?.[0] || 'D';
                } else {
                    chatPartnerName = customer?.companyName || "Customer";
                    partnerInitials = customer?.companyName?.[0] || 'C';
                }

                const threadId = `chat-${lead.id}-${provider.providerEmail}`;
                const messages = chatMessages[threadId] || [];
                const lastMessage = messages[messages.length - 1];

                return {
                    id: threadId,
                    submission: {
                        submissionId: threadId,
                        demandId: lead.id,
                        listingId: listing?.listingId || '',
                        providerEmail: provider.providerEmail,
                        listing: listing,
                        customerName: customer?.userName || '',
                        customerCompany: customer?.companyName || '',
                        chatPartnerName,
                    },
                    partnerName: chatPartnerName,
                    partnerInitials: partnerInitials,
                    lastMessage: lastMessage ? `${lastMessage.senderName}: ${lastMessage.text?.substring(0, 30)}...` : `Re: ${listing?.name || lead.requirementsSummary}`,
                    timestamp: lastMessage ? new Date(lastMessage.timestamp) : new Date(lead.registeredAt),
                } as const;
            })
        ).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
        
    }, [user, registeredLeads, listings, users, chatMessages]);

    if(conversations.length === 0) {
        return <div className="p-8 text-center text-sm text-muted-foreground">No active conversations.</div>
    }

    return (
        <div className="p-2 space-y-2">
            {conversations.map(conv => (
                <button key={conv.id} onClick={() => onSelectConversation(conv.submission as ChatSubmission)} className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>{conv.partnerInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{conv.partnerName}</p>
                            <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        <p className="text-xs text-muted-foreground self-start">{conv.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </button>
            ))}
        </div>
    )
}


export function GlobalChatWidget() {
    const { user } = useAuth();
    const { demands, activeChat, setActiveChat } = useData();
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

    const isCustomer = activeChat && user?.email === activeChat.customerName;

    let title = "Conversations";
    let subtitle = null;
    let linkHref = null;

    if (activeChat) {
        title = activeChat.chatPartnerName;
        if (isCustomer) {
            subtitle = `Re: ${activeChat.listing?.listingId} | ${activeChat.listing?.location} | ${activeChat.listing?.sizeSqFt.toLocaleString()} sq. ft.`;
            linkHref = `/listings/${activeChat.listingId}`;
        } else {
            const demand = demands.find(d => d.demandId === activeChat.demandId);
            const requirement = demand ? `${demand.size.toLocaleString()} sq. ft. in ${demand.locationName}` : 'requirement';
            subtitle = `Re: ${activeChat.demandId} | ${requirement}`;
            linkHref = `/dashboard/leads/${activeChat.demandId}`;
        }
    }


    return (
        <div className="fixed bottom-0 right-8 z-50 w-full max-w-sm h-[600px]">
            <Card className="flex flex-col h-full shadow-2xl border-border">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-secondary/50 rounded-t-lg">
                    <div className="flex items-center gap-2">
                        {activeChat && (
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleBackToList}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="flex-grow">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" /> 
                                {title}
                                {linkHref && (
                                    <Link href={linkHref} target="_blank">
                                        <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                    </Link>
                                )}
                            </CardTitle>
                            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
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
