const fs = require('fs');
let content = fs.readFileSync('src/app/api/registered-leads/route.ts', 'utf8');
const oldPost = content.substring(content.indexOf('export async function POST'));
const newPost = `export async function POST(request) {
  try {
    const newData = await request.json();
    const payload = Array.isArray(newData) ? { data: newData } : newData;
    await getDb().collection(COLLECTION).doc('0').set(payload);
    return NextResponse.json({ message: COLLECTION + ' updated successfully' }, { headers });
  } catch (error) {
    console.error('Failed to write ' + COLLECTION + ':', error);
    return NextResponse.json({ message: 'Failed to update data' }, { status: 500, headers });
  }
}`;
content = content.substring(0, content.indexOf('export async function POST')) + newPost;
fs.writeFileSync('src/app/api/registered-leads/route.ts', content);
console.log('Done!');
