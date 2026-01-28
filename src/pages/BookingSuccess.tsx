import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Calendar, Clock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id");
  const stripeSessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId, stripeSessionId]);

  const fetchBooking = async () => {
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
  };

  const sessionTypeNames: Record<string, string> = {
    discovery: "Discovery Call",
    one_on_one: "Individual Consultation",
    family: "Family Session",
    premium_consultation: "Premium Consultation",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reservation...</p>
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
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-3xl font-serif font-semibold mb-4">Something went wrong</h1>
              <p className="text-muted-foreground mb-8">{error || "Reservation not found"}</p>
              <Link to="/booking">
                <Button className="bg-gradient-gold">
                  Back to Booking
                </Button>
              </Link>
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
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-gold rounded-full mb-6">
                <CheckCircle size={48} className="text-primary-foreground" />
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
                {isConfirmed ? "Booking Confirmed!" : "Booking Created"}
              </h1>

              <p className="text-lg text-muted-foreground">
                {isConfirmed
                  ? "Your booking has been successfully confirmed. Confirmation email has been sent."
                  : "Booking is awaiting payment completion."}
              </p>
            </div>

            {/* Booking Details Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.session_date), "EEEE, MMMM d, yyyy", { locale: enUS })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="text-primary mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold">Time</p>
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
                    <p className="font-semibold">Session Type</p>
                    <p className="text-muted-foreground">
                      {sessionTypeNames[booking.session_type] || booking.session_type}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-semibold">{booking.client_name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-semibold">{booking.client_email}</span>
                  </div>
                  {booking.price_cents > 0 && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-bold text-primary">€{(booking.price_cents / 100).toFixed(2)}</span>
                    </div>
                  )}
                  {booking.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-1">Note:</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              {isConfirmed && (
                <Button
                  onClick={addToGoogleCalendar}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Calendar className="mr-2" size={20} />
                  Add to Google Calendar
                </Button>
              )}

              <Link to="/" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Back to Homepage
                </Button>
              </Link>
            </div>

            {/* What's Next */}
            <Card className="mt-8 bg-gradient-warm border-primary/20">
              <CardHeader>
                <CardTitle>What's next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm">
                    {isConfirmed
                      ? "Confirmation email has been sent to your email address"
                      : "Complete payment to confirm your reservation"}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm">
                    You will receive a reminder 24 hours before your session
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm">
                    You will receive the online session link by email one day before your appointment
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="text-center mt-12 text-sm text-muted-foreground">
              <p>Have questions? Contact us at</p>
              <a href="mailto:silvie@resilientmind.io" className="text-primary hover:underline">
                silvie@resilientmind.io
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
