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
  // Client-facing name shown above the field ("Nadpis", "Text tlačítka").
  // `key`/`description` stay visible but small — they're for the developer.
  label: string | null;
}

interface CMSSection {
  id: string;
  page: string;
  section_key: string;
  title: string;
  description: string | null;
  anchor: string | null;
  route: string;
  sort_order: number;
  is_active: boolean;
}

// Static list, not derived from existing rows — a page with zero seeded
// content used to have no tab at all, making it impossible to add its first
// field from the admin.
const PAGES = [
  'homepage', 'about', 'pricing', 'booking', 'membership', 'resilient-hub',
  'resilient-hubs', 'free-guide', 'endometriosis', 'blog', 'footer', 'navbar',
  'legal', 'shared',
];

// Client sees Czech page names, never the slug — the slug is what's stored
// on cms_content.page / cms_sections.page so the two tables can join on it.
const PAGE_LABELS: Record<string, string> = {
  homepage: 'Domovská stránka',
  about: 'O mně',
  pricing: 'Ceník',
  booking: 'Rezervace',
  membership: 'Členství',
  'resilient-hub': 'Resilient Hub',
  'resilient-hubs': 'Resilient Huby',
  'free-guide': 'Zdarma průvodce',
  endometriosis: 'Endometrióza Hub',
  blog: 'Blog',
  footer: 'Patička',
  navbar: 'Navigace',
  legal: 'Právní stránky',
  shared: 'Sdílené (více stránek)',
};

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
  pending: 'Neuloženo',
  saving: 'Ukládám…',
  saved: 'Uloženo',
  error: 'Chyba při ukládání',
};

const AUTOSAVE_DELAY_MS = 800;

// Shrunk live preview of the section, rendered in an iframe pointed at the
// real page. Fixed scale/height keep every section card the same height
// regardless of how tall the actual page section is.
const PREVIEW_SCALE = 0.3;
const PREVIEW_IFRAME_HEIGHT = 1000;
const PREVIEW_CONTAINER_HEIGHT = Math.round(PREVIEW_IFRAME_HEIGHT * PREVIEW_SCALE);

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

// Live preview of one section, pointed at `route#anchor` on the real site.
// Never blocks editing: a load failure just replaces the iframe with a
// message + link, the fields below always render regardless.
const SectionPreview = ({ section, refreshKey }: { section: CMSSection; refreshKey: number }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [section.id, refreshKey]);

  const liveUrl = `${section.route}${section.anchor ? `#${section.anchor}` : ''}`;
  const previewSrc = `${section.route}?cmsPreview=${refreshKey}${section.anchor ? `#${section.anchor}` : ''}`;

  const handleLoad = () => {
    setLoaded(true);
    if (!section.anchor) return;
    const iframe = iframeRef.current;
    const anchor = section.anchor;
    if (!iframe) return;

    // This is a client-rendered SPA: the iframe's `load` event fires once
    // index.html's initial (near-empty) HTML has loaded, well before React
    // mounts and the CMS content query resolves — so the browser's built-in
    // one-shot scroll-to-#fragment usually runs before the target element
    // exists and does nothing. Poll briefly for the element instead.
    let attempts = 0;
    const tryScroll = () => {
      attempts += 1;
      let el: HTMLElement | null = null;
      try {
        el = iframe.contentDocument?.getElementById(anchor) ?? null;
      } catch {
        return; // not same-origin for some reason — leave the preview as-is
      }
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
      if (attempts < 20) setTimeout(tryScroll, 150);
    };
    tryScroll();
  };

  return (
    <div className="space-y-2">
      <div
        className="relative rounded-lg border border-border bg-muted/30 overflow-hidden"
        style={{ height: PREVIEW_CONTAINER_HEIGHT }}
      >
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
            <p>Náhled se nepodařilo načíst.</p>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Otevřít stránku v nové záložce
            </a>
          </div>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Načítám náhled…
              </div>
            )}
            <iframe
              key={`${section.id}-${refreshKey}`}
              ref={iframeRef}
              src={previewSrc}
              title={`Náhled — ${section.title}`}
              onLoad={handleLoad}
              onError={() => setFailed(true)}
              // pointer-events: none — this is a picture of the page, not the
              // page itself; clicking through here would navigate the client
              // away from the admin.
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${100 / PREVIEW_SCALE}%`,
                height: PREVIEW_IFRAME_HEIGHT,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                border: 'none',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      </div>
      <Button size="sm" variant="outline" asChild>
        <a href={liveUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Otevřít na webu
        </a>
      </Button>
    </div>
  );
};

const AdminCMS = () => {
  const queryClient = useQueryClient();

  const [content, setContent] = useState<CMSContent[]>([]);
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CMSContent | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});
  // Bumped per cms_sections.id after a field in that section saves — changes
  // the iframe's `key`/src so it reloads and re-scrolls to show the result.
  const [previewRefresh, setPreviewRefresh] = useState<Record<string, number>>({});

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
    label: '',
    description: '',
    page: 'homepage',
    section: '',
    field_type: 'text' as CMSContent['field_type'],
  });

  useEffect(() => {
    fetchContent();
    fetchSections();
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
      toast.error('Chyba při načítání obsahu: ' + error.message);
    } else {
      // `value` has no NOT NULL constraint in the DB (a row inserted outside
      // this admin, e.g. directly in Supabase Studio, could leave it NULL),
      // but every render path here treats it as a plain string — normalize
      // once on load instead of null-guarding every call site.
      //
      // `default_value`/`label` don't exist on production until their
      // migrations run — until then `select('*')` omits the columns
      // entirely, so `row` has them as `undefined`, not `null`. Every check
      // in this file that tests strictly against `null` (Revert button,
      // Delete button, handleRevert) would otherwise slip past those guards.
      // Normalize both to `null` here so the rest of the component only
      // ever sees the states it already handles.
      setContent(
        (data as CMSContent[]).map((row) => ({
          ...row,
          value: row.value ?? '',
          default_value: row.default_value ?? null,
          label: row.label ?? null,
        })),
      );
    }
    setLoading(false);
  };

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('cms_sections')
      .select('*')
      .order('page', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) {
      // Sections are a display layer on top of cms_content, not a
      // requirement for editing it — if the table isn't there yet (or the
      // query fails for any reason) every field still shows up, grouped
      // into "Ostatní", just without the human section titles or preview.
      toast.error('Náhledy sekcí se nepodařilo načíst: ' + error.message);
      return;
    }
    setSections((data as CMSSection[]) ?? []);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      label: '',
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
      label: item.label || '',
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
      label: formData.label || null,
      description: formData.description || null,
      page: formData.page,
      section: formData.section || null,
      field_type: formData.field_type,
    };

    if (editingContent) {
      const { error } = await supabase.from('cms_content').update(contentData).eq('id', editingContent.id);

      if (error) {
        toast.error('Chyba při ukládání: ' + error.message);
        return;
      }
      toast.success('Obsah upraven');
    } else {
      const { error } = await supabase.from('cms_content').insert(contentData);

      if (error) {
        toast.error('Chyba při vytváření: ' + error.message);
        return;
      }
      toast.success('Pole vytvořeno');
    }

    setDialogOpen(false);
    resetForm();
    queryClient.invalidateQueries({ queryKey: ['cms_content'] });
    fetchContent();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu smazat toto pole?')) return;

    const { error } = await supabase.from('cms_content').delete().eq('id', id);

    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
    } else {
      toast.success('Pole smazáno');
      queryClient.invalidateQueries({ queryKey: ['cms_content'] });
      setContent((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const bumpPreview = (page: string, section: string | null) => {
    if (!section) return;
    const match = sections.find((s) => s.page === page && s.section_key === section);
    if (!match) return;
    setPreviewRefresh((prev) => ({ ...prev, [match.id]: (prev[match.id] ?? 0) + 1 }));
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
          toast.error('Chyba při ukládání: ' + error.message);
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

      // Refresh the section's live preview so the client sees the result
      // without having to click anything — the main point of the preview.
      const saved = content.find((c) => c.id === id);
      if (saved) bumpPreview(saved.page, saved.section);
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
    (item.label ?? '').toLowerCase().includes(searchLower) ||
    (item.description ?? '').toLowerCase().includes(searchLower) ||
    item.value.toLowerCase().includes(searchLower);

  const searchResults = useMemo(
    () => (searchLower ? content.filter(matchesSearch) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content, searchLower],
  );

  const sectionLabel = (page: string, sectionKey: string | null) => {
    if (!sectionKey) return 'Ostatní';
    const match = sections.find((s) => s.page === page && s.section_key === sectionKey);
    return match?.title ?? sectionKey.replace(/_/g, ' ');
  };

  const pageContent = useMemo(() => content.filter((c) => c.page === activePage), [content, activePage]);
  const sectionsForPage = useMemo(
    () => sections.filter((s) => s.page === activePage),
    [sections, activePage],
  );

  // Groups this page's fields under the section cards that actually exist
  // (in their defined order), then collects everything else — a key with
  // no matching cms_sections row, or no section at all — into a trailing
  // "Ostatní" bucket so nothing edited before this rebuild is ever hidden.
  const sectionGroups = useMemo(() => {
    const bySection = new Map<string, CMSContent[]>();
    for (const item of pageContent) {
      const groupKey = item.section ?? '';
      if (!bySection.has(groupKey)) bySection.set(groupKey, []);
      bySection.get(groupKey)!.push(item);
    }

    const groups: { section: CMSSection | null; items: CMSContent[] }[] = [];
    const claimed = new Set<string>();

    for (const section of sectionsForPage) {
      const items = bySection.get(section.section_key) ?? [];
      claimed.add(section.section_key);
      groups.push({ section, items });
    }

    const orphanItems = pageContent.filter((item) => !claimed.has(item.section ?? ''));
    if (orphanItems.length > 0) {
      groups.push({ section: null, items: orphanItems });
    }

    return groups;
  }, [pageContent, sectionsForPage]);

  const renderField = (item: CMSContent) => {
    const isSingleLine = item.field_type === 'text' || item.field_type === 'image_url' || item.field_type === 'video_url';
    return (
      <Card key={item.id} className="bg-background">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-medium">{item.label || item.key.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="text-xs">{item.field_type}</Badge>
                {searchLower && (
                  <Badge variant="secondary" className="text-xs">
                    {PAGE_LABELS[item.page] ?? item.page} · {sectionLabel(item.page, item.section)}
                  </Badge>
                )}
                <SaveIndicator status={status[item.id] ?? 'idle'} />
              </div>
              {item.description && <p className="text-sm text-muted-foreground mb-1">{item.description}</p>}
              <code className="text-[10px] text-muted-foreground/60">{item.key}</code>
            </div>
            <div className="flex gap-1 items-start">
              {PAGE_TO_PATH[item.page] && (
                <Button size="sm" variant="ghost" asChild title="Zobrazit na webu">
                  <a href={PAGE_TO_PATH[item.page]} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {item.default_value !== null && item.value !== item.default_value && (
                <Button size="sm" variant="ghost" onClick={() => handleRevert(item)} title="Vrátit původní text">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} title="Upravit klíč/stránku/sekci/popisek">
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
                  title="Smazat (jen u ručně přidaných polí)"
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
              <img src={item.value} alt="Náhled" className="max-w-xs rounded border" />
            </div>
          )}
          {item.field_type === 'video_url' && item.value && (
            <div className="mt-2 aspect-video max-w-sm rounded overflow-hidden border">
              <iframe
                src={item.value.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Náhled videa"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSectionGroup = ({ section, items }: { section: CMSSection | null; items: CMSContent[] }) => {
    if (!section) {
      return (
        <Card key="other" className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Ostatní</CardTitle>
            <p className="text-sm text-muted-foreground">
              Pole, která ještě nemají přiřazenou sekci s náhledem. Pořád jdou upravovat, jen bez obrázku nahoře.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">{items.map(renderField)}</CardContent>
        </Card>
      );
    }

    return (
      <Card key={section.id}>
        <CardHeader>
          <CardTitle className="text-lg">{section.title}</CardTitle>
          {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {section.anchor && (
            <SectionPreview section={section} refreshKey={previewRefresh[section.id] ?? 0} />
          )}
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tato sekce zatím nemá žádná textová pole.</p>
          ) : (
            <div className="space-y-4 pt-2">{items.map(renderField)}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Správa textů na webu</h2>
          <p className="text-sm text-muted-foreground">
            Vyberte stránku, pak sekci — nahoře uvidíte, jak vypadá na webu, dole texty k úpravě. Ukládá se automaticky.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gold hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" />
              Přidat pole
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Upravit' : 'Přidat'} pole</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Klíč (jedinečný identifikátor) *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="homepage_hero_title"
                  required
                  disabled={!!editingContent}
                />
                <p className="text-xs text-muted-foreground">snake_case, např. stranka_sekce_pole</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Popisek pro klienta</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="např. Nadpis, Text tlačítka"
                />
                <p className="text-xs text-muted-foreground">Toto se zobrazí místo klíče nad polem.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Popis pro vývojáře</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="K čemu toto pole slouží?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page">Stránka *</Label>
                  <Select value={formData.page} onValueChange={(v) => setFormData({ ...formData, page: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGES.map((page) => (
                        <SelectItem key={page} value={page}>
                          {PAGE_LABELS[page] ?? page}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Sekce</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="např. hero, services"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bez shody se zobrazí v „Ostatní" — pořád editovatelné.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_type">Typ pole *</Label>
                <Select value={formData.field_type} onValueChange={(v: string) => setFormData({ ...formData, field_type: v as CMSContent['field_type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (jeden řádek)</SelectItem>
                    <SelectItem value="textarea">Textarea (víc řádků)</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="image_url">URL obrázku</SelectItem>
                    <SelectItem value="video_url">URL videa (YouTube/Vimeo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Hodnota *</Label>
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
                  {editingContent ? 'Uložit' : 'Vytvořit'} pole
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
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
          placeholder="Hledat podle textu, klíče nebo popisku…"
          className="pl-9"
        />
      </div>

      {searchLower ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {searchResults.length} výsledek/ů napříč všemi stránkami
          </p>
          {searchResults.map(renderField)}
        </div>
      ) : (
        <Tabs value={activePage} onValueChange={setActivePage}>
          <TabsList className="bg-cream/50 flex-wrap h-auto gap-1">
            {PAGES.map((page) => (
              <TabsTrigger key={page} value={page}>
                {PAGE_LABELS[page] ?? page}
              </TabsTrigger>
            ))}
          </TabsList>

          {PAGES.map((page) => (
            <TabsContent key={page} value={page} className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Načítám…</p>
              ) : page === activePage && sectionGroups.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">Tato stránka zatím nemá žádná textová pole.</p>
                  </CardContent>
                </Card>
              ) : (
                page === activePage && sectionGroups.map(renderSectionGroup)
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default AdminCMS;
