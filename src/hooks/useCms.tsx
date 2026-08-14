import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type CmsMap = Record<string, string>;

const CmsContext = createContext<CmsMap>({});

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
      const { data, error } = await supabase
        .from('cms_content')
        .select('key, value');

      if (error) throw error;

      const map: CmsMap = {};
      for (const row of data ?? []) {
        // Blank values fall through to the caller's fallback on purpose — an
        // accidentally cleared field in the admin must not blank the website.
        if (row.value) map[row.key] = row.value;
      }
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  return <CmsContext.Provider value={data ?? {}}>{children}</CmsContext.Provider>;
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
