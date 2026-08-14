import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HubProduct {
  hubSlug: string;
  name: string;
  description: string;
  price: number;
}

type HubProductRow = {
  hub_slug: string;
  name: string;
  description: string | null;
  price_eur: number | string;
};

const toHub = (row: HubProductRow): HubProduct => ({
  hubSlug: row.hub_slug,
  name: row.name,
  description: row.description ?? '',
  // numeric(10,2) comes back as a string from PostgREST.
  price: Number(row.price_eur),
});

/**
 * One-time hub purchases (The Transformed Self, Endometriosis Management),
 * editable in the admin.
 *
 * `fallback` is the price/name the caller used to ship with hardcoded; it
 * stands in until the query resolves and if it fails or the table is empty,
 * so the checkout page never renders a missing or zero price.
 */
export const useHubProducts = (fallback: HubProduct[]) => {
  const { data, isError } = useQuery({
    queryKey: ['hub_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_products')
        .select('hub_slug, name, description, price_eur')
        .eq('is_active', true);

      if (error) throw error;
      return (data as unknown as HubProductRow[]).map(toHub);
    },
    staleTime: 5 * 60 * 1000,
  });

  const hubs = !data || data.length === 0 || isError ? fallback : data;

  return {
    hubs,
    getHub: (hubSlug: string) => hubs.find((h) => h.hubSlug === hubSlug),
  };
};
