import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CreditCard, Loader2, Mail, User, Phone, Sparkles } from 'lucide-react';
import { useCms } from '@/hooks/useCms';

interface WorkshopRegistrationProps {
  workshopId: string;
  workshopTitle: string;
  price: number;
}

function formatPrice(price: number) {
  return `€${price}`;
}

const WorkshopRegistration = ({
  workshopId,
  workshopTitle,
  price,
}: WorkshopRegistrationProps) => {
  const { t } = useCms();
  const [searchParams] = useSearchParams();
  const paymentCancelled = searchParams.get('payment') === 'cancelled';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please fill in your name and email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('payment');

      const { data, error: fnError } = await supabase.functions.invoke('workshop-registration-create', {
        body: {
          workshopId,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          note: form.note.trim() || null,
          expectedPriceEur: price,
          successUrl: `${window.location.origin}/workshopy/success`,
          cancelUrl: `${currentUrl.toString()}${currentUrl.search ? '&' : '?'}payment=cancelled`,
        },
      });

      if (fnError) {
        const errorMsg = typeof fnError === 'object' && fnError.message
          ? fnError.message
          : t("workshopform_reg_payment_error", "Payment is temporarily unavailable. Please try again in a moment.");
        throw new Error(errorMsg);
      }

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return; // Don't reset — page is navigating to Stripe
      }

      throw new Error(t("workshopform_reg_payment_error", "Payment is temporarily unavailable. Please try again in a moment."));
    } catch (err: any) {
      const message = err?.message || t("workshopform_reg_payment_error", "Payment is temporarily unavailable. Please try again in a moment.");
      toast.error(message);
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-start">
        {/* Content side */}
        <div id="cms-workshopform-reg-intro">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              {t("workshopform_reg_badge", "Workshop Registration")}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
            {t("workshopform_reg_title_pre", "Reserve Your")} <span className="text-gradient-gold">{t("workshopform_reg_title_highlight", "Spot")}</span>
          </h2>

          <p className="text-muted-foreground font-sans mb-6 leading-relaxed">
            {t("workshopform_reg_desc_pre", "Register for")} <strong>"{workshopTitle}"</strong> {t("workshopform_reg_desc_post", "and secure your place. After registering, you'll receive a confirmation with all the details.")}
          </p>

          {/* Price card */}
          <div className="bg-card rounded-2xl p-6 border border-border mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-sm text-muted-foreground">{t("workshopform_reg_price_label", "Workshop Price")}</span>
              <CreditCard size={20} className="text-primary" />
            </div>
            <div className="text-3xl font-serif font-semibold text-gradient-gold">
              {formatPrice(price)}
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-sans">
            {t("workshopform_reg_security_note", "Payment is secured by Stripe. You'll be redirected to complete your purchase by card.")}
          </p>
        </div>

        {/* Registration form */}
        <div id="cms-workshopform-reg-form" className="bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="text-xl font-serif font-semibold mb-2">
            {t("workshopform_reg_form_title", "Register Now")}
          </h3>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            {t("workshopform_reg_form_subtitle", "Fill in your details and I'll confirm your spot.")}
          </p>

          {paymentCancelled && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{t("workshopform_reg_payment_cancelled_notice", "Payment was cancelled. You can try again below.")}</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
                placeholder={t("workshopform_reg_form_name_placeholder", "Your full name")}
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
                placeholder={t("workshopform_reg_form_email_placeholder", "Your email")}
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
                placeholder={t("workshopform_reg_form_phone_placeholder", "Phone number (optional)")}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder={t("workshopform_reg_form_note_placeholder", "Any questions or notes? (optional)")}
              rows={3}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting
                ? t("workshopform_reg_form_submit_loading", "Registering...")
                : `${t("workshopform_reg_form_submit_prefix", "Register —")} ${formatPrice(price)}`}
            </button>

            <p className="text-xs text-muted-foreground font-sans text-center">
              {t("workshopform_reg_form_footer_note", "You'll receive a confirmation email after registering.")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkshopRegistration;
