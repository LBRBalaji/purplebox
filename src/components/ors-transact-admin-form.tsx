'use client';
import * as React from 'react';
import { ORS_TRANSACT_FIELDS, GROUP_LABELS, type FieldGroup, type OrsTransactListing } from '@/lib/ors-transact-schema';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

const S: React.CSSProperties = {
  fontSize: 12, padding: '7px 10px', border: '0.5px solid hsl(259 30% 85%)',
  background: 'var(--color-background-primary)', color: 'var(--color-text-primary)',
  borderRadius: 0, width: '100%', outline: 'none',
};

const GROUPS_ORDER: FieldGroup[] = [
  'identity', 'location', 'size', 'facility_type', 'building',
  'shopfloor', 'utilities', 'amenities', 'compliance', 'distances',
  'commercial', 'advertisement', 'telecalling', 'site_inspection', 'other',
];

interface Props {
  existing?: OrsTransactListing;
  onSaved?: (id: string) => void;
  onCancel?: () => void;
}

export function OrsTransactAdminForm({ existing, onSaved, onCancel }: Props) {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ORS_TRANSACT_FIELDS.forEach(f => {
      init[f.key] = existing ? (String(existing[f.key] || '')) : '';
    });
    init['listingMode'] = existing?.listingMode || 'ors_transact';
    return init;
  });
  const [pictureUrls, setPictureUrls] = React.useState<string[]>(existing?.pictureUrls || ['']);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<FieldGroup>>(
    new Set(['identity', 'location', 'size', 'facility_type', 'building'])
  );
  const [saving, setSaving] = React.useState(false);

  const set = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));
  const toggleGroup = (g: FieldGroup) => setExpandedGroups(prev => {
    const n = new Set(prev);
    n.has(g) ? n.delete(g) : n.add(g);
    return n;
  });

  const fieldsByGroup = React.useMemo(() => {
    const map: Record<string, typeof ORS_TRANSACT_FIELDS> = {};
    ORS_TRANSACT_FIELDS.forEach(f => {
      if (!map[f.group]) map[f.group] = [];
      map[f.group].push(f);
    });
    return map;
  }, []);

  const handleSave = async () => {
    if (!values['ors_property_id']?.trim()) {
      toast({ variant: 'destructive', title: 'ORS Property ID required' }); return;
    }
    setSaving(true);
    const payload: Record<string, any> = { listingMode: values['listingMode'] || 'ors_transact' };
    ORS_TRANSACT_FIELDS.forEach(f => {
      if (values[f.key]?.trim()) payload[f.key] = values[f.key].trim();
    });
    const urls = pictureUrls.filter(u => u.trim());
    if (urls.length) payload['pictureUrls'] = urls;

    try {
      const res = await fetch('/api/ors-transact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: existing ? 'Listing Updated' : 'Listing Created', description: `ORS ID: ${values['ors_property_id']}` });
        onSaved?.(data.id);
      } else throw new Error(data.error);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e.message });
    }
    setSaving(false);
  };

  const filledCount = ORS_TRANSACT_FIELDS.filter(f => values[f.key]?.trim()).length;
  const totalCount = ORS_TRANSACT_FIELDS.length;

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ background: '#1e1537', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
            {existing ? `Edit — ${existing.ors_property_id}` : 'Create ORS Transact Listing'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', margin: '3px 0 0' }}>
            {filledCount} / {totalCount} fields filled · Admin only
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCancel && (
            <button onClick={onCancel}
              style={{ padding: '7px 14px', background: 'transparent', color: 'rgba(255,255,255,.5)', border: '0.5px solid rgba(255,255,255,.2)', fontSize: 12, cursor: 'pointer', borderRadius: 0 }}>
              Cancel
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '7px 16px', background: saving ? 'hsl(259 30% 55%)' : '#6141ac', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save style={{ width: 13, height: 13 }} /> {saving ? 'Saving...' : 'Save Listing'}
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ marginBottom: 14, padding: '10px 14px', background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 44% 82%)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>Listing Mode</p>
        {['ors_transact', 'dual'].map(m => (
          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="radio" name="mode" value={m} checked={values['listingMode'] === m}
              onChange={() => set('listingMode', m)} style={{ accentColor: '#6141ac' }} />
            <span style={{ fontSize: 12, color: '#1e1537', fontWeight: values['listingMode'] === m ? 600 : 400 }}>
              {m === 'ors_transact' ? 'ORS Transact Only' : 'Direct Deal + ORS Transact'}
            </span>
          </label>
        ))}
      </div>

      {/* Picture URLs */}
      <div style={{ marginBottom: 14, padding: '12px 14px', background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 88%)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e1537', margin: '0 0 8px' }}>Picture URLs</p>
        {pictureUrls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input value={url} onChange={e => {
              const u = [...pictureUrls]; u[i] = e.target.value; setPictureUrls(u);
            }} placeholder={`https://drive.google.com/...  (Picture ${i + 1})`} style={{ ...S, flex: 1 }} />
            {pictureUrls.length > 1 && (
              <button onClick={() => setPictureUrls(prev => prev.filter((_, idx) => idx !== i))}
                style={{ padding: '0 8px', background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 44% 82%)', cursor: 'pointer', color: '#6141ac', borderRadius: 0 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setPictureUrls(prev => [...prev, ''])}
          style={{ fontSize: 11, color: '#6141ac', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <Plus style={{ width: 12, height: 12 }} /> Add picture URL
        </button>
      </div>

      {/* Field groups */}
      {GROUPS_ORDER.map(group => {
        const fields = fieldsByGroup[group];
        if (!fields?.length) return null;
        const filled = fields.filter(f => values[f.key]?.trim()).length;
        const isOpen = expandedGroups.has(group);
        return (
          <div key={group} style={{ marginBottom: 8, border: '0.5px solid hsl(259 30% 88%)', background: 'var(--color-background-primary)' }}>
            {/* Group header */}
            <button onClick={() => toggleGroup(group)}
              style={{ width: '100%', padding: '10px 14px', background: isOpen ? 'hsl(259 44% 96%)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isOpen ? <ChevronDown style={{ width: 14, height: 14, color: '#6141ac' }} /> : <ChevronRight style={{ width: 14, height: 14, color: 'hsl(259 15% 55%)' }} />}
                <span style={{ fontSize: 12, fontWeight: 600, color: isOpen ? '#6141ac' : '#1e1537' }}>
                  {GROUP_LABELS[group]}
                </span>
              </div>
              <span style={{ fontSize: 11, color: filled > 0 ? '#6141ac' : 'hsl(259 15% 65%)' }}>
                {filled}/{fields.length} filled
              </span>
            </button>

            {/* Fields */}
            {isOpen && (
              <div style={{ padding: '10px 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                {fields.map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 10, color: f.visibility === 'internal' ? '#6141ac' : 'hsl(259 15% 50%)', marginBottom: 3, fontWeight: f.visibility === 'internal' ? 600 : 400 }}>
                      {f.label}
                      {f.visibility === 'internal' && <span style={{ marginLeft: 4, fontSize: 9, background: 'hsl(259 44% 88%)', color: '#6141ac', padding: '1px 4px' }}>Internal</span>}
                      {f.level === 1 && <span style={{ marginLeft: 4, fontSize: 9, background: '#f0fdf4', color: '#15803d', padding: '1px 4px' }}>Card</span>}
                    </label>
                    <input
                      value={values[f.key] || ''}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.label.split(' - ')[0]}
                      style={{ ...S, borderColor: values[f.key]?.trim() ? 'hsl(259 44% 75%)' : 'hsl(259 30% 85%)' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Bottom save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
        {onCancel && (
          <button onClick={onCancel} style={{ padding: '9px 20px', background: 'hsl(259 44% 94%)', color: '#6141ac', border: '0.5px solid hsl(259 44% 80%)', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 0 }}>
            Cancel
          </button>
        )}
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '9px 24px', background: saving ? 'hsl(259 30% 55%)' : '#6141ac', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save style={{ width: 13, height: 13 }} /> {saving ? 'Saving...' : 'Save Listing'}
        </button>
      </div>
    </div>
  );
}
