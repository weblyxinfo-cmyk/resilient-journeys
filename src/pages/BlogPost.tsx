import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Tag, ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { useCms } from '@/hooks/useCms';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published_at: string | null;
  tags: string[];
  featured_image_url: string | null;
  min_membership: 'free' | 'basic' | 'premium';
  view_count: number;
}

const BlogPost = () => {
  const { t } = useCms();
  const membershipNames = {
    free: t("blogpost_membership_free", "Free"),
    basic: t("blogpost_membership_basic", "Basic Membership"),
    premium: t("blogpost_membership_premium", "Premium Membership"),
  };
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const fetchPost = useCallback(async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('category', 'blog')
      .eq('is_published', true)
      .single();

    if (error || !data) {
      toast.error('Article not found');
      navigate('/blog');
      return;
    }

    setPost(data);

    // Check access
    const userMembership = profile?.membership_type || 'free';
    const requiredMembership = data.min_membership;

    const membershipLevels = { free: 0, basic: 1, premium: 2 };
    const canAccess = membershipLevels[userMembership] >= membershipLevels[requiredMembership];
    setHasAccess(canAccess);

    // Increment view count
    if (canAccess) {
      await supabase
        .from('blog_posts')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);
    }

    setLoading(false);
  }, [slug, profile, navigate]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, fetchPost]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div id="cms-blogpost-loading" className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gold">{t("blogpost_loading_text", "Loading article...")}</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.title} | Resilient Mind Blog`}
        description={post.excerpt || post.content.substring(0, 160)}
        path={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.featured_image_url || undefined}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt || post.content.substring(0, 160),
          "image": post.featured_image_url || undefined,
          "datePublished": post.published_at || undefined,
          "author": {
            "@type": "Person",
            "name": "Silvie Bogdanova"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Resilient Mind"
          }
        }}
      />
      <Navbar />

      <main className="pt-20 pb-16">
        <article id="cms-blogpost-nav" className="container px-4 max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            <span className="font-sans text-sm">{t("blogpost_back_link", "Back to Blog")}</span>
          </Link>

          {/* Header */}
          <header className="mb-8">
            {post.featured_image_url && (
              <div className="mb-8 rounded-2xl overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {post.tags.map((tag, idx) => (
                <div key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                  <Tag size={12} className="text-primary" />
                  <span className="text-xs font-sans font-medium text-primary">{tag}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                <Calendar size={14} />
                <span>{formatDate(post.published_at)}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground font-sans">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Content or Paywall */}
          {hasAccess ? (
            <div className="prose prose-lg max-w-none">
              <div className="font-sans text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>
          ) : (
            <div id="cms-blogpost-paywall" className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/20 rounded-full mb-6">
                <Lock className="text-gold" size={32} />
              </div>
              <h2 className="text-2xl font-serif font-semibold mb-4">
                {membershipNames[post.min_membership]} {t("blogpost_paywall_required_label", "Required")}
              </h2>
              <p className="text-muted-foreground font-sans mb-8 max-w-md mx-auto">
                {t("blogpost_paywall_text_pre", "This article is exclusive to")} {membershipNames[post.min_membership]} {t("blogpost_paywall_text_post", "members. Upgrade your membership to unlock this content and access our full library.")}
              </p>
              <Link
                to={user ? "/profile" : "/auth"}
                className="inline-block px-8 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all"
              >
                {user ? t("blogpost_paywall_button_upgrade", "Upgrade Membership") : t("blogpost_paywall_button_signin", "Sign In to Continue")}
              </Link>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
