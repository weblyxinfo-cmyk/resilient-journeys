import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import { toast } from 'sonner';
import { useCms } from "@/hooks/useCms";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  tags: string[];
  featured_image_url: string | null;
}

const Blog = () => {
  const { t } = useCms();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, published_at, tags, featured_image_url')
      .eq('category', 'blog')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubscribing(true);
    const { error } = await supabase
      .from('lead_magnets')
      .insert({ email, source: 'blog_newsletter' });

    if (error) {
      if (error.code === '23505') {
        toast.info('You are already subscribed!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } else {
      toast.success('Thank you for subscribing!');
      setEmail('');
    }
    setSubscribing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Coming Soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t("blog_seo_title", "Blog — Resilience Tips for Expatriates | Resilient Mind")}
        description={t("blog_seo_description", "Read articles on building resilience, managing expat stress, art therapy techniques and thriving while living abroad.")}
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Resilient Mind Blog",
          "description": "Resilience tips and art therapy insights for expatriates.",
          "url": "https://resilientmind.io/blog",
          "publisher": {
            "@type": "Organization",
            "name": "Resilient Mind"
          }
        }}
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <PageHero>
            <div id="cms-blog-hero" className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <BookOpen size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  {t("blog_hero_badge", "Insights & Resources")}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                {t("blog_hero_title_pre", "The Resilient Mind")} <span className="text-gradient-gold">{t("blog_hero_title_highlight", "Blog")}</span>
              </h1>

              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                {t("blog_hero_subtitle", "Practical wisdom, creative techniques, and stories of transformation for expat families building their resilient minds.")}
              </p>
            </div>
        </PageHero>

        {/* Blog Posts — only show when there are published posts */}
        {!loading && posts.length > 0 && (
          <section id="cms-blog-list" className="py-16 md:py-24 bg-background">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-8">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-elevated transition-all group"
                    >
                      {post.featured_image_url && (
                        <div className="mb-6 rounded-xl overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {post.tags.length > 0 && (
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                            <Tag size={12} className="text-primary" />
                            <span className="text-xs font-sans font-medium text-primary">
                              {post.tags[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                          <Calendar size={14} />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                      </div>

                      <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-muted-foreground font-sans mb-4">
                          {post.excerpt}
                        </p>
                      )}

                      <Link
                        to={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-primary font-sans font-medium hover:underline"
                      >
                        {t("blog_read_article_label", "Read Article")}
                        <ArrowRight size={16} />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Coming Soon + Newsletter */}
        <section id="cms-blog-newsletter" className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {!loading && posts.length === 0 && (
                <div className="text-center py-12 mb-8">
                  <p className="text-lg text-muted-foreground font-sans">{t("blog_empty_state_text", "Articles coming soon. Subscribe below to be notified!")}</p>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 text-center">
                <h3 className="text-2xl font-serif font-semibold mb-4">
                  {t("blog_newsletter_title", "Never Miss an Article")}
                </h3>
                <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto">
                  {t("blog_newsletter_subtitle", "Subscribe to receive new articles, resources, and exclusive content directly in your inbox.")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder={t("blog_newsletter_placeholder", "Your email address")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all disabled:opacity-50"
                  >
                    {subscribing ? t("blog_newsletter_button_subscribing", "Subscribing...") : t("blog_newsletter_button_label", "Subscribe")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
