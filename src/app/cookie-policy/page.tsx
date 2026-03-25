
// src/app/cookie-policy/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import * as React from 'react';

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-3">
        <h2 className="text-xl font-semibold font-headline">{title}</h2>
        <div className="space-y-2 text-muted-foreground">{children}</div>
    </div>
)

export default function CookiePolicyPage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold font-headline tracking-tight">Cookie Policy</CardTitle>
            <p className="text-muted-foreground">Last Updated: October 29, 2023</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-muted-foreground">
              This Cookie Policy explains how ORS-ONE ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>

            <Separator />

            <Section title="What are cookies?">
                <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
            </Section>

            <Section title="Why do we use cookies?">
                <p>We use cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our Online Properties. We have categorized them below:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        <strong className="font-semibold text-foreground">Essential Cookies:</strong> These are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website to you, you cannot refuse them without impacting how our Website functions.
                    </li>
                    <li>
                        <strong className="font-semibold text-foreground">Preference Cookies:</strong> Also known as "functionality cookies," these cookies are used to remember choices you have made in the past, like what language you prefer or what your user name is so you can log in automatically.
                    </li>
                </ul>
            </Section>
            
            <Section title="How can you control cookies?">
                <p>You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Banner. The banner allows you to select which categories of cookies you accept or reject.</p>
                <p>Essential cookies cannot be rejected as they are strictly necessary to provide you with services.</p>
                <p>If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
            </Section>
            
             <Section title="Changes to this Cookie Policy">
                <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
            </Section>
            
            <Section title="Where can you get further information?">
                <p>If you have any questions about our use of cookies or other technologies, please email us at balaji@lakshmibalajio2o.com.</p>
            </Section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
