import { OrsTransactListings } from '@/components/ors-transact-listings';

export default function OrsTransactPage() {
  return (
    <main className="min-h-screen" style={{background:'hsl(259 30% 96%)'}}>
      <div style={{background:'linear-gradient(135deg,#1e1537,#3b2870)',padding:'32px 24px 28px'}}>
        <div className="max-w-6xl mx-auto">
          <p style={{fontSize:11,fontWeight:600,color:'hsl(259 44% 70%)',letterSpacing:'.08em',textTransform:'uppercase',margin:'0 0 6px'}}>
            ORS Transact
          </p>
          <h1 style={{fontSize:26,fontWeight:700,color:'#fff',margin:'0 0 6px'}}>
            ORS Transact Listings
          </h1>
          <p style={{fontSize:13,color:'rgba(255,255,255,.5)',margin:0,maxWidth:520}}>
            Warehouse and industrial properties from the ORS inventory. Contact ORS-ONE to confirm availability and initiate the leasing process.
          </p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <OrsTransactListings />
      </div>
    </main>
  );
}
