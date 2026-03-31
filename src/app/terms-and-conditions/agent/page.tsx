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
}