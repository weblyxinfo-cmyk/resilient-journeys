import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  membership_type: 'free' | 'basic' | 'premium';
  membership_started_at: string | null;
  membership_expires_at: string | null;
  stripe_customer_id: string | null;
  purchased_hubs: string[] | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string, retries = 3): Promise<Profile | null> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      if (data) return data as Profile;

      // Profile may not exist yet (trigger hasn't fired), wait and retry
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return null;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let initialSessionHandled = false;
    let sessionProcessing = false;

    // Safety timeout — only fires if no session event was received at all
    const timeout = setTimeout(() => {
      if (isMounted && !sessionProcessing && loading) {
        console.warn('Auth: no session event received — proceeding without session');
        setLoading(false);
      }
    }, 5000);

    const handleSession = async (session: Session | null) => {
      if (!isMounted) return;
      sessionProcessing = true;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        try {
          // Fetch profile and admin role in parallel
          const [profileData, adminResult] = await Promise.all([
            fetchProfile(session.user.id),
            supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' }),
          ]);
          if (isMounted) {
            setProfile(profileData);
            if (adminResult.error) {
              console.error('Admin role check failed:', adminResult.error);
              setIsAdmin(false);
            } else {
              setIsAdmin(!!adminResult.data);
            }
          }
        } catch (err) {
          console.error('Auth session handling error:', err);
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }

      if (isMounted) setLoading(false);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        // Skip INITIAL_SESSION if getSession already handled it
        if (event === 'INITIAL_SESSION') {
          if (initialSessionHandled) return;
          initialSessionHandled = true;
        }

        await handleSession(session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;
        initialSessionHandled = true;
        await handleSession(session);
      })
      .catch((err) => {
        console.error('Auth getSession failed:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out API error:', error);
    }
    // Always clear local state, even if the API call fails
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAdmin,
      signUp,
      signIn,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
