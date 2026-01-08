import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Crown, User, Mail, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const membershipLabels = {
  free: 'Zdarma',
  basic: 'Základní',
  premium: 'Premium'
};

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uložit změny',
        variant: 'destructive'
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Uloženo',
        description: 'Vaše změny byly uloženy'
      });
    }
    
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Načítám...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          {/* Back button */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Zpět na dashboard
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">
            Nastavení profilu
          </h1>

          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  Osobní údaje
                </CardTitle>
                <CardDescription>
                  Upravte své osobní informace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Celé jméno</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.email}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isSaving ? 'Ukládám...' : 'Uložit změny'}
                </Button>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  Členství
                </CardTitle>
                <CardDescription>
                  Informace o vašem členství
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Aktuální plán</span>
                  <Badge className={membershipColors[profile.membership_type]}>
                    {profile.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                    {membershipLabels[profile.membership_type]}
                  </Badge>
                </div>
                
                {profile.membership_started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Začátek členství
                    </span>
                    <span>{formatDate(profile.membership_started_at)}</span>
                  </div>
                )}
                
                {profile.membership_expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Platnost do
                    </span>
                    <span>{formatDate(profile.membership_expires_at)}</span>
                  </div>
                )}

                {profile.membership_type === 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgradujte na placené členství a získejte přístup ke všem materiálům
                    </p>
                    <Link to="/resilient-hub">
                      <Button className="w-full bg-gold hover:bg-gold-dark text-white">
                        Upgradovat členství
                      </Button>
                    </Link>
                  </div>
                )}

                {profile.membership_type !== 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <Button variant="outline" className="w-full border-gold/30">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Spravovat platbu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
