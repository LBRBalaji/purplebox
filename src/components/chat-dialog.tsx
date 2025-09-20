
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
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Submission } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema } from '@/lib/schema';
import { useData, type ChatMessage } from '@/contexts/data-context';

type ChatSubmission = Submission & { 
    listing?: ListingSchema,
    chatPartnerName: string,
    customerName: string,
    customerCompany: string,
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
  const { chatMessages, addChatMessage } = useData();
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const threadId = submission ? `${submission.demandId}-${submission.listingId}` : null;
  const messages = threadId ? chatMessages[threadId] || [] : [];

  // Request notification permission
  React.useEffect(() => {
    if (isOpen && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
  }, [isOpen]);

  const showNotification = (body: string, senderName: string) => {
      if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
          const notification = new Notification(`New Message from ${senderName}`, {
              body,
              icon: '/logo.png' 
          });
      }
  }
  
  // Effect to play sound on new message
  React.useEffect(() => {
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (user && lastMessage.senderEmail !== user.email) {
            audioRef.current?.play();
            showNotification(lastMessage.text, lastMessage.senderName);
        }
    }
    // This dependency array intentionally ignores 'user' to only trigger on new messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  React.useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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
    
    await addChatMessage(threadId, message);
    
    setNewMessage('');
    setIsSending(false);
  };

  if (!submission?.listing) return null;
  
  const dialogTitle = `Chat with ${submission.chatPartnerName}`;
  const dialogDescription = `Conversation regarding Property ${submission.listing.listingId} and Demand ${submission.demandId}`;

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
                 {messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10">
                        No messages yet. Start the conversation!
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
            <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
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
