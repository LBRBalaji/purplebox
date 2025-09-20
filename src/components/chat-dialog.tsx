
'use client';

import React, { useCallback } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageSquare, Paperclip, File as FileIcon, ExternalLink, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Submission } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import type { ListingSchema, RegisteredLead } from '@/lib/schema';
import { useData, type ChatMessage } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';


export type ChatSubmission = Submission & { 
    listing?: ListingSchema,
    chatPartnerName: string,
    customerName: string,
    customerCompany: string,
};

// Function to detect URLs in text and wrap them in <a> tags
const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{part}</a>;
        }
        return part;
    });
};


export function ChatPanel({
  submission,
}: {
  submission: ChatSubmission | null;
}) {
  const { user, users } = useAuth();
  const { toast } = useToast();
  const { chatMessages, addChatMessage, typingStatus, updateTypingStatus, fetchTypingStatus, registeredLeads } = useData();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const threadId = submission ? `chat-${submission.demandId}-${submission.providerEmail}` : null;
  const otherUserTyping = threadId ? typingStatus[threadId] : null;
  const lead = registeredLeads.find(l => l.id === submission?.demandId);
  
  const fetchMessages = useCallback(async () => {
    if (!threadId) return;
    try {
      const response = await fetch('/api/chat-messages');
      const allMessages: Record<string, ChatMessage[]> = await response.json();
      const threadMessages = allMessages[threadId] || [];
      
      setMessages(currentMessages => {
          if(JSON.stringify(threadMessages) !== JSON.stringify(currentMessages)) {
              return threadMessages;
          }
          return currentMessages;
      });

    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    }
  }, [threadId]);

  React.useEffect(() => {
    if (threadId) {
      fetchMessages();
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
  
   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !threadId || !user || !lead) return;
    
    setIsSending(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress((e.loaded / e.total) * 100);
      }
    };
    
    xhr.onload = async () => {
      setUploadProgress(null);
      setIsSending(false);
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        const message: ChatMessage = {
          senderEmail: user.email,
          senderName: user.userName,
          text: `Attachment: ${file.name}`,
          timestamp: new Date().toISOString(),
          attachment: {
            fileName: file.name,
            fileUrl: result.url,
            fileType: file.type
          }
        };
        setMessages(prev => [...prev, message]);
        await addChatMessage(threadId, message, { lead, partner: users[submission.providerEmail] });
      } else {
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file.' });
      }
    };

    xhr.onerror = () => {
      setUploadProgress(null);
      setIsSending(false);
      toast({ variant: 'destructive', title: 'Upload Error', description: 'An error occurred during the file upload.' });
    };

    xhr.send(formData);
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !threadId || !user || !lead) return;

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
      await addChatMessage(threadId, message, { lead, partner: users[submission.providerEmail] });
    } catch (error) {
        console.error("Failed to send message:", error);
    } finally {
        setIsSending(false);
    }
  };

  const onEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  }

  if (!submission?.listing || !lead) return null;
  
  const getInitialMessage = () => {
    if (messages.length > 0) return null;

    if (user?.email === lead.customerId) { // Customer starting chat
      return `Hi ${submission.chatPartnerName}, I'm interested in property ${submission.listing?.listingId}.`;
    }

    if (user?.email === submission.providerEmail) { // Provider starting chat
      return `Hi ${submission.customerName}, I see you're interested in our property ${submission.listing?.listingId}. How can I help?`;
    }

    // Default for O2O
    return `Hi, this is the O2O Assistant. I'm here to help facilitate the conversation regarding Property ${submission.listing?.listingId} for ${submission.customerCompany}.`;
  };
  
  const initialMessage = getInitialMessage();
  const emojis = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🚀', '🎉', '🤔', '😊', '😎', '💯'];


  return (
    <div className="absolute inset-0 flex flex-col">
        <div className="flex-grow overflow-y-auto">
            <ScrollArea className="h-full" scrollableViewportRef={scrollViewportRef}>
                <div className="space-y-4 p-4">
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
                                'rounded-lg p-3 max-w-[80%]',
                                isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                                )}
                            >
                                {message.text && <p className="text-sm break-words [overflow-wrap:anywhere]">{linkify(message.text)}</p>}
                                {message.attachment && (
                                    <a href={message.attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 p-2 rounded-md bg-black/10 hover:bg-black/20">
                                        <FileIcon className="h-5 w-5 shrink-0" />
                                        <span className="text-sm truncate">{message.attachment.fileName}</span>
                                        <ExternalLink className="h-4 w-4 shrink-0 ml-auto" />
                                    </a>
                                )}
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
        <div className="h-6 pt-2 text-xs text-muted-foreground px-4 shrink-0">
        {otherUserTyping && otherUserTyping.isTyping && otherUserTyping.userEmail !== user?.email && (
            <div className="animate-pulse flex items-center gap-2">
            <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">{otherUserTyping.userName?.[0]}</AvatarFallback>
            </Avatar>
            <span>{otherUserTyping.userName} is typing...</span>
            </div>
        )}
        </div>
        <div className="pt-2 px-4 pb-4 shrink-0">
        {uploadProgress !== null && <Progress value={uploadProgress} className="mb-2 h-1" />}
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                <Paperclip className="h-5 w-5"/>
                <span className="sr-only">Attach file</span>
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon">
                        <Smile className="h-5 w-5" />
                        <span className="sr-only">Add emoji</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-4 gap-2">
                        {emojis.map((emoji) => (
                            <Button
                                key={emoji}
                                variant="ghost"
                                size="icon"
                                className="text-xl"
                                onClick={() => onEmojiSelect(emoji)}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
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
  );
}
