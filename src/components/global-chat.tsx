'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, ArrowLeft, Search } from 'lucide-react';
import { ChatPanel, type ChatSubmission } from './chat-dialog';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

function ConversationList({ onSelectConversation }: { onSelectConversation: (chat: ChatSubmission) => void }) {
  const { user, users } = useAuth();
  const { registeredLeads, listings, clearNewMessages, unreadChatCount } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [chatMessages, setChatMessages] = React.useState<Record<string, any[]>>({});

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'chat-messages', '0'), (snap) => {
      if (snap.exists()) setChatMessages(snap.data() as any);
    });
    return () => unsub();
  }, []);

  const conversations = React.useMemo(() => {
    if (!user) return [];
    const allUserLeads = registeredLeads.filter(lead =>
      lead.customerId === user.email ||
      lead.agentId === user.email ||
      lead.providers.some(p => p.providerEmail === user.email) ||
      user.role === 'SuperAdmin' || user.role === 'O2O'
    );

    return allUserLeads.flatMap(lead => {
      const providerForLead = lead.providers.find(p => p.providerEmail !== 'superadmin@o2o.com') || lead.providers[0];
      if (!providerForLead || !providerForLead.properties || providerForLead.properties.length === 0) return [];
      const listing = listings.find(l => l.listingId === providerForLead.properties[0]?.listingId);
      const customer = users[lead.customerId];
      const developer = users[providerForLead.providerEmail];
      const isProvider = user.email === developer?.email;
      let chatPartnerName: string;
      let partnerInitials: string;
      if (user.email === customer?.email) {
        chatPartnerName = lead.isO2OCollaborator ? 'O2O Team' : (developer?.companyName || 'Developer');
        partnerInitials = lead.isO2OCollaborator ? 'O2' : (developer?.companyName?.slice(0,2) || 'D');
      } else {
        const customerCompany = customer?.companyName || 'Customer';
        chatPartnerName = isProvider && lead.isO2OCollaborator ? 'For-' + customerCompany : customerCompany;
        partnerInitials = customerCompany.slice(0,2).toUpperCase();
      }
      const threadId = 'chat-' + lead.id + '-' + providerForLead.providerEmail;
      const messages = chatMessages[threadId] || [];
      const lastMessage = messages[messages.length - 1];
      const isUnread = messages.some((m: any) => m.isNew && m.senderEmail !== user.email);
      const boxId = listing?.warehouseBoxId || listing?.name || '';
      const listingId = listing?.listingId || '';
      const refLabel = boxId ? boxId + ' · ' + listingId : listingId;

      return {
        id: threadId,
        partnerName: chatPartnerName,
        partnerInitials,
        refLabel,
        lastMessage: lastMessage ? lastMessage.senderName + ': ' + (lastMessage.text || '').substring(0, 40) : 'Re: ' + refLabel,
        timestamp: lastMessage ? new Date(lastMessage.timestamp) : new Date(lead.registeredAt),
        isUnread,
        submission: {
          submissionId: threadId,
          demandId: lead.id,
          listingId: listing?.listingId || '',
          providerEmail: providerForLead.providerEmail,
          listing,
          customerName: customer?.userName || '',
          customerId: customer?.email || '',
          customerCompany: customer?.companyName || '',
          chatPartnerName,
        } as ChatSubmission,
      };
    }).filter(Boolean).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [user, users, registeredLeads, listings, chatMessages]);

  const filtered = React.useMemo(() => {
    let r = conversations;
    if (filter === 'unread') r = r.filter(c => c.isUnread);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      r = r.filter(c => c.partnerName.toLowerCase().includes(s) || c.refLabel.toLowerCase().includes(s) || c.lastMessage.toLowerCase().includes(s));
    }
    return r;
  }, [conversations, searchTerm, filter]);

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-sm text-muted-foreground">No active conversations yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search conversations..." className="pl-8 h-8 text-xs rounded-full bg-secondary border-0" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="flex border-b border-border flex-shrink-0">
        {['all','unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={'flex-1 py-2 text-xs font-semibold capitalize transition-colors ' + (filter === f ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground')}>
            {f === 'unread' ? (
              <span className="flex items-center justify-center gap-1.5">
                Unread {unreadChatCount > 0 && <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadChatCount}</span>}
              </span>
            ) : 'All'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(conv => (
          <button key={conv.id} onClick={() => { clearNewMessages(conv.id); onSelectConversation(conv.submission as ChatSubmission); }}
            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors border-b border-border/50 relative">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
              {conv.partnerInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={'text-sm font-semibold truncate ' + (conv.isUnread ? 'text-foreground' : 'text-foreground/80')}>{conv.partnerName}</p>
                <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{conv.timestamp.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              {conv.refLabel && (
                <span className="inline-block text-xs bg-primary/8 text-primary font-semibold px-2 py-0.5 rounded-full mt-1">{conv.refLabel}</span>
              )}
            </div>
            {conv.isUnread && <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GlobalChatWidget() {
  const { user } = useAuth();
  const { activeChat, setActiveChat, registeredLeads, listings, unreadChatCount } = useData();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return null;

  const handleSelectConversation = (chat: ChatSubmission) => setActiveChat(chat);
  const handleBackToList = () => setActiveChat(null);

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full shadow-xl h-14 px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 relative">
          <MessageSquare className="h-5 w-5" />
          <span className="font-semibold">Chat</span>
          {unreadChatCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs">{unreadChatCount}</Badge>
          )}
        </Button>
      </div>
    );
  }

  let headerTitle = 'Conversations';
  let headerSub = '';
  let refBar: React.ReactNode = null;

  if (activeChat) {
    const listing = activeChat.listing;
    const lead = registeredLeads.find(l => l.id === activeChat.demandId);
    const isProvider = user?.email === activeChat.providerEmail;
    if (user?.email === activeChat.customerId) {
      headerTitle = lead?.isO2OCollaborator ? 'O2O Team' : activeChat.chatPartnerName;
    } else {
      headerTitle = isProvider && lead?.isO2OCollaborator ? 'For-' + activeChat.customerCompany : activeChat.customerCompany;
    }
    const boxId = listing?.warehouseBoxId || listing?.name || '';
    const parts = [boxId, listing?.listingId, listing?.location].filter(Boolean);
    headerSub = parts.join(' · ');
    refBar = null;
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 w-[360px] flex flex-col" style={{height: 'min(600px, 85vh)'}}>
      <div className="flex flex-col h-full bg-card rounded-t-2xl shadow-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-primary flex-shrink-0">
          {activeChat && (
            <button onClick={handleBackToList} className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 hover:bg-white/25 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5 text-white" />
            </button>
          )}
          {activeChat && (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
              {(activeChat.customerCompany || activeChat.chatPartnerName || 'C').slice(0,2).toUpperCase()}
            </div>
          )}
          {!activeChat && (
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{headerTitle}</p>
            {headerSub && <p className="text-xs text-white/70 truncate">{headerSub}</p>}
          </div>
          <button onClick={() => setIsOpen(false)} className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 hover:bg-white/25 transition-colors">
            <X className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
        {refBar}
        <div className="flex-1 flex flex-col min-h-0">
          {activeChat ? <ChatPanel submission={activeChat} /> : <ConversationList onSelectConversation={handleSelectConversation} />}
        </div>
      </div>
    </div>
  );
}
