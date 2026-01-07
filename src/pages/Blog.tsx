import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Calendar, ArrowRight, Tag, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    title: "5 Signs Your Child Is Struggling with Expat Life",
    excerpt: "Moving abroad affects children differently than adults. Here are the subtle signs to watch for and how to help.",
    category: "Family",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "The Art of Rebuilding: Why Creative Expression Heals",
    excerpt: "Discover how art therapy and creative practices can accelerate your adaptation to a new country.",
    category: "Art Therapy",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "Language Barriers and Mental Health: The Hidden Connection",
    excerpt: "How struggling with a new language affects your mental wellbeing—and what you can do about it.",
    category: "Wellbeing",
    date: "Coming Soon",
    slug: "#",
  },
  {
    title: "Building Your Expat Support Network from Scratch",
    excerpt: "Practical strategies for creating meaningful connections when you know no one in your new city.",
    category: "Community",
    date: "Coming Soon",
    slug: "#",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground border-2 border-foreground mb-6"
                style={{
                  boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <BookOpen size={16} />
                <span className="text-sm font-sans font-bold uppercase tracking-wide">
                  Insights & Resources
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-display mb-6">
                The Resilient Mind Blog
              </h1>

              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Practical wisdom, creative techniques, and stories of transformation
                for expat families building their resilient minds.
              </p>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6">
                {blogPosts.map((post, index) => (
                  <article
                    key={index}
                    className="brutal-card p-6 md:p-8 group"
                  >
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brutal-yellow border-2 border-foreground"
                        style={{
                          boxShadow: "2px 2px 0 0 hsl(var(--brutal-black))",
                        }}
                      >
                        <Tag size={12} />
                        <span className="text-xs font-sans font-bold uppercase">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-display mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground font-sans mb-4">
                      {post.excerpt}
                    </p>

                    <Link
                      to={post.slug}
                      className="inline-flex items-center gap-2 text-accent font-sans font-bold uppercase text-sm hover:gap-3 transition-all"
                    >
                      Read Article
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                ))}
              </div>

              {/* Newsletter CTA */}
              <div
                className="mt-16 p-8 md:p-12 bg-accent text-accent-foreground border-2 border-foreground"
                style={{
                  boxShadow: "6px 6px 0 0 hsl(var(--brutal-black))",
                }}
              >
                <div className="max-w-xl mx-auto text-center">
                  <Mail size={48} className="mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-display mb-4">
                    Get New Posts in Your Inbox
                  </h2>
                  <p className="text-accent-foreground/80 font-sans mb-8">
                    Join the community and receive weekly insights on building
                    resilience as an expat family.
                  </p>

                  <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 px-4 py-3 border-2 border-foreground bg-background text-foreground font-sans focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="btn-secondary"
                    >
                      Subscribe
                    </button>
                  </form>
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
