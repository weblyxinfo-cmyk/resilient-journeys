import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Tag, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import WorkshopInquiryForm from '@/components/WorkshopInquiryForm';
import WorkshopRegistration from '@/components/WorkshopRegistration';

interface Workshop {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published_at: string | null;
  tags: string[];
  featured_image_url: string | null;
  gallery_images: string[] | null;
  video_urls: string[] | null;
  min_membership: 'free' | 'basic' | 'premium';
  view_count: number;
  is_paid_workshop: boolean;
  workshop_price: number;
  workshop_currency: string;
  payment_iban: string | null;
  payment_message: string | null;
}

const membershipNames = {
  free: 'Free',
  basic: 'Basic Membership',
  premium: 'Premium Membership'
};

const WorkshopPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchWorkshop();
    }
  }, [slug]);

  const fetchWorkshop = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('category', 'workshop')
      .eq('is_published', true)
      .single();

    if (error || !data) {
      toast.error('Workshop not found');
      navigate('/workshopy');
      return;
    }

    setWorkshop(data);

    // Check access
    const userMembership = profile?.membership_type || 'free';
    const requiredMembership = data.min_membership;

    const membershipLevels = { free: 0, basic: 1, premium: 2 };
    const canAccess = membershipLevels[userMembership] >= membershipLevels[requiredMembership];
    setHasAccess(canAccess);

    // Increment view count (for all visitors)
    await supabase
      .from('blog_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);

    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gold">Loading workshop...</div>
      </div>
    );
  }

  if (!workshop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <article className="container px-4 max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            to="/workshopy"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="font-sans text-sm">Back to Workshops</span>
          </Link>

          {/* Header */}
          <header className="mb-8">
            {workshop.featured_image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={workshop.featured_image_url}
                  alt={workshop.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {workshop.tags.map((tag, idx) => (
                <div key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                  <Tag size={12} className="text-primary" />
                  <span className="text-xs font-sans font-medium text-primary">{tag}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                <Calendar size={14} />
                <span>{formatDate(workshop.published_at)}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              {workshop.title}
            </h1>

            {workshop.excerpt && (
              <p className="text-xl text-muted-foreground font-sans">
                {workshop.excerpt}
              </p>
            )}
          </header>

          {/* Gallery Images - Public */}
          {workshop.gallery_images && workshop.gallery_images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-semibold mb-6">Workshop Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {workshop.gallery_images.map((image, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden aspect-square">
                    <img
                      src={image}
                      alt={`${workshop.title} - Image ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Content - Public */}
          {workshop.video_urls && workshop.video_urls.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-semibold mb-6">Workshop Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workshop.video_urls.map((videoUrl, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden aspect-video">
                    <iframe
                      src={videoUrl}
                      title={`${workshop.title} - Video ${idx + 1}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content or Paywall */}
          {hasAccess ? (
            <div className="prose prose-lg max-w-none">
              <div className="font-sans text-foreground leading-relaxed whitespace-pre-wrap">
                {workshop.content}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-12 text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-6">
                <Lock className="text-gold" size={32} />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-4">
                {membershipNames[workshop.min_membership]} Required
              </h2>
              <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
                This workshop is exclusive to {membershipNames[workshop.min_membership]} members.
                Upgrade your membership to unlock this content and access our full library.
              </p>
              <Link
                to={user ? "/profile" : "/auth"}
                className="inline-block px-8 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all"
              >
                {user ? "Upgrade Membership" : "Sign In to Continue"}
              </Link>
            </div>
          )}

          {/* Registration (paid) or Inquiry (free) */}
          <div className="mt-12">
            {workshop.is_paid_workshop && workshop.workshop_price > 0 ? (
              <WorkshopRegistration
                workshopId={workshop.id}
                workshopTitle={workshop.title}
                price={workshop.workshop_price}
                currency={workshop.workshop_currency}
                iban={workshop.payment_iban}
                paymentMessage={workshop.payment_message}
              />
            ) : (
              <WorkshopInquiryForm workshopId={workshop.id} workshopTitle={workshop.title} />
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default WorkshopPost;
