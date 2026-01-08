import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import Logo from '@/components/Logo';

const emailSchema = z.string().email('Zadejte platnou emailovou adresu');
const passwordSchema = z.string().min(6, 'Heslo musí mít alespoň 6 znaků');
const nameSchema = z.string().min(2, 'Jméno musí mít alespoň 2 znaky');

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: 'Chyba validace',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      let message = 'Nastala chyba při přihlášení';
      if (error.message.includes('Invalid login credentials')) {
        message = 'Nesprávný email nebo heslo';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Prosím potvrďte svůj email';
      }
      toast({
        title: 'Chyba přihlášení',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Vítejte zpět!',
        description: 'Úspěšně jste se přihlásili'
      });
      navigate('/dashboard');
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
          title: 'Chyba validace',
          description: err.errors[0].message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
    }

    const { error } = await signUp(registerEmail, registerPassword, registerName);
    
    if (error) {
      let message = 'Nastala chyba při registraci';
      if (error.message.includes('already registered')) {
        message = 'Tento email je již zaregistrován';
      }
      toast({
        title: 'Chyba registrace',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Účet vytvořen!',
        description: 'Vítejte v Resilient Mind'
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-gold">Načítám...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Zpět na hlavní stránku
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
                  Přihlášení
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  Registrace
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">Vítejte zpět</CardTitle>
                    <CardDescription>
                      Přihlaste se do svého účtu
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="vas@email.cz"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Heslo</Label>
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
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Přihlašuji...' : 'Přihlásit se'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">Vytvořte si účet</CardTitle>
                    <CardDescription>
                      Začněte svou cestu k vnitřní síle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Celé jméno</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Jana Nováková"
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
                        placeholder="vas@email.cz"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                        className="border-gold/30 focus:border-gold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Heslo</Label>
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
                      <p className="text-xs text-muted-foreground">Minimálně 6 znaků</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full bg-gold hover:bg-gold-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Vytvářím účet...' : 'Zaregistrovat se'}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Registrací souhlasíte s našimi{' '}
            <Link to="/terms" className="text-gold hover:underline">podmínkami použití</Link>
            {' '}a{' '}
            <Link to="/privacy" className="text-gold hover:underline">zásadami ochrany osobních údajů</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
