const fs = require('fs');
let content = fs.readFileSync('src/components/payment-requests.tsx', 'utf8');

// Add FileText icon import
content = content.replace(
  `import { CheckCircle, XCircle, Clock, Building2 } from 'lucide-react';`,
  `import { CheckCircle, XCircle, Clock, Building2, FileText, ExternalLink } from 'lucide-react';`
);

// Add View Receipt button in completed section
content = content.replace(
  `                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-primary">₹5,000 + GST</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{req.confirmedAt ? formatDate(req.confirmedAt) : ''}</p>
                </div>`,
  `                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-primary">₹5,000 + GST</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{req.confirmedAt ? formatDate(req.confirmedAt) : ''}</p>
                </div>
                {req.status === 'connected' && (
                  <button onClick={() => {
                    const receiptData = {
                      receiptId: 'RCPT-' + req.id.substring(0,8).toUpperCase(),
                      developer: getDeveloperName(req.developerId),
                      developerId: req.developerId,
                      prospect: req.prospectCompany,
                      listing: getListingName(req.listingId),
                      amount: '₹5,000 + GST',
                      date: req.confirmedAt ? formatDate(req.confirmedAt) : '',
                    };
                    const w = window.open('', '_blank');
                    if (w) w.document.write('<html><head><title>Receipt ' + receiptData.receiptId + '</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px;} table{width:100%;border-collapse:collapse;} td{padding:10px;border-bottom:1px solid #eee;} .primary{color:#6141ac;} .header{background:#6141ac;color:white;padding:20px;border-radius:8px;text-align:center;margin-bottom:24px;} .total{font-size:20px;font-weight:900;color:#6141ac;}</style></head><body><div class="header"><h1 style="margin:0">ORS-ONE</h1><p style="margin:6px 0 0;opacity:0.8;font-size:12px">Lakshmi Balaji ORS Private Limited</p></div><h2>Payment Receipt</h2><table><tr><td style="color:#888">Receipt No.</td><td><b>' + receiptData.receiptId + '</b></td></tr><tr><td style="color:#888">Date</td><td>' + receiptData.date + '</td></tr><tr><td style="color:#888">Billed To</td><td>' + receiptData.developer + '</td></tr><tr><td style="color:#888">Service</td><td>Pay For Purpose — Prospect Connection</td></tr><tr><td style="color:#888">Listing</td><td>' + receiptData.listing + '</td></tr><tr><td style="color:#888">Prospect Industry</td><td>' + receiptData.prospect + '</td></tr><tr><td style="color:#888">Amount</td><td class="total">' + receiptData.amount + '</td></tr></table><p style="color:#888;font-size:12px;text-align:center;margin-top:20px;">For queries: balaji@lakshmibalajio2o.com</p></body></html>');
                  }}
                  className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0">
                    <FileText className="h-3.5 w-3.5" /> Receipt
                  </button>
                )}`
);

fs.writeFileSync('src/components/payment-requests.tsx', content);
console.log('Done!');
