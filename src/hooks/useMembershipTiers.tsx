import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MEMBERSHIP_TIERS, MembershipTier } from '@/lib/pricing';

type MembershipTierRow = {
  tier_key: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_eur: number | string;
  billing_interval: 'month' | 'year';
  membership_type: 'basic' | 'premium';
  period_label: string | null;
  button_text: string | null;
  badge: string | null;
  quote: string | null;
  savings_note: string | null;
  features: unknown;
  ideal_for: unknown;
  highlighted: boolean;
  hidden: boolean;
};

const asArray = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

const toTier = (row: MembershipTierRow): MembershipTier => ({
  id: row.tier_key,
  name: row.name,
  // numeric(10,2) comes back as a string from PostgREST.
  price: Number(row.price_eur),
  period: (row.period_label as MembershipTier['period']) ?? (row.billing_interval === 'year' ? '/year' : '/month'),
  interval: row.billing_interval,
  membershipType: row.membership_type,
  subtitle: row.subtitle ?? '',
  description: row.description ?? '',
  features: asArray(row.features),
  idealFor: asArray(row.ideal_for),
  buttonText: row.button_text ?? '',
  highlighted: row.highlighted,
  badge: row.badge,
  hidden: row.hidden,
  quote: row.quote ?? undefined,
  savingsNote: row.savings_note ?? undefined,
});

/**
 * Membership tiers, editable in the admin.
 *
 * `fallback` is MEMBERSHIP_TIERS from src/lib/pricing.ts — the array the site
 * shipped with; it stands in until the query resolves and if it fails or the
 * table is empty, so no page ever renders a missing or zero price.
 */
export const useMembershipTiers = () => {
  const { data, isError } = useQuery({
    queryKey: ['membership_tiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as unknown as MembershipTierRow[]).map(toTier);
    },
    staleTime: 5 * 60 * 1000,
  });

  const tiers = !data || data.length === 0 || isError ? MEMBERSHIP_TIERS : data;

  return {
    tiers,
    visibleTiers: tiers.filter((t) => !t.hidden),
    /** Look up a single tier by id, e.g. for a teaser card that only needs the price. */
    getTier: (id: string) => tiers.find((t) => t.id === id),
  };
};
