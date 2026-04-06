const fs = require('fs');

const common = `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import Link from 'next/link';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-semibold font-headline">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
);`;

// CUSTOMER T&C
const customerTC = common + `

export default function CustomerTermsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Terms and Conditions — Customers</CardTitle>
            <p className="text-muted-foreground">Last Updated: 31 March 2026 · Lakshmi Balaji ORS Private Limited</p>
            <p className="text-muted-foreground mt-2">These Terms apply to you as a Customer (Tenant) using ORS-ONE. Please read them carefully before signing up.</p>
          </CardHeader>
          <CardContent className="space-y-8">

            <Section title="1. About ORS-ONE">
              <p>ORS-ONE is a warehouse leasing marketplace that helps businesses find the right warehouse space across India. We connect you with verified property developers and facilitate the leasing process.</p>
            </Section>

            <Separator />

            <Section title="2. Your Account">
              <p>To register on ORS-ONE as a Customer, you must use your official company email address. Personal email addresses are not permitted.</p>
              <p>Your account is strictly personal — it cannot be shared with colleagues or anyone else. You are responsible for maintaining the confidentiality of your login details.</p>
              <p>Your account will be activated after verification by our team. You will receive an email confirmation once your access is ready.</p>
            </Section>

            <Section title="3. Accessing Listings">
              <p>You can browse and access warehouse listing details on the platform subject to daily access limits based on your plan. These limits are in place to ensure fair access for all users.</p>
              <p>Your company team's combined access is also subject to limits per city and across India per day. If you need expanded access, you can explore our upgraded plans.</p>
              <p>You agree not to create multiple accounts or use any other method to bypass these limits.</p>
            </Section>

            <Section title="4. Your Privacy">
              <p>Your identity and contact details are kept confidential on the platform. Developers cannot see who you are until a formal connection is established at the appropriate stage.</p>
              <p>Only general information about your industry type may be visible to developers to help them understand the nature of interest in their property.</p>
            </Section>

            <Section title="5. Connecting with Developers">
              <p>When you are ready to engage with a developer about a property, the platform will facilitate a connection. You will be notified when a connection has been confirmed and you can then communicate directly through the platform.</p>
              <p>Once connected, you can choose how you wish to proceed — directly with the developer, through your own agent, or with ORS-ONE facilitating the transaction.</p>
              <p>Customers from the 3PL and Logistics industry enjoy Zero Brokerage when ORS-ONE is appointed as the Transaction Partner.</p>
            </Section>

            <Section title="6. Using Your Own Agent">
              <p>If you wish to be represented by your own agent, you can invite them to the platform. Your agent will receive an email invitation with a unique code to register. Invite codes are valid for 3 days.</p>
              <p>Your agent's registration is subject to approval by ORS-ONE. Once approved, they can assist you with the transaction on the platform.</p>
            </Section>

            <Section title="7. Your Responsibilities">
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate information during registration and keep your profile updated.</li>
                <li>Use the platform only for legitimate business purposes.</li>
                <li>Not misuse or share information obtained from the platform.</li>
                <li>Not post false or misleading content.</li>
              </ul>
            </Section>

            <Section title="8. Data Accuracy">
              <p>Property information is provided by developers. ORS-ONE encourages you to conduct your own due diligence before entering into any agreement.</p>
            </Section>

            <Section title="9. Limitation of Liability">
              <p>ORS-ONE is a facilitating marketplace. We are not a party to agreements made between you and developers. To the fullest extent permitted by law, Lakshmi Balaji ORS Private Limited shall not be liable for any indirect or consequential damages arising from your use of this platform.</p>
            </Section>

            <Section title="10. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
            </Section>

            <Section title="11. Changes to These Terms">
              <p>We may update these Terms periodically. Significant changes will be communicated with at least 15 days notice.</p>
            </Section>

            <Section title="12. Contact Us">
              <p>For any questions, contact us at <strong className="text-foreground">balaji@lakshmibalajio2o.com</strong></p>
            </Section>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}`;

// DEVELOPER T&C
const developerTC = common + `

export default function DeveloperTermsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Terms and Conditions — Property Developers</CardTitle>
            <p className="text-muted-foreground">Last Updated: 31 March 2026 · Lakshmi Balaji ORS Private Limited</p>
            <p className="text-muted-foreground mt-2">These Terms apply to you as a Property Developer (Provider) using ORS-ONE. Please read them carefully before signing up.</p>
          </CardHeader>
          <CardContent className="space-y-8">

            <Section title="1. About ORS-ONE">
              <p>ORS-ONE is a warehouse leasing marketplace operated by Lakshmi Balaji ORS Private Limited. We help property developers reach verified business customers looking for warehouse space across India.</p>
            </Section>

            <Separator />

            <Section title="2. Your Account">
              <p>Your account is personal and non-transferable. You are responsible for maintaining the security of your login details. Do not share your account with others.</p>
              <p>You agree to provide accurate company and contact information during registration. Accounts with false information may be suspended.</p>
              <p>New accounts are activated after verification by our team. You will receive an email once your access is confirmed.</p>
            </Section>

            <Section title="3. Listing Your Properties">
              <p>You can list your warehouse properties on ORS-ONE at no listing fee. You are responsible for ensuring all listing information — including specifications, availability and location — is accurate and kept up to date.</p>
              <p>ORS-ONE reserves the right to review, approve, or reject any listing. Listings found to contain inaccurate or misleading information may be removed without notice.</p>
            </Section>

            <Section title="4. Connecting with Prospects">
              <p>When customers express interest in your listings, you will be notified in your dashboard. You will be able to see general information about the prospect to help you assess their relevance.</p>
              <p>To connect with a prospect and engage directly, a prescribed fee per lead applies. This fee is non-refundable once a connection has been confirmed by ORS-ONE.</p>
            </Section>

            <Section title="5. Engage and Transact — Your Path">
              <p>After connecting with a prospect, you select how you wish to proceed with the Engage and Transact stages:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="font-semibold text-foreground">Independent Path:</strong> Pay the applicable platform fee and manage the engagement and transaction independently using ORS-ONE's tools.</li>
                <li><strong className="font-semibold text-foreground">ORS-ONE as Transaction Partner:</strong> No upfront fee. ORS-ONE manages the process on your behalf. Industry standard brokerage applies on successful deal closure. This applies regardless of whether the customer has their own agent.</li>
              </ul>
              <p>By selecting ORS-ONE as Transaction Partner, you formally agree to pay the industry standard brokerage upon deal closure. This is a binding agreement from the moment of selection.</p>
            </Section>

            <Section title="6. Your Responsibilities">
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep all listing information accurate and updated at all times.</li>
                <li>Engage with prospects professionally and in good faith.</li>
                <li>Not misuse customer information obtained through the platform.</li>
                <li>Not solicit customers for transactions outside of ORS-ONE after connecting through the platform.</li>
              </ul>
            </Section>

            <Section title="7. Fees and Payments">
              <p>All fees are exclusive of applicable GST unless stated otherwise. Fee structures may be revised with advance notice. Payments made for confirmed connections are non-refundable.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>ORS-ONE is a facilitating marketplace and is not responsible for the outcome of transactions between you and customers. To the fullest extent permitted by law, Lakshmi Balaji ORS Private Limited shall not be liable for any indirect or consequential damages arising from your use of this platform.</p>
            </Section>

            <Section title="9. Platform Moderation">
              <p>ORS-ONE reserves the right to remove listings or suspend accounts that violate these Terms, without prior notice.</p>
            </Section>

            <Section title="10. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
            </Section>

            <Section title="11. Changes to These Terms">
              <p>We may update these Terms periodically. Significant changes will be communicated with at least 15 days notice.</p>
            </Section>

            <Section title="12. Contact Us">
              <p>For any questions, contact us at <strong className="text-foreground">balaji@lakshmibalajio2o.com</strong></p>
            </Section>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}`;

// AGENT T&C
const agentTC = common + `

export default function AgentTermsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Terms and Conditions — Agents</CardTitle>
            <p className="text-muted-foreground">Last Updated: 31 March 2026 · Lakshmi Balaji ORS Private Limited</p>
            <p className="text-muted-foreground mt-2">These Terms apply to you as an Agent on ORS-ONE. Please read them carefully before registering.</p>
          </CardHeader>
          <CardContent className="space-y-8">

            <Section title="1. About ORS-ONE">
              <p>ORS-ONE is a warehouse leasing marketplace operated by Lakshmi Balaji ORS Private Limited. As an Agent, you play an important role in representing customers and facilitating successful transactions on the platform.</p>
            </Section>

            <Separator />

            <Section title="2. Agent Registration">
              <p>You may register as an Agent on ORS-ONE either through a direct application or by accepting an invitation from a customer. If invited, you will receive a unique invite code by email that must be used during registration.</p>
              <p>All agent registrations are subject to approval by ORS-ONE. We reserve the right to approve or decline any application at our discretion.</p>
              <p>Once approved, you will receive an email notification confirming your access.</p>
            </Section>

            <Section title="3. Your Account">
              <p>Your account is personal and non-transferable. You are responsible for maintaining the security of your login credentials.</p>
              <p>You agree to provide accurate professional information during registration and to keep your profile updated.</p>
            </Section>

            <Section title="4. Your Role on the Platform">
              <p>As an Agent, you represent customers assigned to you in their search for warehouse space. You can access leads assigned to you and assist in the engagement and transaction process on the platform.</p>
              <p>You agree to represent your clients professionally and in accordance with applicable laws and real estate regulations in India.</p>
            </Section>

            <Section title="5. Brokerage and Fees">
              <p>Any brokerage arrangement between you and your client is your own professional agreement and is separate from ORS-ONE's terms. ORS-ONE is not responsible for fee disputes between you and your clients.</p>
              <p>ORS-ONE's fee arrangements with developers are independent of your involvement in a transaction.</p>
            </Section>

            <Section title="6. Your Responsibilities">
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Represent your clients honestly and professionally.</li>
                <li>Not misuse any information obtained through the platform.</li>
                <li>Not solicit developers or customers for transactions outside of ORS-ONE during an active engagement on the platform.</li>
                <li>Comply with all applicable laws and professional codes of conduct.</li>
              </ul>
            </Section>

            <Section title="7. Platform Moderation">
              <p>ORS-ONE reserves the right to suspend or remove any agent account for unprofessional conduct, violation of these Terms, or any action that may harm users of the platform.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>ORS-ONE is a facilitating marketplace. We are not responsible for the outcome of transactions you are involved in. To the fullest extent permitted by law, Lakshmi Balaji ORS Private Limited shall not be liable for any indirect or consequential damages arising from your use of this platform.</p>
            </Section>

            <Section title="9. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
            </Section>

            <Section title="10. Changes to These Terms">
              <p>We may update these Terms periodically. Significant changes will be communicated with at least 15 days notice.</p>
            </Section>

            <Section title="11. Contact Us">
              <p>For any questions, contact us at <strong className="text-foreground">balaji@lakshmibalajio2o.com</strong></p>
            </Section>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}`;

fs.writeFileSync('src/app/terms-and-conditions/customer/page.tsx', customerTC);
fs.writeFileSync('src/app/terms-and-conditions/developer/page.tsx', developerTC);
fs.writeFileSync('src/app/terms-and-conditions/agent/page.tsx', agentTC);
console.log('All three T&C pages created!');
