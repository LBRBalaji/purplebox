const fs = require('fs');
const path = require('path');

const apis = [
  'layout-requests','tenant-improvements','agent-leads','share-history',
  'view-history','about-us-content','transaction-activities','download-history',
  'negotiation-boards','location-circles','download-acknowledgments','submissions',
  'users','community-posts','demands','listings','registered-leads',
  'listing-analytics','notifications'
];

apis.forEach(api => {
  const filePath = path.join('src/app/api', api, 'route.ts');
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix GET - restore original collection scan
  content = content.replace(
    `export async function GET() {
  try {
    const docSnap = await getDb().collection(COLLECTION).doc('0').get();
    if (docSnap.exists) {
      const d = docSnap.data();
      return NextResponse.json(Array.isArray(d?.data) ? d.data : d || {}, { headers });
    }
    return NextResponse.json(Array.isArray([]) ? [] : {}, { headers });
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}`,
    `export async function GET() {
  try {
    const snapshot = await getDb().collection(COLLECTION).get();
    const allNumeric = snapshot.docs.every(d => d.id.match(/^[0-9]+$/));
    if (allNumeric) {
      const data = snapshot.docs
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map(d => d.data());
      return NextResponse.json(data, { headers });
    } else {
      const data = {};
      snapshot.forEach(d => { data[d.id] = d.data(); });
      return NextResponse.json(data, { headers });
    }
  } catch (error) {
    console.error('Failed to read ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to read data' }, { status: 500, headers });
  }
}`
  );

  // Fix POST - restore original delete-all-rewrite
  const postStart = content.indexOf('export async function POST');
  const patchStart = content.indexOf('export async function PATCH');
  const afterPost = patchStart !== -1 ? content.substring(patchStart) : '';

  if (postStart !== -1) {
    const newPost = `export async function POST(request) {
  try {
    const newData = await request.json();
    const colRef = getDb().collection(COLLECTION);
    const snapshot = await colRef.get();
    await Promise.all(snapshot.docs.map(d => d.ref.delete()));
    if (Array.isArray(newData)) {
      await Promise.all(newData.map((item, i) => colRef.doc(String(i)).set(item)));
    } else {
      await Promise.all(Object.entries(newData).map(([key, value]) =>
        colRef.doc(key).set(typeof value === 'object' ? value as object : { value })
      ));
    }
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}
`;
    content = content.substring(0, postStart) + newPost + afterPost;
  }

  fs.writeFileSync(filePath, content);
  console.log('Reverted:', api);
});
console.log('All reverted!');
