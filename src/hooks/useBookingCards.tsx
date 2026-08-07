import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionTypeConfig {
  type: string;
  /** Optional booking type sent to the backend (defaults to `type`).
   *  Lets two cards share the same priced/booked session while keeping
   *  distinct `type` values for UI selection. */
  bookingType?: string;
  title: string;
  badge?: string;
  duration: number;
  durationLabel?: string;
  price: number;
  priceNote?: string;
  description: string;
  features: string[];
  note?: string;
  /** Optional ISO date (YYYY-MM-DD); the card hides after this day */
  validUntil?: string;
  image?: string;
  phone?: string;
  featuresHeading?: string;
  extraSections?: {
    heading?: string;
    intro?: string;
    features?: string[];
    outro?: string;
  }[];
  email?: string;
  contactHeading?: string;
  highlight?: boolean;
}

type BookingCardRow = {
  card_key: string;
  booking_type: string | null;
  title: string;
  badge: string | null;
  image: string | null;
  duration_minutes: number;
  duration_label: string | null;
  price_eur: number | string;
  price_note: string | null;
  description: string;
  features_heading: string | null;
  features: unknown;
  extra_sections: unknown;
  note: string | null;
  contact_heading: string | null;
  phone: string | null;
  email: string | null;
  valid_until: string | null;
  highlight: boolean;
};

const optional = (v: string | null) => v ?? undefined;

const toConfig = (row: BookingCardRow): SessionTypeConfig => ({
  type: row.card_key,
  bookingType: optional(row.booking_type),
  title: row.title,
  badge: optional(row.badge),
  image: optional(row.image),
  duration: row.duration_minutes,
  durationLabel: optional(row.duration_label),
  // numeric(10,2) comes back as a string from PostgREST.
  price: Number(row.price_eur),
  priceNote: optional(row.price_note),
  description: row.description,
  featuresHeading: optional(row.features_heading),
  features: Array.isArray(row.features) ? (row.features as string[]) : [],
  extraSections: Array.isArray(row.extra_sections)
    ? (row.extra_sections as SessionTypeConfig['extraSections'])
    : undefined,
  note: optional(row.note),
  contactHeading: optional(row.contact_heading),
  phone: optional(row.phone),
  email: optional(row.email),
  validUntil: optional(row.valid_until),
  highlight: row.highlight,
});

/**
 * Booking cards, editable in the admin.
 *
 * `fallback` is the array Booking.tsx used to ship with; it stands in until the
 * query resolves and if it fails, so the booking page never renders empty.
 */
export const useBookingCards = (fallback: SessionTypeConfig[]) => {
  const { data, isError } = useQuery({
    queryKey: ['booking_cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_cards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return (data as unknown as BookingCardRow[]).map(toConfig);
    },
    staleTime: 5 * 60 * 1000,
  });

  const cards = !data || data.length === 0 || isError ? fallback : data;

  const now = new Date();
  return {
    /** Time-limited offers drop out once their last day has passed. */
    visibleCards: cards.filter(
      (c) => !c.validUntil || new Date(`${c.validUntil}T23:59:59`) >= now
    ),
    allCards: cards,
  };
};
