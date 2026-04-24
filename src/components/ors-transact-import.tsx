'use client';
import * as React from 'react';
import { ORS_TRANSACT_FIELDS } from '@/lib/ors-transact-schema';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  result.push(cur.trim());
  return result;
}

export function OrsTransactImport() {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<any[]>([]);
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState<{done:number;total:number;errors:number} | null>(null);
  const [done, setDone] = React.useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    setProgress(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const headerRow0 = parseCSVLine(lines[0]); // Public/Internal
      const headerRow1 = parseCSVLine(lines[1]); // Labels
      const dataLines = lines.slice(2, 7); // Preview first 5

      const rows = dataLines.map(line => {
        const vals = parseCSVLine(line);
        const obj: Record<string, string> = {};
        ORS_TRANSACT_FIELDS.forEach(f => {
          const v = vals[f.idx] || '';
          if (v && v.toLowerCase() !== 'null') obj[f.key] = v;
        });
        return obj;
      }).filter(r => r.ors_property_id);

      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setProgress({ done: 0, total: 0, errors: 0 });

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const dataLines = lines.slice(2);
      const total = dataLines.length;
      setProgress({ done: 0, total, errors: 0 });

      const CHUNK = 400; // Firestore batch limit
      let done = 0, errors = 0;

      for (let i = 0; i < dataLines.length; i += CHUNK) {
        const chunk = dataLines.slice(i, i + CHUNK);
        const listings = chunk.map(line => {
          const vals = parseCSVLine(line);
          const obj: Record<string, any> = {
            listingMode: 'ors_transact',
            createdAt: new Date().toISOString(),
          };
          ORS_TRANSACT_FIELDS.forEach(f => {
            const v = (vals[f.idx] || '').trim();
            if (v && v.toLowerCase() !== 'null') obj[f.key] = v;
          });
          return obj;
        }).filter(r => r.ors_property_id);

        try {
          const res = await fetch('/api/ors-transact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bulk: true, listings }),
          });
          const data = await res.json();
          done += data.imported || listings.length;
          errors += data.skipped || 0;
        } catch {
          errors += chunk.length;
        }
        setProgress({ done, total, errors });
      }

      setImporting(false);
      setDone(true);
      toast({ title: `Import Complete`, description: `${done.toLocaleString()} listings imported. ${errors} skipped.` });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 mt-4">
      <div style={{background:'hsl(259 44% 96%)',border:'1px solid hsl(259 44% 82%)',padding:'12px 16px'}}>
        <p className="text-sm font-bold" style={{color:'#1e1537'}}>ORS Transact — Bulk Import</p>
        <p className="text-xs mt-1" style={{color:'hsl(259 15% 50%)',lineHeight:1.6}}>
          Upload the ORS 2019 Master CSV. Row 1 = Public/Internal, Row 2 = Headers, Row 3+ = Data.
          All 9,422 records will be imported into Firestore as ORS Transact listings.
          <strong className="text-red-600 block mt-1"> Admin and Super Admin only. This action cannot be undone.</strong>
        </p>
      </div>

      <label style={{display:'flex',alignItems:'center',gap:10,padding:'16px',border:'1.5px dashed hsl(259 44% 75%)',cursor:'pointer',background:'hsl(259 44% 98%)'}}>
        <Upload style={{width:20,height:20,color:'#6141ac'}} />
        <div>
          <p className="text-sm font-semibold" style={{color:'#1e1537'}}>{file ? file.name : 'Click to select CSV file'}</p>
          <p className="text-xs" style={{color:'hsl(259 15% 55%)'}}>ORS_2019_Master CSV format only</p>
        </div>
        <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </label>

      {/* Preview */}
      {preview.length > 0 && (
        <div>
          <p className="text-xs font-bold mb-2" style={{color:'#1e1537'}}>Preview (first 5 records)</p>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead>
                <tr style={{background:'hsl(259 44% 94%)'}}>
                  {['ORS ID','City','District','Facility Type','Size (sft)','Ceiling (ft)'].map(h => (
                    <th key={h} style={{padding:'6px 8px',textAlign:'left',color:'#6141ac',fontWeight:600}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} style={{borderBottom:'0.5px solid hsl(259 30% 90%)'}}>
                    <td style={{padding:'5px 8px',color:'#1e1537'}}>{row.ors_property_id}</td>
                    <td style={{padding:'5px 8px',color:'#555'}}>{row.city_location}</td>
                    <td style={{padding:'5px 8px',color:'#555'}}>{row.district}</td>
                    <td style={{padding:'5px 8px',color:'#555'}}>{row.facility_type}</td>
                    <td style={{padding:'5px 8px',color:'#555'}}>{row.lease_area_as_advertised_in_sq_ft}</td>
                    <td style={{padding:'5px 8px',color:'#555'}}>{row.center_ceiling_height_in_feet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress */}
      {progress && (
        <div style={{padding:'12px 16px',background: done ? '#f0fdf4' : 'hsl(259 44% 96%)',border:`1px solid ${done ? '#bbf7d0' : 'hsl(259 44% 82%)'}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            {done ? <CheckCircle2 style={{width:16,height:16,color:'#15803d'}} /> : <Loader2 style={{width:16,height:16,color:'#6141ac',animation:'spin 1s linear infinite'}} />}
            <p className="text-sm font-bold" style={{color: done ? '#15803d' : '#1e1537'}}>
              {done ? 'Import complete' : 'Importing...'}
            </p>
          </div>
          <div style={{background:'rgba(0,0,0,0.08)',height:6,borderRadius:3,overflow:'hidden'}}>
            <div style={{background:done ? '#15803d' : '#6141ac',height:'100%',width:`${progress.total ? (progress.done/progress.total)*100 : 0}%`,transition:'width 0.3s'}} />
          </div>
          <p className="text-xs mt-2" style={{color:'hsl(259 15% 50%)'}}>
            {progress.done.toLocaleString()} / {progress.total.toLocaleString()} records
            {progress.errors > 0 && <span style={{color:'#dc2626'}}> · {progress.errors} errors</span>}
          </p>
        </div>
      )}

      {file && !importing && !done && preview.length > 0 && (
        <button onClick={handleImport}
          style={{width:'100%',padding:'11px',background:'#6141ac',color:'#fff',fontSize:13,fontWeight:700,border:'none',cursor:'pointer',borderRadius:0,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          <Upload style={{width:16,height:16}} />
          Import All Records into Firestore
        </button>
      )}
    </div>
  );
}
