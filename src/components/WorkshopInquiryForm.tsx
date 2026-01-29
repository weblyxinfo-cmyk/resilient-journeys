import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, CheckCircle, Mail, User, Building2, Users } from 'lucide-react';

interface WorkshopInquiryFormProps {
  workshopId?: string;
  workshopTitle?: string;
}

const WorkshopInquiryForm = ({ workshopId, workshopTitle }: WorkshopInquiryFormProps) => {
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
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-serif font-semibold mb-3">
            Thank You for Reaching Out!
          </h3>
          <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto leading-relaxed">
            Your message is on its way. I'll personally review your inquiry and get back to you soon
            with all the details you need.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 bg-card border border-border rounded-full font-sans font-medium text-sm hover:shadow-elevated transition-all duration-300"
          >
            Send another inquiry
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
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              {workshopTitle ? 'Workshop Inquiry' : 'Custom Workshops'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
            {workshopTitle
              ? <>Interested in <span className="text-gradient-gold">This Workshop</span>?</>
              : <>Let's Create Something <span className="text-gradient-gold">Transformative</span></>
            }
          </h2>

          <p className="text-muted-foreground font-sans mb-6 leading-relaxed">
            {workshopTitle
              ? `I'd love to hear from you about "${workshopTitle}." Whether you're looking for a private session, a group experience, or a corporate event — let's find the perfect fit.`
              : "I offer personalized workshops for expat communities, international schools, and organizations. Each workshop is tailored to your group's unique needs and goals."
            }
          </p>

          <ul className="space-y-3">
            {[
              "Tailored to your group's specific needs",
              "Available in-person or online",
              "For teams, communities, and organizations",
              "Combining art therapy, psychology & creative practices",
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3 font-sans text-sm">
                <CheckCircle size={18} className="text-primary flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form side */}
        <div className="bg-card rounded-2xl p-6 shadow-elevated">
          <h3 className="text-xl font-serif font-semibold mb-2">
            Send Your Inquiry
          </h3>
          <p className="text-muted-foreground font-sans text-sm mb-6">
            Tell me about your vision and I'll get back to you personally.
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
                placeholder="Your name"
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
                  placeholder="Company (optional)"
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
                  <option value="">Group size</option>
                  <option value="1-5">1–5 people</option>
                  <option value="5-10">5–10 people</option>
                  <option value="10-20">10–20 people</option>
                  <option value="20+">20+ people</option>
                </select>
              </div>
            </div>

            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell me about what you're looking for — preferred dates, group details, goals..."
              required
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Inquiry'}
            </button>

            <p className="text-xs text-muted-foreground font-sans text-center">
              I'll respond within 24–48 hours. No spam, ever.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkshopInquiryForm;
