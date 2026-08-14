import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isPreviewFrame } from '@/lib/previewMode';

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
  months_unlocked: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  // Role/profile check for the current user is a separate async step from
  // session resolution — Admin.tsx must wait for it instead of treating
  // "not yet known" as "not admin".
  roleLoading: boolean;
  roleError: boolean;
  retryRoleCheck: () => void;
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
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);

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

  // Lives for the whole component lifetime (not just one effect run) so
  // retryRoleCheck() below can share it.
  const isMountedRef = useRef(true);

  // Fetches profile + admin role for a signed-in user. Always deferred with
  // setTimeout(0) so it never executes synchronously inside the
  // onAuthStateChange callback — supabase.from()/rpc() called directly from
  // that callback (in particular for INITIAL_SESSION) can deadlock on
  // GoTrue's internal session lock, which is what caused "Verifying
  // access..." to hang and then silently redirect away from /admin.
  const checkRoleAndProfile = (userId: string) => {
    setRoleLoading(true);
    setRoleError(false);

    setTimeout(async () => {
      if (!isMountedRef.current) return;
      try {
        const result = await Promise.race([
          Promise.all([
            fetchProfile(userId),
            supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
          ]),
          new Promise<'timeout'>(resolve => setTimeout(() => resolve('timeout'), 8000)),
        ]);

        if (!isMountedRef.current) return;

        if (result === 'timeout') {
          // A timeout means the role is still unknown, NOT that the user
          // isn't an admin — callers must show a retry option, not redirect.
          console.warn('Auth: profile/role fetch timed out');
          setRoleLoading(false);
          setRoleError(true);
          return;
        }

        const [profileData, adminResult] = result;
        setProfile(profileData);
        if (adminResult.error) {
          console.error('Admin role check failed:', adminResult.error);
          setRoleLoading(false);
          setRoleError(true);
        } else {
          setIsAdmin(!!adminResult.data);
          setRoleLoading(false);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error('Auth role/profile check error:', err);
        setRoleLoading(false);
        setRoleError(true);
      }
    }, 0);
  };

  const retryRoleCheck = () => {
    if (session?.user) {
      checkRoleAndProfile(session.user.id);
    }
  };

  useEffect(() => {
    if (isPreviewFrame()) {
      // CMS section previews load in same-origin iframes. Starting a full
      // auth flow per iframe fights over the GoTrue session lock and floods
      // the console with AbortErrors — so preview instances skip auth
      // entirely and report "signed out" immediately.
      setLoading(false);
      setRoleLoading(false);
      return;
    }

    isMountedRef.current = true;
    let receivedEvent = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMountedRef.current) return;
      receivedEvent = true;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'TOKEN_REFRESHED') {
        // Just a token refresh — keep existing profile/role state.
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        checkRoleAndProfile(newSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setRoleError(false);
        setRoleLoading(false);
      }

      setLoading(false);
    });

    // Defensive fallback only: onAuthStateChange is documented to always
    // fire once with INITIAL_SESSION right after subscribing. If that ever
    // doesn't happen, don't spin "Verifying access..." forever — surface it
    // as a retryable error instead of guessing at the role.
    const noEventTimeout = setTimeout(() => {
      if (isMountedRef.current && !receivedEvent) {
        console.warn('Auth: no session event received');
        setLoading(false);
        setRoleLoading(false);
        setRoleError(true);
      }
    }, 8000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(noEventTimeout);
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
    setRoleLoading(false);
    setRoleError(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      isAdmin,
      roleLoading,
      roleError,
      retryRoleCheck,
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
