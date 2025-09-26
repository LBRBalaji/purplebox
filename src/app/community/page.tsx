

'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Users, Video, BookOpen, Calendar, Rss, LogIn, Edit, FileText, Briefcase, Home, Trash2, MoreHorizontal, ArrowRight, Search, Bold, Heading1, Heading2, Heading3, UnfoldHorizontal, Sparkles } from 'lucide-react';
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
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import { findRelevantPosts } from '@/ai/flows/find-relevant-posts';
import { useDebounce } from 'use-debounce';


const createPostSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Post content cannot be empty.').max(5000),
  videoUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Learn', 'Events', 'Stories']),
});

type CreatePostValues = z.infer<typeof createPostSchema>;

const FormatButton = ({ onClick, children, isActive }: { onClick: () => void, children: React.ReactNode, isActive?: boolean }) => (
    <Button 
        type="button" 
        variant={isActive ? 'secondary': 'outline'} 
        size="sm" 
        className="h-8 px-2" 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={onClick}
    >
        {children}
    </Button>
);

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-2 p-2 border-b">
            <FormatButton 
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
            >
                <Bold className="h-4 w-4" />
            </FormatButton>
            <FormatButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
            >
                <Heading1 className="h-4 w-4" />
            </FormatButton>
            <FormatButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                 isActive={editor.isActive('heading', { level: 2 })}
            >
                <Heading2 className="h-4 w-4" />
            </FormatButton>
            <FormatButton 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                 isActive={editor.isActive('heading', { level: 3 })}
            >
                <Heading3 className="h-4 w-4" />
            </FormatButton>
        </div>
    )
}

function CreatePostForm({ postToEdit, onFinished }: { postToEdit?: CommunityPost | null, onFinished: () => void }) {
  const { user } = useAuth();
  const { addCommunityPost, updateCommunityPost } = useData();
  const { toast } = useToast();
  const isEditMode = !!postToEdit;

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { text: '', videoUrl: '', category: 'Stories' },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: '',
    editorProps: {
        attributes: {
            class: 'prose dark:prose-invert max-w-none min-h-[120px] rounded-md rounded-t-none border border-input border-t-0 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        }
    },
    onUpdate({ editor }) {
      form.setValue('text', editor.getHTML(), { shouldValidate: true, shouldDirty: true });
    },
  });

  React.useEffect(() => {
    const initialText = postToEdit?.text || '';
    form.reset({
      id: postToEdit?.id,
      text: initialText,
      videoUrl: postToEdit?.videoUrl || '',
      category: postToEdit?.category || 'Stories',
    });
    if(editor && editor.isEditable) {
        editor.commands.setContent(initialText, false);
    }
  }, [postToEdit, form, editor]);


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
    editor?.commands.clearContent();
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
                   <EditorToolbar editor={editor}/>
                   <EditorContent editor={editor} />
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
            <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid}>
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
  
  const summary = post.text.replace(/<[^>]+>/g, '').substring(0, 150) + (post.text.length > 150 ? '...' : '');
  
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
        <p className="text-sm text-muted-foreground">{summary}</p>
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
    const { user, isLoading: isAuthLoading } = useAuth();
    const { communityPosts, aboutUsContent, updateAboutUsContent, isLoading: isDataLoading, deleteCommunityPost } = useData();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [isLoginOpen, setIsLoginOpen] = React.useState(false);
    const [editingPost, setEditingPost] = React.useState<CommunityPost | null>(null);
    const [isFormVisible, setIsFormVisible] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'home');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchResults, setSearchResults] = React.useState<CommunityPost[] | null>(null);

    const isLoading = isAuthLoading || isDataLoading;
    const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'O2O';

    React.useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [searchParams]);
    
    React.useEffect(() => {
      const performSearch = async () => {
        if (debouncedSearchTerm.trim().length > 2) {
          setIsSearching(true);
          try {
            const result = await findRelevantPosts({
              query: debouncedSearchTerm,
              posts: communityPosts,
            });
            setSearchResults(result.relevantPosts || []);
          } catch (error) {
            console.error("AI search failed:", error);
            toast({
              variant: 'destructive',
              title: 'Search Error',
              description: 'Could not perform AI-powered search.',
            });
            setSearchResults(null); // Fallback to keyword search could be implemented here
          } finally {
            setIsSearching(false);
          }
        } else {
          setSearchResults(null);
        }
      };

      performSearch();
    }, [debouncedSearchTerm, communityPosts, toast]);


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


    const categorizedPosts = React.useMemo(() => {
        const stories = communityPosts.filter(p => p.category === 'Stories').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const learn = communityPosts.filter(p => p.category === 'Learn').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const events = communityPosts.filter(p => p.category === 'Events').sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return { stories, learn, events };
    }, [communityPosts]);
    
    const displayedPosts = React.useMemo(() => {
        if (searchResults) {
            const stories = searchResults.filter(p => p.category === 'Stories');
            const learn = searchResults.filter(p => p.category === 'Learn');
            const events = searchResults.filter(p => p.category === 'Events');
            return { stories, learn, events };
        }
        return categorizedPosts;
    }, [searchResults, categorizedPosts]);


    if (isLoading) {
        return (
             <main className="container mx-auto p-4 md:p-8 space-y-12">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </main>
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
        const showNoResults = (searchTerm && !isSearching && posts.length === 0);
        
        return (
            <div className="space-y-6">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {isSearching && <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />}
                    <Input 
                        placeholder="Ask a question or search posts..."
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
                        <CardTitle>{showNoResults ? 'No Results Found' : emptyTitle}</CardTitle>
                        <CardDescription>{showNoResults ? `Your search for "${searchTerm}" did not return any relevant posts.` : emptyDescription}</CardDescription>
                    </Card>
                )}
            </div>
        )
    }

    const handleCreatePostClick = () => {
        if (!user) {
            setIsLoginOpen(true);
        } else {
            setEditingPost(null);
            setIsFormVisible(true);
        }
    };

    return (
        <>
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
                                    displayedPosts.stories,
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
                                        displayedPosts.learn,
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
                                        displayedPosts.events,
                                        "No Events Posted Yet",
                                        "Check back soon for upcoming events."
                                    )}
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                    
                    {isFormVisible ? (
                         <CreatePostForm postToEdit={editingPost} onFinished={handleFormFinished} />
                    ) : (
                        <div className="text-center mt-12">
                            <Button size="lg" onClick={handleCreatePostClick}>
                               <Send className="mr-2 h-4 w-4" /> Create a New Post
                            </Button>
                        </div>
                    )}
                </main>
            </div>
            <LoginDialog isOpen={isLoginOpen} onOpenChange={setIsLoginOpen} />
        </>
    )
}

