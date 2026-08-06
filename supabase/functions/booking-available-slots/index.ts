import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Session duration mapping (minutes)
// Keep in sync with booking-create and booking-available-days.
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
 * Seasonal rules override defaults for that date.
 */
function getAvailabilityForDate(
  dateStr: string,
  dayOfWeek: number,
  allRows: AvailabilityRow[]
): AvailabilityRow[] {
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

  return allRows.filter(
    (r) =>
      r.day_of_week === dayOfWeek &&
      r.effective_from === null &&
      r.effective_until === null
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date"); // Format: YYYY-MM-DD
    const sessionType = url.searchParams.get("type");

    // Validation
    if (!date || !sessionType) {
      throw new Error("Missing required parameters: date and type");
    }

    if (!SESSION_DURATIONS[sessionType]) {
      throw new Error(`Invalid session type: ${sessionType}`);
    }

    // Parse date
    const requestedDate = new Date(date + "T00:00:00Z");
    if (isNaN(requestedDate.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // 24h minimum notice
    const minBookingDate = new Date();
    minBookingDate.setHours(minBookingDate.getHours() + 24);

    if (requestedDate < minBookingDate) {
      return new Response(
        JSON.stringify({
          slots: [],
          message: "Date must be at least 24 hours from now",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const dayOfWeek = requestedDate.getUTCDay();
    const sessionDuration = SESSION_DURATIONS[sessionType];

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if date is blocked
    const { data: blockedDate, error: blockedError } = await supabaseClient
      .from("blocked_dates")
      .select("*")
      .eq("date", date)
      .maybeSingle();

    if (blockedError) throw blockedError;

    if (blockedDate) {
      return new Response(
        JSON.stringify({
          slots: [],
          message: `Date is blocked: ${blockedDate.reason || "Not available"}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get all active availability rows
    const { data: allAvailability, error: availError } = await supabaseClient
      .from("availability")
      .select("*")
      .eq("is_active", true);

    if (availError) {
      console.error("Availability error:", availError);
      return new Response(
        JSON.stringify({
          slots: [],
          message: "No availability configured for this day",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Filter to relevant windows (seasonal or default) for this date
    const availability = getAvailabilityForDate(
      date,
      dayOfWeek,
      allAvailability || []
    );

    if (availability.length === 0) {
      return new Response(
        JSON.stringify({
          slots: [],
          message: "No availability configured for this day",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get existing bookings for this date
    const startOfDay = new Date(requestedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const { data: bookings, error: bookingsError } = await supabaseClient
      .from("session_bookings")
      .select("session_date, end_time, duration_minutes")
      .gte("session_date", startOfDay.toISOString())
      .lte("session_date", endOfDay.toISOString())
      .in("status", ["confirmed", "pending_payment", "scheduled"]);

    if (bookingsError) {
      console.error("Bookings error:", bookingsError);
    }

    // Generate time slots from ALL matching availability windows
    const slotSet = new Set<string>();
    const slots: Array<{ time: string; available: boolean; reason?: string }> = [];

    for (const avail of availability) {
      const [startHour, startMin] = avail.start_time.split(":").map(Number);
      const [endHour, endMin] = avail.end_time.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      for (
        let slotMinutes = startMinutes;
        slotMinutes + sessionDuration <= endMinutes;
        slotMinutes += 30
      ) {
        const hours = Math.floor(slotMinutes / 60);
        const minutes = slotMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;

        // Deduplicate: skip if we already processed this time
        if (slotSet.has(timeStr)) continue;
        slotSet.add(timeStr);

        // Create slot datetime
        const slotStart = new Date(requestedDate);
        slotStart.setUTCHours(hours, minutes, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + sessionDuration);

        // Skip if slot is in the past or within 24h
        if (slotStart < minBookingDate) {
          slots.push({
            time: timeStr,
            available: false,
            reason: "Too soon (24h minimum notice required)",
          });
          continue;
        }

        // Check if slot conflicts with existing bookings
        const conflict = bookings?.find((booking: any) => {
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

        if (conflict) {
          slots.push({
            time: timeStr,
            available: false,
            reason: "Already booked",
          });
        } else {
          slots.push({
            time: timeStr,
            available: true,
          });
        }
      }
    }

    // Sort slots by time
    slots.sort((a, b) => a.time.localeCompare(b.time));

    return new Response(JSON.stringify({ slots }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in booking-available-slots:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
