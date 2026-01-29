import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data);
      }
      setCheckingAdmin(false);
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !checkingAdmin) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, isAdmin, checkingAdmin, navigate]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Verifying access...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
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
              <h1 className="font-serif text-3xl md:text-4xl text-foreground">
                Administration
              </h1>
              <p className="text-muted-foreground">Content and user management</p>
            </div>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="bg-cream/50 mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="videos" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="blog" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Blog & Workshopy
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Inquiries
              </TabsTrigger>
              <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Rezervace
              </TabsTrigger>
              <TabsTrigger value="availability" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Clock className="h-4 w-4 mr-2" />
                Dostupnost
              </TabsTrigger>
              <TabsTrigger value="cms" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Type className="h-4 w-4 mr-2" />
                Website Content
              </TabsTrigger>
              <TabsTrigger value="resources" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Download className="h-4 w-4 mr-2" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscriptions
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Star className="h-4 w-4 mr-2" />
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="videos">
              <AdminVideos />
            </TabsContent>

            <TabsContent value="categories">
              <AdminCategories />
            </TabsContent>

            <TabsContent value="blog">
              <AdminBlog />
            </TabsContent>

            <TabsContent value="inquiries">
              <AdminInquiries />
            </TabsContent>

            <TabsContent value="bookings">
              <AdminBookings />
            </TabsContent>

            <TabsContent value="availability">
              <AdminAvailability />
            </TabsContent>

            <TabsContent value="cms">
              <AdminCMS />
            </TabsContent>

            <TabsContent value="resources">
              <AdminResources />
            </TabsContent>

            <TabsContent value="subscriptions">
              <AdminSubscriptions />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsers />
            </TabsContent>

            <TabsContent value="testimonials">
              <AdminTestimonials />
            </TabsContent>

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
