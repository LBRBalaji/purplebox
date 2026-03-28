const fs = require('fs');
let c = `
function AdminListingCard({ listing, analytics, providerName, maxViews, onStatusChange, onEdit }: { listing: ListingSchema; analytics?: { views: number; downloads: number; downloadedBy?: DownloadedByRecord[]; viewedBy?: ViewedByRecord[] }; providerName: string; maxViews: number; onStatusChange: (status: ListingStatus) => void; onEdit: (listing: ListingSchema, intent?: 'approve') => void }) {
  const { toast } = useToast();
  const views = analytics?.views || 0;
  const downloads = analytics?.downloads || 0;
  const handleApproveClick = () => {
    if (!listing.locationCircle) { toast({ variant: 'destructive', title: 'Action Required', description: 'Please assign a Location Circle before approving.' }); onEdit(listing, 'approve'); return; }
    onStatusChange('approved');
  };
  return (
    <div className="bg-card rounded-2xl border border-border hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link href={\`/listings/\${listing.listingId}\`} target="_blank" className="font-bold text-foreground hover:text-primary transition-colors text-sm flex items-center gap-1 group">
              {listing.listingId} <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{listing.location} · {providerName}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <StatusBadge status={listing.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(listing)} className="rounded-lg"><Edit className="mr-2 h-4 w-4" /> Edit Listing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleApproveClick} className="rounded-lg text-green-600"><CheckCircle className="mr-2 h-4 w-4" /> Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('rejected')} className="rounded-lg text-red-500"><XCircle className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('pending')} className="rounded-lg text-amber-600"><PauseCircle className="mr-2 h-4 w-4" /> Set Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('leased')} className="rounded-lg text-blue-500"><PauseCircle className="mr-2 h-4 w-4" /> Mark Leased</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Scaling className="h-3 w-3" /> {listing.sizeSqFt?.toLocaleString()} sqft</span>
          {listing.plan === 'Paid_Premium' && (<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FDD017', color: '#333' }}><Sparkles className="h-3 w-3" /> Premium</span>)}
        </div>
      </div>
      <div className="px-5 pb-4"><EngagementBar views={views} downloads={downloads} maxViews={maxViews} /></div>
      <div className="px-5 pb-5 space-y-2 flex-1">
        {analytics?.viewedBy && analytics.viewedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-xs font-semibold text-primary py-2 px-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Viewed By ({analytics.viewedBy.length})</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="pt-2 space-y-1.5">
                {analytics.viewedBy.map((viewer, i) => (
                  <div key={i} className="text-xs p-2.5 bg-secondary/50 rounded-xl">
                    <p className="font-semibold text-foreground">{viewer.name}</p>
                    <p className="text-muted-foreground">{viewer.company}</p>
                    <p className="text-muted-foreground/70 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(viewer.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        {analytics?.downloadedBy && analytics.downloadedBy.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-xs font-semibold text-primary py-2 px-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Downloaded By ({analytics.downloadedBy.length})</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform [&[data-state=open]]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <TooltipProvider>
                <div className="pt-2 space-y-1.5">
                  {analytics.downloadedBy.map((customer, i) => {
                    const count = customer.timestamps.length;
                    const last = Math.max(...customer.timestamps);
                    return (
                      <div key={i} className="text-xs p-2.5 bg-secondary/50 rounded-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div><p className="font-semibold text-foreground">{customer.name}</p><p className="text-muted-foreground">{customer.company}</p></div>
                          <Tooltip>
                            <TooltipTrigger asChild><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary cursor-help">{count}x</span></TooltipTrigger>
                            <TooltipContent><div className="p-1"><p className="font-bold mb-1 text-xs">Downloads:</p>{customer.timestamps.sort((a,b)=>b-a).map((ts,j)=><p key={j} className="text-xs">{new Date(ts).toLocaleString()}</p>)}</div></TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-muted-foreground/70 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Last: {new Date(last).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

const TopListingsChart = ({ listings, analytics, label }: { listings: ListingSchema[]; analytics: any[]; label: string }) => {
  const top5 = React.useMemo(() => {
    return [...listings].map(l => ({ ...l, count: analytics.find(a => a.listingId === l.listingId)?.[label === 'Views' ? 'views' : 'downloads'] || 0 })).sort((a,b) => b.count - a.count).slice(0,5);
  }, [listings, analytics, label]);
  const max = top5[0]?.count || 1;
  return (
    <div className="space-y-3">
      {top5.map((l,i) => (
        <div key={l.listingId} className="flex items-center gap-3">
          <span className="text-xs font-black text-muted-foreground w-4">{i+1}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-foreground truncate max-w-[160px]">{l.listingId}</span>
              <span className="text-xs font-bold text-primary">{l.count}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: (l.count/max*100)+'%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{l.location}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

function ProviderSummaryTable({ allDevelopers, providerSummary }: { allDevelopers: any[]; providerSummary: ProviderSummary }) {
  const total = Object.values(providerSummary).reduce((s,c) => s+c.listingCount, 0);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-bold text-foreground">Provider Supply Summary</h3>
        <p className="text-xs text-muted-foreground mt-1">{allDevelopers.length} developers · {total} active listings</p>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Developer</TableHead><TableHead className="text-right">Active Listings</TableHead><TableHead className="text-right">Total Size (Sq. Ft.)</TableHead><TableHead className="text-right">Share</TableHead></TableRow></TableHeader>
        <TableBody>
          {allDevelopers.sort((a,b) => (providerSummary[b.email]?.listingCount||0)-(providerSummary[a.email]?.listingCount||0)).map(dev => {
            const s = providerSummary[dev.email];
            const share = total > 0 ? ((s?.listingCount||0)/total*100).toFixed(1) : '0';
            return (
              <TableRow key={dev.email}>
                <TableCell className="font-medium">{dev.companyName}</TableCell>
                <TableCell className="text-right">{s?.listingCount||0}</TableCell>
                <TableCell className="text-right">{s?.totalSize?.toLocaleString()||0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{width:share+'%'}} /></div>
                    <span className="text-xs text-muted-foreground">{share}%</span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}`;
fs.writeFileSync('/tmp/admin-part2.txt', c);
console.log('Part 2 done');
