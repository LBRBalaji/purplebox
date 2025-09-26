

'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, Video, BookOpen, Calendar, Rss, LogIn, Edit, FileText, Briefcase, Home, Trash2, MoreHorizontal, ArrowRight, Search, Bold, Heading1, Heading2, Heading3, UnfoldHorizontal } from 'lucide-react';
import { useForm, type UseFormReturn } from 'react-hook-form';
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
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const createPostSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Post content cannot be empty.').max(5000),
  videoUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Learn', 'Events', 'Stories']),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

const FormatButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <Button type="button" variant="outline" size="sm" className="h-8 px-2" onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
        {children}
    </Button>
);

function CreatePostForm({ postToEdit, onFinished }: { postToEdit?: CommunityPost | null, onFinished: () => void }) {
  const { user } = useAuth();
  const { addCommunityPost, updateCommunityPost } = useData();
  const { toast } = useToast();
  
  const isEditMode = !!postToEdit;
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [editorContent, setEditorContent] = React.useState('');

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { text: '', videoUrl: '', category: 'Stories' },
  });

  const applyFormat = (command: 'bold' | 'formatBlock' | 'insertHTML', value?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'insertHTML' && value === '<!--more-->') {
        const visualBreak = `<div class="page-break my-4 border-t border-dashed relative text-center"><span class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">Read More</span></div>`;
        document.execCommand('insertHTML', false, visualBreak);
    } else {
        document.execCommand(command, false, value);
    }
    // After executing a command, update the form state
    const newContent = editorRef.current.innerHTML;
    setEditorContent(newContent);
    form.setValue('text', newContent.replace(/<div class="page-break.*?<\/div>/g, '<!--more-->'), { shouldValidate: true, shouldDirty: true });
  };
  
  React.useEffect(() => {
    const initialText = postToEdit?.text || '';
    const visualText = initialText.replace(/<!--more-->/g, `<div class="page-break my-4 border-t border-dashed relative text-center"><span class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-card px-2 text-xs text-muted-foreground">Read More</span></div>`);
    
    form.reset({
      id: postToEdit?.id,
      text: initialText,
      videoUrl: postToEdit?.videoUrl || '',
      category: postToEdit?.category || 'Stories',
    });
    setEditorContent(visualText);

  }, [postToEdit, form]);
  
  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
      const currentContent = e.currentTarget.innerHTML;
      const machineReadableContent = currentContent.replace(/<div class="page-break.*?<\/div>/g, '<!--more-->');
      
      setEditorContent(currentContent);
      form.setValue('text', machineReadableContent, { shouldValidate: true, shouldDirty: true });
  };

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
    setEditorContent('');
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
              render={() => (
                <FormItem>
                   <div className="flex items-center gap-2 p-2 border-b">
                        <FormatButton onClick={() => applyFormat('bold')}><Bold className="h-4 w-4" /></FormatButton>
                        <FormatButton onClick={() => applyFormat('formatBlock', '<h1>')}><Heading1 className="h-4 w-4" /></FormatButton>
                        <FormatButton onClick={() => applyFormat('formatBlock', '<h2>')}><Heading2 className="h-4 w-4" /></FormatButton>
                        <FormatButton onClick={() => applyFormat('formatBlock', '<h3>')}><Heading3 className="h-4 w-4" /></FormatButton>
                        <Separator orientation="vertical" className="h-6" />
                        <FormatButton onClick={() => applyFormat('insertHTML', '<!--more-->')}><UnfoldHorizontal className="h-4 w-4" /></FormatButton>
                    </div>
                  <FormControl>
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      className="prose dark:prose-invert max-w-none min-h-[120px] rounded-md rounded-t-none border border-input border-t-0 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      dangerouslySetInnerHTML={{ __html: editorContent }}
                    />
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
                   <Select onValueChange={field.onChange} value={field.value}>
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

function CommunityPostCard({ post, onEdit, onDelete }: { post: CommunityPost; onEdit: (post: CommunityPost) => void; onDelete: (postId: string) => void; }) {
  const { user, users } = useAuth();
  
  const author = users[post.authorEmail] || { userName: post.authorName, companyName: post.authorCompanyName };
  const canModify = user?.email === post.authorEmail || user?.role === 'SuperAdmin' || user?.role === 'O2O';
  
  const categoryConfig: { [key: string]: { icon: React.ElementType, color: string, label: string } } = {
    Learn: { icon: BookOpen, color: 'text-blue-600', label: 'Learn' },
    Events: { icon: Calendar, color: 'text-purple-600', label: 'Event' },
    Stories: { icon: Briefcase, color: 'text-green-600', label: 'Market Story' },
  };
  const categoryInfo = categoryConfig[post.category] || { icon: FileText, color: 'text-gray-600', label: 'Post' };
  const CategoryIcon = categoryInfo.icon;
  const badgeBorderColor = `border-${categoryInfo.color.replace('text-', '')}/20`;
  
  const readMoreSplit = post.text.split('<!--more-->');
  const summary = readMoreSplit.length > 1 ? readMoreSplit[0] : (post.text.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...');
  
  return (
    <Card className="flex flex-col">
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
                 <p className="text-xs text-muted-foreground ml-auto shrink-0">{new Date(post.createdAt).toLocaleDateString()}</p>
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
                                <AlertDialogAction onClick={() => onDelete(post.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
             </div>
        </div>
        <Badge variant="outline" className={cn("mt-4 w-fit", categoryInfo.color, badgeBorderColor)}>
            <CategoryIcon className="mr-1.5 h-3 w-3"/>
            {categoryInfo.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: summary }} />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
            <Link href={`/community/${post.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4"/></Link>
        </Button>
      </CardFooter>
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
    const { user, users, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, aboutUsContent, updateAboutUsContent, isLoading: isDataLoading, deleteCommunityPost } = useData();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState<CommunityPost | null>(null);
    const [isFormVisible, setIsFormVisible] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'home');

    const isLoading = isAuthLoading || isDataLoading;
    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

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
    
    const handleDeletePost = (postId: string) => {
      deleteCommunityPost(postId);
      toast({ title: "Post Deleted", description: "The post has been permanently removed." });
    };

    const handleFormFinished = () => {
        setIsFormVisible(false);
        setEditingPost(null);
    }


    const filteredCategorizedPosts = React.useMemo(() => {
        let filteredPosts = communityPosts;

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            filteredPosts = communityPosts.filter(post => 
                post.text.toLowerCase().includes(lowerCaseSearch) ||
                (users[post.authorEmail]?.userName.toLowerCase().includes(lowerCaseSearch))
            );
        }

        const stories = filteredPosts.filter(p => p.category === 'Stories').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const learn = filteredPosts.filter(p => p.category === 'Learn').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const events = filteredPosts.filter(p => p.category === 'Events').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { stories, learn, events };
    }, [communityPosts, searchTerm, users]);

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

    const renderPostGrid = (posts: CommunityPost[], emptyTitle: string, emptyDescription: string) => {
        return (
            <div className="space-y-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search posts..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map(post => <CommunityPostCard key={post.id} post={post} onEdit={handleEditPost} onDelete={handleDeletePost} />)}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <CardTitle>{emptyTitle}</CardTitle>
                        <CardDescription>{emptyDescription}</CardDescription>
                    </Card>
                )}
            </div>
        )
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
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                            {renderPostGrid(
                                filteredCategorizedPosts.stories,
                                "No Market Developments Posted Yet",
                                "Check back soon for updates from developers and industry experts."
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
                            <div className="mt-8">
                                {renderPostGrid(
                                    filteredCategorizedPosts.learn,
                                    "No Tutorials Posted Yet",
                                    "Check back soon for guides and tips."
                                )}
                            </div>
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
                             <div className="mt-8">
                                {renderPostGrid(
                                    filteredCategorizedPosts.events,
                                    "No Events Posted Yet",
                                    "Check back soon for upcoming events."
                                )}
                            </div>
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
