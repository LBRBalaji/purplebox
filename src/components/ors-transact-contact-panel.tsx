'use client';
import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Phone, User, Building2, Mail, Edit2, Save, X, Lock } from 'lucide-react';
import type { OrsTransactListing } from '@/lib/ors-transact-schema';

// Contact fields to display — all internal visibility
const CONTACT_FIELDS = [
  { key: 'developer_name', label: 'Developer / Owner Name', icon: Building2 },
  { key: 'advertiser_profile', label: 'Advertiser Profile', icon: User },
  { key: 'advertiser_office_address', label: 'Office Address', icon: Building2 },
  { key: 'contact_number_as_advertised_1', label: 'Contact Number 1', icon: Phone },
  { key: 'contact_number_as_advertised_2', label: 'Contact Number 2', icon: Phone },
  { key: 'contact_number_as_advertised_3', label: 'Contact Number 3', icon: Phone },
  { key: 'for_site_visit_contact_person_name_from_owner_developer_side', label: 'Site Visit Contact Name', icon: User },
  { key: 'for_site_visit_contact_persons_designation', label: 'Designation', icon: User },
  { key: 'for_site_visit_contact_persons_site_phone', label: 'Site Phone', icon: Phone },
  { key: 'for_site_visit_contact_persons_mobile', label: 'Mobile', icon: Phone },
  { key: 'contact_persons_email_id', label: 'Contact Email', icon: Mail },
  { key: 'on_line_information_about_advertiser', label: 'Online Information', icon: Mail },
];

interface Props {
  listing: OrsTransactListing;
  onUpdated?: () => void;
}

export function OrsTransactContactPanel({ listing, onUpdated }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    CONTACT_FIELDS.forEach(f => { v[f.key] = String(listing[f.key] || ''); });
    return v;
  });

  // Access control
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isO2O = user?.role === 'O2O';
  const isInternalStaff = (user as any)?.isInternalStaff === true;
  const privileges: string[] = (user as any)?.privileges || [];

  // Check ORS Transact contact privilege
  const hasContactAccess = isSuperAdmin || isO2O ||
    (isInternalStaff && (
      privileges.includes('ors_transact_contacts') ||
      privileges.includes('ors_transact_full')
    ));
  const canEdit = isSuperAdmin || isO2O ||
    (isInternalStaff && privileges.includes('ors_transact_full'));

  if (!hasContactAccess) {
    return (
      <div style={{ padding: '14px 16px', background: 'hsl(259 44% 97%)', border: '0.5px solid hsl(259 30% 88%)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lock style={{ width: 13, height: 13, color: 'hsl(259 15% 55%)' }} />
        <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>Contact details — restricted. Request access from Super Admin.</p>
      </div>
    );
  }

  const populatedFields = CONTACT_FIELDS.filter(f => values[f.key]?.trim() || editing);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = { ...listing };
      CONTACT_FIELDS.forEach(f => { if (values[f.key]?.trim()) payload[f.key] = values[f.key].trim(); });
      const res = await fetch('/api/ors-transact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!(await res.json()).success) throw new Error('Save failed');
      toast({ title: 'Contact details updated' });
      setEditing(false);
      onUpdated?.();
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' });
    }
    setSaving(false);
  };

  return (
    <div style={{ border: '0.5px solid hsl(259 30% 88%)', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', background: 'hsl(259 44% 96%)', borderBottom: '0.5px solid hsl(259 30% 88%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Phone style={{ width: 12, height: 12, color: '#6141ac' }} />
          <p style={{ fontSize: 11, fontWeight: 700, color: '#1e1537', margin: 0, letterSpacing: '.04em', textTransform: 'uppercase' }}>Contact Details</p>
          <span style={{ fontSize: 9, fontWeight: 700, background: '#6141ac', color: '#fff', padding: '1px 5px', letterSpacing: '.04em' }}>Internal</span>
        </div>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6141ac', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <Edit2 style={{ width: 11, height: 11 }} /> Edit
          </button>
        )}
        {editing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleSave} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#fff', background: '#6141ac', border: 'none', cursor: 'pointer', padding: '4px 10px' }}>
              <Save style={{ width: 11, height: 11 }} /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'hsl(259 15% 50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: 11, height: 11 }} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div style={{ padding: '10px 14px' }}>
        {populatedFields.length === 0 ? (
          <p style={{ fontSize: 12, color: 'hsl(259 15% 55%)', margin: 0 }}>No contact details on record.{canEdit ? ' Click Edit to add.' : ''}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {populatedFields.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'hsl(259 15% 55%)', marginBottom: 3, fontWeight: 600 }}>
                    <Icon style={{ width: 10, height: 10 }} /> {f.label}
                  </label>
                  {editing ? (
                    <input
                      value={values[f.key]}
                      onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ fontSize: 12, padding: '6px 8px', border: '0.5px solid hsl(259 30% 85%)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', borderRadius: 0, width: '100%', outline: 'none' }}
                    />
                  ) : (
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#1e1537', margin: 0 }}>
                      {values[f.key] || <span style={{ color: 'hsl(259 15% 65%)' }}>—</span>}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
