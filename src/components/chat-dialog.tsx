
'use client';

import * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Submission } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { useData, type ChatMessage } from '@/contexts/data-context';

export type ChatSubmission = Submission & { 
    listing?: ListingSchema,
    chatPartnerName: string,
    customerName: string,
    customerCompany: string,
};

export function ChatPanel({
  submission,
}: {
  submission: ChatSubmission | null;
}) {
  const { user } = useAuth();
  const { addChatMessage, typingStatus, updateTypingStatus, fetchTypingStatus } = useData();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const threadId = submission ? `${submission.demandId}-${submission.listingId}` : null;
  const otherUserTyping = threadId ? typingStatus[threadId] : null;
  
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
  }, []);

  const showNotification = (body: string, senderName: string) => {
      if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
          const notification = new Notification(`New Message from ${senderName}`, {
              body,
              icon: '/logo.png'
          });
      }
  }
  
  const fetchMessages = React.useCallback(async () => {
    if (!threadId) return;
    try {
      const response = await fetch('/api/chat-messages');
      const allMessages: Record<string, ChatMessage[]> = await response.json();
      const threadMessages = allMessages[threadId] || [];
      
      setMessages(prevMessages => {
        if (threadMessages.length > prevMessages.length) {
            const lastMessage = threadMessages[threadMessages.length - 1];
            if (user && lastMessage.senderEmail !== user.email) {
                showNotification(lastMessage.text, lastMessage.senderName);
            }
        }
        return threadMessages;
      });

    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  }, [threadId, user]);

  React.useEffect(() => {
    if (threadId) {
      fetchMessages();
      fetchTypingStatus(threadId);
      const intervalId = setInterval(() => {
        fetchMessages();
        fetchTypingStatus(threadId);
      }, 3000); 

      return () => {
        clearInterval(intervalId);
      };
    } else {
        setMessages([]);
    }
  }, [threadId, fetchMessages, fetchTypingStatus]);

  React.useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleTyping = () => {
    if (!threadId || !user) return;
    
    updateTypingStatus(threadId, {
      isTyping: true,
      userEmail: user.email,
      userName: user.userName,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(threadId, {
        isTyping: false,
        userEmail: user.email,
        userName: user.userName,
      });
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId || !user) return;

    setIsSending(true);

    const message: ChatMessage = {
      senderEmail: user.email,
      senderName: user.userName,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    updateTypingStatus(threadId, { isTyping: false, userEmail: user.email, userName: user.userName });
    if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);


    try {
      await addChatMessage(threadId, message);
    } catch (error) {
        console.error("Failed to send message:", error);
    } finally {
        setIsSending(false);
    }
  };

  if (!submission?.listing) return null;
  
  const isPremiumProvider = submission.listing.developerId === user?.email || submission.demandUserEmail === user?.email;
  
  const getInitialMessage = () => {
    if (messages.length > 0) return null;

    if (user?.email === submission.demandUserEmail) { // Customer starting chat
      return `Hi ${submission.chatPartnerName}, I'm interested in property ${submission.listing?.listingId}.`;
    }

    if (user?.email === submission.providerEmail) { // Provider starting chat
      return `Hi ${submission.customerName}, I see you're interested in our property ${submission.listing?.listingId}. How can I help?`;
    }

    // Default for O2O
    return `Hi, this is the O2O Assistant. I'm here to help facilitate the conversation regarding Property ${submission.listing?.listingId} for ${submission.customerCompany}.`;
  };
  
  const initialMessage = getInitialMessage();

  return (
    <>
        <div className="h-96 flex flex-col p-0">
            <div className="flex-grow overflow-hidden px-1 -mx-1">
                <ScrollArea className="h-full" scrollableViewportRef={scrollViewportRef}>
                <div className="space-y-4 p-1">
                    {initialMessage && messages.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-10 px-4 border border-dashed rounded-lg">
                            {initialMessage}
                        </div>
                    )}
                    {messages.map((message, index) => {
                    const isUser = message.senderEmail === user?.email;
                    const senderInitial = message.senderName ? message.senderName[0].toUpperCase() : '?';

                    return (
                        <div
                            key={index}
                            className={cn(
                            'flex items-end gap-2',
                            isUser ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {!isUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{senderInitial}</AvatarFallback>
                                </Avatar>
                            )}
                            <div
                            className={cn(
                                'rounded-lg p-3 max-w-xs md:max-w-sm',
                                isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            >
                            <p className="text-sm">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            </div>
                            {isUser && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{senderInitial}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    )
                    })}
                </div>
                </ScrollArea>
            </div>
            <div className="h-6 pt-2 text-xs text-muted-foreground">
            {otherUserTyping && otherUserTyping.isTyping && otherUserTyping.userEmail !== user?.email && (
                <div className="animate-pulse flex items-center gap-2">
                <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">{otherUserTyping.userName?.[0]}</AvatarFallback>
                </Avatar>
                <span>{otherUserTyping.userName} is typing...</span>
                </div>
            )}
            </div>
            <div className="pt-2">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                }}
                className="min-h-0 h-12 resize-none"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
                </Button>
            </form>
            </div>
        </div>
    </>
  );
}
