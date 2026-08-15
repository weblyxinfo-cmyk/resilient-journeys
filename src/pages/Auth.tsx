import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import { useCms } from '@/hooks/useCms';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthView = 'default' | 'forgotPassword' | 'resetSent' | 'resetPassword';

const Auth = () => {
  const navigate = useNavigate();
  const { t } = useCms();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [authView, setAuthView] = useState<AuthView>(() => {
    return searchParams.get('tab') === 'reset' ? 'resetPassword' : 'default';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');

  // Reset password form
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  useEffect(() => {
    if (user && !loading && authView !== 'resetPassword') {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo, authView]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: t('auth_toast_validation_error_title', 'Validation Error'),
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let message = t('auth_toast_login_error_generic', 'An error occurred during sign in');
      if (error.message.includes('Invalid login credentials')) {
        message = t('auth_toast_login_error_invalid_credentials', 'Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        message = t('auth_toast_login_error_email_unconfirmed', 'Please confirm your email address');
      }
      toast({
        title: t('auth_toast_login_error_title', 'Sign In Error'),
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth_toast_login_success_title', 'Welcome back!'),
        description: t('auth_toast_login_success_description', 'You have successfully signed in')
      });
      navigate(redirectTo);
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      nameSchema.parse(registerName);
      emailSchema.parse(registerEmail);
      passwordSchema.parse(registerPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: t('auth_toast_validation_error_title', 'Validation Error'),
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(registerEmail, registerPassword, registerName);

    if (error) {
      let message = t('auth_toast_register_error_generic', 'An error occurred during registration');
      if (error.message.includes('already registered')) {
        message = t('auth_toast_register_error_exists', 'This email is already registered');
      }
      toast({
        title: t('auth_toast_register_error_title', 'Registration Error'),
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth_toast_register_success_title', 'Account Created!'),
        description: t('auth_toast_register_success_description', 'Welcome to Resilient Mind')
      });
      navigate(redirectTo);
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(forgotEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: t('auth_toast_validation_error_title', 'Validation Error'),
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth?tab=reset`,
    });

    if (error) {
      toast({
        title: t('auth_toast_error_title', 'Error'),
        description: error.message || t('auth_toast_forgot_error_description', 'Failed to send reset email'),
        variant: 'destructive'
      });
    } else {
      setAuthView('resetSent');
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (resetPassword.length < 6) {
      toast({
        title: t('auth_toast_validation_error_title', 'Validation Error'),
        description: t('auth_toast_resetpw_min_length', 'Password must be at least 6 characters'),
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      toast({
        title: t('auth_toast_validation_error_title', 'Validation Error'),
        description: t('auth_toast_resetpw_mismatch', 'Passwords do not match'),
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: resetPassword });

    if (error) {
      toast({
        title: t('auth_toast_error_title', 'Error'),
        description: error.message || t('auth_toast_resetpw_error_description', 'Failed to reset password'),
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('auth_toast_resetpw_success_title', 'Password Updated'),
        description: t('auth_toast_resetpw_success_description', 'Your password has been reset successfully')
      });
      setAuthView('default');
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div id="cms-auth-loading" className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">{t('auth_loading_text', 'Loading...')}</div>
      </div>
    );
  }

  // Forgot password view
  if (authView === 'forgotPassword') {
    return (
      <div id="cms-auth-forgot_password" className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Reset Password | Resilient Mind" description="Reset your Resilient Mind account password." path="/auth" />
        <header className="p-6">
          <button onClick={() => setAuthView('default')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t('auth_back_to_signin', 'Back to sign in')}
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <Link to="/"><Logo className="h-16 w-auto" /></Link>
            </div>
            <Card className="border-gold/20 shadow-elegant">
              <form onSubmit={handleForgotPassword}>
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-gold/10 rounded-full">
                      <Mail className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                  <CardTitle className="font-serif text-2xl text-center">{t('auth_forgot_title', 'Forgot Password?')}</CardTitle>
                  <CardDescription className="text-center">
                    {t('auth_forgot_description', "Enter your email and we'll send you a link to reset your password.")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">{t('auth_email_label', 'Email')}</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder={t('auth_email_placeholder', 'you@example.com')}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isLoading}>
                    {isLoading ? t('auth_forgot_sending_label', 'Sending...') : t('auth_forgot_submit_button', 'Send Reset Link')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Reset sent confirmation view
  if (authView === 'resetSent') {
    return (
      <div id="cms-auth-reset_sent" className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Check Your Email | Resilient Mind" description="Password reset email sent." path="/auth" />
        <header className="p-6">
          <button onClick={() => setAuthView('default')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t('auth_back_to_signin', 'Back to sign in')}
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <Link to="/"><Logo className="h-16 w-auto" /></Link>
            </div>
            <Card className="border-gold/20 shadow-elegant">
              <CardHeader>
                <div className="flex justify-center mb-2">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="font-serif text-2xl text-center">{t('auth_resetsent_title', 'Check Your Email')}</CardTitle>
                <CardDescription className="text-center">
                  {t('auth_resetsent_description_before', "We've sent a password reset link to")} <strong>{forgotEmail}</strong>{t('auth_resetsent_description_after', '. Please check your inbox and click the link to set a new password.')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {t('auth_resetsent_hint_text', "Didn't receive the email? Check your spam folder or")}{' '}
                  <button onClick={() => setAuthView('forgotPassword')} className="text-gold hover:underline">
                    {t('auth_resetsent_retry_button', 'try again')}
                  </button>.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Reset password view (after clicking email link)
  if (authView === 'resetPassword') {
    return (
      <div id="cms-auth-reset_password" className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Set New Password | Resilient Mind" description="Set your new password." path="/auth" />
        <header className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t('auth_back_to_home', 'Back to home')}
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-8">
              <Link to="/"><Logo className="h-16 w-auto" /></Link>
            </div>
            <Card className="border-gold/20 shadow-elegant">
              <form onSubmit={handleResetPassword}>
                <CardHeader>
                  <div className="flex justify-center mb-2">
                    <div className="p-3 bg-gold/10 rounded-full">
                      <KeyRound className="h-6 w-6 text-gold" />
                    </div>
                  </div>
                  <CardTitle className="font-serif text-2xl text-center">{t('auth_resetpw_title', 'Set New Password')}</CardTitle>
                  <CardDescription className="text-center">
                    {t('auth_resetpw_description', 'Enter your new password below.')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">{t('auth_resetpw_new_label', 'New Password')}</Label>
                    <div className="relative">
                      <Input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('auth_password_placeholder', '••••••••')}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">{t('auth_min_chars_hint', 'Minimum 6 characters')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password">{t('auth_resetpw_confirm_label', 'Confirm Password')}</Label>
                    <Input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('auth_password_placeholder', '••••••••')}
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      required
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isLoading}>
                    {isLoading ? t('auth_resetpw_updating_label', 'Updating...') : t('auth_resetpw_submit_button', 'Update Password')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
      <SEO
        title="Sign In | Resilient Mind"
        description="Sign in or create an account to access your Resilient Mind membership, video lessons and resources."
        path="/auth"
      />
      {/* Header */}
      <header id="cms-auth-default_header" className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('auth_back_to_home', 'Back to home')}
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link to="/">
              <Logo className="h-16 w-auto" />
            </Link>
          </div>

          <Card className="border-gold/20 shadow-elegant">
            <Tabs defaultValue="login" className="w-full">
              <TabsList id="cms-auth-tabs" className="grid w-full grid-cols-2 bg-cream/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  {t('auth_tab_signin', 'Sign In')}
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  {t('auth_tab_signup', 'Sign Up')}
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent id="cms-auth-login" value="login">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">{t('auth_login_title', 'Welcome Back')}</CardTitle>
                    <CardDescription>
                      {t('auth_login_description', 'Sign in to your account to continue')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth_email_label', 'Email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth_email_placeholder', 'you@example.com')}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">{t('auth_login_password_label', 'Password')}</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth_password_placeholder', '••••••••')}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="border-gold/30 focus:border-gold pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgotPassword')}
                      className="text-sm text-gold hover:underline"
                    >
                      {t('auth_login_forgot_link', 'Forgot your password?')}
                    </button>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth_login_signing_in_label', 'Signing in...') : t('auth_login_submit_button', 'Sign In')}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent id="cms-auth-register" value="register">
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">{t('auth_register_title', 'Create Your Account')}</CardTitle>
                    <CardDescription>
                      {t('auth_register_description', 'Begin your journey to inner strength')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">{t('auth_register_name_label', 'Full Name')}</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder={t('auth_register_name_placeholder', 'Jane Doe')}
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t('auth_register_email_label', 'Email')}</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t('auth_email_placeholder', 'you@example.com')}
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">{t('auth_register_password_label', 'Password')}</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('auth_password_placeholder', '••••••••')}
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          className="border-gold/30 focus:border-gold pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('auth_min_chars_hint', 'Minimum 6 characters')}</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth_register_creating_label', 'Creating account...') : t('auth_register_submit_button', 'Sign Up')}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <p id="cms-auth-terms" className="text-center text-sm text-muted-foreground mt-6">
            {t('auth_terms_prefix', 'By registering, you agree to our')}{' '}
            <Link to="/terms" className="text-gold hover:underline">{t('auth_terms_link', 'Terms of Service')}</Link>
            {' '}{t('auth_terms_and', 'and')}{' '}
            <Link to="/privacy" className="text-gold hover:underline">{t('auth_privacy_link', 'Privacy Policy')}</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
