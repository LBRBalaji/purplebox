'use client';
import * as React from 'react';
import { ORS_TRANSACT_FIELDS, GROUP_LABELS, type FieldGroup, type OrsTransactListing } from '@/lib/ors-transact-schema';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, X, ChevronDown, ChevronRight, Archive, RotateCcw } from 'lucide-react';

// ── Field type definitions ────────────────────────────────────────────────────
type FieldType = 'text' | 'number' | 'select' | 'toggle' | 'textarea';

interface FieldMeta {
  type: FieldType;
  options?: string[];
  unit?: string;
}

const FIELD_META: Record<string, FieldMeta> = {
  // Selects with known options (cleaned from CSV)
  facility_type: { type: 'select', options: ['Warehouse', 'Industrial Building', 'VLR-Vacant Land Rental', 'Cold Storage', 'BTS', 'Built to Suit', 'PEB-Pre Engineered Building'] },
  building_availability: { type: 'select', options: ['Available', 'Leased Out', 'Notice Period', 'On Hold', 'FIR_Pending', 'Tele_Validation Pending'] },
  state: { type: 'select', options: ['Tamilnadu', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Gujarat'] },
  country: { type: 'select', options: ['India'] },
  floor_offered: { type: 'select', options: ['Ground Floor Only', 'G', 'G + I', 'G + I + II', 'G + I + II + III', 'G + II', 'G + III', 'I', 'I + II', 'II', 'III'] },
  shop_floor_ceiling_type: { type: 'select', options: ['RCC', 'ACC', 'ACC/RCC', 'GI Sheet', 'Galvalume Insulated with Transparent Lighting Sheet', 'Galvalume Non Insulated with Transparent Lighting Sheet', 'STANDING SEAM'] },
  shutters_type: { type: 'select', options: ['Manual', 'Manual with Lever', 'Automatic'] },
  exclusivity: { type: 'select', options: ['Exclusive', 'Independent Unit in a Large Project', 'Shared Facility'] },
  land_zone_classification: { type: 'select', options: ['Industrial Zone', 'Commercial Zone', 'Residential Zone'] },
  is_building_approved: { type: 'select', options: ['Approval Available', 'Awaiting for Approval', 'No Approval Obtained'] },
  plot_facing: { type: 'select', options: ['North', 'South', 'East', 'West', 'South East', 'South West', 'North West'] },
  building_facility_main_entrance_facing: { type: 'select', options: ['North', 'South', 'East', 'West', 'North West', 'South East', 'South West'] },
  telecalling_status: { type: 'select', options: ['Not Done', 'Done', 'No Response', 'Not Reachable', 'Incorrect Number', 'Number Does not exist'] },
  advertised_by: { type: 'select', options: ['Owner', 'Developer', 'Broker'] },
  site_category: { type: 'select', options: ['Private Land', 'Industrial Estate - Promoted by SIDCO'] },
  ownership: { type: 'select', options: ['Freehold', 'Leasehold'] },
  rail_connectivity: { type: 'select', options: ['Available', 'Not Available'] },
  // Toggles (Provided / Not Provided)
  crane: { type: 'toggle', options: ['Provided', 'Not Provided'] },
  ramp_for_forklift: { type: 'toggle', options: ['Provided', 'Not Provided'] },
  exhaust_fan: { type: 'toggle', options: ['Provided', 'Not Provided'] },
  is_loading_area_covered_with_canopy: { type: 'toggle', options: ['Yes', 'No'] },
  rain_water_harvesting_system: { type: 'toggle', options: ['Available', 'Not Available'] },
  etp_effluent_treatment_plant_availability: { type: 'toggle', options: ['Available', 'Not Available'] },
  r_o_plant: { type: 'toggle', options: ['Available', 'Not Available'] },
  provision_to_install_crane: { type: 'toggle', options: ['Yes', 'No'] },
  is_industrial_lamps_provided: { type: 'toggle', options: ['Yes', 'No'] },
  generator_room: { type: 'toggle', options: ['Available', 'Not Available'] },
  power_transformer_availability: { type: 'toggle', options: ['Available', 'Not Available'] },
  power_room_availability: { type: 'toggle', options: ['Available', 'Not Available'] },
  compressed_air_lines_in_shop_floor: { type: 'toggle', options: ['Available', 'Not Available'] },
  avaialability_of_government_water: { type: 'toggle', options: ['Available', 'Not Available'] },
  scalability: { type: 'toggle', options: ['Available', 'Not Available'] },
  back_up_power_availability: { type: 'toggle', options: ['Provided', 'Not Provided', 'Can be provided at additional rent'] },
  pillars_columns: { type: 'toggle', options: ['Pillerless / Columnless', 'With Pillars / Column'] },
  feasibility_of_truck_movement_around_facility: { type: 'toggle', options: ['Feasible', 'Not Feasible'] },
  truck_parking_facility_for_40_feet_containers: { type: 'toggle', options: ['Available', 'Not Available'] },
  // Numbers with units
  lease_area_as_advertised_in_sq_ft: { type: 'number', unit: 'sft' },
  total_built_up_area_in_sq_ft: { type: 'number', unit: 'sft' },
  center_ceiling_height_in_feet: { type: 'number', unit: 'ft' },
  shop_floor_side_eve_height_in_feet: { type: 'number', unit: 'ft' },
  shop_floor_height_below_beam_truss_in_feet: { type: 'number', unit: 'ft' },
  electricty_power_availability_in_kva: { type: 'number', unit: 'KVA' },
  electricty_power_available_capacity_in_kva: { type: 'number', unit: 'KVA' },
  backup_power_available_capacity_in_kva: { type: 'number', unit: 'KVA' },
  power_transformer_available_capacity_in_kva: { type: 'number', unit: 'KVA' },
  floor_load_bearing_capacity_in_metric_ton_per_sq_mt: { type: 'number', unit: 'MT/m²' },
  span_between_pillars_in_feet: { type: 'number', unit: 'ft' },
  monthly_rent_per_sq_ft: { type: 'number', unit: '₹/sft' },
  maintenance_charges_per_sq_ft: { type: 'number', unit: '₹/sft' },
  rental_escalation_percentage: { type: 'number', unit: '%' },
  rental_escalation_duration_in_years: { type: 'number', unit: 'yrs' },
  rent_free_fitment_period_in_days: { type: 'number', unit: 'days' },
  width_of_the_road_in_front_of_the_site_in_feet: { type: 'number', unit: 'ft' },
  age_of_the_building_in_years: { type: 'number', unit: 'yrs' },
  tentative_possession_schedule_in_months: { type: 'number', unit: 'mo' },
  borewell_capacity: { type: 'number', unit: 'lph' },
  water_sump_capacity_in_kilo_litres: { type: 'number', unit: 'KL' },
  over_head_tank_capacity_in_kilo_litres: { type: 'number', unit: 'KL' },
  septic_tank_capacity_in_litres: { type: 'number', unit: 'L' },
  // Distance fields
  distance_from_chennai_port_in_km: { type: 'number', unit: 'km' },
  distance_from_ennore_port_in_km: { type: 'number', unit: 'km' },
  distance_from_krishnapattinam_port_in_km: { type: 'number', unit: 'km' },
  distance_from_karaikal_port_in_km: { type: 'number', unit: 'km' },
  distance_from_chennai_airport_in_km: { type: 'number', unit: 'km' },
  distance_from_oragadam_in_km: { type: 'number', unit: 'km' },
  distance_from_sriperumbudur_in_km: { type: 'number', unit: 'km' },
  distance_from_ford_maraimalai_nagar_in_km: { type: 'number', unit: 'km' },
  distance_from_mahindra_world_city_in_km: { type: 'number', unit: 'km' },
  kathipara_junction_inner_ring_road_entry_point_in_km: { type: 'number', unit: 'km' },
  koyambedu_inner_ring_road_point_2_in_km: { type: 'number', unit: 'km' },
  padi_junction_inner_ring_road_point_3_in_km: { type: 'number', unit: 'km' },
  madhavaram_inner_ring_road_point_4_in_km: { type: 'number', unit: 'km' },
  manali_inner_ring_road_exit_point_in_km: { type: 'number', unit: 'km' },
  tambaram_by_pass_road_entry_point_in_km: { type: 'number', unit: 'km' },
  maduravoyal_by_pass_road_point_2_in_km: { type: 'number', unit: 'km' },
  ambattur_industrial_estate_by_pass_road_point_3_in_km: { type: 'number', unit: 'km' },
  puzhal_by_pass_road_exit_point_in_km: { type: 'number', unit: 'km' },
  vandalur_outer_ring_road_entry_point_in_km: { type: 'number', unit: 'km' },
  poonamallee_outer_ring_road_point_2_in_km: { type: 'number', unit: 'km' },
  nemili_outer_ring_road_point_3_in_km: { type: 'number', unit: 'km' },
  nemili_outer_ring_road_point_4_in_km: { type: 'number', unit: 'km' },
  minjur_outer_ring_road_exit_point_in_km: { type: 'number', unit: 'km' },
  distance_from_existing_facility_or_client_specific_location: { type: 'number', unit: 'km' },
};

const baseStyle: React.CSSProperties = {
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

// ── Smart field renderer ──────────────────────────────────────────────────────
function SmartField({ fieldKey, label, value, onChange, visibility, level }: {
  fieldKey: string; label: string; value: string;
  onChange: (v: string) => void; visibility: string; level: number;
}) {
  const meta = FIELD_META[fieldKey];
  const isInternal = visibility === 'internal';
  const isCard = level === 1;

  const labelEl = (
    <label style={{ display: 'block', fontSize: 10, color: isInternal ? '#6141ac' : 'hsl(259 15% 50%)', marginBottom: 3, fontWeight: isInternal ? 600 : 400 }}>
      {label}
      {isInternal && <span style={{ marginLeft: 4, fontSize: 9, background: 'hsl(259 44% 88%)', color: '#6141ac', padding: '1px 4px' }}>Internal</span>}
      {isCard && <span style={{ marginLeft: 4, fontSize: 9, background: '#f0fdf4', color: '#15803d', padding: '1px 4px' }}>Card</span>}
      {meta?.unit && <span style={{ marginLeft: 4, fontSize: 9, color: 'hsl(259 15% 60%)', background: 'hsl(259 30% 94%)', padding: '1px 4px' }}>{meta.unit}</span>}
    </label>
  );

  if (meta?.type === 'toggle' && meta.options) {
    return (
      <div>
        {labelEl}
        <div style={{ display: 'flex', gap: 0 }}>
          {meta.options.map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              style={{
                flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                background: value === opt ? '#6141ac' : 'hsl(259 44% 97%)',
                color: value === opt ? '#fff' : 'hsl(259 15% 45%)',
                border: '0.5px solid hsl(259 30% 85%)',
                borderLeft: opt === meta.options![0] ? '0.5px solid hsl(259 30% 85%)' : 'none',
              }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (meta?.type === 'select' && meta.options) {
    return (
      <div>
        {labelEl}
        <select value={value} onChange={e => onChange(e.target.value)} style={baseStyle}>
          <option value="">— Select —</option>
          {meta.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  if (meta?.type === 'number') {
    return (
      <div>
        {labelEl}
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{ ...baseStyle, borderColor: value ? 'hsl(259 44% 75%)' : 'hsl(259 30% 85%)' }} />
      </div>
    );
  }

  return (
    <div>
      {labelEl}
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={label.split(' - ')[0]}
        style={{ ...baseStyle, borderColor: value ? 'hsl(259 44% 75%)' : 'hsl(259 30% 85%)' }} />
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function OrsTransactAdminForm({ existing, onSaved, onCancel }: Props) {
  const { toast } = useToast();

  // All state at top — no conditional returns
  const [values, setValues] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    ORS_TRANSACT_FIELDS.forEach(f => { init[f.key] = existing ? (String(existing[f.key] || '')) : ''; });
    init['listingMode'] = existing?.listingMode || 'ors_transact';
    return init;
  });
  const [pictureUrls, setPictureUrls] = React.useState<string[]>(existing?.pictureUrls || ['']);
  const [expandedGroups, setExpandedGroups] = React.useState<Set<FieldGroup>>(
    new Set(['identity', 'location', 'size', 'facility_type', 'building'])
  );
  const [saving, setSaving] = React.useState(false);
  const [archiving, setArchiving] = React.useState(false);

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

  const filledCount = React.useMemo(
    () => ORS_TRANSACT_FIELDS.filter(f => values[f.key]?.trim()).length,
    [values]
  );

  const handleSave = async () => {
    if (!values['ors_property_id']?.trim()) {
      toast({ variant: 'destructive', title: 'ORS Property ID required' }); return;
    }
    setSaving(true);
    const payload: Record<string, any> = {
      listingMode: values['listingMode'] || 'ors_transact',
      isArchived: existing?.isArchived || false,
    };
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
        toast({ title: existing ? 'Listing Updated' : 'Listing Created', description: values['ors_property_id'] });
        onSaved?.(data.id);
      } else throw new Error(data.error);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: e.message });
    }
    setSaving(false);
  };

  const handleArchive = async () => {
    if (!existing?.id) return;
    setArchiving(true);
    try {
      await fetch('/api/ors-transact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...existing, isArchived: !existing.isArchived }),
      });
      toast({ title: existing.isArchived ? 'Listing Restored' : 'Listing Archived' });
      onSaved?.(existing.id);
    } catch {
      toast({ variant: 'destructive', title: 'Action failed' });
    }
    setArchiving(false);
  };

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ background: '#1e1537', padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
            {existing ? `Edit — ${existing.ors_property_id}` : 'Create ORS Transact Listing'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', margin: '3px 0 0' }}>
            {filledCount} / {ORS_TRANSACT_FIELDS.length} fields filled · Admin only
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {existing && (
            <button onClick={handleArchive} disabled={archiving}
              style={{ padding: '7px 12px', background: existing.isArchived ? '#15803d' : 'transparent', color: existing.isArchived ? '#fff' : 'rgba(255,255,255,.5)', border: `0.5px solid ${existing.isArchived ? '#15803d' : 'rgba(255,255,255,.2)'}`, fontSize: 12, cursor: 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              {existing.isArchived ? <><RotateCcw style={{width:12,height:12}}/> Restore</> : <><Archive style={{width:12,height:12}}/> Archive</>}
            </button>
          )}
          {onCancel && (
            <button onClick={onCancel}
              style={{ padding: '7px 14px', background: 'transparent', color: 'rgba(255,255,255,.5)', border: '0.5px solid rgba(255,255,255,.2)', fontSize: 12, cursor: 'pointer', borderRadius: 0 }}>
              Cancel
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '7px 16px', background: saving ? 'hsl(259 30% 55%)' : '#6141ac', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save style={{ width: 13, height: 13 }} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Archived banner */}
      {existing?.isArchived && (
        <div style={{ padding: '10px 14px', background: '#fef9c3', border: '0.5px solid #fde047', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Archive style={{ width: 14, height: 14, color: '#92400e' }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', margin: 0 }}>This listing is archived — not visible to public</p>
          </div>
          <button onClick={handleArchive}
            style={{ fontSize: 11, fontWeight: 700, color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <RotateCcw style={{ width: 12, height: 12 }} /> Restore to active
          </button>
        </div>
      )}

      {/* Mode selector */}
      <div style={{ marginBottom: 12, padding: '10px 14px', background: 'hsl(259 44% 96%)', border: '0.5px solid hsl(259 44% 82%)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: '#1e1537', margin: 0 }}>Listing Mode</p>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['ors_transact', 'ORS Transact Only'], ['dual', 'Direct Deal + ORS Transact']].map(([m, label]) => (
            <button key={m} type="button" onClick={() => set('listingMode', m)}
              style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: values['listingMode'] === m ? '#6141ac' : 'hsl(259 44% 97%)', color: values['listingMode'] === m ? '#fff' : 'hsl(259 15% 45%)', border: '0.5px solid hsl(259 44% 82%)', borderLeft: m === 'ors_transact' ? '0.5px solid hsl(259 44% 82%)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Picture URLs */}
      <div style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--color-background-primary)', border: '0.5px solid hsl(259 30% 88%)' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#1e1537', margin: '0 0 8px' }}>Picture URLs</p>
        {pictureUrls.map((url, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input value={url} onChange={e => {
              const u = [...pictureUrls]; u[i] = e.target.value; setPictureUrls(u);
            }} placeholder={`https://drive.google.com/...  (Picture ${i + 1})`}
              style={{ ...baseStyle, flex: 1 }} />
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
            <button onClick={() => toggleGroup(group)} type="button"
              style={{ width: '100%', padding: '10px 14px', background: isOpen ? 'hsl(259 44% 96%)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isOpen
                  ? <ChevronDown style={{ width: 14, height: 14, color: '#6141ac' }} />
                  : <ChevronRight style={{ width: 14, height: 14, color: 'hsl(259 15% 55%)' }} />}
                <span style={{ fontSize: 12, fontWeight: 600, color: isOpen ? '#6141ac' : '#1e1537' }}>
                  {GROUP_LABELS[group]}
                </span>
              </div>
              <span style={{ fontSize: 11, color: filled > 0 ? '#6141ac' : 'hsl(259 15% 65%)' }}>
                {filled}/{fields.length} filled
              </span>
            </button>

            {isOpen && (
              <div style={{ padding: '10px 14px 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                {fields.map(f => (
                  <SmartField
                    key={f.key}
                    fieldKey={f.key}
                    label={f.label}
                    value={values[f.key] || ''}
                    onChange={v => set(f.key, v)}
                    visibility={f.visibility}
                    level={f.level}
                  />
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
