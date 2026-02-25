import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Play, ChevronDown, ChevronRight, Lock, Unlock, Clock, Film, Upload, FileText, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  min_membership: 'free' | 'basic' | 'premium';
  category_id: string;
  sort_order: number;
  week_number: number | null;
  video_type: 'eft' | 'art_therapy' | 'meditation' | 'other';
  is_intro: boolean;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

const accessConfig = {
  free: { label: 'Free', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Unlock },
  basic: { label: 'Basic', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Lock },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Lock },
};

const typeConfig: Record<string, { label: string; emoji: string }> = {
  eft: { label: 'EFT', emoji: '🤲' },
  art_therapy: { label: 'Art Therapy', emoji: '🎨' },
  meditation: { label: 'Meditation', emoji: '🧘' },
  other: { label: 'Other', emoji: '📹' },
};

/** Convert YouTube / Vimeo URL to embed format for iframe playback. */
const toEmbedUrl = (url: string): string => {
  const ytWatch = url.match(/(?:youtube\.com\/watch\?(?:[^&]*&)*v=)([a-zA-Z0-9_-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
  const ytShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}`;
  if (url.includes('youtube.com/embed/')) return url;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  // Workbook state
  const [workbookUrl, setWorkbookUrl] = useState('');
  const [workbookResourceId, setWorkbookResourceId] = useState<string | null>(null);
  const [workbookUploading, setWorkbookUploading] = useState(false);
  const workbookFileRef = useRef<HTMLInputElement>(null);
  // Map of video_id -> resource for showing workbook indicator in list
  const [workbookMap, setWorkbookMap] = useState<Record<string, boolean>>({});

  const defaultForm = {
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    is_free: false,
    min_membership: 'basic' as 'free' | 'basic' | 'premium',
    category_id: '',
    sort_order: '0',
    week_number: 'none',
    video_type: 'other' as 'eft' | 'art_therapy' | 'meditation' | 'other',
    is_intro: false,
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [videosRes, categoriesRes, workbooksRes] = await Promise.all([
      supabase.from('videos').select('*').order('sort_order'),
      supabase.from('video_categories').select('id, name, month_number').order('month_number'),
      supabase.from('resources').select('video_id').not('video_id', 'is', null),
    ]);
    if (videosRes.data) setVideos(videosRes.data as Video[]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (workbooksRes.data) {
      const map: Record<string, boolean> = {};
      workbooksRes.data.forEach((r: any) => { if (r.video_id) map[r.video_id] = true; });
      setWorkbookMap(map);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      ...defaultForm,
      category_id: categories[0]?.id || '',
    });
    setEditingVideo(null);
    setWorkbookUrl('');
    setWorkbookResourceId(null);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration_minutes: video.duration_minutes?.toString() || '',
      is_free: video.is_free,
      min_membership: video.min_membership,
      category_id: video.category_id,
      sort_order: video.sort_order.toString(),
      week_number: video.week_number?.toString() || 'none',
      video_type: video.video_type,
      is_intro: video.is_intro,
    });
    setWorkbookUrl('');
    setWorkbookResourceId(null);
    setFormError('');
    setDialogOpen(true);

    // Fetch workbook in background — dialog is already open
    supabase
      .from('resources')
      .select('id, file_url')
      .eq('video_id', video.id)
      .maybeSingle()
      .then(({ data: workbookData }) => {
        if (workbookData) {
          setWorkbookUrl(workbookData.file_url);
          setWorkbookResourceId(workbookData.id);
        }
      })
      .catch(() => {});
  };

  const handleWorkbookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setWorkbookUploading(true);
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    try {
      const { error } = await supabase.storage
        .from('resources')
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          toast.error('Storage bucket "resources" not found. Create it in Supabase Dashboard → Storage.');
        } else {
          toast.error('Upload error: ' + error.message);
        }
        setWorkbookUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      setWorkbookUrl(urlData.publicUrl);
      toast.success('Workbook uploaded!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setWorkbookUploading(false);
      if (workbookFileRef.current) workbookFileRef.current.value = '';
    }
  };

  const saveWorkbookResource = async (videoId: string, videoData: any) => {
    if (workbookUrl) {
      const resourcePayload = {
        video_id: videoId,
        title: `${videoData.title} — Workbook`,
        resource_type: 'pdf' as const,
        file_url: workbookUrl,
        min_membership: videoData.min_membership,
        is_free: videoData.is_free,
        category_id: videoData.category_id,
        week_number: videoData.week_number,
        sort_order: 0,
      };

      if (workbookResourceId) {
        const { error } = await supabase.from('resources').update(resourcePayload).eq('id', workbookResourceId);
        if (error) { console.error('Workbook update error:', error); toast.error('Workbook save error: ' + error.message); }
      } else {
        const { error } = await supabase.from('resources').insert(resourcePayload);
        if (error) { console.error('Workbook insert error:', error); toast.error('Workbook save error: ' + error.message); }
      }
    } else if (workbookResourceId) {
      const { error } = await supabase.from('resources').delete().eq('id', workbookResourceId);
      if (error) { console.error('Workbook delete error:', error); toast.error('Workbook delete error: ' + error.message); }
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      // Verify session is still valid
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFormError('Session expired. Please sign out and sign back in.');
        setSubmitting(false);
        return;
      }

      const videoData = {
        title: formData.title,
        description: formData.description || null,
        video_url: toEmbedUrl(formData.video_url.trim()),
        thumbnail_url: formData.thumbnail_url || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        is_free: formData.is_free,
        min_membership: formData.min_membership,
        category_id: formData.category_id,
        sort_order: parseInt(formData.sort_order) || 0,
        week_number: formData.week_number && formData.week_number !== 'none' ? parseInt(formData.week_number) : null,
        video_type: formData.video_type,
        is_intro: formData.is_intro,
      };

      if (!videoData.category_id) {
        setFormError('Please select a month');
        setSubmitting(false);
        return;
      }

      if (editingVideo) {
        const { error } = await supabase.from('videos').update(videoData).eq('id', editingVideo.id);
        if (error) { console.error('Video update error:', error); setFormError('Save failed: ' + error.message); setSubmitting(false); return; }

        await saveWorkbookResource(editingVideo.id, videoData);
        toast.success('Video updated');
      } else {
        const { data: insertedVideo, error } = await supabase.from('videos').insert(videoData).select('id').single();
        if (error) { console.error('Video insert error:', error); setFormError('Create failed: ' + error.message); setSubmitting(false); return; }

        if (insertedVideo) {
          await saveWorkbookResource(insertedVideo.id, videoData);
        }
        toast.success('Video added');
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error('handleSubmit crash:', err);
      setFormError('Unexpected error: ' + (err.message || 'Unknown'));
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) { toast.error('Error: ' + error.message); return; }
    toast.success('Deleted');
    fetchData();
  };

  const toggleMonth = (catId: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  // Group videos by category
  const videosByCategory = categories.map((cat) => ({
    ...cat,
    videos: videos.filter((v) => v.category_id === cat.id),
  }));
  const uncategorized = videos.filter((v) => !categories.some((c) => c.id === v.category_id));

  // Stats
  const totalVideos = videos.length;
  const freeCount = videos.filter((v) => v.is_free || v.min_membership === 'free').length;
  const basicCount = videos.filter((v) => v.min_membership === 'basic' && !v.is_free).length;
  const premiumCount = videos.filter((v) => v.min_membership === 'premium' && !v.is_free).length;

  return (
    <div className="space-y-6">
      {/* Stats + Add button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
            <Film className="h-4 w-4" /> <span className="font-medium">{totalVideos}</span> total
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg text-sm text-emerald-700">
            <Unlock className="h-3.5 w-3.5" /> {freeCount} free
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-sm text-amber-700">
            <Lock className="h-3.5 w-3.5" /> {basicCount} basic
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg text-sm text-purple-700">
            <Lock className="h-3.5 w-3.5" /> {premiumCount} premium
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'New Video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>

              {/* Video URL */}
              <div>
                <Label>Video URL (YouTube, Vimeo, or embed link)</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData({ ...formData, video_url: url });
                    // Auto-fill thumbnail from YouTube
                    if (!formData.thumbnail_url) {
                      const ytId = url.match(/(?:youtube\.com\/watch\?(?:[^&]*&)*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
                      if (ytId) setFormData(prev => ({ ...prev, video_url: url, thumbnail_url: `https://img.youtube.com/vi/${ytId[1]}/hqdefault.jpg` }));
                    }
                  }}
                  required
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                />
                {formData.video_url && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Will be saved as: {toEmbedUrl(formData.video_url.trim()).substring(0, 60)}...
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Description (optional)</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
              </div>

              {/* Month + Week row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Month</Label>
                  <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.month_number}. {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Week</Label>
                  <Select value={formData.week_number} onValueChange={(v) => setFormData({ ...formData, week_number: v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      <SelectItem value="1">Week 1</SelectItem>
                      <SelectItem value="2">Week 2</SelectItem>
                      <SelectItem value="3">Week 3</SelectItem>
                      <SelectItem value="4">Week 4</SelectItem>
                      <SelectItem value="5">Bonus (Free)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Type + Access row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.video_type} onValueChange={(v: any) => setFormData({ ...formData, video_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eft">🤲 EFT</SelectItem>
                      <SelectItem value="art_therapy">🎨 Art Therapy</SelectItem>
                      <SelectItem value="meditation">🧘 Meditation</SelectItem>
                      <SelectItem value="other">📹 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <Select value={formData.is_free ? 'free' : formData.min_membership} onValueChange={(v: any) => {
                    if (v === 'free') setFormData({ ...formData, is_free: true, min_membership: 'free' });
                    else setFormData({ ...formData, is_free: false, min_membership: v });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">🟢 Free — anyone</SelectItem>
                      <SelectItem value="basic">🟡 Basic — paid members</SelectItem>
                      <SelectItem value="premium">🟣 Premium — premium only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration + Thumbnail */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} placeholder="10" />
                </div>
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Thumbnail URL (optional — auto-filled for YouTube)</Label>
                <Input value={formData.thumbnail_url} onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })} placeholder="Auto-fills for YouTube videos" />
              </div>

              {/* Workbook PDF */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  Workbook PDF (optional)
                </Label>
                <input
                  ref={workbookFileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleWorkbookUpload}
                />
                {workbookUploading ? (
                  <div className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-gold mx-auto mb-1" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </div>
                ) : workbookUrl ? (
                  <div className="flex items-center gap-2 p-3 border border-gold/30 rounded-lg bg-gold/5">
                    <FileText className="h-5 w-5 text-gold flex-shrink-0" />
                    <span className="text-sm truncate flex-1">{workbookUrl.split('/').pop()}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => workbookFileRef.current?.click()}>
                      Replace
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setWorkbookUrl('')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-4 text-center space-y-2">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground/50" />
                    <p className="text-xs text-muted-foreground">Upload PDF or paste URL below</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => workbookFileRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Choose File
                    </Button>
                  </div>
                )}
                {!workbookUrl && !workbookUploading && (
                  <Input
                    className="mt-2"
                    placeholder="https://... (paste workbook PDF URL and press Enter)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) setWorkbookUrl(val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val) setWorkbookUrl(val);
                    }}
                    onPaste={(e) => {
                      setTimeout(() => {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) setWorkbookUrl(val);
                      }, 0);
                    }}
                  />
                )}
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="is_intro" checked={formData.is_intro} onCheckedChange={(c) => setFormData({ ...formData, is_intro: c })} />
                  <Label htmlFor="is_intro">Intro Video</Label>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingVideo ? 'Save' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos grouped by month */}
      {videosByCategory.map((cat) => (
        <Collapsible
          key={cat.id}
          open={openMonths.has(cat.id)}
          onOpenChange={() => toggleMonth(cat.id)}
        >
          <Card className="border-gold/10">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {openMonths.has(cat.id) ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    <CardTitle className="text-lg font-serif">
                      Month {cat.month_number}: {cat.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">{cat.videos.length} videos</Badge>
                  </div>
                  {/* Mini access breakdown */}
                  <div className="flex gap-1.5">
                    {cat.videos.some((v) => v.is_free || v.min_membership === 'free') && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Has free videos" />
                    )}
                    {cat.videos.some((v) => v.min_membership === 'basic' && !v.is_free) && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title="Has basic videos" />
                    )}
                    {cat.videos.some((v) => v.min_membership === 'premium' && !v.is_free) && (
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" title="Has premium videos" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                {cat.videos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No videos in this month yet</p>
                ) : (
                  <div className="space-y-2">
                    {cat.videos.map((video) => {
                      const access = video.is_free ? accessConfig.free : accessConfig[video.min_membership];
                      const type = typeConfig[video.video_type] || typeConfig.other;
                      return (
                        <div
                          key={video.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-gold/30 hover:bg-muted/20 transition-colors group"
                        >
                          {/* Play icon + title */}
                          <Play className="h-4 w-4 text-gold flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{video.title}</span>
                              {video.is_intro && <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0">Intro</Badge>}
                            </div>
                            {video.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{video.description}</p>
                            )}
                          </div>

                          {/* Workbook indicator */}
                          {workbookMap[video.id] && (
                            <span className="text-xs text-gold hidden sm:flex items-center gap-0.5" title="Has workbook">
                              <FileText className="h-3 w-3" />
                            </span>
                          )}

                          {/* Week */}
                          {video.week_number && (
                            <span className="text-xs text-muted-foreground hidden sm:block">W{video.week_number}</span>
                          )}

                          {/* Type */}
                          <span className="text-sm hidden sm:block" title={type.label}>{type.emoji}</span>

                          {/* Duration */}
                          {video.duration_minutes && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                              <Clock className="h-3 w-3" />{video.duration_minutes}m
                            </span>
                          )}

                          {/* Access badge */}
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${access.color}`}>
                            {access.label}
                          </Badge>

                          {/* Actions */}
                          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(video)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(video.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {/* Uncategorized */}
      {uncategorized.length > 0 && (
        <Card className="border-dashed border-muted-foreground/30">
          <CardHeader className="py-4">
            <CardTitle className="text-lg font-serif text-muted-foreground">Uncategorized</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-4 space-y-2">
            {uncategorized.map((video) => {
              const access = video.is_free ? accessConfig.free : accessConfig[video.min_membership];
              const type = typeConfig[video.video_type] || typeConfig.other;
              return (
                <div key={video.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-gold/30 group">
                  <Play className="h-4 w-4 text-gold flex-shrink-0" />
                  <span className="font-medium text-sm flex-1 truncate">{video.title}</span>
                  <span className="text-sm">{type.emoji}</span>
                  <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${access.color}`}>{access.label}</Badge>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(video)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(video.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {videos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Film className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-serif text-xl mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Add your first video to get started</p>
            <Button className="bg-gold hover:bg-gold-dark text-white" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminVideos;
