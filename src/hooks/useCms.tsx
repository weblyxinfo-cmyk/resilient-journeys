import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CmsMap = Record<string, string>;

const CmsContext = createContext<CmsMap>({});

// True only inside AdminCMS.tsx's own live-preview iframe (?cmsPreview=1) —
// nothing else ever loads a page this way. Gates the postMessage listener
// below so the real site never reacts to a stray "message" event.
const isLivePreviewFrame = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('cmsPreview') === '1';

/**
 * Loads every cms_content row once and shares it with the whole app.
 *
 * Without this, each CMS-driven string meant its own useEffect + supabase call
 * in the component that rendered it, which is why only two values (both video
 * URLs) were ever wired up.
 */
export const CmsProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useQuery({
    queryKey: ['cms_content'],
    queryFn: async () => {
      // The API caps a response at 1000 rows and the table is past that, so a
      // single request silently dropped the overflow — those keys never
      // reached the site no matter what the admin saved. Without an order the
      // dropped set was not even stable, so a field could work on one load and
      // fall back to its built-in text on the next.
      const PAGE_SIZE = 1000;
      const rows: { key: string; value: string | null }[] = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await supabase
          .from('cms_content')
          .select('key, value')
          .order('key', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < PAGE_SIZE) break;
      }

      const map: CmsMap = {};
      for (const row of rows) {
        // Blank values fall through to the caller's fallback on purpose — an
        // accidentally cleared field in the admin must not blank the website.
        if (row.value) map[row.key] = row.value;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Values typed into AdminCMS's fields but not (yet) saved, mirrored here
  // via postMessage so the preview iframe reflects a keystroke immediately
  // instead of only after the DB round-trip. Purely local, display-only —
  // saving still goes through the admin's own autosave, unrelated to this.
  const [liveOverrides, setLiveOverrides] = useState<CmsMap>({});

  useEffect(() => {
    if (!isLivePreviewFrame()) return;

    const handleMessage = (event: MessageEvent) => {
      // Same-origin only, and only our own message shape — never trust
      // postMessage content otherwise.
      if (event.origin !== window.location.origin) return;
      const msg = event.data;
      if (!msg || typeof msg !== 'object' || msg.type !== 'cms-preview-update') return;
      if (typeof msg.key !== 'string' || typeof msg.value !== 'string') return;
      setLiveOverrides((prev) => ({ ...prev, [msg.key]: msg.value }));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const map = { ...(data ?? {}), ...liveOverrides };

  return <CmsContext.Provider value={map}>{children}</CmsContext.Provider>;
};

/**
 * `t(key, fallback, label?)` — the fallback is the text that used to be
 * hardcoded, so the page renders correctly before the query resolves and
 * stays correct if the row is missing, blank, or the request fails.
 *
 * `label` is not read here — it does nothing at runtime. It exists so
 * `scripts/cms-seed.mjs` can pick up a client-facing field name (e.g.
 * `t("homepage_hero_title", "...", "Nadpis")`) straight from the call site
 * when generating a seed migration, instead of a developer having to write
 * Czech labels by hand in a separate file that drifts from the code. See
 * the script's header comment for the full convention.
 */
export const useCms = () => {
  const map = useContext(CmsContext);
  return {
    t: (key: string, fallback: string, _label?: string) => map[key] ?? fallback,
  };
};
