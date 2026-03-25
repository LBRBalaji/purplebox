
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import communityPostsData from '@/data/community-posts.json';
import type { CommunityPost } from '@/lib/schema';
import { Separator } from '@/components/ui/separator';

// Helper to extract the main heading from the post HTML
const getPostTitle = (html: string): string => {
  const match = html.match(/<h2[^>]*>(.*?)<\/h2>/);
  return match ? match[1].replace(/<[^>]+>/g, '') : 'Untitled Post';
};

const Section = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <section id={id} className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2">{title}</h2>
        <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: children as string }} />
    </section>
);

export default function ResourcesPage() {
  const handlePrint = () => {
    window.print();
  };
  
  const learnPosts = (communityPostsData as CommunityPost[])
    .filter(post => post.category === 'Learn')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Sort oldest to newest

  const tocItems = learnPosts.map((post, index) => ({
      id: `post-${post.id}`,
      title: `${index + 1}. ${getPostTitle(post.text)}`,
  }));

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center gap-4 no-print">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Resource Center</h1>
                <p className="text-muted-foreground mt-2">A comprehensive guide to understanding the ORS-ONE platform.</p>
            </div>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Download / Print
            </Button>
        </div>
        
        <Card className="no-print mb-12">
            <CardHeader>
                <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {tocItems.map(item => (
                        <li key={item.id}>
                            <a href={`#${item.id}`} className="text-primary hover:underline">{item.title}</a>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

        <div className="space-y-12">
           {learnPosts.map((post, index) => (
                <React.Fragment key={post.id}>
                    <Section id={`post-${post.id}`} title={`${index + 1}. ${getPostTitle(post.text)}`}>
                        {post.text}
                    </Section>
                    {index < learnPosts.length - 1 && <Separator className="my-12" />}
                </React.Fragment>
           ))}
        </div>
      </div>
    </main>
  );
}
