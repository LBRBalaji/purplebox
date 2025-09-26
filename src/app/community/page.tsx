
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, Video, BookOpen, Calendar, Rss, LogIn, Edit, FileText, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { LoginDialog } from '@/components/login-dialog';
import type { CommunityPost } from '@/lib/schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const createPostSchema = z.object({
  text: z.string().min(1, 'Post content cannot be empty.').max(5000),
  videoUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Learn', 'Events', 'Stories']),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

function CreatePostForm() {
  const { user } = useAuth();
  const { addCommunityPost } = useData();
  const { toast } = useToast();
  
  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { text: '', videoUrl: '', category: 'Stories' },
  });

  const onSubmit = (data: CreatePostValues) => {
    if (!user) return;
    addCommunityPost({
      authorEmail: user.email,
      authorName: user.userName,
      authorCompanyName: user.companyName,
      text: data.text,
      videoUrl: data.videoUrl || undefined,
      category: data.category,
    });
    form.reset();
    toast({ title: "Post Created", description: "Your post is now live in the community." });
  };

  if (!user) return null;
  const isAdminOrDeveloper = user.role === 'SuperAdmin' || user.role === 'O2O' || user.role === 'Warehouse Developer';


  return (
    <Card className="mt-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
             <CardDescription>Share an update, tutorial, or story with the community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} placeholder={`What's on your mind, ${user.userName}?`} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Video URL</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2 border rounded-md px-3 h-10">
                            <Video className="h-4 w-4 text-muted-foreground" />
                            <input {...field} placeholder="Optional: Paste a YouTube/Vimeo URL" className="w-full text-sm bg-transparent outline-none" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="sr-only">Category</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Stories">Latest Developments & Markets</SelectItem>
                            <SelectItem value="Learn">Videos & Tutorials</SelectItem>
                            <SelectItem value="Events">Events & Announcements</SelectItem>
                        </SelectContent>
                       </Select>
                    </FormItem>
                  )}
                />
            </div>
             {!isAdminOrDeveloper && form.watch('category') === 'Stories' && (
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>The "Latest Developments" section is primarily for developers and industry experts. Your post may be reviewed by an admin.</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Send className="mr-2 h-4 w-4" /> Post
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function CommunityPostCard({ post }: { post: CommunityPost }) {
  const { user, users } = useAuth();
  const { addCommunityComment } = useData();
  const { toast } = useToast();
  const [comment, setComment] = React.useState('');

  const author = users[post.authorEmail] || { userName: post.authorName, companyName: post.authorCompanyName };

  const handleAddComment = () => {
    if (!user || !comment.trim()) return;
    addCommunityComment(post.id, {
      authorEmail: user.email,
      authorName: user.userName,
      text: comment,
    });
    setComment('');
    toast({ title: 'Comment Added' });
  };

  const isYouTube = post.videoUrl?.includes('youtube.com') || post.videoUrl?.includes('youtu.be');
  let videoEmbedUrl = '';

  if (isYouTube) {
    const videoIdMatch = post.videoUrl.match(/(?:v=|\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    const videoId = videoIdMatch && videoIdMatch[1];
    if (videoId) {
      videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }

  const categoryConfig: { [key: string]: { icon: React.ElementType, color: string, label: string } } = {
    Learn: { icon: Video, color: 'text-blue-600', label: 'Video/Tutorial' },
    Events: { icon: Calendar, color: 'text-purple-600', label: 'Event' },
    Stories: { icon: Briefcase, color: 'text-green-600', label: 'Market Development' },
  }
  const categoryInfo = categoryConfig[post.category] || { icon: FileText, color: 'text-gray-600', label: 'Post' };
  const CategoryIcon = categoryInfo.icon;
  const badgeBorderColor = `border-${categoryInfo.color.replace('text-', '')}/20`;


  return (
    <Card className="overflow-hidden">
      {videoEmbedUrl && (
        <div className="aspect-video relative">
          <iframe
            src={videoEmbedUrl}
            title="Community Video Post"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          ></iframe>
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{author.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{author.userName}</p>
                <p className="text-xs text-muted-foreground">{author.companyName}</p>
              </div>
            </div>
             <p className="text-xs text-muted-foreground ml-auto shrink-0">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant="outline" className={cn("mt-4", categoryInfo.color, badgeBorderColor)}>
            <CategoryIcon className="mr-1.5 h-3 w-3"/>
            {categoryInfo.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.text}</p>
      </CardContent>
       {user && (
         <>
          <Separator />
          <CardContent className="py-4 space-y-4">
            <h4 className="font-semibold text-sm">Comments ({post.comments.length})</h4>
            {post.comments.length > 0 && (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {post.comments.map((comment: any) => {
                        const commentAuthor = users[comment.authorEmail] || { userName: comment.authorName };
                        return (
                             <div key={comment.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{commentAuthor.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow bg-secondary/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between text-xs">
                                        <p className="font-semibold">{commentAuthor.userName}</p>
                                        <p className="text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm mt-1">{comment.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <div className="flex items-start gap-2 pt-4 border-t">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
                <Button onClick={handleAddComment} size="sm" className="mt-2">Add Comment</Button>
              </div>
            </div>
          </CardContent>
         </>
      )}
    </Card>
  );
}

const EditableImage = ({ src, onImageChange, alt, hint, isAdmin }: { src: string, onImageChange: (newSrc: string) => void, alt: string, hint: string, isAdmin: boolean }) => {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        toast({ title: "Uploading...", description: "Your new image is being uploaded." });
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error((await response.json()).error || 'Upload failed');
            const result = await response.json();
            onImageChange(result.url);
            toast({ title: "Image updated successfully!" });
        } catch (error) {
            const e = error as Error;
            toast({ variant: 'destructive', title: "Upload Failed", description: e.message });
        }
    };
    
    return (
        <div className="relative group rounded-xl overflow-hidden shadow-lg">
            <Image src={src} alt={alt} width={1200} height={500} className="w-full h-full object-cover" data-ai-hint={hint} />
            {isAdmin && (
                <>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <Button variant="secondary" size="sm" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => fileInputRef.current?.click()}>
                        <Edit className="mr-2 h-4 w-4" /> Change Image
                    </Button>
                </>
            )}
        </div>
    );
};


export default function CommunityPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, aboutUsContent, updateAboutUsContent, isLoading: isDataLoading } = useData();
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);

    const isLoading = isAuthLoading || isDataLoading;
    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    const handleImageChange = (key: keyof typeof aboutUsContent) => (newSrc: string) => {
        if (aboutUsContent) {
            updateAboutUsContent({ ...aboutUsContent, [key]: newSrc });
        }
    };


    const categorizedPosts = React.useMemo(() => {
        const stories = communityPosts.filter(p => p.category === 'Stories').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const tutorials = communityPosts.filter(p => p.category === 'Learn' || p.category === 'Events').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { stories, tutorials };
    }, [communityPosts]);

    if (isLoading) {
        return (
             <main className="container mx-auto p-4 md:p-8 space-y-12">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
        )
    }

    if (!user) {
        return (
            <>
                <main className="container mx-auto p-4 md:p-8 flex-grow flex items-center justify-center">
                    <Card className="max-w-md text-center">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Join the Community Hub</CardTitle>
                            <CardDescription>
                                To view discussions and connect with other users, please log in or create an account.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full" onClick={() => setIsLoginOpen(true)}>
                                <LogIn className="mr-2 h-4 w-4"/>
                                Log In / Sign Up
                            </Button>
                        </CardFooter>
                    </Card>
                </main>
                <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
            </>
        )
    }
    
    if (!aboutUsContent) {
      return (
        <div className="container mx-auto p-4 md:p-8 flex items-center justify-center">
          <p>Community content is loading...</p>
        </div>
      );
    }

    return (
        <div className="flex-grow bg-secondary/30">
            {/* Hero Section */}
            <section className="relative py-20 md:py-28 text-center bg-background">
                 <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom_1px_center"></div>
                 <div className="container mx-auto relative">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-primary">
                           Engage with the Community
                        </h1>
                        <p className="mt-6 text-lg text-foreground max-w-2xl mx-auto">
                           Connect with peers, share your stories, and get updates from the O2O team.
                        </p>
                    </div>
                </div>
            </section>

            <main className="container mx-auto p-4 md:p-8 space-y-16">
                 {/* Latest Developments */}
                <section>
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Latest Developments & Markets</h2>
                        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                           Insights from developers on upcoming projects and analysis from industry experts.
                        </p>
                    </div>
                    {categorizedPosts.stories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categorizedPosts.stories.map(post => <CommunityPostCard key={post.id} post={post} />)}
                        </div>
                    ) : (
                        <Card className="text-center p-12">
                            <CardTitle>No Market Developments Posted Yet</CardTitle>
                            <CardDescription>Check back soon for updates from developers and industry experts.</CardDescription>
                        </Card>
                    )}
                </section>
                
                <Separator />
                
                {/* Videos & Tutorials */}
                <section>
                     <div className="mb-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Videos & Tutorials</h2>
                        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                           Learn how to use the platform and get tips from our team and other users.
                        </p>
                    </div>
                     <EditableImage 
                        src={aboutUsContent.feature1}
                        onImageChange={handleImageChange('feature1')}
                        alt="Video Tutorials"
                        hint="man watching tutorial video"
                        isAdmin={isAdmin}
                    />
                    {categorizedPosts.tutorials.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                            {categorizedPosts.tutorials.map(post => <CommunityPostCard key={post.id} post={post} />)}
                        </div>
                    )}
                </section>

                <CreatePostForm />
            </main>
        </div>
    )
}
