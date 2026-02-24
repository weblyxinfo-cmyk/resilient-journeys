import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Calendar, ArrowRight, Tag, CreditCard, Palette, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import WorkshopInquiryForm from '@/components/WorkshopInquiryForm';
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";

interface Workshop {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  tags: string[];
  featured_image_url: string | null;
  gallery_images: string[] | null;
  video_urls: string[] | null;
  is_paid_workshop: boolean;
  workshop_price: number;
  workshop_currency: string;
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
      .select('id, title, slug, excerpt, category, published_at, tags, featured_image_url, gallery_images, video_urls, is_paid_workshop, workshop_price, workshop_currency')
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
      <SEO
        title="Workshops — Interactive Sessions for Organizations | Resilient Mind"
        description="Interactive art expressive therapy workshops for organizations and groups. Build team resilience through creative sessions."
        path="/workshopy"
      />
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <PageHero>
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
        </PageHero>

        {/* Section 1: Silk Paintings */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Palette size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                  My Creations — Silk Paintings
                </h2>
              </div>

              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-4">
                I discovered silk painting as my personal way to relax my mind — a space where time seemed to stop, and all the usual thoughts quieted down. It became my "power of now," a moment to simply be and let creativity flow.
              </p>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8">
                Stepping into a world of color and texture, participants often pause, smile, and breathe a little deeper. These silk painting sessions offer a space to explore creativity without pressure, where each brushstroke can capture a feeling, a thought, or a moment.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-1.jpg"
                    alt="Silk painting artwork"
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-2.jpg"
                    alt="Silk painting artwork"
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-3.jpg"
                    alt="Silk painting artwork"
                    className="w-full h-72 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Kids & Parents */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Users size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                  Expressive Art Workshops — Kids & Parents
                </h2>
              </div>

              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-4">
                These workshops are a wonderful opportunity for parents and children to spend valuable time together, creating, learning, and discovering more about each other. They are full of laughter, curiosity, and shared exploration. Parents and children paint side by side, experimenting with colors, shapes, and textures, while gently connecting in a space that encourages creativity and presence.
              </p>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8">
                It's amazing to watch everyone relax, let go, and connect through art. By the end of the session, the room is alive with happiness, gentle pride, and colorful creations that tell stories only your hearts can tell.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-4.jpg"
                    alt="Kids and parents workshop"
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-5.jpg"
                    alt="Kids and parents workshop"
                    className="w-full h-80 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Adults */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Heart size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl md:text-4xl font-serif font-semibold">
                  Expressive Art Workshops — Adults
                </h2>
              </div>

              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-4">
                In this space, adults allow themselves to slow down and reconnect with their creativity. Through expressive art, participants release stress, explore emotions, and embrace playfulness. Many leave feeling lighter, refreshed, and inspired — carrying with them not only the artworks they created but also the joy and relaxation of a day fully spent expressing themselves.
              </p>
              <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-8">
                People leave not only with a unique piece of art that tells their story, but also with a sense of calm, clarity, and a little spark of joy.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-6.jpg"
                    alt="Adult expressive art workshop"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-7.jpg"
                    alt="Adult expressive art workshop"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-8.jpg"
                    alt="Adult expressive art workshop"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-elevated">
                  <img
                    src="/workshops/workshop-9.jpg"
                    alt="Adult expressive art workshop"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Workshops from CMS — only show when there are published workshops */}
        {!loading && workshops.length > 0 && (
          <section className="py-16 md:py-24 bg-card">
            <div className="container px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-8 text-center">
                  Upcoming Workshops
                </h2>
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
                            onError={(e) => {
                              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {workshop.gallery_images && workshop.gallery_images.length > 0 && (
                        <div className="mb-6">
                          <div className="grid grid-cols-4 gap-2">
                            {workshop.gallery_images.slice(0, 4).map((image, idx) => (
                              <div key={idx} className="rounded-lg overflow-hidden aspect-square">
                                <img
                                  src={image}
                                  alt={`${workshop.title} preview ${idx + 1}`}
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
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
                        {workshop.is_paid_workshop && workshop.workshop_price > 0 && (
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full">
                            <CreditCard size={12} className="text-green-700" />
                            <span className="text-xs font-sans font-semibold text-green-700">
                              €{workshop.workshop_price}
                            </span>
                          </div>
                        )}
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
              </div>
            </div>
          </section>
        )}

        {/* Inquiry Form */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <WorkshopInquiryForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Workshopy;
