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
}