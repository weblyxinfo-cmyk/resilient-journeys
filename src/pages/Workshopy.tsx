import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Calendar, ArrowRight, Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface Workshop {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  tags: string[];
  featured_image_url: string | null;
}

const Workshopy = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, category, published_at, tags, featured_image_url')
      .eq('category', 'workshop')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (!error && data) {
      setWorkshops(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Coming Soon';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Interactive Learning
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                Transformative <span className="text-gradient-gold">Workshops</span>
              </h1>

              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Hands-on workshops combining art expressive therapy, psychology, and creative practices
                to help you build resilience and thrive in your expat journey.
              </p>
            </div>
          </div>
        </section>

        {/* Workshops */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse text-gold">Loading workshops...</div>
                </div>
              ) : workshops.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No workshops published yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid gap-8">
                  {workshops.map((workshop) => (
                    <article
                      key={workshop.id}
                      className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-elevated transition-all group"
                    >
                      {workshop.featured_image_url && (
                        <div className="mb-6 rounded-xl overflow-hidden">
                          <img
                            src={workshop.featured_image_url}
                            alt={workshop.title}
                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {workshop.tags.length > 0 && (
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                            <Tag size={12} className="text-primary" />
                            <span className="text-xs font-sans font-medium text-primary">
                              {workshop.tags[0]}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                          <Calendar size={14} />
                          <span>{formatDate(workshop.published_at)}</span>
                        </div>
                      </div>

                      <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 group-hover:text-primary transition-colors">
                        {workshop.title}
                      </h2>

                      {workshop.excerpt && (
                        <p className="text-muted-foreground font-sans mb-4">
                          {workshop.excerpt}
                        </p>
                      )}

                      <Link
                        to={`/workshopy/${workshop.slug}`}
                        className="inline-flex items-center gap-2 text-primary font-sans font-medium hover:underline"
                      >
                        View Workshop
                        <ArrowRight size={16} />
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-16 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 text-center">
                <h3 className="text-2xl font-serif font-semibold mb-4">
                  Interested in a Workshop?
                </h3>
                <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto">
                  We offer personalized workshops for expat communities, schools, and organizations. Please contact me by email for details.
                </p>
                <a
                  href="mailto:silvie@resilientmind.io"
                  className="inline-block px-8 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all"
                >
                  Contact: silvie@resilientmind.io
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Workshopy;
