import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Mail, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BookingCalendar from './BookingCalendar';
import TimeSlotPicker from './TimeSlotPicker';
import SessionTypeSelector from './SessionTypeSelector';

interface SessionType {
  id: string;
  session_type: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_eur: number;
  requires_payment: boolean;
  available_for_premium_credit: boolean;
}

interface BookingFormProps {
  onSuccess?: () => void;
}

export const BookingForm = ({ onSuccess }: BookingFormProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Form state
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<SessionType | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ]);

  useEffect(() => {
    fetchAvailability();
  }, []);

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name);
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  const fetchAvailability = async () => {
    try {
      // Fetch blocked dates
      const { data: blocked } = await supabase
        .from('coach_blocked_dates')
        .select('blocked_date');

      if (blocked) {
        setBlockedDates(blocked.map(b => b.blocked_date));
      }

      // Fetch available days
      const { data: availability } = await supabase
        .from('coach_availability')
        .select('day_of_week')
        .eq('is_active', true);

      if (availability && availability.length > 0) {
        setAvailableDays(availability.map(a => a.day_of_week));
      }
    } catch (err) {
      console.warn('Could not fetch availability, using defaults');
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedDate || !selectedTime) {
      setError('Please complete all required fields');
      return;
    }

    if (!user) {
      // Redirect to auth with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      navigate(`/auth?redirect=${returnUrl}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the booking
      const bookingData = {
        user_id: user.id,
        session_type: selectedType.session_type as 'discovery' | 'one_on_one' | 'family' | 'premium_consultation',
        session_date: selectedTime,
        duration_minutes: selectedType.duration_minutes,
        price_cents: selectedType.price_eur * 100,
        is_premium_credit: selectedType.available_for_premium_credit,
        status: 'scheduled' as const,
        booking_notes: notes || null,
      };

      const { data, error: insertError } = await supabase
        .from('session_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (insertError) throw insertError;

      // If using premium credit, update the credits
      if (selectedType.available_for_premium_credit && profile?.user_id) {
        const currentYear = new Date().getFullYear();
        await supabase
          .from('premium_credits')
          .update({ used_credits: supabase.sql`used_credits + 1` })
          .eq('user_id', profile.user_id)
          .eq('year', currentYear);
      }

      setSuccess(true);
      toast({
        title: 'Booking Confirmed!',
        description: `Your ${selectedType.title} has been scheduled.`,
      });

      onSuccess?.();
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedType !== null;
      case 2:
        return selectedDate !== null && selectedTime !== null;
      case 3:
        return name.trim() !== '' && email.trim() !== '';
      default:
        return false;
    }
  };

  if (success) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-semibold mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-6">
          Your {selectedType?.title} has been scheduled for:
        </p>
        <div className="bg-gold/10 rounded-xl p-4 mb-6">
          <p className="font-semibold text-lg">
            {selectedTime && formatDateTime(selectedTime)}
          </p>
          <p className="text-muted-foreground">
            Duration: {selectedType?.duration_minutes} minutes
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          A confirmation email will be sent to {email}.
          You can also view your bookings in your dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button
            className="bg-gradient-gold"
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setSelectedType(null);
              setSelectedDate(null);
              setSelectedTime(null);
              setNotes('');
            }}
          >
            Book Another Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === s
                  ? 'bg-gradient-gold text-white'
                  : step > s
                  ? 'bg-gold/20 text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  step > s ? 'bg-gold' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Session Type */}
      {step === 1 && (
        <SessionTypeSelector
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedType && (
        <div className="grid md:grid-cols-2 gap-6">
          <BookingCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
            blockedDates={blockedDates}
            availableDays={availableDays}
          />
          <TimeSlotPicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
            sessionDuration={selectedType.duration_minutes}
          />
        </div>
      )}

      {/* Step 3: Contact Details & Confirm */}
      {step === 3 && selectedType && selectedTime && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Summary */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-serif font-semibold text-lg mb-4">Booking Summary</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium">{selectedType.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedType.duration_minutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold mt-0.5" />
                <div>
                  <p className="font-medium">
                    {formatDateTime(selectedTime)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-2xl font-serif font-bold text-gold">
                    {selectedType.price_eur === 0
                      ? 'Free'
                      : `€${selectedType.price_eur}`}
                  </span>
                </div>
                {selectedType.available_for_premium_credit && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Using 1 Premium consultation credit
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-serif font-semibold text-lg mb-4">Your Details</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything you'd like me to know before our session?"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          Back
        </Button>

        {step < 3 ? (
          <Button
            className="bg-gradient-gold"
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Continue
          </Button>
        ) : (
          <Button
            className="bg-gradient-gold"
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : selectedType?.requires_payment ? (
              `Pay €${selectedType.price_eur} & Book`
            ) : (
              'Confirm Booking'
            )}
          </Button>
        )}
      </div>

      {/* Login prompt for non-authenticated users */}
      {!user && step === 3 && (
        <p className="text-center text-sm text-muted-foreground">
          You'll need to{' '}
          <button
            onClick={() => navigate('/auth')}
            className="text-gold hover:underline"
          >
            sign in or create an account
          </button>{' '}
          to complete your booking.
        </p>
      )}
    </div>
  );
};

export default BookingForm;
