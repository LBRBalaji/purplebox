const fs = require('fs');

// 1. Update listing-form.tsx — add developer selector for staff
let form = fs.readFileSync('src/components/listing-form.tsx', 'utf8');

// Add isInternalStaff and developer selector logic
form = form.replace(
  `  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';`,
  `  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const isInternalStaff = (user as any)?.isInternalStaff === true;
  const canCreateForDeveloper = isAdmin || isInternalStaff;
  const [selectedDeveloperId, setSelectedDeveloperId] = React.useState<string>('');
  const allDevelopers = React.useMemo(() => Object.values(users || {}).filter((u: any) => u.role === 'Warehouse Developer' && u.status === 'approved'), [users]);`
);

// Override developerId when staff selects a developer
form = form.replace(
  `              developerId: user?.email || '',`,
  `              developerId: (canCreateForDeveloper && selectedDeveloperId) ? selectedDeveloperId : user?.email || '',`
);

// Add developer dropdown in the form — after the opening form tag
form = form.replace(
  `            <form onSubmit={form.handleSubmit(handleSubmitWrapper, onInvalidSubmit)}>`,
  `            <form onSubmit={form.handleSubmit(handleSubmitWrapper, onInvalidSubmit)}>
              {canCreateForDeveloper && !listing && (
                <div className="px-6 pt-4 pb-2">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <label className="text-xs font-bold text-primary uppercase tracking-wide mb-2 block">Creating on behalf of Developer</label>
                    <select
                      className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background"
                      value={selectedDeveloperId}
                      onChange={e => setSelectedDeveloperId(e.target.value)}>
                      <option value="">Select Developer...</option>
                      {(allDevelopers as any[]).map((d: any) => (
                        <option key={d.email} value={d.email}>{d.userName} — {d.companyName}</option>
                      ))}
                    </select>
                    {isInternalStaff && <p className="text-xs text-muted-foreground mt-2">This listing will be saved as a draft pending SuperAdmin approval and developer consent.</p>}
                  </div>
                </div>
              )}`
);

// Update handleSubmitWrapper to set draft status for staff
form = form.replace(
  `  const handleSubmitWrapper = async (data: ListingSchema) => {`,
  `  const handleSubmitWrapper = async (data: ListingSchema) => {
    if (isInternalStaff && !selectedDeveloperId) {
      toast({ variant: 'destructive', title: 'Select Developer', description: 'Please select the developer this listing belongs to.' });
      return;
    }`
);

form = form.replace(
  `        const finalData = { ...data, isAdmin };`,
  `        const finalData = {
          ...data,
          isAdmin,
          developerId: (canCreateForDeveloper && selectedDeveloperId) ? selectedDeveloperId : data.developerId,
          ...(isInternalStaff ? { status: 'draft' as const, createdBy: user?.email } : {}),
        };`
);

fs.writeFileSync('src/components/listing-form.tsx', form);
console.log('✓ Listing form updated');

// 2. Update data-context addListing to handle draft status
let ctx = fs.readFileSync('src/contexts/data-context.tsx', 'utf8');
ctx = ctx.replace(
  `  const addListing = useCallback((listing: ListingSchema, userEmail?: string) => {
        const newListings = [{ ...listing, status: 'pending' as const, createdAt: new Date().toISOString() }, ...prevListings];`,
  `  const addListing = useCallback((listing: ListingSchema, userEmail?: string) => {
        const isDraft = (listing as any).status === 'draft';
        const newListings = [{ ...listing, status: isDraft ? 'draft' as const : 'pending' as const, createdAt: new Date().toISOString() }, ...prevListings];`
);
fs.writeFileSync('src/contexts/data-context.tsx', ctx);
console.log('✓ Data context updated');

// 3. Add Drafts tab to admin-listings.tsx
let admin = fs.readFileSync('src/components/admin-listings.tsx', 'utf8');

// Add drafts tab trigger
admin = admin.replace(
  `<TabsTrigger value="rejected" className="rounded-lg">Rejected Listings</TabsTrigger>`,
  `<TabsTrigger value="rejected" className="rounded-lg">Rejected Listings</TabsTrigger>
            <TabsTrigger value="drafts" className="rounded-lg">Staff Drafts</TabsTrigger>`
);

// Update grid-cols
admin = admin.replace(
  `grid w-full grid-cols-4 rounded-xl`,
  `grid w-full grid-cols-5 rounded-xl`
);

// Add drafts tab content before closing Tabs
const draftTabContent = `
          <TabsContent value="drafts" className="mt-5">
            <StaffDraftsTab listings={listings} users={users} updateListingStatus={updateListingStatus} updateListing={updateListing} />
          </TabsContent>`;

admin = admin.replace(
  `</Tabs>`,
  `${draftTabContent}
        </Tabs>`
);

// Add StaffDraftsTab component at top of file after imports
const draftComponent = `
function StaffDraftsTab({ listings, users, updateListingStatus, updateListing }: any) {
  const { toast } = useToast();
  const drafts = listings.filter((l: any) => l.status === 'draft');

  const handleApproveForConsent = async (listing: any) => {
    await updateListing({ ...listing, status: 'pending_consent' });
    // Notify developer
    try {
      await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: listing.developerId,
          userName: users[listing.developerId]?.userName || 'Developer',
          title: 'A new listing has been prepared for your account',
          message: 'ORS-ONE has prepared a warehouse listing on your behalf. Please log in to review the details and authorise publication.',
          href: '/dashboard?tab=my-listings',
        }),
      });
    } catch(e) {}
    toast({ title: 'Sent for Developer Consent', description: 'Developer notified to review and authorise the listing.' });
  };

  const handleRejectDraft = async (listing: any) => {
    await updateListing({ ...listing, status: 'rejected' });
    toast({ title: 'Draft Rejected', description: 'The draft listing has been rejected.' });
  };

  if (drafts.length === 0) return (
    <div className="bg-card rounded-2xl border border-border p-12 text-center">
      <p className="font-bold text-foreground">No staff drafts</p>
      <p className="text-sm text-muted-foreground mt-2">Listings created by internal staff will appear here for review.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-800">
        Review drafts created by internal staff. Approve to send to developer for consent, or reject to discard.
      </div>
      {drafts.map((listing: any) => {
        const dev = users[listing.developerId];
        const createdByUser = users[listing.createdBy];
        return (
          <div key={listing.listingId} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-foreground">{listing.name || listing.listingId}</p>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Draft</span>
                </div>
                <p className="text-xs text-muted-foreground">{listing.location} · {listing.sizeSqFt?.toLocaleString()} sq ft</p>
                <p className="text-xs text-muted-foreground mt-1">For: <span className="font-semibold text-foreground">{dev?.userName || listing.developerId}</span> — {dev?.companyName}</p>
                <p className="text-xs text-muted-foreground">Created by: <span className="font-semibold text-foreground">{createdByUser?.userName || listing.createdBy}</span></p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl text-xs bg-primary hover:bg-primary/90" onClick={() => handleApproveForConsent(listing)}>
                  Send for Developer Consent
                </Button>
                <Button size="sm" variant="outline" className="rounded-xl text-xs text-destructive border-destructive/20" onClick={() => handleRejectDraft(listing)}>
                  Reject Draft
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
`;

// Insert draft component before the main export
admin = admin.replace(
  `export function AdminListings`,
  `${draftComponent}\nexport function AdminListings`
);

// Add imports needed
admin = admin.replace(
  `import { useToast } from '@/hooks/use-toast';`,
  `import { useToast } from '@/hooks/use-toast';`
);

fs.writeFileSync('src/components/admin-listings.tsx', admin);
console.log('✓ Admin listings updated with Staff Drafts tab');
