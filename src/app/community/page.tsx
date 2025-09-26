
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, Video, MessageSquare, ThumbsUp, Repeat, Info, LogIn } from 'lucide-react';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { LoginDialog } from '@/components/login-dialog';

const createPostSchema = z.object({
  text: z.string().min(1, 'Post content cannot be empty.').max(5000),
  videoUrl: z.string().url().optional().or(z.literal('')),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

function CreatePostForm() {
  const { user } = useAuth();
  const { addCommunityPost } = useData();
  const { toast } = useToast();
  
  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { text: '', videoUrl: '' },
  });

  const onSubmit = (data: CreatePostValues) => {
    if (!user) return;
    addCommunityPost({
      authorEmail: user.email,
      authorName: user.userName,
      authorCompanyName: user.companyName,
      text: data.text,
      videoUrl: data.videoUrl || undefined,
    });
    form.reset();
    toast({ title: "Post Created", description: "Your post is now live in the community." });
  };

  if (!user) return null;

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
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
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-muted-foreground" />
                        <input {...field} placeholder="Optional: Paste a video URL (e.g., YouTube, Vimeo)" className="w-full text-sm bg-transparent outline-none" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
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

function CommunityPostCard({ post }: { post: any }) {
  const { user } = useAuth();
  const { users, addCommunityComment } = useData();
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
    const videoId = post.videoUrl.split('v=')[1]?.split('&')[0] || post.videoUrl.split('/').pop();
    if (videoId) {
      videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{author.userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{author.userName}</p>
            <p className="text-xs text-muted-foreground">{author.companyName}</p>
          </div>
          <p className="text-xs text-muted-foreground ml-auto">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.text}</p>
        {videoEmbedUrl && (
          <div className="aspect-video relative">
            <iframe
              src={videoEmbedUrl}
              title="Community Video Post"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-md"
            ></iframe>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardContent className="py-4 space-y-4">
        <h4 className="font-semibold text-sm">Comments ({post.comments.length})</h4>
        <div className="space-y-4">
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
         {user && (
            <div className="flex items-start gap-2 pt-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
                <Button onClick={handleAddComment} size="sm" className="mt-2">Add Comment</Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}


export default function CommunityPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, isLoading: isDataLoading } = useData();
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);

    const isLoading = isAuthLoading || isDataLoading;

    if (isLoading) {
        return (
             <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
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

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight text-primary flex items-center justify-center gap-3">
                        <Users /> Community Hub
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Connect with peers, ask questions, and get updates from the O2O team.
                    </p>
                </div>
                
                <Alert>
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Welcome!</AlertTitle>
                    <AlertDescription>
                        This is a shared space for all users. Please be respectful and professional in all your interactions.
                    </AlertDescription>
                </Alert>

                <CreatePostForm />

                <Separator />
                
                <div className="space-y-6">
                    {communityPosts.length > 0 ? (
                        communityPosts.map(post => <CommunityPostCard key={post.id} post={post} />)
                    ) : (
                        <Card className="text-center p-12">
                            <CardTitle>No Posts Yet</CardTitle>
                            <CardDescription>Be the first to start a conversation!</CardDescription>
                        </Card>
                    )}
                </div>
            </div>
        </main>
    )
}
