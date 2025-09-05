
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-semibold font-headline">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
)

export default function TermsAndConditionsPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last Updated: October 28, 2023</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-muted-foreground">Welcome to Lakshmi Balaji O2O, a platform operated by Lakshmi Balaj Realty Private Limited ("Company", "we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and platform (collectively, the "Service").</p>
            <p className="text-muted-foreground">By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.</p>

            <Separator />

            <Section title="1. Description of Service">
                <p>Lakshmi Balaji Realty is a real estate brokerage firm and Lakshmi Balaji O2O is an Online to Offline Platform to simplify real estate transactions. This online platform is used to manage the marketing of warehouses and other properties, enabling customers to list their demands and source properties, and allowing developers to list their properties to connect with customers.</p>
                <p>In addition to this platform, our services include, but are not limited to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Facilitating site visits for customers.</li>
                    <li>Arranging and facilitating meetings between customers and developers.</li>
                    <li>Providing advisory services on negotiations.</li>
                    <li>Assisting in the finalization of lease agreements and other brokerage-related activities.</li>
                </ul>
            </Section>

            <Section title="2. User Accounts and Roles">
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="font-semibold text-foreground">Customers (Tenants):</strong> Users seeking to lease or acquire property.</li>
                    <li><strong className="font-semibold text-foreground">Providers (Developers/Owners):</strong> Users listing properties for lease or sale.</li>
                    <li><strong className="font-semibold text-foreground">Administrators (O2O Team):</strong> Company personnel managing the platform.</li>
                </ul>
                <p>You are responsible for safeguarding your account information and for all activities that occur under your account. You agree to provide accurate, current, and complete information during the registration process.</p>
            </Section>

            <Section title="3. Data Accuracy and Information Disclaimer">
                <p>The information provided on the Lakshmi Balaji O2O platform, including but not limited to property listings, specifications, and availability, is provided by third-party Providers. While we strive to ensure the information is current, we do not independently verify the complete accuracy of all data.</p>
                <p>All users are encouraged to conduct their own due diligence and verify all information independently before entering into any transaction or agreement.</p>
            </Section>

            <Section title="4. Brokerage and Fees">
                <p>By using this Service, you acknowledge and agree that Lakshmi Balaji O2O operates as a real estate brokerage. Standard brokerage fees are applicable for services rendered to both Customers (tenants) and Providers (developers/owners). The specific amount and percentage of brokerage will be determined for each transaction, and users agree to confirm these terms directly with Lakshmi Balaji O2O.</p>
            </Section>

            <Section title="5. Confidentiality and Privacy">
                <p>We take the confidentiality of our users' data seriously. As part of our service, we implement measures to protect sensitive information. This includes, but is not limited to:</p>
                 <ul className="list-disc pl-5 space-y-1">
                    <li>Not displaying the exact street address or GPS coordinates of listed properties on public maps. Locations are generalized for privacy.</li>
                    <li>Not publicly displaying the names of developer entities, logistics parks, or specific project names associated with a listing in public search areas.</li>
                </ul>
                <p>Users agree not to misuse any information obtained from the Service, including attempting to circumvent our confidentiality measures or contacting other users for purposes outside the scope of the Service.</p>
            </Section>

            <Section title="6. User Conduct">
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Post any information that is false, misleading, or inaccurate.</li>
                    <li>Infringe on any third party's copyright, patent, trademark, trade secret, or other proprietary rights.</li>
                    <li>Violate any applicable law, statute, ordinance, or regulation.</li>
                    <li>Engage in any activity that is defamatory, trade libelous, unlawfully threatening, or unlawfully harassing.</li>
                </ul>
            </Section>

            <Section title="7. Limitation of Liability">
                <p className="font-semibold uppercase text-foreground">TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LAKSHMI BALAJI REALTY, LAKSHMI BALAJI ORS, LAKSHMI BALAJI O2O, OR ANY OF ITS ALLIED ENTITIES, PROMOTERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES (COLLECTIVELY, "THE COMPANY PARTIES") BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, THAT RESULT FROM THE USE OF, OR INABILITY TO USE, THIS SERVICE.</p>
                <p>UNDER NO CIRCUMSTANCES WILL THE COMPANY PARTIES BE RESPONSIBLE FOR ANY DAMAGE, LOSS, OR INJURY RESULTING FROM:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>ERRORS, MISTAKES, OR INACCURACIES OF CONTENT;</li>
                    <li>PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO OR USE OF OUR SERVICE;</li>
                    <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION STORED THEREIN;</li>
                    <li>ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICE;</li>
                    <li>ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE THAT MAY BE TRANSMITTED TO OR THROUGH OUR SERVICE BY ANY THIRD PARTY;</li>
                    <li>ANY DISPUTES OR FAILED TRANSACTIONS THAT ARISE BETWEEN USERS WHERE THE COMPANY WAS NOT DIRECTLY INVOLVED IN THE BROKERAGE PROCESS.</li>
                </ul>
                <p>THIS LIMITATION OF LIABILITY SECTION APPLIES WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER BASIS, EVEN IF THE COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
            </Section>

            <Section title="8. Intellectual Property">
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of LAKSHMI BALAJI O2O and its licensors. The Service is protected by copyright, trademark, and other laws of both India and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of LAKSHMI BALAJI O2O.</p>
            </Section>

            <Section title="9. Governing Law">
                <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. The courts in Chennai, Tamil Nadu, shall have exclusive jurisdiction over any dispute arising out of or in connection with these Terms.</p>
            </Section>

            <Section title="10. Changes to Terms">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days’ notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
                <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
            </Section>

            <Section title="11. Contact Us">
                 <p>If you have any questions about these Terms, please contact us at balaji@lakshmibalajio2o.com</p>
            </Section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

