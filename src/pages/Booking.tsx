import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Clock, Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addMonths, startOfMonth } from "date-fns";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { enUS } from "date-fns/locale";

// Session types configuration
interface SessionTypeConfig {
  type: string;
  title: string;
  /** Optional badge/label shown above the card title */
  badge?: string;
  duration: number;
  /** Optional custom duration label (overrides "{duration} min") */
  durationLabel?: string;
  price: number;
  /** Optional small note shown under the price (e.g. "€79 per session") */
  priceNote?: string;
  description: string;
  features: string[];
  /** Optional paragraph shown after the feature list */
  note?: string;
  /** Optional ISO date (YYYY-MM-DD); the card hides after this day */
  validUntil?: string;
  /** Optional card image URL */
  image?: string;
  /** Optional contact phone (renders clickable Call + WhatsApp links) */
  phone?: string;
  /** Optional heading shown above the main feature list */
  featuresHeading?: string;
  /** Optional extra sections (each with heading, intro text, own bullets, outro) */
  extraSections?: {
    heading?: string;
    intro?: string;
    features?: string[];
    outro?: string;
  }[];
  /** Optional contact CTA email (renders clickable mailto link) */
  email?: string;
  /** Optional heading for the contact CTA block (e.g. "Book your session") */
  contactHeading?: string;
  /** When true the card is visually emphasised and spans the full width */
  highlight?: boolean;
}

const SESSION_TYPES: SessionTypeConfig[] = [
  {
    type: "discovery",
    title: "Discovery Call",
    duration: 30,
    price: 0,
    description:
      "A complimentary introductory call to understand your needs, answer your questions, and explore whether we're the right fit.",
    features: [
      "Understand your current challenges",
      "Ask any questions you may have",
      "Explore how I can support you",
      "No commitment required",
    ],
  },
  {
    type: "one_on_one",
    title: "Individual Session",
    duration: 60,
    price: 107,
    description:
      "A personalised 1:1 session designed to support emotional resilience, inner calm, and lasting wellbeing.",
    features: [
      "Holistic counselling approach",
      "EFT Tapping for emotional regulation",
      "Byron Katie inquiry for clarity and perspective",
      "Expressive creative art (when supportive)",
      "Distance Reiki (optional – available worldwide)",
    ],
    phone: "+34 602 413 244",
  },
  {
    type: "family",
    title: "Family Session",
    duration: 60,
    price: 127,
    description:
      "A supportive family session designed to strengthen emotional resilience, communication, and connection.",
    features: [
      "Child-led expressive creative activities",
      "Emotional regulation tools for parents and children, including EFT (Emotional Freedom Techniques), where appropriate",
      "Reiki for parents available on request",
    ],
    note: "Each session is individually tailored to the unique needs of the child and parent(s), depending on age, goals, and the focus of the session.",
  },
  {
    type: "endometriosis_support",
    title: "Endometriosis & Chronic Pain Support",
    badge: "Complete Support Package",
    duration: 60,
    durationLabel: "3 × 60 min sessions",
    price: 237,
    priceNote: "€79 per session",
    description:
      "A structured three-session support package designed to help you better understand your body, reduce emotional overwhelm, and build resilience while living with endometriosis or chronic pain.",
    features: [
      "Session 1 – Emotional clarity, support & resilience tools (60 min), including EFT (Emotional Freedom Techniques)",
      "Session 2 – Distance Reiki to promote relaxation and support emotional wellbeing (60 min)",
      "Session 3 – Expressive creative art for self-expression, reflection & integration (60 min)",
      "Personalised support tailored to your unique experience",
      "Available online or in person in Dénia, Spain",
    ],
    note: "❤️ Complete Support Package – €237 (€79 per session). A valuable way to receive personalised support, guidance, and practical tools across three dedicated sessions.",
  },
  {
    type: "individual_eft_reiki_offer",
    title: "EFT Tapping & Reiki Session",
    badge: "❤️ Special Welcome Offer – In Person & Online",
    highlight: true,
    duration: 60,
    price: 50,
    description:
      "A gentle 60-minute session designed to help you calm your nervous system, release emotional stress, and reconnect with yourself.\n\nBy combining EFT (Emotional Freedom Techniques) with Reiki, each session is tailored to your unique needs, creating a safe and supportive space for emotional wellbeing, relaxation, and inner balance.",
    featuresHeading: "This session may help you:",
    features: [
      "Calm your nervous system",
      "Release emotional stress and overwhelm",
      "Feel lighter, calmer, and more balanced",
      "Reconnect with yourself",
      "Support emotional wellbeing through EFT & Reiki",
    ],
    extraSections: [
      {
        heading: "Continued Support After Your Session",
        intro:
          "Your healing doesn't end when the session finishes. To help you continue your practice at home, you'll also receive:",
        features: [
          "An Introduction to EFT Guide (printed or PDF) explaining what EFT is, how it works, and how to use it with confidence.",
          "A beginner's EFT tapping script to help you become familiar with the technique if you're new to EFT.",
          "A personalised follow-up EFT tapping video, created specifically for your needs after our session, so you can continue practising at home.",
        ],
        outro:
          "As your confidence grows, you'll learn how to listen to your own emotions and body, using EFT in a way that feels natural and supportive for you.",
      },
    ],
    note: "📍 Available online or in person in Dénia, Spain\n\n❤️ Special Welcome Offer valid until 31 July 2026.",
    contactHeading: "Book your session",
    phone: "+34 602 413 244",
    email: "contact@resilientmind.io",
    validUntil: "2026-07-31",
  },
];

type SessionType = string;

// Session types currently bookable (hides time-limited offers past their date)
const getVisibleSessionTypes = () => {
  const now = new Date();
  return SESSION_TYPES.filter(
    (s) => !s.validUntil || new Date(`${s.validUntil}T23:59:59`) >= now
  );
};

const Booking = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Session Type Selection
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);

  // Step 2: Date Selection
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loadingDays, setLoadingDays] = useState(false);

  // Step 3: Time Selection
  const [availableSlots, setAvailableSlots] = useState<Array<{ time: string; available: boolean; reason?: string }>>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4: Client Info
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    notes: "",
  });

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        client_name: profile.full_name || "",
        client_email: profile.email || "",
      }));
    }
  }, [profile]);

  const fetchAvailableDays = useCallback(async () => {
    if (!selectedType) return;

    setLoadingDays(true);
    try {
      const monthStr = format(currentMonth, "yyyy-MM");
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-available-days?month=${monthStr}&type=${selectedType}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available days");
      }

      const result = await response.json();
      setAvailableDays(result.availableDays || []);
    } catch (error: any) {
      console.error("Error fetching available days:", error);
      toast.error("Failed to load available days");
    } finally {
      setLoadingDays(false);
    }
  }, [selectedType, currentMonth]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !selectedType) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-available-slots?date=${selectedDate}&type=${selectedType}`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const result = await response.json();
      setAvailableSlots(result.slots || []);
    } catch (error: any) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to load available time slots");
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedType]);

  // Fetch available days when type is selected
  useEffect(() => {
    if (selectedType && step === 2) {
      fetchAvailableDays();
    }
  }, [selectedType, currentMonth, step, fetchAvailableDays]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedType && step === 3) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedType, step, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Combine date and time to ISO string
      const startTime = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();

      // Direct fetch call with proper headers instead of supabase.functions.invoke
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/booking-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            session_type: selectedType,
            client_name: formData.client_name,
            client_email: formData.client_email,
            start_time: startTime,
            notes: formData.notes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Booking response received

      // Free session (discovery) - redirect to success page
      if (data.status === "confirmed") {
        toast.success("Booking confirmed! Check your email.");
        window.location.href = `/booking/success?id=${data.booking_id}`;
        return;
      }

      // Paid session - redirect to Stripe checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error: any) {
      console.error("Error creating booking:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));

      // Try to get more details from the error
      const errorMessage = error?.message || error?.error?.message || error?.msg || "Booking failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedSessionType = SESSION_TYPES.find((s) => s.type === selectedType);
  const currentYear = currentMonth.getFullYear();
  const currentMonthNum = currentMonth.getMonth();

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonthNum, 1);
    const lastDay = new Date(currentYear, currentMonthNum + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push(dateStr);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Book a Session — Individual Consultations €107/hour | Resilient Mind"
        description="Schedule a free discovery call or book an individual art expressive therapy session with Silvie Bogdanova. Online consultations from €107/hour."
        path="/booking"
      />
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <PageHero>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Calendar size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Session Booking
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
                Let's Work Together
              </h1>

              <p className="text-lg text-muted-foreground font-sans">
                Select session type and schedule a time that works for you
              </p>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step >= s
                          ? "bg-gradient-gold text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 4 && (
                      <div
                        className={`w-12 h-1 mx-1 ${step > s ? "bg-gradient-gold" : "bg-muted"}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
        </PageHero>

        {/* Booking Steps */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {/* Step 1: Session Type Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif font-semibold text-center mb-8">
                    Select Session Type
                  </h2>

                  <div className="grid md:grid-cols-2 gap-5">
                    {getVisibleSessionTypes().map((session) => {
                      const isSelected = selectedType === session.type;
                      return (
                        <Card
                          key={session.type}
                          className={`relative cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                            session.highlight
                              ? "md:col-span-2 ring-2 ring-primary/50 bg-gradient-to-br from-primary/[0.07] to-transparent shadow-elevated"
                              : ""
                          } ${
                            isSelected
                              ? "border-2 border-primary bg-primary/5 shadow-[0_0_0_3px_rgba(196,155,65,0.2)] scale-[1.02]"
                              : "border hover:border-primary/50"
                          }`}
                          onClick={() => {
                            setSelectedType(session.type);
                          }}
                        >
                          {isSelected && (
                            <div className="absolute -top-2.5 left-4 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full z-10">
                              Selected
                            </div>
                          )}
                          {session.image && (
                            <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                              <img
                                src={session.image}
                                alt={session.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <CardHeader>
                            {session.badge && (
                              <div className="inline-flex self-start items-center px-3 py-1 mb-1 bg-gradient-gold text-primary-foreground text-xs font-semibold rounded-full">
                                {session.badge}
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock size={14} />
                                <span>{session.durationLabel || `${session.duration} min`}</span>
                              </div>
                              {isSelected && (
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                                  <Check size={14} className="text-primary-foreground" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <CardTitle className="text-xl font-serif">
                              {session.title}
                            </CardTitle>
                            <div className="text-2xl font-serif font-bold text-primary mt-2">
                              {session.price === 0 ? "Free" : `€${session.price}`}
                            </div>
                            {session.priceNote && (
                              <div className="text-sm text-muted-foreground">
                                {session.priceNote}
                              </div>
                            )}
                          </CardHeader>
                          <CardContent>
                            <CardDescription className="mb-4 whitespace-pre-line">
                              {session.description}
                            </CardDescription>
                            {session.featuresHeading && (
                              <p className="text-sm font-medium mb-2">
                                {session.featuresHeading}
                              </p>
                            )}
                            <ul className="space-y-2">
                              {session.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {session.extraSections?.map((sec, si) => (
                              <div key={si} className="mt-5">
                                {sec.heading && (
                                  <p className="font-serif font-semibold text-base mb-1">
                                    {sec.heading}
                                  </p>
                                )}
                                {sec.intro && (
                                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                                    {sec.intro}
                                  </p>
                                )}
                                {sec.features && (
                                  <ul className="space-y-2">
                                    {sec.features.map((feature, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm">
                                        <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {sec.outro && (
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {sec.outro}
                                  </p>
                                )}
                              </div>
                            ))}
                            {session.note && (
                              <p className="text-xs text-muted-foreground mt-4 leading-relaxed whitespace-pre-line">
                                {session.note}
                              </p>
                            )}
                            {session.contactHeading ? (
                              <div className="mt-5 pt-4 border-t border-border">
                                <p className="font-serif font-semibold text-base mb-2">
                                  {session.contactHeading}
                                </p>
                                {session.phone && (
                                  <p className="text-sm flex items-center gap-2">
                                    <span aria-hidden>📞</span>
                                    <a
                                      href={`tel:${session.phone.replace(/\s+/g, "")}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
                                    >
                                      {session.phone}
                                    </a>
                                  </p>
                                )}
                                {session.email && (
                                  <p className="text-sm flex items-center gap-2 mt-1">
                                    <span aria-hidden>✉️</span>
                                    <a
                                      href={`mailto:${session.email}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
                                    >
                                      {session.email}
                                    </a>
                                  </p>
                                )}
                              </div>
                            ) : session.phone ? (
                              <p className="text-sm mt-4">
                                <span className="text-muted-foreground">Questions? </span>
                                <a
                                  href={`tel:${session.phone.replace(/\s+/g, "")}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
                                >
                                  Call
                                </a>
                                <span className="text-muted-foreground"> · </span>
                                <a
                                  href={`https://wa.me/${session.phone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
                                >
                                  WhatsApp
                                </a>
                                <span className="text-muted-foreground"> Silvie: {session.phone}</span>
                              </p>
                            ) : null}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedType}
                      className="bg-gradient-gold"
                    >
                      Continue <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Date Selection */}
              {step === 2 && selectedSessionType && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2" size={16} /> Back
                    </Button>
                    <Badge variant="outline" className="text-sm">
                      {selectedSessionType.title} - {selectedSessionType.durationLabel || `${selectedSessionType.duration} min`}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-serif font-semibold text-center mb-8">
                    Select Date
                  </h2>

                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
                      disabled={loadingDays}
                    >
                      <ArrowLeft size={16} />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {format(currentMonth, "LLLL yyyy", { locale: enUS })}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                      disabled={loadingDays}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  {loadingDays ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin" size={32} />
                    </div>
                  ) : (
                    <div className="bg-card border rounded-2xl p-6">
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map((day) => (
                          <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dateStr, index) => {
                          if (!dateStr) {
                            return <div key={`empty-${index}`} />;
                          }

                          const isAvailable = availableDays.includes(dateStr);
                          const isSelected = selectedDate === dateStr;

                          return (
                            <button
                              key={dateStr}
                              onClick={() => isAvailable && setSelectedDate(dateStr)}
                              disabled={!isAvailable}
                              className={`
                                aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                                transition-all
                                ${isSelected ? "bg-gradient-gold text-primary-foreground shadow-gold" : ""}
                                ${isAvailable && !isSelected ? "bg-primary/10 hover:bg-primary/20 text-primary" : ""}
                                ${!isAvailable ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                              `}
                            >
                              {parseInt(dateStr.split("-")[2])}
                            </button>
                          );
                        })}
                      </div>

                      {availableDays.length === 0 && !loadingDays && (
                        <p className="text-center text-muted-foreground mt-6">
                          There are no available dates this month
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedDate}
                      className="bg-gradient-gold"
                    >
                      Continue <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Time Selection */}
              {step === 3 && selectedSessionType && selectedDate && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => {
                      setStep(2);
                      setSelectedTime(null);
                    }}>
                      <ArrowLeft className="mr-2" size={16} /> Back
                    </Button>
                    <Badge variant="outline" className="text-sm">
                      {format(new Date(selectedDate), "MMMM d, yyyy", { locale: enUS })}
                    </Badge>
                  </div>

                  <h2 className="text-2xl font-serif font-semibold text-center mb-8">
                    Select Time
                  </h2>

                  {loadingSlots ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="animate-spin" size={32} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`
                            ${selectedTime === slot.time ? "bg-gradient-gold" : ""}
                            ${!slot.available ? "opacity-50" : ""}
                          `}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  )}

                  {availableSlots.filter((s) => s.available).length === 0 && !loadingSlots && (
                    <p className="text-center text-muted-foreground">
                      No available times for this day
                    </p>
                  )}

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!selectedTime}
                      className="bg-gradient-gold"
                    >
                      Continue <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Client Info & Confirmation */}
              {step === 4 && selectedSessionType && selectedDate && selectedTime && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" onClick={() => setStep(3)}>
                      <ArrowLeft className="mr-2" size={16} /> Back
                    </Button>
                  </div>

                  <h2 className="text-2xl font-serif font-semibold text-center mb-8">
                    Your Information
                  </h2>

                  {/* Booking Summary */}
                  <Card className="bg-gradient-warm border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Session type:</span>
                        <span className="font-semibold">{selectedSessionType.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-semibold">
                          {format(new Date(selectedDate), "MMMM d, yyyy", { locale: enUS })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-semibold">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{selectedSessionType.durationLabel || `${selectedSessionType.duration} min`}</span>
                      </div>
                      <div className="flex justify-between text-lg pt-2 border-t">
                        <span className="font-semibold">Price:</span>
                        <span className="font-bold text-primary">
                          {selectedSessionType.price === 0 ? "Free" : `€${selectedSessionType.price}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Client Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="client_name">Full Name *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                        required
                        minLength={2}
                        placeholder="John Smith"
                      />
                    </div>

                    <div>
                      <Label htmlFor="client_email">Email *</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                        required
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Note (optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Tell us something about yourself or what you need help with..."
                        maxLength={500}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.notes.length}/500 characters
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="submit" disabled={loading} className="bg-gradient-gold" size="lg">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" size={16} />
                            Processing...
                          </>
                        ) : selectedSessionType.price === 0 ? (
                          "Confirm Booking"
                        ) : (
                          `Go to Payment (€${selectedSessionType.price})`
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
