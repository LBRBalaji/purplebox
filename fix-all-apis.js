const fs = require('fs');
const path = require('path');

const apis = [
  'layout-requests','tenant-improvements','agent-leads','share-history',
  'view-history','about-us-content','transaction-activities','download-history',
  'negotiation-boards','location-circles','download-acknowledgments','submissions',
  'users','community-posts','demands'
];

apis.forEach(api => {
  const filePath = path.join('src/app/api', api, 'route.ts');
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes("snapshot.docs.map(d => d.ref.delete())")) return;

  const postStart = content.indexOf('export async function POST');
  if (postStart === -1) return;

  const newPost = `export async function POST(request) {
  try {
    const newData = await request.json();
    const payload = Array.isArray(newData) ? { data: newData } : (typeof newData === 'object' ? newData : { value: newData });
    await getDb().collection(COLLECTION).doc('0').set(payload);
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}`;

  content = content.substring(0, postStart) + newPost;
  fs.writeFileSync(filePath, content);
  console.log('Fixed:', api);
});
console.log('All done!');
