const fs = require('fs');
const path = require('path');

const collectionsToFix = ['chat-messages', 'notifications', 'typing-status', 'listing-analytics', 'registered-leads'];

collectionsToFix.forEach(collection => {
  const filePath = path.join('src/app/api', collection, 'route.ts');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (collection === 'chat-messages' || collection === 'typing-status') {
    // Already using single doc set — just ensure merge:true
    content = content.replace(
      `await getDb().collection(COLLECTION).doc('0').set(`,
      `await getDb().collection(COLLECTION).doc('0').set(`
    );
  } else {
    // Replace delete-all-rewrite with single doc set
    content = content.replace(
      `export async function POST(request) {
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
  }`,
      `export async function POST(request) {
  try {
    const newData = await request.json();
    const payload = Array.isArray(newData) ? { data: newData } : newData;
    await getDb().collection(COLLECTION).doc('0').set(payload);
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }`
    );

    // Also fix GET to read from single doc
    content = content.replace(
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
}`,
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
}`
    );
  }

  fs.writeFileSync(filePath, content);
  console.log('Fixed:', collection);
});
console.log('All done!');
