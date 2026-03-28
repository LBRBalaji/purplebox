const fs = require('fs');

const part1 = `'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useData } from '@/contexts/data-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { LoginDialog } from '@/components/login-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import { useDebounce } from 'use-debounce';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { CommunityPost } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { Send, BookOpen, Calendar, Briefcase, Search, Bold, Heading1, Heading2, MoreHorizontal, Edit, Trash2, ArrowRight, Video, Headphones, UploadCloud, Plus, TrendingUp, X, FileText } from 'lucide-react';

const createPostSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1).max(10000),
  videoUrl: z.string().url().optional().or(z.literal('')),
  audioUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['Learn', 'Events', 'Stories']),
});
type CreatePostValues = z.infer<typeof createPostSchema>;

const CAT: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  Learn:   { icon: BookOpen,  color: '#065A82', bg: '#EBF5FF', label: 'Learn' },
  Events:  { icon: Calendar,  color: '#7C3AED', bg: '#F3EEFF', label: 'Event' },
  Stories: { icon: Briefcase, color: '#2D6A4F', bg: '#EDFFF4', label: 'Market Story' },
};

const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const btn = (label: React.ReactNode, active: boolean, fn: () => void) => (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={fn}
      className={cn('h-8 w-8 flex items-center justify-center rounded-md text-sm border transition-colors',
        active ? 'bg-[#0D1F3C] text-white border-[#0D1F3C]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#F18F01]')}>
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-1.5 p-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
      {btn(<Bold className="h-3.5 w-3.5" />, editor.isActive('bold'), () => editor.chain().focus().toggleBold().run())}
      {btn(<Heading1 className="h-3.5 w-3.5" />, editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
      {btn(<Heading2 className="h-3.5 w-3.5" />, editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
    </div>
  );
};`;

const part2 = `
function CreatePostForm({ postToEdit, onFinished }: { postToEdit?: CommunityPost | null; onFinished: () => void }) {
  const { user } = useAuth();
  const { addCommunityPost, updateCommunityPost } = useData();
  const { toast } = useToast();
  const isEdit = !!postToEdit;
  const audioRef = React.useRef<HTMLInputElement>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const form = useForm<CreatePostValues>({ resolver: zodResolver(createPostSchema), defaultValues: { text: '', videoUrl: '', audioUrl: '', imageUrl: '', category: 'Stories' } });
  const editor = useEditor({
    extensions: [StarterKit, Heading.configure({ levels: [1, 2, 3] })],
    content: '',
    editorProps: { attributes: { class: 'prose max-w-none min-h-[140px] px-4 py-3 text-sm text-slate-700 focus:outline-none' } },
    onUpdate({ editor }) { form.setValue('text', editor.getHTML(), { shouldValidate: true, shouldDirty: true }); },
  });
  React.useEffect(() => {
    form.reset({ id: postToEdit?.id, text: postToEdit?.text || '', videoUrl: postToEdit?.videoUrl || '', audioUrl: postToEdit?.audioUrl || '', imageUrl: postToEdit?.imageUrl || '', category: postToEdit?.category || 'Stories' });
    if (editor) editor.commands.setContent(postToEdit?.text || '', false);
  }, [postToEdit, form, editor]);
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'audioUrl' | 'imageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
      const { url } = await res.json();
      form.setValue(field, url, { shouldValidate: true });
      toast({ title: 'Uploaded!' });
    } catch (err: any) { toast({ variant: 'destructive', title: 'Upload failed', description: err.message }); }
    finally { setUploading(false); }
  };
  const onSubmit = (data: CreatePostValues) => {
    if (!user) return;
    if (isEdit && data.id) {
      updateCommunityPost({ ...postToEdit!, text: data.text, videoUrl: data.videoUrl || undefined, audioUrl: data.audioUrl || undefined, imageUrl: data.imageUrl || undefined, category: data.category });
      toast({ title: 'Post updated!' });
    } else {
      addCommunityPost({ authorEmail: user.email, authorName: user.userName, authorCompanyName: user.companyName, text: data.text, videoUrl: data.videoUrl || undefined, audioUrl: data.audioUrl || undefined, imageUrl: data.imageUrl || undefined, category: data.category });
      toast({ title: 'Post published!' });
    }
    form.reset(); editor?.commands.clearContent(); onFinished();
  };
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#0D1F3C]">{isEdit ? 'Edit Post' : 'Create a Post'}</h2>
          <button onClick={onFinished} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100"><X className="h-4 w-4 text-slate-500" /></button>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-[#0D1F3C] text-white font-bold">{user.userName.charAt(0)}</AvatarFallback></Avatar>
                <div><p className="font-semibold text-sm text-[#0D1F3C]">{user.userName}</p><p className="text-xs text-slate-500">{user.companyName}</p></div>
              </div>
              <FormField control={form.control} name="text" render={() => (
                <div className="border border-slate-200 rounded-xl overflow-hidden"><EditorToolbar editor={editor} /><EditorContent editor={editor} /></div>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel className="text-sm font-semibold text-slate-700">Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Stories">Market Story / Development</SelectItem>
                      <SelectItem value="Learn">Learn / Tutorial</SelectItem>
                      <SelectItem value="Events">Event / Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="videoUrl" render={({ field }) => (
                <FormItem><FormLabel className="text-sm font-semibold text-slate-700">Video URL</FormLabel><FormControl><Input {...field} placeholder="YouTube / Vimeo URL" className="rounded-xl border-slate-200" /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="audioUrl" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold text-slate-700">Audio</FormLabel>
                    <div className="flex gap-2"><FormControl><Input {...field} placeholder="URL or upload" className="rounded-xl border-slate-200 text-xs" /></FormControl>
                      <Button type="button" size="icon" variant="outline" className="rounded-xl flex-shrink-0" onClick={() => audioRef.current?.click()} disabled={uploading}><UploadCloud className="h-4 w-4" /></Button>
                      <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={(e) => uploadFile(e, 'audioUrl')} />
                    </div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold text-slate-700">Cover Image</FormLabel>
                    <div className="flex gap-2"><FormControl><Input {...field} placeholder="URL or upload" className="rounded-xl border-slate-200 text-xs" /></FormControl>
                      <Button type="button" size="icon" variant="outline" className="rounded-xl flex-shrink-0" onClick={() => imageRef.current?.click()} disabled={uploading}><UploadCloud className="h-4 w-4" /></Button>
                      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadFile(e, 'imageUrl')} />
                    </div>
                  </FormItem>
                )} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 pb-6">
              <Button type="button" variant="outline" onClick={onFinished} className="rounded-xl px-6">Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isValid} className="rounded-xl px-6 bg-[#0D1F3C] hover:bg-[#132840] text-white">
                <Send className="mr-2 h-4 w-4" />{isEdit ? 'Save Changes' : 'Publish'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}`;

const part3 = `
function PostCard({ post, onEdit, onDelete }: { post: CommunityPost; onEdit: (p: CommunityPost) => void; onDelete: (id: string) => void }) {
  const { user, users } = useAuth();
  const author = users[post.authorEmail] || { userName: post.authorName, companyName: post.authorCompanyName };
  const canModify = user?.email === post.authorEmail || user?.role === 'SuperAdmin' || user?.role === 'O2O';
  const cat = CAT[post.category] || CAT.Stories;
  const CatIcon = cat.icon;
  const summary = post.text.replace(/<[^>]+>/g, '').substring(0, 160) + (post.text.length > 160 ? '...' : '');
  const initials = author.userName?.charAt(0)?.toUpperCase() || '?';
  const dateStr = new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col group">
      {post.imageUrl && (
        <div className="relative h-44 overflow-hidden flex-shrink-0">
          <Image src={post.imageUrl} alt="Post cover" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: cat.color, background: cat.bg }}>
            <CatIcon className="h-3 w-3" />{cat.label}
          </span>
          {post.videoUrl && <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-500"><Video className="h-3 w-3" />Video</span>}
          {post.audioUrl && <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-500"><Headphones className="h-3 w-3" />Audio</span>}
        </div>
        <p className="text-slate-700 text-sm leading-relaxed flex-1 mb-5">{summary}</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-[#0D1F3C] text-white text-xs font-bold">{initials}</AvatarFallback></Avatar>
            <div><p className="text-xs font-semibold text-[#0D1F3C]">{author.userName}</p><p className="text-xs text-slate-400">{dateStr}</p></div>
          </div>
          <div className="flex items-center gap-1">
            {canModify && (
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100"><MoreHorizontal className="h-4 w-4 text-slate-400" /></button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit(post)} className="rounded-lg"><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500 rounded-lg"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader><AlertDialogTitle>Delete this post?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(post.id)} className="rounded-xl bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Link href={'/community/' + post.id}>
              <button className="h-7 px-3 flex items-center gap-1 rounded-lg bg-[#0D1F3C] text-white text-xs font-medium hover:bg-[#132840] transition-colors">Read <ArrowRight className="h-3 w-3" /></button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Icon className="h-8 w-8 text-slate-300" /></div>
    <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
  </div>
);

const StatPill = ({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
    <Icon className="h-5 w-5 text-[#F18F01]" />
    <div><div className="text-white font-black text-lg leading-none">{value}</div><div className="text-white/60 text-xs mt-0.5">{label}</div></div>
  </div>
);

const TabBtn = ({ active, onClick, icon: Icon, label, count }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string; count: number }) => (
  <button onClick={onClick} className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
    active ? 'bg-[#0D1F3C] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100')}>
    <Icon className="h-4 w-4" />{label}
    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-bold', active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>{count}</span>
  </button>
);`;

const part4 = `
function CommunityPageInner() {
  const { user, isLoading: authLoading } = useAuth();
  const { communityPosts, isLoading: dataLoading, deleteCommunityPost } = useData();
  const searchParams = useSearchParams();
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<CommunityPost | null>(null);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [activeTab, setActiveTab] = React.useState(searchParams.get('tab') || 'all');

  React.useEffect(() => { const tab = searchParams.get('tab'); if (tab) setActiveTab(tab); }, [searchParams]);

  const sorted = React.useMemo(() => [...communityPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [communityPosts]);

  const filtered = React.useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    const bySearch = q ? sorted.filter(p => p.text.replace(/<[^>]+>/g, '').toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q) || p.authorCompanyName?.toLowerCase().includes(q)) : sorted;
    if (activeTab === 'all') return bySearch;
    const map: Record<string, string> = { stories: 'Stories', learn: 'Learn', events: 'Events' };
    return bySearch.filter(p => p.category === map[activeTab]);
  }, [sorted, debouncedSearch, activeTab]);

  const counts = React.useMemo(() => ({
    all: sorted.length,
    stories: sorted.filter(p => p.category === 'Stories').length,
    learn: sorted.filter(p => p.category === 'Learn').length,
    events: sorted.filter(p => p.category === 'Events').length,
  }), [sorted]);

  const handleCreate = () => { if (!user) { setLoginOpen(true); return; } setEditingPost(null); setFormOpen(true); };
  const handleEdit = (post: CommunityPost) => { setEditingPost(post); setFormOpen(true); };
  const handleDelete = (id: string) => deleteCommunityPost(id);
  const handleFormClose = () => { setFormOpen(false); setEditingPost(null); };

  if (authLoading || dataLoading) return (
    <div className="container mx-auto p-8 space-y-6">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <>
      {formOpen && <CreatePostForm postToEdit={editingPost} onFinished={handleFormClose} />}
      <LoginDialog isOpen={loginOpen} onOpenChange={setLoginOpen} />
      <div className="min-h-screen bg-[#F8F9FB]">
        <section className="bg-[#0D1F3C] pt-16 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, #F18F01, transparent 50%), radial-gradient(circle at 90% 20%, #7C3AED, transparent 50%)' }} />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#F18F01]/10 border border-[#F18F01]/30 rounded-full px-4 py-1.5 mb-6">
                <div className="h-2 w-2 rounded-full bg-[#F18F01]" />
                <span className="text-[#F18F01] text-xs font-bold tracking-widest uppercase">ORS-ONE Community</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">Share. Learn. Grow.<span className="block text-[#F18F01]">Together.</span></h1>
              <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">The professional community for warehouse market stakeholders — developers, tenants, brokers and industry experts.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <StatPill icon={FileText} value={String(counts.all)} label="Total Posts" />
              <StatPill icon={Briefcase} value={String(counts.stories)} label="Market Stories" />
              <StatPill icon={BookOpen} value={String(counts.learn)} label="Learning Posts" />
              <StatPill icon={Calendar} value={String(counts.events)} label="Events" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts, authors, companies..."
                  className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F18F01]/50 transition-all" />
              </div>
              <button onClick={handleCreate} className="flex items-center justify-center gap-2 bg-[#F18F01] hover:bg-[#E07309] text-white font-bold px-6 py-3 rounded-xl transition-colors flex-shrink-0">
                <Plus className="h-4 w-4" />Create Post
              </button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
            <TabBtn active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={TrendingUp} label="All Posts" count={counts.all} />
            <TabBtn active={activeTab === 'stories'} onClick={() => setActiveTab('stories')} icon={Briefcase} label="Market Stories" count={counts.stories} />
            <TabBtn active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={BookOpen} label="Learn" count={counts.learn} />
            <TabBtn active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={Calendar} label="Events" count={counts.events} />
          </div>

          {filtered.length === 0 ? (
            <div className="grid grid-cols-1">
              <EmptyState icon={activeTab === 'learn' ? BookOpen : activeTab === 'events' ? Calendar : Briefcase}
                title={debouncedSearch ? 'No results found' : 'No posts yet'}
                desc={debouncedSearch ? \`No posts match "\${debouncedSearch}"\` : 'Be the first to share something with the community.'} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(post => <PostCard key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} />)}
            </div>
          )}

          {!user && filtered.length > 0 && (
            <div className="mt-12 bg-[#0D1F3C] rounded-2xl p-8 text-center">
              <h3 className="text-xl font-black text-white mb-2">Join the Conversation</h3>
              <p className="text-white/60 text-sm mb-5">Sign in to create posts, share insights and engage with the community.</p>
              <button onClick={() => setLoginOpen(true)} className="bg-[#F18F01] hover:bg-[#E07309] text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm">Sign In to Post</button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function CommunityPage() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-4 border-[#F18F01] border-t-transparent rounded-full animate-spin" /></div>}>
      <CommunityPageInner />
    </React.Suspense>
  );
}`;

fs.writeFileSync('src/app/community/page.tsx', part1 + part2 + part3 + part4);
console.log('Community page written!');
