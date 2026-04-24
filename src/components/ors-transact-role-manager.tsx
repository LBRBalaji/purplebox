'use client';
import * as React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ORS_TRANSACT_FIELDS, GROUP_LABELS, DEFAULT_ROLE_GROUPS, DEFAULT_ROLE_CRUD,
  type OrsTransactRole, type FieldGroup, type CrudPermission
} from '@/lib/ors-transact-schema';

const ALL_GROUPS = Object.keys(GROUP_LABELS) as FieldGroup[];
const CRUD_OPTIONS: CrudPermission[] = ['create','read','update','delete'];

const ROLE_COLORS: Record<string, string> = {
  'Field Staff': '#0f6e56',
  'TP': '#185fa5',
  'OP': '#854f0b',
  'BSS': '#6141ac',
  'Customer Relations Executive': '#3b2870',
  'Admin': '#1e1537',
  'SuperAdmin': '#dc2626',
};

interface RoleConfig {
  role: string;
  groups: string[];
  crud: CrudPermission[];
  isCustom?: boolean;
}

export function OrsTransactRoleManager() {
  const { toast } = useToast();
  const [roles, setRoles] = React.useState<RoleConfig[]>(() =>
    (Object.keys(DEFAULT_ROLE_GROUPS) as OrsTransactRole[]).map(r => ({
      role: r,
      groups: DEFAULT_ROLE_GROUPS[r][0] === '*' ? ALL_GROUPS : DEFAULT_ROLE_GROUPS[r] as string[],
      crud: DEFAULT_ROLE_CRUD[r],
    }))
  );
  const [selected, setSelected] = React.useState<string | null>(roles[0]?.role || null);
  const [newRoleName, setNewRoleName] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const currentRole = roles.find(r => r.role === selected);

  const toggleGroup = (group: string) => {
    if (!selected) return;
    setRoles(prev => prev.map(r =>
      r.role !== selected ? r :
      { ...r, groups: r.groups.includes(group) ? r.groups.filter(g => g !== group) : [...r.groups, group] }
    ));
  };

  const toggleCrud = (crud: CrudPermission) => {
    if (!selected) return;
    setRoles(prev => prev.map(r =>
      r.role !== selected ? r :
      { ...r, crud: r.crud.includes(crud) ? r.crud.filter(c => c !== crud) : [...r.crud, crud] }
    ));
  };

  const addRole = () => {
    if (!newRoleName.trim()) return;
    const newRole: RoleConfig = { role: newRoleName.trim(), groups: [], crud: ['read'], isCustom: true };
    setRoles(prev => [...prev, newRole]);
    setSelected(newRole.role);
    setNewRoleName('');
  };

  const deleteRole = (role: string) => {
    setRoles(prev => prev.filter(r => r.role !== role));
    if (selected === role) setSelected(roles[0]?.role || null);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/ors-transact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulk: false, type: 'role_config', roles }),
      });
      toast({ title: 'Role Configuration Saved' });
    } catch { toast({ variant:'destructive', title:'Save failed' }); }
    setSaving(false);
  };

  return (
    <div className="mt-4 space-y-4">
      <div style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)',padding:'12px 16px'}}>
        <p className="text-sm font-bold" style={{color:'#1e1537'}}>ORS Transact — Role & Column Permissions</p>
        <p className="text-xs mt-1" style={{color:'hsl(259 15% 50%)'}}>
          Define which column groups each Team ORS role can access, and which CRUD operations they can perform.
          No user except Admin/SuperAdmin can view all 205 fields in one view.
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16}}>
        {/* Role list */}
        <div>
          <p className="text-xs font-bold mb-2" style={{color:'hsl(259 15% 55%)'}}>ROLES</p>
          <div className="space-y-1">
            {roles.map(r => (
              <div key={r.role} style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'8px 12px',cursor:'pointer',
                background: selected === r.role ? '#6141ac' : 'hsl(259 44% 96%)',
                border: '0.5px solid hsl(259 44% 82%)',
              }} onClick={() => setSelected(r.role)}>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background: ROLE_COLORS[r.role] || '#888',flexShrink:0}} />
                  <span style={{fontSize:12,fontWeight:600,color: selected === r.role ? '#fff' : '#1e1537'}}>{r.role}</span>
                </div>
                {r.isCustom && (
                  <button onClick={e => { e.stopPropagation(); deleteRole(r.role); }}
                    style={{background:'none',border:'none',cursor:'pointer',padding:2,color: selected === r.role ? 'rgba(255,255,255,0.6)' : 'hsl(259 15% 55%)'}}>
                    <Trash2 style={{width:12,height:12}} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add custom role */}
          <div style={{marginTop:10,display:'flex',gap:6}}>
            <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
              placeholder="New role name"
              style={{flex:1,fontSize:11,padding:'6px 8px',border:'0.5px solid hsl(259 30% 82%)',outline:'none'}}
              onKeyDown={e => e.key === 'Enter' && addRole()} />
            <button onClick={addRole}
              style={{padding:'6px 8px',background:'#6141ac',color:'#fff',border:'none',cursor:'pointer'}}>
              <Plus style={{width:12,height:12}} />
            </button>
          </div>
        </div>

        {/* Permission editor */}
        {currentRole && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p className="text-sm font-bold" style={{color:'#1e1537'}}>{currentRole.role} — Permissions</p>
              <button onClick={save} disabled={saving}
                style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:'#6141ac',color:'#fff',fontSize:12,fontWeight:700,border:'none',cursor:'pointer',borderRadius:0}}>
                <Save style={{width:12,height:12}} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* CRUD */}
            <div style={{marginBottom:16}}>
              <p className="text-xs font-bold mb-2" style={{color:'hsl(259 15% 55%)'}}>CRUD PERMISSIONS</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {CRUD_OPTIONS.map(c => (
                  <button key={c} onClick={() => toggleCrud(c)}
                    style={{
                      padding:'5px 14px',fontSize:12,fontWeight:600,cursor:'pointer',
                      background: currentRole.crud.includes(c) ? '#6141ac' : 'hsl(259 44% 96%)',
                      color: currentRole.crud.includes(c) ? '#fff' : '#6141ac',
                      border:'0.5px solid hsl(259 44% 82%)',
                    }}>
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Column groups */}
            <p className="text-xs font-bold mb-2" style={{color:'hsl(259 15% 55%)'}}>COLUMN GROUP ACCESS</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              {ALL_GROUPS.map(grp => {
                const fieldCount = ORS_TRANSACT_FIELDS.filter(f => f.group === grp).length;
                const pubCount = ORS_TRANSACT_FIELDS.filter(f => f.group === grp && f.visibility === 'public').length;
                const active = currentRole.groups.includes(grp);
                return (
                  <button key={grp} onClick={() => toggleGroup(grp)}
                    style={{
                      display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'8px 12px',cursor:'pointer',textAlign:'left',
                      background: active ? 'hsl(259 44% 94%)' : '#fff',
                      border: `0.5px solid ${active ? '#6141ac' : 'hsl(259 30% 88%)'}`,
                    }}>
                    <div>
                      <p style={{fontSize:12,fontWeight:600,color: active ? '#6141ac' : '#555',margin:'0 0 2px'}}>
                        {GROUP_LABELS[grp]}
                      </p>
                      <p style={{fontSize:10,color:'hsl(259 15% 55%)',margin:0}}>
                        {fieldCount} fields · {pubCount} public
                      </p>
                    </div>
                    <span style={{
                      width:18,height:18,borderRadius:'50%',flexShrink:0,
                      background: active ? '#6141ac' : 'transparent',
                      border: `2px solid ${active ? '#6141ac' : 'hsl(259 30% 75%)'}`,
                      display:'flex',alignItems:'center',justifyContent:'center',
                    }}>
                      {active && <span style={{width:8,height:8,borderRadius:'50%',background:'#fff'}} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
