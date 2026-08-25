import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Session duration mapping (minutes)
// Fallback only; booking_cards is the source of truth (see loadDuration).
const SESSION_DURATIONS: Record<string, number> = {
  discovery: 30,
  one_on_one: 60,
  family: 60,
  endometriosis_support: 60,
  individual_eft_reiki_offer: 60,
  premium_consultation: 60,
};

interface AvailabilityRow {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  effective_from: string | null;
  effective_until: string | null;
  schedule_name: string | null;
}

/**
 * Get availability windows for a specific date.
 * Seasonal rules (effective_from/until filled) override defaults for that date.
 * If no seasonal rule matches, fall back to default (NULL dates).
 */
function getAvailabilityForDate(
  dateStr: string,
  dayOfWeek: number,
  allRows: AvailabilityRow[]
): AvailabilityRow[] {
  // Find seasonal rules where effective_from <= date <= effective_until AND day matches
  const seasonal = allRows.filter(
    (r) =>
      r.day_of_week === dayOfWeek &&
      r.effective_from !== null &&
      r.effective_until !== null &&
      r.effective_from <= dateStr &&
      r.effective_until >= dateStr
  );

  if (seasonal.length > 0) {
    return seasonal;
  }

  // Fallback: default rows (NULL dates) for this day
  return allRows.filter(
    (r) =>
      r.day_of_week === dayOfWeek &&
      r.effective_from === null &&
      r.effective_until === null
  );
}

/**
 * Session length from the card the admin edits, falling back to the map above.
 * Kept in sync with booking-create's loadSessionConfig, including the card_key:
 * two cards can share one session type and need not be the same length.
 */
// deno-lint-ignore no-explicit-any
async function loadDuration(
  supabaseClient: any,
  sessionType: string,
  cardKey?: string | null,
): Promise<number> {
  try {
    const query = supabaseClient
      .from("booking_cards")
      .select("duration_minutes")
      .eq("is_active", true);

    const { data, error } = await (cardKey
      ? query.eq("card_key", cardKey)
      : query.or(`booking_type.eq.${sessionType},card_key.eq.${sessionType}`))
      .order("sort_order")
      .limit(1);

    if (error) throw error;
    const minutes = Number(data?.[0]?.duration_minutes);
    if (Number.isFinite(minutes) && minutes > 0) return minutes;
  } catch (err) {
    console.error("booking_cards lookup failed, using fallback duration:", err);
  }
  return SESSION_DURATIONS[sessionType];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const month = url.searchParams.get("month"); // Format: YYYY-MM
    const sessionType = url.searchParams.get("type");
    const cardKey = url.searchParams.get("card");

    // Validation
    if (!month || !sessionType) {
      throw new Error("Missing required parameters: month and type");
    }

    // Parse month
    const [year, monthNum] = month.split("-").map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new Error("Invalid month format. Use YYYY-MM");
    }

    // Calculate start and end of month
    const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
    const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59));

    // 24h minimum notice
    const minBookingDate = new Date();
    minBookingDate.setHours(minBookingDate.getHours() + 24);

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const sessionDuration = await loadDuration(supabaseClient, sessionType, cardKey);
    if (!sessionDuration) {
      throw new Error(`Invalid session type: ${sessionType}`);
    }

    // Get availability windows (active only)
    const { data: availability, error: availError } = await supabaseClient
      .from("availability")
      .select("*")
      .eq("is_active", true);

    if (availError) throw availError;

    // Get blocked dates in the month
    const { data: blockedDates, error: blockedError } = await supabaseClient
      .from("blocked_dates")
      .select("date")
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0]);

    if (blockedError) throw blockedError;

    const blockedSet = new Set(
      blockedDates?.map((bd: any) => bd.date) || []
    );

    // Get all bookings in the month (confirmed + pending)
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from("session_bookings")
      .select("session_date, end_time, duration_minutes")
      .gte("session_date", startDate.toISOString())
      .lte("session_date", endDate.toISOString())
      .in("status", ["confirmed", "pending_payment", "scheduled"]);

    if (bookingsError) throw bookingsError;

    // Organize bookings by date
    const bookingsByDate: Record<string, any[]> = {};
    bookings?.forEach((booking: any) => {
      const dateKey = booking.session_date.split("T")[0];
      if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
      bookingsByDate[dateKey].push(booking);
    });

    // Generate available days
    const availableDays: string[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayOfWeek = currentDate.getUTCDay();

      // Skip if date is in the past or within 24h
      if (currentDate < minBookingDate) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      // Skip if blocked
      if (blockedSet.has(dateStr)) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      // Get availability for this specific date (seasonal or default)
      const dayAvailability = getAvailabilityForDate(
        dateStr,
        dayOfWeek,
        availability || []
      );

      if (dayAvailability.length === 0) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      // Calculate available slots for this day
      const dayBookings = bookingsByDate[dateStr] || [];
      let hasAvailableSlots = false;

      for (const avail of dayAvailability) {
        // Parse start/end times
        const [startHour, startMin] = avail.start_time.split(":").map(Number);
        const [endHour, endMin] = avail.end_time.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Check 30-min slots
        for (
          let slotMinutes = startMinutes;
          slotMinutes + sessionDuration <= endMinutes;
          slotMinutes += 30
        ) {
          const slotStart = new Date(currentDate);
          slotStart.setUTCHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
          const slotEnd = new Date(slotStart);
          slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + sessionDuration);

          // Check if slot conflicts with existing bookings
          const hasConflict = dayBookings.some((booking: any) => {
            const bookingStart = new Date(booking.session_date);
            const bookingEnd = booking.end_time
              ? new Date(booking.end_time)
              : new Date(
                  bookingStart.getTime() + (booking.duration_minutes || 60) * 60000
                );

            return (
              (slotStart >= bookingStart && slotStart < bookingEnd) ||
              (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
              (slotStart <= bookingStart && slotEnd >= bookingEnd)
            );
          });

          if (!hasConflict) {
            hasAvailableSlots = true;
            break;
          }
        }

        if (hasAvailableSlots) break;
      }

      if (hasAvailableSlots) {
        availableDays.push(dateStr);
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return new Response(JSON.stringify({ availableDays }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in booking-available-days:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
