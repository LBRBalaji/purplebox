
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Submission } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';

type ChatSubmission = Submission & { 
    listing?: ListingSchema,
    chatPartnerName: string,
};

type Message = {
  id: number;
  sender: 'User' | 'Model';
  text: string;
  timestamp: string;
};

// Genkit compatible message format
type ChatHistoryMessage = {
  role: 'user' | 'model';
  content: { text: string }[];
};

export function ChatDialog({
  submission,
  isOpen,
  onOpenChange,
}: {
  submission: ChatSubmission | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Request notification permission
  React.useEffect(() => {
    if (isOpen && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
  }, [isOpen]);

  const showNotification = (body: string) => {
      if ("Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("New Message from O2O Assistant", {
              body,
              icon: '/logo.png' 
          });
      }
  }

  React.useEffect(() => {
    if (isOpen && submission?.listing && submission.chatPartnerName && user) {
        let initialMessageText: string;
        const isCustomerView = user.email === submission.demandUserEmail;

        if (submission.chatPartnerName === 'O2O Team') {
            // Brokered Model
            initialMessageText = `Hi ${user.userName || 'there'}, this is the O2O Assistant. I see you're interested in property ${submission.listing.listingId}. How can I help you?`;
        } else {
            // Direct Model (Paid_Premium)
            if (isCustomerView) {
                // Customer is viewing the chat. The initial message is from the Developer's perspective.
                initialMessageText = `Hi ${user.userName}, thank you for your interest in property ${submission.listing.listingId}. I represent ${submission.chatPartnerName}. How can I assist you?`;
            } else {
                // Developer or Agent is viewing the chat. The initial message is from the Customer's perspective.
                 initialMessageText = `Hi ${submission.chatPartnerName}, I am interested in property ${submission.listing.listingId}. I represent ${user.companyName}.`;
            }
        }

      setMessages([
        {
          id: 1,
          sender: 'Model',
          text: initialMessageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
        setMessages([]);
    }
  }, [submission, user, isOpen]);

  React.useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !submission || !user) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'User',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage('');
    setIsGenerating(true);

    try {
        const history: ChatHistoryMessage[] = updatedMessages.map(msg => ({
            role: msg.sender === 'User' ? 'user' : 'model',
            content: [{ text: msg.text }]
        }));

        const aiResponse = await generateChatResponse({
            history,
            listingId: submission.listingId,
            demandId: submission.demandId,
            userName: user.userName,
            chatPartnerName: submission.chatPartnerName,
        });
        
        if (aiResponse.response) {
            const adminResponse: Message = {
                id: Date.now() + 1,
                sender: 'Model',
                text: aiResponse.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, adminResponse]);
            showNotification(aiResponse.response);
            audioRef.current?.play();
        }

    } catch (error) {
        console.error("Failed to get AI response", error);
        const errorResponse: Message = {
            id: Date.now() + 1,
            sender: 'Model',
            text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorResponse]);
    } finally {
        setIsGenerating(false);
    }
  };

  if (!submission?.listing) return null;
  
  const dialogTitle = submission.chatPartnerName === 'O2O Team' 
    ? `Chat about Property: ${submission.listing.listingId}`
    : `Chat with ${submission.chatPartnerName}`;
    
  const dialogDescription = submission.chatPartnerName === 'O2O Team'
    ? 'Your messages will be sent to the O2O Assistant.'
    : `This is a direct channel to ${submission.chatPartnerName}.`;


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden px-6">
            <ScrollArea className="h-full -mx-6" scrollableViewportRef={scrollViewportRef}>
            <div className="space-y-4 px-6">
                {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                    'flex items-end gap-2',
                    message.sender === 'User' ? 'justify-end' : 'justify-start'
                    )}
                >
                    {message.sender === 'Model' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{submission.chatPartnerName[0]}</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                    className={cn(
                        'rounded-lg p-3 max-w-xs md:max-w-sm',
                        message.sender === 'User'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                    >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp}</p>
                    </div>
                     {message.sender === 'User' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user?.userName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
                ))}
                {isGenerating && (
                    <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-8 w-8">
                           <AvatarFallback>{submission.chatPartnerName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="rounded-lg p-3 max-w-xs md:max-w-sm bg-muted flex items-center gap-2">
                            <Sparkles className="h-4 w-4 animate-spin"/>
                            <span className="text-sm italic">Typing...</span>
                        </div>
                    </div>
                )}
            </div>
            </ScrollArea>
        </div>
        <DialogFooter className="p-6 pt-2">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-0 h-12 resize-none"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                  }
              }}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isGenerating}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </DialogFooter>
        <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      </DialogContent>
    </Dialog>
  );
}
