'use client';
import * as React from 'react';
import { MapPin, Building2, ArrowRight, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';
import { ORS_TRANSACT_FIELDS } from '@/lib/ors-transact-schema';

function hasVal(v: any): boolean {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  return s !== '' && s.toLowerCase() !== 'null' && s !== '0';
}

// ── Availability confirmation modal ──────────────────────────────────────────
function ConfirmModal({ listing, onClose }: { listing: OrsTransactListing; onClose: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const leadId = `ORS-TR-${Date.now()}`;
      const location = [listing.city_location, listing.district, listing.state].filter(hasVal).join(', ');
      const size = listing.lease_area_as_advertised_in_sq_ft || listing.lease_area_range_in_sq_ft || '—';

      // Create transaction workspace lead
      await fetch('/api/registered-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          customerId: user.email,
          leadName: user.companyName || user.userName,
          leadContact: user.userName,
          leadEmail: user.email,
          leadPhone: user.phone || '',
          requirementsSummary: `ORS Transact availability confirmation request — ${listing.ors_property_id} · ${listing.facility_type || 'Facility'} · ${location} · ${size} sft`,
          registeredBy: user.email,
          providers: [{ providerEmail: 'balaji@lakshmibalajio2o.com', properties: [{ listingId: listing.ors_property_id, status: 'Pending' }] }],
          isO2OCollaborator: true,
          isOrsTransact: true,
          orsTransactId: listing.ors_property_id,
          createdAt: new Date().toISOString(),
        }),
      });

      // Notify admin with full customer details
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          id: `ors-tr-admin-${leadId}`,
          type: 'new_lead_for_provider',
          title: `ORS Transact Availability Request — ${listing.ors_property_id}`,
          message: `${user.companyName || user.userName} (${user.email} · ${user.phone || 'no phone'}) has requested availability confirmation for ${listing.ors_property_id} — ${listing.facility_type || 'Facility'} at ${location}, ${size} sft. Transaction workspace created: ${leadId}.`,
          href: `/dashboard/leads/${leadId}?tab=activity`,
          recipientEmail: 'balaji@lakshmibalajio2o.com',
          timestamp: new Date().toISOString(),
          triggeredBy: user.email,
          isRead: false,
        }]),
      });

      // Notify tele-caller — ORS ID, location, size only (no client details)
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          id: `ors-tr-caller-${leadId}`,
          type: 'new_activity',
          title: `Availability Check Required — ${listing.ors_property_id}`,
          message: `Please verify current availability for ORS Property ${listing.ors_property_id} · ${listing.facility_type || 'Facility'} · ${location} · ${size} sft. Update the ORS Transact record once confirmed.`,
          href: `/dashboard?tab=ors-transact-import`,
          recipientEmail: 'balaji@lakshmibalajio2o.com',
          timestamp: new Date().toISOString(),
          triggeredBy: 'system',
          isRead: false,
        }]),
      });

      setDone(true);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Please try again.' });
    }
    setSubmitting(false);
  };

  const location = [listing.city_location, listing.district, listing.state].filter(hasVal).join(', ');
  const size = listing.lease_area_as_advertised_in_sq_ft
    ? Number(listing.lease_area_as_advertised_in_sq_ft).toLocaleString() + ' sft'
    : listing.lease_area_range_in_sq_ft || '—';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,21,55,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff' }}>

        {/* Header */}
        <div style={{ background: '#1e1537', padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 600, background: 'hsl(259 44% 14%)', color: 'hsl(259 44% 88%)', padding: '2px 8px', letterSpacing: '.05em' }}>ORS Transact</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', fontSize: 18, cursor: 'pointer', padding: 2, lineHeight: 1 }}>✕</button>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '8px 0 2px' }}>Request Availability Confirmation</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', margin: 0 }}>{listing.ors_property_id} · {listing.facility_type || 'Facility'} · {location}</p>
        </div>

        {done ? (
          <div style={{ padding: '24px 18px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, background: 'hsl(259 44% 94%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6141ac" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e1537', margin: '0 0 6px' }}>Request submitted</p>
            <p style={{ fontSize: 12, color: 'hsl(259 15% 50%)', margin: '0 0 16px', lineHeight: 1.6 }}>
              ORS-ONE will confirm availability and reach out to you. Your transaction workspace has been created.
            </p>
            <button onClick={onClose} style={{ padding: '8px 24px', background: '#6141ac', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 0 }}>Close</button>
          </div>
        ) : (
          <div style={{ padding: '16px 18px' }}>
            {/* Property summary */}
            <div style={{ background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 88%)', padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'hsl(259 25% 55%)', margin: '0 0 2px' }}>ORS Property ID</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>{listing.ors_property_id}</p>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: 'hsl(259 25% 55%)', margin: '0 0 2px' }}>Size</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>{size}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: 10, color: 'hsl(259 25% 55%)', margin: '0 0 2px' }}>Location</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>{location}</p>
                </div>
              </div>
            </div>

            {/* What happens */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#1e1537', margin: '0 0 6px' }}>What happens next</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  'ORS-ONE verifies current availability with the property owner',
                  'You are notified with confirmed status within 24–48 hours',
                  'If available, ORS facilitates site visit and leasing process',
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'hsl(259 44% 94%)', color: '#6141ac', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <p style={{ fontSize: 11, color: 'hsl(259 15% 45%)', margin: 0, lineHeight: 1.6 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitting as */}
            <div style={{ background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 88%)', padding: '8px 12px', marginBottom: 14 }}>
              <p style={{ fontSize: 10, color: 'hsl(259 25% 55%)', margin: '0 0 2px' }}>Submitting as</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>{user?.companyName || user?.userName} · {user?.email}</p>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, padding: '10px 0', background: submitting ? 'hsl(259 30% 75%)' : '#6141ac', color: '#fff', fontSize: 12, fontWeight: 600, border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', borderRadius: 0 }}>
                {submitting ? 'Submitting...' : 'Confirm Request'}
              </button>
              <button onClick={onClose}
                style={{ padding: '10px 16px', background: 'hsl(259 44% 94%)', color: '#6141ac', fontSize: 12, fontWeight: 600, border: '0.5px solid hsl(259 44% 80%)', cursor: 'pointer', borderRadius: 0 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ORS Transact Card ─────────────────────────────────────────────────────────
export function OrsTransactCard({ listing }: { listing: OrsTransactListing }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  const facilityType = listing.facility_type;
  const city = listing.city_location;
  const district = listing.district;
  const state = listing.state;
  const circle = listing.locality_circle;
  const sizeRaw = listing.lease_area_as_advertised_in_sq_ft;
  const sizeRange = listing.lease_area_range_in_sq_ft;
  const airport = listing.distance_from_chennai_airport_in_km;
  const oragadam = listing.distance_from_oragadam_in_km;
  const sriperumbudur = listing.distance_from_sriperumbudur_in_km;
  const chennaiPort = listing.distance_from_chennai_port_in_km;
  const mahindra = listing.distance_from_mahindra_world_city_in_km;

  const distancePairs = [
    ['Airport', airport],
    ['Oragadam', oragadam],
    ['Sriperumbudur', sriperumbudur],
    ['Chennai Port', chennaiPort],
    ['Mahindra WC', mahindra],
  ].filter(([, v]) => hasVal(v)) as [string, string][];

  const locationLine = [city, district].filter(hasVal).join(', ');
  const sizeDisplay = sizeRaw
    ? Number(sizeRaw).toLocaleString() + ' sft'
    : sizeRange || null;

  return (
    <>
      <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 88%)', borderTop: '2px solid #6141ac', borderRadius: 0 }}>

        {/* Card header */}
        <div style={{ padding: '11px 14px 9px', borderBottom: '0.5px solid hsl(259 30% 90%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, background: 'hsl(259 44% 14%)', color: 'hsl(259 44% 88%)', padding: '2px 8px', letterSpacing: '.05em' }}>
              ORS Transact
            </span>
            <span style={{ fontSize: 10, color: 'hsl(259 15% 55%)' }}>{listing.ors_property_id}</span>
          </div>

          {hasVal(facilityType) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
              <Building2 style={{ width: 11, height: 11, color: '#6141ac', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#6141ac' }}>{facilityType}</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin style={{ width: 11, height: 11, color: 'hsl(259 15% 55%)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>{locationLine || '—'}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
            {hasVal(state) && (
              <span style={{ fontSize: 11, color: 'hsl(259 25% 45%)', background: 'hsl(259 44% 96%)', padding: '1px 6px' }}>{state}</span>
            )}
            {hasVal(circle) && circle !== city && (
              <span style={{ fontSize: 11, color: 'hsl(259 25% 45%)', background: 'hsl(259 44% 96%)', padding: '1px 6px' }}>{circle}</span>
            )}
            {hasVal(sizeDisplay) && (
              <span style={{ fontSize: 11, color: 'hsl(259 25% 45%)', background: 'hsl(259 44% 96%)', padding: '1px 6px', fontWeight: 500 }}>{sizeDisplay}</span>
            )}
          </div>
        </div>

        {/* Distances — only populated */}
        {distancePairs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, margin: '8px 14px' }}>
            {distancePairs.slice(0, 3).map(([label, val]) => (
              <div key={label} style={{ background: 'hsl(259 44% 96%)', padding: '5px 7px' }}>
                <p style={{ fontSize: 10, color: 'hsl(259 25% 50%)', margin: '0 0 1px' }}>{label}</p>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{val} km</p>
              </div>
            ))}
          </div>
        )}

        {/* Availability disclaimer */}
        <div style={{ margin: '0 14px 10px', padding: '7px 10px', background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 86%)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <AlertTriangle style={{ width: 11, height: 11, color: '#6141ac', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'hsl(259 25% 40%)', margin: 0, lineHeight: 1.5 }}>
              Facility availability subject to confirmation by ORS.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '0 14px 12px' }}>
          {user ? (
            <button
              onClick={() => setShowModal(true)}
              style={{ width: '100%', padding: '9px 0', background: '#6141ac', color: '#f0edfb', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              Confirm Availability with ORS
              <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          ) : (
            <a href="/login"
              style={{ width: '100%', padding: '9px 0', background: 'hsl(259 44% 94%)', color: '#6141ac', fontSize: 12, fontWeight: 600, border: '0.5px solid hsl(259 44% 80%)', cursor: 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
              <LogIn style={{ width: 13, height: 13 }} />
              Login to Confirm Availability
            </a>
          )}
        </div>
      </div>

      {showModal && <ConfirmModal listing={listing} onClose={() => setShowModal(false)} />}
    </>
  );
}
