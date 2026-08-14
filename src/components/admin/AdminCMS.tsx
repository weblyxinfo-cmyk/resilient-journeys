import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, RotateCcw, ExternalLink, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CMSContent {
  id: string;
  key: string;
  value: string;
  description: string | null;
  page: string;
  section: string | null;
  field_type: 'text' | 'textarea' | 'html' | 'image_url' | 'video_url';
  sort_order: number;
  default_value: string | null;
}

// Static list, not derived from existing rows — a page with zero seeded
// content used to have no tab at all, making it impossible to add its first
// field from the admin.
const PAGES = [
  'homepage', 'about', 'pricing', 'booking', 'membership', 'resilient-hub',
  'resilient-hubs', 'free-guide', 'endometriosis', 'blog', 'footer', 'navbar',
  'legal', 'shared',
];

// Only pages that map to a single real route get a "view on site" link.
// footer/navbar/legal/shared span multiple pages, so there is no one URL.
const PAGE_TO_PATH: Record<string, string> = {
  homepage: '/',
  about: '/about',
  pricing: '/pricing',
  booking: '/booking',
  membership: '/membership',
  'resilient-hub': '/resilient-hub',
  'resilient-hubs': '/resilient-hubs',
  'free-guide': '/free-guide',
  endometriosis: '/endometriosis-hub',
  blog: '/blog',
};

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: '',
  pending: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Error saving',
};

const AUTOSAVE_DELAY_MS = 800;

// Grows with the value instead of a fixed `rows`, so a one-line field isn't
// three empty rows tall and a long paragraph isn't a tiny scrollbox.
const AutoTextarea = ({
  value,
  onChange,
  onBlur,
  fieldType,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  fieldType: CMSContent['field_type'];
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      rows={fieldType === 'html' ? 6 : 3}
      className="resize-none overflow-hidden"
    />
  );
};

const SaveIndicator = ({ status }: { status: SaveStatus }) => {
  if (status === 'idle' || !STATUS_LABEL[status]) return null;
  const color =
    status === 'error' ? 'text-destructive' : status === 'saved' ? 'text-green-600' : 'text-muted-foreground';
  return <span className={`text-xs ${color}`}>{STATUS_LABEL[status]}</span>;
};

const AdminCMS = () => {
  const queryClient = useQueryClient();

  const [content, setContent] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CMSContent | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});

  // Latest typed value per row, read by the debounce timer / blur flush —
  // kept out of state so scheduling a save doesn't need a stale closure.
  const pendingValues = useRef<Record<string, string>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Guards against two commitSave() calls for the same id racing on the
  // network — see commitSave for how the second call is folded into the
  // first instead of firing a duplicate, possibly out-of-order, request.
  const inFlight = useRef<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    page: 'homepage',
    section: '',
    field_type: 'text' as CMSContent['field_type'],
  });

  useEffect(() => {
    fetchContent();
    const timersAtMount = timers.current;
    return () => {
      Object.values(timersAtMount).forEach(clearTimeout);
    };
  }, []);

  // Warn before leaving the tab while an edit hasn't been saved yet. Blur
  // (switching fields, tabs, dialogs) already flushes immediately, so this
  // only fires for things like closing the tab mid-keystroke.
  useEffect(() => {
    const hasUnsaved = Object.values(status).some((s) => s === 'pending' || s === 'saving');
    if (!hasUnsaved) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [status]);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .order('page', { ascending: true })
      .order('section', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('key', { ascending: true });

    if (error) {
      toast.error('Error loading content: ' + error.message);
    } else {
      // `value` has no NOT NULL constraint in the DB (a row inserted outside
      // this admin, e.g. directly in Supabase Studio, could leave it NULL),
      // but every render path here treats it as a plain string — normalize
      // once on load instead of null-guarding every call site.
      //
      // `default_value` doesn't exist on production until migration 090000
      // runs — `select('*')` then omits the column entirely, so `row` has
      // `default_value: undefined`, not `null`. Every check in this file
      // (Revert button, Delete button, handleRevert) tests strictly against
      // `null`; left as `undefined` it slips past `=== null` guards and
      // `!== null` reads as true, which would show "Revert to original
      // text" on every row and, if clicked, save `undefined` over a real
      // value. Normalize to `null` here so the rest of the component only
      // ever sees the two states it already handles.
      setContent(
        (data as CMSContent[]).map((row) => ({ ...row, value: row.value ?? '', default_value: row.default_value ?? null })),
      );
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      page: activePage || 'homepage',
      section: '',
      field_type: 'text',
    });
    setEditingContent(null);
  };

  const handleEdit = (item: CMSContent) => {
    setEditingContent(item);
    setFormData({
      key: item.key,
      value: item.value,
      description: item.description || '',
      page: item.page,
      section: item.section || '',
      field_type: item.field_type,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contentData = {
      key: formData.key,
      value: formData.value,
      description: formData.description || null,
      page: formData.page,
      section: formData.section || null,
      field_type: formData.field_type,
    };

    if (editingContent) {
      const { error } = await supabase.from('cms_content').update(contentData).eq('id', editingContent.id);

      if (error) {
        toast.error('Error saving: ' + error.message);
        return;
      }
      toast.success('Content updated');
    } else {
      const { error } = await supabase.from('cms_content').insert(contentData);

      if (error) {
        toast.error('Error creating: ' + error.message);
        return;
      }
      toast.success('Content created');
    }

    setDialogOpen(false);
    resetForm();
    queryClient.invalidateQueries({ queryKey: ['cms_content'] });
    fetchContent();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    const { error } = await supabase.from('cms_content').delete().eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message);
    } else {
      toast.success('Content deleted');
      queryClient.invalidateQueries({ queryKey: ['cms_content'] });
      setContent((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Saves in place — updates the one row in local state instead of
  // refetching all ~1000 rows on every keystroke's autosave.
  //
  // Serialized per id: at most one network request per row is ever in
  // flight. If commitSave(id) is called again while a request for that id
  // is still awaiting the network (debounce fired a second time before the
  // first request came back, or onBlur flushed on top of it), that second
  // call does nothing itself — it relies on the already-running call below
  // to notice, once its request completes, that pendingValues.current[id]
  // has moved on and loop around to save the newer value. This guarantees
  // the last value the user typed is always the last one written, even if
  // an earlier request happens to come back from the network later than a
  // later one would have.
  const commitSave = async (id: string) => {
    delete timers.current[id];
    if (inFlight.current[id]) return;

    const initialValue = pendingValues.current[id];
    if (initialValue === undefined) return;

    inFlight.current[id] = true;
    try {
      let valueToSave: string | undefined = initialValue;
      while (valueToSave !== undefined) {
        setStatus((s) => ({ ...s, [id]: 'saving' }));
        const { error } = await supabase.from('cms_content').update({ value: valueToSave }).eq('id', id);

        if (error) {
          // Keep pendingValues.current[id] intact — the unsaved edit must
          // not disappear just because this attempt failed. A later edit
          // (which reschedules a timer) or blur will retry.
          toast.error('Error saving: ' + error.message);
          setStatus((s) => ({ ...s, [id]: 'error' }));
          return;
        }

        // The public site's CmsProvider caches cms_content for 5 minutes —
        // without this it would keep showing the old value until that expires.
        queryClient.invalidateQueries({ queryKey: ['cms_content'] });

        if (pendingValues.current[id] === valueToSave) {
          // Nothing changed while this request was in flight — done.
          delete pendingValues.current[id];
          valueToSave = undefined;
        } else {
          // A newer value arrived (typed during the request, or handed off
          // by a second commitSave() call that this guard suppressed).
          // Save it too before reporting "saved".
          valueToSave = pendingValues.current[id];
        }
      }

      setStatus((s) => ({ ...s, [id]: 'saved' }));
      setTimeout(() => {
        setStatus((s) => (s[id] === 'saved' ? { ...s, [id]: 'idle' } : s));
      }, 2000);
    } finally {
      inFlight.current[id] = false;
    }
  };

  const scheduleSave = (id: string, newValue: string) => {
    pendingValues.current[id] = newValue;
    setStatus((s) => ({ ...s, [id]: 'pending' }));
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      void commitSave(id);
    }, AUTOSAVE_DELAY_MS);
  };

  const flushSave = (id: string) => {
    if (!timers.current[id]) return;
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    void commitSave(id);
  };

  const handleValueChange = (item: CMSContent, newValue: string) => {
    setContent((prev) => prev.map((c) => (c.id === item.id ? { ...c, value: newValue } : c)));
    scheduleSave(item.id, newValue);
  };

  const handleRevert = (item: CMSContent) => {
    if (item.default_value === null) return;
    const defaultValue = item.default_value;
    setContent((prev) => prev.map((c) => (c.id === item.id ? { ...c, value: defaultValue } : c)));
    pendingValues.current[item.id] = defaultValue;
    if (timers.current[item.id]) clearTimeout(timers.current[item.id]);
    void commitSave(item.id);
  };

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = (item: CMSContent) =>
    !searchLower ||
    item.key.toLowerCase().includes(searchLower) ||
    (item.description ?? '').toLowerCase().includes(searchLower) ||
    item.value.toLowerCase().includes(searchLower);

  const searchResults = useMemo(
    () => (searchLower ? content.filter(matchesSearch) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content, searchLower],
  );

  const pageContent = useMemo(() => content.filter((c) => c.page === activePage), [content, activePage]);

  const sections = useMemo(() => {
    const map = new Map<string, CMSContent[]>();
    for (const item of pageContent) {
      const key = item.section || '(no section)';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [pageContent]);

  const renderField = (item: CMSContent) => {
    const isSingleLine = item.field_type === 'text' || item.field_type === 'image_url' || item.field_type === 'video_url';
    return (
      <Card key={item.id} className="bg-background">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{item.key}</code>
                <Badge variant="outline" className="text-xs">{item.field_type}</Badge>
                {searchLower && <Badge variant="secondary" className="text-xs capitalize">{item.page.replace('-', ' ')}</Badge>}
                <SaveIndicator status={status[item.id] ?? 'idle'} />
              </div>
              {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
            </div>
            <div className="flex gap-1 items-start">
              {PAGE_TO_PATH[item.page] && (
                <Button size="sm" variant="ghost" asChild title="View on site">
                  <a href={PAGE_TO_PATH[item.page]} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {item.default_value !== null && item.value !== item.default_value && (
                <Button size="sm" variant="ghost" onClick={() => handleRevert(item)} title="Revert to original text">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Edit key/page/section">
                <Pencil className="h-4 w-4" />
              </Button>
              {/* Seeded rows can't be deleted — that would silently drop a key
                  from the admin forever and fall back to old hardcoded text
                  with no warning. Use Revert instead. */}
              {item.default_value === null && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:text-destructive"
                  title="Delete (only available for manually-added fields)"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {isSingleLine ? (
            <Input
              value={item.value}
              onChange={(e) => handleValueChange(item, e.target.value)}
              onBlur={() => flushSave(item.id)}
            />
          ) : (
            <AutoTextarea
              value={item.value}
              fieldType={item.field_type}
              onChange={(v) => handleValueChange(item, v)}
              onBlur={() => flushSave(item.id)}
            />
          )}

          {item.field_type === 'image_url' && item.value && (
            <div className="mt-2">
              <img src={item.value} alt="Preview" className="max-w-xs rounded border" />
            </div>
          )}
          {item.field_type === 'video_url' && item.value && (
            <div className="mt-2 aspect-video max-w-sm rounded overflow-hidden border">
              <iframe
                src={item.value.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Website Content Manager</h2>
          <p className="text-sm text-muted-foreground">Edit text content directly on your website. Changes save automatically.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gold hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Content Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Edit' : 'Add'} Content Field</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key (unique identifier) *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="homepage_hero_title"
                  required
                  disabled={!!editingContent}
                />
                <p className="text-xs text-muted-foreground">Use snake_case, e.g. page_section_field</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this field for?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page">Page *</Label>
                  <Select value={formData.page} onValueChange={(v) => setFormData({ ...formData, page: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGES.map((page) => (
                        <SelectItem key={page} value={page} className="capitalize">
                          {page.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. hero, features"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_type">Field Type *</Label>
                <Select value={formData.field_type} onValueChange={(v: string) => setFormData({ ...formData, field_type: v as CMSContent['field_type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (single line)</SelectItem>
                    <SelectItem value="textarea">Textarea (multi-line)</SelectItem>
                    <SelectItem value="html">HTML (rich content)</SelectItem>
                    <SelectItem value="image_url">Image URL</SelectItem>
                    <SelectItem value="video_url">Video URL (YouTube/Vimeo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                {formData.field_type === 'text' || formData.field_type === 'image_url' || formData.field_type === 'video_url' ? (
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                ) : (
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    rows={formData.field_type === 'html' ? 10 : 4}
                    required
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gold hover:bg-gold-dark flex-1">
                  {editingContent ? 'Update' : 'Create'} Field
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by key, description, or text…"
          className="pl-9"
        />
      </div>

      {searchLower ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {searchResults.length} result{searchResults.length === 1 ? '' : 's'} across all pages
          </p>
          {searchResults.map(renderField)}
        </div>
      ) : (
        <Tabs value={activePage} onValueChange={setActivePage}>
          <TabsList className="bg-cream/50 flex-wrap h-auto gap-1">
            {PAGES.map((page) => (
              <TabsTrigger key={page} value={page} className="capitalize">
                {page.replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map((page) => (
            <TabsContent key={page} value={page}>
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{page.replace('-', ' ')} Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : pageContent.length === 0 ? (
                    <p className="text-muted-foreground">No content fields for this page yet.</p>
                  ) : (
                    <Accordion type="multiple" defaultValue={sections.map(([sectionKey]) => sectionKey)} key={activePage}>
                      {sections.map(([sectionKey, items]) => (
                        <AccordionItem key={sectionKey} value={sectionKey}>
                          <AccordionTrigger className="capitalize">
                            {sectionKey.replace(/_/g, ' ')} <span className="text-muted-foreground font-normal ml-2">({items.length})</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">{items.map(renderField)}</div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AdminCMS;
