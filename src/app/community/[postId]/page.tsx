

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Calendar, Briefcase, FileText, LogIn, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LoginDialog } from '@/components/login-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CommunityPostPage() {
    const { postId } = useParams();
    const router = useRouter();
    const { user, users, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, addCommunityComment, isLoading: isDataLoading } = useData();
    const { toast } = useToast();
    const [comment, setComment] = React.useState('');
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);

    const post = React.useMemo(() => {
        return communityPosts.find(p => p.id === postId);
    }, [communityPosts, postId]);
    
    const isLoading = isAuthLoading || isDataLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8 max-w-3xl">
                <Skeleton className="h-10 w-48 mb-8" />
                <div className="space-y-6">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }
    
    if (!post) {
        if (!isLoading) {
            router.push('/community');
        }
        return null;
    }

    const author = users[post.authorEmail] || { userName: post.authorName, companyName: post.authorCompanyName };
    
    const handleAddComment = () => {
        if (!user) {
            setIsLoginOpen(true);
            return;
        }
        if (!comment.trim()) return;

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

    if (post.videoUrl && isYouTube) {
        const videoIdMatch = post.videoUrl.match(/(?:v=|\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        const videoId = videoIdMatch && videoIdMatch[1];
        if (videoId) {
            videoEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
    }
    
     const categoryConfig: { [key: string]: { icon: React.ElementType, color: string, label: string, tab: string } } = {
        Learn: { icon: BookOpen, color: 'text-blue-600', label: 'Learn', tab: 'learn' },
        Events: { icon: Calendar, color: 'text-purple-600', label: 'Event', tab: 'events' },
        Stories: { icon: Briefcase, color: 'text-green-600', label: 'Market Story', tab: 'home' },
    };
    const categoryInfo = categoryConfig[post.category] || { icon: FileText, color: 'text-gray-600', label: 'Post', tab: 'home' };
    const CategoryIcon = categoryInfo.icon;
    const badgeBorderColor = `border-${categoryInfo.color.replace('text-', '')}/20`;
    const backLink = `/community?tab=${categoryInfo.tab}`;

    return (
        <>
        <main className="container mx-auto p-4 md:p-8 max-w-4xl">
             <Button asChild variant="ghost" className="mb-6">
                <Link href={backLink}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Community
                </Link>
            </Button>
            
            {!user ? (
                <Card className="text-center p-12">
                     <div className="mx-auto flex flex-col items-center mb-4">
                       <Lock className="h-16 w-16 text-primary mb-4" />
                       <CardTitle className="text-2xl">Please Log In to View Post</CardTitle>
                       <CardDescription className="mt-2 max-w-sm mx-auto">
                        This content is available to registered members. Log in or create an account to view the full post and join the conversation.
                       </CardDescription>
                    </div>
                    <CardFooter>
                         <Button onClick={() => setIsLoginOpen(true)} className="w-full max-w-xs mx-auto">
                            <LogIn className="mr-2 h-4 w-4" />
                            Log In / Sign Up
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card>
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className={cn("mt-4 w-fit", categoryInfo.color, badgeBorderColor)}>
                                    <CategoryIcon className="mr-1.5 h-3 w-3"/>
                                    {categoryInfo.label}
                                </Badge>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none">
                            {videoEmbedUrl && (
                                <div className="aspect-video w-full not-prose mb-8">
                                    <iframe
                                        src={videoEmbedUrl}
                                        title="Community Video Post"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                            )}
                            <div dangerouslySetInnerHTML={{ __html: post.text }} />
                        </div>
                    </CardContent>
                    
                        <Separator />
                        <CardFooter className="flex-col items-start p-6 space-y-6">
                            <h4 className="font-semibold text-lg">Comments ({post.comments.length})</h4>
                            {post.comments.length > 0 ? (
                                <div className="space-y-4 w-full max-h-96 overflow-y-auto pr-2">
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
                            ) : <p className="text-sm text-muted-foreground">No comments yet. Be the first to reply!</p>}

                            {user ? (
                                <div className="flex items-start gap-2 pt-6 border-t w-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{user.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
                                        <Button onClick={handleAddComment} size="sm" className="mt-2">Add Comment</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full pt-6 border-t text-center">
                                    <Button onClick={() => setIsLoginOpen(true)}>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Log In to Comment
                                    </Button>
                                </div>
                            )}
                        </CardFooter>
                </Card>
            )}
        </main>
        <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
        </>
    );
}
