import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Video, Users, Star, Settings, FileText, CreditCard, Download, BookOpen, Type, Calendar, Clock, MessageSquare } from 'lucide-react';
import AdminVideos from '@/components/admin/AdminVideos';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminTestimonials from '@/components/admin/AdminTestimonials';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminSubscriptions from '@/components/admin/AdminSubscriptions';
import AdminResources from '@/components/admin/AdminResources';
import AdminBlog from '@/components/admin/AdminBlog';
import AdminCMS from '@/components/admin/AdminCMS';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminAvailability from '@/components/admin/AdminAvailability';
import AdminInquiries from '@/components/admin/AdminInquiries';
import AdminWeekOverview from '@/components/admin/AdminWeekOverview';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/auth');
      else if (!isAdmin) navigate('/dashboard');
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-24" style={{ minHeight: 'calc(100vh - 6rem)' }}>
          <div className="animate-pulse text-gold">Verifying access...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gold/10 rounded-full">
              <Shield className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">Administration</h1>
              <p className="text-muted-foreground">Content and user management</p>
            </div>
          </div>

          {/* Main Tabs — simplified to 6 core sections */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="bg-cream/50 mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="content" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger value="website" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Type className="h-4 w-4 mr-2" />
                Website
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* CONTENT — Videos, Categories, Blog, Resources, Week Overview */}
            <TabsContent value="content">
              <Tabs defaultValue="videos" className="w-full">
                <TabsList className="bg-muted/50 mb-4 h-auto gap-1">
                  <TabsTrigger value="videos" className="text-xs data-[state=active]:bg-white">
                    <Video className="h-3.5 w-3.5 mr-1.5" /> Videos
                  </TabsTrigger>
                  <TabsTrigger value="categories" className="text-xs data-[state=active]:bg-white">
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Categories
                  </TabsTrigger>
                  <TabsTrigger value="blog" className="text-xs data-[state=active]:bg-white">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Blog & Workshops
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="text-xs data-[state=active]:bg-white">
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Resources
                  </TabsTrigger>
                  <TabsTrigger value="week-overview" className="text-xs data-[state=active]:bg-white">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> Week Overview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="videos"><AdminVideos /></TabsContent>
                <TabsContent value="categories"><AdminCategories /></TabsContent>
                <TabsContent value="blog"><AdminBlog /></TabsContent>
                <TabsContent value="resources"><AdminResources /></TabsContent>
                <TabsContent value="week-overview"><AdminWeekOverview /></TabsContent>
              </Tabs>
            </TabsContent>

            {/* BOOKINGS — Bookings + Availability */}
            <TabsContent value="bookings">
              <Tabs defaultValue="reservations" className="w-full">
                <TabsList className="bg-muted/50 mb-4 h-auto gap-1">
                  <TabsTrigger value="reservations" className="text-xs data-[state=active]:bg-white">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> Reservations
                  </TabsTrigger>
                  <TabsTrigger value="availability" className="text-xs data-[state=active]:bg-white">
                    <Clock className="h-3.5 w-3.5 mr-1.5" /> Availability
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="reservations"><AdminBookings /></TabsContent>
                <TabsContent value="availability"><AdminAvailability /></TabsContent>
              </Tabs>
            </TabsContent>

            {/* MEMBERS — Users + Subscriptions */}
            <TabsContent value="members">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="bg-muted/50 mb-4 h-auto gap-1">
                  <TabsTrigger value="users" className="text-xs data-[state=active]:bg-white">
                    <Users className="h-3.5 w-3.5 mr-1.5" /> Users
                  </TabsTrigger>
                  <TabsTrigger value="subscriptions" className="text-xs data-[state=active]:bg-white">
                    <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Subscriptions
                  </TabsTrigger>
                  <TabsTrigger value="testimonials" className="text-xs data-[state=active]:bg-white">
                    <Star className="h-3.5 w-3.5 mr-1.5" /> Testimonials
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="users"><AdminUsers /></TabsContent>
                <TabsContent value="subscriptions"><AdminSubscriptions /></TabsContent>
                <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
              </Tabs>
            </TabsContent>

            {/* WEBSITE — CMS */}
            <TabsContent value="website">
              <AdminCMS />
            </TabsContent>

            {/* MESSAGES — Inquiries */}
            <TabsContent value="inquiries">
              <AdminInquiries />
            </TabsContent>

            {/* SETTINGS */}
            <TabsContent value="settings">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
