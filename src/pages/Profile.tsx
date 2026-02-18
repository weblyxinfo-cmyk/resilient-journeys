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
import { ArrowLeft, Crown, User, Mail, Calendar, CreditCard, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const membershipLabels = {
  free: 'Free',
  basic: 'Basic',
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive'
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Saved',
        description: 'Your changes have been saved'
      });
    }
    
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsChangingPassword(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Loading profile...</div>
      </div>
    );
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
            Back to Dashboard
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-8">
            Profile Settings
          </h1>

          <div className="space-y-6">
            {/* Profile Info */}
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Edit your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
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
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gold" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  Membership
                </CardTitle>
                <CardDescription>
                  Information about your membership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Plan</span>
                  <Badge className={membershipColors[profile.membership_type]}>
                    {profile.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                    {membershipLabels[profile.membership_type]}
                  </Badge>
                </div>

                {profile.membership_started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Membership Start
                    </span>
                    <span>{formatDate(profile.membership_started_at)}</span>
                  </div>
                )}

                {profile.membership_expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Valid Until
                    </span>
                    <span>{formatDate(profile.membership_expires_at)}</span>
                  </div>
                )}

                {profile.membership_type === 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade to a paid membership and get access to all materials
                    </p>
                    <Button asChild className="w-full bg-gold hover:bg-gold-dark text-white">
                      <Link to="/resilient-hub">
                        Upgrade Membership
                      </Link>
                    </Button>
                  </div>
                )}

                {profile.membership_type !== 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <Button
                      variant="outline"
                      className="w-full border-gold/30"
                      onClick={() => {
                        window.location.href = 'mailto:contact@resilientmind.io?subject=Payment%20Management%20Request';
                      }}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Contact us to manage your payment details
                    </p>
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
