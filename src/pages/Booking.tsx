import { useState, useEffect } from "react";
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
import { enUS } from "date-fns/locale";

// Session types configuration
const SESSION_TYPES = [
  {
    type: "discovery",
    title: "Discovery Call",
    duration: 30,
    price: 0,
    description: "A free introductory call to discuss your needs and see if we're a good fit.",
    features: [
      "Understand your challenges",
      "Explore working together",
      "No commitment required",
    ],
  },
  {
    type: "one_on_one",
    title: "Individual Consultation",
    duration: 60,
    price: 87,
    description: "Deep personal work tailored to your unique situation and goals.",
    features: [
      "Personalized approach",
      "Action plan & resources",
      "Email support included",
      "Post-session recording",
    ],
  },
  {
    type: "family",
    title: "Family Session",
    duration: 90,
    price: 120,
    description: "Work together as a family to build collective resilience.",
    features: [
      "Parent & child focused",
      "Creative activities",
      "Family action plan",
      "Take-home exercises",
    ],
  },
] as const;

type SessionType = typeof SESSION_TYPES[number]["type"];

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

  // Fetch available days when type is selected
  useEffect(() => {
    if (selectedType && step === 2) {
      fetchAvailableDays();
    }
  }, [selectedType, currentMonth, step]);

  // Fetch available slots when date is selected
  useEffect(() => {
    if (selectedDate && selectedType && step === 3) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedType, step]);

  const fetchAvailableDays = async () => {
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
  };

  const fetchAvailableSlots = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Combine date and time to ISO string
      const startTime = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();

      const { data, error } = await supabase.functions.invoke("booking-create", {
        body: {
          session_type: selectedType,
          client_name: formData.client_name,
          client_email: formData.client_email,
          start_time: startTime,
          notes: formData.notes,
        },
      });

      if (error) throw error;

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
      toast.error(error.message || "Booking failed");
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
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-warm">
          <div className="container px-4">
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
          </div>
        </section>

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

                  <div className="grid md:grid-cols-3 gap-6">
                    {SESSION_TYPES.map((session) => (
                      <Card
                        key={session.type}
                        className={`cursor-pointer transition-all hover:shadow-elevated ${
                          selectedType === session.type ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => {
                          setSelectedType(session.type);
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock size={14} />
                            <span>{session.duration} min</span>
                          </div>
                          <CardTitle className="text-xl font-serif">
                            {session.title}
                          </CardTitle>
                          <div className="text-2xl font-serif font-bold text-primary mt-2">
                            {session.price === 0 ? "Free" : `€${session.price}`}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="mb-4">
                            {session.description}
                          </CardDescription>
                          <ul className="space-y-2">
                            {session.features.map((feature, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Check size={16} className="text-primary flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
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
                      {selectedSessionType.title} - {selectedSessionType.duration} min
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
                        <span className="font-semibold">{selectedSessionType.duration} min</span>
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
