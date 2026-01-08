import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react";
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
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <BookOpen size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Insights & Resources
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                The Resilient Mind <span className="text-gradient-gold">Blog</span>
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
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {blogPosts.map((post, index) => (
                  <article
                    key={index}
                    className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:shadow-elevated transition-all group"
                  >
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                        <Tag size={12} className="text-primary" />
                        <span className="text-xs font-sans font-medium text-primary">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
                        <Calendar size={14} />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-serif font-semibold mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    
                    <p className="text-muted-foreground font-sans mb-4">
                      {post.excerpt}
                    </p>
                    
                    <Link
                      to={post.slug}
                      className="inline-flex items-center gap-2 text-primary font-sans font-medium hover:underline"
                    >
                      Read Article
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                ))}
              </div>
              
              {/* Newsletter CTA */}
              <div className="mt-16 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-3xl p-8 md:p-12 text-center">
                <h3 className="text-2xl font-serif font-semibold mb-4">
                  Never Miss an Article
                </h3>
                <p className="text-muted-foreground font-sans mb-6 max-w-md mx-auto">
                  Subscribe to receive new articles, resources, and exclusive 
                  content directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button className="px-6 py-3 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-xl shadow-gold hover:shadow-elevated transition-all">
                    Subscribe
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
