import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Pencil, Trash2, RotateCcw, ExternalLink, Search, Info, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CmsImageField from '@/components/admin/CmsImageField';

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
  // `key`/`description` stay hidden by default — they're for the developer.
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

// Grows with the value instead of a fixed `rows`, so a one-line field isn't
// three empty rows tall and a long paragraph isn't a tiny scrollbox.
const AutoTextarea = ({
  value,
  onChange,
  onFocus,
  onBlur,
  fieldType,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
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
      onFocus={onFocus}
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

// A single shared iframe for the whole admin screen — not one per section.
// Up to 40 sections on one page used to mean up to 40 separate booted copies
// of the site, each with its own cms_content fetch (react-query cache isn't
// shared across iframe documents) — that's what froze the admin. Now there
// is exactly one live document; switching which section is "in focus" just
// scrolls that same document, and only triggers a real reload when the
// target section lives on a different route.
/**
 * A real URL for a section whose route carries a :slug.
 *
 * The workshop and blog detail pages have no single address of their own, so
 * the preview asked the site for the post literally named ":slug" — which
 * answers 404 and bounces to the listing, leaving those fields with no preview
 * at all. Any published post of the right kind shows the same layout.
 */
const resolvePreviewRoute = async (route: string): Promise<string> => {
  if (!route.includes(':slug')) return route;

  const category = route.startsWith('/workshopy') ? 'workshop' : 'blog';
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('category', category)
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(1);

  const slug = data?.[0]?.slug;
  // Nothing published to stand in for it: the listing is a better preview
  // than an error page.
  return slug ? route.replace(':slug', slug) : route.replace('/:slug', '');
};

const SharedPreview = ({
  section,
  refreshKey,
  iframeRef,
}: {
  section: CMSSection | null;
  refreshKey: number;
  // Owned by AdminCMS, not this component — it also needs contentWindow to
  // postMessage live-typed values into the preview (see scheduleLivePreview).
  iframeRef: RefObject<HTMLIFrameElement>;
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [resolvedRoute, setResolvedRoute] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [anchorMissing, setAnchorMissing] = useState(false);
  // What's actually loaded in the iframe right now (route + refresh
  // generation) — compared against the requested section to decide between
  // "just scroll the existing document" and "navigate to a new one".
  const loadedKeyRef = useRef<string | null>(null);
  const pendingAnchorRef = useRef<string | null>(null);

  const scrollToAnchor = (anchor: string | null) => {
    setAnchorMissing(false);
    if (!anchor) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Client-rendered SPA: the target element may not exist yet on first
    // paint (CMS data still loading), so poll briefly. If it never turns up,
    // that's a real, reportable state — the section is empty/hidden on the
    // live site (e.g. a video section with no video URL set) — not a
    // loading hiccup, so never silently leave the preview scrolled to
    // wherever it happened to be.
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
      else setAnchorMissing(true);
    };
    tryScroll();
  };

  useEffect(() => {
    if (!section) return;
    const desiredKey = `${section.route}::${refreshKey}`;
    if (loadedKeyRef.current !== desiredKey) {
      // Different route, or a save just invalidated the currently-shown
      // page — needs an actual navigation.
      loadedKeyRef.current = desiredKey;
      pendingAnchorRef.current = section.anchor;
      setLoaded(false);
      setFailed(false);
      setAnchorMissing(false);
      // `cmsPreview` must always be the literal "1" — the app (useAuth.tsx)
      // treats it as a boolean flag to skip the login flow entirely inside
      // this iframe. `refreshKey` starting at 0 previously landed here and
      // was read as falsy, silently turning preview mode off and booting a
      // full auth flow — which fought the parent tab over the shared
      // localStorage session and reset the whole admin. Cache-busting for a
      // re-navigation to the same route now happens on a separate `r` param.
      let cancelled = false;
      resolvePreviewRoute(section.route).then((route) => {
        if (cancelled) return;
        setResolvedRoute(route);
        setSrc(`${route}?cmsPreview=1&r=${refreshKey}`);
      });
      return () => {
        cancelled = true;
      };
    } else {
      // Same document already loaded — just scroll to the newly focused
      // section, no reload.
      scrollToAnchor(section.anchor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id, section?.route, refreshKey]);

  const handleLoad = () => {
    setLoaded(true);
    scrollToAnchor(pendingAnchorRef.current);
  };

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Klikněte do pole nebo na název sekce vlevo — tady se ukáže, jak to vypadá na webu.
      </div>
    );
  }

  const liveUrl = `${resolvedRoute ?? section.route}${section.anchor ? `#${section.anchor}` : ''}`;

  return (
    <div className="relative h-full rounded-lg border border-border bg-muted/30 overflow-hidden">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <p>Náhled se nepodařilo načíst.</p>
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Otevřít stránku v nové záložce
          </a>
        </div>
      ) : anchorMissing ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <p>Tato sekce se na webu teď nezobrazuje — je prázdná nebo skrytá.</p>
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
          {src && (
            <iframe
              ref={iframeRef}
              src={src}
              title="Náhled webu"
              onLoad={handleLoad}
              onError={() => setFailed(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </>
      )}
    </div>
  );
};

const AdminCMS = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [content, setContent] = useState<CMSContent[]>([]);
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CMSContent | null>(null);
  // Read from the URL so a full remount of this component (e.g. Admin.tsx's
  // loading guard flashing on and off) reopens the same page tab instead of
  // resetting to homepage — a defensive layer on top of the cmsPreview=1 fix
  // above, in case some other, not-yet-found path still causes a remount.
  const [activePage, setActivePageState] = useState<string>(() => searchParams.get('cmsPage') || 'homepage');
  const setActivePage = (page: string) => {
    setActivePageState(page);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('cmsPage', page);
        return next;
      },
      { replace: true },
    );
  };
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Record<string, SaveStatus>>({});
  // The section currently shown in the single shared preview iframe, and a
  // generation counter bumped after a save that should force it to reload.
  const [previewSection, setPreviewSection] = useState<CMSSection | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  // Owned here (not inside SharedPreview) so scheduleLivePreview below can
  // reach contentWindow directly.
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Mirrors previewSection for commitSave (below) to read without needing
  // to be in its dependency list.
  const previewSectionRef = useRef<CMSSection | null>(null);
  useEffect(() => {
    previewSectionRef.current = previewSection;
  }, [previewSection]);

  // Live-typed values, mirrored into the preview iframe as the user types —
  // separate from the 800ms autosave debounce, much shorter since nothing
  // is written to the DB here, just a same-origin postMessage. useCms.tsx
  // only listens for this inside the ?cmsPreview=1 iframe; the real site
  // ignores it entirely.
  const LIVE_PREVIEW_DELAY_MS = 100;
  const livePreviewTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const postLivePreviewUpdate = (key: string, value: string) => {
    const win = previewIframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: 'cms-preview-update', key, value }, window.location.origin);
  };

  const scheduleLivePreview = (key: string, value: string) => {
    if (livePreviewTimers.current[key]) clearTimeout(livePreviewTimers.current[key]);
    livePreviewTimers.current[key] = setTimeout(() => {
      delete livePreviewTimers.current[key];
      postLivePreviewUpdate(key, value);
    }, LIVE_PREVIEW_DELAY_MS);
  };

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
    const livePreviewTimersAtMount = livePreviewTimers.current;
    return () => {
      Object.values(timersAtMount).forEach(clearTimeout);
      Object.values(livePreviewTimersAtMount).forEach(clearTimeout);
    };
  }, []);

  // Clear a stale preview when switching pages — otherwise it would keep
  // showing the previous page's section until the user clicks something on
  // the new one. Deliberately doesn't auto-select a new section to preview
  // in its place: that would spin up the preview iframe immediately on every
  // tab switch instead of only when the user actually asks for it.
  useEffect(() => {
    setPreviewSection(null);
  }, [activePage]);

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
    // Same 1000-row response cap as useCms: unpaged, the tail of the table was
    // missing from this panel entirely, so those fields could not even be found
    // and edited — the pages sorting last simply were not there.
    const PAGE_SIZE = 1000;
    const rows: any[] = [];
    let error = null;
    for (let from = 0; ; from += PAGE_SIZE) {
      const page = await supabase
        .from('cms_content')
        .select('*')
        .order('page', { ascending: true })
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true })
        .order('key', { ascending: true })
        .range(from, from + PAGE_SIZE - 1);

      if (page.error) {
        error = page.error;
        break;
      }
      rows.push(...(page.data ?? []));
      if (!page.data || page.data.length < PAGE_SIZE) break;
    }
    const data = rows;

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

  // Edit-only — creating new keys from the admin was removed (see below):
  // a new row here has no `t("key", ...)` call anywhere in the site's code
  // to read it, so it would never actually appear anywhere.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContent) return;

    const contentData = {
      value: formData.value,
      label: formData.label || null,
      description: formData.description || null,
      page: formData.page,
      section: formData.section || null,
      field_type: formData.field_type,
    };

    const { error } = await supabase.from('cms_content').update(contentData).eq('id', editingContent.id);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
      return;
    }
    toast.success('Obsah upraven');

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

  // Forces the shared preview iframe to reload if it's currently showing the
  // page that just changed — matching by page only (not exact section),
  // since any field save on that route can affect what's rendered on it.
  const bumpPreview = (page: string) => {
    if (previewSectionRef.current?.page === page) {
      setPreviewRefreshKey((k) => k + 1);
    }
  };

  // Looks up the field's cms_sections row and, if it has an anchor, focuses
  // the shared preview on it — called on focusing any field.
  const focusPreview = (item: CMSContent) => {
    if (!item.section) return;
    const match = sections.find((s) => s.page === item.page && s.section_key === item.section);
    if (match?.anchor) setPreviewSection(match);
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

      // Refresh the preview so the client sees the result without having to
      // click anything — the main point of the preview.
      const saved = content.find((c) => c.id === id);
      if (saved) bumpPreview(saved.page);
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
    scheduleLivePreview(item.key, newValue);
  };

  const handleRevert = (item: CMSContent) => {
    if (item.default_value === null) return;
    const defaultValue = item.default_value;
    setContent((prev) => prev.map((c) => (c.id === item.id ? { ...c, value: defaultValue } : c)));
    pendingValues.current[item.id] = defaultValue;
    if (timers.current[item.id]) clearTimeout(timers.current[item.id]);
    void commitSave(item.id);
    // Revert is a discrete action, not a keystroke stream — reflect it
    // immediately instead of going through the 100ms debounce.
    postLivePreviewUpdate(item.key, defaultValue);
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

  // One field, kept as compact as possible: label + value are the whole
  // point, everything else (type badge, dev key, description) is secondary
  // and either hidden by default or shown in small muted text.
  const renderField = (item: CMSContent) => {
    const isSingleLine = item.field_type === 'text' || item.field_type === 'image_url' || item.field_type === 'video_url';
    // Plain text/textarea are the vast majority of fields — the type badge
    // only earns its place where the type changes how the field behaves.
    const showTypeBadge = item.field_type !== 'text' && item.field_type !== 'textarea';

    return (
      <div key={item.id} className="py-2.5 border-b border-border/60 last:border-b-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span className="text-sm font-medium">{item.label || item.key.replace(/_/g, ' ')}</span>
            {showTypeBadge && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {item.field_type}
              </Badge>
            )}
            {searchLower && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {PAGE_LABELS[item.page] ?? item.page} · {sectionLabel(item.page, item.section)}
              </Badge>
            )}
            <SaveIndicator status={status[item.id] ?? 'idle'} />
            {/* Technical key — developer info, hidden from the default view,
                available on hover so it doesn't distract a non-technical editor. */}
            <span title={`Klíč: ${item.key}`} className="inline-flex cursor-help text-muted-foreground/40 hover:text-muted-foreground">
              <Info className="h-3 w-3" />
            </span>
          </div>
          <div className="flex gap-0.5 items-start shrink-0">
            {PAGE_TO_PATH[item.page] && (
              <Button size="icon" variant="ghost" className="h-7 w-7" asChild title="Zobrazit na webu">
                <a href={PAGE_TO_PATH[item.page]} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {item.default_value !== null && item.value !== item.default_value && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleRevert(item)} title="Vrátit původní text">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)} title="Upravit klíč/stránku/sekci/popisek">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {/* Seeded rows can't be deleted — that would silently drop a key
                from the admin forever and fall back to old hardcoded text
                with no warning. Use Revert instead. */}
            {item.default_value === null && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="h-7 w-7 text-destructive hover:text-destructive"
                title="Smazat (jen u ručně přidaných polí)"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {item.field_type === 'image_url' ? (
          <CmsImageField
            value={item.value}
            onChange={(v) => handleValueChange(item, v)}
            onFocus={() => focusPreview(item)}
            onBlur={() => flushSave(item.id)}
          />
        ) : isSingleLine ? (
          <Input
            value={item.value}
            onChange={(e) => handleValueChange(item, e.target.value)}
            onFocus={() => focusPreview(item)}
            onBlur={() => flushSave(item.id)}
          />
        ) : (
          <AutoTextarea
            value={item.value}
            fieldType={item.field_type}
            onChange={(v) => handleValueChange(item, v)}
            onFocus={() => focusPreview(item)}
            onBlur={() => flushSave(item.id)}
          />
        )}

        {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}

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
      </div>
    );
  };

  const renderSectionGroup = ({ section, items }: { section: CMSSection | null; items: CMSContent[] }) => {
    if (!section) {
      return (
        <Card key="other" className="border-dashed">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Ostatní</CardTitle>
            <p className="text-xs text-muted-foreground">
              Pole, která ještě nemají přiřazenou sekci s náhledem. Pořád jdou upravovat, jen bez náhledu.
            </p>
          </CardHeader>
          <CardContent className="p-4 pt-0">{items.map(renderField)}</CardContent>
        </Card>
      );
    }

    const isPreviewing = previewSection?.id === section.id;

    return (
      <Card key={section.id} className={isPreviewing ? 'ring-1 ring-gold/50' : undefined}>
        <CardHeader
          className={`p-4 pb-2 ${section.anchor ? 'cursor-pointer select-none' : ''}`}
          onClick={() => section.anchor && setPreviewSection(section)}
        >
          <CardTitle className="text-base flex items-center gap-1.5">
            {section.title}
            {section.anchor && <Eye className="h-3.5 w-3.5 text-muted-foreground/50" />}
          </CardTitle>
          {section.description && <p className="text-xs text-muted-foreground">{section.description}</p>}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tato sekce zatím nemá žádná textová pole.</p>
          ) : (
            items.map(renderField)
          )}
        </CardContent>
      </Card>
    );
  };

  const previewLiveUrl = previewSection
    ? `${previewSection.route}${previewSection.anchor ? `#${previewSection.anchor}` : ''}`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Správa textů na webu</h2>
          <p className="text-sm text-muted-foreground">
            Klikněte do pole nebo na název sekce — vpravo se ukáže, jak to vypadá na webu. Ukládá se automaticky.
          </p>
        </div>

        {/* No "Přidat pole" trigger — a key created here has no `t(key, ...)`
            call anywhere in the site to read it, so it would never show up
            anywhere and only confuse the client. This dialog now only opens
            via the pencil/edit icon on an existing field. */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upravit pole</DialogTitle>
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
                  Uložit
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

      <div className={`grid grid-cols-1 gap-6 items-start ${previewExpanded ? '' : 'lg:grid-cols-[minmax(0,1fr)_380px]'}`}>
        <div className={`min-w-0 order-2 lg:order-1 space-y-3 ${previewExpanded ? 'lg:hidden' : ''}`}>
          {searchLower ? (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} výsledek/ů napříč všemi stránkami
              </p>
              <Card>
                <CardContent className="p-4">{searchResults.map(renderField)}</CardContent>
              </Card>
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
                <TabsContent key={page} value={page} className="space-y-3">
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

        <div className="order-1 lg:order-2 lg:sticky lg:top-24 flex flex-col gap-2 h-[360px] lg:h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium truncate min-w-0">{previewSection?.title ?? 'Náhled webu'}</p>
            <div className="flex items-center gap-0.5 shrink-0">
              {previewLiveUrl && (
                <Button size="icon" variant="ghost" className="h-7 w-7" asChild title="Otevřít na webu v nové záložce">
                  <a href={previewLiveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hidden lg:inline-flex"
                onClick={() => setPreviewExpanded((v) => !v)}
                title={previewExpanded ? 'Zmenšit náhled' : 'Rozbalit náhled přes celou šířku'}
              >
                {previewExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <SharedPreview section={previewSection} refreshKey={previewRefreshKey} iframeRef={previewIframeRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
