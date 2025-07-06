
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
import type { Submission } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';

type Message = {
  id: number;
  sender: 'User' | 'SuperAdmin';
  text: string;
  timestamp: string;
};

export function ChatDialog({
  submission,
  isOpen,
  onOpenChange,
}: {
  submission: Submission | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (submission) {
      setMessages([
        {
          id: 1,
          sender: 'SuperAdmin',
          text: `Hi ${user?.userName || 'there'}, I see you're interested in property ${submission.property.propertyId} for your demand ${submission.demandId}. How can I help?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
        setMessages([]);
    }
  }, [submission, user]);

  React.useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !submission) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'User',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    setTimeout(() => {
      const adminResponse: Message = {
        id: Date.now() + 1,
        sender: 'SuperAdmin',
        text: 'Thank you for your message. I will check with the property provider and get back to you shortly with more details.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, adminResponse]);
    }, 1500);
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Chat about Property: {submission.property.propertyId}</DialogTitle>
          <DialogDescription>
            For Demand ID: {submission.demandId}. Your messages will be sent to the admin.
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
                    {message.sender === 'SuperAdmin' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>A</AvatarFallback>
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
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
