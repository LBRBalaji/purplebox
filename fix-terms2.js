const fs = require('fs');

const content = `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-semibold font-headline">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
);

const RoleSection = ({ title, role, children }: { title: string, role: string, children: React.ReactNode }) => (
    <div className="space-y-3 bg-primary/3 border border-primary/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{role}</span>
            <h2 className="text-lg font-semibold font-headline">{title}</h2>
        </div>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
);

export default function TermsAndConditionsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last Updated: 31 March 2026</p>
            <p className="text-muted-foreground mt-2">These Terms are written in plain English. Please read them carefully. By using ORS-ONE, you agree to these Terms.</p>
          </CardHeader>
          <CardContent className="space-y-8">

            <Section title="1. About ORS-ONE">
              <p>ORS-ONE is a warehouse leasing marketplace operated by Lakshmi Balaji O2O Private Limited. Our platform connects customers looking for warehouse space with property developers who have space available. We also facilitate transactions through our team of professionals.</p>
            </Section>

            <Separator />
            <p className="text-sm font-bold text-foreground">Terms Applicable to All Users</p>

            <Section title="2. Your Account">
              <p>Your account is personal and non-transferable. You are responsible for maintaining the confidentiality of your login credentials. Do not share your password with anyone.</p>
              <p>You agree to provide accurate and truthful information during registration and to keep your profile up to date. ORS-ONE reserves the right to verify your information and suspend accounts found to be inaccurate.</p>
              <p>New accounts are activated after verification by our team. You will be notified by email once your access is confirmed.</p>
            </Section>

            <Section title="3. Acceptable Use">
              <p>While using ORS-ONE, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Share your account with others or create multiple accounts.</li>
                <li>Post false, misleading, or defamatory content.</li>
                <li>Misuse information obtained from the platform.</li>
                <li>Solicit other users for services outside the platform.</li>
                <li>Attempt to disrupt or tamper with the platform in any way.</li>
              </ul>
            </Section>

            <Section title="4. Data and Privacy">
              <p>We take your privacy seriously. Your personal information is used solely to facilitate transactions and improve your experience on the platform. We do not sell your data to third parties.</p>
              <p>Certain information may be shared with other users on the platform as part of the transaction process, but only to the extent necessary and at the appropriate stage. You will always be informed before any such sharing occurs.</p>
            </Section>

            <Section title="5. Data Accuracy">
              <p>Property information on ORS-ONE is provided by the respective developers. While we make every effort to maintain accuracy, ORS-ONE does not independently verify every detail. We encourage all users to conduct their own due diligence before entering into any agreement.</p>
            </Section>

            <Section title="6. Platform Moderation">
              <p>ORS-ONE reserves the right to review, modify, or remove any content that violates these Terms. We may suspend or block any account for violations, without prior notice, if we determine it is necessary to protect the platform and its users.</p>
            </Section>

            <Section title="7. Fees and Payments">
              <p>All fees are exclusive of applicable taxes unless stated otherwise. Fee structures may be revised from time to time and you will be notified of any changes in advance.</p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>To the fullest extent permitted by law, Lakshmi Balaji O2O Private Limited, its promoters, directors, and employees shall not be liable for any indirect or consequential damages arising from your use of this platform. ORS-ONE is a facilitating marketplace and is not a party to agreements made between users.</p>
            </Section>

            <Section title="9. Intellectual Property">
              <p>All content, design, and features of ORS-ONE are the exclusive property of Lakshmi Balaji O2O Private Limited. Reproduction or distribution of platform content without written permission is prohibited.</p>
            </Section>

            <Section title="10. Governing Law">
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.</p>
            </Section>

            <Section title="11. Changes to These Terms">
              <p>We may update these Terms periodically. Significant changes will be communicated with at least 15 days notice. Continued use of the platform after changes take effect constitutes acceptance of the revised Terms.</p>
            </Section>

            <Separator />
            <p className="text-sm font-bold text-foreground">Additional Terms by User Type</p>

            <RoleSection title="Customer (Tenant) Terms" role="Customers">
              <p>As a Customer on ORS-ONE, you can browse and access warehouse listings. Your access to listing details is subject to daily usage limits based on your plan. These limits are in place to ensure fair access for all users on the platform.</p>
              <p>When you access listing details, you may choose to express interest. Our platform will facilitate a connection with the relevant developer at the right time. Your identity and contact information remain confidential until a formal connection is established.</p>
              <p>Once connected with a developer, you can choose how you wish to proceed — directly with the developer, through your own agent, or with ORS-ONE facilitating the transaction. Your choice is yours to make, and you can discuss brokerage terms directly with us if ORS-ONE is involved.</p>
              <p>Customers from the 3PL and Logistics industry enjoy Zero Brokerage when ORS-ONE is appointed as the Transaction Partner.</p>
              <p>You agree not to attempt to bypass platform limits or use multiple accounts to gain additional access.</p>
            </RoleSection>

            <RoleSection title="Property Developer Terms" role="Developers">
              <p>As a Property Developer, you can list your warehouse properties on ORS-ONE at no listing fee. You are responsible for ensuring the accuracy and completeness of your listings.</p>
              <p>When customers express interest in your listings, you will be notified. To engage with a prospect, a prescribed fee applies per lead. This fee is non-refundable once a connection has been confirmed.</p>
              <p>After connecting with a prospect, you choose your preferred engagement path. If you choose ORS-ONE as your Transaction Partner, you formally agree to pay the industry standard brokerage upon successful deal closure. This applies regardless of whether the customer is represented by an agent. This agreement is binding from the moment of selection.</p>
              <p>You agree to keep all listing information accurate and updated. Listings found to contain false or misleading information may be removed without notice.</p>
            </RoleSection>

            <RoleSection title="Agent Terms" role="Agents">
              <p>As an Agent on ORS-ONE, you represent customers in their search for warehouse space. You may be invited to the platform by a customer using a unique invite code, or you may apply directly through the agent registration page.</p>
              <p>Agent accounts are subject to approval by ORS-ONE. Once approved, you can access leads assigned to you by customers and assist in the engagement and transaction process.</p>
              <p>You agree to represent your clients professionally and in accordance with applicable laws and regulations. Any brokerage arrangement between you and your client is separate from and does not affect ORS-ONE's terms with the respective developer.</p>
              <p>ORS-ONE reserves the right to remove any agent from the platform for unprofessional conduct or violation of these Terms.</p>
            </RoleSection>

            <Separator />

            <Section title="12. Contact Us">
              <p>If you have any questions about these Terms or your account, please contact us at <strong className="text-foreground">balaji@lakshmibalajio2o.com</strong></p>
            </Section>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}`;

fs.writeFileSync('src/app/terms-and-conditions/page.tsx', content);
console.log('Done!');
