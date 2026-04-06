const fs = require('fs');
let content = fs.readFileSync('src/components/prospects-tab.tsx', 'utf8');

content = content.replace(
  `import { Eye, CheckCircle, Clock, Building2 } from 'lucide-react';`,
  `import { Eye, CheckCircle, Clock, Building2, Warehouse } from 'lucide-react';`
);

content = content.replace(
  `        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-primary">
          {getInitials(prospect.industryType || '')}
        </div>`,
  `        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-primary">
          {prospect.industryType && prospect.industryType !== 'Unknown Industry'
            ? getInitials(prospect.industryType)
            : <Warehouse className="h-4 w-4 text-primary" />}
        </div>`
);

content = content.replace(
  `<p className="text-sm font-bold text-foreground truncate">{prospect.industryType || 'Industry Not Specified'}</p>`,
  `<p className="text-sm font-bold text-foreground truncate">{prospect.industryType && prospect.industryType !== 'Unknown Industry' ? prospect.industryType : 'Verified Prospect'}</p>`
);

fs.writeFileSync('src/components/prospects-tab.tsx', content);
console.log('Done!');
