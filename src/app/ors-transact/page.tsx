'use client';
import * as React from 'react';
import { OrsTransactListings } from '@/components/ors-transact-listings';
import { OrsTransactAdminForm } from '@/components/ors-transact-admin-form';
import { useAuth } from '@/contexts/auth-context';
import { Plus } from 'lucide-react';

export default function OrsTransactPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const [showForm, setShowForm] = React.useState(false);

  if (showForm) {
    return (
      <main className="min-h-screen" style={{background:'hsl(259 30% 96%)'}}>
        <div className="max-w-5xl mx-auto px-3 md:px-6 py-6">
          <OrsTransactAdminForm
            onSaved={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{background:'hsl(259 30% 96%)'}}>
      <div style={{background:'linear-gradient(135deg,#1e1537,#3b2870)',padding:'24px 16px 20px'}}>
        <div className="max-w-6xl mx-auto" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
          <div>
            <p style={{fontSize:11,fontWeight:600,color:'hsl(259 44% 70%)',letterSpacing:'.08em',textTransform:'uppercase',margin:'0 0 6px'}}>
              ORS Transact
            </p>
            <h1 style={{fontSize:26,fontWeight:700,color:'#fff',margin:'0 0 6px'}}>
              ORS Transact Listings
            </h1>
            <p style={{fontSize:13,color:'rgba(255,255,255,.5)',margin:0,maxWidth:520}}>
              Warehouse and industrial properties transacted directly through ORS-ONE.
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowForm(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',background:'#6141ac',color:'#fff',border:'none',fontSize:12,fontWeight:600,cursor:'pointer',borderRadius:0,flexShrink:0}}>
              <Plus style={{width:14,height:14}} /> New Listing
            </button>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-3 md:px-6 py-6">
        <OrsTransactListings />
      </div>
    </main>
  );
}
