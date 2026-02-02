import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, Heart, MapPin, Palette, Award, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageHero from "@/components/PageHero";

const About = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data } = await supabase
        .from('cms_content')
        .select('value')
        .eq('key', 'about_intro_video')
        .maybeSingle();
      if (data?.value) setVideoUrl(data.value);
    };
    fetchVideo();
  }, []);

  const getEmbedUrl = (url: string) => {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <PageHero>
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img
                    src="/silvie.jpg"
                    alt="Silvie Bogdanova - Art Expressive Therapist"
                    className="w-full h-auto aspect-[4/5] object-cover object-top"
                  />
                </div>
                
                {/* Floating elements */}
                <div className="absolute -bottom-6 -right-6 md:right-6 bg-card rounded-2xl p-4 shadow-elevated">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-sans font-semibold">Based in Spain</div>
                      <div className="text-xs text-muted-foreground">Previously Australia</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <Heart size={16} className="text-primary" />
                  <span className="text-sm font-sans font-medium text-primary">
                    About Me
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                  Hi, I'm <span className="text-gradient-gold">Silvie</span>
                </h1>

                <p className="text-lg text-muted-foreground font-sans leading-relaxed mb-6">
                  I help expatriates and globally mobile individuals build mental resilience, blending proven personal development techniques with insights from my own 13 years of living and thriving abroad.
                </p>

                {/* Video Section - configurable via Admin CMS (key: about_intro_video) */}
                {videoUrl ? (
                  <div className="rounded-xl overflow-hidden mb-6 aspect-video">
                    <iframe
                      src={getEmbedUrl(videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Introduction Video"
                    />
                  </div>
                ) : (
                  <div className="bg-muted rounded-xl p-8 mb-6 text-center">
                    <div className="text-sm text-muted-foreground font-sans mb-2">Short Introduction Video</div>
                    <p className="text-xs text-muted-foreground italic">Coming soon</p>
                  </div>
                )}
              </div>
            </div>
        </PageHero>

        {/* Story Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-8 text-center">
                My Journey
              </h2>

              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                  My journey began in the Czech Republic, where I completed my Master's degree in Economics and Management. Life presented me with unexpected challenges: a diagnosis of endometriosis, multiple surgeries, and navigating new cultures and healthcare systems far from home. These experiences became profound teachers that shaped my understanding of inner strength and resilience.
                </p>

                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                  Over the years, I've devoted myself to holistic approaches, obtaining a Certificate in Holistic Counselling, an Art Therapy Diploma (HH Dip A.Th), and Reiki Master certification. I integrate these tools to help people cultivate mental, emotional, and energetic balance, often using creative expression—like silk painting—as a powerful way to process emotions beyond words.
                </p>

                <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                  Through Resilient Mind, I guide individuals—especially women living abroad—toward inner strength and clarity, including specialized support for those managing chronic conditions like endometriosis.
                </p>

                <p className="text-lg text-foreground/90 font-sans font-medium leading-relaxed">
                  My mission is simple: to help you transform challenges into growth, creating a life that transcends borders, limitations, and self-doubt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="py-16 md:py-24 bg-card">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-12 text-center">
                Qualifications & Expertise
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Award,
                    title: "Holistic Counselling",
                    description: "Certificate in Holistic Counselling with focus on mental, emotional, and energetic balance.",
                  },
                  {
                    icon: Palette,
                    title: "Art Therapy Diploma",
                    description: "HH Dip A.Th - Specialized in creative expression like silk painting for processing emotions beyond words.",
                  },
                  {
                    icon: Heart,
                    title: "Reiki Master",
                    description: "Certified Reiki Master integrating energy work with personal development techniques.",
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <item.icon size={28} className="text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground font-sans">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <BookOpen size={48} className="text-primary mx-auto mb-6" />
              <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-muted-foreground font-sans mb-8">
                Whether you are new to expat life or have been abroad for years, 
                it is never too late to build your resilient mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/resilient-hubs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all"
                >
                  Explore Resilient Hubs
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/booking"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card border border-border font-sans font-medium rounded-full hover:bg-secondary transition-all"
                >
                  Book Individual Session
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
