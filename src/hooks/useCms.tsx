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
 * `t(key, fallback)` — the fallback is the text that used to be hardcoded, so
 * the page renders correctly before the query resolves and stays correct if the
 * row is missing, blank, or the request fails.
 */
export const useCms = () => {
  const map = useContext(CmsContext);
  return {
    t: (key: string, fallback: string) => map[key] ?? fallback,
  };
};
