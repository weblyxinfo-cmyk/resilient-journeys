import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, MapPin, Loader2, XCircle } from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  session_type: string;
  session_date: string;
  duration_minutes: number;
  price_cents: number;
  status: string;
  booking_notes: string | null;
  is_premium_credit: boolean;
}

const SESSION_LABELS: Record<string, string> = {
  discovery: 'Discovery Call',
  one_on_one: '1:1 Session',
  family: 'Family Session',
  premium_consultation: 'Premium Consultation',
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  no_show: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const UserBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('session_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );

      toast({
        title: 'Booking Cancelled',
        description: 'Your session has been cancelled.',
      });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    b => b.status === 'scheduled' && isFuture(parseISO(b.session_date))
  );
  const pastBookings = bookings.filter(
    b => b.status !== 'scheduled' || isPast(parseISO(b.session_date))
  );

  if (bookings.length === 0) {
    return (
      <Card className="border-gold/20">
        <CardContent className="py-12 text-center">
          <div className="p-4 bg-gold/10 rounded-full w-fit mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gold" />
          </div>
          <h3 className="font-serif text-xl mb-2">No Bookings Yet</h3>
          <p className="text-muted-foreground mb-6">
            Book your first session to start your resilience journey.
          </p>
          <Link to="/booking">
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Book a Session
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book New Session CTA */}
      <div className="flex justify-end">
        <Link to="/booking">
          <Button className="bg-gold hover:bg-gold-dark text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Book New Session
          </Button>
        </Link>
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div>
          <h3 className="font-serif font-semibold text-lg mb-4">Upcoming Sessions</h3>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} className="border-gold/30 bg-gold/5">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gold/20 rounded-xl">
                        <Video className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {SESSION_LABELS[booking.session_type] || booking.session_type}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(booking.session_date), 'EEEE, MMMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(parseISO(booking.session_date), 'HH:mm')}
                          </span>
                        </div>
                        {booking.booking_notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Notes: {booking.booking_notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={STATUS_COLORS[booking.status]}>
                        {booking.status}
                      </Badge>
                      {booking.status === 'scheduled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <h3 className="font-serif font-semibold text-lg mb-4 text-muted-foreground">
            Past Sessions
          </h3>
          <div className="space-y-3">
            {pastBookings.slice(0, 5).map((booking) => (
              <Card key={booking.id} className="border-border">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Video className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">
                          {SESSION_LABELS[booking.session_type] || booking.session_type}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(booking.session_date), 'MMM d, yyyy • HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={STATUS_COLORS[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
