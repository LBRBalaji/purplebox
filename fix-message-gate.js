const fs = require('fs');
let content = fs.readFileSync('src/components/chat-dialog.tsx', 'utf8');

// Add Lock icon to imports
content = content.replace(
  `import { Send, MessageSquare, Paperclip, File as FileIcon, ExternalLink, Smile } from 'lucide-react';`,
  `import { Send, MessageSquare, Paperclip, File as FileIcon, ExternalLink, Smile, Lock } from 'lucide-react';`
);

// Add message gate check after lead is found
content = content.replace(
  `  const lead = registeredLeads.find(l => l.id === submission?.demandId);
  const threadId = lead && submission ? \`chat-\${lead.id}-\${submission.providerEmail}\` : null;`,
  `  const lead = registeredLeads.find(l => l.id === submission?.demandId);
  const threadId = lead && submission ? \`chat-\${lead.id}-\${submission.providerEmail}\` : null;
  const isMessageGated = lead?.messageGated && user?.email === submission?.providerEmail;`
);

// Replace message text rendering with gated version
content = content.replace(
  `                            {message.text && <p className="text-sm break-words [overflow-wrap:anywhere]">{linkify(message.text)}</p>}`,
  `                            {message.text && (
                              isMessageGated && !isUser ? (
                                <div className="relative">
                                  <p className="text-sm break-words [overflow-wrap:anywhere] blur-sm select-none">{'█'.repeat(Math.min(message.text.length, 40))}</p>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                      <Lock className="h-3 w-3" /> Pay to Read
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm break-words [overflow-wrap:anywhere]">{linkify(message.text)}</p>
                              )
                            )}`
);

// Add gate banner above messages if gated
content = content.replace(
  `            <ScrollArea className="h-full" scrollableViewportRef={scrollViewportRef}>
                <div className="space-y-4 p-4">`,
  `            {isMessageGated && (
              <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-b border-border flex-shrink-0">
                <Lock className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">Messages are locked</p>
                  <p className="text-xs text-muted-foreground">Pay ₹5,000 to unlock and read customer messages</p>
                </div>
                <a href="/dashboard/manage-users?tab=payments" className="text-xs font-bold text-primary hover:underline flex-shrink-0">Pay Now →</a>
              </div>
            )}
            <ScrollArea className="h-full" scrollableViewportRef={scrollViewportRef}>
                <div className="space-y-4 p-4">`
);

// Disable input when gated
content = content.replace(
  `        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">`,
  `        <form onSubmit={isMessageGated ? (e) => e.preventDefault() : handleSendMessage} className="flex w-full items-center gap-2">`
);

fs.writeFileSync('src/components/chat-dialog.tsx', content);
console.log('Done!');
