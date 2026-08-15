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
import { ArrowLeft, Crown, User, Mail, Calendar, CreditCard, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCms } from '@/hooks/useCms';

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useCms();
  const { user, profile, loading, refreshProfile } = useAuth();
  const { toast } = useToast();

  const membershipLabels = {
    free: t('profile_membership_tier_free', 'Free'),
    basic: t('profile_membership_tier_basic', 'Basic'),
    premium: t('profile_membership_tier_premium', 'Premium'),
  };

  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManagePayment = async () => {
    setIsOpeningPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: t('profile_toast_error_title', 'Error'), description: t('profile_toast_signin_again', 'Please sign in again'), variant: 'destructive' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ returnUrl: window.location.href }),
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Portal error:', err);
      toast({
        title: t('profile_toast_error_title', 'Error'),
        description: err instanceof Error ? err.message : t('profile_toast_portal_failed', 'Failed to open payment portal'),
        variant: 'destructive'
      });
    } finally {
      setIsOpeningPortal(false);
    }
  };

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
        title: t('profile_toast_error_title', 'Error'),
        description: t('profile_toast_save_failed', 'Failed to save changes'),
        variant: 'destructive'
      });
    } else {
      await refreshProfile();
      toast({
        title: t('profile_toast_saved_title', 'Saved'),
        description: t('profile_toast_saved_description', 'Your changes have been saved')
      });
    }
    
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      toast({
        title: t('profile_toast_error_title', 'Error'),
        description: t('profile_toast_password_min_length', 'New password must be at least 6 characters'),
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('profile_toast_error_title', 'Error'),
        description: t('profile_toast_password_mismatch', 'Passwords do not match'),
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
        title: t('profile_toast_error_title', 'Error'),
        description: error.message || t('profile_toast_password_change_failed', 'Failed to change password'),
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('profile_toast_password_changed_title', 'Password Changed'),
        description: t('profile_toast_password_changed_description', 'Your password has been updated successfully')
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsChangingPassword(false);
  };

  if (loading) {
    return (
      <div id="cms-profile-loading" className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">{t('profile_loading_text', 'Loading...')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div id="cms-profile-loading" className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">{t('profile_loading_profile_text', 'Loading profile...')}</div>
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
            {t('profile_back_link', 'Back to Dashboard')}
          </Link>

          <h1 id="cms-profile-header" className="font-serif text-3xl md:text-4xl text-foreground mb-8">
            {t('profile_page_title', 'Profile Settings')}
          </h1>

          <div className="space-y-6">
            {/* Profile Info */}
            <Card id="cms-profile-personal_info" className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  {t('profile_personal_info_title', 'Personal Information')}
                </CardTitle>
                <CardDescription>
                  {t('profile_personal_info_description', 'Edit your personal information')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('profile_fullname_label', 'Full Name')}</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile_email_label', 'Email')}</Label>
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
                  {isSaving ? t('profile_saving_label', 'Saving...') : t('profile_save_button', 'Save Changes')}
                </Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card id="cms-profile-change_password" className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gold" />
                  {t('profile_password_title', 'Change Password')}
                </CardTitle>
                <CardDescription>
                  {t('profile_password_description', 'Update your account password')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profile_new_password_label', 'New Password')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile_new_password_placeholder', 'Min. 6 characters')}
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profile_confirm_password_label', 'Confirm New Password')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('profile_confirm_password_placeholder', 'Repeat new password')}
                    className="border-gold/30 focus:border-gold"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || !newPassword || !confirmPassword}
                  className="bg-gold hover:bg-gold-dark text-white"
                >
                  {isChangingPassword ? t('profile_changing_password_label', 'Changing...') : t('profile_change_password_button', 'Change Password')}
                </Button>
              </CardContent>
            </Card>

            {/* Membership Info */}
            <Card id="cms-profile-membership" className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-gold" />
                  {t('profile_membership_title', 'Membership')}
                </CardTitle>
                <CardDescription>
                  {t('profile_membership_description', 'Information about your membership')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('profile_membership_current_plan_label', 'Current Plan')}</span>
                  <Badge className={membershipColors[profile.membership_type]}>
                    {profile.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                    {membershipLabels[profile.membership_type]}
                  </Badge>
                </div>

                {profile.membership_started_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('profile_membership_start_label', 'Membership Start')}
                    </span>
                    <span>{formatDate(profile.membership_started_at)}</span>
                  </div>
                )}

                {profile.membership_expires_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t('profile_membership_valid_until_label', 'Valid Until')}
                    </span>
                    <span>{formatDate(profile.membership_expires_at)}</span>
                  </div>
                )}

                {profile.membership_type === 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('profile_membership_upgrade_text', 'Upgrade to a paid membership and get access to all materials')}
                    </p>
                    <Button asChild className="w-full bg-gold hover:bg-gold-dark text-white">
                      <Link to="/resilient-hub">
                        {t('profile_membership_upgrade_button', 'Upgrade Membership')}
                      </Link>
                    </Button>
                  </div>
                )}

                {profile.membership_type !== 'free' && (
                  <div className="pt-4 border-t border-gold/10">
                    <Button
                      variant="outline"
                      className="w-full border-gold/30"
                      onClick={handleManagePayment}
                      disabled={isOpeningPortal}
                    >
                      {isOpeningPortal ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {isOpeningPortal ? t('profile_membership_opening_label', 'Opening...') : t('profile_membership_manage_payment_button', 'Manage Payment')}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {t('profile_membership_invoices_text', 'View invoices and payment history')}
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
