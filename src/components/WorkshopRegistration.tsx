import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, CreditCard, Mail, User, Phone, Sparkles } from 'lucide-react';

interface WorkshopRegistrationProps {
  workshopId: string;
  workshopTitle: string;
  price: number;
  currency: string;
  iban: string | null;
  paymentMessage: string | null;
}

function generateSpayd({
  iban,
  amount,
  currency,
  message,
}: {
  iban: string;
  amount: number;
  currency: string;
  message?: string;
}) {
  // SPAYD (Short Payment Descriptor) format for Czech QR payments
  const cleanIban = iban.replace(/\s/g, '');
  let spayd = `SPD*1.0*ACC:${cleanIban}*AM:${amount.toFixed(2)}*CC:${currency}`;
  if (message) {
    spayd += `*MSG:${message.substring(0, 60)}`;
  }
  return spayd;
}

function formatPrice(price: number, currency: string) {
  if (currency === 'CZK') {
    return `${price.toLocaleString('cs-CZ')} Kč`;
  }
  return `€${price.toLocaleString('de-DE')}`;
}

const WorkshopRegistration = ({
  workshopId,
  workshopTitle,
  price,
  currency,
  iban,
  paymentMessage,
}: WorkshopRegistrationProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
  });

  const spaydString = iban
    ? generateSpayd({
        iban,
        amount: price,
        currency,
        message: paymentMessage || workshopTitle,
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please fill in your name and email.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('workshop_registrations')
        .insert({
          workshop_id: workshopId,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          note: form.note.trim() || null,
        });

      if (error) throw error;

      toast.success('Registration sent successfully!');
      setSubmitted(true);
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-serif font-semibold mb-3">
            You're Registered!
          </h3>
          <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto leading-relaxed">
            Thank you for registering for <strong>{workshopTitle}</strong>. I'll send you a confirmation
            email with all the details shortly.
          </p>

          {spaydString && (
            <div className="bg-card rounded-2xl p-6 shadow-elevated max-w-sm mx-auto">
              <p className="font-sans text-sm font-medium mb-4">
                Scan to pay <strong>{formatPrice(price, currency)}</strong>
              </p>
              <div className="bg-white p-4 rounded-xl inline-block">
                <QRCodeSVG value={spaydString} size={180} />
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-3">
                QR payment code for your bank app
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-start">
        {/* Content side */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              Workshop Registration
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
            Reserve Your <span className="text-gradient-gold">Spot</span>
          </h2>

          <p className="text-muted-foreground font-sans mb-6 leading-relaxed">
            Register for <strong>"{workshopTitle}"</strong> and secure your place.
            After registering, you'll receive a confirmation with all the details.
          </p>

          {/* Price card */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-sm text-muted-foreground">Workshop Price</span>
              <CreditCard size={20} className="text-primary" />
            </div>
            <div className="text-3xl font-serif font-semibold text-gradient-gold">
              {formatPrice(price, currency)}
            </div>
          </div>

          {/* QR Code */}
          {spaydString && (
            <div className="bg-card rounded-2xl p-6 border border-border text-center">
              <p className="font-sans text-sm font-medium mb-4">
                Pay via QR code in your bank app
              </p>
              <div className="bg-white p-4 rounded-xl inline-block shadow-soft">
                <QRCodeSVG value={spaydString} size={160} />
              </div>
              <p className="text-xs text-muted-foreground font-sans mt-3">
                Scan with your banking app to pay
              </p>
            </div>
          )}
        </div>

        {/* Registration form */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="text-xl font-serif font-semibold mb-2">
            Register Now
          </h3>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            Fill in your details and I'll confirm your spot.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your email"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="relative">
              <Phone
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number (optional)"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Any questions or notes? (optional)"
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? 'Registering...' : `Register — ${formatPrice(price, currency)}`}
            </button>

            <p className="text-xs text-muted-foreground font-sans text-center">
              You'll receive a confirmation email after registering.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkshopRegistration;
