'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { useSiteOptions } from '@/hooks/use-site-options';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Plus, Archive, Pencil, Warehouse, AlertTriangle, Link as LinkIcon, UploadCloud, CheckCircle2, FileText, Trash2 } from 'lucide-react';
import type { SiteOptionSchema } from '@/lib/schema';

const WAREHOUSE_MODELS = ['Non-Temperature Controlled', 'Temperature Controlled', 'Temp & Non-Temp Controlled', '3PL Operated Warehouse', 'FTWZ - Free Trade Warehouse', 'Custom Bonded Warehouse'] as const;
const BUILDING_TYPES = ['PEB', 'RCC', 'Standard Shed'];
const APPROVAL_FIELDS: { key: string; label: string }[] = [
  { key: 'parkApproval', label: 'Park Approval' },
  { key: 'buildingApproval', label: 'Building Approval' },
  { key: 'fireLicense', label: 'Fire License' },
  { key: 'fireNOC', label: 'Fire NOC' },
  { key: 'buildingInsurance', label: 'Building Insurance' },
  { key: 'pcbForAir', label: 'Pcb For Air' },
  { key: 'pcbForWater', label: 'Pcb For Water' },
  { key: 'propertyTax', label: 'Property Tax' },
];

type DocItem = { type: 'image' | 'video' | 'layout'; name: string; url: string };

const emptyDetails = {
  location: '',
  sizeSqFt: '',
  availabilityDate: 'Ready for Occupancy',
  constructionProgress: '',
  rentPerSqFt: '',
  rentIsQuote: false,
  rentalSecurityDeposit: '',
  depositIsQuote: false,
  area: { plinthArea: '', mezzanineArea1: '', mezzanineArea2: '', canopyArea: '', driversRestRoomArea: '', totalChargeableArea: '', tempControlledArea: '', nonTempControlledArea: '' },
  buildingType: [] as string[],
  warehouseModel: 'Non-Temperature Controlled' as typeof WAREHOUSE_MODELS[number],
  numberOfDocksAndShutters: '',
  internalLighting: '',
  warehouseLayoutAvailable: false,
  craneSupportStructureAvailable: false,
  craneAvailable: false,
  typeOfFlooringInside: '',
  typeOfRoad: '',
  roofType: '',
  eveHeightMeters: '',
  roofInsulation: '',
  ventilation: '',
  louvers: false,
  certificatesAndApprovals: { parkApproval: false, buildingApproval: false, fireLicense: false, fireNOC: false, buildingInsurance: false, pcbForAir: false, pcbForWater: false, propertyTax: false },
  documents: [] as DocItem[],
  description: '',
  additionalInformation: '',
};

type DetailsForm = typeof emptyDetails;

const numStr = (v: any) => (typeof v === 'number' ? String(v) : '');
const numOrUndef = (v: string) => (v === '' || v === undefined ? undefined : parseFloat(v));

async function uploadFiles(files: File[]) {
  const results = await Promise.all(files.map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json') ? await response.json() : { success: false, error: `Server error ${response.status}` };
      if (!response.ok || !result.success) return { name: file.name, error: result.error || 'Upload failed' };
      return { type: (file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'layout') as DocItem['type'], name: file.name, url: result.url as string };
    } catch (e: any) {
      return { name: file.name, error: e.message || 'Network error' };
    }
  }));
  return results;
}

type FilterKey = 'all' | 'listed' | 'sourced' | 'linked-demand';

export default function SiteOptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { listings, demands } = useData();
  const { siteOptions, isLoading, addSiteOption, updateSiteOption, archiveSiteOption } = useSiteOptions();
  const { toast } = useToast();
  const router = useRouter();

  const hasAccess = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  React.useEffect(() => {
    if (!authLoading && !hasAccess) router.push('/dashboard');
  }, [authLoading, hasAccess, router]);

  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<FilterKey>('all');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [linkedListingId, setLinkedListingId] = React.useState('');
  const [details, setDetails] = React.useState<DetailsForm>(emptyDetails);
  const [demandIds, setDemandIds] = React.useState<string[]>([]);
  const [sourceNotes, setSourceNotes] = React.useState('');
  const [listingSearch, setListingSearch] = React.useState('');
  const [demandSearch, setDemandSearch] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [mediaTab, setMediaTab] = React.useState<'url' | 'upload'>('url');
  const [urlInput, setUrlInput] = React.useState('');
  const [urlName, setUrlName] = React.useState('');
  const [urlType, setUrlType] = React.useState<DocItem['type']>('image');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const approvedListings = listings.filter(l => l.status === 'approved');
  const linkedListing = approvedListings.find(l => l.listingId === linkedListingId);
  const filteredListings = listingSearch
    ? approvedListings.filter(l =>
        l.listingId.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.location?.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.name?.toLowerCase().includes(listingSearch.toLowerCase()))
    : [];
  const filteredDemands = demandSearch
    ? demands.filter(d =>
        d.demandId.toLowerCase().includes(demandSearch.toLowerCase()) ||
        d.location?.toLowerCase().includes(demandSearch.toLowerCase()))
    : demands.slice(0, 6);

  const activeSites = siteOptions.filter(s => s.siteStatus !== 'archived');
  const filteredSites = activeSites.filter(s => {
    if (filter === 'listed' && !s.linkedListingId) return false;
    if (filter === 'sourced' && s.linkedListingId) return false;
    if (filter === 'linked-demand' && (!s.demandIds || s.demandIds.length === 0)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return s.siteOptionId.toLowerCase().includes(q) || s.details.location.toLowerCase().includes(q) || (s.details.warehouseModel || '').toLowerCase().includes(q);
  });

  const resetForm = () => {
    setLinkedListingId('');
    setDetails(emptyDetails);
    setDemandIds([]);
    setSourceNotes('');
    setListingSearch('');
    setDemandSearch('');
    setMediaTab('url');
    setUrlInput(''); setUrlName(''); setUrlType('image');
  };

  const openAddForm = () => {
    setEditingId(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (site: SiteOptionSchema) => {
    setEditingId(site.siteOptionId);
    setLinkedListingId(site.linkedListingId || '');
    const d = site.details;
    setDetails({
      location: d.location,
      sizeSqFt: String(d.sizeSqFt),
      availabilityDate: d.availabilityDate || 'Ready for Occupancy',
      constructionProgress: d.constructionProgress || '',
      rentPerSqFt: typeof d.rentPerSqFt === 'number' ? String(d.rentPerSqFt) : '',
      rentIsQuote: d.rentPerSqFt === 'Get Quote',
      rentalSecurityDeposit: typeof d.rentalSecurityDeposit === 'number' ? String(d.rentalSecurityDeposit) : '',
      depositIsQuote: d.rentalSecurityDeposit === 'Get Quote',
      area: {
        plinthArea: numStr(d.area?.plinthArea), mezzanineArea1: numStr(d.area?.mezzanineArea1), mezzanineArea2: numStr(d.area?.mezzanineArea2),
        canopyArea: numStr(d.area?.canopyArea), driversRestRoomArea: numStr(d.area?.driversRestRoomArea), totalChargeableArea: numStr(d.area?.totalChargeableArea),
        tempControlledArea: numStr(d.area?.tempControlledArea), nonTempControlledArea: numStr(d.area?.nonTempControlledArea),
      },
      buildingType: d.buildingSpecifications?.buildingType || [],
      warehouseModel: (d.warehouseModel as any) || 'Non-Temperature Controlled',
      numberOfDocksAndShutters: numStr(d.buildingSpecifications?.numberOfDocksAndShutters),
      internalLighting: d.buildingSpecifications?.internalLighting || '',
      warehouseLayoutAvailable: !!d.buildingSpecifications?.warehouseLayoutAvailable,
      craneSupportStructureAvailable: !!d.buildingSpecifications?.craneSupportStructureAvailable,
      craneAvailable: !!d.buildingSpecifications?.craneAvailable,
      typeOfFlooringInside: d.siteSpecifications?.typeOfFlooringInside || '',
      typeOfRoad: d.siteSpecifications?.typeOfRoad || '',
      roofType: d.buildingSpecifications?.roofType || '',
      eveHeightMeters: numStr(d.buildingSpecifications?.eveHeightMeters),
      roofInsulation: d.buildingSpecifications?.roofInsulation || '',
      ventilation: d.buildingSpecifications?.ventilation || '',
      louvers: !!d.buildingSpecifications?.louvers,
      certificatesAndApprovals: {
        parkApproval: !!d.certificatesAndApprovals?.parkApproval, buildingApproval: !!d.certificatesAndApprovals?.buildingApproval,
        fireLicense: !!d.certificatesAndApprovals?.fireLicense, fireNOC: !!d.certificatesAndApprovals?.fireNOC,
        buildingInsurance: !!d.certificatesAndApprovals?.buildingInsurance, pcbForAir: !!d.certificatesAndApprovals?.pcbForAir,
        pcbForWater: !!d.certificatesAndApprovals?.pcbForWater, propertyTax: !!d.certificatesAndApprovals?.propertyTax,
      },
      documents: (d.documents as DocItem[]) || [],
      description: d.description || '',
      additionalInformation: d.additionalInformation || '',
    });
    setDemandIds(site.demandIds || []);
    setSourceNotes(site.sourceNotes || '');
    setListingSearch('');
    setDemandSearch('');
    setMediaTab('url');
    setIsFormOpen(true);
  };

  const handlePickListing = (listingId: string) => {
    const listing = approvedListings.find(l => l.listingId === listingId);
    if (!listing) return;
    setLinkedListingId(listingId);
    setDetails(f => ({
      ...f,
      location: listing.location || f.location,
      sizeSqFt: listing.sizeSqFt ? String(listing.sizeSqFt) : f.sizeSqFt,
      availabilityDate: listing.availabilityDate || f.availabilityDate,
      constructionProgress: listing.constructionProgress || '',
      rentPerSqFt: typeof listing.rentPerSqFt === 'number' ? String(listing.rentPerSqFt) : '',
      rentIsQuote: listing.rentPerSqFt === 'Get Quote',
      rentalSecurityDeposit: typeof listing.rentalSecurityDeposit === 'number' ? String(listing.rentalSecurityDeposit) : '',
      depositIsQuote: listing.rentalSecurityDeposit === 'Get Quote',
      area: {
        plinthArea: numStr(listing.area?.plinthArea), mezzanineArea1: numStr(listing.area?.mezzanineArea1), mezzanineArea2: numStr(listing.area?.mezzanineArea2),
        canopyArea: numStr(listing.area?.canopyArea), driversRestRoomArea: numStr(listing.area?.driversRestRoomArea), totalChargeableArea: numStr(listing.area?.totalChargeableArea),
        tempControlledArea: numStr(listing.area?.tempControlledArea), nonTempControlledArea: numStr(listing.area?.nonTempControlledArea),
      },
      buildingType: listing.buildingSpecifications?.buildingType || [],
      warehouseModel: (listing.warehouseModel as any) || f.warehouseModel,
      numberOfDocksAndShutters: numStr(listing.buildingSpecifications?.numberOfDocksAndShutters),
      internalLighting: listing.buildingSpecifications?.internalLighting || '',
      warehouseLayoutAvailable: !!listing.buildingSpecifications?.warehouseLayoutAvailable,
      craneSupportStructureAvailable: !!listing.buildingSpecifications?.craneSupportStructureAvailable,
      craneAvailable: !!listing.buildingSpecifications?.craneAvailable,
      typeOfFlooringInside: listing.siteSpecifications?.typeOfFlooringInside || '',
      typeOfRoad: listing.siteSpecifications?.typeOfRoad || '',
      roofType: listing.buildingSpecifications?.roofType || '',
      eveHeightMeters: numStr(listing.buildingSpecifications?.eveHeightMeters),
      roofInsulation: listing.buildingSpecifications?.roofInsulation || '',
      ventilation: listing.buildingSpecifications?.ventilation || '',
      louvers: !!listing.buildingSpecifications?.louvers,
      certificatesAndApprovals: listing.certificatesAndApprovals ? { ...f.certificatesAndApprovals, ...listing.certificatesAndApprovals } : f.certificatesAndApprovals,
      documents: (listing.documents as DocItem[]) || [],
      description: listing.description || '',
      additionalInformation: listing.additionalInformation || '',
    }));
    setListingSearch('');
  };

  const toggleDemand = (demandId: string) => {
    setDemandIds(ids => ids.includes(demandId) ? ids.filter(id => id !== demandId) : [...ids, demandId]);
  };

  const toggleBuildingType = (type: string) => {
    setDetails(f => ({ ...f, buildingType: f.buildingType.includes(type) ? f.buildingType.filter(t => t !== type) : [...f.buildingType, type] }));
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast({ variant: 'destructive', title: 'No URL entered', description: 'Please paste a Google Drive or Google Photos link.' });
      return;
    }
    let finalUrl = trimmed;
    const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
    const driveId = driveMatch?.[1] || driveOpenMatch?.[1];
    if (driveId) finalUrl = 'https://drive.google.com/uc?export=view&id=' + driveId;
    const name = urlName.trim() || ('Media ' + (details.documents.length + 1));
    setDetails(f => ({ ...f, documents: [...f.documents, { type: urlType, name, url: finalUrl }] }));
    setUrlInput(''); setUrlName('');
    toast({ title: 'Link added', description: `"${name}" added to this site.` });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const fileList = Array.from(event.target.files);
    setIsUploading(true);
    try {
      const results = await uploadFiles(fileList);
      const succeeded = results.filter((r: any) => r.url) as DocItem[];
      const failed = results.filter((r: any) => r.error);
      if (succeeded.length > 0) {
        setDetails(f => ({ ...f, documents: [...f.documents, ...succeeded] }));
        toast({ title: `${succeeded.length} file(s) uploaded` });
      }
      failed.forEach((f: any) => toast({ variant: 'destructive', title: `Upload failed: ${f.name}`, description: f.error }));
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload error', description: e.message });
    } finally {
      if (event.target) event.target.value = '';
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    setDetails(f => ({ ...f, documents: f.documents.filter((_, i) => i !== index) }));
  };

  const canSubmit = details.location && details.sizeSqFt;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);
    try {
      const payloadDetails = {
        location: details.location,
        sizeSqFt: parseFloat(details.sizeSqFt),
        availabilityDate: details.availabilityDate || undefined,
        constructionProgress: details.constructionProgress || undefined,
        warehouseModel: details.warehouseModel,
        rentPerSqFt: details.rentIsQuote ? 'Get Quote' : numOrUndef(details.rentPerSqFt),
        rentalSecurityDeposit: details.depositIsQuote ? 'Get Quote' : numOrUndef(details.rentalSecurityDeposit),
        area: {
          plinthArea: numOrUndef(details.area.plinthArea), mezzanineArea1: numOrUndef(details.area.mezzanineArea1), mezzanineArea2: numOrUndef(details.area.mezzanineArea2),
          canopyArea: numOrUndef(details.area.canopyArea), driversRestRoomArea: numOrUndef(details.area.driversRestRoomArea), totalChargeableArea: numOrUndef(details.area.totalChargeableArea),
          tempControlledArea: numOrUndef(details.area.tempControlledArea), nonTempControlledArea: numOrUndef(details.area.nonTempControlledArea),
        },
        buildingSpecifications: {
          buildingType: details.buildingType,
          numberOfDocksAndShutters: numOrUndef(details.numberOfDocksAndShutters),
          internalLighting: details.internalLighting || undefined,
          warehouseLayoutAvailable: details.warehouseLayoutAvailable,
          craneSupportStructureAvailable: details.craneSupportStructureAvailable,
          craneAvailable: details.craneAvailable,
          roofType: details.roofType || undefined,
          eveHeightMeters: numOrUndef(details.eveHeightMeters),
          roofInsulation: details.roofInsulation || undefined,
          ventilation: details.ventilation || undefined,
          louvers: details.louvers,
        },
        siteSpecifications: {
          typeOfFlooringInside: details.typeOfFlooringInside || undefined,
          typeOfRoad: details.typeOfRoad || undefined,
        },
        certificatesAndApprovals: details.certificatesAndApprovals,
        documents: details.documents,
        description: details.description || undefined,
        additionalInformation: details.additionalInformation || undefined,
      };

      const payload: any = {
        linkedListingId: linkedListingId || undefined,
        details: payloadDetails,
        demandIds,
        sourceNotes: sourceNotes || undefined,
        siteStatus: 'active',
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateSiteOption(editingId, payload);
        toast({ title: 'Site updated' });
      } else {
        await addSiteOption({
          ...payload,
          sourcedBy: user.email,
          createdBy: user.email,
          createdAt: new Date().toISOString(),
        });
        toast({ title: 'Site added to inventory' });
      }
      setIsFormOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save this site. Please try again.' });
    }
    setSubmitting(false);
  };

  const handleArchive = async (site: SiteOptionSchema) => {
    if (!confirm(`Archive ${site.siteOptionId}? It will be hidden from this list but kept for record.`)) return;
    await archiveSiteOption(site.siteOptionId);
    toast({ title: 'Site archived' });
  };

  if (authLoading || !hasAccess) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(259 30% 96%)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '24px 28px 56px', overflow: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '0.5px solid hsl(259 30% 90%)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: 'hsl(259 44% 94%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Warehouse style={{ width: 14, height: 14, color: '#6141ac' }} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1e1537', margin: 0 }}>Site Options</p>
              <p style={{ fontSize: 11, color: 'hsl(259 15% 55%)', margin: 0 }}>Internal warehouse sourcing inventory</p>
            </div>
          </div>
          <Button onClick={openAddForm} style={{ background: '#6141ac' }}>
            <Plus className="mr-2 h-4 w-4" /> Add site
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
            <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
            <Input placeholder="Search by site ID, location or model..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
          </div>
          {([
            { key: 'all', label: 'All sites' },
            { key: 'listed', label: 'ORS-ONE listings' },
            { key: 'sourced', label: 'Sourced, not listed' },
            { key: 'linked-demand', label: 'Linked to a demand' },
          ] as { key: FilterKey; label: string }[]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
                background: filter === f.key ? '#6141ac' : 'transparent',
                color: filter === f.key ? '#fff' : 'hsl(259 15% 50%)',
                border: filter === f.key ? 'none' : '0.5px solid hsl(259 30% 85%)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid hsl(259 30% 88%)', overflow: 'auto' }}>
          {isLoading ? (
            <p style={{ padding: 24, fontSize: 13, color: 'hsl(259 15% 55%)' }}>Loading inventory...</p>
          ) : filteredSites.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'hsl(259 15% 55%)' }}>No sites match this view yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid hsl(259 30% 88%)' }}>
                  {['Site ID', 'Location', 'Model', 'Size (sq ft)', 'Source', 'Linked to', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '10px 12px', color: 'hsl(259 15% 55%)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSites.map(site => (
                  <tr key={site.siteOptionId} style={{ borderBottom: '0.5px solid hsl(259 30% 92%)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e1537' }}>{site.siteOptionId}</td>
                    <td style={{ padding: '10px 12px' }}>{site.details.location}</td>
                    <td style={{ padding: '10px 12px' }}>{site.details.warehouseModel || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{site.details.sizeSqFt.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {site.linkedListingId ? (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#E6F1FB', color: '#0C447C' }}>ORS-ONE listing</span>
                      ) : (
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#FAEEDA', color: '#854F0B' }}>Sourced, not listed</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'hsl(259 15% 55%)' }}>
                      {site.demandIds?.length ? `${site.demandIds.length} demand${site.demandIds.length > 1 ? 's' : ''}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEditForm(site)} title="Edit" style={{ marginRight: 10, color: 'hsl(259 15% 55%)' }}><Pencil style={{ width: 14, height: 14 }} /></button>
                      <button onClick={() => handleArchive(site)} title="Archive" style={{ color: 'hsl(259 15% 55%)' }}><Archive style={{ width: 14, height: 14 }} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit site' : 'Add a site'}</DialogTitle>
            <DialogDescription>
              Link an existing ORS-ONE listing, or capture the same level of detail for a warehouse you've sourced informally.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[70vh] p-1 pr-6">
            <div className="space-y-8">

              {!editingId && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Search existing ORS-ONE listing (optional)</Label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
                    <Input placeholder="Search by listing ID, location or name..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
                  </div>
                  {filteredListings.length > 0 && (
                    <div style={{ border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8, maxHeight: 160, overflow: 'auto' }}>
                      {filteredListings.map(l => (
                        <button key={l.listingId} onClick={() => handlePickListing(l.listingId)} type="button"
                          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)' }}>
                          <strong>{l.name || l.listingId}</strong> · {l.location} · {l.sizeSqFt?.toLocaleString()} sft
                        </button>
                      ))}
                    </div>
                  )}
                  {linkedListing && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E6F1FB', color: '#0C447C', fontSize: 12, padding: '5px 10px', borderRadius: 8 }}>
                      Linked: {linkedListing.name || linkedListing.listingId}
                      <button onClick={() => setLinkedListingId('')} type="button"><X style={{ width: 12, height: 12 }} /></button>
                    </div>
                  )}
                  <p style={{ fontSize: 11, color: 'hsl(259 15% 60%)' }}>or enter the details manually below</p>
                </div>
              )}

              {/* General Information */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>General Information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                  <div>
                    <Label className="text-xs font-semibold">Location</Label>
                    <Input value={details.location} onChange={e => setDetails(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Oragadam, Chennai" className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Total Size for Listing (Sq. Ft.)</Label>
                    <Input type="number" value={details.sizeSqFt} onChange={e => setDetails(f => ({ ...f, sizeSqFt: e.target.value }))} placeholder="e.g. 150000" className="mt-1 h-9 text-sm" />
                  </div>
                </div>
              </div>

              {/* Possession Readiness & Commercials */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Possession Readiness &amp; Commercials</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                  <div>
                    <Label className="text-xs font-semibold">Possession Readiness</Label>
                    <select value={details.availabilityDate} onChange={e => setDetails(f => ({ ...f, availabilityDate: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="Ready for Occupancy">Ready for Occupancy</option>
                      <option value="Available in 3 months">Available in 3 months</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="BTS-Built To Suit">BTS-Built To Suit</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Construction Progress</Label>
                    <Input value={details.constructionProgress} onChange={e => setDetails(f => ({ ...f, constructionProgress: e.target.value }))} placeholder="e.g., 80% or 'Structure Complete'" className="mt-1 h-9 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Rent per Sq. Ft.</Label>
                    <Input type="number" value={details.rentPerSqFt} disabled={details.rentIsQuote} onChange={e => setDetails(f => ({ ...f, rentPerSqFt: e.target.value }))} placeholder="e.g., 25" className="mt-1 h-9 text-sm" />
                    <label className="flex items-center gap-2 text-xs mt-1.5">
                      <Checkbox checked={details.rentIsQuote} onCheckedChange={c => setDetails(f => ({ ...f, rentIsQuote: !!c }))} /> Set to &quot;Request for Quote&quot;
                    </label>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Security Deposit</Label>
                    <Input type="number" value={details.rentalSecurityDeposit} disabled={details.depositIsQuote} onChange={e => setDetails(f => ({ ...f, rentalSecurityDeposit: e.target.value }))} placeholder="e.g., 6 months" className="mt-1 h-9 text-sm" />
                    <label className="flex items-center gap-2 text-xs mt-1.5">
                      <Checkbox checked={details.depositIsQuote} onCheckedChange={c => setDetails(f => ({ ...f, depositIsQuote: !!c }))} /> Set to &quot;Request for Quote&quot;
                    </label>
                  </div>
                </div>
              </div>

              {/* Area Specifications */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Area Specifications (in Sq. Ft.)</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md">
                  {([
                    ['plinthArea', 'Plinth Area (Shop Floor)'], ['mezzanineArea1', 'Mezzanine Area 1'], ['mezzanineArea2', 'Mezzanine Area 2'],
                    ['canopyArea', 'Canopy Area'], ['driversRestRoomArea', "Driver's Rest Room Area"], ['totalChargeableArea', 'Total Chargeable Area (SFT)'],
                  ] as [keyof typeof details.area, string][]).map(([key, label]) => (
                    <div key={key}>
                      <Label className="text-xs font-semibold">{label}</Label>
                      <Input type="number" value={details.area[key]} onChange={e => setDetails(f => ({ ...f, area: { ...f.area, [key]: e.target.value } }))} className="mt-1 h-9 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Building Specifications */}
                <div className="space-y-3">
                  <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Building Specifications</p>
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <Label className="text-xs font-semibold">Building Type</Label>
                      <div className="flex flex-wrap gap-4 pt-2">
                        {BUILDING_TYPES.map(t => (
                          <label key={t} className="flex items-center gap-2 text-sm">
                            <Checkbox checked={details.buildingType.includes(t)} onCheckedChange={() => toggleBuildingType(t)} /> {t}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Warehouse Model</Label>
                      <select value={details.warehouseModel} onChange={e => setDetails(f => ({ ...f, warehouseModel: e.target.value as any }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        {WAREHOUSE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    {details.warehouseModel === 'Temp & Non-Temp Controlled' && (
                      <div className="grid grid-cols-2 gap-3 p-3 border rounded-md bg-secondary/50">
                        <div>
                          <Label className="text-xs font-semibold">Temp-Controlled Area (SFT)</Label>
                          <Input type="number" value={details.area.tempControlledArea} onChange={e => setDetails(f => ({ ...f, area: { ...f.area, tempControlledArea: e.target.value } }))} className="mt-1 h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Non-Temp-Controlled Area (SFT)</Label>
                          <Input type="number" value={details.area.nonTempControlledArea} onChange={e => setDetails(f => ({ ...f, area: { ...f.area, nonTempControlledArea: e.target.value } }))} className="mt-1 h-9 text-sm" />
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-semibold">Number of Docks/Shutters</Label>
                      <Input type="number" value={details.numberOfDocksAndShutters} onChange={e => setDetails(f => ({ ...f, numberOfDocksAndShutters: e.target.value }))} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Internal Lighting</Label>
                      <Input value={details.internalLighting} onChange={e => setDetails(f => ({ ...f, internalLighting: e.target.value }))} placeholder="e.g., LED-HI Bay 300 lux" className="mt-1 h-9 text-sm" />
                    </div>
                    {([
                      ['warehouseLayoutAvailable', 'Warehouse Layout Available?'], ['craneSupportStructureAvailable', 'Crane Support Structure'], ['craneAvailable', 'Crane Available'],
                    ] as [keyof typeof details, string][]).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between rounded-lg border p-3">
                        <Label className="text-sm">{label}</Label>
                        <Switch checked={details[key] as boolean} onCheckedChange={c => setDetails(f => ({ ...f, [key]: c }))} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Site & Roof */}
                <div className="space-y-3">
                  <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Site &amp; Roof</p>
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <Label className="text-xs font-semibold">Inside Flooring Type</Label>
                      <select value={details.typeOfFlooringInside} onChange={e => setDetails(f => ({ ...f, typeOfFlooringInside: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Not noted</option>
                        <option value="FM2">FM2</option><option value="VDF-RCC">VDF-RCC</option><option value="RCC">RCC</option><option value="PCC">PCC</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Access Road Flooring</Label>
                      <select value={details.typeOfRoad} onChange={e => setDetails(f => ({ ...f, typeOfRoad: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Not noted</option>
                        <option value="Tar">Tar</option><option value="RCC">RCC</option><option value="PCC">PCC</option><option value="Gravel">Gravel</option>
                      </select>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-xs font-semibold">Roof Type</Label>
                      <select value={details.roofType} onChange={e => setDetails(f => ({ ...f, roofType: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Not noted</option>
                        <option value="Galvalume">Galvalume</option><option value="RCC">RCC</option><option value="ACC">ACC</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Eve Height (in Meters)</Label>
                      <Input type="number" value={details.eveHeightMeters} onChange={e => setDetails(f => ({ ...f, eveHeightMeters: e.target.value }))} className="mt-1 h-9 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Roof Insulation</Label>
                      <select value={details.roofInsulation} onChange={e => setDetails(f => ({ ...f, roofInsulation: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Not noted</option>
                        <option value="Insulated">Insulated</option><option value="Non-Insulated">Non-Insulated</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Ventilation</Label>
                      <select value={details.ventilation} onChange={e => setDetails(f => ({ ...f, ventilation: e.target.value }))} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Not noted</option>
                        <option value="Turbo">Turbo</option><option value="Ridge">Ridge</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label className="text-sm">Louvers</Label>
                      <Switch checked={details.louvers} onCheckedChange={c => setDetails(f => ({ ...f, louvers: c }))} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificates & Approvals */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Certificates &amp; Approvals</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-md">
                  {APPROVAL_FIELDS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={(details.certificatesAndApprovals as any)[key]} onCheckedChange={c => setDetails(f => ({ ...f, certificatesAndApprovals: { ...f.certificatesAndApprovals, [key]: !!c } }))} /> {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Documents & Media */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Documents &amp; Media</p>
                <div className="space-y-3 p-4 border rounded-md">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important: Do Not Expose Identity</AlertTitle>
                    <AlertDescription>
                      Please do not upload front views, elevations, or any pictures that could reveal the property's or developer's identity. Use only inside views of the building.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'hsl(259 30% 94%)', border: '1px solid hsl(259 30% 86%)' }}>
                    <button type="button" onClick={() => setMediaTab('url')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold"
                      style={mediaTab === 'url' ? { background: '#6141ac', color: '#fff' } : { color: 'hsl(259 15% 45%)' }}>
                      <LinkIcon className="h-3.5 w-3.5" /> Add Link
                    </button>
                    <button type="button" onClick={() => setMediaTab('upload')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold"
                      style={mediaTab === 'upload' ? { background: '#6141ac', color: '#fff' } : { color: 'hsl(259 15% 45%)' }}>
                      <UploadCloud className="h-3.5 w-3.5" /> Upload File
                    </button>
                  </div>

                  {mediaTab === 'url' && (
                    <div className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(259 44% 97%)', border: '1px solid hsl(259 44% 88%)' }}>
                      <div>
                        <Label className="text-xs font-semibold">Google Drive / Photos Link</Label>
                        <Input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="Paste Google Drive or Google Photos share link" className="mt-1 text-sm" />
                        <p className="text-xs mt-1" style={{ color: 'hsl(259 15% 50%)' }}>Share your file with &quot;Anyone with the link&quot; in Google Drive first</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-semibold">Label (optional)</Label>
                          <Input value={urlName} onChange={e => setUrlName(e.target.value)} placeholder="e.g. Inside View 1" className="mt-1 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold">Type</Label>
                          <select value={urlType} onChange={e => setUrlType(e.target.value as any)} className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="image">Image</option><option value="video">Video</option><option value="layout">Layout / PDF</option>
                          </select>
                        </div>
                      </div>
                      <Button type="button" onClick={handleAddUrl} className="w-full" style={{ background: '#6141ac' }}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Add to Site
                      </Button>
                      <p className="text-xs text-center" style={{ color: 'hsl(259 15% 55%)' }}>No file size limits · No server storage · Links are permanent</p>
                    </div>
                  )}

                  {mediaTab === 'upload' && (
                    <div className="rounded-xl p-4 space-y-3" style={{ background: 'hsl(259 30% 96%)', border: '1px solid hsl(259 30% 88%)' }}>
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full">
                        <UploadCloud className="mr-2 h-4 w-4" /> {isUploading ? 'Uploading...' : 'Choose File to Upload'}
                      </Button>
                      <p className="text-xs text-center" style={{ color: 'hsl(259 15% 55%)' }}>JPG, PNG, GIF, MP4, PDF · Max 20MB per file</p>
                      <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.mp4,.mov,.pdf" onChange={handleFileChange} className="hidden" />
                    </div>
                  )}

                  {details.documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No media added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {details.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 border rounded-md">
                          <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-md flex-shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{doc.type}</p>
                          </div>
                          <button type="button" onClick={() => removeDocument(i)}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Property Description */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Property Description</p>
                <div className="p-4 border rounded-md space-y-4">
                  <div>
                    <Label className="text-xs font-semibold">Overview</Label>
                    <Textarea value={details.description} onChange={e => setDetails(f => ({ ...f, description: e.target.value }))} placeholder="Describe the key features, location advantages, and highlights of your property." className="mt-1 min-h-32 text-sm" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Developer Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Textarea value={details.additionalInformation} onChange={e => setDetails(f => ({ ...f, additionalInformation: e.target.value }))} placeholder="Any additional details, special features, or internal notes about the property." className="mt-1 min-h-24 text-sm" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Demand linking, internal-only */}
              <div className="space-y-3">
                <p className="text-base font-semibold" style={{ color: '#1e1537' }}>Link to demand(s)</p>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 10, top: 10, width: 14, height: 14, color: '#aaa' }} />
                  <Input placeholder="Search demand by ID or location..." value={demandSearch} onChange={e => setDemandSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
                </div>
                <div style={{ border: '0.5px solid hsl(259 30% 88%)', borderRadius: 8, maxHeight: 140, overflow: 'auto' }}>
                  {filteredDemands.length === 0 ? (
                    <p style={{ padding: 10, fontSize: 12, color: 'hsl(259 15% 60%)' }}>No demands found.</p>
                  ) : filteredDemands.map(d => (
                    <label key={d.demandId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12.5, borderBottom: '0.5px solid hsl(259 30% 92%)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={demandIds.includes(d.demandId)} onChange={() => toggleDemand(d.demandId)} />
                      #{d.demandId} · {d.location} · {d.size?.toLocaleString()} sft
                    </label>
                  ))}
                </div>
                {demandIds.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {demandIds.map(id => (
                      <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'hsl(259 44% 94%)', color: '#6141ac', padding: '3px 8px', borderRadius: 999 }}>
                        #{id}
                        <button onClick={() => toggleDemand(id)} type="button"><X style={{ width: 10, height: 10 }} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Internal sourcing notes <span className="text-muted-foreground font-normal">(not visible to clients)</span></Label>
                <Textarea value={sourceNotes} onChange={e => setSourceNotes(e.target.value)} rows={2} className="text-sm" />
              </div>

            </div>
          </ScrollArea>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ background: '#6141ac' }}>
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Add site'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
