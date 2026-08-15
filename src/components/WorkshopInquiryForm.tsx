import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, Mail, User, Building2, Users } from 'lucide-react';
import { useCms } from '@/hooks/useCms';

interface WorkshopInquiryFormProps {
  workshopId?: string;
  workshopTitle?: string;
}

const WorkshopInquiryForm = ({ workshopId, workshopTitle }: WorkshopInquiryFormProps) => {
  const { t } = useCms();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    group_size: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('workshop_inquiries')
        .insert({
          workshop_id: workshopId || null,
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || null,
          group_size: form.group_size || null,
          message: form.message.trim(),
        });

      if (error) throw error;

      toast.success('Your inquiry has been sent successfully!');
      setSubmitted(true);

      // Best-effort notification — the inquiry is already saved above, so a
      // failure here must never block the success state shown to the user.
      supabase.functions
        .invoke('notify-inquiry', {
          body: {
            type: 'inquiry',
            name: form.name.trim(),
            email: form.email.trim(),
            workshopTitle: workshopTitle || null,
            company: form.company.trim() || null,
            groupSize: form.group_size || null,
            message: form.message.trim(),
          },
        })
        .catch((notifyError) => {
          console.error('Failed to send inquiry notification:', notifyError);
        });

      setForm({ name: '', email: '', company: '', group_size: '', message: '' });
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
      console.error('Inquiry submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div id="cms-workshopform-success" className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-serif font-semibold mb-3">
            {t("workshopform_success_title", "Thank You for Reaching Out!")}
          </h3>
          <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto leading-relaxed">
            {t("workshopform_success_text", "Your message is on its way. I'll personally review your inquiry and get back to you soon with all the details you need.")}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-card border border-border rounded-full font-sans font-medium text-sm hover:shadow-elevated transition-all duration-300"
          >
            {t("workshopform_success_button", "Send another inquiry")}
          </button>
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
        <div id="cms-workshopform-intro">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              {workshopTitle ? t("workshopform_badge_specific", "Workshop Inquiry") : t("workshopform_badge_general", "Our Workshops")}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
            {workshopTitle
              ? <>{t("workshopform_title_specific_pre", "Interested in")} <span className="text-gradient-gold">{t("workshopform_title_specific_highlight", "This Workshop")}</span>{t("workshopform_title_specific_suffix", "?")}</>
              : <>{t("workshopform_title_general_pre", "Workshops for")} <span className="text-gradient-gold">{t("workshopform_title_general_highlight", "Creativity, Connection & Emotional Wellbeing")}</span></>
            }
          </h2>

          <p className="text-muted-foreground font-sans mb-6 leading-relaxed">
            {workshopTitle
              ? <>{t("workshopform_desc_specific_pre", "I'd love to hear from you about")} "{workshopTitle}." {t("workshopform_desc_specific_post", "Whether you're looking for a private session, a group experience, or a corporate event — let's find the perfect fit.")}</>
              : t("workshopform_desc_general", "I offer gentle, creative workshops designed for adults, children, teens, and families. Each experience combines creativity, emotional expression, mindfulness, and meaningful human connection in a safe and supportive space.")
            }
          </p>

          {workshopTitle ? (
            <ul className="space-y-3">
              {[
                t("workshopform_specific_feature_1", "Tailored to your group's specific needs"),
                t("workshopform_specific_feature_2", "Available in-person or online"),
                t("workshopform_specific_feature_3", "For teams, communities, and organizations"),
                t("workshopform_specific_feature_4", "Combining art expressive therapy & creative practices"),
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-3 font-sans text-sm">
                  <CheckCircle size={18} className="text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-5">
              {[
                {
                  title: t("workshopform_group_adults_title", "For Adults"),
                  description: t(
                    "workshopform_group_adults_description",
                    "Mindful silk painting workshops with optional EFT (Emotional Freedom Techniques) sessions to support relaxation, emotional wellbeing, creativity, and self-expression."
                  ),
                },
                {
                  title: t("workshopform_group_kids_title", "For Children & Teens"),
                  description: t(
                    "workshopform_group_kids_description",
                    "Creative workshops that encourage emotional expression, confidence, imagination, and calm through art, mindfulness, silk painting, and gentle emotional support practices."
                  ),
                },
                {
                  title: t("workshopform_group_parents_title", "For Parents & Children"),
                  description: t(
                    "workshopform_group_parents_description",
                    "Connection-based workshops designed to create quality time, emotional bonding, communication, and shared creative experiences through expressive art activities."
                  ),
                },
              ].map((group, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Sparkles size={18} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif font-semibold text-base md:text-lg mb-1">
                      {group.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form side */}
        <div id="cms-workshopform-form" className="bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="text-xl font-serif font-semibold mb-2">
            {t("workshopform_form_title", "Send Your Inquiry")}
          </h3>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            {t("workshopform_form_subtitle", "Tell me about your vision and I'll get back to you personally.")}
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
                placeholder={t("workshopform_form_name_placeholder", "Your name")}
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
                placeholder={t("workshopform_form_email_placeholder", "Your email")}
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder={t("workshopform_form_company_placeholder", "Company (optional)")}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <select
                  value={form.group_size}
                  onChange={(e) => setForm({ ...form, group_size: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="">{t("workshopform_form_groupsize_placeholder", "Group size")}</option>
                  <option value="1-5">{t("workshopform_form_groupsize_1_5", "1–5 people")}</option>
                  <option value="5-10">{t("workshopform_form_groupsize_5_10", "5–10 people")}</option>
                  <option value="10-20">{t("workshopform_form_groupsize_10_20", "10–20 people")}</option>
                  <option value="20+">{t("workshopform_form_groupsize_20plus", "20+ people")}</option>
                </select>
              </div>
            </div>

            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={t("workshopform_form_message_placeholder", "Tell me about what you're looking for — preferred dates, group details, goals...")}
              required
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? t("workshopform_form_submit_loading", "Sending...") : t("workshopform_form_submit_label", "Send Inquiry")}
            </button>

            <p className="text-xs text-muted-foreground font-sans text-center">
              {t("workshopform_form_footer_note", "I'll respond within 24–48 hours. No spam, ever.")}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkshopInquiryForm;
