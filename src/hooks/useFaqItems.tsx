import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FaqItem {
  q: string;
  a: string;
}

type FaqItemRow = {
  question: string;
  answer: string;
};

/**
 * FAQ entries, editable in the admin.
 *
 * `groupKey` selects which FAQ block to load ('membership' for
 * Membership.tsx/Membership2.tsx, 'hubs' for ResilientHubs.tsx).
 * `fallback` is the array the page used to ship with; it stands in until the
 * query resolves and if it fails, so the page never renders an empty FAQ.
 */
export const useFaqItems = (groupKey: string, fallback: FaqItem[]): FaqItem[] => {
  const { data, isError } = useQuery({
    queryKey: ['faq_items', groupKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('question, answer')
        .eq('group_key', groupKey)
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as unknown as FaqItemRow[]).map((row) => ({ q: row.question, a: row.answer }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return !data || data.length === 0 || isError ? fallback : data;
};
