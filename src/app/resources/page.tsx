'use client';

import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { CommunityPost } from '@/lib/schema';

// Simple slugify function
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

export default function ResourcesPage() {
  const { communityPosts, isLoading } = useData();
  const [learnPosts, setLearnPosts] = React.useState<CommunityPost[]>([]);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isLoading && communityPosts.length > 0) {
      const sortedLearnPosts = communityPosts
        .filter(p => p.category === 'Learn')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLearnPosts(sortedLearnPosts);
    }
  }, [communityPosts, isLoading]);

  const handlePrint = () => {
    window.print();
  };
  
  if (isLoading) {
    return (
        <div className="flex-grow flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center gap-4 no-print">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Resource Center</h1>
                <p className="text-muted-foreground mt-2">A comprehensive guide to the features and value of the O2O platform.</p>
            </div>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Download / Print
            </Button>
        </div>
        
        <Card className="no-print">
            <CardHeader>
                <CardTitle>Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-decimal list-inside space-y-2">
                    {learnPosts.map(post => {
                        const titleMatch = post.text.match(/<h[1-2]>(.*?)<\/h[1-2]>/);
                        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : 'Untitled Post';
                        const slug = slugify(title);
                        return (
                            <li key={post.id}>
                                <a href={`#${slug}`} className="text-primary hover:underline">{title}</a>
                            </li>
                        )
                    })}
                </ul>
            </CardContent>
        </Card>

        <div ref={contentRef} className="mt-8 space-y-12">
            {learnPosts.map((post, index) => {
                const titleMatch = post.text.match(/<h[1-2]>(.*?)<\/h[1-2]>/);
                const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : 'Untitled Post';
                const slug = slugify(title);
                return (
                    <React.Fragment key={post.id}>
                        <article id={slug} className="prose dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: post.text }} />
                        </article>
                        {index < learnPosts.length - 1 && <Separator className="my-12" />}
                    </React.Fragment>
                )
            })}
        </div>
      </div>
    </main>
  );
}
