import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { CheckCircle, Calendar, Clock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { useCms } from "@/hooks/useCms";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const { t } = useCms();
  const bookingId = searchParams.get("id");
  const stripeSessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      let query = supabase.from("session_bookings").select("*");

      if (bookingId) {
        query = query.eq("id", bookingId);
      } else if (stripeSessionId) {
        query = query.eq("stripe_session_id", stripeSessionId);
      } else {
        setError("Missing booking ID");
        return;
      }

      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Booking not found");
        return;
      }

      setBooking(data);
    } catch (err: any) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  }, [bookingId, stripeSessionId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const sessionTypeNames: Record<string, string> = {
    discovery: t("booking_success_type_discovery", "Discovery Call"),
    one_on_one: t("booking_success_type_one_on_one", "Individual Consultation"),
    family: t("booking_success_type_family", "Family Session"),
    endometriosis_support: t("booking_success_type_endometriosis_support", "Endometriosis & Chronic Pain Support"),
    individual_eft_reiki_offer: t("booking_success_type_individual_eft_reiki_offer", "EFT Tapping & Reiki Session"),
    premium_consultation: t("booking_success_type_premium_consultation", "Premium Consultation"),
  };

  const addToGoogleCalendar = () => {
    if (!booking) return;

    const startDate = new Date(booking.session_date);
    const endDate = new Date(booking.end_time || new Date(startDate.getTime() + booking.duration_minutes * 60000));

    const title = encodeURIComponent(sessionTypeNames[booking.session_type] || booking.session_type);
    const description = encodeURIComponent(
      `Session with Silvie Bogdánová\n\nClient: ${booking.client_name}\nEmail: ${booking.client_email}${
        booking.notes ? `\n\nNotes: ${booking.notes}` : ""
      }`
    );
    const startTime = startDate.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = endDate.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&location=Online`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div id="cms-booking-success-loading" className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("booking_success_loading_text", "Loading reservation...")}</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container px-4">
            <div id="cms-booking-success-error" className="max-w-2xl mx-auto text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-serif font-semibold mb-4">{t("booking_success_error_title", "Something went wrong")}</h1>
              <p className="text-muted-foreground mb-8">{error || t("booking_success_error_fallback", "Reservation not found")}</p>
              <Button asChild className="bg-gradient-gold">
                <Link to="/booking">
                  {t("booking_success_error_button", "Back to Booking")}
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isConfirmed = booking.status === "confirmed";
  const isPendingPayment = booking.status === "pending_payment";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("booking_success_seo_title", "Booking Confirmed | Resilient Mind")}
        description={t("booking_success_seo_description", "Your booking has been confirmed.")}
        path="/booking/success"
        noindex
      />
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div id="cms-booking-success-header" className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gold rounded-full mb-6">
                <CheckCircle size={48} className="text-primary-foreground" />
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
                {isConfirmed
                  ? t("booking_success_title_confirmed", "Booking Confirmed!")
                  : t("booking_success_title_created", "Booking Created")}
              </h1>

              <p className="text-lg text-muted-foreground">
                {isConfirmed
                  ? t("booking_success_subtitle_confirmed", "Your booking has been successfully confirmed. Confirmation email has been sent.")
                  : t("booking_success_subtitle_pending", "Booking is awaiting payment completion.")}
              </p>
            </div>

            {/* Booking Details Card */}
            <Card id="cms-booking-success-details" className="mb-8">
              <CardHeader>
                <CardTitle>{t("booking_success_details_title", "Booking Details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{t("booking_success_label_date", "Date")}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.session_date), "EEEE, MMMM d, yyyy", { locale: enUS })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{t("booking_success_label_time", "Time")}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.session_date), "HH:mm")} -{" "}
                      {format(
                        new Date(booking.end_time || new Date(new Date(booking.session_date).getTime() + booking.duration_minutes * 60000)),
                        "HH:mm"
                      )}{" "}
                      ({booking.duration_minutes} min)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">{t("booking_success_label_session_type", "Session Type")}</p>
                    <p className="text-muted-foreground">
                      {sessionTypeNames[booking.session_type] || booking.session_type}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("booking_success_label_client", "Client:")}</span>
                    <span className="font-semibold">{booking.client_name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">{t("booking_success_label_email", "Email:")}</span>
                    <span className="font-semibold">{booking.client_email}</span>
                  </div>
                  {booking.price_cents > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground">{t("booking_success_label_price", "Price:")}</span>
                      <span className="font-bold text-primary">€{(booking.price_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {booking.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">{t("booking_success_label_note", "Note:")}</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div id="cms-booking-success-actions" className="space-y-4">
              {isConfirmed && (
                <Button
                  onClick={addToGoogleCalendar}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="mr-2" size={20} />
                  {t("booking_success_calendar_button", "Add to Google Calendar")}
                </Button>
              )}

              <Button asChild variant="outline" className="w-full" size="lg">
                <Link to="/">
                  {t("booking_success_home_button", "Back to Homepage")}
                </Link>
              </Button>
            </div>

            {/* What's Next */}
            <Card id="cms-booking-success-next" className="mt-8 bg-gradient-warm border-primary/20">
              <CardHeader>
                <CardTitle>{t("booking_success_next_title", "What's next?")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm">
                    {isConfirmed
                      ? t("booking_success_next_1_confirmed", "Confirmation email has been sent to your email address")
                      : t("booking_success_next_1_pending", "Complete payment to confirm your reservation")}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm">
                    {t("booking_success_next_2", "You will receive a reminder 24 hours before your session")}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm">
                    {t("booking_success_next_3", "You will receive the online session link by email one day before your appointment")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div id="cms-booking-success-contact" className="text-center mt-12 text-sm text-muted-foreground">
              <p>{t("booking_success_contact_text", "Have questions? Contact us at")}</p>
              <a href="mailto:contact@resilientmind.io" className="text-primary hover:underline">
                contact@resilientmind.io
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSuccess;
