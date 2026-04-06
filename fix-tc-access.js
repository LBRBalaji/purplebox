const fs = require('fs');

const accessClause = `
            <Section title="Access to Platform Features">
              <p>When you make a payment on ORS-ONE — whether for connecting with a prospect, accessing a lead, or any other purpose — that payment is specifically for that stated purpose only. It does not entitle you to unlimited or permanent access to any other feature on the platform.</p>
              <p>ORS-ONE provides access to various tools and features — including the Negotiation Board, Tenant Improvement Sheet, Chat, and others — as part of your platform experience. We invite you to explore and use these features. However, access to these tools is a courtesy extended by ORS-ONE and not a guaranteed right.</p>
              <p>ORS-ONE and its management board reserve the right, at their sole discretion, to make any feature paid, restrict access, modify functionality, or discontinue any tool at any time. We will always endeavour to communicate any such changes to you in advance wherever possible.</p>
            </Section>`;

['customer', 'developer', 'agent'].forEach(role => {
  const filePath = 'src/app/terms-and-conditions/' + role + '/page.tsx';
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    `            <Section title="Contact Us">`,
    accessClause + `\n            <Section title="Contact Us">`
  );
  fs.writeFileSync(filePath, content);
  console.log('Updated:', role);
});
