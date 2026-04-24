'use client';

import * as React from 'react';
import Link from 'next/link';
import { MapPin, Building, Zap, ArrowRight, Lock, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';
import { ORS_TRANSACT_FIELDS, LEVEL2_KEYS, GROUP_LABELS } from '@/lib/ors-transact-schema';

// Utility: check if a value is meaningful (not null/NULL/empty/0-as-empty)
function hasValue(v: any): boolean {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s !== '' && s.toLowerCase() !== 'null' && s !== '0';
}

// ── Mode badge ───────────────────────────────────────────────────────────────
export function ModeBadge({ mode }: { mode: 'ors_transact' | 'dual' }) {
  if (mode === 'dual') return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', letterSpacing: '0.04em',
      background: 'linear-gradient(90deg,#6141ac 50%,#0f6e56 50%)',
      color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Layers style={{width:10,height:10}} /> DIRECT + ORS TRANSACT
    </span>
  );
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', letterSpacing: '0.04em',
      background: '#0f6e56', color: '#fff',
      display: 'inline-flex', alignItems: 'center', gap: 4,
    }}>
      <Zap style={{width:10,height:10}} /> ORS TRANSACT
    </span>
  );
}

// ── Level 1 Card ─────────────────────────────────────────────────────────────
export function OrsTransactCard({ listing, onClick }: { listing: OrsTransactListing; onClick: () => void }) {
  const facilityType = listing.facility_type || '';
  const city = [listing.city_location, listing.district, listing.state].filter(hasValue).join(', ');
  const circle = listing.locality_circle;
  const size = listing.lease_area_as_advertised_in_sq_ft;
  const sizeRange = listing.lease_area_range_in_sq_ft;
  const ceiling = listing.center_ceiling_height_in_feet;
  const availability = listing.building_availability;
  const oragadam = listing.distance_from_oragadam_in_km;
  const sriperumbudur = listing.distance_from_sriperumbudur_in_km;
  const airport = listing.distance_from_chennai_airport_in_km;

  const borderColor = listing.listingMode === 'dual'
    ? 'linear-gradient(180deg,#6141ac,#0f6e56)'
    : '#0f6e56';

  return (
    <div
      onClick={onClick}
      style={{
        background: listing.listingMode === 'ors_transact' ? '#f5faf8' : '#fff',
        border: '0.5px solid hsl(160 30% 82%)',
        borderLeft: listing.listingMode === 'dual'
          ? '3px solid #6141ac'
          : '3px solid #0f6e56',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,110,86,0.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Header */}
      <div style={{padding: '12px 14px 8px', borderBottom: '0.5px solid hsl(160 30% 90%)'}}>
        <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6}}>
          <ModeBadge mode={listing.listingMode} />
          <span style={{fontSize:10,color:'hsl(160 20% 50%)',fontWeight:500}}>{listing.ors_property_id}</span>
        </div>
        {hasValue(facilityType) && (
          <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
            <Building style={{width:12,height:12,color:'#0f6e56',flexShrink:0}} />
            <span style={{fontSize:12,fontWeight:600,color:'#0f6e56'}}>{facilityType}</span>
          </div>
        )}
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <MapPin style={{width:11,height:11,color:'hsl(160 20% 50%)',flexShrink:0}} />
          <span style={{fontSize:12,color:'#1e1537'}}>{city || '—'}</span>
        </div>
        {hasValue(circle) && (
          <span style={{fontSize:11,color:'hsl(160 25% 45%)',background:'hsl(160 40% 94%)',padding:'1px 6px',marginTop:4,display:'inline-block'}}>{circle}</span>
        )}
      </div>

      {/* Key specs */}
      <div style={{padding:'8px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
        {hasValue(size) && (
          <div style={{background:'hsl(160 40% 96%)',padding:'6px 8px'}}>
            <p style={{fontSize:10,color:'hsl(160 20% 50%)',margin:'0 0 1px'}}>Lease Area</p>
            <p style={{fontSize:13,fontWeight:600,color:'#1e1537',margin:0}}>{Number(size).toLocaleString()} sft</p>
          </div>
        )}
        {!hasValue(size) && hasValue(sizeRange) && (
          <div style={{background:'hsl(160 40% 96%)',padding:'6px 8px'}}>
            <p style={{fontSize:10,color:'hsl(160 20% 50%)',margin:'0 0 1px'}}>Size Range</p>
            <p style={{fontSize:13,fontWeight:600,color:'#1e1537',margin:0}}>{sizeRange}</p>
          </div>
        )}
        {hasValue(ceiling) && (
          <div style={{background:'hsl(160 40% 96%)',padding:'6px 8px'}}>
            <p style={{fontSize:10,color:'hsl(160 20% 50%)',margin:'0 0 1px'}}>Ceiling Height</p>
            <p style={{fontSize:13,fontWeight:600,color:'#1e1537',margin:0}}>{ceiling} ft</p>
          </div>
        )}
        {hasValue(availability) && (
          <div style={{background:'hsl(160 40% 96%)',padding:'6px 8px',gridColumn: (!hasValue(size) && !hasValue(sizeRange) && !hasValue(ceiling)) ? 'span 2' : undefined}}>
            <p style={{fontSize:10,color:'hsl(160 20% 50%)',margin:'0 0 1px'}}>Availability</p>
            <p style={{fontSize:12,fontWeight:600,color: availability === 'Available' ? '#0f6e56' : '#854f0b',margin:0}}>{availability}</p>
          </div>
        )}
      </div>

      {/* Distances */}
      {(hasValue(oragadam) || hasValue(sriperumbudur) || hasValue(airport)) && (
        <div style={{padding:'0 14px 8px',display:'flex',gap:6,flexWrap:'wrap'}}>
          {hasValue(oragadam) && <span style={{fontSize:10,color:'hsl(160 20% 45%)',background:'hsl(160 30% 94%)',padding:'2px 6px'}}>Oragadam {oragadam} km</span>}
          {hasValue(sriperumbudur) && <span style={{fontSize:10,color:'hsl(160 20% 45%)',background:'hsl(160 30% 94%)',padding:'2px 6px'}}>Sriperumbudur {sriperumbudur} km</span>}
          {hasValue(airport) && <span style={{fontSize:10,color:'hsl(160 20% 45%)',background:'hsl(160 30% 94%)',padding:'2px 6px'}}>Airport {airport} km</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{marginTop:'auto',padding:'8px 14px',borderTop:'0.5px solid hsl(160 30% 90%)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,color:'hsl(160 20% 50%)'}}>View details</span>
        <ArrowRight style={{width:14,height:14,color:'#0f6e56'}} />
      </div>
    </div>
  );
}

// ── Level 2 Detail Modal ──────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{display:'flex',gap:8,padding:'6px 0',borderBottom:'0.5px solid hsl(160 30% 92%)'}}>
      <span style={{flex:'0 0 200px',fontSize:11,color:'hsl(160 20% 50%)',lineHeight:1.5}}>{label}</span>
      <span style={{flex:1,fontSize:12,color:'#1e1537',fontWeight:500,lineHeight:1.5}}>{value}</span>
    </div>
  );
}

export function OrsTransactDetail({ listing, onClose }: { listing: OrsTransactListing; onClose: () => void }) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isTeamORS = user && ['SuperAdmin','O2O'].includes(user.role);

  // Level 2 public fields — only those with data
  const level2Fields = ORS_TRANSACT_FIELDS
    .filter(f => f.level === 2 && f.visibility === 'public')
    .filter(f => hasValue(listing[f.key]))
    .slice(0, 25);

  // Group internal fields by group (for Team ORS)
  const internalByGroup = React.useMemo(() => {
    if (!isTeamORS) return null;
    const groups: Record<string, typeof ORS_TRANSACT_FIELDS> = {};
    ORS_TRANSACT_FIELDS
      .filter(f => f.visibility === 'internal' && hasValue(listing[f.key]))
      .forEach(f => {
        if (!groups[f.group]) groups[f.group] = [];
        groups[f.group].push(f);
      });
    return groups;
  }, [isTeamORS, listing]);

  const [internalGroup, setInternalGroup] = React.useState<string | null>(null);

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'24px 16px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:760,background:'#fff',marginBottom:24}}>

        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#0a3d2e,#0f6e56)',padding:'16px 20px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
              <ModeBadge mode={listing.listingMode} />
              <span style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:500}}>{listing.ors_property_id}</span>
            </div>
            <p style={{fontSize:16,fontWeight:700,color:'#fff',margin:'0 0 3px'}}>
              {listing.facility_type || 'Facility'} · {listing.city_location || listing.district || ''}
            </p>
            <p style={{fontSize:12,color:'rgba(255,255,255,0.55)',margin:0}}>
              {[listing.locality_circle, listing.district, listing.state].filter(hasValue).join(' · ')}
            </p>
          </div>
          <button onClick={onClose} style={{color:'rgba(255,255,255,0.6)',fontSize:20,lineHeight:1,background:'none',border:'none',cursor:'pointer',padding:4}}>✕</button>
        </div>

        {/* Picture URLs if any */}
        {listing.pictureUrls && listing.pictureUrls.length > 0 && (
          <div style={{padding:'12px 20px',background:'hsl(160 30% 97%)',borderBottom:'0.5px solid hsl(160 30% 88%)'}}>
            <p style={{fontSize:11,fontWeight:600,color:'#0f6e56',margin:'0 0 8px'}}>SITE PICTURES</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {listing.pictureUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:11,color:'#0f6e56',background:'hsl(160 40% 92%)',padding:'3px 10px',textDecoration:'none'}}>
                  Picture {i+1} ↗
                </a>
              ))}
            </div>
          </div>
        )}

        {/* If not logged in — show gate */}
        {!isLoggedIn && (
          <div style={{padding:'24px 20px',textAlign:'center',background:'hsl(160 30% 97%)'}}>
            <Lock style={{width:32,height:32,color:'#0f6e56',margin:'0 auto 12px'}} />
            <p style={{fontSize:14,fontWeight:700,color:'#1e1537',margin:'0 0 6px'}}>Login to view detailed specifications</p>
            <p style={{fontSize:12,color:'hsl(160 20% 50%)',margin:'0 0 16px'}}>Full technical specs, distances, utilities and compliance data available after login.</p>
            <Link href="/login" style={{background:'#0f6e56',color:'#fff',padding:'8px 24px',textDecoration:'none',fontSize:13,fontWeight:700}}>Login to View Details</Link>
          </div>
        )}

        {/* Level 2 fields */}
        {isLoggedIn && (
          <div style={{padding:'16px 20px'}}>
            <p style={{fontSize:11,fontWeight:700,color:'#0f6e56',letterSpacing:'0.06em',margin:'0 0 10px'}}>DETAILED SPECIFICATIONS</p>
            {level2Fields.length === 0 ? (
              <p style={{fontSize:12,color:'hsl(160 20% 55%)'}}>No additional specifications on record for this listing.</p>
            ) : (
              level2Fields.map(f => (
                <FieldRow key={f.key} label={f.label} value={String(listing[f.key])} />
              ))
            )}
          </div>
        )}

        {/* Internal groups — Team ORS only */}
        {isTeamORS && internalByGroup && Object.keys(internalByGroup).length > 0 && (
          <div style={{padding:'0 20px 16px'}}>
            <p style={{fontSize:11,fontWeight:700,color:'#6141ac',letterSpacing:'0.06em',margin:'0 0 10px'}}>INTERNAL DATA</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
              {Object.keys(internalByGroup).map(grp => (
                <button key={grp} onClick={() => setInternalGroup(internalGroup === grp ? null : grp)}
                  style={{
                    fontSize:11,fontWeight:600,padding:'4px 10px',cursor:'pointer',
                    background: internalGroup === grp ? '#6141ac' : 'hsl(259 44% 94%)',
                    color: internalGroup === grp ? '#fff' : '#6141ac',
                    border: '0.5px solid hsl(259 44% 82%)',
                  }}>
                  {GROUP_LABELS[grp as keyof typeof GROUP_LABELS] || grp} ({internalByGroup[grp].length})
                </button>
              ))}
            </div>
            {internalGroup && internalByGroup[internalGroup] && (
              <div>
                {internalByGroup[internalGroup].map(f => (
                  <FieldRow key={f.key} label={f.label} value={String(listing[f.key])} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
