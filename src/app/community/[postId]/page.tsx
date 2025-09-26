

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, BookOpen, Calendar, Briefcase, FileText, LogIn, Lock, Headphones, Share, Mail, Linkedin, Twitter, Facebook, Sparkles, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { LoginDialog } from '@/components/login-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { CommunityPost } from '@/lib/schema';
import { findRelevantPosts } from '@/ai/flows/find-relevant-posts';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.919 6.066l-1.285 4.685 4.758-1.241z"
      />
    </svg>
);

function ShareDropdown({ post }: { post: CommunityPost }) {
    const { user } = useAuth();
    const { logShareActivity } = useData();
    const [currentUrl, setCurrentUrl] = React.useState('');

    React.useEffect(() => {
        setCurrentUrl(window.location.href);
    }, []);

    const handleShare = (platform: 'Email' | 'LinkedIn' | 'Twitter' | 'Facebook' | 'WhatsApp') => {
        if (!user) return;
        logShareActivity({
            postId: post.id,
            postTitle: post.text.substring(0, 100),
            sharedByEmail: user.email,
            sharedByName: user.userName,
            platform,
        });
    };

    if (!currentUrl) return null;
    
    const postTitle = post.text.replace(/<[^>]+>/g, '').substring(0, 100);
    const text = encodeURIComponent(`Check out this post on Lakshmi Balaji O2O: ${postTitle}...`);
    const emailSubject = encodeURIComponent(`Interesting Post from Lakshmi Balaji O2O`);
    const emailBody = encodeURIComponent(`I thought you might be interested in this post: "${postTitle}..."\n\nRead more here: ${currentUrl}`);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Share className="mr-2 h-4 w-4" /> Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem asChild>
                    <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} target="_blank" rel="noopener noreferrer" onClick={() => handleShare('Email')}>
                        <Mail className="mr-2 h-4 w-4" /> Email
                    </a>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${text}`} target="_blank" rel="noopener noreferrer" onClick={() => handleShare('LinkedIn')}>
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </a>
                 </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${text}`} target="_blank" rel="noopener noreferrer" onClick={() => handleShare('Twitter')}>
                        <Twitter className="mr-2 h-4 w-4" /> X / Twitter
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" onClick={() => handleShare('Facebook')}>
                        <Facebook className="mr-2 h-4 w-4" /> Facebook
                    </a>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <a href={`https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(currentUrl)}`} target="_blank" rel="noopener noreferrer" onClick={() => handleShare('WhatsApp')}>
                        <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
                    </a>
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const RelevantPostCard = ({ post }: { post: CommunityPost }) => {
    const summary = post.text.replace(/<[^>]+>/g, '').substring(0, 80) + '...';
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-base line-clamp-2">{post.text.match(/<h[1-6]>(.*?)<\/h[1-6]>/)?.[1] || summary}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-xs text-muted-foreground">{summary}</p>
            </CardContent>
            <CardFooter>
                 <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href={`/community/${post.id}`}>Read Post <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function CommunityPostPage() {
    const { postId } = useParams();
    const router = useRouter();
    const { user, users, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, addCommunityComment, isLoading: isDataLoading } = useData();
    const { toast } = useToast();
    const [comment, setComment] = React.useState('');
    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [relevantPosts, setRelevantPosts] = React.useState<CommunityPost[]>([]);
    const [isFetchingRelevant, setIsFetchingRelevant] = React.useState(false);

    const post = React.useMemo(() => {
        return communityPosts.find(p => p.id === postId);
    }, [communityPosts, postId]);
    
    const isLoading = isAuthLoading || isDataLoading;

     React.useEffect(() => {
        if (post && communityPosts.length > 1) {
            const fetchRelevant = async () => {
                setIsFetchingRelevant(true);
                try {
                    const otherPosts = communityPosts.filter(p => p.id !== post.id);
                    const result = await findRelevantPosts({
                        query: post.text.substring(0, 500), // Use first 500 chars as query
                        posts: otherPosts,
                    });
                    // Take top 3 results
                    setRelevantPosts(result.relevantPosts.slice(0, 3));
                } catch (error) {
                    console.error("Failed to fetch relevant posts:", error);
                } finally {
                    setIsFetchingRelevant(false);
                }
            };
            fetchRelevant();
        }
    }, [post, communityPosts]);

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
        <main className="container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
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
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback>{author.userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{author.userName}</p>
                                    <p className="text-xs text-muted-foreground -mt-0.5">{author.companyName}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                        <Badge variant="outline" className={cn("w-fit", categoryInfo.color, badgeBorderColor)}>
                                            <CategoryIcon className="mr-1.5 h-3 w-3"/>
                                            {categoryInfo.label}
                                        </Badge>
                                        <span>&bull;</span>
                                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <ShareDropdown post={post} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none">
                            {post.audioUrl && (
                                <div className="not-prose mb-8">
                                    <audio controls src={post.audioUrl} className="w-full">
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
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

            {relevantPosts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold font-headline tracking-tight mb-6 flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" /> You Might Also Like
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relevantPosts.map(p => (
                            <RelevantPostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>
            )}

        </main>
        <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
        </>
    );
}
