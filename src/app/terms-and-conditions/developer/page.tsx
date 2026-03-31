import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';
import Link from 'next/link';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-semibold font-headline">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
);

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
}