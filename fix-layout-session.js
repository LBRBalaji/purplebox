const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

content = content.replace(
  `import { Skeleton } from '@/components/ui/skeleton';`,
  `import { Skeleton } from '@/components/ui/skeleton';
import { SessionWatcher } from '@/components/session-watcher';`
);

content = content.replace(
  `  return (
    <>
      <React.Suspense`,
  `  return (
    <>
      <SessionWatcher />
      <React.Suspense`
);

fs.writeFileSync('src/app/dashboard/layout.tsx', content);
console.log('Done!');
