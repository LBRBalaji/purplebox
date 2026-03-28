const fs = require('fs');
let c = `
export function AdminListings() {
  const { listings, listingAnalytics, updateListing, updateListingStatus, locationCircles } = useData();
  const { users } = useAuth();
  const { toast } = useToast();
  const [filteredListings, setFilteredListings] = React.useState<ListingSchema[]>([]);
  const [keywordFilter, setKeywordFilter] = React.useState('');
  const [developerFilter, setDeveloperFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [circleFilter, setCircleFilter] = React.useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all');
  const [sizeRange, setSizeRange] = React.useState([0, 1000000]);
  const [premiumOnly, setPremiumOnly] = React.useState(false);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({ from: subDays(new Date(), 29), to: new Date() });
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedListing, setSelectedListing] = React.useState<ListingSchema | null>(null);
  const [editIntent, setEditIntent] = React.useState<'approve' | undefined>(undefined);
  const [providerSummary, setProviderSummary] = React.useState<ProviderSummary>({});
  const [openCirclePopover, setOpenCirclePopover] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const allDevelopers = React.useMemo(() => Object.values(users).filter(u => u.role === 'Warehouse Developer'), [users]);
  React.useEffect(() => { fetch('/api/provider-summary').then(r=>r.json()).then(setProviderSummary).catch(console.error); }, [users]);
  const maxSliderSize = React.useMemo(() => { const max = Math.max(...listings.map(w=>w.sizeSqFt),0); return max>0?Math.ceil(max/100000)*100000:1000000; }, [listings]);
  React.useEffect(() => {
    let results = [...listings];
    if (premiumOnly) results = results.filter(l=>l.plan==='Paid_Premium');
    if (keywordFilter) { const q=keywordFilter.toLowerCase(); results=results.filter(l=>l.location.toLowerCase().includes(q)||l.listingId.toLowerCase().includes(q)); }
    if (developerFilter!=='all') results=results.filter(l=>l.developerId===developerFilter);
    if (statusFilter!=='all') results=results.filter(l=>l.status===statusFilter);
    if (circleFilter.length>0) { const s=new Set(circleFilter); results=results.filter(l=>l.locationCircle&&s.has(l.locationCircle)); }
    if (availabilityFilter!=='all') results=results.filter(l=>l.availabilityDate===availabilityFilter);
    results=results.filter(l=>l.sizeSqFt>=sizeRange[0]&&l.sizeSqFt<=sizeRange[1]);
    setFilteredListings(results);
  }, [listings,keywordFilter,developerFilter,statusFilter,circleFilter,availabilityFilter,sizeRange,premiumOnly]);
  const kpis = React.useMemo(() => {
    const totalViews=listingAnalytics.reduce((s,a)=>s+a.views,0);
    const totalDownloads=listingAnalytics.reduce((s,a)=>s+a.downloads,0);
    const approved=listings.filter(l=>l.status==='approved').length;
    const pending=listings.filter(l=>l.status==='pending').length;
    const convRate=totalViews>0?((totalDownloads/totalViews)*100).toFixed(1)+'%':'0%';
    return {totalViews,totalDownloads,approved,pending,convRate,total:listings.length};
  }, [listings,listingAnalytics]);
  const maxViews = React.useMemo(() => Math.max(...listingAnalytics.map(a=>a.views),1), [listingAnalytics]);
  const getProviderName = (id: string) => Object.values(users).find(u=>u.email===id)?.companyName||'Unknown';
  const resetFilters = () => { setKeywordFilter('');setDeveloperFilter('all');setStatusFilter('all');setCircleFilter([]);setAvailabilityFilter('all');setSizeRange([0,maxSliderSize]);setPremiumOnly(false);setDateRange({from:subDays(new Date(),29),to:new Date()}); };
  const handleEdit = (listing: ListingSchema, intent?: 'approve') => { setSelectedListing(listing);setEditIntent(intent);setIsFormOpen(true); };
  const handleFormSubmit = (data: ListingSchema) => {
    if (data.isAdmin&&editIntent==='approve'&&data.locationCircle) { data.status='approved'; toast({title:'Listing Approved',description:\`"\${data.listingId}" approved.\`}); }
    else { toast({title:selectedListing?'Listing Updated':'Listing Submitted',description:\`"\${data.listingId}" saved.\`}); }
    if (selectedListing) updateListing(data);
    setIsFormOpen(false);setSelectedListing(null);setEditIntent(undefined);
  };
  const handleStatusChange = (listingId: string, status: ListingStatus) => { updateListingStatus(listingId,status); toast({title:'Status Updated',description:\`"\${listingId}" → \${status}\`}); };
  const handleDownloadReport = () => {
    const from=dateRange?.from; const to=dateRange?.to;
    if(!from||!to){alert('Please select a valid date range.');return;}
    const locationStats: Record<string,{totalViews:number;totalDownloads:number;count:number}> = {};
    listings.forEach(listing => {
      const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId); if(!analytics)return;
      const key=listing.location.split(',')[0].trim();
      if(!locationStats[key])locationStats[key]={totalViews:0,totalDownloads:0,count:0};
      locationStats[key].totalViews+=analytics.views;locationStats[key].totalDownloads+=analytics.downloads;locationStats[key].count++;
    });
    const locAvg: Record<string,{avgViews:number;avgDownloads:number}> = {};
    for(const loc in locationStats){locAvg[loc]={avgViews:locationStats[loc].totalViews/locationStats[loc].count,avgDownloads:locationStats[loc].totalDownloads/locationStats[loc].count};}
    const reportData=filteredListings.map(listing=>{
      const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId);
      const viewsInPeriod=analytics?.viewedBy?.filter(v=>new Date(v.timestamp)>=from&&new Date(v.timestamp)<=to)||[];
      const downloadsInPeriod=analytics?.downloadedBy?.flatMap(d=>d.timestamps.filter(ts=>ts>=from&&new Date(ts)<=to))||[];
      const viewCount=viewsInPeriod.length;const downloadCount=downloadsInPeriod.length;
      const conversionRate=viewCount>0?((downloadCount/viewCount)*100).toFixed(2)+'%':'0.00%';
      const daysOnMarket=listing.createdAt?Math.ceil((new Date().getTime()-new Date(listing.createdAt).getTime())/(1000*3600*24)):'N/A';
      const key=listing.location.split(',')[0].trim();
      const viewPerformance=locAvg[key]&&locAvg[key].avgViews>0?((viewCount/locAvg[key].avgViews)*100).toFixed(0)+'%':'N/A';
      const topViewer=viewsInPeriod.reduce((acc,v)=>{acc[v.company]=(acc[v.company]||0)+1;return acc;},{} as Record<string,number>);
      const mostEngaged=Object.keys(topViewer).sort((a,b)=>topViewer[b]-topViewer[a])[0]||'N/A';
      return {'Listing ID':listing.listingId,'Name':listing.name,'Location':listing.location,'Developer':getProviderName(listing.developerId),'Status':listing.status,'Days on Market':daysOnMarket,'Views (Period)':viewCount,'Downloads (Period)':downloadCount,'Conversion Rate':conversionRate,'Most Engaged Company':mostEngaged,'Performance vs Avg':viewPerformance};
    });
    const ws=XLSX.utils.json_to_sheet(reportData);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Listings Performance');XLSX.writeFile(wb,\`LBR_O2O_Performance_Report_\${format(new Date(),'yyyy-MM-dd')}.xlsx\`);
  };
  const activeFilterCount=[keywordFilter,developerFilter!=='all',statusFilter!=='all',circleFilter.length>0,availabilityFilter!=='all',premiumOnly].filter(Boolean).length;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Listings Performance</h2>
            <p className="text-sm text-muted-foreground mt-1">Monitor, manage and analyse all platform listings in real time.</p>
          </div>
          <Button onClick={handleDownloadReport} className="gap-2 rounded-xl flex-shrink-0"><FileDown className="h-4 w-4" /> Export Report</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Listings" value={kpis.total} icon={Warehouse} />
          <KpiCard label="Approved" value={kpis.approved} icon={CheckCircle} trend="up" />
          <KpiCard label="Pending Review" value={kpis.pending} icon={AlertCircle} trend={kpis.pending>0?'down':'neutral'} />
          <KpiCard label="Total Views" value={kpis.totalViews.toLocaleString()} icon={Eye} trend="up" />
          <KpiCard label="Total Downloads" value={kpis.totalDownloads.toLocaleString()} icon={Download} trend="up" />
          <KpiCard label="Conversion Rate" value={kpis.convRate} icon={TrendingUp} trend="up" />
        </div>
        <Tabs defaultValue="listings">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="listings" className="rounded-lg">All Listings</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg">Top Performers</TabsTrigger>
            <TabsTrigger value="providers" className="rounded-lg">Provider Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="space-y-5 mt-5">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by location or listing ID..." value={keywordFilter} onChange={e=>setKeywordFilter(e.target.value)} className="pl-9 rounded-xl" />
              </div>
              <Button variant="outline" onClick={()=>setShowFilters(!showFilters)} className="gap-2 rounded-xl flex-shrink-0">
                <Filter className="h-4 w-4" /> Filters
                {activeFilterCount>0&&<span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
              </Button>
              {activeFilterCount>0&&<Button variant="ghost" onClick={resetFilters} className="gap-1 rounded-xl text-muted-foreground flex-shrink-0"><X className="h-4 w-4" /> Reset</Button>}
            </div>
            {showFilters && (
              <div className="bg-card rounded-2xl border border-border p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Developer</label>
                  <Select value={developerFilter} onValueChange={setDeveloperFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Developers</SelectItem>{allDevelopers.map(dev=><SelectItem key={dev.email} value={dev.email}>{dev.companyName}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="leased">Leased</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location Circle</label>
                  <Popover open={openCirclePopover} onOpenChange={setOpenCirclePopover}>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start rounded-xl">{circleFilter.length>0?<>{circleFilter.slice(0,2).map(c=><Badge key={c} variant="secondary" className="mr-1">{c}</Badge>)}{circleFilter.length>2&&<Badge variant="secondary">+{circleFilter.length-2}</Badge>}</>:'Select circles...'}</Button></PopoverTrigger>
                    <PopoverContent className="w-56 p-0 rounded-xl"><Command><CommandInput placeholder="Search circles..." /><CommandList><CommandEmpty>No circles found.</CommandEmpty><CommandGroup>{locationCircles.map(circle=>(<CommandItem key={circle.name} value={circle.name} onSelect={()=>setCircleFilter(prev=>prev.includes(circle.name)?prev.filter(c=>c!==circle.name):[...prev,circle.name])}><Check className={cn('mr-2 h-4 w-4',circleFilter.includes(circle.name)?'opacity-100':'opacity-0')} />{circle.name}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem><SelectItem value="Under Construction">Under Construction</SelectItem></SelectContent></Select>
                </div>
                <div className="lg:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Size: {sizeRange[0].toLocaleString()} – {sizeRange[1].toLocaleString()} sqft</label><Slider min={0} max={maxSliderSize} step={10000} value={sizeRange} onValueChange={v=>setSizeRange(v as [number,number])} /></div>
                <div className="lg:col-span-2 space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</label>
                  <Popover><PopoverTrigger asChild><Button variant="outline" className={cn('w-full justify-start text-left font-normal rounded-xl',!dateRange&&'text-muted-foreground')}><CalendarIcon className="mr-2 h-4 w-4" />{dateRange?.from?(dateRange.to?<>{format(dateRange.from,'LLL dd, y')} – {format(dateRange.to,'LLL dd, y')}</>:format(dateRange.from,'LLL dd, y')):'Pick a date'}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 rounded-xl" align="end"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/></PopoverContent></Popover>
                </div>
                <div className="flex items-center gap-2 pt-4"><Switch id="premium" checked={premiumOnly} onCheckedChange={setPremiumOnly} /><Label htmlFor="premium" className="text-sm">Premium Only</Label></div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{filteredListings.length} listing{filteredListings.length!==1?'s':''} {activeFilterCount>0?'matching filters':'total'}</p>
            {filteredListings.length>0?(
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredListings.map(listing=>{const analytics=listingAnalytics.find(a=>a.listingId===listing.listingId);return <AdminListingCard key={listing.listingId} listing={listing} analytics={analytics} providerName={getProviderName(listing.developerId)} maxViews={maxViews} onStatusChange={s=>handleStatusChange(listing.listingId,s)} onEdit={handleEdit} />;})}
              </div>
            ):(
              <div className="bg-card rounded-2xl border border-border p-16 text-center"><Warehouse className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" /><h3 className="font-semibold text-foreground mb-1">No listings match your filters</h3><p className="text-sm text-muted-foreground">Try adjusting or resetting your search criteria.</p></div>
            )}
          </TabsContent>
          <TabsContent value="insights" className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-5"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Eye className="h-4 w-4 text-primary" /></div><div><h3 className="font-bold text-foreground text-sm">Top 5 by Views</h3><p className="text-xs text-muted-foreground">Most viewed listings</p></div></div>
                <TopListingsChart listings={filteredListings.length>0?filteredListings:listings} analytics={listingAnalytics} label="Views" />
              </div>
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center gap-2 mb-5"><div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center"><Download className="h-4 w-4 text-primary" /></div><div><h3 className="font-bold text-foreground text-sm">Top 5 by Downloads</h3><p className="text-xs text-muted-foreground">Most downloaded listings</p></div></div>
                <TopListingsChart listings={filteredListings.length>0?filteredListings:listings} analytics={listingAnalytics} label="Downloads" />
              </div>
              <div className="md:col-span-2 bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-4">Platform Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{label:'Premium Listings',value:listings.filter(l=>l.plan==='Paid_Premium').length,sub:'Active on platform',icon:Sparkles},{label:'Non-Premium',value:listings.filter(l=>l.plan!=='Paid_Premium').length,sub:'Standard listings',icon:Building},{label:'Premium Size',value:listings.filter(l=>l.plan==='Paid_Premium').reduce((s,l)=>s+l.sizeSqFt,0).toLocaleString(),sub:'Sq. ft.',icon:Scaling},{label:'Unique Developers',value:new Set(listings.map(l=>l.developerId)).size,sub:'Contributing',icon:Users}].map((item,i)=>(
                    <div key={i} className="bg-secondary/30 rounded-xl p-4"><item.icon className="h-5 w-5 text-primary mb-2" /><p className="text-xl font-black text-foreground">{item.value}</p><p className="text-xs font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="providers" className="mt-5">
            <ProviderSummaryTable allDevelopers={allDevelopers} providerSummary={providerSummary} />
          </TabsContent>
        </Tabs>
      </div>
      <ListingForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} listing={selectedListing} onSubmit={handleFormSubmit} locationCircles={locationCircles} initialIntent={editIntent} />
    </>
  );
}`;
fs.writeFileSync('/tmp/admin-part3.txt', c);
console.log('Part 3 done');
