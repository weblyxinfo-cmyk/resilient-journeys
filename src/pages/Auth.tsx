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

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthView = 'default' | 'forgotPassword' | 'resetSent' | 'resetPassword';

const Auth = () => {
  const navigate = useNavigate();
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
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      let message = 'An error occurred during sign in';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Please confirm your email address';
      }
      toast({
        title: 'Sign In Error',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in'
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
          title: 'Validation Error',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(registerEmail, registerPassword, registerName);

    if (error) {
      let message = 'An error occurred during registration';
      if (error.message.includes('already registered')) {
        message = 'This email is already registered';
      }
      toast({
        title: 'Registration Error',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Account Created!',
        description: 'Welcome to Resilient Mind'
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
          title: 'Validation Error',
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
        title: 'Error',
        description: error.message || 'Failed to send reset email',
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
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: resetPassword });

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Password Updated',
        description: 'Your password has been reset successfully'
      });
      setAuthView('default');
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Loading...</div>
      </div>
    );
  }

  // Forgot password view
  if (authView === 'forgotPassword') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Reset Password | Resilient Mind" description="Reset your Resilient Mind account password." path="/auth" />
        <header className="p-6">
          <button onClick={() => setAuthView('default')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
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
                  <CardTitle className="font-serif text-2xl text-center">Forgot Password?</CardTitle>
                  <CardDescription className="text-center">
                    Enter your email and we'll send you a link to reset your password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
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
      <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Check Your Email | Resilient Mind" description="Password reset email sent." path="/auth" />
        <header className="p-6">
          <button onClick={() => setAuthView('default')} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
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
                <CardTitle className="font-serif text-2xl text-center">Check Your Email</CardTitle>
                <CardDescription className="text-center">
                  We've sent a password reset link to <strong>{forgotEmail}</strong>. Please check your inbox and click the link to set a new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button onClick={() => setAuthView('forgotPassword')} className="text-gold hover:underline">
                    try again
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
      <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
        <SEO title="Set New Password | Resilient Mind" description="Set your new password." path="/auth" />
        <header className="p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to home
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
                  <CardTitle className="font-serif text-2xl text-center">Set New Password</CardTitle>
                  <CardDescription className="text-center">
                    Enter your new password below.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
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
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password">Confirm Password</Label>
                    <Input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      required
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-white" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
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
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
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
              <TabsList className="grid w-full grid-cols-2 bg-cream/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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
                      Forgot your password?
                    </button>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">Create Your Account</CardTitle>
                    <CardDescription>
                      Begin your journey to inner strength
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Jane Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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
                      <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
