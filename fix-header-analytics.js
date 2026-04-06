const fs = require('fs');
let content = fs.readFileSync('src/components/header.tsx', 'utf8');

content = content.replace(
  `      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/listings-performance">Listing Performance</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/customer">Customer Engagement</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/traffic">Platform Traffic</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/community">Community Analytics</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/predictive"><Sparkles className="mr-2 h-4 w-4" /> Predictive Analytics</Link></DropdownMenuItem>
      </DropdownMenuContent>`,
  `      <DropdownMenuContent align="start" className="rounded-xl border-border w-56">
        <DropdownMenuItem asChild><Link href="/dashboard/analytics"><BarChart className="mr-2 h-4 w-4" /> Analytics Hub</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link href="/dashboard/analytics/predictive"><Sparkles className="mr-2 h-4 w-4" /> AI Predictive Analytics</Link></DropdownMenuItem>
      </DropdownMenuContent>`
);

fs.writeFileSync('src/components/header.tsx', content);
console.log('Done!');
