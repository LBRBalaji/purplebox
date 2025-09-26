
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, Video, BookOpen, Calendar, Rss, LogIn, Edit, FileText, Briefcase, Home, Trash2, MoreHorizontal } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

const createPostSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Post content cannot be empty.').max(5000),
  videoUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Learn', 'Events', 'Stories']),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

function CreatePostForm({ postToEdit, onFinished }: { postToEdit?: CommunityPost | null, onFinished: () => void }) {
  const { user } = useAuth();
  const { addCommunityPost, updateCommunityPost } = useData();
  const { toast } = useToast();
  
  const isEditMode = !!postToEdit;

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { text: '', videoUrl: '', category: 'Stories' },
  });

  React.useEffect(() => {
    if (postToEdit) {
      form.reset({
        id: postToEdit.id,
        text: postToEdit.text,
        videoUrl: postToEdit.videoUrl || '',
        category: postToEdit.category,
      });
    } else {
        form.reset({ text: '', videoUrl: '', category: 'Stories', id: undefined });
    }
  }, [postToEdit, form]);

  const onSubmit = (data: CreatePostValues) => {
    if (!user) return;
    
    if (isEditMode && data.id) {
        const updatedPost: CommunityPost = {
            ...postToEdit!,
            text: data.text,
            videoUrl: data.videoUrl || undefined,
            category: data.category,
        };
        updateCommunityPost(updatedPost);
        toast({ title: "Post Updated", description: "Your post has been successfully updated." });
    } else {
        addCommunityPost({
            authorEmail: user.email,
            authorName: user.userName,
            authorCompanyName: user.companyName,
            text: data.text,
            videoUrl: data.videoUrl || undefined,
            category: data.category,
        });
        toast({ title: "Post Created", description: "Your post is now live in the community." });
    }
    
    form.reset();
    onFinished();
  };

  if (!user) return null;
  const isAdminOrDeveloper = user.role === 'SuperAdmin' || user.role === 'O2O' || user.role === 'Warehouse Developer';


  return (
    <Card className="mt-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{isEditMode ? "Edit Post" : "Create a New Post"}</CardTitle>
             <CardDescription>{isEditMode ? "Modify your post details below." : "Share an update, tutorial, or story with the community."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} placeholder={`What's on your mind, ${user.userName}? You can use HTML tags like <h3> or <strong> for formatting.`} className="min-h-[100px]" />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional: Paste a YouTube/Vimeo URL" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                   <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Stories">Stories (Developments/Markets)</SelectItem>
                        <SelectItem value="Learn">Learn (Videos/Tutorials)</SelectItem>
                        <SelectItem value="Events">Events & Announcements</SelectItem>
                    </SelectContent>
                   </Select>
                </FormItem>
              )}
            />
             {!isAdminOrDeveloper && form.watch('category') === 'Stories' && (
                <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>The "Latest Developments" section is primarily for developers and industry experts. Your post may be reviewed by an admin.</AlertDescription>
                </Alert>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={onFinished}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Send className="mr-2 h-4 w-4" /> {isEditMode ? "Save Changes" : "Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

function CommunityPostCard({ post, onEdit }: { post: CommunityPost; onEdit: (post: CommunityPost) => void; }) {
  const { user, users } = useAuth();
  const { addCommunityComment, deleteCommunityPost } = useData();
  const { toast } = useToast();
  const [comment, setComment] = React.useState('');

  const author = users[post.authorEmail] || { userName: post.authorName, companyName: post.authorCompanyName };
  
  const canModify = user?.email === post.authorEmail || user?.role === 'SuperAdmin' || user?.role === 'O2O';

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
  
  const handleDelete = () => {
    deleteCommunityPost(post.id);
    toast({ title: "Post Deleted", description: "The post has been permanently removed." });
  }

  const isYouTube = post.videoUrl?.includes('youtube.com') || post.videoUrl?.includes('youtu.be');
  let videoEmbedUrl = '';

  if (post.videoUrl && isYouTube) {
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
             <div className="flex items-center gap-1">
                 <p className="text-xs text-muted-foreground ml-auto shrink-0">{new Date(post.createdAt).toLocaleString()}</p>
                {canModify && (
                     <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(post)}>
                                    <Edit className="mr-2 h-4 w-4"/> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this post and all its comments.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
             </div>
        </div>
        <Badge variant="outline" className={cn("mt-4", categoryInfo.color, badgeBorderColor)}>
            <CategoryIcon className="mr-1.5 h-3 w-3"/>
            {categoryInfo.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.text }} />
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

const EditableImage = ({ src, onImageChange, alt, hint, isAdmin, className = 'w-full h-full object-cover' }: { src: string, onImageChange: (newSrc: string) => void, alt: string, hint: string, isAdmin: boolean, className?: string }) => {
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
            <Image src={src} alt={alt} width={1200} height={500} className={className} data-ai-hint={hint} />
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
    const [editingPost, setEditingPost] = React.useState<CommunityPost | null>(null);
    const [isFormVisible, setIsFormVisible] = React.useState(false);

    const isLoading = isAuthLoading || isDataLoading;
    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    const handleImageChange = (key: keyof typeof aboutUsContent) => (newSrc: string) => {
        if (aboutUsContent) {
            updateAboutUsContent({ ...aboutUsContent, [key]: newSrc });
        }
    };
    
    const handleEditPost = (post: CommunityPost) => {
        setEditingPost(post);
        setIsFormVisible(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    const handleFormFinished = () => {
        setIsFormVisible(false);
        setEditingPost(null);
    }


    const categorizedPosts = React.useMemo(() => {
        const stories = communityPosts.filter(p => p.category === 'Stories').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const learn = communityPosts.filter(p => p.category === 'Learn').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const events = communityPosts.filter(p => p.category === 'Events').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { stories, learn, events };
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

             <main className="container mx-auto p-4 md:p-8">
                 <Tabs defaultValue="home">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="home"><Home className="mr-2 h-4 w-4"/> Home</TabsTrigger>
                        <TabsTrigger value="learn"><BookOpen className="mr-2 h-4 w-4"/> Learn</TabsTrigger>
                        <TabsTrigger value="events"><Calendar className="mr-2 h-4 w-4"/> Events</TabsTrigger>
                    </TabsList>
                    <TabsContent value="home" className="mt-8">
                        <section>
                            <div className="mb-8 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Latest Developments & Markets</h2>
                                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                   Insights from developers on upcoming projects and analysis from industry experts.
                                </p>
                            </div>
                            {categorizedPosts.stories.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categorizedPosts.stories.map(post => <CommunityPostCard key={post.id} post={post} onEdit={handleEditPost} />)}
                                </div>
                            ) : (
                                <Card className="text-center p-12">
                                    <CardTitle>No Market Developments Posted Yet</CardTitle>
                                    <CardDescription>Check back soon for updates from developers and industry experts.</CardDescription>
                                </Card>
                            )}
                        </section>
                    </TabsContent>
                    <TabsContent value="learn" className="mt-8">
                         <section>
                             <div className="mb-8 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Learn & Grow</h2>
                                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                   Learn how to best take advantage of O2O features and functionality.
                                </p>
                            </div>
                            <EditableImage 
                                src={aboutUsContent.feature2}
                                onImageChange={handleImageChange('feature2')}
                                alt="Learning"
                                hint="person using laptop learning"
                                isAdmin={isAdmin}
                                className="w-full h-[400px] object-cover"
                            />
                            {categorizedPosts.learn.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                    {categorizedPosts.learn.map(post => <CommunityPostCard key={post.id} post={post} onEdit={handleEditPost} />)}
                                </div>
                             ) : (
                                <Card className="text-center p-12 mt-8">
                                    <CardTitle>No Tutorials Posted Yet</CardTitle>
                                    <CardDescription>Check back soon for guides and tips.</CardDescription>
                                </Card>
                            )}
                        </section>
                    </TabsContent>
                    <TabsContent value="events" className="mt-8">
                         <section>
                             <div className="mb-8 text-center">
                                <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Events & Announcements</h2>
                                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                                   Stay updated with our upcoming webinars, meetups, and platform announcements.
                                </p>
                            </div>
                            <EditableImage 
                                src={aboutUsContent.feature3}
                                onImageChange={handleImageChange('feature3')}
                                alt="Events"
                                hint="community event networking"
                                isAdmin={isAdmin}
                                className="w-full h-[400px] object-cover"
                            />
                             {categorizedPosts.events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                    {categorizedPosts.events.map(post => <CommunityPostCard key={post.id} post={post} onEdit={handleEditPost} />)}
                                </div>
                            ) : (
                                <Card className="text-center p-12 mt-8">
                                    <CardTitle>No Events Posted Yet</CardTitle>
                                    <CardDescription>Check back soon for upcoming events.</CardDescription>
                                </Card>
                            )}
                        </section>
                    </TabsContent>
                </Tabs>
                
                {isFormVisible && (
                     <CreatePostForm postToEdit={editingPost} onFinished={handleFormFinished} />
                )}
               
                {!isFormVisible && (
                    <div className="text-center mt-12">
                        <Button size="lg" onClick={() => {
                            setEditingPost(null);
                            setIsFormVisible(true);
                        }}>
                           <Send className="mr-2 h-4 w-4" /> Create a New Post
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}
