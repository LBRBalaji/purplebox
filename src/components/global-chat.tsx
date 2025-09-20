
'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Minus, X } from 'lucide-react';
import { ChatPanel } from './chat-dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

export function GlobalChatWidget() {
    const { activeChatSubmission, closeChat } = useData();
    const { user } = useAuth();
    const [isMinimized, setIsMinimized] = React.useState(false);

    if (!activeChatSubmission) {
        return null;
    }
    
    const partnerName = activeChatSubmission.chatPartnerName || 'Chat';

    if (isMinimized) {
        return (
             <div className="fixed bottom-0 right-8 z-50">
                <Button onClick={() => setIsMinimized(false)} className="rounded-b-none shadow-lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with {partnerName}
                </Button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-0 right-8 z-50 w-full max-w-sm">
            <Card className="flex flex-col h-[500px] shadow-2xl border-border">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-secondary/50 rounded-t-lg">
                    <CardTitle className="text-base flex items-center gap-2">
                       <MessageSquare className="h-4 w-4" /> Chat with {partnerName}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeChat}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <ChatPanel submission={activeChatSubmission} />
                </CardContent>
            </Card>
        </div>
    );
}
